import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { requestPasswordReset } from "../../api/passwordReset";

const SUCCESS_MESSAGE =
  "If an account exists, password reset instructions have been sent.";

type NavProp = NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavProp>();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    if (loading) return;

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      setError("Please enter your email or avatar name.");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await requestPasswordReset(cleanIdentifier);
      setSuccess(SUCCESS_MESSAGE);
    } catch (err: any) {
      setSuccess("");
      setError(err?.message || "Unable to send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>Account help</Text>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Enter your email or avatar name and we will send reset instructions
              if an account exists.
            </Text>
          </View>

          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Email / Avatar Name"
              placeholderTextColor="#8A88B5"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {error !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success !== "" && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.primaryButton, loading && styles.disabledButton]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Send Reset Instructions</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={styles.backAction}
            >
              <Text style={styles.backActionText}>Back to Login</Text>
            </Pressable>
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
    backgroundColor: "black",
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 8, 20, 0.42)",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  headerBlock: {
    width: "100%",
    marginTop: 42,
    marginBottom: 26,
    alignItems: "center",
  },
  eyebrow: {
    color: "#A78BFA",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  formCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "rgba(13, 18, 44, 0.82)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.22)",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 22,
  },
  input: {
    width: "100%",
    height: 58,
    backgroundColor: "#11173A",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#4A4779",
    paddingHorizontal: 16,
    color: "white",
    fontSize: 17,
    marginBottom: 16,
  },
  errorBox: {
    width: "100%",
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.35)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  errorText: {
    color: "#FF8B8B",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  successBox: {
    width: "100%",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  successText: {
    color: "#86EFAC",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#7B61FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.55,
  },
  backAction: {
    alignItems: "center",
    marginTop: 18,
  },
  backActionText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 15,
    fontWeight: "700",
  },
  bottomSpacer: {
    flex: 1,
  },
});
