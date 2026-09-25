import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthedRequest } from '../../api/useAuthedRequest';
import { notify, shareText } from '../../utils/feedback';
import UserAvatar from './UserAvatar';
import PostMenu from './PostMenu';
import { formatCount, tagColors, timeAgo } from './socialUtils';
import { emitPostChange } from './socialEvents';

const READ_MORE_AT = 110;

export function sharePost(post) {
  const body = post.caption ? `“${post.caption}”` : 'Check out this post';
  shareText(`${post.author.name} on MyFace AI: ${body}`);
}

// A feed post: like / comment / share / save persist through the backend;
// changes are broadcast so every list showing this post stays in sync.
export default function PostCard({ post, navigation }) {
  const request = useAuthedRequest();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState({ like: false, save: false });
  const tag = post.tag ? tagColors(post.tag) : null;

  const openProfile = () => post.author.id && navigation?.navigate('UserProfile', { userId: post.author.id });

  const toggleLike = async () => {
    if (busy.like) return;
    const liked = !post.liked;
    const before = { liked: post.liked, likeCount: post.likeCount };
    emitPostChange(post.id, { liked, likeCount: post.likeCount + (liked ? 1 : -1) });
    setBusy((b) => ({ ...b, like: true }));
    try {
      const res = await request(`/api/social/posts/${post.id}/like`, { method: 'POST', body: { liked } });
      emitPostChange(post.id, { liked: res.liked, likeCount: res.likeCount });
    } catch (err) {
      emitPostChange(post.id, before);
      notify('Could not update like', err.message);
    } finally {
      setBusy((b) => ({ ...b, like: false }));
    }
  };

  const toggleSave = async () => {
    if (busy.save) return;
    const bookmarked = !post.bookmarked;
    emitPostChange(post.id, { bookmarked });
    setBusy((b) => ({ ...b, save: true }));
    try {
      await request(`/api/social/posts/${post.id}/bookmark`, { method: 'POST', body: { bookmarked } });
    } catch (err) {
      emitPostChange(post.id, { bookmarked: !bookmarked });
      notify('Could not update saved posts', err.message);
    } finally {
      setBusy((b) => ({ ...b, save: false }));
    }
  };

  const longCaption = (post.caption || '').length > READ_MORE_AT;

  return (
    <View style={styles.card}>
      {/* ── Header row ── */}
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={openProfile} accessibilityRole="button" accessibilityLabel={`Open ${post.author.name}'s profile`}>
          <UserAvatar user={post.author} size={44} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMeta} onPress={openProfile} activeOpacity={0.7}
          accessibilityRole="button" accessibilityLabel={`${post.author.name}, ${timeAgo(post.createdAt)}`}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardUser} numberOfLines={1}>{post.author.name}</Text>
            {tag && (
              <View style={[styles.tagPill, { backgroundColor: tag.bg }]}>
                <Text style={[styles.tagText, { color: tag.color }]}>{post.tag}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTime}>{timeAgo(post.createdAt)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuOpen(true)}
          accessibilityRole="button" accessibilityLabel="More options">
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textFaint} />
        </TouchableOpacity>
      </View>

      {/* ── Photo ── */}
      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover"
          accessibilityLabel={`Photo posted by ${post.author.name}`} />
      ) : null}

      {/* ── Action bar ── */}
      <View style={styles.actionBar}>
        <View style={styles.actionLeft}>
          <TouchableOpacity style={styles.actionBtn} onPress={toggleLike}
            accessibilityRole="button" accessibilityLabel={post.liked ? 'Unlike' : 'Like'} accessibilityState={{ selected: post.liked }}>
            <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={22} color={post.liked ? colors.primary : colors.textMid} />
            <Text style={[styles.actionCount, post.liked && styles.actionCountLiked]}>{formatCount(post.likeCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation?.navigate('PostComments', { postId: post.id })}
            accessibilityRole="button" accessibilityLabel={`Comments (${post.commentCount})`}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textMid} />
            <Text style={styles.actionCount}>{formatCount(post.commentCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => sharePost(post)}
            accessibilityRole="button" accessibilityLabel="Share">
            <Ionicons name="arrow-redo-outline" size={20} color={colors.textMid} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={toggleSave} accessibilityRole="button"
          accessibilityLabel={post.bookmarked ? 'Unsave' : 'Save'} accessibilityState={{ selected: post.bookmarked }}>
          <Ionicons name={post.bookmarked ? 'bookmark' : 'bookmark-outline'} size={21} color={post.bookmarked ? colors.primary : colors.textMid} />
        </TouchableOpacity>
      </View>

      {/* ── Caption ── */}
      {post.caption ? (
        <View style={styles.captionWrap}>
          <Text style={styles.captionText} numberOfLines={expanded ? undefined : 2}>
            <Text style={styles.captionUser}>{post.author.name} </Text>
            {post.caption}
          </Text>
          {longCaption && !expanded && (
            <TouchableOpacity onPress={() => setExpanded(true)} accessibilityRole="button" accessibilityLabel="Read more">
              <Text style={styles.readMore}>read more</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : <View style={{ height: 10 }} />}

      <PostMenu post={post} visible={menuOpen} onClose={() => setMenuOpen(false)} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    marginBottom: 10,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderUltraLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderUltraLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  cardMeta: { flex: 1, gap: 2 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  cardUser: { fontSize: 14, fontWeight: '700', color: colors.textDark, flexShrink: 1 },
  tagPill: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  cardTime: { fontSize: 11, color: colors.textPlaceholder, fontWeight: '500' },
  moreBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  postImage: { width: '100%', aspectRatio: 1.3, backgroundColor: colors.sectionBg },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 13, fontWeight: '600', color: colors.textMid },
  actionCountLiked: { color: colors.primary },
  captionWrap: { paddingHorizontal: 14, paddingBottom: 16, gap: 2 },
  captionText: { fontSize: 13, color: colors.textMid, lineHeight: 20 },
  captionUser: { fontWeight: '700', color: colors.textDark },
  readMore: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 2 },
});
