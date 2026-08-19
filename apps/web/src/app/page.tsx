"use client";

import { trpc } from "@/trpc/react";
import { RestaurantGrid } from "./_components/restaurant-grid";

export default function AppHomePage() {
  const { data, isLoading, error } = trpc.restaurants.list.useQuery();

  if (isLoading) return <p className="p-12 text-muted">Loading…</p>;
  if (error) return <p className="p-12 text-red-600">Error: {error.message}</p>;

  return <RestaurantGrid restaurants={data ?? []} />;
}
