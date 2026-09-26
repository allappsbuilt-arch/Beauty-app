import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

export default function Header({ navigation }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const firstName = user?.name?.split(' ')[0] || t('home.there');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('home.greetingMorning');
    if (h < 17) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  };

  return (
    <View style={styles.container}>
      {/* Left — greeting + name */}
      <View style={styles.left}>
        <Text style={styles.greeting}>{greeting()}</Text>
        <Text style={styles.name}>{t('home.nameExclaim', { name: firstName })}</Text>
      </View>

      {/* Right — bell + avatar */}
      <View style={styles.right}>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation?.navigate('Notifications')}
          accessibilityRole="button"
          accessibilityLabel={t('home.notifications')}
        >
          <Ionicons name="notifications-outline" size={21} color={colors.textMid} />
          <View style={styles.notifDot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarRing}
          onPress={() => navigation?.navigate('Settings')}
          accessibilityRole="button"
          accessibilityLabel={t('home.profileSettings')}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName.slice(0, 2).toUpperCase()}
            </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderUltraLight,
  },
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
