import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ServiceProvider } from "@/services/ServiceProvider";
import { colors } from "@/common/common-constants/ThemeConstants";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ShiftListItemProps } from "./types";
import { shiftListItemStyles as styles } from "./styles";
import { useAuth } from "@/services/auth/useAuth";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

const ShiftListItemComponent: React.FC<ShiftListItemProps> = ({
  shift,
  isSelected,
  selectedDate,
  onPress,
  onDetailsPress,
  children,
  showNickname = false,
}) => {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState<string>("");
  const [isFromOtherStore, setIsFromOtherStore] = useState(false);

  // 店舗名を取得（依存配列を最適化）
  useEffect(() => {
    const fetchStoreName = async () => {
      if (!user?.uid || !("storeId" in shift) || !shift.storeId) return;

      try {
        // ユーザーデータから現在の店舗IDを取得
        const userData = await ServiceProvider.users.getUserData(user.uid) as (Record<string, any>) | null;
        if (!userData) return;

        const currentStoreId = userData['storeId'];

        // 他店舗のシフトかどうかを判定
        if (shift.storeId !== currentStoreId) {
          setIsFromOtherStore(true);

          // 店舗情報を直接取得
          if (shift.storeId && typeof shift.storeId === "string") {
            const storeDoc = await getDoc(
              doc(db, "stores", shift.storeId as string)
            );
            if (storeDoc.exists()) {
              const storeData = storeDoc.data();
              setStoreName(storeData['storeName'] || storeData['name'] || "他店舗");
            }
          }
        } else {
          setIsFromOtherStore(false);
          setStoreName("");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchStoreName();
  }, [user?.uid, shift.storeId]);

  return (
    <View style={{ width: "100%" }}>
      <View
        style={[
          styles.shiftItem,
          { borderColor: colors.status[shift.status] }, // 状態に応じた外枠の色
          shift.date === selectedDate && styles.selectedShiftItem,
        ]}
      >
        <TouchableOpacity style={styles.shiftContent} onPress={onPress}>
          <View style={styles.textContainer}>
            <View style={styles.shiftInfoContainer}>
              {/* 日付表示部分を固定幅に */}
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {format(new Date(shift.date), "d日(E)", {
                    locale: ja,
                  })}
                </Text>
              </View>
              {/* マスター用: ニックネーム表示 */}
              {showNickname && shift.nickname && (
                <View style={styles.nicknameContainer}>
                  <Text style={styles.nicknameText}>{shift.nickname}</Text>
                </View>
              )}
              {/* ステータスラベルを固定幅に */}
              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.userLabel,
                    {
                      backgroundColor: colors.status[shift.status] + "20",
                      color: colors.status[shift.status],
                    },
                  ]}
                >
                  {shift.status === "draft"
                    ? "下書き"
                    : shift.status === "approved"
                    ? "承認済"
                    : shift.status === "pending"
                    ? "承認待ち"
                    : shift.status === "rejected"
                    ? "却下"
                    : shift.status === "deletion_requested"
                    ? "削除申請中"
                    : shift.status === "deleted"
                    ? "削除済"
                    : shift.status === "completed"
                    ? "完了"
                    : ""}
                </Text>
              </View>
              {/* 時間表示 */}
              <View style={styles.timeContainer}>
                <Text
                  style={[
                    styles.timeText,
                    IS_SMALL_DEVICE && styles.smallTimeText,
                  ]}
                >
                  {shift.startTime} ~ {shift.endTime}
                </Text>
                {isFromOtherStore && storeName && (
                  <Text
                    style={[
                      styles.storeLabel,
                      {
                        backgroundColor: "#8B5CF6" + "20", // 紫色の背景
                        color: "#8B5CF6", // 紫色のテキスト
                      },
                    ]}
                  >
                    {storeName}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton} onPress={onDetailsPress}>
          <AntDesign
            name={isSelected ? "down" : "right"}
            size={IS_SMALL_DEVICE ? 12 : 14}
            color={colors.text.secondary}
            style={styles.detailsIcon}
          />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

// React.memoでラップしてメモ化
export const ShiftListItem = React.memo(ShiftListItemComponent);
