import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ImageBackground,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserStore } from "../../state/useUserStore";
import { postUserInfo } from "../../api/getUserInfo";
import StateSelector, { autoDetectStateFromZip } from "../../components/StateSelector";
import type { MobileUser, RootStackParamList } from "../../navigation/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import saveButton from "../../assets/buttons/save.png";

const MIN_BIRTHDATE = new Date(1900, 0, 1);
const MAX_BIRTHDATE = new Date();

function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

type MobileUserUpdate = {
  first_name?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  birthdate?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  avatar_url?: string;
};

type ProfileRouteParams = {
  user: MobileUser;
};

type NavProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

export default function ProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation<NavProp>();
  const { user: initialUser } = route.params as ProfileRouteParams;
  const setStoredUser = useUserStore((state) => state.setUser);

  const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);
  const [user, setUser] = useState<MobileUser>(initialUser);
  const [update, setUpdate] = useState<MobileUserUpdate>({
    first_name: initialUser.first_name,
    phone: initialUser.phone,
    city: initialUser.city,
    state: initialUser.state,
    zip: initialUser.zip,
    birthdate: initialUser.birthdate,
    facebook_url: initialUser.facebook_url,
    instagram_url: initialUser.instagram_url,
    tiktok_url: initialUser.tiktok_url,
    avatar_url: (initialUser as any).avatar_url,
  });

  const pickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        alert("Permission is required to choose an avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedImage = result.assets[0].uri;

        setUpdate((prev) => ({
          ...prev,
          avatar_url: selectedImage,
        }));
      }
    } catch (error) {
      console.error("❌ Failed to pick avatar:", error);
      alert("Unable to select avatar.");
    }
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        id: user.id,
        first_name: update.first_name,
        phone: update.phone,
        city: update.city,
        state: update.state,
        zip: update.zip,
        birthdate: update.birthdate,
        facebook_url: update.facebook_url,
        instagram_url: update.instagram_url,
        tiktok_url: update.tiktok_url,
      };

      // Only send avatar_url if it is already a hosted URL.
      // Do not send file:// or content:// local device URIs to the backend.
      if (
        update.avatar_url &&
        (update.avatar_url.startsWith("http://") ||
          update.avatar_url.startsWith("https://"))
      ) {
        payload.avatar_url = update.avatar_url;
      }

      console.log("🚀 profile payload", payload);
      console.log("🖼 avatar_url", update.avatar_url);

      const updatedUser = await postUserInfo(payload);

      const mergedUser = {
        ...updatedUser,
        avatar_url:
          update.avatar_url ||
          (updatedUser as any).avatar_url ||
          (user as any).avatar_url,
      };

      setUser(mergedUser as MobileUser);
      setStoredUser(mergedUser as MobileUser);

      alert("Profile updated!");
      navigation.goBack();
    } catch (err) {
      console.error("❌ Failed to update user:", err);
      alert("Failed to save changes.");
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.dimOverlay} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.topLabel}>Profile Details</Text>

          <View style={styles.heroCard}>
            <Pressable
              style={({ pressed }) => [
                styles.avatarWrapper,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
              onPress={pickAvatar}
            >
              {update.avatar_url ? (
                <Image source={{ uri: update.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {update.first_name?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}

              <View style={styles.avatarBadge}>
                <Text style={styles.avatarBadgeText}>Change</Text>
              </View>
            </Pressable>

            <Text style={styles.heroTitle}>
              {update.first_name?.trim() || "Your Profile"}
            </Text>
            <Text style={styles.heroSubtitle}>
              Personalize your profile, update your details, and keep your EmoPulse
              presence looking sharp.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.rowField}>
              <Text style={styles.rowLabel}>Avatar Name</Text>
              <TextInput
                style={styles.rowInput}
                value={update.first_name}
                placeholder="Enter name"
                placeholderTextColor="rgba(255,255,255,0.35)"
                onChangeText={(text) =>
                  setUpdate((prev) => ({ ...prev, first_name: text }))
                }
              />
            </View>

            <View style={styles.rowField}>
              <Text style={styles.rowLabel}>Mobile</Text>
              <TextInput
                style={styles.rowInput}
                keyboardType="phone-pad"
                placeholder="(123) 456-7890"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={formatPhone(update.phone ?? "")}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, "").slice(0, 10);
                  setUpdate((prev) => ({ ...prev, phone: digits }));
                }}
              />
            </View>

            <View style={styles.rowField}>
              <Text style={styles.rowLabel}>City</Text>
              <TextInput
                style={styles.rowInput}
                value={update.city}
                placeholder="Enter city"
                placeholderTextColor="rgba(255,255,255,0.35)"
                onChangeText={(text) =>
                  setUpdate((prev) => ({ ...prev, city: text }))
                }
              />
            </View>

            <View style={styles.locationRow}>
              <View style={styles.locationLeft}>
                <Text style={styles.rowLabel}>State</Text>
                <View style={styles.selectorWrap}>
                  <StateSelector
                    value={update.state ?? null}
                    onChange={(state) =>
                      setUpdate((prev) => ({ ...prev, state }))
                    }
                  />
                </View>
              </View>

              <View style={styles.locationRight}>
                <Text style={styles.rowLabel}>ZIP</Text>
                <TextInput
                  style={styles.zipInput}
                  keyboardType="number-pad"
                  value={update.zip}
                  placeholder="ZIP"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  onChangeText={(zip) => {
                    const digits = zip.replace(/\D/g, "").slice(0, 5);
                    const detected = autoDetectStateFromZip(digits);
                    setUpdate((prev) => ({
                      ...prev,
                      zip: digits,
                      state: detected ?? prev.state,
                    }));
                  }}
                />
              </View>
            </View>

            <View style={styles.rowField}>
              <Text style={styles.rowLabel}>Birth Date</Text>

              <Pressable
                style={styles.rowInput}
                onPress={() => setShowBirthdatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {update.birthdate
                    ? new Date(update.birthdate).toLocaleDateString()
                    : "Select birth date"}
                </Text>
              </Pressable>

              {showBirthdatePicker && (
                <DateTimePicker
                  value={update.birthdate ? new Date(update.birthdate) : new Date()}
                  mode="date"
                  display="calendar"
                  minimumDate={MIN_BIRTHDATE}
                  maximumDate={MAX_BIRTHDATE}
                  onChange={(event, selectedDate) => {
                    setShowBirthdatePicker(false);
                    if (selectedDate) {
                      setUpdate((prev) => ({
                        ...prev,
                        birthdate: selectedDate.toISOString(),
                      }));
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.rowField}>
              <Text style={styles.rowLabel}>Facebook</Text>
              <TextInput
                style={styles.rowInput}
                value={update.facebook_url}
                placeholder="Paste profile link"
                placeholderTextColor="rgba(255,255,255,0.35)"
                onChangeText={(text) =>
                  setUpdate((prev) => ({ ...prev, facebook_url: text }))
                }
              />
            </View>

            <View style={styles.rowField}>
              <Text style={styles.rowLabel}>Instagram</Text>
              <TextInput
                style={styles.rowInput}
                value={update.instagram_url}
                placeholder="Paste profile link"
                placeholderTextColor="rgba(255,255,255,0.35)"
                onChangeText={(text) =>
                  setUpdate((prev) => ({ ...prev, instagram_url: text }))
                }
              />
            </View>

            <View style={styles.rowField}>
              <Text style={styles.rowLabel}>TikTok</Text>
              <TextInput
                style={styles.rowInput}
                value={update.tiktok_url}
                placeholder="Paste profile link"
                placeholderTextColor="rgba(255,255,255,0.35)"
                onChangeText={(text) =>
                  setUpdate((prev) => ({ ...prev, tiktok_url: text }))
                }
              />
            </View>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButtonImageWrapper,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Image
                source={saveButton}
                style={styles.saveButtonImage}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 88,
    paddingBottom: 72,
    paddingHorizontal: 18,
  },
  topLabel: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
    backgroundColor: "transparent",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.45,
  },
  heroCard: {
    backgroundColor: "rgba(18,18,32,0.84)",
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 122,
    height: 122,
    borderRadius: 61,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 3,
    borderColor: "rgba(255,215,106,0.8)",
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 61,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 61,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139,92,246,0.22)",
  },
  avatarPlaceholderText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    width: "100%",
    paddingVertical: 8,
    alignItems: "center",
  },
  avatarBadgeText: {
    color: "#FFD76A",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: "rgba(14,14,26,0.84)",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rowField: {
    marginBottom: 16,
  },
  rowLabel: {
    color: "#FFD76A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  rowInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
  dateText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  locationLeft: {
    flex: 1.1,
  },
  locationRight: {
    flex: 0.8,
  },
  selectorWrap: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
  },
  zipInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
  saveButtonImageWrapper: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  saveButtonImage: {
    width: 290,
    height: 52,
  },
});