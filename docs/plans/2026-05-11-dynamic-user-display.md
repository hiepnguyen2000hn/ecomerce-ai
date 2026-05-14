# Dynamic User Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all hardcoded user text in the UI with real data from `currentUserAtom` populated by `/api/v1/auth/me`.

**Architecture:** `ProfileMenu` (inside `header.tsx`) reads `useAtomValue(currentUserAtom)` directly — no prop drilling needed since Jotai atoms are global. `UserMe` type is extended to handle `roles: string[]` which is what the real API returns (the JWT payload shows `"roles": ["LEADER"]`, not a single `role` string). A small helper derives the display role from whichever field is present.

**Tech Stack:** Next.js 15, Jotai v2, TypeScript strict

---

## What's broken

| Location | Hardcoded value | Should be |
|----------|----------------|-----------|
| `components/layout/header.tsx:361` | `"Authorized User"` | `user.role` or first of `user.roles` |
| `components/layout/header.tsx:362` | `"HIEP NGUYEN"` | `user.name ?? user.email` (uppercased) |
| `components/layout/header.tsx:365` | `"hiepnguyendevft@gmail.com"` | `user.email` |
| `components/views/login-view.tsx:196` | `placeholder="admin@hiepnguyen.io"` | generic placeholder |

---

### Task 1: Extend `UserMe` type to support `roles` array

**Files:**
- Modify: `lib/api/types.ts`

The real `/me` endpoint returns `roles: string[]` (matches JWT payload `"roles": ["LEADER"]`).
Current type only has `role: string` which may silently be `undefined`.

**Step 1: Update `UserMe` interface**

In `lib/api/types.ts`, replace:
```ts
export interface UserMe {
  id: string;
  email: string;
  name?: string;
  role: string;
}
```

With:
```ts
export interface UserMe {
  id: string;
  email: string;
  name?: string;
  role?: string;       // kept for backwards compat; may be absent
  roles?: string[];    // real API field: ["LEADER"]
}
```

**Step 2: Add a display helper at the bottom of the same file**

```ts
// Derive a single display role string regardless of which field the API uses.
export function userDisplayRole(user: UserMe): string {
  if (user.roles && user.roles.length > 0) return user.roles[0];
  if (user.role) return user.role;
  return 'User';
}
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — no type errors.

**Step 4: Commit**

```bash
git add lib/api/types.ts
git commit -m "feat(types): support roles array in UserMe and add userDisplayRole helper"
```

---

### Task 2: Wire `ProfileMenu` to `currentUserAtom`

**Files:**
- Modify: `components/layout/header.tsx`

`ProfileMenu` is a local function component inside `header.tsx` (line 321).
It currently has no user data — it just renders hardcoded strings.
We read `currentUserAtom` directly inside it with `useAtomValue`.

**Step 1: Add imports at the top of `header.tsx`**

After the existing imports (around line 30–31), add:
```ts
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '@/lib/store';
import { userDisplayRole } from '@/lib/api/types';
```

**Step 2: Read the atom inside `ProfileMenu`**

At the top of the `ProfileMenu` function body (after the existing `useState` calls, around line 324), add:

```ts
const currentUser = useAtomValue(currentUserAtom);
```

**Step 3: Replace the three hardcoded strings**

Find this block (lines 361–366):
```tsx
<p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Authorized User</p>
<p className="text-lg font-display font-black text-black dark:text-white mt-1 leading-tight tracking-tighter">HIEP NGUYEN</p>
<div className="flex items-center gap-2 mt-2">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
  <p className="text-[9px] font-mono text-gray-400 dark:text-white/30 uppercase font-bold tracking-widest truncate">hiepnguyendevft@gmail.com</p>
</div>
```

Replace with:
```tsx
<p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
  {currentUser ? userDisplayRole(currentUser) : 'User'}
</p>
<p className="text-lg font-display font-black text-black dark:text-white mt-1 leading-tight tracking-tighter">
  {currentUser ? (currentUser.name ?? currentUser.email).toUpperCase() : '—'}
</p>
<div className="flex items-center gap-2 mt-2">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
  <p className="text-[9px] font-mono text-gray-400 dark:text-white/30 uppercase font-bold tracking-widest truncate">
    {currentUser?.email ?? ''}
  </p>
</div>
```

**Step 4: Verify build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`.

**Step 5: Commit**

```bash
git add components/layout/header.tsx
git commit -m "feat(header): display real user name, email, and role from currentUserAtom"
```

---

### Task 3: Fix hardcoded login placeholder

**Files:**
- Modify: `components/views/login-view.tsx`

Line 196 has `placeholder="admin@hiepnguyen.io"` — a personal email hardcoded as hint text.

**Step 1: Replace placeholder**

Find:
```tsx
placeholder="admin@hiepnguyen.io"
```

Replace with:
```tsx
placeholder="you@company.com"
```

**Step 2: Verify build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`.

**Step 3: Commit**

```bash
git add components/views/login-view.tsx
git commit -m "fix(login): replace hardcoded personal email placeholder"
```

---

### Task 4: Push

```bash
git push origin main
```

---

## Runtime verification checklist

After deploying / running dev server (`npm run dev`):

1. Log in with real credentials
2. Open the profile menu (top-right avatar button)
3. Confirm:
   - Role label shows `LEADER` (or whatever the API returns), not `Authorized User`
   - Name shows real name or email from `getMe`, not `HIEP NGUYEN`
   - Email shows real email, not `hiepnguyendevft@gmail.com`
4. Reload the page — `useInitAuth` restores the session from localStorage and `getMe` is re-called; profile menu should still show correct data
5. Log out → log back in → confirm data repopulates correctly
