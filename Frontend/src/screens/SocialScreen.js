import React, { useState } from 'react';
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

const STORIES = [
  { id: '0', isNew: true,  label: 'New Story', initials: '+',  color: colors.primary,  bg: colors.primaryPale },
  { id: '1', isNew: false, label: 'Alex',      initials: 'AL', color: '#D96080',        bg: '#FFF0F3' },
  { id: '2', isNew: false, label: 'Maya',      initials: 'MA', color: '#C77DFF',        bg: '#F5EEFF' },
  { id: '3', isNew: false, label: 'Jordan',    initials: 'JO', color: '#48B8E0',        bg: '#EDF8FE' },
  { id: '4', isNew: false, label: 'Elena',     initials: 'EL', color: '#F07840',        bg: '#FFF4EC' },
];

const POSTS = [
  {
    id: '1',
    user: 'Sarah Miller',
    initials: 'SM',
    avatarColor: '#D96080',
    avatarBg: '#FFF0F3',
    time: '2 hours ago',
    tag: 'Morning Flow',
    tagColor: '#28A090',
    tagBg: '#E6F8F5',
    // yoga / wellness image placeholder rendered as gradient block
    imageAspect: 0.72,
    imageTint: '#8BB89A',
    likes: 1200,
    comments: 24,
    liked: false,
    caption: 'Finally hit my 30-day streak of morning mindfulness! It\'s amazing how much more centered I feel throughout the day...',
    hasMore: true,
  },
  {
    id: '2',
    user: 'David Chen',
    initials: 'DC',
    avatarColor: '#3A8ED4',
    avatarBg: '#EAF4FD',
    time: '5 hours ago',
    tag: 'HIIT Challenge',
    tagColor: '#E07840',
    tagBg: '#FFF3EC',
    imageAspect: 0.68,
    imageTint: '#7A6A8A',
    likes: 856,
    comments: 12,
    liked: false,
    caption: 'Push day was brutal but worth it. Tracking my progress using the new MyFace AI Coach is a game changer for real-time form correction.',
    hasMore: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return String(n);
}

// ─── Live Banner ──────────────────────────────────────────────────────────────

function LiveBanner() {
  return (
    <TouchableOpacity
      style={styles.liveBanner}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="Watch live: Daily Mindfulness Routine"
    >
      {/* Avatar */}
      <View style={styles.liveAvatarWrap}>
        <View style={styles.liveAvatar}>
          <Ionicons name="person" size={16} color={colors.white} />
        </View>
        {/* LIVE dot */}
        <View style={styles.liveDotBadge}>
          <View style={styles.liveDotInner} />
        </View>
      </View>

      {/* Text */}
      <View style={styles.liveText}>
        <View style={styles.liveLabelRow}>
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>LIVE NOW</Text>
          </View>
        </View>
        <Text style={styles.liveTitle} numberOfLines={1}>Daily Mindfulness Routine</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
    </TouchableOpacity>
  );
}

// ─── Story Bubble ─────────────────────────────────────────────────────────────

function StoryBubble({ story }) {
  const isAdd = story.id === '0';
  return (
    <TouchableOpacity
      style={styles.storyWrap}
      activeOpacity={0.80}
      accessibilityRole="button"
      accessibilityLabel={isAdd ? 'Create new story' : `${story.label}'s story`}
    >
      {/* ring only on real stories */}
      <View style={[
        styles.storyRing,
        isAdd  && styles.storyRingAdd,
        !isAdd && styles.storyRingActive,
      ]}>
        <View style={[styles.storyCircle, { backgroundColor: story.bg }]}>
          {isAdd
            ? <Ionicons name="add" size={22} color={colors.primary} />
            : <Text style={[styles.storyInitials, { color: story.color }]}>{story.initials}</Text>
          }
        </View>
        {/* add badge */}
        {isAdd && (
          <View style={styles.addBadge}>
            <Ionicons name="add" size={10} color={colors.white} />
          </View>
        )}
      </View>
      <Text style={styles.storyLabel} numberOfLines={1}>{story.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Image Placeholder ────────────────────────────────────────────────────────
// Since we don't have real photo assets, we render a soft abstract "aurora"
// card instead of a flat tint + icon — reads as an intentional editorial
// treatment rather than a broken/missing image.

function PostImage({ tint, aspect }) {
  const height = Math.round(260 * aspect);
  return (
    <View style={[styles.postImageWrap, { height, backgroundColor: tint }]}>
      <View style={[styles.postImageBlobA, { backgroundColor: colors.white }]} pointerEvents="none" />
      <View style={[styles.postImageBlobB, { backgroundColor: '#00000022' }]} pointerEvents="none" />
      <View style={styles.postImageOverlay} pointerEvents="none" />
    </View>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post }) {
  const [liked, setLiked]   = useState(post.liked);
  const [likes, setLikes]   = useState(post.likes);
  const [saved, setSaved]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleLike = () => {
    setLiked(v => !v);
    setLikes(n => liked ? n - 1 : n + 1);
  };

  return (
    <View style={styles.card}>

      {/* ── Header row ── */}
      <View style={styles.cardHeader}>
        {/* Avatar */}
        <View style={[styles.cardAvatarRing, { borderColor: post.avatarColor + '55' }]}>
          <View style={[styles.cardAvatar, { backgroundColor: post.avatarBg }]}>
            <Text style={[styles.cardAvatarText, { color: post.avatarColor }]}>
              {post.initials}
            </Text>
          </View>
        </View>

        {/* Name + tag + time */}
        <View style={styles.cardMeta}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardUser}>{post.user}</Text>
            <View style={[styles.tagPill, { backgroundColor: post.tagBg }]}>
              <Text style={[styles.tagText, { color: post.tagColor }]}>{post.tag}</Text>
            </View>
          </View>
          <Text style={styles.cardTime}>{post.time}</Text>
        </View>

        {/* More */}
        <TouchableOpacity
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textFaint} />
        </TouchableOpacity>
      </View>

      {/* ── Post image ── */}
      <PostImage tint={post.imageTint} aspect={post.imageAspect} />

      {/* ── Action bar ── */}
      <View style={styles.actionBar}>
        {/* Left: like / comment / share */}
        <View style={styles.actionLeft}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={toggleLike}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Unlike' : 'Like'}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? colors.primary : colors.textMid}
            />
            <Text style={[styles.actionCount, liked && styles.actionCountLiked]}>
              {formatCount(likes)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel="Comments"
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textMid} />
            <Text style={styles.actionCount}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel="Share"
          >
            <Ionicons name="arrow-redo-outline" size={20} color={colors.textMid} />
          </TouchableOpacity>
        </View>

        {/* Right: save */}
        <TouchableOpacity
          onPress={() => setSaved(v => !v)}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Unsave' : 'Save'}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={21}
            color={saved ? colors.primary : colors.textMid}
          />
        </TouchableOpacity>
      </View>

      {/* ── Caption ── */}
      <View style={styles.captionWrap}>
        <Text style={styles.captionText} numberOfLines={expanded ? undefined : 2}>
          <Text style={styles.captionUser}>{post.user} </Text>
          {post.caption}
        </Text>
        {post.hasMore && !expanded && (
          <TouchableOpacity onPress={() => setExpanded(true)}>
            <Text style={styles.readMore}>read more</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onToggle }) {
  return (
    <View style={styles.tabBar}>
      {['Following', 'Discover'].map(t => (
        <TouchableOpacity
          key={t}
          style={styles.tabItem}
          onPress={() => onToggle(t)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === t }}
        >
          <Text style={[styles.tabText, active === t && styles.tabTextActive]}>
            {t}
          </Text>
          {active === t && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SocialScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Following');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Nav bar ── */}
      <ScreenHeader
        title="MyFace AI"
        onBack={() => navigation?.navigate('Home')}
        bordered={false}
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation?.navigate('Leaderboard')}
              accessibilityRole="button"
              accessibilityLabel="Leaderboard"
            >
              <Ionicons name="podium-outline" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation?.navigate('MyCommunities')}
              accessibilityRole="button"
              accessibilityLabel="Communities"
            >
              <Ionicons name="people-outline" size={20} color={colors.textDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation?.navigate('Home')}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* ── Following / Discover tabs ── */}
      <TabBar active={activeTab} onToggle={setActiveTab} />

      {/* ── Feed ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Live banner */}
        <LiveBanner />

        {/* Stories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesRow}
          style={styles.storiesScroll}
        >
          {STORIES.map(s => <StoryBubble key={s.id} story={s} />)}
        </ScrollView>

        {/* Posts */}
        {POSTS.map(p => <PostCard key={p.id} post={p} />)}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
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
  feed:   { paddingBottom: 20 },

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
    // premium shadow with tinted colour
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
  storiesScroll: { backgroundColor: colors.white },
  storiesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
    // subtle bottom shadow on the stories strip
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  storyWrap: { alignItems: 'center', gap: 5, width: 64 },
  storyRing: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  storyRingActive: {
    // gradient-like border: use a slightly larger ring with primary color
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

  // ── Post card ─────────────────────────────────────────────
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 0,
    marginBottom: 10,
    // no border-radius at edges — full-bleed cards like Instagram
    overflow: 'hidden',
    // hairline separator
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderUltraLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderUltraLight,
  },

  // Card header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  cardAvatarRing: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5,
    padding: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  cardAvatar: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  cardAvatarText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  cardMeta: { flex: 1, gap: 2 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardUser: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  tagPill: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  cardTime: { fontSize: 11, color: colors.textPlaceholder, fontWeight: '500' },
  moreBtn: {
    width: 32, height: 32,
    justifyContent: 'center', alignItems: 'center',
  },

  // Post image placeholder — layered soft blobs standing in for a photo
  postImageWrap: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImageBlobA: {
    position: 'absolute',
    top: '-30%',
    left: '-20%',
    width: '90%',
    aspectRatio: 1,
    borderRadius: 999,
    opacity: 0.22,
    ...(Platform.OS === 'web' ? { filter: 'blur(60px)' } : null),
  },
  postImageBlobB: {
    position: 'absolute',
    bottom: '-35%',
    right: '-15%',
    width: '75%',
    aspectRatio: 1,
    borderRadius: 999,
    opacity: 0.5,
    ...(Platform.OS === 'web' ? { filter: 'blur(50px)' } : null),
  },
  postImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  actionBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: {
    fontSize: 13, fontWeight: '600', color: colors.textMid,
  },
  actionCountLiked: { color: colors.primary },

  // Caption
  captionWrap: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 2,
  },
  captionText: {
    fontSize: 13, color: colors.textMid, lineHeight: 20,
  },
  captionUser: { fontWeight: '700', color: colors.textDark },
  readMore:    { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 2 },

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
