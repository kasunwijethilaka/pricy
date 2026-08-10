// Seeds the database with a set of real-world Sri Lankan restaurants
// (local cuisine, seafood, fine dining, and fast-food chains).
//
// Run with:  pnpm --filter @pricy/db db:seed
//
// `dotenv/config` must be imported FIRST so DATABASE_URL is loaded before
// ./client reads it. (ESM runs imported modules top-to-bottom.)
import "dotenv/config";

import { db, restaurants } from "./index";

// price_range: 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
const sriLankanRestaurants = [
  // — Local & fine dining —
  { name: "Ministry of Crab", cuisineType: "Seafood", address: "Old Dutch Hospital, Colombo 01", lat: 6.9344, lng: 79.8428, priceRange: 4 },
  { name: "Nihonbashi", cuisineType: "Japanese", address: "11 Galle Face Terrace, Colombo 03", lat: 6.918, lng: 79.848, priceRange: 4 },
  { name: "Kaema Sutra", cuisineType: "Sri Lankan", address: "Shangri-La, Colombo 02", lat: 6.926, lng: 79.846, priceRange: 4 },
  { name: "The Lagoon", cuisineType: "Seafood", address: "Cinnamon Grand, 77 Galle Rd, Colombo 03", lat: 6.917, lng: 79.848, priceRange: 4 },
  { name: "Upali's by Nawaloka", cuisineType: "Sri Lankan", address: "65 C.W.W. Kannangara Mw, Colombo 07", lat: 6.911, lng: 79.865, priceRange: 3 },
  { name: "Raja Bojun", cuisineType: "Sri Lankan", address: "Seylan Towers, Colombo 03", lat: 6.92, lng: 79.849, priceRange: 3 },
  { name: "Cricket Club Cafe", cuisineType: "International", address: "34 Queen's Rd, Colombo 03", lat: 6.906, lng: 79.858, priceRange: 3 },
  { name: "Chinese Dragon Cafe", cuisineType: "Chinese", address: "Nawala Rd, Nawala", lat: 6.879, lng: 79.889, priceRange: 2 },
  { name: "Green Cabin", cuisineType: "Sri Lankan", address: "453 Galle Rd, Colombo 03", lat: 6.898, lng: 79.854, priceRange: 2 },
  { name: "Lucky Fort Restaurant", cuisineType: "Sri Lankan", address: "Galle Fort, Galle", lat: 6.027, lng: 80.217, priceRange: 2 },
  { name: "The Empire Cafe", cuisineType: "Cafe", address: "Church St, Galle Fort, Galle", lat: 6.0264, lng: 80.2168, priceRange: 2 },
  { name: "Malayan Cafe", cuisineType: "South Indian", address: "36 Grand Bazaar St, Jaffna", lat: 9.6615, lng: 80.0255, priceRange: 1 },
  { name: "Pilawoos", cuisineType: "Sri Lankan", address: "417 Galle Rd, Colombo 03", lat: 6.901, lng: 79.853, priceRange: 1 },
  { name: "Perera & Sons", cuisineType: "Bakery", address: "Havelock Rd, Colombo 05", lat: 6.885, lng: 79.872, priceRange: 1 },

  // — Fast food —
  { name: "KFC Kollupitiya", cuisineType: "Fast Food", address: "141 Galle Rd, Colombo 03", lat: 6.908, lng: 79.852, priceRange: 2 },
  { name: "McDonald's Union Place", cuisineType: "Fast Food", address: "55 Union Place, Colombo 02", lat: 6.921, lng: 79.857, priceRange: 2 },
  { name: "Pizza Hut Dehiwala", cuisineType: "Fast Food", address: "Galle Rd, Dehiwala", lat: 6.856, lng: 79.865, priceRange: 2 },
  { name: "Burger King Crescat", cuisineType: "Fast Food", address: "Crescat Boulevard, Colombo 03", lat: 6.915, lng: 79.848, priceRange: 2 },
  { name: "Domino's Pizza Nugegoda", cuisineType: "Fast Food", address: "High Level Rd, Nugegoda", lat: 6.872, lng: 79.889, priceRange: 2 },
  { name: "Dinemore Kandy", cuisineType: "Fast Food", address: "Peradeniya Rd, Kandy", lat: 7.29, lng: 80.63, priceRange: 1 },
];

async function main() {
  // Start clean so this script is safe to re-run.
  await db.delete(restaurants);

  // Insert all rows in one statement. We never pass id/createdAt — the
  // database generates those.
  const inserted = await db
    .insert(restaurants)
    .values(sriLankanRestaurants)
    .returning();

  console.log(`Inserted ${inserted.length} restaurants.\n`);

  // Read back a quick breakdown by cuisine so we can eyeball the mix.
  const all = await db.select().from(restaurants);
  const byCuisine = new Map<string, number>();
  for (const r of all) {
    byCuisine.set(r.cuisineType, (byCuisine.get(r.cuisineType) ?? 0) + 1);
  }

  console.log(`Total in DB: ${all.length}`);
  console.log("By cuisine:");
  for (const [cuisine, count] of [...byCuisine].sort()) {
    console.log(`  ${cuisine.padEnd(14)} ${count}`);
  }

  // The postgres-js connection stays open, so exit explicitly.
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
