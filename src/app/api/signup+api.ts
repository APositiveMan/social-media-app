import { normalizeSignup, type SignupErrors, validateSignup } from '../../lib/signup';
import { hashPassword } from '../../server/passwords';
import { getSessionStore } from '../../server/sessions';
import { DuplicateUserError, getUserStore, toAccount } from '../../server/users';

const errorResponse = (errors: SignupErrors, status: number) => Response.json({ errors }, { status });

/** POST /api/signup with { username, email, password }. Returns 201 { token, account }. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse({ form: 'The request wasn’t valid JSON.' }, 400);
  }

  const input = normalizeSignup(body);
  const errors = validateSignup(input);
  if (Object.keys(errors).length > 0) return errorResponse(errors, 400);

  try {
    const user = await getUserStore().create({
      username: input.username,
      email: input.email,
      passwordHash: await hashPassword(input.password),
    });
    const token = await getSessionStore().create(user.id);
    return Response.json({ token, account: toAccount(user) }, { status: 201 });
  } catch (error) {
    if (!(error instanceof DuplicateUserError)) throw error;
    return errorResponse(
      error.field === 'username'
        ? { username: 'That username is taken.' }
        : { email: 'An account with this email already exists.' },
      409,
    );
  }
}
