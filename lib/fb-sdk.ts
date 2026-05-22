declare global {
  interface Window {
    FB: facebook.FacebookStatic;
    fbAsyncInit: () => void;
  }
}

// Minimal type shim for FB SDK methods we use
declare namespace facebook {
  interface FacebookStatic {
    init(params: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
    login(callback: (response: AuthResponse) => void, options?: { scope: string }): void;
  }
  interface AuthResponse {
    status: string;
    authResponse: { accessToken: string; userID: string; expiresIn: number } | null;
  }
}

let sdkReady = false;
let sdkPromise: Promise<void> | null = null;

export function loadFbSdk(): Promise<void> {
  if (sdkReady) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Server-side — cannot load FB SDK'));
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId:   process.env.NEXT_PUBLIC_FB_APP_ID ?? '',
        cookie:  true,
        xfbml:   false,
        version: 'v19.0',
      });
      sdkReady = true;
      resolve();
    };

    const existing = document.getElementById('facebook-jssdk');
    if (existing) return; // already injected by another call

    const script = document.createElement('script');
    script.id   = 'facebook-jssdk';
    script.src  = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.body.appendChild(script);
  });

  return sdkPromise;
}

export function fbLogin(scope: string): Promise<string> {
  return new Promise((resolve, reject) => {
    window.FB.login(response => {
      if (response.authResponse?.accessToken) {
        resolve(response.authResponse.accessToken);
      } else {
        const reason =
          response.status === 'not_authorized'
            ? 'App not authorized — make sure you are a tester/developer of the app'
            : 'Login cancelled';
        reject(new Error(reason));
      }
    }, { scope });
  });
}
