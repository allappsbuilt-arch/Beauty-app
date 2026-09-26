import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image,
  StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { StepDots, PillButton, FormError, OB_RED, useOnboardingNav } from '../components/onboarding/OnboardingKit';

const HERO = require('../../assets/onboarding/profile-hero.jpg');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 60;

// Browser speech-to-text, when available (Chrome/Edge/Safari on the web).
const SpeechRecognition = Platform.OS === 'web' && typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

function validate({ name, email, password }, needsPassword) {
  const errors = {};
  if (!name.trim()) errors.name = 'Please enter your name.';
  else if (name.trim().length > MAX_NAME) errors.name = `Name must be ${MAX_NAME} characters or less.`;
  if (needsPassword) {
    if (!email.trim()) errors.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid email address.';
    if (!password) errors.password = 'Please create a password.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

// Onboarding step 2 — creates the account. Once signed in (reached by going
// back from step 3) it edits the saved name instead.
export default function OnboardingProfileScreen({ navigation }) {
  const { isAuthenticated, user, signup, updateProfile } = useAuth();
  const { back, skip, skipping } = useOnboardingNav(navigation);
  const editing = isAuthenticated;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Referral code from a ?ref=CODE link on the web, or typed in.
  const [referralCode, setReferralCode] = useState(() => {
    if (Platform.OS !== 'web') return '';
    try { return new URLSearchParams(window.location.search).get('ref')?.toUpperCase() || ''; } catch { return ''; }
  });
  const [showReferral, setShowReferral] = useState(!!referralCode);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);
  const recognizer = useRef(null);

  useEffect(() => () => recognizer.current?.abort?.(), []);

  const dictateName = () => {
    if (listening) { recognizer.current?.stop(); return; }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const heard = e.results?.[0]?.[0]?.transcript?.trim();
      if (heard) { setName(heard.slice(0, MAX_NAME)); setErrors((x) => ({ ...x, name: undefined })); }
    };
    rec.onerror = () => setFormError('Could not hear you — please type your name instead.');
    rec.onend = () => setListening(false);
    recognizer.current = rec;
    setListening(true);
    rec.start();
  };

  const handleContinue = async () => {
    const found = validate({ name, email, password }, !editing);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      if (editing) {
        if (name.trim() !== user?.name) await updateProfile({ name: name.trim() });
        navigation.navigate('OnboardingVoice');
      } else {
        // On success the navigator moves the new user on to step 3.
        await signup(name.trim(), email.trim(), password, referralCode.trim());
      }
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Unable to save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const clear = (field) => setErrors((x) => ({ ...x, [field]: undefined }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader
        title="Create Your Profile"
        titleColor={OB_RED}
        onBack={back}
        onClose={skipping ? undefined : skip}
        iconColor={OB_RED}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <StepDots step={2} style={styles.dots} />

            <View style={styles.hero}>
              <Image source={HERO} style={styles.heroImg} resizeMode="cover" accessibilityLabel="Glowing skin illustration" />
            </View>

            <Text style={styles.label}>Name</Text>
            <View style={[styles.inputRow, errors.name && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9A7F86"
                autoCapitalize="words"
                autoComplete="name"
                maxLength={MAX_NAME}
                value={name}
                onChangeText={(v) => { setName(v); clear('name'); }}
                accessibilityLabel="Name"
              />
              {SpeechRecognition ? (
                <TouchableOpacity
                  onPress={dictateName}
                  style={styles.inputIcon}
                  accessibilityRole="button"
                  accessibilityLabel={listening ? 'Stop dictation' : 'Say your name'}
                >
                  <Ionicons name={listening ? 'mic' : 'mic-outline'} size={22} color={OB_RED} />
                </TouchableOpacity>
              ) : null}
            </View>
            {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputRow, errors.email && styles.inputError, editing && styles.inputLocked]}>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#9A7F86"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                editable={!editing}
                value={email}
                onChangeText={(v) => { setEmail(v); clear('email'); }}
                accessibilityLabel="Email"
              />
            </View>
            {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

            {!editing && (
              <>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputRow, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a secure password"
                    placeholderTextColor="#9A7F86"
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    value={password}
                    onChangeText={(v) => { setPassword(v); clear('password'); }}
                    onSubmitEditing={handleContinue}
                    accessibilityLabel="Password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.inputIcon}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#5A3A42" />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

                {showReferral ? (
                  <>
                    <Text style={styles.label}>Referral code (optional)</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={styles.input}
                        placeholder="Friend's code, e.g. 3F2A9C1E"
                        placeholderTextColor="#9A7F86"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={8}
                        value={referralCode}
                        onChangeText={(v) => setReferralCode(v.toUpperCase())}
                        accessibilityLabel="Referral code (optional)"
                      />
                    </View>
                  </>
                ) : (
                  <TouchableOpacity onPress={() => setShowReferral(true)} style={styles.referralLink} accessibilityRole="button">
                    <Text style={styles.referralText}>Have a referral code?</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <FormError message={formError} />
          <PillButton label="Continue" onPress={handleContinue} loading={submitting} />
          {!editing && (
            <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.signInLink} accessibilityRole="button" accessibilityLabel="Sign in to an existing account">
              <Text style={styles.terms}>Already have an account? <Text style={styles.termsStrong}>Sign In</Text></Text>
            </TouchableOpacity>
          )}
          <Text style={styles.terms}>
            By signing up, you agree to our{' '}
            <Text
              style={styles.termsStrong}
              onPress={() => navigation.navigate('Terms')}
              accessibilityRole="link"
              accessibilityLabel="Read the Terms of Service"
            >
              Terms
            </Text>.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF6F6' },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 16 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  dots: { marginTop: 20, marginBottom: 22 },

  hero: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#E6C3CB', aspectRatio: 1.79, marginBottom: 20 },
  heroImg: { width: '100%', height: '100%' },

  label: { fontSize: 15, fontWeight: '700', color: '#4A3036', letterSpacing: 0.4, marginTop: 12, marginBottom: 10, marginLeft: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 18, borderWidth: 1.5, borderColor: '#E6C3CB',
    minHeight: 54, paddingLeft: 16,
  },
  inputError: { borderColor: colors.primary },
  inputLocked: { backgroundColor: '#FAF0F2' },
  input: {
    flex: 1, fontSize: 17, color: colors.textDark, paddingVertical: 14, paddingRight: 12,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  inputIcon: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldError: { color: colors.primary, fontSize: 12.5, fontWeight: '600', marginTop: 6, marginLeft: 6 },

  referralLink: { alignSelf: 'flex-start', marginTop: 12, marginLeft: 4, paddingVertical: 4 },
  referralText: { color: OB_RED, fontSize: 13.5, fontWeight: '700' },

  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18, width: '100%', maxWidth: 592, alignSelf: 'center' },
  signInLink: { marginTop: 14, paddingVertical: 2 },
  terms: { marginTop: 12, textAlign: 'center', fontSize: 15, color: '#4A3036' },
  termsStrong: { color: OB_RED, fontWeight: '800' },
});
