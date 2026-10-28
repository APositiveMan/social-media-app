import { bearerToken, getSessionStore } from '../../server/sessions';
import { getUserStore, toAccount } from '../../server/users';

/** GET /api/me with a Bearer token. Returns { account } or 401 if the session isn't valid. */
export async function GET(request: Request) {
  const token = bearerToken(request);
  const userId = token && (await getSessionStore().findUserId(token));
  const user = userId && (await getUserStore().findById(userId));
  if (!user) return Response.json({ errors: { form: 'Not signed in.' } }, { status: 401 });

  return Response.json({ account: toAccount(user) });
}
