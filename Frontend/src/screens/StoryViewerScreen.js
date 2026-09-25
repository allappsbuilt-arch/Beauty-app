import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthedRequest } from '../api/useAuthedRequest';
import UserAvatar from '../components/social/UserAvatar';
import { timeAgo } from '../components/social/socialUtils';
import { confirm, notify } from '../utils/feedback';

const STORY_MS = 5000;
const TICK_MS = 50;

// Full-screen stories: tap right for next, left for previous; advances
// automatically and moves on to the next person's stories.
export default function StoryViewerScreen({ navigation, route }) {
  const request = useAuthedRequest();
  const [groups, setGroups] = useState(route?.params?.groups ?? []);
  const startIdx = Math.max(0, groups.findIndex((g) => g.user.id === route?.params?.startUserId));
  const [g, setG] = useState(startIdx);
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const elapsed = useRef(0);

  const group = groups[g];
  const item = group?.items[i];

  const close = () => navigation?.goBack();

  const next = () => {
    if (!group) return close();
    if (i + 1 < group.items.length) setI(i + 1);
    else if (g + 1 < groups.length) { setG(g + 1); setI(0); }
    else close();
  };
  const prev = () => {
    if (i > 0) setI(i - 1);
    else if (g > 0) { setG(g - 1); setI(groups[g - 1].items.length - 1); }
    else { elapsed.current = 0; setProgress(0); }
  };

  // Restart the timer for each story.
  useEffect(() => { elapsed.current = 0; setProgress(0); }, [g, i]);

  useEffect(() => {
    if (paused || !item) return undefined;
    const t = setInterval(() => {
      elapsed.current += TICK_MS;
      if (elapsed.current >= STORY_MS) { clearInterval(t); next(); } else setProgress(elapsed.current / STORY_MS);
    }, TICK_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, i, paused, item]);

  const remove = async () => {
    setPaused(true);
    const ok = await confirm('Delete story?', 'It will be removed for everyone.', 'Delete');
    if (!ok) { setPaused(false); return; }
    try {
      await request(`/api/social/stories/${item.id}`, { method: 'DELETE' });
      const items = group.items.filter((x) => x.id !== item.id);
      if (!items.length) { close(); return; }
      setGroups((list) => list.map((x, idx) => (idx === g ? { ...x, items } : x)));
      setI(Math.min(i, items.length - 1));
    } catch (err) {
      notify('Could not delete story', err.message);
    } finally {
      setPaused(false);
    }
  };

  if (!item) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.gone}>This story is no longer available.</Text>
        <TouchableOpacity onPress={close} style={styles.goneBtn} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.goneBtnText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: item.imageUrl ? '#000' : item.bg }]}>
      <StatusBar barStyle="light-content" />
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="contain" /> : null}

      {/* Tap zones */}
      <View style={styles.zones}>
        <TouchableOpacity style={{ flex: 1 }} onPress={prev} activeOpacity={1} accessibilityRole="button" accessibilityLabel="Previous story" />
        <TouchableOpacity style={{ flex: 2 }} onPress={next} activeOpacity={1} accessibilityRole="button" accessibilityLabel="Next story" />
      </View>

      {/* Progress + header */}
      <View style={styles.top} pointerEvents="box-none">
        <View style={styles.bars}>
          {group.items.map((x, idx) => (
            <View key={x.id} style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${idx < i ? 100 : idx === i ? progress * 100 : 0}%` }]} />
            </View>
          ))}
        </View>
        <View style={styles.header}>
          <TouchableOpacity style={styles.author} onPress={() => { close(); navigation?.navigate('UserProfile', { userId: group.user.id }); }}
            accessibilityRole="button" accessibilityLabel={`Open ${group.user.name}'s profile`}>
            <UserAvatar user={group.user} size={36} />
            <View>
              <Text style={styles.authorName}>{group.isMine ? 'Your story' : group.user.name}</Text>
              <Text style={styles.authorTime}>{timeAgo(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setPaused((p) => !p)} accessibilityRole="button" accessibilityLabel={paused ? 'Play' : 'Pause'}>
              <Ionicons name={paused ? 'play' : 'pause'} size={18} color={colors.white} />
            </TouchableOpacity>
            {group.isMine && (
              <TouchableOpacity style={styles.iconBtn} onPress={remove} accessibilityRole="button" accessibilityLabel="Delete story">
                <Ionicons name="trash-outline" size={18} color={colors.white} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconBtn} onPress={close} accessibilityRole="button" accessibilityLabel="Close stories">
              <Ionicons name="close" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {item.text ? (
        <View style={[styles.textWrap, item.imageUrl && styles.textOnPhoto]} pointerEvents="none">
          <Text style={styles.text}>{item.text}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  zones: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 12, paddingHorizontal: 12 },
  bars: { flexDirection: 'row', gap: 4 },
  barTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorName: { color: colors.white, fontWeight: '800', fontSize: 14 },
  authorTime: { color: 'rgba(255,255,255,0.8)', fontSize: 11.5 },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  textWrap: { position: 'absolute', left: 24, right: 24, top: '38%', alignItems: 'center' },
  textOnPhoto: { top: undefined, bottom: 60, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, padding: 12 },
  text: { color: colors.white, fontSize: 24, fontWeight: '800', textAlign: 'center', lineHeight: 32 },
  gone: { color: colors.white, fontSize: 15 },
  goneBtn: { marginTop: 14, backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 20, paddingVertical: 10 },
  goneBtnText: { color: colors.white, fontWeight: '800' },
});
