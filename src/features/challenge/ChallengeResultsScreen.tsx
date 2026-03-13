import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, Image, ImageBackground, StyleSheet, Pressable, BackHandler, Animated 
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChallengeResult, getChallengeResults } from '../../api/getChallengeResults';
import { useCycleTimer } from '../../components/CycleTimerContext';
import eventBus from '../../components/eventBus';
import activeButton from '../../assets/buttons/active.png';
import AutoShrinkBlock from '../../components/AutoShrinkBlock';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChallengeResults'
>;

export default function ChallengeResultScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { challenge } = route.params || {};
  const USER_ID = "dda1522f-2c44-499e-a8e5-04460b888d05";

  if (!challenge || !challenge.id) {
    console.error("❌ ChallengeResults missing challenge or challenge.id:", challenge);
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChallengeResult | null>(null);

  // ⭐ Timer values (restores live countdown)
  const { isExpired, formattedTime } = useCycleTimer();

  // ⭐ Prevent double fetch
  const fetchedRef = useRef(false);

  // ⭐ Animated fade overlay
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: loading ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  // ⭐ Unified fetch function
  const fetchResults = async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      setLoading(true);

      const data = await getChallengeResults(challenge.id, USER_ID);

      console.log("🔥 Challenge results received:", data);

      setResults(data);

    } catch (err) {
      console.log("❌ ERROR LOADING RESULT:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Main effect: fetch immediately if expired, otherwise wait for event
  useEffect(() => {
    const DELAY_MS = 2000; // ⭐ 2-second delay before backend call

    if (isExpired) {
      console.log("🔥 Cycle already expired — waiting before fetch");
      setTimeout(fetchResults, DELAY_MS);
      return;
    }

    const onExpire = () => {
      console.log("🔥 cycleExpired event received — waiting before fetch");
      setTimeout(fetchResults, DELAY_MS);
    };

    eventBus.on("cycleExpired", onExpire);

    return () => {
      eventBus.off("cycleExpired", onExpire);
    };
  }, [challenge.id, isExpired]);

  // ⭐ Back button → return to CategoryList
  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CategoryList' }],
        });
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBack
      );

      return () => subscription.remove();
    }, [navigation])
  );

  // ⭐ Main UI
  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Challenge Results</Text>

        {/* Topic */}
        <AutoShrinkBlock
          height={100}
          textAlign="center"
          fontStyle="italic"
          marginTop={-30}
        >
          {challenge.topic}
        </AutoShrinkBlock>

        <View style={styles.box}>
          <Text style={styles.label}>Winning Emotion:</Text>
          <Text style={styles.value}>{results?.winning_emotion}</Text>

          <Text style={styles.label}>Total Players:</Text>
          <Text style={styles.value}>{results?.total_participants}</Text>

          {results?.user && (
            <>
              <Text style={styles.label}>Your Emotion:</Text>
              <Text style={styles.value}>{results.user.emotion}</Text>

              <Text style={styles.label}>Your Payout:</Text>
              <Text style={styles.value}>{results.user.payout}</Text>

              <Text style={styles.label}>Coin Change:</Text>
              <Text
                style={[
                  styles.value,
                  { color: results.user.delta >= 0 ? 'lime' : 'red' }
                ]}
              >
                {results.user.delta >= 0 ? `+${results.user.delta}` : results.user.delta}
              </Text>

              <Text style={styles.label}>Won:</Text>
              <Text style={styles.value}>{results.user.won ? 'Yes' : 'No'}</Text>
            </>
          )}
        </View>

        {/* ⭐ Working button (reset navigation) */}
        <Pressable
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'CategoryList' }],
            })
          }
        >
          <Image source={activeButton} style={styles.activeImage} />
        </Pressable>

        {/* ⭐ Live timer */}
        <Text style={styles.timer}>{formattedTime}</Text>

        {/* ⭐ Fade-in/out loading overlay (touch-safe) */}
        <Animated.View
          pointerEvents={loading ? 'auto' : 'none'}
          style={[styles.loadingOverlay, { opacity: fadeAnim }]}
        >
          <Text style={styles.loadingText}>Loading challenge results…</Text>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 25,
  },
  box: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  label: {
    color: '#AAA',
    fontSize: 16,
    marginTop: 10,
  },
  value: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  activeImage: {
    width: 280,
    height: 47,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 45,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  // ⭐ Fade overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
});