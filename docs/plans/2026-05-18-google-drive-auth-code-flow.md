# Google Drive Auth Code Flow — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace GIS Token Client (implicit flow) with Authorization Code flow so the server exchanges and stores a refresh_token, enabling server-side Drive file reading without depending on the browser's short-lived access_token.

**Architecture:** Client uses `google.accounts.oauth2.initCodeClient` (popup mode) to get an auth code, sends it to `POST /api/google/auth` which exchanges it for tokens and stores the refresh_token in an httpOnly cookie. When the user picks a file, the client sends only the file ID to `POST /api/google/drive/read` — the server uses the stored refresh_token to obtain a fresh access_token and reads the file itself.

**Tech Stack:** Google Identity Services (GIS) Code Client, Next.js App Router API routes, httpOnly cookies, Google OAuth2 token endpoint, Google Drive REST API v3.

---

## New credential needed

| Env var | Where | Notes |
|---------|-------|-------|
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials → same OAuth 2.0 Client ID | Server-side only — never expose to browser |

---

### Task 1: Add `GOOGLE_CLIENT_SECRET` to `.env.example`

**Files:**
- Modify: `.env.example`

**Step 1: Append**

```
# GOOGLE_CLIENT_SECRET: OAuth 2.0 Client Secret — server-side only.
# From Google Cloud Console → Credentials → same OAuth 2.0 Client ID used for NEXT_PUBLIC_GOOGLE_CLIENT_ID.
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
```

**Step 2: Verify build**
```bash
npm run build 2>&1 | grep -E "(error|✓)"
```

---

### Task 2: Create `app/api/google/auth/route.ts`

Two endpoints:
- `POST /api/google/auth` — exchange auth code → store refresh_token in httpOnly cookie
- `GET /api/google/auth` — check if refresh_token cookie exists (connection status)

**Files:**
- Create: `app/api/google/auth/route.ts`

**Step 1: Write the file**

```typescript
import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL    = 'https://oauth2.googleapis.com/token';
const COOKIE_NAME  = 'google_drive_rt';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

// GET /api/google/auth — connection status
export function GET(req: NextRequest) {
  const connected = req.cookies.has(COOKIE_NAME);
  return NextResponse.json({ connected });
}

// POST /api/google/auth — exchange auth code for tokens
export async function POST(req: NextRequest) {
  const { code } = await req.json() as { code: string };

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const params = new URLSearchParams({
    code,
    client_id:     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirect_uri:  'postmessage',
    grant_type:    'authorization_code',
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  const tokens = await tokenRes.json() as { refresh_token?: string; access_token: string };

  if (!tokens.refresh_token) {
    return NextResponse.json({ error: 'No refresh_token returned — ensure access_type=offline in scope request' }, { status: 502 });
  }

  const res = NextResponse.json({ connected: true });
  res.cookies.set(COOKIE_NAME, tokens.refresh_token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   COOKIE_MAX_AGE,
    path:     '/',
  });
  return res;
}
```

**Step 2: Verify build**
```bash
npm run build 2>&1 | grep -E "(error|✓)"
```

---

### Task 3: Create `app/api/google/drive/read/route.ts`

Server reads the Drive file using the stored refresh_token.

**Files:**
- Create: `app/api/google/drive/read/route.ts`

**Step 1: Write the file**

```typescript
import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL   = 'https://oauth2.googleapis.com/token';
const COOKIE_NAME = 'google_drive_rt';

const EXPORT_TYPES: Record<string, string> = {
  'application/vnd.google-apps.document':     'text/plain',
  'application/vnd.google-apps.spreadsheet':  'text/csv',
  'application/vnd.google-apps.presentation': 'text/plain',
};

async function getAccessToken(refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id:     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    grant_type:    'refresh_token',
  });

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.statusText}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// POST /api/google/drive/read
// Body: { fileId: string, mimeType: string }
// Returns: { content: string } or binary stream
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_NAME)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: 'Not connected to Google Drive' }, { status: 401 });
  }

  const { fileId, mimeType } = await req.json() as { fileId: string; mimeType: string };
  if (!fileId || !mimeType) {
    return NextResponse.json({ error: 'Missing fileId or mimeType' }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(refreshToken);
  } catch {
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 502 });
  }

  const isGoogleNative = mimeType.startsWith('application/vnd.google-apps.');
  const url = isGoogleNative
    ? `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(EXPORT_TYPES[mimeType] ?? 'text/plain')}`
    : `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const driveRes = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!driveRes.ok) {
    return NextResponse.json({ error: `Drive read failed: ${driveRes.statusText}` }, { status: driveRes.status });
  }

  const contentType = driveRes.headers.get('content-type') ?? 'application/octet-stream';

  // Text content — return as JSON { content: string }
  if (contentType.startsWith('text/') || contentType.includes('json')) {
    const text = await driveRes.text();
    return NextResponse.json({ content: text, mimeType: contentType });
  }

  // Binary content — stream through
  return new NextResponse(driveRes.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment`,
    },
  });
}
```

**Step 2: Verify build**
```bash
npm run build 2>&1 | grep -E "(error|✓)"
```

---

### Task 4: Update `lib/google-drive.ts` — switch to Code Client

**Files:**
- Modify: `lib/google-drive.ts`

Replace the entire file. Key changes:
- `initTokenClient` → `initCodeClient` with `ux_mode: 'popup'` and `access_type: 'offline'`
- `connectGoogleDrive()` — new public function: OAuth popup → send code to server
- `checkGoogleDriveConnection()` — check server if already connected
- `pickGoogleDriveFile()` — unchanged (Picker only, no download)
- Remove all download/token caching logic

**Step 1: Rewrite the file**

```typescript
// ─── Minimal type shims ────────────────────────────────────────────────────

declare global {
  interface Window {
    gapi: {
      load(features: string, callback: () => void): void;
    };
    google: {
      accounts: {
        oauth2: {
          initCodeClient(config: {
            client_id: string;
            scope: string;
            ux_mode: 'popup' | 'redirect';
            callback: (response: { code?: string; error?: string }) => void;
          }): { requestCode(): void };
        };
      };
      picker: {
        PickerBuilder: new () => {
          addView(viewId: string): ReturnType<typeof Object>;
          setOAuthToken(token: string): ReturnType<typeof Object>;
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

// File metadata only — content is read server-side using the id
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

// ─── SDK loading ──────────────────────────────────────────────────────────

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const SCOPES    = 'https://www.googleapis.com/auth/drive.readonly';

let sdkReady    = false;
let sdkPromise: Promise<void> | null = null;

function loadScript(id: string, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement('script');
    s.id    = id;
    s.src   = src;
    s.async = true;
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

async function loadSdk(): Promise<void> {
  if (sdkReady)   return;
  if (sdkPromise) return sdkPromise;

  sdkPromise = (async () => {
    if (typeof window === 'undefined') throw new Error('Server-side — cannot load Google SDK');
    await loadScript('google-gsi-client', 'https://accounts.google.com/gsi/client');
    await loadScript('google-gapi',       'https://apis.google.com/js/api.js');
    await new Promise<void>((resolve) => {
      window.gapi.load('picker', () => resolve());
    });
    sdkReady = true;
  })();

  return sdkPromise;
}

// ─── Auth Code flow ───────────────────────────────────────────────────────

export async function checkGoogleDriveConnection(): Promise<boolean> {
  const res = await fetch('/api/google/auth');
  const data = await res.json() as { connected: boolean };
  return data.connected;
}

export async function connectGoogleDrive(): Promise<void> {
  await loadSdk();

  const code = await new Promise<string>((resolve, reject) => {
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope:     SCOPES,
      ux_mode:   'popup',
      callback:  (res) => {
        if (res.error || !res.code) {
          reject(new Error(res.error ?? 'OAuth failed'));
          return;
        }
        resolve(res.code);
      },
    });
    client.requestCode();
  });

  const res = await fetch('/api/google/auth', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code }),
  });

  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error ?? 'Failed to connect Google Drive');
  }
}

// ─── Picker ──────────────────────────────────────────────────────────────
// Requires a short-lived access_token just for the Picker UI.
// We request a token-flow token (not stored) only to open the Picker popup.

export async function pickGoogleDriveFile(): Promise<DriveFile> {
  await loadSdk();

  // Get a short-lived token just for the Picker UI (does not need server storage)
  const pickerToken = await new Promise<string>((resolve, reject) => {
    // initCodeClient returns code — but Picker needs an access_token.
    // We use a separate minimal token request via implicit grant just for the UI.
    // The actual file READ is done server-side using the stored refresh_token.
    const tokenClient = (window.google.accounts.oauth2 as any).initTokenClient({
      client_id: CLIENT_ID,
      scope:     SCOPES,
      callback:  (res: { access_token?: string; error?: string }) => {
        if (res.error || !res.access_token) {
          reject(new Error(res.error ?? 'Token request failed'));
          return;
        }
        resolve(res.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: '' });
  });

  return new Promise((resolve, reject) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(pickerToken)
      .setCallback((data: GooglePickerResponse) => {
        if (data.action === window.google.picker.Action.PICKED && data.docs?.[0]) {
          const { id, name, mimeType } = data.docs[0];
          resolve({ id, name, mimeType });
        } else if (data.action === window.google.picker.Action.CANCEL) {
          reject(new Error('cancelled'));
        }
      })
      .build();

    picker.setVisible(true);
  });
}
```

**Step 2: Verify build**
```bash
npm run build 2>&1 | grep -E "(error|✓)"
```

---

### Task 5: Update `BatchGenerationModal` — two-step Drive UI

When source is `'drive'`, show a two-step flow:
1. **Connect** — "Connect Google Account" button → `connectGoogleDrive()`
2. **Pick** — "Pick File" button → `pickGoogleDriveFile()`

Only after both steps does Create become active.

**Files:**
- Modify: `components/views/landing-pages/batch-generation-modal.tsx`

**Step 1: Add drive connection state + check on source change**

Replace existing drive state block:
```typescript
import { connectGoogleDrive, checkGoogleDriveConnection, pickGoogleDriveFile, type DriveFile } from '@/lib/google-drive';

// replace drive state
const [driveConnected, setDriveConnected] = useState(false);
const [driveFile,      setDriveFile]      = useState<DriveFile | null>(null);
const [driveLoading,   setDriveLoading]   = useState(false);
const [driveError,     setDriveError]     = useState<string | null>(null);

// check connection status when user switches to drive source
useEffect(() => {
  if (source !== 'drive') return;
  checkGoogleDriveConnection().then(setDriveConnected).catch(() => {});
}, [source]);
```

**Step 2: Add connect + pick handlers**

```typescript
const handleConnectDrive = async () => {
  setDriveLoading(true);
  setDriveError(null);
  try {
    await connectGoogleDrive();
    setDriveConnected(true);
  } catch (err) {
    setDriveError(err instanceof Error ? err.message : 'Connection failed');
  } finally {
    setDriveLoading(false);
  }
};

const handlePickFile = async () => {
  setDriveLoading(true);
  setDriveError(null);
  try {
    const file = await pickGoogleDriveFile();
    setDriveFile(file);
  } catch (err) {
    if (err instanceof Error && err.message === 'cancelled') return;
    setDriveError(err instanceof Error ? err.message : 'Failed to pick file');
  } finally {
    setDriveLoading(false);
  }
};

const handleCreate = async () => {
  if (source === 'drive') {
    if (!driveFile) {
      setDriveError('Please pick a file first');
      return;
    }
    onConfirm(driveFile);
  } else {
    onConfirm();
  }
};
```

**Step 3: Replace Drive source card content to show two-step UI**

After the existing source grid `</div>`, replace the old status display with:

```tsx
{source === 'drive' && (
  <div className="space-y-3 px-1">
    {/* Step 1: Connect */}
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
        driveConnected ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500"
      )}>
        {driveConnected ? <Check size={12} strokeWidth={3} /> : '1'}
      </div>
      {driveConnected ? (
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Google Account Connected</span>
      ) : (
        <button
          onClick={handleConnectDrive}
          disabled={driveLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50"
        >
          {driveLoading && !driveConnected ? <Loader2 size={11} className="animate-spin" /> : <HardDrive size={11} />}
          Connect Google Account
        </button>
      )}
    </div>

    {/* Step 2: Pick file */}
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
        driveFile ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500"
      )}>
        {driveFile ? <Check size={12} strokeWidth={3} /> : '2'}
      </div>
      {driveFile ? (
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest truncate max-w-[200px]">{driveFile.name}</span>
      ) : (
        <button
          onClick={handlePickFile}
          disabled={!driveConnected || driveLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {driveLoading && driveConnected ? <Loader2 size={11} className="animate-spin" /> : <HardDrive size={11} />}
          Pick File from Drive
        </button>
      )}
    </div>

    {driveError && (
      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{driveError}</p>
    )}
  </div>
)}
```

**Step 4: Add `Check` to lucide imports**
```typescript
import { X, Sparkles, ChevronDown, HardDrive, CheckCircle2, Zap, ArrowRight, Loader2, Check } from 'lucide-react';
```

**Step 5: Update Create button — disable when drive file not selected**

```tsx
<button
  onClick={handleCreate}
  disabled={driveLoading || (source === 'drive' && !driveFile)}
  className="... disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
>
```

**Step 6: Verify build**
```bash
npm run build 2>&1 | grep -E "(error|✓)"
```

---

## Summary of files changed

| File | Change |
|------|--------|
| `.env.example` | Add `GOOGLE_CLIENT_SECRET` |
| `app/api/google/auth/route.ts` | **New** — POST exchange code, GET connection status |
| `app/api/google/drive/read/route.ts` | **New** — POST read Drive file server-side |
| `lib/google-drive.ts` | Switch to `initCodeClient`, add `connectGoogleDrive()` + `checkGoogleDriveConnection()` |
| `components/views/landing-pages/batch-generation-modal.tsx` | Two-step Drive UI (Connect → Pick) |

## Note on Picker token

The Picker UI (browser widget) requires an OAuth **access_token** to display the user's files. Since our main flow now uses Auth Code (which gives the server a refresh_token but not the browser a token), `pickGoogleDriveFile()` uses a separate `initTokenClient` call purely for the Picker popup. This is intentional — the token is short-lived, never sent to any server, and only used to render the file browser UI. The actual file content is read server-side via the stored refresh_token.
