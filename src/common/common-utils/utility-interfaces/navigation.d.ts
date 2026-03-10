/**
 * @file navigation.d.ts
 * @description React Navigation のグローバル型定義ファイル。
 *
 * 【このファイルの位置づけ】
 * - React Navigation の型安全なナビゲーションを実現するための型宣言
 * - アプリの全画面のパラメータ型をここで集中管理する
 * - 関連ファイル: App.tsx（ナビゲーション設定）, 各画面コンポーネント
 *
 * 【.d.ts ファイルとは】
 * Declaration file（型宣言ファイル）。実行コードは含まず、型情報のみを提供する。
 * TypeScriptのコンパイル時のみ使用され、ランタイムのJavaScriptには含まれない。
 *
 * 【declare global とは】
 * グローバルスコープに型を追加する宣言。
 * ReactNavigation名前空間の RootParamList を拡張することで、
 * navigation.navigate("LoginScreen") のような呼び出しで
 * 画面名の型チェックが効くようになる。
 *
 * 【NavigatorScreenParams とは】
 * ネストされたナビゲーターのパラメータ型を定義するためのユーティリティ型。
 * 親ナビゲーターから子ナビゲーターの画面に直接遷移する際に使用する。
 *
 * 【RootParamList の各プロパティ】
 * - キー: 画面名（navigation.navigate() で指定する文字列）
 * - 値: その画面に渡すパラメータの型
 *   - undefined → パラメータなし（引数不要で遷移可能）
 *   - { id: string } → id パラメータが必須
 */

import { NavigatorScreenParams } from "@react-navigation/native";

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      /** ログイン画面 - パラメータなし */
      LoginScreen: undefined;
      /** ガントチャート月表示画面 - パラメータなし */
      GanttChartMonthView: undefined;
      // 他の画面を追加する場合はここに記述
    }
  }
}
