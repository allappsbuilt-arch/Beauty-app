import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';

const ACTIONS = [
  {
    key: 'scan',
    icon: 'scan-outline',
    labelKey: 'quickActions.scan',
    accent: colors.primary,
    accentBg: colors.primaryPale,
    descKey: 'quickActions.scanDesc',
  },
  {
    key: 'routine',
    icon: 'calendar-outline',
    labelKey: 'quickActions.routine',
    accent: '#7C6FCD',
    accentBg: '#F0EEFF',
    descKey: 'quickActions.routineDesc',
  },
  {
    key: 'makeup',
    icon: 'color-palette-outline',
    labelKey: 'quickActions.makeup',
    accent: '#E05080',
    accentBg: '#FFF0F5',
    descKey: 'quickActions.makeupDesc',
  },
  {
    key: 'community',
    icon: 'chatbubbles-outline',
    labelKey: 'quickActions.community',
    accent: '#E0920A',
    accentBg: '#FFF8EC',
    descKey: 'quickActions.communityDesc',
  },
];

function ActionTile({ icon, labelKey, accent, accentBg, descKey, onPress }) {
  const { t } = useI18n();
  const label = t(labelKey);
  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={onPress}
      activeOpacity={0.80}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {/* Icon pill */}
      <View style={[styles.iconPill, { backgroundColor: accentBg }]}>
        <Ionicons name={icon} size={24} color={accent} />
      </View>

      {/* Text */}
      <View style={styles.tileText}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={styles.tileDesc}>{t(descKey)}</Text>
      </View>

      {/* Arrow */}
      <View style={[styles.arrowCircle, { backgroundColor: accentBg }]}>
        <Ionicons name="arrow-forward" size={12} color={accent} />
      </View>
    </TouchableOpacity>
  );
}

export default function QuickActions({ onAction }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.grid}>
        {ACTIONS.map(({ key, ...a }) => (
          <ActionTile
            key={key}
            {...a}
            onPress={() => onAction?.(key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // Each tile is 2-per-row
  tile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  iconPill: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tileText: {
    gap: 2,
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    letterSpacing: -0.1,
  },
  tileDesc: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },

  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});
