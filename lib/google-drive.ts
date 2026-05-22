// ─── Minimal type shims ────────────────────────────────────────────────────

declare global {
  interface Window {
    gapi: {
      load(features: string, callback: () => void): void;
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken(options?: { prompt?: string }): void };
          initCodeClient(config: {
            client_id: string;
            scope: string;
            ux_mode: 'popup';
            redirect_uri: 'postmessage';
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

export function loadGoogleDriveSdk(): Promise<void> {
  if (sdkReady)   return Promise.resolve();
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

export async function pickGoogleDriveFile(): Promise<DriveFile> {
  await loadGoogleDriveSdk();
  const token = await requestAccessToken();
  console.log('[GDrive] access_token obtained:', token);

  return new Promise((resolve, reject) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(token)
      .setCallback((data: GooglePickerResponse) => {
        console.log('[GDrive] picker callback fired, action:', data.action, 'full data:', data);
        if (data.action === window.google.picker.Action.PICKED && data.docs?.[0]) {
          const { id, name, mimeType } = data.docs[0];
          console.log('[GDrive] file picked:', { id, name, mimeType });
          resolve({ id, name, mimeType });
        } else if (data.action === window.google.picker.Action.CANCEL) {
          console.log('[GDrive] picker cancelled');
          reject(new Error('cancelled'));
        }
      })
      .build();

    picker.setVisible(true);
  });
}

export function resetGoogleDriveToken(): void {
  cachedToken = null;
}

// ─── Authorization Code flow (for lp-batch API) ───────────────────────────

function requestAuthorizationCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      ux_mode: 'popup',
      redirect_uri: 'postmessage',
      callback: (res) => {
        if (res.error || !res.code) {
          reject(new Error(res.error ?? 'Auth code request failed'));
          return;
        }
        resolve(res.code);
      },
    });
    client.requestCode();
  });
}

export async function pickGoogleDriveFileWithCode(): Promise<{ authCode: string; file: DriveFile }> {
  await loadGoogleDriveSdk();
  const authCode = await requestAuthorizationCode();
  const token = await requestAccessToken();

  const file = await new Promise<DriveFile>((resolve, reject) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(token)
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

  return { authCode, file };
}
