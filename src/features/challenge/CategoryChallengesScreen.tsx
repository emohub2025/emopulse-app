import { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { useCycleTimer } from '../../components/CycleTimerContext';
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
  const { category, active = [], recent = [] } = route.params;
  const { formattedTime } = useCycleTimer();
  const [error] = useState<string | null>(null);

  const bottomStatusText = useMemo(
    () => (formattedTime?.toLowerCase?.() === 'expired' ? 'Expired Challenges' : formattedTime),
    [formattedTime]
  );

  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) return;

    const handler = () => {
      navigation.navigate('CategoryList');
    };

    eventBus.on('cycleExpired', handler);
    return () => {
      eventBus.off('cycleExpired', handler);
    };
  }, [isFocused, navigation]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Text style={styles.topLabel}>{category}</Text>
          <Text style={styles.subLabel}>Play active challenges or review expired challenges below</Text>

          <View style={styles.content}>
            {active.length === 0 && recent.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Available Challenges</Text>
              </View>
            ) : (
              <FlatList
                data={[...active, ...recent]}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  const isActiveSectionStart = index === 0 && active.length > 0;
                  const isEmptyActiveSectionStart = index === 0 && active.length === 0;
                  const isRecentSectionStart = index === active.length && recent.length > 0;
                  const isVideo = item.source?.startsWith('YouTube');

                  const hasUserPlayed =
                    !!item.already_played ||
                    !!item.has_user_prediction ||
                    !!item.user_has_prediction ||
                    !!item.userPlayed ||
                    !!item.submitted ||
                    !!item.user_prediction ||
                    !!item.userPrediction;

                  return (
                    <>
                      {isActiveSectionStart && (
                        <Text style={styles.sectionHeader}>Active Challenges</Text>
                      )}

                      {isEmptyActiveSectionStart && (
                        <>
                          <Text style={styles.sectionHeader}>Active Challenges</Text>
                          <Text style={styles.emptyMessage}>No active challenges!</Text>
                        </>
                      )}

                      {isRecentSectionStart && (
                        <Text style={[styles.sectionHeader, { marginTop: 34 }]}>
                          Expired Challenges
                        </Text>
                      )}

                      <Pressable
                        style={({ pressed }) => [
                          styles.card,
                          hasUserPlayed && styles.cardSubmitted,
                          pressed && styles.cardPressed,
                        ]}
                        onPress={() =>
                          navigation.navigate('ChallengeDetail', {
                            challenge: {
                              ...item,
                              category: item.category || item.category_name || category,
                            },
                          })
                        }
                      >
                        <View style={styles.imageShell}>
                          <Image
                            source={getChallengeImageSource(item)}
                            style={styles.topicImage}
                            resizeMode="contain"
                          />
                        </View>

                        <View style={styles.textBlock}>
                          <Text style={styles.title}>{item.topic}</Text>

                          {isVideo && (
                            <View style={styles.videoBadge}>
                              <Text style={styles.videoBadgeText}>
                                Video: {item.source.replace('YouTube: ', '')}
                              </Text>
                            </View>
                          )}

                          {hasUserPlayed && (
                            <View style={styles.submittedBadge}>
                              <Text style={styles.submittedBadgeText}>
                                Challenge Submitted
                              </Text>
                            </View>
                          )}
                        </View>
                      </Pressable>
                    </>
                  );
                }}
              />
            )}
          </View>

          <Text style={styles.timer}>{bottomStatusText}</Text>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    marginBottom: -35,
  },
  topLabel: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 65,
    marginBottom: 6,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  subLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 10,
  },
  sectionHeader: {
    color: 'yellow',
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(34, 13, 88, 0.92)',
    borderRadius: 18,
    marginLeft: 20,
    marginRight: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardSubmitted: {
    borderColor: 'rgba(168,255,159,0.45)',
    backgroundColor: 'rgba(24, 36, 48, 0.92)',
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  imageShell: {
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  topicImage: {
    marginTop: 4,
    marginBottom: -4,
    width: '72%',
    height: 150,
    alignSelf: 'center',
  },
  textBlock: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  videoBadge: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(102,255,102,0.14)',
    borderColor: 'rgba(102,255,102,0.4)',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  videoBadgeText: {
    color: '#A8FF9F',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  submittedBadge: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,214,107,0.14)',
    borderColor: 'rgba(255,214,107,0.4)',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  submittedBadgeText: {
    color: '#FFD66B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyMessage: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    textAlign: 'center',
    marginTop: -2,
    marginBottom: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  timer: {
    color: 'yellow',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 38,
  },
});