// All restaurant-related procedures live in this router.

import { restaurants } from "@pricy/db";

import { publicProcedure, router } from "../trpc";

export const restaurantsRouter = router({
  // restaurants.list — returns every restaurant in the database.
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(restaurants);
  }),
});
