import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ServiceProvider } from "@/services/ServiceProvider";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import TimeSelect from "@/modules/user-view/user-shift-forms/TimeSelect";
import CalendarModal from "@/modules/reusable-widgets/calendar/modals/CalendarModal";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import type { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";
import { useAuth } from "@/services/auth/useAuth";
import type { ExtendedUser } from "@/modules/reusable-widgets/user-management/user-types/components";
import { MasterHeader } from "@/common/common-ui/ui-layout";
// import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { UserData } from "@/common/common-models/model-user/UserModel";
import { Picker } from "@react-native-picker/picker";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { styles } from "./MasterShiftCreate.styles";
import { ShiftData, MasterShiftCreateProps } from "./MasterShiftCreate.types";

export const MasterShiftCreate: React.FC<MasterShiftCreateProps> = ({
  mode,
  shiftId,
  date,
  startTime,
  endTime,
  classes,
}) => {
  const router = useRouter();
  const { markShiftAsDeleted, createShift } = useShift();
  const isEditMode = mode === "edit";
  const { user, role } = useAuth();
  const { users, loading: usersLoading } = useUsers(user?.storeId);
  const [connectedStoreUsers, setConnectedStoreUsers] = useState<
    Array<{
      uid: string;
      nickname: string;
      email: string;
      role: string;
      storeId: string;
      storeName: string;
      isFromOtherStore: boolean;
    }>
  >([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [existingShift, setExistingShift] = useState<Shift | null>(null);
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: startTime || "",
    endTime: endTime || "",
    dates: date ? [date] : [],
    hasClass: classes ? JSON.parse(classes).length > 0 : false,
    classes: classes ? JSON.parse(classes) : [],
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserNickname, setSelectedUserNickname] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<ShiftStatus>("approved");
  const [showUserPicker, setShowUserPicker] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState(date || "");
  const [selectedStartTime, setSelectedStartTime] = useState(startTime || "");
  const [selectedEndTime, setSelectedEndTime] = useState(endTime || "");
  const [selectedClasses, setSelectedClasses] = useState<any[]>(() => {
    if (classes) {
      try {
        return JSON.parse(classes);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // ユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const fetchedUserData = await ServiceProvider.users.getUserData(user.uid);
        if (fetchedUserData) {
          setUserData(fetchedUserData as unknown as UserData);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // 連携校舎のユーザーを取得
  useEffect(() => {
    const fetchConnectedStoreUsers = async () => {
      if (!user?.uid) return;

      // 現在のユーザー情報からstoreIdを取得
      const currentUser = users.find((u) => u.uid === user.uid);
      if (!currentUser?.storeId) return;

      try {
        const connectedUsers = await ServiceProvider.multiStore.getConnectedStoreUsers(
          currentUser.storeId
        );
        setConnectedStoreUsers(connectedUsers);
      } catch (error) {
      }
    };

    fetchConnectedStoreUsers();
  }, [user?.uid, users]);

  // 編集モードの場合、既存のシフト情報を取得
  useEffect(() => {
    const fetchExistingShift = async () => {
      if (!isEditMode || !shiftId) return;

      try {
        setIsLoading(true);
        const shiftData = await ServiceProvider.shifts.getShift(shiftId);
        if (shiftData) {
          setExistingShift(shiftData);

          // 既存のシフトのユーザーを選択
          setSelectedUserId(shiftData.userId || "");
          setSelectedUserNickname(shiftData.nickname || "");
          setSelectedStatus(shiftData.status);

          setShiftData({
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            dates: [shiftData.date],
            hasClass: shiftData.type === "class",
            classes: shiftData.classes || [],
          });
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingShift();
  }, [isEditMode, shiftId]);

  // 日付確認ハンドラ
  const handleDatesConfirm = (dates: string[]) => {
    setShiftData({
      ...shiftData,
      dates,
    });
    setShowCalendar(false);
  };

  // シフト作成ハンドラ
  const handleCreateShift = async () => {
    // 必須項目チェック
    if (!selectedUserId) {
      setErrorMessage("ユーザーを選択してください");
      return;
    }

    if (shiftData.dates.length === 0) {
      setErrorMessage("日付を選択してください");
      return;
    }

    if (!shiftData.startTime || !shiftData.endTime) {
      setErrorMessage("時間を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // ユーザーのニックネーム取得
      let nickname = selectedUserNickname;
      if (!nickname) {
        const selectedUser = users.find((u) => u.uid === selectedUserId);
        if (selectedUser) {
          nickname = selectedUser.nickname;
          setSelectedUserNickname(nickname);
        }
      }

      const totalDays = shiftData.dates.length;
      let completedCount = 0;

      // 募集シフトか通常シフトかを判定
      if (selectedUserId === "recruitment") {
        // 募集シフトを各日付に登録（並列処理）
        const createPromises = shiftData.dates.map(async (date) => {
          const recruitmentShift = {
            storeId: user?.storeId || "",
            date,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            subject: "", // 必要に応じて教科を追加
            notes: "", // 必要に応じてメモを追加
            createdBy: user?.uid || "",
            status: "open" as const,
            maxApplicants: 5, // デフォルト値を設定
          };

          await ServiceProvider.recruitmentShifts.createRecruitmentShift(recruitmentShift);
          completedCount++;
          // プログレス更新は削除（シンプルにする）
        });

        await Promise.all(createPromises);
      } else {
        // 通常のシフトを各日付に登録（並列処理）
        const createPromises = shiftData.dates.map(async (date) => {
          // 時間の差を計算（duration）
          const startTimeDate = new Date(`2000-01-01T${shiftData.startTime}`);
          const endTimeDate = new Date(`2000-01-01T${shiftData.endTime}`);
          const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
          const durationHours =
            Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10; // 小数点第1位まで

          const newShift = {
            userId: selectedUserId,
            storeId: user?.storeId || "", // storeIdを追加
            nickname: nickname,
            date,
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            type: shiftData.hasClass ? ("class" as const) : ("user" as const),
            subject: "", // subjectフィールドを追加
            isCompleted: false, // isCompletedフィールドを追加
            duration: durationHours, // durationフィールドを追加
            classes: shiftData.classes,
            status: selectedStatus, // マスターが選択したステータス
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // useShiftのcreateShiftメソッドを使用
          await createShift(newShift);
          completedCount++;
          // プログレス更新は削除（シンプルにする）
        });

        await Promise.all(createPromises);
      }

      // ローディングを早めに解除
      setIsLoading(false);

      // 成功通知を表示
      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 1.5秒後に通知を消す
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccess(false);
        });
      }, 1500);

      // 入力内容をリセット
      setShiftData({
        startTime: "",
        endTime: "",
        dates: [],
        hasClass: false,
        classes: [],
      });
    } catch (error) {
      setErrorMessage("シフトの作成に失敗しました");
      setIsLoading(false);
    }
  };

  // シフト更新ハンドラ
  const handleUpdateShift = async () => {
    if (!existingShift) return;

    if (shiftData.dates.length === 0) {
      setErrorMessage("日付を選択してください");
      return;
    }

    if (!shiftData.startTime || !shiftData.endTime) {
      setErrorMessage("時間を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // 時間の差を計算（duration）
      const startTimeDate = new Date(`2000-01-01T${shiftData.startTime}`);
      const endTimeDate = new Date(`2000-01-01T${shiftData.endTime}`);
      const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
      const durationHours =
        Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10; // 小数点第1位まで

      const updatedShift = {
        userId: selectedUserId || existingShift.userId,
        storeId: user?.storeId || existingShift.storeId || "", // storeIdを追加
        nickname: selectedUserNickname || existingShift.nickname,
        date: shiftData.dates[0], // 編集では最初の日付のみ使用
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        type: shiftData.hasClass ? ("class" as const) : ("user" as const),
        subject: existingShift.subject || "", // 既存のsubjectを保持
        isCompleted: existingShift.isCompleted || false, // 既存のisCompletedを保持
        duration: durationHours, // 計算されたdurationを設定
        classes: shiftData.classes,
        status: selectedStatus,
        updatedAt: new Date(),
      };

      await ServiceProvider.shifts.updateShift(existingShift.id, updatedShift as Partial<Shift>);

      Alert.alert("更新完了", "シフトを更新しました", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      setErrorMessage("シフトの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // シフト削除ハンドラ
  const handleDelete = () => {
    if (!existingShift) return;

    Alert.alert("シフトを削除", "このシフトを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await markShiftAsDeleted(existingShift.id);
            Alert.alert("削除完了", "シフトを削除しました", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error) {
            setErrorMessage("シフトの削除に失敗しました");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // 日付選択画面を表示
  const handleOpenCalendar = () => {
    setShowCalendar(true);
  };

  // 全ユーザーリスト（本店舗+連携校舎のユーザー）
  const allUsers = [...users, ...connectedStoreUsers];
  

  useEffect(() => {
    const selectedUser = allUsers.find((u) => u.uid === selectedUserId);
    if (selectedUser) {
      setSelectedUserNickname(selectedUser.nickname);
    }
  }, [selectedUserId, allUsers]);

  if (isLoading || usersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { width: screenWidth } = Dimensions.get("window");
  const isPC = screenWidth >= 768;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MasterHeader title={isEditMode ? "シフト編集" : "シフト追加"} />
      <View style={{ 
        flex: 1, 
        alignSelf: 'center', 
        width: isPC ? '60%' : '100%',
        maxWidth: isPC ? 800 : undefined
      }}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* ユーザー選択セクション（マスター用） */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ユーザー選択</Text>
            <TouchableOpacity 
              style={styles.userPickerButton}
              onPress={() => setShowUserPicker(true)}
            >
              <Text style={[
                styles.userPickerText,
                !selectedUserNickname && styles.placeholderText
              ]}>
                {selectedUserNickname || "ユーザーを選択してください"}
              </Text>
              <AntDesign name="down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* ステータス設定セクション（通常シフト用のみ表示） */}
          {selectedUserId !== "recruitment" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ステータス設定</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={(itemValue) =>
                    setSelectedStatus(itemValue as ShiftStatus)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="承認済み" value="approved" />
                  <Picker.Item label="申請中" value="pending" />
                </Picker>
              </View>
            </View>
          )}

          {/* 募集シフト用ステータス表示 */}
          {selectedUserId === "recruitment" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ステータス</Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.selected }]}>
                <Text style={{ 
                  padding: 16, 
                  fontSize: 16, 
                  color: colors.primary, 
                  fontWeight: "600" 
                }}>
                  募集中
                </Text>
              </View>
            </View>
          )}

          {/* スタッフ時間セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>スタッフ時間</Text>
            <TimeSelect
              startTime={shiftData.startTime}
              endTime={shiftData.endTime}
              onStartTimeChange={(time: string) =>
                setShiftData((prev) => ({ ...prev, startTime: time }))
              }
              onEndTimeChange={(time: string) =>
                setShiftData((prev) => ({ ...prev, endTime: time }))
              }
            />
          </View>

          {/* 日付選択セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>日付選択</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={handleOpenCalendar}
            >
              <Text style={styles.dateText}>
                {shiftData.dates.length > 0
                  ? `${shiftData.dates.length}日選択中`
                  : "日付を選択"}
              </Text>
            </TouchableOpacity>
            {shiftData.dates.length > 0 && (
              <View style={styles.selectedDatesContainer}>
                {shiftData.dates.sort().map((date) => (
                  <View key={date} style={styles.selectedDateCard}>
                    <Text style={styles.selectedDateText}>{`${format(
                      new Date(date),
                      "yyyy年M月d日(E)",
                      {
                        locale: ja,
                      }
                    )}`}</Text>
                    <TouchableOpacity
                      style={styles.removeDateButton}
                      onPress={() =>
                        setShiftData((prev) => ({
                          ...prev,
                          dates: prev.dates.filter((d) => d !== date),
                        }))
                      }
                    >
                      <Text style={styles.removeDateText}>削除</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 授業時間セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>授業時間</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() =>
                setShiftData((prev) => ({ ...prev, hasClass: !prev.hasClass }))
              }
            >
              <Text style={styles.toggleButtonText}>
                {shiftData.hasClass ? "授業あり" : "授業なし"}
              </Text>
            </TouchableOpacity>
            {shiftData.hasClass && (
              <View style={styles.classesContainer}>
                {shiftData.classes.map((classTime, index) => (
                  <View key={index} style={styles.classTimeContainer}>
                    <TimeSelect
                      startTime={classTime.startTime}
                      endTime={classTime.endTime}
                      onStartTimeChange={(time: string) => {
                        setShiftData((prev) => ({
                          ...prev,
                          classes: prev.classes.map((c, i) =>
                            i === index ? { ...c, startTime: time } : c
                          ),
                        }));
                      }}
                      onEndTimeChange={(time: string) => {
                        setShiftData((prev) => ({
                          ...prev,
                          classes: prev.classes.map((c, i) =>
                            i === index ? { ...c, endTime: time } : c
                          ),
                        }));
                      }}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() =>
                        setShiftData((prev) => ({
                          ...prev,
                          classes: prev.classes.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <AntDesign
                        name="close"
                        size={20}
                        color={colors.text.primary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                    setShiftData((prev) => ({
                      ...prev,
                      classes: [
                        ...prev.classes,
                        { startTime: "", endTime: "" },
                      ],
                    }))
                  }
                >
                  <AntDesign name="plus-circle" size={22} color="#fff" />
                  <Text style={styles.addButtonText}>授業を追加</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ボタン */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={isEditMode ? handleUpdateShift : handleCreateShift}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isEditMode ? "更新する" : "保存する"}
            </Text>
          </TouchableOpacity>

          {isEditMode && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>シフトを削除</Text>
            </TouchableOpacity>
          )}
      </ScrollView>
      </View>

      <CalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          onConfirm={handleDatesConfirm}
          initialDates={shiftData.dates}
        />

      {showSuccess && (
          <Animated.View
            style={[
              styles.successMessage,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.successText}>シフトを追加しました！</Text>
          </Animated.View>
        )}

      {/* ユーザー選択ドロップダウン */}
      {showUserPicker && (
          <TouchableOpacity 
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowUserPicker(false)}
          >
            <View style={[
              styles.dropdownContainer,
              {
                width: isPC ? '60%' : '90%',
                maxWidth: isPC ? 800 : undefined,
                alignSelf: 'center'
              }
            ]}>
              <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                {/* 募集シフトオプション */}
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    styles.recruitmentItem,
                  ]}
                  onPress={() => {
                    setSelectedUserId("recruitment");
                    setSelectedUserNickname("募集");
                    setShowUserPicker(false);
                  }}
                >
                  <AntDesign name="bell" size={18} color={colors.primary} />
                  <Text style={[styles.dropdownItemText, styles.recruitmentText]}>
                    募集シフトとして作成
                  </Text>
                </TouchableOpacity>

                {/* ユーザーリスト */}
                {allUsers.length === 0 ? (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.noResultsText}>
                      ユーザーが見つかりません
                    </Text>
                  </View>
                ) : (
                  allUsers.map((user) => (
                    <TouchableOpacity
                      key={user.uid}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedUserId(user.uid);
                        setSelectedUserNickname(user.nickname);
                        setShowUserPicker(false);
                      }}
                    >
                      <AntDesign name="user" size={16} color="#666" />
                      <View style={styles.dropdownUserInfo}>
                        <Text style={styles.dropdownItemText}>
                          {user.nickname}
                        </Text>
                        <Text style={styles.dropdownUserRole}>
                          {user.role === "master" ? "管理者" : "ユーザー"}
                          {"storeName" in user &&
                            user.storeName &&
                            user.isFromOtherStore && (
                              ` - ${user.storeName}`
                            )}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        )}
    </View>
  );
};
