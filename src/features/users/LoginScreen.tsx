import React from 'react';
import { View, Text, TextInput, ImageBackground, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import loginButton from '../../assets/buttons/login.png';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import eyeOpen from '../../assets/buttons/eye-open.png';
import eyeClosed from '../../assets/buttons/eye-close.png';
import { apiPost } from "../../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const [showPassword, setShowPassword] = React.useState(false);
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleLogin() {
    console.log("🔐 Login attempt started");
    console.log("Identifier:", identifier);

    try {
        setLoading(true);
        setError("");

        const response = await apiPost("/login", {
        identifier,
        password,
        });

        console.log("✅ Login successful:", response);

        await AsyncStorage.setItem("authToken", response.token);
        await AsyncStorage.setItem("userId", String(response.userId));
        await AsyncStorage.setItem("walletId", String(response.walletId));

        console.log("💾 Token + user info saved to AsyncStorage");

        navigation.replace("CategoryList");
        console.log("➡️ Navigated to CategoryList");

    } catch (err: any) {
        console.log("❌ Login error:", err);
        setError(err.message || "Login failed");
    } finally {
        setLoading(false);
        console.log("⏹ Login attempt finished");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>

      {/* Top spacing or title area */}
      <SafeAreaView style={styles.topArea}>

        <Text style={styles.title}>Log In to Your Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Username / Email"
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

        <Pressable onPress={() => navigation.navigate("CategoryList")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </Pressable>

        {/* Login Button */}
        <Pressable onPress={handleLogin} style={styles.buttonWrapper}>
          <Image source={loginButton} style={styles.buttonImage} />
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.bottomLabel}>Don't have an account? </Text>

          <Pressable onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.loginLink}>Sign Up</Text>
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
  eyeIcon: {
    width: 70,
    height: 70,
    marginTop: 4,
    marginRight: -15,
    resizeMode: 'contain',
  },
  forgotPassword: {
    color: '#A78BFA',      // your neon purple
    fontSize: 18,
    fontWeight: '500',
    alignSelf: 'flex-end',
    marginBottom: 20,
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
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
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
  showPasswordText: {
    color: '#A78BFA',   // your neon purple
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
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
    height: 260,
  },
});