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

describe("restaurants.list filters", () => {
  it("returns everything when called with no filters", async () => {
    const all = await caller.restaurants.list();
    expect(all.length).toBeGreaterThan(0);
  });

  it("returns everything when called with an empty filter object", async () => {
    const all = await caller.restaurants.list();
    const none = await caller.restaurants.list({});
    expect(none.length).toBe(all.length);
  });

  it("filters by exact cuisine", async () => {
    // Pick a cuisine that actually exists in the seed data.
    const all = await caller.restaurants.list();
    const cuisine = all[0].cuisineType;

    const filtered = await caller.restaurants.list({ cuisine });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((r) => r.cuisineType === cuisine)).toBe(true);
    // Never more results than the unfiltered set.
    expect(filtered.length).toBeLessThanOrEqual(all.length);
  });

  it("filters by price range", async () => {
    const all = await caller.restaurants.list();
    const withPrice = all.find((r) => r.priceRange != null);
    expect(withPrice).toBeDefined();
    const priceRange = withPrice!.priceRange!;

    const filtered = await caller.restaurants.list({ priceRange });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((r) => r.priceRange === priceRange)).toBe(true);
  });

  it("does a case-insensitive 'contains' match on name", async () => {
    const all = await caller.restaurants.list();
    // Take a substring from the middle of a real name, lower-cased, so we
    // prove both the 'contains' and the case-insensitivity behaviour.
    const name = all[0].name;
    const fragment = name.slice(1, Math.max(2, name.length - 1)).toLowerCase();

    const filtered = await caller.restaurants.list({ q: fragment });
    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.every((r) => r.name.toLowerCase().includes(fragment)),
    ).toBe(true);
  });

  it("combines filters with AND", async () => {
    const all = await caller.restaurants.list();
    const seed = all.find((r) => r.priceRange != null)!;

    const filtered = await caller.restaurants.list({
      cuisine: seed.cuisineType,
      priceRange: seed.priceRange!,
    });
    expect(
      filtered.every(
        (r) =>
          r.cuisineType === seed.cuisineType &&
          r.priceRange === seed.priceRange,
      ),
    ).toBe(true);
    // The restaurant we derived the filters from must be in the results.
    expect(filtered.some((r) => r.id === seed.id)).toBe(true);
  });

  it("rejects an out-of-range priceRange with BAD_REQUEST", async () => {
    await expect(
      caller.restaurants.list({ priceRange: 9 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("restaurants.cuisines", () => {
  it("returns a sorted, de-duplicated list of cuisines", async () => {
    const cuisines = await caller.restaurants.cuisines();
    expect(cuisines.length).toBeGreaterThan(0);
    expect(cuisines.every((c) => typeof c === "string")).toBe(true);

    // De-duplicated.
    expect(new Set(cuisines).size).toBe(cuisines.length);

    // Sorted ascending.
    const sorted = [...cuisines].sort((a, b) => a.localeCompare(b));
    expect(cuisines).toEqual(sorted);
  });
});
