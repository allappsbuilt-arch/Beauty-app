import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { StepDots, PillButton, OB_RED, TOTAL_STEPS, useOnboardingNav } from '../components/onboarding/OnboardingKit';

const SERUMS = require('../../assets/onboarding/serums.jpg');

// Onboarding step 1 — brand welcome.
export default function OnboardingWelcomeScreen({ navigation }) {
  const { back, skip, skipping } = useOnboardingNav(navigation);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader
        center={<StepDots step={1} />}
        onBack={back}
        onClose={skipping ? undefined : skip}
        iconColor={OB_RED}
        bordered={false}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.logoWrap}>
            <View style={styles.logoTile}>
              <Ionicons name="sparkles-outline" size={76} color={OB_RED} />
            </View>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf-outline" size={20} color={colors.white} />
            </View>
          </View>

          <Text style={styles.title} accessibilityRole="header">Welcome to MyFace AI</Text>
          <Text style={styles.subtitle}>Your personal AI face coach for skin, hair, and makeup.</Text>

          <View style={styles.grid}>
            <View style={styles.row}>
              <View style={[styles.tile, styles.tileHalf]}>
                <Image source={SERUMS} style={styles.tileImage} resizeMode="cover" accessibilityLabel="Skincare serums" />
              </View>
              <View style={[styles.tile, styles.tileHalf, styles.tileSoft]}>
                <View style={styles.tileGlow} />
              </View>
            </View>
            <View style={[styles.tile, styles.tileWide, styles.tileSoft]}>
              <View style={styles.tileGlow} />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PillButton label="Get Started" onPress={() => navigation.navigate('OnboardingProfile')} />
        <Text style={styles.stepText}>Step 1 of {TOTAL_STEPS}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDF5F6' },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', alignItems: 'center' },

  logoWrap: { marginTop: 24, marginBottom: 28 },
  logoTile: {
    width: 150, height: 150, borderRadius: 40,
    backgroundColor: '#FCE4E8', borderWidth: 1.5, borderColor: '#E7C3CB',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.shadow, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  logoBadge: {
    position: 'absolute', top: -10, right: -12,
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#2E7D5B',
    borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },

  title: { fontSize: 28, fontWeight: '800', color: OB_RED, textAlign: 'center', letterSpacing: -0.4 },
  subtitle: { fontSize: 17, color: '#5A3A42', textAlign: 'center', lineHeight: 25, marginTop: 12, maxWidth: 330 },

  grid: { width: '100%', marginTop: 40, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  tile: {
    borderRadius: 16, borderWidth: 1, borderColor: '#F0D6DC', overflow: 'hidden', backgroundColor: colors.white,
  },
  tileHalf: { flex: 1, aspectRatio: 1.36 },
  tileWide: { width: '100%', height: 72 },
  tileSoft: { backgroundColor: '#FCEFF1', padding: 12 },
  tileGlow: { flex: 1, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.45)' },
  tileImage: { width: '100%', height: '100%' },

  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, width: '100%', maxWidth: 592, alignSelf: 'center' },
  stepText: { marginTop: 18, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#8A7278' },
});
