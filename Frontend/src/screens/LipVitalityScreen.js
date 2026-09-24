import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ErrorBanner from '../components/ErrorBanner';
import { useTracker } from '../api/useTracker';

const GOALS = ['Hydrate', 'Plump', 'Even Tone', 'Heal'];

// Display details for each checklist item; done state comes from the backend.
const ROUTINE_META = {
  exfoliate: { icon: 'brush-outline', meta: 'Sugar Scrub • 2 min' },
  balm: { icon: 'water-outline', meta: 'Ceramide Shield' },
  mask: { icon: 'moon-outline', meta: 'Hyaluronic Seal' },
};

const PRODUCTS = [
  { key: 'laneige', name: 'Laneige Sleeping Mask', meta: 'USE AM/PM', metaColor: colors.primary,
    uri: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&q=60' },
  { key: 'burts', name: "Burt's Bees Scrub", meta: '3X WEEKLY', metaColor: '#1EA868',
    uri: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&q=60' },
];

function GoalChip({ label }) {
  return (
    <View style={goal.chip}>
      <Text style={goal.chipText}>{label}</Text>
    </View>
  );
}
const goal = StyleSheet.create({
  chip: {
    backgroundColor: colors.primaryPale, borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1, borderColor: colors.accentDark,
  },
  chipText: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
});

function RoutineRow({ item, isLast, onToggle }) {
  const meta = ROUTINE_META[item.key] || {};
  return (
    <TouchableOpacity
      style={[routine.row, !isLast && routine.rowBorder]}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.doneToday }}
      accessibilityLabel={item.label}
    >
      <View style={routine.iconWrap}>
        <Ionicons name={meta.icon || 'ellipse-outline'} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={routine.name}>{item.label}</Text>
        <Text style={routine.meta}>{meta.meta}{item.streak > 0 ? ` · 🔥 ${item.streak}` : ''}</Text>
      </View>
      <Ionicons
        name={item.doneToday ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={item.doneToday ? '#1EA868' : colors.borderLight}
      />
    </TouchableOpacity>
  );
}
const routine = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  iconWrap: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  meta: { fontSize: 11.5, color: colors.textLight, marginTop: 2 },
});

export default function LipVitalityScreen({ navigation }) {
  const [selectedGoals] = useState(GOALS);
  const { tracker, error, reload, toggle } = useTracker('lips');
  const score = tracker?.score;
  const routineItems = tracker?.items ?? [];
  // Score history from scans, followed by a "new scan" tile.
  const progress = [
    ...(tracker?.history ?? []).slice(-4).map((h) => ({
      key: h.id,
      label: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase(),
      score: h.score,
    })),
    { key: 'new', label: 'NEW SCAN', add: true },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MyFace AI</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.popToTop()}
          accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} onRetry={reload} />
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.eyebrow}>ANALYSIS</Text>
            <Text style={styles.heading}>Lip Vitality</Text>
          </View>
          <View style={styles.pigmentPill}>
            <Text style={styles.pigmentPillText}>
              {tracker?.change == null ? (score == null ? 'Not scanned yet' : 'First scan') : `${tracker.change >= 0 ? '+' : ''}${tracker.change} since last scan`}
            </Text>
          </View>
        </View>

        {/* Metric cards */}
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Hydration</Text>
            <Text style={styles.metricValue}>{score == null ? '—' : `${score}%`}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${score ?? 0}%` }]} />
            </View>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Surface Health</Text>
            <View style={styles.healthRow}>
              <Ionicons name="checkmark-circle" size={15} color="#1EA868" />
              <Text style={styles.healthValue}>{tracker?.metrics?.hydration ?? '—'}</Text>
            </View>
            <Text style={styles.healthMeta}>{score == null ? 'Take a scan to measure' : 'From your latest scan'}</Text>
          </View>
        </View>

        {/* Goals */}
        <Text style={styles.sectionTitle}>Current Goals</Text>
        <FlatList
          data={selectedGoals}
          keyExtractor={(g) => g}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 20 }}
          renderItem={({ item }) => <GoalChip label={item} />}
        />

        {/* Weekly progress */}
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('ScanHistory')} accessibilityRole="button" accessibilityLabel="View history">
            <Text style={styles.viewHistory}>View History</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={progress}
          keyExtractor={(p) => p.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 22 }}
          renderItem={({ item }) => (
            item.add ? (
              <TouchableOpacity
                style={styles.addPhoto}
                onPress={() => navigation?.navigate('ScanFace')}
                accessibilityRole="button"
                accessibilityLabel="Take a new scan"
              >
                <Ionicons name="camera-outline" size={18} color={colors.primary} />
                <Text style={styles.addPhotoText}>{item.label}</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addPhoto, styles.scoreTile]}>
                <Text style={styles.scoreTileValue}>{item.score}</Text>
                <Text style={styles.addPhotoText}>{item.label}</Text>
              </View>
            )
          )}
        />

        {/* Evening routine */}
        <Text style={styles.sectionTitle}>Evening Routine</Text>
        <View style={styles.routineCard}>
          {routineItems.map((r, i) => (
            <RoutineRow key={r.key} item={r} isLast={i === routineItems.length - 1} onToggle={() => toggle(r.key)} />
          ))}
        </View>

        {/* Active products */}
        <Text style={styles.sectionTitle}>Active Products</Text>
        <View style={styles.productRow}>
          {PRODUCTS.map(p => (
            <View key={p.key} style={styles.productCard}>
              <Image source={{ uri: p.uri }} style={styles.productImage} resizeMode="cover" />
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={[styles.productMeta, { color: p.metaColor }]}>{p.meta}</Text>
            </View>
          ))}
        </View>

        {/* Ingredient spotlight */}
        <View style={styles.spotlightCard}>
          <Ionicons name="flask-outline" size={18} color={colors.white} style={{ marginBottom: 8 }} />
          <Text style={styles.spotlightTitle}>Ingredient Spotlight</Text>
          <Text style={styles.spotlightText}>
            Your lips lack oil glands. Look for <Text style={{ fontWeight: '800' }}>Peptides</Text> and{' '}
            <Text style={{ fontWeight: '800' }}>Squalane</Text> to rebuild the moisture barrier.
          </Text>
          <TouchableOpacity
            style={styles.spotlightBtn}
            onPress={() => navigation?.navigate('IngredientGuide')}
            accessibilityRole="button"
            accessibilityLabel="Learn more about ceramides"
          >
            <Text style={styles.spotlightBtnText}>Learn more about Ceramides</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scoreTile: { borderStyle: 'solid', backgroundColor: colors.white },
  scoreTileValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingTop: 12, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  headingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginHorizontal: 16, marginBottom: 16,
  },
  eyebrow: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 1.2, marginBottom: 4 },
  heading: { fontSize: 24, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4 },
  pigmentPill: {
    backgroundColor: '#F1ECFB', borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#D4C6F5',
  },
  pigmentPillText: { fontSize: 11.5, fontWeight: '700', color: '#7A5CD0' },

  metricRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 20 },
  metricCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  metricLabel: { fontSize: 11.5, fontWeight: '700', color: colors.textLight, marginBottom: 6 },
  metricValue: { fontSize: 22, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  barTrack: { height: 5, borderRadius: 3, backgroundColor: colors.sectionBg, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3, backgroundColor: colors.primary },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  healthValue: { fontSize: 16, fontWeight: '800', color: '#1EA868' },
  healthMeta: { fontSize: 11.5, color: colors.textLight },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginHorizontal: 16, marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 0 },
  viewHistory: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 12 },

  photoCol: { alignItems: 'center', gap: 6 },
  photo: { width: 76, height: 76, borderRadius: 12, backgroundColor: colors.sectionBg },
  photoBadge: { fontSize: 10, fontWeight: '700', color: colors.textFaint },
  addPhoto: {
    width: 76, height: 76, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.accentDark, borderStyle: 'dashed',
    backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  addPhotoText: { fontSize: 9, fontWeight: '800', color: colors.primary },

  routineCard: {
    backgroundColor: colors.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  productRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 20 },
  productCard: { flex: 1, backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight },
  productImage: { width: '100%', height: 90, backgroundColor: colors.sectionBg },
  productName: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginHorizontal: 10, marginTop: 8 },
  productMeta: { fontSize: 10.5, fontWeight: '800', marginHorizontal: 10, marginTop: 2, marginBottom: 10, letterSpacing: 0.4 },

  spotlightCard: {
    backgroundColor: colors.primary, borderRadius: 18,
    marginHorizontal: 16, padding: 18,
    shadowColor: colors.primary, shadowOpacity: 0.28,
    shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  spotlightTitle: { fontSize: 17, fontWeight: '800', color: colors.white, marginBottom: 8 },
  spotlightText: { fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.9)', marginBottom: 14 },
  spotlightBtn: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 100, paddingHorizontal: 14, paddingVertical: 9,
  },
  spotlightBtnText: { fontSize: 12.5, fontWeight: '700', color: colors.white },
});
