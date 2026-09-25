import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// The signed-in user's avatar: their initials (the app stores no profile photo).
export default function InitialsAvatar({ name, size = 52, style }) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : (parts[0] || '?').slice(0, 2);
  return (
    <View style={[s.circle, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={[s.text, { fontSize: size * 0.36 }]}>{initials.toUpperCase()}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circle: { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  text: { color: colors.white, fontWeight: '800' },
});
