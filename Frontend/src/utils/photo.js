import { Alert, Platform, Share } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { notify } from './feedback';
import { translate as tr } from '../i18n';

const MAX_SIDE = 1024;

// Downscales to at most 1024px and re-encodes as JPEG so uploads stay small
// (faster, and cheaper for the AI analysis). Returns a data URL.
export async function toUploadable(uri, width, height) {
  const resize = width && height && Math.max(width, height) > MAX_SIDE
    ? [{ resize: width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE } }]
    : [];
  const out = await ImageManipulator.manipulateAsync(uri, resize, {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  return `data:image/jpeg;base64,${out.base64}`;
}

// Opens the camera or photo library and returns an upload-ready data URL,
// or null if the user cancelled / denied permission.
export async function pickPhoto(source = 'camera') {
  const useCamera = source === 'camera' && Platform.OS !== 'web';
  const perm = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    notify(tr('photo.permissionTitle'), useCamera ? tr('photo.cameraPermission') : tr('photo.libraryPermission'));
    return null;
  }

  try {
    const options = { mediaTypes: ['images'], quality: 1, allowsEditing: false };
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ ...options, cameraType: ImagePicker.CameraType.front })
      : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    return await toUploadable(asset.uri, asset.width, asset.height);
  } catch (err) {
    notify(tr('photo.loadFailed'), err?.message || tr('photo.tryDifferent'));
    return null;
  }
}

// Lets the user choose camera or library (web has no native camera picker,
// so it goes straight to file selection).
export async function choosePhoto(title = tr('photo.addTitle')) {
  if (Platform.OS === 'web') return pickPhoto('library');
  const source = await new Promise((resolve) => {
    Alert.alert(title, tr('photo.sourcePrompt'), [
      { text: tr('photo.take'), onPress: () => resolve('camera') },
      { text: tr('photo.library'), onPress: () => resolve('library') },
      { text: tr('common.cancel'), style: 'cancel', onPress: () => resolve(null) },
    ], { cancelable: true, onDismiss: () => resolve(null) });
  });
  return source ? pickPhoto(source) : null;
}

// Saves a generated image (data URL): a download on web, the share sheet
// (Save Image / send to an app) on phones.
export async function saveImage(dataUrl, name = 'myface-ai') {
  try {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${name}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }
    const uri = `${FileSystem.cacheDirectory}${name}-${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(uri, dataUrl.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });
    await Share.share({ url: uri, message: Platform.OS === 'android' ? uri : undefined });
  } catch (err) {
    notify(tr('photo.saveFailed'), err?.message || tr('common.tryAgainPlease'));
  }
}
