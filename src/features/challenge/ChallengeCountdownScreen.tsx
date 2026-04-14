import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCycleTimer } from '../../components/CycleTimerContext';
import activeButton from '../../assets/buttons/active.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { getFeedList } from '../../api/getFeedList';
import type { FeedResponse } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChallengeResults'
>;

export default function ChallengeResultScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { challenge } = route.params || {};
  const { isExpired, formattedTime, applyCycleFromFeed } = useCycleTimer();

  const visibleTimer =
    formattedTime && formattedTime.trim().length > 0
      ? formattedTime
      : 'Loading countdown…';

  if (!challenge) {
    console.error("❌ ChallengeResults missing challenge or challenge.id:", challenge);
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    let isActive = true;

    async function refreshCycle() {
      try {
        const feed: FeedResponse = await getFeedList();
        if (isActive) {
          applyCycleFromFeed(feed.cycle);
        }
      } catch (err) {
        console.log('❌ Failed to refresh cycle on countdown screen:', err);
      }
    }

    refreshCycle();

    return () => {
      isActive = false;
    };
  }, [applyCycleFromFeed]);

  useEffect(() => {
    if (isExpired) {
      const timer = setTimeout(() => {
        navigation.navigate("ChallengeResults", {
          challengeId: challenge.id,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isExpired, navigation, challenge.id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View style={styles.centerWrap}>
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Prediction Submitted</Text>

                <AutoShrinkBlock
                  height={88}
                  fontWeight="700"
                  textAlign="center"
                  fontStyle="italic"
                >
                  {challenge.topic}
                </AutoShrinkBlock>

                <Text style={styles.waitingText}>
                  Waiting for challenge results…
                </Text>
              </View>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Pressable
                onPress={() =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "CategoryList" }],
                  })
                }
              >
                <Image source={activeButton} style={styles.buttonImage} />
              </Pressable>

              <Text style={styles.timer}>{visibleTimer}</Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(22, 10, 52, 0.82)',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  waitingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  buttonImage: {
    width: 285,
    height: 48,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 10,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
});