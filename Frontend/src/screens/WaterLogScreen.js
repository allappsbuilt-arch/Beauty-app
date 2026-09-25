import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { loadErrorMessage } from '../components/points/pointsUtils';

const GREEN = '#1EA868';

// Daily water log: tap to add a glass (saved to the backend right away);
// reaching the goal awards the Log Water points once per day.
export default function WaterLogScreen({ navigation }) {
  const request = useAuthedRequest();
  const [water, setWater] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [justEarned, setJustEarned] = useState(0);
  const pending = useRef(false);

  const load = useCallback(async () => {
    setError(null);
    try { setWater(await request('/api/points/water')); } catch (err) { setError(loadErrorMessage(err)); }
  }, [request]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const change = async (delta) => {
    if (pending.current || !water) return;
    if (delta > 0 && water.glasses >= water.max) return;
    if (delta < 0 && water.glasses === 0) return;
    pending.current = true;
    setSaving(true);
    setError(null);
    const before = water;
    setWater({ ...water, glasses: water.glasses + delta }); // optimistic
    try {
      const res = await request('/api/points/water', { method: 'POST', body: { delta } });
      setWater(res);
      if (res.pointsAwarded) setJustEarned(res.pointsAwarded);
    } catch (err) {
      setWater(before);
      setError(loadErrorMessage(err));
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  if (!water) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <ScreenHeader title="Log Water" onBack={() => navigation?.goBack()} />
        <View style={styles.center}>
          {error ? (
            <>
              <Ionicons name="cloud-offline-outline" size={36} color={colors.textPlaceholder} />
              <Text style={styles.centerText}>{error}</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={load} accessibilityRole="button" accessibilityLabel="Retry">
                <Text style={styles.primaryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </>
          ) : <ActivityIndicator size="large" color={GREEN} />}
        </View>
      </SafeAreaView>
    );
  }

  const slots = Math.max(water.goal, Math.min(water.max, water.glasses + (water.glasses >= water.goal ? 1 : 0)));
  const progress = Math.min(1, water.glasses / water.goal);
  const left = Math.max(0, water.goal - water.glasses);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title="Log Water" onBack={() => navigation?.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        <View style={styles.hero}>
          <Text style={styles.count}>{water.glasses}<Text style={styles.countGoal}> / {water.goal}</Text></Text>
          <Text style={styles.countLabel}>glasses today</Text>
          <View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View>
          <Text style={styles.hint}>
            {water.rewarded
              ? 'Daily goal reached — nice work staying hydrated!'
              : `${left} more glass${left === 1 ? '' : 'es'} to earn +${water.points} points`}
          </Text>
        </View>

        {justEarned > 0 && (
          <View style={styles.earned} accessibilityLiveRegion="polite">
            <Ionicons name="trophy" size={18} color={GREEN} />
            <Text style={styles.earnedText}>+{justEarned} points earned for today’s water goal!</Text>
          </View>
        )}

        <View style={styles.grid}>
          {Array.from({ length: slots }).map((_, i) => {
            const filled = i < water.glasses;
            const isNext = i === water.glasses;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.glass, filled && styles.glassFilled]}
                onPress={() => (isNext ? change(1) : filled && i === water.glasses - 1 ? change(-1) : null)}
                disabled={!(isNext || (filled && i === water.glasses - 1)) || saving}
                accessibilityRole="button"
                accessibilityLabel={filled ? `Glass ${i + 1}, logged` : `Glass ${i + 1}`}
              >
                <Ionicons name={filled ? 'water' : 'water-outline'} size={26} color={filled ? GREEN : colors.textPlaceholder} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.secondaryBtn, (water.glasses === 0 || saving) && styles.disabled]} onPress={() => change(-1)}
            disabled={water.glasses === 0 || saving} accessibilityRole="button" accessibilityLabel="Remove a glass">
            <Ionicons name="remove" size={20} color={GREEN} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, styles.addBtn, (water.glasses >= water.max || saving) && styles.disabled]} onPress={() => change(1)}
            disabled={water.glasses >= water.max || saving} accessibilityRole="button" accessibilityLabel="Add a glass of water">
            {saving ? <ActivityIndicator color={colors.white} /> : (
              <>
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.primaryBtnText}>Add a Glass</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        {water.glasses >= water.max && <Text style={styles.maxNote}>That’s the most you can log for today.</Text>}

        <TouchableOpacity style={styles.link} onPress={() => navigation?.navigate('PointsStatement')} accessibilityRole="button" accessibilityLabel="View points history">
          <Text style={styles.linkText}>View points history</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  centerText: { fontSize: 14, color: colors.textLight, textAlign: 'center', lineHeight: 20 },
  hero: { backgroundColor: colors.white, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  count: { fontSize: 48, fontWeight: '800', color: GREEN, letterSpacing: -1 },
  countGoal: { fontSize: 22, color: colors.textLight },
  countLabel: { fontSize: 13, fontWeight: '700', color: colors.textLight, marginTop: -4 },
  track: { alignSelf: 'stretch', height: 10, borderRadius: 5, backgroundColor: '#E7F7EE', marginTop: 16, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: GREEN },
  hint: { fontSize: 13, color: colors.textMid, marginTop: 10, textAlign: 'center' },
  earned: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E7F7EE', borderRadius: 14, padding: 12, marginTop: 14 },
  earnedText: { flex: 1, color: GREEN, fontWeight: '800', fontSize: 13.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 20 },
  glass: { width: 64, height: 72, borderRadius: 16, borderWidth: 1.5, borderColor: colors.borderLight, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  glassFilled: { backgroundColor: '#E7F7EE', borderColor: '#A8E8C4' },
  row: { flexDirection: 'row', gap: 12, marginTop: 24 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: GREEN, borderRadius: 100, paddingHorizontal: 22, paddingVertical: 14 },
  addBtn: { flex: 1 },
  primaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  secondaryBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#A8E8C4', backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  disabled: { opacity: 0.45 },
  maxNote: { textAlign: 'center', color: colors.textLight, fontSize: 12.5, marginTop: 10 },
  link: { alignItems: 'center', marginTop: 20, padding: 8 },
  linkText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
});
