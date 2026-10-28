import { bearerToken, getSessionStore } from '../../server/sessions';

/** POST /api/logout with a Bearer token. Ends that session; always returns 204. */
export async function POST(request: Request) {
  const token = bearerToken(request);
  if (token) await getSessionStore().delete(token);
  return new Response(null, { status: 204 });
}
