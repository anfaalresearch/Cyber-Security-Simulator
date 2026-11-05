import { useState, useEffect, useCallback } from "react";

/**
 * Persist state to localStorage with SSR-safe initialization
 */
export const useLocalStorage = (key, initialValue) => {
  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback(
  (value) => {
    try {
      const currentValue = readValue();
      const valueToStore =
        value instanceof Function ? value(currentValue) : value;

      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error saving localStorage key "${key}":`, error);
    }
  },
  [key]
);

  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  return [storedValue, setValue];
};
