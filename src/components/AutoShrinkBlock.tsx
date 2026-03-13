import { useState } from 'react';
import type { ReactNode } from 'react';
import { Text, View, StyleSheet } from 'react-native';

type Props = {
  children: ReactNode;
  height: number;          // max height before shrinking
  minHeight?: number;      // minimum visible height
  style?: any;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  minFontSize?: number;
  maxFontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontStyle?: 'normal' | 'italic';
  fontWeight?: 
    '100' | '200' | '300' | '400' | '500' | 
    '600' | '700' | '800' | '900';
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
  textAlign = 'center',
  fontWeight = '700',
  fontStyle = 'normal',
}: Props) {

  const [fontSize, setFontSize] = useState(maxFontSize);

  // ⭐ Prevent collapse when text is empty
  const raw =
    typeof children === "string"
      ? children
      : children == null
      ? ""
      : String(children);

  // Ensure non-empty content so the block doesn't collapse
  const content = raw.trim().length > 0 ? raw : "\u200B";

  return (
    <View style={[{ width: '100%', marginTop, marginBottom }, style]}>

      {/* Invisible measurement text */}
      <Text
        style={[
          styles.measure,
          { fontSize, textAlign, fontWeight }
        ]}
        onLayout={(event) => {
          const h = event.nativeEvent.layout.height;
          if (h > height && fontSize > minFontSize) {
            setFontSize(fontSize - 1);
          }
        }}
      >
        {content}
      </Text>

      {/* Visible block with minHeight enforced */}
      <Text
        style={[
          styles.visible,
          {
            height: Math.max(minHeight, height),
            fontSize,
            textAlign,
            fontWeight,
            fontStyle,
          }
        ]}
      >
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  measure: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 5,
    color: '#fff',
  },
  visible: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: -10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 5,
    textAlignVertical: 'top',
    color: '#fff',
  },
});