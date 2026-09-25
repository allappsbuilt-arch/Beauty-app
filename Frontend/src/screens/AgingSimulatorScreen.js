import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';
import { goToTab } from '../utils/navigation';
import { useAuthedRequest } from '../api/useAuthedRequest';
import SelfieFrame from '../components/SelfieFrame';
import ErrorBanner from '../components/ErrorBanner';
import {
  ToolNav, ToolHeading, PrimaryButton, SecondaryButton, Pill, BeforeAfter, InfoNote, toolStyles,
} from '../components/ToolKit';
import { useSelfie } from '../utils/useSelfie';
import { saveImage } from '../utils/photo';

const TIMEOUT_MS = 150000;
const SCENARIOS = [
  { key: 'care', label: 'With skincare', desc: 'Daily SPF, hydration and a retinoid' },
  { key: 'nocare', label: 'Without skincare', desc: 'No sunscreen or routine' },
];

export default function AgingSimulatorScreen({ navigation }) {
  const request = useAuthedRequest();
  const selfie = useSelfie();
  const [years, setYears] = useState(10);
  const [scenario, setScenario] = useState('care');
  // Results are cached per years+scenario so switching back is instant.
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const key = `${years}-${scenario}`;
  const current = results[key];

  const simulate = async () => {
    if (loading) return;
    setError(null);
    const image = await selfie.getPhoto();
    if (!image) return;
    setLoading(true);
    try {
      const out = await request('/api/visualizers/aging', {
        method: 'POST',
        body: { image, years, scenario },
        timeoutMs: TIMEOUT_MS,
      });
      setResults((r) => ({ ...r, [key]: out.image }));
    } catch (err) {
      setError(err.message || 'Could not run the simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => { selfie.reset(); setResults({}); setError(null); };
  const scenarioInfo = SCENARIOS.find((s) => s.key === scenario);

  return (
    <SafeAreaView style={toolStyles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primaryBg} />
      <ToolNav navigation={navigation} />

      <ScrollView contentContainerStyle={toolStyles.content} showsVerticalScrollIndicator={false}>
        <ToolHeading
          eyebrow="AI VISUALIZER"
          title="Aging Simulator"
          subtitle="See how your skin could look in 10–20 years — and what a consistent routine changes."
        />

        {current ? (
          <BeforeAfter before={selfie.photo} after={current} afterLabel={`+${years} yrs`} />
        ) : (
          <SelfieFrame
            cameraRef={selfie.cameraRef}
            photo={selfie.photo}
            onRetake={retake}
            onGallery={selfie.pickFromGallery}
          />
        )}

        <Text style={toolStyles.sectionTitle}>YEARS AHEAD</Text>
        <View style={toolStyles.pillRow}>
          {[10, 20].map((y) => (
            <Pill key={y} label={`+${y} years`} active={years === y} onPress={() => setYears(y)} />
          ))}
        </View>

        <Text style={toolStyles.sectionTitle}>SCENARIO</Text>
        <View style={toolStyles.pillRow}>
          {SCENARIOS.map((s) => (
            <Pill key={s.key} label={s.label} active={scenario === s.key} onPress={() => setScenario(s.key)} />
          ))}
        </View>
        <Text style={styles.desc}>{scenarioInfo.desc}</Text>

        <ErrorBanner message={error} onRetry={simulate} onDismiss={() => setError(null)} />

        <PrimaryButton
          label={current ? 'Run Again' : 'Simulate'}
          icon="time-outline"
          onPress={simulate}
          loading={loading}
          loadingLabel="Simulating… (up to a minute)"
        />

        {selfie.photo && (
          <View style={toolStyles.row}>
            <SecondaryButton
              label="Save"
              icon="download-outline"
              disabled={!current}
              onPress={() => saveImage(current, `aging-${key}`)}
            />
            <SecondaryButton label="New Photo" icon="camera-reverse-outline" onPress={retake} />
          </View>
        )}

        <View style={toolStyles.row}>
          <SecondaryButton label="Build My Routine" icon="calendar-outline" onPress={() => goToTab(navigation, 'Routine')} />
        </View>

        <InfoNote>
          This is an AI illustration, not a medical prediction. Your photo is never stored.
        </InfoNote>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  desc: { marginHorizontal: 20, marginTop: 8, fontSize: 13, color: colors.textLight },
});
