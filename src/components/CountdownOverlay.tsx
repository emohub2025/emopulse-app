// CountdownOverlay.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, Animated, StyleSheet } from "react-native";
import { useCycleTimer } from './CycleTimerProvider';
import emoPulseLogo from '../assets/logos/logo-text.png';

export default function CountdownOverlay() {
  const { rss, poll } = useCycleTimer();

  const remainingSecRSS = Math.floor(rss.timeRemainingMs / 1000);
  const remainingSecPoll = Math.floor(poll.timeRemainingMs / 1000);

  const remainingSec =
    remainingSecRSS > 0 && remainingSecRSS <= 5
        ? remainingSecRSS
        : remainingSecPoll > 0 && remainingSecPoll <= 5
        ? remainingSecPoll
        : null;

  const [visible, setVisible] = useState(false);
  const [displayNum, setDisplayNum] = useState<number | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!remainingSec || remainingSec > 5) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setDisplayNum(remainingSec);

    // Fade in/out animation
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [remainingSec]);

  if (!visible || displayNum == null) return null;

  return (
    <View style={styles.overlay}>
            
    {/* Logo stays fully visible */}
      <Image
        source={emoPulseLogo}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Static header text */}
      <Text style={styles.headerText}>
        Challenge expires in:
      </Text>

      <Animated.View style={{ opacity }}>
        
        <Text style={[styles.number, styles.outline, { top: -3, left: -3 }]}>
        {displayNum}
        </Text>
        <Text style={[styles.number, styles.outline, { top: -3, left: 3 }]}>
        {displayNum}
        </Text>
        <Text style={[styles.number, styles.outline, { top: 3, left: -3 }]}>
        {displayNum}
        </Text>
        <Text style={[styles.number, styles.outline, { top: 3, left: 3 }]}>
        {displayNum}
        </Text>

        {/* Transparent center */}
        <Text style={styles.number}>{displayNum}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)", // or fully transparent if you prefer
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  logo: {
    width: 260,
    height: 120,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "600",
    color: "white",
    marginBottom: 5,
    textAlign: "center",
  },
  number: {
    fontSize: 200,
    fontWeight: "900",
    color: "white", // center text
    textAlign: "center",
    },
  outline: {
    position: "absolute",
    color: "#f200ffa3", // outline color
    },
});
