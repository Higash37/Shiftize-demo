import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StoreIdState } from "./types";

interface StoreIdSectionProps {
  storeId: StoreIdState;
  onToggleCustomStoreId: () => void;
  onCustomStoreIdChange: (value: string) => void;
  onCheckCustomStoreId: (storeId: string) => Promise<void>;
  onRegenerateStoreId: () => Promise<void>;
}

export const StoreIdSection: React.FC<StoreIdSectionProps> = ({
  storeId,
  onToggleCustomStoreId,
  onCustomStoreIdChange,
  onCheckCustomStoreId,
  onRegenerateStoreId,
}) => {
  const currentStoreId = storeId.isCustomStoreId
    ? storeId.customStoreId
    : storeId.generatedStoreId;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>店舗ID</Text>
      
      <View style={styles.storeIdContainer}>
        <View style={styles.storeIdDisplay}>
          <Text style={styles.storeIdLabel}>店舗ID:</Text>
          <Text style={styles.storeIdValue}>{currentStoreId}</Text>
          {!storeId.isCustomStoreId && (
            <TouchableOpacity
              onPress={onRegenerateStoreId}
              style={styles.regenerateButton}
            >
              <Ionicons name="refresh" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={onToggleCustomStoreId}
        >
          <Text style={styles.toggleButtonText}>
            {storeId.isCustomStoreId ? "自動生成に戻す" : "カスタムIDを使用"}
          </Text>
        </TouchableOpacity>

        {storeId.isCustomStoreId && (
          <View style={styles.customStoreIdSection}>
            <Text style={styles.fieldLabel}>
              カスタム店舗ID <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.customInputContainer}>
              <TextInput
                style={[
                  styles.customInput,
                  storeId.storeIdError && styles.errorInput,
                ]}
                value={storeId.customStoreId}
                onChangeText={onCustomStoreIdChange}
                placeholder="1234"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={4}
                onBlur={() => {
                  if (storeId.customStoreId.length === 4) {
                    onCheckCustomStoreId(storeId.customStoreId);
                  }
                }}
              />
              {storeId.storeIdCheckLoading && (
                <ActivityIndicator
                  size="small"
                  color="#2563eb"
                  style={styles.loadingIndicator}
                />
              )}
            </View>
            {storeId.storeIdError && (
              <Text style={styles.errorText}>{storeId.storeIdError}</Text>
            )}
            <Text style={styles.fieldHelper}>
              4桁の数字で入力してください。他のグループと重複しない必要があります。
            </Text>
          </View>
        )}

        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={16} color="#6b7280" />
          <Text style={styles.noteText}>
            店舗IDはメンバーがログイン時に使用する識別番号です
          </Text>
        </View>
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
  storeIdContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  storeIdDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  storeIdLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 8,
  },
  storeIdValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
    marginRight: 8,
  },
  regenerateButton: {
    padding: 4,
  },
  toggleButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  toggleButtonText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  customStoreIdSection: {
    marginTop: 16,
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
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  customInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
    flex: 1,
    textAlign: "center",
    letterSpacing: 2,
  },
  errorInput: {
    borderColor: "#dc2626",
  },
  loadingIndicator: {
    position: "absolute",
    right: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
  fieldHelper: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    gap: 8,
  },
  noteText: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
  },
});