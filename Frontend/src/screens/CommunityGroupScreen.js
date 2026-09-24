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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const DEFAULT_GROUP = {
  name: 'AI Pioneers Guild',
  members: '12.4k',
  joined: true,
  description: 'Sharing insights on the future of personal growth through AI.',
  banner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=60',
};

const TABS = ['Feed', 'Q&A', 'Members'];

const LEADERBOARD = [
  { key: 'alex', name: 'Alex R.', pts: '2.4k', rank: 2, uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=60' },
  { key: 'sarah', name: 'Sarah J.', pts: '3.1k', rank: 1, uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=60' },
  { key: 'davidk', name: 'David K.', pts: '2.1k', rank: 3, uri: 'https://images.unsplash.com/photo-1500336624523-d727130c3328?w=100&q=60' },
];
const LEADERBOARD_REST = [
  { key: 'lisa', name: 'Lisa Mayer', pts: '1.8k', rank: 4, initials: 'LM', color: '#8870C0', bg: '#F0EEFF' },
  { key: 'brian', name: 'Brian Tan', pts: '1.5k', rank: 5, initials: 'BT', color: '#1EA868', bg: '#E7F7EE' },
];

export default function CommunityGroupScreen({ route, navigation }) {
  const group = route?.params?.group ?? DEFAULT_GROUP;
  const [joined, setJoined] = useState(!!group.joined);
  const [activeTab, setActiveTab] = useState('Feed');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Banner ── */}
        <View style={styles.banner}>
          <Image source={{ uri: group.banner ?? DEFAULT_GROUP.banner }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay} />

          <View style={styles.bannerNav}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => navigation?.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => navigation?.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.bannerText}>
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={styles.membersRow}>
              <Ionicons name="people" size={13} color="rgba(255,255,255,0.85)" />
              <Text style={styles.membersText}>{group.members} Members</Text>
            </View>
          </View>
        </View>

        {/* ── Description + join ── */}
        <View style={styles.descRow}>
          <Text style={styles.descText}>{group.description ?? DEFAULT_GROUP.description}</Text>
          <TouchableOpacity
            style={[styles.joinBtn, joined && styles.joinBtnActive]}
            onPress={() => setJoined((v) => !v)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={joined ? 'Leave group' : 'Join group'}
          >
            <Text style={[styles.joinBtnText, joined && styles.joinBtnTextActive]}>
              {joined ? 'Joined' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>

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

        {activeTab !== 'Feed' ? (
          <View style={styles.emptyTab}>
            <Ionicons name="construct-outline" size={28} color={colors.textFaint} />
            <Text style={styles.emptyTabText}>
              {activeTab === 'Q&A' ? 'Q&A threads coming soon.' : 'Member list coming soon.'}
            </Text>
          </View>
        ) : (
          <>
            {/* ── Group streak banner ── */}
            <View style={styles.streakBanner}>
              <View style={styles.streakLeft}>
                <Ionicons name="flame" size={18} color={colors.white} />
                <View>
                  <Text style={styles.streakTitle}>Group Streak: 18 Days</Text>
                  <Text style={styles.streakSub}>Only 2 days left for the Gold badge!</Text>
                </View>
              </View>
              <View style={styles.streakPct}>
                <Text style={styles.streakPctText}>90%</Text>
              </View>
            </View>

            {/* ── Pinned posts ── */}
            <Text style={styles.sectionTitle}>PINNED POSTS</Text>
            <View style={styles.pinnedCard}>
              <Ionicons name="pin" size={14} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pinnedTitle}>Weekly Challenge: AI Habit Tracking</Text>
                <Text style={styles.pinnedDesc}>
                  Join us this week as we explore the best ways to integrate AI into your daily morning routine.
                </Text>
              </View>
            </View>

            {/* ── Mini leaderboard ── */}
            <View style={styles.miniHeader}>
              <Text style={styles.sectionTitle}>TOP 10 LEADERBOARD</Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Leaderboard')}
                accessibilityRole="button"
                accessibilityLabel="See full leaderboard"
              >
                <Text style={styles.seeAll}>SEE ALL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.miniPodiumRow}>
              {LEADERBOARD.map((u) => (
                <View key={u.key} style={styles.miniPodiumCol}>
                  <Image source={{ uri: u.uri }} style={[styles.miniAvatar, u.rank === 1 && styles.miniAvatarFirst]} />
                  <View style={[styles.miniTrophy, u.rank !== 1 && styles.miniTrophyHidden]}>
                    <Ionicons name="trophy" size={12} color="#F0B429" />
                  </View>
                  <Text style={styles.miniName} numberOfLines={1}>{u.name}</Text>
                  <Text style={styles.miniPts}>{u.pts} pts</Text>
                </View>
              ))}
            </View>

            <View style={styles.miniList}>
              {LEADERBOARD_REST.map((u) => (
                <View key={u.key} style={styles.miniRow}>
                  <Text style={styles.miniRank}>{u.rank}</Text>
                  <View style={[styles.miniInitialsAvatar, { backgroundColor: u.bg }]}>
                    <Text style={[styles.miniInitialsText, { color: u.color }]}>{u.initials}</Text>
                  </View>
                  <Text style={styles.miniRowName}>{u.name}</Text>
                  <Text style={styles.miniRowPts}>{u.pts} pts</Text>
                </View>
              ))}
            </View>

            {/* ── Latest discussions ── */}
            <Text style={styles.sectionTitle}>LATEST DISCUSSIONS</Text>
            <View style={styles.discussionCard}>
              <View style={styles.discussionHeader}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=60' }}
                  style={styles.discussionAvatar}
                />
                <View>
                  <Text style={styles.discussionName}>Marcus Chen</Text>
                  <Text style={styles.discussionTime}>2 hours ago</Text>
                </View>
              </View>
              <Text style={styles.discussionText}>
                How are you all using the new MyFace AI vision module to track your fitness routines? I'm finding it incredibly helpful for form correction!
              </Text>
              <View style={styles.discussionFooter}>
                <View style={styles.discussionAction}>
                  <Ionicons name="heart-outline" size={17} color={colors.textMid} />
                  <Text style={styles.discussionActionText}>24</Text>
                </View>
                <View style={styles.discussionAction}>
                  <Ionicons name="chatbubble-outline" size={16} color={colors.textMid} />
                  <Text style={styles.discussionActionText}>12</Text>
                </View>
                <Ionicons name="arrow-redo-outline" size={16} color={colors.textMid} />
              </View>
            </View>
          </>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },

  banner: { height: 190, justifyContent: 'flex-end' },
  bannerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,10,14,0.35)' },
  bannerNav: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 38 : 52,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.32)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  bannerText: { padding: 20 },
  groupName: { fontSize: 24, fontWeight: '800', color: colors.white, letterSpacing: -0.3 },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  membersText: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  descRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  descText: { flex: 1, fontSize: 13, color: colors.textMid, lineHeight: 19 },
  joinBtn: { borderRadius: 100, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primaryPale },
  joinBtnActive: { backgroundColor: colors.primary },
  joinBtnText: { fontSize: 13.5, fontWeight: '800', color: colors.primary },
  joinBtnTextActive: { color: colors.white },

  tabBar: {
    flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  tabItem: { marginRight: 26, paddingVertical: 13, position: 'relative' },
  tabText: { fontSize: 14.5, fontWeight: '600', color: colors.textPlaceholder },
  tabTextActive: { color: colors.primary, fontWeight: '800' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, backgroundColor: colors.primary, borderRadius: 2 },

  emptyTab: { alignItems: 'center', gap: 10, paddingVertical: 60 },
  emptyTabText: { fontSize: 13.5, color: colors.textLight, fontWeight: '500' },

  streakBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, marginTop: 16, borderRadius: 16, padding: 16,
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark, shadowOpacity: 0.28, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  streakTitle: { fontSize: 14.5, fontWeight: '800', color: colors.white },
  streakSub: { fontSize: 11.5, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 2 },
  streakPct: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center' },
  streakPctText: { fontSize: 13, fontWeight: '800', color: colors.white },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.textFaint, letterSpacing: 1, marginHorizontal: 20, marginTop: 22, marginBottom: 10 },

  pinnedCard: {
    flexDirection: 'row', gap: 10, marginHorizontal: 20, backgroundColor: colors.white,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.borderLight,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  pinnedTitle: { fontSize: 13.5, fontWeight: '800', color: colors.textDark, marginBottom: 3 },
  pinnedDesc: { fontSize: 12.5, color: colors.textMid, lineHeight: 18 },

  miniHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20 },
  seeAll: { fontSize: 11.5, fontWeight: '800', color: colors.primary, letterSpacing: 0.6, marginTop: 22 },

  miniPodiumRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, marginBottom: 14 },
  miniPodiumCol: { alignItems: 'center', width: 84 },
  miniAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: colors.white },
  miniAvatarFirst: { width: 62, height: 62, borderRadius: 31, borderColor: '#F0B429', borderWidth: 3 },
  miniTrophy: { marginTop: -10, marginBottom: 2 },
  miniTrophyHidden: { opacity: 0 },
  miniName: { fontSize: 12, fontWeight: '700', color: colors.textDark },
  miniPts: { fontSize: 12.5, fontWeight: '800', color: colors.primary },

  miniList: { marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 14 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  miniRank: { width: 16, fontSize: 13, fontWeight: '700', color: colors.textFaint },
  miniInitialsAvatar: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  miniInitialsText: { fontSize: 11, fontWeight: '800' },
  miniRowName: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.textDark },
  miniRowPts: { fontSize: 13, fontWeight: '800', color: colors.textMid },

  discussionCard: { marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borderLight, gap: 12 },
  discussionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  discussionAvatar: { width: 36, height: 36, borderRadius: 18 },
  discussionName: { fontSize: 13.5, fontWeight: '800', color: colors.textDark },
  discussionTime: { fontSize: 11, color: colors.textLight, fontWeight: '500' },
  discussionText: { fontSize: 13.5, lineHeight: 20, color: colors.textMid },
  discussionFooter: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  discussionAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  discussionActionText: { fontSize: 12.5, fontWeight: '600', color: colors.textMid },
});
