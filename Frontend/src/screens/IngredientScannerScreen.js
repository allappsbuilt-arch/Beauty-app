import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const INGREDIENTS = [
  { key: 'niacinamide', name: 'Niacinamide', meta: 'Brightening & Barrier Repair', status: 'SAFE' },
  { key: 'linalool',     name: 'Linalool',     meta: 'Fragrance Component',        status: 'ALERT' },
  { key: 'parabens',     name: 'Parabens',      meta: 'Preservative',               status: 'AVOID' },
  { key: 'glycerin',     name: 'Glycerin',      meta: 'Humectant & Hydrator',        status: 'SAFE' },
];

const STATUS_STYLE = {
  SAFE:  { bg: '#E6F9F0', text: '#1EA868' },
  ALERT: { bg: '#FFF3C0', text: '#C47800' },
  AVOID: { bg: '#FDEAEA', text: '#D03050' },
};

function IngredientRow({ item, isLast }) {
  const s = STATUS_STYLE[item.status];
  return (
    <View style={[row.wrap, !isLast && row.wrapBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={row.name}>{item.name}</Text>
        <Text style={row.meta}>{item.meta}</Text>
      </View>
      <View style={[row.pill, { backgroundColor: s.bg }]}>
        <Text style={[row.pillText, { color: s.text }]}>{item.status}</Text>
      </View>
    </View>
  );
}
const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  wrapBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  name: { fontSize: 14.5, fontWeight: '700', color: colors.textDark },
  meta: { fontSize: 11.5, color: colors.textLight, marginTop: 2 },
  pill: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: '800' },
});

export default function IngredientScannerScreen({ navigation }) {
  const [search, setSearch] = useState('');

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
        data={INGREDIENTS}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={17} color={colors.textPlaceholder} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search product or ingredient..."
                placeholderTextColor={colors.textPlaceholder}
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Search product or ingredient"
              />
            </View>

            <TouchableOpacity
              style={styles.scanBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Scan product label"
            >
              <Ionicons name="camera-outline" size={17} color={colors.white} />
              <Text style={styles.scanBtnText}>Scan Product Label</Text>
            </TouchableOpacity>

            <View style={styles.productHeader}>
              <View>
                <Text style={styles.eyebrow}>IDENTIFIED PRODUCT</Text>
                <Text style={styles.productName}>Radiance Glow Serum</Text>
              </View>
              <View style={styles.compatBlock}>
                <Text style={styles.compatLabel}>Compatibility</Text>
                <View style={styles.compatRow}>
                  <Text style={styles.compatValue}>92%</Text>
                  <Ionicons name="checkmark-circle" size={16} color="#1EA868" />
                </View>
              </View>
            </View>
            <View style={styles.compatBar}>
              <View style={[styles.compatBarFill, { width: '92%' }]} />
            </View>

            <View style={styles.alertCard}>
              <Ionicons name="warning" size={17} color="#D03050" />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Allergy Alert Triggered</Text>
                <Text style={styles.alertText}>
                  Contains <Text style={{ fontWeight: '800' }}>Linalool</Text>, which is on your restricted list.
                </Text>
              </View>
            </View>

            <View style={styles.warnCard}>
              <Ionicons name="swap-horizontal" size={17} color="#C47800" />
              <View style={{ flex: 1 }}>
                <Text style={styles.warnTitle}>Routine Conflict</Text>
                <Text style={styles.warnText}>
                  Using this serum with your <Text style={{ fontWeight: '800' }}>Retinol Night Cream</Text> may cause irritation. Avoid concurrent use.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Ingredient Analysis</Text>
          </>
        }
        renderItem={({ item, index }) => (
          <View style={styles.listCard}>
            <IngredientRow item={item} isLast={index === INGREDIENTS.length - 1} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Add to daily routine"
            >
              <Text style={styles.addBtnText}>Add to Daily Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dupeBtn}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate('DupeFinder')}
              accessibilityRole="button"
              accessibilityLabel="Find a dupe"
            >
              <Ionicons name="color-wand-outline" size={16} color={colors.primary} />
              <Text style={styles.dupeBtnText}>Find a Dupe</Text>
            </TouchableOpacity>
          </View>
        }
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
    marginTop: 6, marginBottom: 14,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textDark },

  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 15,
    marginBottom: 20,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  scanBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },

  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  eyebrow: { fontSize: 10.5, fontWeight: '700', color: colors.textFaint, letterSpacing: 1, marginBottom: 4 },
  productName: { fontSize: 19, fontWeight: '800', color: colors.textDark },
  compatBlock: { alignItems: 'flex-end' },
  compatLabel: { fontSize: 11, color: colors.textLight, fontWeight: '600', marginBottom: 3 },
  compatRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  compatValue: { fontSize: 17, fontWeight: '800', color: '#1EA868' },
  compatBar: { height: 5, borderRadius: 3, backgroundColor: colors.sectionBg, overflow: 'hidden', marginBottom: 18 },
  compatBarFill: { height: 5, borderRadius: 3, backgroundColor: '#1EA868' },

  alertCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: '#FDEAEA', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#F5AAB4',
  },
  alertTitle: { fontSize: 13.5, fontWeight: '800', color: '#B02040', marginBottom: 3 },
  alertText: { fontSize: 12, lineHeight: 17, color: '#B02040' },

  warnCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.alertBg, borderRadius: 14, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: colors.alertBorder,
  },
  warnTitle: { fontSize: 13.5, fontWeight: '800', color: colors.alertText, marginBottom: 3 },
  warnText: { fontSize: 12, lineHeight: 17, color: colors.alertTextLight },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginBottom: 12 },
  listCard: {
    backgroundColor: colors.white, borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.borderLight, overflow: 'hidden',
  },

  footer: { marginTop: 14, gap: 12 },
  addBtn: {
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  addBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  dupeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 100, paddingVertical: 15, borderWidth: 1.5, borderColor: colors.primary,
  },
  dupeBtnText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
});
