import { StyleSheet } from "react-native";

// 統一されたボタンスタイル
export const UnifiedButtonStyles = StyleSheet.create({
  // 基本ボタンスタイル
  baseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
  },
  
  // プライマリボタン（青系）
  primaryButton: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  
  // セカンダリボタン（グレー系）
  secondaryButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ddd",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },
  
  // 危険ボタン（赤系）
  dangerButton: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  
  // 成功ボタン（緑系）
  successButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  
  // 切り替えボタン（アクティブ状態）
  toggleActiveButton: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  toggleActiveButtonText: {
    color: "#2196f3",
    fontSize: 12,
    fontWeight: "600",
  },
  
  // 切り替えボタン（非アクティブ状態）
  toggleInactiveButton: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  toggleInactiveButtonText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  
  // アイコンとテキストの共通スタイル
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  
  // 小さなボタン（コンパクト）
  compactButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 32,
  },
  compactButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },
});

// ボタンタイプのヘルパー関数
export const getButtonStyle = (type: 'primary' | 'secondary' | 'danger' | 'success' | 'toggle-active' | 'toggle-inactive') => {
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
    default:
      return [base, UnifiedButtonStyles.secondaryButton];
  }
};

export const getButtonTextStyle = (type: 'primary' | 'secondary' | 'danger' | 'success' | 'toggle-active' | 'toggle-inactive') => {
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
    default:
      return UnifiedButtonStyles.secondaryButtonText;
  }
};