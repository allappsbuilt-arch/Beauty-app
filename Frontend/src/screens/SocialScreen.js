import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
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
import PostCard from '../components/social/PostCard';
import UserAvatar from '../components/social/UserAvatar';
import { usePostList } from '../components/social/usePostList';
import { avatarColors, firstName, initialsOf } from '../components/social/socialUtils';
import { goToTab } from '../utils/navigation';

const TABS = [
  { key: 'following', label: 'Following' },
  { key: 'discover', label: 'Discover' },
];

// ─── Live Banner ──────────────────────────────────────────────────────────────
// The daily guided mindfulness session. "LIVE NOW" only shows while other
// members are actually in the session; otherwise it shows today's count.

function LiveBanner({ live, onPress }) {
  const isLive = live?.liveCount > 0;
  const pill = isLive
    ? `LIVE NOW · ${live.liveCount} IN SESSION`
    : live?.completedToday ? 'DONE TODAY ✓' : live?.todayCount ? `${live.todayCount} JOINED TODAY` : 'DAILY SESSION';
  return (
    <TouchableOpacity
      style={styles.liveBanner}
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${isLive ? 'Join live' : 'Start'}: ${live?.title ?? 'Daily Mindfulness Routine'}`}
    >
      <View style={styles.liveAvatarWrap}>
        <View style={styles.liveAvatar}>
          <Ionicons name={isLive ? 'person' : 'leaf'} size={16} color={colors.white} />
        </View>
        {isLive && (
          <View style={styles.liveDotBadge}>
            <View style={styles.liveDotInner} />
          </View>
        )}
      </View>

      <View style={styles.liveText}>
        <View style={styles.liveLabelRow}>
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>{pill}</Text>
          </View>
        </View>
        <Text style={styles.liveTitle} numberOfLines={1}>{live?.title ?? 'Daily Mindfulness Routine'}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
    </TouchableOpacity>
  );
}

// ─── Stories ─────────────────────────────────────────────────────────────────

function StoryBubble({ label, user, isAdd, onPress }) {
  const { color, bg } = avatarColors(user?.id || '');
  return (
    <TouchableOpacity
      style={styles.storyWrap}
      activeOpacity={0.80}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isAdd ? 'Create new story' : `${label}'s story`}
    >
      <View style={[styles.storyRing, isAdd ? styles.storyRingAdd : styles.storyRingActive]}>
        <View style={[styles.storyCircle, { backgroundColor: isAdd ? colors.primaryPale : bg }]}>
          {isAdd
            ? <Ionicons name="add" size={22} color={colors.primary} />
            : <Text style={[styles.storyInitials, { color }]}>{initialsOf(user?.name)}</Text>}
        </View>
        {isAdd && (
          <View style={styles.addBadge}>
            <Ionicons name="add" size={10} color={colors.white} />
          </View>
        )}
      </View>
      <Text style={styles.storyLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onToggle }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={styles.tabItem}
          onPress={() => onToggle(t.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === t.key }}
          accessibilityLabel={t.label}
        >
          <Text style={[styles.tabText, active === t.key && styles.tabTextActive]}>{t.label}</Text>
          {active === t.key && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── People to follow ────────────────────────────────────────────────────────

function Suggestions({ users, navigation }) {
  if (!users.length) return null;
  return (
    <View style={styles.suggestWrap}>
      <Text style={styles.suggestTitle}>PEOPLE TO FOLLOW</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
        {users.map((u) => (
          <TouchableOpacity key={u.id} style={styles.suggestCard}
            onPress={() => navigation?.navigate('UserProfile', { userId: u.id })}
            accessibilityRole="button" accessibilityLabel={`Open ${u.name}'s profile`}>
            <UserAvatar user={u} size={46} />
            <Text style={styles.suggestName} numberOfLines={1}>{firstName(u.name)}</Text>
            <Text style={styles.suggestAction}>View</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

const emptyTab = { loaded: false, loading: false, error: null, cursor: null, loadingMore: false };

export default function SocialScreen({ navigation }) {
  const request = useAuthedRequest();
  const [activeTab, setActiveTab] = useState('following');
  const [tabState, setTabState] = useState({ following: emptyTab, discover: emptyTab });
  const [live, setLive] = useState(null);
  const [stories, setStories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [headerError, setHeaderError] = useState(null);

  // Each tab keeps its own list; both stay in sync with likes/comments/etc.
  const staleRef = useRef(false);
  const markStale = useCallback(() => { staleRef.current = true; }, []);
  const [followingPosts, setFollowingPosts] = usePostList(markStale);
  const [discoverPosts, setDiscoverPosts] = usePostList(markStale);
  const setters = { following: setFollowingPosts, discover: setDiscoverPosts };
  const posts = activeTab === 'following' ? followingPosts : discoverPosts;
  const tab = tabState[activeTab];

  const patchTab = (key, patch) => setTabState((s) => ({ ...s, [key]: { ...s[key], ...patch } }));

  const loadFeed = useCallback(async (key, { more = false } = {}) => {
    const cursor = more ? tabState[key].cursor : null;
    if (more && !cursor) return;
    patchTab(key, more ? { loadingMore: true } : { loading: true, error: null });
    try {
      const q = `/api/social/feed?tab=${key}${cursor ? `&before=${encodeURIComponent(cursor)}` : ''}`;
      const data = await request(q);
      setters[key]((list) => (more ? [...list, ...data.posts.filter((p) => !list.some((x) => x.id === p.id))] : data.posts));
      patchTab(key, { loaded: true, loading: false, loadingMore: false, cursor: data.nextCursor, error: null });
    } catch (err) {
      patchTab(key, { loading: false, loadingMore: false, error: err.message || 'Could not load posts.' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, tabState]);

  const loadHeader = useCallback(async () => {
    setHeaderError(null);
    try {
      const [l, s, sug] = await Promise.all([
        request('/api/social/live'),
        request('/api/social/stories'),
        request('/api/social/suggestions'),
      ]);
      setLive(l);
      setStories(s.stories);
      setSuggestions(sug.users);
    } catch (err) {
      setHeaderError(err.message || 'Could not load stories.');
    }
  }, [request]);

  // Refresh stories/live on every visit; the feed when first shown or after
  // the user posted something.
  useFocusEffect(useCallback(() => {
    loadHeader();
    if (staleRef.current) {
      staleRef.current = false;
      loadFeed('following');
      loadFeed('discover');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  // First load of each tab.
  useEffect(() => {
    if (!tabState[activeTab].loaded && !tabState[activeTab].loading) loadFeed(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadHeader(), loadFeed(activeTab)]);
    setRefreshing(false);
  };

  const myStories = stories.find((g) => g.isMine);
  const otherStories = stories.filter((g) => !g.isMine);
  const openStories = (group) => navigation?.navigate('StoryViewer', { groups: stories, startUserId: group.user.id });

  const header = (
    <>
      <LiveBanner live={live} onPress={() => navigation?.navigate('MindfulnessSession')} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesRow} style={styles.storiesScroll}>
        <StoryBubble isAdd label="New Story" onPress={() => navigation?.navigate('CreatePost', { mode: 'story' })} />
        {myStories && <StoryBubble label="Your story" user={myStories.user} onPress={() => openStories(myStories)} />}
        {otherStories.map((g) => (
          <StoryBubble key={g.user.id} label={firstName(g.user.name)} user={g.user} onPress={() => openStories(g)} />
        ))}
      </ScrollView>

      {tab.error
        ? <ErrorBanner message={tab.error} onRetry={refresh} />
        : <ErrorBanner message={headerError} onRetry={loadHeader} onDismiss={() => setHeaderError(null)} />}
      {activeTab === 'discover' && <Suggestions users={suggestions} navigation={navigation} />}
    </>
  );

  const empty = tab.error && !tab.loading ? (
    // The error banner (with Retry) is shown in the list header.
    <View style={styles.stateWrap}>
      <Ionicons name="cloud-offline-outline" size={34} color={colors.textPlaceholder} />
      <Text style={styles.stateText}>Posts couldn’t be loaded.</Text>
    </View>
  ) : tab.loading || !tab.loaded ? (
    <View style={styles.stateWrap}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.stateText}>Loading posts…</Text>
    </View>
  ) : (
    <View style={styles.stateWrap}>
      <Ionicons name={activeTab === 'following' ? 'people-outline' : 'sparkles-outline'} size={34} color={colors.primary} />
      <Text style={styles.stateTitle}>{activeTab === 'following' ? 'Your feed is empty' : 'No posts yet'}</Text>
      <Text style={styles.stateText}>
        {activeTab === 'following'
          ? 'Share your first post, or follow people from Discover to see their updates here.'
          : 'Be the first to share your routine with the community.'}
      </Text>
      <View style={styles.stateActions}>
        <TouchableOpacity style={styles.stateBtn} onPress={() => navigation?.navigate('CreatePost', { mode: 'post' })}
          accessibilityRole="button" accessibilityLabel="Create a post">
          <Text style={styles.stateBtnText}>Create a Post</Text>
        </TouchableOpacity>
        {activeTab === 'following' && (
          <TouchableOpacity style={[styles.stateBtn, styles.stateBtnGhost]} onPress={() => setActiveTab('discover')}
            accessibilityRole="button" accessibilityLabel="Go to Discover">
            <Text style={[styles.stateBtnText, styles.stateBtnGhostText]}>Discover</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Nav bar ── */}
      <ScreenHeader
        title="MyFace AI"
        onBack={() => (navigation?.canGoBack() ? navigation.goBack() : goToTab(navigation, 'Home'))}
        bordered={false}
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation?.navigate('Leaderboard')}
              accessibilityRole="button" accessibilityLabel="Leaderboard">
              <Ionicons name="podium-outline" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation?.navigate('MyCommunities')}
              accessibilityRole="button" accessibilityLabel="Communities">
              <Ionicons name="people-outline" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => goToTab(navigation, 'Home')}
              accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* ── Following / Discover tabs ── */}
      <TabBar active={activeTab} onToggle={setActiveTab} />

      {/* ── Feed ── */}
      <FlatList
        style={styles.scroll}
        contentContainerStyle={styles.feed}
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} navigation={navigation} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          tab.loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
            : <View style={{ height: 80 }} />
        }
        onEndReached={() => loadFeed(activeTab, { more: true })}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation?.navigate('CreatePost', { mode: 'post' })}
        accessibilityRole="button"
        accessibilityLabel="Create new post"
      >
        <Ionicons name="add" size={26} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1, backgroundColor: colors.primaryBg },
  feed:   { paddingBottom: 20, flexGrow: 1 },

  // ── Header actions ───────────────────────────────────────
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  headerIconBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Tabs ─────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tabItem: {
    marginRight: 24,
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 15, fontWeight: '600',
    color: colors.textPlaceholder,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // ── Live banner ───────────────────────────────────────────
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  liveAvatarWrap: { position: 'relative' },
  liveAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.40)',
  },
  liveDotBadge: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
  },
  liveDotInner: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  liveText: { flex: 1, gap: 3 },
  liveLabelRow: { flexDirection: 'row' },
  livePill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 100,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  livePillText: {
    fontSize: 9, fontWeight: '800',
    color: colors.white, letterSpacing: 1,
  },
  liveTitle: {
    fontSize: 14, fontWeight: '700',
    color: colors.white, letterSpacing: 0.1,
  },

  // ── Stories ───────────────────────────────────────────────
  storiesScroll: { backgroundColor: colors.white, marginTop: 10, flexGrow: 0 },
  storiesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  storyWrap: { alignItems: 'center', gap: 5, width: 64 },
  storyRing: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  storyRingActive: {
    borderWidth: 2.5,
    borderColor: colors.primary,
    padding: 2,
  },
  storyRingAdd: {
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  storyCircle: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
  },
  storyInitials: { fontSize: 15, fontWeight: '800' },
  addBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  storyLabel: {
    fontSize: 11, fontWeight: '500',
    color: colors.textMid,
    maxWidth: 60, textAlign: 'center',
  },

  // ── Suggestions ───────────────────────────────────────────
  suggestWrap: { backgroundColor: colors.white, paddingTop: 12, paddingBottom: 14, marginBottom: 10 },
  suggestTitle: { fontSize: 10, fontWeight: '700', color: colors.textFaint, letterSpacing: 1.4, marginHorizontal: 16, marginBottom: 10 },
  suggestRow: { paddingHorizontal: 16, gap: 10 },
  suggestCard: {
    width: 92, alignItems: 'center', gap: 6, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.white,
  },
  suggestName: { fontSize: 12.5, fontWeight: '700', color: colors.textDark, maxWidth: 80 },
  suggestAction: { fontSize: 11.5, fontWeight: '700', color: colors.primary },

  // ── Loading / empty states ───────────────────────────────
  stateWrap: { alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 40 },
  stateTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark, marginTop: 4 },
  stateText: { fontSize: 13, color: colors.textLight, textAlign: 'center', lineHeight: 19 },
  stateActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  stateBtn: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 18, paddingVertical: 10 },
  stateBtnText: { color: colors.white, fontWeight: '800', fontSize: 13.5 },
  stateBtnGhost: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  stateBtnGhostText: { color: colors.primary },

  // ── FAB ───────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: 20, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor:   colors.primaryDark,
    shadowOpacity: 0.35,
    shadowRadius:  14,
    shadowOffset:  { width: 0, height: 5 },
    elevation: 8,
  },
});
