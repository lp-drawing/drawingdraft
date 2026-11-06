import {
  formatDate,
  svgPath,
  type ProjectVersion,
  type Shape,
  type SketchProject,
  type Stroke,
} from "@/lib/studio";

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 450;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

function shapeMarkup(shape: Shape) {
  const fillOpacity = Math.max(0.12, Math.min(0.88, 1 - shape.shade / 100));
  const ink = "#282925";
  let mark = "";

  if (shape.kind === "circle") {
    mark = `<circle cx="${shape.x}" cy="${shape.y}" r="${Math.min(shape.width, shape.height) / 2}" fill="${ink}" fill-opacity="${fillOpacity}" stroke="${ink}" stroke-width="1.5"/>`;
  } else if (shape.kind === "block") {
    mark = `<rect x="${shape.x - shape.width / 2}" y="${shape.y - shape.height / 2}" width="${shape.width}" height="${shape.height}" rx="4" fill="${ink}" fill-opacity="${fillOpacity}" stroke="${ink}" stroke-width="1.5"/>`;
  } else if (shape.kind === "triangle") {
    mark = `<path d="M${shape.x} ${shape.y - shape.height / 2} L${shape.x + shape.width / 2} ${shape.y + shape.height / 2} L${shape.x - shape.width / 2} ${shape.y + shape.height / 2} Z" fill="${ink}" fill-opacity="${fillOpacity}" stroke="${ink}" stroke-width="1.5"/>`;
  } else {
    mark = `<path d="M${shape.x} ${shape.y - shape.height * 0.36} C${shape.x - shape.width * 0.07} ${shape.y - shape.height * 0.56}, ${shape.x - shape.width * 0.3} ${shape.y - shape.height * 0.42}, ${shape.x - shape.width * 0.42} ${shape.y - shape.height * 0.16} C${shape.x - shape.width * 0.64} ${shape.y + shape.height * 0.4}, ${shape.x - shape.width * 0.31} ${shape.y + shape.height * 0.55}, ${shape.x} ${shape.y + shape.height * 0.41} C${shape.x + shape.width * 0.34} ${shape.y + shape.height * 0.57}, ${shape.x + shape.width * 0.62} ${shape.y + shape.height * 0.17}, ${shape.x + shape.width * 0.4} ${shape.y - shape.height * 0.16} C${shape.x + shape.width * 0.27} ${shape.y - shape.height * 0.43}, ${shape.x + shape.width * 0.08} ${shape.y - shape.height * 0.5}, ${shape.x} ${shape.y - shape.height * 0.36} Z M${shape.x} ${shape.y - shape.height * 0.37} Q${shape.x + 8} ${shape.y - shape.height * 0.55} ${shape.x + 18} ${shape.y - shape.height * 0.51}" fill="${ink}" fill-opacity="${fillOpacity}" stroke="${ink}" stroke-width="1.5"/>`;
  }

  return `<g transform="rotate(${shape.rotation} ${shape.x} ${shape.y})">${mark}</g>`;
}

function drawingMarkup(shapes: Shape[], strokes: Stroke[]) {
  return `${shapes.map(shapeMarkup).join("")}${strokes
    .map(
      (stroke) =>
        `<path d="${svgPath(stroke.points)}" fill="none" stroke="${escapeXml(stroke.color)}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${stroke.opacity}"/>`,
    )
    .join("")}`;
}

export function artworkSvg(project: Pick<SketchProject, "strokes" | "shapes">) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}"><rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="#FFFEFB"/>${drawingMarkup(project.shapes, project.strokes)}</svg>`;
}

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    composition: "構圖",
    sketch: "草圖",
    values: "明暗稿",
    final: "成果圖",
  };
  return labels[stage] ?? "素描";
}

function versionPanel(version: ProjectVersion, x: number, label: string) {
  return `<g><rect x="${x}" y="214" width="500" height="506" rx="18" fill="#F7F5EF" stroke="#E1DED4"/><text x="${x + 24}" y="250" fill="#557760" font-family="system-ui, sans-serif" font-size="20" font-weight="700">${escapeXml(label)}</text><svg x="${x + 24}" y="272" width="452" height="382" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" preserveAspectRatio="xMidYMid meet"><rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="#FFFEFB"/>${drawingMarkup(version.shapes, version.strokes)}</svg><text x="${x + 24}" y="686" fill="#242522" font-family="system-ui, sans-serif" font-size="18" font-weight="700">${escapeXml(stageLabel(version.stage))}　·　${escapeXml(formatDate(version.savedAt))}</text></g>`;
}

export function processCardSvg(
  project: SketchProject,
  earlier: ProjectVersion,
  current: ProjectVersion,
) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1060" height="790" viewBox="0 0 1060 790"><rect width="1060" height="790" fill="#F6F2EA"/><rect x="28" y="28" width="1004" height="734" rx="30" fill="#FFFEFB" stroke="#E1DED4"/><circle cx="78" cy="82" r="17" fill="#557760"/><path d="M71 88l13-17 5 4-13 17-7 2 2-6z" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><text x="108" y="78" fill="#557760" font-family="system-ui, sans-serif" font-size="16" font-weight="800" letter-spacing="2">墨芽 · 創作歷程</text><text x="108" y="112" fill="#242522" font-family="system-ui, sans-serif" font-size="27" font-weight="800">${escapeXml(project.title)}</text><text x="982" y="84" text-anchor="end" fill="#8A887F" font-family="system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="2">INKSPROUT</text>${versionPanel(earlier, 28, "當時的嘗試")}${versionPanel(current, 532, "現在的畫面")}<text x="530" y="742" text-anchor="middle" fill="#557760" font-family="system-ui, sans-serif" font-size="16" font-weight="700">看見改變，也看見你正在進步。</text></svg>`;
}

function safeFilename(value: string) {
  const cleaned = value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").trim();
  return cleaned || "墨芽作品";
}

function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

async function renderSvgToPng(svg: string, width: number, height: number) {
  const objectUrl = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("瀏覽器無法繪製作品圖片"));
      image.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("瀏覽器無法建立圖片畫布");
    context.fillStyle = "#FFFEFB";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("PNG 匯出失敗"));
      }, "image/png");
    });
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function shareOrDownload(blob: Blob, filename: string, title: string) {
  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    navigator.canShare
  ) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title, files: [file] });
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    }
  }
  downloadBlob(blob, filename);
}

export async function downloadArtworkPng(
  project: Pick<SketchProject, "title" | "strokes" | "shapes">,
) {
  const filename = `${safeFilename(project.title)}.png`;
  const png = await renderSvgToPng(artworkSvg(project), 1080, 1350);
  await shareOrDownload(png, filename, project.title);
}

export async function downloadProcessPng(
  project: SketchProject,
  earlier: ProjectVersion,
  current: ProjectVersion,
) {
  const filename = `${safeFilename(project.title)}-創作歷程.png`;
  const png = await renderSvgToPng(
    processCardSvg(project, earlier, current),
    1590,
    1185,
  );
  await shareOrDownload(png, filename, `${project.title} 創作歷程`);
}
