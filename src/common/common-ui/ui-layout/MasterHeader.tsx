import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { auth, db } from "@/services/firebase/firebase";
import {
  MultiStoreService,
  UserStoreAccess,
} from "@/services/firebase/firebase-multistore";
import { StoreConnectionModal } from "@/modules/reusable-widgets/store-connection/StoreConnectionModal";
import { styles } from "./LayoutHeader.styles";
import { MasterHeaderProps } from "./LayoutHeader.types";
import { useAuth } from "@/services/auth/useAuth";
import { RecruitmentShiftModal } from "@/modules/reusable-widgets/recruitment-shift-component/RecruitmentShiftModal";
import { ServiceIntroModal } from "@/modules/reusable-widgets/service-intro/ServiceIntroModal";
import { LineNotificationModal } from "@/modules/reusable-widgets/line-notification/LineNotificationModal";
import { collection, query, where, onSnapshot } from "firebase/firestore";

/**
 * MasterHeader - マスター用ヘッダーコンポーネント
 *
 * 管理者画面用のヘッダーコンポーネントで、タイトル、店舗切り替え、ナビゲーション機能を提供します。
 */
export function MasterHeader({
  title,
  showBackButton = false,
  onBack,
}: Readonly<MasterHeaderProps>) {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isCompactLayout = width < 900;
  const [userStoreAccess, setUserStoreAccess] =
    useState<UserStoreAccess | null>(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [currentStoreInfo, setCurrentStoreInfo] = useState<string>(""); // デフォルト値
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);
  const [recruitmentCount, setRecruitmentCount] = useState(0);
  const [showServiceIntro, setShowServiceIntro] = useState(false);
  const [showLineNotification, setShowLineNotification] = useState(false);

  const storeButtonStyles = useMemo(
    () => [
      styles.storeButton,
      { backgroundColor: colors.primary },
      isCompactLayout && styles.storeButtonCompact,
    ],
    [isCompactLayout]
  );

  const storeButtonTextStyles = useMemo(
    () => [
      styles.storeButtonText,
      { color: "#FFFFFF" },
      isCompactLayout && styles.storeButtonTextCompact,
    ],
    [isCompactLayout]
  );

  const storeButtonLabel = useMemo(() => {
    if (!currentStoreInfo) {
      return "教室";
    }

    if (!isCompactLayout) {
      return `教室${currentStoreInfo}`;
    }

    const shortId = currentStoreInfo.slice(-4);
    return `教室${shortId}`;
  }, [currentStoreInfo, isCompactLayout]);

  // ユーザーの店舗アクセス権限を取得
  useEffect(() => {
    const fetchUserStoreAccess = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const storeAccess = await MultiStoreService.getUserStoreAccess(
          user.uid
        );

        if (storeAccess) {
          setUserStoreAccess(storeAccess);
          setCurrentStoreInfo(storeAccess.currentStoreId);
        } else {
          // レガシーユーザーの場合は移行処理
          await MultiStoreService.migrateLegacyUser(user.uid);
          const migratedAccess = await MultiStoreService.getUserStoreAccess(
            user.uid
          );

          setUserStoreAccess(migratedAccess);
          setCurrentStoreInfo(
            migratedAccess?.currentStoreId || user.storeId || ""
          );
        }
      } catch (error) {
        console.warn("Failed to fetch user store access:", error);
        setCurrentStoreInfo(user?.storeId || "");
      }
    };

    fetchUserStoreAccess();
  }, [user]);

  // 募集シフトの数を監視
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
        setRecruitmentCount(snapshot.size);
      },
      (error) => {
        // 認証エラーの場合は無視（ログアウト時の正常な動作）
        if (error.code === "permission-denied") {
          setRecruitmentCount(0);
        }
      }
    );

    return () => unsubscribe();
  }, [user?.storeId]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleStoreSwitch = async (storeId: string) => {
    if (!user?.uid || !userStoreAccess) return;

    try {
      await MultiStoreService.switchCurrentStore(user.uid, storeId);
      setCurrentStoreInfo(storeId);
      setShowStoreSelector(false);

      // ページをリロードして新しい店舗データを反映
      Alert.alert(
        "店舗切り替え完了",
        `教室${storeId}に切り替えました。データを更新しています...`,
        [
          {
            text: "OK",
            onPress: () => {
              // ホーム画面にリダイレクトしてデータを更新
              router.replace("/(main)/master/home");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error switching store:", error);
      Alert.alert("エラー", "店舗の切り替えに失敗しました");
    }
  };

  const renderStoreItem = ({
    item,
  }: {
    item: { storeId: string; storeName: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.storeItem,
        item.storeId === currentStoreInfo && styles.storeItemSelected,
      ]}
      onPress={() => handleStoreSwitch(item.storeId)}
    >
      <Text
        style={[
          styles.storeItemText,
          item.storeId === currentStoreInfo && styles.storeItemTextSelected,
        ]}
      >
        教室{item.storeId}
      </Text>
      <Text style={styles.storeItemName}>{item.storeName}</Text>
      {item.storeId === currentStoreInfo && (
        <AntDesign name="check" size={16} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const availableStores = userStoreAccess
    ? Object.values(userStoreAccess.storesAccess).filter(
        (store) => store.isActive
      )
    : [];

  return (
    <View style={[styles.header, isCompactLayout && styles.headerCompact]}>
      <View
        style={[
          styles.leftContainer,
          isCompactLayout && styles.leftContainerCompact,
        ]}
      >
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <AntDesign name="left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, isCompactLayout && styles.titleCompact]}>
          {title}
        </Text>
      </View>
      <View
        style={[
          styles.rightContainer,
          isCompactLayout && styles.rightContainerCompact,
        ]}
      >
        {/* 募集シフト通知ボタン */}
        <TouchableOpacity
          onPress={() => setShowRecruitmentModal(true)}
          style={[
            styles.notificationButton,
            isCompactLayout && styles.compactActionButton,
          ]}
        >
          <AntDesign name="bell" size={24} color={colors.primary} />
          {recruitmentCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{recruitmentCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* LINE通知送信ボタン */}
        <TouchableOpacity
          onPress={() => setShowLineNotification(true)}
          style={[
            styles.lineNotificationButton,
            isCompactLayout && styles.compactActionButton,
          ]}
        >
          <AntDesign name="message" size={24} color={colors.success} />
        </TouchableOpacity>

        {/* カンバンタスク管理ボタン */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/master/master-kanban-task")}
          style={[
            styles.kanbanButton,
            isCompactLayout && styles.compactActionButton,
          ]}
        >
          <AntDesign name="appstore" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* 店舗管理ボタン - 常にクリック可能 */}
        <TouchableOpacity
          onPress={() => setShowStoreSelector(true)}
          style={storeButtonStyles}
        >
          <Text
            style={storeButtonTextStyles}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {storeButtonLabel}
          </Text>
          <AntDesign
            name={availableStores.length > 1 ? "down" : "setting"}
            size={16}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* サービス紹介ボタン */}
        <TouchableOpacity
          onPress={() => setShowServiceIntro(true)}
          style={[
            styles.serviceIntroButton,
            isCompactLayout && styles.compactActionButton,
          ]}
        >
          <AntDesign name="question-circle" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* サインアウトボタン */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[
            styles.signOutButton,
            isCompactLayout && styles.compactActionButton,
          ]}
        >
          <AntDesign name="logout" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* 店舗管理モーダル */}
      <Modal
        visible={showStoreSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStoreSelector(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStoreSelector(false)}
        >
          <View style={styles.storeModalContainer}>
            <View style={styles.storeModalHeader}>
              <Text style={styles.storeModalTitle}>
                {availableStores.length > 1 ? "教室を選択" : "教室管理"}
              </Text>
              <TouchableOpacity onPress={() => setShowStoreSelector(false)}>
                <AntDesign name="close" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* 複数店舗がある場合は店舗一覧を表示 */}
            {availableStores.length > 1 && (
              <FlatList
                data={availableStores}
                keyExtractor={(item) => item.storeId}
                renderItem={renderStoreItem}
                style={styles.storeList}
              />
            )}

            {/* 店舗管理オプション */}
            <View style={styles.storeManagementOptions}>
              <TouchableOpacity
                style={styles.managementOption}
                onPress={() => {
                  setShowStoreSelector(false);
                  setShowConnectionModal(true);
                }}
              >
                <AntDesign name="link" size={20} color={colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.managementOptionText}>教室連携</Text>
                  <Text style={styles.managementOptionSubtext}>
                    他の教室と連携・管理
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 店舗連携モーダル */}
      <StoreConnectionModal
        visible={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        currentStoreId={currentStoreInfo}
        connectedStores={availableStores
          .map((store) => store.storeId)
          .filter((id) => id !== currentStoreInfo)}
        onConnectionSuccess={() => {
          // 店舗連携成功後にデータを再読み込み
          if (user?.uid) {
            const fetchUserStoreAccess = async () => {
              try {
                const storeAccess = await MultiStoreService.getUserStoreAccess(
                  user.uid
                );
                setUserStoreAccess(storeAccess);
              } catch (error) {
                console.error("Error reloading store access:", error);
              }
            };
            fetchUserStoreAccess();
          }
        }}
      />

      {/* 募集シフトモーダル */}
      <RecruitmentShiftModal
        visible={showRecruitmentModal}
        onClose={() => setShowRecruitmentModal(false)}
        userRole="master"
      />

      {/* サービス紹介モーダル */}
      <ServiceIntroModal
        visible={showServiceIntro}
        onClose={() => setShowServiceIntro(false)}
      />

      {/* LINE通知送信モーダル */}
      <LineNotificationModal
        visible={showLineNotification}
        onClose={() => setShowLineNotification(false)}
        storeId={currentStoreInfo}
        recruitmentCount={recruitmentCount}
      />
    </View>
  );
}
export default MasterHeader;
