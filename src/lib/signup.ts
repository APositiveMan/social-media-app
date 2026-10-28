/** Signup rules and the client call. Shared by the signup screen and the API route. */
import { apiRequest, type FormErrors } from './api';
import type { Session } from './auth-types';

export type SignupInput = { username: string; email: string; password: string };
export type SignupField = keyof SignupInput;
export type SignupErrors = FormErrors<SignupField>;

export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Reads a string field from an untrusted body, or '' if it's missing or not a string. */
export function textField(body: unknown, key: string): string {
  const value = typeof body === 'object' && body !== null ? (body as Record<string, unknown>)[key] : '';
  return typeof value === 'string' ? value : '';
}

/** Trims the username and email, lowercases the email, and drops anything that isn't a string. */
export function normalizeSignup(input: unknown): SignupInput {
  return {
    username: textField(input, 'username').trim(),
    email: textField(input, 'email').trim().toLowerCase(),
    password: textField(input, 'password'),
  };
}

/** Returns a message for each invalid field; an empty object means the input is valid. */
export function validateSignup({ username, email, password }: SignupInput): SignupErrors {
  const errors: SignupErrors = {};

  if (!username) errors.username = 'Choose a username.';
  else if (!USERNAME_PATTERN.test(username))
    errors.username = 'Use 3 to 20 letters, numbers, or underscores.';

  if (!email) errors.email = 'Enter your email address.';
  else if (email.length > 254 || !EMAIL_PATTERN.test(email))
    errors.email = 'That doesn’t look like an email address.';

  if (!password) errors.password = 'Choose a password.';
  else if (password.length < PASSWORD_MIN_LENGTH)
    errors.password = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  else if (password.length > PASSWORD_MAX_LENGTH)
    errors.password = `Use at most ${PASSWORD_MAX_LENGTH} characters.`;

  return errors;
}

/** Creates an account through `/api/signup`; the new account is signed in. */
export const signUp = (input: SignupInput) =>
  apiRequest<Session, SignupField>('/api/signup', { method: 'POST', body: input });
