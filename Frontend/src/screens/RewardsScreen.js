import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { useAuthedRequest } from '../api/useAuthedRequest';

// ─── Static catalog (ways to earn — not user data) ───────────────────────────

const EARN_ACTIONS = [
  { key: 'scan', icon: 'sparkles', label: 'Scan Face', desc: 'Analyze your skin today', points: 50, color: colors.primary, bg: colors.primaryPale },
  { key: 'water', icon: 'water', label: 'Log Water', desc: 'Stay hydrated for glow', points: 20, color: '#1EA868', bg: '#E7F7EE' },
  { key: 'refer', icon: 'person-add', label: 'Refer a Friend', desc: 'Share the routine', points: 500, color: '#8870C0', bg: '#F0EEFF' },
];

function formatHistoryDate(iso) {
  const date = new Date(iso);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isSameDay) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EarnRow({ item }) {
  return (
    <View style={styles.earnRow}>
      <View style={[styles.earnIcon, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.earnText}>
        <Text style={styles.earnLabel}>{item.label}</Text>
        <Text style={styles.earnDesc}>{item.desc}</Text>
      </View>
      <View style={styles.earnPill}>
        <Text style={styles.earnPillText}>+{item.points}</Text>
      </View>
    </View>
  );
}

function HistoryRow({ item, isLast }) {
  return (
    <View style={[styles.historyRow, !isLast && styles.historyRowBorder]}>
      <View>
        <Text style={[styles.historyLabel, item.faded && styles.historyLabelFaded]}>{item.label}</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
      <Text style={[styles.historyPoints, item.faded && styles.historyPointsFaded]}>
        +{item.points} pts
      </Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function RewardsScreen({ navigation }) {
  const request = useAuthedRequest();
  const [balance, setBalance] = useState(0);
  const [levelGoal, setLevelGoal] = useState(3000);
  const [levelLabel, setLevelLabel] = useState('Level 1: Fresh Start');
  const [nextLevelLabel, setNextLevelLabel] = useState('Level 2: Glow Getter');
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([request('/api/points/summary'), request('/api/points/history')])
        .then(([summary, historyRes]) => {
          if (cancelled) return;
          setBalance(summary.balance);
          setLevelGoal(summary.levelGoal);
          setLevelLabel(summary.levelLabel);
          if (summary.nextLevelLabel) setNextLevelLabel(summary.nextLevelLabel);
          setHistory(historyRes.history.map((h) => ({
            key: String(h.id),
            label: h.label,
            date: formatHistoryDate(h.createdAt),
            points: h.points,
            faded: false,
          })));
        })
        .catch(() => {
          // Keep whatever was already on screen if the backend is unreachable.
        });
      return () => { cancelled = true; };
    }, [request])
  );

  const progress = Math.min(1, balance / levelGoal);
  const remaining = Math.max(0, levelGoal - balance);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="MyFace AI"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.levelFraction}>{balance.toLocaleString()} / {levelGoal.toLocaleString()}</Text>
          </View>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.levelHint}>{remaining} points until {nextLevelLabel}</Text>
        </View>

        {/* ── Earn more points ── */}
        <Text style={styles.sectionTitle}>Earn More Points</Text>
        <View style={styles.earnList}>
          {EARN_ACTIONS.map((item) => (
            <EarnRow key={item.key} item={item} />
          ))}
        </View>

        {/* ── Recent history ── */}
        <Text style={styles.sectionTitle}>Recent History</Text>
        <View style={styles.historyCard}>
          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>No activity yet — complete a routine or scan to start earning.</Text>
          ) : (
            history.map((item, i) => (
              <HistoryRow key={item.key} item={item} isLast={i === history.length - 1} />
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.statementBtn}
          activeOpacity={0.7}
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

  historyCard: {
    marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 16,
  },
  emptyHistory: {
    fontSize: 13, color: colors.textLight, fontWeight: '500', textAlign: 'center', paddingVertical: 20,
  },
  historyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
  },
  historyRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  historyLabel: { fontSize: 14.5, fontWeight: '700', color: colors.textDark, marginBottom: 3 },
  historyLabelFaded: { color: colors.textFaint },
  historyDate: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  historyPoints: { fontSize: 14.5, fontWeight: '800', color: '#1EA868' },
  historyPointsFaded: { color: colors.textFaint },

  statementBtn: { alignItems: 'center', marginTop: 20 },
  statementText: { fontSize: 12.5, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 },
});
