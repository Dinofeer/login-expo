import * as SecureStore from 'expo-secure-store';

export async function saveUser(key, value) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export async function getUser(key) {
  const data = await SecureStore.getItemAsync(key);
  return data ? JSON.parse(data) : null;
}

export async function removeUser(key) {
  await SecureStore.deleteItemAsync(key);
}
