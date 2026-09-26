import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { useI18n } from '../i18n';

const TABS = [
  { id: 'global', labelKey: 'leaderboard.global' },
  { id: 'weekly', labelKey: 'leaderboard.weekly' },
];
const DIR_ICON = { up: 'arrow-up', down: 'arrow-down', flat: 'remove' };
const DIR_COLOR = { up: '#1EA868', down: '#D03050', flat: colors.textFaint };

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function AvatarCircle({ name, size = 40, style }) {
  const colors_arr = ['#F9A8D4', '#6EE7B7', '#93C5FD', '#FCA5A5', '#C4B5FD'];
  const bg = colors_arr[name?.charCodeAt(0) % colors_arr.length] || '#E2E8F0';
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }, style]}>
      <Text style={{ fontSize: size * 0.32, fontWeight: '800', color: '#1a1a2e' }}>{getInitials(name)}</Text>
    </View>
  );
}

function PodiumCard({ user, metric, rank }) {
  const { t } = useI18n();
  const isFirst = rank === 1;
  const medalColor = rank === 1 ? '#F0B429' : rank === 2 ? '#A0AEC0' : '#D98A4A';
  const podiumHeight = rank === 1 ? 80 : rank === 2 ? 60 : 50;
  return (
    <View style={[podiumStyles.col, isFirst && podiumStyles.colFirst]}>
      {isFirst && <Ionicons name="star" size={16} color="#F0B429" style={{ marginBottom: 4 }} />}
      <View style={{ position: 'relative' }}>
        <AvatarCircle name={user.name} size={isFirst ? 64 : 52} style={{ borderWidth: 2.5, borderColor: isFirst ? '#F0B429' : colors.white }} />
        <View style={[podiumStyles.medal, { backgroundColor: medalColor }]}>
          <Text style={podiumStyles.medalText}>{rank}</Text>
        </View>
      </View>
      <Text style={podiumStyles.name} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
      <Text style={podiumStyles.score}>{metric === 'score' ? user.score : user.streak}</Text>
      <View style={[podiumStyles.base, { height: podiumHeight }]}>
        <Text style={podiumStyles.baseRank}>{t('leaderboard.rank', { rank })}</Text>
      </View>
    </View>
  );
}

const podiumStyles = StyleSheet.create({
  col: { alignItems: 'center', width: 100, gap: 4 },
  colFirst: { marginBottom: 0 },
  medal: {
    position: 'absolute', bottom: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.white,
  },
  medalText: { fontSize: 10, fontWeight: '800', color: colors.white },
  name: { fontSize: 12, fontWeight: '700', color: colors.textDark, marginTop: 4 },
  score: { fontSize: 17, fontWeight: '800', color: colors.primary },
  base: {
    width: '100%', backgroundColor: colors.primaryPale,
    borderTopLeftRadius: 10, borderTopRightRadius: 10,
    justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 6,
    borderWidth: 1, borderColor: colors.accentDark,
  },
  baseRank: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
});

function RankRow({ user, metric, isMe }) {
  const { t } = useI18n();
  return (
    <View style={[styles.rankRow, isMe && styles.rankRowMe]}>
      <Text style={[styles.rankNum, isMe && styles.rankNumMe]}>{user.rank}</Text>
      <AvatarCircle name={user.name} size={40} />
      <View style={styles.rankMeta}>
        <Text style={[styles.rankName, isMe && styles.rankNameMe]}>{user.name}{isMe ? t('leaderboard.you') : ''}</Text>
        <Text style={[styles.rankSub, isMe && styles.rankSubMe]}>
          {metric === 'score' ? t('leaderboard.dayStreak', { count: user.streak }) : t('leaderboard.ptsTotal', { count: user.score })}
        </Text>
      </View>
      <View style={styles.rankScoreCol}>
        <Text style={[styles.rankScore, isMe && styles.rankScoreMe]}>
          {metric === 'score' ? user.score : user.streak}
        </Text>
        <Text style={[styles.rankScoreLabel, isMe && styles.rankScoreLabelMe]}>
          {metric === 'score' ? t('leaderboard.pts') : t('leaderboard.days')}
        </Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen({ navigation }) {
  const request = useAuthedRequest();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('global');
  const [metric, setMetric] = useState('score');
  const [leaderboard, setLeaderboard] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      request('/api/leaderboard')
        .then(({ leaderboard: lb, me: myRow }) => {
          if (cancelled) return;
          setLeaderboard(lb || []);
          setMe(myRow);
        })
        .catch(() => { if (!cancelled) { setLeaderboard([]); setMe(null); } })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [request])
  );

  // Sort by selected metric
  const sorted = [...leaderboard].sort((a, b) =>
    metric === 'score' ? b.score - a.score : b.streak - a.streak
  ).map((u, i) => ({ ...u, rank: i + 1 }));

  const top3 = sorted.slice(0, 3);
  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const rest = sorted.slice(3);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader
        title={t('leaderboard.title')}
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{t(tab.labelKey)}</Text>
            {activeTab === tab.id && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : leaderboard.length === 0 ? (
        <View style={styles.loadingWrap}>
          <Ionicons name="trophy-outline" size={40} color={colors.textFaint} />
          <Text style={styles.emptyText}>{t('leaderboard.empty')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Metric toggle */}
          <View style={styles.metricRow}>
            <TouchableOpacity
              style={[styles.metricChip, metric === 'score' && styles.metricChipActive]}
              onPress={() => setMetric('score')}
            >
              <Ionicons name="trending-up" size={14} color={metric === 'score' ? colors.primary : colors.textMid} />
              <Text style={[styles.metricText, metric === 'score' && styles.metricTextActive]}>{t('leaderboard.points')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.metricChip, metric === 'streak' && styles.metricChipActive]}
              onPress={() => setMetric('streak')}
            >
              <Ionicons name="flame" size={14} color={metric === 'streak' ? colors.primary : colors.textMid} />
              <Text style={[styles.metricText, metric === 'streak' && styles.metricTextActive]}>{t('leaderboard.streak')}</Text>
            </TouchableOpacity>
          </View>

          {/* Podium */}
          {top3.length >= 1 && (
            <View style={styles.podiumWrap}>
              <View style={styles.podiumRow}>
                {podiumOrder.map((u) => (
                  <PodiumCard key={u.id} user={u} metric={metric} rank={u.rank} />
                ))}
              </View>
            </View>
          )}

          {/* Ranked list */}
          <View style={styles.rankList}>
            {rest.map((u) => (
              <RankRow key={u.id} user={u} metric={metric} isMe={me?.id === u.id} />
            ))}
          </View>

          {/* Me row if not in top 50 visible */}
          {me && !rest.find((u) => u.id === me.id) && !top3.find((u) => u.id === me.id) && (
            <RankRow user={me} metric={metric} isMe />
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: colors.textMid, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },

  tabBar: {
    flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  tabItem: { marginRight: 24, paddingVertical: 12, position: 'relative' },
  tabText: { fontSize: 15, fontWeight: '600', color: colors.textPlaceholder },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, backgroundColor: colors.primary, borderRadius: 2 },

  metricRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 14, marginBottom: 18 },
  metricChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight,
  },
  metricChipActive: { backgroundColor: colors.primaryPale, borderColor: colors.primary },
  metricText: { fontSize: 12.5, fontWeight: '700', color: colors.textMid },
  metricTextActive: { color: colors.primary },

  podiumWrap: { marginBottom: 24 },
  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8 },

  rankList: { gap: 8 },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  rankRowMe: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary, shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  rankNum: { width: 20, fontSize: 14, fontWeight: '700', color: colors.textFaint, textAlign: 'center' },
  rankNumMe: { color: 'rgba(255,255,255,0.8)' },
  rankMeta: { flex: 1 },
  rankName: { fontSize: 14.5, fontWeight: '700', color: colors.textDark },
  rankNameMe: { color: colors.white },
  rankSub: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  rankSubMe: { color: 'rgba(255,255,255,0.75)' },
  rankScoreCol: { alignItems: 'flex-end' },
  rankScore: { fontSize: 17, fontWeight: '800', color: colors.primary },
  rankScoreMe: { color: colors.white },
  rankScoreLabel: { fontSize: 10.5, color: colors.textLight, fontWeight: '600' },
  rankScoreLabelMe: { color: 'rgba(255,255,255,0.75)' },
});
