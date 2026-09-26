import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { usePreferences } from '../api/usePreferences';
import { useI18n } from '../i18n';

const PERSONALITIES = [
  {
    key: 'motivational',
    icon: 'flash',
    color: colors.primary,
    bg: colors.primaryPale,
    labelKey: 'coachStyle.motivational',
    sampleKey: 'coachStyle.motivationalSample',
  },
  {
    key: 'gentle',
    icon: 'leaf',
    color: '#1EA868',
    bg: '#E7F7EE',
    labelKey: 'coachStyle.gentle',
    sampleKey: 'coachStyle.gentleSample',
  },
  {
    key: 'clinical',
    icon: 'flask',
    color: '#8870C0',
    bg: '#F0EEFF',
    labelKey: 'coachStyle.clinical',
    sampleKey: 'coachStyle.clinicalSample',
  },
  {
    key: 'witty',
    icon: 'happy',
    color: colors.primary,
    bg: colors.primaryPale,
    labelKey: 'coachStyle.witty',
    sampleKey: 'coachStyle.wittySample',
  },
];

function PersonalityCard({ item, active, onPress }) {
  const { t } = useI18n();
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.cardIcon, { backgroundColor: item.bg }]}>
            <Ionicons name={item.icon} size={18} color={item.color} />
          </View>
          <Text style={styles.cardLabel}>{t(item.labelKey)}</Text>
        </View>
        {active && (
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>{t('coachStyle.active')}</Text>
          </View>
        )}
      </View>
      <View style={styles.sampleBox}>
        <View style={styles.sampleHeader}>
          <Ionicons name="notifications-outline" size={12} color={colors.textLight} />
          <Text style={styles.sampleLabel}>{t('coachStyle.sampleLabel')}</Text>
        </View>
        <Text style={styles.sampleText}>{t(item.sampleKey)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CoachStyleScreen({ navigation }) {
  const { prefs, error, reload, save, saving } = usePreferences();
  const { t } = useI18n();
  const [active, setActive] = useState('motivational');
  const [dailyReminders, setDailyReminders] = useState(true);
  const [morningInsight, setMorningInsight] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Start from the saved values once they load.
  const saved = prefs?.coachStyle;
  useEffect(() => {
    if (!saved) return;
    setActive(saved.personality);
    setDailyReminders(saved.dailyReminders);
    setMorningInsight(saved.morningInsight);
  }, [saved?.personality, saved?.dailyReminders, saved?.morningInsight]);

  const handleSave = async () => {
    setSaveError(null);
    try {
      await save({ coachStyle: { personality: active, dailyReminders, morningInsight } });
      navigation?.goBack();
    } catch (err) {
      setSaveError(err.message || t('coachStyle.saveFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title={t('coachStyle.title')}
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} onRetry={reload} />
        <Text style={styles.heading}>{t('coachStyle.personality')}</Text>
        <Text style={styles.subheading}>{t('coachStyle.personalitySub')}</Text>

        <View style={styles.cardList}>
          {PERSONALITIES.map((item) => (
            <PersonalityCard
              key={item.key}
              item={item}
              active={active === item.key}
              onPress={() => setActive(item.key)}
            />
          ))}
        </View>

        <Text style={styles.heading}>{t('coachStyle.frequency')}</Text>
        <View style={styles.freqCard}>
          <View style={styles.freqRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.freqLabel}>{t('coachStyle.dailyReminders')}</Text>
              <Text style={styles.freqSub}>{t('coachStyle.dailyRemindersSub')}</Text>
            </View>
            <Switch
              value={dailyReminders}
              onValueChange={setDailyReminders}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.freqDivider} />
          <View style={styles.freqRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.freqLabel}>{t('coachStyle.morningInsight')}</Text>
              <Text style={styles.freqSub}>{t('coachStyle.morningInsightSub')}</Text>
            </View>
            <Switch
              value={morningInsight}
              onValueChange={setMorningInsight}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <ErrorBanner message={saveError} onDismiss={() => setSaveError(null)} />
        <TouchableOpacity
          style={[styles.saveBtn, (saving || !prefs) && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving || !prefs}
          accessibilityRole="button"
          accessibilityLabel={t('coachStyle.saveA11y')}
        >
          <Text style={styles.saveBtnText}>{saving ? t('common.saving') : t('coachStyle.save')}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },

  heading: { fontSize: 22, fontWeight: '800', color: colors.textDark, marginBottom: 6 },
  subheading: { fontSize: 13.5, color: colors.textMid, lineHeight: 20, marginBottom: 18 },

  cardList: { gap: 14, marginBottom: 28 },
  card: {
    backgroundColor: colors.white, borderRadius: 18, padding: 16,
    borderWidth: 1.5, borderColor: colors.borderLight,
  },
  cardActive: { borderColor: colors.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  activePill: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  activePillText: { fontSize: 10, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },

  sampleBox: { backgroundColor: colors.sectionBg, borderRadius: 12, padding: 12 },
  sampleHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  sampleLabel: { fontSize: 10.5, fontWeight: '800', color: colors.textLight, letterSpacing: 0.4, textTransform: 'uppercase' },
  sampleText: { fontSize: 13, lineHeight: 19, color: colors.textMid, fontStyle: 'italic' },

  freqCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 4,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 24,
  },
  freqRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
  freqLabel: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  freqSub: { fontSize: 12, color: colors.textLight, fontWeight: '500', marginTop: 2 },
  freqDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderUltraLight, marginHorizontal: 14 },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
