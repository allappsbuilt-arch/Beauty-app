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
import { comingSoon } from '../utils/feedback';

// ─── Data ────────────────────────────────────────────────────────────────────

// `section` maps a chip to the SECTIONS key it filters to; `tab` instead
// jumps straight to a bottom tab for chips with no matching tool section.
const QUICK_ACCESS = [
  { key: 'analysis', icon: 'scan-outline', label: 'Analysis', section: 'face' },
  { key: 'makeup', icon: 'color-palette-outline', label: 'Makeup', section: 'makeup' },
  { key: 'serums', icon: 'flask-outline', label: 'Serums', section: 'products' },
  { key: 'progress', icon: 'stats-chart-outline', label: 'Progress', section: 'progress' },
  { key: 'coach', icon: 'sparkles-outline', label: 'Coach', tab: 'Coach' },
];

const SECTIONS = [
  {
    key: 'face',
    title: 'FACE ANALYSIS',
    tools: [
      {
        key: 'deep-scan',
        icon: 'scan-outline',
        label: 'Deep Scan AI',
        desc: 'Complete map of skin texture and tone',
        route: 'ScanFace',
      },
      {
        key: 'symmetry',
        icon: 'body-outline',
        label: 'Symmetry Check',
        desc: 'Analyze facial proportions and balance',
      },
      {
        key: 'scan-history',
        icon: 'time-outline',
        label: 'Scan History',
        desc: 'Review your past face scans',
        route: 'ScanHistory',
      },
    ],
  },
  {
    key: 'routines',
    title: 'ROUTINES & CARE',
    tools: [
      {
        key: 'routine-builder',
        icon: 'calendar-outline',
        label: 'Daily Routine Builder',
        desc: 'Customized AM/PM skincare flows',
      },
      {
        key: 'eyebrow-tracker',
        icon: 'brush-outline',
        label: 'Eyebrow Tracker',
        desc: 'Track fullness and growth over time',
        route: 'EyebrowTracker',
      },
      {
        key: 'eyelash-tracker',
        icon: 'eye-outline',
        label: 'Eyelash Tracker',
        desc: 'Track length, density and aftercare',
        route: 'EyelashTracker',
      },
      {
        key: 'undereye-tracker',
        icon: 'moon-outline',
        label: 'Undereye Tracker',
        desc: 'Monitor dark circles and depuffing habits',
        route: 'UndereyeTracker',
      },
      {
        key: 'lip-vitality',
        icon: 'happy-outline',
        label: 'Lip Vitality',
        desc: 'Hydration, surface health and routine',
        route: 'LipVitality',
      },
      {
        key: 'scalp-tracker',
        icon: 'analytics-outline',
        label: 'Scalp & Hair Tracker',
        desc: 'Scalp health, wash cycle and hairline log',
        route: 'ScalpTracker',
      },
    ],
  },
  {
    key: 'visualizers',
    title: 'AI VISUALIZERS',
    tools: [
      {
        key: 'aging',
        icon: 'time-outline',
        label: 'Aging Simulator',
        desc: 'Predict skin health over 10–20 years',
      },
      {
        key: 'hairstylist',
        icon: 'color-wand-outline',
        label: 'AI Hairstylist',
        desc: 'Generate and preview new hairstyles',
        route: 'AIHairstylist',
      },
      {
        key: 'lash-styler',
        icon: 'eye-outline',
        label: 'Lash Styler',
        desc: 'Preview lash styles with the AI visualizer',
        route: 'LashStyler',
      },
    ],
  },
  {
    key: 'makeup',
    title: 'MAKEUP & GROOMING',
    tools: [
      {
        key: 'tryon',
        icon: 'glasses-outline',
        label: 'Virtual Try-On',
        desc: 'AR makeup and grooming placement',
        route: 'OccasionPicker',
      },
    ],
  },
  {
    key: 'products',
    title: 'PRODUCTS & INGREDIENTS',
    tools: [
      {
        key: 'ingredients',
        icon: 'barcode-outline',
        label: 'Ingredient Analyzer',
        desc: 'Scan labels for irritants and actives',
        route: 'IngredientScanner',
      },
      {
        key: 'product-shelf',
        icon: 'file-tray-stacked-outline',
        label: 'Product Shelf',
        desc: 'Track your routine and monitor results',
        route: 'ProductShelf',
      },
      {
        key: 'ingredient-guide',
        icon: 'book-outline',
        label: 'Ingredient Guide',
        desc: 'Learn what’s in your products, weekly',
        route: 'IngredientGuide',
      },
    ],
  },
  {
    key: 'progress',
    title: 'PROGRESS & RECAPS',
    tools: [
      {
        key: 'timelapse',
        icon: 'trending-up-outline',
        label: 'Transformation Timelapse',
        desc: 'Compare your skin over weeks or months',
      },
      {
        key: 'rewards',
        icon: 'trophy-outline',
        label: 'Points & Rewards',
        desc: 'Track your balance and earn more',
        route: 'Rewards',
      },
      {
        key: 'leaderboard',
        icon: 'podium-outline',
        label: 'Leaderboard',
        desc: 'See how you rank against others',
        route: 'Leaderboard',
      },
      {
        key: 'communities',
        icon: 'people-outline',
        label: 'Communities',
        desc: 'Join groups and share your journey',
        route: 'Communities',
      },
      {
        key: 'challenges',
        icon: 'flag-outline',
        label: 'Challenges',
        desc: 'Join challenges and compare with friends',
        route: 'Challenges',
      },
    ],
  },
  {
    key: 'settings',
    title: 'SETTINGS & PERSONALIZATION',
    tools: [
      {
        key: 'app-settings',
        icon: 'settings-outline',
        label: 'Settings',
        desc: 'Profile, reminders, and account options',
        route: 'Settings',
      },
      {
        key: 'privacy',
        icon: 'shield-checkmark-outline',
        label: 'Data Privacy',
        desc: 'Manage your scan and routine data',
        route: 'Privacy',
      },
    ],
  },
];

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

function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.searchWrap}>
      <Ionicons name="search-outline" size={17} color={colors.textPlaceholder} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search tools..."
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        accessibilityLabel="Search tools"
      />
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
      <TouchableOpacity onPress={onSeeAll} accessibilityRole="button" accessibilityLabel={`See all ${title}`}>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
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

function ToolSection({ title, tools, onToolPress }) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
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

export default function AllToolsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState(null);

  // Filter sections/tools by search query and the active Quick Access chip
  const filteredSections = SECTIONS
    .filter((s) => !activeChip || s.key === activeChip)
    .map((s) => ({
      ...s,
      tools: s.tools.filter(
        (t) =>
          search === '' ||
          t.label.toLowerCase().includes(search.toLowerCase()) ||
          t.desc.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((s) => s.tools.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── Top header ── */}
      <PageHeader
        onBack={() => navigation?.navigate('Home')}
        onClose={() => navigation?.navigate('Home')}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search ── */}
        <View style={styles.searchSection}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* ── Quick Access ── */}
        {search === '' && (
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
                  active={!!c.section && activeChip === c.section}
                  onPress={() =>
                    c.tab
                      ? navigation?.navigate(c.tab)
                      : setActiveChip(activeChip === c.section ? null : c.section)
                  }
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
            onToolPress={(tool) => (tool.route ? navigation?.navigate(tool.route) : comingSoon(tool.label))}
          />
        ))}

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
});
