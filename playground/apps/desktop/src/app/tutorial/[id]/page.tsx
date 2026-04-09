import { tutorials } from "@/data/tutorials";
import TutorialDetailClient from "./client";

export function generateStaticParams() {
  return tutorials.map((t) => ({ id: t.id }));
}

export default async function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TutorialDetailClient id={id} />;
}
