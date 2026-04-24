import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, ViewStyle, Image, Pressable, Animated, Easing, StyleProp } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import playButton from '../../assets/buttons/play.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { useFeed } from "../../context/FeedContext";
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import YoutubePlayer from 'react-native-youtube-iframe';

// Route params
type ChallengeDetailRouteProp = RouteProp<RootStackParamList, 'ChallengeDetail'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'ChallengeDetail'>;

// Shorts-only extractor
function extractShortsId(url: string) {
  if (!url) return '';
  if (!url.includes('/shorts/')) return '';
  return url.split('/shorts/')[1].split('?')[0];
}

export default function ChallengeDetailScreen({
  route,
}: {
  route: ChallengeDetailRouteProp;
}) {
  const navigation = useNavigation<NavProp>();
  const { formattedTime } = useCycleTimer();

  const { challengeId } = route.params;
  const { feed } = useFeed();
  if (!feed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const challenge = feed.categories
    .flatMap(c => [...c.active, ...c.recent])
    .find(ch => ch.id === challengeId);

  if (!challenge) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 40 }}>
          Challenge not found
        </Text>
      </SafeAreaView>
    );
  }

  const isResolved = challenge.status !== 'open';
  const imageSource = getChallengeImageSource(challenge);
  const isYouTube = challenge.source?.startsWith('YouTube');

  const [expanded, setExpanded] = useState(false);

  // ⭐ Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ⭐ Animate on expand/collapse
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: expanded ? 1 : 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: expanded ? 1 : 0.92,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [expanded]);

  // Frame sizing
  const FRAME_WIDTH = 365;
  const FRAME_HEIGHT = 559;
  const PLAYER_WIDTH = FRAME_WIDTH * 2.72;
  const PLAYER_HEIGHT = FRAME_HEIGHT;
  const OFFSET = PLAYER_WIDTH / 2;

  const COLLAPSED_FRAME = {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: -24,
  };

  const EXPANDED_FRAME = {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderRadius: 25,
    marginTop: -22,
    marginBottom: 11,
  };

  const frameStyle = expanded ? EXPANDED_FRAME : COLLAPSED_FRAME;

  const collapsedPlayer: ViewStyle = {
    width: 330,
    height: 200,
    position: 'absolute',
    top: 0,
    left: 0,
  };

  const expandedPlayer: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    transform: [{ translateX: -OFFSET }],
  };

  const playerStyle = expanded ? expandedPlayer : collapsedPlayer;

  // Combined snippet/stat/quote
  const combinedDetails = useMemo(() => {
    const parts: string[] = [];
    if (challenge.snippet) parts.push(challenge.snippet.trim());
    if (challenge.stat) parts.push(challenge.stat.trim());
    if (challenge.quote) parts.push(challenge.quote.trim());
    return parts.join('\n\n');
  }, [challenge]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>

      {/* Collapse trigger */}
      {expanded ? (
        <Pressable onPress={() => setExpanded(false)}>
          <Text style={styles.topLabel}>Challenge Details</Text>
        </Pressable>
      ) : (
        <Text style={styles.topLabel}>Challenge Details</Text>
      )}

      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.contentWrapper} edges={['top', 'bottom']}>
          <View style={styles.container}>

            {/* Topic (hero only) */}
            {!expanded && (
              <AutoShrinkBlock
                height={100}
                width={"100%"}
                fontWeight="700"
                textAlign="center"
                fontStyle="italic"
                marginTop={-35}
              >
                {challenge.topic}
              </AutoShrinkBlock>
            )}

            {/* YOUTUBE MODE */}
            {isYouTube ? (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginTop: -10,
                  marginBottom: 25,
                }}
              >
                {/* ANIMATED WRAPPER (scale only — NEVER fade this) */}
                <Animated.View
                  style={
                    {
                      ...frameStyle,
                      overflow: 'hidden',
                      backgroundColor: 'black',
                      position: 'relative',
                      transform: [{ scale: scaleAnim }],
                    } as Animated.AnimatedProps<ViewStyle>
                  }
                >
                  {/* HERO IMAGE LAYER (always mounted) */}
                  <Animated.View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      opacity: expanded
                        ? fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0],
                          })
                        : 1,
                      zIndex: expanded ? 0 : 2,
                    }}
                    pointerEvents={expanded ? 'none' : 'auto'}
                  >
                    <Pressable onPress={() => setExpanded(true)}>
                      <Image source={imageSource} style={styles.image} resizeMode="cover" />
                    </Pressable>
                  </Animated.View>

                  {/* PLAYER LAYER (always mounted) */}
                  <Animated.View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      opacity: expanded ? fadeAnim : 0, // fade IN when expanding
                      zIndex: expanded ? 3 : -1, // player only on top when expanded
                    }}
                    pointerEvents={expanded ? 'auto' : 'none'}
                  >
                    <View style={playerStyle}>
                      <YoutubePlayer
                        height={playerStyle.height}
                        width={playerStyle.width}
                        play={false}
                        videoId={extractShortsId(challenge.url)}
                        initialPlayerParams={{
                          controls: true,
                          modestbranding: true,
                          rel: false,
                          playsinline: true,
                          fs: 0,
                        }}
                        webViewProps={{
                          allowsFullscreenVideo: false,
                        }}
                      />
                    </View>
                  </Animated.View>
                </Animated.View>
              </View>
            ) : (
              <View style={styles.imageWrapper}>
                <Image source={imageSource} style={styles.image} />
              </View>
            )}

            {/* DETAILS (only when collapsed) */}
            {!expanded && (
              <>
                <View style={styles.metaText}>
                  <Text style={styles.source}>
                    Source:{' '}
                    {challenge.source?.startsWith('Wacky') || !challenge.source
                      ? 'Emopulse'
                      : challenge.source}
                  </Text>
                  <AutoShrinkBlock
                    maxFontSize={22}
                    height={210}
                    width={"104%"}
                    minHeight={200}
                    textAlign="left"
                    fontWeight="700"
                  >
                    {combinedDetails}
                  </AutoShrinkBlock>
                </View>
              </>
            )}

            {/* NEXT BUTTON OR WINNING EMOTION */}
            {!isResolved ? (
              <>
                <Pressable
                  onPress={() =>
                    navigation.navigate("Challenge", { challengeId: challenge.id })
                  }
                >
                  <Image
                    source={playButton}
                    style={[
                      styles.playImage,
                      { marginTop: expanded ? -26 : 6 }
                    ]}
                  />
                </Pressable>

                <Text style={styles.timer}>{formattedTime}</Text>
              </>
            ) : (
              <Text style={styles.winningEmotion}>
                {challenge.winning_emotion && (
                  <Text style={styles.winningEmotionContainer}>
                    <Text style={styles.winningEmotionLabel}>
                      Winning Emotion:{' '}
                    </Text>
                    <Text style={styles.winningEmotionValue}>
                      {challenge.winning_emotion}
                    </Text>
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
  topLabel: {
    color: 'yellow',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 98,
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
    backgroundColor: 'black',
    opacity: 0.3,
    zIndex: 1,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  metaText: {
    marginTop: 6,
    marginBottom: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 10, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 0,
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
  },
  winningEmotion: {
    marginTop: 20,
    color: 'lime',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  winningEmotionContainer: {
    marginTop: 20,
    textAlign: 'center',
  },
  winningEmotionLabel: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  winningEmotionValue: {
    color: 'lime',
    fontSize: 24,
    fontWeight: '700',
  },
  source: {
    marginTop: 8,
    marginLeft: 14,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  timer: {
    marginTop: 2,
    color: 'yellow',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
});