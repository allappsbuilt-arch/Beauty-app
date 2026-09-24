import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthedRequest } from './useAuthedRequest';

// Loads `path` whenever the screen gains focus (so data is fresh after e.g.
// taking a scan and coming back). `setData` lets screens apply the updated
// object a mutation endpoint returns without another round trip.
export function useApiData(path) {
  const request = useAuthedRequest();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latestPath = useRef(path);
  latestPath.current = path;

  const reload = useCallback(async () => {
    if (!path) return;
    setError(null);
    try {
      const result = await request(path);
      if (latestPath.current === path) setData(result);
    } catch (err) {
      if (latestPath.current === path) setError(err.message || 'Could not load data.');
    } finally {
      if (latestPath.current === path) setLoading(false);
    }
  }, [request, path]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return { data, setData, loading: loading && !data, error, reload, request };
}
