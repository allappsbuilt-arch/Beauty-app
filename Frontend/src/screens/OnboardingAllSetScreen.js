import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../api/usePreferences';
import { PillButton, FormError, OB_RED, TOTAL_STEPS, useOnboardingNav } from '../components/onboarding/OnboardingKit';
import { VOICES } from './OnboardingVoiceScreen';
import { COMMON_SENSITIVITIES } from './OnboardingAllergiesScreen';

const FACE = require('../../assets/onboarding/allset-face.jpg');

// Soft bokeh dots behind the content (position %, size).
const BOKEH = [
  { top: '4%', left: '-8%', size: 120 }, { top: '14%', left: '76%', size: 90 },
  { top: '38%', left: '82%', size: 150 }, { top: '52%', left: '-12%', size: 140 },
  { top: '70%', left: '64%', size: 110 }, { top: '26%', left: '8%', size: 44 },
];

function to12h(hhmm) {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

function SummaryCard({ icon, iconBg, iconColor, label, value, wide, check }) {
  return (
    <View style={[styles.card, wide ? styles.cardWide : styles.cardHalf]}>
      <View style={[styles.cardIcon, wide && styles.cardIconRound, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={wide ? 26 : 22} color={iconColor} />
      </View>
      <View style={wide ? { flex: 1 } : null}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue} numberOfLines={2}>{value}</Text>
      </View>
      {check ? <Ionicons name="checkmark-circle-outline" size={30} color="#7A6A6E" /> : null}
    </View>
  );
}

// Onboarding step 5 — summary of what was saved, then into the app.
export default function OnboardingAllSetScreen({ navigation }) {
  const { user, completeOnboarding } = useAuth();
  const { back } = useOnboardingNav(navigation);
  const { prefs, loading, error, reload } = usePreferences();
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState(null);

  const firstName = (user?.name || '').trim().split(/\s+/)[0];
  const voice = VOICES.find((v) => v.key === prefs?.coachStyle?.personality);
  const allergies = prefs?.allergies?.ingredients || [];
  const allergyText = allergies.length === 0
    ? 'None'
    : allergies.map((k) => COMMON_SENSITIVITIES.find((s) => s.key === k)?.label || k.charAt(0).toUpperCase() + k.slice(1)).join(', ');
  const times = [to12h(prefs?.reminders?.morning), to12h(prefs?.reminders?.evening)].filter(Boolean);

  // Finishing flips the navigator over to the main app (Home tab).
  const finish = async () => {
    setFinishError(null);
    setFinishing(true);
    try {
      await completeOnboarding();
    } catch (err) {
      setFinishError(err.message || 'Could not finish setup. Please try again.');
      setFinishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title="MyFace AI" titleColor={OB_RED} onBack={back} onClose={finishing ? undefined : finish} iconColor={OB_RED} />

      <View style={styles.bokehLayer} pointerEvents="none">
        {BOKEH.map((b, i) => (
          <View key={i} style={[styles.bokeh, { top: b.top, left: b.left, width: b.size, height: b.size, borderRadius: b.size / 2 }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.stepRow} accessible accessibilityLabel={`Step ${TOTAL_STEPS} of ${TOTAL_STEPS}`}>
            {Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => <View key={i} style={styles.stepDot} />)}
            <View style={styles.stepPill}><Text style={styles.stepPillText}>Step {TOTAL_STEPS}</Text></View>
          </View>

          <View style={styles.avatarOuter}>
            <Image source={FACE} style={styles.avatar} accessibilityLabel="Your glow profile" />
            <Ionicons name="sparkles" size={34} color="#E8A93C" style={styles.sparkle} />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {firstName ? `You're All Set, ${firstName}!` : "You're All Set!"}
          </Text>
          <Text style={styles.sub}>Your personalized skincare and hair routine is ready to launch.</Text>

          <ErrorBanner message={error} onRetry={reload} />

          {loading ? (
            <ActivityIndicator color={OB_RED} style={{ marginVertical: 24 }} />
          ) : (
            <>
              <SummaryCard
                wide check
                icon="happy-outline" iconBg="#FCE4E8" iconColor={OB_RED}
                label="Coach Voice" value={voice?.label || 'Not chosen yet'}
              />
              <View style={styles.row}>
                <SummaryCard icon="shield-checkmark-outline" iconBg="#F6E3E6" iconColor="#7A4A56" label="Sensitivities" value={allergyText} />
                <SummaryCard icon="alarm-outline" iconBg="#E6F2EA" iconColor="#2E7D5B" label="Daily Reminders" value={times.join(' · ') || 'Off'} />
              </View>

              <View style={styles.banner}>
                <Ionicons name="information-circle-outline" size={30} color={colors.white} />
                <Text style={styles.bannerText}>
                  {allergies.length > 0 ? (
                    <>Based on your selections, we'll flag <Text style={styles.bannerStrong}>{allergies.length} {allergies.length === 1 ? 'ingredient' : 'ingredients'}</Text> in every product you scan.</>
                  ) : (
                    <>Your coach will guide you in a <Text style={styles.bannerStrong}>{voice?.label || 'personal'}</Text> voice — start with today's face scan.</>
                  )}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FormError message={finishError} />
        <PillButton label="Enter MyFace Dashboard" onPress={finish} loading={finishing} />
        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text
            style={styles.termsLink}
            onPress={() => navigation.navigate('Terms')}
            accessibilityRole="link"
            accessibilityLabel="Read the Terms of Service"
          >
            terms of service
          </Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBEDE6' },
  bokehLayer: { ...StyleSheet.absoluteFillObject, top: 60, overflow: 'hidden' },
  bokeh: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.35)' },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 16 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', alignItems: 'center' },

  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 14 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E1BFC7' },
  stepPill: { backgroundColor: OB_RED, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 6 },
  stepPillText: { color: colors.white, fontWeight: '700', fontSize: 15 },

  avatarOuter: {
    width: 190, height: 190, borderRadius: 95, backgroundColor: '#EBB9A6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 22,
    shadowColor: colors.shadow, shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  avatar: { width: 128, height: 128, borderRadius: 64 },
  sparkle: { position: 'absolute', top: 18, right: 14 },

  title: { fontSize: 29, fontWeight: '700', color: '#3A2A2E', textAlign: 'center', letterSpacing: -0.3 },
  sub: { fontSize: 15.5, lineHeight: 22, color: '#6E5A60', textAlign: 'center', marginTop: 10, marginBottom: 22, maxWidth: 320 },

  row: { flexDirection: 'row', gap: 14, width: '100%', marginTop: 14 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 18, borderWidth: 1.5, borderColor: '#E6C9CE', padding: 16,
  },
  cardWide: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardHalf: { flex: 1, gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardIconRound: { width: 50, height: 50, borderRadius: 25 },
  cardLabel: { fontSize: 14, color: '#6E5A60', letterSpacing: 0.4, marginBottom: 4 },
  cardValue: { fontSize: 17, fontWeight: '600', color: '#3A2A2E' },

  banner: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 18,
    backgroundColor: 'rgba(192,64,90,0.88)', borderRadius: 18, borderWidth: 1.5, borderColor: '#A8294A', padding: 18,
  },
  bannerText: { flex: 1, fontSize: 15.5, lineHeight: 23, color: colors.white },
  bannerStrong: { fontWeight: '800' },

  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, width: '100%', maxWidth: 592, alignSelf: 'center' },
  terms: { marginTop: 14, textAlign: 'center', fontSize: 13.5, color: '#7A6A6E', letterSpacing: 0.3 },
  termsLink: { color: OB_RED, fontWeight: '700', textDecorationLine: 'underline' },
});
