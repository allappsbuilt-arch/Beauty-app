import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';
import { trendLabel, trendMessage } from '../utils/scanText';

const BAR_H   = 52;
const BAR_W   = 36;
const BAR_GAP = 10;

// Skin "3-SCAN TREND": one bar per real scan (oldest → latest), latest
// highlighted. `trend` is built by the backend from the user's scan history.
function Bars({ bars, scores }) {
  const { t } = useI18n();
  const anim = useRef(bars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      120,
      anim.map(a =>
        Animated.timing(a, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,  // height is a layout prop — cannot use native driver
        })
      )
    ).start();
  }, []);

  return (
    <View style={chart.bars}>
      {bars.map((h, i) => {
        const isLast = i === bars.length - 1;
        const score = scores?.[i];
        return (
          <View key={i} style={[chart.barCol, { marginRight: isLast ? 0 : BAR_GAP }]}>
            <View
              style={[chart.barTrack, { width: BAR_W, height: BAR_H }]}
              accessible
              accessibilityLabel={`${isLast ? t('trend.latest') : t('trend.earlier')}${score != null ? t('trend.scoreA11y', { score }) : ''}`}
            >
              <Animated.View
                style={[
                  chart.barFill,
                  {
                    width: BAR_W,
                    height: anim[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, BAR_H * Math.max(0, Math.min(1, h))],
                    }),
                    backgroundColor: isLast ? colors.primary : colors.primaryPaleDeep,
                  },
                ]}
              />
            </View>
            {score != null && (
              <Text style={[chart.barScore, isLast && chart.barScoreLatest]}>{score}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function SkinTrendChart({ trend }) {
  const bars = Array.isArray(trend?.bars) ? trend.bars : [];
  if (bars.length === 0) return null;

  return (
    <View style={chart.wrap}>
      <View style={chart.header}>
        <Text style={chart.trendLabel}>{trendLabel(trend.label)}</Text>
        {trend.value ? <Text style={chart.trendVal}>{trend.value}</Text> : null}
      </View>

      {/* Remount when the scan window changes so every bar gets its own animation. */}
      <Bars key={(trend.scores || bars).join(',')} bars={bars} scores={trend.scores} />

      {trend.message ? <Text style={chart.message}>{trendMessage(trend.message)}</Text> : null}
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textFaint,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  trendVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textDark,
    letterSpacing: -0.1,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  barCol: {
    alignItems: 'center',
  },
  barTrack: {
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.sectionBg,
  },
  barFill: {
    borderRadius: 6,
  },
  barScore: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textFaint,
  },
  barScoreLatest: {
    color: colors.primary,
    fontWeight: '800',
  },
  message: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textFaint,
    fontStyle: 'italic',
  },
});
