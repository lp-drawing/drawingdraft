import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  Platform,
  View,
  type LayoutChangeEvent,
  type PanResponderInstance,
  type ViewStyle,
} from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import {
  svgPath,
  type GuideId,
  type Point,
  type Shape,
  type ShapeKind,
  type Stroke,
  type ToolId,
} from "@/lib/studio";
import { palette } from "@/constants/studio";

const W = 360;
const H = 450;

function guideElements(guide: GuideId) {
  const color = "#557760";
  const common = {
    stroke: color,
    strokeWidth: 0.7,
    opacity: 0.5,
    strokeDasharray: "4 5",
  };
  switch (guide) {
    case "grid":
      return (
        <G {...common}>
          <Line x1="120" y1="0" x2="120" y2={H} />
          <Line x1="240" y1="0" x2="240" y2={H} />
          <Line x1="0" y1="150" x2={W} y2="150" />
          <Line x1="0" y1="300" x2={W} y2="300" />
        </G>
      );
    case "thirds":
      return (
        <G {...common}>
          <Line x1="120" y1="0" x2="120" y2={H} />
          <Line x1="240" y1="0" x2="240" y2={H} />
          <Line x1="0" y1="150" x2={W} y2="150" />
          <Line x1="0" y1="300" x2={W} y2="300" />
          <Circle
            cx="120"
            cy="150"
            r="4"
            fill={color}
            opacity="0.35"
            stroke="none"
          />
          <Circle
            cx="240"
            cy="300"
            r="4"
            fill={color}
            opacity="0.35"
            stroke="none"
          />
        </G>
      );
    case "diagonal":
      return (
        <G {...common}>
          <Line x1="0" y1="0" x2={W} y2={H} />
          <Line x1={W} y1="0" x2="0" y2={H} />
          <Line x1="0" y1={H * 0.5} x2={W} y2={H * 0.5} />
        </G>
      );
    case "center":
      return (
        <G {...common}>
          <Line x1={W / 2} y1="0" x2={W / 2} y2={H} />
          <Line x1="0" y1={H / 2} x2={W} y2={H / 2} />
          <Circle cx={W / 2} cy={H / 2} r="80" fill="none" />
        </G>
      );
    case "triangle":
      return (
        <G {...common}>
          <Path
            d={`M${W / 2} 35 L${W - 34} ${H - 35} L34 ${H - 35} Z M${W / 2} 35 L${W / 2} ${H - 35} M34 ${H - 35} L${W - 34} ${H - 35} L${W / 2} 35`}
          />
        </G>
      );
    default:
      return null;
  }
}

function ShapeMark({ shape, selected }: { shape: Shape; selected: boolean }) {
  const fillOpacity = Math.max(0.12, Math.min(0.88, 1 - shape.shade / 100));
  const color = "#282925";
  return (
    <G rotation={shape.rotation} originX={shape.x} originY={shape.y}>
      {shape.kind === "circle" && (
        <Circle
          cx={shape.x}
          cy={shape.y}
          r={Math.min(shape.width, shape.height) / 2}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth="1.5"
        />
      )}
      {shape.kind === "block" && (
        <Rect
          x={shape.x - shape.width / 2}
          y={shape.y - shape.height / 2}
          width={shape.width}
          height={shape.height}
          rx="4"
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth="1.5"
        />
      )}
      {shape.kind === "triangle" && (
        <Path
          d={`M${shape.x} ${shape.y - shape.height / 2} L${shape.x + shape.width / 2} ${shape.y + shape.height / 2} L${shape.x - shape.width / 2} ${shape.y + shape.height / 2} Z`}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth="1.5"
        />
      )}
      {shape.kind === "apple" && (
        <Path
          d={`M${shape.x} ${shape.y - shape.height * 0.36} C${shape.x - shape.width * 0.07} ${shape.y - shape.height * 0.56}, ${shape.x - shape.width * 0.3} ${shape.y - shape.height * 0.42}, ${shape.x - shape.width * 0.42} ${shape.y - shape.height * 0.16} C${shape.x - shape.width * 0.64} ${shape.y + shape.height * 0.4}, ${shape.x - shape.width * 0.31} ${shape.y + shape.height * 0.55}, ${shape.x} ${shape.y + shape.height * 0.41} C${shape.x + shape.width * 0.34} ${shape.y + shape.height * 0.57}, ${shape.x + shape.width * 0.62} ${shape.y + 0.17 * shape.height}, ${shape.x + shape.width * 0.4} ${shape.y - shape.height * 0.16} C${shape.x + shape.width * 0.27} ${shape.y - shape.height * 0.43}, ${shape.x + shape.width * 0.08} ${shape.y - shape.height * 0.5}, ${shape.x} ${shape.y - shape.height * 0.36} Z M${shape.x} ${shape.y - shape.height * 0.37} Q${shape.x + 8} ${shape.y - shape.height * 0.55} ${shape.x + 18} ${shape.y - shape.height * 0.51}`}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth="1.5"
        />
      )}
      {selected && (
        <Rect
          x={shape.x - shape.width / 2 - 8}
          y={shape.y - shape.height / 2 - 8}
          width={shape.width + 16}
          height={shape.height + 16}
          rx="8"
          fill="none"
          stroke={palette.green}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}
    </G>
  );
}

export function SketchArtwork({
  strokes,
  shapes,
  guide = "none",
  previewStroke,
  valueMode = false,
}: {
  strokes: Stroke[];
  shapes: Shape[];
  guide?: GuideId;
  previewStroke?: Stroke | null;
  valueMode?: boolean;
}) {
  const artwork = (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      <Rect width={W} height={H} fill="#FFFEFB" />
      {shapes.map((shape) => (
        <ShapeMark key={shape.id} shape={shape} selected={false} />
      ))}
      {strokes.map((stroke) => (
        <Path
          key={stroke.id}
          d={svgPath(stroke.points)}
          fill="none"
          stroke={stroke.color}
          strokeWidth={stroke.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={stroke.opacity}
        />
      ))}
      {previewStroke && (
        <Path
          d={svgPath(previewStroke.points)}
          fill="none"
          stroke={previewStroke.color}
          strokeWidth={previewStroke.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={previewStroke.opacity}
        />
      )}
      {guideElements(guide)}
      {valueMode && (
        <G>
          <Rect
            x="12"
            y="12"
            width="57"
            height="21"
            rx="10"
            fill="#242522"
            opacity=".85"
          />
          <SvgText
            x="40"
            y="26"
            fill="#fff"
            fontSize="9"
            fontWeight="700"
            textAnchor="middle"
          >
            明暗檢查
          </SvgText>
        </G>
      )}
    </Svg>
  );
  return valueMode && Platform.OS === "web" ? (
    <View style={{ flex: 1, filter: "grayscale(1) contrast(1.2)" as never }}>
      {artwork}
    </View>
  ) : (
    artwork
  );
}

export interface SketchCanvasProps {
  strokes: Stroke[];
  shapes: Shape[];
  guide: GuideId;
  activeTool: ToolId;
  brushSize: number;
  shade: number;
  mode: "draw" | "move";
  selectedShapeId: string | null;
  valueMode?: boolean;
  onCommit: (stroke: Stroke) => void;
  onMoveStart: () => void;
  onMoveShape: (id: string, x: number, y: number) => void;
  onSelectShape: (id: string | null) => void;
}

export const SketchCanvas = forwardRef<View, SketchCanvasProps>(
  function SketchCanvas(props, ref) {
    const [size, setSize] = useState({ width: 1, height: 1 });
    const [current, setCurrent] = useState<Point[]>([]);
    const [panHandlers, setPanHandlers] = useState<
      PanResponderInstance["panHandlers"] | null
    >(null);
    const currentRef = useRef<Point[]>([]);
    const movingId = useRef<string | null>(null);
    const latest = useRef(props);
    useEffect(() => {
      latest.current = props;
    }, [props]);
    const scale = useMemo(
      () => ({ x: W / size.width, y: H / size.height }),
      [size],
    );

    useEffect(() => {
      const locate = (event: any) => ({
        x: Math.max(0, Math.min(W, event.nativeEvent.locationX * scale.x)),
        y: Math.max(0, Math.min(H, event.nativeEvent.locationY * scale.y)),
      });
      const responder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const point = locate(event);
          if (latest.current.mode === "move") {
            const found = [...latest.current.shapes]
              .reverse()
              .find(
                (shape) =>
                  Math.abs(shape.x - point.x) < shape.width * 0.65 &&
                  Math.abs(shape.y - point.y) < shape.height * 0.65,
              );
            movingId.current = found?.id ?? null;
            latest.current.onSelectShape(movingId.current);
            if (movingId.current) latest.current.onMoveStart();
          } else {
            currentRef.current = [point];
            setCurrent([point]);
          }
        },
        onPanResponderMove: (event) => {
          const point = locate(event);
          if (latest.current.mode === "move" && movingId.current) {
            latest.current.onMoveShape(movingId.current, point.x, point.y);
          } else if (latest.current.mode === "draw") {
            currentRef.current = [...currentRef.current, point];
            setCurrent(currentRef.current);
          }
        },
        onPanResponderRelease: () => {
          if (latest.current.mode === "draw" && currentRef.current.length > 0) {
            const tool = latest.current.activeTool;
            latest.current.onCommit({
              id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              points: currentRef.current,
              color: tool === "eraser" ? "#FFFEFB" : "#242522",
              width:
                latest.current.brushSize *
                (tool === "charcoal" ? 2.4 : tool === "eraser" ? 11 : 1),
              opacity:
                tool === "charcoal"
                  ? 0.24
                  : tool === "eraser"
                    ? 1
                    : 0.2 + (latest.current.shade / 100) * 0.8,
            });
          }
          currentRef.current = [];
          setCurrent([]);
          movingId.current = null;
        },
        onPanResponderTerminate: () => {
          currentRef.current = [];
          setCurrent([]);
          movingId.current = null;
        },
        onPanResponderTerminationRequest: () => false,
      });
      setPanHandlers(responder.panHandlers);
    }, [scale]);

    const onLayout = (event: LayoutChangeEvent) =>
      setSize({
        width: Math.max(1, event.nativeEvent.layout.width),
        height: Math.max(1, event.nativeEvent.layout.height),
      });
    const tool = props.activeTool;
    const preview = current.length
      ? {
          id: "preview",
          points: current,
          color: tool === "eraser" ? "#FFFEFB" : "#242522",
          width:
            props.brushSize *
            (tool === "charcoal" ? 2.4 : tool === "eraser" ? 11 : 1),
          opacity:
            tool === "charcoal"
              ? 0.24
              : tool === "eraser"
                ? 1
                : 0.2 + (props.shade / 100) * 0.8,
        }
      : null;
    const artwork = (
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <Rect width={W} height={H} fill="#FFFEFB" />
        {props.shapes.map((shape) => (
          <ShapeMark
            key={shape.id}
            shape={shape}
            selected={shape.id === props.selectedShapeId}
          />
        ))}
        {props.strokes.map((stroke) => (
          <Path
            key={stroke.id}
            d={svgPath(stroke.points)}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={stroke.opacity}
          />
        ))}
        {preview && (
          <Path
            d={svgPath(preview.points)}
            fill="none"
            stroke={preview.color}
            strokeWidth={preview.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={preview.opacity}
          />
        )}
        {guideElements(props.guide)}
        {props.valueMode && (
          <G>
            <Rect x="12" y="12" width="68" height="22" rx="11" fill="#242522" />
            <SvgText
              x="46"
              y="27"
              fill="#fff"
              fontSize="9"
              fontWeight="700"
              textAnchor="middle"
            >
              黑・灰・白
            </SvgText>
          </G>
        )}
      </Svg>
    );

    return (
      <View
        ref={ref}
        collapsable={false}
        onLayout={onLayout}
        style={
          {
            flex: 1,
            overflow: "hidden",
            backgroundColor: palette.sheet,
          } as ViewStyle
        }
        {...(panHandlers ?? {})}
      >
        {props.valueMode && Platform.OS === "web" ? (
          <View
            style={{ flex: 1, filter: "grayscale(1) contrast(1.15)" as never }}
          >
            {artwork}
          </View>
        ) : (
          artwork
        )}
      </View>
    );
  },
);

export function newShape(kind: ShapeKind): Shape {
  return {
    id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    kind,
    x: W / 2,
    y: H / 2,
    width: kind === "block" ? 98 : kind === "triangle" ? 106 : 82,
    height: kind === "block" ? 116 : kind === "triangle" ? 94 : 98,
    rotation: 0,
    shade: kind === "circle" ? 74 : 84,
  };
}
