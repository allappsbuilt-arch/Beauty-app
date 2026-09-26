import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';

// Update this date whenever the terms below change.
const LAST_UPDATED = 'September 26, 2026';

const SECTIONS = [
  {
    title: '1. Accepting these terms',
    body: [
      'By creating an account or using MyFace AI ("the app"), you agree to these Terms of Service. If you do not agree, please do not use the app.',
      'If you are under 18, you may use the app only with the permission of a parent or guardian, who agrees to these terms on your behalf. Teenage Mode in Settings offers extra protections for younger users.',
    ],
  },
  {
    title: '2. Cosmetic guidance only — not medical advice',
    body: [
      'Face scans, scores, routines, coach messages and product or ingredient suggestions are for general cosmetic and wellness purposes only. They are not a medical diagnosis, treatment or professional advice.',
      'AI analysis can be wrong. Always patch-test new products, and see a dermatologist or doctor about any skin, hair or health concern, reaction or allergy.',
    ],
  },
  {
    title: '3. Your account',
    body: [
      'Give accurate information when you sign up and keep your password private. You are responsible for activity on your account.',
      'You can delete your account at any time from Settings → Privacy Settings. Deleting it removes your profile, scans and other saved data.',
    ],
  },
  {
    title: '4. Photos and AI processing',
    body: [
      'When you take a face scan or use a photo tool, your photo is sent securely to our servers and to our AI provider (OpenAI) to produce the analysis. Scan results are saved to your account so you can track progress.',
      'Only upload photos of yourself, or of people who have agreed to it. Do not upload images of anyone under 18 other than yourself.',
    ],
  },
  {
    title: '5. Community and content you share',
    body: [
      'You keep ownership of the posts, photos and comments you share. You give us permission to store and display them in the app so the features work.',
      'Do not post anything illegal, hateful, harassing, sexually explicit, or that infringes someone else\'s rights. We may remove content or suspend accounts that break these rules.',
    ],
  },
  {
    title: '6. Points and rewards',
    body: [
      'Points, streaks, levels and referral rewards have no cash value and cannot be sold or transferred. We may adjust or remove points earned through misuse, such as fake referrals.',
    ],
  },
  {
    title: '7. Acceptable use',
    body: [
      'Do not misuse the app — for example by trying to access other people\'s accounts or data, disrupting the service, or copying or reverse-engineering it.',
    ],
  },
  {
    title: '8. Changes and availability',
    body: [
      'We may update the app and these terms. If we make important changes we will let you know in the app; continuing to use it means you accept the updated terms.',
      'We work to keep the app running but cannot promise it will always be available or error-free.',
    ],
  },
  {
    title: '9. Limitation of liability',
    body: [
      'To the extent allowed by law, the app is provided "as is", and we are not liable for indirect or consequential losses, or for any reaction to products or routines you choose to use.',
    ],
  },
];

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader
        title="Terms of Service"
        onBack={navigation?.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Text style={styles.heading} accessibilityRole="header">MyFace AI Terms of Service</Text>
          <Text style={styles.updated}>Last updated {LAST_UPDATED}</Text>

          {SECTIONS.map((s) => (
            <View key={s.title} style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{s.title}</Text>
              {s.body.map((p, i) => (
                <Text key={i} style={styles.para}>{p}</Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textDark, letterSpacing: -0.3 },
  updated: { fontSize: 12.5, color: colors.textLight, fontWeight: '600', marginTop: 6, marginBottom: 18 },
  section: {
    backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight,
    padding: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 15.5, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  para: { fontSize: 14, lineHeight: 21, color: colors.textMid, marginBottom: 6 },
});
