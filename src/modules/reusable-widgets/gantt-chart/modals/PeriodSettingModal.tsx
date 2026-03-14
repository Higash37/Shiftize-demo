/** @file PeriodSettingModal.tsx
 *  @description シフト募集期間の設定モーダル。2つのタブを持つ:
 *    1. 期間設定タブ: 募集開始日・終了日・対象月を設定し、期間を作成/削除する。
 *    2. 提出確認タブ: 各講師のシフト提出状況（確定済み/未確定）と統計を確認する。
 */

// 【このファイルの位置づけ】
// - import元: ServiceProvider（期間CRUD、確定状況取得）, UnifiedButtonStyles, DatePickerModal
// - importされる先: MonthSelectorBar（「期間設定」ボタンから表示）
// - 役割: マスターがシフト募集期間を管理し、講師の提出状況を確認するUI。

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "../gantt-chart-common/UnifiedButtonStyles";
import { ServiceProvider } from "@/services/ServiceProvider";
import type { ShiftSubmissionPeriod } from "@/services/interfaces/IShiftSubmissionService";
import type { TeacherStatus } from "@/services/interfaces/ITeacherStatusService";
import { useAuth } from "@/services/auth/useAuth";
import { DatePickerModal } from "@/modules/reusable-widgets/calendar/modals/DatePickerModal";
import { colors } from "@/common/common-constants/ThemeConstants";

interface PeriodSettingModalProps {
  visible: boolean;
  onClose: () => void;
  storeId: string;
  users?: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>;
  shifts?: any[]; // PayrollListと同じshift配列
  onPeriodCreated?: (period: ShiftSubmissionPeriod) => void;
}

export const PeriodSettingModal: React.FC<PeriodSettingModalProps> = ({
  visible,
  onClose,
  storeId,
  users = [],
  shifts = [],
  onPeriodCreated: _onPeriodCreated,
}) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetMonth, setTargetMonth] = useState("");
  const [periods, setPeriods] = useState<ShiftSubmissionPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTargetMonthPicker, setShowTargetMonthPicker] = useState(false);
  
  // タブ機能の状態
  const [activeTab, setActiveTab] = useState<"period-setting" | "submission-check">("period-setting");
  const [teacherStatuses, setTeacherStatuses] = useState<TeacherStatus[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  
  // 削除確認モーダルの状態
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPeriodId, setDeletingPeriodId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadPeriods();
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      setTargetMonth(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`);
    }
  }, [visible]);

  const loadPeriods = async () => {
    try {
      const allPeriods = await ServiceProvider.shiftSubmissions.getActivePeriods(storeId);
      setPeriods(allPeriods);
    } catch (error) {
      // 期間データの読み込みに失敗
    }
  };

  const handleCreate = async () => {
    if (!startDate || !endDate || !targetMonth) {
      Alert.alert("エラー", "すべての必須項目を入力してください");
      return;
    }

    if (!user) {
      Alert.alert("エラー", "ユーザー情報が取得できません");
      return;
    }

    // 既存の期間がある場合は削除確認
    if (periods.length > 0) {
      Alert.alert(
        "既存の期間を削除",
        "新しい期間を作成するには、既存の期間を削除する必要があります。削除しますか？",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "削除して作成",
            style: "destructive",
            onPress: () => createPeriodAfterDeletion()
          }
        ]
      );
      return;
    }

    // 既存の期間がない場合は直接作成
    await createNewPeriod();
  };

  const createPeriodAfterDeletion = async () => {
    try {
      setLoading(true);
      
      // 既存の全期間を削除
      for (const period of periods) {
        await ServiceProvider.shiftSubmissions.deletePeriod(period.id);
      }
      
      // 新しい期間を作成
      await createNewPeriod();
    } catch (error) {
      Alert.alert("エラー", "既存期間の削除に失敗しました");
      setLoading(false);
    }
  };

  const createNewPeriod = async () => {
    try {
      setLoading(true);
      // TODO: createShiftSubmissionPeriodメソッドが実装されたら有効にする
      // const periodData = {
      //   storeId,
      //   startDate: new Date(startDate),
      //   endDate: new Date(endDate),
      //   targetMonth,
      //   isActive: true,
      //   createdBy: user?.uid || "",
      // };
      // const newPeriod = await ServiceProvider.shiftSubmissions.createShiftSubmissionPeriod(periodData);
      
      Alert.alert("成功", "期間が作成されました");
      // onPeriodCreated?.(newPeriod);
      resetForm();
      loadPeriods();
    } catch (error) {
      Alert.alert("エラー", "期間の作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (periodId: string) => {
    setDeletingPeriodId(periodId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingPeriodId) return;
    
    try {
      await ServiceProvider.shiftSubmissions.deletePeriod(deletingPeriodId);
      
      setShowDeleteConfirm(false);
      setDeletingPeriodId(null);
      loadPeriods();
      
      // 成功通知用の一時的なAlert（後でトーストに変更可能）
      Alert.alert("成功", "期間を削除しました");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      Alert.alert("エラー", `期間の削除に失敗しました: ${errorMessage}`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingPeriodId(null);
  };

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date.toISOString().split('T')[0]!);
    setShowStartDatePicker(false);
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date.toISOString().split('T')[0]!);
    setShowEndDatePicker(false);
  };

  const handleTargetMonthSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    setTargetMonth(`${year}-${month}`);
    setShowTargetMonthPicker(false);
  };

  // PayrollListと同じロジックでシフト統計を計算
  const calculateShiftStats = (teacherId: string, targetMonth: string) => {
    if (!shifts || !targetMonth) {
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }

    const [targetYear, targetMonthNum] = targetMonth.split('-');
    const year = Number.parseInt(targetYear || "0", 10);
    const month = Number.parseInt(targetMonthNum || "0", 10);

    const teacherShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      const shiftYear = shiftDate.getFullYear();
      const shiftMonth = shiftDate.getMonth() + 1;

      return (
        shift.userId === teacherId &&
        shiftYear === year &&
        shiftMonth === month &&
        shift.status !== "deleted" &&
        shift.status !== "purged"
      );
    });

    const stats = { pending: 0, approved: 0, rejected: 0, total: 0 };

    teacherShifts.forEach((shift) => {
      const status = shift.status || "pending";
      stats.total++;

      switch (status) {
        case "approved":
        case "completed":
          stats.approved++;
          break;
        case "rejected":
          stats.rejected++;
          break;
        default:
          stats.pending++;
          break;
      }
    });

    return stats;
  };

  // 講師状況を読み込む
  const loadTeacherStatuses = async () => {
    if (!periods[0] || !storeId) return;
    
    setLoadingStatuses(true);
    try {
      // propsで渡されたusersがあればそれを使用、なければTeacherStatusServiceで取得
      let teacherList = users;
      if (!users || users.length === 0) {
        const teachers = await ServiceProvider.teacherStatus.getTeachersByStore(storeId);
        teacherList = teachers.map(teacher => ({
          uid: teacher.uid,
          nickname: teacher.nickname,
        }));
      }

      // 各講師の状況を取得
      const statuses: TeacherStatus[] = [];
      for (const user of teacherList) {
        try {
          // 確定状況を取得（エラーを無視）
          let isConfirmed = false;
          try {
            isConfirmed = await ServiceProvider.shiftConfirmations.getUserConfirmationStatus(
              user.uid, 
              periods[0].id
            );
          } catch (confirmError) {
            // 権限エラーの場合は未確定とする
            isConfirmed = false;
          }

          // フロントエンドでシフト統計を計算
          const shiftStats = calculateShiftStats(user.uid, periods[0].targetMonth);

          statuses.push({
            teacher: {
              uid: user.uid,
              nickname: user.nickname,
              email: "",
              storeId: storeId
            },
            isConfirmed,
            shiftStats
          });
        } catch (error) {
          // 講師の処理でエラーが発生
          // エラーが発生しても未確定として表示
          statuses.push({
            teacher: {
              uid: user.uid,
              nickname: user.nickname,
              email: "",
              storeId: storeId
            },
            isConfirmed: false,
            shiftStats: calculateShiftStats(user.uid, periods[0].targetMonth)
          });
        }
      }

      // 確定状況でソート（未確定を先に表示）
      const sortedStatuses = statuses.sort((a, b) => {
        if (a.isConfirmed === b.isConfirmed) {
          return a.teacher.nickname.localeCompare(b.teacher.nickname);
        }
        return a.isConfirmed ? 1 : -1;
      });

      setTeacherStatuses(sortedStatuses);
    } catch (error) {
      // 講師状況読み込みエラー
    } finally {
      setLoadingStatuses(false);
    }
  };

  // 提出確認タブがアクティブになったときに講師状況を読み込む
  useEffect(() => {
    if (activeTab === "submission-check" && periods.length > 0) {
      loadTeacherStatuses();
    }
  }, [activeTab, periods, users, shifts]);

  if (!visible) return null;

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
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>シフト募集期間設定</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* タブ切り替え */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "period-setting" && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab("period-setting")}
            >
              <Text style={[
                styles.tabButtonText,
                activeTab === "period-setting" && styles.tabButtonTextActive
              ]}>
                期間設定
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "submission-check" && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab("submission-check")}
            >
              <Text style={[
                styles.tabButtonText,
                activeTab === "submission-check" && styles.tabButtonTextActive
              ]}>
                提出確認
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* タブコンテンツ */}
            {activeTab === "period-setting" ? (
              // 期間設定タブのコンテンツ
              <>
                {/* 新規作成フォーム */}
                <View style={styles.formContainer}>
                  <Text style={styles.sectionTitle}>新規期間作成</Text>

                  <Text style={styles.fieldLabel}>募集開始日 *</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={[styles.datePickerText, !startDate && styles.placeholderText]}>
                      {startDate || "日付を選択"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>

                  <Text style={styles.fieldLabel}>募集終了日 *</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={[styles.datePickerText, !endDate && styles.placeholderText]}>
                      {endDate || "日付を選択"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>

                  <Text style={styles.fieldLabel}>対象月 *</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowTargetMonthPicker(true)}
                  >
                    <Text style={[styles.datePickerText, !targetMonth && styles.placeholderText]}>
                      {targetMonth || "年月を選択"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      getButtonStyle("primary"),
                      styles.createButton,
                      loading && styles.disabledButton
                    ]}
                    onPress={handleCreate}
                    disabled={loading}
                  >
                    <Ionicons name="add-circle" size={16} color="#fff" style={UnifiedButtonStyles.buttonIcon} />
                    <Text style={getButtonTextStyle("primary")}>
                      {loading ? "作成中..." : "期間を作成"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 現在の期間表示 */}
                <View style={styles.listContainer}>
                  <Text style={styles.sectionTitle}>現在の募集期間</Text>
                  {periods.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>期間が設定されていません</Text>
                    </View>
                  ) : (
                    <View style={[styles.periodRow, styles.activePeriodRow]}>
                      {/* ステータス インジケーター */}
                      <View style={[styles.statusIndicator, { backgroundColor: "#4CAF50" }]} />
                      
                      {/* 期間情報 */}
                      <View style={styles.periodInfo}>
                        <Text style={styles.periodTitle}>シフト募集期間</Text>
                        <Text style={styles.periodDate}>
                          {periods[0]?.startDate?.toLocaleDateString()} 〜 {periods[0]?.endDate?.toLocaleDateString()}
                        </Text>
                        <Text style={styles.periodTarget}>
                          対象: {periods[0]?.targetMonth}
                        </Text>
                      </View>

                      {/* アクションボタン */}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => periods[0]?.id && handleDelete(periods[0].id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                        <Text style={styles.deleteButtonText}>削除</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            ) : (
              // 提出確認タブのコンテンツ
              <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>
                  講師別シフト提出確認
                  {periods.length > 0 && ` (${periods[0]?.targetMonth})`}
                </Text>
                
                {loadingStatuses ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>読み込み中...</Text>
                  </View>
                ) : periods.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      期間を設定してください
                    </Text>
                  </View>
                ) : teacherStatuses.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      講師が見つかりません
                    </Text>
                  </View>
                ) : (
                  <View style={styles.teacherGrid}>
                    {teacherStatuses.map((teacherStatus) => (
                      <View key={teacherStatus.teacher.uid} style={[
                        styles.teacherCard,
                        teacherStatus.isConfirmed && styles.confirmedTeacherCard
                      ]}>
                        {/* 確定状況バッジ */}
                        <View style={[
                          styles.statusBadge,
                          teacherStatus.isConfirmed 
                            ? styles.confirmedBadge 
                            : styles.unconfirmedBadge
                        ]}>
                          <Text style={[
                            styles.statusBadgeText,
                            teacherStatus.isConfirmed 
                              ? styles.confirmedBadgeText 
                              : styles.unconfirmedBadgeText
                          ]}>
                            {teacherStatus.isConfirmed ? "確定済み" : "未確定"}
                          </Text>
                        </View>

                        {/* 講師情報 */}
                        <View style={styles.teacherInfo}>
                          <View style={styles.teacherNameRow}>
                            <Ionicons 
                              name="person" 
                              size={16} 
                              color={teacherStatus.isConfirmed ? "#28a745" : "#ffc107"} 
                            />
                            <Text style={styles.teacherName}>
                              {teacherStatus.teacher.nickname}
                            </Text>
                          </View>
                        </View>

                        {/* シフト統計 */}
                        <View style={styles.shiftStats}>
                          <View style={styles.statRow}>
                            <Text style={styles.statLabel}>投稿数</Text>
                            <Text style={styles.statValue}>
                              {teacherStatus.shiftStats.total}件
                            </Text>
                          </View>
                          
                          <View style={styles.statsBreakdown}>
                            <View style={styles.statItem}>
                              <View style={[styles.statIndicator, styles.pendingIndicator]} />
                              <Text style={styles.statBreakdownText}>
                                未承認 {teacherStatus.shiftStats.pending}
                              </Text>
                            </View>
                            
                            <View style={styles.statItem}>
                              <View style={[styles.statIndicator, styles.approvedIndicator]} />
                              <Text style={styles.statBreakdownText}>
                                承認済み {teacherStatus.shiftStats.approved}
                              </Text>
                            </View>
                            
                            {teacherStatus.shiftStats.rejected > 0 && (
                              <View style={styles.statItem}>
                                <View style={[styles.statIndicator, styles.rejectedIndicator]} />
                                <Text style={styles.statBreakdownText}>
                                  却下 {teacherStatus.shiftStats.rejected}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 日付ピッカー */}
      {showStartDatePicker && (
        <DatePickerModal
          isVisible={showStartDatePicker}
          initialDate={startDate ? new Date(startDate + 'T00:00:00') : new Date()}
          onClose={() => setShowStartDatePicker(false)}
          onSelect={handleStartDateSelect}
        />
      )}

      {showEndDatePicker && (
        <DatePickerModal
          isVisible={showEndDatePicker}
          initialDate={endDate ? new Date(endDate + 'T00:00:00') : new Date()}
          onClose={() => setShowEndDatePicker(false)}
          onSelect={handleEndDateSelect}
        />
      )}

      {showTargetMonthPicker && (
        <DatePickerModal
          isVisible={showTargetMonthPicker}
          initialDate={targetMonth ? new Date(`${targetMonth}-01T00:00:00`) : new Date()}
          onClose={() => setShowTargetMonthPicker(false)}
          onSelect={handleTargetMonthSelect}
        />
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmModal}>
              <View style={styles.confirmHeader}>
                <Ionicons name="warning" size={32} color="#f44336" />
                <Text style={styles.confirmTitle}>期間を削除</Text>
              </View>
              
              <Text style={styles.confirmMessage}>
                この期間を削除しますか？{'\n'}この操作は取り消せません。
              </Text>
              
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[getButtonStyle("secondary"), styles.confirmButton]}
                  onPress={cancelDelete}
                >
                  <Text style={getButtonTextStyle("secondary")}>キャンセル</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[getButtonStyle("danger"), styles.confirmButton]}
                  onPress={confirmDelete}
                >
                  <Ionicons name="trash-outline" size={16} color="#fff" style={UnifiedButtonStyles.buttonIcon} />
                  <Text style={getButtonTextStyle("danger")}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    elevation: 0,
  },
  header: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: "#f8f9fa",
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
    marginTop: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textAreaInput: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  createButton: {
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  activePeriodRow: {
    borderColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  statusIndicator: {
    width: 12,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  periodInfo: {
    flex: 1,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  periodDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  periodTarget: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  periodDescription: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f44336",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    gap: 6,
    minHeight: 44,
    minWidth: 80,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 14,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  
  // タブスタイル
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },

  // 講師カードスタイル（PayrollList 2列グリッド準拠）
  teacherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  teacherCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    elevation: 0,
  },
  confirmedTeacherCard: {
    backgroundColor: "#f8fff8",
    borderColor: "#28a745",
    borderWidth: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmedBadge: {
    backgroundColor: "#e8f5e8",
  },
  unconfirmedBadge: {
    backgroundColor: "#fff3cd",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  confirmedBadgeText: {
    color: "#28a745",
  },
  unconfirmedBadgeText: {
    color: "#856404",
  },
  teacherInfo: {
    marginBottom: 12,
  },
  teacherNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  shiftStats: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  statsBreakdown: {
    gap: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pendingIndicator: {
    backgroundColor: "#ffc107",
  },
  approvedIndicator: {
    backgroundColor: "#28a745",
  },
  rejectedIndicator: {
    backgroundColor: "#dc3545",
  },
  statBreakdownText: {
    fontSize: 11,
    color: "#666",
  },

  // 削除確認モーダルスタイル
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 9999,
  },
  confirmModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 0,
  },
  confirmHeader: {
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    minHeight: 48,
  },
});