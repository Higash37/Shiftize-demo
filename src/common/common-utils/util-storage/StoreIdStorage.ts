/**
 * @file StoreIdStorage.ts
 * @description 店舗IDの永続化ストレージユーティリティ。
 *              AsyncStorageを使って最後にアクセスした店舗IDをデバイスに保存する。
 *
 * 【このファイルの位置づけ】
 * - ユーザーが最後にアクセスした店舗IDを記憶し、次回起動時に自動選択するために使用
 * - ログイン時やストア切り替え時に呼び出される
 * - 関連ファイル: useAuth.ts（認証フック）, ServiceProvider.ts（サービス層）
 *
 * 【AsyncStorage とは】
 * React Nativeの永続化ストレージ。キーと値（文字列）のペアを保存できる。
 * Web環境の localStorage に相当するが、非同期API（async/await）で操作する。
 * アプリを閉じても、再インストールしない限りデータは保持される。
 *
 * 【なぜ AsyncStorage を使うのか】
 * React Nativeでは localStorage が使えないため、
 * @react-native-async-storage/async-storage を使用する。
 * 暗号化は不要な非機密データ（店舗ID）の保存に適している。
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

/** AsyncStorageのキー名。定数にすることでタイプミスを防ぐ */
const STORE_ID_KEY = "last_store_id";

/**
 * StoreIdStorage - 店舗IDの保存・取得・削除を行うユーティリティオブジェクト
 *
 * 【オブジェクトリテラル形式の理由】
 * クラスではなくオブジェクトリテラルとして定義している。
 * インスタンス化が不要（状態を持たない）で、
 * StoreIdStorage.saveStoreId() のように直接呼び出せる。
 */
export const StoreIdStorage = {
  /**
   * saveStoreId - 店舗IDを AsyncStorage に保存する
   *
   * @param storeId - 保存する店舗ID
   * @throws AsyncStorageのエラー（ストレージ容量不足等）
   */
  saveStoreId: async (storeId: string): Promise<void> => {
    try {
      // AsyncStorage.setItem → キーと値のペアを保存
      await AsyncStorage.setItem(STORE_ID_KEY, storeId);
    } catch (err) {
      // __DEV__ → 開発環境フラグ。本番環境ではログを出力しない
      if (__DEV__) {
        console.error("Failed to save store ID:", err);
      }
      throw err; // 呼び出し元にエラーを伝播
    }
  },

  /**
   * getStoreId - 保存された店舗IDを AsyncStorage から取得する
   *
   * 【戻り値: string | null】
   * - string: 保存されていた店舗ID
   * - null: 保存されていない（初回起動時等）、またはエラー発生時
   *
   * @returns 保存された店舗ID、または null
   */
  getStoreId: async (): Promise<string | null> => {
    try {
      // AsyncStorage.getItem → キーに対応する値を取得。存在しなければ null
      const storeId = await AsyncStorage.getItem(STORE_ID_KEY);
      return storeId;
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to get store ID:", err);
      }
      return null; // エラー時は null を返す（アプリを止めない）
    }
  },

  /**
   * clearStoreId - 保存された店舗IDを AsyncStorage から削除する
   *
   * ログアウト時やストア切り替え時に呼び出す。
   *
   * @throws AsyncStorageのエラー
   */
  clearStoreId: async (): Promise<void> => {
    try {
      // AsyncStorage.removeItem → 指定キーのデータを削除
      await AsyncStorage.removeItem(STORE_ID_KEY);
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to clear store ID:", err);
      }
      throw err;
    }
  },
};
