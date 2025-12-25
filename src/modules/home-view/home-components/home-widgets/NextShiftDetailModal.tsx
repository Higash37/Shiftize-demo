import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { format } from "date-fns";
import ja from "date-fns/locale/ja";

interface NextShiftDetailModalProps {
  visible: boolean;
  onClose: () => void;
  shifts: ShiftItem[];
}

export function NextShiftDetailModal({
  visible,
  onClose,
  shifts,
}: NextShiftDetailModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return colors.success;
      case "pending":
        return colors.warning;
      case "completed":
        return colors.primary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "承認済み";
      case "pending":
        return "確認中";
      case "completed":
        return "完了";
      default:
        return status;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.header}>
              <MaterialIcons name="event" size={24} color={colors.primary} />
              <Text style={styles.title}>今後のシフト予定</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {shifts.length > 0 ? (
                shifts.map((shift) => (
                  <View key={shift.id} style={styles.shiftCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.dateText}>
                        {format(new Date(shift.date), "M月d日(E)", { locale: ja })}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(shift.status) + "15" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(shift.status) },
                          ]}
                        >
                          {getStatusLabel(shift.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.infoRow}>
                        <MaterialIcons
                          name="access-time"
                          size={16}
                          color={colors.text.secondary}
                        />
                        <Text style={styles.infoText}>
                          {shift.startTime} - {shift.endTime}
                        </Text>
                      </View>

                      {shift.subject && (
                        <View style={styles.infoRow}>
                          <MaterialIcons
                            name="class"
                            size={16}
                            color={colors.text.secondary}
                          />
                          <Text style={styles.infoText}>{shift.subject}</Text>
                        </View>
                      )}

                      {shift.notes && (
                        <View style={styles.memoContainer}>
                          <Text style={styles.memoLabel}>メモ:</Text>
                          <Text style={styles.memoText}>{shift.notes}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="event-busy" size={64} color={colors.text.disabled} />
                  <Text style={styles.emptyText}>予定されているシフトはありません</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: "80%",
    minWidth: 320,
    maxWidth: 400,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  shiftCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  memoContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  memoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  memoText: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.disabled,
    marginTop: 12,
  },
});
