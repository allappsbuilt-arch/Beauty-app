import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { useAuth } from '../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayLabel() {
  return new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase();
}

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function mondayFirstIndexToday() {
  return (new Date().getDay() + 6) % 7;
}

// ─── Ring Progress ────────────────────────────────────────────────────────────
// Pure-RN circular ring.  When percent=0 we show track only (PM card).
function RingProgress({ percent = 0, size = 62, stroke = 6,
  tint = colors.primary, track = colors.roseDark, label }) {
  const deg   = Math.round((percent / 100) * 360);
  const inner = size - stroke * 2 - 2;

  return (
    <View style={{ width: size, height: size,
      justifyContent: 'center', alignItems: 'center' }}>

      {/* track */}
      <View style={{
        position: 'absolute', width: size, height: size,
        borderRadius: size / 2, borderWidth: stroke, borderColor: track,
      }} />

      {/* filled arc */}
      {percent > 0 && (
        <View style={{
          position: 'absolute', width: size, height: size,
          borderRadius: size / 2, borderWidth: stroke,
          borderTopColor:    tint,
          borderRightColor:  deg > 90  ? tint : track,
          borderBottomColor: deg > 180 ? tint : track,
          borderLeftColor:   deg > 270 ? tint : track,
          transform: [{ rotate: '-45deg' }],
        }} />
      )}

      {/* centre */}
      <View style={{
        width: inner, height: inner, borderRadius: inner / 2,
        backgroundColor: colors.white,
        justifyContent: 'center', alignItems: 'center',
      }}>
        {label
          ? label                   // custom node (e.g. moon icon for PM)
          : <Text style={{
              fontSize: 11, fontWeight: '800',
              color: tint, letterSpacing: -0.2,
            }}>{percent}%</Text>
        }
      </View>
    </View>
  );
}

// ─── Routine Block ────────────────────────────────────────────────────────────
function RoutineBlock({ title, completed, total, timeLeft, isPrimary, onPress }) {
  const pct   = total > 0 ? Math.round((completed / total) * 100) : 0;
  const tint  = isPrimary ? colors.primary  : colors.textPlaceholder;
  const track = isPrimary ? colors.roseDark : colors.borderLight;

  // PM card shows a moon icon inside the ring instead of "0%"
  const centreNode = !isPrimary
    ? <Ionicons name="moon" size={14} color={colors.textPlaceholder} />
    : null;

  return (
    <View style={[styles.rCard, !isPrimary && styles.rCardDim]}>

      <RingProgress
        percent={pct} size={62} stroke={6}
        tint={tint} track={track}
        label={centreNode}
      />

      <View style={styles.rInfo}>
        <Text style={[styles.rTitle, !isPrimary && styles.rTitleDim]}>{title}</Text>
        <Text style={styles.rMeta}>
          {completed}/{total} steps{'\u00A0\u00B7\u00A0'}{timeLeft}
        </Text>

        <TouchableOpacity
          style={[styles.rBtn, !isPrimary && styles.rBtnOutline]}
          onPress={onPress}
          activeOpacity={0.80}
          accessibilityRole="button"
          accessibilityLabel={isPrimary ? `Continue ${title}` : `Start ${title}`}
        >
          <Text style={[styles.rBtnText, !isPrimary && styles.rBtnTextDim]}>
            {isPrimary ? 'Continue' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* watermark */}
      <View style={[styles.watermark, { pointerEvents: 'none' }]}>
        <Ionicons
          name={isPrimary ? 'sunny-outline' : 'moon-outline'}
          size={54}
          color={isPrimary ? '#F5D5DB' : colors.borderLight}
        />
      </View>
    </View>
  );
}

// ─── Week Strip ───────────────────────────────────────────────────────────────
const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function WeekStrip({ done = [0, 1], todayIdx = 2 }) {
  const today  = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return (
    <View style={styles.strip}>
      {LETTERS.map((l, i) => {
        const d      = new Date(monday);
        d.setDate(monday.getDate() + i);
        const num    = d.getDate();
        const isDone = done.includes(i);
        const isToday   = i === todayIdx;
        const isFuture  = i > todayIdx;

        return (
          <View key={i} style={styles.dayCol}>
            <Text style={styles.dayLetter}>{l}</Text>
            <View
              style={[
                styles.dayCircle,
                isDone   && styles.dayDone,
                isToday  && !isDone && styles.dayToday,
                isFuture && styles.dayFuture,
              ]}
              accessibilityLabel={`${l} ${num}${isDone ? ', done' : ''}`}
            >
              {isDone
                ? <Ionicons name="checkmark" size={14} color={colors.white} />
                : <Text style={[
                    styles.dayNum,
                    isToday  && styles.dayNumToday,
                    isFuture && styles.dayNumFuture,
                  ]}>{num}</Text>
              }
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Focus Banner ─────────────────────────────────────────────────────────────
function FocusBanner({ onPress }) {
  return (
    <View style={styles.focusCard}>
      <View style={styles.focusRow}>
        {/* square-rounded icon — matches reference */}
        <View style={styles.focusIconBox}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
        </View>
        <View style={styles.focusTextBox}>
          <Text style={styles.focusTitle}>Feeling Overwhelmed?</Text>
          <Text style={styles.focusDesc}>Focus on just the most impactful step.</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.focusBtn}
        onPress={onPress}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel="Just give me one thing"
      >
        <Text style={styles.focusBtnText}>Just give me one thing</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Reminder Tile ────────────────────────────────────────────────────────────
function ReminderTile({ label, time, onPress }) {
  return (
    <TouchableOpacity
      style={styles.rTile}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label} reminder at ${time}`}
    >
      <View style={styles.rTileTop}>
        <Text style={styles.rTileLabel}>{label}</Text>
        {/* bare clock icon — reference shows no pill */}
        <Ionicons name="alarm-outline" size={15} color={colors.textPlaceholder} />
      </View>
      <Text style={styles.rTileTime}>{time}</Text>
    </TouchableOpacity>
  );
}

// ─── Audit Card ───────────────────────────────────────────────────────────────
function AuditCard({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.auditCard}
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel="View routine audit"
    >
      {/* trend-line icon matches reference */}
      <View style={styles.auditIcon}>
        <Ionicons name="trending-up" size={22} color="#8870C0" />
      </View>

      <View style={styles.auditText}>
        <Text style={styles.auditTitle}>Routine Audit</Text>
        <Text style={styles.auditDesc}>Your monthly audit is ready to view.</Text>
      </View>

      <View style={styles.auditArrow}>
        <Ionicons name="chevron-forward" size={16} color={colors.white} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Section Row ─────────────────────────────────────────────────────────────
function SectionRow({ title, badge }) {
  return (
    <View style={styles.secRow}>
      <Text style={styles.secTitle}>{title}</Text>
      {badge && (
        <View style={styles.secBadge}>
          <Ionicons name="flame" size={11} color={colors.primary} />
          <Text style={styles.secBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyRoutine({ onBuild }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyGlow} pointerEvents="none">
        <Ionicons name="sunny-outline" size={40} color={colors.primary} style={{ marginRight: 18 }} />
        <Ionicons name="moon-outline" size={30} color={colors.accentDark} style={styles.emptyMoon} />
      </View>

      <Text style={styles.emptyTitle}>No Routine Set Up</Text>
      <Text style={styles.emptyDesc}>
        Create a personalized morning and evening routine based on your AI face analysis.
      </Text>

      <TouchableOpacity
        style={styles.emptyCta}
        activeOpacity={0.85}
        onPress={onBuild}
        accessibilityRole="button"
        accessibilityLabel="Build my routine"
      >
        <Text style={styles.emptyCtaText}>Build My Routine</Text>
      </TouchableOpacity>

      <View style={styles.emptyAiCard}>
        <View style={styles.emptyAiIcon}>
          <Ionicons name="happy-outline" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.emptyAiLabel}>AI RECOMMENDATION</Text>
          <Text style={styles.emptyAiText}>
            Our AI identified high skin elasticity. A hydration-focused routine is recommended for your profile.
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
const AM_ROUTINE_TOTAL = 10;
const PM_ROUTINE_TOTAL = 8;

export default function RoutineScreen({ navigation }) {
  const request = useAuthedRequest();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const [amCompleted, setAmCompleted] = useState(0);
  const [pmCompleted, setPmCompleted] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weekDone, setWeekDone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      request('/api/routines/summary')
        .then((summary) => {
          if (cancelled) return;
          setAmCompleted(Math.min(summary.am.completedToday, AM_ROUTINE_TOTAL));
          setPmCompleted(Math.min(summary.pm.completedToday, PM_ROUTINE_TOTAL));
          setStreak(summary.streak ?? 0);
          setWeekDone(summary.weekDoneIndices ?? []);
        })
        .catch(() => {
          if (!cancelled) setError('Could not load your routine. Check your connection.');
        })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [request])
  );

  const AM_ROUTINE = { completed: amCompleted, total: AM_ROUTINE_TOTAL, timeLeft: '12 mins left' };
  const PM_ROUTINE = { completed: pmCompleted, total: PM_ROUTINE_TOTAL, timeLeft: '15 mins est.' };
  const hasRoutine = true; // routine always exists once user is logged in

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Nav bar */}
      <View style={styles.nav}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.navIconBtn}
          accessibilityRole="button" accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MyFace AI</Text>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.navIconBtn}
          accessibilityRole="button" accessibilityLabel="Close"
        >
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: 14, color: colors.textLight, fontWeight: '500' }}>Loading your routine…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          <ErrorBanner
            message={error}
            onRetry={() => {
              setLoading(true);
              setError(null);
              request('/api/routines/summary')
                .then((summary) => {
                  setAmCompleted(Math.min(summary.am.completedToday, AM_ROUTINE_TOTAL));
                  setPmCompleted(Math.min(summary.pm.completedToday, PM_ROUTINE_TOTAL));
                  setStreak(summary.streak ?? 0);
                  setWeekDone(summary.weekDoneIndices ?? []);
                })
                .catch(() => setError('Could not load your routine. Check your connection.'))
                .finally(() => setLoading(false));
            }}
            onDismiss={() => setError(null)}
          />

          {hasRoutine ? (
            <>
              {/* Greeting */}
              <View style={styles.greeting}>
                <Text style={styles.greetDate}>{todayLabel()}</Text>
                <Text style={styles.greetTitle}>Good {greetingWord()}, {firstName}</Text>
              </View>

            {/* Routines */}
            <RoutineBlock title="AM Routine" completed={AM_ROUTINE.completed} total={AM_ROUTINE.total}
              timeLeft={AM_ROUTINE.timeLeft} isPrimary
              onPress={() => navigation?.navigate('RoutineStep', { routineTitle: 'AM Routine' })} />
            <RoutineBlock title="PM Routine" completed={PM_ROUTINE.completed} total={PM_ROUTINE.total}
              timeLeft={PM_ROUTINE.timeLeft} isPrimary={false}
              onPress={() => navigation?.navigate('RoutineStep', { routineTitle: 'PM Routine' })} />

            {/* Stats */}
            <SectionRow title="Routine Stats" badge={`${streak} DAY STREAK`} />
            <View style={styles.weekCard}>
              <WeekStrip done={weekDone} todayIdx={mondayFirstIndexToday()} />
            </View>

            {/* Focus */}
            <FocusBanner
              onPress={() => navigation?.navigate('RoutineStep', {
                routineTitle: new Date().getHours() < 15 ? 'AM Routine' : 'PM Routine',
              })}
            />

            {/* Reminders */}
            <SectionRow title="Upcoming Reminders" />
            <View style={styles.tileRow}>
              <ReminderTile label="MORNING" time="07:30 AM" onPress={() => navigation?.navigate('Notifications')} />
              <ReminderTile label="EVENING" time="10:00 PM" onPress={() => navigation?.navigate('Notifications')} />
            </View>

            {/* Audit */}
            <AuditCard onPress={() => navigation?.navigate('WeeklyReport')} />
          </>
        ) : (
          <EmptyRoutine onBuild={() => navigation?.navigate('ScanFace')} />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const MX = 20;     // horizontal margin
const CR = 18;     // card border-radius

// Shared shadow presets
const S1 = {   // card shadow
  shadowColor:   '#8B1C34',
  shadowOpacity: 0.07,
  shadowRadius:  12,
  shadowOffset:  { width: 0, height: 3 },
  elevation: 3,
};
const S2 = {   // small tile shadow
  shadowColor:   '#8B1C34',
  shadowOpacity: 0.05,
  shadowRadius:  7,
  shadowOffset:  { width: 0, height: 2 },
  elevation: 2,
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.primaryBg },
  scroll:  { flex: 1 },
  content: { paddingBottom: 24 },

  // ── Nav ───────────────────────────────────────────────────
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingTop:    Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 13,
    // hairline bottom border only — matches reference
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  // Plain icon buttons — no background pill (matches reference)
  navIconBtn: {
    width: 32, height: 32,
    justifyContent: 'center', alignItems: 'center',
  },
  navTitle: {
    fontSize: 17, fontWeight: '700',
    color: colors.primary, letterSpacing: 0.1,
  },

  // ── Greeting ──────────────────────────────────────────────
  greeting: {
    paddingHorizontal: MX,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greetDate: {
    fontSize: 11, fontWeight: '700',
    color: colors.textFaint,
    letterSpacing: 1.2, marginBottom: 4,
  },
  greetTitle: {
    fontSize: 24, fontWeight: '800',
    color: colors.textDark, letterSpacing: -0.4,
  },

  // ── Routine card ──────────────────────────────────────────
  rCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: CR,
    marginHorizontal: MX,
    marginBottom: 10,
    paddingVertical: 20,
    paddingLeft: 18,
    paddingRight: 12,
    gap: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...S1,
  },
  rCardDim: {
    // PM card: slightly muted surface
    backgroundColor: '#FDFBFC',
    borderColor: colors.borderUltraLight,
    shadowOpacity: 0.03,
    elevation: 1,
  },
  rInfo:      { flex: 1 },
  rTitle:     { fontSize: 16, fontWeight: '800', color: colors.textDark, marginBottom: 3 },
  rTitleDim:  { color: colors.textMid },
  rMeta:      { fontSize: 12, color: colors.textLight, fontWeight: '500', marginBottom: 12 },

  rBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 9, paddingHorizontal: 24,
    shadowColor:   colors.primary,
    shadowOpacity: 0.32,
    shadowRadius:  10,
    shadowOffset:  { width: 0, height: 4 },
    elevation: 4,
  },
  rBtnOutline: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowOpacity: 0, elevation: 0,
  },
  rBtnText:    { fontSize: 13, fontWeight: '700', color: colors.white },
  rBtnTextDim: { color: colors.textMid },

  watermark: {
    position: 'absolute',
    right: -12, top: 30,
    transform: [{ translateY: -27 }],
    opacity: 0.50,
  },

  // ── Section row ───────────────────────────────────────────
  secRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: MX,
    marginTop: 22,
    marginBottom: 10,
  },
  secTitle: {
    fontSize: 17, fontWeight: '800',
    color: colors.textDark, letterSpacing: -0.2,
  },
  secBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryPale,
    borderRadius: 100,
    paddingHorizontal: 9, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.accentDark,
  },
  secBadgeText: {
    fontSize: 9, fontWeight: '800',
    color: colors.primary, letterSpacing: 0.8,
  },

  // ── Week card ─────────────────────────────────────────────
  weekCard: {
    backgroundColor: colors.white,
    borderRadius: CR,
    marginHorizontal: MX,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...S1,
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  dayCol:   { alignItems: 'center', gap: 8 },
  dayLetter: {
    fontSize: 11, fontWeight: '600',
    color: colors.textFaint,
  },
  dayCircle: {
    width: 33, height: 33, borderRadius: 17,
    backgroundColor: colors.sectionBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.borderLight,
  },
  // done: solid primary fill with glow
  dayDone: {
    backgroundColor: colors.primary,
    borderColor:     colors.primary,
    shadowColor:     colors.primary,
    shadowOpacity:   0.30,
    shadowRadius:    7,
    shadowOffset:    { width: 0, height: 3 },
    elevation: 4,
  },
  // today: white fill, primary border
  dayToday: {
    backgroundColor: colors.white,
    borderColor:     colors.primary,
    borderWidth:     2,
  },
  // future: very faint
  dayFuture: {
    backgroundColor: colors.offWhite,
    borderColor:     colors.borderUltraLight,
  },
  dayNum:        { fontSize: 12, fontWeight: '600', color: colors.textMid },
  dayNumToday:   { color: colors.primary, fontWeight: '700' },
  dayNumFuture:  { color: colors.textPlaceholder },

  // ── Focus card ────────────────────────────────────────────
  focusCard: {
    // warm off-white — matches reference's light pinkish background
    backgroundColor: '#FFF4F6',
    borderRadius: CR,
    marginHorizontal: MX,
    marginTop: 14,
    padding: 16,
    gap: 14,
    // no explicit border — reference shows none
    ...S1,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // square-rounded icon box — exact match to reference
  focusIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  focusTextBox: { flex: 1, gap: 2 },
  focusTitle: {
    fontSize: 15, fontWeight: '800',
    color: colors.textDark, letterSpacing: -0.1,
  },
  focusDesc: { fontSize: 12, color: colors.textLight, lineHeight: 18 },

  // full-width pill button — matches reference
  focusBtn: {
    backgroundColor: colors.primaryPale,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  focusBtnText: {
    fontSize: 14, fontWeight: '700',
    color: colors.primary,
  },

  // ── Reminder tiles ────────────────────────────────────────
  tileRow: {
    flexDirection: 'row',
    marginHorizontal: MX,
    gap: 10,
    marginBottom: 14,
  },
  rTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...S2,
  },
  rTileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rTileLabel: {
    fontSize: 9, fontWeight: '700',
    color: colors.textFaint,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  // large, bold time — matches reference
  rTileTime: {
    fontSize: 21, fontWeight: '800',
    color: colors.textDark, letterSpacing: -0.5,
    marginTop: 2,
  },

  // ── Audit card ────────────────────────────────────────────
  auditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    // lavender tint matching reference
    backgroundColor: '#F3EEFB',
    borderRadius: CR,
    marginHorizontal: MX,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E4D4F4',
    shadowColor:   '#6040A0',
    shadowOpacity: 0.09,
    shadowRadius:  12,
    shadowOffset:  { width: 0, height: 3 },
    elevation: 3,
  },
  auditIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#E8D8F8',
    justifyContent: 'center', alignItems: 'center',
  },
  auditText: { flex: 1, gap: 3 },
  auditTitle: {
    fontSize: 15, fontWeight: '800',
    color: colors.textDark,
  },
  auditDesc: {
    fontSize: 12, color: colors.textLight, lineHeight: 18,
  },
  auditArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#8870C0',
    justifyContent: 'center', alignItems: 'center',
    shadowColor:   '#8870C0',
    shadowOpacity: 0.30,
    shadowRadius:  8,
    shadowOffset:  { width: 0, height: 3 },
    elevation: 4,
  },

  // ── Empty state ───────────────────────────────────────────
  emptyWrap: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  emptyGlow: {
    width: 220, height: 220, borderRadius: 110, marginBottom: 28,
    backgroundColor: colors.primaryPale, borderWidth: 1, borderColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
  },
  emptyMoon: { marginTop: -30, marginLeft: -10 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: colors.textMid, textAlign: 'center', lineHeight: 21, marginBottom: 26 },
  emptyCta: {
    alignSelf: 'stretch', backgroundColor: colors.primary, borderRadius: 100,
    paddingVertical: 16, alignItems: 'center', marginBottom: 20,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  emptyCtaText: { color: colors.white, fontSize: 15.5, fontWeight: '800' },
  emptyAiCard: {
    alignSelf: 'stretch', flexDirection: 'row', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  emptyAiIcon: {
    width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyAiLabel: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.8, marginBottom: 4 },
  emptyAiText: { fontSize: 13, color: colors.textMid, lineHeight: 19 },
});
