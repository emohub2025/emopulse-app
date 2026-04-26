import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { emotionImages } from './EmotionImage';

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
                <Image
                  source={selected === key ? selectedSrc : src}
                  style={styles.icon}
                />
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
    marginTop: 0,
    paddingBottom: 0,
  },
  icon: {
    width: 180,
    height: 184,
    resizeMode: 'contain',
  },
});