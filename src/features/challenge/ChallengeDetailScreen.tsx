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
  const hasQuote = challenge.quote && challenge.quote.trim().length > 0;
  const isResolved = challenge.status !== 'open';

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

  const combinedDetails = useMemo(() => {
    const parts: string[] = [];

    if (challenge.snippet) parts.push(challenge.snippet.trim());
    if (challenge.stat) parts.push(challenge.stat.trim());
    if (challenge.quote) parts.push(challenge.quote.trim());

    return parts.join("\n\n"); // double line break looks great in UI
  }, [challenge])

  //
  // 4️⃣ UI
  //
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <Text style={styles.topLabel}>Challenge Details</Text>

      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        {/* Dim overlay */}
        <View style={styles.dimOverlay} />
  
        <SafeAreaView style={styles.contentWrapper} edges={["top", "bottom"]}>
          <View style={styles.container}>

            {/* Topic */}
            <AutoShrinkBlock
              height={100}
              fontWeight="700"
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

            {/* Source */}
            <Text style={styles.source}>
              Source: {challenge.source?.startsWith("Wacky") || !challenge.source
                ? "Emopulse"
                : challenge.source}
            </Text>

            {/* Snippet */}
            <View style={{ marginRight: -10 }}>
              <AutoShrinkBlock
                maxFontSize={20}
                height={230}
                minHeight={230}
                textAlign="left"
                fontWeight="700"
                marginBottom={10}
              >
                {combinedDetails ? combinedDetails : ""}
              </AutoShrinkBlock>
            </View>

            {/* NEXT BUTTON OR WINNING EMOTION */}
            {!isResolved ? (
              <>
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
              </>
            ) : (
              <Text style={styles.winningEmotion}>
                {challenge.winning_emotion && (
                  <Text style={styles.winningEmotionContainer}>
                    <Text style={styles.winningEmotionLabel}>Winning Emotion: </Text>
                    <Text style={styles.winningEmotionValue}>{challenge.winning_emotion}</Text>
                  </Text>
                )}
              </Text>
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  customHeader: {
    width: '100%',
    paddingTop: 8,            // small breathing room under the status bar
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // centers the logo
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,              // ensures it sits above content
  },

  backIcon: {
    width: 28,
    height: 28,
    tintColor: 'white',
    position: 'absolute',
    left: 16,                 // keeps it aligned like native-stack
    top: 8,
  },

  logo: {
    width: 220,               // adjust to your logo proportions
    height: 40,
    resizeMode: 'contain',
    marginTop: 4,             // subtle vertical tuning
  },

  topLabel: {
    color: 'yellow',
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
    opacity: 0.30,   // adjust to taste
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
    resizeMode: 'contain',
  },
  playImage: {
    width: 280,
    height: 47,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -10,
  },
  winningEmotion: {
    marginTop: 20,
    color: "lime",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  winningEmotionContainer: {
    marginTop: 20,
    textAlign: "center",
  },

  winningEmotionLabel: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },

  winningEmotionValue: {
    color: "lime",
    fontSize: 24,
    fontWeight: "700",
  },
  source: {
    marginTop: 10,
    marginLeft: 14,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  timer: {
    marginTop: 6,
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});