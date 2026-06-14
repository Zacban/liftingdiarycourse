import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workoutsTable, workoutExercisesTable, exercisesTable, setsTable } from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";

export async function createWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db.insert(workoutsTable).values({ name, startedAt, userId }).returning();
}

type WorkoutSet = {
  id: number;
  setNumber: number;
  reps: number;
  weightKg: string | null;
};

type WorkoutExercise = {
  id: number;
  name: string;
  order: number;
  sets: WorkoutSet[];
};

export type WorkoutWithExercises = {
  id: number;
  name: string;
  startedAt: Date;
  exercises: WorkoutExercise[];
};

export async function getWorkoutsForDate(date: Date): Promise<WorkoutWithExercises[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workoutsTable.id,
      workoutName: workoutsTable.name,
      workoutStartedAt: workoutsTable.startedAt,
      workoutExerciseId: workoutExercisesTable.id,
      exerciseName: exercisesTable.name,
      exerciseOrder: workoutExercisesTable.order,
      setId: setsTable.id,
      setNumber: setsTable.setNumber,
      reps: setsTable.reps,
      weightKg: setsTable.weightKg,
    })
    .from(workoutsTable)
    .leftJoin(workoutExercisesTable, eq(workoutExercisesTable.workoutId, workoutsTable.id))
    .leftJoin(exercisesTable, eq(exercisesTable.id, workoutExercisesTable.exerciseId))
    .leftJoin(setsTable, eq(setsTable.workoutExerciseId, workoutExercisesTable.id))
    .where(
      and(
        eq(workoutsTable.userId, userId),
        gte(workoutsTable.startedAt, startOfDay),
        lt(workoutsTable.startedAt, endOfDay),
      )
    )
    .orderBy(workoutsTable.id, workoutExercisesTable.order, setsTable.setNumber);

  const workoutMap = new Map<number, WorkoutWithExercises>();
  const exerciseMap = new Map<number, WorkoutExercise>();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, { id: row.workoutId, name: row.workoutName, startedAt: row.workoutStartedAt, exercises: [] });
    }

    if (row.workoutExerciseId == null || row.exerciseName == null) continue;

    if (!exerciseMap.has(row.workoutExerciseId)) {
      const exercise: WorkoutExercise = {
        id: row.workoutExerciseId,
        name: row.exerciseName,
        order: row.exerciseOrder!,
        sets: [],
      };
      exerciseMap.set(row.workoutExerciseId, exercise);
      workoutMap.get(row.workoutId)!.exercises.push(exercise);
    }

    if (row.setId == null || row.setNumber == null || row.reps == null) continue;

    exerciseMap.get(row.workoutExerciseId)!.sets.push({
      id: row.setId,
      setNumber: row.setNumber,
      reps: row.reps,
      weightKg: row.weightKg,
    });
  }

  return Array.from(workoutMap.values());
}
