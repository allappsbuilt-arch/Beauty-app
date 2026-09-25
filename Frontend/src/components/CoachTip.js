import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const TIPS = [
  '"Tapping your serum gently into the skin instead of rubbing can increase absorption by 20%! Have you tried it this morning?"',
  '"Always apply SPF as the final step of your AM routine — even on cloudy days, UV rays penetrate clouds."',
  '"Drinking 8 glasses of water daily helps maintain skin elasticity and reduces the appearance of fine lines."',
];

export default function CoachTip({ onMicPress }) {
  const [tipIndex, setTipIndex] = useState(0);

  const nextTip = () => setTipIndex((i) => (i + 1) % TIPS.length);

  return (
    <View style={styles.card}>
      {/* Top row: avatar label + next tip btn */}
      <View style={styles.topRow}>
        <View style={styles.coachBadge}>
          <View style={styles.coachDot} />
          <Text style={styles.coachLabel}>AI Coach</Text>
        </View>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={nextTip}
          accessibilityRole="button"
          accessibilityLabel="Next tip"
        >
          <Text style={styles.nextBtnText}>Next tip</Text>
          <Ionicons name="chevron-forward" size={12} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Body row: avatar + quote */}
      <View style={styles.bodyRow}>
        {/* Coach avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Ionicons name="sparkles" size={16} color={colors.white} />
            </View>
          </View>
          {/* Online pulse */}
          <View style={styles.onlineDot} />
        </View>

        {/* Quote bubble */}
        <View style={styles.bubble}>
          {/* Left notch */}
          <View style={styles.bubbleNotch} />
          <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
        </View>
      </View>

      {/* Bottom row: pagination dots + mic */}
      <View style={styles.bottomRow}>
        <View style={styles.paginationDots}>
          {TIPS.map((_, i) => (
            <View
              key={i}
              style={[styles.pageDot, i === tipIndex && styles.pageDotActive]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.micBtn}
          onPress={() => onMicPress?.(TIPS[tipIndex].replace(/^"|"$/g, ''))}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Voice reply to coach"
        >
          <Ionicons name="mic" size={16} color={colors.white} />
          <Text style={styles.micLabel}>Reply</Text>
        </TouchableOpacity>
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
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 12,
  },

  // ── Top row ──
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryPale,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  coachDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  coachLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  nextBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // ── Body row ──
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.accentDark,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: colors.white,
  },

  // Quote bubble
  bubble: {
    flex: 1,
    backgroundColor: colors.sectionBg,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bubbleNotch: {
    position: 'absolute',
    left: -7,
    top: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 7,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.borderLight,
  },
  tipText: {
    fontSize: 13,
    color: colors.textMid,
    fontStyle: 'italic',
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // ── Bottom row ──
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.roseDark,
  },
  pageDotActive: {
    width: 18,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.30,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  micLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.2,
  },
});
