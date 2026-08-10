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
} from "drizzle-orm/pg-core";
export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
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
