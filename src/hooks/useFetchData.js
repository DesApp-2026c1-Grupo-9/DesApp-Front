import { useState, useEffect, useCallback, useRef } from 'react';

const useFetchData = ({
  fetchFn,
  deps = [],
  immediate = true,
  timeout = 30000,
  onSuccess,
  onError,
  keepPreviousData = false,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const executeFetch = useCallback(async (isRetry = false) => {
    if (!fetchFn) return;

    clearTimeouts();
    setError(null);
    setTimeoutReached(false);

    if (!isRetry && !keepPreviousData) {
      setLoading(true);
    }

    abortControllerRef.current = new AbortController();

    if (timeout && mountedRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && loading) {
          setTimeoutReached(true);
        }
      }, timeout);
    }

    try {
      const result = await fetchFn(abortControllerRef.current.signal);

      if (mountedRef.current) {
        setData(result);
        setLoading(false);
        clearTimeouts();
        if (onSuccess) onSuccess(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          return;
        }
        setError(err.response?.data?.message || err.message || 'Error en la solicitud');
        setLoading(false);
        clearTimeouts();
        if (onError) onError(err);
      }
    }
  }, [fetchFn, timeout, onSuccess, onError, keepPreviousData, clearTimeouts, loading]);

  const refetch = useCallback(() => {
    return executeFetch(true);
  }, [executeFetch]);

  const reset = useCallback(() => {
    clearTimeouts();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setData(null);
    setLoading(false);
    setError(null);
    setTimeoutReached(false);
  }, [clearTimeouts]);

  useEffect(() => {
    mountedRef.current = true;

    if (immediate) {
      executeFetch();
    }

    return () => {
      mountedRef.current = false;
      clearTimeouts();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, deps);

  return {
    data,
    loading,
    error,
    timeoutReached,
    refetch,
    reset,
    setData,
    setError,
  };
};

export default useFetchData;