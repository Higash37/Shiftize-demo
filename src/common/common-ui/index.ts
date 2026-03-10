/**
 * @file index.ts
 * @description common-uiモジュールのバレルエクスポート
 *
 * ============================================================
 * 【なぜ "index.ts" でまとめて export するのか — バレルファイルの由来】
 * ============================================================
 *
 * ■ バレル（barrel = 樽）の比喩
 *   樽の中に多くのものを詰め込んで、1つの容器として扱うイメージ。
 *   フォルダ内に散らばった複数のモジュールを、index.ts で1つにまとめて
 *   外部に公開する。Node.js では import "@/common/common-ui" と書くと
 *   自動的にそのフォルダの index.ts が読み込まれる仕組みがある。
 *
 * ■ メリット
 *   1. import パスが短くなる:
 *      バレルなし: import { Box } from "@/common/common-ui/ui-base/BoxComponent"
 *      バレルあり: import { Box } from "@/common/common-ui"
 *      使う側はフォルダ構造を知らなくてよい。内部のファイル配置を変えても影響しない。
 *
 *   2. 公開APIの制御:
 *      index.ts で export するものだけが「このモジュールの公開インターフェース」になる。
 *      内部でしか使わないヘルパー関数を export しなければ、外部からアクセスできない。
 *
 *   3. リファクタリングが容易:
 *      ファイルを分割・統合しても、index.ts の export を調整するだけで
 *      使う側のコードを変更する必要がない。
 *
 * ■ デメリット — ケースバイケース
 *   1. Tree shaking への影響:
 *      バンドラー（webpack, Metro等）が「使われていないコードを除去する」最適化を
 *      Tree shaking と呼ぶ。バレルファイルで `export *` を使うと、
 *      バンドラーが「何が使われているか」を判定しにくくなる場合がある。
 *      ただし、最新のバンドラーでは問題になることは少ない。
 *
 *   2. 循環参照のリスク:
 *      A が B を import し、B が A を import する「循環参照」が起きやすくなる。
 *      バレルファイル経由で間接的に循環する場合もある。
 *
 * ■ この場合にバレルファイルが適切な理由
 *   common-ui は「UIコンポーネントのライブラリ」として多くの画面から使われる。
 *   各画面が ui-base, ui-forms, ui-layout 等の内部構造を知る必要はなく、
 *   import { Box, FormButton, LayoutHeader } from "@/common/common-ui" と
 *   1行で必要なコンポーネントを全て取得できるのが理想的。
 * ============================================================
 */

// プリミティブコンポーネント
export * from "./ui-base";

// 入力系コンポーネント
export * from "./ui-forms";

// フィードバック系コンポーネント
export * from "./ui-feedback";

// レイアウトコンポーネント
export * from "./ui-layout";

// 画像コンポーネント
export * from "./ui-image";

// その他の個別コンポーネント
export { default as CustomScrollView } from "./ui-scroll/ScrollViewComponent";

// レガシーコンポーネント（Common）- 後方互換性のため
// 将来的には新しい場所に移行する予定
// export * from "./Common"; // 移行済みまたは削除されたため、コメントアウト
