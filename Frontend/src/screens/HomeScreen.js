import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import Header from '../components/Header';
import UVAlertBanner from '../components/UVAlertBanner';
import RoutineCard from '../components/RoutineCard';
import StatsRow from '../components/StatsRow';
import SkinFeelingPicker from '../components/SkinFeelingPicker';
import HumidityAlert from '../components/HumidityAlert';
import CoachTip from '../components/CoachTip';
import QuickActions from '../components/QuickActions';
import FriendsActivity from '../components/FriendsActivity';
import FaceOfTheDay from '../components/FaceOfTheDay';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { AM_STEPS } from '../data/routineSteps';
import { useI18n } from '../i18n';

const AM_STEP_COUNT = AM_STEPS.length;

function SectionLabel({ title, actionLabel, onAction }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabelText}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} accessibilityRole="button">
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function HomeScreen({ navigation }) {
  const request = useAuthedRequest();
  const { t } = useI18n();

  // Data state
  const [amCompleted, setAmCompleted] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feeling, setFeeling] = useState(null);
  const [balance, setBalance] = useState(0);
  const [levelLabel, setLevelLabel] = useState('Level 1');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Only the very first load blocks the page with a spinner; refetches on
  // re-focus update the dashboard in place instead of flashing a loader.
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    if (!hasLoaded.current) setLoading(true);
    try {
      const [summary, checkin, pointsSummary] = await Promise.all([
        request('/api/routines/summary'),
        request('/api/checkins/today'),
        request('/api/points/summary'),
      ]);
      setAmCompleted(summary.am.completedToday ?? 0);
      setStreak(summary.streak ?? 0);
      setFeeling(checkin.feeling ?? null);
      setBalance(pointsSummary.balance ?? 0);
      setLevelLabel(pointsSummary.levelLabel ?? 'Level 1'); // i18n-ignore: parsed for its number
      hasLoaded.current = true;
    } catch (err) {
      setError(t('home.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [request]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleFeelingSelect = async (key) => {
    const previous = feeling;
    setFeeling(key);
    try {
      await request('/api/checkins', { method: 'POST', body: { feeling: key } });
    } catch {
      setFeeling(previous);
      setError(t('home.checkinFailed'));
    }
  };

  const startRoutine = () => navigation?.navigate('RoutineStep', { routineTitle: 'AM Routine' }); // i18n-ignore: routine id

  const stats = [
    { icon: 'calendar',  value: String(streak),  label: t('home.statStreak'),  color: colors.statDays,  bg: '#FFF0F3', onPress: () => navigation?.navigate('WeeklyReport') },
    { icon: 'star',      value: String(balance),  label: t('home.statPoints'),  color: colors.statScore, bg: '#FFF0F3', onPress: () => navigation?.navigate('Rewards') },
    { icon: 'ribbon',    value: t('home.levelShort', { level: (levelLabel.match(/\d+/) || ['1'])[0] }), label: t('home.statLevel'), color: colors.statGlass, bg: '#EDF8FE', onPress: () => navigation?.navigate('Rewards') },
    { icon: 'checkmark-circle', value: `${amCompleted}/${AM_STEP_COUNT}`, label: t('home.statSteps'), color: colors.statSleep, bg: '#F3F0FC', onPress: startRoutine },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />

      <Header navigation={navigation} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('home.loading')}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          {/* Error banner */}
          <ErrorBanner
            message={error}
            onRetry={load}
            onDismiss={() => setError(null)}
          />

          {/* UV Alert */}
          <UVAlertBanner level={t('home.uvHigh')} message={t('home.uvMessage')} />
          <View style={styles.gap6} />

          {/* Today's Routine */}
          <SectionLabel
            title={t('home.todaysRoutine')}
            actionLabel={t('home.seeSteps')}
            onAction={() => navigation?.navigate('Routine')}
          />
          <RoutineCard
            title={t('routines.am')}
            completed={amCompleted}
            total={AM_STEP_COUNT}
            onPress={startRoutine}
          />
          <View style={styles.gap4} />

          {/* Daily Stats — real data */}
          <SectionLabel title={t('home.dailyStats')} />
          <StatsRow stats={stats} />
          <View style={styles.gap4} />
          <Divider />
          <View style={styles.gap4} />

          {/* Skin Check-in */}
          <SkinFeelingPicker selected={feeling} onSelect={handleFeelingSelect} />
          <View style={styles.gap4} />

          {/* Weather */}
          <HumidityAlert humidity={24} />
          <View style={styles.gap4} />
          <Divider />
          <View style={styles.gap4} />

          {/* AI Coach */}
          <SectionLabel
            title={t('home.coachTip')}
            actionLabel={t('home.chatNow')}
            onAction={() => navigation?.navigate('Coach')}
          />
          <CoachTip onMicPress={(tip) => navigation?.navigate('Coach', { prefill: tip })} />
          <View style={styles.gap4} />
          <Divider />
          <View style={styles.gap4} />

          {/* Quick Actions */}
          <SectionLabel title={t('home.quickActions')} />
          <QuickActions
            onAction={(key) => {
              if (key === 'scan')      navigation?.navigate('ScanFace');
              if (key === 'routine')   navigation?.navigate('Routine');
              if (key === 'community') navigation?.navigate('Social');
              if (key === 'makeup')    navigation?.navigate('OccasionPicker');
            }}
          />
          <View style={styles.gap4} />
          <Divider />
          <View style={styles.gap4} />

          {/* Friends Activity */}
          <FriendsActivity />
          <View style={styles.gap6} />

          {/* Face of the Day */}
          <FaceOfTheDay streak={streak} onPress={() => navigation?.navigate('ScanFace')} />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingTop: 10 },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.primaryBg,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },

  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 8,
    marginTop: 2,
  },
  sectionLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textFaint,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderUltraLight,
    marginHorizontal: 20,
  },
  gap4: { height: 4 },
  gap6: { height: 6 },
  bottomSpacer: { height: 32 },
});
