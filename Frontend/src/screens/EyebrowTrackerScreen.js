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
import ScreenHeader from '../components/ScreenHeader';

const PHOTO_START = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=60&sat=-100';
const PHOTO_LATEST = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=60';

const TIMELINE = [
  { key: 'w1', label: 'W1', state: 'done' },
  { key: 'w2', label: 'W2', state: 'done' },
  { key: 'w4', label: 'W4', state: 'done' },
  { key: 'w6', label: 'W6', state: 'current' },
  { key: 'w8', label: 'W8', state: 'future' },
];

const PRODUCTS = [
  { key: 'revitabrow', icon: 'flask-outline', name: 'RevitaBrow Advanced', usage: 'Used: 42 days straight', streak: 14, progress: 0.85, color: colors.primary },
  { key: 'castor', icon: 'water-outline', name: 'Castor Oil Serum', usage: 'Used: 12 days total', streak: 3, progress: 0.30, color: '#1EA868' },
];

const PHOTO_LOGS = [
  { key: '1', bw: true },
  { key: '2', bw: true },
  { key: '3', bw: true },
  { key: '4', bw: false },
];

// ─── Ring progress ─────────────────────────────────────────────────────────────
function RingProgress({ percent = 78, size = 100 }) {
  const RING = 9;
  const deg = Math.round((percent / 100) * 360);
  const inner = size - RING * 2;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: RING, borderColor: colors.roseDark }} />
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: RING,
        borderTopColor: colors.primary,
        borderRightColor: deg > 90 ? colors.primary : colors.roseDark,
        borderBottomColor: deg > 180 ? colors.primary : colors.roseDark,
        borderLeftColor: deg > 270 ? colors.primary : colors.roseDark,
        transform: [{ rotate: '-45deg' }],
      }} />
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={ring.pct}>{percent}%</Text>
        <Text style={ring.label}>Fullness</Text>
      </View>
    </View>
  );
}
const ring = StyleSheet.create({
  pct: { fontSize: 22, fontWeight: '800', color: colors.textDark },
  label: { fontSize: 11, fontWeight: '600', color: colors.textLight, marginTop: 2 },
});

// ─── Timeline dot ───────────────────────────────────────────────────────────
function TimelineDot({ point, isLast }) {
  const isCurrent = point.state === 'current';
  const isDone = point.state === 'done';
  return (
    <View style={tl.item}>
      <View style={[
        tl.dot,
        isDone && tl.dotDone,
        isCurrent && tl.dotCurrent,
        point.state === 'future' && tl.dotFuture,
      ]}>
        {isCurrent && <View style={tl.dotCore} />}
      </View>
      <Text style={[tl.label, isCurrent && tl.labelCurrent, point.state === 'future' && tl.labelFuture]}>
        {point.label}
      </Text>
      {!isLast && <View style={tl.line} />}
    </View>
  );
}
const tl = StyleSheet.create({
  item: { alignItems: 'center', flex: 1 },
  dot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.roseDark,
    marginBottom: 8,
  },
  dotDone: { backgroundColor: colors.primary },
  dotCurrent: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.white,
    borderWidth: 3, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  dotCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  dotFuture: { backgroundColor: colors.borderLight },
  label: { fontSize: 11, fontWeight: '700', color: colors.textFaint },
  labelCurrent: { color: colors.primary, fontWeight: '800' },
  labelFuture: { color: colors.textPlaceholder },
  line: {
    position: 'absolute', top: 6, left: '50%', right: '-50%',
    height: 2, backgroundColor: colors.roseDark, zIndex: -1,
  },
});

// ─── Product row ────────────────────────────────────────────────────────────
function ProductRow({ product }) {
  return (
    <View style={prod.row}>
      <View style={prod.iconWrap}>
        <Ionicons name={product.icon} size={18} color={product.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={prod.name}>{product.name}</Text>
        <Text style={prod.usage}>{product.usage}</Text>
        <View style={prod.barTrack}>
          <View style={[prod.barFill, { width: `${product.progress * 100}%`, backgroundColor: product.color }]} />
        </View>
      </View>
      <View style={prod.streak}>
        <Ionicons name="flame" size={13} color={colors.primary} />
        <Text style={prod.streakText}>{product.streak}</Text>
      </View>
    </View>
  );
}
const prod = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 10, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  name: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  usage: { fontSize: 11.5, color: colors.textLight, marginTop: 2, marginBottom: 8 },
  barTrack: { height: 5, borderRadius: 3, backgroundColor: colors.sectionBg, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  streakText: { fontSize: 13, fontWeight: '800', color: colors.primary },
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function EyebrowTrackerScreen({ navigation }) {
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

        <Text style={styles.navTitle}>Eyebrow Tracker</Text>

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
        {/* Ring + Goal */}
        <View style={styles.topRow}>
          <View style={styles.ringCard}>
            <RingProgress percent={78} />
          </View>
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>GOAL</Text>
            <Text style={styles.goalValue}>Full Arch</Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('BrowAnalysis')}
              accessibilityRole="button"
              accessibilityLabel="Edit goal"
            >
              <Text style={styles.editGoal}>Edit Goal ✎</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo comparison */}
        <View style={styles.photoRow}>
          <View style={styles.photoCol}>
            <Image source={{ uri: PHOTO_START }} style={styles.photo} resizeMode="cover" />
            <Text style={styles.photoCaption}>WEEK 1 (START)</Text>
          </View>
          <View style={styles.photoCol}>
            <View style={styles.photoLatestWrap}>
              <Image source={{ uri: PHOTO_LATEST }} style={styles.photo} resizeMode="cover" />
              <View style={styles.latestBadge}>
                <Text style={styles.latestBadgeText}>LATEST</Text>
              </View>
            </View>
            <Text style={[styles.photoCaption, styles.photoCaptionActive]}>WEEK 6 (TODAY)</Text>
          </View>
        </View>

        {/* Growth timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>GROWTH TIMELINE</Text>
          <View style={styles.timelineRow}>
            {TIMELINE.map((p, i) => (
              <TimelineDot key={p.key} point={p} isLast={i === TIMELINE.length - 1} />
            ))}
          </View>
        </View>

        {/* Product routine */}
        <Text style={styles.sectionTitle}>Product Routine</Text>
        {PRODUCTS.map(p => <ProductRow key={p.key} product={p} />)}

        {/* Photo logs */}
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>Photo Logs</Text>
          <Text style={styles.logsCount}>6 of 8 weeks</Text>
        </View>
        <View style={styles.logsRow}>
          {PHOTO_LOGS.map(log => (
            <View key={log.key} style={[styles.logThumb, !log.bw && styles.logThumbActive]}>
              <Image
                source={{ uri: log.bw ? PHOTO_START : PHOTO_LATEST }}
                style={styles.logImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>

        {/* Coach analysis */}
        <View style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>AI</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.coachTitle}>Coach Analysis</Text>
              <Text style={styles.coachUpdated}>UPDATED 2H AGO</Text>
            </View>
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.coachQuote}>
            "Great work this week! Your fullness score jumped 4%. The density in the arch is improving significantly. Stay consistent with the nighttime serum."
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.photoBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Take this week's photo"
        >
          <Ionicons name="camera-outline" size={17} color={colors.white} />
          <Text style={styles.photoBtnText}>Take This Week's Photo</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { flex: 1 },
  content: { paddingTop: 16, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  topRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 16 },
  ringCard: {
    backgroundColor: colors.white, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16, flex: 1,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  goalCard: {
    backgroundColor: colors.primaryPale, borderRadius: 18,
    flex: 1, padding: 16, justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  goalLabel: { fontSize: 10, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.2 },
  goalValue: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  editGoal: { fontSize: 12, fontWeight: '700', color: colors.textMid },

  photoRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 16 },
  photoCol: { flex: 1, gap: 8 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 16, backgroundColor: colors.sectionBg },
  photoLatestWrap: { position: 'relative' },
  latestBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: colors.primary, borderRadius: 100,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  latestBadgeText: { fontSize: 9, fontWeight: '800', color: colors.white, letterSpacing: 0.4 },
  photoCaption: { fontSize: 10, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.6, textAlign: 'center' },
  photoCaptionActive: { color: colors.primary },

  timelineCard: {
    backgroundColor: colors.white, borderRadius: 18,
    marginHorizontal: 16, marginBottom: 20, padding: 18,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  timelineTitle: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.2, marginBottom: 16 },
  timelineRow: { flexDirection: 'row' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginHorizontal: 16, marginBottom: 12 },

  logsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginTop: 8,
  },
  logsCount: { fontSize: 12, fontWeight: '600', color: colors.textLight },
  logsRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 12, marginBottom: 20 },
  logThumb: {
    flex: 1, aspectRatio: 1, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.borderLight,
  },
  logThumbActive: { borderWidth: 2, borderColor: colors.primary },
  logImage: { width: '100%', height: '100%' },

  coachCard: {
    backgroundColor: '#F1E8FB', borderRadius: 18,
    marginHorizontal: 16, marginBottom: 20, padding: 16,
    borderWidth: 1, borderColor: '#E0CCF5',
  },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  coachAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#2A1030', justifyContent: 'center', alignItems: 'center',
  },
  coachAvatarText: { fontSize: 11, fontWeight: '800', color: colors.white },
  coachTitle: { fontSize: 14, fontWeight: '800', color: colors.textDark },
  coachUpdated: { fontSize: 10, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.6, marginTop: 1 },
  coachQuote: { fontSize: 13, lineHeight: 20, color: colors.textMid, fontStyle: 'italic' },

  photoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 100, marginHorizontal: 16,
    paddingVertical: 15,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  photoBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
});
