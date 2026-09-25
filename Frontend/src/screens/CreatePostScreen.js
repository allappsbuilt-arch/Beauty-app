import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity,
  Image, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import ErrorBanner from '../components/ErrorBanner';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/social/UserAvatar';
import { POST_TAGS, STORY_COLORS, tagColors } from '../components/social/socialUtils';
import { emitFeedStale } from '../components/social/socialEvents';
import { choosePhoto } from '../utils/photo';
import { confirm } from '../utils/feedback';

const MAX_CAPTION = 500;
const MAX_STORY = 200;

export default function CreatePostScreen({ navigation, route }) {
  const request = useAuthedRequest();
  const { user } = useAuth();
  const [mode, setMode] = useState(route?.params?.mode === 'story' ? 'story' : 'post');
  const [text, setText] = useState('');
  const [tag, setTag] = useState(null);
  const [bg, setBg] = useState(STORY_COLORS[0]);
  const [photo, setPhoto] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const isStory = mode === 'story';
  const max = isStory ? MAX_STORY : MAX_CAPTION;
  const trimmed = text.trim();
  const canPost = (trimmed.length > 0 || !!photo) && text.length <= max && !posting;

  const addPhoto = async () => {
    const image = await choosePhoto(isStory ? 'Add a photo to your story' : 'Add a photo to your post');
    if (image) setPhoto(image);
  };

  const leave = async () => {
    if ((trimmed || photo) && !posting) {
      const ok = await confirm('Discard?', `Your ${isStory ? 'story' : 'post'} hasn't been shared yet.`, 'Discard');
      if (!ok) return;
    }
    navigation?.goBack();
  };

  const submit = async () => {
    if (!canPost) return;
    setError(null);
    setPosting(true);
    try {
      if (isStory) {
        await request('/api/social/stories', { method: 'POST', body: { text: trimmed, bg, image: photo || undefined }, timeoutMs: 90000 });
      } else {
        await request('/api/social/posts', { method: 'POST', body: { caption: trimmed, tag, image: photo || undefined }, timeoutMs: 90000 });
        emitFeedStale();
      }
      navigation?.goBack();
    } catch (err) {
      setError(err.message || 'Could not share. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScreenHeader
        title={isStory ? 'New Story' : 'New Post'}
        onBack={leave}
        right={
          <TouchableOpacity style={[styles.shareBtn, !canPost && { opacity: 0.45 }]} onPress={submit} disabled={!canPost}
            accessibilityRole="button" accessibilityLabel={isStory ? 'Share story' : 'Share post'}>
            {posting ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.shareBtnText}>Share</Text>}
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Post / Story switch */}
          <View style={styles.segment}>
            {['post', 'story'].map((m) => (
              <TouchableOpacity key={m} style={[styles.segmentBtn, mode === m && styles.segmentBtnActive]} onPress={() => setMode(m)}
                accessibilityRole="tab" accessibilityState={{ selected: mode === m }} accessibilityLabel={m === 'post' ? 'Post' : 'Story'}>
                <Ionicons name={m === 'post' ? 'images-outline' : 'aperture-outline'} size={15} color={mode === m ? colors.white : colors.textMid} />
                <Text style={[styles.segmentText, mode === m && styles.segmentTextActive]}>{m === 'post' ? 'Post' : 'Story'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ErrorBanner message={error} onRetry={submit} onDismiss={() => setError(null)} />

          {isStory ? (
            /* Live story preview */
            <View style={[styles.storyPreview, { backgroundColor: bg }]}>
              {photo ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
              <TextInput
                style={[styles.storyInput, photo && styles.storyInputOnPhoto]}
                placeholder="Share a moment…"
                placeholderTextColor="rgba(255,255,255,0.75)"
                value={text}
                onChangeText={setText}
                maxLength={MAX_STORY}
                multiline
                textAlign="center"
                accessibilityLabel="Story text"
              />
            </View>
          ) : (
            <View style={styles.composer}>
              <UserAvatar user={user} size={42} />
              <TextInput
                style={styles.captionInput}
                placeholder="Share your routine, progress or a question…"
                placeholderTextColor={colors.textPlaceholder}
                value={text}
                onChangeText={setText}
                maxLength={MAX_CAPTION}
                multiline
                accessibilityLabel="Post text"
              />
            </View>
          )}
          <Text style={styles.counter}>{text.length}/{max}</Text>

          {/* Photo */}
          {photo && !isStory ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)} accessibilityRole="button" accessibilityLabel="Remove photo">
                <Ionicons name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.row}>
            <TouchableOpacity style={styles.photoBtn} onPress={addPhoto} accessibilityRole="button" accessibilityLabel={photo ? 'Change photo' : 'Add photo'}>
              <Ionicons name="camera-outline" size={18} color={colors.primary} />
              <Text style={styles.photoBtnText}>{photo ? 'Change Photo' : 'Add Photo'}</Text>
            </TouchableOpacity>
            {photo && isStory && (
              <TouchableOpacity style={styles.photoBtn} onPress={() => setPhoto(null)} accessibilityRole="button" accessibilityLabel="Remove photo">
                <Ionicons name="trash-outline" size={18} color={colors.primary} />
                <Text style={styles.photoBtnText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          {isStory ? (
            !photo && (
              <>
                <Text style={styles.label}>BACKGROUND</Text>
                <View style={styles.chips}>
                  {STORY_COLORS.map((c) => (
                    <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, bg === c && styles.colorDotActive]}
                      onPress={() => setBg(c)} accessibilityRole="button" accessibilityState={{ selected: bg === c }} accessibilityLabel={`Background ${c}`} />
                  ))}
                </View>
                <Text style={styles.hint}>Stories are visible to your followers for 24 hours.</Text>
              </>
            )
          ) : (
            <>
              <Text style={styles.label}>TAG (OPTIONAL)</Text>
              <View style={styles.chips}>
                {POST_TAGS.map((t) => {
                  const active = tag === t;
                  const c = tagColors(t);
                  return (
                    <TouchableOpacity key={t} style={[styles.tag, { backgroundColor: active ? c.color : c.bg }]}
                      onPress={() => setTag(active ? null : t)} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`Tag ${t}`}>
                      <Text style={[styles.tagText, { color: active ? colors.white : c.color }]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: { padding: 16, paddingBottom: 40 },
  shareBtn: { backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8, minWidth: 70, alignItems: 'center' },
  shareBtnText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  segment: { flexDirection: 'row', backgroundColor: colors.sectionBg, borderRadius: 100, padding: 4, marginBottom: 14 },
  segmentBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 100 },
  segmentBtnActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 13.5, fontWeight: '700', color: colors.textMid },
  segmentTextActive: { color: colors.white },
  composer: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  captionInput: { flex: 1, minHeight: 110, fontSize: 15, color: colors.textDark, textAlignVertical: 'top', paddingTop: 10 },
  counter: { alignSelf: 'flex-end', fontSize: 11, color: colors.textPlaceholder, marginTop: 4 },
  storyPreview: { borderRadius: 20, aspectRatio: 0.8, justifyContent: 'center', padding: 24, overflow: 'hidden' },
  storyInput: { fontSize: 22, fontWeight: '800', color: colors.white, minHeight: 60 },
  storyInputOnPhoto: { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12, padding: 10 },
  photoWrap: { marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 1.3, backgroundColor: colors.sectionBg },
  removePhoto: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 100, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 9 },
  photoBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  label: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1.2, marginTop: 20, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 7 },
  tagText: { fontSize: 12, fontWeight: '700' },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: colors.white },
  colorDotActive: { borderColor: colors.textDark },
  hint: { fontSize: 12, color: colors.textLight, marginTop: 12 },
});
