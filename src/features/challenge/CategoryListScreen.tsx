import { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, FlatList, Pressable, BackHandler } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ButtonPanel from '../../components/ButtonPanel';
import { useFeed } from "../../context/FeedContext";
import { getFeedList } from "../../api/getFeedList";
import { categoryMeta, type RootStackParamList } from '../../navigation/types';
import { type FeedCategory, getImage, getSortOrder } from "../../navigation/types";
import { Platform } from "react-native";
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import eventBus from '../../components/EventBus';

const isIOS = Platform.OS === "ios";
const screenBackground = require('../../assets/images/background.png');

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CategoryList'
>;

export default function CategoryListScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { rssFeed, setRssFeed } = useFeed();
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { width, scale, font, isVeryCompact } = useResponsiveLayout();
  const horizontalPadding = scale(isVeryCompact ? 14 : 20, 12, 22);
  const columnGap = scale(isVeryCompact ? 12 : 20, 10, 22);
  const cardWidth = Math.floor((width - horizontalPadding * 2 - columnGap) / 2);
  const cardHeight = Math.round(cardWidth * 0.94);
  const titleFontSize = font(28, 22, 28);
  const subtitleFontSize = font(18, 14, 18);

  useEffect(() => {
    let isActive = true;
    async function load() {
      if (!rssFeed) {
        setLoading(true);
        const feedResponse = await getFeedList("rss");

        if (isActive) {
          setRssFeed(feedResponse);
          setCategories(feedResponse.categories);
        }
      }
      setLoading(false);
    }

    load();
    return () => { isActive = false };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // If feed is missing or expired, reload it
      const cycle = rssFeed?.cycle;

      const needsReload =
        !cycle ||
        !cycle.endTime ||
        Date.now() > Number(cycle.endTime) ||   // expired
        cycle.status === "expired";

      if (needsReload) {
        (async () => {
          setLoading(true);
          const feedResponse = await getFeedList("rss");
          setRssFeed(feedResponse);
          setLoading(false);
        })();
      }
    }, [rssFeed])
  );

  useEffect(() => {
    const reload = async () => {
      setLoading(true);
      const feedResponse = await getFeedList("rss");
      setRssFeed(feedResponse);
      setLoading(false);
    };

    const handler = () => {
      reload();
    };

    eventBus.on("cycleExpired", handler);

    return () => {
      eventBus.off("cycleExpired", handler);
    };
  }, []);

  // Don't allow the user to exit the app from here with the android Back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Prevent exiting the app from the home screen
        return true;
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        sub.remove(); // ✔ correct cleanup
      };
    }, [])
  );

  if (categories.length === 0) {
    const staticCategories: FeedCategory[] = Object.entries(categoryMeta).map(([key, meta]) => ({
      id: `static-${key}`,
      name: key,                 // already lowercase
      challengeCount: 0,
      active: [],
      recent: [],
      label: meta.label,
      color: meta.color,
    })) as FeedCategory[];

    setCategories(staticCategories);
  }

  // const CATEGORY_ORDER = Object.keys(categoryMeta);
  const sortedCategories = categories.sort(
    (a, b) => getSortOrder(a.name) - getSortOrder(b.name)
  );

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
                onPress={() => {
                  navigation.navigate("CategoryChallenges", {
                    category: item.name
                  });
                }}              >
                <ImageBackground
                  source={getImage(item.name)}
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
