# Data Mutations

## Rule: All Database Mutations via `/data` Helpers

Never write to the database directly from a Server Action or component. All mutation logic must go through helper functions in the `/data` directory, using **Drizzle ORM** exclusively. **Raw SQL is forbidden.**

```
src/
  data/
    workouts.ts     # e.g. createWorkout(), deleteWorkout()
    exercises.ts    # e.g. createExercise(), updateExercise()
    ...
```

```ts
// ✅ Correct — Drizzle ORM via a /data helper
// src/data/workouts.ts
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(name: string, date: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db.insert(workouts).values({ name, date, userId }).returning();
}

// ❌ Wrong — mutation inside a Server Action
await db.insert(workouts).values({ name, date, userId }); // inside actions.ts

// ❌ Wrong — raw SQL
await db.execute(sql`INSERT INTO workouts ...`);
```

## Rule: All Mutations via Server Actions in `actions.ts`

All data mutations must be triggered through Next.js Server Actions. Server Actions must live in a file named `actions.ts` colocated with the route or feature they belong to.

```
src/
  app/
    workouts/
      new/
        page.tsx
        actions.ts    # ✅ colocated Server Actions for this route
```

Server Actions must call `/data` helpers — they must not contain inline database logic.

```ts
// ✅ Correct
// src/app/workouts/new/actions.ts
"use server";

import { createWorkout } from "@/data/workouts";

export async function createWorkoutAction(name: string, date: string) {
  return createWorkout(name, date);
}

// ❌ Wrong — DB logic inside the action
"use server";
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkoutAction(name: string, date: string) {
  await db.insert(workouts).values({ name, date }); // forbidden
}
```

## Rule: Server Action Parameters Must Be Typed — No `FormData`

All Server Action parameters must use explicit TypeScript types. `FormData` is forbidden as a parameter type — parse form inputs before passing data to an action, or use typed plain objects.

```ts
// ✅ Correct — typed parameters
export async function createWorkoutAction(name: string, date: string) { ... }

export async function updateExerciseAction(params: { exerciseId: string; sets: number; reps: number }) { ... }

// ❌ Wrong — FormData parameter
export async function createWorkoutAction(formData: FormData) { ... }
```

## Rule: All Server Actions Must Validate Arguments with Zod

Every Server Action must validate its arguments using a [Zod](https://zod.dev) schema before doing anything else. Never trust input that arrives at a Server Action.

```ts
// ✅ Correct
// src/app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().date(),
});

export async function createWorkoutAction(name: string, date: string) {
  const { name: validName, date: validDate } = createWorkoutSchema.parse({ name, date });
  return createWorkout(validName, validDate);
}

// ❌ Wrong — no validation
export async function createWorkoutAction(name: string, date: string) {
  return createWorkout(name, date); // raw user input passed straight through
}
```

Use `schema.parse()` (throws on failure) or `schema.safeParse()` (returns a result object) depending on whether you want to throw or return a structured error to the caller.

## Rule: Users Can Only Mutate Their Own Data

Every `/data` mutation helper must fetch the authenticated user's ID from the session and scope all writes to that user. Never accept a `userId` from the caller.

```ts
// ✅ Correct — userId comes from the session
export async function deleteWorkout(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

// ❌ Wrong — userId from caller is untrusted
export async function deleteWorkout(workoutId: string, userId: string) { ... }
```

## Summary

| Concern | Rule |
|---|---|
| Where to write DB mutations | `/data` helpers — never inline in actions or components |
| How to write to the DB | Drizzle ORM only — no raw SQL |
| Where Server Actions live | Colocated `actions.ts` files |
| Server Action parameter types | Explicit TypeScript types — no `FormData` |
| Input validation | Zod schema validation on every Server Action, before any other logic |
| Data ownership | Every mutation helper scopes writes to the authenticated user's ID |
