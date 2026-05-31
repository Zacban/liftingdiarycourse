# Data Fetching

## Rule: Server Components Only

All data fetching in this app **must** be done via React Server Components.

- **DO NOT** fetch data in Client Components (`"use client"`)
- **DO NOT** fetch data in Route Handlers (`src/app/api/`)
- **DO** fetch data directly in Server Components by calling helper functions from `/data`

This is a hard rule. If a component needs data, it must be a Server Component (or receive the data as props from a Server Component parent).

## Rule: All Database Queries via `/data` Helpers

Never query the database directly from a component or page. All database access must go through helper functions located in the `/data` directory.

```
src/
  data/
    workouts.ts     # e.g. getWorkoutsForUser(), getWorkoutById()
    exercises.ts    # e.g. getExercisesForUser()
    ...
```

These helpers must use **Drizzle ORM** exclusively. **Raw SQL is forbidden.**

```ts
// ✅ Correct — Drizzle ORM via a /data helper
// src/data/workouts.ts
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// ❌ Wrong — raw SQL
const result = await db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);

// ❌ Wrong — querying from a component
const data = await db.select().from(workouts); // inside a page/component
```

## Rule: Users Can Only Access Their Own Data

Every `/data` helper that returns user-specific data **must** scope the query to the authenticated user's ID. A logged-in user must never be able to read or modify another user's records.

**Always:**
1. Fetch the current user's ID from the auth session **inside the helper** — never accept a `userId` parameter from the caller.
2. Filter every query with a `WHERE userId = currentUserId` clause.
3. Never trust a userId coming from URL params, search params, or request bodies.

```ts
// ✅ Correct — userId is fetched from the session inside the helper
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

// ❌ Wrong — userId comes from the caller and cannot be trusted
export async function getWorkoutsForUser(userId: string) { ... }
```

If a query returns a single record (e.g. `getWorkoutById`), still fetch the `userId` from the session and include it in the query so a user cannot access another user's record by guessing an ID:

```ts
// ✅ Correct
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .then((rows) => rows[0] ?? null);
}
```

## Summary

| Concern | Rule |
|---|---|
| Where to fetch data | Server Components only |
| How to query the DB | Drizzle ORM via `/data` helpers — no raw SQL |
| Data access scope | Every query must be filtered to the authenticated user |
| Route Handlers for data | Forbidden |
| Client Component fetching | Forbidden |
