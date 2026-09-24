import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { usePreferences } from '../api/usePreferences';
import { useAuth } from '../context/AuthContext';

const AVATAR_URI = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60';

function ToggleRow({ icon, label, desc, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIcon}>
        <Ionicons name={icon} size={19} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderLight, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function TeenageControlsScreen({ navigation }) {
  const { user } = useAuth();
  const { prefs, error, reload, save, saving } = usePreferences();
  const [enabled, setEnabled] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [aiInteractions, setAiInteractions] = useState(true);
  const [restrictExplicit, setRestrictExplicit] = useState(true);
  const [weeklyEmail, setWeeklyEmail] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Start from the saved values once they load.
  const stored = prefs?.teenControls;
  useEffect(() => {
    if (!stored) return;
    setEnabled(stored.enabled);
    setPublicProfile(stored.publicProfile);
    setAiInteractions(stored.aiInteractions);
    setRestrictExplicit(stored.restrictExplicit);
    setWeeklyEmail(stored.weeklyEmail);
  }, [stored?.enabled, stored?.publicProfile, stored?.aiInteractions, stored?.restrictExplicit, stored?.weeklyEmail]);

  const handleSave = async () => {
    setSaveError(null);
    try {
      await save({ teenControls: { enabled, publicProfile, aiInteractions, restrictExplicit, weeklyEmail } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err.message || 'Could not save your changes.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="MyFace AI"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ErrorBanner message={error} onRetry={reload} />

        {/* ── Profile ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: AVATAR_URI }} style={styles.avatar} />
            <View style={styles.activeDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name ? `${user.name}'s Account` : 'Your Account'}</Text>
            <View style={styles.protectionRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={colors.textLight} />
              <Text style={styles.protectionText}>{enabled ? 'Protection Active' : 'Protection Off'}</Text>
            </View>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: colors.borderLight, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Teenage mode"
          />
        </View>

        {/* ── Social permissions ── */}
        <Text style={styles.sectionTitle}>SOCIAL PERMISSIONS</Text>
        <View style={styles.cardList}>
          <ToggleRow
            icon="globe-outline"
            label="Public Profile"
            desc="Visible to non-contacts"
            value={publicProfile}
            onChange={setPublicProfile}
          />
          <ToggleRow
            icon="chatbubble-ellipses-outline"
            label="AI Interactions"
            desc="Unrestricted AI chatting"
            value={aiInteractions}
            onChange={setAiInteractions}
          />
        </View>

        {/* ── Content filters ── */}
        <Text style={styles.sectionTitle}>CONTENT FILTERS</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <Ionicons name="shield-outline" size={18} color={colors.primary} />
            <Text style={styles.statusTitle}>Deep Filters</Text>
            <Text style={styles.statusDesc}>Strict AI moderation active</Text>
          </View>
          <View style={styles.statusCard}>
            <Ionicons name="time-outline" size={18} color="#8870C0" />
            <Text style={styles.statusTitle}>Quiet Hours</Text>
            <Text style={styles.statusDesc}>21:00 - 07:00</Text>
          </View>
        </View>
        <View style={styles.cardList}>
          <ToggleRow
            icon="alert-circle-outline"
            label="Restrict Explicit Content"
            desc=""
            value={restrictExplicit}
            onChange={setRestrictExplicit}
          />
        </View>

        {/* ── Parental reporting ── */}
        <Text style={styles.sectionTitle}>PARENTAL REPORTING</Text>
        <View style={styles.emailCard}>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={19} color={colors.primary} />
            <Text style={styles.toggleLabel}>Weekly Summary Email</Text>
            <Switch
              value={weeklyEmail}
              onValueChange={setWeeklyEmail}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <Text style={styles.emailDesc}>Sent every Sunday at 8:00 AM to {user?.email ?? 'your account email'}</Text>
        </View>

        <ErrorBanner message={saveError} onDismiss={() => setSaveError(null)} />
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone, (saving || !prefs) && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving || !prefs}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Save all changes"
        >
          <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={17} color={colors.white} />
          <Text style={styles.saveBtnText}>{saved ? 'Saved!' : saving ? 'Saving…' : 'Save All Changes'}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 22,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: colors.primary },
  activeDot: {
    position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#1EA868', borderWidth: 2, borderColor: colors.white,
  },
  profileName: { fontSize: 16.5, fontWeight: '800', color: colors.textDark },
  protectionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  protectionText: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  agePill: { backgroundColor: colors.primaryPale, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  agePillText: { fontSize: 12.5, fontWeight: '800', color: colors.primary },

  sectionTitle: { fontSize: 11.5, fontWeight: '800', color: colors.textFaint, letterSpacing: 1, marginBottom: 10 },

  cardList: {
    backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 22,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  toggleIcon: {
    width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  toggleLabel: { fontSize: 14.5, fontWeight: '700', color: colors.textDark, flex: 1 },
  toggleDesc: { fontSize: 12, color: colors.textLight, fontWeight: '500', marginTop: 2 },

  statusRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statusCard: {
    flex: 1, backgroundColor: colors.primaryPale, borderRadius: 16, padding: 14, gap: 8,
  },
  statusTitle: { fontSize: 14.5, fontWeight: '800', color: colors.textDark },
  statusDesc: { fontSize: 12, color: colors.textMid, fontWeight: '500' },

  emailCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 24, gap: 8,
  },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emailDesc: { fontSize: 12, color: colors.textLight, fontWeight: '500', lineHeight: 17 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  saveBtnDone: { backgroundColor: '#1EA868', shadowColor: '#1EA868' },
  saveBtnText: { color: colors.white, fontSize: 15.5, fontWeight: '800' },
});
