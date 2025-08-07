import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ExtendedTask,
  TaskPerformance,
  TaskType,
  TaskTag,
  TaskLevel,
} from "@/common/common-models/model-shift/shiftTypes";
import { TaskAnalytics } from "@/common/common-utils/util-task/taskAnalytics";
import { TaskEditModal } from "../../task-management/components/TaskEditModal";
import { useTaskDetailModalStyles } from "./styles/TaskDetailModal.styles";

interface TaskDetailModalProps {
  visible: boolean;
  task: ExtendedTask;
  performances: TaskPerformance[];
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  performances,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const styles = useTaskDetailModalStyles();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "manual" | "performance" | "history"
  >("overview");
  const [manualContent, setManualContent] = useState(task.description || "");
  const [isEditingManual, setIsEditingManual] = useState(false);

  const screenWidth = Dimensions.get("window").width;

  const getTypeLabel = (type: TaskType): string => {
    switch (type) {
      case "standard":
        return "通常タスク";
      case "time_specific":
        return "時間指定タスク";
      case "user_defined":
        return "ユーザー定義タスク";
      case "class":
        return "授業タスク";
      default:
        return type;
    }
  };

  const getTypeColor = (type: TaskType): string => {
    switch (type) {
      case "standard":
        return "#4caf50";
      case "time_specific":
        return "#ff9800";
      case "user_defined":
        return "#9c27b0";
      case "class":
        return "#2196f3";
      default:
        return "#9e9e9e";
    }
  };

  const getPriorityColor = (priority: TaskLevel): string => {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  const getPriorityLabel = (priority: TaskLevel): string => {
    switch (priority) {
      case "high":
        return "高優先度";
      case "medium":
        return "中優先度";
      case "low":
        return "低優先度";
      default:
        return priority;
    }
  };

  const getTagLabel = (tag: TaskTag): string => {
    switch (tag) {
      case "limited_time":
        return "期間限定";
      case "staff_only":
        return "スタッフ限定";
      case "high_priority":
        return "高優先度";
      case "training":
        return "研修";
      case "event":
        return "イベント";
      default:
        return tag;
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}時間${remainingMinutes}分`
      : `${hours}時間`;
  };

  const calculateAveragePerformance = () => {
    if (performances.length === 0) return null;

    const avgEfficiency =
      performances.reduce((sum, p) => sum + p.efficiencyRate, 0) /
      performances.length;
    const avgProactivity =
      performances.reduce((sum, p) => sum + p.proactivityRate, 0) /
      performances.length;
    const avgFrequency =
      performances.reduce((sum, p) => sum + p.frequencyRate, 0) /
      performances.length;
    const totalExecutions = performances.reduce(
      (sum, p) => sum + p.totalExecutions,
      0
    );

    return {
      efficiency: avgEfficiency * 100,
      proactivity: avgProactivity * 100,
      frequency: avgFrequency * 100,
      totalExecutions,
      participantCount: performances.length,
    };
  };

  const handleDeleteTask = () => {
    Alert.alert(
      "タスクを削除",
      "このタスクを削除してもよろしいですか？\nすべての関連データが削除され、元に戻すことはできません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: () => {
            onTaskDeleted();
            onClose();
          },
        },
      ]
    );
  };

  const saveManualContent = () => {
    // TODO: マニュアルコンテンツの保存API実装
    setIsEditingManual(false);
    Alert.alert("保存完了", "マニュアルを保存しました");
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: "overview", label: "概要", icon: "information-circle-outline" },
        { key: "manual", label: "マニュアル", icon: "book-outline" },
        {
          key: "performance",
          label: "パフォーマンス",
          icon: "analytics-outline",
        },
        { key: "history", label: "履歴", icon: "time-outline" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            activeTab === tab.key && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={activeTab === tab.key ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.key && styles.tabButtonTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* 基本情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本情報</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: getTypeColor(task.type) },
              ]}
            >
              <Ionicons name="layers-outline" size={24} color="white" />
            </View>
            <Text style={styles.infoLabel}>タイプ</Text>
            <Text style={styles.infoValue}>{getTypeLabel(task.type)}</Text>
          </View>

          <View style={styles.infoCard}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            >
              <Ionicons name="flag-outline" size={24} color="white" />
            </View>
            <Text style={styles.infoLabel}>優先度</Text>
            <Text style={styles.infoValue}>
              {getPriorityLabel(task.priority)}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={24} color="white" />
            </View>
            <Text style={styles.infoLabel}>基本時間</Text>
            <Text style={styles.infoValue}>
              {formatTime(task.baseTimeMinutes)}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="repeat-outline" size={24} color="white" />
            </View>
            <Text style={styles.infoLabel}>基本回数</Text>
            <Text style={styles.infoValue}>{task.baseCountPerShift}回/日</Text>
          </View>
        </View>
      </View>

      {/* 説明 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>説明</Text>
        <Text style={styles.description}>
          {task.description || "タスクの説明がありません"}
        </Text>
      </View>

      {/* 時間制限（時間指定タスクの場合） */}
      {task.type === "time_specific" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>実行時間制限</Text>
          <View style={styles.timeRestriction}>
            <Ionicons name="alarm-outline" size={20} color="#e65100" />
            <Text style={styles.timeRestrictionText}>
              {task.restrictedStartTime} - {task.restrictedEndTime}
            </Text>
          </View>
        </View>
      )}

      {/* タグ */}
      {task.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>タグ</Text>
          <View style={styles.tagsContainer}>
            {task.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{getTagLabel(tag)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 期間限定情報 */}
      {task.validFrom && task.validTo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>有効期間</Text>
          <View style={styles.validityContainer}>
            <Ionicons name="calendar-outline" size={20} color="#e65100" />
            <Text style={styles.validityText}>
              {task.validFrom.toLocaleDateString()} ～{" "}
              {task.validTo.toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      {/* ステータス */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ステータス</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: task.isActive ? "#4caf50" : "#f44336" },
            ]}
          >
            <Ionicons
              name={task.isActive ? "checkmark-circle" : "pause-circle"}
              size={20}
              color="white"
            />
            <Text style={styles.statusText}>
              {task.isActive ? "有効" : "無効"}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderManualTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.manualHeader}>
          <Text style={styles.sectionTitle}>タスクマニュアル</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditingManual(!isEditingManual)}
          >
            <Ionicons
              name={isEditingManual ? "save-outline" : "create-outline"}
              size={20}
              color={isEditingManual ? "#4caf50" : "#666"}
            />
            <Text style={styles.editButtonText}>
              {isEditingManual ? "保存" : "編集"}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditingManual ? (
          <View>
            <TextInput
              style={styles.manualInput}
              value={manualContent}
              onChangeText={setManualContent}
              placeholder="タスクの手順、注意事項、参考資料などを詳しく記述してください..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
            <View style={styles.manualActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditingManual(false);
                  setManualContent(task.description || "");
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveManualContent}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.manualContent}>
            {manualContent ? (
              <Text style={styles.manualText}>{manualContent}</Text>
            ) : (
              <View style={styles.emptyManual}>
                <Ionicons name="book-outline" size={48} color="#ccc" />
                <Text style={styles.emptyManualText}>
                  マニュアルが作成されていません
                </Text>
                <Text style={styles.emptyManualSubtext}>
                  編集ボタンをタップしてタスクの手順や注意事項を追加しましょう
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderPerformanceTab = () => {
    const avgPerformance = calculateAveragePerformance();

    return (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
      >
        {avgPerformance ? (
          <View>
            {/* 統計サマリー */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>パフォーマンス統計</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {avgPerformance.efficiency.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>平均効率性</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {avgPerformance.proactivity.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>平均積極性</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {avgPerformance.frequency.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>実行頻度</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {avgPerformance.totalExecutions}
                  </Text>
                  <Text style={styles.statLabel}>総実行回数</Text>
                </View>
              </View>
            </View>

            {/* 個別パフォーマンス */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>個別パフォーマンス</Text>
              {performances.map((performance, index) => {
                const overallScore =
                  TaskAnalytics.calculateOverallScore(performance);
                const level = TaskAnalytics.getPerformanceLevel(overallScore);

                return (
                  <View key={index} style={styles.performanceCard}>
                    <View style={styles.performanceHeader}>
                      <Text style={styles.performanceUser}>
                        ユーザー {performance.userId}
                      </Text>
                      <View
                        style={[
                          styles.performanceLevel,
                          { backgroundColor: level.color },
                        ]}
                      >
                        <Text style={styles.performanceLevelText}>
                          {level.label}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.performanceStats}>
                      <Text style={styles.performanceStat}>
                        効率性: {(performance.efficiencyRate * 100).toFixed(1)}%
                      </Text>
                      <Text style={styles.performanceStat}>
                        積極性: {(performance.proactivityRate * 100).toFixed(1)}
                        %
                      </Text>
                      <Text style={styles.performanceStat}>
                        実行回数: {performance.totalExecutions}回
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.emptyPerformance}>
            <Ionicons name="analytics-outline" size={64} color="#ccc" />
            <Text style={styles.emptyPerformanceText}>
              パフォーマンスデータがありません
            </Text>
            <Text style={styles.emptyPerformanceSubtext}>
              スタッフがタスクを実行するとパフォーマンスデータが表示されます
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>更新履歴</Text>
        <View style={styles.historyItem}>
          <View style={styles.historyIcon}>
            <Ionicons name="create-outline" size={20} color="#4caf50" />
          </View>
          <View style={styles.historyContent}>
            <Text style={styles.historyAction}>タスクが作成されました</Text>
            <Text style={styles.historyDate}>
              {task.createdAt.toLocaleDateString()}{" "}
              {task.createdAt.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {task.updatedAt > task.createdAt && (
          <View style={styles.historyItem}>
            <View style={styles.historyIcon}>
              <Ionicons name="pencil-outline" size={20} color="#ff9800" />
            </View>
            <View style={styles.historyContent}>
              <Text style={styles.historyAction}>タスクが更新されました</Text>
              <Text style={styles.historyDate}>
                {task.updatedAt.toLocaleDateString()}{" "}
                {task.updatedAt.toLocaleTimeString()}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{task.title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="create-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteTask}
            >
              <Ionicons name="trash-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>

        {/* タブバー */}
        {renderTabBar()}

        {/* タブコンテンツ */}
        <View style={styles.contentContainer}>
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "manual" && renderManualTab()}
          {activeTab === "performance" && renderPerformanceTab()}
          {activeTab === "history" && renderHistoryTab()}
        </View>

        {/* 編集モーダル */}
        <TaskEditModal
          visible={showEditModal}
          task={task}
          onClose={() => setShowEditModal(false)}
          onTaskUpdated={() => {
            setShowEditModal(false);
            onTaskUpdated();
          }}
        />
      </View>
    </Modal>
  );
};
