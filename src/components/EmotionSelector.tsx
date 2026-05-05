import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { emotionImages } from './EmotionImage';
import { emotionLookup, emotionSlotMap } from '../utils/emotionList';

interface Props {
  selected: string | null;
  onSelect: (emotion: string) => void;
  category: string;
}

const emotionKeys = ['happy', 'anxious', 'angry', 'sad'];

export default function EmotionSelector({ selected, onSelect, category }: Props) {
  const images = emotionImages[category];

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
                    style={styles.icon}
                  />
                  <Text
                    style={[
                      styles.iconLabel,
                      selected === key && styles.iconLabelSelected
                    ]}
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
    width: 180,
    height: 182,
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
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  iconLabelSelected: {
    color: 'lime',
  },
});