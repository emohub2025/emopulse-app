import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as NavigationBar from "expo-navigation-bar";
import { Image, View } from "react-native";
import { RootStackParamList } from "./types";
import HomePageScreen from '../features/users/HomePageScreen';
import LoginScreen from '../features/users/LoginScreen';
import SignupScreen from '../features/users/SignupScreen';
import AccountScreen from '../features/users/AccountScreen';
import HelpAndSupportScreen from '../features/users/HelpAndSupportScreen';
import FeedbackScreen from '../features/users/FeedbackScreen';
import SettingsScreen from '../features/users/SettingsScreen';
import ProfileScreen from '../features/users/ProfileScreen';
import ResultsHistoryScreen from '../features/users/ResultsHistoryScreen';
import LiveChallengesScreen from '../features/challenge/LiveChallengesScreen';
import TransactionsScreen from '../features/users/TransactionsScreen';
import AchievementsScreen from '../features/users/AchievementsScreen';
import PrizesAndRewardsScreen from '../features/users/PrizesAndRewardsScreen';
import TeamsScreen from '../features/teams/TeamsScreen';
import CategoryListScreen from '../features/challenge/CategoryListScreen';
import CategoryChallengesScreen from '../features/challenge/CategoryChallengesScreen';
import ChallengeDetailScreen from '../features/challenge/ChallengeDetailScreen';
import ChallengeScreen from '../features/challenge/ChallengeScreen';
import ChallengeCountdownScreen from '../features/challenge/ChallengeCountdownScreen';
import ChallengeResultsScreen from '../features/challenge/ChallengeResultsScreen';
import SubchallengeScreen from '../features/subchallenge/SubchallengeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LogoHeader = () => (
  <View
    style={{
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Image
      source={require("../assets/logos/logo.png")}
      style={{ width: "110%", height: 60, marginTop: -10, resizeMode: "cover" }}
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
        headerBackground: () => <View style={{ backgroundColor: "#121212" }} />,
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
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="PrizesAndRewards"
        component={PrizesAndRewardsScreen}
        options={{
          headerTitle: () => <LogoHeader />,
        }}
      />

      <Stack.Screen
        name="ResultsHistory"
        component={ResultsHistoryScreen}
        options={{ headerTitle: () => <LogoHeader /> }}
      />

      <Stack.Screen
        name="LiveChallenges"
        component={LiveChallengesScreen}
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
    </Stack.Navigator>
  );
}