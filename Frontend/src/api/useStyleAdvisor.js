import { useCallback, useState } from 'react';
import { useAuthedRequest } from './useAuthedRequest';
import { choosePhoto } from '../utils/photo';
import { notify } from '../utils/feedback';

// AI style recommendations ('hair' | 'brow') from a selfie. The photo stays
// on the device between runs so the user can tweak their request without
// re-taking it; the backend doesn't store it.
export function useStyleAdvisor(kind) {
  const request = useAuthedRequest();
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async ({ userRequest = '', newPhoto = false } = {}) => {
    const image = (!newPhoto && photo) || await choosePhoto('Photo for style advice');
    if (!image) return;
    setPhoto(image);
    setLoading(true);
    try {
      setResult(await request('/api/styles/recommend', { method: 'POST', body: { kind, image, request: userRequest } }));
    } catch (err) {
      notify('Could not analyse your photo', err.message);
    } finally {
      setLoading(false);
    }
  }, [kind, photo, request]);

  const rankFor = useCallback((key) => result?.ranking.find((r) => r.key === key) ?? null, [result]);

  // Best matches first once there's a result; original order before that.
  const sortStyles = useCallback((styles) => (
    result ? [...styles].sort((a, b) => (rankFor(b.key)?.match ?? 0) - (rankFor(a.key)?.match ?? 0)) : styles
  ), [result, rankFor]);

  return { photo, result, loading, analyze, rankFor, sortStyles };
}
