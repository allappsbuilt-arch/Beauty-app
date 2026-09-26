import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthedRequest } from '../api/useAuthedRequest';
import { useI18n, formatTimeOfDay } from '../i18n';

const WELCOME = {
  id: 'welcome-1',
  from: 'coach',
  textKey: 'coach.welcome', // app-side messages are translated when shown
  created_at: new Date().toISOString(),
};

const SUGGESTIONS = ['coach.suggestDry', 'coach.suggestMix', 'coach.suggestPores', 'coach.suggestNiacinamide'];

function formatTime(iso) {
  try {
    return formatTimeOfDay(iso, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function ChatBubble({ msg }) {
  const { t } = useI18n();
  const isCoach = msg.from === 'coach';
  return (
    <View style={[styles.bubbleRow, isCoach ? styles.bubbleRowLeft : styles.bubbleRowRight]}>
      {isCoach && (
        <View style={styles.coachAvatar}>
          <Ionicons name="sparkles" size={13} color={colors.white} />
        </View>
      )}
      <View style={[styles.bubble, isCoach ? styles.coachBubble : styles.userBubble]}>
        <Text style={[styles.bubbleText, isCoach ? styles.coachText : styles.userText]}>
          {msg.textKey ? t(msg.textKey) : msg.text}
        </Text>
        <Text style={[styles.bubbleTime, isCoach ? styles.coachTime : styles.userTime]}>
          {formatTime(msg.created_at)}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  const { t } = useI18n();
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowLeft]}>
      <View style={styles.coachAvatar}>
        <Ionicons name="sparkles" size={13} color={colors.white} />
      </View>
      <View style={[styles.bubble, styles.coachBubble, styles.typingBubble]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.typingText}>{t('coach.thinking')}</Text>
      </View>
    </View>
  );
}

export default function CoachScreen({ navigation, route }) {
  const request = useAuthedRequest();
  const { t } = useI18n();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');

  // Arriving from the Home "Reply" button: pre-fill a reply about that tip.
  const prefill = route?.params?.prefill;
  useEffect(() => {
    if (prefill) setInput(t('coach.aboutTip', { tip: prefill }));
  }, [prefill]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    (async () => {
      try {
        const { messages: history } = await request('/api/coach/history');
        if (history && history.length > 0) {
          setMessages([WELCOME, ...history]);
        }
      } catch {
        // Keep welcome message if backend unreachable
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');

    // Optimistically add user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      from: 'user',
      text: msg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);
    scrollToBottom();

    try {
      const { messages: newMsgs } = await request('/api/coach/message', {
        method: 'POST',
        body: { message: msg },
      });
      // Replace temp message with real ones from server
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        ...(newMsgs || []),
      ]);
    } catch {
      // Show error reply if backend fails
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          from: 'coach',
          textKey: 'coach.connectFailed',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  }, [input, request, scrollToBottom]);

  const clearChat = useCallback(async () => {
    try {
      await request('/api/coach/history', { method: 'DELETE' });
      setMessages([WELCOME]);
    } catch { /* silent */ }
  }, [request]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation?.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textMid} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={16} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{t('coach.title')}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{t('coach.status')}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={clearChat}
            accessibilityRole="button"
            accessibilityLabel={t('coach.clear')}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textMid} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation?.navigate('CoachStyle')}
            accessibilityRole="button"
            accessibilityLabel={t('coach.style')}
          >
            <Ionicons name="options-outline" size={18} color={colors.textMid} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation?.navigate('WeeklyReport')}
            accessibilityRole="button"
            accessibilityLabel={t('coach.report')}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMid} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((m) => <ChatBubble key={m.id || m.created_at} msg={m} />)}
            {isTyping && <TypingIndicator />}
            <View style={{ height: 8 }} />
          </ScrollView>
        )}

        {/* Suggestion chips — only when input is empty */}
        {!loading && input === '' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {SUGGESTIONS.map((key) => (
              <TouchableOpacity key={key} style={styles.chip} onPress={() => send(t(key))}>
                <Text style={styles.chipText}>{t(key)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input row */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder={t('coach.placeholder')}
              placeholderTextColor={colors.textPlaceholder}
              value={input}
              onChangeText={setInput}
              returnKeyType="send"
              onSubmitEditing={() => send()}
              multiline
              maxLength={300}
              accessibilityLabel={t('coach.input')}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || isTyping}
            accessibilityRole="button"
            accessibilityLabel={t('coach.send')}
          >
            <Ionicons name="arrow-up" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryBg },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.borderUltraLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22C55E' },
  onlineText: { fontSize: 11, color: colors.textLight, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.sectionBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderLight,
  },

  messages: { padding: 16, gap: 12 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  coachAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  bubble: { maxWidth: '76%', borderRadius: 18, padding: 12, gap: 4 },
  coachBubble: {
    backgroundColor: colors.white, borderBottomLeftRadius: 4,
    shadowColor: colors.shadow, shadowOpacity: 0.06,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  userBubble: {
    backgroundColor: colors.primary, borderBottomRightRadius: 4,
    shadowColor: colors.primary, shadowOpacity: 0.28,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  typingText: { fontSize: 13, color: colors.textLight, fontStyle: 'italic' },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  coachText: { color: colors.textMid },
  userText: { color: colors.white },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end' },
  coachTime: { color: colors.textPlaceholder },
  userTime: { color: 'rgba(255,255,255,0.6)' },

  chips: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  chip: {
    backgroundColor: colors.white, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.border,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, gap: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.borderUltraLight,
  },
  inputWrap: {
    flex: 1, backgroundColor: colors.sectionBg,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.borderLight,
    minHeight: 44, justifyContent: 'center',
  },
  input: { fontSize: 14, color: colors.textDark, maxHeight: 100 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.3,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  sendBtnDisabled: { backgroundColor: colors.accentDark, shadowOpacity: 0 },
});
