import { series } from "@/data/series";
import SeriesDetailClient from "./client";

export function generateStaticParams() {
  return series.map((s) => ({ id: s.id }));
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SeriesDetailClient id={id} />;
}
