import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { ScreenContainer } from "@/components/screen-container";
import { SketchArtwork } from "@/components/studio/sketch-canvas";
import { ActionButton, LabelChip, PaperCard } from "@/components/studio/brand";
import {
  formatDate,
  loadProjects,
  makeVersion,
  saveProject,
  type ProjectVersion,
  type SketchProject,
} from "@/lib/studio";
import { palette } from "@/constants/studio";
import { downloadProcessPng } from "@/lib/web-export";

export default function CompareScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [project, setProject] = useState<SketchProject | null>(null);
  const [leftId, setLeftId] = useState("");
  const cardRef = useRef<View>(null);
  useEffect(() => {
    let alive = true;
    loadProjects().then((items) => {
      const value = items.find((item) => item.id === id);
      if (!alive || !value) return;
      setProject(value);
      setLeftId(value.versions[0]?.id ?? "current");
    });
    return () => {
      alive = false;
    };
  }, [id]);
  const versions = useMemo(() => {
    if (!project) return [];
    if (project.versions.length) return project.versions;
    return [makeVersion(project)];
  }, [project]);
  if (!project)
    return (
      <ScreenContainer
        containerClassName="bg-[#F6F2EA]"
        safeAreaClassName="bg-[#F6F2EA]"
        className="items-center justify-center"
      >
        <Text style={{ color: palette.secondary }}>正在整理作品…</Text>
      </ScreenContainer>
    );
  const left: ProjectVersion =
    versions.find((item) => item.id === leftId) ?? versions[0];
  const current: ProjectVersion = {
    id: "current",
    label: "現在的畫面",
    savedAt: project.updatedAt,
    stage: project.stage,
    strokes: project.strokes,
    shapes: project.shapes,
  };
  const stageName = (stage: string) =>
    (
      ({
        composition: "構圖",
        sketch: "草圖",
        values: "明暗稿",
        final: "成果圖",
      }) as Record<string, string>
    )[stage] ?? "作品";
  const exportCard = async () => {
    if (Platform.OS === "web") {
      try {
        await downloadProcessPng(project, left, current);
      } catch {
        window.alert("匯出沒有完成，請再試一次。");
      }
      return;
    }
    if (!cardRef.current) return;
    try {
      const uri = await captureRef(cardRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      if (await Sharing.isAvailableAsync())
        await Sharing.shareAsync(uri as string, {
          mimeType: "image/png",
          UTI: "public.png",
          dialogTitle: `${project.title} 創作歷程`,
        });
      else await Share.share({ message: `${project.title}：從草圖到成果圖` });
    } catch {
      Alert.alert("匯出沒有完成", "請再試一次。");
    }
  };
  const keepWorking = async (version: ProjectVersion) => {
    const updated = {
      ...project,
      stage: version.stage,
      strokes: version.strokes,
      shapes: version.shapes,
    };
    await saveProject(updated);
    router.replace({
      pathname: "/studio",
      params: { id: project.id },
    } as never);
  };

  return (
    <ScreenContainer
      containerClassName="bg-[#F6F2EA]"
      safeAreaClassName="bg-[#F6F2EA]"
      className="bg-[#F6F2EA]"
    >
      <Stack.Screen
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topbar}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Feather name="arrow-left" size={18} color={palette.ink} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>LOOK BACK, KEEP GOING</Text>
            <Text style={styles.title}>創作的路徑</Text>
          </View>
          <Feather name="layers" size={19} color={palette.green} />
        </View>
        <Text style={styles.subtitle}>
          每次嘗試都是下一張畫的線索。選一個版本，帶著它繼續。
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.versionChips}
        >
          {versions.map((item) => (
            <LabelChip
              key={item.id}
              active={item.id === leftId}
              onPress={() => setLeftId(item.id)}
            >
              {item.label}
            </LabelChip>
          ))}
        </ScrollView>
        <View ref={cardRef} collapsable={false} style={styles.exportCard}>
          <View style={styles.cardHeader}>
            <View style={styles.brandDot}>
              <Feather name="feather" size={15} color={palette.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardBrand}>墨芽 · 創作歷程</Text>
              <Text style={styles.cardTitle}>{project.title}</Text>
            </View>
            <Text style={styles.cardIndex}>
              STUDY {String(project.versions.length || 1).padStart(2, "0")}
            </Text>
          </View>
          <View style={styles.compareRow}>
            <VersionPanel
              version={left}
              title="當時的嘗試"
              stageName={stageName}
            />
            <View style={styles.middleArrow}>
              <Feather name="arrow-right" size={15} color={palette.green} />
            </View>
            <VersionPanel
              version={current}
              title="現在的畫面"
              stageName={stageName}
            />
          </View>
          <View style={styles.bottomNote}>
            <Text style={styles.noteQuote}>
              「看見改變，也看見你正在進步。」
            </Text>
            <Text style={styles.noteDate}>{formatDate(current.savedAt)}</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <ActionButton
            tone="green"
            onPress={() => keepWorking(left)}
            style={{ flex: 1 }}
          >
            <>
              <Feather name="corner-up-left" size={15} color={palette.white} />
              <Text
                style={{
                  color: palette.white,
                  marginLeft: 7,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                從這版繼續
              </Text>
            </>
          </ActionButton>
          <Pressable onPress={exportCard} style={styles.shareButton}>
            <Feather name="share-2" size={16} color={palette.green} />
            <Text style={styles.shareText}>匯出圖卡</Text>
          </Pressable>
        </View>
        <PaperCard style={styles.history}>
          <Text style={styles.historyTitle}>版本紀錄</Text>
          {project.versions.length ? (
            project.versions.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setLeftId(item.id)}
                style={styles.historyRow}
              >
                <View style={styles.historyNumber}>
                  <Text style={styles.historyNumberText}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyName}>{item.label}</Text>
                  <Text style={styles.historyMeta}>
                    {stageName(item.stage)} · {formatDate(item.savedAt)}
                  </Text>
                </View>
                <Feather
                  name={item.id === leftId ? "check-circle" : "circle"}
                  size={16}
                  color={item.id === leftId ? palette.green : palette.shadow}
                />
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptyHistory}>
              還沒有存下版本。回到工作室，完成一個方向後點「存版本」。
            </Text>
          )}
        </PaperCard>
      </ScrollView>
    </ScreenContainer>
  );
}

function VersionPanel({
  version,
  title,
  stageName,
}: {
  version: ProjectVersion;
  title: string;
  stageName: (stage: string) => string;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelLabel}>{title}</Text>
      <View style={styles.panelArt}>
        <SketchArtwork
          strokes={version.strokes}
          shapes={version.shapes}
          guide="none"
        />
      </View>
      <Text style={styles.panelStage}>{stageName(version.stage)}</Text>
      <Text style={styles.panelDate}>{formatDate(version.savedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 19,
    paddingTop: 16,
    paddingBottom: 28,
    maxWidth: 1040,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },
  topbar: { flexDirection: "row", alignItems: "center", gap: 10 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.sheet,
    borderColor: palette.line,
    borderWidth: 1,
  },
  eyebrow: {
    color: palette.green,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: { color: palette.ink, fontSize: 23, fontWeight: "900", marginTop: 3 },
  subtitle: { color: palette.secondary, fontSize: 12, lineHeight: 19 },
  versionChips: { gap: 7 },
  exportCard: {
    borderRadius: 22,
    borderColor: palette.line,
    borderWidth: 1,
    backgroundColor: palette.sheet,
    padding: 13,
    shadowColor: palette.ink,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandDot: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: palette.green,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBrand: {
    color: palette.green,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: "900",
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  cardIndex: {
    color: palette.muted,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: "800",
  },
  compareRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  panel: { flex: 1 },
  panelLabel: {
    color: palette.secondary,
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  panelArt: {
    aspectRatio: 0.78,
    borderRadius: 7,
    borderColor: palette.line,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: palette.white,
  },
  panelStage: {
    color: palette.ink,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
  },
  panelDate: {
    color: palette.muted,
    fontSize: 8,
    textAlign: "center",
    marginTop: 2,
  },
  middleArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.greenSoft,
    zIndex: 1,
    marginHorizontal: -3,
  },
  bottomNote: {
    borderTopWidth: 1,
    borderTopColor: palette.line,
    marginTop: 13,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteQuote: { color: palette.green, fontSize: 9, fontWeight: "700" },
  noteDate: { color: palette.muted, fontSize: 8 },
  actionRow: { flexDirection: "row", gap: 8 },
  shareButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.sheet,
    minHeight: 46,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  shareText: { color: palette.green, fontSize: 11, fontWeight: "800" },
  history: { padding: 15 },
  historyTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
  },
  historyRow: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: palette.line,
  },
  historyNumber: {
    height: 27,
    width: 27,
    borderRadius: 9,
    backgroundColor: palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  historyNumberText: { fontSize: 9, color: palette.green, fontWeight: "900" },
  historyName: { color: palette.ink, fontSize: 11, fontWeight: "800" },
  historyMeta: { color: palette.muted, fontSize: 9, marginTop: 2 },
  emptyHistory: {
    color: palette.secondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
});
