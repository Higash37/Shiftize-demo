import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { ServiceProvider } from "@/services/ServiceProvider";
import type { QuickShiftToken } from "@/services/interfaces/IQuickShiftTokenService";
import { RecruitmentShift } from "@/common/common-models/model-shift/shiftTypes";
import { colors } from "@/common/common-constants/ThemeConstants";
import { designSystem } from "@/common/common-constants/DesignSystem";
import Box from "@/common/common-ui/ui-base/BoxComponent";

/**
 * クイック募集シフト申し込みページ
 * URLからトークンを受け取り、募集シフトに申し込む
 */
export default function QuickRecruitPage() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<QuickShiftToken | null>(null);
  const [recruitmentShifts, setRecruitmentShifts] = useState<RecruitmentShift[]>([]);
  const [appliedShiftIds, setAppliedShiftIds] = useState<Set<string>>(new Set());

  // トークン検証と募集シフト取得
  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError("トークンが指定されていません");
        setLoading(false);
        return;
      }

      try {
        // トークン検証
        const result = await ServiceProvider.quickShiftTokens.validateToken(token, user?.uid);

        if (!result.valid || !result.token) {
          setError(result.error || "トークンが無効です");
          setLoading(false);
          return;
        }

        setTokenData(result.token);

        // 募集シフトを取得
        if (result.token.recruitmentShiftIds && result.token.recruitmentShiftIds.length > 0) {
          const shifts: RecruitmentShift[] = [];
          const applied = new Set<string>();

          for (const shiftId of result.token.recruitmentShiftIds) {
            const shift = await ServiceProvider.recruitmentShifts.getRecruitmentShift(shiftId);

            if (shift) {
              shifts.push(shift);

              // 既に申し込み済みかチェック
              if (shift.applications?.some(app => app.userId === user?.uid)) {
                applied.add(shift.id);
              }
            }
          }

          setRecruitmentShifts(shifts);
          setAppliedShiftIds(applied);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, user?.uid]);

  // 申し込み処理
  const handleApply = useCallback(async (shift: RecruitmentShift) => {
    if (!user || !token) return;

    const doApply = async () => {
      setSubmitting(true);
      try {
        // 募集シフトに応募
        await ServiceProvider.recruitmentShifts.applyToRecruitmentShift(shift.id, {
          userId: user.uid,
          nickname: user.nickname || "名前未設定",
          requestedStartTime: shift.startTime,
          requestedEndTime: shift.endTime,
          notes: "クイック申し込み",
        });

        // トークン使用記録
        await ServiceProvider.quickShiftTokens.recordTokenUsage(token, user.uid, shift.id);

        // 申し込み済みに追加
        setAppliedShiftIds(prev => new Set([...prev, shift.id]));

        if (Platform.OS === "web") {
          window.alert("申し込みが完了しました！");
        } else {
          Alert.alert("完了", "申し込みが完了しました！");
        }
      } catch (err) {
        console.error("Apply error:", err);
        const errorMessage = "申し込みに失敗しました。もう一度お試しください。";
        if (Platform.OS === "web") {
          window.alert(errorMessage);
        } else {
          Alert.alert("エラー", errorMessage);
        }
      } finally {
        setSubmitting(false);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`${formatDate(shift.date)} ${shift.startTime}〜${shift.endTime} に申し込みますか？`)) {
        doApply();
      }
    } else {
      Alert.alert(
        "申し込み確認",
        `${formatDate(shift.date)} ${shift.startTime}〜${shift.endTime} に申し込みますか？`,
        [
          { text: "キャンセル", style: "cancel" },
          { text: "申し込む", onPress: doApply },
        ]
      );
    }
  }, [user, token]);

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`;
  };

  // ローディング表示
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // エラー表示
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <AntDesign name="close-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(main)")}
          >
            <Text style={styles.backButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <Box variant="primary" style={styles.header}>
        <Text style={styles.headerTitle}>募集シフト申し込み</Text>
        <Text style={styles.headerSubtitle}>
          {user?.nickname}さん
        </Text>
      </Box>

      {/* シフト一覧 */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {recruitmentShifts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="inbox" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>募集シフトがありません</Text>
          </View>
        ) : (
          recruitmentShifts.map((shift) => {
            const isApplied = appliedShiftIds.has(shift.id);
            const isClosed = shift.status !== "open";

            return (
              <View key={shift.id} style={styles.shiftCard}>
                <View style={styles.shiftInfo}>
                  <Text style={styles.shiftDate}>{formatDate(shift.date)}</Text>
                  <Text style={styles.shiftTime}>
                    {shift.startTime} 〜 {shift.endTime}
                  </Text>
                  {shift.notes && (
                    <Text style={styles.shiftNotes}>{shift.notes}</Text>
                  )}
                  {shift.subject && (
                    <Text style={styles.shiftSubject}>{shift.subject}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    isApplied && styles.appliedButton,
                    isClosed && styles.closedButton,
                  ]}
                  onPress={() => handleApply(shift)}
                  disabled={isApplied || isClosed || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : isApplied ? (
                    <>
                      <AntDesign name="check" size={16} color="white" />
                      <Text style={styles.applyButtonText}>申込済</Text>
                    </>
                  ) : isClosed ? (
                    <Text style={styles.applyButtonText}>募集終了</Text>
                  ) : (
                    <Text style={styles.applyButtonText}>申し込む</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* フッター */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace("/(main)")}
        >
          <AntDesign name="home" size={20} color={colors.primary} />
          <Text style={styles.homeButtonText}>ホームに戻る</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    padding: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  shiftCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  shiftTime: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
  },
  shiftNotes: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  shiftSubject: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  appliedButton: {
    backgroundColor: colors.success || "#4CAF50",
  },
  closedButton: {
    backgroundColor: colors.text.disabled || "#9e9e9e",
  },
  applyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
});
