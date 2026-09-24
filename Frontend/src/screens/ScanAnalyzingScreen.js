import React, { useEffect, useRef } from 'react';
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
import ScreenHeader from '../components/ScreenHeader';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { notify } from '../utils/feedback';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Design tokens ────────────────────────────────────────────────────────────
const FACE_BG      = '#8B6050';
const CARD_BG      = 'rgba(38,10,28,0.86)';
const CARD_BORDER  = 'rgba(192,64,90,0.28)';
const ACCENT       = '#C0405A';
const ACCENT_DIM   = '#D96080';
const WHITE        = '#FFFFFF';
const ANALYZING_TXT= '#E87090';        // pinkish title colour in reference

// ─── Callout data ─────────────────────────────────────────────────────────────
// Positions are expressed as fraction of SH so they scale across devices.
const CALLOUTS = [
  {
    key:   'tone',
    label: 'TONE ANALYSIS',
    value: 'Tone detected',
    icon:  'color-palette-outline',
    topFrac:  0.295,
    leftFrac: 0,          // anchored to left edge
    rightFrac: null,
  },
  {
    key:   'micro',
    label: 'MICRO-SURFACE',
    value: 'Texture analyzed',
    icon:  'grid-outline',
    topFrac:  0.390,
    leftFrac: null,
    rightFrac: 0,         // anchored to right edge
  },
  {
    key:   'periorbital',
    label: 'PERIORBITAL',
    value: 'Dark circles: mild',
    icon:  'eye-outline',
    topFrac:  0.500,
    leftFrac: 0,
    rightFrac: null,
  },
  {
    key:   'brow',
    label: 'BROW VOLUME',
    value: 'Brow fullness: moderate',
    icon:  'scan-circle-outline',
    topFrac:  0.600,
    leftFrac: 0.06,       // slightly indented from left
    rightFrac: null,
  },
];

// ─── Progress ring ────────────────────────────────────────────────────────────
function ProgressRing({ progress = 0.85 }) {
  const SIZE   = 72;
  const STROKE = 5;
  const deg    = Math.round(progress * 360);
  const inner  = SIZE - STROKE * 2 - 2;

  // Rotate animation for spinning arc feel
  const rotAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotAnim, {
        toValue: 1, duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={ringStyles.outer}>
      {/* soft outer glow */}
      <View style={ringStyles.glow} />

      {/* track */}
      <View style={{
        position: 'absolute',
        width: SIZE, height: SIZE, borderRadius: SIZE / 2,
        borderWidth: STROKE,
        borderColor: 'rgba(192,64,90,0.22)',
      }} />

      {/* spinning accent arc */}
      <Animated.View style={{
        position: 'absolute',
        width: SIZE, height: SIZE, borderRadius: SIZE / 2,
        borderWidth: STROKE,
        borderTopColor:    ACCENT,
        borderRightColor:  deg > 90  ? ACCENT : 'rgba(192,64,90,0.22)',
        borderBottomColor: deg > 180 ? ACCENT : 'rgba(192,64,90,0.22)',
        borderLeftColor:   deg > 270 ? ACCENT : 'rgba(192,64,90,0.22)',
        transform: [{ rotate }],
      }} />

      {/* inner dark disc */}
      <View style={{
        width: inner, height: inner, borderRadius: inner / 2,
        backgroundColor: 'rgba(28,8,20,0.92)',
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Text style={ringStyles.pct}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  outer: {
    width: 72, height: 72,
    justifyContent: 'center', alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(192,64,90,0.14)',
  },
  pct: {
    fontSize: 17, fontWeight: '800',
    color: WHITE, letterSpacing: -0.4,
  },
});

// ─── Horizontal scan line sweep ───────────────────────────────────────────────
function ScanLine() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1, duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0, duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SH * 0.08, SH * 0.78],
  });

  return (
    <Animated.View
      style={[scanStyles.line, { transform: [{ translateY }], pointerEvents: 'none' }]}
    />
  );
}

const scanStyles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1.5,
    backgroundColor: 'rgba(192,64,90,0.55)',
    shadowColor: ACCENT,
    shadowOpacity: 0.90,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
});

// ─── Callout card ─────────────────────────────────────────────────────────────
function CalloutCard({ callout, entryAnim }) {
  const fromLeft = callout.leftFrac !== null;
  const posStyle = {
    top:   callout.topFrac  * SH,
    left:  callout.leftFrac  !== null ? callout.leftFrac  * SW : undefined,
    right: callout.rightFrac !== null ? callout.rightFrac * SW : undefined,
  };

  const tx = entryAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [fromLeft ? -32 : 32, 0],
  });

  return (
    <Animated.View
      style={[
        cardStyles.wrap,
        posStyle,
        { opacity: entryAnim, transform: [{ translateX: tx }], pointerEvents: 'none' },
      ]}
    >
      <View style={cardStyles.inner}>
        {/* Icon circle */}
        <View style={cardStyles.iconCircle}>
          <Ionicons name={callout.icon} size={15} color={ACCENT_DIM} />
        </View>

        {/* Labels */}
        <View style={cardStyles.textCol}>
          <Text style={cardStyles.label}>{callout.label}</Text>
          <Text style={cardStyles.value}>{callout.value}</Text>
        </View>
      </View>

      {/* Bottom accent line */}
      <View style={cardStyles.accentLine} />
    </Animated.View>
  );
}

const CARD_W = SW * 0.60;
const cardStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: CARD_W,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 11,
    paddingHorizontal: 14,
    // layered shadow for depth
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(192,64,90,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(192,64,90,0.28)',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  textCol: { flex: 1 },
  label: {
    fontSize: 9, fontWeight: '700',
    color: 'rgba(255,255,255,0.48)',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  value: {
    fontSize: 13, fontWeight: '700',
    color: WHITE,
    letterSpacing: 0.1,
  },
  accentLine: {
    height: 1.5,
    backgroundColor: 'rgba(192,64,90,0.36)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -1,
  },
});

// ─── Processing pill ──────────────────────────────────────────────────────────
function ProcessingPill() {
  const dotAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1, duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0.3, duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={pillStyles.wrap}>
      <Animated.View style={[pillStyles.dot, { opacity: dotAnim }]} />
      <Text style={pillStyles.text}>Processing neural landmarks...</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 100,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    gap: 9,
    // glass depth
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  text: {
    fontSize: 13, fontWeight: '600',
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 0.1,
  },
});

// ─── Face background (skin-tone with vignette) ────────────────────────────────
function FaceBackground() {
  return (
    <>
      {/* warm skin fill */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: FACE_BG }} />
      </View>

      {/* centre glow (simulates forehead highlight) */}
      <View style={bgStyles.centreGlow} />

      {/* dark vignette edges — left, right, top, bottom */}
      <View style={[bgStyles.vignette, bgStyles.vLeft]}  />
      <View style={[bgStyles.vignette, bgStyles.vRight]} />
      <View style={[bgStyles.vignette, bgStyles.vTop]}   />
      <View style={[bgStyles.vignette, bgStyles.vBottom]}/>
    </>
  );
}

const bgStyles = StyleSheet.create({
  centreGlow: {
    position: 'absolute',
    top: SH * 0.08, left: SW * 0.22,
    width: SW * 0.56, height: SH * 0.44,
    borderRadius: SW * 0.28,
    backgroundColor: 'rgba(195,145,110,0.38)',
  },
  vignette: { position: 'absolute' },
  vLeft:    { top: 0, bottom: 0, left: 0,   width: SW * 0.14, backgroundColor: 'rgba(18,4,14,0.62)' },
  vRight:   { top: 0, bottom: 0, right: 0,  width: SW * 0.14, backgroundColor: 'rgba(18,4,14,0.62)' },
  vTop:     { top: 0, left: 0, right: 0,    height: SH * 0.12, backgroundColor: 'rgba(14,4,12,0.58)' },
  vBottom:  { bottom: 0, left: 0, right: 0, height: SH * 0.28, backgroundColor: 'rgba(14,4,12,0.75)' },
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ScanAnalyzingScreen({ navigation, route }) {
  const image = route?.params?.image;
  // One Animated.Value per callout for staggered entry
  const entryAnims = useRef(CALLOUTS.map(() => new Animated.Value(0))).current;
  const request = useAuthedRequest();

  useEffect(() => {
    if (!image) {
      navigation?.goBack();
      return undefined;
    }
    let cancelled = false;
    // Send the photo for AI analysis in parallel with the animation below.
    const scanPromise = request('/api/scans', { method: 'POST', body: { image } });

    // Stagger each card in 550 ms apart, starting after 300 ms
    Animated.stagger(
      550,
      entryAnims.map(a =>
        Animated.timing(a, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();

    // Advance once the animation has played AND the server has answered —
    // never show sample results as if they were the user's real scan.
    const totalDelay = CALLOUTS.length * 550 + 480 + 800;
    const minDelay = new Promise((resolve) => setTimeout(resolve, totalDelay));
    Promise.all([scanPromise, minDelay])
      .then(([scan]) => {
        if (cancelled) return;
        navigation?.replace('ScanResults', { zones: scan.zones, ancillary: scan.ancillary });
      })
      .catch((err) => {
        if (cancelled) return;
        notify('Scan failed', err?.message || 'Could not analyse your scan. Please try again.');
        navigation?.goBack();
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Face background ── */}
      <FaceBackground />

      {/* ── Scan line sweep ── */}
      <ScanLine />

      {/* ── Top nav bar ── */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={WHITE} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>MyFace AI</Text>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={20} color={WHITE} />
        </TouchableOpacity>
      </View>

      {/* ── Progress ring + ANALYZING label (top-right) ── */}
      <View style={[styles.ringContainer, { pointerEvents: 'none' }]}>
        <ProgressRing progress={0.85} />
        <Text style={styles.analyzingLabel}>ANALYZING</Text>
      </View>

      {/* ── Staggered callout cards ── */}
      {CALLOUTS.map((c, i) => (
        <CalloutCard key={c.key} callout={c} entryAnim={entryAnims[i]} />
      ))}

      {/* ── Bottom panel ── */}
      <View style={styles.bottomPanel}>
        <ProcessingPill />
        <Text style={styles.holdText}>
          Hold still while our AI constructs{'\n'}your personal skin profile.
        </Text>
      </View>
    </View>
  );
}

// ─── Screen-level styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#140810',
  },

  // ── Nav ──────────────────────────────────────────────────
  nav: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 52,
    paddingBottom: 12,
    // very subtle dark gradient header
    backgroundColor: 'rgba(14,4,12,0.30)',
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  navTitle: {
    fontSize: 17, fontWeight: '700',
    color: ANALYZING_TXT,
    letterSpacing: 0.2,
  },

  // ── Progress ring ─────────────────────────────────────────
  ringContainer: {
    position: 'absolute',
    top:   Platform.OS === 'android' ? SH * 0.125 : SH * 0.135,
    right: 18,
    alignItems: 'center',
    gap: 5,
  },
  analyzingLabel: {
    fontSize: 8, fontWeight: '800',
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 2.2,
  },

  // ── Bottom panel ──────────────────────────────────────────
  bottomPanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: Platform.OS === 'ios' ? 46 : 30,
    paddingHorizontal: 28,
    gap: 14,
    backgroundColor: 'rgba(12,4,10,0.60)',
    // frosted top edge
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  holdText: {
    fontSize: 14, fontWeight: '400',
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    lineHeight: 21,
    letterSpacing: 0.1,
  },
});
