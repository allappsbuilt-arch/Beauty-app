import { useCallback } from 'react';
import { useApiData } from './useApiData';
import { notify } from '../utils/feedback';
import { translate as tr } from '../i18n';

// Tracker score/history (from the user's scans) plus today's checklist.
// `toggle(itemKey)` flips an item optimistically and rolls back on failure.
export function useTracker(area) {
  const { data, setData, loading, error, reload, request } = useApiData(`/api/trackers/${area}`);

  const toggle = useCallback(async (itemKey) => {
    const item = data?.items.find((i) => i.key === itemKey);
    if (!item) return;
    const done = !item.doneToday;
    const previous = data;
    setData({ ...data, items: data.items.map((i) => (i.key === itemKey ? { ...i, doneToday: done } : i)) });
    try {
      const { items } = await request(`/api/trackers/${area}/checks`, { method: 'POST', body: { itemKey, done } });
      setData((cur) => ({ ...cur, items }));
      reload(); // refresh the week strip
    } catch (err) {
      setData(previous);
      notify(tr('common.saveFailed'), err.message);
    }
  }, [area, data, setData, request, reload]);

  const item = useCallback((key) => data?.items.find((i) => i.key === key), [data]);

  return { tracker: data, loading, error, reload, toggle, item };
}

// "Updated 2h ago" style label for the latest scan.
export function timeAgo(iso) {
  if (!iso) return null;
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return tr('time.justNow');
  if (mins < 60) return tr('time.mAgo', { count: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return tr('time.hAgo', { count: hours });
  return tr('time.dAgo', { count: Math.round(hours / 24) });
}
