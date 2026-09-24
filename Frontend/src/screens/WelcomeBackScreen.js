import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const QUOTE_URI = 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=700&q=60';

export default function WelcomeBackScreen({ navigation }) {
  const [frozen, setFrozen] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="MyFace AI"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Welcome Back, Alex!</Text>
        <Text style={styles.subheading}>
          Consistency is a journey, not a destination. Let's pick up where we left off.
        </Text>

        {/* ── Last active streak ── */}
        <View style={styles.streakCard}>
          <View>
            <Text style={styles.streakLabel}>LAST ACTIVE STREAK</Text>
            <Text style={styles.streakValue}>14 Days</Text>
          </View>
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={22} color={colors.white} />
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Ionicons name="stopwatch-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>12.5h</Text>
            <Text style={styles.statLabel}>Total Routine Time</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="barbell-outline" size={20} color="#1EA868" />
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>Sessions Completed</Text>
          </View>
        </View>

        {/* ── Quote photo card ── */}
        <View style={styles.quoteCard}>
          <Image source={{ uri: QUOTE_URI }} style={styles.quoteImage} resizeMode="cover" />
          <View style={styles.quoteOverlay} />
          <Text style={styles.quoteText}>"Every morning is a new opportunity to grow."</Text>
        </View>

        {/* ── Reassurance tip ── */}
        <View style={styles.tipCard}>
          <Ionicons name="heart-outline" size={20} color="#8870C0" />
          <Text style={styles.tipText}>
            Life happens, and that's okay. Your progress is still here waiting for you. No pressure, just progress.
          </Text>
        </View>

        {/* ── Actions ── */}
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('Tabs', { screen: 'Routine' })}
          accessibilityRole="button"
          accessibilityLabel="Fresh start"
        >
          <Text style={styles.primaryBtnText}>Fresh Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, frozen && styles.secondaryBtnDone]}
          activeOpacity={0.85}
          onPress={() => setFrozen(true)}
          disabled={frozen}
          accessibilityRole="button"
          accessibilityLabel="Use streak freeze"
        >
          <Ionicons
            name={frozen ? 'checkmark-circle' : 'snow-outline'}
            size={18}
            color={frozen ? '#1EA868' : colors.primary}
          />
          <Text style={[styles.secondaryBtnText, frozen && styles.secondaryBtnTextDone]}>
            {frozen ? 'Streak Freeze Applied' : 'Use Streak Freeze'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },

  heading: { fontSize: 26, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4 },
  subheading: { fontSize: 14.5, color: colors.textMid, lineHeight: 21, marginTop: 8, marginBottom: 22 },

  streakCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  streakLabel: { fontSize: 11.5, fontWeight: '800', color: colors.textFaint, letterSpacing: 1 },
  streakValue: { fontSize: 24, fontWeight: '800', color: colors.textDark, marginTop: 4 },
  streakIcon: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F0803C',
  },

  statRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.textDark, letterSpacing: -0.3 },
  statLabel: { fontSize: 12, color: colors.textLight, fontWeight: '600' },

  quoteCard: {
    marginTop: 16, borderRadius: 18, overflow: 'hidden', height: 200, justifyContent: 'flex-end',
  },
  quoteImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  quoteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,10,14,0.35)' },
  quoteText: { color: colors.white, fontSize: 16, fontWeight: '700', fontStyle: 'italic', padding: 18, lineHeight: 22 },

  tipCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: 16, padding: 16, marginTop: 16,
  },
  tipText: { flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.textMid },

  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16,
    alignItems: 'center', marginTop: 22,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '800' },

  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 100, paddingVertical: 15, marginTop: 12,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  secondaryBtnDone: { borderColor: '#1EA868', backgroundColor: '#E7F7EE' },
  secondaryBtnText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  secondaryBtnTextDone: { color: '#1EA868' },
});
