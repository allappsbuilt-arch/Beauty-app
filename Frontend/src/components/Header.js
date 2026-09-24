import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Header({ name = 'Alex', navigation }) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  return (
    <View style={styles.container}>
      {/* Left — greeting + name */}
      <View style={styles.left}>
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.name}>{name}!</Text>
      </View>

      {/* Right — bell + avatar */}
      <View style={styles.right}>
        {/* Notification bell with unread dot */}
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation?.navigate('WelcomeBack')}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={21} color={colors.textMid} />
          {/* unread indicator */}
          <View style={styles.notifDot} />
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarRing}
          onPress={() => navigation?.navigate('Rewards')}
          accessibilityRole="button"
          accessibilityLabel="Profile and rewards"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 12,
    backgroundColor: colors.white,
    // crisp bottom border
    borderBottomWidth: 1,
    borderBottomColor: colors.borderUltraLight,
  },

  // ── Left ──
  left: { gap: 1 },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textLight,
    letterSpacing: 0.1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
    letterSpacing: -0.4,
  },

  // ── Right ──
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sectionBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.white,
  },

  // Avatar ring + fill
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.accentDark,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
