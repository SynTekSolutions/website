# Code Review Instructions
applyTo: "**"

---

# Review Protocol

When reviewing code: do not report and stop.

Process:

1. Identify all issues
2. Prioritize by impact
3. Fix directly when scope allows
4. Document what changed and why

Analysis without a fix is incomplete.

---

# Issue Priority Levels

## P0 — Block shipping

- Security vulnerabilities (XSS, SQL injection, exposed secrets, missing auth)
- Data loss risk (unprotected mutations, missing transactions)
- Broken accessibility (missing focus management, no keyboard nav on interactive elements)
- Broken error states (unhandled promise rejections, swallowed errors)

## P1 — Fix before merge

- TypeScript `any` usage without justification
- Missing loading/error/empty states
- No input validation
- Memory leaks (`useEffect` missing cleanup)
- Hardcoded values that should be config/tokens
- Components above 200 lines without clear reason
- Missing `key` props in lists

## P2 — Fix soon

- Duplicate logic that should be extracted
- Prop drilling beyond 2 levels
- Missing `aria-label` on icon buttons
- Non-semantic HTML
- Inconsistent naming
- Dead code

## P3 — Note for later

- Optimization opportunities
- Refactoring candidates
- Documentation gaps
- Test coverage improvements

---

# Visual Review

Check every component against:

```
Hierarchy
  - Is the most important thing visually dominant?
  - Is there a clear reading path?

Typography
  - Correct size for context?
  - Correct weight?
  - Line height appropriate?
  - No orphaned words in headings?

Spacing
  - Consistent with the 4px grid?
  - Sections breathe enough?
  - No cramped layouts?

Color
  - Correct contrast ratios?
  - Correct semantic use (error = red, success = green)?
  - No raw hex values outside design tokens?
```

---

# UX Review

```
Friction
  - How many steps to complete the primary action?
  - Any unnecessary form fields?
  - Any confirmation dialogs that could be skipped?

Clarity
  - Is the CTA obvious?
  - Does the empty state explain what to do next?
  - Do error messages explain how to fix the problem?

Navigation
  - Can users find their way back easily?
  - Is the active state visible?
  - Do links describe their destination?
```

---

# Accessibility Review

WCAG AA compliance is the minimum standard.

```
Contrast
  - Body text: 4.5:1 minimum
  - Large text (18px+): 3:1 minimum
  - UI components: 3:1 minimum

Keyboard
  - Tab order logical?
  - All interactive elements reachable?
  - No keyboard traps?
  - Escape closes modals/drawers?

Screen Reader
  - All images have alt text?
  - Icon-only buttons have aria-label?
  - Form inputs have associated labels?
  - Dynamic content announced via aria-live?

Focus
  - Focus ring visible on all interactive elements?
  - Focus restored after modal close?
  - Skip-to-content link present on page level?
```

---

# Performance Review

```
Bundle
  - Are heavy libraries dynamically imported?
  - Are unused dependencies imported?
  - Is tree-shaking working correctly?

Rendering
  - Are Server Components used where possible?
  - Are Client Components pushed to the leaves?
  - Any unnecessary re-renders on state change?

Images
  - Using next/image?
  - Correct sizes prop?
  - Priority on above-the-fold images?

Fonts
  - Using next/font?
  - No FOUT (Flash of Unstyled Text)?
```

---

# Security Review

```
Input
  - All user input validated (client + server)?
  - SQL injection risk? (raw queries)
  - XSS risk? (dangerouslySetInnerHTML, innerHTML)

Auth
  - Are protected routes actually protected?
  - Are server actions checking authorization?
  - Are API routes behind auth middleware?

Secrets
  - No secrets in client-side code?
  - No NEXT_PUBLIC_ prefix on sensitive variables?
  - No secrets in git history?

CORS / CSP
  - Content Security Policy headers defined?
  - CORS configured to specific origins?
```

---

# Architecture Review

```
Duplication
  - Is this logic already implemented elsewhere?
  - Could this component use an existing one?

Scalability
  - Would this hold if the dataset grew 10x?
  - Would this hold if 3 developers touched it simultaneously?

Maintainability
  - Could a new developer understand this in 5 minutes?
  - Is the naming self-documenting?
  - Are edge cases handled or at least documented?
```

---

# Required Output Format

For every significant code review:

```md
## Review: [File or Feature Name]

### Critical Issues (P0)
- ...

### Should Fix (P1)
- ...

### Improvements Applied
- [What was changed and why]

### Remaining Technical Debt
- [Only items with meaningful future value]
```

If no issues found: confirm explicitly. Don't assume silence means "looks good."
