import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function FaceOfTheDay({ onPress }) {
  return (
    <View style={styles.card}>
      {/* Decorative rings */}
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      {/* Camera icon */}
      <View style={styles.cameraWrap}>
        <View style={styles.cameraCircle}>
          <Ionicons name="camera" size={28} color={colors.white} />
        </View>
      </View>

      {/* Text */}
      <Text style={styles.title}>Face of the Day</Text>
      <Text style={styles.subtitle}>
        Tracking your daily progress is the{'\n'}best way to see results.
      </Text>

      {/* Streak badge */}
      <View style={styles.streakBadge}>
        <Ionicons name="flame" size={13} color="#FF8C42" />
        <Text style={styles.streakText}>12-day streak — keep it up!</Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.btn}
        onPress={onPress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Show us your skin today"
      >
        <Ionicons name="camera-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.btnText}>Show us your skin today</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
    // deep premium shadow
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  // Decorative background rings
  ringOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 40,
    borderColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -60,
  },
  ringInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 30,
    borderColor: 'rgba(255,255,255,0.06)',
    bottom: -40,
    left: -30,
  },

  // Camera icon
  cameraWrap: {
    marginBottom: 14,
  },
  cameraCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
  },

  // Text
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },

  // Streak badge
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.2,
  },

  // CTA
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 100,
    paddingVertical: 13,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.1,
  },
});
