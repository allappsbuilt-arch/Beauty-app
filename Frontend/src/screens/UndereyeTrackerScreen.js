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
  Switch,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const PHOTOS = [
  { key: 'mon', label: 'MON', uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60' },
  { key: 'wed', label: 'WED', uri: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=60' },
  { key: 'today', label: 'TODAY', uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=60', active: true },
];

const ROUTINE = [
  { key: 'cold',  icon: 'snow',           label: 'Cold Compress', meta: '5 MINS',  color: '#1EA868', bg: '#E6F9F0' },
  { key: 'gua',   icon: 'leaf',           label: 'Gua Sha',        meta: '3 MINS',  color: '#7A5CD0', bg: '#F1ECFB' },
  { key: 'jade',  icon: 'radio-button-on',label: 'Jade Roller',    meta: 'DAILY',   color: '#1EA868', bg: '#E6F9F0' },
  { key: 'patch', icon: 'bandage',        label: 'Eye Patches',    meta: 'PM ONLY', color: colors.primary, bg: colors.primaryPale },
];

function RingScore({ score = 78 }) {
  const SIZE = 100, RING = 8;
  const deg = Math.round((score / 100) * 360);
  const inner = SIZE - RING * 2;
  return (
    <View style={{ width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: RING, borderColor: colors.roseDark }} />
      <View style={{
        position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: RING,
        borderTopColor: colors.primary,
        borderRightColor: deg > 90 ? colors.primary : colors.roseDark,
        borderBottomColor: deg > 180 ? colors.primary : colors.roseDark,
        borderLeftColor: deg > 270 ? colors.primary : colors.roseDark,
        transform: [{ rotate: '-45deg' }],
      }} />
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textDark }}>{score}</Text>
      </View>
    </View>
  );
}

function RoutineTile({ item }) {
  return (
    <View style={[tile.card, { backgroundColor: item.bg }]}>
      <View style={[tile.iconWrap, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={16} color={colors.white} />
      </View>
      <Text style={tile.label}>{item.label}</Text>
      <Text style={[tile.meta, { color: item.color }]}>{item.meta}</Text>
    </View>
  );
}
const tile = StyleSheet.create({
  card: { flex: 1, margin: 6, borderRadius: 14, padding: 14, gap: 8 },
  iconWrap: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13.5, fontWeight: '700', color: colors.textDark },
  meta: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
});

function ToggleRow({ icon, title, subtitle, value, onValueChange }) {
  return (
    <View style={toggle.row}>
      <View style={toggle.iconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={toggle.title}>{title}</Text>
        <Text style={toggle.subtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderLight, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}
const toggle = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 10, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  subtitle: { fontSize: 11.5, color: colors.textLight, marginTop: 2 },
});

export default function UndereyeTrackerScreen({ navigation }) {
  const [eyeDrops, setEyeDrops] = useState(true);
  const [reminders, setReminders] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.goBack()}
          accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Undereye Tracker</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation?.popToTop()}
          accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>UNDEREYE SCORE</Text>
          <RingScore score={78} />
          <View style={styles.circlesPill}>
            <Ionicons name="eye-outline" size={13} color={colors.primary} />
            <Text style={styles.circlesPillText}>MODERATE DARK CIRCLES</Text>
          </View>
        </View>

        {/* Weekly progress */}
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <FlatList
          data={PHOTOS}
          keyExtractor={(p) => p.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoRow}
          renderItem={({ item }) => (
            <View style={styles.photoCol}>
              <Image source={{ uri: item.uri }} style={[styles.photo, item.active && styles.photoActive]} resizeMode="cover" />
              <Text style={[styles.photoLabel, item.active && styles.photoLabelActive]}>{item.label}</Text>
            </View>
          )}
        />

        {/* Depuffing routine */}
        <Text style={styles.sectionTitle}>Depuffing Routine</Text>
        <FlatList
          data={ROUTINE}
          keyExtractor={(r) => r.key}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => <RoutineTile item={item} />}
        />

        <View style={{ height: 6 }} />

        <ToggleRow
          icon="water-outline"
          title="Eye Drops Applied"
          subtitle="Lubricating Formula"
          value={eyeDrops}
          onValueChange={setEyeDrops}
        />

        {/* Alert */}
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={17} color="#C47800" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>High Screen Time Detected</Text>
            <Text style={styles.alertText}>
              You've reached 6h 12m of active screen use today. Take a break to reduce eye strain.
            </Text>
          </View>
        </View>

        <ToggleRow
          icon="timer-outline"
          title="20-20-20 Reminders"
          subtitle="Every 20 mins, look 20ft away"
          value={reminders}
          onValueChange={setReminders}
        />

        {/* Promo */}
        <TouchableOpacity
          style={styles.promoCard}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Read the eye cream guide"
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=60' }}
            style={styles.promoImage}
            resizeMode="cover"
          />
          <View style={styles.promoBody}>
            <Text style={styles.promoTitle}>The Eye Cream Guide</Text>
            <Text style={styles.promoDesc}>
              Learn how to correctly apply active ingredients like Retinol and Vitamin C to the delicate eye area without irritation.
            </Text>
            <View style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Read Full Guide</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingTop: 16, paddingBottom: 12 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  scoreCard: {
    alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 18,
    marginHorizontal: 16, marginBottom: 20, paddingVertical: 20,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  scoreLabel: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.2 },
  circlesPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryPale, borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.accentDark,
  },
  circlesPillText: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.4 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginHorizontal: 16, marginBottom: 12, marginTop: 4 },

  photoRow: { paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  photoCol: { alignItems: 'center', gap: 8 },
  photo: { width: 84, height: 84, borderRadius: 14, backgroundColor: colors.sectionBg },
  photoActive: { borderWidth: 2, borderColor: colors.primary },
  photoLabel: { fontSize: 10, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.6 },
  photoLabelActive: { color: colors.primary },

  alertCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.alertBg, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 10, padding: 14,
    borderWidth: 1, borderColor: colors.alertBorder,
  },
  alertTitle: { fontSize: 13.5, fontWeight: '800', color: colors.alertText, marginBottom: 3 },
  alertText: { fontSize: 12, lineHeight: 17, color: colors.alertTextLight },

  promoCard: {
    marginHorizontal: 16, marginTop: 10, borderRadius: 18, overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.06,
    shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  promoImage: { width: '100%', height: 130, backgroundColor: colors.sectionBg },
  promoBody: { padding: 16, gap: 8 },
  promoTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  promoDesc: { fontSize: 12.5, lineHeight: 18, color: colors.textMid },
  promoBtn: {
    backgroundColor: colors.primary, borderRadius: 100,
    paddingVertical: 12, alignItems: 'center', marginTop: 6,
  },
  promoBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
});
