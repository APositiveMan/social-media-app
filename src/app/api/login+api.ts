import { type LoginErrors, normalizeLogin, validateLogin } from '../../lib/login';
import { hashPassword, verifyPassword } from '../../server/passwords';
import { getSessionStore } from '../../server/sessions';
import { getUserStore, toAccount } from '../../server/users';

const errorResponse = (errors: LoginErrors, status: number) => Response.json({ errors }, { status });

/** POST /api/login with { identifier, password }, where identifier is an email or username. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse({ form: 'The request wasn’t valid JSON.' }, 400);
  }

  const { identifier, password } = normalizeLogin(body);
  const errors = validateLogin({ identifier, password });
  if (Object.keys(errors).length > 0) return errorResponse(errors, 400);

  const users = getUserStore();
  const user = identifier.includes('@')
    ? await users.findByEmail(identifier.toLowerCase())
    : await users.findByUsername(identifier);

  // Hash anyway when there's no such user, so response time doesn't reveal which accounts exist.
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : (await hashPassword(password), false);
  // One message for both cases, for the same reason.
  if (!user || !valid)
    return errorResponse({ form: 'That email, username, or password isn’t right.' }, 401);

  const token = await getSessionStore().create(user.id);
  return Response.json({ token, account: toAccount(user) });
}
