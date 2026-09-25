import React from 'react';
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
import ErrorBanner from '../components/ErrorBanner';
import { useTracker } from '../api/useTracker';


// ─── Score ring ────────────────────────────────────────────────────────────
function ScoreRing({ percent, label, tint }) {
  const SIZE = 110, RING = 8;
  const deg = Math.round(((percent ?? 0) / 100) * 360);
  const inner = SIZE - RING * 2;
  return (
    <View style={ringS.card}>
      <View style={{ width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: RING, borderColor: colors.roseDark }} />
        <View style={{
          position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: RING,
          borderTopColor: tint,
          borderRightColor: deg > 90 ? tint : colors.roseDark,
          borderBottomColor: deg > 180 ? tint : colors.roseDark,
          borderLeftColor: deg > 270 ? tint : colors.roseDark,
          transform: [{ rotate: '-45deg' }],
        }} />
        <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[ringS.pct, { color: tint }]}>{percent ?? '—'}</Text>
        </View>
      </View>
      <Text style={ringS.label}>{label}</Text>
    </View>
  );
}
const ringS = StyleSheet.create({
  card: {
    flex: 1, alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 18,
    paddingVertical: 18,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  pct: { fontSize: 26, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMid },
});

// ─── Aftercare checklist item ───────────────────────────────────────────────
function ChecklistItem({ item, isLast, onToggle }) {
  const checked = item.doneToday;
  return (
    <TouchableOpacity
      style={[checklist.row, !isLast && checklist.rowBorder]}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={item.label}
    >
      <View style={[checklist.check, checked && checklist.checkActive]}>
        {checked && <Ionicons name="checkmark" size={13} color={colors.white} />}
      </View>
      <Text style={[checklist.text, checked && checklist.textChecked, { flex: 1 }]}>{item.label}</Text>
      {item.streak > 0 && <Text style={checklist.streak}>🔥 {item.streak}</Text>}
    </TouchableOpacity>
  );
}
const checklist = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  check: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, color: colors.textMid, fontWeight: '500' },
  textChecked: { color: colors.textDark, fontWeight: '600' },
  streak: { fontSize: 12, fontWeight: '700', color: colors.primary },
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function EyelashTrackerScreen({ navigation }) {
  const { tracker, error, reload, toggle } = useTracker('eyelash');
  const items = tracker?.items ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>Eyelash Tracker</Text>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.popToTop()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ErrorBanner message={error} onRetry={reload} />
        {tracker && tracker.metrics == null && (
          <Text style={styles.noScan}>Take a face scan to measure your lash length and density.</Text>
        )}

        {/* Score rings */}
        <View style={styles.ringRow}>
          <ScoreRing percent={tracker?.metrics?.length} label="Length Score" tint={colors.primary} />
          <ScoreRing percent={tracker?.metrics?.density} label="Density Score" tint="#1EA868" />
        </View>

        {/* Safe removal notice */}
        <View style={styles.alertCard}>
          <View style={styles.alertIconWrap}>
            <Ionicons name="warning" size={18} color="#C47800" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Safe Removal Notice</Text>
            <Text style={styles.alertText}>
              Never pull or pluck extensions at home. Use a steam-oil method or visit a professional to prevent natural follicle damage.
            </Text>
          </View>
        </View>

        {/* Aftercare */}
        <View style={styles.aftercareCard}>
          <View style={styles.aftercareHeader}>
            <Ionicons name="brush-outline" size={17} color={colors.primary} />
            <Text style={styles.aftercareTitle}>Lash Extension Aftercare</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textFaint} />
          </View>
          <View style={styles.aftercareBody}>
            {items.map((item, i) => (
              <ChecklistItem key={item.key} item={item} isLast={i === items.length - 1} onToggle={() => toggle(item.key)} />
            ))}
          </View>
        </View>

        {/* Weekly progress */}
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('ScanHistory')} accessibilityRole="button" accessibilityLabel="View history">
            <Text style={styles.viewHistory}>View History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.photoRow}>
          {(tracker?.history ?? []).slice(-2).map((h) => (
            <View key={h.id} style={[styles.photo, styles.scoreTile]}>
              <Text style={styles.scoreTileValue}>{h.score}</Text>
              <Text style={styles.scoreTileDate}>{new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addPhoto}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add week 3 photo"
            onPress={() => navigation?.navigate('ScanFace')}
          >
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
            <Text style={styles.addPhotoText}>NEW SCAN</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.takePhotoBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Take photo"
          onPress={() => navigation?.navigate('ScanFace')}
        >
          <Ionicons name="camera-outline" size={17} color={colors.white} />
          <Text style={styles.takePhotoBtnText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.styleLashesBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('LashStyler')}
          accessibilityRole="button"
          accessibilityLabel="Try lash styles"
        >
          <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
          <Text style={styles.styleLashesBtnText}>Try Lash Styles</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scoreTile: { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight },
  scoreTileValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  scoreTileDate: { fontSize: 10, fontWeight: '700', color: colors.textFaint, marginTop: 2 },
  noScan: { fontSize: 13, color: colors.textMid, textAlign: 'center', marginHorizontal: 24, marginBottom: 12 },
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { flex: 1 },
  content: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  ringRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },

  alertCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.alertBg, borderRadius: 16,
    padding: 16, marginBottom: 18,
    borderWidth: 1, borderColor: colors.alertBorder,
  },
  alertIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FFF3C0',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F5D878',
  },
  alertTitle: { fontSize: 15, fontWeight: '800', color: colors.alertText, marginBottom: 4 },
  alertText: { fontSize: 12.5, lineHeight: 18, color: colors.alertTextLight },

  aftercareCard: {
    backgroundColor: colors.white, borderRadius: 16,
    marginBottom: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  aftercareHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.primaryPale,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  aftercareTitle: { flex: 1, fontSize: 14.5, fontWeight: '800', color: colors.textDark },
  aftercareBody: { paddingVertical: 4 },

  progressHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  viewHistory: { fontSize: 13, fontWeight: '700', color: colors.primary },

  photoRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  photo: { flex: 1, aspectRatio: 1, borderRadius: 14, backgroundColor: colors.sectionBg },
  addPhoto: {
    flex: 1, aspectRatio: 1, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.accentDark, borderStyle: 'dashed',
    backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  addPhotoText: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },

  takePhotoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 100, paddingVertical: 15,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  takePhotoBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },

  styleLashesBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 100, paddingVertical: 15, marginTop: 12,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  styleLashesBtnText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
});
