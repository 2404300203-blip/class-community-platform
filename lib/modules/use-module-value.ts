"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ModuleStorage } from "./sdk";

export function useModuleValue<T>(
  storage: ModuleStorage,
  key: string,
  fallback: T,
): [T, (value: T) => void] {
  const subscribe = useCallback(
    (listener: () => void) => storage.subscribe(listener),
    [storage],
  );
  const getSnapshot = useCallback(
    () => JSON.stringify(storage.get(key, fallback)),
    [fallback, key, storage],
  );
  const serialized = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const value = JSON.parse(serialized) as T;

  return [value, (next) => storage.set(key, next)];
}
