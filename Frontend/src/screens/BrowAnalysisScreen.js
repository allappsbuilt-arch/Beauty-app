import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const FACE_FRAME_URI = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=60&sat=-100';

const STYLES = [
  { key: 'natural',  label: 'Natural Arch',  uri: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=60' },
  { key: 'feathered', label: 'Feathered',     uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=60' },
  { key: 'bold',      label: 'Bold & Defined',uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=60' },
  { key: 'straight',  label: 'Straight Soft', uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=60' },
  { key: 'high',      label: 'High Arch',     uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=60' },
  { key: 'soft',      label: 'Soft Textured', uri: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=60' },
];

function StyleCard({ style, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[cards.card, selected && cards.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={style.label}
    >
      <Image source={{ uri: style.uri }} style={cards.image} resizeMode="cover" />
      {selected && (
        <View style={cards.checkBadge}>
          <Ionicons name="checkmark" size={13} color={colors.white} />
        </View>
      )}
      <View style={cards.captionWrap}>
        <Text style={cards.caption}>{style.label.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}
const cards = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.white,
  },
  cardSelected: { borderColor: colors.primary },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.sectionBg },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  captionWrap: { paddingVertical: 10, alignItems: 'center' },
  caption: { fontSize: 11, fontWeight: '800', color: colors.textDark, letterSpacing: 0.6 },
});

export default function BrowAnalysisScreen({ navigation }) {
  const [selected, setSelected] = useState('natural');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>MyFace AI</Text>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.popToTop()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Face frame */}
        <View style={styles.frameCard}>
          <Image source={{ uri: FACE_FRAME_URI }} style={styles.frameImage} resizeMode="cover" />
          <View style={styles.frameOverlay} pointerEvents="none">
            <View style={styles.crosshairH} />
            <View style={styles.frameBox} />
          </View>
          <TouchableOpacity
            style={styles.analyzeBtn}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Analyze my face"
          >
            <Text style={styles.analyzeBtnText}>Analyze My Face</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.frameCaption}>Position your face within the frame</Text>

        {/* Generate button */}
        <TouchableOpacity
          style={styles.generateBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Generate AI brow styles"
        >
          <Ionicons name="sparkles" size={16} color={colors.white} />
          <Text style={styles.generateBtnText}>Generate AI Brow Styles</Text>
        </TouchableOpacity>

        {/* Style recommendations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Style Recommendations</Text>
          <View style={styles.optionsBadge}>
            <Text style={styles.optionsBadgeText}>{STYLES.length} OPTIONS</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {STYLES.map(s => (
            <StyleCard key={s.key} style={s} selected={selected === s.key} onPress={() => setSelected(s.key)} />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.planBtn}
          activeOpacity={0.85}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Build my brow plan"
        >
          <Text style={styles.planBtnText}>Build My Brow Plan</Text>
          <Ionicons name="trending-up" size={16} color={colors.white} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { flex: 1 },
  content: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  frameCard: {
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.sectionBg,
  },
  frameImage: { width: '100%', aspectRatio: 0.85, opacity: 0.9 },
  frameOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  crosshairH: {
    position: 'absolute', left: '10%', right: '10%', top: '48%',
    height: 1, backgroundColor: 'rgba(192,64,90,0.45)',
  },
  frameBox: {
    width: '70%', height: '80%',
    borderWidth: 1.5, borderColor: 'rgba(192,64,90,0.35)',
    borderRadius: 12,
  },
  analyzeBtn: {
    position: 'absolute', bottom: 18, alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingHorizontal: 24, paddingVertical: 12,
    shadowColor: colors.primary, shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  analyzeBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  frameCaption: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 10, marginBottom: 18 },

  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 100, paddingVertical: 15,
    marginBottom: 22,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  generateBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  optionsBadge: {
    backgroundColor: colors.primaryPale, borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.accentDark,
  },
  optionsBadgeText: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 22 },

  planBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 100, paddingVertical: 16,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  planBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
});
