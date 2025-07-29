import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";

interface EditShiftModalViewProps {
  visible: boolean;
  newShiftData: any;
  users: { uid: string; nickname: string }[];
  timeOptions: string[];
  statusConfigs: any[];
  isLoading: boolean;
  styles: any;
  onChange: (field: string, value: any) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (shift: any) => void;
  extendedTasks?: any[]; // 既存タスクのリスト
}

interface ClassTime {
  startTime: string;
  endTime: string;
}

// ステータスピッカーはroleがmasterのときのみ表示、それ以外は非表示
export const EditShiftModalView: React.FC<EditShiftModalViewProps> = (
  props
) => {
  const { user, role } = useAuth();
  const {
    visible,
    newShiftData,
    users,
    timeOptions,
    statusConfigs,
    isLoading,
    styles,
    onChange,
    onClose,
    onSave,
    onDelete,
    extendedTasks = [],
  } = props;

  const [isAddingClassTime, setIsAddingClassTime] = React.useState(false);
  const [isManagingTasks, setIsManagingTasks] = React.useState(false); // New state for task management modal
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [selectedTaskTemplate, setSelectedTaskTemplate] = React.useState<
    string | null
  >(null);
  const [tempTaskStartTime, setTempTaskStartTime] = React.useState(
    newShiftData.startTime
  );
  const [tempTaskEndTime, setTempTaskEndTime] = React.useState(
    newShiftData.endTime
  );
  const [customTaskTitle, setCustomTaskTitle] = React.useState(""); // カスタムタスクのタイトル

  // 時間をminutes（分）に変換するヘルパー関数
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // タスク時間のバリデーション
  const isTaskTimeValid = React.useMemo(() => {
    const shiftStartMinutes = timeToMinutes(newShiftData.startTime);
    const shiftEndMinutes = timeToMinutes(newShiftData.endTime);
    const taskStartMinutes = timeToMinutes(tempTaskStartTime);
    const taskEndMinutes = timeToMinutes(tempTaskEndTime);

    const isStartValid = taskStartMinutes >= shiftStartMinutes;
    const isEndValid = taskEndMinutes <= shiftEndMinutes;
    const isOrderValid = taskStartMinutes < taskEndMinutes;

    return {
      isValid: isStartValid && isEndValid && isOrderValid,
      errors: {
        startTooEarly: !isStartValid,
        endTooLate: !isEndValid,
        invalidOrder: !isOrderValid,
      },
    };
  }, [
    tempTaskStartTime,
    tempTaskEndTime,
    newShiftData.startTime,
    newShiftData.endTime,
  ]);

  // 既存タスクから重複を除いてユニークなタスクを取得
  const uniqueExistingTasks = React.useMemo(() => {
    if (!extendedTasks || !Array.isArray(extendedTasks)) {
      return [];
    }
    const existingTaskTitles = new Set();
    const uniqueTasks = [];
    for (const task of extendedTasks) {
      if (task && task.title && !existingTaskTitles.has(task.title)) {
        existingTaskTitles.add(task.title);
        uniqueTasks.push(task);
      }
    }
    return uniqueTasks;
  }, [extendedTasks]);

  const handleAddTask = () => {
    if (!isTaskTimeValid.isValid) {
      return;
    }

    const selectedTask = uniqueExistingTasks.find(
      (task) => task.title === selectedTaskTemplate
    );

    const taskTitle =
      selectedTaskTemplate === "カスタムタスク"
        ? customTaskTitle || "新しいタスク"
        : selectedTaskTemplate;

    const newTask = {
      id: `task_${Date.now()}_${Math.random()}`,
      taskId: `extended_task_${Date.now()}`,
      startTime: tempTaskStartTime,
      endTime: tempTaskEndTime,
      title: taskTitle,
      shortName:
        selectedTask?.shortName ||
        (selectedTaskTemplate === "カスタムタスク"
          ? (taskTitle || "T").charAt(0)
          : (selectedTaskTemplate || "T").charAt(0)),
      color: selectedTask?.color || "#4CAF50",
      icon: selectedTask?.icon || "checkmark-circle-outline",
      status: "pending",
      createdAt: new Date(),
    };
    const updated = [...(newShiftData.extendedTasks || [])];
    updated.push(newTask);
    onChange("extendedTasks", updated);
    setSelectedTaskTemplate(null);
    setCustomTaskTitle("");
    setIsAddingTask(false);
    setIsManagingTasks(true); // Return to the task management screen
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
          {isAddingClassTime ? (
            // 授業時間追加モーダル
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>授業時間を追加</Text>

              {(newShiftData.classes || []).map(
                (classTime: ClassTime, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timeInputLabel}>開始</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={classTime.startTime}
                          onValueChange={(v) => {
                            const updated = [...(newShiftData.classes || [])];
                            updated[idx] = { ...updated[idx], startTime: v };
                            onChange("classes", updated);
                          }}
                          style={styles.picker}
                        >
                          {timeOptions.map((time) => (
                            <Picker.Item key={time} label={time} value={time} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    <Text style={styles.timeInputSeparator}>～</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timeInputLabel}>終了</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={classTime.endTime}
                          onValueChange={(v) => {
                            const updated = [...(newShiftData.classes || [])];
                            updated[idx] = { ...updated[idx], endTime: v };
                            onChange("classes", updated);
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
                      style={{ marginLeft: 8 }}
                      onPress={() => {
                        const updated = [...(newShiftData.classes || [])];
                        updated.splice(idx, 1);
                        onChange("classes", updated);
                      }}
                    >
                      <Text style={{ color: "#FF4444", fontWeight: "bold" }}>
                        削除
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              )}

              <TouchableOpacity
                style={{ marginTop: 10, alignSelf: "flex-start" }}
                onPress={() => {
                  const updated = [...(newShiftData.classes || [])];
                  updated.push({
                    startTime: newShiftData.startTime,
                    endTime: newShiftData.endTime,
                  });
                  onChange("classes", updated);
                }}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  ＋授業時間を追加
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 20, alignSelf: "center" }}
                onPress={() => setIsAddingClassTime(false)}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  シフト編集に戻る
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : isManagingTasks ? (
            // Task Management Modal
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>登録済みタスク</Text>
              {newShiftData.extendedTasks &&
              newShiftData.extendedTasks.length > 0 ? (
                newShiftData.extendedTasks.map((task: any, index: number) => (
                  <View
                    key={`task-${index}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#f8f9fa",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: task.color || "#4CAF50",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                        {task.title}
                      </Text>
                      <Text style={{ color: "#666", fontSize: 12 }}>
                        {task.startTime} ～ {task.endTime}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        const updated = [...(newShiftData.extendedTasks || [])];
                        updated.splice(index, 1);
                        onChange("extendedTasks", updated);
                      }}
                      style={{
                        backgroundColor: "#FF4444",
                        borderRadius: 4,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>削除</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    marginVertical: 20,
                    color: "#666",
                  }}
                >
                  登録済みのタスクはありません。
                </Text>
              )}

              <TouchableOpacity
                style={{ marginTop: 10, alignSelf: "flex-start" }}
                onPress={() => {
                  setIsManagingTasks(false);
                  setIsAddingTask(true);
                  setSelectedTaskTemplate(null);
                }}
              >
                <Text style={{ color: "#FF9800", fontWeight: "bold" }}>
                  ＋新しいタスクを追加
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 20, alignSelf: "center" }}
                onPress={() => setIsManagingTasks(false)}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  シフト編集に戻る
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : isAddingTask ? (
            // タスク追加モーダル
            selectedTaskTemplate ? (
              // タスク詳細設定画面
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>タスクの詳細を設定</Text>
                <Text style={styles.modalSubtitle}>
                  選択されたタスク: {selectedTaskTemplate}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { fontSize: 14, color: "#666", marginTop: 5 },
                  ]}
                >
                  シフト時間: {newShiftData.startTime}～{newShiftData.endTime}
                </Text>

                {selectedTaskTemplate === "カスタムタスク" && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={styles.timeInputLabel}>タスク名</Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: "#ddd",
                        borderRadius: 4,
                        padding: 10,
                        marginTop: 5,
                        backgroundColor: "white",
                      }}
                      value={customTaskTitle}
                      onChangeText={setCustomTaskTitle}
                      placeholder="タスク名を入力してください"
                    />
                  </View>
                )}

                <View style={styles.timeInputContainer}>
                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeInputLabel}>開始時間</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={tempTaskStartTime}
                        onValueChange={setTempTaskStartTime}
                        style={styles.picker}
                      >
                        {timeOptions.map((time) => (
                          <Picker.Item key={time} label={time} value={time} />
                        ))}
                      </Picker>
                    </View>
                    {isTaskTimeValid.errors.startTooEarly && (
                      <Text
                        style={{ color: "#FF4444", fontSize: 12, marginTop: 4 }}
                      >
                        開始時間はシフト開始時間（{newShiftData.startTime}
                        ）以降に設定してください
                      </Text>
                    )}
                  </View>

                  <Text style={styles.timeInputSeparator}>～</Text>

                  <View style={styles.timeInputGroup}>
                    <Text style={styles.timeInputLabel}>終了時間</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={tempTaskEndTime}
                        onValueChange={setTempTaskEndTime}
                        style={styles.picker}
                      >
                        {timeOptions.map((time) => (
                          <Picker.Item key={time} label={time} value={time} />
                        ))}
                      </Picker>
                    </View>
                    {isTaskTimeValid.errors.endTooLate && (
                      <Text
                        style={{ color: "#FF4444", fontSize: 12, marginTop: 4 }}
                      >
                        終了時間はシフト終了時間（{newShiftData.endTime}
                        ）以前に設定してください
                      </Text>
                    )}
                    {isTaskTimeValid.errors.invalidOrder && (
                      <Text
                        style={{ color: "#FF4444", fontSize: 12, marginTop: 4 }}
                      >
                        終了時間は開始時間より後に設定してください
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    alignSelf: "center",
                    backgroundColor: isTaskTimeValid.isValid
                      ? "#4CAF50"
                      : "#FF4444",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    opacity: isTaskTimeValid.isValid ? 1 : 0.7,
                  }}
                  onPress={handleAddTask}
                  disabled={!isTaskTimeValid.isValid}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {isTaskTimeValid.isValid
                      ? "タスクを追加"
                      : "時間設定エラー"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginTop: 20, alignSelf: "center" }}
                  onPress={() => {
                    setSelectedTaskTemplate(null);
                    setCustomTaskTitle("");
                  }}
                >
                  <Text style={{ color: "#666", fontWeight: "bold" }}>
                    タスク選択に戻る
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              // タスク選択画面
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>タスクを選択</Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { fontSize: 14, color: "#666", marginBottom: 10 },
                  ]}
                >
                  シフト時間: {newShiftData.startTime}～{newShiftData.endTime}
                </Text>

                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.timeInputLabel}>自由記述</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#e9ecef",
                      marginTop: 5,
                    }}
                    onPress={() => {
                      setSelectedTaskTemplate("カスタムタスク");
                    }}
                  >
                    <Text style={{ color: "#495057", fontSize: 16 }}>
                      カスタムタスクを追加
                    </Text>
                  </TouchableOpacity>
                </View>

                {uniqueExistingTasks.length > 0 && (
                  <>
                    <Text style={styles.timeInputLabel}>
                      既存タスクから選択
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 10,
                        marginTop: 10,
                        marginBottom: 20,
                      }}
                    >
                      {uniqueExistingTasks.map((task, index) => (
                        <TouchableOpacity
                          key={`existing-${index}`}
                          style={{
                            backgroundColor: "#e8f5e8",
                            borderRadius: 8,
                            padding: 12,
                            width: "48%",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#4caf50",
                          }}
                          onPress={() => setSelectedTaskTemplate(task.title)}
                        >
                          <Text
                            style={{ color: "#2e7d32", fontWeight: "bold" }}
                          >
                            {task.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={{ marginTop: 20, alignSelf: "center" }}
                  onPress={() => setIsAddingTask(false)}
                >
                  <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                    シフト編集に戻る
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )
          ) : (
            // メインのシフト編集画面
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>シフト編集</Text>
              <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ユーザー</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newShiftData.userId}
                    onValueChange={(itemValue) => {
                      const user = users.find((u) => u.uid === itemValue);
                      onChange("userId", itemValue);
                      onChange("nickname", user ? user.nickname : "未選択");
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="ユーザーを選択" value="" />
                    {users.map((user) => (
                      <Picker.Item
                        key={user.uid}
                        label={user.nickname}
                        value={user.uid}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.timeInputContainer}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeInputLabel}>開始時間</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newShiftData.startTime}
                      onValueChange={(itemValue) =>
                        onChange("startTime", itemValue)
                      }
                      style={styles.picker}
                    >
                      {timeOptions.map((time) => (
                        <Picker.Item key={time} label={time} value={time} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <Text style={styles.timeInputSeparator}>～</Text>

                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeInputLabel}>終了時間</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newShiftData.endTime}
                      onValueChange={(itemValue) =>
                        onChange("endTime", itemValue)
                      }
                      style={styles.picker}
                    >
                      {timeOptions.map((time) => (
                        <Picker.Item key={time} label={time} value={time} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              {role === "master" && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>ステータス</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newShiftData.status}
                      onValueChange={(itemValue) =>
                        onChange("status", itemValue)
                      }
                      style={styles.picker}
                    >
                      {statusConfigs.map((config) => (
                        <Picker.Item
                          key={config.status}
                          label={config.label}
                          value={config.status}
                        />
                      ))}
                    </Picker>
                    <Text
                      style={[
                        styles.formLabel,
                        { color: "#FF4444", fontWeight: "bold", fontSize: 12 },
                      ]}
                    >
                      ・講師を変える場合は新しく追加しなおした後このシフトを削除してください。
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={{ marginBottom: 10, alignSelf: "center" }}
                onPress={() => setIsAddingClassTime(true)}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  授業時間を追加
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginBottom: 20, alignSelf: "center" }}
                onPress={() => setIsManagingTasks(true)}
              >
                <Text style={{ color: "#FF9800", fontWeight: "bold" }}>
                  タスクを管理
                </Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: "#FF4444", marginRight: 8 },
                  ]}
                  onPress={() => onDelete(newShiftData)}
                  disabled={isLoading}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    削除
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={onSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>更新</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
