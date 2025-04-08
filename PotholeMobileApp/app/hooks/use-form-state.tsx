"use client";

import { useState } from "react";

export function useFormState<T extends Record<string, string>>(
  initialState: T
) {
  const [values, setValues] = useState<T>(initialState);
  const [secureTextEntries, setSecureTextEntries] = useState<
    Record<string, boolean>
  >({});

  const handleChange = (field: keyof T) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSecureEntry = (field: string) => () => {
    setSecureTextEntries((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const initSecureTextEntry = (field: string, initialValue = true) => {
    if (secureTextEntries[field] === undefined) {
      setSecureTextEntries((prev) => ({
        ...prev,
        [field]: initialValue,
      }));
    }
  };

  return {
    values,
    handleChange,
    secureTextEntries,
    toggleSecureEntry,
    initSecureTextEntry,
  };
}

// Export as default for backward compatibility
export default useFormState;
