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

export default function LoginScreen({ navigation }) {
  const { login, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
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
            <Text style={styles.brand}>MyFace AI</Text>
          </View>

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to continue your beauty journey.</Text>

          {formError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.alertText} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
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
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
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
            accessibilityLabel="Sign in"
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation?.replace('Signup')}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {__DEV__ && (
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => continueAsGuest()}
            accessibilityRole="button"
            accessibilityLabel="Skip login and preview the app"
          >
            <Text style={styles.guestBtnText}>Skip login — preview app (dev)</Text>
          </TouchableOpacity>
          )}
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

  guestBtn: { alignItems: 'center', marginTop: 18 },
  guestBtnText: { fontSize: 12, color: colors.textPlaceholder, fontWeight: '600' },
});
