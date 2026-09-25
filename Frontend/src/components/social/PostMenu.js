import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthedRequest } from '../../api/useAuthedRequest';
import { confirm, notify, shareText } from '../../utils/feedback';
import { firstName } from './socialUtils';
import { emitAuthorFollow, emitPostRemoved } from './socialEvents';

const REPORT_REASONS = [
  { key: 'spam', label: 'Spam' },
  { key: 'inappropriate', label: 'Inappropriate content' },
  { key: 'harassment', label: 'Harassment or bullying' },
  { key: 'other', label: 'Something else' },
];

function Row({ icon, label, onPress, danger, busy }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} disabled={busy} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={19} color={danger ? '#D03050' : colors.textDark} />
      <Text style={[s.rowText, danger && { color: '#D03050' }]}>{label}</Text>
      {busy && <ActivityIndicator size="small" color={colors.primary} />}
    </TouchableOpacity>
  );
}

// The "…" menu on a post: delete your own, or follow / report someone else's.
export default function PostMenu({ post, visible, onClose, navigation }) {
  const request = useAuthedRequest();
  const [mode, setMode] = useState('main'); // 'main' | 'report'
  const [busy, setBusy] = useState(null);
  const name = firstName(post.author.name);

  const close = () => { setMode('main'); onClose(); };

  const run = async (key, fn) => {
    setBusy(key);
    try { await fn(); } catch (err) { notify('Something went wrong', err.message); } finally { setBusy(null); }
  };

  const del = () => run('delete', async () => {
    close();
    const ok = await confirm('Delete post?', 'This removes the post, its likes and comments for everyone.', 'Delete');
    if (!ok) return;
    await request(`/api/social/posts/${post.id}`, { method: 'DELETE' });
    emitPostRemoved(post.id);
  });

  const follow = () => run('follow', async () => {
    const next = !post.authorFollowed;
    await request(`/api/social/users/${post.author.id}/follow`, { method: 'POST', body: { follow: next } });
    emitAuthorFollow(post.author.id, next);
    close();
  });

  const report = (reason) => run(reason, async () => {
    await request(`/api/social/posts/${post.id}/report`, { method: 'POST', body: { reason } });
    emitPostRemoved(post.id);
    close();
    notify('Thanks for reporting', 'This post is now hidden from your feed.');
  });

  const share = () => {
    close();
    shareText(`${post.author.name} on MyFace AI: ${post.caption ? `“${post.caption}”` : 'Check out this post'}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={s.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} accessibilityLabel="Close menu" />
        <View style={s.sheet}>
          <View style={s.handle} />
          {mode === 'main' ? (
            <>
              {post.isMine ? (
                <Row icon="trash-outline" label="Delete post" danger onPress={del} busy={busy === 'delete'} />
              ) : (
                <>
                  <Row
                    icon={post.authorFollowed ? 'person-remove-outline' : 'person-add-outline'}
                    label={post.authorFollowed ? `Unfollow ${name}` : `Follow ${name}`}
                    onPress={follow}
                    busy={busy === 'follow'}
                  />
                  <Row icon="person-circle-outline" label={`View ${name}'s profile`}
                    onPress={() => { close(); navigation?.navigate('UserProfile', { userId: post.author.id }); }} />
                </>
              )}
              <Row icon="share-outline" label="Share post" onPress={share} />
              {!post.isMine && <Row icon="flag-outline" label="Report post" danger onPress={() => setMode('report')} />}
            </>
          ) : (
            <>
              <Text style={s.title}>Why are you reporting this post?</Text>
              {REPORT_REASONS.map((r) => (
                <Row key={r.key} icon="flag-outline" label={r.label} onPress={() => report(r.key)} busy={busy === r.key} />
              ))}
            </>
          )}
          <TouchableOpacity style={s.cancel} onPress={close} accessibilityRole="button" accessibilityLabel="Cancel">
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30,16,20,0.45)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%', maxWidth: 480, backgroundColor: colors.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderLight, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '800', color: colors.textDark, paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textDark },
  cancel: { marginTop: 12, alignItems: 'center', paddingVertical: 13, borderRadius: 100, backgroundColor: colors.sectionBg },
  cancelText: { fontSize: 15, fontWeight: '700', color: colors.textMid },
});
