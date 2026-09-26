import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { syncRemindersFromServer } from '../utils/reminders';
import { useI18n } from '../i18n';

const BANNER_URI = 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=60';

const CATEGORIES = [
  { key: 'routine', icon: 'checkbox-outline', labelKey: 'notifications.routine', initial: true },
  { key: 'progress', icon: 'trending-up-outline', labelKey: 'notifications.progress', initial: true },
  { key: 'social', icon: 'share-social-outline', labelKey: 'notifications.social', initial: false },
  { key: 'community', icon: 'people-outline', labelKey: 'notifications.community', initial: true },
  { key: 'coach', icon: 'chatbubble-outline', labelKey: 'notifications.coach', initial: true },
  { key: 'wellness', icon: 'body-outline', labelKey: 'notifications.wellness', initial: false },
];

function CategoryRow({ icon, label, value, onChange, isLast }) {
  return (
    <>
      <View style={styles.row}>
        <Ionicons name={icon} size={19} color={colors.primary} style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.borderLight, true: colors.primary }}
          thumbColor={colors.white}
        />
      </View>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

export default function NotificationsScreen({ navigation }) {
  const request = useAuthedRequest();
  const { t } = useI18n();
  const [muteAll, setMuteAll] = useState(false);
  const [values, setValues] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c.key, c.initial]))
  );

  useEffect(() => {
    request('/api/settings/notifications')
      .then((prefs) => {
        setMuteAll(prefs.muteAll);
        setValues(prefs.categories);
      })
      .catch(() => {
        // Keep the defaults on screen if the backend is unreachable.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Routine reminders are scheduled on the device, so re-sync them whenever
  // a setting that affects them changes (asking for permission when enabling).
  const resyncReminders = (enabling) => syncRemindersFromServer(request, { ask: enabling }).catch(() => {});

  const handleMuteAll = (next) => {
    setMuteAll(next);
    request('/api/settings/notifications', { method: 'PUT', body: { muteAll: next } })
      .then(() => resyncReminders(!next))
      .catch(() => {});
  };

  const toggle = (key) => {
    const nextValue = !values[key];
    setValues((v) => ({ ...v, [key]: nextValue }));
    request('/api/settings/notifications', { method: 'PUT', body: { categories: { [key]: nextValue } } })
      .then(() => { if (key === 'routine') resyncReminders(nextValue); })
      .catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('notifications.title')}</Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <Ionicons name="close" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Banner ── */}
        <View style={styles.banner}>
          <Image source={{ uri: BANNER_URI }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{t('notifications.bannerTitle')}</Text>
            <Text style={styles.bannerSub}>{t('notifications.bannerSub')}</Text>
          </View>
        </View>

        {/* ── Mute all ── */}
        <View style={styles.muteRow}>
          <View style={styles.muteIcon}>
            <Ionicons name="notifications-off-outline" size={19} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.muteTitle}>{t('notifications.muteAll')}</Text>
            <Text style={styles.muteSub}>{t('notifications.muteAllSub')}</Text>
          </View>
          <Switch
            value={muteAll}
            onValueChange={handleMuteAll}
            trackColor={{ false: colors.borderLight, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* ── Categories ── */}
        <Text style={styles.sectionTitle}>{t('notifications.categories')}</Text>
        <View style={[styles.card, muteAll && styles.cardDisabled]} pointerEvents={muteAll ? 'none' : 'auto'}>
          {CATEGORIES.map((c, i) => (
            <CategoryRow
              key={c.key}
              icon={c.icon}
              label={t(c.labelKey)}
              value={values[c.key]}
              onChange={() => toggle(c.key)}
              isLast={i === CATEGORIES.length - 1}
            />
          ))}
        </View>

        {/* ── Info ── */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>{t('notifications.info')}</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 12 : 8, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  navBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 17, fontWeight: '800', color: colors.primary },

  banner: { height: 170, margin: 20, marginBottom: 18, borderRadius: 18, overflow: 'hidden', justifyContent: 'flex-end' },
  bannerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,10,14,0.30)' },
  bannerText: { padding: 18 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  bannerSub: { fontSize: 12.5, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginTop: 4 },

  muteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 14, marginHorizontal: 20,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 22,
  },
  muteIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  muteTitle: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  muteSub: { fontSize: 12, color: colors.textLight, fontWeight: '500', marginTop: 2 },

  sectionTitle: { fontSize: 11.5, fontWeight: '800', color: colors.textFaint, letterSpacing: 1, marginHorizontal: 20, marginBottom: 10 },
  card: {
    backgroundColor: colors.white, borderRadius: 16, marginHorizontal: 20,
    borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 14,
  },
  cardDisabled: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowIcon: { width: 20 },
  rowLabel: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.textDark },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderUltraLight },

  infoCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: colors.primaryPale, borderRadius: 14, padding: 14,
    marginHorizontal: 20, marginTop: 20,
  },
  infoText: { flex: 1, fontSize: 12.5, lineHeight: 18, color: colors.textMid },
});
