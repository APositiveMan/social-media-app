import type { Account } from '../lib/auth-types';
import { type Collection, devFileCollection, memoryCollection } from './collection';

export type User = Account & { passwordHash: string; createdAt: string };
type NewUser = Omit<User, 'id' | 'createdAt'>;

export class DuplicateUserError extends Error {
  constructor(readonly field: 'username' | 'email') {
    super(`A user with this ${field} already exists`);
  }
}

export interface UserStore {
  /** Adds a user. Throws `DuplicateUserError` if the username or email is taken. */
  create(user: NewUser): Promise<User>;
  findById(id: string): Promise<User | undefined>;
  /** Emails are stored lowercased; pass a lowercased email. */
  findByEmail(email: string): Promise<User | undefined>;
  /** Matches regardless of case. */
  findByUsername(username: string): Promise<User | undefined>;
}

const sameUsername = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

function createUserStore(users: Collection<User>): UserStore {
  const find = async (match: (u: User) => boolean) => (await users.read()).find(match);

  return {
    create: (input) =>
      users.update((items) => {
        if (items.some((u) => sameUsername(u.username, input.username)))
          throw new DuplicateUserError('username');
        if (items.some((u) => u.email === input.email)) throw new DuplicateUserError('email');

        const user: User = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        return { items: [...items, user], result: user };
      }),
    findById: (id) => find((u) => u.id === id),
    findByEmail: (email) => find((u) => u.email === email),
    findByUsername: (username) => find((u) => sameUsername(u.username, username)),
  };
}

export const createMemoryUserStore = () => createUserStore(memoryCollection());

let store: UserStore | undefined;

export function getUserStore(): UserStore {
  return (store ??= createUserStore(
    devFileCollection(process.env.USERS_FILE ?? '.data/users.json'),
  ));
}

/** Replaces the store (for tests). */
export function setUserStore(next: UserStore) {
  store = next;
}

/** The public view of a user: never includes the password hash. */
export const toAccount = ({ id, username, email }: User): Account => ({ id, username, email });
