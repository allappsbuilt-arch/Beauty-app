import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { notify } from './feedback';

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
    notify(
      'Permission needed',
      useCamera ? 'Allow camera access in your settings to take a photo.' : 'Allow photo access in your settings to choose a photo.'
    );
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
    notify('Could not load that photo', err?.message || 'Please try a different photo.');
    return null;
  }
}

// Lets the user choose camera or library (web has no native camera picker,
// so it goes straight to file selection).
export async function choosePhoto(title = 'Add a photo') {
  if (Platform.OS === 'web') return pickPhoto('library');
  const source = await new Promise((resolve) => {
    Alert.alert(title, 'Take a new photo or choose one from your library.', [
      { text: 'Take Photo', onPress: () => resolve('camera') },
      { text: 'Choose from Library', onPress: () => resolve('library') },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ], { cancelable: true, onDismiss: () => resolve(null) });
  });
  return source ? pickPhoto(source) : null;
}
