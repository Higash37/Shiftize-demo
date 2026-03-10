/** @file TimeInput.tsx @description HH:MM形式の時刻入力コンポーネント。自動フォーマット・補完機能付き */
import React, { useState, useEffect } from "react";
import { TextInput, TextInputProps } from "react-native";

/** TimeInputのProps */
interface TimeInputProps
  extends Omit<TextInputProps, "value" | "onChangeText"> {
  /** 現在の時刻文字列（HH:MM形式） */
  value: string;
  /** 時刻変更時のコールバック */
  onChangeText: (value: string) => void;
  /** プレースホルダー（デフォルト: "00:00"） */
  placeholder?: string;
  /** エラー状態の表示 */
  isError?: boolean;
}

/** HH:MM形式の時刻入力。数字入力時に自動でコロン挿入・時分のバリデーションを行う */
export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChangeText,
  placeholder = "00:00",
  isError = false,
  style,
  ...props
}) => {
  // --- State ---
  const [displayValue, setDisplayValue] = useState(value);

  // --- Effects ---
  useEffect(() => {
    // 外部から値が変更された場合のみ更新（内部での変更は無視）
    if (value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  // --- Handlers ---
  /** 入力文字列をHH:MM形式にフォーマットする */
  const formatTime = (input: string): string => {
    // 数字のみを抽出（正規表現のため replace を使用）
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    const numbers = input.replace(/\D/g, "");

    // 空の場合
    if (numbers === "") {
      return "";
    }

    // 1桁の場合
    if (numbers.length === 1) {
      const digit = Number.parseInt(numbers, 10);
      // 3以上の場合は自動で0を付けて:を追加 (03:, 04:, ... 09:)
      if (digit >= 3) {
        return "0" + numbers + ":";
      }
      // 0, 1, 2の場合はそのまま（2桁目を待つ）
      return numbers;
    }

    // 2桁の場合
    if (numbers.length === 2) {
      const hour = Number.parseInt(numbers, 10);
      // 24以上は無効なので23:に修正
      if (hour > 23) {
        return "23:";
      }

      // 2桁になったら自動で:を追加
      return numbers + ":";
    }

    // 3桁の場合: "093" → "09:3"
    if (numbers.length === 3) {
      const hour = numbers.substring(0, 2);
      const minute = numbers.substring(2, 3);
      const hourNum = Number.parseInt(hour, 10);

      if (hourNum > 23) {
        return "23:" + minute;
      }
      return hour + ":" + minute;
    }

    // 4桁以上の場合: "0930" → "09:30"
    if (numbers.length >= 4) {
      let hour = numbers.substring(0, 2);
      let minute = numbers.substring(2, 4);

      const hourNum = Number.parseInt(hour, 10);
      const minuteNum = Number.parseInt(minute, 10);

      // 時間の上限チェック
      if (hourNum > 23) {
        hour = "23";
      }

      // 分の上限チェック
      if (minuteNum > 59) {
        minute = "59";
      }

      return hour + ":" + minute;
    }

    return numbers;
  };

  const handleTextChange = (text: string) => {
    // 削除操作の場合
    if (text.length < displayValue.length) {
      // 「9:」→「9」のようにコロンだけを削除した場合
      if (displayValue.endsWith(":") && text === displayValue.slice(0, -1)) {
        setDisplayValue(text);
        return;
      }

      // その他の削除操作は数字のみを抽出して処理（正規表現のため replace を使用）
      // eslint-disable-next-line unicorn/prefer-string-replace-all
      const numbers = text.replace(/\D/g, "");

      if (numbers === "") {
        setDisplayValue("");
        onChangeText("");
      } else {
        // 削除時は自動フォーマットを適用しない（ユーザーの意図を尊重）
        setDisplayValue(numbers);
      }
      return;
    }

    // 入力操作の場合（テキストが追加された場合）
    if (text.length > displayValue.length) {
      const formatted = formatTime(text);
      setDisplayValue(formatted);

      // 完全な時間フォーマット（HH:MM）の場合のみ親に通知
      if (formatted.length === 5 && formatted.includes(":")) {
        onChangeText(formatted);
      } else if (formatted === "") {
        onChangeText("");
      }
      return;
    }

    // 同じ長さの場合（編集や置換の場合）
    const formatted = formatTime(text);
    setDisplayValue(formatted);

    if (formatted.length === 5 && formatted.includes(":")) {
      onChangeText(formatted);
    } else if (formatted === "") {
      onChangeText("");
    }
  };

  /**
   * コロンがない場合の補完処理
   */
  const completeWithoutColon = (value: string): string => {
    if (value.length === 1) {
      return "0" + value + ":00";
    }
    if (value.length === 2) {
      return value + ":00";
    }
    return value;
  };

  /**
   * コロンがあるが分が不完全な場合の補完処理
   */
  const completeWithIncompleteMinute = (parts: string[]): string => {
    if (parts[1]?.length === 1) {
      return parts[0] + ":" + parts[1] + "0";
    }
    if (parts[1] === undefined || parts[1] === "") {
      return parts[0] + ":00";
    }
    return parts.join(":");
  };

  /**
   * 時間の先頭0を削除（01:00 → 1:00）
   */
  const removeLeadingZero = (time: string): string => {
    const parts = time.split(":");
    if (parts[0] === "00" || parts[0] === "01" || parts[0] === "02") {
      const hour = Number.parseInt(parts[0], 10).toString();
      return hour + ":" + parts[1];
    }
    return time;
  };

  const handleBlur = () => {
    // フォーカスが外れた時に不完全な入力を補完
    if (displayValue && displayValue.length < 5) {
      let completed = displayValue;

      // コロンがある場合とない場合で処理を分ける
      if (completed.includes(":")) {
        // コロンはあるが分が不完全
        const parts = completed.split(":");
        completed = completeWithIncompleteMinute(parts);
      } else {
        // コロンがない場合
        completed = completeWithoutColon(completed);
      }

      // 最終的に01:00や02:00のような形式を1:00や2:00に変換
      if (completed.length === 5) {
        completed = removeLeadingZero(completed);
      }

      setDisplayValue(completed);
      onChangeText(completed);
    }
  };

  // --- Render ---
  return (
    <TextInput
      {...props}
      value={displayValue}
      onChangeText={handleTextChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      keyboardType="number-pad"
      maxLength={5}
      style={[style, isError && { borderColor: "#FF4444", borderWidth: 1 }]}
    />
  );
};
