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

const RECENT_COUNT = 5;

// ─── Sub-components ───────────────────────────────────────────────────────────

function EarnRow({ icon, label, desc, pill, done, color, bg, onPress }) {
  return (
    <TouchableOpacity style={styles.earnRow} onPress={onPress} activeOpacity={0.8}
      accessibilityRole="button" accessibilityLabel={`${label}: ${desc}. ${pill}`}>
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
        <Text style={styles.historyLabel}>{item.label}</Text>
        <Text style={styles.historyDate}>{formatPointsDate(item.createdAt)}</Text>
      </View>
      <Text style={[styles.historyPoints, item.points < 0 && styles.historyPointsNeg]}>{formatPoints(item.points)}</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function RewardsScreen({ navigation }) {
  const request = useAuthedRequest();
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
      setHistory(h.history);
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
  if (!loadedOnce.current && !summary) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <ScreenHeader title="MyFace AI" onBack={leave} onClose={() => goToTab(navigation, 'Home')} />
        {error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={36} color={colors.textPlaceholder} />
            <Text style={styles.centerText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load} accessibilityRole="button" accessibilityLabel="Retry">
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.centerText}>Loading your points…</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const { balance, levelLabel, nextLevelLabel, levelFloor, levelGoal, pointsToNext } = summary;
  const span = Math.max(1, levelGoal - levelFloor);
  const progress = nextLevelLabel ? Math.min(1, Math.max(0, (balance - levelFloor) / span)) : 1;
  const water = earn.water;
  const friends = earn.referral.friends;
  const pendingFriends = friends.filter((f) => !f.rewarded).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader title="MyFace AI" onBack={leave} onClose={() => goToTab(navigation, 'Home')} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {/* Stale data stays visible; the banner explains why it isn't fresh. */}
        <ErrorBanner message={error} onRetry={load} onDismiss={() => setError(null)} />

        {/* ── Balance ── */}
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
            <Text style={styles.balanceUnit}>pts</Text>
          </View>
        </View>

        {/* ── Level progress ── */}
        <View style={styles.levelBlock}>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>{levelLabel}</Text>
            <Text style={styles.levelFraction}>
              {nextLevelLabel ? `${balance.toLocaleString()} / ${levelGoal.toLocaleString()}` : `${balance.toLocaleString()} pts`}
            </Text>
          </View>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.levelHint}>
            {nextLevelLabel
              ? `${pointsToNext.toLocaleString()} points until ${nextLevelLabel}`
              : 'You’ve reached the top level — amazing!'}
          </Text>
        </View>

        {/* ── Earn more points ── */}
        <Text style={styles.sectionTitle}>Earn More Points</Text>
        <View style={styles.earnList}>
          <EarnRow
            icon="sparkles" label="Scan Face" color={colors.primary} bg={colors.primaryPale}
            desc={earn.scan.doneToday ? 'Earned today — scan again tomorrow' : 'Analyze your skin today'}
            pill={earn.scan.doneToday ? 'Done ✓' : `+${earn.scan.points}`}
            done={earn.scan.doneToday}
            onPress={() => navigation?.navigate('ScanFace')}
          />
          <EarnRow
            icon="water" label="Log Water" color="#1EA868" bg="#E7F7EE"
            desc={water.rewarded
              ? `Goal reached · ${water.glasses} glasses today`
              : water.glasses ? `${water.glasses} of ${water.goal} glasses today` : `Stay hydrated for glow · ${water.goal} glasses`}
            pill={water.rewarded ? 'Done ✓' : `+${water.points}`}
            done={water.rewarded}
            onPress={() => navigation?.navigate('WaterLog')}
          />
          <EarnRow
            icon="person-add" label="Refer a Friend" color="#8870C0" bg="#F0EEFF"
            desc={friends.length
              ? `${friends.length} joined${pendingFriends ? ` · ${pendingFriends} pending` : ''}`
              : 'Share the routine'}
            pill={`+${earn.referral.points}`}
            onPress={() => navigation?.navigate('ReferFriend')}
          />
        </View>

        {/* ── Recent history ── */}
        <Text style={styles.sectionTitle}>Recent History</Text>
        <View style={styles.historyCard}>
          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>No activity yet — complete a routine or scan to start earning.</Text>
          ) : (
            history.map((item, i) => (
              <HistoryRow key={item.id} item={item} isLast={i === history.length - 1} />
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.statementBtn}
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('PointsStatement')}
          accessibilityRole="button"
          accessibilityLabel="View full statement"
        >
          <Text style={styles.statementText}>VIEW FULL STATEMENT</Text>
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
