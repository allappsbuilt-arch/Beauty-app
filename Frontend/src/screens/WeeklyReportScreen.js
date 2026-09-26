import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { useI18n, translate as tr, formatDate } from '../i18n';
import { zoneName } from '../utils/scanText';
import { weeklyFocusTitle, weeklyFocusDesc } from '../utils/serverText';

// The report's days run Monday → Sunday.
const DAY_KEYS = ['weekdays.monNarrow', 'weekdays.tueNarrow', 'weekdays.wedNarrow', 'weekdays.thuNarrow', 'weekdays.friNarrow', 'weekdays.satNarrow', 'weekdays.sunNarrow'];

const TREND_ICON = { up: 'trending-up', down: 'trending-down', check: 'checkmark-circle', flat: 'remove' };
const TREND_COLOR = { up: '#1EA868', down: '#D03050', check: '#1EA868', flat: colors.textFaint };

function formatDateRange(start, end) {
  if (!start || !end) return '';
  const fmt = (d) => formatDate(d, { month: 'short', day: 'numeric' });
  return tr('weekly.dateRange', { start: fmt(start), end: fmt(end) });
}

function ConsistencyChart({ days, pct }) {
  const { t } = useI18n();
  return (
    <View style={consist.card}>
      <View style={consist.header}>
        <Text style={consist.title}>{t('weekly.consistency')}</Text>
        <Text style={consist.pct}>{t('weekly.completed', { pct })}</Text>
      </View>
      <View style={consist.bars}>
        {days.map((d, i) => (
          <View key={i} style={consist.barTrack}>
            <View style={[consist.barFill, { height: `${d.pct * 100}%` }]} />
          </View>
        ))}
      </View>
      <View style={consist.labels}>
        {days.map((d, i) => <Text key={i} style={consist.dayLabel}>{DAY_KEYS[i] ? t(DAY_KEYS[i]) : d.key}</Text>)}
      </View>
      <View style={consist.legendRow}>
        <View style={consist.legendItem}>
          <View style={[consist.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={consist.legendText}>{t('weekly.routineDone')}</Text>
        </View>
        <View style={consist.legendItem}>
          <View style={[consist.legendDot, { backgroundColor: colors.roseDark }]} />
          <Text style={consist.legendText}>{t('weekly.missed')}</Text>
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

function ZoneCard({ zone }) {
  const { t } = useI18n();
  const trend = zone.trend || 'flat';
  return (
    <View style={zoneStyles.card}>
      <View style={zoneStyles.header}>
        <View style={zoneStyles.left}>
          <Ionicons name={zone.icon || 'leaf-outline'} size={17} color={colors.primary} />
          <Text style={zoneStyles.label}>{zoneName(zone)}</Text>
        </View>
        <View style={zoneStyles.scoreBlock}>
          <Text style={zoneStyles.score}>{zone.score}</Text>
          <Ionicons name={TREND_ICON[trend]} size={15} color={TREND_COLOR[trend]} />
        </View>
      </View>
      <Text style={zoneStyles.prev}>{t('weekly.prev', { score: zone.prev })}</Text>
      <Text style={zoneStyles.quote}>"{zone.quote}"</Text>
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
});

function NoScanBanner() {
  const { t } = useI18n();
  return (
    <View style={styles.noScanBanner}>
      <Ionicons name="scan-outline" size={18} color={colors.primary} />
      <Text style={styles.noScanText}>{t('weekly.noScan')}</Text>
    </View>
  );
}

export default function WeeklyReportScreen({ navigation }) {
  const request = useAuthedRequest();
  const { t } = useI18n();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      request('/api/weekly-report')
        .then((data) => { if (!cancelled) setReport(data); })
        .catch(() => { if (!cancelled) setReport(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [request])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('common.appName')}</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headingBlock}>
            <Text style={styles.heading}>{t('weekly.title')}</Text>
            <Text style={styles.dateRange}>{formatDateRange(report?.weekStart, report?.weekEnd)}</Text>
          </View>

          {report && (
            <ConsistencyChart days={report.consistency || []} pct={report.consistencyPct || 0} />
          )}

          {/* Zone Analysis */}
          <Text style={styles.sectionTitle}>{t('weekly.zoneAnalysis')}</Text>
          {!report?.hasScanData ? (
            <NoScanBanner />
          ) : (
            (report?.zones || []).map((z) => <ZoneCard key={z.key} zone={z} />)
          )}

          {/* Stats summary */}
          {report && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="barbell-outline" size={18} color="#1EA868" />
                <Text style={styles.statValue}>{report.totalSessions}</Text>
                <Text style={styles.statLabel}>{t('weekly.totalSessions')}</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="star-outline" size={18} color={colors.primary} />
                <Text style={styles.statValue}>{report.weekPoints}</Text>
                <Text style={styles.statLabel}>{t('weekly.weekPoints')}</Text>
              </View>
            </View>
          )}

          {/* Focus next week */}
          {report?.focus && (
            <View style={styles.focusCard}>
              <View style={styles.focusLabelRow}>
                <Ionicons name="star" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.focusLabel}>{t('weekly.focusNext')}</Text>
              </View>
              <Text style={styles.focusTitle}>{weeklyFocusTitle(report.focus.title)}</Text>
              <Text style={styles.focusDesc}>{weeklyFocusDesc(report.focus.desc)}</Text>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { paddingTop: 6, paddingBottom: 12 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    backgroundColor: colors.primaryBg,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  headingBlock: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  heading: { fontSize: 26, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4 },
  dateRange: { fontSize: 13, color: colors.textLight, fontWeight: '600', marginTop: 4 },
  sectionTitle: {
    fontSize: 19, fontWeight: '800', color: colors.textDark,
    marginHorizontal: 16, marginTop: 24, marginBottom: 4,
  },
  noScanBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 10, padding: 14,
    backgroundColor: colors.primaryPale, borderRadius: 14,
    borderWidth: 1, borderColor: colors.accentDark,
  },
  noScanText: { flex: 1, fontSize: 13, color: colors.textMid, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 20 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, gap: 6,
    borderWidth: 1, borderColor: colors.borderLight,
    alignItems: 'flex-start',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.textDark, letterSpacing: -0.3 },
  statLabel: { fontSize: 11, color: colors.textLight, fontWeight: '600' },
  focusCard: {
    backgroundColor: colors.primary, borderRadius: 18,
    marginHorizontal: 16, marginTop: 20, padding: 20,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  focusLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  focusLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 1.2 },
  focusTitle: { fontSize: 21, fontWeight: '800', color: colors.white, marginBottom: 8, letterSpacing: -0.3 },
  focusDesc: { fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.88)' },
});
