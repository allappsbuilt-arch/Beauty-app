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

const FILTERS = ['Skin Type', 'Concern', 'Age Group'];
const SORTS = ['Most Helpful', 'Recent'];

const REVIEWS = [
  {
    key: 'anna', initials: 'AM', color: '#5A3070', name: 'Anna M.', verified: true,
    meta: 'Oily Skin · 25-34 · 3 Weeks Use', scanScore: '+14%', rating: 5,
    text: "Finally found a serum that doesn't break me out! My MyFace AI scan shows my redness has significantly decreased since I started using this. The texture is lightweight and absorbs instantly.",
    helpful: 24,
  },
  {
    key: 'james', initials: 'JK', color: '#C89AE0', name: 'James K.', verified: true,
    meta: 'Dry Skin · 35-44 · 2 Months Use', scanScore: '+22%', rating: 4,
    text: 'Great hydration levels. My scan results for elasticity have gone up 22 points which is incredible for a 45-day period. The only downside is the price point, but it delivers results.',
    helpful: 12,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=60',
  },
];

function FilterDropdown({ label }) {
  return (
    <TouchableOpacity style={dd.wrap} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={dd.text}>{label}</Text>
      <Ionicons name="chevron-down" size={14} color={colors.textMid} />
    </TouchableOpacity>
  );
}
const dd = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  text: { fontSize: 12.5, fontWeight: '600', color: colors.textMid },
});

function SortTab({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[sort.wrap, active && sort.wrapActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[sort.text, active && sort.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
const sort = StyleSheet.create({
  wrap: { borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: colors.sectionBg },
  wrapActive: { backgroundColor: colors.primary },
  text: { fontSize: 12.5, fontWeight: '700', color: colors.textMid },
  textActive: { color: colors.white },
});

function Stars({ count }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <Ionicons key={i} name={i < count ? 'star' : 'star-outline'} size={14} color="#F0A800" />
      ))}
    </View>
  );
}

function ReviewCard({ item }) {
  return (
    <View style={rev.card}>
      <View style={rev.header}>
        <View style={[rev.avatar, { backgroundColor: item.color }]}>
          <Text style={rev.avatarText}>{item.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={rev.nameRow}>
            <Text style={rev.name}>{item.name}</Text>
            {item.verified && (
              <View style={rev.verifiedPill}>
                <Ionicons name="shield-checkmark" size={10} color={colors.primary} />
                <Text style={rev.verifiedText}>VERIFIED</Text>
              </View>
            )}
          </View>
          <Text style={rev.meta}>{item.meta}</Text>
        </View>
        <View style={rev.scoreBlock}>
          <Text style={rev.scoreLabel}>SCAN SCORE</Text>
          <Text style={rev.scoreValue}>{item.scanScore}</Text>
        </View>
      </View>

      <Stars count={item.rating} />

      <Text style={rev.text}>{item.text}</Text>

      {item.image && <Image source={{ uri: item.image }} style={rev.image} resizeMode="cover" />}

      <View style={rev.footer}>
        <TouchableOpacity style={rev.footerBtn} accessibilityRole="button" accessibilityLabel="Helpful">
          <Ionicons name="thumbs-up-outline" size={14} color={colors.textMid} />
          <Text style={rev.footerBtnText}>Helpful ({item.helpful})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rev.footerBtn} accessibilityRole="button" accessibilityLabel="Reply">
          <Ionicons name="chatbubble-outline" size={14} color={colors.textMid} />
          <Text style={rev.footerBtnText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const rev = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 12.5, fontWeight: '800', color: colors.white },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 14, fontWeight: '800', color: colors.textDark },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primaryPale, borderRadius: 100, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText: { fontSize: 8.5, fontWeight: '800', color: colors.primary, letterSpacing: 0.3 },
  meta: { fontSize: 11.5, color: colors.textLight, marginTop: 3 },
  scoreBlock: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 8.5, fontWeight: '800', color: colors.textFaint, letterSpacing: 0.5 },
  scoreValue: { fontSize: 14, fontWeight: '800', color: '#1EA868', marginTop: 2 },
  text: { fontSize: 13.5, lineHeight: 20, color: colors.textMid, marginTop: 10 },
  image: { width: 72, height: 72, borderRadius: 12, marginTop: 10, backgroundColor: colors.sectionBg },
  footer: { flexDirection: 'row', gap: 16, marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderUltraLight, paddingTop: 10 },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerBtnText: { fontSize: 12, fontWeight: '600', color: colors.textMid },
});

export default function ProductReviewsScreen({ navigation }) {
  const [activeSort, setActiveSort] = useState('Most Helpful');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MyFace AI</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.popToTop()}
          accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={REVIEWS}
        keyExtractor={(r) => r.key}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.productHeader}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&q=60' }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>Radiance Renewal Elixir</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F0A800" />
                  <Text style={styles.ratingText}>4.8 (124 Reviews)</Text>
                </View>
                <View style={styles.testedPill}>
                  <Text style={styles.testedPillText}>DERMATOLOGIST TESTED</Text>
                </View>
              </View>
            </View>

            <FlatList
              data={FILTERS}
              keyExtractor={(f) => f}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginBottom: 18 }}
              renderItem={({ item }) => <FilterDropdown label={item} />}
            />

            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>SORT BY:</Text>
              {SORTS.map(s => (
                <SortTab key={s} label={s} active={activeSort === s} onPress={() => setActiveSort(s)} />
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => <ReviewCard item={item} />}
        ListFooterComponent={<View style={{ height: 24 }} />}
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

  productHeader: { flexDirection: 'row', gap: 14, marginTop: 8, marginBottom: 20 },
  productImage: { width: 72, height: 72, borderRadius: 14, backgroundColor: colors.sectionBg },
  productName: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  ratingText: { fontSize: 13, fontWeight: '600', color: colors.textMid },
  testedPill: { alignSelf: 'flex-start', backgroundColor: '#E6F9F0', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  testedPillText: { fontSize: 9.5, fontWeight: '800', color: '#1EA868', letterSpacing: 0.3 },

  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  sortLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.6, marginRight: 2 },
});
