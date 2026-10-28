// In-memory stand-in for the device keychain, cleared between tests.
jest.mock('expo-secure-store', () => {
  const items = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => items.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      items.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      items.delete(key);
    }),
    __reset: () => items.clear(),
  };
});

afterEach(() => {
  require('expo-secure-store').__reset();
});
