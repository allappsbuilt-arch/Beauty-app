import { useCallback, useEffect, useState } from 'react';
import { useApiData } from './useApiData';
import { notify } from '../utils/feedback';
import { translate as tr } from '../i18n';

// Server-backed user preferences. `save({ section: { key: value } })` merges
// into that section on the backend and returns the saved preferences.
export function usePreferences() {
  const { data, setData, loading, error, reload, request } = useApiData('/api/preferences');
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (patch) => {
    setSaving(true);
    try {
      const result = await request('/api/preferences', { method: 'PATCH', body: patch });
      setData(result);
      return result.preferences;
    } finally {
      setSaving(false);
    }
  }, [request, setData]);

  return { prefs: data?.preferences ?? null, loading, error, reload, save, saving };
}

// A single saved pick such as styles.brow: shows the saved value once loaded,
// and saves immediately when the user picks something else. `extraPatch`
// lets a pick update related settings too (e.g. the brow goal).
export function useSavedChoice(section, key, fallback, extraPatch) {
  const { prefs, save } = usePreferences();
  const saved = prefs?.[section]?.[key];
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    if (saved != null) setValue(saved);
  }, [saved]);

  const choose = useCallback(async (next) => {
    setValue(next);
    try {
      await save({ [section]: { [key]: next }, ...(extraPatch ? extraPatch(next) : {}) });
    } catch (err) {
      setValue(saved ?? fallback);
      notify(tr('common.saveChoiceFailed'), err.message);
    }
  }, [save, section, key, extraPatch, saved, fallback]);

  return [value, choose];
}
