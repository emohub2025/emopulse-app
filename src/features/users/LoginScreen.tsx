import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import loginButton from '../../assets/buttons/login.png';
import googleButton from '../../assets/buttons/google.png';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, LoginResponse } from '../../navigation/types';
import eyeOpen from '../../assets/buttons/eye-open.png';
import eyeClosed from '../../assets/buttons/eye-close.png';
import { apiPost } from "../../api/engineClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "../../state/useUserStore";
import { getUserInfo } from '../../api/getUserInfo';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (loginSuccess) {
      navigation.replace("CategoryList");
    }
  }, [loginSuccess, navigation]);

  async function handleLogin() {
    if (loading) return;

    if (!identifier || !password) {
      setError("Please enter both username/email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiPost<LoginResponse>(
        "login",
        { identifier, password },
      );

      await AsyncStorage.setItem("authToken", response.accessToken);
      await AsyncStorage.setItem("refreshToken", response.refreshToken);
      await AsyncStorage.setItem("userId", String(response.userId));
      await AsyncStorage.setItem("walletId", String(response.walletId));

      console.log("MOBILE TOKEN:", response.accessToken);

      const fullUser = await getUserInfo(response.userId.toString());
      useUserStore.getState().setUser(fullUser);

      setLoginSuccess(true);
    } catch (err: any) {
      if (err?.response?.error) {
        setError(err.response.error);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Invalid username or password");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.title}>Log In to Your Account</Text>
            <Text style={styles.subtitle}>
              Jump back into Emotional Pulse and keep the momentum going.
            </Text>
          </View>

          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Avatar Name / Email"
              placeholderTextColor="#8A88B5"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.passwordRow}>
              <TextInput
                style={styles.inputPw}
                placeholder="Password"
                placeholderTextColor="#8A88B5"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={10}
              >
                <Image
                  source={showPassword ? eyeOpen : eyeClosed}
                  style={styles.eyeIcon}
                />
              </Pressable>
            </View>

            {error !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={[styles.buttonWrapper, loading && styles.disabledButton]}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Image source={loginButton} style={styles.buttonImage} />
                )}
              </View>
            </Pressable>

            {/* <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={[styles.googleWrapper, loading && styles.disabledButton]}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Image source={googleButton} style={styles.buttonImage} />
                )}
              </View>
            </Pressable> */}

            <View style={styles.loginRow}>
              <Text style={styles.bottomLabel}>Don't have an account?</Text>
              <Pressable onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.loginLink}>Sign Up</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 8, 20, 0.42)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerBlock: {
    width: '100%',
    marginTop: 42,
    marginBottom: 26,
    alignItems: 'center',
  },
  eyebrow: {
    color: '#A78BFA',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  formCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(13, 18, 44, 0.82)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  input: {
    width: '100%',
    height: 58,
    backgroundColor: '#11173A',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4A4779',
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 17,
    marginBottom: 16,
  },
  passwordRow: {
    width: '100%',
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11173A',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4A4779',
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 14,
  },
  inputPw: {
    flex: 1,
    height: '100%',
    color: 'white',
    fontSize: 17,
  },
  eyeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  errorText: {
    color: '#FF8B8B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonContent: {
    width: 320,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonImage: {
    width: 320,
    height: 58,
    resizeMode: 'stretch',
  },
  googleWrapper: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  bottomLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  loginLink: {
    color: '#A78BFA',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  bottomSpacer: {
    flex: 1,
  },
});