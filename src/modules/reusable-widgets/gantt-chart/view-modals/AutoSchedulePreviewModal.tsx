import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import type { ProposedAssignment } from "@/modules/master-view/auto-scheduling/autoScheduler";

interface AutoSchedulePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  proposals: ProposedAssignment[];
  onApply: (proposals: ProposedAssignment[]) => void;
  isApplying: boolean;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export const AutoSchedulePreviewModal: React.FC<AutoSchedulePreviewModalProps> = React.memo(
  ({ visible, onClose, proposals, onApply, isApplying }) => {
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

    // モーダルが開くたびにリセット
    React.useEffect(() => {
      if (visible) setRemovedIds(new Set());
    }, [visible]);

    const activeProposals = useMemo(
      () => proposals.filter((p) => !removedIds.has(`${p.shiftId}:${p.taskId || p.roleId}`)),
      [proposals, removedIds]
    );

    // 日付でグループ化
    const groupedByDate = useMemo(() => {
      const map = new Map<string, ProposedAssignment[]>();
      for (const p of activeProposals) {
        const list = map.get(p.scheduledDate) || [];
        list.push(p);
        map.set(p.scheduledDate, list);
      }
      return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [activeProposals]);

    const handleRemove = (p: ProposedAssignment) => {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.add(`${p.shiftId}:${p.taskId || p.roleId}`);
        return next;
      });
    };

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      const day = DAY_LABELS[d.getDay()] || "";
      return `${d.getMonth() + 1}/${d.getDate()} (${day})`;
    };

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 12, width: "90%", maxWidth: 560, maxHeight: "80%" }}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialIcons name="auto-fix-high" size={22} color="#4CAF50" />
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
                  自動配置プレビュー
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#F5F5F5" }}>
              <Text style={{ fontSize: 13, color: "#555" }}>
                {activeProposals.length} 件の配置が提案されています
                {removedIds.size > 0 && ` (${removedIds.size} 件除外)`}
              </Text>
            </View>

            {/* Body */}
            <ScrollView style={{ flex: 1, padding: 16 }}>
              {proposals.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <MaterialIcons name="event-busy" size={48} color="#BDBDBD" />
                  <Text style={{ fontSize: 14, color: "#999", marginTop: 12 }}>
                    配置できるスケジュールがありません
                  </Text>
                  <Text style={{ fontSize: 12, color: "#BBB", marginTop: 4 }}>
                    業務・タスクのスケジュール設定を確認してください
                  </Text>
                </View>
              ) : (
                groupedByDate.map(([date, items]) => (
                  <View key={date} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: "bold", color: "#333", marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}>
                      {formatDate(date)}
                    </Text>
                    {items.map((item, idx) => {
                      const key = `${item.shiftId}:${item.taskId || item.roleId}`;
                      return (
                        <View
                          key={`${key}-${idx}`}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            marginBottom: 4,
                            backgroundColor: "#FAFAFA",
                            borderRadius: 8,
                            borderLeftWidth: 3,
                            borderLeftColor: item.taskColor || "#4CAF50",
                          }}
                        >
                          {/* Icon + Task name */}
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              <Text style={{ fontSize: 14 }}>{item.taskIcon || ""}</Text>
                              <Text style={{ fontSize: 13, fontWeight: "600", color: "#333" }}>
                                {item.taskName || ""}
                              </Text>
                              {item.roleName && item.roleName !== item.taskName && (
                                <Text style={{ fontSize: 11, color: "#888" }}>
                                  ({item.roleName})
                                </Text>
                              )}
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3, gap: 8 }}>
                              <Text style={{ fontSize: 12, color: "#666" }}>
                                <Ionicons name="person-outline" size={11} color="#888" /> {item.userName || item.userId}
                              </Text>
                              <Text style={{ fontSize: 12, color: "#666" }}>
                                <Ionicons name="time-outline" size={11} color="#888" /> {item.scheduledStartTime}-{item.scheduledEndTime}
                              </Text>
                            </View>
                          </View>
                          {/* Remove button */}
                          <TouchableOpacity
                            onPress={() => handleRemove(item)}
                            style={{ padding: 6 }}
                          >
                            <Ionicons name="close-circle-outline" size={20} color="#F44336" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                ))
              )}
            </ScrollView>

            {/* Footer */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: "#E0E0E0" }}>
              <TouchableOpacity
                onPress={onClose}
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#CCC" }}
              >
                <Text style={{ fontSize: 14, color: "#666" }}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onApply(activeProposals)}
                disabled={isApplying || activeProposals.length === 0}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: activeProposals.length === 0 ? "#CCC" : "#4CAF50",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={18} color="#fff" />
                    <Text style={{ fontSize: 14, color: "#fff", fontWeight: "bold" }}>
                      適用 ({activeProposals.length})
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);
