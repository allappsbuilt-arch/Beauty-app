import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { goToTab } from '../utils/navigation';
import SkinTrendChart from '../components/SkinTrendChart';
import { useI18n } from '../i18n';
import { zoneName, metricName, statusName } from '../utils/scanText';

const { width: SW } = Dimensions.get('window');

// ─── Design tokens ────────────────────────────────────────────────────────────
const MX      = 16;   // horizontal page margin
const CARD_R  = 16;   // card border-radius
const IMG_H   = 190;  // zone photo height

// Status badge colour map
const STATUS_COLORS = {
  OPTIMAL:   { bg: '#E6F9F0', text: '#1EA868', border: '#A8E8C4' },
  EXCELLENT: { bg: '#E6F9F0', text: '#1EA868', border: '#A8E8C4' },
  FAIR:      { bg: '#FFF8E6', text: '#C47A00', border: '#F5D878' },
  LOW:       { bg: '#E6F9F0', text: '#1EA868', border: '#A8E8C4' },
  MODERATE:  { bg: '#FFF0E6', text: '#D06030', border: '#F5C4A0' },
  HIGH:      { bg: '#FDEAEA', text: '#D03030', border: '#F5AAAA' },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.FAIR;
  return (
    <View style={[badge.wrap, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[badge.text, { color: cfg.text }]}>{String(statusName(status)).toUpperCase()}</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: {
    borderRadius: 100,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
  },
  text: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});

// ─── Metric Row ───────────────────────────────────────────────────────────────
function MetricRow({ label, status, isLast }) {
  return (
    <>
      <View style={metricRow.wrap}>
        <Text style={metricRow.label}>{label}</Text>
        <StatusBadge status={status} />
      </View>
      {!isLast && <View style={metricRow.divider} />}
    </>
  );
}
const metricRow = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
    letterSpacing: 0.05,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderUltraLight,
    marginHorizontal: 16,
  },
});

// ─── AI Quote row ─────────────────────────────────────────────────────────────
function QuoteRow({ quote }) {
  return (
    <View style={quoteStyles.wrap}>
      <View style={quoteStyles.iconWrap}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
      </View>
      <Text style={quoteStyles.text}>{quote}</Text>
    </View>
  );
}
const quoteStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: colors.primaryPale,
    borderBottomLeftRadius: CARD_R,
    borderBottomRightRadius: CARD_R,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
    borderWidth: 1,
    borderColor: colors.accentDark,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: colors.textMid,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

// ─── Zone photo placeholder ───────────────────────────────────────────────────
// Shows the captured face when there is one; otherwise the placeholder.
function ZonePhoto({ bg, accent, uri }) {
  const { t } = useI18n();
  return (
    <View style={[zonePhoto.wrap, { backgroundColor: bg }]}>
      {uri ? (
        <Image source={{ uri }} style={zonePhoto.image} resizeMode="cover" accessibilityLabel={t('scanResults.facePhoto')} />
      ) : (
        <>
          <View style={[zonePhoto.glow, { backgroundColor: accent }]} />
          <View style={zonePhoto.iconRing}>
            <Ionicons name="person-outline" size={32} color="rgba(255,255,255,0.28)" />
          </View>
        </>
      )}
    </View>
  );
}
const zonePhoto = StyleSheet.create({
  wrap: {
    height: IMG_H,
    overflow: 'hidden',
    borderTopLeftRadius: CARD_R,
    borderTopRightRadius: CARD_R,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: SW * 0.55,
    height: SW * 0.55,
    borderRadius: SW * 0.28,
    top: SW * 0.055,
    left: SW * 0.125,
  },
  image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ─── Score Pill (top-right of zone card) ─────────────────────────────────────
function ScorePill({ score }) {
  const good = score >= 80;
  return (
    <View style={[
      scorePill.wrap,
      { backgroundColor: good ? '#E6F9F0' : '#FFF0E6',
        borderColor: good ? '#A8E8C0' : '#F5C4A0' },
    ]}>
      <Text style={[scorePill.label, { color: good ? '#1EA868' : '#D06030' }]}>
        SCORE: {score}
      </Text>
    </View>
  );
}
const scorePill = StyleSheet.create({
  wrap: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

// ─── Zone Section Card ────────────────────────────────────────────────────────
function ZoneCard({ zone, photo }) {
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.zoneCard, { transform: [{ scale: scaleAnim }] }]}>

      {/* ── Photo ── */}
      <ZonePhoto bg={zone.photoBg} accent={zone.photoAccent} uri={photo} />

      {/* ── Title row (overlaps bottom of photo) ── */}
      <View style={styles.zoneTitleRow}>
        <View style={styles.zoneTitleLeft}>
          <View style={styles.zoneIconWrap}>
            <Ionicons name={zone.icon} size={18} color={colors.primary} />
          </View>
          <Text style={styles.zoneTitle}>{zoneName(zone)}</Text>
        </View>
        <ScorePill score={zone.score} />
      </View>

      {/* ── Metrics ── */}
      <View style={styles.metricsBlock}>
        {zone.metrics.map((m, i) => (
          <MetricRow
            key={m.label}
            label={metricName(m.label)}
            status={m.status}
            isLast={i === zone.metrics.length - 1}
          />
        ))}
      </View>

      {/* ── Trend chart (if present) ── */}
      {zone.trend && (
        <>
          <View style={styles.internalDivider} />
          <SkinTrendChart trend={zone.trend} />
        </>
      )}

      {/* ── AI quote ── */}
      <View style={styles.internalDivider} />
      <QuoteRow quote={zone.quote} />

    </Animated.View>
  );
}

// ─── Ancillary Zone Mini Card ─────────────────────────────────────────────────
// Each ancillary zone opens its dedicated tracker.
const ANCILLARY_ROUTES = { lips: 'LipVitality', hair: 'ScalpTracker', brows: 'EyebrowTracker' };

function AncillaryCard({ zone, onPress }) {
  const MINI_W = (SW - MX * 2 - 10) / 2;
  return (
    <TouchableOpacity
      style={[styles.ancCard, { width: MINI_W }]}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={zoneName(zone)}
      onPress={onPress}
    >
      {/* Mini photo */}
      <View style={[styles.ancPhoto, { backgroundColor: zone.photoBg }]}>
        <View style={styles.ancPhotoGlow} />
        <Ionicons name={zone.icon} size={18} color="rgba(255,255,255,0.35)" />
      </View>

      {/* Title + score */}
      <View style={styles.ancMeta}>
        <View style={styles.ancTitleRow}>
          <View style={styles.ancIconWrap}>
            <Ionicons name={zone.icon} size={12} color={colors.primary} />
          </View>
          <Text style={styles.ancTitle}>{zoneName(zone)}</Text>
          <Text style={styles.ancScore}>{zone.score}</Text>
        </View>
        <View style={styles.ancFooter}>
          <Text style={styles.ancMetricLabel}>{metricName(zone.metricLabel)}</Text>
          <Text style={styles.ancMetricVal}>{statusName(zone.metricVal)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ScanResultsScreen({ navigation, route }) {
  const zones = route?.params?.zones ?? [];
  const ancillary = route?.params?.ancillary ?? [];
  // Set only when arriving straight from a new scan.
  const pointsAwarded = route?.params?.pointsAwarded;
  // The captured face (data URL) — only present straight after a scan.
  const photo = route?.params?.photo;
  const { t } = useI18n();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Nav bar ── */}
      <ScreenHeader
        title={t('scanResults.title')}
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      {/* ── Scroll feed ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {pointsAwarded !== undefined && (
          <TouchableOpacity
            style={[styles.pointsBanner, !pointsAwarded && styles.pointsBannerMuted]}
            onPress={() => goToTab(navigation, 'Rewards')}
            accessibilityRole="button"
            accessibilityLabel={pointsAwarded ? t('scanResults.pointsA11y', { count: pointsAwarded }) : t('scanResults.viewPoints')}
          >
            <Ionicons name={pointsAwarded ? 'trophy' : 'checkmark-circle-outline'} size={18} color={pointsAwarded ? '#1EA868' : colors.textLight} />
            <Text style={[styles.pointsBannerText, !pointsAwarded && { color: colors.textMid }]}>
              {pointsAwarded ? t('scanResults.pointsEarned', { count: pointsAwarded }) : t('scanResults.pointsAlready')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {zones.length === 0 && (
          <View style={styles.noScan}>
            <Text style={styles.noScanText}>{t('scanResults.noScan')}</Text>
            <TouchableOpacity style={styles.noScanBtn} onPress={() => navigation?.replace('ScanFace')} accessibilityRole="button" accessibilityLabel={t('scanResults.takeScanA11y')}>
              <Text style={styles.noScanBtnText}>{t('scanResults.takeScan')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Primary zones: Skin, Eyes */}
        {zones.map(zone => (
          <ZoneCard key={zone.key} zone={zone} photo={photo} />
        ))}

        {/* Ancillary Zones section */}
        {ancillary.length > 0 && (
        <View style={styles.ancSection}>
          <Text style={styles.ancHeader}>{t('scanResults.ancillary')}</Text>
          <View style={styles.ancRow}>
            {ancillary.map(z => (
              <AncillaryCard
                key={z.key}
                zone={z}
                onPress={() => ANCILLARY_ROUTES[z.key] && navigation?.navigate(ANCILLARY_ROUTES[z.key])}
              />
            ))}
          </View>
        </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.primaryBg },
  pointsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#E7F7EE', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
  },
  pointsBannerMuted: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight },
  pointsBannerText: { flex: 1, fontSize: 13.5, fontWeight: '800', color: '#1EA868' },
  noScan: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  noScanText: { fontSize: 15, color: colors.textLight },
  noScanBtn: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 22, paddingVertical: 11 },
  noScanBtnText: { color: colors.white, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 24 },

  // ── Nav ──────────────────────────────────────────────────
  // ── Zone card ─────────────────────────────────────────────
  zoneCard: {
    backgroundColor: colors.white,
    borderRadius: CARD_R,
    marginHorizontal: MX,
    marginBottom: 14,
    overflow: 'hidden',
    // layered shadow
    shadowColor: colors.shadow,
    shadowOpacity: 0.09,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // title row overlapping photo bottom
  zoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderUltraLight,
  },
  zoneTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.accentDark,
  },
  zoneTitle: {
    fontSize: 17, fontWeight: '800',
    color: colors.textDark, letterSpacing: -0.2,
  },

  // metrics block
  metricsBlock: {
    backgroundColor: colors.white,
  },

  // internal card divider
  internalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },

  // ── Ancillary section ─────────────────────────────────────
  ancSection: {
    marginHorizontal: MX,
    marginBottom: 10,
  },
  ancHeader: {
    fontSize: 18, fontWeight: '800',
    color: colors.textDark,
    letterSpacing: -0.3,
    marginBottom: 12,
    marginTop: 4,
  },
  ancRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // ── Ancillary card ────────────────────────────────────────
  ancCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ancPhoto: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ancPhotoGlow: {
    position: 'absolute',
    width: (SW - MX * 2 - 10) / 2 * 0.80,
    height: (SW - MX * 2 - 10) / 2 * 0.80,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 11, left: 11,
  },
  ancMeta: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 5,
  },
  ancTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ancIconWrap: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  ancTitle: {
    flex: 1,
    fontSize: 13, fontWeight: '700',
    color: colors.textDark,
  },
  ancScore: {
    fontSize: 15, fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  ancFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ancMetricLabel: {
    fontSize: 11, color: colors.textFaint, fontWeight: '500',
  },
  ancMetricVal: {
    fontSize: 11, fontWeight: '700',
    color: '#1EA868',
  },
});
