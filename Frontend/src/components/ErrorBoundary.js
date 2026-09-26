import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { translate as tr } from '../i18n';

// Catches a crash while drawing a screen. Without this, a release build shows
// a blank white page; with it the user sees what happened and can recover.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Screen crashed:', error, info?.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={s.wrap}>
        <Ionicons name="alert-circle-outline" size={42} color={colors.primary} />
        <Text style={s.title}>{tr('errorBoundary.title')}</Text>
        <Text style={s.text}>{tr('errorBoundary.text')}</Text>
        {__DEV__ ? <Text style={s.detail}>{String(this.state.error?.message || this.state.error)}</Text> : null}
        <TouchableOpacity style={s.btn} onPress={this.reset} accessibilityRole="button" accessibilityLabel={tr('common.tryAgain')}>
          <Text style={s.btnText}>{tr('common.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 18, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  text: { fontSize: 14, color: colors.textMid, textAlign: 'center', lineHeight: 20 },
  detail: { fontSize: 12, color: colors.textLight, textAlign: 'center' },
  btn: { marginTop: 8, backgroundColor: colors.primary, borderRadius: 100, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: 15 },
});
