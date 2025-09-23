import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { RecruitmentShift, RecruitmentApplication } from "@/common/common-models/model-shift/shiftTypes";
import { useAuth } from "@/services/auth/useAuth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { styles } from "./styles";
import { RecruitmentApplicationModal } from "./RecruitmentApplicationModal";
import { RecruitmentShiftService } from "@/services/recruitment-shift-service/recruitmentShiftService";
import { ShiftSubmissionService, ShiftSubmissionPeriod } from "@/services/shift-submission/ShiftSubmissionService";

interface RecruitmentShiftModalProps {
  visible: boolean;
  onClose: () => void;
  userRole: "master" | "teacher";
}

export function RecruitmentShiftModal({
  visible,
  onClose,
  userRole,
}: RecruitmentShiftModalProps) {
  const { user } = useAuth();
  const [recruitmentShifts, setRecruitmentShifts] = useState<RecruitmentShift[]>([]);
  const [selectedShift, setSelectedShift] = useState<RecruitmentShift | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showMasterActionModal, setShowMasterActionModal] = useState(false);
  const [selectedMasterShift, setSelectedMasterShift] = useState<RecruitmentShift | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<RecruitmentShift | null>(null);
  
  // タブ機能の状態
  const [activeTab, setActiveTab] = useState<"recruitment" | "period">("recruitment");
  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);

  // レスポンシブ対応
  const { width: screenWidth } = Dimensions.get('window');
  const isDesktop = screenWidth > 1024;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  // 期間情報を読み込む
  useEffect(() => {
    if (user?.storeId) {
      loadActivePeriod();
    }
  }, [user?.storeId]);

  const loadActivePeriod = async () => {
    try {
      const periods = await ShiftSubmissionService.getActivePeriods(user?.storeId || "");
      setPeriod(periods.length > 0 ? periods[0] ?? null : null);
    } catch (error) {
    }
  };

  const getDaysUntilDeadline = (): number => {
    if (!period) return 0;
    return ShiftSubmissionService.getDaysUntilDeadline(period);
  };

  const isWithinPeriod = (): boolean => {
    if (!period) return false;
    return ShiftSubmissionService.isWithinPeriod(period);
  };

  useEffect(() => {
    if (!user?.storeId) return;

    const q = query(
      collection(db, "recruitmentShifts"),
      where("storeId", "==", user.storeId),
      where("status", "==", "open")
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const shifts: RecruitmentShift[] = [];
        snapshot.forEach((doc) => {
          shifts.push({ id: doc.id, ...doc.data() } as RecruitmentShift);
        });

        // 日付順にソート
        shifts.sort((a, b) => {
          const dateA = new Date(a.date + " " + a.startTime);
          const dateB = new Date(b.date + " " + b.startTime);
          return dateA.getTime() - dateB.getTime();
        });

        setRecruitmentShifts(shifts);
      },
      (error) => {
        // 認証エラーの場合は無視（ログアウト時の正常な動作）
        if (error.code === 'permission-denied') {
          setRecruitmentShifts([]);
          return;
        }
      }
    );

    return () => unsubscribe();
  }, [user?.storeId]);

  const handleApplyShift = (shift: RecruitmentShift) => {
    if (userRole === "teacher") {
      // 既に応募済みかチェック
      const hasApplied = shift.applications?.some(app => app.userId === user?.uid);
      if (hasApplied) {
        Alert.alert("既に応募済み", "このシフトには既に応募しています。");
        return;
      }
      setSelectedShift(shift);
      setShowApplicationModal(true);
    }
  };

  const handleMasterAction = (shift: RecruitmentShift) => {
    if (userRole === "master") {
      setSelectedMasterShift(shift);
      setShowMasterActionModal(true);
    } else {
    }
  };

  const handleDeleteShift = (shift: RecruitmentShift) => {
    setShiftToDelete(shift);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteShift = async () => {
    if (!shiftToDelete) return;
    
    try {
      await RecruitmentShiftService.deleteRecruitmentShift(shiftToDelete.id);
      
      // ローカル状態からも削除
      setRecruitmentShifts(prevShifts => 
        prevShifts.filter(s => s.id !== shiftToDelete.id)
      );
      
      setShowDeleteConfirmModal(false);
      setShiftToDelete(null);
      Alert.alert("成功", "募集シフトを削除しました");
    } catch (error) {
      Alert.alert("エラー", "削除に失敗しました");
    }
  };

  const handleEditShift = (shift: RecruitmentShift) => {
    Alert.alert("開発中", "編集機能は準備中です");
  };

  const renderShiftItem = ({ item }: { item: RecruitmentShift }) => {
    const hasApplied = item.applications?.some(app => app.userId === user?.uid);
    const userApplication = item.applications?.find(app => app.userId === user?.uid);
    const applicantsCount = item.applications?.length || 0;

    // 日付フォーマット
    const date = new Date(item.date);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

    return (
      <TouchableOpacity
        style={[
          styles.modernShiftCard,
          hasApplied && styles.appliedCard,
          userRole === "master" && styles.masterCard
        ]}
        onPress={() => {
          if (userRole === "master") {
            handleMasterAction(item);
          } else {
            handleApplyShift(item);
          }
        }}
        activeOpacity={0.7}
        disabled={false}
      >
        {/* カードヘッダー */}
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Text style={styles.dayText}>({dayOfWeek})</Text>
            </View>
            <View style={styles.timeContainer}>
              <MaterialIcons name="access-time" size={16} color={colors.primary} />
              <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
            </View>
          </View>
          
          {/* ステータスバッジ */}
          <View style={[
            styles.statusBadge,
            item.status === "open" ? styles.openBadge : styles.closedBadge
          ]}>
            <Text style={styles.statusText}>
              {item.status === "open" ? "募集中" : "終了"}
            </Text>
          </View>
        </View>

        {/* カード内容（コンパクト表示） */}
        {(item.subject || item.notes) && (
          <View style={styles.cardContent}>
            {item.subject && (
              <View style={styles.subjectContainer}>
                <MaterialIcons name="subject" size={14} color={colors.secondary} />
                <Text style={styles.subjectText}>{item.subject}</Text>
              </View>
            )}
            
            {item.notes && (
              <View style={styles.notesContainer}>
                <MaterialIcons name="notes" size={14} color={colors.secondary} />
                <Text style={styles.notesText} numberOfLines={1}>{item.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* フッター */}
        <View style={styles.cardFooter}>
          {userRole === "master" && (
            <View style={styles.applicantsContainer}>
              <MaterialIcons name="people" size={18} color={colors.primary} />
              <Text style={styles.applicantsText}>
                応募者: {applicantsCount}
                {item.maxApplicants && `/${item.maxApplicants}`}人
              </Text>
            </View>
          )}

          {userRole === "teacher" && hasApplied && userApplication && (
            <View style={styles.appliedContainer}>
              <MaterialIcons name="check-circle" size={18} color={colors.success} />
              <Text style={styles.appliedText}>
                応募済み ({userApplication.requestedStartTime} - {userApplication.requestedEndTime})
              </Text>
            </View>
          )}

          {userRole === "teacher" && !hasApplied && (
            <View style={styles.actionContainer}>
              <MaterialIcons name="add-circle" size={18} color={colors.primary} />
              <Text style={styles.actionText}>タップして応募</Text>
            </View>
          )}

          {userRole === "master" && (
            <View style={styles.masterActionContainer}>
              <MaterialIcons name="settings" size={18} color={colors.secondary} />
              <Text style={styles.masterActionText}>タップして管理</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={[styles.modalContainer, {
              width: "95%",
              maxWidth: 600,
              height: "85%",
            }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {userRole === "master" ? "募集中のシフト" : "募集シフト"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* タブ切り替え */}
            <View style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginBottom: 16,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  borderBottomWidth: activeTab === "recruitment" ? 2 : 0,
                  borderBottomColor: colors.primary,
                }}
                onPress={() => setActiveTab("recruitment")}
              >
                <Text style={{
                  fontSize: 17,
                  fontWeight: activeTab === "recruitment" ? "600" : "400",
                  color: activeTab === "recruitment" ? colors.primary : colors.text.secondary,
                }}>
                  募集シフト
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  borderBottomWidth: activeTab === "period" ? 2 : 0,
                  borderBottomColor: colors.primary,
                }}
                onPress={() => setActiveTab("period")}
              >
                <Text style={{
                  fontSize: 17,
                  fontWeight: activeTab === "period" ? "600" : "400",
                  color: activeTab === "period" ? colors.primary : colors.text.secondary,
                }}>
                  シフト提出
                </Text>
              </TouchableOpacity>
            </View>

            {/* タブコンテンツ */}
            {activeTab === "recruitment" ? (
              // 募集シフトタブのコンテンツ
              recruitmentShifts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {userRole === "master" 
                      ? "募集中のシフトはありません" 
                      : "現在募集中のシフトはありません"}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={recruitmentShifts}
                  keyExtractor={(item) => item.id}
                  renderItem={renderShiftItem}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                />
              )
            ) : (
              // シフト提出タブのコンテンツ（アップデート広告風）
              <ScrollView 
                contentContainerStyle={{ padding: 20, alignItems: "stretch" }}
                showsVerticalScrollIndicator={false}
              >
                {period ? (
                  <View style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: 12,
                    padding: 24,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#e9ecef",
                    width: "100%",
                  }}>
                    {/* アイコン */}
                    <View style={{
                      backgroundColor: colors.primary,
                      borderRadius: 50,
                      padding: 16,
                      marginBottom: 16,
                    }}>
                      <Ionicons name="calendar" size={32} color="white" />
                    </View>

                    {/* タイトル */}
                    <Text style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: colors.text.primary,
                      textAlign: "center",
                      marginBottom: 8,
                    }}>
                      シフト提出のお知らせ
                    </Text>

                    {/* 期間情報 */}
                    <Text style={{
                      fontSize: 16,
                      color: colors.text.secondary,
                      textAlign: "center",
                      marginBottom: 16,
                      lineHeight: 24,
                    }}>
                      {typeof period.startDate === 'string' ? period.startDate : period.startDate.toLocaleDateString()}〜{typeof period.endDate === 'string' ? period.endDate : period.endDate.toLocaleDateString()}の期間中に{"\n"}
                      シフトの提出をお願いします
                    </Text>

                    {/* 残り日数 */}
                    <View style={{
                      backgroundColor: isWithinPeriod() ? "#e8f5e8" : "#fff3cd",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 20,
                    }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: isWithinPeriod() ? "#28a745" : "#856404",
                        textAlign: "center",
                      }}>
                        {isWithinPeriod() 
                          ? `締切まで あと${getDaysUntilDeadline()}日` 
                          : getDaysUntilDeadline() < 0 
                            ? "提出期間終了" 
                            : "提出期間開始まで待機中"}
                      </Text>
                    </View>

                    {/* アクションボタン */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 8,
                        paddingVertical: 14,
                        paddingHorizontal: 32,
                        minWidth: 200,
                        alignItems: "center",
                      }}
                      onPress={() => {
                        onClose();
                        // TODO: シフト作成画面への遷移
                      }}
                    >
                      <Text style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "600",
                      }}>
                        シフトを確定する
                      </Text>
                    </TouchableOpacity>

                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      現在、シフト提出期間の設定はありません
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {selectedShift && (
        <RecruitmentApplicationModal
          visible={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedShift(null);
          }}
          recruitmentShift={selectedShift}
          onApply={async (startTime, endTime, notes) => {
            try {
              if (!user?.uid || !user?.nickname) {
                Alert.alert("エラー", "ユーザー情報を取得できません");
                return;
              }

              await RecruitmentShiftService.applyToRecruitmentShift(
                selectedShift.id,
                {
                  userId: user.uid,
                  nickname: user.nickname,
                  requestedStartTime: startTime,
                  requestedEndTime: endTime,
                  notes: notes || "",
                }
              );

              Alert.alert("応募完了", "シフトへの応募が完了しました。");
              setShowApplicationModal(false);
              setSelectedShift(null);
            } catch (error) {
              Alert.alert("エラー", "応募に失敗しました。");
            }
          }}
        />
      )}

      {/* マスター用アクションモーダル */}
      {selectedMasterShift && (
        <Modal
          visible={showMasterActionModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMasterActionModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMasterActionModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={[styles.modalContainer, { maxWidth: 300 }]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>募集シフト管理</Text>
                <TouchableOpacity onPress={() => setShowMasterActionModal(false)}>
                  <AntDesign name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 16, color: colors.text.secondary, marginBottom: 20, textAlign: "center" }}>
                {selectedMasterShift.date} {selectedMasterShift.startTime}-{selectedMasterShift.endTime}
              </Text>

              <View style={{ width: "100%", gap: 12 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    alignItems: "center"
                  }}
                  onPress={() => {
                    setShowMasterActionModal(false);
                    setSelectedMasterShift(null);
                    handleEditShift(selectedMasterShift!);
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>変更</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#f44336",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    alignItems: "center"
                  }}
                  onPress={() => {
                    setShowMasterActionModal(false);
                    setSelectedMasterShift(null);
                    handleDeleteShift(selectedMasterShift!);
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>削除</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.border,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    alignItems: "center"
                  }}
                  onPress={() => setShowMasterActionModal(false)}
                >
                  <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: "600" }}>キャンセル</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* 削除確認モーダル */}
      {shiftToDelete && (
        <Modal
          visible={showDeleteConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirmModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDeleteConfirmModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={[styles.modalContainer, { maxWidth: 320 }]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>削除確認</Text>
                <TouchableOpacity onPress={() => setShowDeleteConfirmModal(false)}>
                  <AntDesign name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <Text style={{ 
                fontSize: 16, 
                color: colors.text.secondary, 
                marginBottom: 20, 
                textAlign: "center",
                lineHeight: 24
              }}>
                {shiftToDelete.date} {shiftToDelete.startTime}-{shiftToDelete.endTime}の募集シフトを削除しますか？
              </Text>

              <View style={{ width: "100%", gap: 12 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#f44336",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    alignItems: "center"
                  }}
                  onPress={confirmDeleteShift}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>削除</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.border,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    alignItems: "center"
                  }}
                  onPress={() => {
                    setShowDeleteConfirmModal(false);
                    setShiftToDelete(null);
                  }}
                >
                  <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: "600" }}>キャンセル</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}