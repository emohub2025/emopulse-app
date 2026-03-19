import React, { useMemo, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import playButton from '../../assets/buttons/play.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import eventBus from '../../components/EventBus';
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';

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
  const { challenge } = route.params; // ← full challenge object
  const navigation = useNavigation<NavProp>();
  const { formattedTime, isExpired } = useCycleTimer();
  const isFocused = useIsFocused();

  //
  // 1️⃣ Image source (fallback-safe)
  //
  const imageSource = getChallengeImageSource(challenge);

  //
  // 2️⃣ Handle cycle expiration → go to results
  //
  useEffect(() => {
    if (!isFocused) return;

    const handler = () => {
      // navigation.navigate("ChallengeResults", { challenge });
    };

    eventBus.on("cycleExpired", handler);

    return () => {
      eventBus.off("cycleExpired", handler); // ✔ cleanup returns void
    };
  }, [isFocused, challenge]);

  //
  // 3️⃣ Auto-navigate if expired
  //
  useEffect(() => {
    if (isExpired) {
      // navigation.navigate("ChallengeResults", { challenge });
    }
  }, [isExpired, challenge]);

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
        {/* Dim overlay */}
  <View style={styles.dimOverlay} />

  
        <SafeAreaView style={styles.contentWrapper} edges={["top", "bottom"]}>
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
              <Image source={imageSource} style={styles.image} />
            </View>

            {/* Quote or snippet */}
            <AutoShrinkBlock
              maxFontSize={22}
              height={125}
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
              height={90}
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
    zIndex: 2,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.10,   // adjust to taste
    zIndex: 1,
  },
  contentWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 2,
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