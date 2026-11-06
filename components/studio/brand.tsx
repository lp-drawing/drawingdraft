import type { ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { palette } from "@/constants/studio";

const GENERATED_MARK =
  "/manus-storage/async-images/pJvws3S9IHvmOeFfG9wef4/image-1.webp";

export function BrandStamp({
  size = 40,
  inverse = false,
}: {
  size?: number;
  inverse?: boolean;
}) {
  const color = inverse ? "#F6F2EA" : palette.green;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: inverse ? palette.green : palette.greenSoft,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {Platform.OS === "web" ? (
        <Image
          source={{ uri: GENERATED_MARK }}
          resizeMode="cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32">
          <Path
            d="M8 24 21 8l4 3-13 16-5 2 1-5Z"
            fill="none"
            stroke={color}
            strokeWidth="2.1"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path
            d="M7 14c.8-5.4 5-8 11-7-1.1 5.2-4.4 8.1-10 8.4m.2-.1 5.2 5.4"
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path d="m6.2 27.1 3.3-1.1-2.3-2.6-.8 3.7Z" fill={color} />
        </Svg>
      )}
    </View>
  );
}

export function Heading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.headingRow}>
      <View style={styles.headingCopy}>
        {eyebrow ? (
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
        ) : null}
        <Text style={styles.headingTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.headingSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function ActionButton({
  children,
  onPress,
  tone = "dark",
  style,
  ...props
}: Omit<PressableProps, "style"> & {
  children: ReactNode;
  tone?: "dark" | "green" | "paper" | "outline";
  style?: StyleProp<ViewStyle>;
}) {
  const backgroundColor =
    tone === "dark"
      ? palette.ink
      : tone === "green"
        ? palette.green
        : tone === "paper"
          ? palette.greenSoft
          : "transparent";
  const textColor =
    tone === "paper" || tone === "outline" ? palette.ink : palette.white;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: tone === "outline" ? palette.line : backgroundColor,
          opacity: pressed ? 0.83 : 1,
        },
        style,
      ]}
      {...props}
    >
      {typeof children === "string" ? (
        <Text style={[styles.buttonText, { color: textColor }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function LabelChip({
  children,
  active = false,
  onPress,
  style,
}: {
  children: ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? palette.green : palette.sheet,
          borderColor: active ? palette.green : palette.line,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: active ? palette.white : palette.secondary,
          fontSize: 12,
          fontWeight: active ? "700" : "600",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function PaperCard({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && onPress ? { opacity: 0.82 } : null,
      ]}
    >
      {children}
    </Pressable>
  );
}

export const textStyles = {
  title: { color: palette.ink, fontSize: 18, fontWeight: "800" } as TextStyle,
  body: { color: palette.secondary, fontSize: 13, lineHeight: 20 } as TextStyle,
};

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  headingCopy: { flex: 1, paddingRight: 12 },
  eyebrow: {
    color: palette.green,
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: "800",
    marginBottom: 6,
  },
  headingTitle: {
    color: palette.ink,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headingSubtitle: {
    color: palette.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  button: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonText: { fontSize: 14, fontWeight: "800" },
  chip: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: palette.sheet,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
});
