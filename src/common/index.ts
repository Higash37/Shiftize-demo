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
export { colors, typography } from "./common-constants/ThemeBridgeConstants"; // 後方互換性

// デザインシステム
export { designSystem } from "./common-constants/DesignSystem";
// export { DesignExamples } from "./common-constants/DesignExamples"; // TODO: Create DesignExamples file if needed
export * from "./common-constants/ComponentStyles";
export * from "./common-utils/util-style/StyleHelpers";

// 定数
export { layout } from "./common-constants/LayoutConstants";
export { shadows } from "./common-constants/ShadowConstants";

// コア機能 (新しい構造)
export * from "./common-utils";

// 型定義
export * from "./common-models/ModelIndex";

// 定数
export * from "./common-constants/AppConstants";
