import React, { useRef, useState } from 'react';
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
import ScreenHeader from '../components/ScreenHeader';
import { notify, openTutorial } from '../utils/feedback';
import SelfieFrame from '../components/SelfieFrame';
import { useSavedChoice } from '../api/usePreferences';
import { useStyleAdvisor } from '../api/useStyleAdvisor';
import { MatchBadge, AdviceSummary } from '../components/StyleVerdict';


const CHIPS = ['Modern Bob', 'Wolf Cut', 'Pastel Pink'];

const STYLES = [
  { key: 'bob',    uri: 'https://images.unsplash.com/photo-1554519515-242161756769?w=300&q=60' },
  { key: 'long',   uri: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&q=60' },
  { key: 'pink',   uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=60' },
  { key: 'curly',  uri: 'https://images.unsplash.com/photo-1500336624523-d727130c3328?w=300&q=60' },
  { key: 'pixie',  uri: 'https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=300&q=60' },
  { key: 'wavy',   uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&q=60' },
];

function StyleTile({ item, selected, onPress, rank, best }) {
  return (
    <TouchableOpacity
      style={[tile.card, selected && tile.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={rank ? `${rank.label}, ${rank.match}% match` : 'Hairstyle option'}
    >
      <Image source={{ uri: item.uri }} style={tile.image} resizeMode="cover" />
      <MatchBadge rank={rank} best={best} />
      {selected && (
        <View style={tile.checkBadge}>
          <Ionicons name="checkmark" size={12} color={colors.white} />
        </View>
      )}
      {rank && (
        <View style={tile.caption}>
          <Text style={tile.label}>{rank.label}</Text>
          {!!rank.reason && <Text style={tile.reason} numberOfLines={3}>{rank.reason}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}
const tile = StyleSheet.create({
  card: { flex: 1, margin: 6, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: colors.primary },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.sectionBg },
  caption: { backgroundColor: colors.white, padding: 8 },
  label: { fontSize: 12, fontWeight: '800', color: colors.textDark },
  reason: { fontSize: 11, color: colors.textLight, marginTop: 2, lineHeight: 15 },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
});

function Chip({ label, active, onPress }) {
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
    borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white, marginRight: 8,
  },
  wrapActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 12.5, fontWeight: '700', color: colors.textMid },
  textActive: { color: colors.white },
});

export default function AIHairstylistScreen({ navigation }) {
  const [prompt, setPrompt] = useState('');
  const [activeChip, setActiveChip] = useState('Modern Bob');
  const [selectedStyle, setSelectedStyle] = useSavedChoice('styles', 'hair', 'bob');
  const advisor = useStyleAdvisor('hair');
  const userRequest = prompt.trim() || activeChip;
  const rankedStyles = advisor.sortStyles(STYLES);
  const bestKey = advisor.result?.ranking[0]?.key;

  const cameraRef = useRef(null);
  const captureLive = async () => {
    if (!cameraRef.current?.isReady()) return null;
    try {
      return await cameraRef.current.capture();
    } catch (err) {
      notify('Could not take photo', err.message);
      return undefined;
    }
  };

  const findStyles = async () => {
    const image = await captureLive();
    if (image === undefined) return;
    advisor.analyze({ userRequest, image });
  };

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
        data={rankedStyles}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 10 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <SelfieFrame
              cameraRef={cameraRef}
              photo={advisor.photo}
              onRetake={advisor.reset}
              onGallery={() => advisor.analyze({ userRequest, newPhoto: true })}
            >
              <View style={styles.alignPill} pointerEvents="none">
                <Text style={styles.alignPillText}>{advisor.photo ? 'Your Photo' : 'Align Your Face'}</Text>
              </View>
            </SelfieFrame>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Describe your dream hairstyle..."
                placeholderTextColor={colors.textPlaceholder}
                value={prompt}
                onChangeText={setPrompt}
                accessibilityLabel="Describe your dream hairstyle"
              />
              <Ionicons name="mic-outline" size={19} color={colors.textPlaceholder} />
            </View>

            <FlatList
              data={CHIPS}
              keyExtractor={(c) => c}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              renderItem={({ item }) => (
                <Chip label={item} active={activeChip === item} onPress={() => setActiveChip(item)} />
              )}
            />

            <TouchableOpacity
              style={[styles.generateBtn, advisor.loading && { opacity: 0.7 }]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Get AI hairstyle recommendations"
              onPress={findStyles}
              disabled={advisor.loading}
            >
              {advisor.loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.generateBtnText}>{advisor.result ? 'Update Recommendations' : 'Find My Best Styles'}</Text>}
            </TouchableOpacity>

            <AdviceSummary result={advisor.result} />
            <Text style={styles.sectionTitle}>{advisor.result ? 'Recommended For You' : 'Style Ideas'}</Text>
          </>
        }
        renderItem={({ item }) => (
          <StyleTile
            item={item}
            selected={selectedStyle === item.key}
            onPress={() => setSelectedStyle(item.key)}
            rank={advisor.rankFor(item.key)}
            best={item.key === bestKey}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.tutorialBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Get tutorial"
              onPress={() => openTutorial(`${advisor.rankFor(selectedStyle)?.label ?? userRequest} hairstyle`)}
            >
              <Ionicons name="play-circle-outline" size={17} color={colors.white} />
              <Text style={styles.tutorialBtnText}>Get Tutorial</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stylistBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Show stylist"
              onPress={() => navigation?.navigate('Coach')}
            >
              <Ionicons name="cut-outline" size={16} color={colors.primary} />
              <Text style={styles.stylistBtnText}>Show Stylist</Text>
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
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  alignPill: {
    position: 'absolute', top: 12, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  alignPillText: { fontSize: 12, fontWeight: '700', color: colors.white },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 14,
    marginHorizontal: 16, marginTop: 14, paddingHorizontal: 16, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  input: { flex: 1, fontSize: 14, color: colors.textDark },

  chipRow: { paddingHorizontal: 16, paddingVertical: 12 },

  generateBtn: {
    backgroundColor: colors.primary, borderRadius: 100,
    marginHorizontal: 16, paddingVertical: 15, alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  generateBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginHorizontal: 16, marginBottom: 4 },

  footer: { marginHorizontal: 16, marginTop: 14, gap: 12 },
  tutorialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 15,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  tutorialBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  stylistBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 100, paddingVertical: 15,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  stylistBtnText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
});
