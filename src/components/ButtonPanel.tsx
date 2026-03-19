import { View, StyleSheet, Pressable, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

import accountIcon from '../assets/buttons/panel-account.png';
import teamsIcon from '../assets/buttons/panel-teams.png';
import historyIcon from '../assets/buttons/panel-history.png';

export default function ButtonPanel() {
  // Access navigation directly inside the component
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Gradient top line */}
      <LinearGradient
        colors={['#A020F0', '#D8B4FF', '#A020F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topLine}
      />

      {/* Horizontal row of icons */}
      <View style={styles.row}>
        {/* History */}
        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={styles.item}
        >
          <Image source={historyIcon} style={styles.icon} />
          <Text style={styles.label}>History</Text>
        </Pressable>

        {/* Teams */}
        <Pressable
          onPress={() => navigation.navigate('Teams')}
          style={styles.item}
        >
          <Image source={teamsIcon} style={styles.icon} />
          <Text style={styles.label}>Teams</Text>
        </Pressable>

        {/* Account */}
        <Pressable
          onPress={() => navigation.navigate('Account')}
          style={styles.item}
        >
          <Image source={accountIcon} style={styles.icon} />
          <Text style={styles.label}>Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    paddingHorizontal: 16,
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

  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  item: {
    alignItems: 'center',
  },

  icon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },

  label: {
    marginTop: 0,
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});