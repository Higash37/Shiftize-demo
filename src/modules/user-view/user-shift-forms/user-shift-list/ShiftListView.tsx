import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Pressable,
  TextInput,
  FlexAlignType,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ShiftCalendar } from "@/modules/reusable-widgets/calendar/main-calendar/ShiftCalendar";
import { colors } from "@/common/common-theme/ThemeColors";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { Header } from "@/common/common-ui/ui-layout/LayoutHeader";
import { useAuth } from "@/services/auth/useAuth";
import { format } from "date-fns";
import { ShiftListItem } from "./ShiftListItem";
import { ShiftDetailsView } from "../shiftDetail/ShiftDetailsView";
import { splitShiftIntoTimeSlots } from "../../user-shift-utils/shift-time.utils";
import { shiftListViewStyles as styles } from "./styles";
import { ViewStyle } from "react-native";
import { ShiftService } from "@/services/firebase/firebase-shift";
import { ShiftRuleValuePicker } from "@/modules/master-view/master-view-settings/ShiftRuleValuePicker";
import { getTasks } from "@/services/firebase/firebase-task";
import { ShiftSubmissionService, ShiftSubmissionPeriod } from "@/services/shift-submission/ShiftSubmissionService";
import { ShiftConfirmationService } from "@/services/shift-confirmation/ShiftConfirmationService";
import { Ionicons } from "@expo/vector-icons";
import { modalStyles } from "../ListModal/ModalStyles";
import ShiftModal from "../ListModal/ShiftModal";
import ShiftReportModal from "../ListModal/ShiftReportModal";
import TaskModal from "../ListModal/TaskModal";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";

export const UserShiftList = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { shifts, loading: shiftsLoading, fetchShifts } = useShift(); // storeIdを削除
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });
  const [displayMonth, setDisplayMonth] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isCalendarMounted, setIsCalendarMounted] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalShift, setModalShift] = useState<any>(null);
  const [currentUserStoreId, setCurrentUserStoreId] = useState<
    string | undefined
  >(undefined);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [taskCounts, setTaskCounts] = useState<{
    [key: string]: { count: number; time: number };
  }>({});
  const [comments, setComments] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);
  const [picker, setPicker] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const shiftRefs = useRef<{ [key: string]: any }>({}).current;
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768 && width < 1024; // タブレット判定
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // シフト確定ボタン用の状態
  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 画面がフォーカスされた時にデータを更新
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchShifts();
    });

    return unsubscribe;
  }, [navigation, fetchShifts]);

  // 初回マウント時にデータを取得
  useEffect(() => {
    fetchShifts();
  }, []);

  // 期間情報を読み込む
  useEffect(() => {
    if (user?.storeId) {
      loadActivePeriod();
    }
  }, [user?.storeId]);

  const loadActivePeriod = async () => {
    try {
      const periods = await ShiftSubmissionService.getActivePeriods(user?.storeId || "");
      const currentPeriod = periods.length > 0 ? periods[0] : null;
      setPeriod(currentPeriod);
      
      // 確定状況もロード
      if (currentPeriod && user?.uid) {
        const isConfirmed = await ShiftConfirmationService.getUserConfirmationStatus(
          user.uid, 
          currentPeriod.id
        );
        setIsCompleted(isConfirmed);
      }
    } catch (error) {
      console.error("期間の読み込みエラー:", error);
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

  const handleShiftConfirm = () => {
    if (isCompleted) {
      // 確定済みの場合は取り消しを確認
      Alert.alert(
        "確認",
        "シフト確定を取り消しますか？",
        [
          {
            text: "キャンセル",
            style: "cancel"
          },
          {
            text: "取り消し",
            style: "destructive",
            onPress: async () => {
              try {
                if (user?.uid && period?.id) {
                  await ShiftConfirmationService.cancelConfirmation(user.uid, period.id);
                  setIsCompleted(false);
                }
              } catch (error) {
                Alert.alert("エラー", "取り消しに失敗しました");
              }
            }
          }
        ]
      );
    } else {
      // 未確定の場合は確認モーダルを表示
      setShowConfirmModal(true);
    }
  };

  const handleConfirmComplete = async () => {
    try {
      if (user?.uid && user?.storeId && period?.id) {
        await ShiftConfirmationService.confirmShift(user.uid, user.storeId, period.id);
        setIsCompleted(true);
        setShowConfirmModal(false);
      }
    } catch (error) {
      Alert.alert("エラー", "確定に失敗しました");
    }
  };

  // ユーザーの店舗IDを取得
  useEffect(() => {
    const fetchUserStoreId = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUserStoreId(userData.storeId);
        }
      } catch (error) {
      }
    };

    fetchUserStoreId();
  }, [user?.uid]);

  // カレンダーがマウントされた時に現在の月を設定
  const handleCalendarMount = () => {
    setIsCalendarMounted(true);
    setDisplayMonth(currentMonth);
  };

  const handleMonthChange = (month: { dateString: string }) => {
    setCurrentMonth(month.dateString);
    setDisplayMonth(month.dateString);
    setSelectedDate("");
    setSelectedShiftId(null);
  };

  // 月ごとにシフトをグループ化
  const monthlyShifts = useMemo(() => {
    if (!displayMonth || !user) {
      return [];
    }

    const displayMonthDate = new Date(displayMonth);
    const year = displayMonthDate.getFullYear();
    const month = displayMonthDate.getMonth();

    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 月の最後の日を週末まで拡張
    const adjustedLastDay = new Date(lastDay);
    adjustedLastDay.setDate(
      adjustedLastDay.getDate() + (7 - adjustedLastDay.getDay())
    );

    const filteredShifts = shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        const isInDateRange =
          shiftDate >= firstDay &&
          shiftDate <= adjustedLastDay &&
          shiftDate.getMonth() === month;
        const isUserShift = shift.userId === user.uid;
        const isNotDeleted =
          shift.status !== "deleted" && shift.status !== "purged";

        return isInDateRange && isUserShift && isNotDeleted;
      })
      .sort((a, b) => {
        const dateCompare =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare === 0) {
          return (
            new Date(`2000-01-01T${a.startTime}`).getTime() -
            new Date(`2000-01-01T${b.startTime}`).getTime()
          );
        }
        return dateCompare;
      });

    return filteredShifts;
  }, [shifts, displayMonth, user]);

  if (shiftsLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }
  const handleDayPress = (day: { dateString: string }) => {
    // 同じ日付をもう一度押したときに選択を解除
    if (selectedDate === day.dateString) {
      setSelectedDate("");
      return;
    }

    setSelectedDate(day.dateString);

    // 選択された日付のシフトまでスクロール
    const selectedShift = monthlyShifts.find(
      (shift) => shift.date === day.dateString
    );
    if (selectedShift && shiftRefs[selectedShift.id]) {
      // 少し遅延を入れてスクロールを実行（レイアウト計算のため）
      setTimeout(() => {
        shiftRefs[selectedShift.id]?.measureLayout(
          // @ts-ignore
          scrollViewRef.current?._nativeRef,
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          },
          () => {}
        );
      }, 100);
    }
  };
  const handleShiftEdit = (shift: any) => {
    router.push({
      pathname: "/(main)/user/shifts/create",
      params: {
        mode: "edit",
        shiftId: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        classes: JSON.stringify(shift.classes || []),
      },
    });
  };

  const handleShiftPress = (shift: any) => {
    if (shift.status === "approved") {
      setModalShift(shift);
      setModalVisible(true);
    } else {
      handleShiftEdit(shift);
    }
  };

  const handleReportShift = async () => {
    if (modalShift) {
      setModalVisible(false);
      setReportModalVisible(true);

      try {
        const tasks = await getTasks();
        const taskCountsData = tasks.reduce(
          (
            acc: { [key: string]: { count: number; time: number } },
            task: { title: string }
          ) => {
            acc[task.title] = { count: 0, time: 0 };
            return acc;
          },
          {}
        );

        setTaskCounts(taskCountsData);
      } catch (error) {
      }
    }
  };

  const handleEditShift = () => {
    if (modalShift) {
      handleShiftEdit(modalShift);
    }
    setModalVisible(false);
  };

  const timeOptions = [5, 10, 20, 30, 60];

  const handleTaskUpdate = (
    task: string,
    field: "count" | "time",
    value: number
  ) => {
    setTaskCounts((prev) => ({
      ...prev,
      [task]: {
        count: prev[task]?.count || 0,
        time: prev[task]?.time || 0,
        [field]:
          field === "time"
            ? value
            : Math.max((prev[task]?.[field] || 0) + value, 0),
      },
    }));
  };

  const handleTaskModalClose = () => {
    setSelectedTask(null);
    setTaskModalVisible(false);
  };

  const containerStyle = isTablet
    ? {
        width: width * 0.8,
        height: height * 0.8,
        alignSelf: "center" as FlexAlignType,
        backgroundColor: "#FFFFFF",
      } // タブレット用スタイル
    : { flex: 1, backgroundColor: "#FFFFFF" }; // スマホやPC用スタイル

  return (
    <>
      <View style={containerStyle}>
        <Header
          title="シフト一覧"
          onPressSettings={() => setShowPasswordModal(true)}
        />
        <View style={styles.calendarContainer}>
          <ShiftCalendar
            shifts={monthlyShifts}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            currentUserStoreId={currentUserStoreId}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            onMount={handleCalendarMount} // レスポンシブ対応のプロパティを追加
            responsiveSize={{
              container: {
                width: "96%",
                maxWidth: 480, // カレンダーの最大幅を明示的に設定
              },
              day: { fontSize: 13 },
            }}
          />
        </View>
        {isCalendarMounted && displayMonth && (
          <ScrollView
            ref={scrollViewRef}
            style={styles.listContainer} // スタイル定義を使用
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false} // スクロールバーを非表示に
          >
            {/* シフト確定ボタン */}
            {period && (
              <View style={{ alignItems: "center", marginVertical: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: isCompleted ? "#6c757d" : colors.primary,
                    borderRadius: 4,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    opacity: isCompleted ? 0.7 : 1,
                  }}
                  onPress={handleShiftConfirm}
                  disabled={isCompleted}
                >
                  <Text style={{
                    color: "white",
                    fontSize: 11,
                    fontWeight: "600",
                  }}>
                    {isCompleted ? "確定済み" : "シフト確定"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {monthlyShifts.length > 0 ? (
              monthlyShifts.map((shift) => {
                // シフトの表示
                const isSelected = selectedShiftId === shift.id;
                const timeSlots = isSelected
                  ? splitShiftIntoTimeSlots(shift)
                  : null;
                return (
                  <View
                    key={shift.id}
                    ref={(ref) => (shiftRefs[shift.id] = ref)}
                    style={{ width: "100%" }} // 親Viewの幅を100%に設定
                  >
                    <ShiftListItem
                      shift={shift}
                      isSelected={isSelected}
                      selectedDate={selectedDate}
                      onPress={() => handleShiftPress(shift)}
                      onDetailsPress={() => {
                        setSelectedShiftId(isSelected ? null : shift.id);
                      }}
                    >
                      {isSelected && timeSlots && (
                        <ShiftDetailsView timeSlots={timeSlots} />
                      )}
                    </ShiftListItem>
                  </View>
                );
              })
            ) : (
              <View style={[styles.noShiftContainer, { width: "100%" }]}>
                <Text style={styles.noShiftText}>
                  この月のシフトはありません
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
      <ShiftModal
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        handleReportShift={handleReportShift}
        handleEditShift={handleEditShift}
      />
      <ShiftReportModal
        reportModalVisible={reportModalVisible}
        setReportModalVisible={setReportModalVisible}
        taskCounts={taskCounts}
        comments={comments}
        setComments={setComments}
        modalShift={modalShift}
        fetchShifts={fetchShifts}
        setTaskCounts={setTaskCounts}
      />
      <TaskModal
        isTaskModalVisible={isTaskModalVisible}
        handleTaskModalClose={handleTaskModalClose}
        selectedTask={selectedTask}
        taskCounts={taskCounts}
        handleTaskUpdate={handleTaskUpdate}
        timeOptions={timeOptions}
      />
      <ShiftRuleValuePicker
        visible={picker === "time"}
        values={timeOptions}
        value={taskCounts[selectedTask!]?.time || 0}
        unit="分"
        title="時間選択"
        onSelect={(v: number) => handleTaskUpdate(selectedTask!, "time", v)}
        onClose={() => setPicker(null)}
      />
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
      </Modal>

      {/* シフト確定確認モーダル */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setShowConfirmModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 24,
              margin: 20,
              maxWidth: 320,
              width: "90%",
            }}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text.primary,
              textAlign: "center",
              marginBottom: 12,
            }}>
              シフト確定
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: colors.text.secondary,
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 22,
            }}>
              現在提出しているシフトで一旦確定でよろしいですか？
            </Text>

            <View style={{
              flexDirection: "row",
              gap: 12,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.border,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={{
                  color: colors.text.primary,
                  fontSize: 16,
                  fontWeight: "600",
                }}>
                  キャンセル
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
                onPress={handleConfirmComplete}
              >
                <Text style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                }}>
                  決定
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
