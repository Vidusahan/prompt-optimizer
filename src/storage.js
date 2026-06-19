const HISTORY_KEY_PREFIX = "history:";
const MAX_HISTORY = 10;

export const storage = {
  async get(key) {
    try {
      if (window.storage) {
        const result = await window.storage.get(key);
        return result ? JSON.parse(result.value) : null;
      }
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (window.storage) {
        await window.storage.set(key, serialized);
      } else {
        localStorage.setItem(key, serialized);
      }
    } catch { /* silent fail — history is non-critical */ }
  },
  async list(prefix) {
    try {
      if (window.storage) {
        const result = await window.storage.list(prefix);
        return result?.keys ?? [];
      }
      return Object.keys(localStorage).filter(k => k.startsWith(prefix));
    } catch { return []; }
  },
  async delete(key) {
    try {
      if (window.storage) {
        await window.storage.delete(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch {}
  }
};

export { HISTORY_KEY_PREFIX, MAX_HISTORY };