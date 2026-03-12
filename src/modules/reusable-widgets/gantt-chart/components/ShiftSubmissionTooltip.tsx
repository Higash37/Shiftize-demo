/** @file ShiftSubmissionTooltip.tsx
 *  @description シフト提出期限のツールチップ（ポップアップ）。
 *    画面上の特定位置に表示され、現在の募集期間と締切までの残り日数を表示する。
 *    募集期間内であれば「シフト追加」ボタンも表示する。
 */

// 【このファイルの位置づけ】
// - import元: ServiceProvider（募集期間の取得）
// - importされる先: GanttChartMonthView 等（特定の操作時にツールチップとして表示）
// - 役割: position: absolute で指定座標に表示されるツールチップUI。
//   締切が近い場合は色を変えて緊急度を視覚的に伝える（3日以内=赤、7日以内=オレンジ）。

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceProvider } from "@/services/ServiceProvider";
import type { ShiftSubmissionPeriod } from "@/services/interfaces/IShiftSubmissionService";

interface ShiftSubmissionTooltipProps {
  storeId: string;
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAddShift: () => void;
}

export const ShiftSubmissionTooltip: React.FC<ShiftSubmissionTooltipProps> = ({
  storeId,
  visible,
  position,
  onClose,
  onAddShift,
}) => {
  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && storeId) {
      loadActivePeriod();
    }
  }, [visible, storeId]);

  const loadActivePeriod = async () => {
    try {
      setLoading(true);
      const periods = await ServiceProvider.shiftSubmissions.getActivePeriods(storeId);
      setPeriod(periods?.[0] ?? null);
    } catch (error) {
      // シフト提出期間の取得失敗は無視
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDeadline = (): number => {
    if (!period) return 0;
    return ServiceProvider.shiftSubmissions.getDaysUntilDeadline(period);
  };

  const isWithinPeriod = (): boolean => {
    if (!period) return false;
    return ServiceProvider.shiftSubmissions.isWithinPeriod(period);
  };

  if (!visible) return null;

  const daysLeft = getDaysUntilDeadline();
  const canSubmit = isWithinPeriod();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.tooltip,
            {
              left: Math.min(position.x, 300), // 画面端を考慮
              top: Math.max(position.y - 120, 50), // 画面上端を考慮
            },
          ]}
        >
          {loading ? (
            <Text style={styles.loadingText}>読み込み中...</Text>
          ) : period ? (
            <>
              <View style={styles.header}>
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={canSubmit ? "#4CAF50" : "#ff9800"} 
                />
                <Text style={styles.title}>シフト募集期間</Text>
              </View>
              
              <Text style={styles.periodText}>
                {period.startDate.toLocaleDateString()} 〜 {period.endDate.toLocaleDateString()}
              </Text>
              
              <Text style={styles.targetText}>
                対象: {period.targetMonth}
              </Text>
              
              <View style={styles.deadlineContainer}>
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color={daysLeft <= 3 ? "#f44336" : daysLeft <= 7 ? "#ff9800" : "#4CAF50"} 
                />
                <Text style={[
                  styles.deadlineText,
                  { color: daysLeft <= 3 ? "#f44336" : daysLeft <= 7 ? "#ff9800" : "#4CAF50" }
                ]}>
                  {canSubmit 
                    ? `締切まで ${daysLeft}日` 
                    : daysLeft < 0 
                      ? "募集期間終了" 
                      : "募集期間外"}
                </Text>
              </View>

              {canSubmit && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    onAddShift();
                    onClose();
                  }}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addButtonText}>シフト追加</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noPeriodContainer}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.noPeriodText}>募集期間が設定されていません</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    maxWidth: 280,
    elevation: 0,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  periodText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  targetText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  deadlineText: {
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    paddingVertical: 8,
  },
  noPeriodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noPeriodText: {
    fontSize: 12,
    color: "#666",
  },
});