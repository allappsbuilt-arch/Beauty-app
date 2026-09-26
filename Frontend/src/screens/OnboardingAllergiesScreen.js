import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image,
  StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { usePreferences } from '../api/usePreferences';
import { StepDots, PillButton, FormError, OB_RED, TOTAL_STEPS, useOnboardingNav } from '../components/onboarding/OnboardingKit';

const PRODUCTS = require('../../assets/onboarding/allergy-products.jpg');

// Keys are how the ingredient catalog names them (see Backend productCatalog),
// so the Ingredient Scanner and Product Shelf flag matching products.
export const COMMON_SENSITIVITIES = [
  { key: 'fragrance', label: 'Fragrance' },
  { key: 'linalool', label: 'Linalool' },
  { key: 'parabens', label: 'Parabens' },
  { key: 'sulfates', label: 'Sulfates' },
  { key: 'nickel', label: 'Nickel' },
  { key: 'latex', label: 'Latex' },
  { key: 'formaldehyde', label: 'Formaldehyde' },
  { key: 'essentialoils', label: 'Essential Oils' },
];
const MAX_ALLERGIES = 30;

export const toIngredientKey = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
const labelFor = (key, custom) => COMMON_SENSITIVITIES.find((s) => s.key === key)?.label
  || custom[key] || key.charAt(0).toUpperCase() + key.slice(1);

function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      accessibilityLabel={label}
    >
      <Ionicons
        name={selected ? 'checkmark-circle-outline' : 'add-circle-outline'}
        size={26}
        color={selected ? colors.white : '#6E5A60'}
      />
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

// Onboarding step 4 — ingredients to flag (saved to preferences.allergies).
export default function OnboardingAllergiesScreen({ navigation }) {
  const { back, skip, skipping } = useOnboardingNav(navigation);
  const { prefs, error, reload, save, saving } = usePreferences();
  const [selected, setSelected] = useState(null); // null until prefs load
  const [custom, setCustom] = useState({}); // key → label typed this session
  const [query, setQuery] = useState('');
  const [formError, setFormError] = useState(null);
  const [savingNone, setSavingNone] = useState(false);

  const saved = prefs?.allergies?.ingredients;
  useEffect(() => {
    if (selected === null && saved) setSelected(saved);
  }, [saved, selected]);

  const picked = selected || [];
  const extraKeys = picked.filter((k) => !COMMON_SENSITIVITIES.some((s) => s.key === k));
  const chips = [...COMMON_SENSITIVITIES.map((s) => s.key), ...extraKeys];

  const toggle = (key) => {
    setFormError(null);
    setSelected(picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key]);
  };

  const addCustom = () => {
    const name = query.trim();
    const key = toIngredientKey(name);
    if (key.length < 2) { setFormError('Type an ingredient name (at least 2 letters) to add it.'); return; }
    if (picked.includes(key)) { setQuery(''); return; }
    if (picked.length >= MAX_ALLERGIES) { setFormError(`You can flag up to ${MAX_ALLERGIES} ingredients.`); return; }
    setCustom((c) => ({ ...c, [key]: name.slice(0, 40) }));
    setSelected([...picked, key]);
    setQuery('');
    setFormError(null);
  };

  const persist = async (ingredients) => {
    await save({ allergies: { ingredients } });
    navigation.navigate('OnboardingAllSet');
  };

  const handleContinue = async () => {
    if (query.trim()) { addCustom(); return; }
    if (picked.length === 0) {
      setFormError('Select at least one ingredient, or tap “I don\'t have any allergies”.');
      return;
    }
    setFormError(null);
    try { await persist(picked); } catch (err) { setFormError(err.message || 'Could not save. Please try again.'); }
  };

  const handleNone = async () => {
    setFormError(null);
    setSavingNone(true);
    try {
      setSelected([]);
      await persist([]);
    } catch (err) {
      setFormError(err.message || 'Could not save. Please try again.');
    } finally {
      setSavingNone(false);
    }
  };

  const busy = saving || savingNone;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title="MyFace AI" titleColor={OB_RED} onBack={back} onClose={skipping ? undefined : skip} iconColor={OB_RED} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <StepDots step={4} style={styles.dots} />
            <Text style={styles.stepText}>STEP 4 OF {TOTAL_STEPS}</Text>

            <Text style={styles.heading} accessibilityRole="header">Any Allergies or Sensitivities?</Text>
            <Text style={styles.sub}>We'll flag ingredients that might cause irritation or reactions based on your profile.</Text>

            <ErrorBanner message={error} onRetry={reload} />

            <View style={styles.search}>
              <Ionicons name="search-outline" size={24} color="#5A4A4E" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search other ingredients..."
                placeholderTextColor="#8A7A80"
                value={query}
                onChangeText={(v) => { setQuery(v); setFormError(null); }}
                onSubmitEditing={addCustom}
                returnKeyType="done"
                autoCorrect={false}
                maxLength={40}
                accessibilityLabel="Add another ingredient"
              />
              {query.trim() ? (
                <TouchableOpacity onPress={addCustom} style={styles.addBtn} accessibilityRole="button" accessibilityLabel={`Add ${query.trim()}`}>
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.section}>COMMON SENSITIVITIES</Text>
            <View style={styles.grid}>
              {chips.map((key) => (
                <View key={key} style={styles.cell}>
                  <Chip label={labelFor(key, custom)} selected={picked.includes(key)} onPress={() => toggle(key)} />
                </View>
              ))}
            </View>

            <View style={styles.quote}>
              <Image source={PRODUCTS} style={styles.quoteImg} />
              <Text style={styles.quoteText}>
                "We'll check every product you scan or add to your shelf against these ingredients."
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <FormError message={formError} />
          <PillButton label="Continue" icon="arrow-forward" onPress={handleContinue} loading={saving && !savingNone} disabled={busy || (!prefs && !error)} />
          <TouchableOpacity onPress={handleNone} disabled={busy} style={styles.noneBtn} accessibilityRole="button" accessibilityLabel="I don't have any allergies">
            <Text style={styles.noneText}>{savingNone ? 'Saving…' : "I don't have any allergies"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF6F6' },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 16 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  dots: { marginTop: 18 },
  stepText: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: '#4A3036', letterSpacing: 1.2, marginTop: 10 },

  heading: { fontSize: 25, fontWeight: '700', color: colors.textDark, textAlign: 'center', marginTop: 18, letterSpacing: -0.3 },
  sub: { fontSize: 14.5, lineHeight: 21, color: '#5A4A4E', textAlign: 'center', marginTop: 10, marginBottom: 20 },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white,
    borderRadius: 16, borderWidth: 1.5, borderColor: '#E6C3CB', paddingLeft: 16, minHeight: 54,
  },
  searchInput: {
    flex: 1, fontSize: 16, color: colors.textDark, paddingVertical: 14,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  },
  addBtn: { paddingHorizontal: 16, paddingVertical: 14 },
  addBtnText: { color: OB_RED, fontWeight: '800', fontSize: 15 },

  section: { fontSize: 13, fontWeight: '700', color: '#4A3036', letterSpacing: 1.1, marginTop: 26, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -7 },
  cell: { width: '50%', paddingHorizontal: 7, marginBottom: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52,
    backgroundColor: colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: '#E6C3CB', paddingHorizontal: 14,
  },
  chipSelected: { backgroundColor: '#C94766', borderColor: '#A8294A' },
  chipText: { flex: 1, fontSize: 16, color: colors.textDark },
  chipTextSelected: { color: colors.white, fontWeight: '700' },

  quote: {
    flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10,
    backgroundColor: '#FDEDEF', borderRadius: 18, borderWidth: 1.5, borderColor: '#EBCDD3', padding: 16,
  },
  quoteImg: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: colors.white },
  quoteText: { flex: 1, fontSize: 15, lineHeight: 22, fontStyle: 'italic', color: '#4A3036' },

  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14, width: '100%', maxWidth: 592, alignSelf: 'center' },
  noneBtn: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 16, marginTop: 4 },
  noneText: { color: OB_RED, fontSize: 15 },
});
