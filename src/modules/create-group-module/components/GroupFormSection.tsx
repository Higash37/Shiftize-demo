import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { GroupCreationForm } from "./types";

interface GroupFormSectionProps {
  form: GroupCreationForm;
  onUpdateForm: (field: keyof GroupCreationForm, value: string) => void;
  showErrors?: boolean;
}

export const GroupFormSection: React.FC<GroupFormSectionProps> = ({
  form,
  onUpdateForm,
  showErrors = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>基本情報</Text>

      {/* グループ名 */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>
          グループ名（店舗名） <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.textInput,
            showErrors && !form.groupName.trim() && styles.errorInput,
          ]}
          value={form.groupName}
          onChangeText={(text) => onUpdateForm("groupName", text)}
          placeholder="例：Cafe Shiftize"
          placeholderTextColor="#9ca3af"
          maxLength={50}
        />
      </View>

      {/* 管理者ニックネーム */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>
          管理者ニックネーム <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.textInput,
            showErrors && !form.adminNickname.trim() && styles.errorInput,
          ]}
          value={form.adminNickname}
          onChangeText={(text) => onUpdateForm("adminNickname", text)}
          placeholder="例：田中"
          placeholderTextColor="#9ca3af"
          maxLength={20}
        />
      </View>

      {/* メールアドレス（任意） */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>メールアドレス（任意）</Text>
        <TextInput
          style={styles.textInput}
          value={form.adminEmail}
          onChangeText={(text) => onUpdateForm("adminEmail", text)}
          placeholder="例：admin@example.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.fieldHelper}>
          パスワードリセット等で使用します（省略可）
        </Text>
      </View>

      {/* パスワード */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>
          パスワード <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.textInput,
            showErrors && form.adminPassword.length < 6 && styles.errorInput,
          ]}
          value={form.adminPassword}
          onChangeText={(text) => onUpdateForm("adminPassword", text)}
          placeholder="6文字以上で入力"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          maxLength={50}
        />
      </View>

      {/* パスワード確認 */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>
          パスワード確認 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.textInput,
            showErrors &&
              form.confirmPassword !== form.adminPassword &&
              styles.errorInput,
          ]}
          value={form.confirmPassword}
          onChangeText={(text) => onUpdateForm("confirmPassword", text)}
          placeholder="パスワードを再入力"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          maxLength={50}
        />
        {showErrors && form.confirmPassword !== form.adminPassword && (
          <Text style={styles.errorText}>パスワードが一致しません</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#dc2626",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  errorInput: {
    borderColor: "#dc2626",
  },
  fieldHelper: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
});