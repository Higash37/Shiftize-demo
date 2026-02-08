import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Button from "@/common/common-ui/ui-forms/FormButton";
import TextInput from "@/common/common-ui/ui-forms/FormInput";
import {
  ShiftStatus,
  ClassTimeSlot,
  DEFAULT_SHIFT_STATUS_CONFIG,
} from "@/common/common-models/ModelIndex";
import { MultiStoreService } from "@/services/firebase/firebase-multistore";
import { useAuth } from "@/services/auth/useAuth";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";

// 時間オプション生成（15分刻み）
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 9; hour <= 22; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:15`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
    options.push(`${hour.toString().padStart(2, "0")}:45`);
  }
  return options;
};

export interface ShiftData {
  id?: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  subject?: string;
  status?: ShiftStatus;
  classes?: ClassTimeSlot[];
}

export interface ShiftModalProps {
  visible: boolean;
  mode: "create" | "edit" | "delete";
  shiftData?: ShiftData;
  date?: string;
  users: Array<{ uid: string; nickname: string; color?: string }>;
  onClose: () => void;
  onSave?: (data: ShiftData) => void;
  onDelete?: (shiftId: string) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  visible,
  mode,
  shiftData,
  date,
  users,
  onClose,
  onSave,
  onDelete,
}) => {
  const { user } = useAuth();
  const { users: localUsers } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<ShiftStatus>("approved");
  const [classes, setClasses] = useState<ClassTimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
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

  const timeOptions = generateTimeOptions();

  // 連携校舎のユーザーを取得
  useEffect(() => {
    const fetchConnectedStoreUsers = async () => {
      if (!user?.uid) return;

      try {
        // 現在のユーザーのstoreIdを取得
        const currentUser = localUsers.find((u) => u.uid === user.uid);
        if (!currentUser?.storeId) return;

        const users = await MultiStoreService.getConnectedStoreUsers(
          currentUser.storeId
        );
        setConnectedStoreUsers(users);
      } catch (error) {
      }
    };

    if (visible) {
      fetchConnectedStoreUsers();
    }
  }, [visible, user?.uid, localUsers]);

  // モーダルが開かれた時にデータを初期化
  useEffect(() => {
    if (visible) {
      if (mode === "create") {
        setSelectedUserId("");
        setStartTime("09:00");
        setEndTime("17:00");
        setSubject("");
        setStatus("approved");
        setClasses([]);
      } else if (mode === "edit" && shiftData) {
        setSelectedUserId(shiftData.userId);
        setStartTime(shiftData.startTime.substring(0, 5)); // HH:MM形式
        setEndTime(shiftData.endTime.substring(0, 5));
        setSubject(shiftData.subject || "");
        setStatus(shiftData.status || "approved");
        setClasses(shiftData.classes || []);
      }
    }
  }, [visible, mode, shiftData]);

  const getModalTitle = () => {
    const dateStr = date || shiftData?.date || "";
    const formattedDate = dateStr
      ? format(new Date(dateStr), "M月d日(E)", { locale: ja })
      : "";

    switch (mode) {
      case "create":
        return `シフト作成 - ${formattedDate}`;
      case "edit":
        return `シフト編集 - ${formattedDate}`;
      case "delete":
        return `シフト削除 - ${formattedDate}`;
      default:
        return "シフト管理";
    }
  };

  const validateForm = () => {
    if (!selectedUserId) {
      Alert.alert("エラー", "スタッフを選択してください");
      return false;
    }
    if (!startTime || !endTime) {
      Alert.alert("エラー", "開始時間と終了時間を入力してください");
      return false;
    }
    if (startTime >= endTime) {
      Alert.alert("エラー", "終了時間は開始時間より後に設定してください");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data: ShiftData = {
        ...(shiftData?.id && { id: shiftData.id }),
        userId: selectedUserId,
        date: date || shiftData?.date || "",
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        subject: subject.trim(),
        status: status,
        classes: classes,
      };

      await onSave?.(data);
      onClose();
    } catch (error) {
      Alert.alert("エラー", "シフトの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!shiftData?.id) return;

    Alert.alert("シフト削除", "このシフトを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await onDelete?.(shiftData.id!);
            onClose();
          } catch (error) {
            Alert.alert("エラー", "シフトの削除に失敗しました");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderUserSelector = () => {
    // 本店舗と連携校舎のユーザーを統合
    const allUsers = [...users, ...connectedStoreUsers];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>スタッフ</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.userScrollView}
          contentContainerStyle={styles.userScrollContent}
        >
          {allUsers.map((user) => (
            <TouchableOpacity
              key={user.uid}
              style={[
                styles.userChip,
                selectedUserId === user.uid && styles.userChipSelected,
                {
                  borderColor:
                    ("color" in user ? user.color : null) || colors.primary,
                },
              ]}
              onPress={() => setSelectedUserId(user.uid)}
            >
              <Text
                style={[
                  styles.userChipText,
                  selectedUserId === user.uid && styles.userChipTextSelected,
                ]}
              >
                {user.nickname}
                {"storeName" in user &&
                  user.storeName &&
                  user.isFromOtherStore && (
                    <Text style={styles.storeNameText}>
                      {" "}
                      - {user.storeName}
                    </Text>
                  )}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTimeInputs = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>時間</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeInputContainer}>
          <Text style={styles.timeLabel}>開始</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={startTime}
              onValueChange={setStartTime}
              style={styles.picker}
            >
              {timeOptions.map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>
          </View>
        </View>
        <Text style={styles.timeSeparator}>〜</Text>
        <View style={styles.timeInputContainer}>
          <Text style={styles.timeLabel}>終了</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={endTime}
              onValueChange={setEndTime}
              style={styles.picker}
            >
              {timeOptions.map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStatusSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ステータス</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={status}
          onValueChange={setStatus}
          style={styles.picker}
        >
          {DEFAULT_SHIFT_STATUS_CONFIG.map((config) => (
            <Picker.Item
              key={config.status}
              label={config.label}
              value={config.status}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderClassTimesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>授業時間（任意・複数可）</Text>
      {classes.map((classTime, idx) => (
        <View key={idx} style={styles.classTimeRow}>
          <View style={styles.classTimeInputContainer}>
            <Text style={styles.timeLabel}>開始</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={classTime.startTime}
                onValueChange={(value) => {
                  const updated = [...classes];
                  updated[idx] = { ...updated[idx], startTime: value, endTime: updated[idx]?.endTime || "" };
                  setClasses(updated);
                }}
                style={styles.picker}
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
          <Text style={styles.timeSeparator}>〜</Text>
          <View style={styles.classTimeInputContainer}>
            <Text style={styles.timeLabel}>終了</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={classTime.endTime}
                onValueChange={(value) => {
                  const updated = [...classes];
                  updated[idx] = { ...updated[idx], endTime: value, startTime: updated[idx]?.startTime || "" };
                  setClasses(updated);
                }}
                style={styles.picker}
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteClassButton}
            onPress={() => {
              const updated = [...classes];
              updated.splice(idx, 1);
              setClasses(updated);
            }}
          >
            <Text style={styles.deleteClassText}>削除</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={styles.addClassButton}
        onPress={() => {
          const newClass: ClassTimeSlot = {
            startTime: startTime,
            endTime: endTime,
          };
          setClasses([...classes, newClass]);
        }}
      >
        <Text style={styles.addClassText}>＋授業時間を追加</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSubjectInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>業務内容（任意）</Text>
      <TextInput
        value={subject}
        onChangeText={setSubject}
        placeholder="業務内容を入力"
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        style={styles.subjectInput}
      />
    </View>
  );

  const renderDeleteConfirmation = () => {
    const allUsers = [...users, ...connectedStoreUsers];
    const user = allUsers.find((u) => u.uid === shiftData?.userId);
    return (
      <View style={styles.deleteContainer}>
        <MaterialIcons name="warning" size={48} color={colors.error} />
        <Text style={styles.deleteTitle}>シフトを削除しますか？</Text>
        <View style={styles.deleteInfo}>
          <Text style={styles.deleteInfoText}>
            スタッフ: {user?.nickname || "不明"}
            {user &&
              "storeName" in user &&
              user.storeName &&
              user.isFromOtherStore &&
              ` - ${user.storeName}`}
          </Text>
          <Text style={styles.deleteInfoText}>
            時間: {shiftData?.startTime.substring(0, 5)} -{" "}
            {shiftData?.endTime.substring(0, 5)}
          </Text>
          {shiftData?.subject && (
            <Text style={styles.deleteInfoText}>業務: {shiftData.subject}</Text>
          )}
        </View>
        <Text style={styles.deleteWarning}>この操作は取り消せません。</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{getModalTitle()}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* コンテンツ */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {mode === "delete" ? (
            renderDeleteConfirmation()
          ) : (
            <>
              {renderUserSelector()}
              {renderTimeInputs()}
              {renderStatusSelector()}
              {renderClassTimesSection()}
              {renderSubjectInput()}
            </>
          )}
        </ScrollView>

        {/* ボタン */}
        <View style={styles.buttonContainer}>
          {mode === "delete" ? (
            <>
              <Button
                title="キャンセル"
                onPress={onClose}
                variant="outline"
                style={styles.button}
              />
              <Button
                title="削除"
                onPress={handleDelete}
                variant="secondary"
                loading={loading}
                style={[styles.button, styles.deleteButton]}
              />
            </>
          ) : (
            <>
              <Button
                title="キャンセル"
                onPress={onClose}
                variant="outline"
                style={styles.button}
              />
              <Button
                title={mode === "create" ? "作成" : "更新"}
                onPress={handleSave}
                loading={loading}
                style={styles.button}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.padding.large,
    paddingVertical: layout.padding.medium,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  closeButton: {
    padding: layout.padding.small,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: layout.padding.large,
  },
  section: {
    marginBottom: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  userScrollView: {
    flexGrow: 0,
  },
  userScrollContent: {
    paddingRight: layout.padding.medium,
  },
  userChip: {
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    marginRight: layout.padding.small,
    borderRadius: layout.borderRadius.large,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  userChipSelected: {
    backgroundColor: colors.primary + "15",
  },
  userChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  userChipTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeInputContainer: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
    marginHorizontal: layout.padding.medium,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1.5,
    borderColor: colors.text.secondary + "40",
    overflow: "hidden",
    minHeight: 44,
    ...shadows.small,
  },
  picker: {
    height: 44,
    width: "100%",
  },
  classTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.small,
    backgroundColor: colors.surface,
    padding: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.text.secondary + "20",
    ...shadows.small,
  },
  classTimeInputContainer: {
    flex: 1,
    alignItems: "center",
  },
  deleteClassButton: {
    marginLeft: layout.padding.small,
    padding: layout.padding.small,
    backgroundColor: colors.error + "15",
    borderRadius: layout.borderRadius.small,
  },
  deleteClassText: {
    color: colors.error,
    fontWeight: "600",
    fontSize: 14,
  },
  // 授業時間関連スタイル
  addClassButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: layout.padding.small,
    alignSelf: "flex-start",
    padding: layout.padding.small,
    backgroundColor: colors.primary + "15",
    borderRadius: layout.borderRadius.small,
  },
  addClassText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  // 科目入力スタイル
  subjectInput: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.medium,
    fontSize: 16,
    color: colors.text.primary,
    textAlignVertical: "top",
    minHeight: 80,
  },
  // 削除確認スタイル
  deleteContainer: {
    alignItems: "center",
    padding: layout.padding.xlarge,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: layout.padding.medium,
    marginBottom: layout.padding.large,
  },
  deleteInfo: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: layout.padding.large,
    width: "100%",
  },
  deleteInfoText: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  deleteWarning: {
    fontSize: 14,
    color: colors.error,
    fontWeight: "600",
    textAlign: "center",
  },
  // ボタンスタイル
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: layout.padding.large,
    paddingVertical: layout.padding.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  button: {
    flex: 1,
    marginHorizontal: layout.padding.small,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  storeNameText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
});
