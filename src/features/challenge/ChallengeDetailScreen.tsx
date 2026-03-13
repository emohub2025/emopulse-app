import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import playButton from '../../assets/buttons/play.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import eventBus from '../../components/eventBus';
import { getChallengeImageSource } from '../../assets/wacky/index';
import { getChallengeDetails } from '../../api/getChallengeDetails';
import type { Challenge } from "../../navigation/types";

// Route params type
type ChallengeDetailRouteProp = RouteProp<
  RootStackParamList,
  'ChallengeDetail'
>;

// Navigation type
type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChallengeDetail'
>;

export default function ChallengeDetailScreen({
  route,
}: {
  route: ChallengeDetailRouteProp;
}) {
  const { id, category } = route.params;
  const navigation = useNavigation<NavProp>();
  const { formattedTime, isExpired } = useCycleTimer();
  const isFocused = useIsFocused();
  const [challenge, setChallenge] = useState<Challenge | null>(null);

useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getChallengeDetails(category, id);
        if (isMounted) setChallenge(data);
      } catch (err) {
        console.error("Failed to load challenge:", err);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [id, category]);


  const imageSource = useMemo(
    () => getChallengeImageSource(challenge),
    [challenge]
  );

  //
  // 1️⃣ Handle cycle expiration → go to results
  //
  useEffect(() => {
    if (!isFocused || !challenge) return;

    const handler = () => {
      // navigation.navigate("ChallengeResults", { challenge });
    };

    eventBus.on("cycleExpired", handler);

    return () => {
      eventBus.off("cycleExpired", handler); // ✔ cleanup returns void
    };
  }, [isFocused, challenge]);

  //
  // 2️⃣ Auto-navigate if expired
  //
  useEffect(() => {
    if (isExpired && challenge) {
      // navigation.navigate("ChallengeResults", { challenge });
    }
  }, [isExpired, challenge]);

  //
  // 3️⃣ Guard: missing challenge
  //
  if (!challenge) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
        <View style={styles.center}>
          <Text style={{ color: 'white' }}>Missing challenge data</Text>
        </View>
      </SafeAreaView>
    );
  }

  //
  // 4️⃣ UI
  //
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <Text style={styles.topLabel}>Challenge Details</Text>

      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <View style={styles.container}>

            {/* Topic */}
            <AutoShrinkBlock
              height={100}
              textAlign="center"
              fontStyle="italic"
              marginTop={-30}
            >
              {challenge.topic}
            </AutoShrinkBlock>

            {/* Image */}
            <View style={styles.imageWrapper}>
              {imageSource && (
                <Image source={imageSource} style={styles.image} />
              )}
            </View>

            {/* Quote or snippet */}
            <AutoShrinkBlock
              maxFontSize={22}
              height={115}
              minHeight={115}
              textAlign="left"
              fontWeight="500"
              fontStyle={challenge.quote ? "italic" : "normal"}
            >
              {challenge.quote || challenge.snippet || ""}
            </AutoShrinkBlock>

            {/* Stats */}
            <AutoShrinkBlock
              maxFontSize={22}
              height={100}
              minHeight={100}
              textAlign="left"
              fontWeight="500"
            >
              {challenge.stat ? `Stats: ${challenge.stat}` : ""}
            </AutoShrinkBlock>

            {/* NEXT BUTTON */}
            <Pressable
              onPress={() =>
                navigation.navigate("Challenge", {
                  challenge,
                })
              }
            >
              <Image source={playButton} style={styles.playImage} />
            </Pressable>

            <Text style={styles.timer}>{formattedTime}</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 95,
    textAlign: 'center',
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    marginTop: 0,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playImage: {
    width: 280,
    height: 47,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 45,
  },
  timer: {
    marginTop: 15,
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});