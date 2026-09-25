import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import LiveCamera from './LiveCamera';

function RoundBtn({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={s.btn} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={19} color={colors.white} />
    </TouchableOpacity>
  );
}

// The user's face: a live camera preview, or — once a photo has been taken or
// chosen — that photo with a Retake button. `children` render as overlays.
export default function SelfieFrame({ cameraRef, photo, onRetake, onGallery, aspectRatio = 1.05, style, children }) {
  const [facing, setFacing] = useState('front');

  return (
    <View style={[s.card, style]}>
      {photo ? (
        <Image source={{ uri: photo }} style={[s.media, { aspectRatio }]} resizeMode="cover" />
      ) : (
        <LiveCamera ref={cameraRef} facing={facing} style={[s.media, { aspectRatio }]} />
      )}
      {children}
      <View style={s.actions}>
        {onGallery && <RoundBtn icon="images-outline" label="Choose a photo from your library" onPress={onGallery} />}
        {photo ? (
          <RoundBtn icon="refresh" label="Retake photo" onPress={onRetake} />
        ) : (
          <RoundBtn
            icon="camera-reverse-outline"
            label="Switch camera"
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', position: 'relative', backgroundColor: '#1C1418' },
  media: { width: '100%' },
  actions: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', gap: 8 },
  btn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
});
