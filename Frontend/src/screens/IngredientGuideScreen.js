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
import ErrorBanner from '../components/ErrorBanner';
import { notify, shareText } from '../utils/feedback';
import { useApiData } from '../api/useApiData';

const AVATAR_COLORS = ['#1EA868', '#7A5CD0', '#D06090'];

function RecommendedCard({ item, onPress }) {
  return (
    <TouchableOpacity style={rec.card} onPress={onPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`Analyse ${item.name}`}>
      <Image source={{ uri: item.uri }} style={rec.image} resizeMode="cover" />
      <Text style={rec.name} numberOfLines={1}>{item.name}</Text>
      <Text style={rec.brand}>{item.brand}</Text>
      <View style={rec.ratingRow}>
        <Ionicons name="star" size={12} color="#1EA868" />
        <Text style={rec.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );
}
const rec = StyleSheet.create({
  card: { width: 130, marginRight: 12 },
  image: { width: '100%', height: 100, borderRadius: 14, backgroundColor: colors.sectionBg, marginBottom: 8 },
  name: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  brand: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 11.5, fontWeight: '700', color: colors.textMid },
});

function PastIngredientRow({ item, index, isLast }) {
  const when = item.weeksAgo === 1 ? 'Last week' : `${item.weeksAgo} weeks ago`;
  return (
    <TouchableOpacity
      style={[past.row, !isLast && past.rowBorder]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={() => notify(item.name, item.benefits)}
    >
      <View style={[past.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
        <Text style={past.avatarText}>{item.name[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={past.name}>{item.name}</Text>
        <Text style={past.meta}>{when} · {item.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />
    </TouchableOpacity>
  );
}
const past = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  avatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800', color: colors.white },
  name: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  meta: { fontSize: 11.5, color: colors.textLight, marginTop: 2 },
});

export default function IngredientGuideScreen({ navigation }) {
  const { data, error, reload } = useApiData('/api/products/ingredient-guide');
  const featured = data?.featured;
  const pastIngredients = data?.past ?? [];

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
        data={pastIngredients}
        keyExtractor={(p) => p.key}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=60' }}
              style={styles.heroImage}
              resizeMode="cover"
            />

            <ErrorBanner message={error} onRetry={reload} />

            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>INGREDIENT OF THE WEEK</Text>
                <Text style={styles.title}>{featured?.name ?? '…'}</Text>
              </View>
              {!!featured && (
                <View style={styles.hydrationPill}>
                  <Text style={styles.hydrationPillText}>{featured.category}</Text>
                </View>
              )}
            </View>

            <Text style={styles.paragraph}>{featured?.summary}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={16} color="#1EA868" style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Key Benefits</Text>
                <Text style={styles.infoText}>{featured?.benefits}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="body-outline" size={16} color={colors.primary} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Best for Skin Types</Text>
                <Text style={styles.infoText}>{featured?.skinTypes}</Text>
              </View>
            </View>

            <View style={styles.mythCard}>
              <View style={styles.mythHeader}>
                <Ionicons name="bulb" size={16} color="#C47800" />
                <Text style={styles.mythLabel}>Myth Buster</Text>
              </View>
              <Text style={styles.mythQuote}>{featured ? `"${featured.myth.claim}"` : ''}</Text>
              <Text style={styles.mythFalse}>False.</Text>
              <Text style={styles.mythExplain}>{featured?.myth.truth}</Text>
            </View>

            <View style={styles.recHeader}>
              <Text style={styles.sectionTitle}>Top Recommended</Text>
              <TouchableOpacity onPress={() => navigation?.navigate('ProductShelf')} accessibilityRole="button" accessibilityLabel="See all recommended products">
                <Text style={styles.seeAll}>SEE ALL</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={data?.recommended ?? []}
              keyExtractor={(r) => r.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 20 }}
              renderItem={({ item }) => (
                <RecommendedCard item={item} onPress={() => navigation?.navigate('IngredientScanner', { productKey: item.key })} />
              )}
            />

            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Share ingredient guide"
              onPress={() => featured && shareText(`Ingredient of the week on BeautyApp: ${featured.name} — ${featured.benefits}`)}
            >
              <Ionicons name="share-social-outline" size={16} color={colors.white} />
              <Text style={styles.shareBtnText}>Share Ingredient Guide</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Past Ingredients</Text>
          </>
        }
        renderItem={({ item, index }) => (
          <PastIngredientRow item={item} index={index} isLast={index === pastIngredients.length - 1} />
        )}
        ListFooterComponent={<View style={{ height: 24 }} />}
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

  heroImage: { width: '100%', height: 160, backgroundColor: colors.sectionBg, marginBottom: 16 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 12 },
  eyebrow: { fontSize: 10.5, fontWeight: '800', color: colors.primary, letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4 },
  hydrationPill: { backgroundColor: '#DCEBFA', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  hydrationPillText: { fontSize: 10, fontWeight: '800', color: '#2870B0', letterSpacing: 0.4 },

  paragraph: { fontSize: 14, lineHeight: 21, color: colors.textMid, marginHorizontal: 16, marginBottom: 18 },

  infoRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 14 },
  infoLabel: { fontSize: 13.5, fontWeight: '800', color: colors.textDark, marginBottom: 2 },
  infoText: { fontSize: 12.5, lineHeight: 18, color: colors.textLight },

  mythCard: {
    backgroundColor: colors.alertBg, borderRadius: 16,
    marginHorizontal: 16, marginTop: 8, marginBottom: 22, padding: 16,
    borderWidth: 1, borderColor: colors.alertBorder,
  },
  mythHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  mythLabel: { fontSize: 14, fontWeight: '800', color: colors.alertText },
  mythQuote: { fontSize: 13, fontStyle: 'italic', color: colors.alertTextLight, marginBottom: 8, lineHeight: 19 },
  mythFalse: { fontSize: 13, fontWeight: '800', color: '#D03050', marginBottom: 6 },
  mythExplain: { fontSize: 12.5, lineHeight: 18, color: colors.alertTextLight },

  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginBottom: 12 },
  seeAll: { fontSize: 11.5, fontWeight: '800', color: colors.primary, letterSpacing: 0.4, marginBottom: 12 },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 15,
    marginHorizontal: 16,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  shareBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
});
