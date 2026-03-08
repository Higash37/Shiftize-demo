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
import type { UserRole } from "@/common/common-models/model-user/UserModel";
import { ServiceProvider } from "@/services/ServiceProvider";
import { styles } from "./UserForm.styles";
import { UserFormProps } from "../user-types/components";
import ColorPicker from "@/common/common-ui/ui-forms/FormColorPicker";
import { PRESET_COLORS } from "@/common/common-ui/ui-forms/FormColorPicker.constants";
import { useAuth } from "@/services/auth/useAuth";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

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
  const { user: currentUser } = useAuth();
  const theme = useMD3Theme();
  const { width } = useWindowDimensions();
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState(initialData?.nickname ?? "");
  const [furigana, setFurigana] = useState(initialData?.furigana ?? "");
  const [role, setRole] = useState<UserRole>(
    initialData?.role || "user",
  );
  const [errorMessage, setError] = useState<string | null>(null);
  const [hasMaster, setHasMaster] = useState(false);
  const [color, setColor] = useState<string>(
    () => initialData?.color ?? PRESET_COLORS[0] ?? "#4A90E2",
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
        const hasMasterUser = await ServiceProvider.users.checkMasterExists(currentUser?.storeId);
        setHasMaster(hasMasterUser);
      } catch (err) {
        console.warn("マスターユーザーの存在チェックに失敗しました:", err);
      }
    };

    if (mode === "add") {
      checkForMasterUser();
    }
  }, [mode, currentUser?.storeId]);
  // 初期データが変更された時の更新
  useEffect(() => {
    if (initialData) {
      setNickname(initialData.nickname ?? "");
      setFurigana(initialData.furigana ?? "");
      setRole(initialData.role);
      setPassword("");
      if (initialData.color) {
        setColor(initialData.color);
      } else {
        setColor(PRESET_COLORS[0] ?? "#4A90E2");
      }
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

    if (furigana && !/^[\u3040-\u309F\s\u3000]*$/.test(furigana)) {
      setError("ふりがなはひらがなのみで入力してください");
      return;
    }

    // 現在のユーザーのstoreIdが設定されているかチェック
    if (!currentUser?.storeId) {
      setError("店舗IDが設定されていません");
      return;
    }

    try {
      setError(null);

      // メールアドレスを安全に自動生成（Unicodeの文字/数字は維持）
      const sanitizeForEmail = (str: string) =>
        str
          .normalize("NFKC")
          .replace(/\s+/g, "")
          .replace(/[^\p{L}\p{N}]/gu, "")
          .toLowerCase();
      const autoEmail = `${sanitizeForEmail(currentUser.storeId || "store")}${sanitizeForEmail(
        nickname,
      )}@example.com`;

      const formData: any = {
        email: autoEmail,
        password: password || "defaultPassword123",
        nickname,
        furigana: furigana.trim(),
        role: isMasterEdit ? "master" : role,
        storeId: currentUser.storeId || "",
        hourlyWage: 1000,
      };

      if (color) {
        formData.color = color;
      }

      await onSubmit(formData);

      if (mode === "add") {
        setPassword("");
        setNickname("");
        setFurigana("");
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

        <View style={styles.roleSection}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
            <MaterialIcons name="shield" size={14} color={theme.colorScheme.onSurfaceVariant} />
            <Text style={styles.roleLabel}>ユーザー権限</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
            <TouchableOpacity
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: color,
                borderWidth: 2,
                borderColor: theme.colorScheme.outlineVariant,
              }}
              onPress={() => setColorPickerVisible(true)}
            />
            {!isMasterEdit ? (
              <View style={{
                flex: 1,
                flexDirection: "row",
                borderRadius: theme.shape.small,
                borderWidth: 1,
                borderColor: theme.colorScheme.outlineVariant,
                overflow: "hidden",
              }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                    alignItems: "center",
                    backgroundColor: role === "user" ? theme.colorScheme.primaryContainer : "transparent",
                  }}
                  onPress={() => setRole("user")}
                >
                  <Text style={{
                    ...theme.typography.labelMedium,
                    color: role === "user" ? theme.colorScheme.onPrimaryContainer : theme.colorScheme.onSurfaceVariant,
                  }}>一般ユーザー</Text>
                </TouchableOpacity>
                <View style={{ width: 1, backgroundColor: theme.colorScheme.outlineVariant }} />
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                    alignItems: "center",
                    backgroundColor: role === "master" ? theme.colorScheme.secondaryContainer : "transparent",
                    opacity: hasMaster && role !== "master" ? 0.38 : 1,
                  }}
                  onPress={() => setRole("master")}
                  disabled={hasMaster && role !== "master"}
                >
                  <Text style={{
                    ...theme.typography.labelMedium,
                    color: role === "master" ? theme.colorScheme.onSecondaryContainer : theme.colorScheme.onSurfaceVariant,
                  }}>マスター</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={{ ...theme.typography.labelMedium, color: theme.colorScheme.onSurfaceVariant }}>マスター</Text>
            )}
          </View>
          {!isMasterEdit && hasMaster && role !== "master" && (
            <Text style={styles.roleDisabledText}>
              マスターユーザーは既に存在します
            </Text>
          )}
        </View>

        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
            <MaterialIcons name="person" size={14} color={theme.colorScheme.onSurfaceVariant} />
            <Text style={{ ...theme.typography.bodySmall, color: theme.colorScheme.onSurfaceVariant }}>ニックネーム</Text>
          </View>
          <Input
            value={nickname}
            onChangeText={setNickname}
            placeholder="山田 太郎"
            error={!nickname ? "ニックネームを入力してください" : ""}
          />
        </View>

        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: theme.colorScheme.onSurfaceVariant, width: 14, textAlign: "center" }}>あ</Text>
            <Text style={{ ...theme.typography.bodySmall, color: theme.colorScheme.onSurfaceVariant }}>ふりがな</Text>
          </View>
          <Input
            value={furigana}
            onChangeText={setFurigana}
            placeholder="やまだ たろう"
            placeholderTextColor="#ccc"
          />
        </View>

        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
            <MaterialIcons name="lock" size={14} color={theme.colorScheme.onSurfaceVariant} />
            <Text style={{ ...theme.typography.bodySmall, color: theme.colorScheme.onSurfaceVariant }}>
              {mode === "edit" ? "新しいパスワード（変更する場合のみ）" : "パスワード（6文字以上）"}
            </Text>
          </View>
          <Input
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
        </View>

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
