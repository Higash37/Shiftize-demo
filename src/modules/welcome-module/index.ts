/**
 * @file index.ts
 * @description welcome-moduleのバレルファイル（エントリポイント）。
 * WelcomeScreenコンポーネントを再エクスポートしている。
 *
 * 他のファイルから `import { WelcomeScreen } from "@/modules/welcome-module"` と
 * フォルダ名だけで import できるようにするための仕組み。
 */
export { WelcomeScreen } from "./WelcomeScreen";
