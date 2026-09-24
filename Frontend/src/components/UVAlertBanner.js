import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function UVAlertBanner({
  level = 'High',
  message = 'Apply SPF 50+ before heading out.',
}) {
  return (
    <View style={styles.container}>
      {/* Coloured left accent bar */}
      <View style={styles.accentBar} />

      {/* Sun icon */}
      <View style={styles.iconWrap}>
        <Ionicons name="sunny" size={18} color="#C47800" />
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={styles.title}>
          UV Alert:{' '}
          <Text style={styles.levelBadge}>{level}</Text>
        </Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {/* Dismiss */}
      <TouchableOpacity
        style={styles.dismissBtn}
        accessibilityRole="button"
        accessibilityLabel="Dismiss UV alert"
      >
        <Ionicons name="close" size={14} color="#A07020" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alertBg,
    borderRadius: 14,
    marginHorizontal: 20,
    marginVertical: 6,
    paddingVertical: 11,
    paddingRight: 12,
    paddingLeft: 0,
    overflow: 'hidden',
    // premium shadow
    shadowColor: '#C47800',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0D080',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: '#F0A800',
    borderRadius: 2,
    marginRight: 12,
    marginLeft: 0,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF3C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F5D878',
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.alertText,
    letterSpacing: 0.1,
  },
  levelBadge: {
    color: '#C06000',
  },
  message: {
    fontSize: 12,
    color: colors.alertTextLight,
    marginTop: 1,
    lineHeight: 17,
  },
  dismissBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF0C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
});
