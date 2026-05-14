# Dark/Light Mode Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix two dark/light mode issues — landing pages black background in light mode, and missing theme toggle on the login screen.

**Architecture:** Theme is managed by `useTheme()` from `lib/context/theme-context.tsx` which toggles `.dark` class on `<html>`. The fix for landing pages is a wrong CSS variable. The login toggle reuses the same `useTheme()` hook already used in Header.

**Tech Stack:** Tailwind CSS v4, `useTheme()` hook, Framer Motion for animation (already present in header).

---

## Task 1 — Fix Landing Pages background in light mode

**Root cause:** `components/views/landing-pages/index.tsx` line 84 uses `bg-brand-bg dark:bg-[#080808]`. The CSS variable `--color-brand-bg` is defined as `#080808` (near-black) in `app/globals.css:9`, so in light mode the background is still black.

**Files:**
- Modify: `components/views/landing-pages/index.tsx` (line 84)

**Step 1: Fix the background class**

Open `components/views/landing-pages/index.tsx`.

Find line 84:
```tsx
<div className="h-full bg-brand-bg dark:bg-[#080808]">
```

Replace with:
```tsx
<div className="h-full bg-[#f8f9fc] dark:bg-[#080808]">
```

`#f8f9fc` is the same light-mode background used by `product-detail.tsx` and `product-create.tsx` — keeps the whole app consistent.

**Step 2: Verify visually**

Run `npm run dev`, navigate to `/landing-pages`.
- Light mode: background should be a soft off-white (`#f8f9fc`)
- Dark mode: background should be near-black (`#080808`)

**Step 3: TypeScript check**

```powershell
npx tsc --noEmit
```
Expected: no output (no errors).

**Step 4: Commit**

```bash
git add components/views/landing-pages/index.tsx
git commit -m "fix(landing-pages): correct light-mode background from brand-bg to #f8f9fc"
```

---

## Task 2 — Add dark/light toggle button to Login page

**Goal:** The login screen (`app/login/page.tsx` → `components/views/login-view.tsx`) has no theme toggle. Add a Sun/Moon button in the top-right corner that uses `useTheme()` — identical behavior to the header toggle.

**Files:**
- Modify: `components/views/login-view.tsx`

**Step 1: Import the theme hook and icons**

Open `components/views/login-view.tsx`.

At the top, the existing imports already include some icons. Add these if not present:

```tsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/context/theme-context';
import { motion } from 'framer-motion';
```

`motion` is already imported. `Sun` and `Moon` may need to be added to the existing lucide import line.

**Step 2: Add `useTheme` inside the component**

Inside `LoginView`, after the existing hooks, add:

```tsx
const { theme, toggleTheme } = useTheme();
```

**Step 3: Add the toggle button to the JSX**

The login page root div is `fixed inset-0 z-[100] flex flex-col ...`. Add a positioned toggle button inside it, before the video/background layers, as a fixed element in the top-right:

```tsx
{/* Theme Toggle */}
<div className="absolute top-6 right-6 z-[110]">
  <button
    onClick={toggleTheme}
    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-105 active:scale-95"
    aria-label="Toggle theme"
  >
    <div className="relative w-5 h-5">
      <motion.div
        animate={{ rotate: theme === 'dark' ? 0 : 180, scale: theme === 'dark' ? 1 : 0, opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun size={20} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ rotate: theme === 'dark' ? -180 : 0, scale: theme === 'dark' ? 0 : 1, opacity: theme === 'dark' ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon size={20} strokeWidth={1.5} />
      </motion.div>
    </div>
  </button>
</div>
```

Place this block immediately after the opening `<div className="fixed inset-0 z-[100] ...">` tag, before the video background block.

**Step 4: Verify visually**

Run `npm run dev`, navigate to `/login`.
- A Sun/Moon button appears in top-right corner
- Clicking it toggles dark/light (`.dark` class on `<html>`)
- The login page background video/overlay stays consistent (always dark regardless — that's intentional for the dramatic login aesthetic)
- After login and navigating to the app, the theme state persists

**Step 5: TypeScript check**

```powershell
npx tsc --noEmit
```
Expected: no output.

**Step 6: Commit**

```bash
git add components/views/login-view.tsx
git commit -m "feat(login): add dark/light theme toggle button to login screen"
```

---

## Done

Both tasks are independent and can be implemented in either order. Total estimated time: ~10 minutes.
