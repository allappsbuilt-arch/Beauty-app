import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { useAuthedRequest } from '../api/useAuthedRequest';

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

// ─── Data ─────────────────────────────────────────────────────────────────────
const ZONES = [
  {
    key:   'skin',
    title: 'Skin',
    icon:  'leaf-outline',
    score: 88,
    // placeholder image bg colour
    photoBg: '#B8906C',
    photoAccent: 'rgba(200,150,100,0.30)',
    metrics: [
      { label: 'Hydration Level', status: 'OPTIMAL' },
      { label: 'Pore Clarity',    status: 'FAIR'    },
      { label: 'Elasticity',      status: 'EXCELLENT'},
    ],
    trend: {
      label: '4-WEEK TREND',
      value: '+4.2%',
      // relative bar heights 0-1
      bars: [0.40, 0.55, 0.80, 0.95],
    },
    quote: '"Your barrier function is remarkably strong this week. Focus on double-cleansing tonight to maintain that pore clarity score."',
  },
  {
    key:   'eyes',
    title: 'Eyes',
    icon:  'eye-outline',
    score: 72,
    photoBg: '#7A5040',
    photoAccent: 'rgba(140,90,60,0.25)',
    metrics: [
      { label: 'Dark Circles', status: 'MODERATE' },
      { label: 'Puffiness',    status: 'LOW'      },
    ],
    trend: null,
    quote: '"Visible fatigue patterns detected in the periorbital region. Ensure 7+ hours of sleep and use a caffeine-based serum."',
  },
];

const ANCILLARY = [
  { key: 'lips',  label: 'Lips',  score: 94, icon: 'happy-outline',   photoBg: '#C08080', metricLabel: 'Hydration', metricVal: 'Optimal'  },
  { key: 'hair',  label: 'Hair',  score: 81, icon: 'cut-outline',     photoBg: '#806040', metricLabel: 'Density',   metricVal: 'Good'     },
  { key: 'brows', label: 'Brows', score: 82, icon: 'brush-outline',   photoBg: '#7A6050', metricLabel: 'Fullness',  metricVal: 'Moderate' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.FAIR;
  return (
    <View style={[badge.wrap, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[badge.text, { color: cfg.text }]}>{status}</Text>
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

// ─── Trend Bar Chart ──────────────────────────────────────────────────────────
function TrendChart({ trend }) {
  const BAR_H    = 52;
  const BAR_W    = 36;
  const BAR_GAP  = 10;
  const anim = useRef(trend.bars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      120,
      anim.map(a =>
        Animated.timing(a, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,  // height is a layout prop — cannot use native driver
        })
      )
    ).start();
  }, []);

  return (
    <View style={chart.wrap}>
      {/* Header row */}
      <View style={chart.header}>
        <Text style={chart.trendLabel}>{trend.label}</Text>
        <Text style={chart.trendVal}>{trend.value}</Text>
      </View>

      {/* Bars */}
      <View style={chart.bars}>
        {trend.bars.map((h, i) => {
          const isLast = i === trend.bars.length - 1;
          const scaleY = anim[i].interpolate({
            inputRange: [0, 1], outputRange: [0, 1],
          });
          return (
            <View
              key={i}
              style={[chart.barTrack, { width: BAR_W, height: BAR_H, marginRight: isLast ? 0 : BAR_GAP }]}
            >
              {/* Animate height directly instead of scaleY to avoid transformOrigin */}
              <Animated.View
                style={[
                  chart.barFill,
                  {
                    width: BAR_W,
                    height: anim[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, BAR_H * h],
                    }),
                    backgroundColor: isLast ? colors.primary : colors.primaryPaleDeep,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textFaint,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  trendVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textDark,
    letterSpacing: -0.1,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barTrack: {
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.sectionBg,
  },
  barFill: {
    borderRadius: 6,
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
function ZonePhoto({ bg, accent }) {
  return (
    <View style={[zonePhoto.wrap, { backgroundColor: bg }]}>
      <View style={[zonePhoto.glow, { backgroundColor: accent }]} />
      <View style={zonePhoto.iconRing}>
        <Ionicons name="person-outline" size={32} color="rgba(255,255,255,0.28)" />
      </View>
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
function ZoneCard({ zone }) {
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
      <ZonePhoto bg={zone.photoBg} accent={zone.photoAccent} />

      {/* ── Title row (overlaps bottom of photo) ── */}
      <View style={styles.zoneTitleRow}>
        <View style={styles.zoneTitleLeft}>
          <View style={styles.zoneIconWrap}>
            <Ionicons name={zone.icon} size={18} color={colors.primary} />
          </View>
          <Text style={styles.zoneTitle}>{zone.title}</Text>
        </View>
        <ScorePill score={zone.score} />
      </View>

      {/* ── Metrics ── */}
      <View style={styles.metricsBlock}>
        {zone.metrics.map((m, i) => (
          <MetricRow
            key={m.label}
            label={m.label}
            status={m.status}
            isLast={i === zone.metrics.length - 1}
          />
        ))}
      </View>

      {/* ── Trend chart (if present) ── */}
      {zone.trend && (
        <>
          <View style={styles.internalDivider} />
          <TrendChart trend={zone.trend} />
        </>
      )}

      {/* ── AI quote ── */}
      <View style={styles.internalDivider} />
      <QuoteRow quote={zone.quote} />

    </Animated.View>
  );
}

// ─── Ancillary Zone Mini Card ─────────────────────────────────────────────────
function AncillaryCard({ zone }) {
  const MINI_W = (SW - MX * 2 - 10) / 2;
  return (
    <TouchableOpacity
      style={[styles.ancCard, { width: MINI_W }]}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={zone.label}
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
          <Text style={styles.ancTitle}>{zone.label}</Text>
          <Text style={styles.ancScore}>{zone.score}</Text>
        </View>
        <View style={styles.ancFooter}>
          <Text style={styles.ancMetricLabel}>{zone.metricLabel}</Text>
          <Text style={styles.ancMetricVal}>{zone.metricVal}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
import { useAuthedRequest } from '../api/useAuthedRequest';

export default function FullScanAnalysisScreen({ navigation, route }) {
  // Accept scan data from route.params (passed from ScanResults/ScanAnalyzing)
  // or fall back to fetching the latest scan from the backend
  const request = useAuthedRequest();
  const [zones, setZones] = useState(route?.params?.zones || null);
  const [ancillary, setAncillary] = useState(route?.params?.ancillary || null);
  const [loading, setLoading] = useState(!route?.params?.zones);

  useEffect(() => {
    if (zones) return; // already have data from params
    (async () => {
      try {
        const { scans } = await request('/api/scans');
        if (scans && scans.length > 0) {
          setZones(scans[0].zones);
          setAncillary(scans[0].ancillary);
        } else {
          // No scans yet — use fallback static data
          setZones(ZONES);
          setAncillary(ANCILLARY);
        }
      } catch {
        setZones(ZONES);
        setAncillary(ANCILLARY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Nav bar ── */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>Full Scan Analysis</Text>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        /* ── Scroll feed ── */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          {/* Primary zones: Skin, Eyes */}
          {(zones || []).map(zone => (
            <ZoneCard key={zone.key} zone={zone} />
          ))}

          {/* Ancillary Zones section */}
          <View style={styles.ancSection}>
            <Text style={styles.ancHeader}>Ancillary Zones</Text>
            <View style={styles.ancRow}>
              {(ancillary || []).map(z => (
                <AncillaryCard key={z.key} zone={z} />
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 24 },

  // ── Nav ──────────────────────────────────────────────────
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingTop:    Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  navBtn: {
    width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  navTitle: {
    fontSize: 16, fontWeight: '700',
    color: colors.primary, letterSpacing: 0.1,
  },

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
