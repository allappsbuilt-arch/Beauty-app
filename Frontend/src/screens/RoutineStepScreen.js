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
import ScreenHeader from '../components/ScreenHeader';
import { useAuthedRequest } from '../api/useAuthedRequest';

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEELINGS = ['Fresh', 'Tired', 'Glowy', 'Oily', 'Dry'];

const AM_STEPS = [
  {
    key: 'cleanser',
    category: 'CLEANSER',
    title: 'Gentle Cleanser',
    instructions: 'Massage onto damp skin for 30 seconds, then rinse with lukewarm water.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=60',
  },
  {
    key: 'toner',
    category: 'TONER & MIST',
    title: 'Rose Water Revitalize',
    instructions: 'Apply 3-4 sprays or use a cotton pad. This balances your pH levels and prepares your skin to absorb serums more effectively.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=60',
  },
  {
    key: 'serum',
    category: 'VITAMIN C SERUM',
    title: 'Brightening Core',
    instructions: 'Press 2-3 drops into skin, avoiding the eye area. Follow with moisturizer.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=60',
  },
  {
    key: 'eye',
    category: 'EYE CARE',
    title: 'Caffeine Eye Gel',
    instructions: 'Dab gently along the orbital bone using your ring finger.',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=60',
  },
  {
    key: 'moisturizer',
    category: 'MOISTURIZER',
    title: 'Barrier Repair Cream',
    instructions: 'Warm a coin-sized amount between palms and press into skin.',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=60',
  },
  {
    key: 'spf',
    category: 'SUN PROTECTION',
    title: 'SPF 50+ Shield',
    instructions: 'Apply generously as the final step, 15 minutes before sun exposure.',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=60',
  },
];

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
  const period = routineTitle.toUpperCase().startsWith('PM') ? 'PM' : 'AM';
  const steps = AM_STEPS;
  const request = useAuthedRequest();

  const [stepIndex, setStepIndex] = useState(1); // 0-based index of the current/active step
  const [feeling, setFeeling] = useState('Fresh');

  useEffect(() => {
    request(`/api/routines/today?period=${period}`)
      .then(({ completedStepKeys }) => {
        const doneCount = steps.filter((s) => completedStepKeys.includes(s.key)).length;
        if (doneCount > 0) setStepIndex(Math.min(doneCount, steps.length - 1));
      })
      .catch(() => {
        // Fall back to the default starting step if the backend is unreachable.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = steps.length;
  const current = steps[stepIndex];
  const progress = (stepIndex + 1) / total;

  const finishRoutine = async () => {
    try {
      const { streak } = await request('/api/routines/finish', { method: 'POST', body: { period } });
      navigation?.replace
        ? navigation.replace('RoutineComplete', { routineTitle, streak })
        : navigation?.navigate('RoutineComplete', { routineTitle, streak });
    } catch (err) {
      navigation?.navigate('RoutineComplete', { routineTitle, streak: 1 });
    }
  };

  const handleComplete = async () => {
    try {
      await request('/api/routines/steps/complete', {
        method: 'POST',
        body: { period, stepKey: current.key },
      });
    } catch (err) {
      // Non-critical — still advance locally even if the write failed.
    }

    if (stepIndex + 1 >= total) {
      finishRoutine();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleFinish = () => {
    finishRoutine();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close routine"
        >
          <Ionicons name="close" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{routineTitle}</Text>

        <Text style={styles.navStep}>Step {stepIndex + 1} of {total}</Text>
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
        {steps.slice(0, stepIndex).map(s => (
          <CompletedStepRow key={s.key} title={s.title} />
        ))}

        {/* Active step */}
        <ActiveStepCard index={stepIndex + 1} step={current} onComplete={handleComplete} />

        {/* Locked steps */}
        {steps.slice(stepIndex + 1).map((s, i) => (
          <LockedStepRow key={s.key} index={stepIndex + 2 + i} category={s.category} title={s.title} />
        ))}

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
  moreBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
});
