/**
 * @file index.ts (util-validation)
 * @description バリデーション関連ユーティリティのバレルファイル（再エクスポート用）。
 *
 * 【このファイルの位置づけ】
 * - common/common-utils/util-validation/ のエントリーポイント
 * - Validators.ts の全エクスポートを再公開する
 * - 関連ファイル: Validators.ts（バリデーション関数の実体）
 *
 * 【validation/ vs util-validation/ の違い】
 * - validation/: Zodスキーマベースのバリデーション（inputValidation.ts, zodValidation.ts）
 * - util-validation/: 手動実装のバリデーション関数（Validators.ts）
 * どちらも入力値の検証を行うが、アプローチが異なる。
 */
export * from "./Validators";

// レガシーの名前空間ブリッジ
// 後方互換性のために必要な場合はここに追加
