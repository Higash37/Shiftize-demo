/**
 * @file index.ts (utility-interfaces)
 * @description 型チェックユーティリティのバレルファイル（再エクスポート用）。
 *
 * 【このファイルの位置づけ】
 * - common/common-utils/utility-interfaces/ のエントリーポイント
 * - TypeChecker.ts の全エクスポートを再公開する
 * - 関連ファイル: TypeChecker.ts（型チェック関数の実体）
 *
 * 【`export * from` の意味】
 * 指定したモジュールの全てのexportを、このファイルからも再エクスポートする。
 * これにより、利用側は `from "utility-interfaces"` だけでインポートできる。
 */
export * from "./TypeChecker";

// レガシーの名前空間ブリッジ
// 後方互換性のために必要な場合はここに追加
