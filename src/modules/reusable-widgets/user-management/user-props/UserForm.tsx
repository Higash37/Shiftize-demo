import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Input from "@/common/common-ui/ui-forms/FormInput";
import Button from "@/common/common-ui/ui-forms/FormButton";
import ErrorMessage from "@/common/common-ui/ui-feedback/FeedbackError";
import { checkMasterExists } from "@/services/firebase/firebase-user";
import { styles } from "./UserForm.styles";
import { UserFormProps } from "../user-types/components";
import ColorPicker from "@/common/common-ui/ui-forms/FormColorPicker";
import { PRESET_COLORS } from "@/common/common-ui/ui-forms/FormColorPicker.constants";
import { useAuth } from "@/services/auth/useAuth";

/**
 * ユーザー情報入力フォームコンポーネント
 * 新規ユーザー追加と既存ユーザー編集の両方に対応
 */
export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  error,
  loading = false,
  initialData,
  mode = "add",
  currentPassword,
}) => {
  const { user: currentUser } = useAuth(); // 現在のユーザー情報を取得
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState(initialData?.email || ""); // メールアドレス（任意）
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState(initialData?.nickname ?? "");
  const [role, setRole] = useState<"master" | "user">(
    initialData?.role || "user",
  );
  const [errorMessage, setError] = useState<string | null>(null);
  const [hasMaster, setHasMaster] = useState(false);
  const [color, setColor] = useState<string>(
    () => initialData?.color ?? PRESET_COLORS[0] ?? "#4A90E2",
  );
  const [hourlyWage, setHourlyWage] = useState<string>(
    initialData?.hourlyWage?.toString() || "",
  );
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  // レスポンシブ設定
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const isMasterEdit = mode === "edit" && initialData?.role === "master";
  // マスターユーザーの存在チェック
  useEffect(() => {
    const checkForMasterUser = async () => {
      try {
        const hasMasterUser = await checkMasterExists();
        setHasMaster(hasMasterUser);
      } catch (err) {}
    };

    if (mode === "add") {
      checkForMasterUser();
    }
  }, [mode]);
  // 初期データが変更された時の更新
  useEffect(() => {
    if (initialData) {
      setEmail(initialData.email || "");
      setNickname(initialData.nickname ?? "");
      setRole(initialData.role);
      setPassword("");
      if (initialData.color) {
        setColor(initialData.color);
      } else {
        setColor(PRESET_COLORS[0] ?? "#4A90E2");
      }
      setHourlyWage(initialData.hourlyWage?.toString() || "");
    }
  }, [initialData]);

  const handleSubmit = async () => {
    // パスワードのバリデーション
    if (mode === "add" || password) {
      if (!password || password.length < 6) {
        setError("パスワードは6文字以上で入力してください");
        return;
      }
    }

    if (!nickname) {
      setError("ニックネームを入力してください");
      return;
    }

    // 現在のユーザーのstoreIdが設定されているかチェック
    if (!currentUser?.storeId) {
      setError("店舗IDが設定されていません");
      return;
    }

    // メールアドレスのバリデーション（入力されている場合のみ）
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    try {
      setError(null);

      // メールアドレスを安全に生成（Unicodeの文字/数字は維持）
      const sanitizeForEmail = (str: string) =>
        str
          .normalize("NFKC")
          .replace(/\s+/g, "")
          .replace(/[^\p{L}\p{N}]/gu, "")
          .toLowerCase();
      const autoEmail =
        email ||
        `${sanitizeForEmail(currentUser.storeId || "store")}${sanitizeForEmail(
          nickname,
        )}@example.com`;

      const formData: any = {
        email: autoEmail,
        password: password || "defaultPassword123",
        nickname,
        role: isMasterEdit ? "master" : role,
        storeId: currentUser.storeId || "", // 現在のユーザーのstoreIdを自動設定
        hourlyWage: hourlyWage ? parseFloat(hourlyWage) : 1000,
      };

      if (color) {
        formData.color = color;
      }

      await onSubmit(formData);

      if (mode === "add") {
        setEmail("");
        setPassword("");
        setNickname("");
        setRole("user");
        setColor(PRESET_COLORS[0] ?? "#4A90E2");
      }
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    }
  };

  return (
    <View
      style={[
        styles.container,
        isTablet && styles.containerTablet,
        isDesktop && styles.containerDesktop,
      ]}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContent}
      >
        {/* 警告メッセージ（新規追加時のみ表示） */}
        {mode === "add" && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              追加後ログイン画面に戻ります。申し訳ございません。
            </Text>
          </View>
        )}

        <Input
          label="ニックネーム"
          value={nickname}
          onChangeText={setNickname}
          placeholder="山田 太郎"
          error={!nickname ? "ニックネームを入力してください" : ""}
        />

        <Input
          label="メールアドレス（任意）"
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={
            email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              ? "有効なメールアドレスを入力してください"
              : ""
          }
        />

        {!email && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              メールアドレスを入力しない場合、安全な形式で自動生成されます
            </Text>
          </View>
        )}

        <Input
          label="時給（円）"
          value={hourlyWage}
          onChangeText={(text) => {
            // 数字のみ許可
            const numericValue = text.replace(/[^0-9]/g, "");
            setHourlyWage(numericValue);
          }}
          placeholder="1000"
          keyboardType="numeric"
        />

        {/* 講師色選択セクション */}
        <View style={styles.colorSection}>
          <Text style={styles.colorLabel}>カラー</Text>
          <View style={styles.colorContainer}>
            <TouchableOpacity
              style={[styles.colorPreview, { backgroundColor: color }]}
              onPress={() => setColorPickerVisible(true)}
            />
            <Button
              title="色を選択"
              onPress={() => setColorPickerVisible(true)}
              variant="outline"
              size="small"
              style={styles.colorButton}
            />
          </View>
        </View>

        <Input
          label={
            mode === "edit"
              ? "新しいパスワード（変更する場合のみ）"
              : "パスワード（6文字以上）"
          }
          value={password}
          onChangeText={setPassword}
          placeholder="新しいパスワードを入力"
          secureTextEntry
          error={
            mode === "add" && (!password || password.length < 6)
              ? "パスワードは6文字以上で入力してください"
              : ""
          }
        />

        {!isMasterEdit && (
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>ユーザー権限</Text>
            <View style={styles.roleContainer}>
              <Button
                title="一般ユーザー"
                onPress={() => setRole("user")}
                variant={role === "user" ? "primary" : "outline"}
                style={styles.roleButton}
              />
              <Button
                title="マスター"
                onPress={() => setRole("master")}
                variant={role === "master" ? "secondary" : "outline"}
                style={[
                  styles.roleButton,
                  role === "master" && styles.masterRoleButton,
                ]}
                disabled={hasMaster && role !== "master"}
              />
            </View>
            {hasMaster && role !== "master" && (
              <Text style={styles.roleDisabledText}>
                マスターユーザーは既に存在します
              </Text>
            )}
          </View>
        )}

        {errorMessage && <ErrorMessage message={errorMessage} />}
      </ScrollView>

      {/* ボタンを固定位置に配置 */}
      <View
        style={[
          styles.buttonContainer,
          isTablet && styles.buttonContainerTablet,
          isDesktop && styles.buttonContainerDesktop,
        ]}
      >
        <Button
          title="キャンセル"
          onPress={onCancel}
          variant="outline"
          size={isTablet ? "medium" : "small"}
          style={[
            styles.button,
            isTablet && styles.buttonTablet,
            isDesktop && styles.buttonDesktop,
          ]}
        />
        <Button
          title={mode === "edit" ? "更新" : "追加"}
          onPress={handleSubmit}
          loading={loading}
          disabled={
            !nickname ||
            (!password && mode === "add") ||
            (role === "master" && hasMaster && role !== initialData?.role)
          }
          size={isTablet ? "medium" : "small"}
          style={[
            styles.button,
            isTablet && styles.buttonTablet,
            isDesktop && styles.buttonDesktop,
          ]}
        />
      </View>

      {colorPickerVisible && (
        <ColorPicker
          visible={colorPickerVisible}
          onClose={() => setColorPickerVisible(false)}
          onSelectColor={(c) => setColor(c)}
          initialColor={color}
        />
      )}
    </View>
  );
};
