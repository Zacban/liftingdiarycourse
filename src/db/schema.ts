import {
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const exercisesTable = pgTable('exercises', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const workoutsTable = pgTable('workouts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  startedAt: timestamp().notNull(),
  completedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const workoutExercisesTable = pgTable('workout_exercises', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer()
    .notNull()
    .references(() => workoutsTable.id, { onDelete: 'cascade' }),
  exerciseId: integer()
    .notNull()
    .references(() => exercisesTable.id, { onDelete: 'cascade' }),
  order: integer().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const setsTable = pgTable('sets', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer()
    .notNull()
    .references(() => workoutExercisesTable.id, { onDelete: 'cascade' }),
  setNumber: integer().notNull(),
  reps: integer().notNull(),
  weightKg: numeric({ precision: 6, scale: 2 }),
});
