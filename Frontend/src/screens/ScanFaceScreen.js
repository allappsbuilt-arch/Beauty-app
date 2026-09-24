import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Quality gauge (Poor ←→ Good) ────────────────────────────────────────────

function QualityGauge({ quality = 0.72 }) {
  // quality 0–1 where 1 = all green
  const redW  = (1 - quality) * 100;
  const grnW  = quality * 100;

  return (
    <View style={gauge.wrap}>
      {/* Labels */}
      <Text style={gauge.labelPoor}>Poor</Text>
      <View style={gauge.track}>
        {/* red segment */}
        <View style={[gauge.segRed, { flex: 1 - quality }]} />
        {/* centre notch */}
        <View style={gauge.notch} />
        {/* green segment */}
        <View style={[gauge.segGreen, { flex: quality }]} />
      </View>
      <Text style={gauge.labelGood}>Good</Text>
    </View>
  );
}

const gauge = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 8,
  },
  labelPoor: { fontSize: 12, fontWeight: '600', color: '#FFFFFF', opacity: 0.85, minWidth: 30 },
  labelGood: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', minWidth: 30, textAlign: 'right' },
  track: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  segRed:   { backgroundColor: '#E05060', borderRadius: 3 },
  segGreen: { backgroundColor: '#50C880', borderRadius: 3 },
  notch: {
    width: 3, height: 5,
    backgroundColor: colors.white,
    opacity: 0.9,
  },
});

// ─── Dashed Oval ─────────────────────────────────────────────────────────────
// Pure RN approach: two semi-transparent oval outlines with dashed simulation
// using border + opacity. React Native doesn't natively support dashed borders
// on all platforms, so we layer two ovals + a CSS dash trick via borderStyle.

const OVAL_W = SW * 0.72;
const OVAL_H = OVAL_W * 1.38;

function DashedOval({ animOpacity }) {
  return (
    <Animated.View
      style={[oval.container, { opacity: animOpacity, pointerEvents: 'none' }]}
    >
      {/* Outer glow ring */}
      <View style={oval.glowRing} />
      {/* Dashed oval border — using borderStyle dashed */}
      <View style={oval.dashedRing} />
    </Animated.View>
  );
}

const oval = StyleSheet.create({
  container: {
    position: 'absolute',
    width: OVAL_W,
    height: OVAL_H,
    borderRadius: OVAL_W / 2,
    alignSelf: 'center',
  },
  // soft pink outer glow
  glowRing: {
    position: 'absolute',
    top: -6, left: -6,
    right: -6, bottom: -6,
    borderRadius: (OVAL_W + 12) / 2,
    borderWidth: 1,
    borderColor: 'rgba(220,120,160,0.18)',
  },
  // dashed inner ring
  dashedRing: {
    flex: 1,
    borderRadius: OVAL_W / 2,
    borderWidth: 2,
    borderColor: 'rgba(230,160,190,0.90)',
    borderStyle: 'dashed',
  },
});

// ─── Tip Callout ──────────────────────────────────────────────────────────────

function TipCallout({ number, text, side = 'right', style }) {
  return (
    <View style={[tip.wrap, side === 'left' ? tip.wrapLeft : tip.wrapRight, style]}>
      {/* Notch arrow */}
      {side === 'right' && <View style={tip.arrowLeft} />}

      <View style={tip.content}>
        {/* Numbered circle */}
        <View style={tip.numCircle}>
          <Text style={tip.numText}>{number}</Text>
        </View>
        <Text style={tip.text}>{text}</Text>
      </View>

      {side === 'left' && <View style={tip.arrowRight} />}
    </View>
  );
}

const ARROW_SIZE = 7;
const tip = StyleSheet.create({
  wrap: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 150,
  },
  wrapRight: { right: 16 },
  wrapLeft:  { left: 16 },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  // small triangle notch pointing left (for right-side callouts)
  arrowLeft: {
    width: 0, height: 0,
    borderTopWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(255,255,255,0.95)',
    marginRight: -1,
  },
  // small triangle notch pointing right (for left-side callouts)
  arrowRight: {
    width: 0, height: 0,
    borderTopWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'rgba(255,255,255,0.95)',
    marginLeft: -1,
  },
  numCircle: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  numText: { fontSize: 10, fontWeight: '800', color: colors.white },
  text: {
    fontSize: 12, fontWeight: '600',
    color: colors.textDark,
    lineHeight: 16,
    flexShrink: 1,
  },
});

// ─── Shutter Button ───────────────────────────────────────────────────────────

function ShutterButton({ onPress, scanning }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12, duration: 700, easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [scanning]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={scanning ? 'Stop scanning' : 'Start face scan'}
    >
      <Animated.View style={[shutter.outer, { transform: [{ scale: pulseAnim }] }]}>
        {/* Progress ring — dashed outer ring */}
        <View style={shutter.progressRing} />
        {/* White inner disc */}
        <View style={shutter.inner} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const shutter = StyleSheet.create({
  outer: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    // outer ring track
    borderWidth: 3,
    borderColor: 'rgba(200,80,100,0.60)',
    backgroundColor: 'transparent',
  },
  // progress ring drawn as a coloured arc on top
  progressRing: {
    position: 'absolute',
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3,
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
    borderBottomColor: 'transparent',
    borderLeftColor:  'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  inner: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});

// ─── Camera Viewfinder (placeholder skin tone bg) ─────────────────────────────

function Viewfinder({ children }) {
  return (
    <View style={vf.container}>
      {/* Simulated skin-tone radial-like background */}
      <View style={vf.bg} />
      {/* Warm centre highlight */}
      <View style={vf.centreGlow} />
      {children}
    </View>
  );
}

const vf = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C4A882',  // warm neutral skin tone
    overflow: 'hidden',
  },
  // subtle radial gradient simulation via a large circle
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#B8977A',
  },
  centreGlow: {
    position: 'absolute',
    top: SH * 0.15, left: SW * 0.20,
    width: SW * 0.6, height: SW * 0.8,
    borderRadius: SW * 0.4,
    backgroundColor: 'rgba(240,210,185,0.50)',
  },
});

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ScanFaceScreen({ navigation }) {
  const [scanning, setScanning]   = useState(false);
  const [analysing, setAnalysing] = useState(false);
  // Oval pulse animation
  const ovalOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ovalOpacity, {
          toValue: 0.65, duration: 1400, easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ovalOpacity, {
          toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleShutter = () => {
    setScanning(true);
    setAnalysing(true);
    setTimeout(() => {
      setScanning(false);
      setAnalysing(false);
      navigation?.navigate('ScanAnalyzing');
    }, 2500);
  };

  // Oval vertical centre (roughly upper-middle of screen)
  const OVAL_TOP = SH * 0.13;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Full-screen camera viewfinder ── */}
      <Viewfinder>

        {/* ── Top nav overlay ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation?.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.navRight}>
            {/* Flash toggle */}
            <TouchableOpacity
              style={styles.navBtn}
              accessibilityRole="button"
              accessibilityLabel="Toggle flash"
            >
              <Ionicons name="flash-outline" size={21} color={colors.white} />
            </TouchableOpacity>
            {/* Gallery */}
            <TouchableOpacity
              style={styles.navBtn}
              accessibilityRole="button"
              accessibilityLabel="Open gallery"
            >
              <Ionicons name="image-outline" size={21} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Quality gauge ── */}
        <QualityGauge quality={0.72} />

        {/* ── Dashed oval overlay ── */}
        <View
          style={[
            styles.ovalPositioner,
            { top: OVAL_TOP, pointerEvents: 'none' },
          ]}
        >
          <DashedOval animOpacity={ovalOpacity} />
        </View>

        {/* ── Tip callouts ── */}
        {/* Tip 1 — right side, upper third */}
        <TipCallout
          number={1}
          text={'Center your face\nin the oval'}
          side="right"
          style={{ top: OVAL_TOP + OVAL_H * 0.22 }}
        />
        {/* Tip 2 — left side, middle */}
        <TipCallout
          number={2}
          text={'Ensure even,\nbright lighting'}
          side="left"
          style={{ top: OVAL_TOP + OVAL_H * 0.52 }}
        />

      </Viewfinder>

      {/* ── Bottom panel (sits over the viewfinder) ── */}
      <View style={styles.bottomPanel}>
        {/* Status text */}
        <Text style={styles.holdText}>Hold still</Text>
        <Text style={styles.analysingText}>
          {analysing ? 'Analyzing skin texture...' : 'Position your face in the oval'}
        </Text>

        {/* Shutter */}
        <ShutterButton onPress={handleShutter} scanning={scanning} />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  // ── Top bar ──────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 38 : 52,
    paddingBottom: 4,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    // glass effect
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  navRight: {
    flexDirection: 'row',
    gap: 10,
  },

  // ── Oval positioner ───────────────────────────────────────
  ovalPositioner: {
    position: 'absolute',
    left: (SW - OVAL_W) / 2,
    width: OVAL_W,
    height: OVAL_H,
  },

  // ── Bottom panel ──────────────────────────────────────────
  bottomPanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    // dark-to-transparent gradient simulation
    backgroundColor: 'rgba(10,5,8,0.72)',
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    alignItems: 'center',
    gap: 8,
    // frosted glass top edge
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  holdText: {
    fontSize: 26, fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
  },
  analysingText: {
    fontSize: 13, fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.1,
    marginBottom: 8,
  },
});
