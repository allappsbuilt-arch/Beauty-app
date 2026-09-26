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
import { useTracker, timeAgo } from '../api/useTracker';
import { usePreferences } from '../api/usePreferences';
import { useI18n, translate as tr, formatDate } from '../i18n';
import { trackerItemLabel, browGoalLabel } from '../utils/serverText';

const TIMELINE_SLOTS = 5;

// Visual style per product; names, streaks and usage come from the backend.
const PRODUCT_STYLE = {
  revitabrow: { icon: 'flask-outline', color: colors.primary },
  castor: { icon: 'water-outline', color: '#1EA868' },
};

// One dot per scan (latest = current), padded with upcoming slots.
function buildTimeline(history = []) {
  const recent = history.slice(-(TIMELINE_SLOTS - 1));
  const points = recent.map((h, i) => ({
    key: h.id,
    label: formatDate(h.date, { month: 'short', day: 'numeric' }),
    state: i === recent.length - 1 ? 'current' : 'done',
  }));
  while (points.length < TIMELINE_SLOTS) {
    points.push({ key: `next${points.length}`, label: tr('tracker.next'), state: 'future' });
  }
  return points;
}

function coachMessage(tracker) {
  if (!tracker?.scanCount) return tr('eyebrow.coachFirst');
  if (tracker.change == null) return tr('eyebrow.coachBaseline', { score: tracker.score });
  if (tracker.change > 0) return tr('eyebrow.coachUp', { change: tracker.change });
  if (tracker.change < 0) return tr('eyebrow.coachDown', { change: Math.abs(tracker.change) });
  return tr('eyebrow.coachSteady');
}

// ─── Ring progress ─────────────────────────────────────────────────────────────
function RingProgress({ percent, size = 100 }) {
  const { t } = useI18n();
  const RING = 9;
  const deg = Math.round(((percent ?? 0) / 100) * 360);
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
        <Text style={ring.pct}>{percent == null ? '—' : `${percent}%`}</Text>
        <Text style={ring.label}>{t('tracker.fullness')}</Text>
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
function ProductRow({ product, onToggle }) {
  const { t } = useI18n();
  const label = trackerItemLabel('eyebrow', product);
  const style = PRODUCT_STYLE[product.key] || PRODUCT_STYLE.revitabrow;
  const progress = Math.min(product.streak / 30, 1);
  return (
    <TouchableOpacity
      style={prod.row}
      onPress={onToggle}
      activeOpacity={0.8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: product.doneToday }}
      accessibilityLabel={`${label}, ${product.doneToday ? t('tracker.usedTodayA11y') : t('tracker.notUsedToday')}`}
    >
      <View style={prod.iconWrap}>
        <Ionicons name={style.icon} size={18} color={style.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={prod.name}>{label}</Text>
        <Text style={prod.usage}>
          {product.doneToday ? t('tracker.usedToday') : t('tracker.tapToLog')} · {t('tracker.daysTotal', { count: product.totalDays })}
        </Text>
        <View style={prod.barTrack}>
          <View style={[prod.barFill, { width: `${progress * 100}%`, backgroundColor: style.color }]} />
        </View>
      </View>
      <View style={prod.streak}>
        <Ionicons name="flame" size={13} color={colors.primary} />
        <Text style={prod.streakText}>{product.streak}</Text>
      </View>
      <Ionicons
        name={product.doneToday ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={product.doneToday ? '#1EA868' : colors.borderLight}
      />
    </TouchableOpacity>
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
  const { tracker, error, reload, toggle } = useTracker('eyebrow');
  const { prefs } = usePreferences();
  const { t } = useI18n();
  const timeline = buildTimeline(tracker?.history);
  const updated = timeAgo(tracker?.lastScanAt);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{t('eyebrow.title')}</Text>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.popToTop()}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
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

        {/* Ring + Goal */}
        <View style={styles.topRow}>
          <View style={styles.ringCard}>
            <RingProgress percent={tracker?.score ?? null} />
          </View>
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>{t('eyebrow.goal')}</Text>
            <Text style={styles.goalValue}>{prefs?.eyebrow.goal ? browGoalLabel(prefs.eyebrow.goal) : '…'}</Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('BrowAnalysis')}
              accessibilityRole="button"
              accessibilityLabel={t('eyebrow.editGoalA11y')}
            >
              <Text style={styles.editGoal}>{t('eyebrow.editGoal')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start vs latest fullness */}
        <View style={styles.photoRow}>
          <View style={styles.photoCol}>
            <View style={[styles.photo, styles.scoreBox]}>
              <Text style={styles.scoreBig}>{tracker?.firstScore != null ? `${tracker.firstScore}%` : '—'}</Text>
            </View>
            <Text style={styles.photoCaption}>{t('tracker.firstScan')}</Text>
          </View>
          <View style={styles.photoCol}>
            <View style={styles.photoLatestWrap}>
              <View style={[styles.photo, styles.scoreBox, styles.scoreBoxActive]}>
                <Text style={[styles.scoreBig, styles.scoreBigActive]}>{tracker?.score != null ? `${tracker.score}%` : '—'}</Text>
              </View>
              <View style={styles.latestBadge}>
                <Text style={styles.latestBadgeText}>{t('tracker.latest')}</Text>
              </View>
            </View>
            <Text style={[styles.photoCaption, styles.photoCaptionActive]}>{t('tracker.latestScan')}</Text>
          </View>
        </View>

        {/* Growth timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>{t('eyebrow.timeline')}</Text>
          <View style={styles.timelineRow}>
            {timeline.map((p, i) => (
              <TimelineDot key={p.key} point={p} isLast={i === timeline.length - 1} />
            ))}
          </View>
        </View>

        {/* Product routine */}
        <Text style={styles.sectionTitle}>{t('eyebrow.productRoutine')}</Text>
        {(tracker?.items ?? []).map((p) => (
          <ProductRow key={p.key} product={p} onToggle={() => toggle(p.key)} />
        ))}

        {/* Photo logs */}
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>{t('tracker.scanLog')}</Text>
          <Text style={styles.logsCount}>{t('tracker.scans', { count: tracker?.scanCount ?? 0 })}</Text>
        </View>
        <View style={styles.logsRow}>
          {(tracker?.history ?? []).slice(-4).map((h, i, arr) => (
            <View key={h.id} style={[styles.logThumb, styles.scoreBox, i === arr.length - 1 && styles.logThumbActive]}>
              <Text style={styles.logScore}>{h.score}</Text>
              <Text style={styles.logDate}>{formatDate(h.date, { month: 'short', day: 'numeric' }).toUpperCase()}</Text>
            </View>
          ))}
          {!tracker?.history?.length && <Text style={styles.logDate}>{t('tracker.startLog')}</Text>}
        </View>

        {/* Coach analysis */}
        <View style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>{t('tracker.aiBadge')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.coachTitle}>{t('tracker.coachAnalysis')}</Text>
              <Text style={styles.coachUpdated}>{updated ? t('tracker.updated', { time: updated.toUpperCase() }) : t('tracker.noScansYet')}</Text>
            </View>
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.coachQuote}>"{coachMessage(tracker)}"</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.photoBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('tracker.weeklyPhotoA11y')}
          onPress={() => navigation?.navigate('ScanFace')}
        >
          <Ionicons name="camera-outline" size={17} color={colors.white} />
          <Text style={styles.photoBtnText}>{t('tracker.weeklyPhoto')}</Text>
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
  scoreBox: { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight },
  scoreBoxActive: { borderColor: colors.primary, borderWidth: 2 },
  scoreBig: { fontSize: 30, fontWeight: '800', color: colors.textMid },
  scoreBigActive: { color: colors.primary },
  logScore: { fontSize: 17, fontWeight: '800', color: colors.primary },
  logDate: { fontSize: 9, fontWeight: '700', color: colors.textFaint, marginTop: 2 },

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
