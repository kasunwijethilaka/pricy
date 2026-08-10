// Seeds the database with real-world Sri Lankan restaurants and a
// cuisine-appropriate menu for each one.
//
// Run with:  pnpm --filter @pricy/db db:seed
//
// `dotenv/config` must be imported FIRST so DATABASE_URL is loaded before
// ./client reads it. (ESM runs imported modules top-to-bottom.)
import "dotenv/config";

import { db, restaurants, menuItems } from "./index";

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

// Menu items per cuisine. `price` is a whole number of Sri Lankan rupees (LKR
// has no practical sub-unit). It's still an integer, so no float rounding bugs.
type MenuItem = { name: string; price: number; description?: string };
const menuByCuisine: Record<string, MenuItem[]> = {
  "Sri Lankan": [
    { name: "Chicken Kottu", price: 950, description: "Chopped godhamba roti stir-fried with chicken and vegetables" },
    { name: "Rice & Curry (Chicken)", price: 750 },
    { name: "Fish Ambul Thiyal", price: 1100, description: "Sour fish curry with goraka" },
    { name: "String Hoppers with Dhal", price: 400 },
    { name: "Watalappan", price: 450, description: "Jaggery and coconut custard" },
  ],
  Seafood: [
    { name: "Garlic Butter Crab", price: 6500 },
    { name: "Grilled Tiger Prawns", price: 3200 },
    { name: "Cuttlefish Curry", price: 1800 },
    { name: "Seafood Fried Rice", price: 1400 },
  ],
  Japanese: [
    { name: "Salmon Sushi (6 pcs)", price: 2200 },
    { name: "Chicken Ramen", price: 1900 },
    { name: "Tempura Platter", price: 2400 },
    { name: "Miso Soup", price: 600 },
  ],
  Chinese: [
    { name: "Chicken Fried Rice", price: 850 },
    { name: "Devilled Chicken", price: 1100 },
    { name: "Hot Butter Cuttlefish", price: 1500 },
    { name: "Chop Suey", price: 1200 },
  ],
  International: [
    { name: "Beef Burger", price: 1600 },
    { name: "Caesar Salad", price: 1200 },
    { name: "Grilled Chicken Steak", price: 1800 },
    { name: "New York Cheesecake", price: 900 },
  ],
  Cafe: [
    { name: "Cappuccino", price: 550 },
    { name: "Club Sandwich", price: 950 },
    { name: "Chocolate Brownie", price: 650 },
    { name: "Iced Coffee", price: 600 },
  ],
  "South Indian": [
    { name: "Masala Dosa", price: 450 },
    { name: "Idli (4 pcs)", price: 350 },
    { name: "Medu Vada", price: 250 },
    { name: "Filter Coffee", price: 250 },
  ],
  Bakery: [
    { name: "Fish Bun", price: 120 },
    { name: "Chicken Roll", price: 150 },
    { name: "Egg Hopper", price: 100 },
    { name: "Vegetable Patty", price: 130 },
  ],
  "Fast Food": [
    { name: "Fried Chicken (3 pcs)", price: 1200 },
    { name: "Cheeseburger", price: 850 },
    { name: "French Fries (Large)", price: 450 },
    { name: "Chicken Pizza (Regular)", price: 1800 },
    { name: "Soft Drink", price: 350 },
  ],
};

async function main() {
  // Delete children first (menu_items → restaurants FK), then parents. The
  // cascade would handle it, but being explicit is clearer.
  await db.delete(menuItems);
  await db.delete(restaurants);

  // Insert restaurants and get back their DB-generated ids.
  const insertedRestaurants = await db
    .insert(restaurants)
    .values(sriLankanRestaurants)
    .returning();

  // For each restaurant, build its menu rows referencing that restaurant's id.
  const menuRows = insertedRestaurants.flatMap((r) => {
    const items = menuByCuisine[r.cuisineType] ?? [];
    return items.map((item) => ({
      restaurantId: r.id,
      name: item.name,
      price: item.price, // whole rupees (LKR)
      description: item.description ?? null,
      // currency defaults to "LKR"
    }));
  });

  const insertedMenu =
    menuRows.length > 0
      ? await db.insert(menuItems).values(menuRows).returning()
      : [];

  console.log(
    `Inserted ${insertedRestaurants.length} restaurants and ${insertedMenu.length} menu items.\n`,
  );

  // Show one restaurant's menu as a sanity check, formatting cents → rupees.
  const sample = insertedRestaurants[0];
  if (sample) {
    const items = insertedMenu.filter((m) => m.restaurantId === sample.id);
    console.log(`Sample — ${sample.name} (${items.length} items):`);
    for (const it of items) {
      console.log(`  • ${it.name.padEnd(26)} ${it.currency} ${it.price}`);
    }
  }

  // The postgres-js connection stays open, so exit explicitly.
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
