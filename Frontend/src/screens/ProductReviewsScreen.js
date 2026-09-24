import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ErrorBanner from '../components/ErrorBanner';
import { comingSoon, notify } from '../utils/feedback';
import { useApiData } from '../api/useApiData';

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
const SORTS = [
  { label: 'Most Helpful', param: 'helpful' },
  { label: 'Recent', param: 'recent' },
];
const AVATAR_COLORS = ['#5A3070', '#C89AE0', '#D06090', '#1EA868', '#7A5CD0'];

function initials(name) {
  return name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[dd.wrap, active && dd.wrapActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[dd.text, active && dd.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}
const dd = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  wrapActive: { backgroundColor: colors.primaryPale, borderColor: colors.primary },
  text: { fontSize: 12.5, fontWeight: '600', color: colors.textMid },
  textActive: { color: colors.primary, fontWeight: '800' },
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

function Stars({ count, size = 14, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: onChange ? 6 : 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Ionicons name={n <= Math.round(count) ? 'star' : 'star-outline'} size={size} color="#F0A800" />;
        return onChange ? (
          <TouchableOpacity key={n} onPress={() => onChange(n)} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}>
            {icon}
          </TouchableOpacity>
        ) : <View key={n}>{icon}</View>;
      })}
    </View>
  );
}

function ReviewCard({ item, index, onToggleHelpful }) {
  return (
    <View style={rev.card}>
      <View style={rev.header}>
        <View style={[rev.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
          <Text style={rev.avatarText}>{initials(item.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={rev.nameRow}>
            <Text style={rev.name}>{item.name}</Text>
            {item.mine && (
              <View style={rev.verifiedPill}>
                <Text style={rev.verifiedText}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={rev.meta}>
            {[item.skinType && `${item.skinType} Skin`, new Date(item.createdAt).toLocaleDateString()].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>

      <Stars count={item.rating} />

      <Text style={rev.text}>{item.text}</Text>

      <View style={rev.footer}>
        <TouchableOpacity
          style={rev.footerBtn}
          onPress={onToggleHelpful}
          disabled={item.mine}
          accessibilityRole="button"
          accessibilityLabel="Helpful"
          accessibilityState={{ selected: item.markedHelpful, disabled: item.mine }}
        >
          <Ionicons name={item.markedHelpful ? 'thumbs-up' : 'thumbs-up-outline'} size={14} color={item.markedHelpful ? colors.primary : colors.textMid} />
          <Text style={rev.footerBtnText}>Helpful ({item.helpful})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rev.footerBtn} onPress={() => comingSoon('Replies')} accessibilityRole="button" accessibilityLabel="Reply">
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
  text: { fontSize: 13.5, lineHeight: 20, color: colors.textMid, marginTop: 10 },
  footer: { flexDirection: 'row', gap: 16, marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderUltraLight, paddingTop: 10 },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerBtnText: { fontSize: 12, fontWeight: '600', color: colors.textMid },
});

function WriteReview({ existing, onSubmit, submitting }) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [skinType, setSkinType] = useState(existing?.skinType ?? null);
  const [text, setText] = useState(existing?.text ?? '');
  const valid = rating > 0 && text.trim().length >= 10;

  return (
    <View style={form.card}>
      <Text style={form.title}>{existing ? 'Update your review' : 'Write a review'}</Text>
      <Stars count={rating} size={24} onChange={setRating} />
      <View style={form.chips}>
        {SKIN_TYPES.map((t) => (
          <FilterChip key={t} label={t} active={skinType === t} onPress={() => setSkinType(skinType === t ? null : t)} />
        ))}
      </View>
      <TextInput
        style={form.input}
        placeholder="What did you like or dislike? (at least 10 characters)"
        placeholderTextColor={colors.textPlaceholder}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={1000}
        accessibilityLabel="Review text"
      />
      <TouchableOpacity
        style={[form.submit, (!valid || submitting) && { opacity: 0.5 }]}
        onPress={() => onSubmit({ rating, skinType, text: text.trim() })}
        disabled={!valid || submitting}
        accessibilityRole="button"
        accessibilityLabel="Post review"
      >
        {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={form.submitText}>Post Review</Text>}
      </TouchableOpacity>
    </View>
  );
}
const form = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: colors.borderLight, gap: 12 },
  title: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  chips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  input: {
    minHeight: 80, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    padding: 12, fontSize: 13.5, color: colors.textDark, textAlignVertical: 'top',
  },
  submit: { backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 13, alignItems: 'center' },
  submitText: { color: colors.white, fontWeight: '800', fontSize: 14 },
});

export default function ProductReviewsScreen({ navigation, route }) {
  const productKey = route?.params?.productKey ?? 'renewal';
  const [activeSort, setActiveSort] = useState('helpful');
  const [skinFilter, setSkinFilter] = useState(null);
  const [writing, setWriting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { data, setData, error, reload, request } = useApiData(`/api/products/${productKey}/reviews?sort=${activeSort}`);

  const product = data?.product;
  const reviews = (data?.reviews ?? []).filter((r) => !skinFilter || r.skinType === skinFilter);
  const myReview = data?.reviews.find((r) => r.mine);

  const toggleHelpful = async (review) => {
    const next = !review.markedHelpful;
    try {
      const { helpful } = await request(`/api/products/reviews/${review.id}/helpful`, { method: 'POST', body: { helpful: next } });
      setData((cur) => ({
        ...cur,
        reviews: cur.reviews.map((r) => (r.id === review.id ? { ...r, helpful, markedHelpful: next } : r)),
      }));
    } catch (err) {
      notify('Could not save your vote', err.message);
    }
  };

  const submitReview = async (body) => {
    setSubmitting(true);
    try {
      await request(`/api/products/${productKey}/reviews`, { method: 'POST', body });
      setWriting(false);
      await reload();
    } catch (err) {
      notify('Could not post review', err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
        data={reviews}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <ErrorBanner message={error} onRetry={reload} />
            <View style={styles.productHeader}>
              <Image source={{ uri: product?.uri }} style={styles.productImage} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{product?.name ?? '…'}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F0A800" />
                  <Text style={styles.ratingText}>
                    {data?.count ? `${data.average} (${data.count} ${data.count === 1 ? 'Review' : 'Reviews'})` : 'No reviews yet'}
                  </Text>
                </View>
                {!!product && (
                  <View style={styles.testedPill}>
                    <Text style={styles.testedPillText}>{product.brand.toUpperCase()}</Text>
                  </View>
                )}
              </View>
            </View>

            {writing ? (
              <WriteReview existing={myReview} onSubmit={submitReview} submitting={submitting} />
            ) : (
              <TouchableOpacity style={styles.writeBtn} onPress={() => setWriting(true)} accessibilityRole="button">
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={styles.writeBtnText}>{myReview ? 'Edit Your Review' : 'Write a Review'}</Text>
              </TouchableOpacity>
            )}

            <FlatList
              data={['All', ...SKIN_TYPES]}
              keyExtractor={(f) => f}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginBottom: 18 }}
              renderItem={({ item }) => (
                <FilterChip
                  label={item === 'All' ? 'All Skin Types' : item}
                  active={(skinFilter ?? 'All') === item}
                  onPress={() => setSkinFilter(item === 'All' ? null : item)}
                />
              )}
            />

            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>SORT BY:</Text>
              {SORTS.map((s) => (
                <SortTab key={s.param} label={s.label} active={activeSort === s.param} onPress={() => setActiveSort(s.param)} />
              ))}
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <ReviewCard item={item} index={index} onToggleHelpful={() => toggleHelpful(item)} />
        )}
        ListEmptyComponent={
          data ? (
            <Text style={styles.emptyText}>
              {skinFilter ? `No reviews from ${skinFilter.toLowerCase()} skin yet.` : 'Be the first to review this product.'}
            </Text>
          ) : null
        }
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
  writeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 100, borderWidth: 1.5, borderColor: colors.primary, paddingVertical: 11, marginBottom: 18,
  },
  writeBtnText: { fontSize: 13.5, fontWeight: '800', color: colors.primary },
  emptyText: { fontSize: 13.5, color: colors.textMid, textAlign: 'center', marginTop: 8 },
});
