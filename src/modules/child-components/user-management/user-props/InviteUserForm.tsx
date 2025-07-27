import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import Input from "@/common/common-ui/ui-forms/FormInput";
import Button from "@/common/common-ui/ui-forms/FormButton";
import ErrorMessage from "@/common/common-ui/ui-feedback/FeedbackError";
import { styles } from "./UserForm.styles";
import {
  MultiStoreService,
  StoreInfo,
} from "@/services/firebase/firebase-multistore";
import { useAuth } from "@/services/auth/useAuth";

interface InviteUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * 他店舗ユーザー招待フォームコンポーネント
 * 既存ユーザーを他の店舗に招待する機能を提供
 */
export const InviteUserForm: React.FC<InviteUserFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { user: currentUser } = useAuth();
  const { width } = useWindowDimensions();
  const [userEmail, setUserEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<"master" | "user">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableStores, setAvailableStores] = useState<StoreInfo[]>([]);

  // レスポンシブ設定
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  useEffect(() => {
    // 利用可能な店舗一覧を取得
    const fetchStores = async () => {
      try {
        const stores = await MultiStoreService.getAllStores();
        setAvailableStores(stores);
      } catch (error) {
      }
    };

    fetchStores();
  }, []);

  const handleInvite = async () => {
    setError(null);

    // バリデーション
    if (!userEmail.trim()) {
      setError("招待するユーザーのメールアドレスを入力してください");
      return;
    }

    if (!nickname.trim()) {
      setError("ニックネームを入力してください");
      return;
    }

    if (!currentUser?.uid || !currentUser?.storeId) {
      setError("現在のユーザー情報が取得できません");
      return;
    }

    try {
      setLoading(true);
      await MultiStoreService.inviteUserToStore(
        currentUser.uid,
        currentUser.storeId,
        userEmail.trim(),
        nickname.trim(),
        role
      );

      Alert.alert(
        "招待完了",
        `${userEmail} を教室${currentUser.storeId}に${
          role === "master" ? "管理者" : "講師"
        }として招待しました。`,
        [
          {
            text: "OK",
            onPress: () => {
              setUserEmail("");
              setNickname("");
              setRole("user");
              onSuccess();
            },
          },
        ]
      );
    } catch (error: any) {
      setError(error.message || "招待に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.container,
        isDesktop && styles.containerDesktop,
        isTablet && !isDesktop && styles.containerTablet,
      ]}
    >
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>他店舗ユーザー招待</Text>
        <Text style={styles.formDescription}>
          既に他の教室に登録済みのユーザーを、現在の教室に招待します。
        </Text>

        {error && <ErrorMessage message={error} />}

        {/* メールアドレス入力 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>メールアドレス</Text>
          <Input
            placeholder="招待するユーザーのメールアドレス"
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={styles.inputHelper}>
            招待したいユーザーが他の教室で使用しているメールアドレスを入力してください
          </Text>
        </View>

        {/* ニックネーム入力 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>この教室でのニックネーム</Text>
          <Input
            placeholder="この教室でのニックネーム"
            value={nickname}
            onChangeText={setNickname}
            style={styles.input}
          />
          <Text style={styles.inputHelper}>
            このユーザーが現在の教室で表示される名前です
          </Text>
        </View>

        {/* ロール選択 */}
        <View style={styles.inputContainer}>
          <Text style={styles.roleLabel}>権限</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "user" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("user")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === "user" && styles.roleButtonActiveText,
                ]}
              >
                講師
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                styles.masterRoleButton,
                role === "master" && styles.roleButtonActive,
              ]}
              onPress={() => setRole("master")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  styles.masterRoleButtonText,
                  role === "master" && styles.roleButtonActiveText,
                ]}
              >
                管理者
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ボタン */}
        <View style={styles.buttonContainer}>
          <Button
            title="キャンセル"
            onPress={onCancel}
            variant="outline"
            style={[styles.button, { flex: 1 }]}
            disabled={loading}
          />
          <Button
            title={loading ? "招待中..." : "招待"}
            onPress={handleInvite}
            style={[styles.button, { flex: 1 }]}
            disabled={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};
