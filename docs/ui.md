# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used in this project.**

Do not create custom UI components. Every UI element — buttons, inputs, dialogs, cards, tables, badges, dropdowns, etc. — must come from the shadcn/ui component library. If a component does not exist in shadcn/ui, install it via the CLI:

```bash
npx shadcn@latest add <component-name>
```

All installed components live in `src/components/ui/` and must not be modified except where shadcn/ui explicitly supports customisation through variants or class overrides via `cn()`.

## Date Formatting

Use `date-fns` for all date formatting. Do not use `new Date().toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting method.

### Required Format

Dates must be displayed with an ordinal day suffix, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

```ts
import { format } from "date-fns";

function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}
```

Place this utility in `src/lib/date.ts` and import it wherever dates are displayed.
