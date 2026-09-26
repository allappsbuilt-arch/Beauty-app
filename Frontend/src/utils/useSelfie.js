import { useCallback, useRef, useState } from 'react';
import { choosePhoto } from './photo';
import { notify } from './feedback';
import { translate as tr } from '../i18n';

// The user's selfie for photo-based tools: pair `cameraRef` / `photo` with
// <SelfieFrame>. `getPhoto()` reuses the current photo, else snaps the live
// camera, else asks the user to upload one. Returns null if they cancel.
export function useSelfie() {
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  const pickFromGallery = useCallback(async () => {
    const image = await choosePhoto(tr('camera.chooseSelfie'));
    if (image) setPhoto(image);
    return image;
  }, []);

  const getPhoto = useCallback(async () => {
    if (photo) return photo;
    if (cameraRef.current?.isReady()) {
      try {
        const image = await cameraRef.current.capture();
        setPhoto(image);
        return image;
      } catch (err) {
        notify(tr('camera.takeFailed'), err.message);
        return null;
      }
    }
    // No live camera (denied, unavailable, or still starting) — upload instead.
    return pickFromGallery();
  }, [photo, pickFromGallery]);

  const reset = useCallback(() => setPhoto(null), []);

  return { cameraRef, photo, getPhoto, pickFromGallery, reset };
}
