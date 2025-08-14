import { StyleSheet, Platform, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

export const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: "100%", // 画面端まで伸ばす
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: "space-around", // タブを均等に配置
    alignItems: "center", // 縦方向の中央揃え
    minHeight: 60, // 最小高さを保証
    paddingHorizontal: 8, // 左右の余白
    ...(Platform.OS === "web" && {
      position: "relative" as any,
      bottom: 0,
      left: 0,
      right: 0,
    }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: IS_SMALL_DEVICE ? 6 : 8,
    minWidth: 0, // flex子要素の最小幅を0に
    maxWidth: "100%", // 最大幅制限
    justifyContent: "center",
  },
  createTab: {
    marginTop: IS_SMALL_DEVICE ? -15 : -20,
  },
  disabledTab: {
    opacity: 0.5,
  },
  label: {
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
    color: colors.text.secondary,
    marginTop: IS_SMALL_DEVICE ? 2 : 4,
  },
  activeLabel: {
    color: colors.primary,
  },
  createLabel: {
    color: colors.primary,
  },
  disabledLabel: {
    color: colors.text.secondary,
  },
  addButtonContainer: {
    width: IS_SMALL_DEVICE ? 48 : 56,
    height: IS_SMALL_DEVICE ? 48 : 56,
    borderRadius: IS_SMALL_DEVICE ? 24 : 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...getPlatformShadow(4),
  },
});
