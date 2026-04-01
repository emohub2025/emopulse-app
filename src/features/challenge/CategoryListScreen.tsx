import { useState, useCallback } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useCycleTimer } from '../../components/CycleTimerContext';
import ButtonPanel from '../../components/ButtonPanel';
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

  // ⭐ NEW: use applyCycleFromFeed instead of refreshCycle
  const { applyCycleFromFeed } = useCycleTimer();

  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      async function load() {
        try {
          // ⭐ Fetch feed (cycle + categories)
          const feed: FeedResponse = await getFeedList();

          if (isActive) {
            // ⭐ Push cycle metadata into timer context
            applyCycleFromFeed(feed.cycle);

            // ⭐ Set categories
            setCategories(feed.categories);
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

  // ⭐ Normalize names to avoid trailing spaces / casing issues
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

      <FlatList
        data={sortedCategories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('CategoryChallenges', {
                category: item.name,
                active: item.active,
                recent: item.recent
              })
            }
          >
            <ImageBackground
              source={categoryImages[item.name] ?? null}
              style={styles.cardBackground}
              resizeMode="stretch"
            />
          </Pressable>
        )}
      />

      <View>
        <ButtonPanel />
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
  list: {
    flex: 1,
    marginTop: -7,
    marginBottom: 60,
  },
  safe: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 0,
    backgroundColor: '#000',
  },
  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 15,
    textAlign: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  listContent: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 40,
  },
  card: {
    height: 135,
    width: 160,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});