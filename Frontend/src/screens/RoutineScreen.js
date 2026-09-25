import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { usePreferences } from '../api/usePreferences';
import { localDateStr } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/feedback';
import { remindersSupported, reminderStatusMessage, syncRemindersFromServer } from '../utils/reminders';
import { AM_STEPS, PM_STEPS, MINUTES_PER_STEP, stepsForPeriod } from '../data/routineSteps';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateLabel(date = new Date()) {
  return date
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase();
}

// Date of the i-th day (Monday = 0) of the current week.
function weekDate(i) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + i);
  return d;
}

// "07:30" → "07:30 AM"
function formatTime(hhmm) {
  const [h, m] = String(hhmm || '00:00').split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

// The single most impactful next action: the next undone step of the routine
// for this time of day, then the other routine, then logging the finish.
function pickOneThing({ amKeys, pmKeys, finishedToday }) {
  const primary = new Date().getHours() < 15 ? 'AM' : 'PM';
  for (const period of primary === 'AM' ? ['AM', 'PM'] : ['PM', 'AM']) {
    const done = period === 'AM' ? amKeys : pmKeys;
    const step = stepsForPeriod(period).find((st) => !done.includes(st.key));
    if (step) return { kind: 'step', period, step };
  }
  return finishedToday ? { kind: 'done' } : { kind: 'finish', period: primary };
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
function RoutineBlock({ title, completed, total, timeLeft, isPrimary, onPress, actionLabel }) {
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
          accessibilityLabel={`${actionLabel} ${title}`}
        >
          <Text style={[styles.rBtnText, !isPrimary && styles.rBtnTextDim]}>
            {actionLabel}
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

function WeekStrip({ done = [], todayIdx = 0, selectedIdx = todayIdx, onSelect }) {
  return (
    <View style={styles.strip}>
      {LETTERS.map((l, i) => {
        const num        = weekDate(i).getDate();
        const isDone     = done.includes(i);
        const isToday    = i === todayIdx;
        const isFuture   = i > todayIdx;
        const isSelected = i === selectedIdx;

        return (
          <TouchableOpacity
            key={i}
            style={styles.dayCol}
            onPress={() => onSelect?.(i)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${l} ${num}${isDone ? ', done' : ''}${isToday ? ', today' : ''}`}
          >
            <Text style={[styles.dayLetter, isSelected && styles.dayLetterSelected]}>{l}</Text>
            <View
              style={[
                styles.dayCircle,
                isDone     && styles.dayDone,
                isFuture   && !isSelected && styles.dayFuture,
                isSelected && !isDone && styles.dayToday,
                isSelected && isDone && styles.dayDoneSelected,
              ]}
            >
              {isDone
                ? <Ionicons name="checkmark" size={14} color={colors.white} />
                : <Text style={[
                    styles.dayNum,
                    isFuture && !isSelected && styles.dayNumFuture,
                    (isSelected || isToday) && styles.dayNumToday,
                  ]}>{num}</Text>
              }
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Focus Banner ─────────────────────────────────────────────────────────────
function OneThingResult({ suggestion, busy, onOpen, onMarkDone, onDismiss }) {
  const { kind } = suggestion;
  const label = kind === 'step'
    ? `YOUR ONE THING · ${suggestion.period} · ${suggestion.step.category}`
    : 'YOUR ONE THING';
  const title = kind === 'step' ? suggestion.step.title
    : kind === 'finish' ? 'Finish your routine'
    : "You're all done today";
  const text = kind === 'step' ? suggestion.step.instructions
    : kind === 'finish' ? 'Every step is done. Log it to keep your streak going.'
    : 'Both routines are complete and your streak is logged. Rest up!';

  return (
    <View style={styles.oneThing}>
      <View style={styles.oneThingTop}>
        <Text style={styles.oneThingLabel} numberOfLines={1}>{label}</Text>
        <TouchableOpacity onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss suggestion">
          <Ionicons name="close" size={16} color={colors.textFaint} />
        </TouchableOpacity>
      </View>
      <Text style={styles.oneThingTitle}>{title}</Text>
      <Text style={styles.oneThingText}>{text}</Text>

      {kind !== 'done' && (
        <View style={styles.oneThingActions}>
          {kind === 'step' && (
            <TouchableOpacity
              style={[styles.focusBtn, styles.oneThingBtn]}
              onPress={onMarkDone}
              disabled={busy}
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel="Mark this step done"
            >
              {busy
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Text style={styles.focusBtnText}>Mark done</Text>}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.focusBtn, styles.oneThingBtn, styles.oneThingBtnSolid]}
            onPress={onOpen}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={kind === 'finish' ? 'Finish routine' : 'Open routine'}
          >
            <Text style={[styles.focusBtnText, styles.oneThingBtnSolidText]}>
              {kind === 'finish' ? 'Finish routine' : 'Open routine'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function FocusBanner({ onPress, suggestion, ...resultProps }) {
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

      {suggestion ? (
        <OneThingResult suggestion={suggestion} {...resultProps} />
      ) : (
        <TouchableOpacity
          style={styles.focusBtn}
          onPress={onPress}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Just give me one thing"
        >
          <Text style={styles.focusBtnText}>Just give me one thing</Text>
        </TouchableOpacity>
      )}
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

// ─── Reminder Editor ──────────────────────────────────────────────────────────
function TimeStepper({ value, label, onStep }) {
  return (
    <View style={styles.remStepper}>
      <TouchableOpacity onPress={() => onStep(1)} style={styles.remStepBtn}
        accessibilityRole="button" accessibilityLabel={`Increase ${label}`}>
        <Ionicons name="chevron-up" size={18} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.remStepValue}>{String(value).padStart(2, '0')}</Text>
      <TouchableOpacity onPress={() => onStep(-1)} style={styles.remStepBtn}
        accessibilityRole="button" accessibilityLabel={`Decrease ${label}`}>
        <Ionicons name="chevron-down" size={18} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

function ReminderEditor({ slot, value, saving, onCancel, onSave, onOpenSettings }) {
  const [h24, setH24] = useState(7);
  const [minute, setMinute] = useState(30);
  // Keep showing the last slot while the modal fades out after closing.
  const [shownSlot, setShownSlot] = useState(slot);

  // Reset to the saved time every time the editor opens.
  useEffect(() => {
    if (!slot) return;
    setShownSlot(slot);
    const [h, m] = String(value || '00:00').split(':').map(Number);
    setH24(h);
    setMinute(m);
  }, [slot, value]);

  const isPM = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const hhmm = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const stepHour = (d) => setH24((h) => (h >= 12 ? 12 : 0) + ((h % 12) + d + 12) % 12);
  const stepMinute = (d) => setMinute((m) => (m + d * 5 + 60) % 60);

  return (
    <Modal visible={!!slot} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.remBackdrop}>
        <View style={styles.remSheet}>
          <Text style={styles.rTileLabel}>{shownSlot === 'evening' ? 'EVENING' : 'MORNING'} REMINDER</Text>
          <Text style={styles.remTitle}>
            {shownSlot === 'evening' ? 'Remind me to do my PM routine' : 'Remind me to do my AM routine'}
          </Text>

          <View style={styles.remPicker}>
            <TimeStepper value={h12} label="hour" onStep={stepHour} />
            <Text style={styles.remColon}>:</Text>
            <TimeStepper value={minute} label="minute" onStep={stepMinute} />
            <View style={styles.remAmPm}>
              {['AM', 'PM'].map((p) => {
                const active = (p === 'PM') === isPM;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.remAmPmBtn, active && styles.remAmPmBtnActive]}
                    onPress={() => { if (!active) setH24((h) => (h + 12) % 24); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={p}
                  >
                    <Text style={[styles.remAmPmText, active && styles.remAmPmTextActive]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {!remindersSupported && (
            <Text style={styles.remWebNote}>
              Your time syncs to your account — reminders are delivered by the MyFace AI phone app.
            </Text>
          )}

          <TouchableOpacity onPress={onOpenSettings} style={styles.remSettingsLink}
            accessibilityRole="button" accessibilityLabel="Notification settings">
            <Ionicons name="notifications-outline" size={14} color={colors.primary} />
            <Text style={styles.remSettingsText}>Notification settings</Text>
          </TouchableOpacity>

          <View style={styles.remActions}>
            <TouchableOpacity style={[styles.rBtn, styles.rBtnOutline, styles.remActionBtn]} onPress={onCancel}
              accessibilityRole="button" accessibilityLabel="Cancel">
              <Text style={[styles.rBtnText, styles.rBtnTextDim]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rBtn, styles.remActionBtn]} onPress={() => onSave(hhmm)}
              disabled={saving} accessibilityRole="button" accessibilityLabel="Save reminder">
              {saving
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Text style={styles.rBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
        <Text style={styles.auditDesc}>Your weekly audit is ready to view.</Text>
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

// ─── Screen ──────────────────────────────────────────────────────────────────
const AM_ROUTINE_TOTAL = AM_STEPS.length;
const PM_ROUTINE_TOTAL = PM_STEPS.length;

function timeLeftLabel(completed, total, isToday, isFuture) {
  if (isFuture) return 'Upcoming';
  if (completed >= total) return 'Done';
  if (!isToday) return 'Missed';
  return `${(total - completed) * MINUTES_PER_STEP} mins left`;
}

function actionLabelFor(completed, total) {
  if (completed >= total) return 'Review';
  return completed > 0 ? 'Continue' : 'Start';
}

const LOAD_ERROR = 'Could not load your routine. Check your connection.';

export default function RoutineScreen({ navigation }) {
  const request = useAuthedRequest();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const { prefs, save: savePrefs, saving: savingReminder } = usePreferences();

  const todayIdx = mondayFirstIndexToday();

  // Today's progress (step keys are what the step screen and backend track)
  const [amKeys, setAmKeys] = useState([]);
  const [pmKeys, setPmKeys] = useState([]);
  const [streak, setStreak] = useState(0);
  const [weekDone, setWeekDone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoaded = useRef(false);

  // Week strip selection — another day's progress is fetched on demand.
  const [selectedIdx, setSelectedIdx] = useState(todayIdx);
  const [dayData, setDayData] = useState(null);
  const [dayLoading, setDayLoading] = useState(false);

  const [suggestion, setSuggestion] = useState(null);
  const [markingDone, setMarkingDone] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // 'morning' | 'evening'

  const applySummary = useCallback((summary) => {
    setAmKeys(summary.am.completedStepKeys ?? []);
    setPmKeys(summary.pm.completedStepKeys ?? []);
    setStreak(summary.streak ?? 0);
    setWeekDone(summary.weekDoneIndices ?? []);
  }, []);

  const loadSummary = useCallback(async () => {
    setError(null);
    // Only block the page on the first load; refreshes update in place.
    if (!hasLoaded.current) setLoading(true);
    try {
      applySummary(await request('/api/routines/summary'));
      hasLoaded.current = true;
    } catch {
      setError(LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, [request, applySummary]);

  useFocusEffect(useCallback(() => {
    loadSummary();
    // Returning from a routine: stale suggestions would point at finished steps.
    setSuggestion(null);
  }, [loadSummary]));

  // Load the selected day's progress when it isn't today.
  useEffect(() => {
    if (selectedIdx === todayIdx) { setDayData(null); return undefined; }
    if (selectedIdx > todayIdx) { setDayData({ future: true, am: [], pm: [] }); return undefined; }
    let cancelled = false;
    setDayLoading(true);
    request(`/api/routines/day?date=${localDateStr(weekDate(selectedIdx))}`)
      .then((d) => {
        if (!cancelled) setDayData({ am: d.am.completedStepKeys ?? [], pm: d.pm.completedStepKeys ?? [] });
      })
      .catch(() => {
        if (!cancelled) {
          setDayData(null);
          setSelectedIdx(todayIdx);
          setError('Could not load that day. Please try again.');
        }
      })
      .finally(() => { if (!cancelled) setDayLoading(false); });
    return () => { cancelled = true; };
  }, [selectedIdx, todayIdx, request]);

  const isToday = selectedIdx === todayIdx;
  const isFuture = selectedIdx > todayIdx;
  const shownAm = isToday ? amKeys : (dayData?.am ?? []);
  const shownPm = isToday ? pmKeys : (dayData?.pm ?? []);
  const amDone = Math.min(shownAm.length, AM_ROUTINE_TOTAL);
  const pmDone = Math.min(shownPm.length, PM_ROUTINE_TOTAL);

  const openRoutine = (routineTitle) => {
    if (!isToday) {
      // Past/future days are read-only; the buttons jump back to today.
      setSelectedIdx(todayIdx);
      return;
    }
    navigation?.navigate('RoutineStep', { routineTitle });
  };

  const giveOneThing = () => {
    setSelectedIdx(todayIdx);
    setSuggestion(pickOneThing({ amKeys, pmKeys, finishedToday: weekDone.includes(todayIdx) }));
  };

  const markSuggestionDone = async () => {
    if (suggestion?.kind !== 'step') return;
    setMarkingDone(true);
    try {
      const { completedStepKeys } = await request('/api/routines/steps/complete', {
        method: 'POST',
        body: { period: suggestion.period, stepKey: suggestion.step.key },
      });
      const nextAm = suggestion.period === 'AM' ? completedStepKeys : amKeys;
      const nextPm = suggestion.period === 'PM' ? completedStepKeys : pmKeys;
      setAmKeys(nextAm);
      setPmKeys(nextPm);
      // Immediately offer the next most impactful thing.
      setSuggestion(pickOneThing({ amKeys: nextAm, pmKeys: nextPm, finishedToday: weekDone.includes(todayIdx) }));
    } catch (err) {
      notify('Could not save this step', err?.message || 'Please check your connection and try again.');
    } finally {
      setMarkingDone(false);
    }
  };

  const reminders = prefs?.reminders ?? { morning: '07:30', evening: '22:00' };

  const saveReminder = async (hhmm) => {
    try {
      await savePrefs({ reminders: { [editingSlot]: hhmm } });
      setEditingSlot(null);
    } catch (err) {
      notify('Could not save reminder', err?.message || 'Please check your connection and try again.');
      return;
    }
    // Reschedule the phone's daily notifications (asks for permission once).
    try {
      const message = reminderStatusMessage(await syncRemindersFromServer(request, { ask: true }));
      if (message) notify('Reminder saved', message);
    } catch (err) {
      notify('Reminder saved', 'Your time is saved, but the notification could not be scheduled. Please try again.');
    }
  };

  // Tabs have nothing to go back to when opened directly — fall back to Home.
  const leave = () => (navigation?.canGoBack() ? navigation.goBack() : navigation?.navigate('Home'));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Nav bar */}
      <View style={styles.nav}>
        <TouchableOpacity
          onPress={leave}
          style={styles.navIconBtn}
          accessibilityRole="button" accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MyFace AI</Text>
        <TouchableOpacity
          onPress={() => navigation?.navigate('Home')}
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
            onRetry={loadSummary}
            onDismiss={() => setError(null)}
          />

          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.greetDate}>{dateLabel(weekDate(selectedIdx))}</Text>
            <Text style={styles.greetTitle}>
              {isToday ? `Good ${greetingWord()}, ${firstName}` : isFuture ? 'Coming up' : 'Looking back'}
            </Text>
          </View>

          {/* Routines — show the selected day's progress */}
          {dayLoading ? (
            <View style={styles.dayLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <>
              <RoutineBlock title="AM Routine" completed={amDone} total={AM_ROUTINE_TOTAL}
                timeLeft={timeLeftLabel(amDone, AM_ROUTINE_TOTAL, isToday, isFuture)} isPrimary
                actionLabel={isToday ? actionLabelFor(amDone, AM_ROUTINE_TOTAL) : 'Go to today'}
                onPress={() => openRoutine('AM Routine')} />
              <RoutineBlock title="PM Routine" completed={pmDone} total={PM_ROUTINE_TOTAL}
                timeLeft={timeLeftLabel(pmDone, PM_ROUTINE_TOTAL, isToday, isFuture)} isPrimary={false}
                actionLabel={isToday ? actionLabelFor(pmDone, PM_ROUTINE_TOTAL) : 'Go to today'}
                onPress={() => openRoutine('PM Routine')} />
            </>
          )}

          {/* Stats */}
          <SectionRow title="Routine Stats" badge={`${streak} DAY STREAK`} />
          <View style={styles.weekCard}>
            <WeekStrip
              done={weekDone}
              todayIdx={todayIdx}
              selectedIdx={selectedIdx}
              onSelect={setSelectedIdx}
            />
          </View>

          {/* Focus */}
          <FocusBanner
            onPress={giveOneThing}
            suggestion={suggestion}
            busy={markingDone}
            onMarkDone={markSuggestionDone}
            onOpen={() => navigation?.navigate('RoutineStep', {
              routineTitle: `${suggestion?.period ?? 'AM'} Routine`,
            })}
            onDismiss={() => setSuggestion(null)}
          />

          {/* Reminders */}
          <SectionRow title="Upcoming Reminders" />
          <View style={styles.tileRow}>
            <ReminderTile label="MORNING" time={formatTime(reminders.morning)} onPress={() => setEditingSlot('morning')} />
            <ReminderTile label="EVENING" time={formatTime(reminders.evening)} onPress={() => setEditingSlot('evening')} />
          </View>

          {/* Audit */}
          <AuditCard onPress={() => navigation?.navigate('WeeklyReport')} />

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      <ReminderEditor
        slot={editingSlot}
        value={editingSlot ? reminders[editingSlot] : null}
        saving={savingReminder}
        onCancel={() => setEditingSlot(null)}
        onSave={saveReminder}
        onOpenSettings={() => { setEditingSlot(null); navigation?.navigate('Notifications'); }}
      />
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

  // ── Day selection / loading ───────────────────────────────
  dayLetterSelected: { color: colors.primary, fontWeight: '800' },
  // selected + done: keep the fill, add a darker ring
  dayDoneSelected: {
    borderColor: colors.primaryDark,
    borderWidth: 2.5,
  },
  dayLoading: { height: 120, justifyContent: 'center', alignItems: 'center' },

  // ── "One thing" result ────────────────────────────────────
  oneThing: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
    gap: 4,
  },
  oneThingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  oneThingLabel: {
    flex: 1,
    fontSize: 9, fontWeight: '800',
    color: colors.primary, letterSpacing: 1,
  },
  oneThingTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginTop: 2 },
  oneThingText: { fontSize: 12.5, color: colors.textMid, lineHeight: 18 },
  oneThingActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  oneThingBtn: { flex: 1, paddingVertical: 10 },
  oneThingBtnSolid: { backgroundColor: colors.primary },
  oneThingBtnSolidText: { color: colors.white },

  // ── Reminder editor ───────────────────────────────────────
  remBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,16,20,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  remSheet: {
    width: '100%', maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: CR,
    padding: 20,
    gap: 6,
    ...S1,
  },
  remTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark, marginBottom: 8 },
  remPicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 8,
  },
  remStepper: { alignItems: 'center' },
  remStepBtn: {
    width: 36, height: 30, borderRadius: 10,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  remStepValue: {
    fontSize: 30, fontWeight: '800', color: colors.textDark,
    letterSpacing: -0.5, marginVertical: 4, minWidth: 48, textAlign: 'center',
  },
  remColon: { fontSize: 28, fontWeight: '800', color: colors.textDark, marginBottom: 4 },
  remAmPm: { marginLeft: 8, gap: 6 },
  remAmPmBtn: {
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 100,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
  },
  remAmPmBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  remAmPmText: { fontSize: 12, fontWeight: '700', color: colors.textMid },
  remAmPmTextActive: { color: colors.white },
  remSettingsLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
  },
  remSettingsText: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  remWebNote: { fontSize: 12, color: colors.textLight, textAlign: 'center', lineHeight: 17, marginTop: 4 },
  remActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  remActionBtn: {
    flex: 1, alignSelf: 'auto', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, minHeight: 44,
  },
});
