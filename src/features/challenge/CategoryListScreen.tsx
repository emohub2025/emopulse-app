import { useState, useCallback } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useCycleTimer } from '../../components/CycleTimerContext';
import ButtonPanel from '../../components/ButtonPanel';
import { useFeed } from "../../context/FeedContext";
import { getFeedList } from "../../api/getFeedList";
import type { FeedCategory, FeedResponse } from "../../navigation/types";

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
  const route = useRoute();
  const { applyCycleFromFeed } = useCycleTimer();
  const { setFeed } = useFeed();   // ⭐ NEW
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      async function load() {
        try {
          const feed: FeedResponse = await getFeedList();

          if (isActive) {
            applyCycleFromFeed(feed.cycle);

            setCategories(feed.categories);

            setFeed(feed);   // ⭐ NEW — store feed globally
          }
        } finally {
          if (isActive) setLoading(false);
        }
      }

      load();
      return () => { isActive = false };
    }, [applyCycleFromFeed])
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

  const normalizedCategories = categories.map(c => ({
    ...c,
    name: c.name.trim()
  }));

  const sortedCategories = [...normalizedCategories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.name);
    const indexB = CATEGORY_ORDER.indexOf(b.name);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a.name.localeCompare(b.name);
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.topLabel}>Challenge Categories</Text>
      <Text style={styles.subLabel}>Choose a category to view active and expired challenges</Text>

      <FlatList
        data={sortedCategories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              navigation.navigate('CategoryChallenges', {
                category: item.name
              })
            }
          >
            <ImageBackground
              source={categoryImages[item.name] ?? null}
              style={styles.cardBackground}
              resizeMode="stretch"
            >
              <View style={styles.cardOverlay} />
            </ImageBackground>
          </Pressable>
        )}
      />

      <View>
        <ButtonPanel currentScreen={route.name} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safe: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 0,
    backgroundColor: '#000',
  },
  topLabel: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 6,
    textAlign: 'center',
  },
  subLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  list: {
    flex: 1,
    marginTop: -2,
    marginBottom: 60,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  listContent: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    height: 150,
    width: 160,
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: '#16042f',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  cardBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 2, 18, 0.14)',
  },
});