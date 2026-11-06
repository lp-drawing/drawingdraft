import { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ActionButton, BrandStamp, PaperCard } from "@/components/studio/brand";
import { SketchArtwork } from "@/components/studio/sketch-canvas";
import { palette } from "@/constants/studio";
import { createProject, loadProjects, type SketchProject } from "@/lib/studio";

const sampleStrokes = [
  {
    id: "s1",
    points: [
      { x: 74, y: 323 },
      { x: 100, y: 285 },
      { x: 138, y: 280 },
      { x: 169, y: 300 },
      { x: 178, y: 347 },
      { x: 162, y: 370 },
      { x: 111, y: 366 },
      { x: 74, y: 323 },
    ],
    color: "#252622",
    width: 3,
    opacity: 0.8,
  },
  {
    id: "s2",
    points: [
      { x: 225, y: 280 },
      { x: 254, y: 235 },
      { x: 300, y: 242 },
      { x: 318, y: 287 },
      { x: 312, y: 345 },
      { x: 281, y: 366 },
      { x: 242, y: 345 },
      { x: 225, y: 280 },
    ],
    color: "#252622",
    width: 3,
    opacity: 0.84,
  },
  {
    id: "s3",
    points: [
      { x: 98, y: 384 },
      { x: 282, y: 384 },
    ],
    color: "#252622",
    width: 2,
    opacity: 0.5,
  },
  {
    id: "s4",
    points: [
      { x: 255, y: 250 },
      { x: 275, y: 220 },
      { x: 299, y: 223 },
    ],
    color: "#252622",
    width: 2,
    opacity: 0.55,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === "web" && width >= 1040;
  const [projects, setProjects] = useState<SketchProject[]>([]);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProjects().then((items) => active && setProjects(items));
      return () => {
        active = false;
      };
    }, []),
  );

  const start = async (title = "我的素描練習") => {
    const project = createProject(title);
    await (await import("@/lib/studio")).saveProject(project);
    router.push({ pathname: "/studio", params: { id: project.id } } as never);
  };
  const recent = projects[0];

  return (
    <ScreenContainer
      containerClassName="bg-[#F6F2EA]"
      safeAreaClassName="bg-[#F6F2EA]"
      className="bg-[#F6F2EA]"
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isWideWeb && styles.contentWide,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <BrandStamp size={42} />
            <View>
              <Text style={styles.brandName}>墨芽</Text>
              <Text style={styles.brandSub}>黑白素描構圖室</Text>
            </View>
          </View>
          <View style={styles.streak}>
            <Feather name="sun" size={15} color={palette.green} />
            <Text style={styles.streakText}>今天也來觀察</Text>
          </View>
        </View>

        <View style={[styles.hero, isWideWeb && styles.heroWide]}>
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>POCKET SKETCH STUDIO</Text>
            <Text style={[styles.heroTitle, isWideWeb && styles.heroTitleWide]}>
              把想法，{`\n`}慢慢畫出來。
            </Text>
            <Text style={styles.heroBody}>
              從大形開始，讓每一筆都有方向。{`\n`}草稿也值得被好好留下。
            </Text>
            <ActionButton
              tone="green"
              onPress={() => start()}
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 18,
                marginTop: 16,
              }}
            >
              <>
                <Text
                  style={{
                    color: palette.white,
                    fontSize: 14,
                    fontWeight: "800",
                  }}
                >
                  開始構圖
                </Text>
                <Feather
                  name="arrow-up-right"
                  size={16}
                  color={palette.white}
                  style={{ marginLeft: 9 }}
                />
              </>
            </ActionButton>
          </View>
          <View style={[styles.heroArt, isWideWeb && styles.heroArtWide]}>
            <View style={styles.artLabel}>
              <Text style={styles.artLabelText}>觀察練習 01</Text>
            </View>
            <SketchArtwork strokes={sampleStrokes} shapes={[]} guide="none" />
          </View>
          <View style={styles.heroStamp}>
            <Text style={styles.heroStampText}>先看大形，再看細節</Text>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionEyebrow}>YOUR DESK</Text>
            <Text style={styles.sectionTitle}>回到你的畫紙</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/projects" as never)}
            style={styles.textLink}
          >
            <Text style={styles.textLinkText}>作品庫</Text>
            <Feather name="arrow-right" size={14} color={palette.green} />
          </Pressable>
        </View>
        {recent ? (
          <PaperCard
            onPress={() =>
              router.push({
                pathname: "/studio",
                params: { id: recent.id },
              } as never)
            }
            style={styles.recentCard}
          >
            <View style={styles.recentPreview}>
              <SketchArtwork
                strokes={recent.strokes}
                shapes={recent.shapes}
                guide="none"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.cardEyebrow}>
                最近編輯 · {recent.versions.length} 個版本
              </Text>
              <Text style={styles.recentTitle} numberOfLines={1}>
                {recent.title}
              </Text>
              <Text style={styles.cardHint}>
                接著完成你的{" "}
                {recent.stage === "composition"
                  ? "構圖"
                  : recent.stage === "sketch"
                    ? "草圖"
                    : recent.stage === "values"
                      ? "明暗稿"
                      : "成果圖"}
              </Text>
              <View style={styles.continue}>
                <Text style={styles.continueText}>繼續畫</Text>
                <Feather name="arrow-right" size={14} color={palette.green} />
              </View>
            </View>
          </PaperCard>
        ) : (
          <PaperCard onPress={() => start("梨與影子")} style={styles.emptyCard}>
            <View style={styles.emptyGlyph}>
              <Feather name="edit-3" size={20} color={palette.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>今天從一顆梨開始</Text>
              <Text style={styles.cardHint}>先排出大形，明暗等一下再說。</Text>
            </View>
            <Feather name="arrow-up-right" size={18} color={palette.green} />
          </PaperCard>
        )}

        <View style={styles.stepCard}>
          <View style={styles.stepTop}>
            <View>
              <Text style={styles.sectionEyebrow}>A SMALL STEP</Text>
              <Text style={styles.stepTitle}>四步完成一張素描</Text>
            </View>
            <Feather name="arrow-down-right" size={18} color={palette.green} />
          </View>
          <View style={styles.steps}>
            <Step number="01" title="構圖" text="先安排" />
            <Step number="02" title="草圖" text="抓比例" />
            <Step number="03" title="明暗" text="找黑白" />
            <Step number="04" title="完稿" text="收整線" />
          </View>
        </View>

        <PaperCard style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Feather name="feather" size={17} color={palette.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTag}>給今天的你</Text>
            <Text style={styles.tipText}>「留白不是空著，是讓主角呼吸。」</Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/learn" as never)}>
            <Feather name="arrow-up-right" size={17} color={palette.green} />
          </Pressable>
        </PaperCard>
        <Text style={styles.localNote}>
          作品保存在{Platform.OS === "web" ? "這個瀏覽器" : "這台裝置"}。{`  `}
          每一個草稿，都是觀察的證據。
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>{number}</Text>
      <Text style={styles.stepName}>{title}</Text>
      <Text style={styles.stepNote}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxWidth: 1140,
    width: "100%",
    alignSelf: "center",
    gap: 21,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { flexDirection: "row", gap: 10, alignItems: "center" },
  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: palette.ink,
    letterSpacing: 1.5,
  },
  brandSub: {
    marginTop: 1,
    fontSize: 10,
    color: palette.secondary,
    letterSpacing: 0.5,
  },
  streak: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: palette.sheet,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.line,
  },
  streakText: { color: palette.secondary, fontSize: 10, fontWeight: "700" },
  hero: {
    minHeight: 290,
    borderRadius: 26,
    backgroundColor: palette.ink,
    overflow: "hidden",
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  contentWide: { gap: 26, paddingTop: 24 },
  heroWide: {
    minHeight: 360,
    paddingHorizontal: 38,
    paddingVertical: 34,
    gap: 24,
  },
  heroText: { flex: 1.08, zIndex: 1 },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 1.8,
    color: "#B8CDBA",
    fontWeight: "800",
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "900",
    color: palette.white,
    letterSpacing: -0.8,
  },
  heroTitleWide: { fontSize: 44, lineHeight: 54 },
  heroBody: { color: "#D6D6CF", fontSize: 12, lineHeight: 19, marginTop: 9 },
  heroArt: {
    width: "43%",
    height: 186,
    maxWidth: 175,
    borderRadius: 5,
    backgroundColor: palette.sheet,
    padding: 6,
    transform: [{ rotate: "2.5deg" }],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE9DF",
  },
  heroArtWide: { width: "42%", height: 252, maxWidth: 380, padding: 10 },
  artLabel: { height: 21, justifyContent: "center", paddingLeft: 4 },
  artLabelText: {
    color: palette.secondary,
    fontSize: 8,
    letterSpacing: 0.7,
    fontWeight: "800",
  },
  heroStamp: {
    position: "absolute",
    bottom: 12,
    right: 16,
    borderColor: "#768E7A",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
    transform: [{ rotate: "-4deg" }],
  },
  heroStampText: { fontSize: 9, color: "#CEDBCF", fontWeight: "700" },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: -12,
  },
  sectionEyebrow: {
    color: palette.green,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: palette.ink },
  textLink: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingBottom: 3,
  },
  textLinkText: { color: palette.green, fontSize: 12, fontWeight: "800" },
  recentCard: { flexDirection: "row", alignItems: "center", padding: 12 },
  recentPreview: {
    width: 76,
    height: 96,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderWidth: 1,
  },
  cardEyebrow: {
    color: palette.green,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  recentTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },
  cardHint: {
    color: palette.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  continue: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    marginTop: 8,
  },
  continueText: { color: palette.green, fontWeight: "800", fontSize: 11 },
  emptyCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  emptyGlyph: {
    height: 42,
    width: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.greenSoft,
  },
  emptyTitle: { color: palette.ink, fontSize: 14, fontWeight: "800" },
  stepCard: {
    borderRadius: 21,
    backgroundColor: "#E9E6DC",
    borderColor: palette.line,
    borderWidth: 1,
    padding: 17,
  },
  stepTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTitle: { fontSize: 17, fontWeight: "900", color: palette.ink },
  steps: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  step: { flex: 1 },
  stepNumber: {
    color: palette.green,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "900",
  },
  stepName: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
  },
  stepNote: { color: palette.secondary, fontSize: 10, marginTop: 2 },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 14,
  },
  tipIcon: {
    height: 36,
    width: 36,
    borderRadius: 12,
    backgroundColor: palette.greenSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  tipTag: {
    fontSize: 9,
    fontWeight: "800",
    color: palette.green,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink,
    fontWeight: "700",
  },
  localNote: {
    color: palette.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: -10,
  },
});
