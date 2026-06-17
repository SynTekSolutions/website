# SynTek Solutions Engineering Playbook

## Company Context

SynTek Solutions is a B2B technology company.

The goal is NOT to build a beautiful website.

The goal is to build products that communicate:

- Trust
- Professionalism
- Technical maturity
- Scalability
- Premium quality
- Enterprise credibility

References:

- Stripe
- Vercel
- Linear
- Notion
- Clerk
- Supabase
- Resend
- Arc Browser

Never use freelancer portfolio websites as references.

---

# Core Principle

Every change must improve at least one of:

- User experience
- Conversion
- Visual quality
- Maintainability
- Performance
- Accessibility

If it improves none of these, challenge the implementation.

---

# Engineering Priorities

When making decisions:

1. Simplicity
2. Maintainability
3. Consistency
4. Accessibility
5. Performance
6. Speed of development

Never sacrifice maintainability for short-term speed.

---

# Reuse First

Before creating anything:

Check:

- Existing project components
- Existing project layouts
- Existing project patterns
- shadcn/ui
- 21st.dev Magic MCP

Priority order:

1. Existing project
2. shadcn/ui
3. 21st.dev patterns
4. Custom implementation

Do not reinvent common UI patterns.

---

# Frontend Standards

Stack:

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui

Prefer:

- Server Components
- Reusable components
- Composition
- Accessibility by default

Avoid:

- Massive components
- Duplicate logic
- Hardcoded values
- Deep prop drilling
- Unnecessary abstractions

---

# Design Standards

Every screen must have:

- Clear hierarchy
- Consistent spacing
- Responsive behavior
- Accessible interactions
- Proper contrast
- Hover states
- Loading states
- Empty states
- Error states

No unfinished states.

---

# SaaS Design References

Continuously benchmark against:

- Stripe
- Linear
- Vercel
- Clerk
- Resend
- Supabase
- Arc Browser

Question:

Would this screen look out of place inside one of these products?

If yes, improve it.

---

# Motion Design

Use subtle motion.

Preferred:

- Fade transitions
- Blur reveals
- Staggered appearance
- Hover transitions
- Smooth state changes

Avoid:

- Bounce animations
- Excessive scaling
- Attention-seeking effects
- Decorative animations

Motion should support usability.

---

# Liquid Glass Guidelines

Use glass effects strategically.

Good candidates:

- Navbar
- Dialogs
- Mobile menus
- Floating panels
- Command menus

Avoid applying glass everywhere.

Goal:

Premium perception, not visual noise.

---

# Navbar Standards

Navbar should feel inspired by:

- Linear
- Arc Browser
- Vercel

Requirements:

- Sticky
- Floating
- Backdrop blur
- Smooth scroll behavior
- Premium CTA
- Active section indication
- Responsive navigation

---

# Conversion First

Every section must answer at least one question:

- What do you do?
- Why should I care?
- Why trust you?
- Why choose you?
- What should I do next?

If a section answers none of these, reconsider it.

---

# Product Thinking

Do not blindly implement requests.

Analyze:

- Root problem
- Better alternatives
- Simpler alternatives
- Higher ROI alternatives

Challenge assumptions.

---

# Autonomous Improvement Mode

When receiving code:

Do not stop at analysis.

Process:

1. Analyze
2. Identify problems
3. Find better patterns
4. Improve implementation
5. Deliver updated code

Analysis without implementation is incomplete.

---

# Code Review Mode

Always inspect:

## Visual

- Hierarchy
- Typography
- Spacing
- Consistency

## UX

- Friction
- Confusion
- Navigation

## Accessibility

- Contrast
- Keyboard navigation
- Focus management

## Performance

- Bundle impact
- Rendering cost
- Unnecessary complexity

## Architecture

- Duplication
- Scalability
- Maintainability

---

# Required Output

For significant changes provide:

## Executive Summary

What changed and why.

## Problems Found

Prioritized list.

## Changes Applied

Detailed implementation summary.

## Risks

Potential issues.

## Future Improvements

Only if they provide meaningful value.

---

# Agent Behavior

Never ask:

- "What should I improve?"
- "Where should I start?"
- "What component should I review?"

When code is provided:

Assume permission to improve it.

Find issues.

Fix them.

Deliver the improved implementation.

Every file should leave better than it arrived.
