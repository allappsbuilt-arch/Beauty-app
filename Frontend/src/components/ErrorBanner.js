import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

/**
 * ErrorBanner — shows a dismissible inline error strip.
 * Props:
 *   message  (string)   — error text to display
 *   onRetry  (function) — optional retry callback; shows "Try again" button
 *   onDismiss(function) — optional dismiss callback
 */
export default function ErrorBanner({ message, onRetry, onDismiss }) {
  if (!message) return null;
  return (
    <View style={styles.wrap}>
      <Ionicons name="alert-circle-outline" size={16} color="#D03050" style={styles.icon} />
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryBtn} accessibilityRole="button" accessibilityLabel="Retry">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss error">
            <Ionicons name="close" size={16} color="#D03050" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#F5C0CC',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  icon: { flexShrink: 0 },
  text: {
    flex: 1,
    fontSize: 13,
    color: '#D03050',
    fontWeight: '500',
    lineHeight: 18,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  retryBtn: {
    backgroundColor: '#D03050',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  retryText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
