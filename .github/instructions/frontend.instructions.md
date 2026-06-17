# Frontend Instructions
applyTo: "**/*.{tsx,ts,jsx,js,css}"

---

# Stack

- Next.js App Router (latest)
- TypeScript strict mode — no `any`, no `@ts-ignore` without comment
- Tailwind CSS — no inline styles, no arbitrary values unless necessary
- shadcn/ui — always check before building custom UI

---

# Component Rules

## Structure

```
components/
  ui/          # shadcn primitives only
  common/      # shared across features
  sections/    # page-level sections
  layouts/     # layout wrappers
```

## File naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `use-kebab-case.ts`
- Types: `types.ts` per feature folder

## Component anatomy

```tsx
// 1. Imports (external → internal → types)
// 2. Types/interfaces
// 3. Constants (outside component)
// 4. Component function
// 5. Subcomponents (if colocated)
// 6. Export
```

---

# Server vs Client Components

Default to **Server Components**.

Use `"use client"` only when you need:

- `useState`, `useEffect`, `useReducer`
- Browser APIs (`window`, `document`)
- Event listeners
- Third-party client-only libraries

Push `"use client"` as deep in the tree as possible.

---

# TypeScript

```ts
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

// Bad
type ButtonProps = {
  variant: string
  size: any
  children: any
}
```

- Use `interface` for component props
- Use `type` for unions, intersections, mapped types
- Export types from `types.ts`, not inline in components
- Never use `React.FC` — define props inline or via interface

---

# Tailwind

- Use design tokens defined in `tailwind.config.ts`
- Never hardcode color hex values in classes
- Avoid `!important` overrides
- Responsive prefix order: base → `sm:` → `md:` → `lg:` → `xl:`
- Use `cn()` (from `lib/utils`) for conditional class merging

```tsx
// Good
<div className={cn("flex items-center gap-4", isActive && "bg-primary/10")}>

// Bad
<div style={{ display: 'flex', gap: '1rem' }}>
```

---

# Data Fetching

- Fetch in Server Components by default
- Use `React.cache()` for shared data across the render tree
- Use `loading.tsx` and `error.tsx` at route level
- Use `Suspense` boundaries around async components
- Never fetch in `useEffect` for initial data — use Server Components or loaders

---

# Forms

- Use `react-hook-form` + `zod` for all forms
- Define schema in a separate `schema.ts` file
- Use `shadcn/ui` Form components
- Always handle: loading, success, error states
- Server Actions preferred over API routes for mutations

---

# Imports

```ts
// Order:
// 1. React/Next
// 2. External libraries
// 3. Internal — components
// 4. Internal — utils/hooks/types
// 5. Styles (if any)

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PageProps } from './types'
```

---

# Performance Checklist

Before shipping any component:

- [ ] No unnecessary re-renders
- [ ] Images use `next/image` with correct `sizes`
- [ ] Fonts loaded via `next/font`
- [ ] Heavy libraries dynamically imported
- [ ] No layout shift (CLS)
- [ ] Suspense boundaries in place
