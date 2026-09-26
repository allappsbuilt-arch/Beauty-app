import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Switch,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ErrorBanner from '../components/ErrorBanner';
import { useTracker } from '../api/useTracker';
import { usePreferences } from '../api/usePreferences';
import { notify } from '../utils/feedback';
import { useI18n, formatDate } from '../i18n';
import { trackerItemLabel } from '../utils/serverText';

// Scan metric status → how visible the dark circles are.
const DARK_CIRCLE_LABEL = {
  OPTIMAL: 'undereye.minimal', EXCELLENT: 'undereye.minimal', FAIR: 'undereye.mild', LOW: 'undereye.mild', MODERATE: 'undereye.moderate', HIGH: 'undereye.visible',
};

const ROUTINE = [
  { key: 'cold',  icon: 'snow',           metaKey: 'undereye.mins5',  color: '#1EA868', bg: '#E6F9F0' },
  { key: 'gua',   icon: 'leaf',           metaKey: 'undereye.mins3',  color: '#7A5CD0', bg: '#F1ECFB' },
  { key: 'jade',  icon: 'radio-button-on', metaKey: 'undereye.daily',  color: '#1EA868', bg: '#E6F9F0' },
  { key: 'patch', icon: 'bandage',        metaKey: 'undereye.pmOnly', color: colors.primary, bg: colors.primaryPale },
];

function RingScore({ score }) {
  const SIZE = 100, RING = 8;
  const deg = Math.round(((score ?? 0) / 100) * 360);
  const inner = SIZE - RING * 2;
  return (
    <View style={{ width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: RING, borderColor: colors.roseDark }} />
      <View style={{
        position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: RING,
        borderTopColor: colors.primary,
        borderRightColor: deg > 90 ? colors.primary : colors.roseDark,
        borderBottomColor: deg > 180 ? colors.primary : colors.roseDark,
        borderLeftColor: deg > 270 ? colors.primary : colors.roseDark,
        transform: [{ rotate: '-45deg' }],
      }} />
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textDark }}>{score ?? '—'}</Text>
      </View>
    </View>
  );
}

function RoutineTile({ item, done, onToggle }) {
  const { t } = useI18n();
  const label = trackerItemLabel('undereye', item);
  return (
    <TouchableOpacity
      style={[tile.card, { backgroundColor: item.bg }, done && { borderColor: item.color }]}
      onPress={onToggle}
      activeOpacity={0.8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
    >
      <View style={tile.topRow}>
        <View style={[tile.iconWrap, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={16} color={colors.white} />
        </View>
        <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={done ? item.color : colors.borderLight} />
      </View>
      <Text style={tile.label}>{label}</Text>
      <Text style={[tile.meta, { color: item.color }]}>{done ? t('undereye.doneToday') : t(item.metaKey)}</Text>
    </TouchableOpacity>
  );
}
const tile = StyleSheet.create({
  card: { flex: 1, margin: 6, borderRadius: 14, padding: 14, gap: 8, borderWidth: 1.5, borderColor: 'transparent' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconWrap: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13.5, fontWeight: '700', color: colors.textDark },
  meta: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
});

function ToggleRow({ icon, title, subtitle, value, onValueChange }) {
  return (
    <View style={toggle.row}>
      <View style={toggle.iconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={toggle.title}>{title}</Text>
        <Text style={toggle.subtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderLight, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}
const toggle = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 10, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  subtitle: { fontSize: 11.5, color: colors.textLight, marginTop: 2 },
});

export default function UndereyeTrackerScreen({ navigation }) {
  const { tracker, error, reload, toggle, item } = useTracker('undereye');
  const { prefs, save } = usePreferences();
  const { t } = useI18n();
  const darkCircles = tracker?.metrics?.darkCircles;

  const setReminders = async (value) => {
    try {
      await save({ undereye: { screenBreakReminders: value } });
    } catch (err) {
      notify(t('common.saveFailed'), err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}
          accessibilityRole="button" accessibilityLabel={t('common.goBack')}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('undereye.title')}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.popToTop()}
          accessibilityRole="button" accessibilityLabel={t('common.close')}>
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} onRetry={reload} />

        {/* Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>{t('undereye.score')}</Text>
          <RingScore score={tracker?.score ?? null} />
          <View style={styles.circlesPill}>
            <Ionicons name="eye-outline" size={13} color={colors.primary} />
            <Text style={styles.circlesPillText}>
              {darkCircles ? t('undereye.darkCircles', { level: DARK_CIRCLE_LABEL[darkCircles] ? t(DARK_CIRCLE_LABEL[darkCircles]) : darkCircles }) : t('undereye.scanToMeasure')}
            </Text>
          </View>
        </View>

        {/* Weekly progress */}
        <Text style={styles.sectionTitle}>{t('undereye.weeklyProgress')}</Text>
        <FlatList
          data={(tracker?.history ?? []).slice(-5)}
          keyExtractor={(p) => p.id}
          ListEmptyComponent={<Text style={styles.photoLabel}>{t('undereye.startTracking')}</Text>}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoRow}
          renderItem={({ item: h, index }) => {
            const active = index === Math.min(tracker.history.length, 5) - 1;
            return (
              <View style={styles.photoCol}>
                <View style={[styles.photo, styles.scoreTile, active && styles.photoActive]}>
                  <Text style={styles.scoreTileValue}>{h.score}</Text>
                </View>
                <Text style={[styles.photoLabel, active && styles.photoLabelActive]}>
                  {active ? t('undereye.latest') : formatDate(h.date, { month: 'short', day: 'numeric' }).toUpperCase()}
                </Text>
              </View>
            );
          }}
        />

        {/* Depuffing routine */}
        <Text style={styles.sectionTitle}>{t('undereye.depuffing')}</Text>
        <FlatList
          data={ROUTINE}
          keyExtractor={(r) => r.key}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item: r }) => (
            <RoutineTile item={r} done={!!item(r.key)?.doneToday} onToggle={() => toggle(r.key)} />
          )}
        />

        <View style={{ height: 6 }} />

        <ToggleRow
          icon="water-outline"
          title={t('serverText.trackerItems.undereyeEyedrops')}
          subtitle={t('undereye.lubricating')}
          value={!!item('eyedrops')?.doneToday}
          onValueChange={() => toggle('eyedrops')}
        />

        {/* Alert */}
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={17} color="#C47800" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>{t('undereye.strainTitle')}</Text>
            <Text style={styles.alertText}>{t('undereye.strainText')}</Text>
          </View>
        </View>

        <ToggleRow
          icon="timer-outline"
          title={t('undereye.reminders')}
          subtitle={t('undereye.remindersSub')}
          value={!!prefs?.undereye.screenBreakReminders}
          onValueChange={setReminders}
        />

        {/* Promo */}
        <TouchableOpacity
          style={styles.promoCard}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={t('undereye.guideA11y')}
          onPress={() => navigation?.navigate('IngredientGuide')}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=60' }}
            style={styles.promoImage}
            resizeMode="cover"
          />
          <View style={styles.promoBody}>
            <Text style={styles.promoTitle}>{t('undereye.guideTitle')}</Text>
            <Text style={styles.promoDesc}>{t('undereye.guideDesc')}</Text>
            <View style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>{t('undereye.readGuide')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scoreTile: { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight },
  scoreTileValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingTop: 16, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  scoreCard: {
    alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 18,
    marginHorizontal: 16, marginBottom: 20, paddingVertical: 20,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  scoreLabel: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.2 },
  circlesPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryPale, borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.accentDark,
  },
  circlesPillText: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.4 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginHorizontal: 16, marginBottom: 12, marginTop: 4 },

  photoRow: { paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  photoCol: { alignItems: 'center', gap: 8 },
  photo: { width: 84, height: 84, borderRadius: 14, backgroundColor: colors.sectionBg },
  photoActive: { borderWidth: 2, borderColor: colors.primary },
  photoLabel: { fontSize: 10, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.6 },
  photoLabelActive: { color: colors.primary },

  alertCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.alertBg, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 10, padding: 14,
    borderWidth: 1, borderColor: colors.alertBorder,
  },
  alertTitle: { fontSize: 13.5, fontWeight: '800', color: colors.alertText, marginBottom: 3 },
  alertText: { fontSize: 12, lineHeight: 17, color: colors.alertTextLight },

  promoCard: {
    marginHorizontal: 16, marginTop: 10, borderRadius: 18, overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.06,
    shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  promoImage: { width: '100%', height: 130, backgroundColor: colors.sectionBg },
  promoBody: { padding: 16, gap: 8 },
  promoTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  promoDesc: { fontSize: 12.5, lineHeight: 18, color: colors.textMid },
  promoBtn: {
    backgroundColor: colors.primary, borderRadius: 100,
    paddingVertical: 12, alignItems: 'center', marginTop: 6,
  },
  promoBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
});
