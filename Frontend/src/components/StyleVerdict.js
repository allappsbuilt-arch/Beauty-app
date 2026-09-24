import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Overlay badge showing how well a style suits the user (from the AI ranking).
export function MatchBadge({ rank, best }) {
  if (!rank) return null;
  return (
    <View style={[s.badge, best && s.badgeBest]}>
      <Text style={s.badgeText}>{best ? `BEST · ${rank.match}%` : `${rank.match}%`}</Text>
    </View>
  );
}

// "Oval face — …" summary card shown above the ranked styles.
export function AdviceSummary({ result }) {
  if (!result) return null;
  return (
    <View style={s.card}>
      <Ionicons name="sparkles" size={15} color={colors.primary} />
      <Text style={s.text}>
        <Text style={s.bold}>{result.faceShape} face. </Text>
        {result.summary}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeBest: { backgroundColor: colors.primary },
  badgeText: { fontSize: 10, fontWeight: '800', color: colors.white, letterSpacing: 0.3 },
  card: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: colors.primaryPale, borderRadius: 14, padding: 12,
    marginHorizontal: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border,
  },
  text: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.textMid },
  bold: { fontWeight: '800', color: colors.textDark },
});
