import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, View } from "react-native";
import { RootStackParamList } from "./types";

import HomePageScreen from "../features/users/HomePageScreen";
import LoginScreen from "../features/users/LoginScreen";
import ForgotPasswordScreen from "../features/users/ForgotPasswordScreen";
import SignupScreen from "../features/users/SignupScreen";
import AccountScreen from "../features/users/AccountScreen";
import HelpAndSupportScreen from "../features/users/HelpAndSupportScreen";
import FeedbackScreen from "../features/users/FeedbackScreen";
import SettingsScreen from "../features/users/SettingsScreen";
import ProfileScreen from "../features/users/ProfileScreen";
import ResultsHistoryScreen from "../features/users/ResultsHistoryScreen";
import TransactionsScreen from "../features/users/TransactionsScreen";
import AchievementsScreen from "../features/users/AchievementsScreen";
import PrizesAndRewardsScreen from "../features/users/PrizesAndRewardsScreen";
import LeaderboardScreen from "../features/users/LeaderboardScreen";

import CategoryListScreen from "../features/challenge/CategoryListScreen";
import CategoryChallengesScreen from "../features/challenge/CategoryChallengesScreen";
import ChallengeDetailScreen from "../features/challenge/ChallengeDetailScreen";
import ChallengeScreen from "../features/challenge/ChallengeScreen";
import ChallengeCountdownScreen from "../features/challenge/ChallengeCountdownScreen";
import ChallengeResultsScreen from "../features/challenge/ChallengeResultsScreen";

import TeamsScreen from "../features/teams/TeamsScreen";
import SubchallengeScreen from "../features/subchallenge/SubchallengeScreen";
import PollingChallengeScreen from "../features/subchallenge/PollingChallengeScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
import { Platform } from "react-native";

const isIOS = Platform.OS === "ios";

const logoIOS = require("../assets/logos/logo.png");
const logoAndroid = require("../assets/logos/logo-back.png");

const LogoHeader = () => (
  <View
    style={{
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      height: 52,
    }}
  >
    <Image
      source={isIOS ? logoIOS : logoAndroid}
      style={{ width: isIOS ? "100%" : "110%", height: isIOS ? 52 : 60, marginTop:  isIOS ? 0 : -10, resizeMode: isIOS ? "stretch" : "cover" }}
    />
  </View>
);

export default function RootNavigator({
  initialRouteName = "HomePage",
}: {
  initialRouteName?: keyof RootStackParamList;
}) {

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerTransparent: false,
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#000",
        },
        headerBackground: () => <View style={{ flex: 1, backgroundColor: "#000" }} />,
        contentStyle: {
          backgroundColor: "#000",
        },
        headerTintColor: "white",
        headerBackVisible: false,
        headerLeft: () => null,
      }}
    >
      <Stack.Screen
        name="HomePage"
        component={HomePageScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="HelpAndSupport"
        component={HelpAndSupportScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="PrizesAndRewards"
        component={PrizesAndRewardsScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="ResultsHistory"
        component={ResultsHistoryScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Teams"
        component={TeamsScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="CategoryList"
        component={CategoryListScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="CategoryChallenges"
        component={CategoryChallengesScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="ChallengeDetail"
        component={ChallengeDetailScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="ChallengeCountdown"
        component={ChallengeCountdownScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="ChallengeResults"
        component={ChallengeResultsScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="Subchallenge"
        component={SubchallengeScreen}
        options={{
          headerBackVisible: false,
          headerLeft: () => null,
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="PollingChallenge"
        component={PollingChallengeScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />
    </Stack.Navigator>
  );
}
