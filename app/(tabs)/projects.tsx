import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { Heading, PaperCard } from "@/components/studio/brand";
import { SketchArtwork } from "@/components/studio/sketch-canvas";
import { palette } from "@/constants/studio";
import {
  createProject,
  formatDate,
  loadProjects,
  saveProject,
  type SketchProject,
} from "@/lib/studio";

export default function ProjectsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === "web" && width >= 1240;
  const [projects, setProjects] = useState<SketchProject[]>([]);
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      loadProjects().then((items) => mounted && setProjects(items));
      return () => {
        mounted = false;
      };
    }, []),
  );
  const start = async () => {
    const item = createProject();
    await saveProject(item);
    setProjects((old) => [item, ...old]);
    router.push({ pathname: "/studio", params: { id: item.id } } as never);
  };

  return (
    <ScreenContainer
      containerClassName="bg-[#F6F2EA]"
      safeAreaClassName="bg-[#F6F2EA]"
      className="bg-[#F6F2EA]"
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Heading
          eyebrow="YOUR SKETCHBOOK"
          title="作品庫"
          subtitle="草圖先留著，下一步再慢慢想。"
          action={
            <Pressable onPress={start} style={styles.add}>
              <Feather name="plus" color={palette.white} size={19} />
            </Pressable>
          }
        />
        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>本機作品</Text>
            <Text style={styles.summaryNum}>
              {projects.length.toString().padStart(2, "0")}{" "}
              <Text style={styles.summaryUnit}>件</Text>
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={styles.summaryLabel}>草稿也有價值</Text>
            <Text style={styles.summaryCaption}>每一版都記得你的觀察</Text>
          </View>
          <Feather name="book-open" size={23} color={palette.green} />
        </View>
        {projects.length ? (
          <View style={styles.grid}>
            {projects.map((project, index) => (
              <PaperCard
                key={project.id}
                onPress={() =>
                  router.push({
                    pathname: "/studio",
                    params: { id: project.id },
                  } as never)
                }
                style={[
                  styles.projectCard,
                  isWideWeb && styles.projectCardWide,
                ]}
              >
                <View
                  style={[
                    styles.thumb,
                    index % 3 === 1
                      ? { transform: [{ rotate: "1deg" }] }
                      : null,
                  ]}
                >
                  <SketchArtwork
                    strokes={project.strokes}
                    shapes={project.shapes}
                    guide="none"
                  />
                  <View style={styles.thumbBadge}>
                    <Text style={styles.thumbBadgeText}>
                      {project.versions.length
                        ? `${project.versions.length} 版`
                        : "草稿"}
                    </Text>
                  </View>
                </View>
                <View style={styles.projectInfo}>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.projectTitle}>
                      {project.title}
                    </Text>
                    <Text style={styles.projectDate}>
                      {formatDate(project.updatedAt)} ·{" "}
                      {project.stage === "composition"
                        ? "構圖中"
                        : project.stage === "sketch"
                          ? "草圖中"
                          : project.stage === "values"
                            ? "明暗稿"
                            : "完稿"}
                    </Text>
                  </View>
                  <Feather
                    name="arrow-up-right"
                    size={16}
                    color={palette.green}
                  />
                </View>
              </PaperCard>
            ))}
          </View>
        ) : (
          <PaperCard style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="feather" size={20} color={palette.green} />
            </View>
            <Text style={styles.emptyTitle}>你的畫紙正在等第一筆</Text>
            <Text style={styles.emptyBody}>
              新建一張素描，先從大形和留白開始。
            </Text>
            <Pressable onPress={start} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>新增素描</Text>
              <Feather name="arrow-right" size={14} color={palette.white} />
            </Pressable>
          </PaperCard>
        )}
        <Text style={styles.disclaimer}>
          {Platform.OS === "web"
            ? "作品只存在這個瀏覽器，尚未同步到其他裝置。"
            : "作品只存在這台裝置，尚未同步到雲端。"}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 21,
    paddingBottom: 30,
    maxWidth: 1120,
    width: "100%",
    alignSelf: "center",
    gap: 17,
  },
  add: {
    height: 42,
    width: 42,
    borderRadius: 15,
    backgroundColor: palette.green,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    padding: 17,
    borderRadius: 20,
    backgroundColor: palette.greenSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  summaryLabel: { color: palette.green, fontSize: 10, fontWeight: "800" },
  summaryNum: {
    color: palette.ink,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 3,
  },
  summaryUnit: { color: palette.secondary, fontSize: 12, fontWeight: "600" },
  summaryDivider: { height: 37, width: 1, backgroundColor: "#D2DDD2" },
  summaryCaption: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  projectCard: { width: "48.2%", padding: 9, borderRadius: 18 },
  projectCardWide: { width: "31.5%" },
  thumb: {
    height: 174,
    overflow: "hidden",
    borderRadius: 11,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
    position: "relative",
  },
  thumbBadge: {
    position: "absolute",
    right: 7,
    top: 7,
    backgroundColor: palette.paper,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  thumbBadgeText: { color: palette.green, fontSize: 8, fontWeight: "800" },
  projectInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 2,
    paddingTop: 10,
    paddingBottom: 2,
  },
  projectTitle: { color: palette.ink, fontSize: 13, fontWeight: "800" },
  projectDate: { color: palette.muted, fontSize: 9, marginTop: 3 },
  empty: { alignItems: "center", padding: 25 },
  emptyIcon: {
    height: 54,
    width: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.greenSoft,
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 13,
  },
  emptyBody: {
    color: palette.secondary,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  emptyButton: {
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 17,
    marginTop: 15,
  },
  emptyButtonText: { color: palette.white, fontSize: 12, fontWeight: "800" },
  disclaimer: { color: palette.muted, fontSize: 10, textAlign: "center" },
});
