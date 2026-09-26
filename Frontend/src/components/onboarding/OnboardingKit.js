import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigationState, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../utils/feedback';
import { useI18n, translate } from '../../i18n';

// Onboarding runs Welcome → Profile → Coach Voice → Allergies → All Set.
export const ONBOARDING_STEPS = ['OnboardingWelcome', 'OnboardingProfile', 'OnboardingVoice', 'OnboardingAllergies', 'OnboardingAllSet'];
export const TOTAL_STEPS = ONBOARDING_STEPS.length;

// Deep brand red used by the onboarding designs for CTAs and headings.
export const OB_RED = '#A8294A';

// Row of step dots; the current step is a wide pill.
export function StepDots({ step, total = TOTAL_STEPS, style }) {
  const { t } = useI18n();
  return (
    <View
      style={[dots.row, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('onboarding.stepOf', { step, total })}
    >
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[dots.dot, i + 1 === step && dots.active]} />
      ))}
    </View>
  );
}

const dots = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#E6C3CC' },
  active: { width: 30, backgroundColor: OB_RED },
});

// Full-width pill CTA used at the bottom of every onboarding step.
export function PillButton({ label, onPress, loading, disabled, icon, style, accessibilityLabel }) {
  const inactive = loading || disabled;
  return (
    <TouchableOpacity
      style={[btn.wrap, inactive && btn.inactive, style]}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={btn.inner}>
          <Text style={btn.text}>{label}</Text>
          {icon ? <Ionicons name={icon} size={20} color={colors.white} /> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const btn = StyleSheet.create({
  wrap: {
    backgroundColor: OB_RED, borderRadius: 100, minHeight: 54, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: OB_RED, shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  inactive: { opacity: 0.65 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { color: colors.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.1 },
});

// Inline validation / save error shown above a CTA.
export function FormError({ message }) {
  if (!message) return null;
  return (
    <View style={errStyles.box} accessibilityLiveRegion="polite">
      <Ionicons name="alert-circle" size={16} color={colors.alertText} />
      <Text style={errStyles.text}>{message}</Text>
    </View>
  );
}

const errStyles = StyleSheet.create({
  box: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.alertBg, borderWidth: 1, borderColor: colors.alertBorder,
    borderRadius: 14, padding: 12, marginBottom: 12,
  },
  text: { flex: 1, fontSize: 13, color: colors.alertText, fontWeight: '600', lineHeight: 18 },
});

// Back / skip behaviour shared by every step.
//  - back: previous step, or `fallback` when this step opened the stack
//    (e.g. Coach Voice right after the account was created).
//  - skip: signed in → finish onboarding and open Home; signed out → there
//    is no app to open without an account, so go to Login.
export function useOnboardingNav(navigation, { fallback } = {}) {
  const { isAuthenticated, completeOnboarding } = useAuth();
  const [skipping, setSkipping] = useState(false);

  // Whether a screen sits below this one, read from live stack state.
  const { key } = useRoute();
  const hasPrevious = useNavigationState((state) => (state?.routes?.findIndex((r) => r.key === key) ?? 0) > 0);

  const back = useCallback(() => {
    if (hasPrevious) navigation.goBack();
    else if (fallback) navigation.reset({ index: fallback.length - 1, routes: fallback.map((name) => ({ name })) });
  }, [navigation, fallback, hasPrevious]);

  const skip = useCallback(async () => {
    if (!isAuthenticated) {
      navigation.replace('Login');
      return;
    }
    setSkipping(true);
    try {
      await completeOnboarding();
    } catch (err) {
      notify(translate('onboarding.skipFailed'), err?.message || translate('onboarding.tryAgainLater'));
      setSkipping(false);
    }
  }, [isAuthenticated, completeOnboarding, navigation]);

  return { back: hasPrevious || fallback ? back : undefined, skip, skipping };
}
