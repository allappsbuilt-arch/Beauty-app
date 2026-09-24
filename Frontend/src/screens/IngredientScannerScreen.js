import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { notify } from '../utils/feedback';
import { choosePhoto } from '../utils/photo';
import { useApiData } from '../api/useApiData';
import { useAuthedRequest } from '../api/useAuthedRequest';

const STATUS_STYLE = {
  SAFE:  { bg: '#E6F9F0', text: '#1EA868' },
  ALERT: { bg: '#FFF3C0', text: '#C47800' },
  AVOID: { bg: '#FDEAEA', text: '#D03050' },
};

function IngredientRow({ item, isLast }) {
  const s = STATUS_STYLE[item.status] || STATUS_STYLE.ALERT;
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

export default function IngredientScannerScreen({ navigation, route }) {
  const request = useAuthedRequest();
  const [productKey, setProductKey] = useState(route?.params?.productKey ?? 'radiance');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [adding, setAdding] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);
  // A label photo's analysis; shown instead of the catalog analysis until the
  // user picks another product.
  const [scanned, setScanned] = useState(null);
  const { data: catalogAnalysis, setData: setCatalogAnalysis, error, reload } = useApiData(`/api/products/${productKey}/analyze`);
  const analysis = scanned ?? catalogAnalysis;
  const setAnalysis = scanned ? setScanned : setCatalogAnalysis;
  const inCatalog = !!analysis?.product.key;

  // Debounced product search.
  useEffect(() => {
    const q = search.trim();
    if (!q) { setResults([]); return undefined; }
    const timer = setTimeout(() => {
      request(`/api/products/search?q=${encodeURIComponent(q)}`)
        .then(({ products }) => setResults(products))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, request]);

  const pickProduct = (key) => {
    setSearch('');
    setResults([]);
    setScanned(null);
    setProductKey(key);
  };

  const handleScanLabel = async () => {
    const image = await choosePhoto('Scan a product label');
    if (!image) return;
    setScanningLabel(true);
    try {
      const result = await request('/api/products/scan-label', { method: 'POST', body: { image } });
      if (result.product.key) setProductKey(result.product.key);
      setScanned(result);
    } catch (err) {
      notify('Could not read the label', err.message);
    } finally {
      setScanningLabel(false);
    }
  };

  const handleAdd = async () => {
    if (analysis?.onShelf) {
      navigation?.navigate('ProductShelf');
      return;
    }
    setAdding(true);
    try {
      await request('/api/products/shelf', { method: 'POST', body: { productKey: analysis.product.key } });
      setAnalysis((cur) => ({ ...cur, onShelf: true }));
    } catch (err) {
      notify('Could not add product', err.message);
    } finally {
      setAdding(false);
    }
  };

  const ingredients = analysis?.ingredients ?? [];
  const compatibility = analysis?.compatibility;
  const compatGood = compatibility >= 80;

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
        data={ingredients}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={17} color={colors.textPlaceholder} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search a product to analyse..."
                placeholderTextColor={colors.textPlaceholder}
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Search product"
              />
            </View>

            {results.length > 0 && (
              <View style={styles.listCard}>
                {results.slice(0, 6).map((p, i) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[row.wrap, i < Math.min(results.length, 6) - 1 && row.wrapBorder]}
                    onPress={() => pickProduct(p.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Analyse ${p.name}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={row.name}>{p.name}</Text>
                      <Text style={row.meta}>{p.brand}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {search.trim() !== '' && results.length === 0 && (
              <Text style={[row.meta, { marginBottom: 12 }]}>No products match "{search.trim()}".</Text>
            )}

            <TouchableOpacity
              style={styles.scanBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Scan product label"
              onPress={handleScanLabel}
              disabled={scanningLabel}
            >
              {scanningLabel
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Ionicons name="camera-outline" size={17} color={colors.white} />}
              <Text style={styles.scanBtnText}>{scanningLabel ? 'Reading label…' : 'Scan Product Label'}</Text>
            </TouchableOpacity>

            <ErrorBanner message={error} onRetry={reload} />

            <View style={styles.productHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>{scanned ? 'FROM YOUR LABEL PHOTO' : 'IDENTIFIED PRODUCT'}</Text>
                <Text style={styles.productName}>{analysis?.product.name ?? '…'}</Text>
              </View>
              <View style={styles.compatBlock}>
                <Text style={styles.compatLabel}>Compatibility</Text>
                <View style={styles.compatRow}>
                  <Text style={styles.compatValue}>{compatibility == null ? '—' : `${compatibility}%`}</Text>
                  <Ionicons
                    name={compatGood ? 'checkmark-circle' : 'alert-circle'}
                    size={16}
                    color={compatGood ? '#1EA868' : '#C47800'}
                  />
                </View>
              </View>
            </View>
            <View style={styles.compatBar}>
              <View style={[styles.compatBarFill, { width: `${compatibility ?? 0}%` }]} />
            </View>

            {analysis?.allergyAlerts.length > 0 && (
              <View style={styles.alertCard}>
                <Ionicons name="warning" size={17} color="#D03050" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>Allergy Alert Triggered</Text>
                  <Text style={styles.alertText}>
                    Contains <Text style={{ fontWeight: '800' }}>{analysis.allergyAlerts.join(', ')}</Text>, which is on your restricted list.
                  </Text>
                </View>
              </View>
            )}

            {(analysis?.conflicts ?? []).map((c) => (
              <View key={c.productKey} style={styles.warnCard}>
                <Ionicons name="swap-horizontal" size={17} color="#C47800" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warnTitle}>Routine Conflict</Text>
                  <Text style={styles.warnText}>
                    Clashes with your <Text style={{ fontWeight: '800' }}>{c.productName}</Text>. {c.reason}
                  </Text>
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Ingredient Analysis</Text>
          </>
        }
        renderItem={({ item, index }) => (
          <View style={styles.listCard}>
            <IngredientRow item={item} isLast={index === ingredients.length - 1} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.addBtn, (adding || !analysis || !inCatalog) && { opacity: 0.6 }]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={analysis?.onShelf ? 'View your product shelf' : 'Add to daily routine'}
              onPress={handleAdd}
              disabled={adding || !analysis || !inCatalog}
            >
              <Text style={styles.addBtnText}>
                {!analysis || inCatalog
                  ? (adding ? 'Adding…' : analysis?.onShelf ? 'On Your Shelf ✓ — View Shelf' : 'Add to Daily Routine')
                  : 'Not in our product catalog yet'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dupeBtn, !inCatalog && { opacity: 0.5 }]}
              activeOpacity={0.85}
              disabled={!inCatalog}
              onPress={() => navigation?.navigate('DupeFinder', { productKey: analysis.product.key })}
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
