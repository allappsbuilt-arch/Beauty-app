import React from 'react';
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
import { comingSoon } from '../utils/feedback';
import { useTracker, timeAgo } from '../api/useTracker';

// Tile styling per metric; values come from the latest scan.
const METRICS = [
  { key: 'dryness',  label: 'DRYNESS',   color: '#1EA868', bg: '#E6F9F0' },
  { key: 'oiliness', label: 'OILINESS',  color: colors.primary, bg: colors.primaryPale },
  { key: 'flakiness',label: 'FLAKINESS', color: '#7A5CD0', bg: '#F1ECFB' },
  { key: 'density',  label: 'DENSITY',   color: '#1EA868', bg: '#E6F9F0' },
];

function RingScore({ score }) {
  const SIZE = 56, RING = 6;
  const deg = Math.round(((score ?? 0) / 100) * 360);
  const inner = SIZE - RING * 2;
  return (
    <View style={{ width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: RING, borderColor: colors.roseDark }} />
      <View style={{
        position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: RING,
        borderTopColor: colors.primary,
        borderRightColor: deg > 90 ? colors.primary : colors.roseDark,
        borderBottomColor: deg > 180 ? colors.primary : colors.roseDark,
        borderLeftColor: deg > 270 ? colors.primary : colors.roseDark,
        transform: [{ rotate: '-45deg' }],
      }} />
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textDark }}>{score ?? '—'}</Text>
      </View>
    </View>
  );
}

function MetricTile({ item }) {
  return (
    <View style={tile.card}>
      <Text style={tile.label}>{item.label}</Text>
      <View style={[tile.pill, { backgroundColor: item.bg }]}>
        <Text style={[tile.pillText, { color: item.color }]}>{item.value}</Text>
      </View>
    </View>
  );
}
const tile = StyleSheet.create({
  card: {
    flex: 1, margin: 6, backgroundColor: colors.white, borderRadius: 14,
    padding: 14, gap: 10,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  label: { fontSize: 11, fontWeight: '700', color: colors.textLight, letterSpacing: 0.8 },
  pill: { alignSelf: 'flex-start', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 12, fontWeight: '800' },
});

function WashDay({ item, onPress }) {
  const isCurrent = item.state === 'current';
  const isWash = item.state === 'wash';
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={wash.col}
      {...(onPress && {
        onPress,
        accessibilityRole: 'checkbox',
        accessibilityState: { checked: isWash },
        accessibilityLabel: `Log hair wash today${isWash ? ', logged' : ''}`,
      })}
    >
      <Text style={wash.dayLabel}>{item.label}</Text>
      <View style={[wash.circle, isCurrent && wash.circleCurrent, isWash && wash.circleWash]}>
        {isWash
          ? <Ionicons name="water" size={14} color={colors.primary} />
          : item.num
            ? <Text style={[wash.num, isCurrent && wash.numCurrent]}>{item.num}</Text>
            : <Ionicons name="calendar-outline" size={14} color={colors.textPlaceholder} />
        }
      </View>
    </Wrapper>
  );
}
const wash = StyleSheet.create({
  col: { alignItems: 'center', gap: 8, flex: 1 },
  dayLabel: { fontSize: 11, fontWeight: '600', color: colors.textFaint },
  circle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.sectionBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderLight,
  },
  circleCurrent: { backgroundColor: colors.primary, borderColor: colors.primary },
  circleWash: { backgroundColor: colors.primaryPale, borderColor: colors.accentDark },
  num: { fontSize: 12, fontWeight: '700', color: colors.textMid },
  numCurrent: { color: colors.white },
});

function LogRow({ icon, item, meta, bordered, onToggle }) {
  const done = !!item?.doneToday;
  return (
    <TouchableOpacity
      style={[styles.logRow, bordered && styles.logRowBorder]}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={item?.label}
    >
      <View style={styles.logIconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.logName}>{item?.label ?? '…'}</Text>
        <Text style={styles.logMeta}>
          {done ? 'Done today' : meta}{item?.streak > 0 ? ` · 🔥 ${item.streak}-day streak` : ''}
        </Text>
      </View>
      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={done ? '#1EA868' : colors.borderLight} />
    </TouchableOpacity>
  );
}

export default function ScalpTrackerScreen({ navigation }) {
  const { tracker, error, reload, toggle, item } = useTracker('scalp');
  const updated = timeAgo(tracker?.lastScanAt);
  const lastIndex = (tracker?.week.length ?? 0) - 1;
  const washDays = (tracker?.week ?? []).map((d, i) => {
    const date = new Date(`${d.date}T00:00:00`);
    const washed = d.doneKeys.includes('wash');
    return {
      key: d.date,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      num: date.getDate(),
      state: washed ? 'wash' : i === lastIndex ? 'current' : 'empty',
      isToday: i === lastIndex,
    };
  });

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
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} onRetry={reload} />

        {/* Score card */}
        <View style={styles.scoreCard}>
          <View>
            <Text style={styles.scoreTitle}>Scalp Health Score</Text>
            <Text style={styles.scoreSubtitle}>{updated ? `Last updated ${updated}` : 'Take a face scan to measure'}</Text>
          </View>
          <RingScore score={tracker?.score ?? null} />
        </View>

        {/* Metrics grid */}
        <FlatList
          data={METRICS}
          keyExtractor={(m) => m.key}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item: m }) => (
            <MetricTile item={{ ...m, value: String(tracker?.metrics?.[m.key] ?? '—').toUpperCase() }} />
          )}
        />

        {/* Wash day cycle */}
        <Text style={styles.sectionTitle}>Wash Day Cycle</Text>
        <View style={styles.washCard}>
          {washDays.map((d) => (
            <WashDay key={d.key} item={d} onPress={d.isToday ? () => toggle('wash') : undefined} />
          ))}
        </View>

        {/* Hairline progress */}
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Scalp Score History</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('ScanHistory')} accessibilityRole="button" accessibilityLabel="View all photos">
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={tracker?.history ?? []}
          keyExtractor={(p) => p.id}
          ListEmptyComponent={<Text style={styles.logMeta}>No scans yet.</Text>}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 22 }}
          renderItem={({ item: h, index }) => {
            const active = index === (tracker?.history.length ?? 0) - 1;
            return (
              <View style={[styles.hairPhoto, styles.historyTile, active && styles.hairPhotoActive]}>
                <Text style={styles.historyScore}>{h.score}</Text>
                <View style={[styles.hairBadge, active && styles.hairBadgeActive]}>
                  <Text style={[styles.hairBadgeText, active && styles.hairBadgeTextActive]}>
                    {active ? 'LATEST' : new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Daily log */}
        <Text style={styles.sectionTitle}>Daily Log</Text>
        <View style={styles.logCard}>
          <LogRow icon="medkit-outline" item={item('serum')} meta="Tap when applied" onToggle={() => toggle('serum')} />
          <LogRow icon="hand-left-outline" item={item('massage')} meta="5 minutes · tap when done" bordered onToggle={() => toggle('massage')} />
        </View>

        {/* Special treatment promo */}
        <TouchableOpacity style={styles.treatmentCard} activeOpacity={0.9} onPress={() => comingSoon('Deep conditioning treatment')} accessibilityRole="button" accessibilityLabel="Deep conditioning treatment">
          <Text style={styles.treatmentLabel}>SPECIAL TREATMENT</Text>
          <Text style={styles.treatmentTitle}>Deep Conditioning</Text>
          <Text style={styles.treatmentDesc}>
            Unlock better hydration levels by leaving your mask on for 20 minutes today.
          </Text>
          <View style={styles.treatmentBtn}>
            <Text style={styles.treatmentBtnText}>Get Started</Text>
          </View>
        </TouchableOpacity>

        {/* Community */}
        <View style={styles.communityCard}>
          <View style={styles.avatarStack}>
            <View style={[styles.miniAvatar, { backgroundColor: '#8B4A3A', zIndex: 3 }]}><Text style={styles.miniAvatarText}>JD</Text></View>
            <View style={[styles.miniAvatar, { backgroundColor: '#C0405A', marginLeft: -10, zIndex: 2 }]}><Text style={styles.miniAvatarText}>AS</Text></View>
            <View style={[styles.miniAvatar, { backgroundColor: '#1EA868', marginLeft: -10, zIndex: 1 }]}><Text style={styles.miniAvatarText}>MK</Text></View>
          </View>
          <Text style={styles.communityText}>1.2k people posted today</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Communities')} accessibilityRole="button" accessibilityLabel="Join group">
            <Text style={styles.joinText}>Join Group ›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  historyTile: { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white },
  historyScore: { fontSize: 22, fontWeight: '800', color: colors.primary },
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

  scoreCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 18,
    marginHorizontal: 16, marginBottom: 16, padding: 18,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  scoreTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  scoreSubtitle: { fontSize: 11.5, color: colors.textLight, marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginHorizontal: 16, marginTop: 20, marginBottom: 12 },

  washCard: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16,
    marginHorizontal: 16, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16 },
  viewAll: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 0.4, marginTop: 20, marginBottom: 12 },

  hairPhoto: { width: 100, height: 100, borderRadius: 14, backgroundColor: colors.sectionBg },
  hairPhotoActive: { borderWidth: 2, borderColor: colors.primary },
  hairBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
  },
  hairBadgeActive: { backgroundColor: colors.primary },
  hairBadgeText: { fontSize: 9, fontWeight: '800', color: colors.white },
  hairBadgeTextActive: { color: colors.white },

  logCard: {
    backgroundColor: colors.white, borderRadius: 16,
    marginHorizontal: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  logRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderUltraLight },
  logIconWrap: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center' },
  logName: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  logMeta: { fontSize: 11.5, color: colors.textLight, marginTop: 2 },
  startBtn: { borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: colors.primary },
  startBtnText: { fontSize: 11, fontWeight: '800', color: colors.primary },

  treatmentCard: {
    backgroundColor: '#2A1030', borderRadius: 18,
    marginHorizontal: 16, marginTop: 20, padding: 20,
  },
  treatmentLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.2, marginBottom: 8 },
  treatmentTitle: { fontSize: 20, fontWeight: '800', color: colors.white, marginBottom: 8 },
  treatmentDesc: { fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  treatmentBtn: { alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 18, paddingVertical: 10 },
  treatmentBtnText: { fontSize: 13, fontWeight: '800', color: colors.white },

  communityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.white, borderRadius: 100,
    marginHorizontal: 16, marginTop: 14, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  avatarStack: { flexDirection: 'row' },
  miniAvatar: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.white },
  miniAvatarText: { fontSize: 9, fontWeight: '800', color: colors.white },
  communityText: { flex: 1, fontSize: 12.5, color: colors.textMid, fontWeight: '600' },
  joinText: { fontSize: 12.5, fontWeight: '800', color: colors.primary },
});
