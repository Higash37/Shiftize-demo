import React, { useRef } from "react";
import { View, Text, Animated } from "react-native";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { styles } from "./ShiftDetails.styles";
import { ShiftDetailsProps } from "./ShiftDetails.types";
// import { parseTimeString } from "../../calendar-utils/shift.utils";
import { parseTimeString } from "../../../calendar-utils/shift.utils";

/**
 * ShiftDetails - シフト詳細情報表示コンポーネント
 *
 * シフト情報の詳細をアニメーション付きの開閉パネルで表示するコンポーネント。
 * 授業時間とスタッフ時間を分けて表示します。
 */
export const ShiftDetails: React.FC<ShiftDetailsProps> = ({
  shift,
  maxHeight = 500,
  isOpen,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isOpen ? maxHeight : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, maxHeight]);

  return (
    <Animated.View style={[styles.container, { maxHeight: heightAnim }]}>
      {" "}
      <View style={styles.header}>
        <Text style={styles.nickname}>{shift.nickname}</Text>
        <Text style={styles.date}>
          {format(new Date(shift.date), "M月d日(E)", { locale: ja })}
        </Text>
      </View>
      <View style={styles.timeSlots}>
        {shift.classes?.length ? (
          <>
            {/* 最初のスタッフ時間 */}
            <View style={styles.timeSlot}>
              <Text style={styles.timeSlotLabel}>スタッフ</Text>{" "}
              <Text style={styles.timeText}>
                {format(parseTimeString(shift.date, shift.startTime), "HH:mm")}
                {" ~ "}
                {format(
                  parseTimeString(shift.date, shift.classes[0].startTime),
                  "HH:mm"
                )}
              </Text>
            </View>
            {/* 授業時間とその間のスタッフ時間 */}
            {shift.classes.map(
              (
                classTime: { startTime: string; endTime: string },
                index: number
              ) => (
                <React.Fragment key={index}>
                  <View style={[styles.timeSlot, styles.classTimeSlot]}>
                    <Text style={[styles.timeSlotLabel, styles.classLabel]}>
                      授業
                    </Text>{" "}
                    <Text style={[styles.timeText, styles.classTime]}>
                      {format(
                        parseTimeString(shift.date, classTime.startTime),
                        "HH:mm"
                      )}
                      {" ~ "}
                      {format(
                        parseTimeString(shift.date, classTime.endTime),
                        "HH:mm"
                      )}
                    </Text>
                  </View>

                  {shift.classes?.[index + 1] && (
                    <View style={styles.timeSlot}>
                      <Text style={styles.timeSlotLabel}>スタッフ</Text>{" "}
                      <Text style={styles.timeText}>
                        {format(
                          parseTimeString(shift.date, classTime.endTime),
                          "HH:mm"
                        )}
                        {" ~ "}
                        {format(
                          parseTimeString(
                            shift.date,
                            shift.classes[index + 1].startTime
                          ),
                          "HH:mm"
                        )}
                      </Text>
                    </View>
                  )}
                </React.Fragment>
              )
            )}
            {/* 最後のスタッフ時間 */}
            <View style={styles.timeSlot}>
              <Text style={styles.timeSlotLabel}>スタッフ</Text>{" "}
              <Text style={styles.timeText}>
                {format(
                  parseTimeString(
                    shift.date,
                    shift.classes[shift.classes.length - 1].endTime
                  ),
                  "HH:mm"
                )}
                {" ~ "}
                {format(parseTimeString(shift.date, shift.endTime), "HH:mm")}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.timeSlot}>
            <Text style={styles.timeSlotLabel}>スタッフ</Text>{" "}
            <Text style={styles.timeText}>
              {format(parseTimeString(shift.date, shift.startTime), "HH:mm")}
              {" ~ "}
              {format(parseTimeString(shift.date, shift.endTime), "HH:mm")}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};
