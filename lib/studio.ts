import AsyncStorage from "@react-native-async-storage/async-storage";

export type StageId = "composition" | "sketch" | "values" | "final";
export type GuideId =
  | "none"
  | "grid"
  | "thirds"
  | "diagonal"
  | "center"
  | "triangle";
export type ToolId = "pencil" | "charcoal" | "eraser";
export type ShapeKind = "circle" | "block" | "triangle" | "apple";

export const STAGES: {
  id: StageId;
  label: string;
  hint: string;
  prompt: string;
}[] = [
  {
    id: "composition",
    label: "構圖",
    hint: "先安排大形與留白",
    prompt: "先把主角、陪襯和空白的位置排好。",
  },
  {
    id: "sketch",
    label: "草圖",
    hint: "輕輕畫出輪廓",
    prompt: "用輕線確認比例；不必急著畫細節。",
  },
  {
    id: "values",
    label: "明暗",
    hint: "找出亮面與影子",
    prompt: "找出最亮、最暗的位置，讓主角跳出來。",
  },
  {
    id: "final",
    label: "完稿",
    hint: "收整線條與質感",
    prompt: "保留最有用的線，整理邊緣與畫面節奏。",
  },
];

export const GUIDES: { id: GuideId; label: string }[] = [
  { id: "none", label: "關閉" },
  { id: "grid", label: "九宮格" },
  { id: "thirds", label: "三分法" },
  { id: "diagonal", label: "對角線" },
  { id: "center", label: "中心式" },
  { id: "triangle", label: "三角式" },
];

export interface Point {
  x: number;
  y: number;
}
export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  opacity: number;
}
export interface Shape {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shade: number;
}
export interface ProjectVersion {
  id: string;
  label: string;
  savedAt: string;
  stage: StageId;
  strokes: Stroke[];
  shapes: Shape[];
}
export interface SketchProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  stage: StageId;
  guide: GuideId;
  practicePrompt?: string;
  strokes: Stroke[];
  shapes: Shape[];
  versions: ProjectVersion[];
}

const STORAGE_KEY = "moyaart.projects.v1";

export async function loadProjects(): Promise<SketchProject[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveProject(project: SketchProject): Promise<void> {
  const projects = await loadProjects();
  const updated = { ...project, updatedAt: new Date().toISOString() };
  const next = [updated, ...projects.filter((item) => item.id !== project.id)];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function removeProject(id: string): Promise<void> {
  const projects = await loadProjects();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects.filter((item) => item.id !== id)),
  );
}

export function createProject(
  title = "我的素描練習",
  guide: GuideId = "thirds",
  practicePrompt?: string,
): SketchProject {
  const now = new Date().toISOString();
  return {
    id: `sketch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    createdAt: now,
    updatedAt: now,
    stage: "composition",
    guide,
    practicePrompt,
    strokes: [],
    shapes: [],
    versions: [],
  };
}

export function makeVersion(project: SketchProject): ProjectVersion {
  return {
    id: `version-${Date.now()}`,
    label:
      project.versions.length === 0
        ? "起稿"
        : `方案 ${project.versions.length + 1}`,
    savedAt: new Date().toISOString(),
    stage: project.stage,
    strokes: project.strokes.map((stroke) => ({
      ...stroke,
      points: [...stroke.points],
    })),
    shapes: project.shapes.map((shape) => ({ ...shape })),
  };
}

export function restoreVersion(
  project: SketchProject,
  version: ProjectVersion,
): SketchProject {
  return {
    ...project,
    stage: version.stage,
    strokes: version.strokes.map((stroke) => ({
      ...stroke,
      points: [...stroke.points],
    })),
    shapes: version.shapes.map((shape) => ({ ...shape })),
  };
}

export function svgPath(points: Point[]): string {
  if (!points.length) return "";
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
    )
    .join(" ");
}

export function formatDate(date: string): string {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "剛剛更新";
  return `${value.getMonth() + 1} 月 ${value.getDate()} 日`;
}
