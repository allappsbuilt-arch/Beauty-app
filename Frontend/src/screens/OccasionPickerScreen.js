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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const OCCASIONS = [
  { key: 'wedding',     label: 'Wedding',     icon: 'sparkles' },
  { key: 'office',      label: 'Office',      icon: 'briefcase-outline' },
  { key: 'party',       label: 'Party',       icon: 'sparkles-outline' },
  { key: 'casual',      label: 'Casual',      icon: 'cafe-outline' },
  { key: 'photoshoot',  label: 'Photoshoot',  icon: 'camera-outline' },
  { key: 'concert',     label: 'Concert',     icon: 'musical-notes-outline' },
  { key: 'gala',        label: 'Gala',        icon: 'diamond-outline' },
  { key: 'interview',   label: 'Interview',   icon: 'people-outline' },
  { key: 'brunch',      label: 'Brunch',      icon: 'restaurant-outline' },
  { key: 'gym',         label: 'Gym',         icon: 'barbell-outline' },
  { key: 'travel',      label: 'Travel',      icon: 'airplane-outline' },
  { key: 'holiday',     label: 'Holiday',     icon: 'gift-outline' },
  { key: 'nightout',    label: 'Night Out',   icon: 'wine-outline' },
  { key: 'graduation',  label: 'Graduation',  icon: 'school-outline' },
  { key: 'other',       label: 'Other',       icon: 'add', dashed: true },
];

function OccasionCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[cards.card, selected && cards.cardSelected, item.dashed && cards.cardDashed]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <Ionicons name={item.icon} size={20} color={selected ? colors.primary : colors.textMid} />
      <Text style={[cards.label, selected && cards.labelSelected]}>{item.label}</Text>
    </TouchableOpacity>
  );
}
const cards = StyleSheet.create({
  card: {
    flex: 1, margin: 6, borderRadius: 14, paddingVertical: 22,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: colors.borderLight,
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryPale },
  cardDashed: { borderStyle: 'dashed', borderColor: colors.accentDark },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.textMid },
  labelSelected: { color: colors.primary },
});

export default function OccasionPickerScreen({ navigation }) {
  const [selected, setSelected] = useState('wedding');
  const [notes, setNotes] = useState('');

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
        data={OCCASIONS}
        keyExtractor={(o) => o.key}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 10 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
            <Text style={styles.title}>Choose the Occasion</Text>
            <Text style={styles.subtitle}>What kind of look are we creating today?</Text>
          </View>
        }
        renderItem={({ item }) => (
          <OccasionCard item={item} selected={selected === item.key} onPress={() => setSelected(item.key)} />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.notesLabel}>ANY SPECIFIC REQUESTS?</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="E.g., I'm wearing a forest green velvet dress and want a bold lip..."
              placeholderTextColor={colors.textPlaceholder}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={150}
              accessibilityLabel="Any specific requests"
            />
            <Text style={styles.charCount}>{notes.length}/150</Text>

            <View style={styles.promoCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=60' }}
                style={styles.promoImage}
                resizeMode="cover"
              />
              <View style={styles.promoOverlay}>
                <Text style={styles.promoTitle}>Find your perfect glow</Text>
                <Text style={styles.promoSubtitle}>AI-powered personalized looks</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate('MakeupResults')}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text style={styles.continueBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={17} color={colors.white} />
            </TouchableOpacity>
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
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  headerBlock: { marginHorizontal: 16, marginTop: 16, marginBottom: 18 },
  stepLabel: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: colors.textLight },

  footer: { marginHorizontal: 16, marginTop: 10 },
  notesLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 1, marginBottom: 10 },
  notesInput: {
    backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.borderLight,
    padding: 14, fontSize: 13.5, color: colors.textDark, minHeight: 70, textAlignVertical: 'top',
  },
  charCount: { fontSize: 10.5, color: colors.textFaint, textAlign: 'right', marginTop: 4, marginBottom: 18 },

  promoCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 18 },
  promoImage: { width: '100%', height: 110, backgroundColor: colors.sectionBg },
  promoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', padding: 12,
  },
  promoTitle: { fontSize: 14, fontWeight: '800', color: colors.white },
  promoSubtitle: { fontSize: 11.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  continueBtnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
