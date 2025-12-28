/**
 * クイック募集シフト応募画面（LIFF経由）
 * URLタップ → 即座に募集シフト選択 → 送信
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
import { RecruitmentShiftService } from "@/services/recruitment-shift-service/recruitmentShiftService";
import { useAuth } from "@/services/auth/useAuth";
import type {
  QuickShiftToken,
} from "@/services/quick-shift/QuickShiftTokenService";
import type { RecruitmentShift } from "@/common/common-models/model-shift/shiftTypes";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Platform } from "react-native";

export default function QuickRecruitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  // LIFF初期化とトークン取得
  const [token, setToken] = useState<string>("");
  const [liffInitialized, setLiffInitialized] = useState(false);

  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<QuickShiftToken | null>(null);
  const [recruitmentShifts, setRecruitmentShifts] = useState<RecruitmentShift[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        await liff.init({ liffId: "2008790644-HP5jsLPI" });
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

  // トークン検証と募集シフト読み込み
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

        // 募集シフト読み込み
        if (validation.token.recruitmentShiftIds) {
          const shifts: RecruitmentShift[] = [];
          for (const shiftId of validation.token.recruitmentShiftIds) {
            // 個別に募集シフトを取得（getDocを使用）
            const allShifts = await RecruitmentShiftService.getRecruitmentShifts(
              validation.token.storeId
            );
            const shift = allShifts.find((s) => s.id === shiftId);
            if (shift && shift.status === "open") {
              shifts.push(shift);
            }
          }
          setRecruitmentShifts(shifts);
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

  // シフト選択トグル
  const toggleShiftSelection = (shiftId: string) => {
    const newSelection = new Set(selectedShifts);
    if (newSelection.has(shiftId)) {
      newSelection.delete(shiftId);
    } else {
      newSelection.add(shiftId);
    }
    setSelectedShifts(newSelection);
  };

  // 応募送信
  const handleSubmit = async () => {
    if (selectedShifts.size === 0) {
      Alert.alert("エラー", "シフトを選択してください");
      return;
    }

    if (!user?.uid || !user?.nickname) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    try {
      setSubmitting(true);

      // 選択した全シフトに応募
      for (const shiftId of Array.from(selectedShifts)) {
        const shift = recruitmentShifts.find((s) => s.id === shiftId);
        if (!shift) continue;

        await RecruitmentShiftService.applyToRecruitmentShift(shiftId, {
          userId: user.uid,
          nickname: user.nickname,
          requestedStartTime: shift.startTime,
          requestedEndTime: shift.endTime,
          notes: "クイックURL経由での応募",
        });

        // トークン使用記録
        if (token && typeof token === "string") {
          await QuickShiftTokenService.recordTokenUsage(
            token,
            user.uid,
            shiftId
          );
        }
      }

      Alert.alert(
        "完了",
        `${selectedShifts.size}件のシフトに応募しました`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.error("Error submitting:", err);
      Alert.alert("エラー", "応募の送信に失敗しました");
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
        <Text style={styles.title}>シフト募集</Text>
        <Text style={styles.subtitle}>
          入れるシフトを選択してください（複数選択可）
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {recruitmentShifts.map((shift) => {
          const isSelected = selectedShifts.has(shift.id);
          return (
            <TouchableOpacity
              key={shift.id}
              style={[styles.shiftCard, isSelected && styles.shiftCardSelected]}
              onPress={() => toggleShiftSelection(shift.id)}
            >
              <View style={styles.shiftCardHeader}>
                <Text style={styles.shiftDate}>
                  {format(new Date(shift.date), "M月d日(E)", { locale: ja })}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
              <Text style={styles.shiftTime}>
                {shift.startTime} 〜 {shift.endTime}
              </Text>
              {shift.notes && (
                <Text style={styles.shiftNotes}>{shift.notes}</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {recruitmentShifts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              現在募集中のシフトはありません
            </Text>
          </View>
        )}
      </ScrollView>

      {recruitmentShifts.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (selectedShifts.size === 0 || submitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={selectedShifts.size === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                応募する（{selectedShifts.size}件）
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  shiftCard: {
    backgroundColor: "#fff",
    margin: layout.padding.medium,
    padding: layout.padding.large,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  shiftCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  shiftCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  shiftDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  shiftTime: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  shiftNotes: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: layout.padding.xlarge,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.disabled,
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
});
