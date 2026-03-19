import React from 'react';
import { View, Text, TextInput, ImageBackground, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import signupButton from '../../assets/buttons/signup.png';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, LoginResponse } from '../../navigation/types';
import eyeOpen from '../../assets/buttons/eye-open.png';
import eyeClosed from '../../assets/buttons/eye-close.png';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPost } from "../../api/engineClient";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignupScreen() {
  const navigation = useNavigation<NavProp>();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);
  const [checked, setChecked] = React.useState(true);

  const [loading, setLoading] = React.useState(false);   // ← double-submit protection
  const [error, setError] = React.useState("");

  async function handleSignup() {
    if (loading) return; // ← HARD STOP: prevents double-submit

    setError("");

    // 1️⃣ Basic required fields
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill out all fields");
      return;
    }

    // 2️⃣ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // 3️⃣ Minimum password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // 4️⃣ Confirm password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 5️⃣ Terms checkbox
    if (!checked) {
      setError("You must agree to the Terms of Service");
      return;
    }

    try {
      setLoading(true);

      console.log("📨 Sending signup request:", {
        name,
        email,
        passwordLength: password.length,
      });

      // IMPORTANT: call your SIGNUP endpoint
      const response = await apiPost<LoginResponse>(
        "signup",
        { name, email, password },
        navigation
      );

      console.log("✅ Signup response received:", response);

      // Save auth info
      await AsyncStorage.setItem("authToken", response.token);
      await AsyncStorage.setItem("userId", String(response.userId));
      await AsyncStorage.setItem("walletId", String(response.walletId));

      navigation.replace("CategoryList");

    } catch (err: any) {
      console.log("❌ Signup error:", err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <SafeAreaView style={styles.topArea}>
        <Text style={styles.title}>Create Your Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Avatar Name"
          placeholderTextColor="#8A88B5"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8A88B5"
          value={email}
          onChangeText={setEmail}
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

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.inputPw, { flex: 1 }]}
            placeholder="Confirm Password"
            placeholderTextColor="#8A88B5"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Fixed error placeholder (prevents layout jump) */}
        <View style={{ height: 24, marginBottom: 10 }}>
          {error !== "" && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        <Pressable
          onPress={handleSignup}
          disabled={loading}
          style={[styles.buttonWrapper, loading && { opacity: 0.5 }]}
        >
          <View style={styles.buttonContent}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Image source={signupButton} style={styles.buttonImage} />
            )}
          </View>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.bottomLabel}>Already have an account? </Text>

          <Pressable onPress={() => navigation.navigate("HomePage")}>
            <Text style={styles.loginLink}>Log In</Text>
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: "center",
  },
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
    borderWidth: 0,
    backgroundColor: '#4A4779',
  },
  checkIcon: {
    width: 18,
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
    height: 110,
  },
});