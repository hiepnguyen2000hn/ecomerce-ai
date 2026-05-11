# API Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all mock API calls with real HTTP calls to `http://10.1.4.98:3006`, wiring JWT auth (stored in localStorage) throughout the app.

**Architecture:** A thin `lib/api/` layer owns all HTTP + token logic. Jotai stores the current user in memory; `lib/api/client.ts` owns raw localStorage token reads/writes. React Query hooks in `lib/hooks/` consume the API layer — views never call fetch directly. Dashboard/sales/customers remain on mock Next.js routes (no real endpoints exist yet).

**Tech Stack:** Next.js 15, TanStack React Query v5, Jotai v2, TypeScript strict

---

## Folder changes overview

```
lib/
  api/               ← NEW
    config.ts        ← base URL constant
    types.ts         ← TS interfaces matching Swagger spec
    client.ts        ← fetch wrapper + token helpers
    auth.ts          ← login / refresh / me / logout
    products.ts      ← full products CRUD + variants + images
    users.ts         ← list + detail
  hooks/
    use-auth.ts      ← NEW: useLogin, useLogout, useInitAuth
    use-products.ts  ← MODIFY: point to real API
  store.ts           ← MODIFY: add currentUserAtom, isAuthenticatedAtom
components/
  views/
    login-view.tsx   ← MODIFY: call useLogin hook
app/
  page.tsx           ← MODIFY: read auth from Jotai, call useInitAuth
```

---

### Task 1: API config + types

**Files:**
- Create: `lib/api/config.ts`
- Create: `lib/api/types.ts`

**Step 1: Create `lib/api/config.ts`**

```ts
export const API_BASE = 'http://10.1.4.98:3006';
```

**Step 2: Create `lib/api/types.ts`**

```ts
// Auth
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserMe {
  id: string;
  email: string;
  name?: string;
  role: string;
}

// Products
export type LifecycleStage = 'DRAFT' | 'TESTING' | 'SCALING' | 'MATURE' | 'STOPPED';
export type ProductStatus = 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ApiProduct {
  id: string;
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  weightGrams?: number;
  cogsAmount?: number;
  cogsCurrency?: string;
  retailPriceAmount?: number;
  retailPriceCurrency?: string;
  marketCodes?: string[];
  lifecycleStage: LifecycleStage;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  weightGrams?: number;
  cogsAmount?: number;
  cogsCurrency?: string;
  retailPriceAmount?: number;
  retailPriceCurrency?: string;
  marketCodes?: string[];
}

export interface ProductsListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
  lifecycleStage?: LifecycleStage[];
  status?: ProductStatus[];
  market?: string[];
  includeDeleted?: boolean;
}

export interface LifecycleTransitionDto {
  toStage: LifecycleStage;
  reason?: string;
}

export interface VariantOptionInputDto {
  name: string;
  skuSuffix?: string;
  priceDelta?: number;
  imageUrl?: string;
  position?: number;
}

export interface CreateVariantGroupDto {
  name: string;
  position?: number;
  options: VariantOptionInputDto[];
}

export interface UpdateVariantGroupDto {
  name?: string;
  position?: number;
}

export interface CreateVariantDto {
  sku: string;
  optionCombinationJson?: Record<string, string>;
  priceAmount: number;
  currency: string;
  stockQty?: number;
  position?: number;
}

export interface UpdateVariantDto {
  priceAmount?: number;
  currency?: string;
  stockQty?: number;
  optionCombinationJson?: Record<string, string>;
  position?: number;
}

// Users
export interface ApiUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}
```

**Step 3: Commit**

```bash
git add lib/api/config.ts lib/api/types.ts
git commit -m "feat(api): add base config and TypeScript types from Swagger spec"
```

---

### Task 2: API client (fetch wrapper + token helpers)

**Files:**
- Create: `lib/api/client.ts`

**Step 1: Create `lib/api/client.ts`**

```ts
import { API_BASE } from './config';

const ACCESS_KEY = 'levelup_access_token';
const REFRESH_KEY = 'levelup_refresh_token';

export const getToken = (): string | null => localStorage.getItem(ACCESS_KEY);
export const setToken = (t: string): void => { localStorage.setItem(ACCESS_KEY, t); };
export const clearToken = (): void => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (t: string): void => { localStorage.setItem(REFRESH_KEY, t); };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.body && !(init.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const apiClient = {
  get:    <T>(path: string)                  => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body?: unknown)  => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown)  => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                  => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData)  => request<T>(path, { method: 'POST',  body: form }),
};
```

**Step 2: Commit**

```bash
git add lib/api/client.ts
git commit -m "feat(api): add fetch client with Bearer token injection and localStorage helpers"
```

---

### Task 3: Auth API functions

**Files:**
- Create: `lib/api/auth.ts`

**Step 1: Create `lib/api/auth.ts`**

```ts
import { apiClient, setToken, setRefreshToken, clearToken } from './client';
import type { LoginResponse, UserMe } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', { email, password });
  setToken(res.accessToken);
  setRefreshToken(res.refreshToken);
  return res;
}

export async function refreshAccessToken(token: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/v1/auth/refresh', { refreshToken: token });
  setToken(res.accessToken);
  setRefreshToken(res.refreshToken);
  return res;
}

export function getMe(): Promise<UserMe> {
  return apiClient.get<UserMe>('/api/v1/auth/me');
}

export function logout(): void {
  clearToken();
}
```

**Step 2: Commit**

```bash
git add lib/api/auth.ts
git commit -m "feat(api): add auth functions (login, refresh, getMe, logout)"
```

---

### Task 4: Products API functions

**Files:**
- Create: `lib/api/products.ts`

**Step 1: Create `lib/api/products.ts`**

```ts
import { API_BASE } from './config';
import { apiClient, getToken } from './client';
import type {
  ApiProduct, CreateProductDto, ProductsListParams,
  LifecycleTransitionDto, CreateVariantGroupDto, UpdateVariantGroupDto,
  CreateVariantDto, UpdateVariantDto,
} from './types';

export function listProducts(params: ProductsListParams = {}): Promise<ApiProduct[]> {
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
  return apiClient.get(`/api/v1/products${query}`);
}

export const getProduct     = (id: string): Promise<ApiProduct> =>
  apiClient.get(`/api/v1/products/${id}`);

export const createProduct  = (dto: CreateProductDto): Promise<ApiProduct> =>
  apiClient.post('/api/v1/products', dto);

export const updateProduct  = (id: string, dto: Partial<CreateProductDto>): Promise<ApiProduct> =>
  apiClient.patch(`/api/v1/products/${id}`, dto);

export const deleteProduct  = (id: string): Promise<void> =>
  apiClient.delete(`/api/v1/products/${id}`);

export const transitionLifecycle = (id: string, dto: LifecycleTransitionDto): Promise<void> =>
  apiClient.post(`/api/v1/products/${id}/lifecycle`, dto);

// Variant groups
export const createVariantGroup = (productId: string, dto: CreateVariantGroupDto) =>
  apiClient.post(`/api/v1/products/${productId}/variant-groups`, dto);

export const updateVariantGroup = (productId: string, groupId: string, dto: UpdateVariantGroupDto) =>
  apiClient.patch(`/api/v1/products/${productId}/variant-groups/${groupId}`, dto);

export const deleteVariantGroup = (productId: string, groupId: string): Promise<void> =>
  apiClient.delete(`/api/v1/products/${productId}/variant-groups/${groupId}`);

// Variants
export const createVariant = (productId: string, dto: CreateVariantDto) =>
  apiClient.post(`/api/v1/products/${productId}/variants`, dto);

export const updateVariant = (productId: string, variantId: string, dto: UpdateVariantDto) =>
  apiClient.patch(`/api/v1/products/${productId}/variants/${variantId}`, dto);

export const deleteVariant = (productId: string, variantId: string): Promise<void> =>
  apiClient.delete(`/api/v1/products/${productId}/variants/${variantId}`);

// Images (multipart — bypasses JSON content-type)
export async function uploadProductImage(
  productId: string,
  file: File,
  alt?: string,
  isPrimary?: boolean,
): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  if (alt != null)       form.append('alt', alt);
  if (isPrimary != null) form.append('isPrimary', String(isPrimary));
  await apiClient.upload(`/api/v1/products/${productId}/images`, form);
}

export const deleteProductImage = (productId: string, imageId: string): Promise<void> =>
  apiClient.delete(`/api/v1/products/${productId}/images/${imageId}`);
```

**Step 2: Commit**

```bash
git add lib/api/products.ts
git commit -m "feat(api): add products API functions (CRUD, lifecycle, variants, images)"
```

---

### Task 5: Users API functions

**Files:**
- Create: `lib/api/users.ts`

**Step 1: Create `lib/api/users.ts`**

```ts
import { apiClient } from './client';
import type { ApiUser } from './types';

export const listUsers = (): Promise<ApiUser[]> =>
  apiClient.get('/api/v1/users');

export const getUser = (id: string): Promise<ApiUser> =>
  apiClient.get(`/api/v1/users/${id}`);
```

**Step 2: Commit**

```bash
git add lib/api/users.ts
git commit -m "feat(api): add users API functions"
```

---

### Task 6: Update Jotai store — add auth atoms

**Files:**
- Modify: `lib/store.ts`

**Step 1: Replace full content of `lib/store.ts`**

```ts
import { atom } from 'jotai';
import type { UserMe } from './api/types';

// Navigation
export const activeTabAtom     = atom<string>('products');
export const selectedProductAtom = atom<any>(null);
export const languageAtom      = atom<string>('en');

// Auth (tokens persisted by lib/api/client.ts; user in-memory only)
export const currentUserAtom      = atom<UserMe | null>(null);
export const isAuthenticatedAtom  = atom((get) => get(currentUserAtom) !== null);
```

> Note: `selectedProductAtom` is typed `any` here because `Product` from `mock-data` will be replaced by `ApiProduct` in a later cleanup pass.

**Step 2: Commit**

```bash
git add lib/store.ts
git commit -m "feat(store): add currentUserAtom and isAuthenticatedAtom for real auth"
```

---

### Task 7: Auth hooks

**Files:**
- Create: `lib/hooks/use-auth.ts`

**Step 1: Create `lib/hooks/use-auth.ts`**

```ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { currentUserAtom } from '@/lib/store';
import { login as apiLogin, getMe, logout as apiLogout } from '@/lib/api/auth';
import { getToken } from '@/lib/api/client';
import { showToast } from '@/lib/toast';

export function useLogin() {
  const setCurrentUser = useSetAtom(currentUserAtom);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiLogin(email, password),
    onSuccess: async () => {
      const user = await getMe();
      setCurrentUser(user);
      showToast.success('Access Granted', `Welcome back, ${user.email}`);
    },
    onError: (err: Error) => {
      showToast.error('Login Failed', err.message);
    },
  });
}

export function useLogout() {
  const setCurrentUser = useSetAtom(currentUserAtom);
  const queryClient    = useQueryClient();

  return () => {
    apiLogout();
    setCurrentUser(null);
    queryClient.clear();
    showToast.success('Logged out', 'Secure connection terminated.');
  };
}

// Called once on app mount to restore session from existing localStorage token
export function useInitAuth() {
  const setCurrentUser = useSetAtom(currentUserAtom);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await getMe();
      setCurrentUser(user);
      return user;
    },
    enabled: !!getToken(),   // only run if token exists in localStorage
    retry: false,
    staleTime: Infinity,
  });
}
```

**Step 2: Commit**

```bash
git add lib/hooks/use-auth.ts
git commit -m "feat(hooks): add useLogin, useLogout, useInitAuth"
```

---

### Task 8: Update product hooks to use real API

**Files:**
- Modify: `lib/hooks/use-products.ts`

**Step 1: Replace full content of `lib/hooks/use-products.ts`**

```ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProducts, createProduct, updateProduct,
  deleteProduct, transitionLifecycle,
} from '@/lib/api/products';
import type { CreateProductDto, ProductsListParams, LifecycleTransitionDto } from '@/lib/api/types';

export function useProducts(params: ProductsListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => listProducts(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => createProduct(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateProductDto> }) =>
      updateProduct(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useTransitionLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: LifecycleTransitionDto }) =>
      transitionLifecycle(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

// --- Mock-backed hooks (no real endpoints yet) ---

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
  });
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: () => fetch('/api/sales').then(r => r.json()),
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => fetch('/api/customers').then(r => r.json()),
  });
}
```

**Step 2: Commit**

```bash
git add lib/hooks/use-products.ts
git commit -m "feat(hooks): wire product hooks to real API, keep dashboard/sales/customers on mock"
```

---

### Task 9: Wire LoginView to real auth hook

**Files:**
- Modify: `components/views/login-view.tsx`

**Step 1: Replace the `handleSubmit` function and imports inside `LoginView`**

Add import at top of file (after existing imports):
```ts
import { useLogin } from '@/lib/hooks/use-auth';
```

Replace the `handleSubmit` + state in `LoginView`:
```ts
export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast.error('Login Failed', 'Please provide valid credentials.');
      return;
    }
    login.mutate({ email, password }, {
      onSuccess: () => onLogin({}),
    });
  };

  // Replace isSubmitting with login.isPending everywhere in JSX
```

> In JSX: replace every `isSubmitting` reference with `login.isPending`.

**Step 2: Commit**

```bash
git add components/views/login-view.tsx
git commit -m "feat(login): wire LoginView to real useLogin mutation"
```

---

### Task 10: Update app/page.tsx — use auth store + init session

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace the auth-related state in `app/page.tsx`**

Replace imports:
```ts
import { useAtom, useAtomValue } from 'jotai';
import { activeTabAtom, selectedProductAtom, currentUserAtom } from '@/lib/store';
import { useInitAuth, useLogout } from '@/lib/hooks/use-auth';
```

Remove:
```ts
// DELETE these lines:
import { useAtom } from 'jotai';
import { activeTabAtom, selectedProductAtom } from '@/lib/store';
const [user, setUser] = useState<any>(null);
```

Replace inside `Home()`:
```ts
const [activeTab, setActiveTab]   = useAtom(activeTabAtom);
const [selectedProduct, setSelectedProduct] = useAtom(selectedProductAtom);
const currentUser                 = useAtomValue(currentUserAtom);
const handleLogout                = useLogout();
useInitAuth();   // restores session from localStorage on mount
```

Replace `handleLogin`:
```ts
// DELETE handleLogin — LoginView now calls onLogin({}) after mutation succeeds
// onLogin prop in LoginView just needs to exist for the AnimatePresence guard
```

Update the AnimatePresence guard:
```ts
// Change: {!user ? ... to:
{!currentUser ? ...
```

Update `handleLogout` references — replace `setUser(null)` call with `handleLogout()`:
```ts
// Sidebar and Header onLogout props already receive handleLogout
```

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat(app): replace local user state with Jotai currentUserAtom + useInitAuth"
```

---

### Task 11: Build verification

**Step 1: Run build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no type errors.

If TypeScript errors appear related to `Product` type (from mock-data) still being used in views, the quickest fix is to cast `ApiProduct` where needed:
```ts
// In product-list.tsx or product-detail.tsx, if they still import Product from mock-data:
import type { ApiProduct } from '@/lib/api/types';
// Replace Product references with ApiProduct
```

**Step 2: Commit if build passes**

```bash
git add -A
git commit -m "fix(types): align views to ApiProduct type after API integration"
```

---

## What stays on mock (for now)

| Feature | Endpoint | Why |
|---------|----------|-----|
| Dashboard KPIs | `/api/dashboard` (Next.js mock) | No real endpoint |
| Sales chart | `/api/sales` (Next.js mock) | No real endpoint |
| Customers | `/api/customers` (Next.js mock) | No real endpoint |

When real endpoints exist, update the corresponding `use*` hooks in `lib/hooks/use-products.ts` to point to `apiClient.get(...)`.
