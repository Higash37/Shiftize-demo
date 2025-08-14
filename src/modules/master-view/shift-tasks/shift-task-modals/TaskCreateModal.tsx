import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createTask } from "@/services/firebase/firebase-extended-task";
import { updateShift, getShifts } from "@/services/firebase/firebase-shift";
import {
  TaskType,
  TaskTag,
  TaskLevel,
  TimeRange,
  ShiftTaskSlot,
} from "@/common/common-models/model-shift/shiftTypes";
import { useTaskCreateModalStyles } from "./TaskCreateModal.styles";

interface TaskCreateModalProps {
  visible: boolean;
  storeId: string;
  onClose: () => void;
  onTaskCreated: () => void;
  initialShiftId?: string; // 初期シフトIDを追加
  initialShiftData?: {
    date: string;
    startTime: string;
    endTime: string;
    userId: string;
  }; // 初期シフトデータを追加
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  visible,
  storeId,
  onClose,
  onTaskCreated,
  initialShiftId,
  initialShiftData,
}) => {
  const styles = useTaskCreateModalStyles();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [formData, setFormData] = useState({
    title: "",
    shortName: "",
    description: "",
    type: "standard" as TaskType,
    baseTimeMinutes: 30,
    baseCountPerShift: 1,
    restrictedTimeRanges: [] as TimeRange[],
    restrictedStartTime: "",
    restrictedEndTime: "",
    requiredRole: undefined as "staff" | "master" | undefined,
    tags: [] as TaskTag[],
    priority: "medium" as TaskLevel,
    difficulty: "medium" as TaskLevel,
    color: "#2196F3", // デフォルト色
    icon: "checkbox-outline", // デフォルトアイコン
    validFrom: undefined as Date | undefined,
    validTo: undefined as Date | undefined,
    isActive: true,
  });

  const [showDatePicker, setShowDatePicker] = useState<{
    field: "validFrom" | "validTo" | null;
    show: boolean;
  }>({ field: null, show: false });

  const [saving, setSaving] = useState(false);
  const [addToShift, setAddToShift] = useState(false); // シフトに直接追加するかどうかのフラグ

  // 初期シフトデータがある場合のフォーム初期化
  useEffect(() => {
    if (initialShiftData && visible) {
      // シフトの時間帯からタスクの推奨設定を計算
      const startHour = parseInt(initialShiftData.startTime.split(":")[0]);
      const endHour = parseInt(initialShiftData.endTime.split(":")[0]);
      const durationHours = endHour - startHour;

      // シフト時間に基づいてタスクの基本設定を提案
      const suggestedType: TaskType =
        durationHours >= 4 ? "standard" : "time_specific";
      const suggestedBaseTime = Math.min(Math.max(durationHours * 15, 15), 60); // 15-60分

      setFormData((prev) => ({
        ...prev,
        type: suggestedType,
        baseTimeMinutes: suggestedBaseTime,
        restrictedTimeRanges:
          suggestedType === "time_specific"
            ? [
                {
                  startTime: initialShiftData.startTime,
                  endTime: initialShiftData.endTime,
                },
              ]
            : [],
        restrictedStartTime:
          suggestedType === "time_specific" ? initialShiftData.startTime : "",
        restrictedEndTime:
          suggestedType === "time_specific" ? initialShiftData.endTime : "",
        title: `${initialShiftData.date}のタスク`, // 日付を含めたデフォルトタイトル
      }));
    }
  }, [initialShiftData, visible]);

  // タスクタイプが変更された時の処理
  useEffect(() => {
    if (
      formData.type === "time_specific" &&
      formData.restrictedTimeRanges.length === 0
    ) {
      // 時間指定タスクが選択されて時間範囲が空の場合、デフォルトの時間範囲を追加
      setFormData((prev) => ({
        ...prev,
        restrictedTimeRanges: [
          {
            startTime: "09:00",
            endTime: "17:00",
          },
        ],
      }));
    } else if (formData.type !== "time_specific") {
      // 時間指定タスク以外が選択された場合、時間範囲をクリア
      setFormData((prev) => ({
        ...prev,
        restrictedTimeRanges: [],
      }));
    }
  }, [formData.type]);

  const taskTypes: Array<{
    value: TaskType;
    label: string;
    description: string;
  }> = [
    {
      value: "standard",
      label: "通常タスク",
      description: "営業時間中いつでも実行可能な一般的な業務タスク",
    },
    {
      value: "time_specific",
      label: "時間指定タスク",
      description:
        "特定の時間帯（例：7:00~9:00, 13:00~16:00）でのみ実行するタスク",
    },
    {
      value: "custom",
      label: "独自設定タスク",
      description:
        "別店舗での作業、休憩、イレギュラー業務など通常業務以外のタスク",
    },
  ];

  const taskTags: Array<{ value: TaskTag; label: string }> = [
    { value: "limited_time", label: "期間限定" },
    { value: "staff_only", label: "スタッフ限定" },
    { value: "high_priority", label: "高優先度" },
    { value: "training", label: "研修" },
    { value: "event", label: "イベント" },
  ];

  const priorityLevels: Array<{
    value: TaskLevel;
    label: string;
    color: string;
  }> = [
    { value: "low", label: "低", color: "#4caf50" },
    { value: "medium", label: "中", color: "#ff9800" },
    { value: "high", label: "高", color: "#f44336" },
  ];

  // 色の選択肢
  const colorOptions = [
    // 基本色
    { value: "#2196F3", label: "青" },
    { value: "#4CAF50", label: "緑" },
    { value: "#FF9800", label: "オレンジ" },
    { value: "#F44336", label: "赤" },
    { value: "#9C27B0", label: "紫" },
    { value: "#607D8B", label: "グレー" },
    { value: "#795548", label: "ブラウン" },
    { value: "#E91E63", label: "ピンク" },

    // 追加色
    { value: "#00BCD4", label: "シアン" },
    { value: "#009688", label: "ティール" },
    { value: "#8BC34A", label: "ライトグリーン" },
    { value: "#CDDC39", label: "ライム" },
    { value: "#FFEB3B", label: "黄色" },
    { value: "#FFC107", label: "アンバー" },
    { value: "#FF5722", label: "ディープオレンジ" },
    { value: "#673AB7", label: "ディープパープル" },
    { value: "#3F51B5", label: "インディゴ" },
    { value: "#536DFE", label: "ライトブルー" },
  ];

  // アイコンの選択肢
  const iconOptions = [
    // 基本・汎用
    { value: "checkbox-outline", label: "チェックボックス" },
    { value: "time-outline", label: "時計" },
    { value: "star-outline", label: "星" },
    { value: "heart-outline", label: "ハート" },
    { value: "flag-outline", label: "フラグ" },
    { value: "bookmark-outline", label: "ブックマーク" },

    // 教育・学習関連
    { value: "school-outline", label: "学校" },
    { value: "library-outline", label: "図書館" },
    { value: "book-outline", label: "本" },
    { value: "reader-outline", label: "教科書" },
    { value: "pencil-outline", label: "鉛筆" },
    { value: "calculator-outline", label: "計算機" },
    { value: "flask-outline", label: "実験" },
    { value: "telescope-outline", label: "研究" },
    { value: "bulb-outline", label: "アイデア" },
    { value: "glasses-outline", label: "勉強" },
    { value: "medal-outline", label: "成果" },
    { value: "trophy-outline", label: "表彰" },

    // 会社・ビジネス関連
    { value: "business-outline", label: "ビジネス" },
    { value: "briefcase-outline", label: "ブリーフケース" },
    { value: "tie-outline", label: "ネクタイ" },
    { value: "card-outline", label: "名刺" },
    { value: "file-tray-outline", label: "書類" },
    { value: "folder-outline", label: "フォルダ" },
    { value: "archive-outline", label: "アーカイブ" },
    { value: "clipboard-outline", label: "クリップボード" },
    { value: "contract-outline", label: "契約書" },
    { value: "receipt-outline", label: "領収書" },

    // 面談・コミュニケーション
    { value: "chatbubbles-outline", label: "面談" },
    { value: "people-outline", label: "グループ面談" },
    { value: "person-add-outline", label: "採用面接" },
    { value: "handshake-outline", label: "握手" },
    { value: "mic-outline", label: "発表" },
    { value: "megaphone-outline", label: "告知" },
    { value: "call-outline", label: "通話" },
    { value: "videocam-outline", label: "ビデオ会議" },
    { value: "mail-outline", label: "メール" },
    { value: "chatbox-outline", label: "チャット" },

    // 管理・運営
    { value: "settings-outline", label: "設定" },
    { value: "cog-outline", label: "管理" },
    { value: "shield-checkmark-outline", label: "セキュリティ" },
    { value: "key-outline", label: "アクセス" },
    { value: "lock-closed-outline", label: "機密" },
    { value: "analytics-outline", label: "分析" },
    { value: "stats-chart-outline", label: "統計" },
    { value: "pie-chart-outline", label: "グラフ" },
    { value: "trending-up-outline", label: "成長" },
    { value: "calendar-outline", label: "スケジュール" },

    // イベント・活動
    { value: "gift-outline", label: "イベント" },
    { value: "balloon-outline", label: "お祝い" },
    { value: "restaurant-outline", label: "食事会" },
    { value: "cafe-outline", label: "カフェ" },
    { value: "fitness-outline", label: "研修" },
    { value: "walk-outline", label: "外出" },
    { value: "car-outline", label: "移動" },
    { value: "airplane-outline", label: "出張" },
    { value: "train-outline", label: "電車" },
    { value: "bus-outline", label: "バス" },

    // 技術・IT関連
    { value: "laptop-outline", label: "PC作業" },
    { value: "desktop-outline", label: "デスクトップ" },
    { value: "phone-portrait-outline", label: "モバイル" },
    { value: "tablet-portrait-outline", label: "タブレット" },
    { value: "wifi-outline", label: "ネットワーク" },
    { value: "cloud-outline", label: "クラウド" },
    { value: "server-outline", label: "サーバー" },
    { value: "code-slash-outline", label: "プログラミング" },
    { value: "bug-outline", label: "デバッグ" },
    { value: "construct-outline", label: "開発" },

    // その他
    { value: "home-outline", label: "在宅" },
    { value: "storefront-outline", label: "店舗" },
    { value: "location-outline", label: "場所" },
    { value: "map-outline", label: "地図" },
    { value: "compass-outline", label: "方向" },
    { value: "camera-outline", label: "撮影" },
    { value: "image-outline", label: "画像" },
    { value: "musical-notes-outline", label: "音楽" },
    { value: "play-outline", label: "再生" },
    { value: "pause-outline", label: "一時停止" },
  ];

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 時間範囲管理関数
  const addTimeRange = () => {
    const newRange: TimeRange = {
      startTime: "09:00",
      endTime: "17:00",
    };
    updateFormData("restrictedTimeRanges", [
      ...formData.restrictedTimeRanges,
      newRange,
    ]);
  };

  const updateTimeRange = (
    index: number,
    field: keyof TimeRange,
    value: string
  ) => {
    const newRanges = [...formData.restrictedTimeRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    updateFormData("restrictedTimeRanges", newRanges);
  };

  const removeTimeRange = (index: number) => {
    const newRanges = formData.restrictedTimeRanges.filter(
      (_, i) => i !== index
    );
    updateFormData("restrictedTimeRanges", newRanges);
  };

  const toggleTag = (tag: TaskTag) => {
    const currentTags = formData.tags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateFormData("tags", newTags);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (showDatePicker.field && selectedDate) {
      updateFormData(showDatePicker.field, selectedDate);
    }
    setShowDatePicker({ field: null, show: false });
  };

  const hasValidationErrors = () => {
    return (
      !formData.title.trim() ||
      (formData.shortName && formData.shortName.length !== 2) ||
      formData.baseTimeMinutes <= 0 ||
      formData.baseCountPerShift <= 0
    );
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("エラー", "タスク名を入力してください");
      return;
    }

    if (formData.shortName && formData.shortName.length !== 2) {
      Alert.alert("エラー", "略称は必ず2文字で入力してください");
      return;
    }

    if (formData.baseTimeMinutes <= 0) {
      Alert.alert("エラー", "基本時間は1分以上で入力してください");
      return;
    }

    if (formData.baseCountPerShift <= 0) {
      Alert.alert("エラー", "基本回数は1回以上で入力してください");
      return;
    }

    if (formData.type === "time_specific") {
      if (formData.restrictedTimeRanges.length === 0) {
        Alert.alert(
          "エラー",
          "時間指定タスクは少なくとも1つの時間範囲を設定してください"
        );
        return;
      }

      // 各時間範囲のバリデーション
      for (let i = 0; i < formData.restrictedTimeRanges.length; i++) {
        const range = formData.restrictedTimeRanges[i];
        if (!range.startTime || !range.endTime) {
          Alert.alert(
            "エラー",
            `時間範囲${i + 1}の開始時間と終了時間を入力してください`
          );
          return;
        }
        if (range.startTime >= range.endTime) {
          Alert.alert(
            "エラー",
            `時間範囲${i + 1}の終了時間は開始時間より後に設定してください`
          );
          return;
        }
      }
    }

    setSaving(true);
    try {
      // タスクデータを準備（undefinedフィールドを除外）
      const taskData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        baseTimeMinutes: formData.baseTimeMinutes,
        baseCountPerShift: formData.baseCountPerShift,
        requiredRole: formData.requiredRole,
        tags: formData.tags,
        priority: formData.priority,
        difficulty: formData.difficulty,
        color: formData.color,
        icon: formData.icon,
        storeId,
        createdBy: "current-user", // TODO: 実際のユーザーIDを取得
        isActive: formData.isActive,
      };

      // 条件付きでフィールドを追加
      if (formData.shortName.trim()) {
        taskData.shortName = formData.shortName.trim();
      }

      if (
        formData.type === "time_specific" &&
        formData.restrictedTimeRanges.length > 0
      ) {
        taskData.restrictedTimeRanges = formData.restrictedTimeRanges;
        if (formData.restrictedStartTime) {
          taskData.restrictedStartTime = formData.restrictedStartTime;
        }
        if (formData.restrictedEndTime) {
          taskData.restrictedEndTime = formData.restrictedEndTime;
        }
      }

      if (formData.validFrom) {
        taskData.validFrom = formData.validFrom;
      }

      if (formData.validTo) {
        taskData.validTo = formData.validTo;
      }

      // タスクを作成
      const createdTaskId = await createTask(taskData);

      // シフトに直接追加する場合
      if (addToShift && initialShiftId && initialShiftData) {
        try {
          // 現在のシフトデータを取得
          const shifts = await getShifts(storeId);
          const currentShift = shifts.find(
            (shift) => shift.id === initialShiftId
          );
          const currentExtendedTasks = currentShift?.extendedTasks || [];

          // ShiftTaskSlotオブジェクトを作成
          const newTaskSlot: ShiftTaskSlot = {
            id: `task_${Date.now()}_${Math.random()}`,
            taskId: createdTaskId || `task_${Date.now()}`,
            startTime: initialShiftData.startTime,
            endTime: initialShiftData.endTime,
            title: formData.title.trim(),
            shortName: formData.shortName.trim() || undefined,
            color: formData.color,
            icon: formData.icon,
            status: "pending",
            createdAt: new Date(),
          };

          // 既存のextendedTasksに新しいタスクを追加
          const updatedExtendedTasks = [...currentExtendedTasks, newTaskSlot];

          // シフトにタスクを追加
          await updateShift(initialShiftId, {
            extendedTasks: updatedExtendedTasks,
          });

          Alert.alert(
            "完了",
            `タスクを作成し、${initialShiftData.date}のシフトに追加しました`
          );
        } catch (shiftError) {
          Alert.alert(
            "一部完了",
            "タスクは作成されましたが、シフトへの追加に失敗しました"
          );
        }
      } else {
        Alert.alert("完了", "タスクを作成しました");
      }

      onTaskCreated();
      onClose();
      resetForm();
    } catch (error) {
      Alert.alert("エラー", "タスクの作成に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      shortName: "",
      description: "",
      type: "standard",
      baseTimeMinutes: 30,
      baseCountPerShift: 1,
      restrictedTimeRanges: [],
      restrictedStartTime: "",
      restrictedEndTime: "",
      requiredRole: undefined,
      tags: [],
      priority: "medium",
      difficulty: "medium",
      color: "#2196F3",
      icon: "checkbox-outline",
      validFrom: undefined,
      validTo: undefined,
      isActive: true,
    });
    setAddToShift(false); // フラグもリセット
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View
          style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>新しいタスク</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.saveButton,
                (saving || hasValidationErrors()) && styles.saveButtonDisabled,
              ]}
              disabled={saving || hasValidationErrors()}
            >
              <Text style={styles.saveButtonText}>
                {saving
                  ? "保存中..."
                  : hasValidationErrors()
                  ? "入力内容を確認してください"
                  : "保存"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* 基本情報 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>基本情報</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>タスク名 *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.title}
                  onChangeText={(text) => updateFormData("title", text)}
                  placeholder="タスク名を入力..."
                  placeholderTextColor="#999"
                  maxLength={100}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>略称（2文字）</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formData.shortName && formData.shortName.length !== 2
                      ? styles.errorInput
                      : undefined,
                  ]}
                  value={formData.shortName}
                  onChangeText={(text) => {
                    updateFormData("shortName", text);
                  }}
                  placeholder="略称を入力（例：会議）"
                  placeholderTextColor="#999"
                />
                <Text style={styles.fieldHelper}>
                  ガントチャートなどで表示される短縮名です（必ず2文字で入力）
                </Text>
                <Text
                  style={[
                    styles.characterCounter,
                    formData.shortName && formData.shortName.length !== 2
                      ? styles.characterCounterError
                      : undefined,
                  ]}
                >
                  {formData.shortName.length}/2文字
                </Text>
                {formData.shortName && formData.shortName.length !== 2 && (
                  <Text style={styles.errorText}>
                    {formData.shortName.length < 2
                      ? "あと" +
                        (2 - formData.shortName.length) +
                        "文字入力してください"
                      : "2文字で入力してください（現在" +
                        formData.shortName.length +
                        "文字）"}
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>説明</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => updateFormData("description", text)}
                  placeholder="タスクの説明を入力..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
              </View>
            </View>

            {/* シフトに追加オプション（初期シフトデータがある場合のみ表示） */}
            {initialShiftData && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>追加オプション</Text>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      addToShift && styles.optionChipSelected,
                    ]}
                    onPress={() => setAddToShift(!addToShift)}
                  >
                    <Ionicons
                      name={addToShift ? "checkmark-circle" : "ellipse-outline"}
                      size={16}
                      color={addToShift ? "#fff" : "#666"}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.optionChipText,
                        addToShift && styles.optionChipTextSelected,
                      ]}
                    >
                      シフトに直接追加
                    </Text>
                  </TouchableOpacity>
                </View>
                {addToShift && (
                  <Text style={styles.fieldHelper}>
                    このタスクを「{initialShiftData.date}
                    」のシフトに直接追加します
                  </Text>
                )}
              </View>
            )}

            {/* 対象者選択 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>対象者</Text>
              <Text style={styles.fieldHelper}>
                このタスクを実行できる人の権限を選択してください
              </Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionChip,
                    formData.requiredRole === "staff" &&
                      styles.optionChipSelected,
                  ]}
                  onPress={() => updateFormData("requiredRole", "staff")}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.requiredRole === "staff" &&
                        styles.optionChipTextSelected,
                    ]}
                  >
                    スタッフのみ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionChip,
                    formData.requiredRole === "master" &&
                      styles.optionChipSelected,
                  ]}
                  onPress={() => updateFormData("requiredRole", "master")}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.requiredRole === "master" &&
                        styles.optionChipTextSelected,
                    ]}
                  >
                    教室長のみ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionChip,
                    formData.requiredRole === undefined &&
                      styles.optionChipSelected,
                  ]}
                  onPress={() => updateFormData("requiredRole", undefined)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      formData.requiredRole === undefined &&
                        styles.optionChipTextSelected,
                    ]}
                  >
                    両方
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* タイプ選択 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>タイプ</Text>
              <View style={styles.optionsGrid}>
                {taskTypes.map((type) => (
                  <View key={type.value} style={styles.optionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionChip,
                        formData.type === type.value &&
                          styles.optionChipSelected,
                      ]}
                      onPress={() => updateFormData("type", type.value)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          formData.type === type.value &&
                            styles.optionChipTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.optionDescription}>
                      {type.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 基本設定 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>基本設定</Text>

              <View style={styles.fieldRow}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>基本時間（分）</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.baseTimeMinutes.toString()}
                    onChangeText={(text) =>
                      updateFormData("baseTimeMinutes", parseInt(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>基本回数/日</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.baseCountPerShift.toString()}
                    onChangeText={(text) =>
                      updateFormData("baseCountPerShift", parseInt(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            {/* 時間指定（時間指定タスクの場合のみ） */}
            {formData.type === "time_specific" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>時間指定</Text>
                <Text style={styles.fieldHelper}>
                  このタスクを実行できる時間範囲を設定してください（複数指定可能）
                </Text>

                {formData.restrictedTimeRanges.map((range, index) => (
                  <View key={index} style={styles.timeRangeContainer}>
                    <View style={styles.timeRangeHeader}>
                      <Text style={styles.fieldLabel}>
                        時間範囲 {index + 1}
                      </Text>
                      {formData.restrictedTimeRanges.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeTimeRange(index)}
                          style={styles.removeTimeRangeButton}
                        >
                          <Ionicons name="close" size={16} color="#ff5722" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.fieldRow}>
                      <View style={[styles.field, { flex: 1 }]}>
                        <Text style={styles.fieldLabel}>開始時間</Text>
                        <TextInput
                          style={styles.textInput}
                          value={range.startTime}
                          onChangeText={(text) =>
                            updateTimeRange(index, "startTime", text)
                          }
                          placeholder="09:00"
                          placeholderTextColor="#999"
                        />
                      </View>
                      <View style={[styles.field, { flex: 1 }]}>
                        <Text style={styles.fieldLabel}>終了時間</Text>
                        <TextInput
                          style={styles.textInput}
                          value={range.endTime}
                          onChangeText={(text) =>
                            updateTimeRange(index, "endTime", text)
                          }
                          placeholder="18:00"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={addTimeRange}
                  style={styles.addTimeRangeButton}
                >
                  <Ionicons name="add" size={16} color="#2196F3" />
                  <Text style={styles.addTimeRangeText}>時間範囲を追加</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 優先度・難易度 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>優先度・難易度</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>優先度</Text>
                <View style={styles.optionsRow}>
                  {priorityLevels.map((level) => (
                    <TouchableOpacity
                      key={`priority-${level.value}`}
                      style={[
                        styles.levelChip,
                        { borderColor: level.color },
                        formData.priority === level.value && {
                          backgroundColor: level.color,
                        },
                      ]}
                      onPress={() => updateFormData("priority", level.value)}
                    >
                      <Text
                        style={[
                          styles.levelChipText,
                          {
                            color:
                              formData.priority === level.value
                                ? "white"
                                : level.color,
                          },
                        ]}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>難易度</Text>
                <View style={styles.optionsRow}>
                  {priorityLevels.map((level) => (
                    <TouchableOpacity
                      key={`difficulty-${level.value}`}
                      style={[
                        styles.levelChip,
                        { borderColor: level.color },
                        formData.difficulty === level.value && {
                          backgroundColor: level.color,
                        },
                      ]}
                      onPress={() => updateFormData("difficulty", level.value)}
                    >
                      <Text
                        style={[
                          styles.levelChipText,
                          {
                            color:
                              formData.difficulty === level.value
                                ? "white"
                                : level.color,
                          },
                        ]}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* タグ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>タグ</Text>
              <View style={styles.optionsGrid}>
                {taskTags.map((tag) => (
                  <TouchableOpacity
                    key={tag.value}
                    style={[
                      styles.optionChip,
                      formData.tags.includes(tag.value) &&
                        styles.optionChipSelected,
                    ]}
                    onPress={() => toggleTag(tag.value)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        formData.tags.includes(tag.value) &&
                          styles.optionChipTextSelected,
                      ]}
                    >
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 色とアイコン設定 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>表示設定</Text>

              {/* 色選択 */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>色</Text>
                <View style={styles.colorGrid}>
                  {colorOptions.map((colorOption) => (
                    <TouchableOpacity
                      key={colorOption.value}
                      style={[
                        styles.colorChip,
                        { backgroundColor: colorOption.value },
                        formData.color === colorOption.value &&
                          styles.colorChipSelected,
                      ]}
                      onPress={() => updateFormData("color", colorOption.value)}
                    >
                      {formData.color === colorOption.value && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* アイコン選択 */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>アイコン</Text>
                <ScrollView
                  style={{ maxHeight: 200 }}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  <View style={styles.iconGrid}>
                    {iconOptions.map((iconOption) => (
                      <TouchableOpacity
                        key={iconOption.value}
                        style={[
                          styles.iconChip,
                          formData.icon === iconOption.value &&
                            styles.iconChipSelected,
                        ]}
                        onPress={() => updateFormData("icon", iconOption.value)}
                      >
                        <Ionicons
                          name={iconOption.value as any}
                          size={20}
                          color={
                            formData.icon === iconOption.value
                              ? formData.color
                              : "#666"
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* 期間限定設定 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>期間限定設定</Text>

              <View style={styles.fieldRow}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>開始日</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() =>
                      setShowDatePicker({ field: "validFrom", show: true })
                    }
                  >
                    <Text style={styles.dateButtonText}>
                      {formData.validFrom
                        ? formData.validFrom.toLocaleDateString()
                        : "選択してください"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>終了日</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() =>
                      setShowDatePicker({ field: "validTo", show: true })
                    }
                  >
                    <Text style={styles.dateButtonText}>
                      {formData.validTo
                        ? formData.validTo.toLocaleDateString()
                        : "選択してください"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 状態 */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>有効状態</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => updateFormData("isActive", value)}
                />
              </View>
            </View>
          </ScrollView>

          {/* 日付ピッカー */}
          {showDatePicker.show && (
            <DateTimePicker
              value={
                showDatePicker.field === "validFrom"
                  ? formData.validFrom || new Date()
                  : formData.validTo || new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
