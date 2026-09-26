import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';

// ─── Desktop / tablet presentation shell ───────────────────────────────────
//
// The app is designed mobile-first (fixed phone-proportioned layouts). On a
// wide browser window that content would otherwise stretch edge-to-edge and
// look unfinished. Past a breakpoint we instead present it as a centered
// "device" card — the same pattern used by most mobile-app marketing sites
// and web previews of native apps — so desktop/tablet visitors get an
// intentional, premium frame instead of a stretched phone screen.
//
// Native (iOS/Android) and narrow web viewports render children untouched.

const PHONE_WIDTH = 430;
const BREAKPOINT = 760;

export default function ResponsiveShell({ children }) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web' || width < BREAKPOINT) {
    return children;
  }

  const frameHeight = Math.min(height - 48, 900);

  return (
    <View style={styles.backdrop}>
      <View style={styles.ambientGlowLeft} pointerEvents="none" />
      <View style={styles.ambientGlowRight} pointerEvents="none" />

      <View style={[styles.deviceFrame, { width: PHONE_WIDTH, height: frameHeight }]}>
        <View style={styles.deviceScreen}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A1620',
    overflow: 'hidden',
    // The glows hang off the edges; 'clip' (unlike 'hidden') also stops the
    // browser scrolling the backdrop when a focused input is near them.
    ...(Platform.OS === 'web' ? { overflow: 'clip' } : null),
  },
  ambientGlowLeft: {
    position: 'absolute',
    top: '-10%',
    left: '-15%',
    width: 520,
    height: 520,
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
    opacity: 0.35,
    ...(Platform.OS === 'web' ? { filter: 'blur(120px)' } : null),
  },
  ambientGlowRight: {
    position: 'absolute',
    bottom: '-15%',
    right: '-10%',
    width: 480,
    height: 480,
    borderRadius: 999,
    backgroundColor: colors.accentDeep,
    opacity: 0.28,
    ...(Platform.OS === 'web' ? { filter: 'blur(130px)' } : null),
  },
  deviceFrame: {
    borderRadius: 40,
    padding: 10,
    backgroundColor: '#160B10',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)' }
      : null),
  },
  deviceScreen: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.primaryBg,
  },
});
