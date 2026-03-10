/**
 * @file StyleHelpers.ts
 * @description UI関連のスタイルユーティリティ関数。
 *              影の生成、色調整といった汎用的なスタイル操作を提供する。
 *
 * 【このファイルの位置づけ】
 * - ShadowConstants.ts からシャドウ定数を取得して、elevated UI を作成する
 * - 各コンポーネントのスタイル定義で使用される
 * - 関連ファイル: ShadowConstants.ts（影の定義）
 */
import { shadows } from "../../common-constants/ShadowConstants";

/**
 * getPlatformShadow - プラットフォーム固有のシャドウスタイルを生成する
 *
 * elevation（高さ）の値に応じて、適切な強さの影を返す。
 * Material Design のエレベーション概念に基づく。
 *
 * 【elevation の目安】
 * - 1-2:  カードやリスト項目（軽い浮き上がり）
 * - 3-6:  ダイアログやFAB（中程度の浮き上がり）
 * - 7-10: モーダルやドロワー（強い浮き上がり）
 * - 11+:  最も高いエレベーション
 *
 * @param elevation - 影の強さ（数値。大きいほど強い影）
 * @returns プラットフォームに適したシャドウスタイルオブジェクト
 */
export const getPlatformShadow = (elevation: number = 2) => {
  if (elevation <= 2) return shadows.small;
  if (elevation <= 6) return shadows.medium;
  if (elevation <= 10) return shadows.large;
  return shadows.xlarge;
};

/**
 * adjustColor - HEX色コードの明度を調整する
 *
 * 【処理の詳細ステップ】
 * 1. "#" プレフィックスがあれば除去
 * 2. 16進数文字列を整数に変換
 * 3. ビットシフトでR, G, B各チャネルを分離
 * 4. amount × 255 を加算して明度を調整
 * 5. 0-255の範囲にクランプ（制限）
 * 6. R, G, Bを結合して16進数文字列に戻す
 *
 * 【ビットシフト演算の解説】
 * HEX色 "#FF8040" は内部的に 16744512 という整数。
 * - `num >> 16` → 上位8ビット（R）を取得。FF8040 >> 16 = FF = 255
 * - `(num >> 8) & 0x00FF` → 中間8ビット（G）を取得。FF8040 >> 8 = FF80 & 00FF = 80 = 128
 * - `num & 0x0000FF` → 下位8ビット（B）を取得。FF8040 & 0000FF = 40 = 64
 *
 * 【& (AND演算) の意味】
 * ビット単位のAND。特定のビットだけを残す（マスク処理）。
 * 0x00FF は下位8ビットだけを残すマスク。
 *
 * 【<< (左シフト) の意味】
 * ビットを左に移動する。
 * - `r << 16` → Rの値を上位8ビットの位置に移動
 * - `g << 8` → Gの値を中間8ビットの位置に移動
 * - `| (OR)` → 3つの値を結合して1つの整数にする
 *
 * @param color - HEX形式の色コード（"#FF0000" または "FF0000"）
 * @param amount - 調整量（-1.0～1.0）。正で明るく、負で暗く
 * @returns 調整後のHEX色コード
 * @throws TypeError 無効な色コードの場合
 */
export const adjustColor = (color: string, amount: number): string => {
  let usePound = false;

  // "#" プレフィックスの処理
  if (color.startsWith("#")) {
    color = color.slice(1); // "#" を除去
    usePound = true;
  }

  // 16進数文字列を整数に変換
  // Number.parseInt(color, 16) → "FF8040" → 16744512
  const num = Number.parseInt(color, 16);
  if (Number.isNaN(num)) {
    throw new TypeError("Invalid color format. Expected HEX color code.");
  }

  // R, G, B 各チャネルを分離して明度を調整
  let r = (num >> 16) + amount * 255;         // 赤チャネル
  let g = ((num >> 8) & 0x00ff) + amount * 255; // 緑チャネル
  let b = (num & 0x0000ff) + amount * 255;    // 青チャネル

  // 0-255の範囲にクランプ（値を範囲内に収める）
  // Math.min(255, Math.max(0, x)) → x が0未満なら0、255超なら255
  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));

  // R, G, B をビットシフトで結合して16進数文字列に変換
  // padStart(6, "0") → "FF40" → "00FF40"（6桁になるよう先頭に0を追加）
  const newColor = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

  // 元の色に "#" があった場合は "#" を付けて返す
  return (usePound ? "#" : "") + newColor;
};
