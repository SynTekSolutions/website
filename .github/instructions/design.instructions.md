# Design Instructions
applyTo: "**/*.{tsx,css}"

---

# Design System

All design decisions must be backed by the token system in `tailwind.config.ts`.

Never introduce one-off values without adding them to the config first.

---

# Typography Scale

```
Display:   text-5xl / text-6xl / text-7xl — hero headlines only
H1:        text-4xl — one per page
H2:        text-3xl — section headers
H3:        text-xl  — card titles, subsections
Body:      text-base (16px)
Small:     text-sm  — captions, metadata
Micro:     text-xs  — labels, badges
```

Rules:

- Display text: always `font-semibold` or `font-bold`, tight tracking (`tracking-tight`)
- Body text: `font-normal`, comfortable line height (`leading-relaxed`)
- Never use more than 3 font weights in a single view
- Line length: max `65ch` for reading content

---

# Spacing System

Follow the 4px grid.

```
gap-1  = 4px
gap-2  = 8px
gap-3  = 12px
gap-4  = 16px
gap-6  = 24px
gap-8  = 32px
gap-12 = 48px
gap-16 = 64px
gap-24 = 96px
```

Section padding: `py-24` desktop, `py-16` mobile.

Container: max-w-7xl, centered, horizontal padding `px-6` → `lg:px-8`.

---

# Color System

## Dark mode first

Design dark mode first, then light mode.

## Palette roles

```
Background:    bg-background
Surface:       bg-card / bg-muted
Border:        border-border
Primary:       text-foreground / bg-primary
Secondary:     text-muted-foreground
Accent:        reserved for CTAs and highlights
Destructive:   errors only
```

## Contrast requirements

- Body text on background: minimum 7:1 (WCAG AAA)
- UI components, large text: minimum 4.5:1 (WCAG AA)
- Use a contrast checker before shipping any new color combination

---

# Component States

Every interactive element must have all states designed:

| State    | Implementation                            |
|----------|-------------------------------------------|
| Default  | Base design                               |
| Hover    | Subtle bg shift or underline              |
| Focus    | Visible ring — `ring-2 ring-ring`         |
| Active   | Slight scale or opacity reduction         |
| Disabled | Reduced opacity, `cursor-not-allowed`     |
| Loading  | Spinner or skeleton, not empty            |
| Error    | Red border + error message below          |
| Success  | Confirmation feedback, auto-dismiss       |

Never leave a state undesigned.

---

# Glassmorphism

When to use:

- Floating navbars
- Modal/dialog overlays
- Command palettes
- Notification toasts
- Floating action panels

Implementation:

```tsx
<div className="bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl">
```

Do not apply to:

- Inline content blocks
- Data tables
- Form fields
- Full-page sections

---

# Motion

## Timing

```
instant:   0ms     — no animation needed
fast:      100ms   — micro-interactions (hover, focus)
normal:    200ms   — state changes, reveals
slow:      400ms   — page transitions, modals
```

## Easing

- Default: `ease-out`
- Entrances: `ease-out`
- Exits: `ease-in`
- Elastic: only for intentional playful moments

## Patterns

```tsx
// Fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.2 }}

// Slide up reveal
initial={{ opacity: 0, y: 16 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: 'easeOut' }}

// Staggered list
transition={{ staggerChildren: 0.05 }}
```

Never animate layout properties (`width`, `height`) — use `max-height` or `transform` instead.

---

# Icons

- Use `lucide-react` as the primary icon library
- Icon size: `16px` (text), `20px` (UI), `24px` (featured)
- Icons must always have `aria-hidden="true"` when decorative
- Icons used as buttons must have `aria-label`

---

# Images & Media

- All images via `next/image`
- Always define `width`, `height`, or `fill` + containing `relative` div
- Always provide `alt` text
- Use `priority` only for LCP images (hero, above the fold)
- Use `sizes` prop for responsive images

---

# Responsive Breakpoints

```
Mobile:   < 640px  — single column, stacked layout
Tablet:   640–1024px — 2 column where appropriate
Desktop:  > 1024px — full layout
Wide:     > 1280px — max-width capped, centered
```

Design mobile-first. Scale up, not down.

---

# Quality Gate

Before marking any UI work done:

- [ ] Dark mode looks correct
- [ ] Light mode looks correct
- [ ] Responsive at 375px, 768px, 1280px
- [ ] All interactive states implemented
- [ ] Keyboard navigable
- [ ] No contrast violations
- [ ] Would it look at home in Linear or Vercel?
