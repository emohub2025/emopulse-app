import { View, Image, TouchableOpacity, StyleSheet, Text, Platform, PixelRatio } from 'react-native';
import { emotionImages } from './EmotionImage';
import { emotionLookup, emotionSlotMap } from '../utils/emotionList';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

interface Props {
  selected: string | null;
  onSelect: (emotion: string) => void;
  category: string;
}

const emotionKeys = ['happy', 'anxious', 'angry', 'sad'];

export default function EmotionSelector({ selected, onSelect, category }: Props) {
  const images = emotionImages[category];
  const { width, scale, font, isVeryCompact } = useResponsiveLayout();

  // Base tile size (iOS uses this unchanged)
  const baseTile = isVeryCompact ? 150 : 180;

  // Android DP grid shrinks visuals → boost size slightly
  const androidBoost = Platform.OS === 'android' ? 1.03 : 1;

  // System zoom increases DP scale → compensate
  const dpScale = PixelRatio.getFontScale(); // increases with system zoom
  const zoomBoost = Platform.OS === 'android' ? (dpScale > 1 ? dpScale * 0.12 : 1) : 1;

  // Final platform-aware tile size
  const boostedTile = baseTile * androidBoost * zoomBoost;

  // Width constraint (unchanged)
const widthConstraint = (width - scale(54, 36, 62)) / (Platform.OS === 'android' ? 1.3 : 2);

  // Final tile size (iOS unchanged, Android boosted)
  const tileSize = Math.floor(
    Math.min(
      scale(boostedTile, 132, 220),
      widthConstraint
    )
  );

  // Label size (iOS unchanged, Android boosted slightly)
  const labelSize = font(
    (isVeryCompact ? 20 : 24) * (Platform.OS === 'android' ? 1.08 : 1),
    16,
    24
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: 2 }).map((_, rowIndex) => (
        <View style={styles.row} key={rowIndex}>
          {emotionKeys.slice(rowIndex * 2, rowIndex * 2 + 2).map(key => {
            const { src, selected: selectedSrc } = images[key];
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onSelect(key)}
                style={styles.button}
              >
                <View style={styles.iconWrapper}>
                  <Image
                    source={selected === key ? selectedSrc : src}
                    style={[styles.icon, { width: tileSize, height: tileSize }]}
                  />
                  <Text
                    style={[
                      styles.iconLabel,
                      { fontSize: labelSize },
                      selected === key && styles.iconLabelSelected
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {emotionLookup[emotionSlotMap[key]][category]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    marginTop: 4,
    paddingBottom: 0,
  },
  icon: {
    resizeMode: 'contain',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    color: 'white',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  iconLabelSelected: {
    color: 'lime',
  },
});
