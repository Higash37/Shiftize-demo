/**
 * クイックシフト追加画面（LIFF経由・フリー入力型）
 * URLタップ → 日時入力 → 即座に送信
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/common/common-constants/ThemeConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { QuickShiftTokenService } from "@/services/quick-shift/QuickShiftTokenService";
import { ShiftAPIService } from "@/services/api/ShiftAPIService";
import { useAuth } from "@/services/auth/useAuth";
import type { QuickShiftToken } from "@/services/quick-shift/QuickShiftTokenService";
import { format, parse, isWithinInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { Picker } from "@react-native-picker/picker";
import { Platform } from "react-native";

export default function QuickAddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  // LIFF初期化とトークン取得
  const [token, setToken] = useState<string>("");
  const [liffInitialized, setLiffInitialized] = useState(false);

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<QuickShiftToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // フォーム状態
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("09:00");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("17:00");

  // 選択可能な日付リスト
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // 複数選択用の状態
  type SelectedShift = {
    date: string;
    startTime: string;
    endTime: string;
  };
  const [selectedShifts, setSelectedShifts] = useState<SelectedShift[]>([]);

  // 時間オプション（9:00-22:00を15分刻み）
  const timeOptions: string[] = [];
  for (let hour = 9; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 22 && minute > 0) break;
      timeOptions.push(
        `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`
      );
    }
  }

  // LIFF初期化
  useEffect(() => {
    const initializeLiff = async () => {
      // Web環境でのみLIFFを初期化
      if (Platform.OS !== "web") {
        setError("LIFF画面はWebブラウザでのみ利用可能です");
        setLoading(false);
        return;
      }

      try {
        // Dynamic import for @line/liff
        const liff = (await import("@line/liff")).default;

        await liff.init({ liffId: "2008790644-5SoBzRPY" });
        setLiffInitialized(true);

        // ログイン確認
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        // liff.stateからトークンパラメータを取得
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get("token");

        if (tokenParam) {
          setToken(tokenParam);
        } else {
          setError("トークンが見つかりません");
          setLoading(false);
        }
      } catch (err) {
        console.error("LIFF initialization error:", err);
        setError("LIFF初期化に失敗しました");
        setLoading(false);
      }
    };

    initializeLiff();
  }, []);

  // トークン検証と日付範囲設定
  useEffect(() => {
    const loadData = async () => {
      if (!liffInitialized || !token || typeof token !== "string") {
        if (!liffInitialized) {
          // LIFF初期化待ち
          return;
        }
        setError("無効なURLです");
        setLoading(false);
        return;
      }

      try {
        // トークン検証
        const validation = await QuickShiftTokenService.validateToken(
          token,
          user?.uid
        );

        if (!validation.valid || !validation.token) {
          setError(validation.error || "URLが無効です");
          setLoading(false);
          return;
        }

        setTokenData(validation.token);

        // 選択可能な日付リスト生成
        const dates: string[] = [];
        let start: Date;
        let end: Date;

        if (validation.token.allowedDateRange) {
          // トークンに日付範囲が指定されている場合
          const { startDate, endDate } = validation.token.allowedDateRange;
          start = parse(startDate, "yyyy-MM-dd", new Date());
          end = parse(endDate, "yyyy-MM-dd", new Date());
        } else {
          // 日付範囲が指定されていない場合、今日から3ヶ月後までの範囲を生成
          start = new Date();
          end = new Date();
          end.setMonth(end.getMonth() + 3);
        }

        let current = start;
        while (current <= end) {
          dates.push(format(current, "yyyy-MM-dd"));
          current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
        }

        setAvailableDates(dates);
        if (dates.length > 0 && dates[0]) {
          setSelectedDate(dates[0]);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [liffInitialized, token, user?.uid]);

  // リストに追加
  const handleAddToList = () => {
    if (!selectedDate) {
      Alert.alert("エラー", "日付を選択してください");
      return;
    }

    // 時間の妥当性チェック
    const startTimeMs = new Date(`2000-01-01T${selectedStartTime}`).getTime();
    const endTimeMs = new Date(`2000-01-01T${selectedEndTime}`).getTime();

    if (endTimeMs <= startTimeMs) {
      Alert.alert("エラー", "終了時刻は開始時刻より後にしてください");
      return;
    }

    // 重複チェック
    const isDuplicate = selectedShifts.some(
      (shift) =>
        shift.date === selectedDate &&
        shift.startTime === selectedStartTime &&
        shift.endTime === selectedEndTime
    );

    if (isDuplicate) {
      Alert.alert("エラー", "同じ日時が既に追加されています");
      return;
    }

    // リストに追加
    setSelectedShifts([
      ...selectedShifts,
      {
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
      },
    ]);

    Alert.alert("追加完了", "リストに追加しました");
  };

  // リストから削除
  const handleRemoveFromList = (index: number) => {
    const newShifts = selectedShifts.filter((_, i) => i !== index);
    setSelectedShifts(newShifts);
  };

  // 全シフト一括送信
  const handleSubmitAll = async () => {
    if (selectedShifts.length === 0) {
      Alert.alert("エラー", "シフトを追加してください");
      return;
    }

    if (!user?.uid || !user?.nickname) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    if (!tokenData?.storeId) {
      Alert.alert("エラー", "店舗情報が取得できません");
      return;
    }

    try {
      setSubmitting(true);

      const createdShiftIds: string[] = [];

      // 全シフトを作成
      for (const shift of selectedShifts) {
        const shiftData = {
          storeId: tokenData.storeId,
          userId: user.uid,
          nickname: user.nickname,
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
          notes: "クイックURL経由での追加（一括）",
          status: "pending" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const shiftId = await ShiftAPIService.createShift(shiftData as any);
        createdShiftIds.push(shiftId);
      }

      // トークン使用記録（最後のシフトIDで記録）
      if (token && typeof token === "string" && createdShiftIds.length > 0) {
        await QuickShiftTokenService.recordTokenUsage(
          token,
          user.uid,
          createdShiftIds[createdShiftIds.length - 1] || ""
        );
      }

      Alert.alert(
        "完了",
        `${selectedShifts.length}件のシフトを追加しました（承認待ち）`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.error("Error submitting:", err);
      Alert.alert("エラー", "シフトの追加に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // 単一シフト送信（従来機能を維持）
  const handleSubmit = async () => {
    if (!selectedDate) {
      Alert.alert("エラー", "日付を選択してください");
      return;
    }

    if (!user?.uid || !user?.nickname) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    if (!tokenData?.storeId) {
      Alert.alert("エラー", "店舗情報が取得できません");
      return;
    }

    // 時間の妥当性チェック
    const startTimeMs = new Date(`2000-01-01T${selectedStartTime}`).getTime();
    const endTimeMs = new Date(`2000-01-01T${selectedEndTime}`).getTime();

    if (endTimeMs <= startTimeMs) {
      Alert.alert("エラー", "終了時刻は開始時刻より後にしてください");
      return;
    }

    try {
      setSubmitting(true);

      // シフト作成
      const shiftData = {
        storeId: tokenData.storeId,
        userId: user.uid,
        nickname: user.nickname,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        notes: "クイックURL経由での追加",
        status: "pending" as const, // 承認待ち
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const shiftId = await ShiftAPIService.createShift(shiftData as any);

      // トークン使用記録
      if (token && typeof token === "string") {
        await QuickShiftTokenService.recordTokenUsage(
          token,
          user.uid,
          shiftId
        );
      }

      Alert.alert("完了", "シフトを追加しました（承認待ち）", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error("Error submitting:", err);
      Alert.alert("エラー", "シフトの追加に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>シフト追加</Text>
        <Text style={styles.subtitle}>入れる日時を選択してください</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formSection}>
          <Text style={styles.label}>日付</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDate}
              onValueChange={(value) => setSelectedDate(value)}
              style={styles.picker}
            >
              {availableDates.map((date) => (
                <Picker.Item
                  key={date}
                  label={format(parse(date, "yyyy-MM-dd", new Date()), "M月d日(E)", {
                    locale: ja,
                  })}
                  value={date}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>開始時刻</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStartTime}
              onValueChange={(value) => setSelectedStartTime(value)}
              style={styles.picker}
            >
              {timeOptions.map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>終了時刻</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedEndTime}
              onValueChange={(value) => setSelectedEndTime(value)}
              style={styles.picker}
            >
              {timeOptions.map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>現在の選択</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewDate}>
              {selectedDate &&
                format(
                  parse(selectedDate, "yyyy-MM-dd", new Date()),
                  "yyyy年M月d日(E)",
                  { locale: ja }
                )}
            </Text>
            <Text style={styles.previewTime}>
              {selectedStartTime} 〜 {selectedEndTime}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addToListButton}
            onPress={handleAddToList}
          >
            <Text style={styles.addToListButtonText}>➕ リストに追加</Text>
          </TouchableOpacity>
        </View>

        {selectedShifts.length > 0 && (
          <View style={styles.selectedListSection}>
            <Text style={styles.selectedListLabel}>
              選択済みシフト ({selectedShifts.length}件)
            </Text>
            {selectedShifts.map((shift, index) => (
              <View key={index} style={styles.selectedShiftCard}>
                <View style={styles.selectedShiftInfo}>
                  <Text style={styles.selectedShiftDate}>
                    {format(
                      parse(shift.date, "yyyy-MM-dd", new Date()),
                      "M月d日(E)",
                      { locale: ja }
                    )}
                  </Text>
                  <Text style={styles.selectedShiftTime}>
                    {shift.startTime} 〜 {shift.endTime}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFromList(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {selectedShifts.length > 0 ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitAll}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {selectedShifts.length}件のシフトを一括送信
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>このシフトのみ送信</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: layout.padding.medium,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.padding.large,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: layout.padding.medium,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  header: {
    padding: layout.padding.large,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  formSection: {
    padding: layout.padding.large,
    backgroundColor: "#fff",
    marginTop: layout.padding.small,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  previewSection: {
    padding: layout.padding.large,
    marginTop: layout.padding.medium,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  previewCard: {
    backgroundColor: "#fff",
    padding: layout.padding.large,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  previewDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  previewTime: {
    fontSize: 16,
    color: colors.text.primary,
  },
  footer: {
    padding: layout.padding.large,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: layout.padding.large,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  addToListButton: {
    backgroundColor: colors.primary,
    padding: layout.padding.medium,
    borderRadius: 8,
    alignItems: "center",
    marginTop: layout.padding.medium,
  },
  addToListButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedListSection: {
    padding: layout.padding.large,
    marginTop: layout.padding.small,
  },
  selectedListLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  selectedShiftCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: layout.padding.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: layout.padding.small,
  },
  selectedShiftInfo: {
    flex: 1,
  },
  selectedShiftDate: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  selectedShiftTime: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  removeButton: {
    backgroundColor: colors.error,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: layout.padding.medium,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
