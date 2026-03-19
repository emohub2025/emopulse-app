import React from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface OptionRowProps {
  icon: any;
  label: string;
  subLabel?: string;
  onPress?: () => void;

  height?: number;

  borderTopColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRightColor?: string;

  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;

  topGradient?: string[];
  bottomGradient?: string[];
  leftGradient?: string[];
  rightGradient?: string[];

  iconWidth?: number;
  iconHeight?: number;

  sideMargin?: number;
  borderRadius?: number;
}

export default function OptionRow({
  icon,
  label,
  subLabel,
  onPress,

  height = 60,

  borderTopColor = '#474477',
  borderBottomColor = '#474477',
  borderLeftColor = '#474477',
  borderRightColor = '#474477',

  borderTopWidth = 1,
  borderBottomWidth = 1,
  borderLeftWidth = 0,
  borderRightWidth = 0,

  topGradient,
  bottomGradient,
  leftGradient,
  rightGradient,

  iconWidth = 35,
  iconHeight = 35,

  sideMargin = 12,
  borderRadius = 0,
}: OptionRowProps) {
  return (
    <View
      style={{
        marginLeft: sideMargin,
        marginRight: sideMargin,
        borderRadius,
        overflow: borderRadius > 0 ? 'hidden' : 'visible',
      }}
    >
      {/* TOP BORDER */}
      {borderTopWidth > 0 &&
        (topGradient ? (
          <LinearGradient
            colors={topGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: borderTopWidth, width: '100%' }}
          />
        ) : (
          <View
            style={{
              height: borderTopWidth,
              width: '100%',
              backgroundColor: borderTopColor,
            }}
          />
        ))}

      {/* MIDDLE ROW */}
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
        {/* LEFT BORDER */}
        {borderLeftWidth > 0 &&
          (leftGradient ? (
            <LinearGradient
              colors={leftGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ width: borderLeftWidth }}
            />
          ) : (
            <View
              style={{
                width: borderLeftWidth,
                backgroundColor: borderLeftColor,
              }}
            />
          ))}

        {/* MAIN PRESSABLE */}
        <Pressable
          style={[
            styles.row,
            {
              height,
              flex: 1,
            },
          ]}
          onPress={onPress}
        >
          <Image
            source={icon}
            style={[
              styles.rowIcon,
              { width: iconWidth, height: iconHeight },
            ]}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{label}</Text>

            {subLabel && (
              <Text style={styles.rowSubLabel}>{subLabel}</Text>
            )}
          </View>

          <Image
            source={require('../assets/images/chevron.png')}
            style={styles.rowArrow}
          />
        </Pressable>

        {/* RIGHT BORDER */}
        {borderRightWidth > 0 &&
          (rightGradient ? (
            <LinearGradient
              colors={rightGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ width: borderRightWidth }}
            />
          ) : (
            <View
              style={{
                width: borderRightWidth,
                backgroundColor: borderRightColor,
              }}
            />
          ))}
      </View>

      {/* BOTTOM BORDER */}
      {borderBottomWidth > 0 &&
        (bottomGradient ? (
          <LinearGradient
            colors={bottomGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: borderBottomWidth, width: '100%' }}
          />
        ) : (
          <View
            style={{
              height: borderBottomWidth,
              width: '100%',
              backgroundColor: borderBottomColor,
            }}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14173E',
    paddingHorizontal: 20,
  },
  rowIcon: {
    resizeMode: 'contain',
    marginRight: 12,
  },
  rowLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  rowSubLabel: {
    color: '#cccccc',
    fontSize: 16,
    marginTop: 2,
  },
  rowArrow: {
    width: 20,
    height: 20,
    tintColor: 'white',
    resizeMode: 'contain',
  },
});