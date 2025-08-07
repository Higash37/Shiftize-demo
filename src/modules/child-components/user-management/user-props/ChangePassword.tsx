import React, { useState } from "react";
import { View, Text } from "react-native";
import Input from "@/common/common-ui/ui-forms/FormInput";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { changePassword } from "@/services/firebase/firebase";
import { useRouter } from "expo-router";
import { styles } from "./ChangePassword.styles";
import { ChangePasswordProps } from "../user-types/components";

/**
 * パスワード変更コンポーネント
 * ユーザー自身のパスワードを変更するためのインターフェース
 */
const ChangePassword: React.FC<ChangePasswordProps> = ({
  userId,
  onComplete,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validatePasswords = () => {
    if (!currentPassword) {
      setMessage("現在のパスワードを入力してください");
      return false;
    }
    if (!newPassword) {
      setMessage("新しいパスワードを入力してください");
      return false;
    }
    if (newPassword.length < 6) {
      setMessage("パスワードは6文字以上で入力してください");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setMessage("新しいパスワードと確認用パスワードが一致しません");
      return false;
    }
    return true;
  };
  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    try {
      // サービスを使用してパスワードを変更
      await changePassword(currentPassword, newPassword);

      setMessage("パスワードが正常に更新されました");
      setIsSuccess(true);

      // フォームをリセット
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // 完了コールバックがあれば実行
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (error: any) {
      setIsSuccess(false);
      // サービスからのエラーメッセージをそのまま使用
      setMessage(error.message || "パスワード変更中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>パスワード変更</Text>

      <Input
        label="現在のパスワード"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="現在のパスワードを入力"
        secureTextEntry
      />

      <Input
        label="新しいパスワード"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="新しいパスワードを入力（6文字以上）"
        secureTextEntry
      />

      <Input
        label="新しいパスワード（確認）"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="新しいパスワードを再入力"
        secureTextEntry
      />

      {message ? (
        <Text
          style={[
            styles.message,
            isSuccess ? styles.successMessage : styles.errorMessage,
          ]}
        >
          {message}
        </Text>
      ) : null}

      <View style={styles.buttonContainer}>
        <Button
          title="パスワードを変更"
          onPress={handleChangePassword}
          loading={isLoading}
          disabled={isLoading}
        />
        <Button
          title="キャンセル"
          onPress={onComplete || (() => {})}
          disabled={isLoading}
          style={{ marginTop: 8 }}
          variant="secondary"
        />
      </View>
    </View>
  );
};

export default ChangePassword;
