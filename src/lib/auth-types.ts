/** What the server returns about an account. Never includes the password. */
export type Account = { id: string; username: string; email: string };

/** A signed-in session: the token to send as `Authorization: Bearer <token>`. */
export type Session = { token: string; account: Account };
