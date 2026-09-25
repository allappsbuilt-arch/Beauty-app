import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  Image, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthedRequest } from '../api/useAuthedRequest';
import SelfieFrame from '../components/SelfieFrame';
import ErrorBanner from '../components/ErrorBanner';
import {
  ToolNav, ToolHeading, PrimaryButton, SecondaryButton, Pill, BeforeAfter, InfoNote, toolStyles,
} from '../components/ToolKit';
import { useSelfie } from '../utils/useSelfie';
import { saveImage } from '../utils/photo';

const TRY_ON_TIMEOUT_MS = 150000;

function LookChip({ look, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.look, selected && styles.lookSelected]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={look.label}
    >
      <Image source={{ uri: look.uri }} style={styles.lookImage} resizeMode="cover" />
      <Text style={[styles.lookLabel, selected && styles.lookLabelSelected]} numberOfLines={1}>{look.label}</Text>
      {selected && (
        <View style={styles.lookCheck}>
          <Ionicons name="checkmark" size={12} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function VirtualTryOnScreen({ navigation, route }) {
  const request = useAuthedRequest();
  const selfie = useSelfie();

  const [looks, setLooks] = useState([]);
  const [looksError, setLooksError] = useState(null);
  const [lookKey, setLookKey] = useState(route?.params?.lookKey ?? null);
  const [intensity, setIntensity] = useState('natural');
  const [result, setResult] = useState(null); // { image, lookKey, label, intensity }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLooks = async () => {
    setLooksError(null);
    try {
      const data = await request('/api/makeup/looks');
      setLooks(data.looks);
      setLookKey((k) => k ?? data.looks[0]?.key ?? null);
    } catch (err) {
      setLooksError(err.message || 'Could not load looks.');
    }
  };

  useEffect(() => { loadLooks(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const selectedLook = looks.find((l) => l.key === lookKey);

  const tryOn = async () => {
    if (!selectedLook || loading) return;
    setError(null);
    const image = await selfie.getPhoto();
    if (!image) return;
    setLoading(true);
    try {
      const out = await request('/api/makeup/try-on', {
        method: 'POST',
        body: { image, lookKey: selectedLook.key, intensity },
        timeoutMs: TRY_ON_TIMEOUT_MS,
      });
      setResult({ ...out, intensity });
    } catch (err) {
      setError(err.message || 'Could not apply the look. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => { selfie.reset(); setResult(null); setError(null); };
  const isCurrent = result && result.lookKey === lookKey && result.intensity === intensity;

  return (
    <SafeAreaView style={toolStyles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />
      <ToolNav navigation={navigation} />

      <ScrollView contentContainerStyle={toolStyles.content} showsVerticalScrollIndicator={false}>
        <ToolHeading
          eyebrow="VIRTUAL TRY-ON"
          title="Try a Look On"
          subtitle="Pick a look, take a selfie or upload one, and see it applied to your own face."
        />

        {result ? (
          <BeforeAfter before={selfie.photo} after={result.image} afterLabel={result.label} />
        ) : (
          <SelfieFrame
            cameraRef={selfie.cameraRef}
            photo={selfie.photo}
            onRetake={retake}
            onGallery={selfie.pickFromGallery}
          >
            <View style={styles.alignPill} pointerEvents="none">
              <Text style={styles.alignPillText}>{selfie.photo ? 'Your Photo' : 'Align Your Face'}</Text>
            </View>
          </SelfieFrame>
        )}

        <Text style={toolStyles.sectionTitle}>CHOOSE A LOOK</Text>
        <ErrorBanner message={looksError} onRetry={loadLooks} onDismiss={() => setLooksError(null)} />
        {looks.length === 0 && !looksError ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lookRow}>
            {looks.map((l) => (
              <LookChip key={l.key} look={l} selected={l.key === lookKey} onPress={() => setLookKey(l.key)} />
            ))}
          </ScrollView>
        )}
        {selectedLook && <Text style={styles.lookDesc}>{selectedLook.label}: {selectedLook.description}.</Text>}

        <Text style={toolStyles.sectionTitle}>INTENSITY</Text>
        <View style={toolStyles.pillRow}>
          <Pill label="Natural" active={intensity === 'natural'} onPress={() => setIntensity('natural')} />
          <Pill label="Bold" active={intensity === 'bold'} onPress={() => setIntensity('bold')} />
        </View>

        <ErrorBanner message={error} onRetry={tryOn} onDismiss={() => setError(null)} />

        <PrimaryButton
          label={result ? (isCurrent ? 'Apply Again' : 'Apply This Look') : 'Try It On'}
          icon="color-palette-outline"
          onPress={tryOn}
          loading={loading}
          loadingLabel="Applying your look… (up to a minute)"
          disabled={!selectedLook}
        />

        {result && (
          <View style={toolStyles.row}>
            <SecondaryButton label="Save" icon="download-outline" onPress={() => saveImage(result.image, `tryon-${result.lookKey}`)} />
            <SecondaryButton label="New Photo" icon="camera-reverse-outline" onPress={retake} />
          </View>
        )}

        <View style={toolStyles.row}>
          <SecondaryButton
            label="Find Looks for an Occasion"
            icon="sparkles-outline"
            onPress={() => navigation?.navigate('OccasionPicker')}
          />
        </View>

        <InfoNote icon="lock-closed-outline">
          Your photo is sent to our AI only to render the look and is never stored.
        </InfoNote>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  alignPill: {
    position: 'absolute', top: 12, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6,
  },
  alignPillText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  lookRow: { paddingHorizontal: 16, gap: 10 },
  look: {
    width: 92, borderRadius: 14, padding: 4, backgroundColor: colors.white,
    borderWidth: 2, borderColor: colors.borderLight,
  },
  lookSelected: { borderColor: colors.primary },
  lookImage: { width: '100%', aspectRatio: 1, borderRadius: 10, backgroundColor: colors.sectionBg },
  lookLabel: { fontSize: 11.5, fontWeight: '700', color: colors.textMid, textAlign: 'center', marginVertical: 5 },
  lookLabelSelected: { color: colors.primary },
  lookCheck: {
    position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  lookDesc: { marginHorizontal: 20, marginTop: 10, fontSize: 13, color: colors.textMid, lineHeight: 19 },
});
