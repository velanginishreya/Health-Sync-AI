import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

/*
  v3 data layer. The API itself is unchanged (FastAPI under /api/v1, proxied by
  Vite in dev, JWT header set globally by AuthContext). What v3 adds over v2:

  - four tiny verb helpers that unwrap `res.data`, so pages never touch axios
    response envelopes;
  - `errorText`, which turns any thrown axios error into one human sentence
    (401, offline, FastAPI `detail` string, or a pydantic 422 array);
  - `useLoad`, which removes the copied useEffect/alive-guard/refetch boilerplate
    from every page while keeping the unmount guard v2 pages hand-rolled.
*/

export const get = (url, config) => axios.get(url, config).then((res) => res.data);
export const post = (url, body, config) => axios.post(url, body, config).then((res) => res.data);
export const put = (url, body, config) => axios.put(url, body, config).then((res) => res.data);
export const del = (url, config) => axios.delete(url, config).then((res) => res.data);

export const errorText = (error, fallback = 'That did not go through. Try again.') => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  const status = error?.response?.status;
  if (status === 401) return 'Your session has expired. Sign in again.';
  if (status === 403) return 'You do not have access to that record.';
  if (status === 413) return 'That file is too large to upload.';
  if (!error?.response) return 'The server is not responding right now.';
  return fallback;
};

/**
 * useLoad(loader, deps) -> { data, error, loading, reload, setData }
 *
 * Loads on mount and whenever `deps` change. `reload({ quiet: true })` refetches
 * without flashing the skeleton again (used after mutations). The result of the
 * last call wins, and state never updates after unmount.
 */
export function useLoad(loader, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const requestId = useRef(0);

  /* eslint-disable react-hooks/exhaustive-deps */
  const run = useCallback(async (options = {}) => {
    const { quiet = false } = options;
    const id = ++requestId.current;
    if (!quiet) setLoading(true);
    try {
      const result = await loaderRef.current();
      if (id === requestId.current) {
        setData(result);
        setError(null);
      }
      return result;
    } catch (err) {
      if (id === requestId.current) setError(err);
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, deps);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    run();
    return () => {
      requestId.current += 1;
    };
  }, [run]);

  return { data, error, loading, reload: run, setData };
}
