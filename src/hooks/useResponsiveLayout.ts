import { useMemo } from "react";
import { PixelRatio, Platform, useWindowDimensions } from "react-native";

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const widthScale = shortSide / BASE_WIDTH;
    const heightScale = longSide / BASE_HEIGHT;
    const scale = clamp(Math.min(widthScale, heightScale), 0.82, 1.18);
    const zoomScale = clamp(fontScale || PixelRatio.getFontScale(), 1, 1.35);
    const isCompact = shortSide < 375 || zoomScale > 1.12;
    const isVeryCompact = shortSide < 350 || zoomScale > 1.25;

    return {
      width,
      height,
      fontScale: zoomScale,
      isAndroid: Platform.OS === "android",
      isCompact,
      isVeryCompact,
      scale: (value: number, min = value * 0.82, max = value * 1.18) =>
        Math.round(clamp(value * scale, min, max)),
      font: (value: number, min = value * 0.82, max = value) =>
        Math.round(clamp((value * scale) / Math.min(zoomScale, 1.18), min, max)),
    };
  }, [fontScale, height, width]);
}
