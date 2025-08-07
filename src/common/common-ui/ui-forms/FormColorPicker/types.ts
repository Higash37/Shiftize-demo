/**
 * カラーピッカーコンポーネントの型定義
 */
export interface ColorPickerProps {
  /**
   * モーダルの表示状態
   */
  visible: boolean;

  /**
   * モーダルを閉じる時のコールバック
   */
  onClose: () => void;

  /**
   * 色選択時のコールバック
   * @param color 選択された色のHEXコード
   */
  onSelectColor: (color: string) => void;

  /**
   * 初期選択色
   */
  initialColor?: string;
}
