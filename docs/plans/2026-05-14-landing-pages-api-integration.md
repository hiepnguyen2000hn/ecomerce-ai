# Landing Pages & LP Templates API Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all mock data in the Landing Pages feature with real API calls to `/api/v1/landing-pages` and `/api/v1/lp-templates`, and add React Query hooks for the Users API.

**Architecture:** Follow the existing three-tier pattern — types in `lib/api/types.ts`, thin API wrappers in `lib/api/*.ts`, React Query hooks in `lib/hooks/*.ts`, views consume hooks only. Mock data stays in `lib/mock-data.ts` but views stop importing from it.

**Tech Stack:** Next.js App Router, TanStack React Query v5, TypeScript strict, `apiClient` from `lib/api/client.ts`, Jotai atoms in `lib/store.ts`.

---

## Scope

### What changes
| Layer | File | Action |
|-------|------|--------|
| Types | `lib/api/types.ts` | Add LP Template + Landing Page + updated ApiUser types |
| API | `lib/api/lp-templates.ts` | Create (new file) |
| API | `lib/api/landing-pages.ts` | Create (new file) |
| Hooks | `lib/hooks/use-lp-templates.ts` | Create (new file) |
| Hooks | `lib/hooks/use-landing-pages.ts` | Create (new file) |
| Hooks | `lib/hooks/use-users.ts` | Create (new file) |
| View | `components/views/landing-pages/portfolio.tsx` | Replace MOCK_LANDING_PAGES with real hook |
| View | `components/views/landing-pages/selector.tsx` | Replace MOCK_PRODUCTS with real hook |
| View | `components/views/landing-pages/index.tsx` | Update types (LandingPage → ApiLandingPage) |

### What does NOT change
- `components/views/landing-pages/analytics.tsx` — shows traffic/CVR/CPA metrics the real API does not provide yet; keep mock-backed
- `components/views/landing-pages/editor.tsx` — AI editor, not data-driven
- `components/views/landing-pages/batch-generation-modal.tsx` — AI generation flow

---

## Task 1: Add types to `lib/api/types.ts`

**Files:**
- Modify: `lib/api/types.ts`

**Step 1: Open the file and locate the end**

Read `lib/api/types.ts` — the last line is currently the `userDisplayRole` function.

**Step 2: Append these types after the existing content**

```typescript
// Users (full view from backend)
export interface ApiUserFull {
  id: string;
  email: string;
  fullName: string;
  status: string;
  roles: string[];
  createdAt: string;
}

// LP Templates
export interface LpTemplate {
  id: string;
  code: string;
  name: string;
  masterHtmlPath: string;
  screenshotUrl?: string;
  lang: string;
  marketCode: string;
  active: boolean;
  perfScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLpTemplateDto {
  code: string;
  name: string;
  masterHtmlPath: string;
  screenshotUrl?: string;
  lang: string;
  marketCode: string;
  active?: boolean;
}

export type UpdateLpTemplateDto = Partial<CreateLpTemplateDto>;

// Landing Pages
export type LandingPageStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface ApiLandingPage {
  id: string;
  productId: string;
  templateId?: string;
  code: string;
  marketCode: string;
  lang: string;
  slug: string;
  status: LandingPageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingPageDto {
  productId: string;
  templateId?: string;
  code: string;
  marketCode: string;
  lang: string;
  slug: string;
}

export type UpdateLandingPageDto = Partial<CreateLandingPageDto>;

export interface StatusTransitionDto {
  toStatus: LandingPageStatus;
  reason?: string;
}
```

**Step 3: Verify TypeScript compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```
Expected: no output (no TS errors).

**Step 4: Commit**

```bash
git add lib/api/types.ts
git commit -m "feat(types): add LpTemplate, ApiLandingPage, ApiUserFull types"
```

---

## Task 2: Create `lib/api/lp-templates.ts`

**Files:**
- Create: `lib/api/lp-templates.ts`

**Step 1: Create the file**

```typescript
import { apiClient } from './client';
import type { LpTemplate, CreateLpTemplateDto, UpdateLpTemplateDto } from './types';

export const listLpTemplates = (): Promise<LpTemplate[]> =>
  apiClient.get('/api/v1/lp-templates');

export const getLpTemplate = (id: string): Promise<LpTemplate> =>
  apiClient.get(`/api/v1/lp-templates/${id}`);

export const getTopLpTemplates = (n?: number): Promise<LpTemplate[]> => {
  const query = n ? `?n=${n}` : '';
  return apiClient.get(`/api/v1/lp-templates/top${query}`);
};

export const createLpTemplate = (dto: CreateLpTemplateDto): Promise<LpTemplate> =>
  apiClient.post('/api/v1/lp-templates', dto);

export const updateLpTemplate = (id: string, dto: UpdateLpTemplateDto): Promise<LpTemplate> =>
  apiClient.patch(`/api/v1/lp-templates/${id}`, dto);

export const deleteLpTemplate = (id: string): Promise<void> =>
  apiClient.delete(`/api/v1/lp-templates/${id}`);
```

**Step 2: Verify TypeScript compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```

**Step 3: Commit**

```bash
git add lib/api/lp-templates.ts
git commit -m "feat(api): add lp-templates API module"
```

---

## Task 3: Create `lib/api/landing-pages.ts`

**Files:**
- Create: `lib/api/landing-pages.ts`

**Step 1: Create the file**

```typescript
import { apiClient } from './client';
import type {
  ApiLandingPage,
  CreateLandingPageDto,
  UpdateLandingPageDto,
  StatusTransitionDto,
} from './types';

export const listLandingPages = (): Promise<ApiLandingPage[]> =>
  apiClient.get('/api/v1/landing-pages');

export const getLandingPage = (id: string): Promise<ApiLandingPage> =>
  apiClient.get(`/api/v1/landing-pages/${id}`);

export const getLandingPagesByProduct = (productId: string): Promise<ApiLandingPage[]> =>
  apiClient.get(`/api/v1/landing-pages/by-product/${productId}`);

export const createLandingPage = (dto: CreateLandingPageDto): Promise<ApiLandingPage> =>
  apiClient.post('/api/v1/landing-pages', dto);

export const updateLandingPage = (id: string, dto: UpdateLandingPageDto): Promise<ApiLandingPage> =>
  apiClient.patch(`/api/v1/landing-pages/${id}`, dto);

export const deleteLandingPage = (id: string): Promise<void> =>
  apiClient.delete(`/api/v1/landing-pages/${id}`);

export const transitionLandingPageStatus = (
  id: string,
  dto: StatusTransitionDto,
): Promise<ApiLandingPage> =>
  apiClient.post(`/api/v1/landing-pages/${id}/status`, dto);
```

**Step 2: Verify TypeScript compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```

**Step 3: Commit**

```bash
git add lib/api/landing-pages.ts
git commit -m "feat(api): add landing-pages API module"
```

---

## Task 4: Create `lib/hooks/use-lp-templates.ts`

**Files:**
- Create: `lib/hooks/use-lp-templates.ts`

**Step 1: Create the file**

Follow the exact same pattern as `lib/hooks/use-products.ts`.

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listLpTemplates, getLpTemplate, getTopLpTemplates,
  createLpTemplate, updateLpTemplate, deleteLpTemplate,
} from '@/lib/api/lp-templates';
import type { CreateLpTemplateDto, UpdateLpTemplateDto } from '@/lib/api/types';

export function useLpTemplates() {
  return useQuery({
    queryKey: ['lp-templates'],
    queryFn: listLpTemplates,
  });
}

export function useLpTemplate(id: string) {
  return useQuery({
    queryKey: ['lp-templates', id],
    queryFn: () => getLpTemplate(id),
    enabled: !!id,
  });
}

export function useTopLpTemplates(n?: number) {
  return useQuery({
    queryKey: ['lp-templates', 'top', n],
    queryFn: () => getTopLpTemplates(n),
  });
}

export function useCreateLpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLpTemplateDto) => createLpTemplate(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lp-templates'] }),
  });
}

export function useUpdateLpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLpTemplateDto }) =>
      updateLpTemplate(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lp-templates'] }),
  });
}

export function useDeleteLpTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLpTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lp-templates'] }),
  });
}
```

**Step 2: Verify TypeScript compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```

**Step 3: Commit**

```bash
git add lib/hooks/use-lp-templates.ts
git commit -m "feat(hooks): add useLpTemplates React Query hooks"
```

---

## Task 5: Create `lib/hooks/use-landing-pages.ts`

**Files:**
- Create: `lib/hooks/use-landing-pages.ts`

**Step 1: Create the file**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listLandingPages, getLandingPage, getLandingPagesByProduct,
  createLandingPage, updateLandingPage, deleteLandingPage,
  transitionLandingPageStatus,
} from '@/lib/api/landing-pages';
import type {
  CreateLandingPageDto, UpdateLandingPageDto, StatusTransitionDto,
} from '@/lib/api/types';

export function useLandingPages() {
  return useQuery({
    queryKey: ['landing-pages'],
    queryFn: listLandingPages,
  });
}

export function useLandingPage(id: string) {
  return useQuery({
    queryKey: ['landing-pages', id],
    queryFn: () => getLandingPage(id),
    enabled: !!id,
  });
}

export function useLandingPagesByProduct(productId: string) {
  return useQuery({
    queryKey: ['landing-pages', 'by-product', productId],
    queryFn: () => getLandingPagesByProduct(productId),
    enabled: !!productId,
  });
}

export function useCreateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLandingPageDto) => createLandingPage(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

export function useUpdateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLandingPageDto }) =>
      updateLandingPage(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

export function useDeleteLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLandingPage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

export function useTransitionLandingPageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: StatusTransitionDto }) =>
      transitionLandingPageStatus(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}
```

**Step 2: Verify TypeScript compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```

**Step 3: Commit**

```bash
git add lib/hooks/use-landing-pages.ts
git commit -m "feat(hooks): add useLandingPages React Query hooks"
```

---

## Task 6: Create `lib/hooks/use-users.ts`

The API layer (`lib/api/users.ts`) already exists. Only the hooks are missing.

**Files:**
- Create: `lib/hooks/use-users.ts`

**Step 1: Create the file**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { listUsers, getUser } from '@/lib/api/users';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}
```

**Step 2: Check what `lib/api/users.ts` returns**

Open `lib/api/users.ts` — confirm the return types. If it returns `ApiUser` (the old interface), that's fine for now; do not change it in this task.

**Step 3: Verify TypeScript compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```

**Step 4: Commit**

```bash
git add lib/hooks/use-users.ts
git commit -m "feat(hooks): add useUsers React Query hooks"
```

---

## Task 7: Update `components/views/landing-pages/portfolio.tsx`

Replace `MOCK_LANDING_PAGES` with real API data. The real `ApiLandingPage` does **not** have `traffic` or `conversion` fields — remove those columns and show real fields: `status`, `slug`, `marketCode`, `lang`, `createdAt`.

**Files:**
- Modify: `components/views/landing-pages/portfolio.tsx`

**Step 1: Replace the imports at the top of the file**

Remove:
```typescript
import { MOCK_LANDING_PAGES, MOCK_PRODUCTS, LandingPage } from '@/lib/mock-data';
import Image from 'next/image';
```

Add:
```typescript
import { useLandingPages } from '@/lib/hooks/use-landing-pages';
import type { ApiLandingPage } from '@/lib/api/types';
```

**Step 2: Update the props interface**

Change:
```typescript
interface LandingPagePortfolioProps {
  onSelectPage: (lp: LandingPage) => void;
  onCreateNew: () => void;
}
```

To:
```typescript
interface LandingPagePortfolioProps {
  onSelectPage: (lp: ApiLandingPage) => void;
  onCreateNew: () => void;
}
```

**Step 3: Replace the component body**

Inside `LandingPagePortfolio`, add the hook call right after `const { t } = useTranslation();`:

```typescript
const { data: landingPages = [], isLoading } = useLandingPages();
```

**Step 4: Replace the table**

Replace the `<table>` block (currently rows iterate `MOCK_LANDING_PAGES`) with:

```tsx
<div className="bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden">
  {isLoading ? (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-bold">
      Loading…
    </div>
  ) : landingPages.length === 0 ? (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-bold">
      No landing pages yet.
    </div>
  ) : (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-gray-50 dark:border-white/5">
          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Slug</th>
          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Market</th>
          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lang</th>
          <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Created</th>
        </tr>
      </thead>
      <tbody>
        {landingPages.map((lp) => (
          <tr
            key={lp.id}
            onClick={() => onSelectPage(lp)}
            className="group hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <td className="px-8 py-8">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                lp.status === 'PUBLISHED'    && "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
                lp.status === 'NEEDS_REVIEW' && "bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                lp.status === 'DRAFT'        && "bg-gray-100/50 text-gray-500 dark:bg-white/5 dark:text-gray-400",
                lp.status === 'ARCHIVED'     && "bg-red-100/50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
              )}>
                • {lp.status}
              </span>
            </td>
            <td className="px-8 py-8">
              <span className="flex items-center gap-1 text-blue-500 font-mono text-xs font-bold">
                <ExternalLink size={12} />
                {lp.slug}
              </span>
            </td>
            <td className="px-8 py-8">
              <span className="text-xs font-mono font-bold text-black dark:text-white">{lp.marketCode}</span>
            </td>
            <td className="px-8 py-8">
              <span className="text-xs font-mono font-bold text-gray-500">{lp.lang}</span>
            </td>
            <td className="px-8 py-8">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-gray-400">
                <Clock size={12} strokeWidth={2.5} />
                <span>{new Date(lp.createdAt).toLocaleDateString()}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
```

**Step 5: Clean up unused imports**

Remove any icon imports that are no longer used (`Users`, `BarChart3`). Keep `Clock`, `ExternalLink`, `Search`, `Filter`, `Plus`.

**Step 6: Verify TypeScript compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```

**Step 7: Commit**

```bash
git add components/views/landing-pages/portfolio.tsx
git commit -m "feat(views): connect portfolio to real landing-pages API"
```

---

## Task 8: Update `components/views/landing-pages/selector.tsx`

Replace `MOCK_PRODUCTS` with real `useProducts()` hook. The hook already exists.

**Files:**
- Modify: `components/views/landing-pages/selector.tsx`

**Step 1: Replace import**

Remove:
```typescript
import { MOCK_PRODUCTS, Product } from '@/lib/mock-data';
```

Add:
```typescript
import { useProducts } from '@/lib/hooks/use-products';
import type { ApiProduct } from '@/lib/api/types';
```

**Step 2: Update the props interface**

Change:
```typescript
interface LandingPageSelectorProps {
  onSelect: (product: Product) => void;
}
```

To:
```typescript
interface LandingPageSelectorProps {
  onSelect: (product: ApiProduct) => void;
}
```

**Step 3: Add the hook and update filtering**

Inside the component, replace:
```typescript
const [query, setQuery] = useState('');
const filteredProducts = query 
  ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  : MOCK_PRODUCTS.slice(0, 3);
```

With:
```typescript
const [query, setQuery] = useState('');
const { data: products = [], isLoading } = useProducts({ q: query || undefined, pageSize: 20 });
```

**Step 4: Update the product card rendering**

Find where `filteredProducts.map(...)` is used and change it to `products.map(...)`.

The mock `Product` type has `.image` (a picsum URL); `ApiProduct` has `.primaryImageUrl` (optional, backend URL via `staticUrl()`). Update the image source:

```typescript
// OLD
src={product.image}

// NEW — import staticUrl from '@/lib/api/config' at the top
src={product.primaryImageUrl ? staticUrl(product.primaryImageUrl) : `https://picsum.photos/seed/${product.sku}/800/800`}
```

Add `import { staticUrl } from '@/lib/api/config';` to the imports.

Also update any reference to `product.status` — mock had `'Draft' | 'Testing'...`, real API has `lifecycleStage: LifecycleStage`. Replace `.status` with `.lifecycleStage` wherever displayed.

**Step 5: Add a loading state**

Before the product list, add:
```tsx
{isLoading && (
  <div className="text-center py-8 text-gray-400 text-sm font-bold">Searching…</div>
)}
```

**Step 6: Verify TypeScript compiles**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```

**Step 7: Commit**

```bash
git add components/views/landing-pages/selector.tsx
git commit -m "feat(views): connect selector to real products API"
```

---

## Task 9: Update `components/views/landing-pages/index.tsx`

Update the controller to use real types instead of mock types. The analytics view still receives a `LandingPage` (mock) — we need to align or isolate that.

**Files:**
- Modify: `components/views/landing-pages/index.tsx`

**Step 1: Replace imports**

Remove:
```typescript
import { LandingPage, Product } from '@/lib/mock-data';
```

Add:
```typescript
import type { ApiProduct, ApiLandingPage } from '@/lib/api/types';
```

**Step 2: Update state types**

Change:
```typescript
const [selectedLP, setSelectedLP] = useState<LandingPage | null>(null);
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
```

To:
```typescript
const [selectedLP, setSelectedLP] = useState<ApiLandingPage | null>(null);
const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
```

**Step 3: Update handler types**

```typescript
const handleSelectPage = (lp: ApiLandingPage) => { ... }
const handleProductSelect = (product: ApiProduct) => { ... }
```

**Step 4: Fix analytics view prop**

The `LandingPageAnalytics` component still expects `lp: LandingPage` (mock type). For now, cast or adjust the prop — the easiest fix is to pass `selectedLP` but accept that analytics shows no traffic data. Check `analytics.tsx` — if it crashes on missing fields (`lp.traffic`, `lp.conversion`), add optional chaining or a guard:

Open `components/views/landing-pages/analytics.tsx` and find references to `lp.traffic` and `lp.conversion`. Wrap with:
```typescript
lp.traffic?.users ?? 0
lp.conversion?.cvr ?? 0
```
Also change the prop type in `analytics.tsx`:
```typescript
// Import ApiLandingPage and use a union or any temporarily
lp: ApiLandingPage & { traffic?: { users: number; views: number }; conversion?: { cvr: number; cpa: number } }
```

**Step 5: Fix batch modal**

`BatchGenerationModal` receives `product: Product` (mock). Change its prop to `product: ApiProduct` and update inside the modal — replace `.image` with `.primaryImageUrl`, `.status` with `.lifecycleStage`, `.price` with `.retailPriceAmount`.

Check `components/views/landing-pages/batch-generation-modal.tsx` for all references to mock `Product` fields and update them.

**Step 6: Verify TypeScript compiles with no errors**

```powershell
npm run build 2>&1 | Select-String -Pattern "error TS"
```

Fix any remaining errors before committing.

**Step 7: Commit**

```bash
git add components/views/landing-pages/index.tsx components/views/landing-pages/analytics.tsx components/views/landing-pages/batch-generation-modal.tsx
git commit -m "feat(views): update landing-pages controller and sub-views to real API types"
```

---

## Task 10: Smoke test in browser

**Step 1: Start dev server**

```powershell
npm run dev
```

**Step 2: Navigate to Landing Pages view**

Open `http://localhost:3000`, log in, click **Landing Pages** in sidebar.

**Step 3: Verify**

- Portfolio table loads (empty list or real data, no console errors)
- "Create New" → Selector screen → product search returns real products
- TypeScript build passes: `npm run build`

**Step 4: Final commit if clean**

```bash
git add -A
git commit -m "chore: verify landing-pages API integration smoke test"
```

---

## Summary of new files

```
lib/api/lp-templates.ts          ← new
lib/api/landing-pages.ts         ← new
lib/hooks/use-lp-templates.ts    ← new
lib/hooks/use-landing-pages.ts   ← new
lib/hooks/use-users.ts           ← new
```

## Files modified

```
lib/api/types.ts                                          ← append new types
components/views/landing-pages/portfolio.tsx              ← real API
components/views/landing-pages/selector.tsx               ← real API
components/views/landing-pages/index.tsx                  ← real types
components/views/landing-pages/analytics.tsx              ← optional-chain mock fields
components/views/landing-pages/batch-generation-modal.tsx ← ApiProduct props
```
