import { Alert, Platform, Share } from 'react-native';

// react-native-web's Alert.alert is a no-op, so fall back to the browser dialogs
// there — otherwise buttons that only show an alert look dead on web.

export function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function confirm(title, message, confirmLabel = 'OK') {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

export function comingSoon(feature) {
  notify(feature, 'This feature is coming soon.');
}

export async function shareText(message) {
  try {
    if (Platform.OS === 'web' && !navigator.share) {
      await navigator.clipboard?.writeText(message);
      notify('Copied to clipboard', message);
      return;
    }
    await Share.share({ message });
  } catch {
    // User cancelled the share sheet — nothing to do.
  }
}
