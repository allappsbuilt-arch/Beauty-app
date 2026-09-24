import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { shareText } from '../utils/feedback';
import { useApiData } from '../api/useApiData';

const SORTS = ['Similarity', 'Price: Low to High', 'Rating'];
const SORT_PARAM = { Similarity: 'similarity', 'Price: Low to High': 'price', Rating: 'rating' };
const money = (n) => `$${Number(n).toFixed(2)}`;

function SortChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[chip.wrap, active && chip.wrapActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[chip.text, active && chip.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
const chip = StyleSheet.create({
  wrap: {
    borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
  },
  wrapActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 12.5, fontWeight: '700', color: colors.textMid },
  textActive: { color: colors.white },
});

function Stars({ count }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <Ionicons key={i} name={i < Math.round(count) ? 'star' : 'star-outline'} size={13} color="#1EA868" />
      ))}
    </View>
  );
}

function MatchCard({ item, onPress }) {
  return (
    <View style={card.wrap}>
      <View style={card.imageWrap}>
        <Image source={{ uri: item.uri }} style={card.image} resizeMode="cover" />
        <View style={card.saveBadge}>
          <Text style={card.saveBadgeText}>Save {money(item.save)}</Text>
        </View>
        <TouchableOpacity style={card.shareBtn} onPress={() => shareText(`${item.name} by ${item.brand} (${money(item.price)}) — a ${item.match}% formula match dupe, found on BeautyApp`)} accessibilityRole="button" accessibilityLabel="Share">
          <Ionicons name="share-social-outline" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={card.body}>
        <View style={card.titleRow}>
          <Text style={card.name}>{item.name}</Text>
          <View style={card.matchPill}>
            <Text style={card.matchPillText}>{item.match}% Match</Text>
          </View>
        </View>
        <Text style={card.brand}>{item.brand} · {money(item.price)} · {item.size}</Text>

        <Text style={card.simLabel}>Formula Similarity</Text>
        <View style={card.simBar}>
          <View style={[card.simFill, { width: `${item.similarity * 100}%` }]} />
        </View>

        <View style={card.footer}>
          <Stars count={item.rating} />
          <Text style={card.reviews}>{item.rating} rating</Text>
          <TouchableOpacity style={card.shopBtn} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Reviews for ${item.name}`}>
            <Text style={card.shopBtnText}>Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const card = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white, borderRadius: 18, marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.06,
    shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 150, backgroundColor: colors.sectionBg },
  saveBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: '#1EA868', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4,
  },
  saveBadgeText: { fontSize: 10.5, fontWeight: '800', color: colors.white },
  shareBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
  },
  body: { padding: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { flex: 1, fontSize: 15.5, fontWeight: '800', color: colors.textDark, marginRight: 8 },
  matchPill: { backgroundColor: colors.primaryPale, borderRadius: 100, paddingHorizontal: 9, paddingVertical: 3 },
  matchPillText: { fontSize: 10.5, fontWeight: '800', color: colors.primary },
  brand: { fontSize: 12, color: colors.textLight, marginBottom: 10 },
  simLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint, marginBottom: 5 },
  simBar: { height: 5, borderRadius: 3, backgroundColor: colors.sectionBg, overflow: 'hidden', marginBottom: 12 },
  simFill: { height: 5, borderRadius: 3, backgroundColor: colors.primary },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviews: { flex: 1, fontSize: 11, color: colors.textLight },
  shopBtn: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8 },
  shopBtnText: { fontSize: 12.5, fontWeight: '800', color: colors.white },
});

export default function DupeFinderScreen({ navigation, route }) {
  const productKey = route?.params?.productKey ?? 'luxe';
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Similarity');

  // Only hit the server once typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, error, reload } = useApiData(
    `/api/products/${productKey}/dupes?sort=${SORT_PARAM[sort]}&q=${encodeURIComponent(query)}`
  );
  const original = data?.original;
  const matches = data?.matches ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MyFace AI</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={matches}
        keyExtractor={(m) => m.key}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={17} color={colors.textPlaceholder} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for more dupes..."
                placeholderTextColor={colors.textPlaceholder}
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Search for more dupes"
              />
            </View>

            <ErrorBanner message={error} onRetry={reload} />

            <Text style={styles.eyebrow}>ORIGINAL PRODUCT</Text>
            <View style={styles.originalCard}>
              <Image
                source={{ uri: original?.uri }}
                style={styles.originalImage}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.originalName}>{original?.name ?? '…'}</Text>
                <Text style={styles.originalMeta}>{original ? `${original.brand} · ${money(original.price)} · ${original.size}` : ''}</Text>
                <View style={styles.originalRating}>
                  <Ionicons name="star" size={13} color="#1EA868" />
                  <Text style={styles.originalRatingText}>{original?.rating ?? '—'}</Text>
                </View>
              </View>
            </View>

            <FlatList
              data={SORTS}
              keyExtractor={(s) => s}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginTop: 18, marginBottom: 18 }}
              renderItem={({ item }) => (
                <SortChip label={item} active={sort === item} onPress={() => setSort(item)} />
              )}
            />

            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>Top Matches</Text>
              <Text style={styles.resultsCount}>{matches.length} {matches.length === 1 ? 'Result' : 'Results'} Found</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <MatchCard item={item} onPress={() => navigation?.navigate('ProductReviews', { productKey: item.key })} />
        )}
        ListEmptyComponent={data ? <Text style={styles.resultsCount}>No cheaper dupes match your search.</Text> : null}
        ListFooterComponent={<View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingBottom: 24, paddingHorizontal: 16 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.white, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    marginTop: 6, marginBottom: 20,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textDark },

  eyebrow: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 1, marginBottom: 10 },
  originalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  originalImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.sectionBg },
  originalName: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  originalMeta: { fontSize: 12, color: colors.textLight, marginTop: 3 },
  originalRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  originalRatingText: { fontSize: 12, fontWeight: '700', color: colors.textMid },

  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginBottom: 12 },
  resultsCount: { fontSize: 12.5, fontWeight: '700', color: '#1EA868', marginBottom: 12 },
});
