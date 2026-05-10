import { useState, useCallback } from 'react';

/**
 * Custom hook for managing a list of toggled items
 * @returns {Object} - toggledItems, toggleItem, isItemToggled
 */
export const useToggleList = () => {
  const [toggledItems, setToggledItems] = useState<string[]>([]);

  const toggleItem = useCallback((itemId: string) => {
    setToggledItems((prev) => 
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const isItemToggled = useCallback((itemId: string) => {
    return toggledItems.includes(itemId);
  }, [toggledItems]);

  return { toggledItems, toggleItem, isItemToggled };
};
