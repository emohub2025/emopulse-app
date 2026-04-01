// src/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";

import LoginScreen from "../features/users/LoginScreen";
import SignupScreen from "../features/users/SignupScreen";
import CategoryListScreen from "../features/challenge/CategoryListScreen";
import HomePage from "../features/users/HomePageScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  initialRouteName: keyof RootStackParamList;
};

export default function AppNavigator({ initialRouteName }: Props) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />

      {/* Optional: if you still use HomePage */}
      <Stack.Screen name="HomePage" component={HomePage} />
    </Stack.Navigator>
  );
}