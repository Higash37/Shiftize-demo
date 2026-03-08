import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { typography } from "@/common/common-constants/TypographyConstants";
import { layout } from "@/common/common-constants/LayoutConstants";

// Webの場合はreact-svgを、ネイティブの場合はreact-native-svgを使用
let Svg: any, Circle: any, Line: any, Path: any;
if (Platform.OS === "web") {
  // Webの場合は通常のSVGを使用
  Svg = "svg";
  Circle = "circle";
  Line = "line";
  Path = "path";
} else {
  // ネイティブの場合
  try {
    const svgModule = require("react-native-svg");
    Svg = svgModule.default || svgModule.Svg;
    Circle = svgModule.Circle;
    Line = svgModule.Line;
    Path = svgModule.Path;
  } catch (e) {
    console.warn("react-native-svg not available");
  }
}

interface ClockWidgetProps {
  staffSchedules: Array<{ startTime: string; endTime: string }>; // "HH:MM" format
  size?: number;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  staffSchedules,
  size = 300,
  selectedDate,
  onDateSelect,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPM, setIsPM] = useState(true); // 午前/午後の切り替え（デフォルト: 午後）

  useEffect(() => {
    // requestAnimationFrameで毎フレーム正確な時刻を取得
    let animationFrameId: number;

    const updateTime = () => {
      setCurrentTime(new Date());
      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const center = size / 2;
  const radius = size / 2 - 20;

  // サイズに応じてフォントサイズやスケールを調整
  const scale = size / 300; // 300pxを基準とする
  const numberFontSize = Math.max(12, 16 * scale); // 最小12px
  const toggleFontSize = Math.max(11, 14 * scale); // 最小11px
  const togglePadding = Math.max(4, 8 * scale); // 最小4px

  // 時刻を角度に変換（12時間表示）
  const timeToAngle = (hours: number, minutes: number): number => {
    const totalMinutes = (hours % 12) * 60 + minutes;
    return (totalMinutes / (12 * 60)) * 360 - 90; // -90で12時を上に
  };

  // 時間文字列("HH:MM")を角度に変換
  const timeStringToAngle = (timeStr: string): number => {
    const [h, m] = timeStr.split(":").map((v) => Number.parseInt(v, 10));
    return timeToAngle(h || 0, m || 0);
  };

  // 時間文字列を分に変換
  const timeStrToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // 分を時間文字列に変換
  const minutesToTimeStr = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // 午前/午後に応じてスケジュールをフィルタリング＋時間帯をクリップ
  const NOON = 720; // 12:00 = 720分
  const filteredSchedules = staffSchedules
    .filter((schedule) => {
      const startMins = timeStrToMinutes(schedule.startTime);
      const endMins = timeStrToMinutes(schedule.endTime);
      if (isPM) {
        // 午後モード: 終了時刻が12:00より後のもの
        return endMins > NOON;
      } else {
        // 午前モード: 開始時刻が12:00より前のもの
        return startMins < NOON;
      }
    })
    .map((schedule) => {
      const startMins = timeStrToMinutes(schedule.startTime);
      const endMins = timeStrToMinutes(schedule.endTime);
      if (isPM) {
        // PMモード: 開始時刻を12:00以降にクリップ
        const clampedStart = Math.max(startMins, NOON);
        return { startTime: minutesToTimeStr(clampedStart), endTime: schedule.endTime };
      } else {
        // AMモード: 終了時刻を12:00以前にクリップ
        const clampedEnd = Math.min(endMins, NOON);
        return { startTime: schedule.startTime, endTime: minutesToTimeStr(clampedEnd) };
      }
    });

  // スタッフがいる時間帯を青い円弧で描画
  const renderStaffArcs = () => {
    return filteredSchedules.map((schedule, index) => {
      let startAngle = timeStringToAngle(schedule.startTime);
      let endAngle = timeStringToAngle(schedule.endTime);

      // 角度を0~360の範囲に正規化
      startAngle = (startAngle + 360) % 360;
      endAngle = (endAngle + 360) % 360;

      // 円弧のパスを生成
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const arcRadius = radius - 10;
      const x1 = center + arcRadius * Math.cos(startRad);
      const y1 = center + arcRadius * Math.sin(startRad);
      const x2 = center + arcRadius * Math.cos(endRad);
      const y2 = center + arcRadius * Math.sin(endRad);

      // 角度差を計算（時計回り）
      let angleDiff = endAngle - startAngle;
      if (angleDiff < 0) angleDiff += 360;

      const largeArcFlag = angleDiff > 180 ? 1 : 0;

      const pathData = `
        M ${x1} ${y1}
        A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      `;

      return (
        <Path
          key={index}
          d={pathData}
          stroke={colors.primary}
          strokeWidth="8"
          fill="none"
          opacity={0.6}
        />
      );
    });
  };

  // 時計の数字を描画（24時間表記）
  const renderNumbers = () => {
    return Array.from({ length: 12 }, (_, i) => {
      // 午前: 0-11, 午後: 12-23
      const displayHour = isPM ? (i === 0 ? 12 : i + 12) : i;
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const numberRadius = radius - 30;
      const x = center + numberRadius * Math.cos(angle);
      const y = center + numberRadius * Math.sin(angle);

      return (
        <Text
          key={i}
          style={[
            styles.numberText,
            {
              position: "absolute",
              left: x - 10,
              top: y - 10,
              fontSize: numberFontSize,
            },
          ]}
        >
          {displayHour}
        </Text>
      );
    });
  };

  // 現在時刻の針
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  const hourAngle = timeToAngle(hours, minutes) * (Math.PI / 180);
  const minuteAngle = ((minutes / 60) * 360 - 90) * (Math.PI / 180);
  const secondAngle = ((seconds / 60) * 360 - 90) * (Math.PI / 180);

  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.7;
  const secondHandLength = radius * 0.75;

  const hourX = center + hourHandLength * Math.cos(hourAngle);
  const hourY = center + hourHandLength * Math.sin(hourAngle);

  const minuteX = center + minuteHandLength * Math.cos(minuteAngle);
  const minuteY = center + minuteHandLength * Math.sin(minuteAngle);

  const secondX = center + secondHandLength * Math.cos(secondAngle);
  const secondY = center + secondHandLength * Math.sin(secondAngle);

  return (
    <View style={styles.outerContainer}>
      {/* 午前/午後切り替えボタン + 当日ボタン */}
      <View style={[styles.toggleContainer, { padding: togglePadding / 2 }]}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isPM && styles.toggleButtonActive,
            { paddingHorizontal: togglePadding * 2, paddingVertical: togglePadding },
          ]}
          onPress={() => setIsPM(false)}
        >
          <Text
            style={[
              styles.toggleText,
              !isPM && styles.toggleTextActive,
              { fontSize: toggleFontSize },
            ]}
          >
            午前
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isPM && styles.toggleButtonActive,
            { paddingHorizontal: togglePadding * 2, paddingVertical: togglePadding },
          ]}
          onPress={() => setIsPM(true)}
        >
          <Text
            style={[
              styles.toggleText,
              isPM && styles.toggleTextActive,
              { fontSize: toggleFontSize },
            ]}
          >
            午後
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { paddingHorizontal: togglePadding * 2, paddingVertical: togglePadding },
          ]}
          onPress={() => onDateSelect(new Date())}
        >
          <Text style={[styles.toggleText, { fontSize: toggleFontSize }]}>当日</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* 時計の枠 */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.border}
            strokeWidth="2"
            fill={colors.surface}
          />

          {/* スタッフがいる時間帯の表示 */}
          {renderStaffArcs()}

          {/* 時刻の目盛り */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const outerX = center + radius * Math.cos(angle);
            const outerY = center + radius * Math.sin(angle);
            const innerX = center + (radius - 10) * Math.cos(angle);
            const innerY = center + (radius - 10) * Math.sin(angle);

            return (
              <Line
                key={i}
                x1={outerX}
                y1={outerY}
                x2={innerX}
                y2={innerY}
                stroke={colors.text.secondary}
                strokeWidth="2"
              />
            );
          })}

          {/* 時針 */}
          <Line
            x1={center}
            y1={center}
            x2={hourX}
            y2={hourY}
            stroke={colors.text.primary}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* 分針 */}
          <Line
            x1={center}
            y1={center}
            x2={minuteX}
            y2={minuteY}
            stroke={colors.text.primary}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* 秒針 */}
          <Line
            x1={center}
            y1={center}
            x2={secondX}
            y2={secondY}
            stroke={colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* 中心の円 */}
          <Circle cx={center} cy={center} r="6" fill={colors.primary} />
        </Svg>

        {/* 数字表示 */}
        <View style={StyleSheet.absoluteFill}>{renderNumbers()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: layout.padding.small,
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.medium,
  },
  toggleButton: {
    borderRadius: layout.borderRadius.small,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: typography.fontFamily,
    color: colors.text.secondary,
  },
  toggleTextActive: {
    color: colors.surface,
    fontWeight: typography.fontWeight.semibold as any,
  },
  numberText: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.semibold as any,
    fontFamily: typography.fontFamily,
    color: colors.text.primary,
    width: 20,
    height: 20,
    textAlign: "center",
  },
});
