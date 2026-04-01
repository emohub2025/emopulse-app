import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";

type Props = {
  children: ReactNode;
  height: number;
  minHeight?: number;
  style?: any;
  marginTop?: number;
  marginBottom?: number;
  minFontSize?: number;
  maxFontSize?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  fontStyle?: "normal" | "italic";
  fontWeight?:
    | "100" | "200" | "300" | "400" | "500"
    | "600" | "700" | "800" | "900";
};

export default function AutoShrinkBlock({
  children,
  height,
  minHeight = height,
  style,
  marginTop,
  marginBottom,
  minFontSize = 14,
  maxFontSize = 24,
  textAlign = "center",
  fontWeight = "700",
  fontStyle = "normal",
}: Props) {

  // Normalize children into a string
  const raw =
    typeof children === "string"
      ? children
      : children == null
      ? ""
      : String(children);

  const content = raw.trim().length > 0 ? raw : "\u200B";

  // ⭐ NEW: Hard cap at 80 words
  const limitWords = (text: string, maxWords = 79) => {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "…";
  };

  const initialText = limitWords(content);

  const [fontSize, setFontSize] = useState(maxFontSize);
  const [displayText, setDisplayText] = useState(initialText);

  useEffect(() => {
    setFontSize(maxFontSize);
    setDisplayText(limitWords(content));
  }, [content, maxFontSize]);

  return (
    <View style={[{ width: "100%", marginTop, marginBottom }, style]}>

      {/* Invisible measurement text */}
      <Text
        key={displayText + "_" + fontSize}   // remount on every shrink step
        style={[
          styles.sharedText,
          styles.measure,
          {
            fontSize,
            textAlign,
            fontWeight,
            fontStyle,
            lineHeight: fontSize * 1.15,
          }
        ]}
        onLayout={(event) => {
          const h = event.nativeEvent.layout.height;
          const maxAllowed = height;

          if (h > maxAllowed && fontSize > minFontSize) {
            // Force next shrink to happen AFTER layout flush
            setTimeout(() => {
              setFontSize(prev => prev - 1);
            }, 0);
          }
        }}
      >
        {displayText}
      </Text>

      {/* Visible text */}
      <Text
        style={[
          styles.sharedText,
          {
            height: Math.max(minHeight, height),
            fontSize,
            textAlign,
            fontWeight,
            fontStyle,
            lineHeight: fontSize * 1.15,
          }
        ]}
      >
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sharedText: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    color: "#fff",
    textAlignVertical: "top",
  },
  measure: {
    position: "absolute",
    opacity: 0,
  },
});