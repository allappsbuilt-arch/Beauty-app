import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const INITIAL = [
  {
    id: '1', from: 'coach',
    text: 'Hi! I\'m your AI skin coach 💆‍♀️ Ask me anything about your skincare routine, ingredients, or skin concerns.',
    time: 'Now',
  },
  {
    id: '2', from: 'coach',
    text: 'For example: "What should I use for dry skin?" or "Is niacinamide safe with retinol?"',
    time: 'Now',
  },
];

const SUGGESTIONS = [
  'Best routine for dry skin?',
  'Can I mix Vitamin C + Retinol?',
  'How to reduce pores?',
];

function ChatBubble({ msg }) {
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
          {msg.text}
        </Text>
        <Text style={[styles.bubbleTime, isCoach ? styles.coachTime : styles.userTime]}>
          {msg.time}
        </Text>
      </View>
    </View>
  );
}

export default function CoachScreen({ navigation }) {
  const [messages, setMessages] = useState(INITIAL);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const send = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), from: 'user', text: msg.trim(), time: now },
      { id: (Date.now()+1).toString(), from: 'coach',
        text: 'Great question! Let me analyse that for your skin type. I\'ll have a personalised recommendation ready in a moment 🌸',
        time: now },
    ]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

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
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={colors.textMid} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={16} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Skin Coach</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>AI · Always available</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation?.navigate('CoachStyle')}
            accessibilityRole="button"
            accessibilityLabel="Coach style settings"
          >
            <Ionicons name="options-outline" size={18} color={colors.textMid} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation?.navigate('WeeklyReport')}
            accessibilityRole="button"
            accessibilityLabel="View weekly report"
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
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(m => <ChatBubble key={m.id} msg={m} />)}
          <View style={{ height: 8 }} />
        </ScrollView>

        {/* Suggestion chips */}
        {input === '' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {SUGGESTIONS.map(s => (
              <TouchableOpacity key={s} style={styles.chip} onPress={() => send(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input row */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ask your skin coach..."
              placeholderTextColor={colors.textPlaceholder}
              value={input}
              onChangeText={setInput}
              returnKeyType="send"
              onSubmitEditing={() => send()}
              multiline
              maxLength={300}
              accessibilityLabel="Message input"
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => send()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
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

  bubble: {
    maxWidth: '76%', borderRadius: 18, padding: 12, gap: 4,
  },
  coachBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: colors.shadow, shadowOpacity: 0.06,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    shadowColor: colors.primary, shadowOpacity: 0.28,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  coachText: { color: colors.textMid },
  userText: { color: colors.white },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end' },
  coachTime: { color: colors.textPlaceholder },
  userTime: { color: 'rgba(255,255,255,0.6)' },

  chips: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  chip: {
    backgroundColor: colors.white,
    borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7,
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
