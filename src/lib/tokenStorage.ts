import * as SecureStore from 'expo-secure-store';

/** The session token lives in the iOS Keychain / Android Keystore. */
const KEY = 'session-token';

export const loadToken = () => SecureStore.getItemAsync(KEY);
export const saveToken = (token: string) => SecureStore.setItemAsync(KEY, token);
export const clearToken = () => SecureStore.deleteItemAsync(KEY);
