import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Animated, Easing, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { confirm } from '../utils/feedback';

// Box-style paced breathing, repeated for the session length.
const PHASES = [
  { label: 'Breathe in', secs: 4, scale: 1 },
  { label: 'Hold', secs: 4, scale: 1 },
  { label: 'Breathe out', secs: 6, scale: 0.6 },
];
const CYCLE = PHASES.reduce((n, p) => n + p.secs, 0);

function phaseAt(elapsed) {
  let t = elapsed % CYCLE;
  for (const p of PHASES) {
    if (t < p.secs) return { ...p, left: p.secs - t };
    t -= p.secs;
  }
  return { ...PHASES[0], left: PHASES[0].secs };
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function MindfulnessSessionScreen({ navigation }) {
  const request = useAuthedRequest();
  const [live, setLive] = useState(null);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('intro'); // intro | running | done
  const [session, setSession] = useState(null); // { id, total }
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const scale = useRef(new Animated.Value(0.6)).current;
  const sessionRef = useRef(null);
  sessionRef.current = stage === 'running' ? session : null;

  const loadLive = useCallback(async () => {
    try { setLive(await request('/api/social/live')); } catch (err) { setError(err.message); }
  }, [request]);

  useFocusEffect(useCallback(() => {
    loadLive();
    const t = setInterval(loadLive, 30000); // keep the live count fresh
    return () => clearInterval(t);
  }, [loadLive]));

  // Leaving mid-session (back button / closing) stops counting as live.
  useEffect(() => () => {
    if (sessionRef.current) request(`/api/social/live/${sessionRef.current.id}/leave`, { method: 'POST' }).catch(() => {});
  }, [request]);

  const complete = useCallback(async (s) => {
    setBusy(true);
    try {
      const res = await request(`/api/social/live/${s.id}/complete`, { method: 'POST' });
      setPointsAwarded(res.pointsAwarded);
      setStage('done');
      loadLive();
    } catch (err) {
      setError(err.message || 'Could not save your session.');
    } finally {
      setBusy(false);
    }
  }, [request, loadLive]);

  // Session clock.
  useEffect(() => {
    if (stage !== 'running' || paused) return undefined;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [stage, paused]);

  useEffect(() => {
    if (stage === 'running' && session && elapsed >= session.total) complete(session);
  }, [elapsed, stage, session, complete]);

  // Breathing circle follows the current phase.
  const phase = phaseAt(elapsed);
  useEffect(() => {
    if (stage !== 'running' || paused) return;
    Animated.timing(scale, {
      toValue: phase.scale, duration: phase.left * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false,
    }).start();
  }, [phase.label, stage, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await request('/api/social/live/join', { method: 'POST' });
      setSession({ id: res.sessionId, total: res.minutes * 60 });
      setElapsed(0);
      setPaused(false);
      scale.setValue(0.6);
      setStage('running');
      loadLive();
    } catch (err) {
      setError(err.message || 'Could not start the session.');
    } finally {
      setBusy(false);
    }
  };

  const endEarly = async () => {
    setPaused(true);
    const ok = await confirm('End session?', 'Your progress in this session won’t be saved.', 'End');
    if (!ok) { setPaused(false); return; }
    request(`/api/social/live/${session.id}/leave`, { method: 'POST' }).catch(() => {});
    setStage('intro');
    setSession(null);
    loadLive();
  };

  const others = Math.max(0, (live?.liveCount ?? 0) - (stage === 'running' ? 1 : 0));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title="Mindfulness" onBack={() => navigation?.goBack()} />
      <ErrorBanner message={error} onRetry={stage === 'intro' ? start : loadLive} onDismiss={() => setError(null)} />

      <View style={styles.body}>
        <View style={styles.livePill}>
          <View style={[styles.liveDot, others > 0 && styles.liveDotOn]} />
          <Text style={styles.livePillText}>
            {others > 0 ? `${others} other${others === 1 ? '' : 's'} breathing with you now` : `${live?.todayCount ?? 0} joined today`}
          </Text>
        </View>

        <Text style={styles.title}>{live?.title ?? 'Daily Mindfulness Routine'}</Text>

        {stage === 'intro' && (
          <>
            <Text style={styles.subtitle}>
              A {live?.minutes ?? 5}-minute guided breathing session to reset before your routine. Follow the circle: breathe in as it grows, hold, and breathe out as it shrinks.
            </Text>
            <View style={[styles.circleOuter]}>
              <View style={[styles.circle, { transform: [{ scale: 0.6 }] }]}>
                <Ionicons name="leaf" size={40} color={colors.white} />
              </View>
            </View>
            {live?.completedToday && <Text style={styles.doneNote}>You’ve already completed today’s session ✓</Text>}
            <TouchableOpacity style={styles.primaryBtn} onPress={start} disabled={busy} accessibilityRole="button"
              accessibilityLabel={live?.liveCount ? 'Join live session' : 'Start session'}>
              {busy ? <ActivityIndicator color={colors.white} /> : (
                <Text style={styles.primaryBtnText}>{live?.liveCount ? 'Join Live Session' : 'Start Session'}</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {stage === 'running' && (
          <>
            <Text style={styles.timer}>{mmss(Math.max(0, session.total - elapsed))}</Text>
            <View style={styles.circleOuter}>
              <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
                <Text style={styles.phase}>{paused ? 'Paused' : phase.label}</Text>
                {!paused && <Text style={styles.phaseCount}>{phase.left}</Text>}
              </Animated.View>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setPaused((p) => !p)} accessibilityRole="button" accessibilityLabel={paused ? 'Resume' : 'Pause'}>
                <Ionicons name={paused ? 'play' : 'pause'} size={17} color={colors.primary} />
                <Text style={styles.secondaryBtnText}>{paused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={endEarly} accessibilityRole="button" accessibilityLabel="End session">
                <Ionicons name="stop" size={16} color={colors.primary} />
                <Text style={styles.secondaryBtnText}>End</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {stage === 'done' && (
          <>
            <View style={styles.circleOuter}>
              <View style={styles.circle}>
                <Ionicons name="checkmark" size={54} color={colors.white} />
              </View>
            </View>
            <Text style={styles.doneTitle}>Session complete</Text>
            <Text style={styles.subtitle}>{pointsAwarded > 0 ? `+${pointsAwarded} points earned. ` : ''}Nice work taking a moment for yourself.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation?.navigate('CreatePost', { mode: 'post' })}
              accessibilityRole="button" accessibilityLabel="Share to Socials">
              <Text style={styles.primaryBtnText}>Share to Socials</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryBtn, { alignSelf: 'center', marginTop: 10 }]} onPress={() => navigation?.goBack()}
              accessibilityRole="button" accessibilityLabel="Done">
              <Text style={styles.secondaryBtnText}>Done</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textPlaceholder },
  liveDotOn: { backgroundColor: '#FF3B30' },
  livePillText: { fontSize: 12, fontWeight: '700', color: colors.textMid },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark, marginTop: 14, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  circleOuter: { width: 240, height: 240, borderRadius: 120, backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center', marginVertical: 26 },
  circle: { width: 220, height: 220, borderRadius: 110, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  phase: { color: colors.white, fontSize: 20, fontWeight: '800' },
  phaseCount: { color: 'rgba(255,255,255,0.85)', fontSize: 30, fontWeight: '800', marginTop: 4 },
  timer: { fontSize: 34, fontWeight: '800', color: colors.primary, marginTop: 14 },
  row: { flexDirection: 'row', gap: 12 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 34, paddingVertical: 14, minWidth: 220, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 100, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 22, paddingVertical: 11 },
  secondaryBtnText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: colors.textDark },
  doneNote: { fontSize: 13, color: '#1EA868', fontWeight: '700', marginBottom: 12 },
});
