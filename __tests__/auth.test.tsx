import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import * as SecureStore from 'expo-secure-store';

import RootLayout from '../src/app/_layout';
import WelcomeScreen from '../src/app/index';
import LoginScreen from '../src/app/login';
import SignupScreen from '../src/app/signup';
import StoryScreen from '../src/app/story';

const routes = {
  _layout: RootLayout,
  index: WelcomeScreen,
  signup: SignupScreen,
  login: LoginScreen,
  story: StoryScreen,
};

const account = { id: '1', username: 'quiet_reader', email: 'reader@example.com' };

type Reply = { status: number; body?: unknown } | 'offline';

/** Answers each `fetch` by path. */
function mockServer(replies: Record<string, Reply>) {
  const fetchMock = jest.fn(async (path: string) => {
    const reply = replies[path];
    if (!reply) throw new Error(`Unexpected request to ${path}`);
    if (reply === 'offline') throw new TypeError('Network request failed');
    return {
      ok: reply.status >= 200 && reply.status < 300,
      status: reply.status,
      json: async () => reply.body ?? {},
    };
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const sentBody = (fetchMock: jest.Mock, path: string) =>
  JSON.parse(fetchMock.mock.calls.find(([p]) => p === path)![1].body);

async function fill(fields: Record<string, string>) {
  for (const [label, text] of Object.entries(fields))
    await fireEvent.changeText(screen.getByLabelText(label), text);
}

describe('signup', () => {
  it('is reachable from the welcome screen', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    await fireEvent.press(await screen.findByText('Create an account'));
    expect(screen.getByLabelText('Username')).toBeTruthy();
  });

  it('shows field errors without calling the server when the form is invalid', async () => {
    const fetchMock = mockServer({});
    await renderRouter(routes, { initialUrl: '/signup' });

    await fireEvent.press(screen.getByText('Create account'));

    expect(screen.getByText('Choose a username.')).toBeTruthy();
    expect(screen.getByText('Enter your email address.')).toBeTruthy();
    expect(screen.getByText('Choose a password.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the cleaned-up form, signs in, and welcomes the new account', async () => {
    const fetchMock = mockServer({ '/api/signup': { status: 201, body: { token: 't1', account } } });
    await renderRouter(routes, { initialUrl: '/signup' });

    await fill({ Username: ' quiet_reader ', Email: 'Reader@Example.com', Password: 'long enough' });
    await fireEvent.press(screen.getByText('Create account'));

    expect(await screen.findByText('Welcome, quiet_reader.')).toBeTruthy();
    expect(sentBody(fetchMock, '/api/signup')).toEqual({
      username: 'quiet_reader',
      email: 'reader@example.com',
      password: 'long enough',
    });
    expect(await SecureStore.getItemAsync('session-token')).toBe('t1');
  });

  it('shows errors the server returns', async () => {
    mockServer({ '/api/signup': { status: 409, body: { errors: { username: 'That username is taken.' } } } });
    await renderRouter(routes, { initialUrl: '/signup' });

    await fill({ Username: 'quiet_reader', Email: 'reader@example.com', Password: 'long enough' });
    await fireEvent.press(screen.getByText('Create account'));

    expect(await screen.findByText('That username is taken.')).toBeTruthy();
  });

  it('explains when the server cannot be reached', async () => {
    mockServer({ '/api/signup': 'offline' });
    await renderRouter(routes, { initialUrl: '/signup' });

    await fill({ Username: 'quiet_reader', Email: 'reader@example.com', Password: 'long enough' });
    await fireEvent.press(screen.getByText('Create account'));

    expect(await screen.findByText(/Couldn’t reach the server/)).toBeTruthy();
  });
});

describe('login', () => {
  it('asks for both fields before calling the server', async () => {
    const fetchMock = mockServer({});
    await renderRouter(routes, { initialUrl: '/login' });

    await fireEvent.press(screen.getAllByText('Log in').at(-1)!);

    expect(screen.getByText('Enter your email or username.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logs in from the welcome screen and shows who is signed in', async () => {
    const fetchMock = mockServer({ '/api/login': { status: 200, body: { token: 't2', account } } });
    await renderRouter(routes, { initialUrl: '/' });

    await fireEvent.press(await screen.findByText('Log in'));
    await fill({ 'Email or username': ' quiet_reader ', Password: 'long enough' });
    await fireEvent.press(screen.getAllByText('Log in').at(-1)!);

    expect(await screen.findByText('Signed in as quiet_reader')).toBeTruthy();
    expect(sentBody(fetchMock, '/api/login')).toEqual({
      identifier: 'quiet_reader',
      password: 'long enough',
    });
    expect(await SecureStore.getItemAsync('session-token')).toBe('t2');
  });

  it('shows the server’s message for a wrong password', async () => {
    mockServer({
      '/api/login': { status: 401, body: { errors: { form: 'That email, username, or password isn’t right.' } } },
    });
    await renderRouter(routes, { initialUrl: '/login' });

    await fill({ 'Email or username': 'quiet_reader', Password: 'wrong one' });
    await fireEvent.press(screen.getAllByText('Log in').at(-1)!);

    expect(await screen.findByText('That email, username, or password isn’t right.')).toBeTruthy();
  });
});

describe('saved session', () => {
  it('restores the account when the app opens, and logging out forgets it', async () => {
    await SecureStore.setItemAsync('session-token', 'saved');
    const fetchMock = mockServer({
      '/api/me': { status: 200, body: { account } },
      '/api/logout': { status: 204 },
    });
    await renderRouter(routes, { initialUrl: '/' });

    expect(await screen.findByText('Signed in as quiet_reader')).toBeTruthy();
    await fireEvent.press(screen.getByText('Log out'));

    expect(await screen.findByText('Create an account')).toBeTruthy();
    expect(await SecureStore.getItemAsync('session-token')).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/logout',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer saved' }) }),
    );
  });

  it('forgets a token the server no longer accepts', async () => {
    await SecureStore.setItemAsync('session-token', 'expired');
    mockServer({ '/api/me': { status: 401 } });
    await renderRouter(routes, { initialUrl: '/' });

    expect(await screen.findByText('Create an account')).toBeTruthy();
    expect(await SecureStore.getItemAsync('session-token')).toBeNull();
  });
});
