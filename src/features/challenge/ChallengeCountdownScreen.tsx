import React, { useEffect, useMemo } from 'react';
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

const categoryImages: Record<string, any> = {
  Politics: require('../../assets/images/category-politics.png'),
  Sports: require('../../assets/images/category-sports.png'),
  Entertainment: require('../../assets/images/category-entertainment.png'),
  'Tech & Science': require('../../assets/images/category-tech.png'),
  Tech: require('../../assets/images/category-tech.png'),
  Music: require('../../assets/images/category-music.png'),
  Gaming: require('../../assets/images/category-gaming.png'),
  Finance: require('../../assets/images/category-finance.png'),
  Health: require('../../assets/images/category-health.png'),
  Hallucination: require('../../assets/images/category-wacky.png'),
  Hallucinations: require('../../assets/images/category-wacky.png'),
  Wacky: require('../../assets/images/category-wacky.png'),
};

const categoryAccentMap: Record<string, string> = {
  Politics: '#ff5c8a',
  Sports: '#34d399',
  Entertainment: '#f59e0b',
  'Tech & Science': '#38bdf8',
  Tech: '#38bdf8',
  Music: '#a78bfa',
  Gaming: '#c084fc',
  Finance: '#22c55e',
  Health: '#2dd4bf',
  Hallucination: '#fb7185',
  Hallucinations: '#fb7185',
  Wacky: '#fb7185',
};

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
    console.error('❌ ChallengeResults missing challenge or challenge.id:', challenge);
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  const rawCategoryName =
    challenge.category ||
    challenge.category_name ||
    'Challenge';

  const normalizedCategoryName = String(rawCategoryName).trim();

  console.log('COUNTDOWN CATEGORY:', rawCategoryName, normalizedCategoryName);

  const categoryImage = categoryImages[normalizedCategoryName] ?? null;
  const accentColor = categoryAccentMap[normalizedCategoryName] ?? '#c43dff';

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        glowRingOuter: {
          width: 124,
          height: 124,
          borderRadius: 62,
          backgroundColor: `${accentColor}2B`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        },
        glowRingMiddle: {
          width: 98,
          height: 98,
          borderRadius: 49,
          backgroundColor: `${accentColor}42`,
          justifyContent: 'center',
          alignItems: 'center',
        },
        countdownCard: {
          backgroundColor: 'rgba(0,0,0,0.26)',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: `${accentColor}55`,
          paddingVertical: 18,
          paddingHorizontal: 16,
          alignItems: 'center',
          marginBottom: 14,
        },
        categoryPill: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          backgroundColor: `${accentColor}24`,
          borderWidth: 1,
          borderColor: `${accentColor}5C`,
          borderRadius: 999,
          paddingVertical: 7,
          paddingHorizontal: 14,
          marginBottom: 12,
        },
      }),
    [accentColor]
  );

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
        navigation.navigate('ChallengeResults', {
          challengeId: challenge.id,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isExpired, navigation, challenge.id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.screen}>
            <View style={styles.heroWrap}>
              <View style={dynamicStyles.glowRingOuter}>
                <View style={dynamicStyles.glowRingMiddle}>
                  <View style={styles.glowRingInner}>
                    {categoryImage ? (
                      <Image source={categoryImage} style={styles.heroCategoryIcon} />
                    ) : (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
              </View>

              <Text style={styles.title}>Prediction Submitted</Text>
              <Text style={styles.subtitle}>
                Your prediction is locked in. Results will be revealed when the countdown ends.
              </Text>
            </View>

            <View style={styles.mainCard}>
              <View style={dynamicStyles.categoryPill}>
                {categoryImage ? (
                  <Image source={categoryImage} style={styles.categoryPillIcon} />
                ) : null}
                <Text style={styles.categoryPillText}>{normalizedCategoryName}</Text>
              </View>

              <Text style={styles.sectionLabel}>Current Challenge</Text>

              <View style={styles.topicCard}>
                <AutoShrinkBlock
                  height={86}
                  fontWeight="700"
                  textAlign="center"
                  fontStyle="italic"
                >
                  {challenge.topic}
                </AutoShrinkBlock>
              </View>

              <View style={dynamicStyles.countdownCard}>
                <Text style={styles.countdownLabel}>Results Reveal In</Text>
                <Text style={styles.countdownValue}>{visibleTimer}</Text>
              </View>

              <Text style={styles.helperText}>
                Browse more active predictions while you wait.
              </Text>
            </View>

            <View style={styles.bottomArea}>
              <Pressable
                onPress={() =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'CategoryList' }],
                  })
                }
              >
                <Image source={activeButton} style={styles.buttonImage} />
              </Pressable>

              <Text style={styles.bottomNote}>
                More live predictions are available now
              </Text>
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
    paddingTop: 38,
    paddingHorizontal: 20,
  },
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 18,
  },
  heroWrap: {
    alignItems: 'center',
    paddingTop: 12,
  },
  glowRingInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  heroCategoryIcon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  checkmark: {
    color: 'white',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
    marginTop: -1,
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 16,
    maxWidth: 360,
  },
  mainCard: {
    backgroundColor: 'rgba(19, 10, 45, 0.84)',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  categoryPillIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
    marginRight: 8,
  },
  categoryPillText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#d7b4ff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  topicCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingTop: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  countdownLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  countdownValue: {
    color: 'yellow',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  helperText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 6,
  },
  bottomArea: {
    alignItems: 'center',
    paddingTop: 18,
  },
  buttonImage: {
    width: 285,
    height: 48,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 6,
  },
  bottomNote: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});