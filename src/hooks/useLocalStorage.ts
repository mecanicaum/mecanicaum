import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_PREFIX = 'sigc_storage_v2_';

/**
 * Custom React hook that syncs state with browser localStorage with cross-tab listening
 * and automatic serialization / error handling.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const prefixedKey = `${STORAGE_PREFIX}${key}`;

  // Get initial value from localStorage or fallback to default
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }

    try {
      const item = window.localStorage.getItem(prefixedKey);
      if (item !== null && item !== undefined && item !== 'undefined') {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${prefixedKey}":`, error);
    }

    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  }, [prefixedKey, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);
  const isInitialMount = useRef(true);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((current) => {
          const valueToStore = value instanceof Function ? value(current) : value;
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem(prefixedKey, JSON.stringify(valueToStore));
            } catch (storageError) {
              console.warn(`[useLocalStorage] Error saving key "${prefixedKey}":`, storageError);
            }
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`[useLocalStorage] Error updating key "${prefixedKey}":`, error);
      }
    },
    [prefixedKey]
  );

  // Reset to initial value and clear from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(prefixedKey);
      }
      const resetVal = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
      setStoredValue(resetVal);
    } catch (error) {
      console.warn(`[useLocalStorage] Error removing key "${prefixedKey}":`, error);
    }
  }, [prefixedKey, initialValue]);

  // Sync state if localStorage changes from another tab/window
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === prefixedKey && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (e) {
          console.warn(`[useLocalStorage] Cross-tab sync parse error on "${prefixedKey}":`, e);
        }
      } else if (event.key === prefixedKey && event.newValue === null) {
        const resetVal = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
        setStoredValue(resetVal);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [prefixedKey, initialValue]);

  // Initial persistence check
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (typeof window !== 'undefined') {
        const existing = window.localStorage.getItem(prefixedKey);
        if (existing === null || existing === 'undefined') {
          try {
            window.localStorage.setItem(prefixedKey, JSON.stringify(storedValue));
          } catch {}
        }
      }
    }
  }, [prefixedKey, storedValue]);

  return [storedValue, setValue, removeValue];
}
