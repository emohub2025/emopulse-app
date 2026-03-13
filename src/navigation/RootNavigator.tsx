import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, View } from 'react-native';
import { RootStackParamList } from './types';
import HomePageScreen from '../features/users/HomePageScreen';
import LoginScreen from '../features/users/LoginScreen';
import SignupScreen from '../features/users/SignupScreen';
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
        name="CategoryList" 
        component={CategoryListScreen} 
        options={{ 
          headerTitle: () => <LogoHeader back={true} />,
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