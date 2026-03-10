/** @file UserForm.styles.ts
 *  @description ユーザー追加・編集フォームのスタイル定義。
 *    フォームレイアウト、カラーピッカー、ロール選択、パスワードカード、
 *    入力欄、ボタンなどのスタイルを管理する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: react-native の StyleSheet / 共通定数（ColorConstants, LayoutConstants,
 *          ShadowConstants, TypographyConstants）
 *  - 利用先: UserForm コンポーネント
 *  - 共通定数を使った静的スタイル
 */
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
    padding: layout.padding.medium,
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
    gap: layout.padding.small,
    paddingBottom: layout.padding.medium,
    paddingTop: layout.padding.small,
  },

  // ボタンコンテナ（固定位置）
  buttonContainer: {
    flexDirection: "row",
    gap: layout.padding.medium,
    padding: layout.padding.small,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonContainerTablet: {
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    gap: layout.padding.medium,
  },
  buttonContainerDesktop: {
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    gap: layout.padding.medium,
    justifyContent: "center",
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
    gap: layout.padding.small,
  },
  colorLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: "600",
    color: colors.text.primary,
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.medium,
    padding: layout.padding.small,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorPreview: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorButton: {
    flex: 1,
  },

  // ロール選択
  roleSection: {
    gap: layout.padding.small,
  },
  roleLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: "600",
    color: colors.text.primary,
  },
  roleContainer: {
    flexDirection: "row",
    gap: layout.padding.medium,
    padding: layout.padding.small,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
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
    height: 36,
    minWidth: 120,
  },
  buttonTablet: {
    height: 40,
    minWidth: 140,
    paddingHorizontal: layout.padding.medium,
  },
  buttonDesktop: {
    minWidth: 140,
    maxWidth: 180,
    flex: 0,
    height: 36,
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
