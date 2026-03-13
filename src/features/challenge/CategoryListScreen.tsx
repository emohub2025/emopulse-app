import { useState, useCallback } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { getCycleStatus } from '../../api/cycleStatus';
import type { CategoryInfo } from '../../api/cycleStatus';
import { useCycleTimer } from '../../components/CycleTimerContext';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CategoryList'
>;

const CATEGORY_ORDER = [
  'Politics',
  'Sports',
  'Entertainment',
  'Tech',
  'Gaming',
  'Music',
  'Finance',
  'Health',
  'Wacky',
];

const categoryImages: Record<string, any> = {
  Politics: require('../../assets/images/category-politics.png'),
  Sports: require('../../assets/images/category-sports.png'),
  Entertainment: require('../../assets/images/category-entertainment.png'),
  Tech: require('../../assets/images/category-tech.png'),
  Music: require('../../assets/images/category-music.png'),
  Gaming: require('../../assets/images/category-gaming.png'),
  Finance: require('../../assets/images/category-finance.png'),
  Health: require('../../assets/images/category-health.png'),
  Wacky: require('../../assets/images/category-wacky.png'),
};

export default function CategoryListScreen() {
  const navigation = useNavigation<NavProp>();
  const { formattedTime, refreshCycle } = useCycleTimer(); // ⭐ pull refreshCycle

  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Load categories + refresh timer whenever screen becomes focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      async function load() {
        try {
          // 1️⃣ refresh cycle timer context
          await refreshCycle();

          // 2️⃣ reload categories for the new cycle
          const result = await getCycleStatus();
          if (isActive) {
            setCategories(result.categories);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      load();

      return () => {
        isActive = false;
      };
    }, [refreshCycle])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={{ color: 'white' }}>Loading categories…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.name);
    const indexB = CATEGORY_ORDER.indexOf(b.name);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a.name.localeCompare(b.name);
  });

return (
  <ImageBackground
    source={require('../../assets/images/background.png')}
    style={styles.background}
    resizeMode="cover"
  >
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.topLabel}>Current Challenges</Text>

      <FlatList
        data={sortedCategories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.list}                     // ← gives it flex:1
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('CategoryChallenges', {
                category: item.name,
              })
            }
          >
            <ImageBackground
              source={categoryImages[item.name]}
              style={styles.cardBackground}
              resizeMode="stretch"
            />
          </Pressable>
        )}
      />
    </SafeAreaView>

    <View style={styles.timerContainer}>
      <Text style={styles.timer}>{formattedTime}</Text>
    </View>
  </ImageBackground>
);


}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
  },
list: {
  flex: 1,                 // ← THIS is the missing piece
},
  safe: {
    flex: 1,              // ← SafeAreaView fills everything above the timer
    paddingTop: 40,
    paddingBottom: 0,
    backgroundColor: '#000',
  },

  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 25,
    textAlign: 'center',
  },

  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  listContent: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 20,
    paddingBottom: 100,   // ← ensures last row scrolls above timer
  },

  card: {
    height: 140,
    width: 160,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },

  cardBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  timerContainer: {
    height: 60,           // ← fixed footer height
    justifyContent: 'center',
    alignItems: 'center',
  },

  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
  },
});