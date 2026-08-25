// All restaurant-related procedures live in this router.

import { restaurants } from "@pricy/db";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, ilike, type SQL } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

// Filters accepted by restaurants.list. Every field is optional: an absent
// field means "don't constrain on this dimension". The whole object is also
// optional (see `.optional()` below) so `restaurants.list()` with no args
// still returns everything — keeping existing callers working.
const listInput = z
  .object({
    // Free-text search over the restaurant name (case-insensitive).
    q: z.string().trim().min(1).optional(),
    // Exact-match cuisine, e.g. "Thai". Populated from `cuisines` below.
    cuisine: z.string().trim().min(1).optional(),
    // price_range is a smallint 1–4 in the schema ($ … $$$$).
    priceRange: z.number().int().min(1).max(4).optional(),
  })
  .optional();

export const restaurantsRouter = router({
  // restaurants.list — returns restaurants, optionally narrowed by filters.
  //
  // Filtering happens HERE, in SQL, not in the client: we only ship the rows
  // that match. This scales as the table grows and keeps the DB the single
  // source of truth (hard-rule #1: query logic lives in packages/api).
  list: publicProcedure.input(listInput).query(async ({ ctx, input }) => {
    // Collect one SQL condition per active filter, then AND them together.
    // This is the idiomatic Drizzle way to compose *optional* WHERE clauses:
    // build an array, and only apply `.where()` if something's in it.
    const conditions: SQL[] = [];

    if (input?.q) {
      // ilike = case-insensitive LIKE. The `%…%` makes it a "contains" match.
      // NOTE: input.q is passed as a BOUND PARAMETER by Drizzle, not string-
      // concatenated into the SQL text — so this is not SQL-injectable.
      conditions.push(ilike(restaurants.name, `%${input.q}%`));
    }
    if (input?.cuisine) {
      conditions.push(eq(restaurants.cuisineType, input.cuisine));
    }
    if (input?.priceRange) {
      conditions.push(eq(restaurants.priceRange, input.priceRange));
    }

    return ctx.db
      .select()
      .from(restaurants)
      // and(...[]) would be undefined; `.where(undefined)` is a no-op that
      // returns all rows — exactly what we want when no filters are set.
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(restaurants.name));
  }),

  // restaurants.cuisines — the distinct set of cuisine types, sorted.
  // Feeds the cuisine dropdown so the UI never has to download every
  // restaurant just to discover which cuisines exist.
  cuisines: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .selectDistinct({ cuisine: restaurants.cuisineType })
      .from(restaurants)
      .orderBy(asc(restaurants.cuisineType));
    return rows.map((r) => r.cuisine);
  }),

  byId: publicProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.query.restaurants.findFirst({
        where: (fields, { eq }) => eq(fields.id, input.id),
        with: { menuItems: true },
      });
      if (!restaurant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Restaurant not found",
        });
      }

      return restaurant;
    }),
});
