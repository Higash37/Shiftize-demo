import { Alert } from "react-native";
import { GroupCreationForm, StoreIdState } from "./types";

export const useFormValidation = () => {
  const validateForm = (form: GroupCreationForm, storeId: StoreIdState) => {
    if (!form.groupName.trim()) {
      Alert.alert("エラー", "グループ名を入力してください");
      return false;
    }
    if (!form.adminNickname.trim()) {
      Alert.alert("エラー", "管理者ニックネームを入力してください");
      return false;
    }
    if (!form.adminPassword) {
      Alert.alert("エラー", "パスワードを入力してください");
      return false;
    }
    if (form.adminPassword.length < 6) {
      Alert.alert("エラー", "パスワードは6文字以上で入力してください");
      return false;
    }
    if (form.adminPassword !== form.confirmPassword) {
      Alert.alert("エラー", "パスワードが一致しません");
      return false;
    }
    if (storeId.isCustomStoreId && storeId.storeIdError) {
      Alert.alert("エラー", "店舗IDを正しく設定してください");
      return false;
    }

    return true;
  };

  return { validateForm };
};