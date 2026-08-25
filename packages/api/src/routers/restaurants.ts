// All restaurant-related procedures live in this router.

import { restaurants } from "@pricy/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const restaurantsRouter = router({
  // restaurants.list — returns every restaurant in the database.
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(restaurants);
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
