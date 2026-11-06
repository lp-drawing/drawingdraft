import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { ScreenContainer } from "@/components/screen-container";
import { LabelChip } from "@/components/studio/brand";
import { SketchCanvas, newShape } from "@/components/studio/sketch-canvas";
import {
  GUIDES,
  STAGES,
  createProject,
  loadProjects,
  makeVersion,
  saveProject,
  type GuideId,
  type ShapeKind,
  type SketchProject,
  type Stroke,
  type ToolId,
} from "@/lib/studio";
import { palette } from "@/constants/studio";
import { downloadArtworkPng } from "@/lib/web-export";

export default function StudioScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWideWeb = Platform.OS === "web" && windowWidth >= 1040;
  const isShortDesktop = isWideWeb && windowHeight < 680;
  const webCanvasHeight = Math.max(180, Math.min(windowHeight - 350, 620));
  const [project, setProject] = useState<SketchProject | null>(null);
  const [tool, setTool] = useState<ToolId>("pencil");
  const [guide, setGuide] = useState<GuideId>("thirds");
  const [size, setSize] = useState(3);
  const [shade, setShade] = useState(62);
  const [valueMode, setValueMode] = useState(false);
  const [mode, setMode] = useState<"draw" | "move">("draw");
  const [selected, setSelected] = useState<string | null>(null);
  const [shapeTray, setShapeTray] = useState(false);
  const [savedLabel, setSavedLabel] = useState("自動保存在這台裝置");
  const canvasRef = useRef<View>(null);
  const historyRef = useRef<
    { strokes: Stroke[]; shapes: SketchProject["shapes"] }[]
  >([]);
  const redoRef = useRef<
    { strokes: Stroke[]; shapes: SketchProject["shapes"] }[]
  >([]);
  const savedIdRef = useRef("");

  useEffect(() => {
    let active = true;
    (async () => {
      const projects = await loadProjects();
      const found = projects.find((item) => item.id === id);
      const next = found ?? createProject();
      if (!found) await saveProject(next);
      if (active) {
        setProject(next);
        setGuide(next.guide);
        savedIdRef.current = next.id;
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!project) return;
    const timer = setTimeout(async () => {
      await saveProject({ ...project, guide });
      setSavedLabel("已保存在這台裝置");
    }, 500);
    return () => clearTimeout(timer);
  }, [project, guide]);

  const remember = useCallback((value: SketchProject) => {
    historyRef.current = [
      ...historyRef.current.slice(-24),
      { strokes: value.strokes, shapes: value.shapes },
    ];
    redoRef.current = [];
  }, []);
  const undo = () =>
    setProject((current) => {
      if (!current || !historyRef.current.length) return current;
      const snapshot = historyRef.current[historyRef.current.length - 1];
      historyRef.current = historyRef.current.slice(0, -1);
      redoRef.current = [
        ...redoRef.current,
        { strokes: current.strokes, shapes: current.shapes },
      ];
      return { ...current, strokes: snapshot.strokes, shapes: snapshot.shapes };
    });
  const redo = () =>
    setProject((current) => {
      if (!current || !redoRef.current.length) return current;
      const snapshot = redoRef.current[redoRef.current.length - 1];
      redoRef.current = redoRef.current.slice(0, -1);
      historyRef.current = [
        ...historyRef.current,
        { strokes: current.strokes, shapes: current.shapes },
      ];
      return { ...current, strokes: snapshot.strokes, shapes: snapshot.shapes };
    });

  const commitStroke = (stroke: Stroke) =>
    setProject((current) => {
      if (!current) return current;
      remember(current);
      return { ...current, strokes: [...current.strokes, stroke] };
    });
  const activeStage = STAGES.findIndex((stage) => stage.id === project?.stage);
  const changeStage = (index: number) =>
    setProject((current) =>
      current ? { ...current, stage: STAGES[index].id } : current,
    );
  const addForm = (kind: ShapeKind) => {
    setProject((current) => {
      if (!current) return current;
      remember(current);
      const shape = newShape(kind);
      setSelected(shape.id);
      return { ...current, shapes: [...current.shapes, shape] };
    });
    setMode("move");
    setShapeTray(false);
  };
  const moveShape = (shapeId: string, x: number, y: number) =>
    setProject((current) =>
      current
        ? {
            ...current,
            shapes: current.shapes.map((shape) =>
              shape.id === shapeId ? { ...shape, x, y } : shape,
            ),
          }
        : current,
    );
  const beginMoveShape = () => {
    if (project) remember(project);
  };
  const deleteSelectedShape = () => {
    if (!project || !selected) return;
    remember(project);
    setProject({
      ...project,
      shapes: project.shapes.filter((shape) => shape.id !== selected),
    });
    setSelected(null);
  };
  const alterSelected = (change: Partial<SketchProject["shapes"][number]>) =>
    setProject((current) => {
      if (!current || !selected) return current;
      remember(current);
      return {
        ...current,
        shapes: current.shapes.map((shape) =>
          shape.id === selected ? { ...shape, ...change } : shape,
        ),
      };
    });
  const saveVersion = async () => {
    if (!project) return;
    const version = makeVersion({ ...project, guide });
    const updated = {
      ...project,
      guide,
      versions: [...project.versions, version],
    };
    setProject(updated);
    await saveProject(updated);
    setSavedLabel(`已保存「${version.label}」`);
  };

  const shareCapture = async (
    target: React.RefObject<View | null>,
    filename: string,
  ) => {
    if (!target.current) return;
    try {
      const uri = await captureRef(target.current, {
        format: "png",
        quality: 1,
        result: Platform.OS === "web" ? "data-uri" : "tmpfile",
      });
      if (Platform.OS === "web") {
        const data = uri as string;
        const anchor = document.createElement("a");
        anchor.href = data;
        anchor.download = `${filename}.png`;
        anchor.click();
        if (navigator.share) {
          try {
            await navigator.share({ title: filename, url: data });
          } catch {
            /* user dismissed native web share */
          }
        }
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri as string, {
          mimeType: "image/png",
          UTI: "public.png",
          dialogTitle: filename,
        });
      } else {
        await Share.share({ message: "我的黑白素描已經準備好了！" });
      }
    } catch {
      Alert.alert("匯出沒有完成", "請再試一次，或先保存這個版本。");
    }
  };

  const exportArtwork = async () => {
    if (!project) return;
    if (Platform.OS === "web") {
      try {
        await downloadArtworkPng(project);
        setSavedLabel("作品圖已下載");
      } catch {
        window.alert("匯出沒有完成，請再試一次。");
      }
      return;
    }
    await shareCapture(canvasRef, project.title);
  };
  const exportStory = () =>
    router.push({
      pathname: "/compare",
      params: { id: project?.id ?? "" },
    } as never);
  const moveLayer = (direction: "front" | "back") => {
    if (!project || !selected) return;
    const index = project.shapes.findIndex((shape) => shape.id === selected);
    if (index < 0) return;
    const next = [...project.shapes];
    const targetIndex =
      direction === "front"
        ? Math.min(next.length - 1, index + 1)
        : Math.max(0, index - 1);
    if (targetIndex === index) return;
    remember(project);
    const [item] = next.splice(index, 1);
    next.splice(targetIndex, 0, item);
    setProject({ ...project, shapes: next });
  };

  const values = useMemo(() => {
    if (!project)
      return {
        black: 25,
        gray: 35,
        white: 40,
        balance: "先安排一個主角，再觀察它與留白的關係。",
      };
    const darkWeight =
      project.strokes.reduce(
        (sum, stroke) =>
          sum + stroke.width * stroke.opacity * stroke.points.length * 0.12,
        0,
      ) +
      project.shapes.reduce(
        (sum, shape) =>
          sum + shape.width * shape.height * (1 - shape.shade / 100) * 0.003,
        0,
      );
    const gray =
      project.strokes.reduce(
        (sum, stroke) =>
          sum +
          stroke.width * stroke.points.length * (1 - stroke.opacity) * 0.08,
        0,
      ) +
      project.shapes.reduce(
        (sum, shape) => sum + shape.width * shape.height * 0.1,
        0,
      );
    const total = Math.max(1, darkWeight + gray + 100);
    const black = Math.min(72, Math.round((darkWeight / total) * 100 + 12));
    const mid = Math.min(66, Math.round((gray / total) * 100 + 15));
    let weightedX = 0;
    let weightedY = 0;
    let totalWeight = 0;
    project.strokes.forEach((stroke) => {
      stroke.points.forEach((point, index) => {
        const previous = stroke.points[index - 1];
        const segmentLength = previous
          ? Math.hypot(point.x - previous.x, point.y - previous.y)
          : stroke.points.length === 1
            ? stroke.width
            : 0;
        const weight =
          segmentLength *
          Math.max(1, stroke.width) *
          Math.max(0.15, stroke.opacity);
        weightedX += point.x * weight;
        weightedY += point.y * weight;
        totalWeight += weight;
      });
    });
    project.shapes.forEach((shape) => {
      const weight =
        shape.width * shape.height * Math.max(0.12, 1 - shape.shade / 100);
      weightedX += shape.x * weight;
      weightedY += shape.y * weight;
      totalWeight += weight;
    });
    let balance = "先安排一個主角，再觀察它與留白的關係。";
    if (totalWeight > 0) {
      const offsetX = (weightedX / totalWeight - 180) / 180;
      const offsetY = (weightedY / totalWeight - 225) / 225;
      if (Math.abs(offsetX) > Math.max(0.15, Math.abs(offsetY)))
        balance =
          offsetX > 0
            ? "估算重心稍偏右；看看左側留白是否需要呼應。"
            : "估算重心稍偏左；看看右側留白是否需要呼應。";
      else if (Math.abs(offsetY) > 0.15)
        balance =
          offsetY > 0
            ? "估算重心稍偏下；上方留白能否讓畫面更穩？"
            : "估算重心稍偏上；下方是否需要一點視覺支撐？";
      else balance = "估算重心接近中央；試著讓主角落在輔助線的焦點位置。";
    }
    return {
      black,
      gray: mid,
      white: Math.max(8, 100 - black - mid),
      balance,
    };
  }, [project]);

  if (!project)
    return (
      <ScreenContainer
        containerClassName="bg-[#F6F2EA]"
        safeAreaClassName="bg-[#F6F2EA]"
        className="items-center justify-center"
      >
        <Text style={{ color: palette.secondary }}>正在準備畫紙…</Text>
      </ScreenContainer>
    );
  const stage = STAGES[activeStage < 0 ? 0 : activeStage];
  const selectedShape = project.shapes.find((shape) => shape.id === selected);
  const stageTitle = stage.label;

  return (
    <ScreenContainer
      edges={["top", "left", "right", "bottom"]}
      containerClassName="bg-[#F6F2EA]"
      safeAreaClassName="bg-[#F6F2EA]"
      className="bg-[#F6F2EA]"
    >
      <Stack.Screen
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <View style={[styles.page, isShortDesktop && styles.pageScrollable]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="arrow-left" size={19} color={palette.ink} />
          </Pressable>
          <View style={styles.titleBox}>
            <TextInput
              value={project.title}
              onChangeText={(title) => setProject({ ...project, title })}
              style={styles.titleInput}
              selectTextOnFocus
              placeholder="作品名稱"
            />
            <Text style={styles.saved}>{savedLabel}</Text>
          </View>
          <Pressable onPress={saveVersion} style={styles.headerAction}>
            <Feather name="bookmark" size={16} color={palette.green} />
            <Text style={styles.headerActionText}>存版本</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/compare",
                params: { id: project.id },
              } as never)
            }
            style={styles.iconButton}
          >
            <Feather name="columns" size={17} color={palette.ink} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stageScroller}
          contentContainerStyle={styles.stageRow}
        >
          {STAGES.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => changeStage(index)}
              style={[
                styles.stageItem,
                project.stage === item.id && styles.stageItemActive,
              ]}
            >
              <Text
                style={[
                  styles.stageNum,
                  project.stage === item.id && styles.stageNumActive,
                ]}
              >
                0{index + 1}
              </Text>
              <Text
                style={[
                  styles.stageText,
                  project.stage === item.id && styles.stageTextActive,
                ]}
              >
                {item.label}
              </Text>
              {index < 3 ? (
                <View
                  style={[
                    styles.stageLine,
                    project.stage === item.id || index < activeStage
                      ? styles.stageLineActive
                      : null,
                  ]}
                />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.hintRow}>
          <View style={styles.hintDot} />
          <Text style={styles.hintText}>
            {project.practicePrompt ?? stage.prompt}
          </Text>
          <Pressable
            onPress={() => setValueMode((value) => !value)}
            style={[
              styles.checkPill,
              valueMode && { backgroundColor: palette.green },
            ]}
          >
            <Feather
              name="sliders"
              size={13}
              color={valueMode ? palette.white : palette.green}
            />
            <Text
              style={[styles.checkText, valueMode && { color: palette.white }]}
            >
              明暗檢查
            </Text>
          </Pressable>
        </View>
        <View
          style={[styles.editorLayout, isWideWeb && styles.editorLayoutWide]}
        >
          <View
            style={[styles.canvasColumn, isWideWeb && styles.canvasColumnWide]}
          >
            <View
              style={[
                styles.canvasArea,
                isWideWeb && {
                  height: webCanvasHeight,
                  minHeight: webCanvasHeight,
                },
              ]}
            >
              <View
                style={[
                  styles.canvasFrame,
                  isWideWeb && {
                    height: webCanvasHeight - 10,
                    maxWidth: (webCanvasHeight - 10) * 0.8,
                  },
                ]}
              >
                <View style={styles.paperHeader}>
                  <View style={styles.paperMark} />
                  <Text style={styles.paperHeaderText}>
                    墨芽練習紙 · {stageTitle}
                  </Text>
                  <Text style={styles.paperNumber}>01 / 04</Text>
                </View>
                <View style={styles.canvasContent}>
                  <SketchCanvas
                    ref={canvasRef}
                    strokes={project.strokes}
                    shapes={project.shapes}
                    guide={guide}
                    activeTool={tool}
                    brushSize={size}
                    shade={shade}
                    mode={mode}
                    selectedShapeId={selected}
                    valueMode={valueMode}
                    onCommit={commitStroke}
                    onMoveStart={beginMoveShape}
                    onMoveShape={moveShape}
                    onSelectShape={setSelected}
                  />
                </View>
                <View style={styles.paperFoot}>
                  <Text style={styles.paperFootText}>
                    先看大形，再慢慢長出細節
                  </Text>
                  <View style={styles.paperDots}>
                    <View />
                    <View />
                    <View />
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.guideLine}>
              <Text style={styles.stripLabel}>構圖線</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.guideRow}
              >
                {GUIDES.map((item) => (
                  <LabelChip
                    key={item.id}
                    active={guide === item.id}
                    onPress={() => {
                      setGuide(item.id);
                      setProject({ ...project, guide: item.id });
                    }}
                    style={styles.guideChip}
                  >
                    {item.label}
                  </LabelChip>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={[styles.toolsPanel, isWideWeb && styles.toolsPanelWide]}>
            {valueMode ? (
              <View style={styles.valueBox}>
                <View style={styles.valueTop}>
                  <Text style={styles.valueTitle}>黑・灰・白</Text>
                  <Text style={styles.valueCaption}>筆觸與形體估算</Text>
                </View>
                <View style={styles.valueBar}>
                  <View
                    style={[
                      styles.valueBlack,
                      { width: `${values.black}%` } as never,
                    ]}
                  />
                  <View
                    style={[
                      styles.valueGray,
                      { width: `${values.gray}%` } as never,
                    ]}
                  />
                  <View
                    style={[
                      styles.valueWhite,
                      { width: `${values.white}%` } as never,
                    ]}
                  />
                </View>
                <View style={styles.valueLegend}>
                  <Text>黑 {values.black}%</Text>
                  <Text>灰 {values.gray}%</Text>
                  <Text>白 {values.white}%</Text>
                </View>
                <Text style={styles.valueTip}>
                  {values.white < 18
                    ? "白色空間較少，看看主角周圍能否留一點呼吸。"
                    : values.black < 15
                      ? "試著安排一個更明確的暗部，讓焦點站穩。"
                      : "再看看最深的地方是不是落在你想強調的位置。"}
                </Text>
                <Text style={styles.valueTip}>{values.balance}</Text>
              </View>
            ) : null}
            {shapeTray ? (
              <View style={styles.shapeTray}>
                {(["circle", "block", "triangle", "apple"] as ShapeKind[]).map(
                  (kind, index) => (
                    <Pressable
                      key={kind}
                      onPress={() => addForm(kind)}
                      style={[
                        styles.shapeChoice,
                        isWideWeb && styles.shapeChoiceWide,
                      ]}
                    >
                      <Feather
                        name={
                          (
                            [
                              "circle",
                              "square",
                              "triangle",
                              "aperture",
                            ] as const
                          )[index]
                        }
                        size={18}
                        color={palette.ink}
                      />
                      <Text style={styles.shapeChoiceText}>
                        {["球體", "方塊", "三角形", "蘋果"][index]}
                      </Text>
                    </Pressable>
                  ),
                )}
              </View>
            ) : null}
            {mode === "move" && selectedShape ? (
              <View
                style={[
                  styles.objectControls,
                  isWideWeb && styles.objectControlsWide,
                ]}
              >
                <Text style={styles.objectHint}>拖動形體移動</Text>
                <Pressable
                  onPress={() =>
                    alterSelected({
                      width: Math.max(42, selectedShape.width - 10),
                      height: Math.max(42, selectedShape.height - 10),
                    })
                  }
                >
                  <Feather
                    name="minus-circle"
                    size={19}
                    color={palette.green}
                  />
                </Pressable>
                <Pressable
                  onPress={() =>
                    alterSelected({
                      width: selectedShape.width + 10,
                      height: selectedShape.height + 10,
                    })
                  }
                >
                  <Feather name="plus-circle" size={19} color={palette.green} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    alterSelected({ rotation: selectedShape.rotation - 15 })
                  }
                >
                  <Feather name="rotate-ccw" size={17} color={palette.green} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    alterSelected({ rotation: selectedShape.rotation + 15 })
                  }
                >
                  <Feather name="rotate-cw" size={17} color={palette.green} />
                </Pressable>
                <Pressable onPress={() => moveLayer("back")}>
                  <Feather name="arrow-down" size={17} color={palette.green} />
                </Pressable>
                <Pressable onPress={() => moveLayer("front")}>
                  <Feather name="arrow-up" size={17} color={palette.green} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="刪除選取形體"
                  hitSlop={8}
                  onPress={deleteSelectedShape}
                >
                  <Feather name="trash-2" size={16} color="#A6564C" />
                </Pressable>
              </View>
            ) : null}
            <View style={[styles.toolBar, isWideWeb && styles.toolBarWide]}>
              <ToolButton
                icon="edit-3"
                label="鉛筆"
                active={tool === "pencil" && mode === "draw"}
                onPress={() => {
                  setTool("pencil");
                  setMode("draw");
                  setShapeTray(false);
                }}
              />
              <ToolButton
                icon="wind"
                label="炭筆"
                active={tool === "charcoal" && mode === "draw"}
                onPress={() => {
                  setTool("charcoal");
                  setMode("draw");
                  setShapeTray(false);
                }}
              />
              <ToolButton
                icon="circle"
                label="橡皮擦"
                active={tool === "eraser" && mode === "draw"}
                onPress={() => {
                  setTool("eraser");
                  setMode("draw");
                  setShapeTray(false);
                }}
              />
              <ToolButton
                icon="move"
                label="移物"
                active={mode === "move"}
                onPress={() => {
                  setMode("move");
                  setShapeTray(false);
                }}
              />
              <ToolButton
                icon="box"
                label="形體"
                active={shapeTray}
                onPress={() => setShapeTray((open) => !open)}
              />
              <ToolButton
                icon="share-2"
                label="匯出"
                active={false}
                onPress={exportArtwork}
              />
            </View>
            <View
              style={[
                styles.bottomControls,
                isWideWeb && styles.bottomControlsWide,
              ]}
            >
              <View
                style={[styles.brushGroup, isWideWeb && styles.brushGroupWide]}
              >
                <Text style={styles.controlLabel}>
                  {tool === "eraser" ? "擦除大小" : "筆觸粗細"} · {size}
                </Text>
                <Pressable
                  onPress={() => setSize((value) => Math.max(1, value - 1))}
                  style={styles.adjust}
                >
                  <Feather name="minus" size={15} color={palette.ink} />
                </Pressable>
                <View style={styles.sliderTrack}>
                  <View
                    style={[
                      styles.sliderFill,
                      { width: `${Math.max(8, size * 10)}%` },
                    ]}
                  />
                </View>
                <Pressable
                  onPress={() => setSize((value) => Math.min(9, value + 1))}
                  style={styles.adjust}
                >
                  <Feather name="plus" size={15} color={palette.ink} />
                </Pressable>
              </View>
              <View style={styles.shadeGroup}>
                <Text style={styles.controlLabel}>深淺</Text>
                {[30, 55, 78, 100].map((value) => (
                  <Pressable
                    key={value}
                    onPress={() => setShade(value)}
                    style={[
                      styles.shadeDot,
                      {
                        backgroundColor: `rgba(36,37,34,${value / 100})`,
                        borderColor:
                          shade === value ? palette.green : palette.line,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={[styles.lastRow, isWideWeb && styles.lastRowWide]}>
              <Pressable onPress={undo} style={styles.smallAction}>
                <Feather name="corner-up-left" size={15} color={palette.ink} />
                <Text style={styles.smallActionText}>復原</Text>
              </Pressable>
              <Pressable onPress={redo} style={styles.smallAction}>
                <Feather name="corner-up-right" size={15} color={palette.ink} />
                <Text style={styles.smallActionText}>重做</Text>
              </Pressable>
              <View style={{ flex: 1 }} />
              <Pressable onPress={exportStory} style={styles.storyAction}>
                <Feather name="image" size={14} color={palette.green} />
                <Text style={styles.storyText}>分享歷程圖卡</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

function ToolButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.toolButton}>
      <View style={[styles.toolIcon, active && styles.toolIconActive]}>
        <Feather
          name={icon}
          size={17}
          color={active ? palette.white : palette.ink}
        />
      </View>
      <Text
        style={[
          styles.toolLabel,
          active && { color: palette.green, fontWeight: "800" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 4,
    maxWidth: 1360,
    width: "100%",
    alignSelf: "center",
  },
  pageScrollable: {
    flex: 0,
    minHeight: "100%",
    paddingBottom: 24,
    overflowY: "auto" as never,
  },
  editorLayout: { flex: 1, minHeight: 0, flexDirection: "column" },
  editorLayoutWide: { flexDirection: "row", alignItems: "stretch", gap: 18 },
  canvasColumn: { flex: 1, minWidth: 0 },
  canvasColumnWide: { flex: 1.4 },
  toolsPanel: {},
  toolsPanelWide: {
    width: 312,
    flexShrink: 0,
    alignSelf: "stretch",
    justifyContent: "center",
    gap: 7,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#EEECE4",
  },
  header: { height: 52, flexDirection: "row", alignItems: "center", gap: 6 },
  iconButton: {
    width: 34,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBox: { flex: 1 },
  titleInput: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
    padding: 0,
    minHeight: 22,
  },
  saved: { color: palette.muted, fontSize: 9, marginTop: 2 },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: palette.greenSoft,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  headerActionText: { color: palette.green, fontSize: 10, fontWeight: "800" },
  stageScroller: { flexGrow: 0, maxHeight: 48 },
  stageRow: {
    minWidth: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 3,
  },
  stageItem: {
    minWidth: 61,
    height: 38,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 6,
    position: "relative",
  },
  stageItemActive: { backgroundColor: palette.greenSoft },
  stageNum: { color: palette.muted, fontSize: 9, fontWeight: "800" },
  stageNumActive: { color: palette.green },
  stageText: { color: palette.secondary, fontSize: 11, fontWeight: "700" },
  stageTextActive: { color: palette.green, fontWeight: "900" },
  stageLine: {
    width: 15,
    height: 1,
    backgroundColor: palette.line,
    position: "absolute",
    right: -14,
  },
  stageLineActive: { backgroundColor: "#97B39B" },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 32,
    marginTop: 2,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.green,
  },
  hintText: { flex: 1, fontSize: 10, color: palette.secondary },
  checkPill: {
    height: 28,
    borderRadius: 11,
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    backgroundColor: palette.greenSoft,
  },
  checkText: { fontSize: 9, color: palette.green, fontWeight: "800" },
  canvasArea: {
    flex: 1,
    minHeight: 230,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  canvasFrame: {
    width: "100%",
    maxWidth: 480,
    height: "100%",
    backgroundColor: palette.sheet,
    borderColor: "#E2DED4",
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    shadowColor: "#58554C",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  paperHeader: {
    height: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paperMark: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.green,
  },
  paperHeaderText: {
    color: palette.muted,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.6,
    flex: 1,
  },
  paperNumber: { color: palette.muted, fontSize: 7, letterSpacing: 0.5 },
  canvasContent: {
    flex: 1,
    minHeight: 180,
    overflow: "hidden",
    backgroundColor: palette.sheet,
  },
  paperFoot: {
    height: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paperFootText: { color: palette.muted, fontSize: 7, letterSpacing: 0.3 },
  paperDots: { flexDirection: "row", gap: 3 },
  guideLine: { flexDirection: "row", alignItems: "center", minHeight: 38 },
  stripLabel: {
    color: palette.secondary,
    fontSize: 9,
    fontWeight: "800",
    marginRight: 8,
  },
  guideRow: { gap: 5, alignItems: "center", paddingRight: 4 },
  guideChip: { minHeight: 27, paddingHorizontal: 9 },
  valueBox: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: palette.sheet,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 13,
    marginBottom: 5,
  },
  valueTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueTitle: { fontSize: 10, fontWeight: "900", color: palette.ink },
  valueCaption: { fontSize: 8, color: palette.muted },
  valueBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
  },
  valueBlack: { backgroundColor: palette.ink },
  valueGray: { backgroundColor: "#A9A99F" },
  valueWhite: {
    backgroundColor: "#F7F5EF",
    borderWidth: 1,
    borderColor: palette.line,
  },
  valueLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  valueLegendText: { color: palette.secondary, fontSize: 8 },
  valueTip: {
    color: palette.green,
    fontSize: 9,
    marginTop: 5,
    fontWeight: "700",
  },
  shapeTray: { flexDirection: "row", gap: 8, paddingVertical: 6 },
  shapeChoice: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderColor: palette.line,
    borderWidth: 1,
    backgroundColor: palette.sheet,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  shapeChoiceWide: { width: "47%", flex: 0 },
  shapeChoiceText: { fontSize: 9, color: palette.ink, fontWeight: "700" },
  objectControls: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: palette.greenSoft,
    borderRadius: 11,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  objectControlsWide: { flexWrap: "wrap", gap: 9, paddingVertical: 8 },
  objectHint: { color: palette.green, fontSize: 9, fontWeight: "800" },
  toolBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 2,
  },
  toolBarWide: { justifyContent: "flex-start", flexWrap: "wrap", gap: 10 },
  toolButton: { minWidth: 43, alignItems: "center", gap: 3 },
  toolIcon: {
    width: 34,
    height: 32,
    borderRadius: 11,
    backgroundColor: palette.sheet,
    borderColor: palette.line,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toolIconActive: {
    backgroundColor: palette.green,
    borderColor: palette.green,
  },
  toolLabel: { color: palette.secondary, fontSize: 8 },
  bottomControls: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    paddingVertical: 6,
    borderTopColor: palette.line,
    borderTopWidth: 1,
  },
  bottomControlsWide: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    paddingVertical: 12,
  },
  brushGroup: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  brushGroupWide: { width: "100%", flex: 0 },
  controlLabel: {
    fontSize: 8,
    color: palette.secondary,
    fontWeight: "800",
    marginRight: 1,
  },
  adjust: {
    width: 24,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderTrack: {
    height: 4,
    backgroundColor: palette.line,
    borderRadius: 4,
    flex: 1,
    overflow: "hidden",
  },
  sliderFill: { height: 4, backgroundColor: palette.green, borderRadius: 4 },
  shadeGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
  shadeDot: { height: 15, width: 15, borderRadius: 8, borderWidth: 2 },
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    gap: 12,
    paddingHorizontal: 2,
  },
  lastRowWide: { height: "auto", minHeight: 34, flexWrap: "wrap", gap: 9 },
  smallAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  smallActionText: { fontSize: 9, color: palette.secondary, fontWeight: "700" },
  storyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: palette.greenSoft,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  storyText: { fontSize: 9, fontWeight: "800", color: palette.green },
});
