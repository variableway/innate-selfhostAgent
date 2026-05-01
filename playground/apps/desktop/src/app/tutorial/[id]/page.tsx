import TutorialDetailClient from "./client";
import { BUILTIN_SKILLS } from "@/lib/tutorial-scanner";

export function generateStaticParams() {
  return BUILTIN_SKILLS.map((skill) => ({ id: skill.slug }));
}

export default async function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TutorialDetailClient id={id} />;
}
