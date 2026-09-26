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
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import InitialsAvatar from '../components/InitialsAvatar';
import { notify } from '../utils/feedback';
import { usePreferences } from '../api/usePreferences';

function SettingsRow({ icon, label, value, onPress, isLast, right }) {
  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        {right ?? (
          <>
            {value && <Text style={styles.rowValue}>{value}</Text>}
            {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />}
          </>
        )}
      </TouchableOpacity>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

function ReminderRow({ icon, label, time, isLast }) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={styles.timePill}>
          <Text style={styles.timePillText}>{time}</Text>
        </View>
      </View>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

function EditNameModal({ visible, initialName, onCancel, onSave }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  // Reset the field each time the dialog opens.
  React.useEffect(() => { if (visible) setName(initialName); }, [visible, initialName]);

  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(name.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <Text style={styles.modalLabel}>NAME</Text>
          <TextInput
            style={styles.modalInput}
            value={name}
            onChangeText={setName}
            maxLength={60}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={save}
            placeholder="Your name"
            placeholderTextColor={colors.textPlaceholder}
            accessibilityLabel="Name"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={onCancel}
              accessibilityRole="button" accessibilityLabel="Cancel">
              <Text style={[styles.modalBtnText, styles.modalBtnGhostText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, !name.trim() && { opacity: 0.5 }]} onPress={save}
              disabled={!name.trim() || saving} accessibilityRole="button" accessibilityLabel="Save profile">
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen({ navigation }) {
  const { prefs } = usePreferences();
  const teenageMode = !!prefs?.teenControls.enabled;
  const { user, logout, updateProfile } = useAuth();
  const [editingName, setEditingName] = useState(false);

  const saveName = async (name) => {
    try {
      await updateProfile({ name });
      setEditingName(false);
    } catch (err) {
      notify('Could not update your profile', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="Settings"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Profile ── */}
        <View style={styles.profileCard}>
          <InitialsAvatar name={user?.name} />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{user?.name ?? ''}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => setEditingName(true)}
          >
            <Ionicons name="pencil" size={15} color={colors.textMid} />
          </TouchableOpacity>
        </View>

        {/* ── Account & privacy ── */}
        <Text style={styles.sectionTitle}>ACCOUNT & PRIVACY</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="person-outline"
            label="Account Details"
            onPress={() => notify('Account details', `${user?.name ?? ''}\n${user?.email ?? ''}${user?.createdAt ? `\nMember since ${new Date(user.createdAt).toLocaleDateString()}` : ''}`)}
          />
          <SettingsRow
            icon="lock-closed-outline"
            label="Privacy Settings"
            onPress={() => navigation?.navigate('Privacy')}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Teenage Mode"
            isLast
            right={
              <View style={styles.teenRight}>
                <View style={[styles.statusPill, teenageMode && styles.statusPillOn]}>
                  <Text style={[styles.statusPillText, teenageMode && styles.statusPillTextOn]}>
                    {teenageMode ? 'ON' : 'OFF'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />
              </View>
            }
            onPress={() => navigation?.navigate('TeenageControls')}
          />
        </View>

        {/* ── Routine reminders ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ROUTINE REMINDERS</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Notifications')} accessibilityRole="button" accessibilityLabel="Edit all reminders">
            <Text style={styles.editAll}>Edit All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <ReminderRow icon="sunny-outline" label="Morning Routine" time="07:30" />
          <ReminderRow icon="moon-outline" label="Night Routine" time="22:15" isLast />
        </View>

        {/* ── Integrations ── */}
        <Text style={styles.sectionTitle}>INTEGRATIONS</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            isLast
            onPress={() => navigation?.navigate('Notifications')}
          />
        </View>

        {/* ── System ── */}
        <Text style={styles.sectionTitle}>SYSTEM</Text>
        <View style={styles.card}>
          <SettingsRow icon="server-outline" label="Data & Storage" onPress={() => navigation?.navigate('Privacy')} />
          <SettingsRow icon="document-text-outline" label="Terms of Service" isLast onPress={() => navigation?.navigate('Terms')} />
        </View>

        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.8}
          onPress={() => logout()}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>MYFACE AI VERSION 2.4.0</Text>

        <View style={{ height: 24 }} />
      </ScrollView>
      <EditNameModal
        visible={editingName}
        initialName={user?.name ?? ''}
        onCancel={() => setEditingName(false)}
        onSave={saveName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 22,
  },
  profileText: { flex: 1 },
  profileName: { fontSize: 16.5, fontWeight: '800', color: colors.textDark },
  profileEmail: { fontSize: 12.5, color: colors.textLight, fontWeight: '500', marginTop: 2 },
  editBtn: {
    width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.sectionBg,
  },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 11.5, fontWeight: '800', color: colors.textFaint, letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  editAll: { fontSize: 12.5, fontWeight: '700', color: colors.primary, marginBottom: 10 },

  card: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 14,
    marginBottom: 22,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderUltraLight },
  rowIcon: {
    width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  rowLabel: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.textDark },
  rowValue: { fontSize: 13, color: colors.textLight, fontWeight: '600', marginRight: 4 },

  teenRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.sectionBg },
  statusPillOn: { backgroundColor: '#E7F7EE' },
  statusPillText: { fontSize: 11, fontWeight: '800', color: colors.textFaint },
  statusPillTextOn: { color: '#1EA868' },

  timePill: {
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5, borderColor: colors.primaryPaleDeep,
  },
  timePillText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  signOutBtn: {
    borderRadius: 100, paddingVertical: 15, alignItems: 'center', marginTop: 4,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  signOutText: { fontSize: 15, fontWeight: '800', color: colors.primary },
  version: { textAlign: 'center', fontSize: 11.5, color: colors.textPlaceholder, fontWeight: '600', marginTop: 18 },

  // ── Edit profile dialog ──
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(30,16,20,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalSheet: { width: '100%', maxWidth: 360, backgroundColor: colors.white, borderRadius: 18, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginBottom: 14 },
  modalLabel: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.1, marginBottom: 6 },
  modalInput: {
    borderWidth: 1.5, borderColor: colors.borderLight, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.textDark, backgroundColor: colors.sectionBg,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 12,
  },
  modalBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  modalBtnGhost: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  modalBtnGhostText: { color: colors.textMid },
});
