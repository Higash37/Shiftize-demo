/**
 * @file loginIndex.tsx
 * @description loginApiフォルダのエントリポイント（バレルファイル）。
 * このファイルは loginApi.ts の中身を再エクスポートしている。
 *
 * バレルファイルとは:
 *   フォルダ内の複数ファイルを1箇所からまとめてimportできるようにする仕組み。
 *   外部からは `import { handleLogin } from "./loginApi"` のように
 *   フォルダ名だけでアクセスできる。
 *
 * `export *` は「このファイルから全てのexportを再エクスポートする」という意味。
 */
export * from "./loginApi";
