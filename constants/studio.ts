import type { GuideId } from "@/lib/studio";

export const palette = {
  paper: "#F6F2EA",
  sheet: "#FFFEFB",
  ink: "#242522",
  secondary: "#6B6C66",
  muted: "#989990",
  line: "#E8E3D9",
  soft: "#EFEAE0",
  green: "#557760",
  greenSoft: "#E6EEE6",
  shadow: "#D9D6CE",
  white: "#FFFFFF",
  black: "#171815",
  gray: "#AAA99F",
};

export const LEARNING_CARDS = [
  {
    number: "01",
    title: "主次先分清",
    text: "先決定誰是主角。讓主角最大或最亮，陪襯物退後一點，畫面就有重點。",
    action: "試著把主角放在三分線交點附近。",
    guide: "thirds" as GuideId,
  },
  {
    number: "02",
    title: "比例用比較",
    text: "先比較物件彼此的高度和寬度，再看局部；用鉛筆比一比，比急著修細節更可靠。",
    action: "找出最高點、最寬處和中線。",
    guide: "grid" as GuideId,
  },
  {
    number: "03",
    title: "留白會呼吸",
    text: "畫紙上沒有畫的地方也屬於構圖。主角周圍的空間，會影響它看起來穩不穩。",
    action: "讓視線前方多一點空間。",
    guide: "thirds" as GuideId,
  },
  {
    number: "04",
    title: "節奏來自重複",
    text: "重複的線、形或明暗可以帶著眼睛移動；有規律，也要留一點變化。",
    action: "找出畫面裡兩三個相呼應的形。",
    guide: "diagonal" as GuideId,
  },
  {
    number: "05",
    title: "前後有層次",
    text: "前面的形狀可以擋住後面的形狀。重疊加上大小差異，就能讓平面有空間感。",
    action: "試試看讓一個物件稍微遮住另一個。",
    guide: "center" as GuideId,
  },
];
