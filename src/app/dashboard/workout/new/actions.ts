"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { redirect } from "next/navigation";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  date: z.string().date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function createWorkoutAction(name: string, date: string, time: string) {
  const { name: validName, date: validDate, time: validTime } = createWorkoutSchema.parse({ name, date, time });
  await createWorkout(validName, new Date(`${validDate}T${validTime}:00`));
  redirect(`/dashboard?date=${validDate}`);
}
