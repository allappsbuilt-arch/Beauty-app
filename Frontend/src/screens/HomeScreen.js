import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
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
import { useAuthedRequest } from '../api/useAuthedRequest';

// ── Reusable section label ────────────────────────────────────────────────────
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

// ── Thin divider ─────────────────────────────────────────────────────────────
function Divider() {
  return <View style={styles.divider} />;
}

const AM_STEP_COUNT = 6; // mirrors RoutineStepScreen's AM_STEPS length

// ── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const request = useAuthedRequest();
  const [amCompleted, setAmCompleted] = useState(2);
  const [streak, setStreak] = useState(12);
  const [feeling, setFeeling] = useState(null);

  const load = useCallback(async () => {
    try {
      const [summary, checkin] = await Promise.all([
        request('/api/routines/summary'),
        request('/api/checkins/today'),
      ]);
      setAmCompleted(summary.am.completedToday);
      setStreak(summary.streak);
      setFeeling(checkin.feeling);
    } catch (err) {
      // Keep the existing values on screen if the backend is unreachable.
    }
  }, [request]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleFeelingSelect = async (key) => {
    setFeeling(key);
    try {
      await request('/api/checkins', { method: 'POST', body: { feeling: key } });
    } catch (err) {
      // Non-critical — the check-in will just not persist this time.
    }
  };

  const stats = [
    { icon: 'calendar', value: String(streak), label: 'DAYS', color: colors.statDays, bg: '#FFF0F3' },
    { icon: 'star', value: '84', label: 'SCORE', color: colors.statScore, bg: '#FFF0F3' },
    { icon: 'water', value: '4/8', label: 'GLASS', color: colors.statGlass, bg: '#EDF8FE' },
    { icon: 'moon', value: '7.5h', label: 'SLEEP', color: colors.statSleep, bg: '#F3F0FC' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={false}
      />

      {/* ── Sticky header ── */}
      <Header name="Alex" navigation={navigation} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* ── UV Alert ─────────────────────────────── */}
        <UVAlertBanner level="High" message="Apply SPF 50+ before heading out." />

        <View style={styles.gap6} />

        {/* ── Today's Routine ──────────────────────── */}
        <SectionLabel title="TODAY'S ROUTINE" actionLabel="See steps" />
        <RoutineCard
          title="AM Routine"
          completed={amCompleted}
          total={AM_STEP_COUNT}
          onPress={() => navigation?.navigate('Routine')}
        />

        <View style={styles.gap4} />

        {/* ── Daily Stats ──────────────────────────── */}
        <SectionLabel title="DAILY STATS" />
        <StatsRow stats={stats} />

        <View style={styles.gap4} />
        <Divider />
        <View style={styles.gap4} />

        {/* ── Skin Check-in ────────────────────────── */}
        <SkinFeelingPicker selected={feeling} onSelect={handleFeelingSelect} />

        <View style={styles.gap4} />

        {/* ── Weather Insight ──────────────────────── */}
        <HumidityAlert humidity={24} />

        <View style={styles.gap4} />
        <Divider />
        <View style={styles.gap4} />

        {/* ── AI Coach ─────────────────────────────── */}
        <SectionLabel title="AI COACH TIP" actionLabel="Chat now" onAction={() => navigation?.navigate('Coach')} />
        <CoachTip />

        <View style={styles.gap4} />
        <Divider />
        <View style={styles.gap4} />

        {/* ── Quick Actions ─────────────────────────── */}
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

        {/* ── Friends Activity ──────────────────────── */}
        <FriendsActivity />

        <View style={styles.gap6} />

        {/* ── Face of the Day ───────────────────────── */}
        <FaceOfTheDay onPress={() => navigation?.navigate('Coach')} />

        {/* Bottom spacer so last card clears tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },

  content: {
    paddingTop: 10,
  },

  // Section label row
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

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.borderUltraLight,
    marginHorizontal: 20,
  },

  // Spacing helpers
  gap4: { height: 4 },
  gap6: { height: 6 },

  // Bottom spacer
  bottomSpacer: {
    height: 32,
  },
});
