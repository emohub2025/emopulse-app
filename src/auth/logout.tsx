// src/auth/logout.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

export async function logout(navigation: any) {
  try {
    // Clear all tokens + user data
    await AsyncStorage.multiRemove([
      "authToken",
      "refreshToken",
      "userId",
      "walletId",
    ]);
  } catch (err) {
    console.log("⚠️ Error clearing storage during logout:", err);
  }

  // Reset navigation stack to Login
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: "Login" }],
    })
  );
}