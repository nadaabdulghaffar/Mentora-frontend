import { useState, useCallback } from 'react';

/**
 * Custom hook for managing expanded/collapsed items
 * @returns {Object} - expandedIds, toggleItem, collapseAll
 */
export const useExpandableList = () => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleItem = useCallback((itemId: string) => {
    setExpandedIds((prev) => 
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedIds([]);
  }, []);

  const expandAll = useCallback((itemIds: string[]) => {
    setExpandedIds(itemIds);
  }, []);

  return { expandedIds, toggleItem, collapseAll, expandAll };
};
