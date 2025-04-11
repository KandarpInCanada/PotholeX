"use client";

/**
 * Custom hook for managing form state with support for secure text entries
 *
 * This hook provides a complete solution for handling form input values and
 * secure text entries (like passwords) in React Native forms. It manages:
 *
 * - Form values with type safety
 * - Secure text entry toggling (show/hide passwords)
 * - Change handlers for form fields
 *
 * @template T - Record type containing string field values
 */
import { useState } from "react";

export function useFormState<T extends Record<string, string>>(
  initialState: T
) {
  // State for form field values
  const [values, setValues] = useState<T>(initialState);

  // State to track which fields should be displayed as secure text (password fields)
  const [secureTextEntries, setSecureTextEntries] = useState<
    Record<string, boolean>
  >({});

  /**
   * Creates a change handler for a specific form field
   *
   * @param field - The key of the field in the form state
   * @returns A function that updates the specified field's value
   */
  const handleChange = (field: keyof T) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Toggles the secure text entry state for a specific field
   * Used for password visibility toggling
   *
   * @param field - The field name to toggle secure entry for
   * @returns A function that toggles the secure entry state when called
   */
  const toggleSecureEntry = (field: string) => () => {
    setSecureTextEntries((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  /**
   * Initializes the secure text entry state for a field
   * Sets the initial visibility state for password fields
   *
   * @param field - The field name to initialize
   * @param initialValue - Whether the field should start as secure (hidden), defaults to true
   */
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
