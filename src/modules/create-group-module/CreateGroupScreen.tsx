import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors } from "@/common/common-constants/ColorConstants";
import { typography } from "@/common/common-constants/TypographyConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import Button from "@/common/common-ui/ui-forms/FormButton";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { ServiceProvider } from "@/services/ServiceProvider";
import { PRESET_COLORS } from "@/common/common-ui/ui-forms/FormColorPicker.constants";
import { useAuth } from "@/services/auth/useAuth";
import { Routes } from "@/common/common-constants/RouteConstants";
import type { UserRole } from "@/common/common-models/model-user/UserModel";

interface GroupCreationForm {
  groupName: string;
  adminNickname: string;
  adminPassword: string;
  confirmPassword: string;
}

interface InitialMember {
  id: string;
  nickname: string;
  password: string;
  role: UserRole;
  color: string;
  hourlyWage?: number;
}

export const CreateGroupScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && width > 768;
  const { signIn } = useAuth();

  const [form, setForm] = useState<GroupCreationForm>({
    groupName: "",
    adminNickname: "",
    adminPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [generatedStoreId, setGeneratedStoreId] = useState<string>("");
  const [customStoreId, setCustomStoreId] = useState<string>("");
  const [isCustomStoreId, setIsCustomStoreId] = useState(false);
  const [storeIdCheckLoading, setStoreIdCheckLoading] = useState(false);
  const [storeIdError, setStoreIdError] = useState<string>("");
  const [initialMembers, setInitialMembers] = useState<InitialMember[]>([]);
  // 4桁の店舗IDを生成（重複チェック付き）
  const generateStoreId = async () => {
    try {
      const storeId = await ServiceProvider.stores.generateUniqueStoreId();
      setGeneratedStoreId(storeId);
      return storeId;
    } catch (error) {
      // フォールバック：シンプルなランダム生成
      const fallbackId = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedStoreId(fallbackId);
      return fallbackId;
    }
  };

  // 初回レンダリング時に店舗IDを生成
  React.useEffect(() => {
    generateStoreId();
  }, []);

  // カスタム店舗IDの重複チェック
  const checkCustomStoreId = async (storeId: string) => {
    if (storeId.length !== 4 || !/^\d{4}$/.test(storeId)) {
      setStoreIdError("店舗IDは4桁の数字で入力してください");
      return false;
    }

    setStoreIdCheckLoading(true);
    setStoreIdError("");

    try {
      const exists = await ServiceProvider.stores.checkStoreIdExists(storeId);

      if (!exists) {
        setStoreIdError("");
        return true;
      }
      setStoreIdError("この店舗IDは既に使用されています");
      return false;
    } catch (error) {
      setStoreIdError("店舗IDの確認に失敗しました");
      return false;
    } finally {
      setStoreIdCheckLoading(false);
    }
  };

  // カスタム店舗ID入力時の処理
  const handleCustomStoreIdChange = async (value: string) => {
    // 数字のみ許可し、4桁まで
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 4);
    setCustomStoreId(numericValue);

    if (numericValue.length === 4) {
      await checkCustomStoreId(numericValue);
    } else if (numericValue.length > 0) {
      setStoreIdError("店舗IDは4桁の数字で入力してください");
    } else {
      setStoreIdError("");
    }
  };

  // 使用する店舗IDを取得
  const getCurrentStoreId = () => {
    return isCustomStoreId ? customStoreId : generatedStoreId;
  };

  const handleInputChange = (field: keyof GroupCreationForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // メンバー管理関数
  const addMember = () => {
    const newMember: InitialMember = {
      id: Date.now().toString(),
      nickname: "",
      password: "",
      role: "user",
      color:
        PRESET_COLORS[initialMembers.length % PRESET_COLORS.length] ||
        PRESET_COLORS[0] ||
        "#FFD700",
    };
    setInitialMembers([...initialMembers, newMember]);
  };

  const updateMember = (id: string, field: keyof InitialMember, value: any) => {
    setInitialMembers(
      initialMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const removeMember = (id: string) => {
    setInitialMembers(initialMembers.filter((member) => member.id !== id));
  };

  const validateForm = (): boolean => {
    // 店舗IDの検証
    const currentStoreId = getCurrentStoreId();
    if (!currentStoreId || currentStoreId.length !== 4) {
      Alert.alert("エラー", "有効な店舗IDを設定してください");
      return false;
    }
    if (isCustomStoreId && storeIdError) {
      Alert.alert("エラー", "店舗IDエラーを解決してください");
      return false;
    }

    if (!form.groupName.trim()) {
      Alert.alert("エラー", "グループ名を入力してください");
      return false;
    }
    if (!form.adminNickname.trim()) {
      Alert.alert("エラー", "管理者ニックネームを入力してください");
      return false;
    }
    if (!form.adminPassword.trim()) {
      Alert.alert("エラー", "パスワードを入力してください");
      return false;
    }
    if (form.adminPassword !== form.confirmPassword) {
      Alert.alert("エラー", "パスワードが一致しません");
      return false;
    }
    if (form.adminPassword.length < 6) {
      Alert.alert("エラー", "パスワードは6文字以上で入力してください");
      return false;
    }

    // 初期メンバーのバリデーション
    for (let i = 0; i < initialMembers.length; i++) {
      const member = initialMembers[i];
      if (!member) {
        Alert.alert("エラー", `メンバー${i + 1}のデータが見つかりません`);
        return false;
      }
      if (!member.nickname?.trim()) {
        Alert.alert(
          "エラー",
          `メンバー${i + 1}のニックネームを入力してください`
        );
        return false;
      }
      if (!member.password?.trim()) {
        Alert.alert("エラー", `メンバー${i + 1}のパスワードを入力してください`);
        return false;
      }
      if (member.password.length < 6) {
        Alert.alert(
          "エラー",
          `メンバー${i + 1}のパスワードは6文字以上で入力してください`
        );
        return false;
      }
    }

    return true;
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const currentStoreId = getCurrentStoreId();

      const result = await ServiceProvider.stores.createGroup({
        groupName: form.groupName,
        storeId: currentStoreId,
        adminNickname: form.adminNickname,
        adminPassword: form.adminPassword,
        initialMembers:
          initialMembers.length > 0
            ? initialMembers.map((member) => ({
                nickname: member.nickname,
                password: member.password,
                role: member.role,
                color: member.color,
                ...(member.hourlyWage !== undefined && {
                  hourlyWage: member.hourlyWage,
                }),
              }))
            : [],
      });

      if (result.success) {
        // デフォルトの途中時間タイプをシード
        try {
          const { getSupabase } = await import("@/services/supabase/supabase-client");
          await getSupabase().from("time_segment_types").insert([
            {
              store_id: result.storeId,
              name: "授業",
              icon: "📚",
              color: "#4A90E2",
              wage_mode: "exclude",
              custom_rate: 0,
              sort_order: 0,
            },
            {
              store_id: result.storeId,
              name: "休憩",
              icon: "⏸",
              color: "#9e9e9e",
              wage_mode: "exclude",
              custom_rate: 0,
              sort_order: 1,
            },
          ]);
        } catch (_) { /* seed failure is non-critical */ }

        try {
          const adminEmail = result.adminEmail || `${result.storeId}-admin@example.com`;
          await signIn(adminEmail, form.adminPassword, result.storeId);

          router.replace(Routes.main.master.home);
        } catch (loginError) {
          Alert.alert(
            "グループ作成成功",
            `グループが作成されました。\n\n店舗ID: ${result.storeId}\n管理者: ${form.adminNickname}\n\nログイン画面から店舗IDとパスワードでログインしてください。`,
            [
              {
                text: "OK",
                onPress: () => router.replace(Routes.auth.login),
              },
            ]
          );
        }
      } else {
        Alert.alert("エラー", result.message);
      }
    } catch (error) {
      Alert.alert(
        "エラー",
        "グループの作成に失敗しました。再度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStoreIdStatus = () => {
    if (storeIdCheckLoading) return <Text style={styles.checkingText}>確認中...</Text>;
    if (storeIdError) return <Text style={styles.errorText}>{storeIdError}</Text>;
    if (customStoreId.length === 4) return <Text style={styles.successText}>✓ 使用可能です</Text>;
    return null;
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Box variant="primary" padding="large" style={styles.header}>
        <Text style={styles.headerTitle}>新規グループ作成</Text>
      </Box>

      {/* Content */}
      <Box variant="default" padding="large" style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.formContainer,
              isDesktop && styles.formContainerDesktop,
            ]}
          >
            {/* 店舗ID表示 */}
            <View style={styles.storeIdContainer}>
              <Text style={styles.storeIdLabel}>店舗ID設定</Text>

              {/* 自動生成/手動入力の切り替え */}
              <View style={styles.storeIdToggle}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !isCustomStoreId && styles.toggleButtonActive,
                  ]}
                  onPress={() => {
                    setIsCustomStoreId(false);
                    setStoreIdError("");
                  }}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      !isCustomStoreId && styles.toggleButtonTextActive,
                    ]}
                  >
                    自動生成
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    isCustomStoreId && styles.toggleButtonActive,
                  ]}
                  onPress={() => setIsCustomStoreId(true)}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      isCustomStoreId && styles.toggleButtonTextActive,
                    ]}
                  >
                    手動入力
                  </Text>
                </TouchableOpacity>
              </View>

              {!isCustomStoreId ? (
                // 自動生成モード
                <View style={styles.storeIdBox}>
                  <Text style={styles.storeIdText}>{generatedStoreId}</Text>
                  <Button
                    title="再生成"
                    onPress={() => generateStoreId()}
                    variant="outline"
                    size="small"
                  />
                </View>
              ) : (
                // 手動入力モード
                <View style={styles.customStoreIdContainer}>
                  <TextInput
                    style={[
                      styles.customStoreIdInput,
                      storeIdError ? styles.inputError : {},
                    ]}
                    value={customStoreId}
                    onChangeText={handleCustomStoreIdChange}
                    placeholder="4桁の数字を入力"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  {renderStoreIdStatus()}
                </View>
              )}

              <Text style={styles.storeIdNote}>
                この店舗IDでメンバーがグループに参加できます
              </Text>
            </View>

            {/* グループ名入力 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>グループ名</Text>
              <TextInput
                style={styles.input}
                value={form.groupName}
                onChangeText={(value) => handleInputChange("groupName", value)}
                placeholder="例: ○○店、△△チーム"
                placeholderTextColor="#999"
                maxLength={30}
              />
            </View>

            {/* 管理者ニックネーム入力 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>管理者ニックネーム</Text>
              <TextInput
                style={styles.input}
                value={form.adminNickname}
                onChangeText={(value) =>
                  handleInputChange("adminNickname", value)
                }
                placeholder="あなたのニックネーム"
                placeholderTextColor="#999"
                maxLength={20}
              />
            </View>

            {/* パスワード入力 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>パスワード</Text>
              <TextInput
                style={styles.input}
                value={form.adminPassword}
                onChangeText={(value) =>
                  handleInputChange("adminPassword", value)
                }
                placeholder="6文字以上"
                placeholderTextColor="#999"
                secureTextEntry
                maxLength={50}
              />
            </View>

            {/* パスワード確認入力 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>パスワード確認</Text>
              <TextInput
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
                placeholder="パスワードを再入力"
                placeholderTextColor="#999"
                secureTextEntry
                maxLength={50}
              />
            </View>

            {/* 初期メンバー追加セクション */}
            <View style={styles.memberSection}>
              <View style={styles.memberSectionHeader}>
                <Text style={styles.memberSectionTitle}>
                  初期メンバー追加（任意）
                </Text>
                <Text style={styles.memberSectionNote}>
                  グループ作成時にメンバーを一括で追加できます
                </Text>
              </View>

              {initialMembers.length > 0 && (
                <View style={styles.memberList}>
                  {initialMembers.map((member) => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={styles.memberHeader}>
                        <View style={styles.memberColorIndicator}>
                          <View
                            style={[
                              styles.colorCircle,
                              { backgroundColor: member.color },
                            ]}
                          />
                          <Text style={styles.memberItemTitle}>
                            メンバー {initialMembers.indexOf(member) + 1}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeMember(member.id)}
                          style={styles.removeButton}
                        >
                          <Text style={styles.removeButtonText}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.memberForm}>
                        <TextInput
                          style={styles.memberInput}
                          placeholder="ニックネーム"
                          placeholderTextColor="#999"
                          value={member.nickname}
                          onChangeText={(value) =>
                            updateMember(member.id, "nickname", value)
                          }
                          maxLength={20}
                        />
                        <TextInput
                          style={styles.memberInput}
                          placeholder="パスワード（6文字以上）"
                          placeholderTextColor="#999"
                          value={member.password}
                          onChangeText={(value) =>
                            updateMember(member.id, "password", value)
                          }
                          secureTextEntry
                          maxLength={50}
                        />

                        <View style={styles.roleSelector}>
                          <TouchableOpacity
                            style={[
                              styles.roleButton,
                              member.role === "user" && styles.roleButtonActive,
                            ]}
                            onPress={() =>
                              updateMember(member.id, "role", "user")
                            }
                          >
                            <Text
                              style={[
                                styles.roleButtonText,
                                member.role === "user" &&
                                  styles.roleButtonTextActive,
                              ]}
                            >
                              一般ユーザー
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.roleButton,
                              member.role === "master" &&
                                styles.roleButtonActive,
                            ]}
                            onPress={() =>
                              updateMember(member.id, "role", "master")
                            }
                          >
                            <Text
                              style={[
                                styles.roleButtonText,
                                member.role === "master" &&
                                  styles.roleButtonTextActive,
                              ]}
                            >
                              マスター
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <TextInput
                          style={styles.memberInput}
                          placeholder="時給（円）"
                          placeholderTextColor="#999"
                          value={member.hourlyWage?.toString() || ""}
                          onChangeText={(value) => {
                            // 数字のみ許可
                            const numericValue = value.replace(/[^0-9]/g, "");
                            updateMember(
                              member.id,
                              "hourlyWage",
                              numericValue
                                ? Number.parseFloat(numericValue)
                                : undefined
                            );
                          }}
                          keyboardType="numeric"
                          maxLength={10}
                        />

                        <View style={styles.colorSelector}>
                          <Text style={styles.colorSelectorLabel}>色:</Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                          >
                            <View style={styles.colorOptions}>
                              {PRESET_COLORS.map((color, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={[
                                    styles.colorOption,
                                    { backgroundColor: color },
                                    member.color === color &&
                                      styles.colorOptionSelected,
                                  ]}
                                  onPress={() =>
                                    updateMember(member.id, "color", color)
                                  }
                                />
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <Button
                title="メンバーを追加"
                onPress={addMember}
                variant="outline"
                size="medium"
                style={styles.addMemberButton}
              />
            </View>

            {/* ボタン */}
            <View
              style={[
                styles.buttonContainer,
                isDesktop && styles.buttonContainerDesktop,
              ]}
            >
              <Button
                title="戻る"
                onPress={handleBack}
                variant="outline"
                size="large"
                fullWidth={!isDesktop}
                style={isDesktop ? styles.buttonDesktop : undefined}
              />
              <Button
                title="グループを作成"
                onPress={handleCreateGroup}
                variant="primary"
                size="large"
                loading={loading}
                fullWidth={!isDesktop}
                style={isDesktop ? styles.buttonDesktop : undefined}
              />
            </View>
          </View>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.primary,
    alignItems: "center",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: layout.borderRadius.large,
    borderBottomRightRadius: layout.borderRadius.large,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxlarge,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.white,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    gap: layout.padding.large,
  },
  formContainerDesktop: {
    alignSelf: "center",
    width: "60%",
    maxWidth: 800, // 最大幅を設定して極端に広くならないように
  },
  storeIdContainer: {
    marginBottom: layout.padding.medium,
  },
  storeIdLabel: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  storeIdBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.selected,
    padding: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    marginBottom: layout.padding.small,
  },
  storeIdText: {
    fontSize: typography.fontSize.xxlarge + 4,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary,
    letterSpacing: 2,
  },
  storeIdNote: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: layout.padding.medium,
  },
  inputLabel: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    fontSize: Math.max(typography.fontSize.medium, 16), // ズーム防止のため16px以上
    backgroundColor: colors.background,
  },
  buttonContainer: {
    gap: layout.padding.medium,
    marginTop: layout.padding.large,
  },
  buttonContainerDesktop: {
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDesktop: {
    width: "40%",
  },
  memberSection: {
    padding: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: layout.padding.large,
  },
  memberSectionHeader: {
    marginBottom: layout.padding.medium,
  },
  memberSectionTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  memberSectionNote: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    textAlign: "left",
  },
  memberList: {
    gap: layout.padding.medium,
    marginBottom: layout.padding.medium,
  },
  memberItem: {
    padding: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.selected,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: layout.padding.medium,
  },
  memberColorIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.small,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  memberItemTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.white,
  },
  memberForm: {
    gap: layout.padding.medium,
  },
  memberInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    fontSize: typography.fontSize.medium,
    backgroundColor: colors.background,
  },
  roleSelector: {
    flexDirection: "row",
    gap: layout.padding.small,
    marginTop: layout.padding.small,
  },
  roleButton: {
    flex: 1,
    padding: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
  },
  roleButtonTextActive: {
    color: colors.text.white,
  },
  colorSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: layout.padding.small,
  },
  colorSelectorLabel: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    marginRight: layout.padding.small,
  },
  colorOptions: {
    flexDirection: "row",
    gap: layout.padding.small,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorOptionSelected: {
    borderColor: colors.primary,
  },
  addMemberButton: {
    alignSelf: "flex-start",
  },
  // 店舗ID関連の新しいスタイル
  storeIdToggle: {
    flexDirection: "row",
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: layout.padding.medium,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    padding: layout.padding.medium,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium as any,
  },
  toggleButtonTextActive: {
    color: colors.text.white,
  },
  customStoreIdContainer: {
    marginBottom: layout.padding.medium,
  },
  customStoreIdInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    fontSize: typography.fontSize.xxlarge,
    backgroundColor: colors.background,
    textAlign: "center",
    fontWeight: typography.fontWeight.bold as any,
    letterSpacing: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  checkingText: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: layout.padding.small,
  },
  errorText: {
    fontSize: typography.fontSize.small,
    color: colors.error,
    textAlign: "center",
    marginTop: layout.padding.small,
  },
  successText: {
    fontSize: typography.fontSize.small,
    color: colors.success,
    textAlign: "center",
    marginTop: layout.padding.small,
  },
});
