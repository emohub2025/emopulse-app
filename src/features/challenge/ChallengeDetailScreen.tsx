import React, { useState, useRef, useEffect } from 'react';
import { Platform, View, Text, ImageBackground, StyleSheet, ViewStyle, Image, Pressable, Animated, Easing, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import playButton from '../../assets/buttons/play.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { useFeed } from "../../context/FeedContext";
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import { Dimensions } from "react-native";

const isIOS = Platform.OS === 'ios';

type ChallengeDetailRouteProp = RouteProp<RootStackParamList, 'ChallengeDetail'>;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'ChallengeDetail'>;

const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + '…' : str;

// Shorts-only extractor
function extractShortsId(url: string | undefined) {
  if (!url) return '';
  if (!url.includes('/shorts/')) return '';
  return url.split('/shorts/')[1].split('?')[0];
}

type Props = {
  route: ChallengeDetailRouteProp;
};

export default function ChallengeDetailScreen({ route }: Props) {
  const navigation = useNavigation<NavProp>();
  const { formattedTime } = useCycleTimer();
  const { challengeId } = route.params;
  const { feed } = useFeed();
  const SCREEN_HEIGHT = Dimensions.get("window").height - 141;   // 68 should be height of logo
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  //console.log("DetailScreen SCREEN_HEIGHT:", SCREEN_HEIGHT);

  // ⭐ All hooks MUST come before any early return
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
  const FRAME_WIDTH = 360;
  const FRAME_HEIGHT = 570;
  const PLAYER_WIDTH = FRAME_WIDTH * 2.85;
  const PLAYER_HEIGHT = FRAME_HEIGHT;
  const OFFSET = PLAYER_WIDTH / 2;

  const COLLAPSED_FRAME = {
    width: 330,
    height: 208,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: -20,
  };

  const EXPANDED_FRAME = {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 0,
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
  const title = expanded ? "Remove player" : "Challenge Details";
  // ⭐ Now safe to use feed
  const challenge = feed?.categories
    .flatMap(c => [
      ...c.active.map(ch => ({ ...ch, _origin: 'active' as const })),
      ...c.recent.map(ch => ({ ...ch, _origin: 'recent' as const })),
    ])
    .find(ch => ch.id === challengeId);

  const previous = challenge?._origin === 'recent';
  const imageSource = getChallengeImageSource(challenge);
  const isYouTube = challenge?.source?.startsWith('YouTube');

  // Combined snippet/stat/quote
  const combinedDetails = (() => {
    const parts: string[] = [];
    if (challenge?.snippet) parts.push(challenge.snippet.trim());
    if (challenge?.stat) parts.push(challenge.stat.trim());
    if (challenge?.quote) parts.push(challenge.quote.trim());
    return parts.join('\n\n');
  })();
  
  //console.log("📦 TEST:", challenge?.polling_answers?.slice(0,4));

  if (!feed || !challenge) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <Text style={{ color: "white", textAlign: "center", marginTop: 40 }}>
          Challenge not found
        </Text>
      </SafeAreaView>
    );
  }

return (
  <SafeAreaView
    style={{ flex: 1, backgroundColor: 'black' }}
    edges={isIOS ? [] : ['bottom']}
  >
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >

      {/* Title / collapse trigger */}
      {expanded ? (
        <Pressable onPress={() => setExpanded(false)}>
          <Text style={styles.topLabel}>{title}</Text>
        </Pressable>
      ) : (
        <Text style={styles.topLabel}>{title}</Text>
      )}

      {/* ⭐ EVERYTHING scrolls except the bottom bar */}
      <ScrollView
        style={{ flex: 1, maxHeight: SCREEN_HEIGHT - bottomBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* Topic */}
          <View style={{ backgroundColor: 'transparent' }}>
          {!expanded && (
            <AutoShrinkBlock
              height={100}
              width={"100%"}
              fontWeight="700"
              textAlign="center"
              fontStyle="italic"
              marginTop={-10}
              marginBottom={10}
            >
              {challenge?.topic ?? ""}
            </AutoShrinkBlock>
          )}
          </View>

          {/* Cinematic YouTube player */}
          {isYouTube && !previous ? (
            <View style={{ width: '100%', alignItems: 'center', marginTop: -10, marginBottom: 25 }}>
              <Animated.View
                style={{
                  ...frameStyle,
                  overflow: 'hidden',
                  backgroundColor: 'black',
                  position: 'relative',
                  transform: expanded ? [{ scale: scaleAnim }] : [],
                }}
              >
                {/* Hero image */}
                <Animated.View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    opacity: expanded
                      ? fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
                      : 1,
                    zIndex: expanded ? 0 : 2,
                  }}
                  pointerEvents={expanded ? 'none' : 'auto'}
                >
                  <Pressable onPress={() => setExpanded(true)}>
                    <Image source={imageSource} style={styles.image} resizeMode="cover" />
                  </Pressable>
                </Animated.View>

                {/* Player */}
                <Animated.View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    opacity: expanded ? fadeAnim : 0,
                    zIndex: expanded ? 3 : -1,
                  }}
                  pointerEvents={expanded ? 'auto' : 'none'}
                >
                  <View style={playerStyle}>
                    <YoutubePlayer
                      height={playerStyle.height}
                      width={playerStyle.width}
                      play={false}
                      videoId={extractShortsId(challenge?.url)}
                      initialPlayerParams={{
                        controls: true,
                        modestbranding: true,
                        rel: false,
                        playsinline: true,
                        fs: 0,
                      }}
                      webViewProps={{ allowsFullscreenVideo: false }}
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

          {/* Meta box */}
          {!expanded && (
            <>
              {challenge?.source === 'polling' && challenge?.status !== 'open' ? (
                <View style={styles.metaText}>
                  <Text style={styles.polltitle}>Polling Result</Text>
                  {challenge?.main?.poll_results?.slice(0,4)?.map(
                    (opt: { index: number; pct: number }, i: number) => (
                      <View key={i} style={{ marginBottom: 14, paddingLeft: 10, paddingRight: 10, }}>
                        <View style={{ flexDirection: "row", marginBottom: 4 }}>
                          <Text
                            style={{ color: 'white', fontSize: 18, width: 50 }}
                          >
                            {(opt.pct * 100).toFixed(0)}%
                          </Text>

                          <Text
                            style={{ color: 'white', fontSize: 18, flex: 1, marginLeft: 8 }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {challenge?.polling_answers?.[opt.index]}
                          </Text>
                        </View>

                        <View
                          style={{
                            height: 10,
                            backgroundColor: '#333',
                            borderRadius: 5,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              width: `${Math.max(opt.pct * 100, 1)}%`,
                              height: '100%',
                              backgroundColor: '#4da6ff',
                              borderTopRightRadius: 5,
                              borderBottomRightRadius: 5,
                            }}
                          />
                        </View>
                      </View>
                    )
                  )}

                </View>
                    ) : (
                <View style={styles.metaText}>
                  <Text style={styles.source}>
                    Source:{' '}
                    {!challenge?.source
                      ? 'Emopulse'
                      : challenge?.source}
                  </Text>
                    <ScrollView style={{ height: 182 }} showsVerticalScrollIndicator={false}>
                      <Text style={styles.meta}>{combinedDetails}</Text>
                    </ScrollView>
                  </View>
                )}
            </>
          )}
        </View>
      </ScrollView>

      {/* ⭐ Bottom bar stays fixed */}
      <View 
        style={styles.bottomBar}
        onLayout={e => setBottomBarHeight(e.nativeEvent.layout.height)}
      >
        {!previous ? (
          <>
            <Pressable
              onPress={() =>
                navigation.navigate("Challenge", { challengeId: challenge?.id })
              }
            >
              <Image
                source={playButton}
                style={[
                  styles.playImage,
                  { marginTop: expanded ? -18 : 9 }
                ]}
              />
            </Pressable>

            <Text style={styles.timer}>{formattedTime}</Text>
          </>
        ) : (
          <Text style={styles.winningEmotion}>
            {/* ... */}
          </Text>
        )}
      </View>

    </ImageBackground>
  </SafeAreaView>
);

}

// Styles
const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: isIOS ? 34 : 0, // safe area lift
    paddingTop: 6,
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  topLabel: {
    color: 'yellow',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 0,
    textAlign: 'center',
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
    marginBottom: 5,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 10, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.58)',
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 12,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    marginTop: -5,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    marginTop: 5,
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
  meta: {
    marginTop: -2,
    marginLeft: 14,
    color: 'white',
    fontSize: 19,
    fontWeight: '500',
  },
  source: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 14,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  polltitle: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 14,
    color: 'white',
    fontSize: 22,
    fontWeight: '500',
  },
  timer: {
    marginHorizontal: 40,
    color: 'yellow',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 1,
    alignSelf: 'center',
  },
});
