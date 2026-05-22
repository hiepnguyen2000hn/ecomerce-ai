# Products API v2 Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the frontend products layer (types → API functions → hooks → views) with the real backend Swagger v2 contract — basic products only (no variants).

**Architecture:** Four-layer fix — types contract, API function return shapes, React Query hooks, and the product-list pagination UI. Each layer change is isolated and committed before moving to the next.

**Tech Stack:** TypeScript, TanStack React Query v5, Next.js App Router, `lib/api/client.ts` (raw fetch wrapper, no auto-unwrap).

---

## Background: what's wrong today

| # | Problem | File | Impact |
|---|---------|------|--------|
| 1 | `UpdateProductDto` reuses `Partial<CreateProductDto>` which drags in `variantGroups` — wrong scope | `lib/api/types.ts` | Type safety |
| 2 | `listProducts()` returns `res.data` (just the array) — throws away `meta` (pagination info) | `lib/api/products.ts` | Pagination impossible |
| 3 | `useProducts()` hook discards meta, product-list gets no total/pages | `lib/hooks/use-products.ts` | No server-side pagination |
| 4 | `getProduct()` has no envelope unwrap — backend returns `{ data: ApiProduct }` but function returns it typed as `ApiProduct` | `lib/api/products.ts` | Detail view data mismatch |
| 5 | `product-list.tsx` has no `page`/`pageSize` state — loads everything in one request | `components/views/product-list.tsx` | Performance / UX |

---

## Task 1: Add explicit `UpdateProductDto` type

**Files:**
- Modify: `lib/api/types.ts`
- Modify: `lib/api/products.ts`

**Step 1: Add the type after `CreateProductDto` in types.ts**

In `lib/api/types.ts`, after the `CreateProductDto` interface (line ~112), add:

```ts
export interface UpdateProductDto {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  weightGrams?: number;
  cogsAmount?: number;
  cogsCurrency?: string;
  retailPriceAmount?: number;
  retailPriceCurrency?: string;
  marketCodes?: string[];
}
```

**Step 2: Update the import in products.ts**

In `lib/api/products.ts`, add `UpdateProductDto` to the import list from `./types`:

```ts
import type {
  ApiProduct, CreateProductDto, UpdateProductDto, ProductsListParams, ProductsListResponse,
  LifecycleTransitionDto, CreateVariantGroupDto, UpdateVariantGroupDto,
  CreateVariantDto, UpdateVariantDto,
} from './types';
```

**Step 3: Update `updateProduct` signature**

Change:
```ts
export const updateProduct  = (id: string, dto: Partial<CreateProductDto>): Promise<ApiProduct> =>
```
To:
```ts
export const updateProduct  = (id: string, dto: UpdateProductDto): Promise<ApiProduct> =>
```

**Step 4: Update the hook import and type**

In `lib/hooks/use-products.ts`, add `UpdateProductDto` to the import and update `useUpdateProduct`:

```ts
import type { CreateProductDto, UpdateProductDto, ProductsListParams, LifecycleTransitionDto } from '@/lib/api/types';

// ...

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateProductDto }) =>
      updateProduct(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
```

**Step 5: Run type check**

```bash
npm run build
```
Expected: no new type errors.

**Step 6: Commit**

```bash
git add lib/api/types.ts lib/api/products.ts lib/hooks/use-products.ts
git commit -m "feat(types): add explicit UpdateProductDto for basic products"
```

---

## Task 2: Fix `listProducts` to return full `ProductsListResponse`

**Files:**
- Modify: `lib/api/products.ts`

**Step 1: Change the return type and body**

In `lib/api/products.ts`, replace the `listProducts` function:

```ts
export async function listProducts(params: ProductsListParams = {}): Promise<ProductsListResponse> {
  const qs = new URLSearchParams();
  if (params.page)      qs.set('page',     String(params.page));
  if (params.pageSize)  qs.set('pageSize', String(params.pageSize));
  if (params.sort)      qs.set('sort',     params.sort);
  if (params.q)         qs.set('q',        params.q);
  params.lifecycleStage?.forEach(s => qs.append('lifecycleStage', s));
  params.status?.forEach(s         => qs.append('status', s));
  params.market?.forEach(m         => qs.append('market', m));
  if (params.includeDeleted)        qs.set('includeDeleted', 'true');
  const query = qs.toString() ? `?${qs}` : '';
  return apiClient.get<ProductsListResponse>(`/api/v1/products${query}`);
}
```

(Only change: remove `const res =` and `return res.data` — now returns the full `{ data, meta }` object.)

**Step 2: Run type check**

```bash
npm run build
```
Expected: `useProducts` in hooks will now show type errors — that's correct, Task 3 will fix them.

**Step 3: Commit**

```bash
git add lib/api/products.ts
git commit -m "feat(api): listProducts returns full ProductsListResponse including meta"
```

---

## Task 3: Update `useProducts` hook + product-list consumer

**Files:**
- Modify: `lib/hooks/use-products.ts`
- Modify: `components/views/product-list.tsx`

**Step 1: Update `useProducts` in the hook**

In `lib/hooks/use-products.ts`, change `useProducts`:

```ts
export function useProducts(params: ProductsListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => listProducts(params),
  });
}
```

No structural change needed — the hook now returns `data: ProductsListResponse | undefined`. Consumers must access `data.data` for the array and `data.meta` for pagination.

**Step 2: Update product-list.tsx consumer**

In `components/views/product-list.tsx`, change line 107:

```ts
// Before:
const { data: products = [], isLoading, error } = useProducts(params);

// After:
const { data: listResponse, isLoading, error } = useProducts(params);
const products = listResponse?.data ?? [];
const meta = listResponse?.meta;
```

**Step 3: Run type check**

```bash
npm run build
```
Expected: no errors.

**Step 4: Start dev server and verify product list still loads**

```bash
npm run dev
```
Open the Products view — the list should load identically to before.

**Step 5: Commit**

```bash
git add lib/hooks/use-products.ts components/views/product-list.tsx
git commit -m "feat(hooks): useProducts exposes pagination meta from ProductsListResponse"
```

---

## Task 4: Fix `getProduct` envelope unwrapping

**Files:**
- Modify: `lib/api/products.ts`

**Background:** The backend wraps single-item responses in `{ data: T }` (same pattern as auth — confirmed by how `listProducts` uses `res.data`). `getProduct` currently returns the raw `{ data: ApiProduct }` object typed as `ApiProduct`.

**Step 1: Fix `getProduct`**

In `lib/api/products.ts`, change:

```ts
// Before:
export const getProduct = (id: string): Promise<ApiProduct> =>
  apiClient.get(`/api/v1/products/${id}`);

// After:
export const getProduct = async (id: string): Promise<ApiProduct> => {
  const res = await apiClient.get<{ data: ApiProduct }>(`/api/v1/products/${id}`);
  return res.data;
};
```

**Step 2: Fix `createProduct` and `updateProduct` similarly**

These mutations also receive `{ data: ApiProduct }` responses:

```ts
export const createProduct = async (dto: CreateProductDto): Promise<ApiProduct> => {
  const res = await apiClient.post<{ data: ApiProduct }>('/api/v1/products', dto);
  return res.data;
};

export const updateProduct = async (id: string, dto: UpdateProductDto): Promise<ApiProduct> => {
  const res = await apiClient.patch<{ data: ApiProduct }>(`/api/v1/products/${id}`, dto);
  return res.data;
};
```

Note: `deleteProduct` and `transitionLifecycle` return `void` (204) — no change needed.

**Step 3: Run type check**

```bash
npm run build
```
Expected: no errors.

**Step 4: Smoke-test create and edit in the browser**

- Create a new product → verify the success toast fires and the list refreshes
- Edit a product field → save → verify list reflects the change

**Step 5: Commit**

```bash
git add lib/api/products.ts
git commit -m "fix(api): unwrap { data } envelope for getProduct, createProduct, updateProduct"
```

---

## Task 5: Wire server-side pagination to product-list

**Files:**
- Modify: `components/views/product-list.tsx`

**Step 1: Add page state**

After the existing filter state declarations in `ProductList` (around line 73), add:

```ts
const [page, setPage] = useState(1);
const PAGE_SIZE = 20;
```

**Step 2: Reset page on filter change**

Add a `useEffect` that resets to page 1 whenever filters change:

```ts
useEffect(() => {
  setPage(1);
}, [debouncedQ, activeLifecycle, sort, statusFilter, marketInput, includeDeleted]);
```

**Step 3: Pass page/pageSize into params**

Update the `params` object (around line 96):

```ts
const params: ProductsListParams = {
  page,
  pageSize: PAGE_SIZE,
  q:              debouncedQ || undefined,
  sort:           sort || undefined,
  lifecycleStage: activeLifecycle !== 'All' ? [activeLifecycle] : undefined,
  status:         statusFilter.length > 0 ? statusFilter : undefined,
  market:         marketInput.trim()
                    ? marketInput.split(',').map(m => m.trim()).filter(Boolean)
                    : undefined,
  includeDeleted: includeDeleted || undefined,
};
```

**Step 4: Add pagination controls below the product grid**

At the bottom of the returned JSX (after the product grid, before the closing `</div>`), add:

```tsx
{/* Pagination */}
{meta && meta.totalPages > 1 && (
  <div className="flex items-center justify-center gap-4 mt-12">
    <button
      onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={page <= 1}
      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-white/10 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:border-gray-300 dark:hover:border-white/20 transition-all"
    >
      <ChevronLeft size={14} />
      Prev
    </button>

    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {page} / {meta.totalPages}
      <span className="ml-3 text-gray-300 dark:text-gray-600">({meta.total} total)</span>
    </span>

    <button
      onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
      disabled={page >= meta.totalPages}
      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-white/10 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:border-gray-300 dark:hover:border-white/20 transition-all"
    >
      Next
      <ChevronRight size={14} />
    </button>
  </div>
)}
```

Note: `ChevronLeft` and `ChevronRight` are already imported in this file (line 7).

**Step 5: Run type check**

```bash
npm run build
```
Expected: no errors.

**Step 6: Test in browser**

- Load Products view — confirm first page loads
- Verify Prev/Next buttons appear only when `totalPages > 1`
- Click Next — confirm URL params change in Network tab and new page loads
- Apply a filter — confirm page resets to 1

**Step 7: Commit**

```bash
git add components/views/product-list.tsx
git commit -m "feat(ui): add server-side pagination to product-list (page/pageSize via meta)"
```

---

## Summary of all changed files

| File | Change |
|------|--------|
| `lib/api/types.ts` | Add `UpdateProductDto` interface |
| `lib/api/products.ts` | `listProducts` returns full response; `getProduct`/`createProduct`/`updateProduct` unwrap envelope; update `updateProduct` signature |
| `lib/hooks/use-products.ts` | Update `useUpdateProduct` type; `useProducts` now yields `data: ProductsListResponse` |
| `components/views/product-list.tsx` | Destructure `meta`, add page state, wire pagination controls |
