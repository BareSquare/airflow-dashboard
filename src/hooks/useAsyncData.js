import { useCallback, useEffect, useState } from 'react';

/**
 * useAsyncData - small helper for loading states + refresh logic.
 * @param {Function} loader - async function returning data
 * @param {Array} deps - dependencies that should trigger a reload
 */
export const useAsyncData = (loader, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loader();
      setData(result);
    } catch (err) {
      console.error('Failed to load data', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, ...deps]);

  return {
    data,
    loading,
    error,
    reload: execute
  };
};
