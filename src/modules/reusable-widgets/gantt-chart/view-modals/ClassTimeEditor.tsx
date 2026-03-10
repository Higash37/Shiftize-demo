/** @file ClassTimeEditor.tsx
 *  @description シフト内の「途中時間」（授業・休憩等）を追加・編集・削除するサブコンポーネント。
 *    AddShiftModalView と EditShiftModalView の両方から使われる。
 *    TimeSegmentTypesContext から途中時間タイプ（授業、清掃等）を取得し、プルダウンで選択可能。
 */

// 【このファイルの位置づけ】
// - import元: useTimeSegmentTypesContext（途中時間タイプのコンテキスト）
// - importされる先: AddShiftModalView, EditShiftModalView
// - 役割: 途中時間リストの CRUD UI。配列操作（追加・更新・削除）を onChange で親に通知する。

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";

// ClassTime: 1つの途中時間エントリの型
interface ClassTime {
  startTime: string;   // 開始時間
  endTime: string;     // 終了時間
  typeId?: string;     // 途中時間タイプのID（任意）
  typeName?: string;   // 途中時間タイプの名前（任意）
}

// ClassTimeEditorProps: このコンポーネントが受け取る props
interface ClassTimeEditorProps {
  classes: ClassTime[];
  timeOptions: string[];
  defaultStartTime: string;
  defaultEndTime: string;
  styles: any;
  onChange: (field: string, value: any) => void;
}

export const ClassTimeEditor: React.FC<ClassTimeEditorProps> = ({
  classes,
  timeOptions,
  defaultStartTime,
  defaultEndTime,
  styles,
  onChange,
}) => {
  const { types } = useTimeSegmentTypesContext();

  const updateClassField = (idx: number, field: "startTime" | "endTime" | "typeId", value: string) => {
    const updated = [...classes];
    if (field === "typeId") {
      const matched = types.find((t) => t.id === value);
      updated[idx] = { ...updated[idx]!, typeId: value, typeName: matched?.name || "" } as ClassTime;
    } else {
      updated[idx] = { ...updated[idx], [field]: value } as ClassTime;
    }
    onChange("classes", updated);
  };

  const removeClass = (idx: number) => {
    const updated = [...classes];
    updated.splice(idx, 1);
    onChange("classes", updated);
  };

  const addClass = () => {
    const defaultType = types[0];
    onChange("classes", [
      ...classes,
      {
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        typeId: defaultType?.id || "",
        typeName: defaultType?.name || "",
      },
    ]);
  };

  return (
    <>
      {classes.map((classTime, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          {types.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text style={styles.timeInputLabel}>タイプ</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={classTime.typeId || types.find((t) => t.name === "授業")?.id || ""}
                  onValueChange={(v) => updateClassField(idx, "typeId", v)}
                  style={styles.picker}
                >
                  <Picker.Item label="未選択" value="" />
                  {types.map((t) => (
                    <Picker.Item key={t.id} label={`${t.icon} ${t.name}`} value={t.id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.timeInputLabel}>開始</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={classTime.startTime}
                onValueChange={(v) => updateClassField(idx, "startTime", v)}
                style={styles.picker}
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          </View>
          <Text style={styles.timeInputSeparator}>~</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.timeInputLabel}>終了</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={classTime.endTime}
                onValueChange={(v) => updateClassField(idx, "endTime", v)}
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
            onPress={() => removeClass(idx)}
          >
            <Text style={{ color: "#FF4444", fontWeight: "bold" }}>
              削除
            </Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={{ marginTop: 4, alignSelf: "flex-start" }}
        onPress={addClass}
      >
        <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
          ＋途中時間を追加
        </Text>
      </TouchableOpacity>
    </>
  );
};
