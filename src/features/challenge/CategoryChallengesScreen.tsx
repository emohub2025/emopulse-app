import { useEffect, useState } from 'react';
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

        <View style={styles.content}>
          {active.length === 0 && recent.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Available Challenges</Text>
            </View>
          ) : (
            <FlatList
              data={[...active, ...recent]}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                const isActiveSectionStart = index === 0 && active.length > 0;
                const isEmptyActiveSectionStart = index === 0 && active.length === 0;
                const isRecentSectionStart = index === active.length && recent.length > 0;

                return (
                  <>
                    {/* ⭐ Active Section Header */}
                    {isActiveSectionStart && (
                      <Text style={styles.sectionHeader}>Active Challenges</Text>
                    )}

                    {/* ⭐ Empty Active Section */}
                    {isEmptyActiveSectionStart && (
                      <>
                        <Text style={styles.sectionHeader}>Active Challenges</Text>
                        <Text style={styles.emptyMessage}>No active challenges!</Text>
                      </>
                    )}

                    {/* ⭐ Previous Section Header */}
                    {isRecentSectionStart && (
                      <Text style={[styles.sectionHeader, { marginTop: 50 }]}>
                        Previous Challenges
                      </Text>
                    )}

                    {/* ⭐ Challenge Card */}
                    <Pressable
                      style={styles.card}
                      onPress={() =>
                        navigation.navigate('ChallengeDetail', {
                          challenge: item,
                        })
                      }
                    >
                      <Image
                        source={getChallengeImageSource(item)}
                        style={styles.topicImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.title}>
                        {item.topic}
                        {item.source?.startsWith("YouTube") && (
                          <Text style={{ color: "lime" }}>
                            {"\n"} {`(Video: ${item.source.replace("YouTube: ", "")})`}
                          </Text>
                        )}
                      </Text>

                    </Pressable>
                  </>
                );
              }}
            />
          )}
        </View>

        <Text style={styles.timer}>{formattedTime}</Text>
      </SafeAreaView>
    </ImageBackground>
    </View>
  );
}

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
    marginBottom: -10,
    width: '70%',
    height: 150,
    alignSelf: 'center',
  },

  title: {
    padding: 12,
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },

  sectionHeader: {
    color: 'yellow',
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
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
    marginBottom: -35,
  },

  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 65,
    marginBottom: 5,
    paddingHorizontal: 20,
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyMessage: {
    color: 'white',
    fontWeight: '700',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },

  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: -10,
  },
});