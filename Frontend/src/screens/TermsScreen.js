import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { useI18n, formatDate } from '../i18n';

// Update this date whenever the terms below change.
const LAST_UPDATED = '2026-09-26';

// Section text lives in the translation files under `terms.sN`.
const SECTIONS = [
  { titleKey: 'terms.s1.title', bodyKeys: ['terms.s1.p1', 'terms.s1.p2'] },
  { titleKey: 'terms.s2.title', bodyKeys: ['terms.s2.p1', 'terms.s2.p2'] },
  { titleKey: 'terms.s3.title', bodyKeys: ['terms.s3.p1', 'terms.s3.p2'] },
  { titleKey: 'terms.s4.title', bodyKeys: ['terms.s4.p1', 'terms.s4.p2'] },
  { titleKey: 'terms.s5.title', bodyKeys: ['terms.s5.p1', 'terms.s5.p2'] },
  { titleKey: 'terms.s6.title', bodyKeys: ['terms.s6.p1'] },
  { titleKey: 'terms.s7.title', bodyKeys: ['terms.s7.p1'] },
  { titleKey: 'terms.s8.title', bodyKeys: ['terms.s8.p1', 'terms.s8.p2'] },
  { titleKey: 'terms.s9.title', bodyKeys: ['terms.s9.p1'] },
];

export default function TermsScreen({ navigation }) {
  const { t } = useI18n();
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader
        title={t('terms.title')}
        onBack={navigation?.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Text style={styles.heading} accessibilityRole="header">{t('terms.heading')}</Text>
          <Text style={styles.updated}>{t('terms.updated', { date: formatDate(`${LAST_UPDATED}T12:00:00`, { year: 'numeric', month: 'long', day: 'numeric' }) })}</Text>

          {SECTIONS.map((s) => (
            <View key={s.titleKey} style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{t(s.titleKey)}</Text>
              {s.bodyKeys.map((key) => (
                <Text key={key} style={styles.para}>{t(key)}</Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textDark, letterSpacing: -0.3 },
  updated: { fontSize: 12.5, color: colors.textLight, fontWeight: '600', marginTop: 6, marginBottom: 18 },
  section: {
    backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight,
    padding: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 15.5, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  para: { fontSize: 14, lineHeight: 21, color: colors.textMid, marginBottom: 6 },
});
