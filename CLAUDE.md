# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build (runs tsc type check)
npm run lint      # ESLint
npm run clean     # Remove .next build artifacts
```

## Environment variables

Copy `.env.example` to `.env.local` before running locally.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE` | Base URL of the real backend (e.g. `http://10.1.4.98:3006`). Empty string means relative URLs (useful when proxying). |
| `GEMINI_API_KEY` | Server-side Gemini API key — used by the AI generation features. |
| `APP_URL` | Self-referential URL for OAuth callbacks / self-links. |

## Architecture

**Single-page app** inside Next.js App Router. `app/page.tsx` is the shell — it reads `currentUserAtom` to choose between `<LoginView>` and the authenticated layout (Sidebar + Header + view). Navigation between views is purely client-side via `activeTabAtom`; there is no file-based page routing.

### API layer

Three tiers, each with a distinct responsibility:

```
lib/api/config.ts     — API_BASE constant + staticUrl() helper
lib/api/client.ts     — fetch wrapper; injects Bearer token; throws on non-2xx
lib/api/*.ts          — domain modules (auth, products, users) — thin wrappers over apiClient
lib/hooks/            — React Query hooks consumed by components
```

Tokens are stored in `localStorage` under keys `levelup_access_token` and `levelup_refresh_token`. `getToken()` / `setToken()` / `clearToken()` in `client.ts` manage them. The `useInitAuth` hook (called once in `app/page.tsx`) restores session on mount by calling `GET /api/v1/auth/me` if a token exists.

### Real backend vs. mock routes

| Endpoint prefix | Backed by |
|-----------------|-----------|
| `/api/v1/auth/*`, `/api/v1/products/*`, `/api/v1/users/*` | Real backend at `NEXT_PUBLIC_API_BASE` |
| `/api/dashboard`, `/api/sales`, `/api/customers` | Next.js mock routes in `app/api/` (800 ms delay, static data from `lib/mock-data.ts`) |

### State layers

| Layer | Tool | Location |
|-------|------|----------|
| Server/async state | TanStack React Query | `lib/hooks/` |
| Global UI state | Jotai atoms | `lib/store.ts` |
| Theme (light/dark) | React Context + localStorage | `lib/context/theme-context.tsx` |
| Form state | React Hook Form + @hookform/resolvers | inside view components |

Key atoms: `activeTabAtom` (current view), `selectedProductAtom`, `currentUserAtom` (null = not logged in), `isAuthenticatedAtom` (derived).

### React Query keys

- Auth: `['auth', 'me']`
- Products list: `['products', params]` (params object is part of the key — filtering/pagination is automatic)
- Dashboard / Sales / Customers: `['dashboard']`, `['sales']`, `['customers']`

All mutations call `queryClient.invalidateQueries({ queryKey: ['products'] })` on success, which invalidates all products queries regardless of params.

### Component layers

```
components/
  animate-ui/   # Framer Motion primitives (text, icons, sliding numbers, hover button)
  layout/       # Sidebar (collapsible) + Header (search, theme toggle, profile)
  providers/    # RootProvider: Theme → ReactQuery → i18n → Toaster
  ui/           # shadcn base components
  views/        # Full page-level components rendered by app/page.tsx
hooks/          # Non-query React hooks (use-is-in-view, use-mobile) — root level, not lib/
```

### Styling

Tailwind CSS v4, oklch color space, CSS variables for all theme tokens. Dark mode via `.dark` class. Fonts: Geist (`--font-sans`, body) and Space Grotesk (`--font-display`, headings). Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional classnames.

### Key libraries

- **Framer Motion** — animations; custom easing `[0.16, 1, 0.3, 1]`, stagger 0.1 s (words) / 0.02 s (chars)
- **Sonner** — toasts via `lib/toast.ts` wrapper (`showToast.success/error/loading/promise`)
- **i18next** — EN / VI / RO translations inline in `lib/i18n.ts` (no separate locale files)
- **Recharts** — charts in the Dashboard and Landing Pages analytics views
- **@google/genai** — Gemini API; used in Landing Pages AI generation features
- **shadcn** — component scaffolding, style `base-nova`, registry config in `components.json`

### Useful helpers

- `staticUrl(path)` in `lib/api/config.ts` — prepends `API_BASE` to a relative path (for image URLs from the backend)
- `userDisplayRole(user)` in `lib/api/types.ts` — resolves display role from `roles[]` or `role` field
- `showToast.*` in `lib/toast.ts` — all toast calls go through this; never call Sonner directly

### animate-ui fix note

`<AnimateIcon>` accepts `children`, not a `render` prop. Pass the icon as children:
```tsx
<AnimateIcon ...>
  <IconComponent ... />
</AnimateIcon>
```
