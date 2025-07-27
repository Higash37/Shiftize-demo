import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { typography } from "@/common/common-constants/TypographyConstants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    padding: layout.padding.xlarge,
  },
  containerTablet: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  containerDesktop: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  formContent: {
    gap: layout.padding.xlarge,
    paddingBottom: layout.padding.xlarge,
    paddingTop: layout.padding.medium,
  },

  // ボタンコンテナ（固定位置）
  buttonContainer: {
    flexDirection: "row",
    gap: layout.padding.large,
    padding: layout.padding.medium,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.small,
  },
  buttonContainerTablet: {
    paddingHorizontal: layout.padding.large,
    paddingVertical: layout.padding.medium,
    gap: layout.padding.large,
  },
  buttonContainerDesktop: {
    paddingHorizontal: layout.padding.large,
    paddingVertical: layout.padding.medium,
    gap: layout.padding.large,
    justifyContent: "center",
  },

  // 警告メッセージ
  warningContainer: {
    backgroundColor: colors.error + "10",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: layout.padding.large,
    ...shadows.small,
  },
  warningText: {
    color: colors.error,
    fontSize: typography.fontSize.small,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },

  // 情報メッセージ
  infoContainer: {
    backgroundColor: colors.primary + "10",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: layout.padding.large,
    ...shadows.small,
  },
  infoText: {
    color: colors.primary,
    fontSize: typography.fontSize.small,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },

  // カラーピッカーセクション
  colorSection: {
    gap: layout.padding.medium,
  },
  colorLabel: {
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.large,
    padding: layout.padding.large,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.small,
  },
  colorButton: {
    flex: 1,
  },

  // ロール選択
  roleSection: {
    gap: layout.padding.medium,
  },
  roleLabel: {
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  roleContainer: {
    flexDirection: "row",
    gap: layout.padding.large,
    padding: layout.padding.large,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  roleButton: {
    flex: 1,
  },
  masterRoleButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    borderWidth: 1,
  },
  masterRoleButtonText: {
    color: colors.text.white,
    fontWeight: "700",
  },
  roleDisabledText: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: layout.padding.small,
    fontStyle: "italic",
  },

  // パスワード・店舗IDカード
  infoCard: {
    backgroundColor: colors.surface,
    padding: layout.padding.large,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  infoLabel: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "600",
  },

  button: {
    flex: 1,
    height: 44,
    minWidth: 140,
  },
  buttonTablet: {
    height: 48,
    minWidth: 160,
    paddingHorizontal: layout.padding.large,
  },
  buttonDesktop: {
    minWidth: 160,
    maxWidth: 200,
    flex: 0,
    height: 44,
  },

  // 旧スタイル（後方互換性のため残す）
  passwordCard: {
    backgroundColor: colors.surface,
    padding: layout.padding.large,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  passwordLabel: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
    fontWeight: "500",
  },
  passwordValue: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "600",
  },
  storeIdCard: {
    backgroundColor: colors.surface,
    padding: layout.padding.large,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  storeIdLabel: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
    fontWeight: "500",
  },
  storeIdValue: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "600",
  },

  // フォーム関連スタイル
  formContainer: {
    padding: layout.padding.large,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    margin: layout.padding.medium,
    ...shadows.small,
  },
  formTitle: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
    textAlign: "center",
  },
  formDescription: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
    marginBottom: layout.padding.large,
    textAlign: "center",
    lineHeight: 20,
  },

  // 入力フィールド関連
  inputContainer: {
    marginBottom: layout.padding.large,
  },
  inputLabel: {
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.small,
    padding: layout.padding.medium,
    fontSize: typography.fontSize.medium,
    backgroundColor: colors.background,
  },
  inputHelper: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginTop: layout.padding.small,
    fontStyle: "italic",
  },

  // ロールボタン関連
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "500",
    textAlign: "center",
  },
  roleButtonActiveText: {
    color: colors.text.white,
    fontWeight: "bold",
  },
});
