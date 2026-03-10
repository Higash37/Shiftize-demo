/** @file ModalStyles.ts
 *  @description シフト一覧で使うモーダル群の共通スタイル定義。
 *    オーバーレイ、モーダルコンテンツ、タスク行、カウント操作、
 *    時間コントロールなどのスタイルを管理する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: react-native の StyleSheet / 共通定数（ShadowConstants, ThemeConstants）
 *  - 利用先: ShiftModal / ShiftReportModal などモーダル系コンポーネント
 */
import { StyleSheet, ViewStyle, Platform } from "react-native";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { colors } from "@/common/common-constants/ThemeConstants";

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%" as ViewStyle["width"],
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 20,
    alignItems: "center" as const,
    ...shadows.modal,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 15,
    color: colors.text.primary,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    width: "100%" as ViewStyle["width"],
    alignItems: "center" as const,
  },
  modalButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  taskRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    width: "100%" as ViewStyle["width"],
    marginVertical: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskTitle: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  taskText: {
    fontSize: 20,
    color: colors.text.primary,
    textAlign: "center" as const,
    flex: 1,
  },

  countControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  countButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  countText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  valueTouchable: {
    padding: 10,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 5,
    marginLeft: 10,
  },
  valueText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  timeControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
});
