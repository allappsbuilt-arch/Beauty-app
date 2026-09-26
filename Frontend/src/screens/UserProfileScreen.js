import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import UserAvatar from '../components/social/UserAvatar';
import PostCard from '../components/social/PostCard';
import { usePostList } from '../components/social/usePostList';
import { emitAuthorFollow, subscribeSocial } from '../components/social/socialEvents';
import { firstName, formatCount } from '../components/social/socialUtils';
import { notify } from '../utils/feedback';
import { useI18n } from '../i18n';

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{formatCount(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function UserProfileScreen({ navigation, route }) {
  const userId = route?.params?.userId;
  const request = useAuthedRequest();
  const { t } = useI18n();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState(route?.params?.tab === 'saved' ? 'saved' : 'posts');
  const [posts, setPosts] = usePostList();
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);

  const load = useCallback(async (which = tab) => {
    setError(null);
    setLoadingPosts(true);
    try {
      const [p, list] = await Promise.all([
        request(`/api/social/users/${userId}`),
        request(which === 'saved' ? '/api/social/bookmarks' : `/api/social/users/${userId}/posts`),
      ]);
      setProfile(p);
      setPosts(list.posts);
    } catch (err) {
      setError(err.message || t('profile.loadFailed'));
    } finally {
      setLoadingPosts(false);
    }
  }, [request, userId, tab, setPosts]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Keep the post count right when a post is deleted from this screen, and
  // drop un-saved posts from the Saved tab.
  React.useEffect(() => subscribeSocial((e) => {
    if (e.type === 'removed' && tab === 'posts') setProfile((p) => (p?.isMe ? { ...p, postCount: Math.max(0, p.postCount - 1) } : p));
    if (e.type === 'change' && tab === 'saved' && e.patch.bookmarked === false) setPosts((list) => list.filter((x) => x.id !== e.id));
  }), [tab, setPosts]);

  const toggleFollow = async () => {
    if (!profile || following) return;
    const next = !profile.isFollowing;
    setFollowing(true);
    try {
      const res = await request(`/api/social/users/${userId}/follow`, { method: 'POST', body: { follow: next } });
      setProfile((p) => ({ ...p, isFollowing: res.isFollowing, followerCount: res.followerCount }));
      emitAuthorFollow(userId, res.isFollowing);
    } catch (err) {
      notify(t('profile.followFailed'), err.message);
    } finally {
      setFollowing(false);
    }
  };

  // `load` depends on `tab`, so the focus effect reloads the list.
  const switchTab = (key) => setTab(key);

  const header = profile ? (
    <View style={styles.header}>
      <UserAvatar user={profile.user} size={84} />
      <Text style={styles.name}>{profile.user.name}</Text>
      <View style={styles.stats}>
        <Stat value={profile.postCount} label={t('profile.posts')} />
        <Stat value={profile.followerCount} label={t('profile.followers')} />
        <Stat value={profile.followingCount} label={t('profile.following')} />
      </View>
      {profile.isMe ? (
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation?.navigate('CreatePost', { mode: 'post' })}
          accessibilityRole="button" accessibilityLabel={t('profile.createPost')}>
          <Ionicons name="add" size={17} color={colors.white} />
          <Text style={styles.primaryBtnText}>{t('profile.newPost')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.primaryBtn, profile.isFollowing && styles.followingBtn]} onPress={toggleFollow} disabled={following}
          accessibilityRole="button" accessibilityLabel={profile.isFollowing ? t('profile.unfollowName', { name: profile.user.name }) : t('profile.followName', { name: profile.user.name })}>
          {following ? <ActivityIndicator size="small" color={profile.isFollowing ? colors.primary : colors.white} /> : (
            <>
              <Ionicons name={profile.isFollowing ? 'checkmark' : 'person-add-outline'} size={16} color={profile.isFollowing ? colors.primary : colors.white} />
              <Text style={[styles.primaryBtnText, profile.isFollowing && styles.followingBtnText]}>{profile.isFollowing ? t('profile.following') : t('profile.follow')}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
      {profile.isMe && (
        <View style={styles.tabs}>
          {[['posts', t('profile.myPosts')], ['saved', t('profile.saved')]].map(([k, label]) => (
            <TouchableOpacity key={k} style={styles.tabItem} onPress={() => switchTab(k)}
              accessibilityRole="tab" accessibilityState={{ selected: tab === k }} accessibilityLabel={label}>
              <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>{label}</Text>
              {tab === k && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  ) : null;

  const emptyText = tab === 'saved'
    ? t('profile.savedEmpty')
    : profile?.isMe ? t('profile.noPostsMine') : t('profile.noPostsOther', { name: firstName(profile?.user?.name) });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title={profile?.isMe ? t('profile.myProfile') : t('profile.title')} onBack={() => navigation?.goBack()} />
      <ErrorBanner message={error} onRetry={() => load()} onDismiss={() => setError(null)} />
      {!profile && !error ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          style={styles.list}
          data={posts}
          keyExtractor={(p) => p.id}
          ListHeaderComponent={header}
          renderItem={({ item }) => <PostCard post={item} navigation={navigation} />}
          ListEmptyComponent={loadingPosts
            ? <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
            : profile && <Text style={styles.empty}>{emptyText}</Text>}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  list: { backgroundColor: colors.primaryBg },
  header: { alignItems: 'center', backgroundColor: colors.white, paddingTop: 22, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: '800', color: colors.textDark, marginTop: 10 },
  stats: { flexDirection: 'row', gap: 32, marginTop: 14 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 18,
    backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 26, paddingVertical: 10, minWidth: 140, justifyContent: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  followingBtn: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary },
  followingBtnText: { color: colors.primary },
  tabs: { flexDirection: 'row', alignSelf: 'stretch', paddingHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  tabItem: { marginRight: 24, paddingVertical: 12 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textPlaceholder },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, backgroundColor: colors.primary, borderRadius: 2 },
  empty: { textAlign: 'center', color: colors.textLight, fontSize: 13, marginTop: 30, paddingHorizontal: 32 },
});
