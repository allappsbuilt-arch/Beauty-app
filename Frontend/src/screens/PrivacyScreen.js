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

const HERO_URI = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=60';

export default function PrivacyScreen({ navigation }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1800);
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
        <Text style={styles.heading}>Privacy & Transparency</Text>
        <Text style={styles.subheading}>
          Manage your data and understand how we protect your biometric information.
        </Text>

        <View style={styles.heroWrap}>
          <Image source={{ uri: HERO_URI }} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={19} color={colors.primary} />
            <Text style={styles.cardTitle}>Secure Biometrics</Text>
          </View>
          <Text style={styles.cardBody}>
            Your face scan data is processed locally on your device before being converted into a unique mathematical representation. This data is encrypted with AES-256 standards and is never accessible to employees or third parties.
          </Text>
          <View style={styles.encryptPill}>
            <Ionicons name="lock-closed" size={13} color={colors.primary} />
            <Text style={styles.encryptText}>End-to-End Encryption Enabled</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={handleDownload}
          activeOpacity={0.85}
          disabled={downloading}
          accessibilityRole="button"
          accessibilityLabel="Download your data"
        >
          <Ionicons name={downloading ? 'hourglass-outline' : 'download-outline'} size={17} color={colors.white} />
          <Text style={styles.downloadBtnText}>{downloading ? 'Preparing…' : 'Download Data'}</Text>
        </TouchableOpacity>
        <Text style={styles.downloadHint}>
          Receive a ZIP file containing all your activity logs and scan metadata.
        </Text>

        <View style={styles.rowCard}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation?.navigate('ScanHistory')}
            accessibilityRole="button"
            accessibilityLabel="Data history"
          >
            <Ionicons name="time-outline" size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Data History</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.row} accessibilityRole="button" accessibilityLabel="Processing insights">
            <Ionicons name="bar-chart-outline" size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Processing Insights</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.row} accessibilityRole="button" accessibilityLabel="Privacy policy">
            <Ionicons name="document-text-outline" size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>
        </View>

        <View style={styles.deleteWrap}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Delete account">
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteHint}>This action is permanent and cannot be undone.</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },

  heading: { fontSize: 24, fontWeight: '800', color: colors.textDark, letterSpacing: -0.3 },
  subheading: { fontSize: 13.5, color: colors.textMid, lineHeight: 20, marginTop: 6, marginBottom: 18 },

  heroWrap: { height: 210, borderRadius: 18, overflow: 'hidden', marginBottom: 22 },
  heroImage: { width: '100%', height: '100%' },

  card: {
    backgroundColor: colors.white, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 22,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  cardBody: { fontSize: 13.5, lineHeight: 21, color: colors.textMid, marginBottom: 14 },
  encryptPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: colors.primaryPale, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 7,
  },
  encryptText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 100, paddingVertical: 16,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  downloadBtnText: { color: colors.white, fontSize: 15.5, fontWeight: '800' },
  downloadHint: { fontSize: 12.5, color: colors.textLight, textAlign: 'center', marginTop: 10, marginBottom: 22, lineHeight: 18 },

  rowCard: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 14, marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowIcon: { width: 20 },
  rowLabel: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.textDark },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderUltraLight },

  deleteWrap: { alignItems: 'center', marginTop: 24, gap: 6 },
  deleteText: { fontSize: 15, fontWeight: '800', color: '#D03050' },
  deleteHint: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
});
