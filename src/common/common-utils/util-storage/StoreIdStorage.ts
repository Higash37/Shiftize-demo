import AsyncStorage from "@react-native-async-storage/async-storage";

const STORE_ID_KEY = "last_store_id";

/**
 * 店舗IDのストレージ管理ユーティリティ
 *
 * AsyncStorageを使用して店舗IDを永続化します。
 * React Native環境でのみ動作します。
 */
export const StoreIdStorage = {
  /**
   * 店舗IDを保存
   *
   * @param storeId - 保存する店舗ID
   * @throws AsyncStorageのエラーが発生した場合
   */
  saveStoreId: async (storeId: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORE_ID_KEY, storeId);
    } catch (err) {
      // ⚠️ AsyncStorage保存エラー: ストレージ容量不足、権限エラー、またはデバイスストレージエラーの可能性があります
      if (__DEV__) {
        console.error("Failed to save store ID:", err);
      }
      throw err;
    }
  },

  /**
   * 保存された店舗IDを取得
   *
   * @returns 保存された店舗ID、または存在しない場合はnull
   */
  getStoreId: async (): Promise<string | null> => {
    try {
      const storeId = await AsyncStorage.getItem(STORE_ID_KEY);
      return storeId;
    } catch (err) {
      // ⚠️ AsyncStorage取得エラー: ストレージアクセスエラーまたはデータ破損の可能性があります
      if (__DEV__) {
        console.error("Failed to get store ID:", err);
      }
      return null;
    }
  },

  /**
   * 保存された店舗IDを削除
   *
   * @throws AsyncStorageのエラーが発生した場合
   */
  clearStoreId: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORE_ID_KEY);
    } catch (err) {
      // ⚠️ AsyncStorage削除エラー: ストレージアクセスエラーまたはデータ不存在エラーの可能性があります
      if (__DEV__) {
        console.error("Failed to clear store ID:", err);
      }
      throw err;
    }
  },
};
