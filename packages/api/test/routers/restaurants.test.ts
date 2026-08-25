// Integration tests for the restaurants router.
//
// These call procedures through a SERVER-SIDE CALLER (no HTTP, no React) against
// the real local Postgres — so they verify the actual Drizzle query, the nested
// `menuItems` relation, and the error handling end to end.
//
// Tests live in this top-level test/ tree, mirroring src/ — hence the ../../src
// import paths.

import { beforeAll, describe, expect, it } from "vitest";

import { appRouter } from "../../src/root";
import { createCallerFactory, createContext } from "../../src/trpc";

// createCallerFactory(appRouter) turns the router into a factory; calling it
// with a ctx gives us `caller`, where every procedure is a plain async fn:
//   caller.restaurants.byId({ id })  ← runs the real resolver.
// We pass a REAL ctx (createContext carries the db connection).
const caller = createCallerFactory(appRouter)(createContext());

describe("restaurants.byId", () => {
  // A restaurant we KNOW has menu items — found dynamically so we don't
  // hardcode a brittle seed uuid.
  let withMenuId: string;

  beforeAll(async () => {
    const all = await caller.restaurants.list();
    // Sanity: the DB is seeded. If this fails: pnpm --filter @pricy/db db:seed
    expect(all.length).toBeGreaterThan(0);

    for (const r of all) {
      const full = await caller.restaurants.byId({ id: r.id });
      if (full.menuItems.length > 0) {
        withMenuId = r.id;
        break;
      }
    }
    expect(withMenuId).toBeDefined();
  });

  it("returns the restaurant with its menu items nested", async () => {
    const restaurant = await caller.restaurants.byId({ id: withMenuId });

    expect(restaurant.id).toBe(withMenuId);
    expect(restaurant.menuItems.length).toBeGreaterThan(0);
    expect(restaurant.menuItems[0]).toMatchObject({
      name: expect.any(String),
      price: expect.any(Number),
      currency: expect.any(String),
    });
  });

  it("throws NOT_FOUND for a valid uuid that doesn't exist", async () => {
    await expect(
      caller.restaurants.byId({ id: "00000000-0000-4000-8000-000000000000" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects a malformed (non-uuid) id with BAD_REQUEST", async () => {
    await expect(
      caller.restaurants.byId({ id: "banana" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
