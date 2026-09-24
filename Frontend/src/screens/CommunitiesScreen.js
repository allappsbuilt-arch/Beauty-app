import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Skin', 'Brows', 'Makeup', 'Glow-up'];

export const OFFICIAL = [
  { key: 'skin-tech', name: 'Advanced Skin Tech', members: '24.5k', online: 82, category: 'Skin', uri: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=60' },
  { key: 'pro-makeup', name: 'Pro Makeup Artists', members: '18.2k', online: 54, category: 'Makeup', uri: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=60' },
];

export const GROUPS = [
  {
    key: 'glow-up',
    name: 'Glow-up Challengers',
    members: '12.4k',
    category: 'Glow-up',
    joined: true,
    description: 'Sharing insights on the future of personal growth through AI.',
    banner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=60',
    thumb: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=60',
  },
  {
    key: 'brow-mastery',
    name: 'Brow Mastery Group',
    members: '8.9k',
    category: 'Brows',
    joined: false,
    description: 'Techniques, product reviews and before/afters from brow enthusiasts.',
    banner: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=60',
    thumb: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=60',
  },
  {
    key: 'morning-rituals',
    name: 'Morning Rituals',
    members: '5.2k',
    category: 'Skin',
    joined: false,
    description: 'A calm corner for AM skincare routines and accountability.',
    banner: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=60',
    thumb: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=60',
  },
];

const SORTS = ['Trending', 'Newest', 'Most Active'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.catChip, active && styles.catChipActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function OfficialCard({ item }) {
  return (
    <View style={styles.officialCard}>
      <Image source={{ uri: item.uri }} style={styles.officialImage} resizeMode="cover" />
      <View style={styles.officialBody}>
        <View style={styles.verifiedPill}>
          <Ionicons name="checkmark-circle" size={11} color={colors.primary} />
          <Text style={styles.verifiedText}>VERIFIED</Text>
        </View>
        <Text style={styles.officialName}>{item.name}</Text>
        <Text style={styles.officialMeta}>{item.members} members · {item.online} online</Text>
      </View>
    </View>
  );
}

function GroupRow({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.groupRow} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: item.thumb }} style={styles.groupThumb} resizeMode="cover" />
      <View style={styles.groupMeta}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupMembers}>{item.members} members</Text>
      </View>
      <View style={[styles.joinBtn, item.joined && styles.joinBtnActive]}>
        <Text style={[styles.joinBtnText, item.joined && styles.joinBtnTextActive]}>
          {item.joined ? 'Joined' : 'Join'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CommunitiesScreen({ navigation, route }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(route?.params?.initialCategory ?? 'All');
  const [sort, setSort] = useState('Trending');

  const filteredGroups = GROUPS.filter(
    (g) =>
      (category === 'All' || g.category === category) &&
      (search === '' || g.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="MyFace AI"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Search ── */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textPlaceholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor={colors.textPlaceholder}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            accessibilityLabel="Search communities"
          />
        </View>

        {/* ── Category chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((c) => (
            <CategoryChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>

        {/* ── Official communities ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Official Communities</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="See all official communities">
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.officialRow}
        >
          {OFFICIAL.map((item) => <OfficialCard key={item.key} item={item} />)}
        </ScrollView>

        {/* ── Sort tabs ── */}
        <View style={styles.sortRow}>
          {SORTS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSort(s)}
              accessibilityRole="tab"
              accessibilityState={{ selected: sort === s }}
            >
              <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{s}</Text>
              {sort === s && <View style={styles.sortIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Community hub list ── */}
        <Text style={styles.sectionTitle}>Community Hub</Text>
        <View style={styles.groupList}>
          {filteredGroups.map((item) => (
            <GroupRow
              key={item.key}
              item={item}
              onPress={() => navigation?.navigate('CommunityGroup', { group: item })}
            />
          ))}
          {filteredGroups.length === 0 && (
            <Text style={styles.emptyText}>No communities match this filter yet.</Text>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingTop: 16, paddingBottom: 12 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: 14, marginHorizontal: 20,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  searchInput: { flex: 1, fontSize: 14.5, color: colors.textDark },

  catRow: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  catChip: {
    borderRadius: 100, paddingHorizontal: 16, paddingVertical: 9,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 13, fontWeight: '700', color: colors.textMid },
  catChipTextActive: { color: colors.white },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: colors.textDark, marginHorizontal: 20, marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '700', color: colors.primary },

  officialRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 22 },
  officialCard: {
    width: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  officialImage: { width: '100%', height: 110, backgroundColor: colors.sectionBg },
  officialBody: { padding: 12, gap: 4 },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  verifiedText: { fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.6 },
  officialName: { fontSize: 14.5, fontWeight: '800', color: colors.textDark },
  officialMeta: { fontSize: 11.5, color: colors.textLight, fontWeight: '500' },

  sortRow: { flexDirection: 'row', gap: 20, marginHorizontal: 20, marginBottom: 16 },
  sortText: { fontSize: 13.5, fontWeight: '600', color: colors.textPlaceholder, paddingBottom: 8 },
  sortTextActive: { color: colors.primary, fontWeight: '800' },
  sortIndicator: { height: 2.5, backgroundColor: colors.primary, borderRadius: 2, marginTop: -8 },

  groupList: { marginHorizontal: 20, gap: 12 },
  groupRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  groupThumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.sectionBg },
  groupMeta: { flex: 1, gap: 3 },
  groupName: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  groupMembers: { fontSize: 12.5, color: colors.textLight, fontWeight: '500' },
  joinBtn: { borderRadius: 100, paddingHorizontal: 18, paddingVertical: 9, backgroundColor: colors.primaryPale },
  joinBtnActive: { backgroundColor: colors.primary },
  joinBtnText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  joinBtnTextActive: { color: colors.white },

  emptyText: { textAlign: 'center', color: colors.textLight, fontSize: 13.5, paddingVertical: 20 },
});
