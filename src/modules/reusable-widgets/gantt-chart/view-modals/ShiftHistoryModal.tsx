import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useShiftHistory } from "./useShiftHistory";
import {
  ShiftActionType,
  ShiftHistoryEntry,
} from "@/services/shift-history/shiftHistoryLogger";

const ACTION_LABELS: Record<ShiftActionType, string> = {
  create: "新規作成",
  update_time: "時間を変更",
  update_user: "担当を変更",
  update_status: "ステータス変更",
  delete: "削除",
  teacher_create: "講師申請",
  teacher_update: "講師が更新",
  batch_approve: "一括承認",
};

interface ShiftHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  storeId: string;
  selectedDate: Date;
  onEntryAction?: (entry: ShiftHistoryEntry) => void;
}

type ActionType = ShiftActionType | "all";

export const ShiftHistoryModal: React.FC<ShiftHistoryModalProps> = React.memo(
  ({ visible, onClose, storeId, selectedDate, onEntryAction }) => {
    const [filterAction, setFilterAction] = useState<ActionType>("all");
    const [filterUser, setFilterUser] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedEntry, setSelectedEntry] =
      useState<ShiftHistoryEntry | null>(null);

    // 当月の開始日と終了日を計算
    const { startDate, endDate } = useMemo(() => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }, [selectedDate]);

    // 履歴データを取得
    const {
      entries: historyEntries,
      isLoading,
      error,
    } = useShiftHistory({
      storeId,
      startDate,
      endDate,
      actionFilter: filterAction,
      userFilter: filterUser,
      searchQuery: searchQuery,
    });


    useEffect(() => {
      if (!visible) {
        setSelectedEntry(null);
      }
    }, [visible]);

    const getActionIcon = (action: ShiftActionType | "all") => {
      switch (action) {
        case "create":
        case "teacher_create":
          return "add-circle";
        case "update_time":
          return "time";
        case "update_user":
          return "person";
        case "update_status":
          return "flag";
        case "delete":
          return "trash";
        case "batch_approve":
          return "checkmark-done";
        default:
          return "list";
      }
    };

    const getActionColor = (action: ShiftActionType | "all") => {
      switch (action) {
        case "create":
        case "teacher_create":
          return "#4CAF50";
        case "update_time":
        case "update_user":
        case "update_status":
        case "teacher_update":
          return "#2196F3";
        case "delete":
          return "#F44336";
        case "batch_approve":
          return "#9C27B0";
        default:
          return "#757575";
      }
    };


    const formatTimestamp = (timestamp: any) => {
      // Firestore TimestampをDateオブジェクトに変換
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "たった今";
      if (minutes < 60) return `${minutes}分前`;
      if (hours < 24) return `${hours}時間前`;
      if (days < 7) return `${days}日前`;

      return date.toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onClose}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              width: Platform.OS === "web" ? 800 : "90%",
              maxHeight: "85%",
              padding: 20,
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ヘッダー */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                シフト変更履歴 - {selectedDate.getFullYear()}年
                {selectedDate.getMonth() + 1}月
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* フィルタセクション */}
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#E0E0E0",
                paddingBottom: 15,
                marginBottom: 15,
                flexShrink: 0,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                {/* 種別フィルタ */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 12, color: "#666", marginBottom: 5 }}
                  >
                    種別
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#DDD",
                      borderRadius: 6,
                      backgroundColor: "#FFF",
                    }}
                  >
                    <Picker
                      selectedValue={filterAction}
                      onValueChange={(value) =>
                        setFilterAction(value as ActionType)
                      }
                      style={{ height: 36 }}
                    >
                      <Picker.Item label="すべて" value="all" />
                      <Picker.Item label="追加" value="create" />
                      <Picker.Item label="時間変更" value="update_time" />
                      <Picker.Item label="担当変更" value="update_user" />
                      <Picker.Item
                        label="ステータス変更"
                        value="update_status"
                      />
                      <Picker.Item label="削除" value="delete" />
                      <Picker.Item label="講師申請" value="teacher_create" />
                      <Picker.Item label="講師変更" value="teacher_update" />
                      <Picker.Item label="一括承認" value="batch_approve" />
                    </Picker>
                  </View>
                </View>

                {/* ユーザーフィルタ */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 12, color: "#666", marginBottom: 5 }}
                  >
                    実行者
                  </Text>
                  <TextInput
                    value={filterUser}
                    onChangeText={setFilterUser}
                    placeholder="ユーザー名で絞り込み"
                    style={{
                      borderWidth: 1,
                      borderColor: "#DDD",
                      borderRadius: 6,
                      paddingHorizontal: 10,
                      height: 36,
                      backgroundColor: "#FFF",
                    }}
                  />
                </View>
              </View>

              {/* 検索ボックス */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#666"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="要約文で検索..."
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#DDD",
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    height: 36,
                    backgroundColor: "#FFF",
                  }}
                />
              </View>
            </View>

            {/* 履歴リスト */}
            <View
              style={{
                flex: 1,
                minHeight: 200,
                maxHeight: 400,
                marginBottom: 15,
              }}
            >
              <ScrollView
                style={{
                  flex: 1,
                }}
                contentContainerStyle={{
                  paddingBottom: 10,
                }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {isLoading ? (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                  </View>
                ) : error ? (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={48}
                      color="#F44336"
                    />
                    <Text style={{ marginTop: 10, color: "#F44336" }}>
                      {error}
                    </Text>
                  </View>
                ) : historyEntries.length === 0 ? (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <Ionicons
                      name="document-text-outline"
                      size={48}
                      color="#CCC"
                    />
                    <Text style={{ marginTop: 10, color: "#999" }}>
                      履歴データがありません
                    </Text>
                    <Text style={{ marginTop: 5, color: "#999", fontSize: 12 }}>
                      シフトの変更が記録されると、ここに表示されます
                    </Text>
                  </View>
                ) : (
                  historyEntries.map((entry) => (
                    <TouchableOpacity
                      key={entry.id}
                      onPress={() => setSelectedEntry(entry)}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: 12,
                        marginBottom: 10,
                        borderRadius: 8,
                        backgroundColor: "#FFFFFF",
                        borderWidth: 1,
                        borderColor:
                          selectedEntry?.id === entry.id
                            ? "#4A90E2"
                            : "#E0E0E0",
                        elevation: 0,
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: getActionColor(entry.action),
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name={getActionIcon(entry.action) as any}
                          size={20}
                          color="white"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: getActionColor(entry.action),
                            marginBottom: 2,
                          }}
                        >
                          {ACTION_LABELS[entry.action] ?? "変更"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#333",
                            marginBottom: 4,
                          }}
                        >
                          {entry.summary}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#999" }}>
                          {formatTimestamp(entry.timestamp)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

            {/* フッター */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 15,
                flexShrink: 0,
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: "#4A90E2",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  閉じる
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
);
