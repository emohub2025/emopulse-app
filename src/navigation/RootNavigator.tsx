import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Image, View } from 'react-native';
import { RootStackParamList } from './types';
import HomePageScreen from '../features/users/HomePageScreen';
import LoginScreen from '../features/users/LoginScreen';
import SignupScreen from '../features/users/SignupScreen';
import AccountScreen from '../features/users/AccountScreen';
import HelpAndSupportScreen from '../features/users/HelpAndSupportScreen';
import SettingsScreen from '../features/users/SettingsScreen';
import ProfileScreen from '../features/users/ProfileScreen';
import TransactionsScreen from '../features/users/TransactionsScreen';
import AchievementsScreen from '../features/users/AchievementsScreen';
import TeamsScreen from '../features/teams/TeamsScreen';
import CategoryListScreen from '../features/challenge/CategoryListScreen';
import CategoryChallengesScreen from '../features/challenge/CategoryChallengesScreen';
import ChallengeDetailScreen from '../features/challenge/ChallengeDetailScreen';
import ChallengeScreen from '../features/challenge/ChallengeScreen';
import ChallengeResultsScreen from '../features/challenge/ChallengeResultsScreen';
import SubchallengeScreen from '../features/subchallenge/SubchallengeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ⭐ Logo centered in the header
const LogoHeader = ({ back }: { back?: boolean }) => (
  <View
    style={{
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Image
      source={
        back
          ? require('../assets/logos/logo-back.png')
          : require('../assets/logos/logo.png')
      }
      style={{ width: 500, height: 60, marginTop: -10, resizeMode: 'contain' }}
    />
  </View>
);

export default function RootNavigator() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="HomePage"
      screenOptions={({ navigation }) => ({
        headerTransparent: false,

        // Default header uses normal logo
        headerTitle: () => <LogoHeader back={navigation.canGoBack()} />,
        headerTitleAlign: 'center',

        headerRight: () =>
          navigation.canGoBack() ? <View style={{ width: 40 }} /> : null,

        headerBackground: () => (
          <View style={{ backgroundColor: '#121212' }} />
        ),

        headerTintColor: 'white',
      })}
    >
      <Stack.Screen
        name="HomePage"
        component={HomePageScreen}
        options={{
          headerTitle: () => <LogoHeader back={false} />,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />,
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />,
        }}
      />
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />
        }}
      />
      <Stack.Screen
        name="HelpAndSupport"
        component={HelpAndSupportScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />
        }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />
        }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />
        }}
      />
      <Stack.Screen
        name="Teams"
        component={TeamsScreen}
        options={{
          headerTitle: () => <LogoHeader back={true} />
        }}
      />
      <Stack.Screen 
        name="CategoryList" 
        component={CategoryListScreen} 
        options={{ 
          headerTitle: () => <LogoHeader back={false} />,
        }} 
      />
      <Stack.Screen 
        name="CategoryChallenges" 
        component={CategoryChallengesScreen} 
        options={{ 
          headerTitle: () => <LogoHeader back={true} />,
        }} 
      />
      <Stack.Screen 
        name="ChallengeDetail" 
        component={ChallengeDetailScreen} 
        options={{ 
          headerTitle: () => <LogoHeader back={true} />,
        }} 
      />
      <Stack.Screen 
        name="Challenge" 
        component={ChallengeScreen} 
        options={{ 
          headerTitle: () => <LogoHeader back={true} />,
        }} 
      />
      <Stack.Screen 
        name="ChallengeResults" 
        component={ChallengeResultsScreen} 
        options={{ 
          headerBackVisible: false,
          headerLeft: () => null,
          headerTitle: () => <LogoHeader back={false} />,
        }} 
      />
      <Stack.Screen 
        name="Subchallenge" 
        component={SubchallengeScreen} 
        options={{ 
          headerBackVisible: false,
          headerLeft: () => null,
          headerTitle: () => <LogoHeader back={false} />,
        }} 
      />
    </Stack.Navigator>
  );
}