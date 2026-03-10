/** @file SettingsView.styles.ts
 *  @description 設定画面のスタイル定義。
 *    メニュー項目、デバッグ情報など設定画面のレイアウトを管理する。
 *
 *  【このファイルの位置づけ】
 *  - 依存: react-native の StyleSheet
 *  - 利用先: SettingsView コンポーネント
 *  - 静的スタイルのため、テーマ引数を取らないシンプルな構成
 */
import { StyleSheet } from "react-native";

export const settingsViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  debugInfo: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    marginBottom: 16,
    borderRadius: 8,
  },
});
