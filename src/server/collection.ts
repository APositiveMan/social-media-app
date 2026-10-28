import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * A list of records with serialized writes, so read-check-write sequences
 * (like "is this email taken?") can't race each other.
 */
export interface Collection<T> {
  read(): Promise<T[]>;
  /** Runs `change` on the current items and saves the items it returns. */
  update<R>(change: (items: T[]) => { items: T[]; result: R }): Promise<R>;
}

function createCollection<T>(
  load: () => Promise<T[]>,
  save: (items: T[]) => Promise<void>,
): Collection<T> {
  let queue: Promise<unknown> = Promise.resolve();

  return {
    read: load,
    update(change) {
      const run = queue.then(async () => {
        const { items, result } = change(await load());
        await save(items);
        return result;
      });
      queue = run.catch(() => {});
      return run;
    },
  };
}

/** In-memory collection, used by tests. */
export function memoryCollection<T>(): Collection<T> {
  let items: T[] = [];
  return createCollection(
    async () => items,
    async (next) => {
      items = next;
    },
  );
}

/**
 * Stores records in a JSON file. FOR LOCAL DEVELOPMENT ONLY: EAS Hosting has no
 * writable disk, so the app must not be released until a real database
 * replaces this. It throws in production builds on purpose; don't remove that.
 */
export function devFileCollection<T>(path: string): Collection<T> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'No production database is configured. The JSON file store is for development only. ' +
        'See "Before release" in README.md.',
    );
  }

  return createCollection(
    async () => {
      try {
        return JSON.parse(await readFile(path, 'utf8')) as T[];
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw error;
      }
    },
    async (items) => {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, JSON.stringify(items, null, 2));
    },
  );
}
