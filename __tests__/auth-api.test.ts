/**
 * @jest-environment node
 */
import { POST as login } from '../src/app/api/login+api';
import { POST as logout } from '../src/app/api/logout+api';
import { GET as me } from '../src/app/api/me+api';
import { POST as signup } from '../src/app/api/signup+api';
import { devFileCollection } from '../src/server/collection';
import { hashPassword, verifyPassword } from '../src/server/passwords';
import { createMemorySessionStore, setSessionStore } from '../src/server/sessions';
import { createMemoryUserStore, setUserStore, type UserStore } from '../src/server/users';

const valid = { username: 'quiet_reader', email: 'Reader@Example.com', password: 'long enough' };

function request(path: string, { body, token }: { body?: unknown; token?: string } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Request(`http://localhost${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const post = (body: unknown) => signup(request('/api/signup', { body }));
const postLogin = (body: unknown) => login(request('/api/login', { body }));
const getMe = (token?: string) => me(request('/api/me', { token }));

let users: UserStore;
beforeEach(() => {
  users = createMemoryUserStore();
  setUserStore(users);
  setSessionStore(createMemorySessionStore());
});

describe('POST /api/signup', () => {
  it('creates an account, signs it in, and never returns or stores the plain password', async () => {
    const response = await post(valid);
    expect(response.status).toBe(201);

    const { account, token } = await response.json();
    expect(account).toEqual({ id: expect.any(String), username: 'quiet_reader', email: 'reader@example.com' });
    expect((await (await getMe(token)).json()).account).toEqual(account);

    const saved = await users.findByEmail('reader@example.com');
    expect(saved?.passwordHash).not.toContain(valid.password);
    expect(await verifyPassword(valid.password, saved!.passwordHash)).toBe(true);
  });

  it('rejects invalid fields with a message for each', async () => {
    const response = await post({ username: 'a!', email: 'nope', password: 'short' });
    expect(response.status).toBe(400);
    const { errors } = await response.json();
    expect(Object.keys(errors).sort()).toEqual(['email', 'password', 'username']);
  });

  it('rejects a body that is not JSON', async () => {
    expect((await post('not json')).status).toBe(400);
  });

  it('rejects a taken username, ignoring case', async () => {
    await post(valid);
    const response = await post({ ...valid, username: 'QUIET_READER', email: 'other@example.com' });
    expect(response.status).toBe(409);
    expect((await response.json()).errors).toHaveProperty('username');
  });

  it('rejects a taken email, ignoring case', async () => {
    await post(valid);
    const response = await post({ ...valid, username: 'someone_else', email: 'READER@example.com' });
    expect(response.status).toBe(409);
    expect((await response.json()).errors).toHaveProperty('email');
  });

  it('lets only one of two simultaneous signups with the same email through', async () => {
    const statuses = await Promise.all([
      post(valid).then((r) => r.status),
      post({ ...valid, username: 'second' }).then((r) => r.status),
    ]);
    expect(statuses.sort()).toEqual([201, 409]);
  });
});

describe('POST /api/login', () => {
  beforeEach(async () => {
    await post(valid);
  });

  it.each([
    ['email, any case', 'READER@example.com'],
    ['username, any case', 'Quiet_Reader'],
  ])('signs in with the %s', async (_, identifier) => {
    const response = await postLogin({ identifier, password: valid.password });
    expect(response.status).toBe(200);

    const { token, account } = await response.json();
    expect(account.username).toBe('quiet_reader');
    expect((await getMe(token)).status).toBe(200);
  });

  it('gives the same answer for a wrong password and an unknown account', async () => {
    const wrongPassword = await postLogin({ identifier: 'quiet_reader', password: 'not it at all' });
    const unknownUser = await postLogin({ identifier: 'nobody', password: valid.password });

    expect(wrongPassword.status).toBe(401);
    expect(unknownUser.status).toBe(401);
    expect(await wrongPassword.json()).toEqual(await unknownUser.json());
  });

  it('asks for missing fields', async () => {
    const response = await postLogin({ identifier: '  ' });
    expect(response.status).toBe(400);
    expect(Object.keys((await response.json()).errors).sort()).toEqual(['identifier', 'password']);
  });
});

describe('GET /api/me and POST /api/logout', () => {
  it('rejects a missing or unknown token', async () => {
    expect((await getMe()).status).toBe(401);
    expect((await getMe('made-up')).status).toBe(401);
  });

  it('ends only the session that logs out', async () => {
    await post(valid);
    const phone = (await (await postLogin({ identifier: 'quiet_reader', password: valid.password })).json()).token;
    const laptop = (await (await postLogin({ identifier: 'quiet_reader', password: valid.password })).json()).token;

    expect((await logout(request('/api/logout', { body: {}, token: phone }))).status).toBe(204);

    expect((await getMe(phone)).status).toBe(401);
    expect((await getMe(laptop)).status).toBe(200);
  });
});

describe('password hashing', () => {
  it('salts each hash and rejects the wrong password', async () => {
    const [a, b] = await Promise.all([hashPassword('secret pass'), hashPassword('secret pass')]);
    expect(a).not.toBe(b);
    expect(await verifyPassword('secret pass', a)).toBe(true);
    expect(await verifyPassword('wrong pass', a)).toBe(false);
  });
});

describe('release safety', () => {
  it('refuses to use the development file store in production', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      expect(() => devFileCollection('.data/users.json')).toThrow(/No production database/);
    } finally {
      process.env.NODE_ENV = original;
    }
  });
});
