import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "jwt";

async function isSecureStoreAvailable() {
  if (Platform.OS === "web") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

// Web fallback: localStorage (dev only)
async function getWebItem(key) {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

async function setWebItem(key, value) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

async function deleteWebItem(key) {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export async function getToken() {
  const ok = await isSecureStoreAvailable();
  if (ok) return await SecureStore.getItemAsync(KEY);
  return await getWebItem(KEY);
}

export async function setToken(token) {
  const ok = await isSecureStoreAvailable();
  if (ok) return await SecureStore.setItemAsync(KEY, token);
  return await setWebItem(KEY, token);
}

export async function clearToken() {
  const ok = await isSecureStoreAvailable();
  if (ok) return await SecureStore.deleteItemAsync(KEY);
  return await deleteWebItem(KEY);
}

