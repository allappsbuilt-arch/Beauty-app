import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const PREVIEWS = [
  { key: 'skincare', icon: 'leaf', label: 'Skincare', name: 'Daily Glow', color: '#1EA868', bg: '#E7F7EE', category: 'Skin' },
  { key: 'haircare', icon: 'sunny', label: 'Haircare', name: 'Curl Love', color: '#8870C0', bg: '#F0EEFF', category: null },
];

export default function MyCommunitiesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="My Communities"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.illustration}>
            <Ionicons name="people-outline" size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>Find Your Community</Text>
          <Text style={styles.desc}>
            Join a group of users with similar skin or hair goals to share tips, streaks, and progress.
          </Text>

          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate('Communities')}
            accessibilityRole="button"
            accessibilityLabel="Discover communities"
          >
            <Text style={styles.ctaText}>Discover Communities</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewRow}>
          {PREVIEWS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={styles.previewCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation?.navigate('Communities', p.category ? { initialCategory: p.category } : undefined)
              }
              accessibilityRole="button"
              accessibilityLabel={`${p.label}: ${p.name}`}
            >
              <View style={[styles.previewIcon, { backgroundColor: p.bg }]}>
                <Ionicons name={p.icon} size={20} color={p.color} />
              </View>
              <Text style={styles.previewLabel}>{p.label}</Text>
              <Text style={styles.previewName}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12 },

  hero: { alignItems: 'center', marginBottom: 28 },
  illustration: {
    width: 160, height: 160, borderRadius: 80, marginBottom: 24,
    borderWidth: 2, borderColor: colors.borderLight, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: 10 },
  desc: { fontSize: 14, color: colors.textMid, textAlign: 'center', lineHeight: 21, marginBottom: 24, paddingHorizontal: 8 },

  cta: {
    alignSelf: 'stretch', backgroundColor: colors.primary, borderRadius: 100,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  ctaText: { color: colors.white, fontSize: 15.5, fontWeight: '800' },

  previewRow: { flexDirection: 'row', gap: 12 },
  previewCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  previewIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  previewLabel: { fontSize: 11.5, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  previewName: { fontSize: 15, fontWeight: '800', color: colors.textDark },
});
