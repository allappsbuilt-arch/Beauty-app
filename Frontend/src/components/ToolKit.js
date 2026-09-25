import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { goToTab } from '../utils/navigation';

// Shared building blocks for the photo-based tools (Virtual Try-On, Aging
// Simulator, Symmetry Check, Timelapse) — matches the AI Hairstylist screen.

export function ToolNav({ navigation, right }) {
  return (
    <View style={s.nav}>
      <TouchableOpacity
        style={s.navBtn}
        onPress={() => (navigation?.canGoBack() ? navigation.goBack() : goToTab(navigation, 'AllTools'))}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
      </TouchableOpacity>
      <Text style={s.navTitle}>MyFace AI</Text>
      {right ?? (
        <TouchableOpacity style={s.navBtn} onPress={() => navigation?.popToTop()}
          accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function ToolHeading({ eyebrow, title, subtitle }) {
  return (
    <View style={s.heading}>
      {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, loading, loadingLabel, disabled, icon, style }) {
  return (
    <TouchableOpacity
      style={[s.primaryBtn, (loading || disabled) && { opacity: 0.7 }, style]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: !!loading, disabled: !!disabled }}
    >
      {loading ? (
        <>
          <ActivityIndicator color={colors.white} />
          {loadingLabel ? <Text style={s.primaryBtnText}>{loadingLabel}</Text> : null}
        </>
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={17} color={colors.white} /> : null}
          <Text style={s.primaryBtnText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress, icon, disabled }) {
  return (
    <TouchableOpacity
      style={[s.secondaryBtn, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon ? <Ionicons name={icon} size={16} color={colors.primary} /> : null}
      <Text style={s.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Pill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[s.pill, active && s.pillActive]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      accessibilityLabel={label}
    >
      <Text style={[s.pillText, active && s.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Generated result with a Before / After toggle.
export function BeforeAfter({ before, after, afterLabel = 'After' }) {
  const [showAfter, setShowAfter] = useState(true);
  return (
    <View style={s.baCard}>
      <Image source={{ uri: showAfter ? after : before }} style={s.baImage} resizeMode="cover" />
      <View style={s.baToggle}>
        <Pill label="Before" active={!showAfter} onPress={() => setShowAfter(false)} />
        <Pill label={afterLabel} active={showAfter} onPress={() => setShowAfter(true)} />
      </View>
    </View>
  );
}

export function InfoNote({ icon = 'information-circle-outline', children }) {
  return (
    <View style={s.note}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={s.noteText}>{children}</Text>
    </View>
  );
}

export const toolStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.2,
    marginHorizontal: 20, marginTop: 20, marginBottom: 10,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  card: {
    backgroundColor: colors.white, borderRadius: 18,
    marginHorizontal: 16, marginTop: 12, padding: 16,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
});

const s = StyleSheet.create({
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 14 : 8, paddingBottom: 10,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
  },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  heading: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 },
  eyebrow: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark, letterSpacing: -0.5 },
  subtitle: { fontSize: 13.5, color: colors.textLight, marginTop: 4, lineHeight: 19 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 15,
    marginHorizontal: 16, marginTop: 16,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  primaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.white, borderRadius: 100, paddingVertical: 12,
    borderWidth: 1.5, borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.primary, fontWeight: '800', fontSize: 13.5 },
  pill: {
    borderRadius: 100, paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.textMid },
  pillTextActive: { color: colors.white },
  baCard: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1C1418' },
  baImage: { width: '100%', aspectRatio: 0.8 },
  baToggle: { position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  note: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 14,
    backgroundColor: colors.primaryPale,
  },
  noteText: { flex: 1, fontSize: 12.5, color: colors.textMid, lineHeight: 18 },
});
