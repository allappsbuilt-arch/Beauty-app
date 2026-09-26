import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { shareText } from '../utils/feedback';
import { useI18n } from '../i18n';

export default function RoutineCompleteScreen({ navigation, route }) {
  const streak = route?.params?.streak ?? 0;
  // Points are only awarded for the first routine finished each day.
  const pointsAwarded = route?.params?.pointsAwarded ?? 0;
  const [note, setNote] = useState('');
  const { t } = useI18n();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />

      {/* Nav */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{t('common.appName')}</Text>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation?.popToTop()}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <Ionicons name="close" size={22} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Points pill */}
        {pointsAwarded > 0 && (
          <View style={styles.pointsPill}>
            <Text style={styles.pointsText}>{t('routineComplete.pointsEarned', { count: pointsAwarded })}</Text>
          </View>
        )}

        {/* Flame badge */}
        <View style={styles.flameOuter}>
          <View style={styles.flameInner}>
            <Ionicons name="flame" size={38} color={colors.white} />
          </View>
        </View>

        <Text style={styles.title}>{t('routineComplete.title')}</Text>
        <Text style={styles.subtitle}>
          {t('routineComplete.dayStreak', { count: streak })}{pointsAwarded > 0 && <Text style={styles.subtitlePlus}> +1</Text>}
        </Text>

        {/* Coach tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipAvatar}>
            <Text style={styles.tipAvatarText}>{t('routineComplete.aiBadge')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipLabel}>{t('routineComplete.tipLabel')}</Text>
            <Text style={styles.tipText}>
              {t('routineComplete.tip')}
            </Text>
          </View>
        </View>

        {/* Log a note */}
        <Text style={styles.sectionLabel}>{t('routineComplete.logNote')}</Text>
        <View style={styles.noteInputWrap}>
          <TextInput
            style={styles.noteInput}
            placeholder={t('routineComplete.notePlaceholder')}
            placeholderTextColor={colors.textPlaceholder}
            value={note}
            onChangeText={setNote}
            accessibilityLabel={t('routineComplete.noteA11y')}
          />
          <Ionicons name="mic-outline" size={20} color={colors.textPlaceholder} />
        </View>

        {/* Photo row */}
        <View style={styles.photoRow}>
          <TouchableOpacity
            style={styles.addPhoto}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('routineComplete.addSelfieA11y')}
            onPress={() => navigation?.navigate('ScanFace')}
          >
            <Ionicons name="camera-outline" size={22} color={colors.primary} />
            <Text style={styles.addPhotoText}>{t('routineComplete.addSelfie')}</Text>
          </TouchableOpacity>
        </View>

        {/* CTAs */}
        <TouchableOpacity
          style={styles.shareBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('routineComplete.share')}
          onPress={() => shareText(t('routineComplete.shareMessage', { count: streak }))}
        >
          <Ionicons name="share-social-outline" size={16} color={colors.primary} />
          <Text style={styles.shareBtnText}>{t('routineComplete.share')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation?.popToTop()}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('common.done')}
        >
          <Text style={styles.doneBtnText}>{t('common.done')}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, alignItems: 'stretch' },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  navBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },

  pointsPill: {
    alignSelf: 'center',
    backgroundColor: '#E6F9F0',
    borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 6,
    marginTop: 8, marginBottom: 20,
    borderWidth: 1, borderColor: '#A8E8C4',
  },
  pointsText: { fontSize: 13, fontWeight: '800', color: '#1EA868' },

  flameOuter: {
    alignSelf: 'center',
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: '#FFD9A0',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  flameInner: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#E8703C',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#D05020',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  title: {
    fontSize: 26, fontWeight: '800', color: colors.primary,
    textAlign: 'center', letterSpacing: -0.4, marginBottom: 8,
  },
  subtitle: {
    fontSize: 17, fontWeight: '700', color: colors.textDark,
    textAlign: 'center', marginBottom: 24,
  },
  subtitlePlus: { color: colors.primary },

  tipCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: colors.shadow, shadowOpacity: 0.06,
    shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  tipAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#2A1030',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  tipAvatarText: { fontSize: 12, fontWeight: '800', color: colors.white },
  tipLabel: { fontSize: 10, fontWeight: '800', color: colors.textFaint, letterSpacing: 1, marginBottom: 5 },
  tipText: { fontSize: 13.5, lineHeight: 20, color: colors.textMid },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textFaint,
    letterSpacing: 1.2, marginBottom: 10,
  },
  noteInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 100,
    paddingHorizontal: 18, paddingVertical: 13,
    marginBottom: 16,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  noteInput: { flex: 1, fontSize: 14, color: colors.textDark },

  photoRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  photo: {
    flex: 1, aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: colors.sectionBg,
  },
  addPhoto: {
    flex: 1, paddingVertical: 22,
    borderRadius: 16,
    backgroundColor: colors.primaryPale,
    borderWidth: 1.5, borderColor: colors.accentDark, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 6,
    paddingHorizontal: 8,
  },
  addPhotoText: { fontSize: 12, fontWeight: '700', color: colors.primary, textAlign: 'center' },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 100,
    paddingVertical: 15,
    borderWidth: 1.5, borderColor: colors.primary,
    marginBottom: 12,
  },
  shareBtnText: { color: colors.primary, fontWeight: '800', fontSize: 15 },

  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.30,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  doneBtnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
