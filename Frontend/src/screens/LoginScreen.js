import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { useI18n } from '../i18n';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setFormError(t('login.errMissing'));
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t('login.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.logoBadge}>
              <Ionicons name="sparkles" size={26} color={colors.white} />
            </View>
            <Text style={styles.brand}>{t('common.appName')}</Text>
          </View>

          <Text style={styles.heading}>{t('login.heading')}</Text>
          <Text style={styles.subheading}>{t('login.subheading')}</Text>

          {formError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.alertText} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>{t('login.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('login.emailPlaceholder')}
              placeholderTextColor={colors.textPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('login.password')}</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={colors.textPlaceholder}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? t('onboarding.profile.hidePassword') : t('onboarding.profile.showPassword')}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={t('login.signIn')}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>{t('login.signIn')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('login.noAccount')}</Text>
            <TouchableOpacity
              onPress={() => navigation?.replace('OnboardingWelcome')}
              accessibilityRole="button"
              accessibilityLabel={t('login.createAccount')}
            >
              <Text style={styles.footerLink}>{t('login.signUp')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24, justifyContent: 'center' },

  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoBadge: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  brand: { fontSize: 15, fontWeight: '800', color: colors.textDark, letterSpacing: 0.2 },

  heading: { fontSize: 26, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4, textAlign: 'center' },
  subheading: { fontSize: 14.5, color: colors.textMid, lineHeight: 21, marginTop: 8, marginBottom: 24, textAlign: 'center' },

  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.alertBg, borderWidth: 1, borderColor: colors.alertBorder,
    borderRadius: 14, padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: colors.alertText, fontWeight: '600', lineHeight: 18 },

  field: { marginBottom: 16 },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.textMid, marginBottom: 8 },
  input: {
    backgroundColor: colors.inputBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: colors.textDark, borderWidth: 1, borderColor: colors.borderLight,
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.inputBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.textDark },

  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 22 },
  footerText: { fontSize: 13.5, color: colors.textLight, fontWeight: '600' },
  footerLink: { fontSize: 13.5, color: colors.primary, fontWeight: '800' },

});
