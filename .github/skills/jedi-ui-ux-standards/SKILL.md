---
name: jedi-ui-ux-standards
description: "Design and implement high-quality UI/UX with modern CSS and layout standards. Use when creating or refactoring pages, components, forms, navigation, states, and responsive behavior; includes accessibility, visual hierarchy, spacing, typography, motion, and quality checks."
argument-hint: 'Describe the screen, user flow, constraints, and brand direction (or say "audit existing UI").'
---

# Jedi UI/UX Standards

## Purpose

Produce polished, production-ready interfaces that follow strong UI/UX standards for layout, styling, accessibility, and interaction quality.

## When To Use

- Designing a new page, section, or component.
- Refactoring visual styles or layout structure.
- Auditing an existing UI for quality gaps.
- Implementing responsive behavior for mobile and desktop.
- Improving forms, empty states, loading states, and error states.

## Inputs

Collect these before implementation:

- Product goal: what user task must be completed quickly and clearly.
- Audience and context: device mix, accessibility expectations, content density.
- Visual direction: brand traits, mood, and style constraints.
- Technical limits: framework, design system constraints, browser support.

If inputs are missing, ask concise questions, then proceed with explicit assumptions.

## Enforcement Mode

- Strict mode is enabled: do not preserve weak existing patterns if they violate these standards.
- Prioritize usability, accessibility, and layout clarity over legacy styling consistency.

## Default Standards

- Accessibility first: semantic HTML, keyboard support, visible focus, sufficient color contrast.
- Visual hierarchy: clear heading scale, controlled text widths, obvious primary actions.
- Spacing rhythm: use a consistent spacing scale and avoid arbitrary one-off values.
- Responsive layout: mobile-first with clean breakpoints and no overflow traps.
- Predictable interactions: consistent hover, active, disabled, loading, and error behavior.
- Performance-aware styling: avoid heavy effects that hurt readability or rendering.

### Momentum-Specific Visual Defaults

- Prefer clean white-surface UI styling similar to the current sidebar look.
- Keep habit matrix checkbox visuals independent from global surface styling so matrix controls keep stronger contrast and click feedback.

## Procedure

1. Define the UX target

- Write a one-sentence goal and success metric.
- Identify the primary action and one fallback action.

2. Build the information hierarchy

- Map sections in priority order.
- Keep primary content above low-value decoration.
- Limit cognitive load: each section should answer one user question.

3. Choose layout pattern

- Pick the simplest layout that fits: single-column, split, dashboard grid, or master-detail.
- Set a max content width for readability.
- Use CSS grid/flex intentionally (not mixed randomly).

4. Establish a style foundation

- Define design tokens or CSS variables for color, spacing, radius, shadows, and typography.
- Use a coherent type scale for headings/body/captions.
- Keep component density consistent across the screen.

5. Implement states and interactions

- Add explicit states: default, hover, focus-visible, active, disabled, loading, success, error, empty.
- Ensure feedback appears within 100-300ms for user actions.
- Keep motion meaningful and subtle; avoid decorative animation noise.

6. Validate accessibility

- Verify keyboard navigation order and focus visibility.
- Confirm semantic roles, labels, and announcements for dynamic content.
- Check contrast for text and interactive elements.

7. Validate responsiveness

- Test small mobile, large mobile, tablet, desktop, and wide desktop.
- Prevent clipped text, horizontal scroll, and collapsed controls.
- Confirm touch target size and spacing on mobile.

8. Run quality checklist and refine

- Apply the completion checks below.
- Fix the top 3 friction points before finalizing.

## Decision Points

- If content is dense, prioritize scanability (grouping, headings, whitespace) over decorative styling.
- If visual clarity conflicts with brand flair, choose clarity first.
- If responsiveness forces trade-offs, preserve primary actions and content order before secondary widgets.
- If global styles reduce control visibility, isolate component-level styles for critical controls.
- If existing UI patterns conflict with this skill, refactor them to comply instead of inheriting them.

## Completion Checks

A UI pass is complete only when all checks pass:

- Usability: primary action is obvious and can be completed without confusion.
- Accessibility: keyboard and focus behavior are correct; contrast is acceptable.
- Layout: no overlap, jump, or clipping across target breakpoints.
- Consistency: spacing, typography, and states are uniform across related components.
- Resilience: handles loading, empty, long content, and error states gracefully.
- Maintainability: styles are tokenized/reusable and avoid brittle one-off overrides.

## Output Format

When using this skill, produce:

- A concise design intent summary.
- The implementation plan (layout, style, states, accessibility).
- Final code changes.
- A short validation report listing which completion checks were tested.

## Example Prompts

- Design a clean pricing section using these standards with mobile-first layout and accessible keyboard interactions.
- Audit this dashboard and refactor spacing, typography, and state handling to meet Jedi UI/UX standards.
- Build a form flow with strong error handling, loading state UX, and responsive layout.
