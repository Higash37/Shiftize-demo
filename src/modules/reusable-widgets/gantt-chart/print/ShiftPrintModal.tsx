import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftItem } from "@/common/common-models/ModelIndex";

// Components
import { UserSelector } from "./components/UserSelector";
import { PrintFormatSelector, PrintFormat } from "./components/PrintFormatSelector";

// Utils
import { generatePdfBlob, downloadPdf, sharePdf } from "./utils/pdfGenerator";
import { getUserShiftData } from "./utils/shiftDataProcessor";

// Templates
import { generateListHTML } from "./templates/listTemplate";
import { generateCalendarHTML } from "./templates/calendarTemplate";
import { generateUnifiedCalendarHTML } from "./templates/unifiedCalendarTemplate";

interface ShiftPrintModalProps {
  visible: boolean;
  onClose: () => void;
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string }>;
  selectedDate: Date;
}

export const ShiftPrintModal: React.FC<ShiftPrintModalProps> = ({
  visible,
  onClose,
  shifts,
  users,
  selectedDate,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [printFormat, setPrintFormat] = useState<PrintFormat>("all");

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();

    const usersWithShifts = users.filter((user) =>
      shifts.some((shift) => {
        const shiftDate = new Date(shift.date);
        return (
          shift.userId === user.uid &&
          shift.status !== "deleted" &&
          shift.status !== "rejected" &&
          shiftDate.getFullYear() === selectedYear &&
          shiftDate.getMonth() === selectedMonth
        );
      })
    );
    setSelectedUsers(usersWithShifts.map((user) => user.uid));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const generatePrintHTML = (format: PrintFormat): string => {
    const userShiftData = getUserShiftData(
      shifts,
      users,
      selectedUsers,
      selectedDate
    );

    switch (format) {
      case "list":
        return generateListHTML(userShiftData, selectedDate);
      case "calendar":
        return generateCalendarHTML(userShiftData, selectedDate);
      case "unified-calendar":
        return generateUnifiedCalendarHTML(userShiftData, selectedDate);
      default:
        return generateListHTML(userShiftData, selectedDate);
    }
  };

  const handlePrint = () => {
    if (Platform.OS === "web") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const htmlContent = generatePrintHTML(
          printFormat === "all" ? "list" : printFormat
        );
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } else {
      Alert.alert("印刷", "印刷機能はWeb版でのみ利用可能です");
    }
  };

  const handleDownload = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("警告", "ダウンロード対象のスタッフを選択してください");
      return;
    }

    try {
      const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });

      if (printFormat === "all") {
        // 全形式をダウンロード
        for (const format of ["list", "calendar", "unified-calendar"] as PrintFormat[]) {
          const htmlContent = generatePrintHTML(format);
          const blob = await generatePdfBlob(htmlContent, format);
          if (blob) {
            const formatName =
              format === "list"
                ? "リスト形式"
                : format === "calendar"
                ? "カレンダー形式"
                : "統合カレンダー形式";
            downloadPdf(blob, `スタッフ勤務表_${formatName}_${monthYear}.pdf`);
          }
        }
      } else {
        // 単一形式をダウンロード
        const htmlContent = generatePrintHTML(printFormat);
        const blob = await generatePdfBlob(htmlContent, printFormat);
        if (blob) {
          const formatName =
            printFormat === "list"
              ? "リスト形式"
              : printFormat === "calendar"
              ? "カレンダー形式"
              : "統合カレンダー形式";
          downloadPdf(blob, `スタッフ勤務表_${formatName}_${monthYear}.pdf`);
        }
      }

      Alert.alert("成功", "PDFをダウンロードしました");
    } catch (error) {
      console.error("ダウンロードエラー:", error);
      Alert.alert("エラー", "PDFのダウンロードに失敗しました");
    }
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("警告", "共有対象のスタッフを選択してください");
      return;
    }

    try {
      const monthYear = format(selectedDate, "yyyy年M月", { locale: ja });

      if (printFormat === "all") {
        // 全形式を共有
        for (const format of ["list", "calendar", "unified-calendar"] as PrintFormat[]) {
          const htmlContent = generatePrintHTML(format);
          const blob = await generatePdfBlob(htmlContent, format);
          if (blob) {
            const formatName =
              format === "list"
                ? "リスト形式"
                : format === "calendar"
                ? "カレンダー形式"
                : "統合カレンダー形式";
            await sharePdf(
              blob,
              `スタッフ勤務表_${formatName}_${monthYear}.pdf`,
              `スタッフ勤務表 ${formatName} ${monthYear}`,
              `${monthYear}のスタッフ勤務表（${formatName}）です`
            );
          }
        }
      } else {
        // 単一形式を共有
        const htmlContent = generatePrintHTML(printFormat);
        const blob = await generatePdfBlob(htmlContent, printFormat);
        if (blob) {
          const formatName =
            printFormat === "list"
              ? "リスト形式"
              : printFormat === "calendar"
              ? "カレンダー形式"
              : "統合カレンダー形式";
          await sharePdf(
            blob,
            `スタッフ勤務表_${formatName}_${monthYear}.pdf`,
            `スタッフ勤務表 ${formatName} ${monthYear}`,
            `${monthYear}のスタッフ勤務表（${formatName}）です`
          );
        }
      }

      Alert.alert("成功", "PDFを共有しました");
    } catch (error) {
      console.error("共有エラー:", error);
      Alert.alert("エラー", "PDFの共有に失敗しました");
    }
  };

  const handlePreview = () => {
    if (selectedUsers.length === 0) {
      Alert.alert("警告", "プレビューするスタッフを選択してください");
      return;
    }
    setShowPreview(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>シフト印刷</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <UserSelector
              users={users}
              selectedUsers={selectedUsers}
              shifts={shifts}
              selectedDate={selectedDate}
              onToggleUser={toggleUserSelection}
              onSelectAll={selectAllUsers}
              onClearSelection={clearSelection}
            />

            <PrintFormatSelector
              selectedFormat={printFormat}
              onFormatChange={setPrintFormat}
            />

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.previewButton]}
                onPress={handlePreview}
              >
                <Ionicons name="eye-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>プレビュー</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.printButton]}
                onPress={handlePrint}
              >
                <Ionicons name="print-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>印刷</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={handleDownload}
              >
                <Ionicons name="download-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>ダウンロード</Text>
              </TouchableOpacity>

              {Platform.OS === "web" && navigator.share && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={handleShare}
                >
                  <Ionicons name="share-outline" size={20} color="white" />
                  <Text style={styles.actionButtonText}>共有</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* プレビューモーダル */}
      {showPreview && Platform.OS === "web" && (
        <Modal
          visible={showPreview}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPreview(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.previewOverlay}
            onPress={() => setShowPreview(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.previewContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>プレビュー</Text>
                <TouchableOpacity
                  onPress={() => setShowPreview(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.previewBody} showsVerticalScrollIndicator={false}>
                <View
                  dangerouslySetInnerHTML={{
                    __html: generatePrintHTML(
                      printFormat === "all" ? "list" : printFormat
                    ),
                  }}
                />
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
  },
  previewButton: {
    backgroundColor: "#6b7280",
  },
  printButton: {
    backgroundColor: "#2563eb",
  },
  downloadButton: {
    backgroundColor: "#10b981",
  },
  shareButton: {
    backgroundColor: "#8b5cf6",
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  previewContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 900,
    maxHeight: "90%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  previewBody: {
    padding: 20,
  },
});