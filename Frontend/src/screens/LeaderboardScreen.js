import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

// ─── Data ─────────────────────────────────────────────────────────────────────

const TABS = ['Global', 'Friends', 'Weekly'];

const PODIUM = [
  { key: 'liam', rank: 2, name: 'Liam K.', score: 942, streak: 28, delta: 12, uri: 'https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=200&q=60' },
  { key: 'sophia', rank: 1, name: 'Sophia R.', score: 988, streak: 41, delta: 4, uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=60' },
  { key: 'marcus', rank: 3, name: 'Marcus J.', score: 915, streak: 19, delta: 22, uri: 'https://images.unsplash.com/photo-1500336624523-d727130c3328?w=200&q=60' },
];

const RANKED = [
  { key: 'elena', rank: 4, name: 'Elena Vance', score: 892, streak: 22, pos: 12, dir: 'up', uri: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=100&q=60' },
  { key: 'david', rank: 5, name: 'David Chen', score: 875, streak: 17, pos: 1, dir: 'down', uri: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&q=60' },
  { key: 'chloe', rank: 6, name: 'Chloe Smith', score: 861, streak: 15, pos: 0, dir: 'flat', uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=60' },
  { key: 'omar', rank: 7, name: 'Omar Hadid', score: 844, streak: 9, pos: 3, dir: 'up', uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=60' },
];

const ME = { rank: 42, name: 'You (Jane Doe)', score: 712, streak: 6, pos: 8, sub: 'Top 15% this week' };

const DIR_ICON = { up: 'arrow-up', down: 'arrow-down', flat: 'remove' };
const DIR_COLOR = { up: '#1EA868', down: '#D03050', flat: colors.textFaint };

// ─── Sub-components ───────────────────────────────────────────────────────────

function PodiumCard({ user, metric }) {
  const isFirst = user.rank === 1;
  const medalColor = user.rank === 1 ? '#F0B429' : user.rank === 2 ? '#A0AEC0' : '#D98A4A';
  return (
    <View style={[styles.podiumCol, isFirst && styles.podiumColFirst]}>
      <View style={[styles.podiumAvatarWrap, isFirst && styles.podiumAvatarWrapFirst]}>
        {isFirst && <Ionicons name="star" size={16} color="#F0B429" style={styles.podiumStar} />}
        <Image source={{ uri: user.uri }} style={[styles.podiumAvatar, isFirst && styles.podiumAvatarFirst]} />
        <View style={[styles.medalBadge, { backgroundColor: medalColor }]}>
          <Text style={styles.medalText}>{user.rank}</Text>
        </View>
      </View>
      <View style={[styles.podiumCard, isFirst && styles.podiumCardFirst]}>
        <Text style={styles.podiumName} numberOfLines={1}>{user.name}</Text>
        <Text style={styles.podiumScore}>{metric === 'score' ? user.score : user.streak}</Text>
        <Text style={styles.podiumDelta}>+{user.delta}</Text>
      </View>
    </View>
  );
}

function RankRow({ user, metric }) {
  return (
    <View style={styles.rankRow}>
      <Text style={styles.rankNum}>{user.rank}</Text>
      <Image source={{ uri: user.uri }} style={styles.rankAvatar} />
      <View style={styles.rankMeta}>
        <Text style={styles.rankName}>{user.name}</Text>
        <View style={styles.rankPosRow}>
          <Ionicons name={DIR_ICON[user.dir]} size={11} color={DIR_COLOR[user.dir]} />
          <Text style={[styles.rankPos, { color: DIR_COLOR[user.dir] }]}>{user.pos} pos</Text>
        </View>
      </View>
      <View style={styles.rankScoreCol}>
        <Text style={styles.rankScore}>{metric === 'score' ? user.score : user.streak}</Text>
        <Text style={styles.rankScoreLabel}>{metric === 'score' ? 'Face Score' : 'Day Streak'}</Text>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function LeaderboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Global');
  const [metric, setMetric] = useState('score');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="MyFace AI"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={styles.tabItem}
            onPress={() => setActiveTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === t }}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
            {activeTab === t && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Metric toggle ── */}
        <View style={styles.metricRow}>
          <TouchableOpacity
            style={[styles.metricChip, metric === 'score' && styles.metricChipActive]}
            onPress={() => setMetric('score')}
            accessibilityRole="button"
            accessibilityLabel="Sort by score"
          >
            <Ionicons name="trending-up" size={14} color={metric === 'score' ? colors.primary : colors.textMid} />
            <Text style={[styles.metricText, metric === 'score' && styles.metricTextActive]}>Score</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricChip, metric === 'streak' && styles.metricChipActive]}
            onPress={() => setMetric('streak')}
            accessibilityRole="button"
            accessibilityLabel="Sort by streak"
          >
            <Ionicons name="flame" size={14} color={metric === 'streak' ? colors.primary : colors.textMid} />
            <Text style={[styles.metricText, metric === 'streak' && styles.metricTextActive]}>Streak</Text>
          </TouchableOpacity>
        </View>

        {/* ── Podium ── */}
        <View style={styles.podiumRow}>
          {PODIUM.map((u) => <PodiumCard key={u.key} user={u} metric={metric} />)}
        </View>

        {/* ── Ranked list ── */}
        <View style={styles.rankList}>
          {RANKED.map((u) => <RankRow key={u.key} user={u} metric={metric} />)}
        </View>

        {/* ── Me row ── */}
        <View style={styles.meRow}>
          <Text style={styles.meRank}>{ME.rank}</Text>
          <View style={styles.meAvatar}>
            <Text style={styles.meAvatarText}>JD</Text>
          </View>
          <View style={styles.rankMeta}>
            <Text style={styles.meName}>{ME.name}</Text>
            <Text style={styles.meSub}>{ME.sub}</Text>
          </View>
          <View style={styles.rankScoreCol}>
            <Text style={styles.meScore}>{metric === 'score' ? ME.score : ME.streak}</Text>
            <View style={styles.meDeltaRow}>
              <Ionicons name="arrow-up" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.meDelta}>{ME.pos} pos</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
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

  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 24 },
  podiumCol: { alignItems: 'center', width: 96 },
  podiumColFirst: { marginBottom: 16 },
  podiumAvatarWrap: { position: 'relative', marginBottom: 8 },
  podiumAvatarWrapFirst: {},
  podiumStar: { position: 'absolute', top: -18, alignSelf: 'center', zIndex: 2 },
  podiumAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: colors.white },
  podiumAvatarFirst: { width: 76, height: 76, borderRadius: 38, borderColor: '#F0B429', borderWidth: 3 },
  medalBadge: {
    position: 'absolute', bottom: -4, alignSelf: 'center',
    width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  medalText: { fontSize: 11, fontWeight: '800', color: colors.white },
  podiumCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 12, alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: colors.borderLight,
  },
  podiumCardFirst: { borderColor: '#F0B429', borderWidth: 1.5 },
  podiumName: { fontSize: 12.5, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
  podiumScore: { fontSize: 18, fontWeight: '800', color: colors.primary },
  podiumDelta: { fontSize: 11, fontWeight: '700', color: '#1EA868', marginTop: 2 },

  rankList: { gap: 10 },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  rankNum: { width: 20, fontSize: 14, fontWeight: '700', color: colors.textFaint, textAlign: 'center' },
  rankAvatar: { width: 40, height: 40, borderRadius: 20 },
  rankMeta: { flex: 1, gap: 3 },
  rankName: { fontSize: 14.5, fontWeight: '700', color: colors.textDark },
  rankPosRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rankPos: { fontSize: 11.5, fontWeight: '700' },
  rankScoreCol: { alignItems: 'flex-end' },
  rankScore: { fontSize: 17, fontWeight: '800', color: colors.primary },
  rankScoreLabel: { fontSize: 10.5, color: colors.textLight, fontWeight: '600' },

  meRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.primary, borderRadius: 16, padding: 14, marginTop: 16,
    shadowColor: colors.primaryDark, shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  meRank: { width: 20, fontSize: 14, fontWeight: '800', color: colors.white, textAlign: 'center' },
  meAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  meAvatarText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  meName: { fontSize: 15, fontWeight: '800', color: colors.white },
  meSub: { fontSize: 11.5, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  meScore: { fontSize: 19, fontWeight: '800', color: colors.white },
  meDeltaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meDelta: { fontSize: 11.5, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },
});
