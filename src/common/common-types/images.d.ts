/**
 * @file images.d.ts
 * @description 画像ファイルのモジュール宣言（型定義ファイル）。
 *
 * 【このファイルの位置づけ】
 * - TypeScriptは標準では画像ファイルをimportできない
 * - このファイルで「.png等のファイルは any 型の値をexportする」と宣言している
 * - これにより `import logo from "./logo.png"` が型エラーなく使えるようになる
 *
 * 【.d.ts ファイルとは】
 * - Declaration file（型宣言ファイル）の略
 * - 実行されるコードを含まず、TypeScriptの型情報だけを提供する
 * - コンパイル後のJavaScriptには含まれない
 *
 * 【declare module とは】
 * - 外部モジュール（ここでは画像ファイル）の型を宣言する構文
 * - ワイルドカード `*.png` は「.pngで終わる全てのインポートパス」にマッチする
 * - これがないとTypeScriptが「モジュールが見つかりません」エラーを出す
 *
 * 【any 型を使っている理由】
 * 画像ファイルの実際の値はバンドラー（Metro/webpack）が処理し、
 * 環境によって異なる値（パス文字列、数値ID等）になるため、
 * 厳密な型を付けることが難しい。
 */

/** PNG画像ファイル (.png) のモジュール宣言 */
declare module "*.png" {
  const value: any;
  export default value;
}

/** JPEG画像ファイル (.jpg) のモジュール宣言 */
declare module "*.jpg" {
  const value: any;
  export default value;
}

/** JPEG画像ファイル (.jpeg) のモジュール宣言 */
declare module "*.jpeg" {
  const value: any;
  export default value;
}

/** GIFアニメーション画像ファイル (.gif) のモジュール宣言 */
declare module "*.gif" {
  const value: any;
  export default value;
}

/** SVGベクター画像ファイル (.svg) のモジュール宣言 */
declare module "*.svg" {
  const value: any;
  export default value;
}
