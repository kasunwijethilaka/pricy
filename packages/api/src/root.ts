// The single top-level router. Every feature router (restaurants, and later
// menuItems, favorites, submissions...) is combined here into the one
// `appRouter` that the whole app talks to.

import { restaurantsRouter } from "./routers/restaurants";
import { router } from "./trpc";

export const appRouter = router({
  restaurants: restaurantsRouter,
  // menuItems: menuItemsRouter,   ← future routers plug in here as namespaces
  // favorites: favoritesRouter,
});

// The TYPE of the entire API. The apps import ONLY this type to get full
// end-to-end type-safety on every call — no server code ever ships to the
// browser, just the shape.
export type AppRouter = typeof appRouter;
