import React, { useState } from "react";
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

interface ShiftHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  storeId: string;
  selectedDate: Date;
}

type ActionType = 
  | "all"
  | "create"
  | "update_time"
  | "update_user"
  | "update_status"
  | "delete"
  | "teacher_create"
  | "teacher_update"
  | "batch_approve";

interface HistoryEntry {
  id: string;
  action: ActionType;
  actor: {
    userId: string;
    nickname: string;
    role: "master" | "teacher" | "system";
  };
  timestamp: Date;
  date: string;
  summary: string;
  prev?: any;
  next?: any;
  notes?: string;
}

export const ShiftHistoryModal: React.FC<ShiftHistoryModalProps> = ({
  visible,
  onClose,
  storeId,
  selectedDate,
}) => {
  const [filterAction, setFilterAction] = useState<ActionType>("all");
  const [filterUser, setFilterUser] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 仮のデータ（実装時は削除）
  const historyEntries: HistoryEntry[] = [];

  const getActionIcon = (action: ActionType) => {
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

  const getActionColor = (action: ActionType) => {
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

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    
    return timestamp.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <View style={{
          backgroundColor: "white",
          borderRadius: 12,
          width: Platform.OS === "web" ? 800 : "90%",
          maxHeight: "80%",
          padding: 20,
        }}>
          {/* ヘッダー */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#333",
            }}>
              シフト変更履歴 - {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* フィルタセクション */}
          <View style={{
            borderBottomWidth: 1,
            borderBottomColor: "#E0E0E0",
            paddingBottom: 15,
            marginBottom: 15,
          }}>
            <View style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 10,
            }}>
              {/* 種別フィルタ */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>種別</Text>
                <View style={{
                  borderWidth: 1,
                  borderColor: "#DDD",
                  borderRadius: 6,
                  backgroundColor: "#FFF",
                }}>
                  <Picker
                    selectedValue={filterAction}
                    onValueChange={(value) => setFilterAction(value as ActionType)}
                    style={{ height: 36 }}
                  >
                    <Picker.Item label="すべて" value="all" />
                    <Picker.Item label="追加" value="create" />
                    <Picker.Item label="時間変更" value="update_time" />
                    <Picker.Item label="担当変更" value="update_user" />
                    <Picker.Item label="ステータス変更" value="update_status" />
                    <Picker.Item label="削除" value="delete" />
                    <Picker.Item label="講師申請" value="teacher_create" />
                    <Picker.Item label="講師変更" value="teacher_update" />
                    <Picker.Item label="一括承認" value="batch_approve" />
                  </Picker>
                </View>
              </View>

              {/* ユーザーフィルタ */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>実行者</Text>
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
              <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
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
          <ScrollView style={{ flex: 1, marginBottom: 15 }}>
            {isLoading ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={{ marginTop: 10, color: "#666" }}>読み込み中...</Text>
              </View>
            ) : historyEntries.length === 0 ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Ionicons name="document-text-outline" size={48} color="#CCC" />
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
                    borderBottomWidth: 1,
                    borderBottomColor: "#F0F0F0",
                    backgroundColor: selectedEntry?.id === entry.id ? "#F5F5F5" : "transparent",
                  }}
                >
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: getActionColor(entry.action),
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}>
                    <Ionicons
                      name={getActionIcon(entry.action) as any}
                      size={20}
                      color="white"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: "#333", marginBottom: 4 }}>
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

          {/* 詳細表示エリア（選択時） */}
          {selectedEntry && (
            <View style={{
              borderTopWidth: 1,
              borderTopColor: "#E0E0E0",
              paddingTop: 15,
              maxHeight: 200,
            }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>
                詳細情報
              </Text>
              <ScrollView>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ width: 80, color: "#666", fontSize: 12 }}>実行者:</Text>
                    <Text style={{ flex: 1, fontSize: 12 }}>
                      {selectedEntry.actor.nickname} ({selectedEntry.actor.role === "master" ? "管理者" : "講師"})
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ width: 80, color: "#666", fontSize: 12 }}>日時:</Text>
                    <Text style={{ flex: 1, fontSize: 12 }}>
                      {selectedEntry.timestamp.toLocaleString("ja-JP")}
                    </Text>
                  </View>
                  {selectedEntry.prev && (
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ width: 80, color: "#666", fontSize: 12 }}>変更前:</Text>
                      <Text style={{ flex: 1, fontSize: 12 }}>
                        {JSON.stringify(selectedEntry.prev, null, 2)}
                      </Text>
                    </View>
                  )}
                  {selectedEntry.next && (
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ width: 80, color: "#666", fontSize: 12 }}>変更後:</Text>
                      <Text style={{ flex: 1, fontSize: 12 }}>
                        {JSON.stringify(selectedEntry.next, null, 2)}
                      </Text>
                    </View>
                  )}
                  {selectedEntry.notes && (
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ width: 80, color: "#666", fontSize: 12 }}>メモ:</Text>
                      <Text style={{ flex: 1, fontSize: 12 }}>{selectedEntry.notes}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          {/* フッター */}
          <View style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 15,
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: "#4A90E2",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};