import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCycleTimer } from '../../components/CycleTimerContext';
import activeButton from '../../assets/buttons/active.png';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChallengeResults'
>;

/* -------------------------------------------------------
   ⭐ Main Screen
------------------------------------------------------- */
export default function ChallengeResultScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { challenge } = route.params || {};
  const { isExpired, formattedTime } = useCycleTimer();

  if (!challenge) {
    console.error("❌ ChallengeResults missing challenge or challenge.id:", challenge);
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Missing challenge data</Text>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (isExpired) {
      setTimeout(() => {
        navigation.navigate("ChallengeResults", {
          challengeId: challenge.id,
        });
      }, 2000);
    }
  }, [isExpired]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
        >
        <SafeAreaView style={styles.safe}>

            {/* ⭐ Full-screen vertical layout */}
            <View style={{ flex: 1, justifyContent: 'space-between' }}>

            {/* ⭐ Center message */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.waitingText}>
                Waiting for challenge results…
                </Text>
            </View>

            {/* ⭐ Bottom area: button + timer */}
            <View style={{ alignItems: 'center' }}>
              <Pressable
                onPress={() =>
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "CategoryList" }],
                  })
                }
                >
                <Image source={activeButton} style={styles.buttonImage} />
              </Pressable>

              <Text style={styles.timer}>{formattedTime}</Text>
            </View>

            </View>

        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

/* -------------------------------------------------------
   ⭐ Styles
------------------------------------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 0,
  },
  waitingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonImage: {
    width: 285,
    height: 48,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 10,
  },
  timer: {
    color: 'yellow',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  loadingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
});