"use client";

import { useParams } from "next/navigation";

import { RestaurantDetail } from "@/app/_components/restaurant-detail";
import { trpc } from "@/trpc/react";

export default function RestaurantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = trpc.restaurants.byId.useQuery({ id });

  if (isLoading) return <p className="p-12 text-muted">Loading…</p>;
  if (error) return <p className="p-12 text-red-600">Error: {error.message}</p>;
  if (!data) return null;

  return <RestaurantDetail restaurant={data} />;
}
