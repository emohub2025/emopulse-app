import { View, StyleSheet, Pressable, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

import homeIcon from '../assets/buttons/panel-home.png';
import accountIcon from '../assets/buttons/panel-account.png';
import teamsIcon from '../assets/buttons/panel-teams.png';
import historyIcon from '../assets/buttons/panel-history.png';
import leaderboardIcon from '../assets/buttons/panel-leaderboard.png';

type ButtonPanelProps = {
  currentScreen: string;
};

export default function ButtonPanel({ currentScreen }: ButtonPanelProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { scale, font, isCompact, isVeryCompact } = useResponsiveLayout();
  const panelHeight = scale(isVeryCompact ? 54 : 60, 52, 66);
  const iconSize = scale(isVeryCompact ? 25 : 30, 24, 32);
  const labelSize = font(isCompact ? 10 : 11, 9, 11);
  const bottomOffset = Math.max(insets.bottom, scale(10, 8, 18));

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          height: panelHeight,
          paddingHorizontal: scale(12, 10, 16),
        },
      ]}
    >
      <LinearGradient
        colors={['#A020F0', '#D8B4FF', '#A020F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topLine}
      />

      <View style={styles.row}>
        {/* Category List / Home */}
        {route.name !== 'CategoryList' && (
          <Pressable
            onPress={() => navigation.navigate('CategoryList')}
            style={styles.item}
          >
            <Image source={homeIcon} style={[styles.icon, { width: iconSize, height: iconSize }]} />
            <Text style={[styles.label, { fontSize: labelSize }]} numberOfLines={1} adjustsFontSizeToFit>Home</Text>
          </Pressable>
        )}

        {/* History */}
        {route.name !== 'ResultsHistory' && (
          <Pressable
            onPress={() => navigation.navigate('ResultsHistory')}
            style={styles.item}
          >
            <Image source={historyIcon} style={[styles.icon, { width: iconSize, height: iconSize }]} />
            <Text style={[styles.label, { fontSize: labelSize }]} numberOfLines={1} adjustsFontSizeToFit>History</Text>
          </Pressable>
        )}

        {/* Teams */}
        {route.name !== 'Teams' && (
          <Pressable
            onPress={() => navigation.navigate('Teams')}
            style={styles.item}
          >
            <Image source={teamsIcon} style={[styles.icon, { width: iconSize, height: iconSize }]} />
            <Text style={[styles.label, { fontSize: labelSize }]} numberOfLines={1} adjustsFontSizeToFit>Teams</Text>
          </Pressable>
        )}

        {/* Leaderboard */}
        {route.name !== 'Leaderboard' && (
          <Pressable
            onPress={() => navigation.navigate('Leaderboard')}
            style={styles.item}
          >
            <Image source={leaderboardIcon} style={[styles.icon, { width: iconSize, height: iconSize }]} />
            <Text style={[styles.label, { fontSize: labelSize }]} numberOfLines={1} adjustsFontSizeToFit>Leaderboard</Text>
          </Pressable>
        )}

        {/* Account */}
        {route.name !== 'Account' && (
          <Pressable
            onPress={() => navigation.navigate('Account')}
            style={styles.item}
          >
            <Image source={accountIcon} style={[styles.icon, { width: iconSize, height: iconSize }]} />
            <Text style={[styles.label, { fontSize: labelSize }]} numberOfLines={1} adjustsFontSizeToFit>Account</Text>
          </Pressable>
        )}
      </View>

      <LinearGradient
        colors={['#A020F0', '#D8B4FF', '#A020F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    zIndex: 100,
    justifyContent: 'center',
  },

  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 2,
  },

  bottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    borderRadius: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  item: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  icon: {
    resizeMode: 'contain',
  },

  label: {
    marginTop: 0,
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
});
