import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { copyText, shareText } from '../utils/feedback';
import { loadErrorMessage } from '../components/points/pointsUtils';
import { useI18n, formatDate, formatNumber } from '../i18n';

const PURPLE = '#8870C0';

function Step({ n, text }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}><Text style={styles.stepNumText}>{n}</Text></View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

// Referral code + invite sharing + who joined with it.
export default function ReferFriendScreen({ navigation }) {
  const request = useAuthedRequest();
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try { setData(await request('/api/points/referral')); } catch (err) { setError(loadErrorMessage(err)); }
  }, [request]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const invite = () => shareText(t('refer.inviteMessage', { code: data.code }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title={t('refer.title')} onBack={() => navigation?.goBack()} />

      {!data ? (
        <View style={styles.center}>
          {error ? (
            <>
              <Ionicons name="cloud-offline-outline" size={36} color={colors.textPlaceholder} />
              <Text style={styles.centerText}>{error}</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={load} accessibilityRole="button" accessibilityLabel={t('common.retry')}>
                <Text style={styles.primaryBtnText}>{t('common.tryAgain')}</Text>
              </TouchableOpacity>
            </>
          ) : <ActivityIndicator size="large" color={PURPLE} />}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={PURPLE} />}>
          <ErrorBanner message={error} onRetry={load} onDismiss={() => setError(null)} />

          <View style={styles.hero}>
            <View style={styles.heroIcon}><Ionicons name="gift" size={28} color={PURPLE} /></View>
            <Text style={styles.heroTitle}>{t('refer.heroTitle', { points: data.points })}</Text>
            <Text style={styles.heroText}>{t('refer.heroText', { points: data.points })}</Text>
          </View>

          <Text style={styles.label}>{t('refer.yourCode')}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code} selectable accessibilityLabel={t('refer.codeA11y', { code: data.code.split('').join(' ') })}>{data.code}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={() => copyText(data.code, t('refer.codeCopied'))}
              accessibilityRole="button" accessibilityLabel={t('refer.copyA11y')}>
              <Ionicons name="copy-outline" size={16} color={PURPLE} />
              <Text style={styles.copyText}>{t('refer.copy')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={invite} accessibilityRole="button" accessibilityLabel={t('refer.shareA11y')}>
            <Ionicons name="share-social" size={18} color={colors.white} />
            <Text style={styles.primaryBtnText}>{t('refer.share')}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>{t('refer.howItWorks')}</Text>
          <View style={styles.card}>
            <Step n={1} text={t('refer.step1')} />
            <Step n={2} text={t('refer.step2')} />
            <Step n={3} text={t('refer.step3', { points: data.points })} />
          </View>

          <Text style={styles.label}>
            {t('refer.friendsJoined')}{data.friends.length ? t('refer.ptsEarned', { points: formatNumber(data.pointsEarned) }) : ''}
          </Text>
          <View style={styles.card}>
            {data.friends.length === 0 ? (
              <Text style={styles.empty}>{t('refer.noFriends')}</Text>
            ) : data.friends.map((f, i) => (
              <View key={`${f.name}-${f.joinedAt}`} style={[styles.friend, i < data.friends.length - 1 && styles.divider]}>
                <View style={styles.friendAvatar}><Text style={styles.friendInitial}>{f.name[0]?.toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.friendName}>{f.name}</Text>
                  <Text style={styles.friendDate}>{t('refer.joined', { date: formatDate(f.joinedAt, { month: 'short', day: 'numeric', year: 'numeric' }) })}</Text>
                </View>
                <View style={[styles.status, f.rewarded ? styles.statusDone : styles.statusPending]}>
                  <Text style={[styles.statusText, { color: f.rewarded ? '#1EA868' : '#C47A00' }]}>
                    {f.rewarded ? t('refer.earnedPts', { points: data.points }) : t('refer.pending')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  centerText: { fontSize: 14, color: colors.textLight, textAlign: 'center', lineHeight: 20 },
  hero: { backgroundColor: colors.white, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  heroIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#F0EEFF', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 19, fontWeight: '800', color: colors.textDark, marginTop: 12 },
  heroText: { fontSize: 13.5, color: colors.textLight, textAlign: 'center', lineHeight: 19, marginTop: 6 },
  label: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.2, marginTop: 24, marginBottom: 10 },
  codeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: '#D8D0F0', borderStyle: 'dashed', padding: 14 },
  code: { flex: 1, fontSize: 26, fontWeight: '800', color: PURPLE, letterSpacing: 4 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0EEFF', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8 },
  copyText: { color: PURPLE, fontWeight: '800', fontSize: 13 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PURPLE, borderRadius: 100, paddingVertical: 14, paddingHorizontal: 22, marginTop: 14 },
  primaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  card: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 6 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#F0EEFF', justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: PURPLE, fontWeight: '800', fontSize: 13 },
  stepText: { flex: 1, fontSize: 13.5, color: colors.textMid, lineHeight: 19 },
  empty: { textAlign: 'center', color: colors.textLight, fontSize: 13, paddingVertical: 16 },
  friend: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  friendAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0EEFF', justifyContent: 'center', alignItems: 'center' },
  friendInitial: { color: PURPLE, fontWeight: '800', fontSize: 15 },
  friendName: { fontSize: 14.5, fontWeight: '700', color: colors.textDark },
  friendDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  status: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  statusDone: { backgroundColor: '#E7F7EE' },
  statusPending: { backgroundColor: '#FFF8E6' },
  statusText: { fontSize: 11.5, fontWeight: '800' },
});
