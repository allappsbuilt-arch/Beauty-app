import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { useI18n, formatDate as formatLocalDate, formatTimeOfDay } from '../i18n';
import { zoneName } from '../utils/scanText';

function formatDate(iso) {
  try {
    return formatLocalDate(iso, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

function formatTime(iso) {
  try {
    return formatTimeOfDay(iso, { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function ScanCard({ scan, onPress }) {
  const { t } = useI18n();
  const zones = scan.zones || [];
  const avgScore = zones.length > 0
    ? Math.round(zones.reduce((s, z) => s + (z.score || 0), 0) / zones.length)
    : 0;
  const good = avgScore >= 80;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(scan)}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={t('scanHistory.scanFrom', { date: formatDate(scan.createdAt) })}
    >
      <View style={styles.cardLeft}>
        <View style={styles.scanIconWrap}>
          <Ionicons name="scan-outline" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.cardDate}>{formatDate(scan.createdAt)}</Text>
          <Text style={styles.cardTime}>{formatTime(scan.createdAt)}</Text>
          <View style={styles.zonesRow}>
            {zones.map((z) => (
              <View key={z.key} style={styles.zoneTag}>
                <Text style={styles.zoneTagText}>{zoneName(z)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={[styles.scorePill, { backgroundColor: good ? '#E6F9F0' : '#FFF0E6', borderColor: good ? '#A8E8C0' : '#F5C4A0' }]}>
        <Text style={[styles.scoreText, { color: good ? '#1EA868' : '#D06030' }]}>{avgScore}</Text>
        <Text style={[styles.scoreLabel, { color: good ? '#1EA868' : '#D06030' }]}>{t('scanHistory.avg')}</Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onScan }) {
  const { t } = useI18n();
  return (
    <View style={styles.emptyBody}>
      <View style={styles.illustration}>
        <View style={styles.corner} />
        <Ionicons name="scan-outline" size={40} color={colors.primary} style={styles.scanIcon} />
      </View>
      <Text style={styles.emptyTitle}>{t('scanHistory.emptyTitle')}</Text>
      <Text style={styles.emptyDesc}>
        {t('scanHistory.emptyDesc')}
      </Text>
      <TouchableOpacity
        style={styles.cta}
        activeOpacity={0.85}
        onPress={onScan}
        accessibilityRole="button"
        accessibilityLabel={t('scanHistory.startA11y')}
      >
        <Text style={styles.ctaText}>{t('scanHistory.start')}</Text>
      </TouchableOpacity>
      <Text style={styles.ctaHint}>{t('scanHistory.hint')}</Text>
    </View>
  );
}

export default function ScanHistoryScreen({ navigation }) {
  const request = useAuthedRequest();
  const { t } = useI18n();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      request('/api/scans')
        .then(({ scans: data }) => {
          if (!cancelled) setScans(data || []);
        })
        .catch(() => { if (!cancelled) setScans([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [request])
  );

  const openScan = (scan) => {
    navigation?.navigate('ScanResults', { zones: scan.zones, ancillary: scan.ancillary });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader
        title={t('scanHistory.title')}
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : scans.length === 0 ? (
        <EmptyState onScan={() => navigation?.navigate('ScanFace')} />
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ScanCard scan={item} onPress={openScan} />}
          ListHeaderComponent={
            <Text style={styles.listHeader}>{t('scanHistory.count', { count: scans.length })}</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  listHeader: {
    fontSize: 12, fontWeight: '700', color: colors.textFaint,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },

  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  scanIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.accentDark,
  },
  cardDate: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  cardTime: { fontSize: 12, color: colors.textLight, fontWeight: '500', marginTop: 2 },
  zonesRow: { flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  zoneTag: {
    backgroundColor: colors.sectionBg, borderRadius: 100,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  zoneTagText: { fontSize: 10, fontWeight: '600', color: colors.textMid },

  scorePill: {
    alignItems: 'center', justifyContent: 'center',
    width: 52, height: 52, borderRadius: 14, borderWidth: 1,
  },
  scoreText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  scoreLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },

  emptyBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  illustration: {
    width: 180, height: 180, borderRadius: 24, marginBottom: 28,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  corner: {
    position: 'absolute', top: 24, left: 24, right: 24, bottom: 24,
    borderWidth: 2, borderColor: colors.primaryPaleDeep, borderRadius: 16,
  },
  scanIcon: { opacity: 0.85 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: colors.textMid, textAlign: 'center', lineHeight: 21, marginBottom: 26 },
  cta: {
    alignSelf: 'stretch', backgroundColor: colors.primary, borderRadius: 100,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  ctaText: { color: colors.white, fontSize: 15.5, fontWeight: '800' },
  ctaHint: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.8, marginTop: 12 },
});
