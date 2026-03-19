import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ImageBackground, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import loginButton from '../../assets/buttons/login.png';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, LoginResponse } from '../../navigation/types';
import eyeOpen from '../../assets/buttons/eye-open.png';
import eyeClosed from '../../assets/buttons/eye-close.png';
import { apiPost } from "../../api/engineClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);   // ← prevents double-submit
  const [error, setError] = useState("");

  const [checkingLogin, setCheckingLogin] = useState(true);

  // ---------------------------------------
  // 🔍 Auto-login check
  // ---------------------------------------
  useEffect(() => {
    async function checkExistingLogin() {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");

        if (token && userId) {
          navigation.replace("CategoryList");
          return;
        }
      } catch (err) {
        console.log("⚠️ Error checking stored login:", err);
      }

      setCheckingLogin(false);
    }

    checkExistingLogin();
  }, []);

  if (checkingLogin) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  // ---------------------------------------
  // 🔐 Handle Login (double-submit safe)
  // ---------------------------------------
  async function handleLogin() {
    if (loading) return; // ← HARD STOP: prevents double-submit

    if (!identifier || !password) {
      setError("Please enter both username/email and password");
      return;
    }

    try {
      setLoading(true);  // ← lock the button
      setError("");

      const response = await apiPost<LoginResponse>(
        "login",
        { identifier, password },
        navigation
      );

      await AsyncStorage.setItem("authToken", response.token);
      await AsyncStorage.setItem("userId", String(response.userId));
      await AsyncStorage.setItem("walletId", String(response.walletId));

      navigation.replace("CategoryList");

    } catch (err: any) {
      if (err?.response?.error) {
        setError(err.response.error);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Invalid username or password");
      }

    } finally {
      setLoading(false);   // ← unlock the button
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <SafeAreaView style={styles.topArea}>
        <Text style={styles.title}>Log In to Your Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Avatar Name / Email"
          placeholderTextColor="#8A88B5"
          value={identifier}
          onChangeText={setIdentifier}
        />

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.inputPw, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#8A88B5"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={showPassword ? eyeOpen : eyeClosed}
              style={styles.eyeIcon}
            />
          </Pressable>
        </View>

        {error !== "" && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* 🔥 Button with spinner */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={[styles.buttonWrapper, loading && { opacity: 0.5 }]}
        >
          <View style={styles.buttonContent}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Image source={loginButton} style={styles.buttonImage} />
            )}
          </View>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.bottomLabel}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.loginLink}>Sign Up</Text>
          </Pressable>
        </View>
      </SafeAreaView>

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
  eyeIcon: {
    width: 70,
    height: 70,
    marginTop: 4,
    marginRight: -15,
    resizeMode: 'contain',
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
  },
  inputPw: {
    width: 320,
    height: 54,
    backgroundColor: '#11173A',
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginBottom: 10,
    marginTop: -10,
  },
  buttonWrapper: {
    alignItems: 'center',
    marginTop: 33,
    marginBottom: 3,
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
    color: '#A78BFA',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  background: {
    height: 260,
  },
});