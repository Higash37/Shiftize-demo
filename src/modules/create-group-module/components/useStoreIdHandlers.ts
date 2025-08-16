import { Alert } from "react-native";
import { GroupService } from "@/services/firebase/firebase-group";
import { StoreIdState } from "./types";

export const useStoreIdHandlers = (
  setStoreId: React.Dispatch<React.SetStateAction<StoreIdState>>
) => {
  const generateStoreId = async (): Promise<void> => {
    try {
      const storeIdValue = await GroupService.generateUniqueStoreId();
      setStoreId(prev => ({ ...prev, generatedStoreId: storeIdValue }));
    } catch (error) {
      const fallbackId = Math.floor(1000 + Math.random() * 9000).toString();
      setStoreId(prev => ({ ...prev, generatedStoreId: fallbackId }));
    }
  };

  const checkCustomStoreId = async (storeIdValue: string) => {
    if (storeIdValue.length !== 4 || !/^\d{4}$/.test(storeIdValue)) {
      setStoreId(prev => ({
        ...prev,
        storeIdError: "店舗IDは4桁の数字で入力してください",
      }));
      return;
    }

    setStoreId(prev => ({
      ...prev,
      storeIdCheckLoading: true,
      storeIdError: "",
    }));

    try {
      const exists = await GroupService.checkStoreIdExists(storeIdValue);
      setStoreId(prev => ({
        ...prev,
        storeIdCheckLoading: false,
        storeIdError: exists ? "この店舗IDは既に使用されています" : "",
      }));
    } catch (error) {
      setStoreId(prev => ({
        ...prev,
        storeIdCheckLoading: false,
        storeIdError: "店舗IDの確認に失敗しました",
      }));
    }
  };

  return {
    generateStoreId,
    checkCustomStoreId,
  };
};