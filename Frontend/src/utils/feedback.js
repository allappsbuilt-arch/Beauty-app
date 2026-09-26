import { Alert, Linking, Platform, Share } from 'react-native';
import { translate as tr } from '../i18n';

// react-native-web's Alert.alert is a no-op, so fall back to the browser dialogs
// there — otherwise buttons that only show an alert look dead on web.

export function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function confirm(title, message, confirmLabel = tr('common.ok')) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: tr('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

// Opens a video tutorial search (YouTube) for a look or style.
export async function openTutorial(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(tr('tutorials.search', { query }))}`;
  try {
    await Linking.openURL(url);
  } catch {
    notify(tr('tutorials.openFailed'), tr('common.checkConnection'));
  }
}

// Copies text (web clipboard); on phones opens the share sheet, which has Copy.
export async function copyText(text, label = tr('common.copied')) {
  try {
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      notify(label, text);
      return;
    }
    await Share.share({ message: text });
  } catch {
    notify(tr('common.copyFailed'), text);
  }
}

export async function shareText(message) {
  try {
    if (Platform.OS === 'web' && !navigator.share) {
      await navigator.clipboard?.writeText(message);
      notify(tr('common.copiedToClipboard'), message);
      return;
    }
    await Share.share({ message });
  } catch {
    // User cancelled the share sheet — nothing to do.
  }
}
