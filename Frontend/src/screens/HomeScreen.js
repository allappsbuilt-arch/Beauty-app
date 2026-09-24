import React, { useCallback, useState } from 'react';
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

const AM_STEP_COUNT = 6;

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

  // Data state
  const [amCompleted, setAmCompleted] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feeling, setFeeling] = useState(null);
  const [balance, setBalance] = useState(0);
  const [levelLabel, setLevelLabel] = useState('Level 1');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
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
      setLevelLabel(pointsSummary.levelLabel ?? 'Level 1');
    } catch (err) {
      setError('Could not load your data. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleFeelingSelect = async (key) => {
    setFeeling(key);
    try {
      await request('/api/checkins', { method: 'POST', body: { feeling: key } });
    } catch {
      setError('Could not save check-in. Please try again.');
    }
  };

  const stats = [
    { icon: 'calendar',  value: String(streak),  label: 'STREAK',  color: colors.statDays,  bg: '#FFF0F3' },
    { icon: 'star',      value: String(balance),  label: 'POINTS',  color: colors.statScore, bg: '#FFF0F3' },
    { icon: 'ribbon',    value: levelLabel.split(':')[0] || 'Lv 1', label: 'LEVEL', color: colors.statGlass, bg: '#EDF8FE' },
    { icon: 'checkmark-circle', value: `${amCompleted}/${AM_STEP_COUNT}`, label: 'STEPS', color: colors.statSleep, bg: '#F3F0FC' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />

      <Header navigation={navigation} />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your dashboard…</Text>
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
          <UVAlertBanner level="High" message="Apply SPF 50+ before heading out." />
          <View style={styles.gap6} />

          {/* Today's Routine */}
          <SectionLabel
            title="TODAY'S ROUTINE"
            actionLabel="See steps"
            onAction={() => navigation?.navigate('RoutineStep', { routineTitle: 'AM Routine' })}
          />
          <RoutineCard
            title="AM Routine"
            completed={amCompleted}
            total={AM_STEP_COUNT}
            onPress={() => navigation?.navigate('Routine')}
          />
          <View style={styles.gap4} />

          {/* Daily Stats — real data */}
          <SectionLabel title="DAILY STATS" />
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
            title="AI COACH TIP"
            actionLabel="Chat now"
            onAction={() => navigation?.navigate('Coach')}
          />
          <CoachTip />
          <View style={styles.gap4} />
          <Divider />
          <View style={styles.gap4} />

          {/* Quick Actions */}
          <SectionLabel title="QUICK ACTIONS" />
          <QuickActions
            onAction={(key) => {
              if (key === 'scan')      navigation?.navigate('ScanFace');
              if (key === 'routine')   navigation?.navigate('Routine');
              if (key === 'community') navigation?.navigate('Social');
              if (key === 'makeup')    navigation?.navigate('AllTools');
            }}
          />
          <View style={styles.gap4} />
          <Divider />
          <View style={styles.gap4} />

          {/* Friends Activity */}
          <FriendsActivity />
          <View style={styles.gap6} />

          {/* Face of the Day */}
          <FaceOfTheDay onPress={() => navigation?.navigate('Coach')} />

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
