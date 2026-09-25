import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import UserAvatar from '../components/social/UserAvatar';
import { timeAgo } from '../components/social/socialUtils';
import { emitPostChange } from '../components/social/socialEvents';
import { confirm, notify } from '../utils/feedback';

const MAX_COMMENT = 300;

export default function PostCommentsScreen({ navigation, route }) {
  const postId = route?.params?.postId;
  const request = useAuthedRequest();
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await request(`/api/social/posts/${postId}/comments`);
      setComments(data.comments);
    } catch (err) {
      setError(err.message || 'Could not load comments.');
      setComments((c) => c ?? []);
    }
  }, [postId, request]);

  useEffect(() => { load(); }, [load]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { comment, commentCount } = await request(`/api/social/posts/${postId}/comments`, { method: 'POST', body: { text: body } });
      setComments((list) => [...(list || []), comment]);
      setText('');
      emitPostChange(postId, { commentCount });
    } catch (err) {
      notify('Could not post comment', err.message);
    } finally {
      setSending(false);
    }
  };

  const remove = async (comment) => {
    const ok = await confirm('Delete comment?', comment.text, 'Delete');
    if (!ok) return;
    try {
      const { commentCount } = await request(`/api/social/comments/${comment.id}`, { method: 'DELETE' });
      setComments((list) => list.filter((c) => c.id !== comment.id));
      emitPostChange(postId, { commentCount });
    } catch (err) {
      notify('Could not delete comment', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title="Comments" onBack={() => navigation?.goBack()} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ErrorBanner message={error} onRetry={load} onDismiss={() => setError(null)} />
        {comments === null ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              error ? null : (
                <View style={styles.empty}>
                  <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
                  <Text style={styles.emptyTitle}>No comments yet</Text>
                  <Text style={styles.emptyText}>Start the conversation.</Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <TouchableOpacity onPress={() => item.author.id && navigation?.navigate('UserProfile', { userId: item.author.id })}
                  accessibilityRole="button" accessibilityLabel={`Open ${item.author.name}'s profile`}>
                  <UserAvatar user={item.author} size={36} />
                </TouchableOpacity>
                <View style={styles.bubble}>
                  <View style={styles.metaRow}>
                    <Text style={styles.name}>{item.author.name}</Text>
                    <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.text}>{item.text}</Text>
                </View>
                {item.isMine && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(item)} accessibilityRole="button" accessibilityLabel="Delete comment">
                    <Ionicons name="trash-outline" size={16} color={colors.textFaint} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment…"
            placeholderTextColor={colors.textPlaceholder}
            value={text}
            onChangeText={setText}
            maxLength={MAX_COMMENT}
            multiline
            accessibilityLabel="Add a comment"
          />
          <TouchableOpacity style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.45 }]} onPress={send}
            disabled={!text.trim() || sending} accessibilityRole="button" accessibilityLabel="Post comment">
            {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Ionicons name="send" size={16} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  list: { padding: 16, gap: 14, flexGrow: 1 },
  empty: { alignItems: 'center', gap: 6, paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  emptyText: { fontSize: 13, color: colors.textLight },
  comment: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bubble: { flex: 1, backgroundColor: colors.sectionBg, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '800', color: colors.textDark },
  time: { fontSize: 11, color: colors.textPlaceholder },
  text: { fontSize: 13.5, color: colors.textMid, lineHeight: 19 },
  deleteBtn: { padding: 6 },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.white,
  },
  input: {
    flex: 1, maxHeight: 110, fontSize: 14, color: colors.textDark,
    backgroundColor: colors.sectionBg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
});
