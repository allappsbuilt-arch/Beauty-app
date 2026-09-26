import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { useI18n, translationCoverage } from '../i18n';

// Language picker: the choice applies instantly and is remembered on this device.
export default function LanguageScreen({ navigation }) {
  const { t, language, setLanguage, languages } = useI18n();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader title={t('language.title')} onBack={navigation?.canGoBack() ? () => navigation.goBack() : undefined} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Text style={styles.sub}>{t('language.subtitle')}</Text>

          <View style={styles.list} accessibilityRole="radiogroup">
            {languages.map((lang) => {
              const selected = lang.code === language;
              const coverage = translationCoverage(lang.code);
              const partial = coverage < 1;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.row, selected && styles.rowSelected]}
                  onPress={() => setLanguage(lang.code)}
                  activeOpacity={0.85}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  aria-checked={selected}
                  accessibilityLabel={`${lang.name} (${lang.nativeName})`}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.native}>{lang.nativeName}</Text>
                    <Text style={styles.meta}>
                      {lang.name} · {t('language.script', { script: lang.script })}
                    </Text>
                    {partial && (
                      <View style={styles.badge}>
                        <Ionicons name="construct-outline" size={12} color={colors.alertText} />
                        <Text style={styles.badgeText}>
                          {t('language.inProgress', { percent: Math.round(coverage * 100) })}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selected ? colors.primary : colors.textPlaceholder}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textLight} />
            <Text style={styles.noteText}>{t('language.fallbackNote')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  sub: { fontSize: 14, color: colors.textMid, lineHeight: 20, marginBottom: 16 },
  list: { gap: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, borderWidth: 1.5, borderColor: colors.borderLight, padding: 16,
  },
  rowSelected: { borderColor: colors.primary },
  native: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  meta: { fontSize: 12.5, color: colors.textLight, fontWeight: '600', marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: colors.alertBg, borderRadius: 100, paddingHorizontal: 9, paddingVertical: 4,
  },
  badgeText: { fontSize: 11.5, fontWeight: '700', color: colors.alertText },
  note: { flexDirection: 'row', gap: 8, marginTop: 18, alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: 12.5, lineHeight: 18, color: colors.textLight },
});
