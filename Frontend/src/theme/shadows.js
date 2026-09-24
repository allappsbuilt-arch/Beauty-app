import { Platform } from 'react-native';
import { colors } from './colors';

// Shared elevation presets so cards/sheets/bars read as one consistent system
// instead of each screen hand-rolling its own shadow numbers.
function preset(opacity, radius, offsetY, elevation) {
  return Platform.select({
    web: {
      // RN's shadow* props don't reach the DOM on web — boxShadow does.
      boxShadow: `0 ${offsetY}px ${radius}px rgba(139, 28, 52, ${opacity})`,
    },
    default: {
      shadowColor: colors.shadow,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
      elevation,
    },
  });
}

export const shadows = {
  none: {},
  card: preset(0.07, 14, 4, 3),
  cardHover: preset(0.11, 20, 8, 6),
  raised: preset(0.14, 24, 10, 10),
  bar: preset(0.08, 18, -3, 16),
};
