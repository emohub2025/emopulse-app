import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
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
  const tileSize = Math.floor(
    Math.min(
      scale(isVeryCompact ? 150 : 180, 132, 182),
      (width - scale(54, 36, 62)) / 2
    )
  );
  const labelSize = font(isVeryCompact ? 20 : 24, 16, 24);

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
    top: -4,               // adjust to move text up/down
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
