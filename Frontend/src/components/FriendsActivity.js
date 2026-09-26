import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';

const ACTIVITIES = [
  {
    key: '1',
    name: 'Jordan', // i18n-ignore: name
    actionKey: 'friendsActivity.completedAm',
    minutesAgo: 2,
    emoji: '✅',
    initials: 'JO',
    avatarColor: '#FF8FAB',
    avatarBg: '#FFF0F5',
    tagKey: 'friendsActivity.tagRoutine',
    tagColor: colors.primary,
  },
  {
    key: '2',
    name: 'Mia', // i18n-ignore: name
    actionKey: 'friendsActivity.startedGlow',
    minutesAgo: 15,
    emoji: '🌟',
    initials: 'MI',
    avatarColor: '#9B6FCC',
    avatarBg: '#F5EEFF',
    tagKey: 'friendsActivity.tagChallenge',
    tagColor: '#7C6FCD',
  },
  {
    key: '3',
    name: 'Leo', // i18n-ignore: name
    actionKey: 'friendsActivity.hitStreak',
    minutesAgo: 60,
    emoji: '🔥',
    initials: 'LE',
    avatarColor: '#E07840',
    avatarBg: '#FFF4EC',
    tagKey: 'friendsActivity.tagStreak',
    tagColor: '#D06030',
  },
];

function ActivityRow({ item, isLast, onPress }) {
  const { t } = useI18n();
  const [liked, setLiked] = useState(false);
  const action = t(item.actionKey);
  const time = item.minutesAgo < 60
    ? t('time.minutesShort', { count: item.minutesAgo })
    : t('time.hoursShort', { count: Math.floor(item.minutesAgo / 60) });
  return (
    <>
      <View style={styles.row}>
        {/* Avatar + text open the activity feed (kept separate from the like
            button so we never nest one button inside another on web) */}
        <TouchableOpacity
          style={styles.rowMain}
          onPress={onPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} ${action}`}
        >
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
                <Text style={[styles.tagText, { color: item.tagColor }]}>{t(item.tagKey)}</Text>
              </View>
            </View>
            <Text style={styles.action} numberOfLines={1}>
              {action} {item.emoji}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Time + like */}
        <View style={styles.rightCol}>
          <Text style={styles.time}>{time}</Text>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => setLiked((v) => !v)}
            accessibilityState={{ selected: liked }}
            accessibilityRole="button"
            accessibilityLabel={t('friendsActivity.like', { name: item.name })}
          >
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={13} color={liked ? colors.primary : colors.textFaint} />
          </TouchableOpacity>
        </View>
      </View>

      {!isLast && <View style={styles.divider} />}
    </>
  );
}

export default function FriendsActivity({ activities = ACTIVITIES }) {
  const navigation = useNavigation();
  const { t } = useI18n();
  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('friendsActivity.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Social')} accessibilityRole="button" accessibilityLabel={t('friendsActivity.seeAllA11y')}>
          <Text style={styles.seeAll}>{t('friendsActivity.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {activities.map((a, i) => (
          <ActivityRow
            key={a.key}
            item={a}
            isLast={i === activities.length - 1}
            onPress={() => navigation.navigate('Social')}
          />
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
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
