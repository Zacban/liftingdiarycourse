# Auth Coding Standards

## Authentication Provider

**This app uses Clerk for all authentication.**

Do not implement custom authentication logic, JWT handling, session management, or any other auth mechanism. All auth must go through Clerk.

## Setup

Clerk is configured via environment variables. The following must be present in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

## Protecting Routes

Use Clerk's middleware to protect routes. The middleware file lives at `src/middleware.ts`:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

## Accessing the Current User

### In Server Components

```ts
import { auth, currentUser } from "@clerk/nextjs/server";

// Get the user ID only (lightweight)
const { userId } = await auth();

// Get the full user object
const user = await currentUser();
```

### In Client Components

```ts
"use client";
import { useUser, useAuth } from "@clerk/nextjs";

const { user } = useUser();
const { userId, isSignedIn } = useAuth();
```

## UI Components

Use Clerk's pre-built components for sign-in, sign-up, and user profile flows. Do not build custom auth forms.

```tsx
import { SignIn, SignUp, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

// Show/hide content based on auth state
<SignedIn>
  <UserButton />
</SignedIn>
<SignedOut>
  <SignIn />
</SignedOut>
```

## API Routes

Protect API routes by calling `auth()` and checking for a `userId`:

```ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...
}
```

## Rules

- Never store passwords or secrets in the database — Clerk owns identity.
- Never roll custom session tokens or cookies.
- Always check `userId` before performing any user-scoped database operation.
- Use `userId` (the Clerk user ID string) as the foreign key when linking database records to a user.
