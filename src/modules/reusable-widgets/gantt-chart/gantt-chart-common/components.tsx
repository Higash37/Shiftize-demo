/** @file components.tsx
 *  @description ガントチャートの基本部品を集めたファイル。
 *    ShiftSelectionProvider（選択状態管理）、DateCell（日付セル）、
 *    GanttChartGrid（シフトバー描画）、ShiftBarWithCheckbox（個別バー）、
 *    GanttChartInfo（ミニカレンダー）、EmptyCell（空白セル）を含む。
 */

// 【このファイルの位置づけ】
// - importされる先: GanttChartRow, GanttChartBody, MonthSelectorBar, BatchConfirmModal 等
// - 役割: ガントチャートの「部品」をまとめて export する。
//   GanttChartRow が DateCell, GanttChartGrid, GanttChartInfo, EmptyCell を使って1行を組み立てる。
// - コンポーネント階層:
//   GanttChartMonthView → GanttChartBody → GanttChartRow → [DateCell, GanttChartGrid, GanttChartInfo, EmptyCell]
//                                                             └→ ShiftBarWithCheckbox（各シフトバー）

import React, { useState, useContext, useMemo, createContext } from "react";
import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";
import { useShiftTaskAssignmentsContext } from "@/common/common-context/ShiftTaskAssignmentsContext";
import { useStaffRolesContext } from "@/common/common-context/StaffRolesContext";
import type { TimeSegmentType } from "@/common/common-models/model-shift/shiftTypes";
import type { ShiftTaskAssignment } from "@/modules/master-view/info-dashboard/useShiftTaskAssignments";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent, // タッチイベントの型。onPress 等のハンドラーに渡される。
} from "react-native";
import {
  format,          // date-fns: Date → "2025-01-15" 等の文字列変換
  startOfMonth,    // date-fns: 月の最初の日を返す
  endOfMonth,      // date-fns: 月の最後の日を返す
  eachDayOfInterval, // date-fns: 指定範囲の全日付を配列で返す
  getDay,          // date-fns: 曜日を数値(0=日曜)で返す
  addMonths,       // date-fns: 月を加算
  subMonths,       // date-fns: 月を減算
} from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftStatusConfig } from "../GanttChartTypes";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CalendarHeader } from "../../calendar/CalendarHeader";
import { DatePickerModal } from "../../calendar/modals/DatePickerModal";
import { getStatusColor } from "../../calendar/calendar-utils/calendar.utils";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { getDateTextColor } from "@/common/common-utils/util-date/dateUtils";
import type { MarkedDates } from "react-native-calendars/src/types";

// ============================================================
// --- ShiftSelectionContext（シフト選択状態の共有） ---
// ============================================================
// React の Context API を使って「どのシフトが選択されているか」をツリー全体で共有する。
// Context を使う理由: 選択状態を props で上→下に渡すと、中間コンポーネントが全部再レンダリングされる。
// Context なら、選択状態を使うコンポーネントだけが再レンダリングされる。

// createContext<型>(デフォルト値): Context オブジェクトを作成する。
// <ShiftSelectionContextType> でこの Context が持つ値の型を指定。
// Set<string>: JavaScript の組み込みデータ構造。重複しない値の集合。has() で O(1) で存在チェックできる。
interface ShiftSelectionContextType {
  selectedShiftIds: Set<string>;  // 選択中のシフトIDの集合
  onToggleSelect: (shiftId: string) => void;  // 選択/解除をトグルする関数
  clearSelection: () => void;     // 全選択を解除する関数
  selectedCount: number;          // 選択中の件数
}

export const ShiftSelectionContext = createContext<ShiftSelectionContextType>({
  selectedShiftIds: new Set(),
  onToggleSelect: () => {},
  clearSelection: () => {},
  selectedCount: 0,
});

// ShiftSelectionProvider: このコンポーネントの children（子要素）全体に選択状態を配信する。
// React.FC<{ children: React.ReactNode }> は「children を受け取る関数コンポーネント」の型。
export const ShiftSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useState<Set<string>>: Set 型の状態を管理。選択されたシフトIDの集合。
  const [selectedShiftIds, setSelectedShiftIds] = useState<Set<string>>(new Set());

  // トグル処理: すでに選択されていたら削除、されていなかったら追加
  // prev => ... の形は「前の状態を元に新しい状態を作る」パターン（関数型更新）。
  const onToggleSelect = React.useCallback((shiftId: string) => {
    setSelectedShiftIds(prev => {
      const next = new Set(prev); // 前の Set をコピー（イミュータブルに更新するため）
      if (next.has(shiftId)) {
        next.delete(shiftId);     // 既に選択済み → 解除
      } else {
        next.add(shiftId);        // 未選択 → 追加
      }
      return next;
    });
  }, []);

  // 全選択解除: 空の Set に置き換える
  const clearSelection = React.useCallback(() => {
    setSelectedShiftIds(new Set());
  }, []);

  // useMemo で value オブジェクトをメモ化。依存配列が変わらない限り同じオブジェクト参照を返す。
  // これにより、不要な再レンダリングを防止する。
  const value = useMemo(() => ({
    selectedShiftIds,
    onToggleSelect,
    clearSelection,
    selectedCount: selectedShiftIds.size, // Set の size プロパティで要素数を取得
  }), [selectedShiftIds, onToggleSelect, clearSelection]);

  // Provider で children をラップすると、子孫コンポーネントが useContext() で value にアクセスできる。
  return (
    <ShiftSelectionContext.Provider value={value}>
      {children}
    </ShiftSelectionContext.Provider>
  );
};

// ============================================================
// --- DateCell（日付列セル） ---
// ============================================================
// ガントチャートの左端に表示する「15 月」のような日付セル。
// 祝日・日曜日は赤、土曜日は青でテキスト色を変える。
export type DateCellProps = {
  date: string;
  dateColumnWidth: number;
  styles: ReturnType<typeof StyleSheet.create>;
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
  const textColor =
    holidayTextColor || (dayOfWeek === "土" ? "#2196F3" : "#333333");
  return (
    <View
      style={[
        styles['dateCell'],
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
      <Text style={[styles['dateDayText'], { color: textColor }]}>
        {dayOfMonth}
      </Text>
      <Text style={[styles['dateWeekText'], { color: textColor }]}>
        {dayOfWeek}
      </Text>
    </View>
  );
};

// ============================================================
// --- GanttChartGrid（シフトバー描画エリア） ---
// ============================================================
// ガントチャートの中央部分。背景に30分刻みのグリッド線を描き、
// その上にシフトバー（ShiftBarWithCheckbox）を position: absolute で重ねる。
// 時間→ピクセル変換ロジック（timeToPosition）がこのコンポーネントの核心。
export type GanttChartGridProps = {
  shifts: ShiftItem[];          // この行に表示するシフトの配列
  cellWidth: number;            // 30分あたりのセル幅（px）
  ganttColumnWidth: number;     // ガント列全体の幅（px）
  halfHourLines: string[];      // 30分刻みの時間ラベル ["9:00","9:30","10:00",...]
  isClassTime: (time: string) => boolean;  // 授業時間帯の判定関数
  getStatusConfig: (status: string) => ShiftStatusConfig; // ステータス→設定変換
  onShiftPress?: (shift: ShiftItem) => void;   // シフトバータップ時
  onBackgroundPress?: (x: number) => void;     // 背景タップ時（x座標を渡す）
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  styles: ReturnType<typeof StyleSheet.create>;
  userColorsMap: Record<string, string>;  // ユーザーID → 色 のマッピング
  users?: Array<{ uid: string; role: string; nickname: string }>;
  getTimeWidth?: (time: string) => number; // 動的幅計算用（時間帯によって幅を変える場合）
  colorMode?: "status" | "user"; // 色表示モード: ステータス色 or ユーザー色
};

// typeIdがない既存データ用に名前で「授業」タイプを検索
const findDefaultType = (typesMap?: Record<string, TimeSegmentType>) => {
  if (!typesMap) return undefined;
  return Object.values(typesMap).find((t) => t.name === "授業");
};

// 途中時間データをタスク表示形式に変換するヘルパー関数
const convertClassesToTasks = (shift: ShiftItem, typesMap?: Record<string, TimeSegmentType>) => {
  if (!shift.classes || shift.classes.length === 0) return [];

  const defaultType = findDefaultType(typesMap);

  return shift.classes.map((classTime, index) => {
    const segType = classTime.typeId ? typesMap?.[classTime.typeId] : defaultType;
    const name = segType?.name || classTime.typeName || "授業";
    const icon = segType?.icon || "";
    return {
      id: `${shift.id}-class-${index}`,
      title: `${icon ? icon + " " : ""}${name} ${classTime.startTime}-${classTime.endTime}`,
      shortName: `${icon ? icon + " " : ""}${name}`,
      startTime: classTime.startTime,
      endTime: classTime.endTime,
      color: segType?.color || "#757575",
      icon: "book-outline",
      type: "custom",
    };
  });
};

// 自動配置タスクをタスク表示形式に変換するヘルパー関数
const convertAutoAssignedToTasks = (
  shiftId: string,
  assignmentsByShift: Record<string, ShiftTaskAssignment[]>,
  rolesMap: Record<string, { name: string; icon: string; color: string }>,
  tasksMap: Record<string, { name: string; icon: string; color: string }>
) => {
  const assignments = assignmentsByShift[shiftId];
  if (!assignments || assignments.length === 0) return [];

  return assignments.map((a, index) => {
    const taskInfo = a.taskId ? tasksMap[a.taskId] : undefined;
    const roleInfo = a.roleId ? rolesMap[a.roleId] : undefined;
    const info = taskInfo || roleInfo;
    const name = info?.name || "";
    const icon = info?.icon || "";
    const color = info?.color || "#4CAF50";
    return {
      id: `${shiftId}-auto-${index}`,
      title: `${icon ? icon + " " : ""}${name} ${a.scheduledStartTime}-${a.scheduledEndTime}`,
      shortName: `${icon ? icon + " " : ""}${name}`,
      startTime: a.scheduledStartTime,
      endTime: a.scheduledEndTime,
      color,
      icon: "construct-outline",
      type: "auto",
    };
  });
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
  styles,
  userColorsMap,
  users = [], // デフォルト値を設定
  getTimeWidth,
  colorMode = "status", // デフォルトはステータス色
}) => {
  const { typesMap: segTypesMap } = useTimeSegmentTypesContext();
  const { assignmentsByShift } = useShiftTaskAssignmentsContext();
  const { rolesMap, tasksMap } = useStaffRolesContext();

  /** 時刻文字列("HH:MM")を分に変換する。不正な形式の場合は 0 を返す。
   *  例: "10:30" → 10*60+30 = 630 */
  function parseMinutes(timeStr: string): number {
    const parts = timeStr.split(":");  // "10:30" → ["10", "30"]
    const h = Number(parts[0]);        // "10" → 10
    const m = Number(parts[1]);        // "30" → 30
    // Number.isNaN(): NaN(Not a Number)かどうか判定。不正入力への安全策。
    return (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m);
  }

  // 指定インデックスの時間セルの幅を取得。getTimeWidth が渡されていれば動的計算。
  function getCellWidthAt(index: number): number {
    return getTimeWidth ? getTimeWidth(halfHourLines[index] ?? "00:00") : cellWidth;
  }

  // --- 時間→ピクセル位置変換（timeToPosition） ---
  // 例: "10:30" → ガント列の左端からのピクセル位置を返す。
  // halfHourLines を順に走査し、各セルの幅を累積して位置を求める。
  // 途中の時間（30分刻みの間）は線形補間（ratio）で計算する。
  function timeToPosition(time: string): number {
    let position = 0;
    const targetMinutes = parseMinutes(time);

    for (let i = 0; i < halfHourLines.length; i++) {
      const currentMinutes = parseMinutes(halfHourLines[i] ?? "0:00");

      if (currentMinutes === targetMinutes) {
        return position;
      }

      if (currentMinutes > targetMinutes) {
        const prevMinutes = i > 0 ? parseMinutes(halfHourLines[i - 1] ?? "0:00") : currentMinutes;
        const span = currentMinutes - prevMinutes;
        const ratio = span > 0 ? (targetMinutes - prevMinutes) / span : 0;
        const prevPosition = i > 0 ? position - getCellWidthAt(i) : 0;
        return prevPosition + ratio * getCellWidthAt(i);
      }

      position += getCellWidthAt(i);
    }
    return position;
  }

  // --- ピクセル位置→時間逆変換（positionToTime） ---
  // timeToPosition の逆関数。ドラッグ操作などでピクセル位置から時間文字列に戻す。
  function positionToTime(position: number): string {
    let currentPosition = 0;

    for (let i = 0; i < halfHourLines.length; i++) {
      const currentWidth = getTimeWidth
        ? getTimeWidth(halfHourLines[i] || "")
        : cellWidth;
      const nextPosition = currentPosition + currentWidth;

      if (position <= nextPosition) {
        // この時間範囲内に位置がある
        const [hourStr, minStr] = halfHourLines[i]?.split(":") || ["0", "0"];
        const hour = hourStr ? Number(hourStr) : 0;
        const min = minStr ? Number(minStr) : 0;
        const baseMinutes = hour * 60 + min;

        if (position <= currentPosition) {
          // 現在の時間ポイント
          return halfHourLines[i] ?? "00:00";
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
    return halfHourLines.at(-1) ?? "22:00";
  }

  return (
    <View
      style={[styles['ganttCell'], { width: ganttColumnWidth, height: "100%" }]}
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
      <View style={styles['ganttBgRow']}>
        {halfHourLines.map((t, i) => {
          const currentWidth = getTimeWidth ? getTimeWidth(t) : cellWidth;
          const isHourMark = t.endsWith(":00");
          return (
            <View
              key={t}
              style={[
                styles['ganttBgCell'],
                isClassTime(t) && styles['classTimeCell'],
                {
                  width: currentWidth,
                  borderRightWidth: isHourMark ? 1 : 0.5,
                },
              ]}
            />
          );
        })}
      </View>
      {/* --- シフトバーの描画 --- */}
      {/* 各シフトについて、開始/終了時間をピクセル位置に変換してバーを配置する。
          重複するシフトがある場合は、セルの高さを分割して縦に並べる。 */}
      {shifts.map((shift, index) => {
        const statusConfig = getStatusConfig(shift.status);
        // 時間→ピクセル変換: "09:00" → 0px, "10:00" → cellWidth*2 のように
        const startPos = timeToPosition(shift.startTime);
        const endPos = timeToPosition(shift.endTime);
        const barWidth = endPos - startPos;  // バーの幅 = 終了位置 - 開始位置
        const totalShifts = shifts.length;
        const cellHeight = 48;

        // 重複チェック - 他のシフトと時間が重複するかどうか
        // some(): 配列の中に条件を満たす要素が1つでもあれば true を返す。
        const hasOverlap = shifts.some((otherShift, otherIndex) => {
          if (otherIndex === index) return false;
          const otherStartPos = timeToPosition(otherShift.startTime);
          const otherEndPos = timeToPosition(otherShift.endTime);
          return endPos > otherStartPos && startPos < otherEndPos;
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
        const borderColor =
          colorMode === "status"
            ? statusConfig.color
            : userColorsMap?.[shift.userId] || statusConfig.color;

        // 2時間以下かどうかを判定（120分 = 2時間）
        const startTimeMinutes = (() => {
          const [h, m] = shift.startTime.split(":").map(Number);
          return (h ?? 0) * 60 + (m ?? 0);
        })();
        const endTimeMinutes = (() => {
          const [h, m] = shift.endTime.split(":").map(Number);
          return (h ?? 0) * 60 + (m ?? 0);
        })();
        const durationMinutes = endTimeMinutes - startTimeMinutes;
        const isShortShift = durationMinutes <= 120; // 2時間以下

        // ユーザー情報を取得してアイコンを決定
        const user = users.find((u) => u.uid === shift.userId);
        const isMaster = user?.role === "master";
        const userIcon = isMaster ? "person" : "school";

        // 短いシフトの場合でも十分な表示幅を確保
        const minWidthForShift = isShortShift ? 72 : 57; // 短いシフトは最小65px

        // 2行分割表示用のシフトバー
        return (
          <ShiftBarWithCheckbox
            key={shift.id}
            shift={shift}
            startPos={startPos}
            barWidth={Math.max(barWidth, minWidthForShift)}
            singleBarHeight={singleBarHeight}
            barVerticalOffset={barVerticalOffset}
            borderColor={borderColor}
            {...(onShiftPress && { onShiftPress })}
            styles={styles}
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
                      name={shift.status === "deletion_requested" ? "trash-outline" as any : userIcon as any}
                      size={11}
                      color={borderColor}
                      style={{ marginRight: 2 }}
                    />
                    <Text
                      style={[
                        styles['shiftBarText'],
                        {
                          fontSize: 9,
                          fontWeight: "bold",
                          color: shift.status === "deletion_requested" ? borderColor : "#333",
                          textAlign: "left",
                          lineHeight: 11,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.status === "deletion_requested" ? "削除申請中" : shift.nickname}
                    </Text>
                  </View>

                  {/* 2行目: 時間 */}
                  <Text
                    style={[
                      styles['shiftTimeText'],
                      {
                        fontSize: 8,
                        color: "#666",
                        textAlign: "left",
                        lineHeight: 10,
                        paddingLeft: 13,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {shift.startTime}～{shift.endTime}
                  </Text>
                </View>
              ) : (
                // 2時間超: アイコン＋名前（左詰め）、時間（中央配置、大きいテキスト）を1行で表示
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    flex: 1,
                    minHeight: 18,
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
                      name={shift.status === "deletion_requested" ? "trash-outline" as any : userIcon as any}
                      size={11}
                      color={borderColor}
                      style={{ marginRight: 2 }}
                    />
                    <Text
                      style={[
                        styles['shiftBarText'],
                        {
                          fontSize: 13,
                          fontWeight: "bold",
                          color: shift.status === "deletion_requested" ? borderColor : "#333",
                          textAlign: "left",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {shift.status === "deletion_requested" ? "削除申請中" : shift.nickname}
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
                        styles['shiftTimeText'],
                        {
                          fontSize: 13,
                          fontWeight: "bold",
                          color: "#555",
                          textAlign: "center",
                          marginRight: 26,
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
                  flex: 1.0,
                  backgroundColor: "rgba(240, 245, 251, 0.8)",
                  borderRadius: 2,
                  position: "relative",
                  overflow: "hidden",
                  borderTopWidth: 0.5,
                  borderTopColor: "rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* タスク表示エリア - 授業 + 自動配置タスクを表示 */}
                {(() => {
                  const classTasks = convertClassesToTasks(shift, segTypesMap);
                  const autoTasks = convertAutoAssignedToTasks(shift.id, assignmentsByShift, rolesMap, tasksMap);
                  const allTasks = [...classTasks, ...autoTasks];

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
                        const relativeWidth = Math.max(taskWidth, 8); // 最小幅8px

                        return (
                          <View
                            key={`${shift.id}-task-${taskIndex}`}
                            style={{
                              position: "absolute",
                              left: relativeStartPos + 2, // 少し余白を追加
                              width: relativeWidth,
                              height: "100%",
                              backgroundColor: task.type === "auto" ? (task.color || "#4CAF50") + "CC" : (task.color || "#4CAF50"),
                              borderRadius: 4,

                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              paddingHorizontal: 0,
                              ...shadows.small,
                              borderWidth: task.type === "auto" ? 1.5 : 0.5,
                              borderColor: task.type === "auto" ? task.color || "#4CAF50" : "rgba(255, 255, 255, 0.3)",
                              borderStyle: task.type === "auto" ? "dashed" : "solid",
                            }}
                          >
                            {/* タスク名または略称（中央部分） */}
                            {relativeWidth >= 20 && (
                              <Text
                                style={{
                                  fontSize: relativeWidth >= 40 ? 8 : 7,
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
                                {relativeWidth >= 40 && task.title
                                  ? task.title
                                  : task.shortName ||
                                    task.title?.substring(0, 2) ||
                                    "タ"}
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
                          fontSize: 7,
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
          </ShiftBarWithCheckbox>
        );
      })}
    </View>
  );
};

// ============================================================
// --- ShiftBarWithCheckbox（個別シフトバー + チェックボックス） ---
// ============================================================
// 各シフトバーを描画するコンポーネント。
// Context から選択状態を取得し、マウスホバー時にチェックボックスを表示する。
// React.memo でラップして、関係ないバーの再レンダリングを防止している。
// position: absolute で親（GanttChartGrid）内の正確な位置に配置される。
interface ShiftBarWithCheckboxProps {
  shift: ShiftItem;
  startPos: number;
  barWidth: number;
  singleBarHeight: number;
  barVerticalOffset: number;
  borderColor: string;
  onShiftPress?: (shift: ShiftItem) => void;
  styles: ReturnType<typeof StyleSheet.create>;
  children: React.ReactNode;
}

const ShiftBarWithCheckboxInner: React.FC<ShiftBarWithCheckboxProps> = ({
  shift,
  startPos,
  barWidth,
  singleBarHeight,
  barVerticalOffset,
  borderColor,
  onShiftPress,
  styles,
  children,
}) => {
  const { selectedShiftIds, onToggleSelect } = useContext(ShiftSelectionContext);
  const isSelected = selectedShiftIds.has(shift.id);
  const [hovered, setHovered] = useState(false);
  const showCheckbox = hovered || isSelected;

  return (
    <View
      // @ts-ignore: Web-only mouse events
      onMouseEnter={() => setHovered(true)}
      // @ts-ignore
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: startPos,
        width: barWidth,
        height: singleBarHeight,
        top: barVerticalOffset,
        zIndex: 2,
      }}
    >
      {/* チェックボックス */}
      {showCheckbox && (
        <TouchableOpacity
          style={{
            position: "absolute",
            left: 2,
            top: (singleBarHeight - 20) / 2,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: isSelected ? "#2196F3" : "#FFFFFF",
            borderWidth: isSelected ? 0 : 1.5,
            borderColor: "#9E9E9E",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
          onPress={(e) => {
            e.stopPropagation();
            onToggleSelect(shift.id);
          }}
          activeOpacity={0.7}
        >
          {isSelected && (
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold", lineHeight: 14 }}>
              ✓
            </Text>
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          styles['shiftBar'],
          {
            left: 0,
            width: "100%",
            height: "100%",
            top: 0,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderLeftWidth: 1.5,
            borderLeftColor: borderColor,
            borderRightWidth: 1.5,
            borderRightColor: borderColor,
            borderTopWidth: 1.5,
            borderTopColor: borderColor,
            borderBottomWidth: 1.5,
            borderBottomColor: borderColor,
            opacity:
              shift.status === "deleted"
                ? 0.5
                : 1,
            borderRadius: 6,
          },
        ]}
        onPress={() => onShiftPress?.(shift)}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

const ShiftBarWithCheckbox = React.memo(ShiftBarWithCheckboxInner);

// ============================================================
// --- GanttChartInfo（右サイドのミニカレンダー） ---
// ============================================================
// ガントチャートの右側に表示するミニカレンダー。
// 各日付にシフトがある場合はドットマーカーを表示し、
// 日付をタップするとその日にスクロールする。
export type GanttChartInfoProps = {
  shifts: ShiftItem[];
  getStatusConfig: (status: string) => ShiftStatusConfig;
  onShiftPress?: (shift: ShiftItem) => void;
  onDelete: (shift: ShiftItem) => void;
  infoColumnWidth: number;
  styles: ReturnType<typeof StyleSheet.create>;
  onToggleComplete?: (shift: ShiftItem) => void;
  allShifts?: ShiftItem[];
  selectedDate?: Date;
  onDateSelect?: (date: string) => void;
  onMonthChange?: (month: { year: number; month: number }) => void;
};
export const GanttChartInfo: React.FC<GanttChartInfoProps> = ({
  shifts,
  getStatusConfig,
  onShiftPress,
  onDelete,
  infoColumnWidth,
  styles,
  onToggleComplete,
  allShifts = [],
  selectedDate,
  onDateSelect,
  onMonthChange,
}) => {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(
    selectedDate || new Date()
  );
  const [internalSelectedDate, setInternalSelectedDate] = React.useState<
    string | null
  >(selectedDate ? format(selectedDate, "yyyy-MM-dd") : null);

  // 外部からのselectedDateが変更されたら内部状態も更新
  React.useEffect(() => {
    setInternalSelectedDate(
      selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
    );
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  // カレンダーグリッド用の日付データを生成
  const calendarData = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start, end });

    const startDayOfWeek = getDay(start);
    const prevMonthDays = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(start);
      prevDay.setDate(prevDay.getDate() - (i + 1));
      prevMonthDays.push({ date: prevDay, isCurrentMonth: false });
    }

    const currentMonthDays = monthDays.map((date) => ({
      date,
      isCurrentMonth: true,
    }));

    const totalCells = 42;
    const remainingCells =
      totalCells - prevMonthDays.length - currentMonthDays.length;
    const nextMonthDays = [];
    for (let i = 0; i < remainingCells; i++) {
      const nextDay = new Date(end);
      nextDay.setDate(nextDay.getDate() + (i + 1));
      nextMonthDays.push({ date: nextDay, isCurrentMonth: false });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentMonth]);

  // マークされた日付を生成
  const markedDates = React.useMemo(() => {
    const marks: MarkedDates = {};
    const shiftsByDate: Record<string, ShiftItem[]> = {};

    allShifts.forEach((shift) => {
      if (shift.status !== "deleted" && shift.status !== "purged") {
        const date = shift.date;
        if (!shiftsByDate[date]) {
          shiftsByDate[date] = [];
        }
        shiftsByDate[date].push(shift);
      }
    });

    Object.entries(shiftsByDate).forEach(([date, dayShifts]) => {
      const shiftDots = dayShifts.slice(0, 3).map((shift, index) => ({
        key: `${shift.id}-${index}`,
        color: getStatusColor(shift.status),
        selectedDotColor: getStatusColor(shift.status),
      }));
      marks[date] = { dots: shiftDots };
    });

    return marks;
  }, [allShifts]);

  const handleDayPress = (dateString: string) => {
    setInternalSelectedDate(dateString);
    if (onDateSelect) {
      onDateSelect(dateString);
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    const newMonth =
      direction === "prev"
        ? subMonths(currentMonth, 1)
        : addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);

    if (onMonthChange) {
      onMonthChange({ year: newMonth.getFullYear(), month: newMonth.getMonth() });
    }
  };

  const handleDateSelect = (date: Date) => {
    setCurrentMonth(date);
    if (onMonthChange) {
      onMonthChange({ year: date.getFullYear(), month: date.getMonth() });
    }
  };

  return (
    <View
      style={[
        styles['infoCell'],
        {
          width: infoColumnWidth,
          backgroundColor: "#ffffff",
          minHeight: 215,
          flex: 1,
          marginLeft: 0,
        },
      ]}
    >
      <View
        style={{ flex: 1, paddingLeft: 0, paddingRight: 2, paddingVertical: 4 }}
      >
        {/* カレンダーヘッダー */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => handleMonthChange("prev")}
            style={{ padding: 5, borderRadius: 6 }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={18} color="#2196F3" />
          </TouchableOpacity>

          <CalendarHeader
            date={currentMonth}
            onYearMonthSelect={() => setShowDatePicker(true)}
            responsiveStyle={{ fontSize: 15 }}
          />

          <TouchableOpacity
            onPress={() => handleMonthChange("next")}
            style={{ padding: 5, borderRadius: 6 }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-right" size={18} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* 曜日ヘッダー */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 1,
            marginBottom: 1,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "#E0E0E0",
          }}
        >
          {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
            <View
              key={day}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color:
                    index === 0 ? "#F44336" : index === 6 ? "#2196F3" : "#757575",
                }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* カレンダーグリッド */}
        <View style={{ flex: 1 }}>
          {[0, 1, 2, 3, 4, 5].map((weekIndex) => (
            <View
              key={weekIndex}
              style={{
                flexDirection: "row",
                flex: 1,
              }}
            >
              {calendarData
                .slice(weekIndex * 7, weekIndex * 7 + 7)
                .map((dayData, dayIndex) => {
                  const dateString = format(dayData.date, "yyyy-MM-dd");
                  const isSelected = internalSelectedDate === dateString;
                  const isToday =
                    format(dayData.date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd");
                  const marking = markedDates[dateString];

                  return (
                    <View
                      key={dateString}
                      style={{
                        flex: 1,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 1,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isSelected
                              ? "#2196F3"
                              : isToday
                              ? "#F5F5F5"
                              : "transparent",
                            borderRadius: 13,
                            width: 26,
                            height: 26,
                          }}
                          onPress={() => handleDayPress(dateString)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: isToday ? "600" : "400",
                              color: isSelected
                                ? "#fff"
                                : !dayData.isCurrentMonth
                                ? "#BDBDBD"
                                : isToday
                                ? "#333333"
                                : dayData.date.getDay() === 0
                                ? "#F44336"
                                : dayData.date.getDay() === 6
                                ? "#2196F3"
                                : "#333333",
                              textAlign: "center",
                            }}
                          >
                            {format(dayData.date, "d")}
                          </Text>
                        </TouchableOpacity>

                        {/* シフトドット */}
                        {marking?.dots && marking.dots.length > 0 && (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                              marginTop: 2,
                            }}
                          >
                            {marking.dots.map((dot: { key?: string; color: string }, index: number) => (
                              <View
                                key={dot.key || index}
                                style={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: dot.color,
                                  marginHorizontal: 0.5,
                                }}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          ))}
        </View>

        {/* 日付選択モーダル */}
        <DatePickerModal
          isVisible={showDatePicker}
          initialDate={currentMonth}
          onClose={() => setShowDatePicker(false)}
          onSelect={handleDateSelect}
        />
      </View>
    </View>
  );
};

// ============================================================
// --- EmptyCell（シフトがない日の空白行） ---
// ============================================================
// シフトが登録されていない日に表示する空白のガントセル。
// 背景にグリッド線を描画し、タップすると新規シフト追加モーダルが開く。
export type EmptyCellProps = {
  date: string;         // この行の日付
  width: number;        // セル全体の幅（px）
  cellWidth: number;    // 30分あたりのセル幅（px）
  halfHourLines: string[];  // 30分刻みの時間ラベル配列
  isClassTime: (time: string) => boolean;  // 授業時間帯の判定
  styles: Record<string, any>;  // Record<string, any> はキーが文字列、値が何でもよいオブジェクト型
  handleEmptyCellClick: (date: string, position: number) => void;  // 空白タップ時のコールバック
  getTimeWidth?: (time: string) => number;  // 動的幅計算用
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
        ? getTimeWidth(halfHourLines[i] || "")
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
    <View style={[styles['emptyCell'], { width }]}>
      <TouchableOpacity
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        onPress={handlePress}
        activeOpacity={0.7}
      />
      <View style={styles['ganttBgRow']}>
        {halfHourLines.map((t, i) => {
          const currentWidth = getTimeWidth ? getTimeWidth(t) : cellWidth;
          const isHourMark = t.endsWith(":00");
          return (
            <View
              key={t}
              style={[
                styles['ganttBgCell'],
                isClassTime(t) && styles['classTimeCell'],
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
