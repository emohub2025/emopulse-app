import { useState, useCallback } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useCycleTimer } from '../../components/CycleTimerContext';
import ButtonPanel from '../../components/ButtonPanel';
import { useFeed } from "../../context/FeedContext";
import { getFeedList } from "../../api/getFeedList";
import type { FeedCategory, FeedResponse } from "../../navigation/types";
import { Platform } from "react-native";
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

const isIOS = Platform.OS === "ios";
const screenBackground = require('../../assets/images/background.png');

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CategoryList'
>;

const CATEGORY_ORDER = [
  'Wacky',
  'Entertainment',
  'Politics',
  'Sports',
  'Tech',
  'Gaming',
  'Music',
  'Finance',
  'Health',
];

const categoryImages: Record<string, any> = {
  Wacky: require('../../assets/images/category-wacky.png'),
  Politics: require('../../assets/images/category-politics.png'),
  Sports: require('../../assets/images/category-sports.png'),
  Entertainment: require('../../assets/images/category-entertainment.png'),
  Tech: require('../../assets/images/category-tech.png'),
  Music: require('../../assets/images/category-music.png'),
  Gaming: require('../../assets/images/category-gaming.png'),
  Finance: require('../../assets/images/category-finance.png'),
  Health: require('../../assets/images/category-health.png'),
};

export default function CategoryListScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { applyCycleFromFeed } = useCycleTimer();
  const { setFeed } = useFeed();   // ⭐ NEW
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { width, scale, font, isVeryCompact } = useResponsiveLayout();
  const horizontalPadding = scale(isVeryCompact ? 14 : 20, 12, 22);
  const columnGap = scale(isVeryCompact ? 12 : 20, 10, 22);
  const cardWidth = Math.floor((width - horizontalPadding * 2 - columnGap) / 2);
  const cardHeight = Math.round(cardWidth * 0.94);
  const titleFontSize = font(28, 22, 28);
  const subtitleFontSize = font(18, 14, 18);

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
      <View style={styles.root}>
        <ImageBackground
          source={screenBackground}
          style={styles.background}
          resizeMode="cover"
        >
          {!isIOS && (
            <Image
              source={screenBackground}
              style={styles.androidBackgroundImage}
              resizeMode="cover"
            />
          )}

      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.center}>
          <Text style={{ color: 'white' }}>Loading categories…</Text>
        </View>
      </SafeAreaView>
        </ImageBackground>
      </View>
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
    <View style={styles.root}>
      <ImageBackground
        source={screenBackground}
        style={styles.background}
        resizeMode="cover"
      >
        {!isIOS && (
          <Image
            source={screenBackground}
            style={styles.androidBackgroundImage}
            resizeMode="cover"
          />
        )}

        <SafeAreaView style={styles.safe} edges={[]}>
          <Text style={[styles.topLabel, { fontSize: titleFontSize }]}>Challenge Categories</Text>
          <Text style={[styles.subLabel, { fontSize: subtitleFontSize }]}>Choose a category to view active and expired challenges</Text>

          <FlatList
            data={sortedCategories}
            keyExtractor={(item) => item.id}
            numColumns={2}
            style={styles.list}
            columnWrapperStyle={[styles.columnWrapper, { paddingHorizontal: horizontalPadding }]}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  { width: cardWidth, height: cardHeight },
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
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  androidBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safe: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  topLabel: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 0,
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
  },
  listContent: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
    marginRight: 0,
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
