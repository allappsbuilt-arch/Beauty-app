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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { goToTab } from '../utils/navigation';

// ─── Data ────────────────────────────────────────────────────────────────────

// Each chip filters the list to one SECTIONS key.
const QUICK_ACCESS = [
  { key: 'analysis', icon: 'scan-outline', label: 'Analysis', section: 'face' },
  { key: 'makeup', icon: 'color-palette-outline', label: 'Makeup', section: 'makeup' },
  { key: 'serums', icon: 'flask-outline', label: 'Serums', section: 'products' },
  { key: 'progress', icon: 'stats-chart-outline', label: 'Progress', section: 'progress' },
  { key: 'coach', icon: 'sparkles-outline', label: 'Coach', section: 'coach' },
];

// `route` is a root-stack screen; `tab` is a bottom tab (reached through the
// Tabs navigator). `keywords` widen search beyond the label/description.
const SECTIONS = [
  {
    key: 'face',
    title: 'FACE ANALYSIS',
    tools: [
      { key: 'deep-scan', icon: 'scan-outline', label: 'Deep Scan AI', desc: 'Complete map of skin texture and tone', route: 'ScanFace', keywords: 'camera selfie skin analysis' },
      { key: 'full-analysis', icon: 'analytics-outline', label: 'Full Scan Analysis', desc: 'Every zone from your latest scan in detail', route: 'FullScanAnalysis', keywords: 'results report zones' },
      { key: 'symmetry', icon: 'body-outline', label: 'Symmetry Check', desc: 'Analyze facial proportions and balance', route: 'SymmetryCheck', keywords: 'balance proportions face shape' },
      { key: 'scan-history', icon: 'time-outline', label: 'Scan History', desc: 'Review your past face scans', route: 'ScanHistory', keywords: 'past previous scans' },
    ],
  },
  {
    key: 'routines',
    title: 'ROUTINES & CARE',
    tools: [
      { key: 'routine-builder', icon: 'calendar-outline', label: 'Daily Routine Builder', desc: 'Customized AM/PM skincare flows', tab: 'Routine', keywords: 'morning evening steps skincare' },
      { key: 'eyebrow-tracker', icon: 'brush-outline', label: 'Eyebrow Tracker', desc: 'Track fullness and growth over time', route: 'EyebrowTracker', keywords: 'brows' },
      { key: 'eyelash-tracker', icon: 'eye-outline', label: 'Eyelash Tracker', desc: 'Track length, density and aftercare', route: 'EyelashTracker', keywords: 'lashes' },
      { key: 'undereye-tracker', icon: 'moon-outline', label: 'Undereye Tracker', desc: 'Monitor dark circles and depuffing habits', route: 'UndereyeTracker', keywords: 'dark circles puffiness eyes' },
      { key: 'lip-vitality', icon: 'happy-outline', label: 'Lip Vitality', desc: 'Hydration, surface health and routine', route: 'LipVitality', keywords: 'lips' },
      { key: 'scalp-tracker', icon: 'analytics-outline', label: 'Scalp & Hair Tracker', desc: 'Scalp health, wash cycle and hairline log', route: 'ScalpTracker', keywords: 'hair scalp' },
    ],
  },
  {
    key: 'visualizers',
    title: 'AI VISUALIZERS',
    tools: [
      { key: 'aging', icon: 'hourglass-outline', label: 'Aging Simulator', desc: 'Predict skin health over 10–20 years', route: 'AgingSimulator', keywords: 'age future wrinkles' },
      { key: 'hairstylist', icon: 'color-wand-outline', label: 'AI Hairstylist', desc: 'Generate and preview new hairstyles', route: 'AIHairstylist', keywords: 'hair cut style' },
      { key: 'lash-styler', icon: 'eye-outline', label: 'Lash Styler', desc: 'Preview lash styles with the AI visualizer', route: 'LashStyler', keywords: 'lashes extensions' },
    ],
  },
  {
    key: 'makeup',
    title: 'MAKEUP & GROOMING',
    tools: [
      { key: 'tryon', icon: 'glasses-outline', label: 'Virtual Try-On', desc: 'AR makeup and grooming placement', route: 'VirtualTryOn', keywords: 'makeup look selfie apply' },
      { key: 'occasion-looks', icon: 'sparkles-outline', label: 'Looks for an Occasion', desc: 'AI makeup looks for any event', route: 'OccasionPicker', keywords: 'makeup wedding party event' },
      { key: 'saved-looks', icon: 'images-outline', label: 'My Makeup Looks', desc: 'Your latest AI-generated looks', route: 'MakeupResults', keywords: 'makeup results saved' },
      { key: 'brow-styling', icon: 'brush-outline', label: 'Brow Styling', desc: 'Find the brow shape that suits your face', route: 'BrowAnalysis', keywords: 'eyebrows grooming shape' },
    ],
  },
  {
    key: 'products',
    title: 'PRODUCTS & INGREDIENTS',
    tools: [
      { key: 'ingredients', icon: 'barcode-outline', label: 'Ingredient Analyzer', desc: 'Scan labels for irritants and actives', route: 'IngredientScanner', keywords: 'serum label scan' },
      { key: 'product-shelf', icon: 'file-tray-stacked-outline', label: 'Product Shelf', desc: 'Track your routine and monitor results', route: 'ProductShelf', keywords: 'serums products' },
      { key: 'ingredient-guide', icon: 'book-outline', label: 'Ingredient Guide', desc: 'Learn what’s in your products, weekly', route: 'IngredientGuide', keywords: 'serums actives retinol niacinamide vitamin' },
      { key: 'dupe-finder', icon: 'swap-horizontal-outline', label: 'Dupe Finder', desc: 'Find affordable alternatives to products', route: 'DupeFinder', keywords: 'cheaper alternative serum budget' },
      { key: 'product-reviews', icon: 'chatbox-ellipses-outline', label: 'Product Reviews', desc: 'Read and write reviews from the community', route: 'ProductReviews', keywords: 'ratings serum' },
    ],
  },
  {
    key: 'progress',
    title: 'PROGRESS & RECAPS',
    tools: [
      { key: 'timelapse', icon: 'trending-up-outline', label: 'Transformation Timelapse', desc: 'Compare your skin over weeks or months', route: 'TransformationTimelapse', keywords: 'before after compare' },
      { key: 'weekly-report', icon: 'bar-chart-outline', label: 'Weekly Report', desc: 'Your routine consistency and zone trends', route: 'WeeklyReport', keywords: 'audit stats recap' },
      { key: 'rewards', icon: 'trophy-outline', label: 'Points & Rewards', desc: 'Track your balance and earn more', tab: 'Rewards', keywords: 'earn points' },
      { key: 'leaderboard', icon: 'podium-outline', label: 'Leaderboard', desc: 'See how you rank against others', route: 'Leaderboard', keywords: 'rank' },
      { key: 'communities', icon: 'people-outline', label: 'Communities', desc: 'Join groups and share your journey', route: 'Communities', keywords: 'groups social' },
      { key: 'challenges', icon: 'flag-outline', label: 'Challenges', desc: 'Join challenges and compare with friends', route: 'Challenges', keywords: 'friends' },
    ],
  },
  {
    key: 'coach',
    title: 'AI COACH',
    tools: [
      { key: 'coach-chat', icon: 'chatbubbles-outline', label: 'Chat with AI Coach', desc: 'Ask anything about your skin and routine', route: 'Coach', keywords: 'ask question help advice' },
      { key: 'coach-style', icon: 'options-outline', label: 'Coach Style', desc: 'Choose how your coach talks to you', route: 'CoachStyle', keywords: 'personality reminders' },
    ],
  },
  {
    key: 'settings',
    title: 'SETTINGS & PERSONALIZATION',
    tools: [
      { key: 'app-settings', icon: 'settings-outline', label: 'Settings', desc: 'Profile, reminders, and account options', route: 'Settings', keywords: 'account profile' },
      { key: 'notifications', icon: 'notifications-outline', label: 'Notifications', desc: 'Choose which alerts you receive', route: 'Notifications', keywords: 'alerts reminders' },
      { key: 'privacy', icon: 'shield-checkmark-outline', label: 'Data Privacy', desc: 'Manage your scan and routine data', route: 'Privacy', keywords: 'export delete data' },
      { key: 'teen-controls', icon: 'lock-closed-outline', label: 'Teen Controls', desc: 'Safety settings for younger users', route: 'TeenageControls', keywords: 'parental teenage' },
    ],
  },
];

// Case-insensitive partial match on every word of the query against the
// tool's label, description, keywords and section title.
function matchesQuery(tool, section, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = `${tool.label} ${tool.desc} ${tool.keywords || ''} ${section.title}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageHeader({ onBack, onClose }) {
  return (
    <View style={styles.pageHeader}>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={22} color={colors.textDark} />
      </TouchableOpacity>

      <Text style={styles.pageTitle}>MyFace AI</Text>

      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={22} color={colors.textDark} />
      </TouchableOpacity>
    </View>
  );
}

function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.searchWrap}>
      <Ionicons name="search-outline" size={17} color={colors.textPlaceholder} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search tools"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.searchClear}
          accessibilityRole="button" accessibilityLabel="Clear search text">
          <Ionicons name="close-circle" size={18} color={colors.textPlaceholder} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function QuickChip({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.chipIcon, active && styles.chipIconActive]}>
        <Ionicons name={icon} size={18} color={active ? colors.primary : colors.textMid} />
      </View>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ToolRow({ icon, label, desc, isLast, onPress }) {
  return (
    <>
      <TouchableOpacity
        style={styles.toolRow}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {/* Icon pill */}
        <View style={styles.toolIconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>

        {/* Text */}
        <View style={styles.toolText}>
          <Text style={styles.toolLabel}>{label}</Text>
          <Text style={styles.toolDesc}>{desc}</Text>
        </View>

        {/* Arrow */}
        <View style={styles.toolArrow}>
          <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />
        </View>
      </TouchableOpacity>

      {/* Separator — omit after last item */}
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

function ToolSection({ title, tools, onToolPress, onSeeAll }) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} onSeeAll={onSeeAll} />
      <View style={styles.sectionCard}>
        {tools.map((tool, i) => (
          <ToolRow
            key={tool.key}
            icon={tool.icon}
            label={tool.label}
            desc={tool.desc}
            isLast={i === tools.length - 1}
            onPress={() => onToolPress(tool)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

// Also used for "See All": the ToolCategory route renders this screen with
// `route.params.section`, listing just that category.
export default function AllToolsScreen({ navigation, route }) {
  const categoryKey = route?.params?.section ?? null;
  const category = SECTIONS.find((s) => s.key === categoryKey) ?? null;

  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState(null);
  const query = search.trim();

  // Filter sections/tools by the category page, the active Quick Access chip
  // and the search query.
  const visibleSections = category ? [category] : SECTIONS.filter((s) => !activeChip || s.key === activeChip);
  const filteredSections = visibleSections
    .map((s) => ({ ...s, tools: s.tools.filter((t) => matchesQuery(t, s, query)) }))
    .filter((s) => s.tools.length > 0);

  const openTool = (tool) => {
    if (tool.tab) goToTab(navigation, tool.tab);
    else navigation?.navigate(tool.route);
  };

  const goBack = () => (navigation?.canGoBack() ? navigation.goBack() : navigation?.navigate('Home'));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Top header ── */}
      <PageHeader
        onBack={goBack}
        onClose={() => goToTab(navigation, 'Home')}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search ── */}
        <View style={styles.searchSection}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={category ? `Search ${category.title.toLowerCase()}...` : 'Search tools...'}
          />
        </View>

        {/* ── Quick Access ── */}
        {!category && query === '' && (
          <View style={styles.quickSection}>
            <Text style={styles.quickLabel}>QUICK ACCESS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {QUICK_ACCESS.map((c) => (
                <QuickChip
                  key={c.key}
                  icon={c.icon}
                  label={c.label}
                  active={activeChip === c.section}
                  onPress={() => setActiveChip(activeChip === c.section ? null : c.section)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Tool Sections ── */}
        {filteredSections.map((s) => (
          <ToolSection
            key={s.key}
            title={s.title}
            tools={s.tools}
            onToolPress={openTool}
            onSeeAll={category ? null : () => navigation?.navigate('ToolCategory', { section: s.key })}
          />
        ))}

        {/* ── No results ── */}
        {filteredSections.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={30} color={colors.textPlaceholder} />
            <Text style={styles.noResultsTitle}>No tools found</Text>
            <Text style={styles.noResultsText}>Nothing matches “{query}”. Try a different word.</Text>
            <TouchableOpacity
              style={styles.noResultsBtn}
              onPress={() => setSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.noResultsBtnText}>Clear search</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // ── Header ──
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.sectionBg,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },

  // ── Scroll content ──
  scroll: {
    backgroundColor: colors.primaryBg,
    paddingBottom: 24,
  },

  // ── Search ──
  searchSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sectionBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    paddingVertical: 0,
  },

  // ── Quick Access ──
  quickSection: {
    backgroundColor: colors.white,
    paddingBottom: 16,
    paddingTop: 4,
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 1,
    marginLeft: 16,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  chipActive: {},
  chipIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.sectionBg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipIconActive: {
    backgroundColor: colors.primaryPale,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMid,
    textAlign: 'center',
  },
  chipLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  // ── Sections ──
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // ── Section card ──
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    // Premium shadow
    shadowColor: '#C0405A',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  // ── Tool row ──
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: colors.white,
  },
  toolIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    // Subtle inner border for depth
    borderWidth: 1,
    borderColor: colors.accentDark,
  },
  toolText: {
    flex: 1,
  },
  toolLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    letterSpacing: 0.1,
  },
  toolDesc: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
    lineHeight: 17,
  },
  toolArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.sectionBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 72, // aligns with text, not icon
  },

  bottomSpacer: {
    height: 32,
  },

  // ── Search extras ──
  searchClear: { paddingLeft: 8, paddingVertical: 4 },
  noResults: { alignItems: 'center', gap: 6, paddingHorizontal: 32, paddingTop: 40 },
  noResultsTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginTop: 4 },
  noResultsText: { fontSize: 13, color: colors.textLight, textAlign: 'center' },
  noResultsBtn: {
    marginTop: 10, borderRadius: 100, paddingHorizontal: 18, paddingVertical: 9,
    backgroundColor: colors.primaryPale,
  },
  noResultsBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
