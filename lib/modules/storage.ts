import type { ModuleStorage } from "./sdk";

const MODULE_STORAGE_PREFIX = "class-space-module";
const MODULE_STORAGE_EVENT = "class-space-module-storage";

function storageKey(moduleId: string, userId: string, key: string) {
  return `${MODULE_STORAGE_PREFIX}:${moduleId}:${userId}:${key}`;
}

export function createModuleStorage(
  moduleId: string,
  userId: string,
): ModuleStorage {
  return {
    get<T>(key: string, fallback: T): T {
      if (typeof window === "undefined") return fallback;
      const saved = window.localStorage.getItem(
        storageKey(moduleId, userId, key),
      );
      if (saved === null) return fallback;
      try {
        return JSON.parse(saved) as T;
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T) {
      window.localStorage.setItem(
        storageKey(moduleId, userId, key),
        JSON.stringify(value),
      );
      window.dispatchEvent(
        new CustomEvent(MODULE_STORAGE_EVENT, { detail: { moduleId, userId } }),
      );
    },
    remove(key: string) {
      window.localStorage.removeItem(storageKey(moduleId, userId, key));
      window.dispatchEvent(
        new CustomEvent(MODULE_STORAGE_EVENT, { detail: { moduleId, userId } }),
      );
    },
    subscribe(listener: () => void) {
      const handleChange = (event: Event) => {
        const detail = (event as CustomEvent).detail as
          | { moduleId: string; userId: string }
          | undefined;
        if (detail?.moduleId === moduleId && detail.userId === userId) {
          listener();
        }
      };
      window.addEventListener(MODULE_STORAGE_EVENT, handleChange);
      return () =>
        window.removeEventListener(MODULE_STORAGE_EVENT, handleChange);
    },
  };
}
