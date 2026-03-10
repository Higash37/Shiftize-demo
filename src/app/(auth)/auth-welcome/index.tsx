/**
 * @file auth-welcome/index.tsx
 * @description ウェルカム画面のルートファイル。
 *
 * 【re-export パターン】
 * 実際のコンポーネントは src/modules/welcome-module/WelcomeScreen.tsx に実装されている。
 * このファイルは「Expo Routerのルーティング用エントリーポイント」として、
 * モジュールのコンポーネントを re-export（再エクスポート）するだけ。
 *
 * この設計のメリット:
 * - ルーティング定義（app/）とビジネスロジック（modules/）を分離できる
 * - モジュール側を変更しても、ルーティングファイルは変更不要
 * - テストやStorybook等でモジュールを単独で使用できる
 *
 * export { X as default } は、名前付きエクスポート X をデフォルトエクスポートとして公開する構文。
 * Expo Router は default export をページコンポーネントとして認識する。
 */

export { WelcomeScreen as default } from "@/modules/welcome-module/WelcomeScreen";
