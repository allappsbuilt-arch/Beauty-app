import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Humidity level → colour mapping
function levelConfig(humidity) {
  if (humidity < 30) return { accent: '#C0405A', bg: '#FFF0F3', border: '#F5C0CC', label: 'Low' };
  if (humidity < 60) return { accent: '#F0A020', bg: '#FFFAEC', border: '#F5D878', label: 'Moderate' };
  return { accent: '#28A090', bg: '#EDFAF8', border: '#A0DED8', label: 'Good' };
}

export default function HumidityAlert({
  humidity = 24,
  message = 'Expect potential dryness; consider a thicker barrier cream today.',
}) {
  const cfg = levelConfig(humidity);

  return (
    <View style={[styles.container, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: cfg.accent }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: cfg.accent + '18', borderColor: cfg.accent + '40' }]}>
        <Ionicons name="water-outline" size={20} color={cfg.accent} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        {/* Pill badge */}
        <View style={[styles.badge, { backgroundColor: cfg.accent }]}>
          <Text style={styles.badgeText}>Humidity {cfg.label} · {humidity}%</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    paddingRight: 16,
    paddingVertical: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  textBlock: {
    flex: 1,
    gap: 5,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 12,
    color: colors.textMid,
    lineHeight: 18,
    fontWeight: '400',
  },
});
