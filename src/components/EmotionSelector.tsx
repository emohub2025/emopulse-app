import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  selected: string | null;
  onSelect: (emotion: string) => void;
}

const emotions = [
  {
    key: 'happy',
    src: require('../assets/emotions/happy.png'),
    selectedSrc: require('../assets/emotions/happy-select.png'),
  },
  {
    key: 'anxious',
    src: require('../assets/emotions/anxiety.png'),
    selectedSrc: require('../assets/emotions/anxiety-select.png'),
  },
  {
    key: 'angry',
    src: require('../assets/emotions/angry.png'),
    selectedSrc: require('../assets/emotions/angry-select.png'),
  },
  {
    key: 'sad',
    src: require('../assets/emotions/sadness.png'),
    selectedSrc: require('../assets/emotions/sadness-select.png'),
  },
];

export default function EmotionSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>

      {/* Row 1 */}
      <View style={styles.row}>
        {emotions.slice(0, 2).map(e => (
          <TouchableOpacity
            key={e.key}
            onPress={() => onSelect(e.key)}
            style={styles.button}
          >
            <Image
              source={selected === e.key ? e.selectedSrc : e.src}
              style={styles.icon}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        {emotions.slice(2, 4).map(e => (
          <TouchableOpacity
            key={e.key}
            onPress={() => onSelect(e.key)}
            style={styles.button}
          >
            <Image
              source={selected === e.key ? e.selectedSrc : e.src}
              style={styles.icon}
            />
          </TouchableOpacity>
        ))}
      </View>

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
    width: 164,
    height: 176,
    resizeMode: 'contain',
  },
});