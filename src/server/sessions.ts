import { type Collection, devFileCollection, memoryCollection } from './collection';

/** Only a hash of the token is stored, so a leaked store can't be used to sign in. */
type Session = { tokenHash: string; userId: string; expiresAt: string };

const SESSION_DAYS = 30;

export interface SessionStore {
  /** Starts a session and returns its token, which the client sends as a Bearer token. */
  create(userId: string): Promise<string>;
  /** The user ID for a valid, unexpired token. */
  findUserId(token: string): Promise<string | undefined>;
  delete(token: string): Promise<void>;
}

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return toBase64Url(new Uint8Array(digest));
}

function createSessionStore(sessions: Collection<Session>): SessionStore {
  return {
    async create(userId) {
      const token = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
      const tokenHash = await hashToken(token);
      const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      await sessions.update((items) => ({
        // Drop expired sessions while we're writing anyway.
        items: [...items.filter((s) => s.expiresAt > now), { tokenHash, userId, expiresAt }],
        result: undefined,
      }));
      return token;
    },
    async findUserId(token) {
      const tokenHash = await hashToken(token);
      const now = new Date().toISOString();
      const session = (await sessions.read()).find((s) => s.tokenHash === tokenHash);
      return session && session.expiresAt > now ? session.userId : undefined;
    },
    async delete(token) {
      const tokenHash = await hashToken(token);
      await sessions.update((items) => ({
        items: items.filter((s) => s.tokenHash !== tokenHash),
        result: undefined,
      }));
    },
  };
}

export const createMemorySessionStore = () => createSessionStore(memoryCollection());

let store: SessionStore | undefined;

export function getSessionStore(): SessionStore {
  return (store ??= createSessionStore(
    devFileCollection(process.env.SESSIONS_FILE ?? '.data/sessions.json'),
  ));
}

/** Replaces the store (for tests). */
export function setSessionStore(next: SessionStore) {
  store = next;
}

/** The token from an `Authorization: Bearer <token>` header. */
export function bearerToken(request: Request): string | undefined {
  const match = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/);
  return match?.[1];
}
