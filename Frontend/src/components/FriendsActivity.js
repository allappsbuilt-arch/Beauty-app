import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ACTIVITIES = [
  {
    key: '1',
    name: 'Jordan',
    action: 'completed AM Routine',
    time: '2m',
    emoji: '✅',
    initials: 'JO',
    avatarColor: '#FF8FAB',
    avatarBg: '#FFF0F5',
    tag: 'Routine',
    tagColor: colors.primary,
  },
  {
    key: '2',
    name: 'Mia',
    action: 'started a 7-day Glow challenge',
    time: '15m',
    emoji: '🌟',
    initials: 'MI',
    avatarColor: '#9B6FCC',
    avatarBg: '#F5EEFF',
    tag: 'Challenge',
    tagColor: '#7C6FCD',
  },
  {
    key: '3',
    name: 'Leo',
    action: 'hit a 30-day streak!',
    time: '1h',
    emoji: '🔥',
    initials: 'LE',
    avatarColor: '#E07840',
    avatarBg: '#FFF4EC',
    tag: 'Streak',
    tagColor: '#D06030',
  },
];

function ActivityRow({ item, isLast }) {
  return (
    <>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={[styles.avatarRing, { borderColor: item.avatarColor + '60' }]}>
          <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
            <Text style={[styles.initials, { color: item.avatarColor }]}>
              {item.initials}
            </Text>
          </View>
        </View>

        {/* Text block */}
        <View style={styles.textBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {/* Tag pill */}
            <View style={[styles.tagPill, { backgroundColor: item.tagColor + '18' }]}>
              <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
            </View>
          </View>
          <Text style={styles.action} numberOfLines={1}>
            {item.action} {item.emoji}
          </Text>
        </View>

        {/* Time + like */}
        <View style={styles.rightCol}>
          <Text style={styles.time}>{item.time}</Text>
          <TouchableOpacity
            style={styles.likeBtn}
            accessibilityRole="button"
            accessibilityLabel={`Like ${item.name}'s activity`}
          >
            <Ionicons name="heart-outline" size={13} color={colors.textFaint} />
          </TouchableOpacity>
        </View>
      </View>

      {!isLast && <View style={styles.divider} />}
    </>
  );
}

export default function FriendsActivity({ activities = ACTIVITIES }) {
  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>FRIENDS ACTIVITY</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="See all friends activity">
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {activities.map((a, i) => (
          <ActivityRow key={a.key} item={a} isLast={i === activities.length - 1} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 20,
    marginVertical: 6,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textFaint,
    letterSpacing: 1.2,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // Card container
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Activity row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 11,
  },

  // Avatar
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // Text
  textBlock: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    letterSpacing: 0.1,
  },
  tagPill: {
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  action: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 17,
  },

  // Right col
  rightCol: {
    alignItems: 'center',
    gap: 5,
  },
  time: {
    fontSize: 10,
    color: colors.textPlaceholder,
    fontWeight: '600',
  },
  likeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.sectionBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderUltraLight,
    marginHorizontal: 14,
  },
});
