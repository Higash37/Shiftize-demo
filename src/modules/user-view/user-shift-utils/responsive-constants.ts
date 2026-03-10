/**
 * @file responsive-constants.ts
 * @description レスポンシブデザイン定数の再エクスポートファイル（非推奨）。
 *   以前はこのファイルに IS_TABLET や IS_SMALL_DEVICE などの定数があったが、
 *   共通ユーティリティに移行済み。互換性のために残っている。
 */

/*
【このファイルの位置づけ】
  ★このファイル → @/common/common-utils/util-style/responsive へ転送
  新規コードでは直接 `import { IS_TABLET } from '@/common/common-utils/util-style'` を使う。
*/

// このファイルは共通responsive.tsへ移行されました
// 今後はimport { IS_TABLET, IS_SMALL_DEVICE, ... } from '@/common/common-utils/util-style' を利用してください

// `export *` で移行先の全エクスポートをそのまま再公開し、旧importパスとの互換性を保つ
export * from "@/common/common-utils/util-style/responsive";
