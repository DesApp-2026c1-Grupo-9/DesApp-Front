import { useState, useCallback, useMemo } from 'react';

const useFilter = ({
  initialFilters = {},
  onFilterChange,
  debounceMs = 300,
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (onFilterChange) {
        const timer = setTimeout(() => {
          onFilterChange(newFilters);
        }, debounceMs);
        setDebounceTimer(timer);
      }

      return newFilters;
    });
  }, [onFilterChange, debounceMs, debounceTimer]);

  const setMultipleFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };

      if (onFilterChange) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => {
          onFilterChange(updated);
        }, debounceMs);
        setDebounceTimer(timer);
      }

      return updated;
    });
  }, [onFilterChange, debounceMs, debounceTimer]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    if (onFilterChange) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      onFilterChange(initialFilters);
    }
  }, [initialFilters, onFilterChange, debounceTimer]);

  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: initialFilters[key] ?? null };
      if (onFilterChange) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => {
          onFilterChange(newFilters);
        }, debounceMs);
        setDebounceTimer(timer);
      }
      return newFilters;
    });
  }, [initialFilters, onFilterChange, debounceMs, debounceTimer]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    }).length;
  }, [filters]);

  const resetDebounce = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  return {
    filters,
    setFilter,
    setMultipleFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
    resetDebounce,
  };
};

export default useFilter;