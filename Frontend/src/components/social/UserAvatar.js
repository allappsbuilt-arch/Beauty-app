import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { avatarColors, initialsOf } from './socialUtils';

// Initials avatar with a soft ring, coloured per user (the app stores no photos).
export default function UserAvatar({ user, size = 44 }) {
  const { color, bg } = avatarColors(user?.id || user?.name || '');
  const inner = size - 8;
  return (
    <View style={[s.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color + '55' }]}>
      <View style={[s.circle, { width: inner, height: inner, borderRadius: inner / 2, backgroundColor: bg }]}>
        <Text style={[s.text, { color, fontSize: Math.round(size * 0.3) }]}>{initialsOf(user?.name)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  ring: { borderWidth: 1.5, padding: 2, justifyContent: 'center', alignItems: 'center' },
  circle: { justifyContent: 'center', alignItems: 'center' },
  text: { fontWeight: '800', letterSpacing: 0.3 },
});
