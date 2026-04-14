import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  ViewStyle,
  Image,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';

import playButton from '../../assets/buttons/play.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';
import { useCycleTimer } from '../../components/CycleTimerContext';
import { getChallengeImageSource } from '../../assets/wacky/getChallengeImageSource';
import YoutubePlayer from 'react-native-youtube-iframe';

type ChallengeDetailRouteProp = RouteProp<
  RootStackParamList,
  'ChallengeDetail'
>;

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChallengeDetail'
>;

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
  const challenge = route?.params?.challenge;
  const navigation = useNavigation<NavProp>();
  const { formattedTime } = useCycleTimer();

  if (!challenge) return null;

  const isResolved = challenge.status !== 'open';
  const imageSource = getChallengeImageSource(challenge);
  const isYouTube = challenge.source?.startsWith('YouTube');

  const [expanded, setExpanded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
  }, [expanded, fadeAnim, scaleAnim]);

  const FRAME_WIDTH = 365;
  const FRAME_HEIGHT = 559;
  const PLAYER_WIDTH = FRAME_WIDTH * 2.72;
  const PLAYER_HEIGHT = FRAME_HEIGHT * 1.2;
  const OFFSET = PLAYER_WIDTH / 2;

  const COLLAPSED_FRAME = {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: -10,
  };

  const EXPANDED_FRAME = {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderRadius: 25,
    marginTop: -22,
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

  const combinedDetails = useMemo(() => {
    const parts: string[] = [];
    if (challenge.snippet) parts.push(challenge.snippet.trim());
    if (challenge.stat) parts.push(challenge.stat.trim());
    if (challenge.quote) parts.push(challenge.quote.trim());
    return parts.join('\n\n');
  }, [challenge]);

  const bottomStatusText =
    formattedTime?.toLowerCase?.() === 'expired' ? 'Expired Challenges' : formattedTime;

  const hasUserPlayed =
    !!challenge.already_played ||
    !!challenge.has_user_prediction ||
    !!challenge.user_has_prediction ||
    !!challenge.userPlayed ||
    !!challenge.submitted ||
    !!challenge.user_prediction ||
    !!challenge.userPrediction;

  const showPlayButton = !isResolved && !hasUserPlayed;
  const showSubmittedButton = !isResolved && hasUserPlayed;

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
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
        <View style={styles.dimOverlay} />

        <SafeAreaView style={styles.contentWrapper} edges={['top', 'bottom']}>
          <View style={styles.container}>
            {!expanded && (
              <AutoShrinkBlock
                height={96}
                fontWeight="700"
                textAlign="center"
                fontStyle="italic"
                marginTop={-12}
              >
                {challenge.topic}
              </AutoShrinkBlock>
            )}

            {isYouTube ? (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginTop: -4,
                  marginBottom: 20,
                }}
              >
                <Animated.View
                  style={{
                    ...frameStyle,
                    overflow: 'hidden',
                    backgroundColor: 'black',
                    position: 'relative',
                    transform: [{ scale: scaleAnim }],
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.12)',
                  }}
                >
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
                      <Image
                        source={imageSource}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    </Pressable>
                  </Animated.View>

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

            {!expanded && (
              <View style={styles.detailCard}>
                <Text style={styles.source}>
                  Source:{' '}
                  {challenge.source?.startsWith('Wacky') || !challenge.source
                    ? 'Emopulse'
                    : challenge.source}
                </Text>

                <View style={{ marginRight: -4 }}>
                  <AutoShrinkBlock
                    maxFontSize={20}
                    height={220}
                    minHeight={220}
                    textAlign="left"
                    fontWeight="700"
                    marginBottom={4}
                  >
                    {combinedDetails}
                  </AutoShrinkBlock>
                </View>
              </View>
            )}

            {showPlayButton ? (
              <View style={styles.bottomActionWrap}>
                <Pressable onPress={() => navigation.navigate('Challenge', { challenge })}>
                  <Image source={playButton} style={styles.playImage} />
                </Pressable>

                <Text style={styles.timer}>{bottomStatusText}</Text>
              </View>
            ) : showSubmittedButton ? (
              <View style={styles.bottomActionWrap}>
                <Pressable
                  style={styles.submittedButton}
                  onPress={() => navigation.navigate('ChallengeCountdown', { challenge })}
                >
                  <Text style={styles.submittedButtonText}>Prediction Submitted</Text>
                </Pressable>

                <Text style={styles.submittedText}>
                  You already submitted a prediction for this challenge
                </Text>
                <Text style={styles.timer}>{bottomStatusText}</Text>
              </View>
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

const styles = StyleSheet.create({
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
    paddingHorizontal: 14,
    paddingBottom: 10,
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
  imageWrapper: {
    width: '100%',
    height: 210,
    marginTop: 0,
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  detailCard: {
    backgroundColor: 'rgba(15, 7, 35, 0.76)',
    borderRadius: 18,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  source: {
    marginTop: 0,
    marginLeft: 2,
    marginBottom: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomActionWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  playImage: {
    width: 280,
    height: 47,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 0,
  },
  submittedButton: {
    width: 280,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submittedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  submittedText: {
    marginTop: 10,
    color: '#A8FF9F',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  timer: {
    marginTop: 10,
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  winningEmotion: {
    marginTop: 26,
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
});