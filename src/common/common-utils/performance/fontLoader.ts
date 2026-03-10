/**
 * @file fontLoader.ts
 * @description 動的フォント読み込みユーティリティ。
 *              必要なフォント（アイコン）のみを段階的に読み込み、初期ロード時間を短縮する。
 *
 * 【このファイルの位置づけ】
 * - App.tsx 等のアプリ起動時に使用される
 * - expo-font と @expo/vector-icons を使ってアイコンフォントを読み込む
 * - 関連ファイル: App.tsx（アプリ起動）
 *
 * 【なぜフォントを分割読み込みするのか】
 * すべてのアイコンフォントを一度に読み込むと、起動時間が長くなる。
 * 基本的なアイコン（MaterialIcons等）を先に読み込み、
 * 拡張アイコン（FontAwesome等）は必要になった時に読み込むことで、
 * ユーザーが操作可能になるまでの時間を短縮する（パフォーマンス最適化）。
 *
 * 【useFonts フックの動作】
 * - 引数に渡したフォントマップを非同期で読み込む
 * - 戻り値: [fontsLoaded, error] の配列
 *   - fontsLoaded: boolean - 読み込み完了なら true
 *   - error: Error | null - 読み込みエラーがあればエラーオブジェクト
 */

import { useFonts } from "expo-font";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

/**
 * useBasicFonts - 基本的なアイコンフォントを読み込むフック
 *
 * 使用頻度の高いアイコンセットを優先的に読み込む。
 * アプリ起動時に必ず呼び出す。
 *
 * 【読み込まれるアイコンセット】
 * - AntDesign:     Ant Designのアイコン（閉じる、検索等の基本アイコン）
 * - MaterialIcons:  GoogleのMaterial Designアイコン（ナビゲーション、操作系）
 * - Ionicons:       Ionicフレームワークのアイコン（モバイルUI向け）
 *
 * 【スプレッド構文 ...AntDesign.font の意味】
 * AntDesign.font は { "antdesign": require("./AntDesign.ttf") } のようなオブジェクト。
 * ... で展開して1つのオブジェクトにマージしている。
 *
 * @returns [fontsLoaded: boolean, error: Error | null]
 */
export const useBasicFonts = () => {
  return useFonts({
    ...AntDesign.font,
    ...MaterialIcons.font,
    ...Ionicons.font,
  });
};

/**
 * useExtendedFonts - 拡張アイコンフォントを読み込むフック
 *
 * 使用頻度の低いアイコンセットを必要に応じて読み込む。
 * 基本フォントの読み込み完了後に呼び出すのが望ましい。
 *
 * 【読み込まれるアイコンセット】
 * - FontAwesome:              Font Awesomeアイコン（ソーシャルメディアアイコン等）
 * - FontAwesome5:             Font Awesome 5アイコン（より多くのアイコンバリエーション）
 * - MaterialCommunityIcons:   Material Design拡張アイコン（コミュニティ製の追加アイコン）
 *
 * @returns [fontsLoaded: boolean, error: Error | null]
 */
export const useExtendedFonts = () => {
  return useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialCommunityIcons.font,
  });
};
