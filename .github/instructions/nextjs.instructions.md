# Next.js Instructions
applyTo: "**/*.{tsx,ts}"

---

# Version Reference

Before writing any Next.js code, read the relevant guide in:

```
node_modules/next/dist/docs/
```

This project may use APIs that differ from public training data. Heed deprecation notices.

---

# App Router — Non-Negotiable Rules

- All routes use App Router (`src/app/`)
- No Pages Router files
- No `getServerSideProps`, no `getStaticProps`
- No `next/router` — use `next/navigation`

---

# File Conventions

```
src/app/
  layout.tsx          # Root layout — fonts, providers, metadata defaults
  page.tsx            # Route entry points
  loading.tsx         # Suspense fallback UI
  error.tsx           # Error boundary UI
  not-found.tsx       # 404 handler
  global-error.tsx    # Root error boundary

src/components/       # Shared components
src/lib/              # Utilities, clients, helpers
src/hooks/            # Custom React hooks
src/types/            # Global TypeScript types
src/actions/          # Server Actions
src/config/           # App-wide constants and config
```

---

# Routing

```tsx
// Dynamic segments
app/blog/[slug]/page.tsx

// Catch-all
app/docs/[...slug]/page.tsx

// Optional catch-all
app/[[...slug]]/page.tsx

// Route groups (no URL impact)
app/(marketing)/page.tsx
app/(app)/dashboard/page.tsx

// Parallel routes
app/@modal/page.tsx

// Intercepting routes
app/feed/(..)photos/[id]/page.tsx
```

Use route groups to separate marketing, app, and auth layouts.

---

# Metadata

Always define metadata per route:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | SynTek Solutions',
  description: 'Concise, benefit-driven description under 160 characters.',
  openGraph: {
    title: 'Page Title | SynTek Solutions',
    description: '...',
    images: ['/og/page-name.png'],
  },
}
```

Dynamic metadata:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchData(params.slug)
  return {
    title: `${data.title} | SynTek Solutions`,
  }
}
```

Never leave a page without metadata.

---

# Server Actions

Preferred over API routes for mutations.

```tsx
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  email: z.string().email(),
})

export async function submitForm(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: 'Invalid input' }
  }
  // ... mutation
  revalidatePath('/')
  return { success: true }
}
```

Rules:

- Always validate input with `zod`
- Always return typed result `{ success } | { error }`
- Call `revalidatePath` or `revalidateTag` after mutations
- Never trust client input

---

# Data Fetching

```tsx
// Server Component — preferred
async function Page() {
  const data = await fetchData() // no useEffect, no useState
  return <Component data={data} />
}

// Cached fetch
const data = await fetch('...', {
  next: { revalidate: 3600 } // ISR
})

// No cache (always fresh)
const data = await fetch('...', {
  cache: 'no-store'
})

// Shared across render tree
const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})
```

---

# Image Optimization

```tsx
import Image from 'next/image'

// Fixed size
<Image src="/hero.jpg" alt="Hero" width={1200} height={630} priority />

// Fill container
<div className="relative h-64 w-full">
  <Image src="/bg.jpg" alt="Background" fill className="object-cover" />
</div>

// Responsive
<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

# Fonts

```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
```

Never load fonts via `<link>` tags or CDN. Always use `next/font`.

---

# Environment Variables

```ts
// Public (client-accessible)
NEXT_PUBLIC_APP_URL=

// Server-only (never exposed to client)
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Access server-only variables:

```ts
// src/lib/env.ts — validate at startup
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

---

# Middleware

Use for:

- Auth protection
- Redirects
- Locale detection
- A/B testing headers

Keep middleware fast — no database calls, no heavy computation.

```ts
// middleware.ts (root level)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ...
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

# Error Handling

```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

Always handle errors at the route segment level. Never let unhandled errors surface to users as raw stack traces.
