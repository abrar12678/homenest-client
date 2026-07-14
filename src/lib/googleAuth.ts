declare global {
  interface Window {
    google: any;
  }
}

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.google !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed to load'));
    document.head.appendChild(script);
  });
}

export async function handleGoogleLogin(): Promise<{ user: any; token: string }> {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your_google_client_id_here') {
      reject(new Error('Google Client ID not configured'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          const api = (await import('./api')).default;
          const res = await api.post('/auth/google', { idToken: response.credential });
          resolve(res.data.data);
        } catch (error) {
          reject(error);
        }
      },
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error('Google sign-in was not displayed'));
      }
    });
  });
}