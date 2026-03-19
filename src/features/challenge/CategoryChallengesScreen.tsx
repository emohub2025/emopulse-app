import { useEffect, useState } from 'react';
import { Image, ImageBackground, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, Challenge } from '../../navigation/types';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { getChallengesForCategory } from '../../api/getCategoryChallenges';
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import eventBus from '../../components/EventBus';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CategoryChallenges'
>;

type RouteProps = RouteProp<RootStackParamList, 'CategoryChallenges'>;

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
        //console.log("📦 Challenges fetched:\n", JSON.stringify(data, null, 2));
        if (data.length === 1) {
          try {
            navigation.replace("ChallengeDetail", { 
              challenge: data[0]
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
                      challenge: item
                    })
                  }
                  >
                  <Image
                    source={getChallengeImageSource(item)}
                    style={styles.topicImage}
                    resizeMode="cover"
                  />

                  <Text style={styles.title}>{item.topic}</Text>
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
  card: {
    backgroundColor: '#220d58',
    borderRadius: 12,
    marginLeft: 22,
    marginRight: 22,
    overflow: 'hidden',
    marginBottom: 16,
  },

  topicImage: {
    marginTop: 10,
    width: '70%',
    height: 120,
    alignSelf: 'center', 
  },

  title: {
    padding: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
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
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 0,
  },
});