import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, Image, TextInput, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import React, { useState } from "react";
//import ButtonPanel from '../../components/ButtonPanel';
import StarRating from "react-native-star-rating-widget";
import { useUserStore } from "../../state/useUserStore";   // Zustand store
import { ENGINE_URL } from '../../../config';

// -----------------------------
// Screen Component
// -----------------------------
export default function FeedbackScreen() {
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const user = useUserStore(state => state.user);

  const handleSubmit = async () => {
    try {
        setIsSubmitting(true);

        const token = await AsyncStorage.getItem("authToken"); // or your getToken()
        console.log("TOKEN USED FOR FEEDBACK:", token);

        const response = await fetch(`${ENGINE_URL}/mobile/feedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            userId: user?.id,
            name: user?.first_name,
            feedback,
            suggestions,
            rating,
        }),
        });

        const data = await response.json();

        if (!data.success) {
        throw new Error(data.message || "Failed to submit feedback");
        }

        // Success UI
        setShowSuccess(true);
        setFeedback("");
        setSuggestions("");
        setRating(0);

    } catch (err) {
        console.log("Feedback submit error:", err);
        setError("Something went wrong. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={{ flex: 1, marginBottom: 42 }}
        resizeMode="cover"
      >
        <Text style={styles.topLabel}>Beta Feedback</Text>

        <View
          style={{
            flex: 1,
            alignItems: "flex-start",
            paddingHorizontal: 20,
          }}
          >
          {/* First Name */}
          <View style={styles.rowField}>
            <Text style={styles.rowLabel}>Name:</Text>
            <Text style={styles.rowInput}>{user?.first_name}</Text>
          </View>

          <Text style={[styles.labels, { marginTop: 0 }]}>
            Feedback:
          </Text>

          <TextInput
            style={styles.feedback}
            multiline={true}
            textBreakStrategy="highQuality"
            value={feedback}
            onChangeText={setFeedback}
          />

          <Text style={[styles.labels, { marginTop: 0 }]}>
            Suggestions:
          </Text>

          <TextInput
            style={styles.suggestions}
            multiline={true}
            textBreakStrategy="highQuality"
            value={suggestions}
            onChangeText={setSuggestions}
          />

          {error ? (
            <View style={styles.errorOverlay}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
            ) : showSuccess ? (
            <View style={styles.successOverlay}>
                <Text style={styles.successText}>Got it — thanks for the feedback!</Text>
            </View>
            ) : (
            <View style={{ width: "100%", alignItems: "center", marginTop: 2 }}>
                <StarRating
                rating={rating}
                onChange={setRating}
                starSize={36}
                color="#FFD700"
                emptyColor="#555"
                />

                <View
                style={{
                    flexDirection: "row",
                    marginTop: 8,
                    alignItems: "center",
                    justifyContent: "center",
                }}
                >
                <View style={{ width: 90, alignItems: "flex-end", marginRight: 12 }}>
                    <Text style={{ color: "#FFD700", fontSize: 20, fontWeight: "700" }}>
                    {rating.toFixed(1)} / 5
                    </Text>
                </View>

                <View style={{ width: 120, alignItems: "flex-start" }}>
                    <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>
                    {rating === 0 && "Tap to rate"}
                    {rating > 0 && rating < 1.5 && "Terrible"}
                    {rating >= 1.5 && rating < 2.5 && "Bad"}
                    {rating >= 2.5 && rating < 3.5 && "Okay"}
                    {rating >= 3.5 && rating < 4.5 && "Good"}
                    {rating >= 4.5 && "Excellent"}
                    </Text>
                </View>
                </View>
            </View>
          )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSubmit}
            style={styles.submitWrapper}
          >
          <Image
            source={require('../../assets/buttons/send.png')}
            style={styles.submitButton}
          />
        </TouchableOpacity>

        </View>

      </ImageBackground>

      {/* <View>
        <ButtonPanel currentScreen={route.name} />
      </View> */}
    </View>
  );
}

// -----------------------------
// Styles
// -----------------------------

const styles = StyleSheet.create({
  topLabel: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 95,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  rowField: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 15,
  },
  labels: {
    textAlign: "left",
    color: "white",
    fontWeight: "500",
    fontSize: 20,
    marginLeft: 20,
    marginBottom: 5,
  },
  rowLabel: {
    color: "yellow",
    fontSize: 20,
    fontWeight: "600",
    width: 80,
    marginLeft: 20,
  },
  rowInput: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    fontSize: 20,
  },
  feedback: {
    width: "100%",
    height: 190,
    backgroundColor: "rgba(0,0,0,0.55)",   // translucent dark card
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    color: "white",
    fontWeight: "500",
    fontSize: 20,
    padding: 12,
    marginBottom: 10,

    // ⭐ Top-align text
    textAlignVertical: "top",

    // ⭐ Soft glow
    shadowColor: "#FFD700",
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  suggestions: {
    width: "100%",
    height: 170,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    color: "white",
    fontWeight: "500",
    fontSize: 20,
    padding: 12,
    marginBottom: 10,

    // ⭐ Top-align text
    textAlignVertical: "top",

    // ⭐ Soft glow
    shadowColor: "#FFD700",
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  successOverlay: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 20,
  },
  successText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  errorOverlay: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "700",
  },
  submitWrapper: {
    alignSelf: 'center',
    width: 265,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    width: 280,
    height: 47,
    marginTop: 18,
    resizeMode: 'contain',
  },
});