import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuthedRequest } from '../api/useAuthedRequest';
import ErrorBanner from '../components/ErrorBanner';
import { ToolNav, ToolHeading, PrimaryButton, Pill, InfoNote, toolStyles } from '../components/ToolKit';

const RANGES = [
  { key: '4w', label: '4 Weeks', days: 28 },
  { key: '3m', label: '3 Months', days: 91 },
  { key: 'all', label: 'All Time', days: null },
];

// One flat list of scored areas per scan: the main zones plus the extras
// (lips, hair, brows...).
function areasOf(scan) {
  const zones = (scan.zones || []).map((z) => ({ key: z.key, label: z.title || z.label, score: z.score }));
  const extra = (scan.ancillary || []).map((a) => ({ key: a.key, label: a.label || a.title, score: a.score }));
  return [...zones, ...extra].filter((a) => typeof a.score === 'number');
}

function avgScore(scan) {
  const areas = areasOf(scan);
  return areas.length ? Math.round(areas.reduce((s, a) => s + a.score, 0) / areas.length) : 0;
}

const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

function Delta({ value }) {
  const color = value > 0 ? '#1EA868' : value < 0 ? '#D03050' : colors.textFaint;
  const icon = value > 0 ? 'trending-up' : value < 0 ? 'trending-down' : 'remove';
  return (
    <View style={styles.delta}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.deltaText, { color }]}>{value > 0 ? `+${value}` : value}</Text>
    </View>
  );
}

export default function TransformationTimelapseScreen({ navigation }) {
  const request = useAuthedRequest();
  const [scans, setScans] = useState(null);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('all');

  const load = useCallback(async () => {
    setError(null);
    try {
      const { scans: list } = await request('/api/scans');
      // Oldest first for a timeline.
      setScans([...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (err) {
      setError(err.message || 'Could not load your scans.');
      setScans((s) => s ?? []);
    }
  }, [request]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const inRange = useMemo(() => {
    if (!scans) return [];
    const days = RANGES.find((r) => r.key === range).days;
    if (!days) return scans;
    const cutoff = Date.now() - days * 86400000;
    return scans.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
  }, [scans, range]);

  const first = inRange[0];
  const latest = inRange[inRange.length - 1];
  const comparison = useMemo(() => {
    if (!first || !latest || first === latest) return [];
    const before = Object.fromEntries(areasOf(first).map((a) => [a.key, a.score]));
    return areasOf(latest)
      .filter((a) => before[a.key] != null)
      .map((a) => ({ ...a, before: before[a.key], delta: a.score - before[a.key] }));
  }, [first, latest]);

  const openScan = (scan) => navigation?.navigate('ScanResults', { zones: scan.zones, ancillary: scan.ancillary });

  return (
    <SafeAreaView style={toolStyles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />
      <ToolNav navigation={navigation} />

      <ScrollView contentContainerStyle={toolStyles.content} showsVerticalScrollIndicator={false}>
        <ToolHeading
          eyebrow="PROGRESS & RECAPS"
          title="Transformation Timelapse"
          subtitle="How your skin scores have changed across your face scans."
        />

        <View style={toolStyles.pillRow}>
          {RANGES.map((r) => (
            <Pill key={r.key} label={r.label} active={range === r.key} onPress={() => setRange(r.key)} />
          ))}
        </View>

        <ErrorBanner message={error} onRetry={load} onDismiss={() => setError(null)} />

        {scans === null ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : inRange.length < 2 ? (
          <View style={[toolStyles.card, styles.empty]}>
            <Ionicons name="images-outline" size={30} color={colors.primary} />
            <Text style={styles.emptyTitle}>
              {inRange.length === 0 ? 'No scans in this period' : 'One more scan to compare'}
            </Text>
            <Text style={styles.emptyText}>
              Your timelapse compares your first and latest face scans. Scan regularly to see your progress.
            </Text>
          </View>
        ) : (
          <>
            <View style={[toolStyles.card, styles.summaryRow]}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>{fmtDate(first.createdAt)}</Text>
                <Text style={styles.summaryValue}>{avgScore(first)}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.textFaint} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>{fmtDate(latest.createdAt)}</Text>
                <Text style={styles.summaryValue}>{avgScore(latest)}</Text>
              </View>
              <Delta value={avgScore(latest) - avgScore(first)} />
            </View>

            <Text style={toolStyles.sectionTitle}>BY AREA</Text>
            <View style={[toolStyles.card, { marginTop: 0, paddingVertical: 4 }]}>
              {comparison.map((a, i) => (
                <View key={a.key} style={[styles.areaRow, i < comparison.length - 1 && styles.divider]}>
                  <Text style={styles.areaLabel}>{a.label}</Text>
                  <Text style={styles.areaScores}>{a.before} → {a.score}</Text>
                  <Delta value={a.delta} />
                </View>
              ))}
            </View>
          </>
        )}

        {inRange.length > 0 && (
          <>
            <Text style={toolStyles.sectionTitle}>TIMELINE · {inRange.length} SCAN{inRange.length === 1 ? '' : 'S'}</Text>
            <View style={[toolStyles.card, { marginTop: 0, paddingVertical: 4 }]}>
              {[...inRange].reverse().map((scan, i) => (
                <TouchableOpacity
                  key={scan.id}
                  style={[styles.areaRow, i < inRange.length - 1 && styles.divider]}
                  onPress={() => openScan(scan)}
                  accessibilityRole="button"
                  accessibilityLabel={`Scan from ${fmtDate(scan.createdAt)}`}
                >
                  <Text style={styles.areaLabel}>{fmtDate(scan.createdAt)}</Text>
                  <Text style={styles.areaScores}>Score {avgScore(scan)}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <PrimaryButton label="Take a New Scan" icon="scan-outline" onPress={() => navigation?.navigate('ScanFace')} />
        <InfoNote>Scores come from your AI face scans; tap any scan to see its full results.</InfoNote>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 8, paddingVertical: 24, marginTop: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  emptyText: { fontSize: 13, color: colors.textLight, textAlign: 'center', lineHeight: 19 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  summaryCol: { alignItems: 'center' },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint },
  summaryValue: { fontSize: 28, fontWeight: '800', color: colors.primary },
  areaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.borderUltraLight },
  areaLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textDark },
  areaScores: { fontSize: 13, fontWeight: '600', color: colors.textMid },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 3, minWidth: 46, justifyContent: 'flex-end' },
  deltaText: { fontSize: 13, fontWeight: '800' },
});
