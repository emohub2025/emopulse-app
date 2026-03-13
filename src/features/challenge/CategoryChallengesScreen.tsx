import { useEffect, useState } from 'react';
import { ImageBackground, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, Challenge } from '../../navigation/types';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { getChallengesForCategory } from '../../api/getCategoryChallenges';
import eventBus from '../../components/eventBus';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CategoryChallenges'
>;

type RouteProps = RouteProp<RootStackParamList, 'CategoryChallenges'>;

const categoryImages: Record<string, any> = {
  Politics: require('../../assets/images/politics.png'),
  Sports: require('../../assets/images/sports.png'),
  Entertainment: require('../../assets/images/entertainment.png'),
  Tech: require('../../assets/images/tech.png'),
  Music: require('../../assets/images/category-music.png'),
  Gaming: require('../../assets/images/gaming.png'),
  Finance: require('../../assets/images/category-finance.png'),
  Health: require('../../assets/images/health.png'),
  Wacky: require('../../assets/images/wacky.png'),
};

export default function CategoryChallengesScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { category } = route.params;
  const { formattedTime } = useCycleTimer();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //
  // 1️⃣ Load summary challenges for this category
  //
  useEffect(() => {
    async function load() {
      try {
        const data = await getChallengesForCategory(category);
        setChallenges(data);
        console.log("📦 Challenges fetched:\n", JSON.stringify(data, null, 2));
        if (data.length === 1) {
          try {
            navigation.replace("ChallengeDetail", { 
              id: data[0].id, 
              category: data[0].category 
            });
            return; // prevent outer finally
          } catch (err) {
            console.error("Failed to load challenge details:", err);
            setError("Failed to load challenge details");
            return; // also prevent outer finally
          }
        }
      } catch (err) {
        console.log("ERROR LOADING CHALLENGES:", err);
        setError("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category, navigation]);

  //
  // 2️⃣ Handle cycle expiration → return to CategoryList
  //
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) return;

    const handler = () => {
      //navigation.navigate('CategoryList');
    };

    eventBus.on('cycleExpired', handler);

    return () => {
      eventBus.off('cycleExpired', handler);
    };
  }, [isFocused, navigation]);

  //
  // 3️⃣ UI states
  //
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading challenges…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>{error}</Text>
      </View>
    );
  }

  //
  // 4️⃣ Main UI
  //
  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Text style={styles.topLabel}>{category}</Text>

        <View style={styles.content}>
          {challenges.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Available Challenges</Text>
            </View>
          ) : (
            <FlatList
              data={challenges}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() =>
                  navigation.navigate('ChallengeDetail', {
                    id: item.id,
                    category: item.category
                  })
                }
              >
                <ImageBackground
                  source={categoryImages[category]}
                  //source={require('../../assets/images/category-challenge.png')}
                  style={styles.cardBackground}
                  imageStyle={styles.cardImage}
                  resizeMode="stretch"
                >
                  <Text style={styles.title}>{item.topic}</Text>
                </ImageBackground>
              </Pressable>
              )}
            />
          )}
        </View>

        <Text style={styles.timer}>{formattedTime}</Text>
      </SafeAreaView>
    </ImageBackground>
  );

}

//
// Styles
//
const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    opacity: 0.9,
  },
  safe: {
    flex: 1,
  },
  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 65,
    marginBottom: 5,
    paddingHorizontal: 20,
    textAlign: 'center'
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 370,
    height: 160,
    borderRadius: 8,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  cardBackground: {
    width: 370,
    height: 160,
    justifyContent: 'center',
    paddingHorizontal: 0,   // ← move padding here
    paddingVertical: 0,     // ← move padding here
  },
  cardImage: {
    borderRadius: 8,           // matches the card radius
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginLeft: 20,
    marginRight: 100,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 0,
  },
});