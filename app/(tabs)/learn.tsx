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
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ActionButton, Heading, PaperCard } from "@/components/studio/brand";
import { LEARNING_CARDS, palette } from "@/constants/studio";
import { createProject, saveProject } from "@/lib/studio";

export default function LearnScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === "web" && width >= 1040;
  const practice = async (card?: (typeof LEARNING_CARDS)[number]) => {
    const project = createProject(
      card ? `練習｜${card.title}` : "構圖練習",
      card?.guide,
      card?.action,
    );
    await saveProject(project);
    router.push({ pathname: "/studio", params: { id: project.id } } as never);
  };
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
        <Heading
          eyebrow="OBSERVE · COMPOSE · DRAW"
          title="學習角"
          subtitle="構圖沒有標準答案，先試著看見畫面裡的關係。"
        />
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="eye" size={19} color={palette.green} />
          </View>
          <Text style={styles.heroTitle}>觀察一分鐘，{`\n`}下筆更有方向。</Text>
          <Text style={styles.heroBody}>
            選一樣身邊的物品，看看它和紙上的空白怎麼相處。
          </Text>
          <ActionButton
            tone="green"
            onPress={() => practice()}
            style={{ alignSelf: "flex-start", marginTop: 15 }}
          >
            <>
              <Text
                style={{
                  color: palette.white,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                帶著提示去練習
              </Text>
              <Feather
                name="arrow-right"
                size={14}
                color={palette.white}
                style={{ marginLeft: 8 }}
              />
            </>
          </ActionButton>
          <View style={styles.heroSeal}>
            <Text style={styles.heroSealText}>
              看見關係，{`\n`}不只看見物件
            </Text>
          </View>
        </View>
        <View style={[styles.cardGrid, isWideWeb && styles.cardGridWide]}>
          {LEARNING_CARDS.map((card) => (
            <PaperCard
              key={card.number}
              style={[styles.card, isWideWeb && styles.cardWide]}
            >
              <View style={styles.cardTop}>
                <View style={styles.number}>
                  <Text style={styles.numberText}>{card.number}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardText}>{card.text}</Text>
                </View>
                <Feather
                  name="arrow-down-left"
                  size={15}
                  color={palette.green}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`帶著${card.title}提示去練習`}
                onPress={() => practice(card)}
                style={styles.actionLine}
              >
                <Feather name="edit-3" size={13} color={palette.green} />
                <Text style={styles.actionText}>{card.action}</Text>
                <Feather name="arrow-right" size={13} color={palette.green} />
              </Pressable>
            </PaperCard>
          ))}
        </View>
        <Text style={styles.footer}>
          小提示：可以先用很輕的線起稿。畫錯了，擦掉再試也很正常。
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 21,
    paddingBottom: 28,
    maxWidth: 1120,
    width: "100%",
    alignSelf: "center",
    gap: 16,
  },
  contentWide: { paddingHorizontal: 30, paddingTop: 26, gap: 20 },
  hero: {
    position: "relative",
    backgroundColor: "#E8E6DB",
    borderRadius: 22,
    padding: 20,
    overflow: "hidden",
    marginBottom: 3,
  },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.sheet,
    marginBottom: 12,
  },
  heroTitle: {
    color: palette.ink,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "900",
  },
  heroBody: {
    maxWidth: 270,
    color: palette.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  heroSeal: {
    position: "absolute",
    right: 15,
    top: 18,
    height: 65,
    width: 65,
    borderRadius: 33,
    borderColor: "#8DA08E",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "9deg" }],
  },
  heroSealText: {
    color: palette.green,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  cardGrid: { gap: 12 },
  cardGridWide: { flexDirection: "row", flexWrap: "wrap" },
  card: { padding: 15 },
  cardWide: { width: "48.5%" },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  number: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { fontSize: 10, fontWeight: "900", color: palette.green },
  cardTitle: { fontSize: 15, fontWeight: "900", color: palette.ink },
  cardText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.secondary,
    marginTop: 5,
  },
  actionLine: {
    borderTopWidth: 1,
    borderTopColor: palette.line,
    marginTop: 12,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  actionText: { color: palette.green, fontWeight: "700", fontSize: 11 },
  footer: {
    color: palette.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 3,
  },
});
