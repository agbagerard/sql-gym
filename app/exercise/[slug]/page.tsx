import { notFound } from "next/navigation";
import ExerciseClient from "@/components/ExerciseClient";
import { EXERCISES, getExercise } from "@/data/exercises";

export const dynamicParams = false;

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: e.slug }));
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exercise = getExercise(slug);
  if (!exercise) notFound();
  return <ExerciseClient exercise={exercise} />;
}
