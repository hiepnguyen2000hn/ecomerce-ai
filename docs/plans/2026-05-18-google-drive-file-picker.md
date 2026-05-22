# Google Drive File Picker — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When user selects "Google Drive" in BatchGenerationModal and clicks Create, they can pick any file from Google Drive and the selected file's content + metadata flows into the LandingPageEditor.

**Architecture:** Browser-side only — uses Google Picker API (file selection UI) + Google Identity Services (OAuth token) + Drive REST API (download). No server routes needed. Follows the same dynamic-script-loading pattern as `lib/fb-sdk.ts`.

**Tech Stack:** Google Identity Services (GIS), Google Picker API v3, Google Drive API v3 (`gapi`), React, TypeScript, Next.js App Router.

---

## Credentials the user must provide

| Env var | Where to get it | Notes |
|---------|-----------------|-------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web Application type) | Add `http://localhost:3000` + production URL to **Authorized JavaScript origins** |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Google Cloud Console → APIs & Services → Credentials → Create API Key | Restrict to **Google Drive API** + **Google Picker API** |

**APIs to enable in Google Cloud Console:**
1. Google Drive API
2. Google Picker API

---

### Task 1: Add env variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local` (manual step for user)

**Step 1: Append to `.env.example`**

```
# NEXT_PUBLIC_GOOGLE_CLIENT_ID: OAuth 2.0 Client ID for Google Drive Picker.
# From Google Cloud Console → Credentials → OAuth 2.0 Client IDs.
NEXT_PUBLIC_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"

# NEXT_PUBLIC_GOOGLE_API_KEY: API Key for Google Picker API.
# From Google Cloud Console → Credentials → API Keys.
NEXT_PUBLIC_GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
```

**Step 2: Verify `.env.local` has the real values (user action)**

User adds the real values obtained from Google Cloud Console into `.env.local`.

---

### Task 2: Create `lib/google-drive.ts`

**Files:**
- Create: `lib/google-drive.ts`

This module mirrors the `lib/fb-sdk.ts` pattern: lazy script loading, singleton promise, exported helper functions.

**Step 1: Write the file**

```typescript
// lib/google-drive.ts

// ─── Minimal type shims ────────────────────────────────────────────────────

declare global {
  interface Window {
    gapi: {
      load(features: string, callback: () => void): void;
      client: {
        init(config: { apiKey: string; discoveryDocs: string[] }): Promise<void>;
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken(options?: { prompt?: string }): void };
        };
      };
      picker: {
        PickerBuilder: new () => {
          addView(viewId: string): ReturnType<typeof Object>;
          setOAuthToken(token: string): ReturnType<typeof Object>;
          setDeveloperKey(key: string): ReturnType<typeof Object>;
          setCallback(fn: (data: GooglePickerResponse) => void): ReturnType<typeof Object>;
          build(): { setVisible(v: boolean): void };
        };
        ViewId: { DOCS: string };
        Action: { PICKED: string; CANCEL: string };
      };
    };
  }
}

interface GooglePickerResponse {
  action: string;
  docs?: Array<{ id: string; name: string; mimeType: string }>;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  content: string | ArrayBuffer;
}

// ─── SDK loading ──────────────────────────────────────────────────────────

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const API_KEY   = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '';
const SCOPES    = 'https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let sdkReady    = false;
let sdkPromise: Promise<void> | null = null;

function loadScript(id: string, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement('script');
    s.id  = id;
    s.src = src;
    s.async = true;
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

export function loadGoogleDriveSdk(): Promise<void> {
  if (sdkReady)   return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = (async () => {
    if (typeof window === 'undefined') throw new Error('Server-side — cannot load Google SDK');

    await loadScript('google-gsi-client', 'https://accounts.google.com/gsi/client');
    await loadScript('google-gapi',       'https://apis.google.com/js/api.js');

    await new Promise<void>((resolve) => {
      window.gapi.load('client:picker', async () => {
        await window.gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY] });
        resolve();
      });
    });

    sdkReady = true;
  })();

  return sdkPromise;
}

// ─── OAuth token ──────────────────────────────────────────────────────────

let cachedToken: string | null = null;

function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope:     SCOPES,
      callback:  (res) => {
        if (res.error || !res.access_token) {
          reject(new Error(res.error ?? 'Token request failed'));
          return;
        }
        cachedToken = res.access_token;
        resolve(res.access_token);
      },
    });
    client.requestAccessToken({ prompt: cachedToken ? '' : 'consent' });
  });
}

// ─── Picker ──────────────────────────────────────────────────────────────

function openPicker(token: string): Promise<{ id: string; name: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(token)
      .setDeveloperKey(API_KEY)
      .setCallback((data: GooglePickerResponse) => {
        if (data.action === window.google.picker.Action.PICKED && data.docs?.[0]) {
          resolve(data.docs[0]);
        } else if (data.action === window.google.picker.Action.CANCEL) {
          reject(new Error('cancelled'));
        }
      })
      .build();

    picker.setVisible(true);
  });
}

// ─── Download ────────────────────────────────────────────────────────────

const EXPORT_TYPES: Record<string, string> = {
  'application/vnd.google-apps.document':     'text/plain',
  'application/vnd.google-apps.spreadsheet':  'text/csv',
  'application/vnd.google-apps.presentation': 'text/plain',
};

async function downloadFile(id: string, mimeType: string, token: string): Promise<string | ArrayBuffer> {
  const isGoogleNative = mimeType.startsWith('application/vnd.google-apps.');
  const url = isGoogleNative
    ? `https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=${encodeURIComponent(EXPORT_TYPES[mimeType] ?? 'text/plain')}`
    : `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive download failed: ${res.statusText}`);

  const contentType = res.headers.get('content-type') ?? '';
  return contentType.startsWith('text/') || contentType.includes('json')
    ? res.text()
    : res.arrayBuffer();
}

// ─── Public API ──────────────────────────────────────────────────────────

export async function pickGoogleDriveFile(): Promise<DriveFile> {
  await loadGoogleDriveSdk();
  const token      = await requestAccessToken();
  const fileMeta   = await openPicker(token);
  const content    = await downloadFile(fileMeta.id, fileMeta.mimeType, token);
  return { ...fileMeta, content };
}

export function resetGoogleDriveToken(): void {
  cachedToken = null;
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -40
```

Expected: no errors from `lib/google-drive.ts`.

---

### Task 3: Update `BatchGenerationModal` — Drive flow

**Files:**
- Modify: `components/views/landing-pages/batch-generation-modal.tsx`

The modal needs to:
1. Accept optional `onConfirm(driveFile?: DriveFile)` (replace the void signature)
2. When source is `'drive'` and user clicks Create: call `pickGoogleDriveFile()`, then call `onConfirm(file)`
3. Show loading state + selected filename in UI

**Step 1: Update props interface and add drive state**

Change the existing `onConfirm: () => void` prop to:

```typescript
import { pickGoogleDriveFile, type DriveFile } from '@/lib/google-drive';

interface BatchGenerationModalProps {
  product: ApiProduct;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (driveFile?: DriveFile) => void;  // was: () => void
}
```

Add inside the component (after existing useState calls):

```typescript
const [driveFile, setDriveFile]   = useState<DriveFile | null>(null);
const [driveLoading, setDriveLoading] = useState(false);
const [driveError, setDriveError] = useState<string | null>(null);
```

**Step 2: Replace the Create button's onClick handler**

Replace:
```tsx
<button onClick={onConfirm} ...>
```

With:
```tsx
<button
  onClick={handleCreate}
  disabled={driveLoading}
  ...
>
  {driveLoading ? (
    <div className="relative flex items-center justify-center gap-4">
      <Loader2 size={18} className="animate-spin" />
      <span>Connecting to Drive…</span>
    </div>
  ) : (
    // existing button content unchanged
  )}
</button>
```

Add the handler above the return:
```typescript
const handleCreate = async () => {
  if (source === 'drive') {
    setDriveLoading(true);
    setDriveError(null);
    try {
      const file = await pickGoogleDriveFile();
      setDriveFile(file);
      onConfirm(file);
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      setDriveError(err instanceof Error ? err.message : 'Failed to connect to Google Drive');
    } finally {
      setDriveLoading(false);
    }
  } else {
    onConfirm();
  }
};
```

**Step 3: Show selected file name when drive source is active**

Inside the Drive source card (after the existing `<p>` description), append:

```tsx
{source === 'drive' && driveFile && (
  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider truncate">
    {driveFile.name}
  </p>
)}
{source === 'drive' && driveError && (
  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
    {driveError}
  </p>
)}
```

**Step 4: Add `Loader2` to imports**

```typescript
import { X, Sparkles, ChevronDown, HardDrive, CheckCircle2, Zap, ArrowRight, Loader2 } from 'lucide-react';
```

**Step 5: Verify TypeScript**

```bash
npm run build 2>&1 | head -40
```

---

### Task 4: Update `index.tsx` — pass DriveFile to editor

**Files:**
- Modify: `components/views/landing-pages/index.tsx`

**Step 1: Update state + handler**

```typescript
import type { DriveFile } from '@/lib/google-drive';

// add to component state:
const [driveFile, setDriveFile] = useState<DriveFile | null>(null);
```

Change `handleBatchConfirm`:
```typescript
const handleBatchConfirm = (file?: DriveFile) => {
  if (file) setDriveFile(file);
  setIsBatchModalOpen(false);
  setView('editor');
};
```

Pass to BatchGenerationModal and LandingPageEditor:
```tsx
<BatchGenerationModal
  product={selectedProduct}
  isOpen={isBatchModalOpen}
  onClose={() => setIsBatchModalOpen(false)}
  onConfirm={handleBatchConfirm}
/>

// in editor case:
<LandingPageEditor
  key="editor"
  productId={selectedProduct?.id || '1'}
  driveFile={driveFile}
  onBack={handleBackToList}
/>
```

Also reset driveFile in `handleBackToList`:
```typescript
const handleBackToList = () => {
  setSelectedLP(null);
  setSelectedProduct(null);
  setDriveFile(null);
  setView('list');
};
```

---

### Task 5: Update `LandingPageEditor` — accept DriveFile prop

**Files:**
- Modify: `components/views/landing-pages/editor.tsx`

**Step 1: Add prop**

```typescript
import type { DriveFile } from '@/lib/google-drive';

interface LandingPageEditorProps {
  productId: string;
  driveFile?: DriveFile | null;
  onBack: () => void;
}
```

**Step 2: Show drive file indicator in header** (optional UX improvement)

Inside the editor's header area, after the product SKU badge, add:

```tsx
{driveFile && (
  <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
    <HardDrive size={12} className="text-emerald-600" />
    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 max-w-[120px] truncate">
      {driveFile.name}
    </span>
  </div>
)}
```

Import `HardDrive` from lucide-react (it's already imported there).

**Step 3: Verify TypeScript**

```bash
npm run build 2>&1 | head -40
```

---

### Task 6: Manual smoke test

1. Start dev server: `npm run dev`
2. Navigate to Landing Pages → click Create
3. Select any product
4. In BatchGenerationModal, select "Google Drive"
5. Click Create button
6. Google OAuth popup appears → sign in
7. Google Picker opens → select any file
8. Modal closes, editor opens with file name badge in header
9. Console should show no errors

---

## Summary of files changed

| File | Change |
|------|--------|
| `.env.example` | Add 2 new Google env vars |
| `lib/google-drive.ts` | **New** — SDK loader, OAuth, Picker, download |
| `components/views/landing-pages/batch-generation-modal.tsx` | Drive flow in handleCreate, loading/error states |
| `components/views/landing-pages/index.tsx` | Pass DriveFile through to editor |
| `components/views/landing-pages/editor.tsx` | Accept + display driveFile prop |
