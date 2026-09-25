import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthedRequest } from '../api/useAuthedRequest';
import SelfieFrame from '../components/SelfieFrame';
import ErrorBanner from '../components/ErrorBanner';
import { ToolNav, ToolHeading, PrimaryButton, SecondaryButton, InfoNote, toolStyles } from '../components/ToolKit';
import { useSelfie } from '../utils/useSelfie';

const FEATURE_META = {
  eyes: { label: 'Eyes', icon: 'eye-outline' },
  brows: { label: 'Brows', icon: 'brush-outline' },
  nose: { label: 'Nose', icon: 'triangle-outline' },
  lips: { label: 'Lips', icon: 'happy-outline' },
  jawline: { label: 'Jawline', icon: 'body-outline' },
  cheeks: { label: 'Cheeks', icon: 'ellipse-outline' },
};

function FeatureRow({ feature, isLast }) {
  const meta = FEATURE_META[feature.key] ?? { label: feature.key, icon: 'ellipse-outline' };
  return (
    <View style={[styles.featureRow, !isLast && styles.featureDivider]}>
      <View style={styles.featureIcon}>
        <Ionicons name={meta.icon} size={17} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.featureTop}>
          <Text style={styles.featureLabel}>{meta.label}</Text>
          <Text style={styles.featureScore}>{feature.score}</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${feature.score}%` }]} />
        </View>
        <Text style={styles.featureNote}>{feature.note}</Text>
      </View>
    </View>
  );
}

export default function SymmetryCheckScreen({ navigation }) {
  const request = useAuthedRequest();
  const selfie = useSelfie();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (loading) return;
    setError(null);
    const image = await selfie.getPhoto();
    if (!image) return;
    setLoading(true);
    try {
      setResult(await request('/api/visualizers/symmetry', { method: 'POST', body: { image } }));
    } catch (err) {
      setError(err.message || 'Could not analyse your photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => { selfie.reset(); setResult(null); setError(null); };

  return (
    <SafeAreaView style={toolStyles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />
      <ToolNav navigation={navigation} />

      <ScrollView contentContainerStyle={toolStyles.content} showsVerticalScrollIndicator={false}>
        <ToolHeading
          eyebrow="FACE ANALYSIS"
          title="Symmetry Check"
          subtitle="Analyse the balance of your features and get grooming tips that play to it."
        />

        <SelfieFrame
          cameraRef={selfie.cameraRef}
          photo={selfie.photo}
          onRetake={retake}
          onGallery={selfie.pickFromGallery}
        />

        <ErrorBanner message={error} onRetry={analyze} onDismiss={() => setError(null)} />

        <PrimaryButton
          label={result ? 'Analyse Again' : 'Analyse My Symmetry'}
          icon="scan-outline"
          onPress={analyze}
          loading={loading}
          loadingLabel="Analysing…"
        />

        {result && (
          <>
            <View style={[toolStyles.card, styles.scoreCard]}>
              <Text style={styles.scoreValue}>{result.overall}</Text>
              <Text style={styles.scoreLabel}>BALANCE SCORE</Text>
              <Text style={styles.summary}>{result.summary}</Text>
            </View>

            <Text style={toolStyles.sectionTitle}>BY FEATURE</Text>
            <View style={[toolStyles.card, { marginTop: 0, paddingVertical: 4 }]}>
              {result.features.map((f, i) => (
                <FeatureRow key={f.key} feature={f} isLast={i === result.features.length - 1} />
              ))}
            </View>

            {result.tips.length > 0 && (
              <>
                <Text style={toolStyles.sectionTitle}>BALANCING TIPS</Text>
                <View style={[toolStyles.card, { marginTop: 0, gap: 10 }]}>
                  {result.tips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginTop: 2 }} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <View style={toolStyles.row}>
              <SecondaryButton label="Brow Styles" icon="brush-outline" onPress={() => navigation?.navigate('BrowAnalysis')} />
              <SecondaryButton label="New Photo" icon="camera-reverse-outline" onPress={retake} />
            </View>
          </>
        )}

        <InfoNote>
          Perfect symmetry is rare — nearly every face scores between 80 and 95. Your photo is never stored.
        </InfoNote>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scoreCard: { alignItems: 'center', marginTop: 16 },
  scoreValue: { fontSize: 44, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
  scoreLabel: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.2 },
  summary: { fontSize: 13.5, color: colors.textMid, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  featureRow: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  featureDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderUltraLight },
  featureIcon: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primaryPale,
    justifyContent: 'center', alignItems: 'center',
  },
  featureTop: { flexDirection: 'row', justifyContent: 'space-between' },
  featureLabel: { fontSize: 14, fontWeight: '800', color: colors.textDark },
  featureScore: { fontSize: 14, fontWeight: '800', color: colors.primary },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.roseDark, marginVertical: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  featureNote: { fontSize: 12.5, color: colors.textLight, lineHeight: 17 },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipText: { flex: 1, fontSize: 13, color: colors.textMid, lineHeight: 19 },
});
