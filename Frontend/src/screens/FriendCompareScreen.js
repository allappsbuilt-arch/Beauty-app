import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

const ME = { name: 'You', score: 88, uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=60' };
const DEFAULT_FRIEND = { name: 'Sarah', score: 84, uri: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=60' };

const RANGES = ['7 Days', '30 Days'];

export default function FriendCompareScreen({ route, navigation }) {
  const friend = route?.params?.friend ?? DEFAULT_FRIEND;
  const day = route?.params?.day ?? 12;
  const total = route?.params?.total ?? 30;
  const [range, setRange] = useState('7 Days');
  const [cheered, setCheered] = useState(false);
  const [nudged, setNudged] = useState(false);

  const iLead = ME.score >= friend.score;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="MyFace AI"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── VS header ── */}
        <View style={styles.vsRow}>
          <View style={styles.side}>
            <View style={[styles.avatarRing, styles.avatarRingMe]}>
              <Image source={{ uri: ME.uri }} style={styles.avatar} />
              <View style={[styles.tag, styles.tagMe]}>
                <Text style={styles.tagText}>YOU</Text>
              </View>
            </View>
            <Text style={styles.scoreText}>Score: {ME.score}</Text>
          </View>

          <View style={styles.vsCenter}>
            <View style={styles.vsBadge}>
              <Text style={styles.vsBadgeText}>VS</Text>
            </View>
            <Text style={styles.dayText}>Day {day}/{total}</Text>
          </View>

          <View style={styles.side}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: friend.uri }} style={styles.avatar} />
              <View style={styles.tag}>
                <Text style={styles.tagText}>{friend.name.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.scoreText}>Score: {friend.score}</Text>
          </View>
        </View>

        {/* ── Range toggle ── */}
        <View style={styles.rangeRow}>
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeChip, range === r && styles.rangeChipActive]}
              onPress={() => setRange(r)}
              accessibilityRole="button"
              accessibilityLabel={r}
            >
              <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Growth card ── */}
        <View style={styles.growthCard}>
          <Text style={styles.growthTitle}>Face Score Growth</Text>

          <View style={styles.growthRow}>
            <Text style={styles.growthLabelMe}>Your Improvement</Text>
            <Text style={styles.growthValueMe}>+12%</Text>
          </View>
          <View style={styles.growthTrack}>
            <View style={[styles.growthFill, styles.growthFillMe, { width: '80%' }]} />
          </View>

          <View style={[styles.growthRow, { marginTop: 18 }]}>
            <Text style={styles.growthLabel}>{friend.name}'s Improvement</Text>
            <Text style={styles.growthValue}>+8%</Text>
          </View>
          <View style={styles.growthTrack}>
            <View style={[styles.growthFill, { width: '53%' }]} />
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, cheered && styles.actionBtnDone]}
            onPress={() => setCheered(true)}
            disabled={cheered}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Cheer"
          >
            <Ionicons name={cheered ? 'checkmark' : 'megaphone-outline'} size={17} color={colors.primary} />
            <Text style={styles.actionText}>{cheered ? 'Cheered!' : 'Cheer'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnOutline, nudged && styles.actionBtnDone]}
            onPress={() => setNudged(true)}
            disabled={nudged}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Nudge"
          >
            <Ionicons name={nudged ? 'checkmark' : 'notifications-outline'} size={17} color={colors.textMid} />
            <Text style={styles.actionTextOutline}>{nudged ? 'Nudged!' : 'Nudge'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Leader card ── */}
        <View style={styles.leaderCard}>
          <View style={styles.leaderPillWrap}>
            <View style={styles.leaderPill}>
              <Text style={styles.leaderPillText}>CURRENT LEADER</Text>
            </View>
          </View>

          <Ionicons name="trophy-outline" size={90} color={colors.roseDark} style={styles.leaderWatermark} />

          <View style={styles.leaderBody}>
            <View style={styles.leaderIcon}>
              <Ionicons name="trophy" size={22} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.leaderTitle}>{iLead ? "You're winning!" : `${friend.name} is ahead!`}</Text>
              <Text style={styles.leaderDesc}>
                Keep up your daily routine to stay ahead of {friend.name}.
              </Text>
            </View>
          </View>

          <View style={styles.leaderDivider} />

          <View style={styles.leaderFooter}>
            <View style={styles.leaderStreak}>
              <Ionicons name="flame" size={14} color={colors.primary} />
              <Text style={styles.leaderStreakText}>5 Day Streak</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="View all stats">
              <Text style={styles.viewAllStats}>VIEW ALL STATS ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 12 },

  vsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  side: { alignItems: 'center', gap: 8, width: 120 },
  avatarRing: {
    width: 72, height: 72, borderRadius: 36, padding: 3,
    borderWidth: 2, borderColor: colors.borderLight, position: 'relative',
  },
  avatarRingMe: { borderColor: colors.primary },
  avatar: { width: '100%', height: '100%', borderRadius: 33 },
  tag: {
    position: 'absolute', bottom: -6, alignSelf: 'center',
    backgroundColor: colors.textDark, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2,
  },
  tagMe: { backgroundColor: colors.primary },
  tagText: { fontSize: 9.5, fontWeight: '800', color: colors.white, letterSpacing: 0.4 },
  scoreText: { fontSize: 14.5, fontWeight: '700', color: colors.textDark, marginTop: 4 },

  vsCenter: { alignItems: 'center', gap: 8, paddingTop: 10 },
  vsBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryPale, justifyContent: 'center', alignItems: 'center' },
  vsBadgeText: { fontSize: 13, fontWeight: '800', color: colors.primary, fontStyle: 'italic' },
  dayText: { fontSize: 12.5, color: colors.textMid, fontWeight: '600' },

  rangeRow: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 100, padding: 4,
    marginTop: 26, borderWidth: 1, borderColor: colors.borderLight,
  },
  rangeChip: { flex: 1, borderRadius: 100, paddingVertical: 10, alignItems: 'center' },
  rangeChipActive: { backgroundColor: colors.primaryPale },
  rangeText: { fontSize: 13.5, fontWeight: '700', color: colors.textLight },
  rangeTextActive: { color: colors.primary },

  growthCard: {
    backgroundColor: colors.white, borderRadius: 18, padding: 20, marginTop: 22,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  growthTitle: { fontSize: 19, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: 18 },
  growthRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  growthLabelMe: { fontSize: 14, fontWeight: '700', color: colors.primary },
  growthValueMe: { fontSize: 14, fontWeight: '800', color: colors.primary },
  growthLabel: { fontSize: 14, fontWeight: '600', color: colors.textMid },
  growthValue: { fontSize: 14, fontWeight: '700', color: colors.textMid },
  growthTrack: { height: 9, borderRadius: 5, backgroundColor: colors.roseDark, overflow: 'hidden' },
  growthFill: { height: 9, borderRadius: 5, backgroundColor: colors.textFaint },
  growthFillMe: { backgroundColor: colors.primary },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 100, paddingVertical: 14, borderWidth: 1.5, borderColor: colors.primary,
  },
  actionBtnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 100, paddingVertical: 14, borderWidth: 1.5, borderColor: colors.border,
  },
  actionBtnDone: { backgroundColor: '#E7F7EE', borderColor: '#1EA868' },
  actionText: { fontSize: 14.5, fontWeight: '800', color: colors.primary },
  actionTextOutline: { fontSize: 14.5, fontWeight: '800', color: colors.textMid },

  leaderCard: {
    marginTop: 22, borderRadius: 18, padding: 18, overflow: 'hidden',
    borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryPale,
  },
  leaderPillWrap: { alignItems: 'center', marginBottom: 14 },
  leaderPill: { backgroundColor: colors.primaryPaleDeep, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 },
  leaderPillText: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.6 },
  leaderWatermark: { position: 'absolute', right: -10, bottom: -10, opacity: 0.5 },
  leaderBody: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  leaderIcon: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F0803C',
  },
  leaderTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginBottom: 4 },
  leaderDesc: { fontSize: 13, lineHeight: 19, color: colors.textMid },
  leaderDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.primaryPaleDeep, marginVertical: 16 },
  leaderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaderStreak: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaderStreakText: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  viewAllStats: { fontSize: 12.5, fontWeight: '800', color: colors.primary },
});
