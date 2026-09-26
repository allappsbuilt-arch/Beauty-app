import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

function StatItem({ icon, value, label, color, bg, isLast, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const pressProps = onPress
    ? { onPress, activeOpacity: 0.7, accessibilityRole: 'button', accessibilityLabel: `${label}: ${value}` }
    : {};
  return (
    <Wrapper style={[styles.item, !isLast && styles.itemBorder]} {...pressProps}>
      {/* Coloured icon pill */}
      <View style={[styles.iconPill, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      {/* Value */}
      <Text style={[styles.value, { color }]}>{value}</Text>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>
    </Wrapper>
  );
}

// `stats`: [{ icon, value, label (already translated), color, bg, onPress }]
export default function StatsRow({ stats = [] }) {
  return (
    <View style={styles.card}>
      {stats.map((s, i) => (
        <StatItem key={s.label} {...s} isLast={i === stats.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 6,
    paddingVertical: 16,
    paddingHorizontal: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
  },
  // Right border divider between items
  itemBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.borderUltraLight,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 9,
    color: colors.textFaint,
    letterSpacing: 0.8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
