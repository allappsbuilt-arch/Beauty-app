import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';

const FEELINGS = [
  { key: 'happy', labelKey: 'feelings.happy',  emoji: '😊', color: '#FFD166', bg: '#FFFBEC' },
  { key: 'dry',   labelKey: 'feelings.dry',    emoji: '🔥', color: '#FF8C42', bg: '#FFF3EB' },
  { key: 'glow',  labelKey: 'feelings.glow',   emoji: '✨', color: '#9B80FF', bg: '#F3F0FF' },
  { key: 'soft',  labelKey: 'feelings.soft',   emoji: '☁️', color: '#78909C', bg: '#F0F4F8' },
  { key: 'red',   labelKey: 'feelings.red',    emoji: '🫀', color: '#FF5C5C', bg: '#FFF0F0' },
  { key: 'oily',  labelKey: 'feelings.oily',   emoji: '💧', color: '#29B6D4', bg: '#EBF9FC' },
];

function FeelingChip({ item, selected, onPress }) {
  const { t } = useI18n();
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && { borderColor: item.color, backgroundColor: item.bg },
      ]}
      onPress={() => onPress(item.key)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={t(item.labelKey)}
      accessibilityState={{ selected }}
    >
      {/* Emoji bubble */}
      <View style={[styles.emojiBubble, selected && { backgroundColor: item.bg }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={[styles.chipLabel, selected && { color: item.color, fontWeight: '700' }]}>
        {t(item.labelKey)}
      </Text>
      {/* Selected indicator dot */}
      {selected && <View style={[styles.selectedDot, { backgroundColor: item.color }]} />}
    </TouchableOpacity>
  );
}

export default function SkinFeelingPicker({ selected: selectedProp, onSelect }) {
  const { t } = useI18n();
  const [internalSelected, setInternalSelected] = useState(null);
  const isControlled = selectedProp !== undefined;
  const selected = isControlled ? selectedProp : internalSelected;

  const handleSelect = (key) => {
    const next = selected === key ? null : key;
    if (!isControlled) setInternalSelected(next);
    onSelect?.(next);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.question}>{t('home.feelingQuestion')}</Text>
        {selected && (
          <TouchableOpacity onPress={() => { if (!isControlled) setInternalSelected(null); onSelect?.(null); }}>
            <Text style={styles.clearBtn}>{t('home.clear')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips */}
      <View style={styles.grid}>
        {FEELINGS.map((f) => (
          <FeelingChip
            key={f.key}
            item={f}
            selected={selected === f.key}
            onPress={handleSelect}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Header row
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  question: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    letterSpacing: 0.1,
    flex: 1,
  },
  clearBtn: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // Chip grid — 3 per row
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.sectionBg,
    gap: 4,
    position: 'relative',
  },
  emojiBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.rose,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  chipLabel: {
    fontSize: 11,
    color: colors.textMid,
    fontWeight: '500',
  },
  selectedDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
