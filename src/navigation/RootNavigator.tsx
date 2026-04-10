import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as NavigationBar from "expo-navigation-bar";
import { Image, View } from "react-native";
import { RootStackParamList } from "./types";

import HomePageScreen from "../features/users/HomePageScreen";
import LoginScreen from "../features/users/LoginScreen";
import SignupScreen from "../features/users/SignupScreen";
import AccountScreen from "../features/users/AccountScreen";
import HelpAndSupportScreen from "../features/users/HelpAndSupportScreen";
import FeedbackScreen from "../features/users/FeedbackScreen";
import SettingsScreen from "../features/users/SettingsScreen";
import ProfileScreen from "../features/users/ProfileScreen";
import ResultsHistoryScreen from "../features/users/ResultsHistoryScreen";
import TransactionsScreen from "../features/users/TransactionsScreen";
import AchievementsScreen from "../features/users/AchievementsScreen";
import PrizesRewardsScreen from "../features/users/PrizesRewardsScreen";
import TeamsScreen from "../features/teams/TeamsScreen";
import CategoryListScreen from "../features/challenge/CategoryListScreen";
import CategoryChallengesScreen from "../features/challenge/CategoryChallengesScreen";
import ChallengeDetailScreen from "../features/challenge/ChallengeDetailScreen";
import ChallengeScreen from "../features/challenge/ChallengeScreen";
import ChallengeCountdownScreen from "../features/challenge/ChallengeCountdownScreen";
import ChallengeResultsScreen from "../features/challenge/ChallengeResultsScreen";
import SubchallengeScreen from "../features/subchallenge/SubchallengeScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const LogoHeader = () => (
  <View
    style={{
      width: "100%",
      height: 90,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#121212",
      paddingHorizontal: 8,
    }}
  >
    <Image
      source={require("../assets/logos/logo.png")}
      style={{
        width: "100%",
        height: 72,
        resizeMode: "contain",
      }}
    />
  </View>
);

export default function RootNavigator({
  initialRouteName = "HomePage",
}: {
  initialRouteName?: keyof RootStackParamList;
}) {
  useEffect(() => {
    NavigationBar.setVisibilityAsync("visible");
    NavigationBar.setButtonStyleAsync("light");
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerTransparent: false,
        headerTitleAlign: "center",
        headerTintColor: "white",
        headerBackVisible: false,
        headerLeft: () => null,
        headerStyle: {
          backgroundColor: "#121212",
          height: 100,
        },
        headerShadowVisible: false,
        headerTitleContainerStyle: {
          left: 0,
          right: 0,
          width: "100%",
          paddingHorizontal: 0,
        },
      }}
    >
      <Stack.Screen
        name="HomePage"
        component={HomePageScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="HelpAndSupport"
        component={HelpAndSupportScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="PrizesRewards"
        component={PrizesRewardsScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="ResultsHistory"
        component={ResultsHistoryScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Teams"
        component={TeamsScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="CategoryList"
        component={CategoryListScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="CategoryChallenges"
        component={CategoryChallengesScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="ChallengeDetail"
        component={ChallengeDetailScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="ChallengeCountdown"
        component={ChallengeCountdownScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="ChallengeResults"
        component={ChallengeResultsScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
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
    </Stack.Navigator>
  );
}