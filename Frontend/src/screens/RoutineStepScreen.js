import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { goToTab } from '../utils/navigation';
import ScreenHeader from '../components/ScreenHeader';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { notify } from '../utils/feedback';
import { stepsForPeriod, periodFromTitle } from '../data/routineSteps';

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEELINGS = ['Fresh', 'Tired', 'Glowy', 'Oily', 'Dry'];

// ─── Feeling chip ─────────────────────────────────────────────────────────────
function FeelingChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[chips.chip, active && chips.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[chips.chipText, active && chips.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
const chips = StyleSheet.create({
  chip: {
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.textMid },
  chipTextActive: { color: colors.white },
});

// ─── Completed step (collapsed) ────────────────────────────────────────────────
function CompletedStepRow({ title }) {
  return (
    <View style={rows.done}>
      <View style={rows.doneCheck}>
        <Ionicons name="checkmark" size={14} color="#1EA868" />
      </View>
      <View>
        <Text style={rows.doneLabel}>COMPLETED</Text>
        <Text style={rows.doneTitle}>{title}</Text>
      </View>
    </View>
  );
}

// ─── Locked step (collapsed) ───────────────────────────────────────────────────
function LockedStepRow({ index, category, title }) {
  return (
    <View style={rows.locked}>
      <View style={rows.lockedNum}>
        <Text style={rows.lockedNumText}>{index}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={rows.lockedLabel}>{category}</Text>
        <Text style={rows.lockedTitle}>{title}</Text>
      </View>
      <Ionicons name="lock-closed" size={16} color={colors.textPlaceholder} />
    </View>
  );
}

const rows = StyleSheet.create({
  done: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: colors.borderUltraLight,
  },
  doneCheck: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#E6F9F0',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#A8E8C4',
  },
  doneLabel: { fontSize: 10, fontWeight: '700', color: colors.textFaint, letterSpacing: 1 },
  doneTitle: { fontSize: 15, fontWeight: '700', color: colors.textPlaceholder, marginTop: 2, textDecorationLine: 'line-through' },

  locked: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: colors.borderUltraLight,
  },
  lockedNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.sectionBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderLight,
  },
  lockedNumText: { fontSize: 12, fontWeight: '700', color: colors.textPlaceholder },
  lockedLabel: { fontSize: 10, fontWeight: '700', color: colors.textFaint, letterSpacing: 1 },
  lockedTitle: { fontSize: 15, fontWeight: '700', color: colors.textPlaceholder, marginTop: 2 },
});

// ─── Active step card ───────────────────────────────────────────────────────
function ActiveStepCard({ index, step, onComplete }) {
  return (
    <View style={active.card}>
      <View style={active.header}>
        <View style={active.left}>
          <View style={active.numBadge}>
            <Text style={active.numText}>{index}</Text>
          </View>
          <View>
            <Text style={active.category}>{step.category}</Text>
            <Text style={active.title}>{step.title}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={active.infoBtn}
          accessibilityRole="button"
          accessibilityLabel="Step info"
          onPress={() => notify(step.title, step.instructions)}
        >
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={active.instructions}>{step.instructions}</Text>

      <Image source={{ uri: step.image }} style={active.image} resizeMode="cover" />

      <TouchableOpacity
        style={active.completeBtn}
        onPress={onComplete}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Mark step complete"
      >
        <Ionicons name="checkmark-circle" size={18} color={colors.white} />
        <Text style={active.completeBtnText}>Mark Step Complete</Text>
      </TouchableOpacity>
    </View>
  );
}

const active = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: { flexDirection: 'row', gap: 12, flex: 1 },
  numBadge: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  numText: { fontSize: 15, fontWeight: '800', color: colors.white },
  category: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  title: { fontSize: 21, fontWeight: '800', color: colors.textDark, letterSpacing: -0.3, marginTop: 3 },
  infoBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  instructions: {
    fontSize: 14.5, lineHeight: 22,
    color: colors.textMid,
    marginBottom: 16,
  },
  image: {
    width: '100%', height: 200,
    borderRadius: 14,
    marginBottom: 18,
    backgroundColor: colors.sectionBg,
  },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 15,
    shadowColor: colors.primary,
    shadowOpacity: 0.30,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  completeBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function RoutineStepScreen({ navigation, route }) {
  const routineTitle = route?.params?.routineTitle ?? 'AM Routine';
  const period = periodFromTitle(routineTitle);
  const steps = stepsForPeriod(period);
  const request = useAuthedRequest();

  // Completion is tracked per step key (persisted by the backend), and the
  // active step is always the first one not yet done.
  const [completedKeys, setCompletedKeys] = useState([]);
  const [saving, setSaving] = useState(false);
  const [feeling, setFeeling] = useState('Fresh');

  useEffect(() => {
    request(`/api/routines/today?period=${period}`)
      .then(({ completedStepKeys }) => setCompletedKeys(completedStepKeys || []))
      .catch(() => {
        // Start from step 1 if the backend is unreachable.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = steps.length;
  const stepIndex = steps.findIndex((s) => !completedKeys.includes(s.key));
  const allDone = stepIndex === -1;
  const current = allDone ? null : steps[stepIndex];
  const doneCount = allDone ? total : stepIndex;
  const progress = doneCount / total;

  const finishRoutine = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const { streak, pointsAwarded } = await request('/api/routines/finish', { method: 'POST', body: { period } });
      const params = { routineTitle, streak, pointsAwarded };
      navigation?.replace
        ? navigation.replace('RoutineComplete', params)
        : navigation?.navigate('RoutineComplete', params);
    } catch (err) {
      notify('Could not save your routine', err?.message || 'Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!current || saving) return;
    setSaving(true);
    try {
      const { completedStepKeys } = await request('/api/routines/steps/complete', {
        method: 'POST',
        body: { period, stepKey: current.key },
      });
      setCompletedKeys(completedStepKeys || [...completedKeys, current.key]);
    } catch (err) {
      notify('Could not save this step', err?.message || 'Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    if (!allDone) {
      const left = total - doneCount;
      notify('Almost there!', `Complete the remaining ${left} step${left === 1 ? '' : 's'} to finish your ${routineTitle}.`);
      return;
    }
    finishRoutine();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => (navigation?.canGoBack() ? navigation.goBack() : goToTab(navigation, 'Routine'))}
          accessibilityRole="button"
          accessibilityLabel="Close routine"
        >
          <Ionicons name="close" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{routineTitle}</Text>

        <Text style={styles.navStep}>{allDone ? 'All done' : `Step ${stepIndex + 1} of ${total}`}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Feeling picker */}
        <Text style={styles.sectionLabel}>HOW DO YOU FEEL?</Text>
        <View style={styles.feelingRow}>
          {FEELINGS.map(f => (
            <FeelingChip key={f} label={f} active={feeling === f} onPress={() => setFeeling(f)} />
          ))}
        </View>

        <View style={{ height: 20 }} />

        {/* Completed steps */}
        {steps.slice(0, doneCount).map(s => (
          <CompletedStepRow key={s.key} title={s.title} />
        ))}

        {allDone ? (
          <View style={styles.allDoneCard}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
            <Text style={styles.allDoneText}>
              Every step is done — tap Finish Routine to log today toward your streak.
            </Text>
          </View>
        ) : (
          <>
            {/* Active step */}
            <ActiveStepCard index={stepIndex + 1} step={current} onComplete={handleComplete} />

            {/* Locked steps */}
            {steps.slice(stepIndex + 1).map((s, i) => (
              <LockedStepRow key={s.key} index={stepIndex + 2 + i} category={s.category} title={s.title} />
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.askCoach}
          accessibilityRole="button"
          accessibilityLabel="Ask coach"
          onPress={() => navigation?.navigate('Coach')}
        >
          <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
          <Text style={styles.askCoachText}>ASK COACH</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishBtn}
          onPress={handleFinish}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Finish routine"
        >
          <Text style={styles.finishBtnText}>Finish Routine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel="More options"
          onPress={() => navigation?.navigate('Coach')}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMid} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { flex: 1 },
  content: { paddingTop: 18, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  navStep: { fontSize: 13, fontWeight: '600', color: colors.textMid },

  progressTrack: {
    height: 3, backgroundColor: colors.roseDark, marginHorizontal: 0,
  },
  progressFill: { height: 3, backgroundColor: colors.primary },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textFaint,
    letterSpacing: 1.2, marginHorizontal: 16, marginBottom: 12,
  },
  feelingRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginHorizontal: 16,
  },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: colors.primaryBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  askCoach: { alignItems: 'center', gap: 2, width: 54 },
  askCoachText: { fontSize: 9, fontWeight: '700', color: colors.primary, letterSpacing: 0.4 },
  finishBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.30,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  finishBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  allDoneCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 2, borderColor: colors.primary,
  },
  allDoneText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.textMid },
  moreBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
});
