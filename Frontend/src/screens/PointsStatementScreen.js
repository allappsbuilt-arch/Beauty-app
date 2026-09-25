import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, SectionList, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { formatPoints, formatPointsDate, loadErrorMessage } from '../components/points/pointsUtils';

const PAGE = 30;

const monthKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const monthTitle = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// Full points statement: every transaction, grouped by month with totals.
export default function PointsStatementScreen({ navigation }) {
  const request = useAuthedRequest();
  const [balance, setBalance] = useState(null);
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadFirst = useCallback(async () => {
    setError(null);
    try {
      const [s, h] = await Promise.all([request('/api/points/summary'), request(`/api/points/history?limit=${PAGE}`)]);
      setBalance(s.balance);
      setItems(h.history);
      setCursor(h.nextCursor);
    } catch (err) {
      setError(loadErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { loadFirst(); }, [loadFirst]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const h = await request(`/api/points/history?limit=${PAGE}&before=${encodeURIComponent(cursor)}`);
      setItems((list) => [...list, ...h.history.filter((x) => !list.some((y) => y.id === x.id))]);
      setCursor(h.nextCursor);
    } catch (err) {
      setError(loadErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const sections = useMemo(() => {
    const groups = new Map();
    for (const it of items) {
      const k = monthKey(it.createdAt);
      if (!groups.has(k)) groups.set(k, { key: k, title: monthTitle(it.createdAt), total: 0, data: [] });
      const g = groups.get(k);
      g.data.push(it);
      g.total += it.points;
    }
    return [...groups.values()];
  }, [items]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title="Points Statement" onBack={() => navigation?.goBack()} />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={styles.content}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadFirst(); setRefreshing(false); }} tintColor={colors.primary} />}
          ListHeaderComponent={
            <>
              <ErrorBanner message={error} onRetry={items.length ? loadMore : loadFirst} onDismiss={() => setError(null)} />
              {balance !== null && (
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
                  <Text style={styles.balanceValue}>{balance.toLocaleString()} <Text style={styles.balanceUnit}>pts</Text></Text>
                </View>
              )}
            </>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionTotal}>{formatPoints(section.total)}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <View style={[styles.row, index === 0 && styles.rowFirst, index === section.data.length - 1 && styles.rowLast]}>
              <View style={styles.rowIcon}><Ionicons name="star" size={14} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowDate}>{formatPointsDate(item.createdAt)}</Text>
              </View>
              <Text style={[styles.rowPoints, item.points < 0 && { color: '#D03050' }]}>{formatPoints(item.points)}</Text>
            </View>
          )}
          ListEmptyComponent={!error ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={34} color={colors.primary} />
              <Text style={styles.emptyTitle}>No points yet</Text>
              <Text style={styles.emptyText}>Complete a routine, scan your face or log water to start earning.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation?.goBack()} accessibilityRole="button" accessibilityLabel="Ways to earn">
                <Text style={styles.emptyBtnText}>Ways to Earn</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
              : cursor ? (
                <TouchableOpacity style={styles.more} onPress={loadMore} accessibilityRole="button" accessibilityLabel="Load older transactions">
                  <Text style={styles.moreText}>Load older transactions</Text>
                </TouchableOpacity>
              ) : items.length ? <Text style={styles.end}>That’s everything — {items.length} transaction{items.length === 1 ? '' : 's'}.</Text> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  balanceCard: { backgroundColor: colors.white, borderRadius: 18, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight, marginBottom: 6 },
  balanceLabel: { fontSize: 11, fontWeight: '800', color: colors.textLight, letterSpacing: 1.3 },
  balanceValue: { fontSize: 34, fontWeight: '800', color: colors.primary, marginTop: 4 },
  balanceUnit: { fontSize: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  sectionTotal: { fontSize: 13, fontWeight: '800', color: '#1EA868' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 12,
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.borderLight, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight,
  },
  rowFirst: { borderTopWidth: 1, borderTopColor: colors.borderLight, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  rowLast: { borderBottomWidth: 1, borderBottomColor: colors.borderLight, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  rowIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  rowDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  rowPoints: { fontSize: 14, fontWeight: '800', color: '#1EA868' },
  empty: { alignItems: 'center', gap: 8, paddingTop: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  emptyText: { fontSize: 13, color: colors.textLight, textAlign: 'center', lineHeight: 19 },
  emptyBtn: { marginTop: 8, backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText: { color: colors.white, fontWeight: '800' },
  more: { alignItems: 'center', padding: 16 },
  moreText: { color: colors.primary, fontWeight: '800' },
  end: { textAlign: 'center', color: colors.textLight, fontSize: 12, marginTop: 16 },
});
