import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const GOALS = ['Hydrate', 'Plump', 'Even Tone', 'Heal'];

const PHOTOS = [
  { key: 'mon', label: 'MON', uri: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=200&q=60' },
  { key: 'wed', label: 'WED', uri: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=200&q=60' },
  { key: 'fri', label: 'FRI', uri: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=200&q=60' },
  { key: 'today', label: 'TODAY', add: true },
];

const ROUTINE = [
  { key: 'exfoliate', icon: 'brush-outline', name: 'Exfoliate', meta: 'Sugar Scrub • 2 min', checked: false },
  { key: 'balm',       icon: 'water-outline', name: 'Balm',      meta: 'Ceramide Shield',   checked: true },
  { key: 'mask',        icon: 'moon-outline',  name: 'Overnight Mask', meta: 'Hyaluronic Seal', checked: false },
];

const PRODUCTS = [
  { key: 'laneige', name: 'Laneige Sleeping Mask', meta: 'USE AM/PM', metaColor: colors.primary,
    uri: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&q=60' },
  { key: 'burts', name: "Burt's Bees Scrub", meta: '3X WEEKLY', metaColor: '#1EA868',
    uri: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&q=60' },
];

function GoalChip({ label }) {
  return (
    <View style={goal.chip}>
      <Text style={goal.chipText}>{label}</Text>
    </View>
  );
}
const goal = StyleSheet.create({
  chip: {
    backgroundColor: colors.primaryPale, borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1, borderColor: colors.accentDark,
  },
  chipText: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
});

function RoutineRow({ item, isLast }) {
  return (
    <View style={[routine.row, !isLast && routine.rowBorder]}>
      <View style={routine.iconWrap}>
        <Ionicons name={item.icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={routine.name}>{item.name}</Text>
        <Text style={routine.meta}>{item.meta}</Text>
      </View>
      <Ionicons
        name={item.checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={item.checked ? '#1EA868' : colors.borderLight}
      />
    </View>
  );
}
const routine = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderUltraLight },
  iconWrap: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  meta: { fontSize: 11.5, color: colors.textLight, marginTop: 2 },
});

export default function LipVitalityScreen({ navigation }) {
  const [selectedGoals] = useState(GOALS);

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
          <Ionicons name="close" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.eyebrow}>ANALYSIS</Text>
            <Text style={styles.heading}>Lip Vitality</Text>
          </View>
          <View style={styles.pigmentPill}>
            <Text style={styles.pigmentPillText}>Uniform Pigment</Text>
          </View>
        </View>

        {/* Metric cards */}
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Hydration</Text>
            <Text style={styles.metricValue}>84%</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '84%' }]} />
            </View>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Surface Health</Text>
            <View style={styles.healthRow}>
              <Ionicons name="checkmark-circle" size={15} color="#1EA868" />
              <Text style={styles.healthValue}>Excellent</Text>
            </View>
            <Text style={styles.healthMeta}>No cracking</Text>
          </View>
        </View>

        {/* Goals */}
        <Text style={styles.sectionTitle}>Current Goals</Text>
        <FlatList
          data={selectedGoals}
          keyExtractor={(g) => g}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 20 }}
          renderItem={({ item }) => <GoalChip label={item} />}
        />

        {/* Weekly progress */}
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="View history">
            <Text style={styles.viewHistory}>View History</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={PHOTOS}
          keyExtractor={(p) => p.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, marginBottom: 22 }}
          renderItem={({ item }) => (
            item.add ? (
              <View style={styles.addPhoto}>
                <Ionicons name="camera-outline" size={18} color={colors.primary} />
                <Text style={styles.addPhotoText}>{item.label}</Text>
              </View>
            ) : (
              <View style={styles.photoCol}>
                <Image source={{ uri: item.uri }} style={styles.photo} resizeMode="cover" />
                <Text style={styles.photoBadge}>{item.label}</Text>
              </View>
            )
          )}
        />

        {/* Evening routine */}
        <Text style={styles.sectionTitle}>Evening Routine</Text>
        <View style={styles.routineCard}>
          {ROUTINE.map((r, i) => <RoutineRow key={r.key} item={r} isLast={i === ROUTINE.length - 1} />)}
        </View>

        {/* Active products */}
        <Text style={styles.sectionTitle}>Active Products</Text>
        <View style={styles.productRow}>
          {PRODUCTS.map(p => (
            <View key={p.key} style={styles.productCard}>
              <Image source={{ uri: p.uri }} style={styles.productImage} resizeMode="cover" />
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={[styles.productMeta, { color: p.metaColor }]}>{p.meta}</Text>
            </View>
          ))}
        </View>

        {/* Ingredient spotlight */}
        <View style={styles.spotlightCard}>
          <Ionicons name="flask-outline" size={18} color={colors.white} style={{ marginBottom: 8 }} />
          <Text style={styles.spotlightTitle}>Ingredient Spotlight</Text>
          <Text style={styles.spotlightText}>
            Your lips lack oil glands. Look for <Text style={{ fontWeight: '800' }}>Peptides</Text> and{' '}
            <Text style={{ fontWeight: '800' }}>Squalane</Text> to rebuild the moisture barrier.
          </Text>
          <TouchableOpacity
            style={styles.spotlightBtn}
            onPress={() => navigation?.navigate('IngredientGuide')}
            accessibilityRole="button"
            accessibilityLabel="Learn more about ceramides"
          >
            <Text style={styles.spotlightBtnText}>Learn more about Ceramides</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingTop: 12, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  headingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginHorizontal: 16, marginBottom: 16,
  },
  eyebrow: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 1.2, marginBottom: 4 },
  heading: { fontSize: 24, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4 },
  pigmentPill: {
    backgroundColor: '#F1ECFB', borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#D4C6F5',
  },
  pigmentPillText: { fontSize: 11.5, fontWeight: '700', color: '#7A5CD0' },

  metricRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 20 },
  metricCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  metricLabel: { fontSize: 11.5, fontWeight: '700', color: colors.textLight, marginBottom: 6 },
  metricValue: { fontSize: 22, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  barTrack: { height: 5, borderRadius: 3, backgroundColor: colors.sectionBg, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3, backgroundColor: colors.primary },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  healthValue: { fontSize: 16, fontWeight: '800', color: '#1EA868' },
  healthMeta: { fontSize: 11.5, color: colors.textLight },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginHorizontal: 16, marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 0 },
  viewHistory: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 12 },

  photoCol: { alignItems: 'center', gap: 6 },
  photo: { width: 76, height: 76, borderRadius: 12, backgroundColor: colors.sectionBg },
  photoBadge: { fontSize: 10, fontWeight: '700', color: colors.textFaint },
  addPhoto: {
    width: 76, height: 76, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.accentDark, borderStyle: 'dashed',
    backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  addPhotoText: { fontSize: 9, fontWeight: '800', color: colors.primary },

  routineCard: {
    backgroundColor: colors.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  productRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 20 },
  productCard: { flex: 1, backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight },
  productImage: { width: '100%', height: 90, backgroundColor: colors.sectionBg },
  productName: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginHorizontal: 10, marginTop: 8 },
  productMeta: { fontSize: 10.5, fontWeight: '800', marginHorizontal: 10, marginTop: 2, marginBottom: 10, letterSpacing: 0.4 },

  spotlightCard: {
    backgroundColor: colors.primary, borderRadius: 18,
    marginHorizontal: 16, padding: 18,
    shadowColor: colors.primary, shadowOpacity: 0.28,
    shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  spotlightTitle: { fontSize: 17, fontWeight: '800', color: colors.white, marginBottom: 8 },
  spotlightText: { fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.9)', marginBottom: 14 },
  spotlightBtn: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 100, paddingHorizontal: 14, paddingVertical: 9,
  },
  spotlightBtnText: { fontSize: 12.5, fontWeight: '700', color: colors.white },
});
