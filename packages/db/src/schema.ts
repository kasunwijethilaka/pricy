// Drizzle schema — all Pricy database tables are defined here.
//
// Only tRPC procedures (packages/api) read from this package; client-facing
// components never import it. Every column defined here becomes type-safe in
// your queries.
import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  smallint,
  timestamp,
  integer,
  primaryKey,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "owner", "admin"]);

export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => users.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  cuisineType: text("cuisine_type").notNull(),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  priceRange: smallint("price_range"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("LKR"),

  description: text("description"),
  imageUrl: text("image_url"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  price: integer("price").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  role: userRole("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.restaurantId] })],
);

export const menuSubmissions = pgTable("menu_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id, {
    onDelete: "cascade",
  }),
  status: submissionStatus("status").notNull().default("pending"),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
