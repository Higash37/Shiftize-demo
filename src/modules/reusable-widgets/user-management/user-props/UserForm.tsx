import React, { useState, useEffect, useCallback, useMemo } from "react";
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
 * 
 * Features:
 * - Enhanced input validation and sanitization
 * - Type-safe form handling
 * - Consistent error management
 * - Production-ready security measures
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
  // Enhanced state management with better type safety
  const [email, setEmail] = useState<string>(initialData?.email ?? "");
  const [password, setPassword] = useState<string>("");
  const [nickname, setNickname] = useState<string>(initialData?.nickname ?? "");
  const [role, setRole] = useState<"master" | "user">(
    initialData?.role ?? "user"
  );
  const [errorMessage, setError] = useState<string | null>(null);
  const [hasMaster, setHasMaster] = useState<boolean>(false);
  const [color, setColor] = useState<string>(initialData?.color ?? PRESET_COLORS[0]);
  const [hourlyWage, setHourlyWage] = useState<string>(
    UserFormValidator.formatHourlyWage(initialData?.hourlyWage)
  );
  const [colorPickerVisible, setColorPickerVisible] = useState<boolean>(false);

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
      } catch (err) {
      }
    };

    if (mode === "add") {
      checkForMasterUser();
    }
  }, [mode]);
  // Memoized validation results
  const formValidation = useMemo(() => {
    return UserFormValidator.validateForm({
      email,
      password,
      nickname,
      hourlyWage,
      mode,
      hasMaster,
      role,
      currentUserStoreId: currentUser?.storeId,
    });
  }, [email, password, nickname, hourlyWage, mode, hasMaster, role, currentUser?.storeId]);

  // 初期データが変更された時の更新
  useEffect(() => {
    if (initialData) {
      setEmail(UserFormValidator.sanitizeEmail(initialData.email));
      setNickname(UserFormValidator.sanitizeNickname(initialData.nickname));
      setRole(initialData.role ?? "user");
      setPassword("");
      setColor(initialData.color ?? PRESET_COLORS[0]);
      setHourlyWage(UserFormValidator.formatHourlyWage(initialData.hourlyWage));
    }
  }, [initialData]);

  // Enhanced submit handler with comprehensive validation
  const handleSubmit = useCallback(async () => {
    try {
      setError(null);
      
      // Comprehensive form validation
      if (!formValidation.isValid) {
        setError(formValidation.error || "入力内容を確認してください");
        return;
      }

      // Prepare form data with sanitized values
      const sanitizedData = UserFormValidator.prepareSanitizedFormData({
        email,
        password,
        nickname,
        role: isMasterEdit ? "master" as const : role,
        color,
        storeId: currentUser?.storeId ?? "",
        hourlyWage,
      });
      
      await onSubmit(sanitizedData);

      // Reset form for add mode
      if (mode === "add") {
        resetForm();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      setError(errorMessage);
    }
  }, [formValidation, email, password, nickname, role, color, currentUser?.storeId, hourlyWage, isMasterEdit, onSubmit, mode]);

  // Form reset helper
  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setNickname("");
    setRole("user");
    setColor(PRESET_COLORS[0]);
    setHourlyWage("");
  }, []);

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
          error={!nickname ? "ニックネームを入力してください" : undefined}
        />

        <Input
          label="メールアドレス（任意）"
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={email ? UserFormValidator.validateEmail(email).error : undefined}
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
            const sanitizedValue = UserFormValidator.sanitizeHourlyWage(text);
            setHourlyWage(sanitizedValue);
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
            password ? UserFormValidator.validatePassword(password, mode).error : undefined
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
          disabled={!formValidation.isValid || loading}
          size={isTablet ? "medium" : "small"}
          style={[
            styles.button,
            isTablet && styles.buttonTablet,
            isDesktop && styles.buttonDesktop,
          ]}
        />
      </View>

      <ColorPicker
        visible={colorPickerVisible}
        onClose={() => setColorPickerVisible(false)}
        onSelectColor={(c) => setColor(c)}
        initialColor={color}
      />
    </View>
  );
};

/**
 * User form validation and sanitization utility class
 */
class UserFormValidator {
  /**
   * Validate email format
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim() === "") {
      return { isValid: true }; // Email is optional
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email.trim());

    return {
      isValid,
      error: isValid ? undefined : "有効なメールアドレスを入力してください",
    };
  }

  /**
   * Validate password
   */
  static validatePassword(
    password: string,
    mode: "add" | "edit"
  ): { isValid: boolean; error?: string } {
    if (mode === "edit" && (!password || password.length === 0)) {
      return { isValid: true }; // Password is optional for edit mode
    }

    if (!password || password.length < 6) {
      return {
        isValid: false,
        error: "パスワードは6文字以上で入力してください",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate nickname
   */
  static validateNickname(nickname: string): { isValid: boolean; error?: string } {
    const trimmed = (nickname || "").trim();
    
    if (!trimmed) {
      return {
        isValid: false,
        error: "ニックネームを入力してください",
      };
    }

    if (trimmed.length > 50) {
      return {
        isValid: false,
        error: "ニックネームは50文字以内で入力してください",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate hourly wage
   */
  static validateHourlyWage(hourlyWage: string): { isValid: boolean; error?: string } {
    if (!hourlyWage || hourlyWage.trim() === "") {
      return { isValid: true }; // Hourly wage is optional
    }

    const numericValue = parseFloat(hourlyWage);
    
    if (isNaN(numericValue) || numericValue < 0) {
      return {
        isValid: false,
        error: "有効な時給を入力してください",
      };
    }

    if (numericValue > 10000) {
      return {
        isValid: false,
        error: "時給は10,000円以下で入力してください",
      };
    }

    return { isValid: true };
  }

  /**
   * Comprehensive form validation
   */
  static validateForm(params: {
    email: string;
    password: string;
    nickname: string;
    hourlyWage: string;
    mode: "add" | "edit";
    hasMaster: boolean;
    role: "master" | "user";
    currentUserStoreId?: string;
  }): { isValid: boolean; error?: string } {
    const {
      email,
      password,
      nickname,
      hourlyWage,
      mode,
      hasMaster,
      role,
      currentUserStoreId,
    } = params;

    // Store ID validation
    if (!currentUserStoreId) {
      return {
        isValid: false,
        error: "店舗IDが設定されていません",
      };
    }

    // Nickname validation
    const nicknameValidation = this.validateNickname(nickname);
    if (!nicknameValidation.isValid) {
      return nicknameValidation;
    }

    // Email validation
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation;
    }

    // Password validation
    const passwordValidation = this.validatePassword(password, mode);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }

    // Hourly wage validation
    const wageValidation = this.validateHourlyWage(hourlyWage);
    if (!wageValidation.isValid) {
      return wageValidation;
    }

    // Master role validation
    if (role === "master" && hasMaster) {
      return {
        isValid: false,
        error: "マスターユーザーは既に存在します",
      };
    }

    return { isValid: true };
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email?: string): string {
    return (email || "").trim();
  }

  /**
   * Sanitize nickname input
   */
  static sanitizeNickname(nickname?: string): string {
    return (nickname || "").trim().substring(0, 50);
  }

  /**
   * Sanitize hourly wage input
   */
  static sanitizeHourlyWage(wage: string): string {
    // Allow only numbers and decimal point
    if (typeof wage !== 'string') {
      return "";
    }
    return wage.replace(/[^0-9.]/g, "");
  }

  /**
   * Format hourly wage for display
   */
  static formatHourlyWage(wage?: number): string {
    if (!wage || !Number.isFinite(wage)) {
      return "";
    }
    return wage.toString();
  }

  /**
   * Prepare sanitized form data for submission
   */
  static prepareSanitizedFormData(data: {
    email: string;
    password: string;
    nickname: string;
    role: "master" | "user";
    color: string;
    storeId: string;
    hourlyWage: string;
  }) {
    const sanitizeForEmail = (str: string) =>
      (str || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    const autoEmail =
      data.email.trim() ||
      `${sanitizeForEmail(data.storeId)}${sanitizeForEmail(data.nickname)}@example.com`;

    return {
      email: autoEmail,
      password: data.password || undefined,
      nickname: this.sanitizeNickname(data.nickname),
      role: data.role,
      color: data.color,
      storeId: data.storeId,
      hourlyWage: data.hourlyWage ? parseFloat(data.hourlyWage) : undefined,
    };
  }
}
