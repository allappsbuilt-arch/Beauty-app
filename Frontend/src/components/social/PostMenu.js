import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthedRequest } from '../../api/useAuthedRequest';
import { confirm, notify, shareText } from '../../utils/feedback';
import { firstName } from './socialUtils';
import { emitAuthorFollow, emitPostRemoved } from './socialEvents';
import { sharePost } from './PostCard';
import { useI18n } from '../../i18n';

const REPORT_REASONS = [
  { key: 'spam', labelKey: 'post.reportSpam' },
  { key: 'inappropriate', labelKey: 'post.reportInappropriate' },
  { key: 'harassment', labelKey: 'post.reportHarassment' },
  { key: 'other', labelKey: 'post.reportOther' },
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
  const { t } = useI18n();
  const [mode, setMode] = useState('main'); // 'main' | 'report'
  const [busy, setBusy] = useState(null);
  const name = firstName(post.author.name);

  const close = () => { setMode('main'); onClose(); };

  const run = async (key, fn) => {
    setBusy(key);
    try { await fn(); } catch (err) { notify(t('post.somethingWrong'), err.message); } finally { setBusy(null); }
  };

  const del = () => run('delete', async () => {
    close();
    const ok = await confirm(t('post.deleteTitle'), t('post.deleteText'), t('common.delete'));
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
    notify(t('post.reportThanks'), t('post.reportHidden'));
  });

  const share = () => {
    close();
    sharePost(post);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={s.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} accessibilityLabel={t('post.closeMenu')} />
        <View style={s.sheet}>
          <View style={s.handle} />
          {mode === 'main' ? (
            <>
              {post.isMine ? (
                <Row icon="trash-outline" label={t('post.delete')} danger onPress={del} busy={busy === 'delete'} />
              ) : (
                <>
                  <Row
                    icon={post.authorFollowed ? 'person-remove-outline' : 'person-add-outline'}
                    label={post.authorFollowed ? t('post.unfollow', { name }) : t('post.follow', { name })}
                    onPress={follow}
                    busy={busy === 'follow'}
                  />
                  <Row icon="person-circle-outline" label={t('post.viewProfile', { name })}
                    onPress={() => { close(); navigation?.navigate('UserProfile', { userId: post.author.id }); }} />
                </>
              )}
              <Row icon="share-outline" label={t('post.sharePost')} onPress={share} />
              {!post.isMine && <Row icon="flag-outline" label={t('post.report')} danger onPress={() => setMode('report')} />}
            </>
          ) : (
            <>
              <Text style={s.title}>{t('post.reportWhy')}</Text>
              {REPORT_REASONS.map((r) => (
                <Row key={r.key} icon="flag-outline" label={t(r.labelKey)} onPress={() => report(r.key)} busy={busy === r.key} />
              ))}
            </>
          )}
          <TouchableOpacity style={s.cancel} onPress={close} accessibilityRole="button" accessibilityLabel={t('common.cancel')}>
            <Text style={s.cancelText}>{t('common.cancel')}</Text>
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
