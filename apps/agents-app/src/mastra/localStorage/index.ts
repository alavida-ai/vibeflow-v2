export const localStorageStore = {
  get: (key: string): string | null => {
    return localStorage.get(key);
  },
  set: (key: string, value: string): void => {
    localStorage.set(key, value);
  },
};  