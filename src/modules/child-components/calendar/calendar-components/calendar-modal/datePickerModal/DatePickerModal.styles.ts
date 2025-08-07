import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

// スタイルの型定義
interface DatePickerModalStyles {
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  pickerContainer: ViewStyle;
  pickerItem: ViewStyle;
  selectedItem: ViewStyle;
  pickerText: TextStyle;
  selectedText: TextStyle;
  monthGrid: ViewStyle;
  monthItem: ViewStyle;
  monthItemText: TextStyle;
  modalButtons: ViewStyle;
  modalButton: ViewStyle;
  modalButtonText: TextStyle;
}

export const styles = StyleSheet.create<DatePickerModalStyles>({
  modalOverlay: {
    flex: 1, // 画面全体を覆う
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", // 絶対位置指定
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, // 高いz-indexで確実に最前面に表示
  },
  modalContainer: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
    position: "relative", // 相対位置指定
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 650, // 最大幅を増やす
    maxHeight: "100%", // 高さを少し増やす
    minWidth: 350, // 最小幅を増やす
    ...getPlatformShadow(5),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center", // 自身を中央に配置
    marginHorizontal: "auto", // 水平方向のマージンを自動調整
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: colors.text.primary,
  },
  pickerContainer: {
    maxHeight: 400, // 高さを増やす
    width: "100%", // 幅を100%に設定
  },
  pickerItem: {
    padding: 15, // パディングを増やす
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%", // 幅を100%に設定
  },
  selectedItem: {
    backgroundColor: colors.primary + "20",
  },
  pickerText: {
    fontSize: 16,
    textAlign: "center",
    color: colors.text.primary,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around", // PC画面でのレイアウトを改善
    width: "100%",
    marginBottom: 12, // マージンを増やす
  },
  monthItem: {
    width: "30%", // PC画面でのアイテム幅を少し広げる
    padding: 15, // パディングを増やす
    marginBottom: 10, // 下マージンを増やす
    borderRadius: 8,
    alignItems: "center",
  },
  monthItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    width: "100%",
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
    backgroundColor: colors.primary + "10",
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
