import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { usePreferences } from '../api/usePreferences';
import { PillButton, FormError, OB_RED, TOTAL_STEPS, useOnboardingNav } from '../components/onboarding/OnboardingKit';
import { useI18n, richText } from '../i18n';

// Keys match the coach personalities the backend already understands.
export const VOICES = [
  {
    key: 'motivational',
    labelKey: 'coachVoices.motivational',
    avatar: require('../../assets/onboarding/coach-motivational.jpg'),
    icon: (c) => <Ionicons name="flash-outline" size={24} color={c} />,
    iconBg: '#C8405A', iconColor: colors.white,
    previewKey: 'coachVoices.motivationalPreview',
  },
  {
    key: 'gentle',
    labelKey: 'coachVoices.gentle',
    avatar: require('../../assets/onboarding/coach-gentle.jpg'),
    icon: (c) => <Ionicons name="flower-outline" size={24} color={c} />,
    iconBg: '#F1DDF7', iconColor: '#8A5A9E',
    previewKey: 'coachVoices.gentlePreview',
  },
  {
    key: 'clinical',
    labelKey: 'coachVoices.clinical',
    avatar: require('../../assets/onboarding/coach-science.jpg'),
    icon: (c) => <MaterialCommunityIcons name="microscope" size={24} color={c} />,
    iconBg: '#2E7D5B', iconColor: colors.white,
    previewKey: 'coachVoices.clinicalPreview',
  },
];

function VoiceCard({ voice, selected, onPress }) {
  const { t } = useI18n();
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      accessibilityLabel={t(voice.labelKey)}
    >
      <View style={styles.cardHead}>
        <View style={[styles.iconCircle, { backgroundColor: voice.iconBg }]}>{voice.icon(voice.iconColor)}</View>
        <Text style={styles.cardTitle}>{t(voice.labelKey)}</Text>
        {selected ? <Ionicons name="checkmark-circle-outline" size={28} color={OB_RED} /> : null}
      </View>
      <View style={[styles.preview, selected && styles.previewSelected]}>
        <Image source={voice.avatar} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.previewLabel, selected && { color: OB_RED }]}>{t('onboarding.voice.previewLabel')}</Text>
          <Text style={[styles.previewText, !selected && { color: '#6E5A60' }]}>{t(voice.previewKey)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Onboarding step 3 — coach personality (saved to preferences.coachStyle).
export default function OnboardingVoiceScreen({ navigation }) {
  // Opened straight after signup there is nothing behind this step yet, so
  // Back rebuilds steps 1–2.
  const { back, skip, skipping } = useOnboardingNav(navigation, { fallback: ['OnboardingWelcome', 'OnboardingProfile'] });
  const { prefs, error, reload, save, saving } = usePreferences();
  const { t } = useI18n();
  const [selected, setSelected] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const savedVoice = prefs?.coachStyle?.personality;
  useEffect(() => {
    if (selected === null && savedVoice) setSelected(VOICES.some((v) => v.key === savedVoice) ? savedVoice : 'motivational');
  }, [savedVoice, selected]);

  const current = VOICES.find((v) => v.key === selected);

  const handleSave = async () => {
    if (!selected) { setSaveError(t('onboarding.voice.chooseVoice')); return; }
    setSaveError(null);
    try {
      await save({ coachStyle: { personality: selected } });
      navigation.navigate('OnboardingAllergies');
    } catch (err) {
      setSaveError(err.message || t('onboarding.voice.saveFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader
        title={t('onboarding.voice.title')}
        titleColor={OB_RED}
        onBack={back}
        onClose={skipping ? undefined : skip}
        iconColor={OB_RED}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.stepRow} accessible accessibilityLabel={t('onboarding.stepOf', { step: 3, total: TOTAL_STEPS })}>
            <View style={styles.stepLine} />
            <Text style={styles.stepText}>{t('onboarding.stepOf', { step: 3, total: TOTAL_STEPS })}</Text>
          </View>

          <Text style={styles.heading} accessibilityRole="header">{t('onboarding.voice.heading')}</Text>
          <Text style={styles.sub}>{t('onboarding.voice.sub')}</Text>

          <ErrorBanner message={error} onRetry={reload} />

          <View style={styles.list} accessibilityRole="radiogroup">
            {VOICES.map((v) => (
              <VoiceCard key={v.key} voice={v} selected={selected === v.key} onPress={() => { setSelected(v.key); setSaveError(null); }} />
            ))}
          </View>

          <View style={styles.tip}>
            <Ionicons name="sparkles-outline" size={54} color="rgba(192,64,90,0.12)" style={styles.tipDecor} />
            <Text style={styles.tipTitle}>{t('onboarding.voice.tipTitle')}</Text>
            <Text style={styles.tipText}>
              {current
                ? richText(t('onboarding.voice.tipWithVoice', { voice: t(current.labelKey) }), (tag, text, i) => <Text key={i} style={styles.tipStrong}>{text}</Text>)
                : t('onboarding.voice.tipNoVoice')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FormError message={saveError} />
        <PillButton label={t('onboarding.voice.save')} onPress={handleSave} loading={saving} disabled={!prefs && !error} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF6F6' },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 16 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center' },

  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16, marginBottom: 20 },
  stepLine: { width: 56, height: 3, borderRadius: 2, backgroundColor: OB_RED },
  stepText: { fontSize: 14, fontWeight: '600', color: '#4A3036' },

  heading: { fontSize: 26, fontWeight: '700', color: colors.textDark, letterSpacing: -0.3 },
  sub: { fontSize: 15, lineHeight: 22, color: '#5A4A4E', marginTop: 10, marginBottom: 18 },

  list: { gap: 14 },
  card: {
    backgroundColor: colors.white, borderRadius: 20, borderWidth: 1.5, borderColor: '#EBCDD3', padding: 16,
  },
  cardSelected: { borderColor: OB_RED, borderWidth: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { flex: 1, fontSize: 20, fontWeight: '600', color: colors.textDark },

  preview: {
    flexDirection: 'row', gap: 12, backgroundColor: '#FFF8F8',
    borderRadius: 12, borderWidth: 1, borderColor: '#F5E3E6', padding: 14,
  },
  previewSelected: { backgroundColor: '#FCEAEC', borderColor: '#E9C3CA' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryPale },
  previewLabel: { fontSize: 11.5, fontWeight: '600', color: '#8A7278', letterSpacing: 1, marginBottom: 6 },
  previewText: { fontSize: 15, lineHeight: 22, fontStyle: 'italic', color: colors.textDark },

  tip: {
    marginTop: 28, backgroundColor: '#FCEAEC', borderRadius: 20, borderWidth: 1.5, borderColor: '#EBCDD3',
    padding: 20, overflow: 'hidden',
  },
  tipDecor: { position: 'absolute', right: 8, bottom: 6 },
  tipTitle: { fontSize: 22, fontWeight: '700', color: OB_RED, marginBottom: 10 },
  tipText: { fontSize: 15, lineHeight: 23, color: '#4A3036' },
  tipStrong: { color: OB_RED, fontWeight: '800' },

  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18, width: '100%', maxWidth: 592, alignSelf: 'center' },
});
