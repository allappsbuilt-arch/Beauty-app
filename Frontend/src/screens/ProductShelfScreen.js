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
import ErrorBanner from '../components/ErrorBanner';
import { confirm, notify } from '../utils/feedback';
import { useApiData } from '../api/useApiData';

const FILTERS = ['All', 'AM', 'PM', 'Brow', 'Lash', 'Eye'];

function FilterChip({ label, active, onPress }) {
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
    borderRadius: 100, paddingHorizontal: 16, paddingVertical: 9, marginRight: 8,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
  },
  wrapActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, fontWeight: '700', color: colors.textMid },
  textActive: { color: colors.white },
});

function ProductCard({ item, onToggleUse, onRemove }) {
  const progress = Math.min(item.streak / 30, 1);
  return (
    <TouchableOpacity
      style={[card.wrap, item.usedToday && card.wrapUsed]}
      onPress={onToggleUse}
      activeOpacity={0.85}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.usedToday }}
      accessibilityLabel={`${item.name}, ${item.usedToday ? 'used today' : 'not used today'}`}
    >
      <View style={card.imageWrap}>
        <Image source={{ uri: item.uri }} style={card.image} resizeMode="cover" />
        {item.allergyRisk && (
          <View style={card.riskBadge}>
            <Text style={card.riskBadgeText}>ALLERGY RISK</Text>
          </View>
        )}
        <TouchableOpacity style={card.removeBtn} onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${item.name}`}>
          <Ionicons name="close" size={13} color={colors.textDark} />
        </TouchableOpacity>
      </View>
      <Text style={card.brand}>{item.brand.toUpperCase()}</Text>
      <Text style={card.name}>{item.name}</Text>
      <View style={card.metaRow}>
        <Text style={card.days}>{item.daysUsed} {item.daysUsed === 1 ? 'Day' : 'Days'} Used</Text>
        <View style={card.streak}>
          <Ionicons name="flame" size={12} color={colors.primary} />
          <Text style={card.streakText}>{item.streak}</Text>
        </View>
      </View>
      <View style={card.barTrack}>
        <View style={[card.barFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={[card.useHint, item.usedToday && card.useHintDone]}>
        {item.usedToday ? '✓ Used today' : 'Tap to log today'}
      </Text>
    </TouchableOpacity>
  );
}
const card = StyleSheet.create({
  wrap: { flex: 1, margin: 6, backgroundColor: colors.white, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: colors.borderLight },
  wrapUsed: { borderColor: '#1EA868' },
  imageWrap: { position: 'relative', marginBottom: 10 },
  removeBtn: {
    position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
  },
  useHint: { fontSize: 10.5, fontWeight: '700', color: colors.textLight, marginTop: 8 },
  useHintDone: { color: '#1EA868' },
  image: { width: '100%', height: 100, borderRadius: 12, backgroundColor: colors.sectionBg },
  riskBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#D03050', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
  },
  riskBadgeText: { fontSize: 8.5, fontWeight: '800', color: colors.white, letterSpacing: 0.3 },
  brand: { fontSize: 9.5, fontWeight: '800', color: colors.textFaint, letterSpacing: 0.6, marginBottom: 3 },
  name: { fontSize: 13.5, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  days: { fontSize: 10.5, color: colors.textLight, fontWeight: '600' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  streakText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  barTrack: { height: 4, borderRadius: 2, backgroundColor: colors.sectionBg, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2, backgroundColor: colors.primary },
});

function EmptyShelf({ onAdd }) {
  return (
    <View style={empty.wrap}>
      <View style={empty.illustration}>
        <Ionicons name="flask-outline" size={56} color={colors.primary} style={{ opacity: 0.7 }} />
      </View>
      <Text style={empty.title}>Empty Shelf</Text>
      <Text style={empty.desc}>
        Add your skincare and hair products to analyze ingredients and track how they affect your face score.
      </Text>
      <TouchableOpacity
        style={empty.primaryBtn}
        activeOpacity={0.85}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Add your first product"
      >
        <Text style={empty.primaryBtnText}>Add Your First Product</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={empty.secondaryBtn}
        activeOpacity={0.85}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Search products"
      >
        <Text style={empty.secondaryBtnText}>Search Products</Text>
      </TouchableOpacity>

      <View style={empty.tipCard}>
        <View style={empty.tipHeader}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={empty.tipLabel}>PRO TIP</Text>
        </View>
        <Text style={empty.tipText}>
          We'll automatically highlight irritating ingredients like sulfates or denatured alcohols that might be affecting your skin barrier.
        </Text>
      </View>
    </View>
  );
}
const empty = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  illustration: {
    width: 140, height: 140, borderRadius: 70, marginBottom: 24,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.textDark, marginBottom: 10 },
  desc: { fontSize: 14, color: colors.textMid, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  primaryBtn: {
    alignSelf: 'stretch', backgroundColor: colors.primary, borderRadius: 100,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  primaryBtnText: { color: colors.white, fontSize: 15.5, fontWeight: '800' },
  secondaryBtn: {
    alignSelf: 'stretch', borderRadius: 100, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.primary, marginBottom: 24,
  },
  secondaryBtnText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  tipCard: {
    alignSelf: 'stretch', backgroundColor: colors.primaryPale, borderRadius: 16, padding: 16,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tipLabel: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.6 },
  tipText: { fontSize: 13, color: colors.textMid, lineHeight: 19 },
});

export default function ProductShelfScreen({ navigation }) {
  const [filter, setFilter] = useState('All');
  const { data, setData, error, reload, request } = useApiData('/api/products/shelf');
  const items = data?.items ?? [];
  const filteredProducts = items.filter((p) => filter === 'All' || p.category === filter);
  const addProduct = () => navigation?.navigate('IngredientScanner');

  const toggleUse = async (item) => {
    const previous = data;
    setData({ items: items.map((p) => (p.key === item.key ? { ...p, usedToday: !p.usedToday } : p)) });
    try {
      setData(await request(`/api/products/shelf/${item.key}/use`, { method: 'POST', body: { done: !item.usedToday } }));
    } catch (err) {
      setData(previous);
      notify('Could not save', err.message);
    }
  };

  const remove = async (item) => {
    if (!(await confirm('Remove product?', `Remove ${item.name} from your shelf?`, 'Remove'))) return;
    try {
      setData(await request(`/api/products/shelf/${item.key}`, { method: 'DELETE' }));
    } catch (err) {
      notify('Could not remove product', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Product Shelf</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.popToTop()}
          accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(p) => p.key}
          numColumns={2}
          columnWrapperStyle={filteredProducts.length ? { paddingHorizontal: 10 } : undefined}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <ErrorBanner message={error} onRetry={reload} />
              <View style={styles.headerBlock}>
                <Text style={styles.title}>Product Shelf</Text>
                <Text style={styles.subtitle}>Track your routine and monitor results.</Text>
              </View>
              <FlatList
                data={FILTERS}
                keyExtractor={(f) => f}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 18 }}
                renderItem={({ item }) => (
                  <FilterChip label={item} active={filter === item} onPress={() => setFilter(item)} />
                )}
              />
            </>
          }
          renderItem={({ item }) => (
            <ProductCard item={item} onToggleUse={() => toggleUse(item)} onRemove={() => remove(item)} />
          )}
          ListEmptyComponent={
            !data ? null : items.length === 0
              ? <EmptyShelf onAdd={addProduct} />
              : <Text style={[styles.subtitle, { marginHorizontal: 16 }]}>No {filter} products on your shelf.</Text>
          }
          ListFooterComponent={<View style={{ height: 80 }} />}
        />

        {items.length > 0 && (
          <View style={styles.fabRow}>
            <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={addProduct} accessibilityRole="button" accessibilityLabel="Add product">
              <Ionicons name="add" size={26} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
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

  headerBlock: { marginHorizontal: 16, marginTop: 8, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: colors.textLight },

  fabRow: {
    position: 'absolute', right: 16, bottom: 20,
    alignItems: 'flex-end', gap: 10,
  },
  fabHintCol: { alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  fabHint: {
    backgroundColor: colors.white, borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.08,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  fabHintText: { fontSize: 12, fontWeight: '700', color: colors.textMid },
  fab: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
});
