/**
 * 共通モジュールのエクスポート
 *
 * このファイルは、共通コンポーネント、ユーティリティ関数、型定義、定数などを
 * 一か所からインポートできるように集約しています。
 */

// コンポーネント
export * from "./common-ui";

// テーマ
export { theme } from "./common-theme/ThemeDefinition";

// 定数
export { layout } from "./common-constants/LayoutConstants";
export { shadows } from "./common-constants/ShadowConstants";

// コア機能 (新しい構造)
export * from "./common-utils";
export * from "./common-utils/util-style/StyleHelpers";

// 型定義
export * from "./common-models/ModelIndex";

// 定数
export * from "./common-constants/AppConstants";
