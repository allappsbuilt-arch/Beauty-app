import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// ─── Standardized screen navigation bar ────────────────────────────────────
//
// Replaces the ~23 hand-duplicated nav bars across the app (each with its own
// slightly different icon colors, padding, and border) with one consistent
// component. Conventions:
//   - Nav icons (back/close) are always neutral (textDark) — the title carries
//     the brand color, not the chrome. Keeps the header calm and legible.
//   - Light variant: white surface + hairline border, distinguishing it as a
//     fixed navigation layer above scrolling content (like iOS/Material bars).
//   - Dark variant: for full-bleed camera/analysis screens — glass icon
//     buttons over imagery, white/tinted title.
//
// Pass `right` for a fully custom right-side element (step counter, avatar,
// icon cluster); otherwise pass `onClose` for the default close (X) button.

export default function ScreenHeader({
  title,
  titleColor,
  onBack,
  onClose,
  right,
  variant = 'light',
  bordered = true,
  absolute = false, // overlay atop full-bleed imagery (camera/analysis screens)
  progress, // optional 0–1 value; renders a thin progress bar under the header
}) {
  const isDark = variant === 'dark';

  return (
    <View style={absolute && styles.absoluteWrap}>
      <View
        style={[
          styles.bar,
          isDark ? styles.barDark : styles.barLight,
          !isDark && bordered && styles.barBordered,
          absolute && styles.barAbsolutePadding,
        ]}
      >
        {onBack ? (
          <TouchableOpacity
            style={[styles.iconBtn, isDark && styles.iconBtnDark]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={isDark ? colors.white : colors.textDark} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <Text
          style={[
            styles.title,
            isDark ? styles.titleDark : styles.titleLight,
            titleColor && { color: titleColor },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {right ? (
          <View style={styles.rightSlot}>{right}</View>
        ) : onClose ? (
          <TouchableOpacity
            style={[styles.iconBtn, isDark && styles.iconBtnDark]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color={isDark ? colors.white : colors.textDark} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {typeof progress === 'number' && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  barLight: { backgroundColor: colors.white },
  barBordered: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  barDark: { backgroundColor: 'transparent' },
  barAbsolutePadding: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 38 : 52,
    paddingBottom: 4,
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnDark: {
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  titleLight: { color: colors.primary },
  titleDark: { color: colors.white },

  rightSlot: {
    minWidth: 38,
    alignItems: 'flex-end',
  },

  progressTrack: { height: 3, backgroundColor: colors.roseDark },
  progressFill: { height: 3, backgroundColor: colors.primary },
});
