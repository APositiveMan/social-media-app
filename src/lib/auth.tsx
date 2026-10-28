import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { apiRequest } from './api';
import type { Account, Session } from './auth-types';
import { clearToken, loadToken, saveToken } from './tokenStorage';

type AuthState =
  | { status: 'loading'; account: null }
  | { status: 'signedOut'; account: null }
  | { status: 'signedIn'; account: Account };

type AuthContextValue = AuthState & {
  /** Saves a session from signup or login and marks the user as signed in. */
  signIn(session: Session): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Keeps track of the signed-in account and restores it when the app opens. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', account: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await loadToken();
      if (!token) {
        if (!cancelled) setState({ status: 'signedOut', account: null });
        return;
      }

      const result = await apiRequest<{ account: Account }>('/api/me', { token });
      // A 401 means the session ended; forget it. On other failures (e.g.
      // offline) keep the token so the next launch can try again.
      if (!result.ok && result.status === 401) await clearToken();
      if (cancelled) return;
      setState(
        result.ok
          ? { status: 'signedIn', account: result.data.account }
          : { status: 'signedOut', account: null },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn({ token, account }: Session) {
    await saveToken(token);
    setState({ status: 'signedIn', account });
  }

  async function signOut() {
    const token = await loadToken();
    setState({ status: 'signedOut', account: null });
    await clearToken();
    // Best effort: the token is already forgotten locally even if this fails.
    if (token) await apiRequest('/api/logout', { method: 'POST', token });
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
