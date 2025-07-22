import AsyncStorage from "@react-native-async-storage/async-storage";

const STORE_ID_KEY = "last_store_id";

export const StoreIdStorage = {
  /**
   * 店舗IDを保存
   */
  saveStoreId: async (storeId: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORE_ID_KEY, storeId);
    } catch (error) {
      // Error saving store ID
    }
  },

  /**
   * 保存された店舗IDを取得
   */
  getStoreId: async (): Promise<string | null> => {
    try {
      const storeId = await AsyncStorage.getItem(STORE_ID_KEY);
      return storeId;
    } catch (error) {
      return null;
    }
  },

  /**
   * 保存された店舗IDを削除
   */
  clearStoreId: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORE_ID_KEY);
    } catch (error) {
      // Error clearing store ID
    }
  },
};
