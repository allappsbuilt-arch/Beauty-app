import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const LOOKS = [
  { key: 'golden',    label: 'Golden Hour',   uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=60', recommended: true },
  { key: 'classic',    label: 'Classic Bold',  uri: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=60' },
  { key: 'midnight',   label: 'Midnight Bloom',uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=60' },
  { key: 'dew',        label: 'Natural Dew',   uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=60' },
  { key: 'pearl',      label: 'Euphoric Pearl',uri: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=60' },
  { key: 'cyber',      label: 'Cyber Rose',    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=60' },
];

function LookCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[cards.card, selected && cards.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <Image source={{ uri: item.uri }} style={cards.image} resizeMode="cover" />
      {selected && (
        <View style={cards.checkBadge}>
          <Ionicons name="checkmark" size={13} color={colors.white} />
        </View>
      )}
      <View style={cards.captionWrap}>
        <Text style={cards.caption}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );
}
const cards = StyleSheet.create({
  card: { flex: 1, margin: 6, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.white, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: colors.primary },
  image: { width: '100%', aspectRatio: 0.9, backgroundColor: colors.sectionBg },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  captionWrap: { paddingVertical: 9, alignItems: 'center' },
  caption: { fontSize: 12, fontWeight: '700', color: colors.textDark },
});

export default function MakeupResultsScreen({ navigation }) {
  const [selected, setSelected] = useState('golden');
  const selectedLook = LOOKS.find(l => l.key === selected);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MyFace AI</Text>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navIconBtn} accessibilityRole="button" accessibilityLabel="Download">
            <Ionicons name="download-outline" size={19} color={colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconBtn} accessibilityRole="button" accessibilityLabel="Delete">
            <Ionicons name="trash-outline" size={19} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={LOOKS}
        keyExtractor={(l) => l.key}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 10 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>AI GENERATION</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Your Results</Text>
              <Text style={styles.count}>{LOOKS.length} Looks</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <LookCard item={item} selected={selected === item.key} onPress={() => setSelected(item.key)} />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.recCard}>
              <Ionicons name="sparkles" size={16} color={colors.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.recText}>
                Based on your face shape, <Text style={{ fontWeight: '800', color: colors.primary }}>{selectedLook?.label}</Text> enhances your features most naturally.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.tutorialBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Start tutorial"
            >
              <Ionicons name="play-circle-outline" size={17} color={colors.white} />
              <Text style={styles.tutorialBtnText}>Start Tutorial</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingBottom: 24 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  navRight: { flexDirection: 'row', gap: 4 },
  navIconBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },

  headerBlock: { marginHorizontal: 16, marginTop: 8, marginBottom: 16 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 1.2, marginBottom: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4 },
  count: { fontSize: 13, fontWeight: '700', color: colors.primary },

  footer: { marginHorizontal: 16, marginTop: 10 },
  recCard: {
    backgroundColor: colors.primaryPale, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
  },
  recText: { fontSize: 13, lineHeight: 19, color: colors.textMid },

  tutorialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  tutorialBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
});
