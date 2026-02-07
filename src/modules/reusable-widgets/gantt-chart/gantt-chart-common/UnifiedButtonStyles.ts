import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

// 統一されたボタンスタイル
export const UnifiedButtonStyles = StyleSheet.create({
  // 基本ボタンスタイル
  baseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 26,
  },

  // プライマリボタン（青系）
  primaryButton: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "500",
  },

  // セカンダリボタン（グレー系）
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 9,
    fontWeight: "500",
  },

  // 危険ボタン（赤系）
  dangerButton: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "500",
  },

  // 成功ボタン（緑系）
  successButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "500",
  },

  // 切り替えボタン（アクティブ状態）
  toggleActiveButton: {
    backgroundColor: colors.primary + "1A",
    borderColor: colors.primary + "66",
  },
  toggleActiveButtonText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "500",
  },

  // 切り替えボタン（非アクティブ状態）
  toggleInactiveButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  toggleInactiveButtonText: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: "500",
  },

  // アイコンとテキストの共通スタイル
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 9,
    fontWeight: "500",
  },

  // 小さなボタン（コンパクト）
  compactButton: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    minHeight: 23,
  },
  compactButtonText: {
    fontSize: 8,
    fontWeight: "500",
  },

  // ツールバーボタン（統一ニュートラルトーン・フッター相当サイズ）
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    minHeight: 36,
  },
  toolbarButtonText: {
    color: "#333333",
    fontSize: 12,
    fontWeight: "500",
  },
  toolbarDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 6,
  },
});

// ボタンタイプのヘルパー関数
export const getButtonStyle = (type: 'primary' | 'secondary' | 'danger' | 'success' | 'toggle-active' | 'toggle-inactive' | 'toolbar') => {
  const base = UnifiedButtonStyles.baseButton;

  switch (type) {
    case 'primary':
      return [base, UnifiedButtonStyles.primaryButton];
    case 'secondary':
      return [base, UnifiedButtonStyles.secondaryButton];
    case 'danger':
      return [base, UnifiedButtonStyles.dangerButton];
    case 'success':
      return [base, UnifiedButtonStyles.successButton];
    case 'toggle-active':
      return [base, UnifiedButtonStyles.toggleActiveButton];
    case 'toggle-inactive':
      return [base, UnifiedButtonStyles.toggleInactiveButton];
    case 'toolbar':
      return [UnifiedButtonStyles.toolbarButton];
    default:
      return [base, UnifiedButtonStyles.secondaryButton];
  }
};

export const getButtonTextStyle = (type: 'primary' | 'secondary' | 'danger' | 'success' | 'toggle-active' | 'toggle-inactive' | 'toolbar') => {
  switch (type) {
    case 'primary':
      return UnifiedButtonStyles.primaryButtonText;
    case 'secondary':
      return UnifiedButtonStyles.secondaryButtonText;
    case 'danger':
      return UnifiedButtonStyles.dangerButtonText;
    case 'success':
      return UnifiedButtonStyles.successButtonText;
    case 'toggle-active':
      return UnifiedButtonStyles.toggleActiveButtonText;
    case 'toggle-inactive':
      return UnifiedButtonStyles.toggleInactiveButtonText;
    case 'toolbar':
      return UnifiedButtonStyles.toolbarButtonText;
    default:
      return UnifiedButtonStyles.secondaryButtonText;
  }
};
