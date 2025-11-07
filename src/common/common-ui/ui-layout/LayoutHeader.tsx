import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { router } from "expo-router";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "./LayoutHeader.styles";
import { HeaderProps } from "./LayoutHeader.types";
import { RecruitmentShiftModal } from "@/modules/reusable-widgets/recruitment-shift-component/RecruitmentShiftModal";
import { ServiceIntroModal } from "@/modules/reusable-widgets/service-intro/ServiceIntroModal";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { RecruitmentShift } from "@/common/common-models/model-shift/shiftTypes";

/**
 * Header - 標準のヘッダーコンポーネント
 *
 * アプリケーションの上部に表示され、タイトルとナビゲーション機能を提供します。
 */
export function Header({
  title,
  showBackButton = false,
  onBack,
  onPressSettings,
}: HeaderProps) {
  const { signOut, user } = useAuth();
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);
  const [showServiceIntro, setShowServiceIntro] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.storeId) return;

    const q = query(
      collection(db, "recruitmentShifts"),
      where("storeId", "==", user.storeId),
      where("status", "==", "open")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const shifts: RecruitmentShift[] = [];
        snapshot.forEach((doc) => {
          shifts.push({ id: doc.id, ...doc.data() } as RecruitmentShift);
        });

        // 未応募のシフト数をカウント
        const unappliedCount = shifts.filter(
          (shift) => !shift.applications?.some((app) => app.userId === user.uid)
        ).length;

        setUnreadCount(unappliedCount);
      },
      (error) => {
        // 認証エラーの場合は無視（ログアウト時の正常な動作）
        if (error.code === "permission-denied") {
          setUnreadCount(0);
          return;
        }
        // console.error("Header realtime error:", error);
      }
    );

    return () => unsubscribe();
  }, [user?.storeId, user?.uid]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <AntDesign
              name="arrow-left"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => setShowRecruitmentModal(true)}
          style={styles.notificationButton}
        >
          <AntDesign name="bell" size={24} color={colors.text.primary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* サービス紹介ボタン */}
        <TouchableOpacity
          onPress={() => setShowServiceIntro(true)}
          style={styles.signOutButton}
        >
          <AntDesign
            name="question-circle"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>

        {onPressSettings && (
          <TouchableOpacity
            onPress={onPressSettings}
            style={styles.signOutButton}
          >
            <FontAwesome name="cog" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <FontAwesome name="sign-out" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <RecruitmentShiftModal
        visible={showRecruitmentModal}
        onClose={() => setShowRecruitmentModal(false)}
        userRole="teacher"
      />

      {/* サービス紹介モーダル */}
      <ServiceIntroModal
        visible={showServiceIntro}
        onClose={() => setShowServiceIntro(false)}
      />
    </View>
  );
}

export { MasterHeader } from "./MasterHeader";
export default Header;
