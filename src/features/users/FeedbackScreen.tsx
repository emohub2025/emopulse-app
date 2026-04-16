import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import StarRating from "react-native-star-rating-widget";
import { useUserStore } from "../../state/useUserStore";
import { ENGINE_URL } from "../../../config";

// -----------------------------
// Screen Component
// -----------------------------
export default function FeedbackScreen() {
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const user = useUserStore((state) => state.user);

  const quickTags = ["Too slow", "Confusing", "Love it", "Needs features"];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }
      return [...prev, tag];
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      setShowSuccess(false);

      const token = await AsyncStorage.getItem("authToken");

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
          tags: selectedTags,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      setShowSuccess(true);
      setFeedback("");
      setSuggestions("");
      setRating(0);
      setShowSuggestion(false);
      setSelectedTags([]);
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

        <ScrollView>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>You’re logged in as</Text>
            <Text style={styles.name}>{user?.first_name}</Text>

            <Text style={styles.sectionTitle}>How’s your experience?</Text>

            <StarRating
              rating={rating}
              onChange={setRating}
              starSize={34}
              color="#FFD700"
            />

            <Text style={styles.ratingText}>
              {rating === 0 && "Tap to rate"}
              {rating > 0 && rating < 2 && "Not great"}
              {rating >= 2 && rating < 3.5 && "Needs work"}
              {rating >= 3.5 && rating < 4.5 && "Pretty good"}
              {rating >= 4.5 && "Loving it"}
            </Text>

            <Text style={styles.sectionTitle}>Quick reactions</Text>
            <View style={styles.tagWrap}>
              {quickTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagButton, active && styles.tagButtonActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagText, active && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>What stood out?</Text>

            <TextInput
              style={styles.input}
              placeholder="What did you like or dislike?"
              placeholderTextColor="#999"
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />

            {!showSuggestion && (
              <TouchableOpacity onPress={() => setShowSuggestion(true)}>
                <Text style={styles.suggestionCTA}>
                  💡 I have an idea or feature suggestion
                </Text>
              </TouchableOpacity>
            )}

            {showSuggestion && (
              <>
                <Text style={styles.sectionTitle}>Your idea</Text>

                <TextInput
                  style={styles.input}
                  placeholder="What should we add or improve?"
                  placeholderTextColor="#999"
                  multiline
                  value={suggestions}
                  onChangeText={setSuggestions}
                />
              </>
            )}

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : showSuccess ? (
              <Text style={styles.successText}>
                Thanks — we’re building this with you.
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
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
    marginBottom: 5,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 20,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 6,
    color: "#111",
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },

  ratingText: {
    textAlign: "center",
    marginTop: 6,
    color: "#555",
  },

  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    marginBottom: 8,
  },

  tagButton: {
    backgroundColor: "#F3F3F3",
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },

  tagButtonActive: {
    backgroundColor: "#7B61FF",
    borderColor: "#7B61FF",
  },

  tagText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },

  tagTextActive: {
    color: "#fff",
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    textAlignVertical: "top",
    color: "#111",
  },

  suggestionCTA: {
    marginTop: 12,
    fontSize: 16,
    color: "#7B61FF",
    fontWeight: "600",
  },

  submitBtn: {
    marginTop: 20,
    backgroundColor: "#7B61FF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  successText: {
    marginTop: 14,
    color: "green",
    textAlign: "center",
    fontWeight: "600",
  },

  errorText: {
    marginTop: 14,
    color: "red",
    textAlign: "center",
    fontWeight: "600",
  },
});