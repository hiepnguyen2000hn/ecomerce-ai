# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build (runs tsc type check)
npm run lint      # ESLint
npm run clean     # Remove .next build artifacts
```

## Architecture

**Single-page app** inside Next.js App Router. `app/page.tsx` is the shell — it reads a Jotai atom (`activeTabAtom`) to decide which view to render. There is no file-based page routing for UI; navigation is purely client-side state.

**API routes** at `app/api/` are mock REST endpoints (800 ms simulated delay). They mirror the real backend defined in the Swagger spec at `Downloads/response.json` — base URL `http://10.1.4.98:3006`, auth via Bearer JWT.

### State layers

| Layer | Tool | Location |
|-------|------|----------|
| Server/async state | TanStack React Query (staleTime 60 s) | `lib/hooks/` |
| Global UI state | Jotai atoms | `lib/store.ts` |
| Theme (light/dark) | React Context + localStorage | `lib/context/ThemeContext.tsx` |
| Form state | React Hook Form + @hookform/resolvers | inside view components |

### Data fetching pattern

Custom hooks in `lib/hooks/` wrap `useQuery` / `useMutation`. Mutations call `queryClient.invalidateQueries` on success. Query keys are simple strings: `['products']`, `['dashboard']`, `['sales']`, `['customers']`.

### Component layers

```
components/
  animate-ui/   # Framer Motion primitives (text, icons, sliding numbers, hover button)
  layout/       # Sidebar (collapsible) + Header (search, theme toggle, profile)
  providers/    # RootProvider wraps Theme → ReactQuery → i18n → Toaster
  ui/           # shadcn base components (Button, etc.)
  views/        # Full page-level components rendered by app/page.tsx
```

### Styling

Tailwind CSS v4, oklch color space, CSS variables for all theme tokens. Dark mode via `.dark` class. Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional classnames.

### Key libraries

- **Framer Motion** — animations; custom easing `[0.16, 1, 0.3, 1]`, stagger 0.1 s (words) / 0.02 s (chars)
- **Sonner** — toasts via `lib/toast.ts` wrapper (`showToast.success/error/loading/promise`)
- **i18next** — EN / VI / RO translations configured in `lib/i18n.ts`
- **@google/genai** — Gemini API wired but not fully used yet; intended for AI product/landing-page generation
- **shadcn** — component scaffolding, style `base-nova`, registry config in `components.json`

### animate-ui fix note

`<AnimateIcon>` accepts `children`, not a `render` prop. Pass the icon as children:
```tsx
<AnimateIcon ...>
  <IconComponent ... />
</AnimateIcon>
```
