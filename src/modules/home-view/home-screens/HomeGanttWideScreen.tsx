import React from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { styles } from "../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../home-types/home-view-types";
import { colors } from "@/common/common-constants/ThemeConstants";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  namesFirst: string[];
  namesSecond: string[];
  timesFirst: string[];
  timesSecond: string[];
  sampleSchedule: SampleScheduleColumn[];
  showFirst: boolean; // 追加
  onCellPress?: (userName: string) => void; // 追加
  CELL_WIDTH: number; // 追加
}

export const HomeGanttWideScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  showFirst, // 追加
  onCellPress, // 追加
  CELL_WIDTH, // 追加
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const renderTable = (names: string[], times: string[]) => {
    const columnCount = Math.max(times.length + 1, 1);
    const columnWidth = windowWidth / columnCount;
    const cellHeight = columnWidth * 0.5;

    return (
    <View style={{ marginBottom: 16, width: windowWidth }}>
      {/* ヘッダー */}
      <View style={{ flexDirection: "row", width: windowWidth }}>
        <View
          style={[
            styles.headerCell,
            styles.positionHeaderCell,
            { width: columnWidth },
          ]}
        >
          <Text style={styles.headerText}>名前</Text>
        </View>
        {times.map((time) => (
          <View
            key={time}
            style={[styles.headerCell, { width: columnWidth }]}
          >
            <Text style={[styles.headerText, { fontWeight: "bold" }]}>
              {time}
            </Text>
          </View>
        ))}
      </View>
      {names.map((name) => (
        <View
          key={name}
          style={{
            flexDirection: "row",
            width: windowWidth,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={[
              styles.positionCell,
              { width: columnWidth, height: cellHeight },
            ]}
          >
            <Text style={styles.positionText}>{name}</Text>
          </View>
          {/* 横長バー描画ロジック */}
          {(() => {
            const timeList = times;
            const cells = [];
            let skip = 0;
            for (let i = 0; i < timeList.length; i++) {
              if (skip > 0) {
                skip--;
                continue;
              }
              // このセルの開始時刻
              const t = timeList[i];
              if (!t) return null;
              
              // この人のこの時間帯で該当するタスクを探す（区間内判定）
              const slot = sampleSchedule
                .flatMap((col) => col.slots)
                .find((s) => {
                  if (s.name !== name) return false;
                  if (t === s.start && t === s.end && t === "22:00")
                    return true;
                  return t >= s.start && t < s.end;
                });
              if (slot) {
                // 終了時刻までのセル数を計算
                const startIdx = i;
                const endIdx = timeList.findIndex(
                  (tt, idx) => idx > i && tt === slot.end
                );
                const span = endIdx !== -1 ? endIdx - startIdx : 1;
                skip = span - 1;
                cells.push(
                  <Pressable
                    key={name + "-" + t + "-" + slot.start}
                    style={[
                      styles.cell,
                      {
                        width: columnWidth * span,
                        height: cellHeight,
                        backgroundColor:
                          slot.type === "class"
                            ? colors.surfaceElevated
                            : slot.color || colors.primary + "1A",
                        borderColor:
                          slot.type === "class"
                            ? colors.border
                            : slot.color || colors.primary,
                        borderWidth: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row", // アイコンとテキストを横並び
                      },
                    ]}
                    onPress={() => onCellPress && onCellPress(name)}
                  >
          <MaterialIcons
            name={slot.type === "class" ? "school" : "person"}
            size={16}
            color={
              slot.type === "class"
                ? colors.text.secondary
                : colors.text.white
            }
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.taskText,
              slot.type !== "class" && { color: colors.text.white }, // スタッフのときは白文字
            ]}
                    >
                      {slot.task || ""} {slot.start}~{slot.end}
                    </Text>
                  </Pressable>
                );
              } else {
                // 何もなければ空セル
                cells.push(
                  <View
                    key={name + "-" + t + "-empty"}
                    style={[
                      styles.cell,
                      {
                        width: columnWidth,
                        height: cellHeight,
                        opacity: 0.1,
                      },
                    ]}
                  />
                );
              }
            }
            return cells;
          })()}
        </View>
      ))}
    </View>
  );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 前半/後半切り替えボタンは親で管理 */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
        {showFirst
          ? renderTable(namesFirst, timesFirst)
          : renderTable(namesSecond, timesSecond)}
      </ScrollView>
    </View>
  );
};
