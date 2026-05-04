import TutorialDetailClient from "./client";
import { getBuiltinSkillsSync } from "@/lib/tutorial-scanner";

export function generateStaticParams() {
  return getBuiltinSkillsSync().map((skill) => ({ id: skill.slug }));
}

export default async function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TutorialDetailClient id={id} />;
}
