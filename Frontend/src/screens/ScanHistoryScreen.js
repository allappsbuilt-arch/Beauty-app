import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

export default function ScanHistoryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <ScreenHeader
        title="Scan History"
        onBack={() => navigation?.goBack()}
        onClose={() => navigation?.goBack()}
      />

      <View style={styles.body}>
        <View style={styles.illustration}>
          <View style={styles.corner} pointerEvents="none" />
          <Ionicons name="scan-outline" size={40} color={colors.primary} style={styles.scanIcon} />
        </View>

        <Text style={styles.title}>Your Journey Starts Here</Text>
        <Text style={styles.desc}>
          Take your first face scan to start tracking your skin, hair, and brow progress over time.
        </Text>

        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('ScanFace')}
          accessibilityRole="button"
          accessibilityLabel="Start your first scan"
        >
          <Text style={styles.ctaText}>Start Your First Scan</Text>
        </TouchableOpacity>
        <Text style={styles.ctaHint}>TAKES LESS THAN 30 SECONDS</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  illustration: {
    width: 180, height: 180, borderRadius: 24, marginBottom: 28,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  corner: {
    position: 'absolute', top: 24, left: 24, right: 24, bottom: 24,
    borderWidth: 2, borderColor: colors.primaryPaleDeep, borderRadius: 16,
  },
  scanIcon: { opacity: 0.85 },

  title: { fontSize: 22, fontWeight: '800', color: colors.textDark, textAlign: 'center', marginBottom: 10 },
  desc: { fontSize: 14, color: colors.textMid, textAlign: 'center', lineHeight: 21, marginBottom: 26 },

  cta: {
    alignSelf: 'stretch', backgroundColor: colors.primary, borderRadius: 100,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  ctaText: { color: colors.white, fontSize: 15.5, fontWeight: '800' },
  ctaHint: { fontSize: 11, fontWeight: '700', color: colors.textFaint, letterSpacing: 0.8, marginTop: 12 },
});
