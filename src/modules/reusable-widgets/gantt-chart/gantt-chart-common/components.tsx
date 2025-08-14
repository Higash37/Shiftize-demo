import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftItem, TaskItem } from "@/common/common-models/ModelIndex";
import { ShiftStatusConfig } from "../GanttChartTypes";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { Ionicons } from "@expo/vector-icons";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { getDateTextColor } from "@/common/common-utils/date/dateUtils";

// --- DateCell ---
export type DateCellProps = {
  date: string;
  dateColumnWidth: number;
  styles: any;
};
export const DateCell: React.FC<DateCellProps> = ({
  date,
  dateColumnWidth,
  styles,
}) => {
  const formattedDate = new Date(date);
  const dayOfWeek = format(formattedDate, "E", { locale: ja });
  const dayOfMonth = format(formattedDate, "d");
  
  // 祝日・日曜日対応の色分け
  const holidayTextColor = getDateTextColor(date);
  const textColor = holidayTextColor || (dayOfWeek === "土" ? "#0000FF" : "#000000");
  return (
    <View
      style={[
        styles.dateCell,
        {
          width: dateColumnWidth,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRightWidth: 2,
          borderRightColor: "#bbb",
          backgroundColor: "#f8f9fa",
        },
      ]}
    >
      <Text style={[styles.dateDayText, { color: textColor }]}>
        {dayOfMonth}
      </Text>
      <Text style={[styles.dateWeekText, { color: textColor }]}>
        {dayOfWeek}
      </Text>
    </View>
  );
};

// --- GanttChartGrid ---
export type GanttChartGridProps = {
  shifts: ShiftItem[];
  cellWidth: number;
  ganttColumnWidth: number;
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onShiftPress?: (shift: ShiftItem) => void;
  onBackgroundPress?: (x: number) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  onTaskAdd?: (shiftId: string) => void; // タスク追加ハンドラーを追加
  styles: any;
  userColorsMap: Record<string, string>;
  users?: Array<{ uid: string; role: string; nickname: string }>; // ユーザー情報を追加
  getTimeWidth?: (time: string) => number; // 動的幅計算用
  colorMode?: "status" | "user"; // 色表示モード
};

// 授業データをタスクアイテムに変換するヘルパー関数
const convertClassesToTasks = (shift: ShiftItem): Array<TaskItem> => {
  if (!shift.classes || shift.classes.length === 0) return [];

  return shift.classes.map((classTime, index) => ({
    id: `${shift.id}-class-${index}`,
    title: `授業 ${classTime.startTime}-${classTime.endTime}`,
    shortName: "授業", // 授業の略称
    startTime: classTime.startTime,
    endTime: classTime.endTime,
    color: "#757575", // 授業用のグレー系色
    icon: "book-outline", // 授業用アイコン
    type: "custom", // 授業は独自設定タスクとして扱う
  }));
};

export const GanttChartGrid: React.FC<GanttChartGridProps> = ({
  shifts,
  cellWidth,
  ganttColumnWidth,
  halfHourLines,
  isClassTime,
  getStatusConfig,
  onShiftPress,
  onBackgroundPress,
  onTimeChange,
  onTaskAdd,
  styles,
  userColorsMap,
  users = [], // デフォルト値を設定
  getTimeWidth,
  colorMode = "status", // デフォルトはステータス色
}) => {
  // 動的時間位置の計算
  function timeToPosition(time: string): number {
    let position = 0;
    const [targetHour, targetMin] = time.split(":").map(Number);
    const targetMinutes = targetHour * 60 + targetMin;

    for (let i = 0; i < halfHourLines.length; i++) {
      const [hour, min] = halfHourLines[i].split(":").map(Number);
      const currentMinutes = hour * 60 + min;

      if (currentMinutes >= targetMinutes) {
        // 目標時間に到達または超えた場合
        if (currentMinutes === targetMinutes) {
          return position; // 正確に一致
        } else {
          // 前の時間からの補間計算
          const prevMinutes =
            i > 0
              ? (() => {
                  const [prevHour, prevMin] = halfHourLines[i - 1]
                    .split(":")
                    .map(Number);
                  return prevHour * 60 + prevMin;
                })()
              : currentMinutes;
          const ratio =
            (targetMinutes - prevMinutes) / (currentMinutes - prevMinutes);
          const prevPosition =
            i > 0
              ? position -
                (getTimeWidth ? getTimeWidth(halfHourLines[i]) : cellWidth)
              : 0;
          return (
            prevPosition +
            ratio * (getTimeWidth ? getTimeWidth(halfHourLines[i]) : cellWidth)
          );
        }
      }
      position += getTimeWidth ? getTimeWidth(halfHourLines[i]) : cellWidth;
    }
    return position;
  }

  // 位置から時間への逆変換関数
  function positionToTime(position: number): string {
    let currentPosition = 0;

    for (let i = 0; i < halfHourLines.length; i++) {
      const currentWidth = getTimeWidth
        ? getTimeWidth(halfHourLines[i])
        : cellWidth;
      const nextPosition = currentPosition + currentWidth;

      if (position <= nextPosition) {
        // この時間範囲内に位置がある
        const [hour, min] = halfHourLines[i].split(":").map(Number);
        const baseMinutes = hour * 60 + min;

        if (position <= currentPosition) {
          // 現在の時間ポイント
          return halfHourLines[i];
        } else {
          // 時間範囲内での補間
          const ratio = (position - currentPosition) / currentWidth;
          const intervalMinutes = 30; // 30分間隔
          const additionalMinutes = Math.round(ratio * intervalMinutes);
          const totalMinutes = baseMinutes + additionalMinutes;

          const newHour = Math.floor(totalMinutes / 60);
          const newMin = totalMinutes % 60;

          return `${newHour.toString().padStart(2, "0")}:${newMin
            .toString()
            .padStart(2, "0")}`;
        }
      }

      currentPosition = nextPosition;
    }

    // 範囲外の場合は最後の時間を返す
    return halfHourLines[halfHourLines.length - 1];
  }

  return (
    <View
      style={[styles.ganttCell, { width: ganttColumnWidth, height: "100%" }]}
    >
      {/* グリッド全体をタップ可能にする（View/編集共通） */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        onPress={(e) => {
          if (onBackgroundPress) {
            const x = e.nativeEvent.locationX;
            onBackgroundPress(x);
          }
        }}
        activeOpacity={0.7}
      />
      <View style={styles.ganttBgRow}>
        {halfHourLines.map((t, i) => {
          const currentWidth = getTimeWidth ? getTimeWidth(t) : cellWidth;
          const isHourMark = t.endsWith(":00");
          return (
            <View
              key={t}
              style={[
                styles.ganttBgCell,
                isClassTime(t) && styles.classTimeCell,
                {
                  width: currentWidth,
                  borderRightWidth: isHourMark ? 1 : 0.5,
                },
              ]}
            />
          );
        })}
      </View>
      {/* シフトバー */}
      {shifts.map((shift, index) => {
        const statusConfig = getStatusConfig(shift.status);
        const startPos = timeToPosition(shift.startTime);
        const endPos = timeToPosition(shift.endTime);
        const barWidth = endPos - startPos;
        const totalShifts = shifts.length;
        const cellHeight = 70;
        
        // 重複チェック - 他のシフトと時間が重複するかどうか
        const hasOverlap = shifts.some((otherShift, otherIndex) => {
          if (otherIndex === index) return false;
          const otherStartPos = timeToPosition(otherShift.startTime);
          const otherEndPos = timeToPosition(otherShift.endTime);
          return !(endPos <= otherStartPos || startPos >= otherEndPos);
        });
        
        let singleBarHeight;
        let barVerticalOffset;
        
        if (!hasOverlap) {
          // 重複しない場合は全体の高さを使用
          singleBarHeight = cellHeight;
          barVerticalOffset = 0;
        } else {
          // 重複する場合のみ分割表示
          singleBarHeight = Math.floor(cellHeight / Math.min(totalShifts, 3));
          barVerticalOffset = index * singleBarHeight;
        }
        // 色モードに応じて色を取得
        const borderColor = colorMode === "status" 
          ? statusConfig.color 
          : (userColorsMap?.[shift.userId] || statusConfig.color);

        // 2時間以下かどうかを判定（120分 = 2時間）
        const startTimeMinutes = (() => {
          const [h, m] = shift.startTime.split(":").map(Number);
          return h * 60 + m;
        })();
        const endTimeMinutes = (() => {
          const [h, m] = shift.endTime.split(":").map(Number);
          return h * 60 + m;
        })();
        const durationMinutes = endTimeMinutes - startTimeMinutes;
        const isShortShift = durationMinutes <= 120; // 2時間以下

        // ユーザー情報を取得してアイコンを決定
        const user = users.find((u) => u.uid === shift.userId);
        const isMaster = user?.role === "master";
        const userIcon = isMaster ? "person" : "school";

        // 短いシフトの場合でも十分な表示幅を確保
        const minWidthForShift = isShortShift ? 100 : 80; // 短いシフトは最小100px

        // 2行分割表示用のシフトバー
        return (
          <TouchableOpacity
            key={shift.id}
            style={[
              styles.shiftBar,
              {
                left: startPos,
                width: Math.max(barWidth, minWidthForShift), // 動的な最小幅
                height: singleBarHeight,
                top: barVerticalOffset,
                backgroundColor: "rgba(255, 255, 255, 0.95)", // 背景は白ベース
                borderLeftWidth: 4, // 左端にユーザー色
                borderLeftColor: borderColor,
                borderRightWidth: 4, // 右端にも色を追加
                borderRightColor: borderColor,
                borderTopWidth: 4, // 上端に色（半分のサイズ）
                borderTopColor: borderColor,
                borderBottomWidth: 4, // 下端に色（半分のサイズ）
                borderBottomColor: borderColor,
                opacity:
                  shift.status === "deleted" ||
                  shift.status === "deletion_requested"
                    ? 0.5
                    : 1,
                zIndex: 2, // シフトバーはグリッド全体より前面
                borderRadius: 4,
                ...shadows.small,
              },
            ]}
            onPress={() => onShiftPress?.(shift)}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "flex-start",
                paddingHorizontal: 2,
                paddingVertical: 0,
                flexDirection: "column",
              }}
            >
              {isShortShift ? (
                // 2時間以下: 上部エリア内でアイコン＋名前と時間を2行で表示
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  {/* 1行目: アイコン + 名前 */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Ionicons
                      name={userIcon as any}
                      size={16}
                      color={borderColor}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.shiftBarText,
                        {
                          fontSize: 13,
                          fontWeight: "bold",
                          color: "#333",
                          textAlign: "left",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.nickname}
                    </Text>
                  </View>

                  {/* 2行目: 時間（アイコン分をインデント） */}
                  <View
                    style={{
                      justifyContent: "flex-start",
                      paddingLeft: 20, // アイコン分のインデント
                    }}
                  >
                    <Text
                      style={[
                        styles.shiftTimeText,
                        {
                          fontSize: 12,
                          color: "#666",
                          textAlign: "left",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.startTime}～{shift.endTime}
                    </Text>
                  </View>
                </View>
              ) : (
                // 2時間超: アイコン＋名前（左詰め）、時間（中央配置、大きいテキスト）を1行で表示
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    flex: 1,
                    minHeight: 24,
                  }}
                >
                  {/* 左側: アイコン + 名前 */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      flex: 1,
                    }}
                  >
                    <Ionicons
                      name={userIcon as any}
                      size={16}
                      color={borderColor}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.shiftBarText,
                        {
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "#333",
                          textAlign: "left",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.nickname}
                    </Text>
                  </View>

                  {/* 右側（中央寄せ）: 時間（大きいテキスト） */}
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[
                        styles.shiftTimeText,
                        {
                          fontSize: 15, // 11から22に拡大（約2倍）
                          fontWeight: "bold", // 太字にして見やすくする
                          color: "#555", // 少し濃い色にする
                          textAlign: "center",
                          marginRight: 40,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.startTime}～{shift.endTime}
                    </Text>
                  </View>
                </View>
              )}

              {/* 下段: タスクエリア */}
              <View
                style={{
                  flex: 1.0, // 0.35から1.0に変更（約3倍の高さ）
                  backgroundColor: "rgba(240, 245, 251, 0.8)", // 少し青みがかった背景
                  borderRadius: 3,
                  position: "relative",
                  overflow: "hidden",
                  borderTopWidth: 0.5,
                  borderTopColor: "rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* タスク追加ボタン（左上隅） */}
                {users?.find((u) => u.uid === shift.userId)?.role ===
                  "master" && (
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 2,
                      width: 20,
                      height: 20,
                      backgroundColor: "rgba(76, 175, 80, 0.9)",
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 100,
                    }}
                    onPress={() => {
                      if (onTaskAdd) {
                        onTaskAdd(shift.id);
                      }
                    }}
                  >
                    <Ionicons name="add" size={14} color="white" />
                  </TouchableOpacity>
                )}

                {/* タスク表示エリア - 既存のタスクと授業、extendedTasksを統合して表示 */}
                {(() => {
                  // 既存のタスクと授業タスクを統合
                  const classTasks = convertClassesToTasks(shift);
                  const legacyTasks = shift.tasks || [];

                  // extendedTasksをTaskItem形式に変換
                  const extendedTasks = (shift.extendedTasks || []).map(
                    (taskSlot: any) => {
                      return {
                        id: taskSlot.id,
                        startTime: taskSlot.startTime,
                        endTime: taskSlot.endTime,
                        title: taskSlot.title,
                        shortName: taskSlot.shortName,
                        color: taskSlot.color,
                        icon: taskSlot.icon,
                        description: taskSlot.notes,
                      };
                    }
                  );

                  const allTasks = [
                    ...legacyTasks,
                    ...classTasks,
                    ...extendedTasks,
                  ];

                  return allTasks.length > 0 ? (
                    <View
                      style={{
                        flexDirection: "row",
                        height: "100%",
                        alignItems: "center",
                        paddingHorizontal: 0,
                      }}
                    >
                      {allTasks.map((task, taskIndex) => {
                        // タスクの時間範囲を計算
                        const taskStartPos = timeToPosition(task.startTime);
                        const taskEndPos = timeToPosition(task.endTime);
                        const taskWidth = taskEndPos - taskStartPos;
                        const shiftStartPos = timeToPosition(shift.startTime);

                        // シフト開始位置からの相対位置を計算
                        const relativeStartPos = Math.max(
                          0,
                          taskStartPos - shiftStartPos
                        );
                        const relativeWidth = Math.max(taskWidth, 12); // 最小幅12px

                        return (
                          <View
                            key={`${shift.id}-task-${taskIndex}`}
                            style={{
                              position: "absolute",
                              left: relativeStartPos + 2, // 少し余白を追加
                              width: relativeWidth,
                              height: "100%",
                              backgroundColor: task.color || "#4CAF50",
                              borderRadius: 4,

                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              paddingHorizontal: 0,
                              ...shadows.small,
                              borderWidth: 0.5,
                              borderColor: "rgba(255, 255, 255, 0.3)",
                            }}
                          >
                            {/* タスクアイコン */}
                            {task.icon && relativeWidth >= 18 && (
                              <Ionicons
                                name={task.icon as any}
                                size={11}
                                color="white"
                                style={{ marginRight: 2, marginTop: 15 }}
                              />
                            )}

                            {/* タスク名または略称（中央部分） */}
                            {relativeWidth >= 30 && (
                              <Text
                                style={{
                                  fontSize: relativeWidth >= 60 ? 10 : 9,
                                  color: "white",
                                  fontWeight: "600",
                                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                                  textShadowOffset: { width: 0, height: 0.5 },
                                  textShadowRadius: 1,
                                  flex: 1,
                                  textAlign: "center",
                                }}
                                numberOfLines={1}
                              >
                                {relativeWidth >= 60 && task.title
                                  ? task.title
                                  : task.shortName ||
                                    task.title?.substring(0, 2) ||
                                    "タ"}
                              </Text>
                            )}

                            {/* 開始時間（左端、幅が十分な場合のみ） */}
                            {relativeWidth >= 80 && (
                              <Text
                                style={{
                                  fontSize: 9,
                                  color: "white",
                                  fontWeight: "500",
                                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                                  textShadowOffset: { width: 0, height: 0.5 },
                                  textShadowRadius: 1,
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                }}
                                numberOfLines={1}
                              >
                                {task.startTime.substring(0, 5)}
                              </Text>
                            )}
                            {/* 終了時間（右端、幅が十分な場合のみ） */}
                            {relativeWidth >= 100 && (
                              <Text
                                style={{
                                  fontSize: 9,
                                  color: "white",
                                  fontWeight: "500",
                                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                                  textShadowOffset: { width: 0, height: 0.5 },
                                  textShadowRadius: 1,
                                  position: "absolute",
                                  right: 2,
                                  bottom: 0,
                                }}
                                numberOfLines={1}
                              >
                                {task.endTime.substring(0, 5)}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    // タスクがない場合の表示
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          color: "#aaa",
                          fontStyle: "italic",
                        }}
                      >
                        タスクなし
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// --- GanttChartInfo ---
export type GanttChartInfoProps = {
  shifts: ShiftItem[];
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onShiftPress?: (shift: ShiftItem) => void;
  onDelete: (shift: ShiftItem) => void;
  infoColumnWidth: number;
  styles: any;
};
export const GanttChartInfo: React.FC<GanttChartInfoProps> = ({
  shifts,
  getStatusConfig,
  onShiftPress,
  onDelete,
  infoColumnWidth,
  styles,
}) => {
  const canEditStatus = (status: string) => {
    const statusConfig = getStatusConfig(status);
    return statusConfig.canEdit || status === "approved";
  };
  return (
    <View
      style={[
        styles.infoCell,
        {
          width: infoColumnWidth,
          backgroundColor: "#f0f5fb",
          minHeight: 65, // 最小高さを固定
          height: Math.max(65, shifts.length * 32), // シフト数に応じて高さ調整
        },
      ]}
    >
      <CustomScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingVertical: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {shifts.map((shift, index) => {
          const statusConfig = getStatusConfig(shift.status);
          return (
            <View key={shift.id} style={{ marginBottom: index < shifts.length - 1 ? 2 : 0 }}>
              <TouchableOpacity
                activeOpacity={onShiftPress ? 0.7 : 1}
                onPress={() => onShiftPress?.(shift)}
                onLongPress={() => {
                  // 削除済みシフトのみ長押しで完全削除ダイアログ
                  if (shift.status === "deleted") {
                    onDelete(shift);
                  }
                }}
                style={[
                  styles.infoContent,
                  {
                    borderColor: statusConfig.color,
                    marginVertical: 0,
                    paddingVertical: 6,
                    minHeight: 32,
                    // 複数シフトの場合はコンパクトに
                    ...(shifts.length > 1 && {
                      paddingVertical: 4,
                      minHeight: 28,
                    }),
                  },
                ]}
              >
                {/* コンパクト表示: 名前 時間 [ステータス] */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flex: 1,
                  }}
                >
                  <Text
                    style={[
                      styles.infoText,
                    {
                      fontSize: shifts.length > 1 ? 12 : 14,
                      fontWeight: "600",
                      flexShrink: 1,
                      marginRight: 4,
                    },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {shift.startTime}-{shift.endTime} {shift.nickname}
                  </Text>
                  <Text
                    style={[
                      styles.statusText,
                      {
                        fontSize: shifts.length > 1 ? 10 : 12,
                        fontWeight: "500",
                        color: statusConfig.color,
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                        backgroundColor: statusConfig.color + "15",
                        borderRadius: 4,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {statusConfig.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </CustomScrollView>
    </View>
  );
};

// --- EmptyCell ---
export type EmptyCellProps = {
  date: string;
  width: number;
  cellWidth: number; // 各セルの幅
  halfHourLines: string[];
  isClassTime: (time: string) => boolean;
  styles: Record<string, any>; // より厳密な型
  handleEmptyCellClick: (date: string, position: number) => void;
  getTimeWidth?: (time: string) => number; // 動的幅計算用
};
export const EmptyCell: React.FC<EmptyCellProps> = ({
  date,
  width,
  cellWidth,
  halfHourLines,
  isClassTime,
  styles,
  handleEmptyCellClick,
  getTimeWidth,
}) => {
  // タップ位置から動的セル位置を算出
  const handlePress = (event: GestureResponderEvent) => {
    const x = event.nativeEvent.locationX;
    // 動的幅を考慮した位置計算
    let position = 0;
    let currentX = 0;

    for (let i = 0; i < halfHourLines.length - 1; i++) {
      const currentWidth = getTimeWidth
        ? getTimeWidth(halfHourLines[i])
        : cellWidth;
      if (x >= currentX && x < currentX + currentWidth) {
        // このセル内でクリックされた
        const ratio = (x - currentX) / currentWidth;
        position = i + ratio;
        break;
      }
      currentX += currentWidth;
    }

    handleEmptyCellClick(date, position);
  };
  return (
    <View style={[styles.emptyCell, { width }]}>
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        onPress={handlePress}
        activeOpacity={0.7}
      />
      <View style={styles.ganttBgRow}>
        {halfHourLines.map((t, i) => {
          const currentWidth = getTimeWidth ? getTimeWidth(t) : cellWidth;
          const isHourMark = t.endsWith(":00");
          return (
            <View
              key={t}
              style={[
                styles.ganttBgCell,
                isClassTime(t) && styles.classTimeCell,
                {
                  width: currentWidth,
                  borderRightWidth: isHourMark ? 1 : 0.5,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};
