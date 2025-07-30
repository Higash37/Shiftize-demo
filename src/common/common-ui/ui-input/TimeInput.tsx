import React, { useState, useEffect } from 'react';
import { TextInput, Platform, TextInputProps } from 'react-native';

interface TimeInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  isError?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChangeText,
  placeholder = "00:00",
  isError = false,
  style,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // 外部から値が変更された場合のみ更新（内部での変更は無視）
    if (value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  const formatTime = (input: string): string => {
    // 数字のみを抽出
    const numbers = input.replace(/\D/g, '');
    
    // 空の場合
    if (numbers === '') {
      return '';
    }
    
    // 1桁の場合
    if (numbers.length === 1) {
      const digit = parseInt(numbers);
      // 3以上の場合は自動で0を付けて:を追加 (03:, 04:, ... 09:)
      if (digit >= 3) {
        return '0' + numbers + ':';
      }
      // 0, 1, 2の場合はそのまま（2桁目を待つ）
      return numbers;
    }
    
    // 2桁の場合
    if (numbers.length === 2) {
      const hour = parseInt(numbers);
      // 24以上は無効なので23:に修正
      if (hour > 23) {
        return '23:';
      }
      
      // 2桁になったら自動で:を追加
      return numbers + ':';
    }
    
    // 3桁の場合: "093" → "09:3"
    if (numbers.length === 3) {
      const hour = numbers.substring(0, 2);
      const minute = numbers.substring(2, 3);
      const hourNum = parseInt(hour);
      
      if (hourNum > 23) {
        return '23:' + minute;
      }
      return hour + ':' + minute;
    }
    
    // 4桁以上の場合: "0930" → "09:30"
    if (numbers.length >= 4) {
      let hour = numbers.substring(0, 2);
      let minute = numbers.substring(2, 4);
      
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      
      // 時間の上限チェック
      if (hourNum > 23) {
        hour = '23';
      }
      
      // 分の上限チェック
      if (minuteNum > 59) {
        minute = '59';
      }
      
      return hour + ':' + minute;
    }
    
    return numbers;
  };

  const handleTextChange = (text: string) => {
    // 削除操作の場合
    if (text.length < displayValue.length) {
      // 「9:」→「9」のようにコロンだけを削除した場合
      if (displayValue.endsWith(':') && text === displayValue.slice(0, -1)) {
        setDisplayValue(text);
        return;
      }
      
      // その他の削除操作は数字のみを抽出して処理
      const numbers = text.replace(/\D/g, '');
      
      if (numbers === '') {
        setDisplayValue('');
        onChangeText('');
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
      if (formatted.length === 5 && formatted.includes(':')) {
        onChangeText(formatted);
      } else if (formatted === '') {
        onChangeText('');
      }
      return;
    }
    
    // 同じ長さの場合（編集や置換の場合）
    const formatted = formatTime(text);
    setDisplayValue(formatted);
    
    if (formatted.length === 5 && formatted.includes(':')) {
      onChangeText(formatted);
    } else if (formatted === '') {
      onChangeText('');
    }
  };

  const handleBlur = () => {
    // フォーカスが外れた時に不完全な入力を補完
    if (displayValue && displayValue.length > 0 && displayValue.length < 5) {
      let completed = displayValue;
      
      // コロンがない場合
      if (!completed.includes(':')) {
        if (completed.length === 1) {
          completed = '0' + completed + ':00';
        } else if (completed.length === 2) {
          completed = completed + ':00';
        }
      } else {
        // コロンはあるが分が不完全
        const parts = completed.split(':');
        if (parts[1] && parts[1].length === 1) {
          completed = parts[0] + ':' + parts[1] + '0';
        } else if (!parts[1]) {
          completed = parts[0] + ':00';
        }
      }
      
      // 最終的に01:00や02:00のような形式を1:00や2:00に変換
      if (completed.length === 5) {
        const parts = completed.split(':');
        if (parts[0] === '00' || parts[0] === '01' || parts[0] === '02') {
          const hour = parseInt(parts[0]).toString(); // '01' → '1', '02' → '2', '00' → '0'
          completed = hour + ':' + parts[1];
        }
      }
      
      setDisplayValue(completed);
      onChangeText(completed);
    }
  };

  return (
    <TextInput
      {...props}
      value={displayValue}
      onChangeText={handleTextChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      keyboardType="numeric"
      maxLength={5}
      style={[
        style,
        isError && { borderColor: '#FF4444', borderWidth: 1 }
      ]}
    />
  );
};