import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { goToTab } from '../utils/navigation';
import { formatPoints, formatPointsDate, loadErrorMessage } from '../components/points/pointsUtils';
import { useI18n, formatNumber } from '../i18n';
import { levelName, ledgerLabel } from '../utils/serverText';

const RECENT_COUNT = 5;

// ─── Sub-components ───────────────────────────────────────────────────────────

function EarnRow({ icon, label, desc, pill, done, color, bg, onPress }) {
  const { t } = useI18n();
  return (
    <TouchableOpacity style={styles.earnRow} onPress={onPress} activeOpacity={0.8}
      accessibilityRole="button" accessibilityLabel={t('rewards.earnRowA11y', { label, desc, pill })}>
      <View style={[styles.earnIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.earnText}>
        <Text style={styles.earnLabel}>{label}</Text>
        <Text style={styles.earnDesc}>{desc}</Text>
      </View>
      <View style={[styles.earnPill, done && styles.earnPillDone]}>
        <Text style={[styles.earnPillText, done && styles.earnPillTextDone]}>{pill}</Text>
      </View>
    </TouchableOpacity>
  );
}

function HistoryRow({ item, isLast }) {
  return (
    <View style={[styles.historyRow, !isLast && styles.historyRowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.historyLabel}>{ledgerLabel(item.label)}</Text>
        <Text style={styles.historyDate}>{formatPointsDate(item.createdAt)}</Text>
      </View>
      <Text style={[styles.historyPoints, item.points < 0 && styles.historyPointsNeg]}>{formatPoints(item.points)}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function RewardsScreen({ navigation }) {
  const request = useAuthedRequest();
  const { t } = useI18n();
  const [summary, setSummary] = useState(null);
  const [earn, setEarn] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const loadedOnce = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, e, h] = await Promise.all([
        request('/api/points/summary'),
        request('/api/points/earn'),
        request(`/api/points/history?limit=${RECENT_COUNT}`),
      ]);
      setSummary(s);
      setEarn(e);
      setHistory(Array.isArray(h?.history) ? h.history : []);
      loadedOnce.current = true;
    } catch (err) {
      setError(loadErrorMessage(err));
    }
  }, [request]);

  // Refresh on every visit so points earned elsewhere (routine, scan, water)
  // show up immediately.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const leave = () => (navigation?.canGoBack() ? navigation.goBack() : goToTab(navigation, 'Home'));

  // First load: full-screen spinner, or an error with Retry.
  if (!summary || !earn) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <ScreenHeader title={t('common.appName')} onBack={leave} onClose={() => goToTab(navigation, 'Home')} />
        {error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={36} color={colors.textPlaceholder} />
            <Text style={styles.centerText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load} accessibilityRole="button" accessibilityLabel={t('common.retry')}>
              <Text style={styles.retryBtnText}>{t('common.tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.centerText}>{t('rewards.loading')}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Defaults keep the page drawing even if the server leaves a field out.
  const balance = Number(summary.balance) || 0;
  const levelFloor = Number(summary.levelFloor) || 0;
  const levelGoal = Number(summary.levelGoal) || 0;
  const pointsToNext = Number(summary.pointsToNext) || 0;
  const { levelLabel, nextLevelLabel } = summary;
  const span = Math.max(1, levelGoal - levelFloor);
  const progress = nextLevelLabel ? Math.min(1, Math.max(0, (balance - levelFloor) / span)) : 1;
  const scan = earn.scan ?? { points: 0, doneToday: false };
  const water = earn.water ?? { glasses: 0, goal: 8, points: 0, rewarded: false };
  const referral = earn.referral ?? { points: 0, friends: [] };
  const friends = Array.isArray(referral.friends) ? referral.friends : [];
  const pendingFriends = friends.filter((f) => !f?.rewarded).length;
  const recent = Array.isArray(history) ? history : [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader title={t('common.appName')} onBack={leave} onClose={() => goToTab(navigation, 'Home')} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {/* Stale data stays visible; the banner explains why it isn't fresh. */}
        <ErrorBanner message={error} onRetry={load} onDismiss={() => setError(null)} />

        {/* ── Balance ── */}
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>{t('rewards.totalBalance')}</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{formatNumber(balance)}</Text>
            <Text style={styles.balanceUnit}>{t('common.points')}</Text>
          </View>
        </View>

        {/* ── Level progress ── */}
        <View style={styles.levelBlock}>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>{levelName(levelLabel)}</Text>
            <Text style={styles.levelFraction}>
              {nextLevelLabel ? `${formatNumber(balance)} / ${formatNumber(levelGoal)}` : `${formatNumber(balance)} ${t('common.points')}`}
            </Text>
          </View>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.levelHint}>
            {nextLevelLabel
              ? t('rewards.untilNext', { points: formatNumber(pointsToNext), level: levelName(nextLevelLabel) })
              : t('rewards.topLevel')}
          </Text>
        </View>

        {/* ── Earn more points ── */}
        <Text style={styles.sectionTitle}>{t('rewards.earnMore')}</Text>
        <View style={styles.earnList}>
          <EarnRow
            icon="sparkles" label={t('rewards.scanLabel')} color={colors.primary} bg={colors.primaryPale}
            desc={scan.doneToday ? t('rewards.scanDone') : t('rewards.scanTodo')}
            pill={scan.doneToday ? t('rewards.doneCheck') : `+${scan.points}`}
            done={!!scan.doneToday}
            onPress={() => navigation?.navigate('ScanFace')}
          />
          <EarnRow
            icon="water" label={t('rewards.waterLabel')} color="#1EA868" bg="#E7F7EE"
            desc={water.rewarded
              ? t('rewards.waterDone', { count: water.glasses })
              : water.glasses ? t('rewards.waterProgress', { count: water.glasses, goal: water.goal }) : t('rewards.waterTodo', { goal: water.goal })}
            pill={water.rewarded ? t('rewards.doneCheck') : `+${water.points}`}
            done={!!water.rewarded}
            onPress={() => navigation?.navigate('WaterLog')}
          />
          <EarnRow
            icon="person-add" label={t('rewards.referLabel')} color="#8870C0" bg="#F0EEFF"
            desc={friends.length
              ? `${t('rewards.referJoined', { count: friends.length })}${pendingFriends ? t('rewards.referPending', { count: pendingFriends }) : ''}`
              : t('rewards.referTodo')}
            pill={`+${referral.points}`}
            onPress={() => navigation?.navigate('ReferFriend')}
          />
        </View>

        {/* ── Recent history ── */}
        <Text style={styles.sectionTitle}>{t('rewards.recentHistory')}</Text>
        <View style={styles.historyCard}>
          {recent.length === 0 ? (
            <Text style={styles.emptyHistory}>{t('rewards.noHistory')}</Text>
          ) : (
            recent.map((item, i) => (
              <HistoryRow key={item.id ?? i} item={item} isLast={i === recent.length - 1} />
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.statementBtn}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('PointsStatement')}
          accessibilityRole="button"
          accessibilityLabel={t('rewards.fullStatementA11y')}
        >
          <Text style={styles.statementText}>{t('rewards.fullStatement')}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingBottom: 12 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  centerText: { fontSize: 14, color: colors.textLight, textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 22, paddingVertical: 11 },
  retryBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },

  balanceBlock: { alignItems: 'center', paddingTop: 28, paddingBottom: 8 },
  balanceLabel: { fontSize: 12, fontWeight: '800', color: colors.textLight, letterSpacing: 1.4 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 8 },
  balanceValue: { fontSize: 48, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
  balanceUnit: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 8 },

  levelBlock: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelLabel: { fontSize: 13.5, fontWeight: '800', color: colors.textMid },
  levelFraction: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  levelTrack: { height: 10, borderRadius: 5, backgroundColor: colors.roseDark, overflow: 'hidden' },
  levelFill: { height: 10, borderRadius: 5, backgroundColor: colors.primary },
  levelHint: { fontSize: 12.5, color: colors.textLight, fontWeight: '500', textAlign: 'center', marginTop: 10 },

  sectionTitle: {
    fontSize: 20, fontWeight: '800', color: colors.textDark,
    marginHorizontal: 20, marginTop: 26, marginBottom: 12,
  },

  earnList: { marginHorizontal: 20, gap: 12 },
  earnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  earnIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  earnText: { flex: 1, gap: 2 },
  earnLabel: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  earnDesc: { fontSize: 12.5, color: colors.textLight, fontWeight: '500' },
  earnPill: { backgroundColor: colors.primaryPale, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  earnPillText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  earnPillDone: { backgroundColor: '#E7F7EE' },
  earnPillTextDone: { color: '#1EA868' },

  historyCard: {
    marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 16,
  },
  emptyHistory: {
    fontSize: 13, color: colors.textLight, fontWeight: '500', textAlign: 'center', paddingVertical: 20,
  },
  historyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, gap: 10,
  },
  historyRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  historyLabel: { fontSize: 14.5, fontWeight: '700', color: colors.textDark, marginBottom: 3 },
  historyDate: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  historyPoints: { fontSize: 14.5, fontWeight: '800', color: '#1EA868' },
  historyPointsNeg: { color: '#D03050' },

  statementBtn: { alignItems: 'center', marginTop: 20, paddingVertical: 8 },
  statementText: { fontSize: 12.5, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 },
});
