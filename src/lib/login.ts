/** Login rules and the client call. Shared by the login screen and the API route. */
import { apiRequest, type FormErrors } from './api';
import type { Session } from './auth-types';
import { textField } from './signup';

/** `identifier` is an email address or a username. */
export type LoginInput = { identifier: string; password: string };
export type LoginField = keyof LoginInput;
export type LoginErrors = FormErrors<LoginField>;

export const normalizeLogin = (input: unknown): LoginInput => ({
  identifier: textField(input, 'identifier').trim(),
  password: textField(input, 'password'),
});

/** Only checks that both fields are filled in; the server decides if they're right. */
export function validateLogin({ identifier, password }: LoginInput): LoginErrors {
  const errors: LoginErrors = {};
  if (!identifier) errors.identifier = 'Enter your email or username.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export const logIn = (input: LoginInput) =>
  apiRequest<Session, LoginField>('/api/login', { method: 'POST', body: input });
