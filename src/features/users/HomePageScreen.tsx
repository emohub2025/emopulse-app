import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

import loginButton from '../../assets/buttons/login.png';
import signupButton from '../../assets/buttons/signup.png';
import googleButton from '../../assets/buttons/google.png';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomePage'
>;

export default function HomePageScreen() {
  const navigation = useNavigation<NavProp>();
  const openTerms = () => Linking.openURL('https://emopulse.ai/terms/');
  const openPrivacy = () => Linking.openURL('https://emopulse.ai/privacy-policy/');

  return (
<View style={{ flex: 1, backgroundColor: 'black' }}>

  {/* Top spacing or title area */}
  <SafeAreaView style={styles.topArea} edges={[]}>
    {/* You can add a logo or leave it empty */}
  </SafeAreaView>

  {/* Hero Image */}
  <ImageBackground
    source={require('../../assets/images/home.png')}
    style={styles.heroImage}
    resizeMode="cover"
  />

  {/* Logo / Title */}
  <SafeAreaView style={styles.safe} edges={[]}>
    <Text style={styles.title}>Join the future of emotional intelligence!</Text>
  </SafeAreaView>

  {/* Buttons */}
  <SafeAreaView style={styles.buttonsArea} edges={[]}>

    <Pressable
      style={styles.buttonWrapper}
      //onPress={() => navigation.navigate('Login')}
      onPress={() => navigation.navigate('Login')}
    >
      <Image source={loginButton} style={styles.buttonImage} />
    </Pressable>

    <Pressable 
      style={styles.buttonWrapper}
      onPress={() => navigation.navigate('Signup')}
    >
      <Image source={signupButton} style={styles.buttonImage} />
    </Pressable>

    {/* <Pressable style={styles.buttonWrapper}>
      <Image source={googleButton} style={styles.googleImage} />
    </Pressable> */}
    <View style={styles.legalRow}>
      <Text style={styles.bottomLabel}>By continuing, you agree to our </Text>
      <Pressable onPress={openTerms}>
        <Text style={styles.legalLink}>Terms</Text>
      </Pressable>
      <Text style={styles.bottomLabel}> & </Text>
      <Pressable onPress={openPrivacy}>
        <Text style={styles.legalLink}>Privacy Policy</Text>
      </Pressable>
    </View>
  </SafeAreaView>

</View>

  );
}

const styles = StyleSheet.create({
  safe: {
    fontSize: 2,
    marginTop: -10,
    marginBottom: -20,
    height: 0,        // ⭐ replaces your marginTop=122
    alignItems: 'center',
  },
  title: {
    color: 'white',
    height: 100,
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 200,
  },
  topArea: {
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: 385,
    height: 331,      // or height * 0.5
  },
  buttonsArea: {
    flex: 1,
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    marginBottom: 3,
  },
  buttonImage: {
    width: 320,
    height: 58,
    marginBottom: 15,
    resizeMode: 'stretch',
  },
  googleImage: {
    width: 320,
    height: 55,
    resizeMode: 'stretch',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
  },
  bottomLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 25,
    paddingHorizontal: 22,
  },
  legalLink: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
