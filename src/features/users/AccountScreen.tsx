import { useUserStore } from "../../state/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { getUserInfo } from '../../api/getUserInfo';
import type { RootStackParamList, MobileUser } from '../../navigation/types';
import { logout } from "../../auth/logout";
import OptionRow from '../../components/OptionRow';
import profileIcon from '../../assets/buttons/panel-account.png';
import coinIcon from '../../assets/images/coin.png';
import { AVATAR_URL } from '../../../config';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Account'>;

export default function AccountScreen() {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [showLogoutHint, setShowLogoutHint] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation<NavProp>();
  const storedUser = useUserStore((state) => state.user);
  const setStoredUser = useUserStore((state) => state.setUser);
  const loadUser = React.useCallback(async () => {

    try {
      const userId = await AsyncStorage.getItem("userId");
      const refresh = await AsyncStorage.getItem("refreshToken");

      if (!refresh) {
        logout(navigation);
        return;
      }

      if (!userId) {
        console.log("⚠️ No userId found in storage");
        setLoading(false);
        return;
      }

      const userData = await getUserInfo(userId);
      setUser(userData);
      setStoredUser(userData);
    } catch (err) {
      console.log("❌ Error loading user:", err);
      setError("Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [navigation, setStoredUser]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (storedUser) {
      setUser(storedUser);
    }
  }, [storedUser]);

  useEffect(() => {
    if (!loading && !user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [loading, user, navigation]);

  const handleLogoutPress = () => {
    const now = Date.now();

    if (lastTap && now - lastTap < 2000) {
      logout(navigation);
      return;
    }

    setLastTap(now);
    setShowLogoutHint(true);

    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      delay: 3000,
      useNativeDriver: true,
    }).start(() => setShowLogoutHint(false));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const asset = result.assets?.[0];
    if (asset) {
      uploadAvatar(asset);
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user) return;

    const formData = new FormData();

    const filePayload = {
      uri: asset.uri,
      type: asset.mimeType || "image/jpeg",
      name: user.email + ".jpg",
    };

    formData.append("image", filePayload as any);
    formData.append("name", user.email);
    formData.append("type", "user");

    try {
      const res = await fetch(`${AVATAR_URL}/uploadAvatar`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        console.log("❌ Avatar upload error:", data.error);
        return;
      }

      const freshUrl = data.url + `?t=${Date.now()}`;

      setUser((prev) =>
        prev ? { ...prev, avatar_url: freshUrl } : prev
      );

      setStoredUser({
        ...user,
        avatar_url: freshUrl,
      });
    } catch (err: any) {
      console.log("🔥 Upload failed:", err.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <Text style={styles.topLabel}>My Account</Text>

      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <View style={styles.profileRow}>
          <Pressable onPress={pickAvatar}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.emptyAvatar]}>
                <Text style={styles.emptyAvatarText}>Press to upload avatar</Text>
              </View>
            )}
          </Pressable>

          <Pressable style={styles.rightColumn} onPress={handleLogoutPress}>
            <Text style={styles.userName}>{user?.first_name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            {showLogoutHint && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <Text style={styles.logoutHint}>Tap again to log out</Text>
              </Animated.View>
            )}
          </Pressable>
        </View>

        <View style={{ marginTop: 22 }}>
          <View style={{ marginBottom: 20, marginLeft: 12, marginRight: 12 }}>
            <OptionRow
              icon={coinIcon}
              label="   Coin Balance"
              subLabel={`   ${user?.coin_balance} Emo Coins`}
              height={70}
              borderTopWidth={2}
              borderBottomWidth={4}
              iconWidth={70}
              iconHeight={70}
              topGradient={['#8A2BE2', '#DDA0DD', '#8A2BE2']}
              bottomGradient={['#8A2BE2', '#DDA0DD', '#8A2BE2']}
              leftGradient={['#8A2BE2', '#DDA0DD', '#8A2BE2']}
              rightGradient={['#DDA0DD', '#8A2BE2', '#DDA0DD']}
              borderLeftWidth={2}
              borderRightWidth={2}
              borderRadius={7}
              sideMargin={30}
            />
          </View>

          <OptionRow
            icon={profileIcon}
            label="Profile Details"
            onPress={() => {
              if (!user) return;
              navigation.navigate('Profile', {
                user,
                onUserUpdated: (updatedUser) => {
                  setUser(updatedUser);   // instantly update AccountScreen
                },
              });
            }}
          />

          <OptionRow
            icon={profileIcon}
            label="Challenge Results"
            onPress={() => {
              if (!user) return;
              navigation.navigate("ResultsHistory");
            }}
          />

          <OptionRow
            icon={profileIcon}
            label="Transaction History"
            onPress={() => {
              if (!user) return;
              navigation.navigate("Transactions");
            }}
          />

          <OptionRow
            icon={profileIcon}
            label="Achievements"
            onPress={() => {
              if (!user) return;
              navigation.navigate("Achievements");
            }}
          />

          <OptionRow
            icon={profileIcon}
            label="Help & Support"
            onPress={() => {
              navigation.navigate("HelpAndSupport");
            }}
          />

          <OptionRow
            icon={profileIcon}
            label="Feedback"
            onPress={() => {
              navigation.navigate("Feedback");
            }}
          />

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  topLabel: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 95,
    textAlign: 'center',
    backgroundColor: 'black',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 15,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
    marginRight: 20,
  },
  emptyAvatar: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAvatarText: {
    color: 'white',
    fontSize: 17,
    marginLeft: 10,
    marginRight: 10,
    textAlign: 'center',
  },
  userName: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  userEmail: {
    color: '#cccccc',
    fontSize: 16,
    marginTop: 4,
  },
  logoutHint: {
    color: '#ffdddd',
    fontSize: 14,
    marginTop: 6,
  },
});