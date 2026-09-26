import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';

// ── Premium circular progress ring ───────────────────────────────────────────
// Uses four border-sides to approximate a filled arc — clean and dependency-free
function RingProgress({ percent = 33, size = 76 }) {
  const deg = Math.round((percent / 100) * 360);
  const half = size / 2;
  const ring = 7;
  const inner = size - ring * 2;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: ring,
          borderColor: colors.roseDark,
        }}
      />
      {/* Fill — four-sided trick */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: ring,
          borderTopColor:    colors.primary,
          borderRightColor:  deg > 90  ? colors.primary : colors.roseDark,
          borderBottomColor: deg > 180 ? colors.primary : colors.roseDark,
          borderLeftColor:   deg > 270 ? colors.primary : colors.roseDark,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      {/* Inner white disc */}
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={styles.ringPercent}>{percent}%</Text>
      </View>
    </View>
  );
}

// ── Step dot indicators ───────────────────────────────────────────────────────
function StepDots({ completed, total }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < completed ? styles.dotFilled : styles.dotEmpty]}
        />
      ))}
    </View>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export default function RoutineCard({
  title,
  completed = 2,
  total = 6,
  onPress,
}) {
  const { t } = useI18n();
  title = title ?? t('routines.am');
  const percent = Math.round((completed / total) * 100);

  return (
    <View style={styles.card}>
      {/* Progress ring */}
      <RingProgress percent={percent} size={80} />

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>
          {t('home.stepsCompleted', { completed, total })}
        </Text>

        {/* Step dot row */}
        <StepDots completed={completed} total={total} />

        {/* CTA button */}
        <TouchableOpacity
          style={styles.btn}
          onPress={onPress}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={t('home.startRoutine', { title })}
        >
          <Ionicons name="play" size={13} color={colors.white} style={{ marginRight: 5 }} />
          <Text style={styles.btnText}>{t('home.startRoutine', { title })}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 6,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 18,
    // layered premium shadow
    shadowColor: colors.shadow,
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Ring text
  ringPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },

  // Step dots
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotFilled: { backgroundColor: colors.primary },
  dotEmpty:  { backgroundColor: colors.roseDark },

  // Info block
  info: { flex: 1 },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textDark,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 3,
    fontWeight: '500',
  },

  // Button
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  btnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.1,
  },
});
