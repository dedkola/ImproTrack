import { HabitDetail } from "@/components/habit-detail";

export default async function HabitDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <HabitDetail slug={slug} />;
}
