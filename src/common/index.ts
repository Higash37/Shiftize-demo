/**
 * @file index.ts (common)
 * @description 共通モジュール全体の公開エントリーポイント（バレルファイル）。
 *
 * 【このファイルの位置づけ】
 * - src/common/ 配下の全モジュールを一箇所からインポート可能にする
 * - アプリの各モジュール（modules/）やサービス層（services/）から
 *   `import { ... } from "@/common"` でインポートされる
 *
 * 【エクスポートの構成】
 * 1. コンポーネント (common-ui)
 *    - BoxComponent, FormButton, FormInput, LayoutHeader 等のUIコンポーネント
 *
 * 2. テーマ (common-theme)
 *    - theme オブジェクト（レガシー互換用）
 *    ※ 新規コードでは `import { useMD3Theme } from "@/common/common-theme/md3"` を推奨
 *
 * 3. 定数 (common-constants)
 *    - layout: レイアウト関連の定数（パディング、角丸等）
 *    - shadows: シャドウスタイルの定数
 *    - AppConstants: アプリ全体の定数
 *
 * 4. ユーティリティ (common-utils)
 *    - 型チェック、スタイルヘルパー等の汎用関数
 *
 * 5. 型定義 (common-models)
 *    - Shift, ShiftItem, User 等のデータモデル型
 *
 * 【`export * from` の注意点】
 * 複数のモジュールが同名のエクスポートを持つ場合、名前の衝突が発生する。
 * その場合は `export { specificName } from "..."` で明示的に指定する。
 */

// コンポーネント（UIパーツ）
export * from "./common-ui";

// テーマ（デザイントークン）
export { theme } from "./common-theme/ThemeDefinition";

// 定数（レイアウト、シャドウ）
export { layout } from "./common-constants/LayoutConstants";
export { shadows } from "./common-constants/ShadowConstants";

// コア機能（ユーティリティ関数群）
export * from "./common-utils";
export * from "./common-utils/util-style/StyleHelpers";

// 型定義（データモデル）
export * from "./common-models/ModelIndex";

// 定数（アプリ全体の定数）
export * from "./common-constants/AppConstants";
