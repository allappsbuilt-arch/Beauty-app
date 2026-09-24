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

const TABS = ['Active', 'Available', 'Completed'];

const ACTIVE_MAIN = {
  key: 'glow-routine',
  title: 'Glow Routine',
  desc: 'Consistent facial massage',
  streak: 12,
  day: 12,
  total: 21,
  friends: [
    { key: 'jd', initials: 'JD', color: '#8870C0', bg: '#F0EEFF' },
    { key: 'ak', initials: 'AK', color: colors.primary, bg: colors.primaryPale },
    { key: 'ml', initials: 'ML', color: '#1EA868', bg: '#E7F7EE' },
  ],
  friendCompare: { name: 'Sarah', score: 84, uri: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=60' },
};

const ACTIVE_MINI = { key: 'hydration', title: 'Hydration Hero', desc: '5 days remaining', rank: 4 };

const AVAILABLE = [
  { key: 'jawline', title: 'Jawline Sculpt 2024', meta: '30 Day program · Beginner', uri: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&q=60', featured: true },
  { key: 'eye-revival', title: 'Eye Revival Series', meta: '14 Day program · Advanced', uri: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300&q=60', featured: false },
];

const BADGES = [
  { key: 'reset', icon: 'ribbon', label: '7 Day Reset', color: '#8870C0', bg: '#F0EEFF' },
  { key: 'early', icon: 'checkmark-circle', label: 'Early Bird', color: '#1EA868', bg: '#E7F7EE' },
  { key: 'summer', icon: 'medal', label: 'Summer Glow', color: colors.primary, bg: colors.primaryPale },
];

export default function ChallengesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [joined, setJoined] = useState({});

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
        {activeTab === 'Active' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Your Challenges</Text>
              <Text style={styles.activeCount}>2 ACTIVE</Text>
            </View>

            <TouchableOpacity
              style={styles.mainCard}
              activeOpacity={0.88}
              onPress={() =>
                navigation?.navigate('FriendCompare', {
                  friend: ACTIVE_MAIN.friendCompare,
                  day: ACTIVE_MAIN.day,
                  total: ACTIVE_MAIN.total,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Open ${ACTIVE_MAIN.title} challenge`}
            >
              <View style={styles.mainHeader}>
                <View>
                  <Text style={styles.mainTitle}>{ACTIVE_MAIN.title}</Text>
                  <Text style={styles.mainDesc}>{ACTIVE_MAIN.desc}</Text>
                </View>
                <View style={styles.streakPill}>
                  <Ionicons name="flame" size={12} color={colors.primary} />
                  <Text style={styles.streakPillText}>{ACTIVE_MAIN.streak} Day Streak</Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Day {ACTIVE_MAIN.day} of {ACTIVE_MAIN.total}</Text>
                <Text style={styles.progressPct}>{Math.round((ACTIVE_MAIN.day / ACTIVE_MAIN.total) * 100)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(ACTIVE_MAIN.day / ACTIVE_MAIN.total) * 100}%` }]} />
              </View>

              <View style={styles.divider} />

              <Text style={styles.friendsLabel}>FRIENDS IN CHALLENGE</Text>
              <View style={styles.friendsRow}>
                {ACTIVE_MAIN.friends.map((f) => (
                  <View key={f.key} style={[styles.friendAvatar, { backgroundColor: f.bg }]}>
                    <Text style={[styles.friendInitials, { color: f.color }]}>{f.initials}</Text>
                  </View>
                ))}
                <Text style={styles.friendsMore}>+8 others</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.miniCard}>
              <View style={styles.miniIcon}>
                <Ionicons name="water" size={18} color="#1EA868" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.miniTitle}>{ACTIVE_MINI.title}</Text>
                <Text style={styles.miniDesc}>{ACTIVE_MINI.desc}</Text>
              </View>
              <View style={styles.miniRankCol}>
                <Text style={styles.miniRank}>#{ACTIVE_MINI.rank}</Text>
                <Text style={styles.miniRankLabel}>RANK</Text>
              </View>
            </View>
          </>
        )}

        {activeTab !== 'Active' && (
          <View style={styles.emptyTab}>
            <Ionicons name="hourglass-outline" size={28} color={colors.textFaint} />
            <Text style={styles.emptyTabText}>
              {activeTab === 'Available' ? 'Browse new challenges below.' : 'No completed challenges yet.'}
            </Text>
          </View>
        )}

        {/* ── Available for you ── */}
        <Text style={styles.sectionTitle}>Available for You</Text>
        <View style={styles.availableList}>
          {AVAILABLE.map((item) => (
            <View key={item.key} style={styles.availableCard}>
              <Image source={{ uri: item.uri }} style={styles.availableImage} resizeMode="cover" />
              <View style={styles.availableBody}>
                <Text style={styles.availableTitle}>{item.title}</Text>
                <Text style={styles.availableMeta}>{item.meta}</Text>
                <TouchableOpacity
                  style={[styles.joinBtn, item.featured && !joined[item.key] && styles.joinBtnFilled, joined[item.key] && styles.joinBtnDone]}
                  onPress={() => setJoined((v) => ({ ...v, [item.key]: true }))}
                  disabled={!!joined[item.key]}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`Join ${item.title}`}
                >
                  <Text style={[
                    styles.joinBtnText,
                    item.featured && !joined[item.key] && styles.joinBtnTextFilled,
                    joined[item.key] && styles.joinBtnTextDone,
                  ]}>
                    {joined[item.key] ? 'Joined' : 'Join Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ── Past triumphs ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Past Triumphs</Text>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </View>
        <View style={styles.badgeRow}>
          {BADGES.map((b) => (
            <View key={b.key} style={styles.badgeCol}>
              <View style={[styles.badgeCircle, { backgroundColor: b.bg, borderColor: b.color + '55' }]}>
                <Ionicons name={b.icon} size={24} color={b.color} />
              </View>
              <Text style={styles.badgeLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },

  tabBar: {
    flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  tabItem: { marginRight: 26, paddingVertical: 13, position: 'relative' },
  tabText: { fontSize: 14.5, fontWeight: '600', color: colors.textPlaceholder },
  tabTextActive: { color: colors.primary, fontWeight: '800' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, backgroundColor: colors.primary, borderRadius: 2 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, marginBottom: 14 },
  activeCount: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  viewAll: { fontSize: 11.5, fontWeight: '800', color: colors.primary, letterSpacing: 0.5, marginBottom: 14 },

  mainCard: {
    backgroundColor: colors.white, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 14,
    shadowColor: colors.shadow, shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mainTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  mainDesc: { fontSize: 12.5, color: colors.textLight, fontWeight: '500', marginTop: 2 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primaryPale, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  streakPillText: { fontSize: 11, fontWeight: '800', color: colors.primary },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  progressLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textMid },
  progressPct: { fontSize: 12.5, fontWeight: '800', color: colors.primary },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.roseDark, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderUltraLight, marginVertical: 16 },
  friendsLabel: { fontSize: 10.5, fontWeight: '800', color: colors.textFaint, letterSpacing: 0.8, marginBottom: 10 },
  friendsRow: { flexDirection: 'row', alignItems: 'center' },
  friendAvatar: {
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    marginRight: -8, borderWidth: 2, borderColor: colors.white,
  },
  friendInitials: { fontSize: 10.5, fontWeight: '800' },
  friendsMore: { fontSize: 12.5, color: colors.textLight, fontWeight: '600', marginLeft: 16 },

  miniCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 4,
  },
  miniIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E7F7EE', justifyContent: 'center', alignItems: 'center' },
  miniTitle: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  miniDesc: { fontSize: 12, color: colors.textLight, fontWeight: '500', marginTop: 2 },
  miniRankCol: { alignItems: 'flex-end' },
  miniRank: { fontSize: 16, fontWeight: '800', color: '#1EA868' },
  miniRankLabel: { fontSize: 9.5, color: colors.textFaint, fontWeight: '700', letterSpacing: 0.5 },

  emptyTab: { alignItems: 'center', gap: 10, paddingVertical: 30 },
  emptyTabText: { fontSize: 13.5, color: colors.textLight, fontWeight: '500' },

  availableList: { gap: 12 },
  availableCard: {
    flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  availableImage: { width: 68, height: 68, borderRadius: 12, backgroundColor: colors.sectionBg },
  availableBody: { flex: 1, gap: 4, justifyContent: 'center' },
  availableTitle: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  availableMeta: { fontSize: 12, color: colors.textLight, fontWeight: '500', marginBottom: 4 },
  joinBtn: {
    alignSelf: 'flex-start', borderRadius: 100, paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  joinBtnFilled: { backgroundColor: colors.primary },
  joinBtnDone: { borderColor: colors.borderLight, backgroundColor: colors.sectionBg },
  joinBtnText: { fontSize: 12.5, fontWeight: '800', color: colors.primary },
  joinBtnTextFilled: { color: colors.white },
  joinBtnTextDone: { color: colors.textFaint },

  badgeRow: { flexDirection: 'row', gap: 20 },
  badgeCol: { alignItems: 'center', gap: 8, width: 76 },
  badgeCircle: {
    width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderStyle: 'dashed',
  },
  badgeLabel: { fontSize: 11.5, fontWeight: '700', color: colors.textMid, textAlign: 'center' },
});
