import React from 'react';
import { View, Text, TextInput, ImageBackground, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import signupButton from '../../assets/buttons/signup.png';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import eyeOpen from '../../assets/buttons/eye-open.png';
import eyeClosed from '../../assets/buttons/eye-close.png';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignupScreen() {
  const [checked, setChecked] = React.useState(true);
  const navigation = useNavigation<NavProp>();
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>

      {/* Top spacing or title area */}
      <SafeAreaView style={styles.topArea}>

        <Text style={styles.title}>Create Your Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#8A88B5"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8A88B5"
        />

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.inputPw, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#8A88B5"
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={showPassword ? eyeOpen : eyeClosed}
              style={styles.eyeIcon}
            />
          </Pressable>
        </View>

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.inputPw, { flex: 1 }]}
            placeholder="Confirm Password"
            placeholderTextColor="#8A88B5"
            secureTextEntry={!showPassword}
          />
        </View>

        {/* Checkbox */}
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setChecked(!checked)}
        >
          <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
            {checked && (
              <Image
                source={require('../../assets/buttons/check.png')}
                style={styles.checkIcon}
              />
            )}
          </View>

          <Text style={styles.checkboxLabel}>
            I agree to the Terms of Service & Privacy Policy
          </Text>
        </Pressable>

        {/* Signup Button */}
        <Pressable style={styles.buttonWrapper}>
          <Image source={signupButton} style={styles.buttonImage} />
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.bottomLabel}>Already have an account? </Text>

          <Pressable onPress={() => navigation.navigate("HomePage")}>
            <Text style={styles.loginLink}>Log In</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Background Image */}
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.background}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: 'white',
    height: 80,
    fontSize: 26,
    fontWeight: '500',
  },
  topArea: {
    flex: 1,
    marginTop: 80,
    alignItems: 'center',
  },
  input: {
    width: 320,
    height: 58,
    backgroundColor: '#11173A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4A4779',
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    justifyContent: 'center',
  },
  inputPw: {
    width: 320,
    height: 54,
    backgroundColor: '#11173A',
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 18,
    justifyContent: 'center',
  },
  eyeIcon: {
    width: 70,
    height: 70,
    marginTop: 4,
    marginRight: -15,
    resizeMode: 'contain',
  },
  passwordRow: {
    width: 320,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11173A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4A4779',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  /* Checkbox */
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4A4779',
    backgroundColor: '#11173A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    borderWidth: 0,               // removes border
    borderColor: 'transparent',   // extra safety
    backgroundColor: '#4A4779',   // highlight color
  },
  checkIcon: {
    width: 18,                    // slightly larger if you want
    height: 18,
    resizeMode: 'contain',
  },
  checkboxLabel: {
    color: 'white',
    fontSize: 13,
    marginLeft: 12,
    fontWeight: '400',
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 320,
    marginTop: 10,
    marginBottom: 0,
  },
  /* Signup Button */
  buttonWrapper: {
    alignItems: 'center',
    marginTop: 33,
    marginBottom: 3,
  },
  buttonImage: {
    width: 320,
    height: 58,
    marginBottom: 3,
    resizeMode: 'stretch',
  },

  bottomLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    marginTop: 25,
  },

  loginLink: {
    color: '#A78BFA',   // a nice futuristic purple
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },

  background: {
    height: 110,
  },
});