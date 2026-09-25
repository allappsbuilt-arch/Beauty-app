import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { toUploadable } from '../utils/photo';

// Live camera preview used wherever the app shows the user's own face.
// - asks for permission as soon as it mounts
// - only runs the camera while its screen is focused (screens stay mounted
//   in the navigation stack, and each one would otherwise hold the camera)
// - shows a clear state when access is denied or no camera is available
// Parent screens call `ref.current.capture()` to get an upload-ready photo.
//
// status: 'starting' | 'ready' | 'denied' | 'unavailable'
const LiveCamera = forwardRef(function LiveCamera(
  { style, facing = 'front', flash = false, onStatusChange, children },
  ref
) {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [mountError, setMountError] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission, requestPermission]);

  // Switching camera or leaving the screen tears the preview down.
  useEffect(() => { setReady(false); }, [facing, isFocused]);

  const granted = !!permission?.granted;
  const status = mountError ? 'unavailable'
    : permission && !granted ? 'denied'
    : ready ? 'ready'
    : 'starting';

  useEffect(() => { onStatusChange?.(status); }, [status, onStatusChange]);

  useImperativeHandle(ref, () => ({
    isReady: () => ready,
    async capture() {
      if (!ready || !cameraRef.current) throw new Error('The camera is not ready yet.');
      const shot = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      return toUploadable(shot.uri, shot.width, shot.height);
    },
  }), [ready]);

  const showCamera = granted && isFocused && !mountError;

  return (
    <View style={[s.wrap, style]}>
      {showCamera ? (
        <CameraView
          key={facing}
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash ? 'on' : 'off'}
          mirror={facing === 'front'}
          onCameraReady={() => setReady(true)}
          onMountError={(e) => setMountError(e?.message || 'Camera unavailable')}
        />
      ) : (
        <View style={s.fallback}>
          <Ionicons
            name={status === 'unavailable' ? 'videocam-off-outline' : status === 'denied' ? 'lock-closed-outline' : 'camera-outline'}
            size={30}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={s.fallbackTitle}>
            {status === 'unavailable' ? 'No camera available'
              : status === 'denied' ? 'Camera access is off'
              : 'Starting camera…'}
          </Text>
          {status === 'denied' && (
            permission?.canAskAgain ? (
              <TouchableOpacity style={s.btn} onPress={requestPermission} accessibilityRole="button">
                <Text style={s.btnText}>Allow Camera</Text>
              </TouchableOpacity>
            ) : Platform.OS !== 'web' ? (
              <TouchableOpacity style={s.btn} onPress={() => Linking.openSettings()} accessibilityRole="button">
                <Text style={s.btnText}>Open Settings</Text>
              </TouchableOpacity>
            ) : (
              <Text style={s.hint}>Allow camera access in your browser's address bar.</Text>
            )
          )}
          {status === 'unavailable' && <Text style={s.hint}>You can upload a photo instead.</Text>}
        </View>
      )}
      {children}
    </View>
  );
});

export default LiveCamera;

const s = StyleSheet.create({
  wrap: { backgroundColor: '#1C1418', overflow: 'hidden' },
  fallback: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16 },
  fallbackTitle: { color: colors.white, fontSize: 14, fontWeight: '700' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: 13 },
});
