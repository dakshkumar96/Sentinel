"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PlacementGrid } from "@/components/dashboard/PlacementGrid";

export default function PlacementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Live monitoring"
        title="Placements"
        subtitle="Every AI-channel placement across your book — spend, velocity, and health in real time."
      />
      <PlacementGrid />
    </>
  );
}
