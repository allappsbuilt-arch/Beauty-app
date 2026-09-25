import React, { useCallback, useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthedRequest } from '../api/useAuthedRequest';
import ErrorBanner from '../components/ErrorBanner';
import { confirm, notify, openTutorial, shareText } from '../utils/feedback';

function LookCard({ item, selected, recommended, onPress }) {
  return (
    <TouchableOpacity
      style={[cards.card, selected && cards.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, ${item.match}% match`}
      accessibilityState={{ selected }}
    >
      <Image source={{ uri: item.uri }} style={cards.image} resizeMode="cover" />
      {recommended && (
        <View style={cards.recBadge}>
          <Text style={cards.recBadgeText}>BEST MATCH</Text>
        </View>
      )}
      {selected && (
        <View style={cards.checkBadge}>
          <Ionicons name="checkmark" size={13} color={colors.white} />
        </View>
      )}
      <View style={cards.captionWrap}>
        <Text style={cards.caption}>{item.label}</Text>
        <Text style={cards.match}>{item.match}% match</Text>
      </View>
    </TouchableOpacity>
  );
}
const cards = StyleSheet.create({
  card: { flex: 1, margin: 6, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.white, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: colors.primary },
  image: { width: '100%', aspectRatio: 0.9, backgroundColor: colors.sectionBg },
  recBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: colors.primary, borderRadius: 100,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  recBadgeText: { fontSize: 9, fontWeight: '800', color: colors.white, letterSpacing: 0.5 },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  captionWrap: { paddingVertical: 9, alignItems: 'center' },
  caption: { fontSize: 12, fontWeight: '700', color: colors.textDark },
  match: { fontSize: 11, color: colors.textLight, marginTop: 2 },
});

export default function MakeupResultsScreen({ navigation, route }) {
  const request = useAuthedRequest();
  // OccasionPicker passes the freshly created session; otherwise show the
  // user's most recent saved session from the backend.
  const initialSession = route?.params?.session ?? null;
  const [session, setSession] = useState(initialSession);
  const [selected, setSelected] = useState(initialSession?.recommendedKey ?? null);
  const [loading, setLoading] = useState(!initialSession);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(false);

  const loadLatest = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { sessions } = await request('/api/makeup/sessions');
      const latest = sessions[0] ?? null;
      setSession(latest);
      setSelected(latest?.recommendedKey ?? null);
    } catch (err) {
      setError(err.message || 'Could not load your looks.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (!initialSession) loadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const looks = session?.looks ?? [];
  const selectedLook = looks.find((l) => l.key === selected);

  const handleShare = () => {
    if (!selectedLook) return;
    shareText(`My ${selectedLook.label} look for ${session.occasionLabel} from BeautyApp: ${selectedLook.uri}`);
  };

  const handleDelete = async () => {
    if (!selectedLook || removing) return;
    const ok = await confirm('Remove look?', `Remove "${selectedLook.label}" from your results?`, 'Remove');
    if (!ok) return;
    setRemoving(true);
    try {
      const updated = await request(
        `/api/makeup/sessions/${session.id}/looks/${selectedLook.key}`,
        { method: 'DELETE' }
      );
      setSession(updated);
      setSelected(updated.recommendedKey ?? updated.looks[0]?.key ?? null);
    } catch (err) {
      notify('Could not remove look', err.message);
    } finally {
      setRemoving(false);
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (!session) {
      return (
        <View style={styles.center}>
          <ErrorBanner message={error} onRetry={loadLatest} />
          {!error && <Text style={styles.emptyText}>No looks yet — pick an occasion to create some.</Text>}
          <TouchableOpacity
            style={styles.tutorialBtn}
            onPress={() => navigation?.navigate('OccasionPicker')}
            accessibilityRole="button"
            accessibilityLabel="Choose an occasion"
          >
            <Text style={styles.tutorialBtnText}>Choose an Occasion</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={looks}
        keyExtractor={(l) => l.key}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 10 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>AI GENERATION</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Your Results</Text>
              <Text style={styles.count}>{looks.length} Looks</Text>
            </View>
            <Text style={styles.occasion}>
              For your {session.occasionLabel} look{session.notes ? ` · "${session.notes}"` : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>You removed every look. Try another occasion.</Text>}
        renderItem={({ item }) => (
          <LookCard
            item={item}
            selected={selected === item.key}
            recommended={session.recommendedKey === item.key}
            onPress={() => setSelected(item.key)}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {selectedLook && (
              <View style={styles.recCard}>
                <Ionicons name="sparkles" size={16} color={colors.primary} style={{ marginBottom: 6 }} />
                <Text style={styles.recText}>
                  For a {session.occasionLabel.toLowerCase()}, <Text style={{ fontWeight: '800', color: colors.primary }}>{selectedLook.label}</Text> gives you {selectedLook.description}.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.tutorialBtn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Try this look on me"
              disabled={!selectedLook}
              onPress={() => navigation?.navigate('VirtualTryOn', { lookKey: selectedLook?.key })}
            >
              <Ionicons name="color-palette-outline" size={17} color={colors.white} />
              <Text style={styles.tutorialBtnText}>Try This Look On Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tutorialBtn, styles.tutorialBtnOutline]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Start tutorial"
              disabled={!selectedLook}
              onPress={() => openTutorial(`${selectedLook?.label} ${selectedLook?.description} makeup`)}
            >
              <Ionicons name="play-circle-outline" size={17} color={colors.primary} />
              <Text style={[styles.tutorialBtnText, styles.tutorialBtnOutlineText]}>Start Tutorial</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
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
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navIconBtn} onPress={handleShare} disabled={!selectedLook}
            accessibilityRole="button" accessibilityLabel="Save or share look">
            <Ionicons name="download-outline" size={19} color={colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconBtn} onPress={handleDelete} disabled={!selectedLook || removing}
            accessibilityRole="button" accessibilityLabel="Remove look">
            {removing
              ? <ActivityIndicator size="small" color={colors.textDark} />
              : <Ionicons name="trash-outline" size={19} color={colors.textDark} />}
          </TouchableOpacity>
        </View>
      </View>

      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  content: { paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', padding: 16, gap: 16 },
  emptyText: { fontSize: 14, color: colors.textMid, textAlign: 'center', marginHorizontal: 16 },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  navRight: { flexDirection: 'row', gap: 4 },
  navIconBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },

  headerBlock: { marginHorizontal: 16, marginTop: 8, marginBottom: 16 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 1.2, marginBottom: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark, letterSpacing: -0.4 },
  count: { fontSize: 13, fontWeight: '700', color: colors.primary },
  occasion: { fontSize: 13, color: colors.textMid, marginTop: 6 },

  footer: { marginHorizontal: 16, marginTop: 10 },
  recCard: {
    backgroundColor: colors.primaryPale, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
  },
  recText: { fontSize: 13, lineHeight: 19, color: colors.textMid },

  tutorialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16,
    shadowColor: colors.primary, shadowOpacity: 0.30,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  tutorialBtnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  tutorialBtnOutline: {
    marginTop: 10, backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: colors.primary, shadowOpacity: 0, elevation: 0,
  },
  tutorialBtnOutlineText: { color: colors.primary },
});
