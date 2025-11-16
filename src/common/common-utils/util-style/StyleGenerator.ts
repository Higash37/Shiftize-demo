/**
 * UI関連のユーティリティ関数
 */
import { shadows } from "../../common-constants/ShadowConstants";

/**
 * プラットフォーム固有のシャドウスタイルを生成するヘルパー関数
 *
 * @param elevation - 影の強さ（小さい値：1-2、中程度：3-6、大きい値：7以上）
 * @returns プラットフォームに適したシャドウスタイル
 */
export const getPlatformShadow = (elevation: number = 2) => {
  if (elevation <= 2) return shadows.small;
  if (elevation <= 6) return shadows.medium;
  if (elevation <= 10) return shadows.large;
  return shadows.xlarge;
};

/**
 * 色の濃さを調整する
 *
 * ⚠️ 注意: この関数は簡易的な色調整を行います。
 * より正確な色調整が必要な場合は、HSLやLAB色空間を使用することを推奨します。
 *
 * @param color - HEX形式の色コード（例: "#FF0000" または "FF0000"）
 * @param amount - 調整量（-1.0〜1.0）、正の値で明るく、負の値で暗く
 * @returns 調整後のHEX色コード
 * @throws TypeError 無効な色コード形式の場合
 */
export const adjustColor = (color: string, amount: number): string => {
  let usePound = false;

  if (color.startsWith("#")) {
    color = color.slice(1);
    usePound = true;
  }

  // ⚠️ 無効な色コード: HEX形式（6桁の16進数）でない場合、予期しない結果になる可能性があります
  const num = Number.parseInt(color, 16);
  if (Number.isNaN(num)) {
    throw new TypeError("Invalid color format. Expected HEX color code.");
  }

  let r = (num >> 16) + amount * 255;
  let g = ((num >> 8) & 0x00ff) + amount * 255;
  let b = (num & 0x0000ff) + amount * 255;

  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));

  const newColor = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

  return (usePound ? "#" : "") + newColor;
};
