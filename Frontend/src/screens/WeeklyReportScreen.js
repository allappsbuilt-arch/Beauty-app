import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

// ─── Data ─────────────────────────────────────────────────────────────────────
const DAYS = [
  { key: 'M', pct: 1.0 },
  { key: 'T', pct: 1.0 },
  { key: 'W', pct: 0.85 },
  { key: 'T', pct: 1.0 },
  { key: 'F', pct: 1.0 },
  { key: 'S', pct: 0.55 },
  { key: 'S', pct: 1.0 },
];

const ZONES = [
  {
    key: 'skin', label: 'Skin', icon: 'leaf-outline',
    score: 84, prev: 81, trend: 'up',
    quote: 'Your hydration levels have improved significantly this week. The redness around your cheeks has subsided noticeably.',
  },
  {
    key: 'eyes', label: 'Eyes', icon: 'eye-outline',
    score: 72, prev: 75, trend: 'down',
    quote: 'Dark circles are slightly more prominent than last week. This likely correlates with your lower sleep scores from Tuesday and Wednesday.',
  },
];

const MINI_ZONES = [
  { key: 'brows', label: 'BROWS', score: 88, trend: 'up', note: 'Shape is becoming more defined and symmetrical.' },
  { key: 'lashes', label: 'LASHES', score: 90, trend: 'check', note: 'Density remains high; your lash serum routine is working.' },
];

const TREND_ICON = { up: 'trending-up', down: 'trending-down', check: 'checkmark-circle', flat: 'remove' };
const TREND_COLOR = { up: '#1EA868', down: '#D03050', check: '#1EA868', flat: colors.textFaint };

// ─── Consistency bar chart ────────────────────────────────────────────────────
function ConsistencyChart() {
  return (
    <View style={consist.card}>
      <View style={consist.header}>
        <Text style={consist.title}>Consistency</Text>
        <Text style={consist.pct}>92% COMPLETED</Text>
      </View>
      <View style={consist.bars}>
        {DAYS.map((d, i) => (
          <View key={i} style={consist.barTrack}>
            <View style={[consist.barFill, { height: `${d.pct * 100}%` }]} />
          </View>
        ))}
      </View>
      <View style={consist.labels}>
        {DAYS.map((d, i) => <Text key={i} style={consist.dayLabel}>{d.key}</Text>)}
      </View>
      <View style={consist.legendRow}>
        <View style={consist.legendItem}>
          <View style={[consist.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={consist.legendText}>AM + PM Done</Text>
        </View>
        <View style={consist.legendItem}>
          <View style={[consist.legendDot, { backgroundColor: colors.roseDark }]} />
          <Text style={consist.legendText}>Missed</Text>
        </View>
      </View>
    </View>
  );
}
const consist = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 18,
    marginHorizontal: 16, padding: 18,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.06,
    shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  pct: { fontSize: 12, fontWeight: '800', color: '#1EA868' },
  bars: { flexDirection: 'row', justifyContent: 'space-between', height: 64, alignItems: 'flex-end' },
  barTrack: {
    width: 26, height: '100%', borderRadius: 8,
    backgroundColor: colors.roseDark, justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 8 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dayLabel: { width: 26, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.textFaint },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.textLight, fontWeight: '500' },
});

// ─── Zone card ────────────────────────────────────────────────────────────────
function ZoneCard({ zone }) {
  return (
    <View style={zoneStyles.card}>
      <View style={zoneStyles.header}>
        <View style={zoneStyles.left}>
          <Ionicons name={zone.icon} size={17} color={colors.primary} />
          <Text style={zoneStyles.label}>{zone.label}</Text>
        </View>
        <View style={zoneStyles.scoreBlock}>
          <Text style={zoneStyles.score}>{zone.score}</Text>
          <Ionicons name={TREND_ICON[zone.trend]} size={15} color={TREND_COLOR[zone.trend]} />
        </View>
      </View>
      <Text style={zoneStyles.prev}>Prev: {zone.prev}</Text>
      <Text style={zoneStyles.quote}>"{zone.quote}"</Text>
    </View>
  );
}

function MiniZoneCard({ zone }) {
  return (
    <View style={zoneStyles.miniCard}>
      <Text style={zoneStyles.miniLabel}>{zone.label}</Text>
      <View style={zoneStyles.miniScoreRow}>
        <Text style={zoneStyles.miniScore}>{zone.score}</Text>
        <Ionicons name={TREND_ICON[zone.trend]} size={14} color={TREND_COLOR[zone.trend]} />
      </View>
      <Text style={zoneStyles.miniNote}>{zone.note}</Text>
    </View>
  );
}

const zoneStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 16,
    marginHorizontal: 16, marginTop: 12, padding: 16,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  scoreBlock: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  score: { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.4 },
  prev: { fontSize: 11, color: colors.textFaint, fontWeight: '600', marginTop: 2, marginBottom: 10 },
  quote: { fontSize: 13, lineHeight: 19, color: colors.textMid, fontStyle: 'italic' },

  miniCard: {
    flex: 1,
    backgroundColor: colors.white, borderRadius: 16,
    padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  miniLabel: { fontSize: 10, fontWeight: '800', color: colors.textFaint, letterSpacing: 1, marginBottom: 6 },
  miniScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  miniScore: { fontSize: 19, fontWeight: '800', color: colors.primary },
  miniNote: { fontSize: 11.5, lineHeight: 16, color: colors.textLight },
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function WeeklyReportScreen({ navigation }) {
  const hairZone = { key: 'hair', label: 'Hair', icon: 'cut-outline', score: 79, prev: 79, trend: 'flat',
    quote: 'Texture remains stable. Ensure you are massaging your scalp during the nightly routine to boost circulation.' };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>MyFace AI</Text>

        <View style={styles.avatarWrap}>
          <View style={styles.avatar} />
          <View style={styles.avatarDot} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Weekly Report</Text>
          <Text style={styles.dateRange}>Oct 14 — Oct 20, 2023</Text>
        </View>

        <ConsistencyChart />

        <Text style={styles.sectionTitle}>Zone Analysis</Text>
        {ZONES.map(z => <ZoneCard key={z.key} zone={z} />)}

        <View style={styles.miniRow}>
          {MINI_ZONES.map(z => <MiniZoneCard key={z.key} zone={z} />)}
        </View>

        <ZoneCard zone={hairZone} />

        {/* Lifestyle context */}
        <View style={styles.lifestyleCard}>
          <Text style={styles.lifestyleTitle}>Lifestyle Context</Text>
          <View style={styles.lifestyleRow}>
            <View style={styles.lifestyleItem}>
              <Ionicons name="moon" size={16} color={colors.textMid} />
              <Text style={styles.lifestyleLabel}>Sleep</Text>
            </View>
            <View style={styles.lifestyleItem}>
              <Ionicons name="water" size={16} color={colors.textMid} />
              <Text style={styles.lifestyleLabel}>Water</Text>
            </View>
          </View>
          <View style={styles.lifestyleRow}>
            <Text style={styles.lifestyleValue}>6.4h avg</Text>
            <Text style={styles.lifestyleValue}>2.1L avg</Text>
          </View>
          <View style={styles.lifestyleDivider} />
          <Text style={styles.lifestyleImpact}>
            <Text style={{ fontWeight: '800' }}>Impact: </Text>
            Dehydration peaks on Wed-Thu directly coincided with the drop in Eye clarity scores.
          </Text>
        </View>

        {/* Focus next week */}
        <View style={styles.focusCard}>
          <View style={styles.focusLabelRow}>
            <Ionicons name="star" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.focusLabel}>FOCUS NEXT WEEK</Text>
          </View>
          <Text style={styles.focusTitle}>Prioritize Eye Recovery</Text>
          <Text style={styles.focusDesc}>
            Implement a cold compress routine for 5 minutes each morning and target 7.5 hours of sleep to reduce puffiness.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.shareBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Share weekly report"
        >
          <Ionicons name="share-social-outline" size={16} color={colors.white} />
          <Text style={styles.shareBtnText}>Share Weekly Report</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { flex: 1 },
  content: { paddingTop: 6, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    backgroundColor: colors.primaryBg,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  avatarWrap: { width: 34, height: 34 },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.accent,
  },
  avatarDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#1EA868', borderWidth: 2, borderColor: colors.primaryBg,
  },

  headingBlock: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  heading: { fontSize: 26, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4 },
  dateRange: { fontSize: 13, color: colors.textLight, fontWeight: '600', marginTop: 4 },

  sectionTitle: {
    fontSize: 19, fontWeight: '800', color: colors.textDark,
    marginHorizontal: 16, marginTop: 24, marginBottom: 4,
  },

  miniRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 12 },

  lifestyleCard: {
    backgroundColor: '#F1E8FB', borderRadius: 18,
    marginHorizontal: 16, marginTop: 20, padding: 18,
    borderWidth: 1, borderColor: '#E0CCF5',
  },
  lifestyleTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark, marginBottom: 14 },
  lifestyleRow: { flexDirection: 'row', gap: 40, marginBottom: 4 },
  lifestyleItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lifestyleLabel: { fontSize: 13, fontWeight: '700', color: colors.textMid },
  lifestyleValue: { fontSize: 20, fontWeight: '800', color: colors.textDark, letterSpacing: -0.3, width: 108 },
  lifestyleDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#D8C0EE', marginVertical: 14 },
  lifestyleImpact: { fontSize: 13, lineHeight: 19, color: colors.textMid },

  focusCard: {
    backgroundColor: colors.primary, borderRadius: 18,
    marginHorizontal: 16, marginTop: 16, padding: 20,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  focusLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  focusLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.2 },
  focusTitle: { fontSize: 21, fontWeight: '800', color: colors.white, marginBottom: 8, letterSpacing: -0.3 },
  focusDesc: { fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.88)' },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginHorizontal: 16, marginTop: 18,
    paddingVertical: 15,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  shareBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
});
