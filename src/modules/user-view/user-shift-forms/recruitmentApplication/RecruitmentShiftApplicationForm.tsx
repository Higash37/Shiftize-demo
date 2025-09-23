import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { useAuth } from "@/services/auth/useAuth";
import { Header } from "@/common/common-ui/ui-layout";
import { colors } from "@/common/common-constants/ThemeConstants";
import TimeSelect from "@/modules/user-view/user-shift-forms/TimeSelect";
import { RecruitmentShiftService } from "@/services/recruitment-shift-service/recruitmentShiftService";
import {
  RecruitmentShiftApplicationFormProps,
  DisplayRecruitmentShift,
  RecruitmentApplicationData,
  ApplicationStatus,
  TimeChangeApplication
} from "./types";
import { recruitmentApplicationStyles as styles } from "./styles";
import { RecruitmentShift } from "@/common/common-models/model-shift/shiftTypes";

export const RecruitmentShiftApplicationForm: React.FC<RecruitmentShiftApplicationFormProps> = ({
  storeId,
  shiftIds,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recruitmentShifts, setRecruitmentShifts] = useState<DisplayRecruitmentShift[]>([]);
  const [applicationData, setApplicationData] = useState<RecruitmentApplicationData>({
    applications: [],
    generalNotes: "",
  });

  // 募集シフトデータの取得
  useEffect(() => {
    const fetchRecruitmentShifts = async () => {
      try {
        setLoading(true);

        let shiftsQuery;
        if (shiftIds && shiftIds !== "") {
          // 特定のシフトIDが指定されている場合
          const shiftIdArray = shiftIds.split(",");
          const shiftsPromises = shiftIdArray.map(async (shiftId) => {
            const shiftDoc = await getDoc(doc(db, "recruitmentShifts", shiftId.trim()));
            if (shiftDoc.exists()) {
              return { id: shiftDoc.id, ...shiftDoc.data() } as RecruitmentShift;
            }
            return null;
          });

          const shiftsResults = await Promise.all(shiftsPromises);
          const validShifts = shiftsResults.filter(shift => shift !== null) as RecruitmentShift[];

          const displayShifts: DisplayRecruitmentShift[] = validShifts.map(shift => ({
            ...shift,
            application: {
              shiftId: shift.id,
              status: "available" as ApplicationStatus,
            },
          }));

          setRecruitmentShifts(displayShifts);
        } else {
          // 店舗の全ての募集中シフトを取得
          shiftsQuery = query(
            collection(db, "recruitmentShifts"),
            where("storeId", "==", storeId),
            where("status", "==", "open")
          );

          const shiftsSnapshot = await getDocs(shiftsQuery);
          const shifts: RecruitmentShift[] = shiftsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as RecruitmentShift[];

          const displayShifts: DisplayRecruitmentShift[] = shifts.map(shift => ({
            ...shift,
            application: {
              shiftId: shift.id,
              status: "available" as ApplicationStatus,
            },
          }));

          setRecruitmentShifts(displayShifts);
        }

        // 初期化はrecruitmentShiftsが更新された時に別のuseEffectで行う

      } catch (error) {
        console.error("Error fetching recruitment shifts:", error);
        Alert.alert("エラー", "募集シフトの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchRecruitmentShifts();
    }
  }, [storeId, shiftIds]);

  // recruitmentShiftsが更新された時にapplicationDataを初期化
  useEffect(() => {
    if (recruitmentShifts.length > 0) {
      const initialApplications = recruitmentShifts.map(shift => ({
        shiftId: shift.id,
        status: "available" as ApplicationStatus,
      }));

      setApplicationData(prev => ({
        ...prev,
        applications: initialApplications,
      }));
    }
  }, [recruitmentShifts]);

  // 応募ステータスの更新
  const updateApplicationStatus = (shiftId: string, status: ApplicationStatus) => {
    setApplicationData(prev => ({
      ...prev,
      applications: prev.applications.map(app =>
        app.shiftId === shiftId
          ? {
              ...app,
              status,
              ...(status !== "time_change" ? { timeChange: undefined } : {})
            }
          : app
      ),
    }));
  };

  // 時間変更データの更新
  const updateTimeChange = (shiftId: string, timeChange: Partial<TimeChangeApplication>) => {
    setApplicationData(prev => ({
      ...prev,
      applications: prev.applications.map(app =>
        app.shiftId === shiftId
          ? { ...app, timeChange: { ...app.timeChange, ...timeChange } as TimeChangeApplication }
          : app
      ),
    }));
  };

  // 応募データの送信
  const handleSubmit = async () => {
    if (!user) return;

    try {
      setSubmitting(true);

      // 応募可能または時間変更で応募するシフトのみを処理
      const validApplications = applicationData.applications.filter(
        app => app.status === "available" || app.status === "time_change"
      );

      if (validApplications.length === 0) {
        Alert.alert("確認", "応募するシフトが選択されていません。");
        return;
      }

      // 各シフトに応募
      for (const application of validApplications) {
        const shift = recruitmentShifts.find(s => s.id === application.shiftId);
        if (!shift) continue;
        const shiftApplicationData = {
          userId: user.uid,
          nickname: user.nickname || user.email || "Unknown",
          requestedStartTime: application.status === "time_change"
            ? application.timeChange?.requestedStartTime || shift.startTime
            : shift.startTime,
          requestedEndTime: application.status === "time_change"
            ? application.timeChange?.requestedEndTime || shift.endTime
            : shift.endTime,
          notes: application.status === "time_change"
            ? `時間変更希望: ${application.timeChange?.notes || ""}\n${applicationData.generalNotes || ""}`
            : applicationData.generalNotes || "",
        };

        console.log('🔵 About to call RecruitmentShiftService.applyToRecruitmentShift');
        console.log('🔵 ShiftId:', application.shiftId);
        console.log('🔵 Application data:', shiftApplicationData);

        await RecruitmentShiftService.applyToRecruitmentShift(
          application.shiftId,
          shiftApplicationData
        );

        console.log('🔵 Successfully called RecruitmentShiftService.applyToRecruitmentShift');
      }
      router.replace("/(main)/user/shifts");

    } catch (error) {
      console.error("Error submitting applications:", error);
      Alert.alert("エラー", "応募の送信に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  // ローディング状態
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="募集シフト応募" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // 募集シフトが存在しない場合
  if (recruitmentShifts.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="募集シフト応募" showBackButton={true} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            現在募集中のシフトはありません。
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="募集シフト応募" showBackButton={true} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.pageTitle}>募集シフト応募</Text>
          <Text style={styles.pageSubtitle}>
            各シフトについて、応募状況を選択してください
          </Text>

          {recruitmentShifts.map((shift) => {
            const application = applicationData.applications.find(app => app.shiftId === shift.id);
            const currentStatus = application?.status || "available";

            return (
              <View key={shift.id} style={styles.shiftCard}>
                <View style={styles.shiftHeader}>
                  <Text style={styles.shiftDate}>
                    📅 {new Date(shift.date).toLocaleDateString('ja-JP', {
                      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
                    })}
                  </Text>
                  <Text style={styles.shiftTime}>
                    🕒 {shift.startTime} - {shift.endTime}
                  </Text>
                  {shift.notes && (
                    <Text style={styles.shiftNotes}>
                      📝 {shift.notes}
                    </Text>
                  )}
                </View>

                <View style={styles.applicationSection}>
                  <Text style={styles.applicationLabel}>応募状況</Text>

                  {/* 応募可能 */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => updateApplicationStatus(shift.id, "available")}
                  >
                    <View style={[
                      styles.radioButton,
                      currentStatus === "available" && styles.radioButtonSelected
                    ]}>
                      {currentStatus === "available" && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.optionText}>応募可能</Text>
                  </TouchableOpacity>

                  {/* 時間変更で応募 */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => updateApplicationStatus(shift.id, "time_change")}
                  >
                    <View style={[
                      styles.radioButton,
                      currentStatus === "time_change" && styles.radioButtonSelected
                    ]}>
                      {currentStatus === "time_change" && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.optionText}>時間変更で応募</Text>
                  </TouchableOpacity>

                  {/* 応募不可 */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => updateApplicationStatus(shift.id, "unavailable")}
                  >
                    <View style={[
                      styles.radioButton,
                      currentStatus === "unavailable" && styles.radioButtonSelected
                    ]}>
                      {currentStatus === "unavailable" && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.optionText}>応募不可</Text>
                  </TouchableOpacity>

                  {/* 時間変更の詳細入力 */}
                  {currentStatus === "time_change" && (
                    <View style={styles.timeChangeSection}>
                      <Text style={styles.timeChangeLabel}>希望時間</Text>
                      <TimeSelect
                        startTime={application?.timeChange?.requestedStartTime || ""}
                        endTime={application?.timeChange?.requestedEndTime || ""}
                        onStartTimeChange={(time) => updateTimeChange(shift.id, { requestedStartTime: time })}
                        onEndTimeChange={(time) => updateTimeChange(shift.id, { requestedEndTime: time })}
                        zIndex={2}
                      />
                      <TextInput
                        style={styles.notesInput}
                        placeholder="時間変更の理由やメモ（任意）"
                        multiline
                        value={application?.timeChange?.notes || ""}
                        onChangeText={(text) => updateTimeChange(shift.id, { notes: text })}
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* 全体メモ */}
          <View style={styles.generalNotesSection}>
            <Text style={styles.generalNotesLabel}>全体メモ（任意）</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="全体に関するメモがあれば記入してください"
              multiline
              value={applicationData.generalNotes}
              onChangeText={(text) => setApplicationData(prev => ({ ...prev, generalNotes: text }))}
            />
          </View>

          {/* 送信ボタン */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "送信中..." : "応募する"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};