import React, { useState } from 'react';
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

const PERSONALITIES = [
  {
    key: 'motivational',
    icon: 'flash',
    color: colors.primary,
    bg: colors.primaryPale,
    label: 'Motivational',
    sample: '"Push your limits today! Your 3-day streak is waiting to become 4. Let\'s get moving!"',
  },
  {
    key: 'gentle',
    icon: 'leaf',
    color: '#1EA868',
    bg: '#E7F7EE',
    label: 'Gentle',
    sample: '"Whenever you\'re ready, let\'s take a small step forward together today. No pressure."',
  },
  {
    key: 'clinical',
    icon: 'flask',
    color: '#8870C0',
    bg: '#F0EEFF',
    label: 'Clinical',
    sample: '"Scheduled activity reminder: Engagement required to maintain metabolic rhythm and focus."',
  },
  {
    key: 'witty',
    icon: 'happy',
    color: colors.primary,
    bg: colors.primaryPale,
    label: 'Witty',
    sample: '"Your streak called. It misses you. Don\'t ghost your progress, it\'s a bad look."',
  },
];

function PersonalityCard({ item, active, onPress }) {
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
          <Text style={styles.cardLabel}>{item.label}</Text>
        </View>
        {active && (
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>ACTIVE</Text>
          </View>
        )}
      </View>
      <View style={styles.sampleBox}>
        <View style={styles.sampleHeader}>
          <Ionicons name="notifications-outline" size={12} color={colors.textLight} />
          <Text style={styles.sampleLabel}>Sample Notification</Text>
        </View>
        <Text style={styles.sampleText}>{item.sample}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CoachStyleScreen({ navigation }) {
  const [active, setActive] = useState('motivational');
  const [dailyReminders, setDailyReminders] = useState(true);
  const [morningInsight, setMorningInsight] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="Coach Style"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Personality</Text>
        <Text style={styles.subheading}>
          Choose how MyFace AI interacts with you and encourages your daily routine.
        </Text>

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

        <Text style={styles.heading}>Frequency</Text>
        <View style={styles.freqCard}>
          <View style={styles.freqRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.freqLabel}>Daily Reminders</Text>
              <Text style={styles.freqSub}>Three times per day</Text>
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
              <Text style={styles.freqLabel}>Morning Insight</Text>
              <Text style={styles.freqSub}>Sent at 8:00 AM</Text>
            </View>
            <Switch
              value={morningInsight}
              onValueChange={setMorningInsight}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Save preferences"
        >
          <Text style={styles.saveBtnText}>Save Preferences</Text>
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
