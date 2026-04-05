import React, { useState } from "react";
import { View, Text, Image, Pressable, ImageBackground, StyleSheet, TextInput } from "react-native";
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
  });

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Text style={styles.topLabel}>Profile Details</Text>

      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <View style={styles.dimOverlay} />

        <View style={{ marginTop: 40 }}>
          <View style={styles.rowField}>
            <Text style={styles.rowLabel}>Avatar Name:</Text>
            <TextInput
              style={styles.rowInput}
              value={update.first_name}
              onChangeText={(text) =>
                setUpdate((prev) => ({ ...prev, first_name: text }))
              }
            />
          </View>

          <View style={styles.rowField}>
            <Text style={styles.rowLabel}>Mobile:</Text>
            <TextInput
              style={styles.rowInput}
              keyboardType="phone-pad"
              value={formatPhone(update.phone ?? "")}
              onChangeText={(text) => {
                const digits = text.replace(/\D/g, "").slice(0, 10);
                setUpdate((prev) => ({ ...prev, phone: digits }));
              }}
            />
          </View>

          <View style={styles.rowField}>
            <Text style={styles.rowLabel}>City:</Text>
            <TextInput
              style={styles.rowInput}
              value={update.city}
              onChangeText={(text) =>
                setUpdate((prev) => ({ ...prev, city: text }))
              }
            />
          </View>

          <View style={styles.rowField}>
            <Text style={styles.rowLabel}>State:</Text>
            <StateSelector
              value={update.state ?? null}
              onChange={(state) =>
                setUpdate((prev) => ({ ...prev, state }))
              }
            />

            <Text style={[styles.rowLabel, { marginLeft: 22 }]}>ZIP:</Text>
            <TextInput
              style={[styles.rowInput, { width: 90, marginTop: -4, marginLeft: -74 }]}
              keyboardType="number-pad"
              value={update.zip}
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

          <View style={styles.rowField}>
            <Text style={styles.rowLabel}>Birth Date:</Text>

            <Pressable
              style={styles.rowInput}
              onPress={() => setShowBirthdatePicker(true)}
            >
              <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
                {update.birthdate
                  ? new Date(update.birthdate).toLocaleDateString()
                  : "Select"}
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
            <Text style={styles.rowLabel}>Facebook Link:</Text>
            <TextInput
              style={styles.rowInput}
              value={update.facebook_url}
              onChangeText={(text) =>
                setUpdate((prev) => ({ ...prev, facebook_url: text }))
              }
            />
          </View>

          <View style={styles.rowField}>
            <Text style={styles.rowLabel}>Instagram Link:</Text>
            <TextInput
              style={styles.rowInput}
              value={update.instagram_url}
              onChangeText={(text) =>
                setUpdate((prev) => ({ ...prev, instagram_url: text }))
              }
            />
          </View>

          <View style={styles.rowField}>
            <Text style={styles.rowLabel}>Tiktok Link:</Text>
            <TextInput
              style={styles.rowInput}
              value={update.tiktok_url}
              onChangeText={(text) =>
                setUpdate((prev) => ({ ...prev, tiktok_url: text }))
              }
            />
          </View>

          <Pressable
            onPress={async () => {
              try {
                const updatedUser = await postUserInfo({
                  id: user.id,
                  ...update,
                });

                setUser(updatedUser);
                setStoredUser(updatedUser);

                alert("Profile updated!");
                navigation.goBack();
              } catch (err) {
                console.error("❌ Failed to update user:", err);
                alert("Failed to save changes.");
              }
            }}
            style={({ pressed }) => [
              styles.saveButtonImageWrapper,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Image
              source={saveButton}
              style={styles.saveButtonImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  topLabel: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 95,
    textAlign: "center",
    backgroundColor: "black",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.4,
  },
  rowField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  rowLabel: {
    color: "yellow",
    fontSize: 20,
    fontWeight: "600",
    marginRight: 10,
    marginLeft: 5,
    width: 110,
  },
  rowInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "white",
    fontWeight: "500",
    fontSize: 20,
  },
  saveButtonImageWrapper: {
    alignItems: "center",
    marginTop: 5,
  },
  saveButtonImage: {
    width: 280,
    height: 47,
  },
});