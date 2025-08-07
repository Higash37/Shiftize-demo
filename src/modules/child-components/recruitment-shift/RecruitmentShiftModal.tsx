import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { RecruitmentShift, RecruitmentApplication } from "@/common/common-models/model-shift/shiftTypes";
import { useAuth } from "@/services/auth/useAuth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { styles } from "./styles";
import { RecruitmentApplicationModal } from "./RecruitmentApplicationModal";
import { RecruitmentShiftService } from "@/services/recruitment-shift/recruitmentShiftService";

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
        // console.error("RecruitmentShiftModal realtime error:", error);
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
      // console.error("削除エラー:", error);
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
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {userRole === "master" ? "募集中のシフト" : "募集シフト"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {recruitmentShifts.length === 0 ? (
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
              />
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
                  notes,
                }
              );

              Alert.alert("応募完了", "シフトへの応募が完了しました。");
              setShowApplicationModal(false);
              setSelectedShift(null);
            } catch (error) {
              Alert.alert("エラー", "応募に失敗しました。");
              // console.error("応募エラー:", error);
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