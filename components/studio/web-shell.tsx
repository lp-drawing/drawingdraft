import { type ReactNode } from "react";
import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { BrandStamp } from "@/components/studio/brand";
import { palette } from "@/constants/studio";
import { createProject, saveProject } from "@/lib/studio";

const NAV_ITEMS = [
  { label: "工作台", path: "/", icon: "home" as const },
  { label: "我的作品", path: "/projects", icon: "book-open" as const },
  { label: "學習角", path: "/learn", icon: "compass" as const },
];

function currentPage(pathname: string) {
  if (pathname.startsWith("/studio")) return "創作工作室";
  if (pathname.startsWith("/compare")) return "創作歷程";
  if (pathname.startsWith("/projects")) return "我的作品";
  if (pathname.startsWith("/learn")) return "學習角";
  return "工作台";
}

export function WebShell({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();
  const isDesktopWeb = Platform.OS === "web" && width >= 1040;
  const isShortDesktop = isDesktopWeb && height < 680;

  if (!isDesktopWeb || pathname.startsWith("/oauth/")) {
    return <View style={styles.mobileFrame}>{children}</View>;
  }

  const newProject = async () => {
    const project = createProject();
    await saveProject(project);
    router.push({ pathname: "/studio", params: { id: project.id } } as never);
  };
  const activePage = currentPage(pathname);

  return (
    <View style={styles.frame}>
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <BrandStamp size={44} />
          <View>
            <Text style={styles.brandName}>墨芽</Text>
            <Text style={styles.brandSub}>黑白素描構圖室</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={newProject}
          style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}
        >
          <Feather name="plus" size={17} color={palette.white} />
          <Text style={styles.newButtonText}>開始新素描</Text>
        </Pressable>

        <Text style={styles.navCaption}>我的創作</Text>
        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const active =
              activePage === item.label ||
              (item.path === "/" && pathname === "/");
            return (
              <Pressable
                key={item.path}
                accessibilityRole="link"
                accessibilityState={{ selected: active }}
                onPress={() => router.push(item.path as never)}
                style={({ pressed }) => [
                  styles.navItem,
                  active && styles.navItemActive,
                  pressed && styles.pressed,
                ]}
              >
                <Feather
                  name={item.icon}
                  size={17}
                  color={active ? palette.green : palette.secondary}
                />
                <Text
                  style={[styles.navLabel, active && styles.navLabelActive]}
                >
                  {item.label}
                </Text>
                {active ? <View style={styles.activeMark} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sidebarSpacer} />
        <View style={styles.localCard}>
          <View style={styles.localIcon}>
            <Feather name="hard-drive" size={15} color={palette.green} />
          </View>
          <Text style={styles.localTitle}>留在這個瀏覽器</Text>
          <Text style={styles.localText}>
            作品會自動保存在目前裝置，暫不會同步到其他裝置。
          </Text>
        </View>
        <Text style={styles.version}>INKSPROUT · SKETCH STUDIO</Text>
      </View>

      <View style={styles.main}>
        <View style={[styles.topbar, isShortDesktop && styles.topbarCompact]}>
          <View>
            <Text style={styles.breadcrumb}>墨芽工作簿　/　{activePage}</Text>
            <Text style={styles.pageTitle}>{activePage}</Text>
          </View>
          <View style={styles.savedStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.savedText}>本機自動保存</Text>
          </View>
        </View>
        <View style={[styles.content, isShortDesktop && styles.contentShort]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileFrame: { flex: 1, backgroundColor: palette.paper },
  frame: { flex: 1, flexDirection: "row", backgroundColor: palette.paper },
  sidebar: {
    width: 244,
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    backgroundColor: "#F0EEE7",
    borderRightWidth: 1,
    borderRightColor: palette.line,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 28,
  },
  brandName: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  brandSub: { color: palette.secondary, fontSize: 10, marginTop: 2 },
  newButton: {
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: palette.green,
    marginBottom: 28,
  },
  newButtonText: { color: palette.white, fontSize: 12, fontWeight: "800" },
  navCaption: {
    color: palette.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "800",
    paddingHorizontal: 11,
    marginBottom: 8,
  },
  navList: { gap: 4 },
  navItem: {
    minHeight: 44,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    position: "relative",
  },
  navItemActive: { backgroundColor: "#E0E8DD" },
  navLabel: { color: palette.secondary, fontSize: 12, fontWeight: "700" },
  navLabelActive: { color: palette.green, fontWeight: "900" },
  activeMark: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
    backgroundColor: palette.green,
  },
  sidebarSpacer: { flex: 1, minHeight: 40 },
  localCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#F8F6F0",
    padding: 13,
    marginBottom: 16,
  },
  localIcon: {
    height: 30,
    width: 30,
    borderRadius: 10,
    backgroundColor: palette.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },
  localTitle: { color: palette.ink, fontSize: 11, fontWeight: "900" },
  localText: {
    color: palette.secondary,
    fontSize: 9,
    lineHeight: 15,
    marginTop: 4,
  },
  version: {
    color: palette.muted,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: "800",
    paddingHorizontal: 3,
  },
  main: { flex: 1, minWidth: 0, backgroundColor: palette.paper },
  topbar: {
    height: 76,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F6F0",
  },
  topbarCompact: { height: 54, paddingHorizontal: 22 },
  breadcrumb: { color: palette.muted, fontSize: 9, letterSpacing: 0.4 },
  pageTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
  },
  savedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: palette.sheet,
    borderWidth: 1,
    borderColor: palette.line,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.green,
  },
  savedText: { color: palette.secondary, fontSize: 10, fontWeight: "700" },
  content: { flex: 1, minHeight: 0 },
  contentShort: { overflowY: "auto" as never },
  pressed: { opacity: 0.78 },
});
