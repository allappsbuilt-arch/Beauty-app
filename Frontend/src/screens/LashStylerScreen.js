import React from 'react';
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
import { useSavedChoice } from '../api/usePreferences';

const FACE_URI = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=60&sat=-100';

const STYLES = [
  { key: 'natural',   label: 'Natural Full',   uri: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=300&q=60' },
  { key: 'wispy',      label: 'Wispy',          uri: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=300&q=60' },
  { key: 'cateye',     label: 'Cat Eye',        uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=60' },
  { key: 'megavolume', label: 'Mega Volume',    uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=60' },
  { key: 'lifted',     label: 'Lifted & Curled',uri: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=60' },
  { key: 'spiderlash', label: 'Spiderlash',     uri: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=60' },
];

function StyleCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[cards.card, selected && cards.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <Image source={{ uri: item.uri }} style={cards.image} resizeMode="cover" />
      <View style={cards.captionWrap}>
        <Text style={cards.caption}>{item.label.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}
const cards = StyleSheet.create({
  card: {
    flex: 1, margin: 6, borderRadius: 14, overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent', backgroundColor: colors.white,
  },
  cardSelected: { borderColor: colors.primary },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.sectionBg },
  captionWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 8, alignItems: 'center',
  },
  caption: { fontSize: 11, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },
});

function Header() {
  return (
    <View style={styles.faceCard}>
      <Image source={{ uri: FACE_URI }} style={styles.faceImage} resizeMode="cover" />
      <View style={styles.detectedPill}>
        <Ionicons name="happy-outline" size={13} color={colors.white} />
        <Text style={styles.detectedText}>FACE DETECTED</Text>
      </View>
    </View>
  );
}

export default function LashStylerScreen({ navigation }) {
  const [selected, setSelected] = useSavedChoice('styles', 'lash', 'natural');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MyFace AI</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.popToTop()}
          accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={STYLES}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 10 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Header />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose Your Look</Text>
              <Text style={styles.sectionCount}>{STYLES.length} Options</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <StyleCard item={item} selected={selected === item.key} onPress={() => setSelected(item.key)} />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyBtn}
              activeOpacity={0.85}
              onPress={() => navigation?.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Apply look"
            >
              <Ionicons name="sparkles" size={16} color={colors.white} />
              <Text style={styles.applyBtnText}>Apply Look</Text>
            </TouchableOpacity>
            <Text style={styles.footerCaption}>
              Tap any style to preview the AI visualizer in real-time.
            </Text>
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

  faceCard: {
    marginHorizontal: 16, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  faceImage: { width: '100%', aspectRatio: 1.05, backgroundColor: colors.sectionBg },
  detectedPill: {
    position: 'absolute', bottom: 14, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  detectedText: { fontSize: 11, fontWeight: '800', color: colors.white, letterSpacing: 0.6 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginTop: 20, marginBottom: 4,
  },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: colors.textDark },
  sectionCount: { fontSize: 13, fontWeight: '700', color: colors.primary },

  footer: { marginHorizontal: 16, marginTop: 14, alignItems: 'center' },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 15,
    width: '100%',
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  applyBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  footerCaption: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 12, lineHeight: 17 },
});
