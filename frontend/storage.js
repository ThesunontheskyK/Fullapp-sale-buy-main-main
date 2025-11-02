import * as SecureStore from 'expo-secure-store';

export async function setItem(key, value) {
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key) {
  const value = await SecureStore.getItemAsync(key);
  return value; // null ถ้าไม่มี key
}

export async function deleteItem(key) {
  await SecureStore.deleteItemAsync(key);
}