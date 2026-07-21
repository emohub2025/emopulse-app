import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image, Platform, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "./types";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";

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
import PollingChallengeScreen from "../features/Polling/PollingChallengeScreen";
import PollingListScreen from "../features/Polling/PollingListScreen";

const isIOS = Platform.OS === "ios";
const HEADER_HEIGHT = 78;

const Stack = createNativeStackNavigator<RootStackParamList>();

const LogoHeader = () => {
  const insets = useSafeAreaInsets();
  const { scale, isVeryCompact } = useResponsiveLayout();
  const topInset = isIOS ? insets.top : 0;
  const headerHeight = scale(isVeryCompact ? 68 : HEADER_HEIGHT, 64, 78);

  return (
    <View
      style={{
        width: "100%",
        height: topInset + headerHeight,
        paddingTop: topInset,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      <Image
        source={require("../assets/logos/logo.png")}
        style={{
          width: isIOS ? "100%" : "108%",
          height: headerHeight,
          marginTop: 0,
          resizeMode: isIOS ? "stretch" : "cover",
        }}
      />
    </View>
  );
};

const withAppHeader = (Screen: React.ComponentType<any>) => {
  return function ScreenWithAppHeader(props: any) {
    const navigation = props.navigation;
    const insets = useSafeAreaInsets();
    const routeName = props.route.name;
    const localBackHandler = props.route.params?.localBackHandler;

    const hideBack =
      Platform.OS === "android" &&
      navigation.canGoBack() &&
      (
        (routeName === "Subchallenge" && props.route.params?.showBack === false) ||
        routeName === "HomePage" || routeName === "ChallengeCountdown" || routeName === "CategoryList" || routeName === "PollingList"
      );

    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <LogoHeader />

        {/* ⭐ Software Back Button for iOS */}
        {Platform.OS === "ios" && navigation.canGoBack() && !hideBack && (
          <TouchableOpacity
            onPress={() => {
              if (localBackHandler) {
                localBackHandler();
              } else {
                navigation.goBack();
              }
            }}
            style={{
              position: "absolute",
              top: insets.top + 12,
              left: 12 - 20,
              padding: 10,
              zIndex: 999,
            }}
          >
            <Image
              source={require("../assets/logos/back.png")}
              style={{ width: 44, height: 44 }}
            />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <Screen {...props} />
        </View>
      </View>
    );
  };
};

const HomePageWithHeader = withAppHeader(HomePageScreen);
const LoginWithHeader = withAppHeader(LoginScreen);
const ForgotPasswordWithHeader = withAppHeader(ForgotPasswordScreen);
const SignupWithHeader = withAppHeader(SignupScreen);
const AccountWithHeader = withAppHeader(AccountScreen);
const HelpAndSupportWithHeader = withAppHeader(HelpAndSupportScreen);
const SettingsWithHeader = withAppHeader(SettingsScreen);
const FeedbackWithHeader = withAppHeader(FeedbackScreen);
const ProfileWithHeader = withAppHeader(ProfileScreen);
const AchievementsWithHeader = withAppHeader(AchievementsScreen);
const PrizesAndRewardsWithHeader = withAppHeader(PrizesAndRewardsScreen);
const ResultsHistoryWithHeader = withAppHeader(ResultsHistoryScreen);
const TransactionsWithHeader = withAppHeader(TransactionsScreen);
const TeamsWithHeader = withAppHeader(TeamsScreen);
const LeaderboardWithHeader = withAppHeader(LeaderboardScreen);
const CategoryListWithHeader = withAppHeader(CategoryListScreen);
const CategoryChallengesWithHeader = withAppHeader(CategoryChallengesScreen);
const ChallengeDetailWithHeader = withAppHeader(ChallengeDetailScreen);
const ChallengeWithHeader = withAppHeader(ChallengeScreen);
const ChallengeCountdownWithHeader = withAppHeader(ChallengeCountdownScreen);
const ChallengeResultsWithHeader = withAppHeader(ChallengeResultsScreen);
const SubchallengeWithHeader = withAppHeader(SubchallengeScreen);
const PollingChallengeWithHeader = withAppHeader(PollingChallengeScreen);
const PollingListWithHeader = withAppHeader(PollingListScreen);

export default function RootNavigator({
  initialRouteName = "HomePage",
}: {
  initialRouteName?: keyof RootStackParamList;
}) {

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#000",
        },
      }}
    >
      <Stack.Screen
        name="HomePage"
        component={HomePageWithHeader}
      />

      <Stack.Screen
        name="Login"
        component={LoginWithHeader}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordWithHeader}
      />

      <Stack.Screen
        name="Signup"
        component={SignupWithHeader}
      />

      <Stack.Screen
        name="Account"
        component={AccountWithHeader}
      />

      <Stack.Screen
        name="HelpAndSupport"
        component={HelpAndSupportWithHeader}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsWithHeader}
      />

      <Stack.Screen
        name="Feedback"
        component={FeedbackWithHeader}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileWithHeader}
      />

      <Stack.Screen
        name="Achievements"
        component={AchievementsWithHeader}
      />

      <Stack.Screen
        name="PrizesAndRewards"
        component={PrizesAndRewardsWithHeader}
      />

      <Stack.Screen
        name="ResultsHistory"
        component={ResultsHistoryWithHeader}
      />

      <Stack.Screen
        name="Transactions"
        component={TransactionsWithHeader}
      />

      <Stack.Screen
        name="Teams"
        component={TeamsWithHeader}
      />

      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardWithHeader}
      />

      <Stack.Screen
        name="CategoryList"
        component={CategoryListWithHeader}
      />

      <Stack.Screen
        name="CategoryChallenges"
        component={CategoryChallengesWithHeader}
      />

      <Stack.Screen
        name="ChallengeDetail"
        component={ChallengeDetailWithHeader}
      />

      <Stack.Screen
        name="Challenge"
        component={ChallengeWithHeader}
      />

      <Stack.Screen
        name="ChallengeCountdown"
        component={ChallengeCountdownWithHeader}
      />

      <Stack.Screen
        name="ChallengeResults"
        component={ChallengeResultsWithHeader}
      />

      <Stack.Screen
        name="Subchallenge"
        component={SubchallengeWithHeader}
      />

      <Stack.Screen
        name="PollingList"
        component={PollingListWithHeader}
      />

      <Stack.Screen
        name="PollingChallenge"
        component={PollingChallengeWithHeader}
      />
    </Stack.Navigator>
  );
}
