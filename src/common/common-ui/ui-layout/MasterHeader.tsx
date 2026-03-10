/** @file MasterHeader.tsx @description 管理者用ヘッダー。店舗切り替え、サービス紹介、サインアウトを提供 */
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
import { ServiceProvider } from "@/services/ServiceProvider";
import type { UserStoreAccess } from "@/services/interfaces/IMultiStoreService";
import { StoreConnectionModal } from "@/modules/reusable-widgets/store-connection/StoreConnectionModal";
import { createHeaderStyles } from "./LayoutHeader.styles";
import { MasterHeaderProps } from "./LayoutHeader.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useAuth } from "@/services/auth/useAuth";
import { ServiceIntroModal } from "@/modules/reusable-widgets/service-intro/ServiceIntroModal";

/** 管理者用ヘッダー。店舗選択モーダル・店舗連携機能を含む。Props: MasterHeaderProps */
export function MasterHeader({
  title,
  showBackButton = false,
  onBack,
}: Readonly<MasterHeaderProps>) {
  // --- Hooks ---
  const styles = useThemedStyles(createHeaderStyles);
  const { colorScheme } = useMD3Theme();
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isCompactLayout = width < 900;

  // --- State ---
  const [userStoreAccess, setUserStoreAccess] =
    useState<UserStoreAccess | null>(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [currentStoreInfo, setCurrentStoreInfo] = useState<string>(""); // デフォルト値
  const [showServiceIntro, setShowServiceIntro] = useState(false);

  // --- Memo ---
  const storeButtonStyles = useMemo(
    () => [
      styles.storeButton,
      isCompactLayout && styles.storeButtonCompact,
    ],
    [isCompactLayout, styles]
  );

  const storeButtonTextStyles = useMemo(
    () => [
      styles.storeButtonText,
      isCompactLayout && styles.storeButtonTextCompact,
    ],
    [isCompactLayout, styles]
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

  // --- Effects ---
  useEffect(() => {
    const fetchUserStoreAccess = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const storeAccess = await ServiceProvider.multiStore.getUserStoreAccess(
          user.uid
        );

        if (storeAccess) {
          setUserStoreAccess(storeAccess);
          setCurrentStoreInfo(storeAccess.currentStoreId);
        } else {
          // レガシーユーザーの場合は移行処理
          await ServiceProvider.multiStore.migrateLegacyUser(user.uid);
          const migratedAccess = await ServiceProvider.multiStore.getUserStoreAccess(
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

  // --- Handlers ---
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSignOut = async () => {
    try {
      await ServiceProvider.auth.signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleStoreSwitch = async (storeId: string) => {
    if (!user?.uid || !userStoreAccess) return;

    try {
      await ServiceProvider.multiStore.switchCurrentStore(user.uid, storeId);
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

  // --- Render ---
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
        <AntDesign name="check" size={16} color={colorScheme.primary} />
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
            <AntDesign name="left" size={24} color={colorScheme.onSurface} />
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
        {/* 店舗管理ボタン */}
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
            color={colorScheme.onPrimary}
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
          <AntDesign name="question-circle" size={24} color={colorScheme.primary} />
        </TouchableOpacity>

        {/* サインアウトボタン */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[
            styles.signOutButton,
            isCompactLayout && styles.compactActionButton,
          ]}
        >
          <AntDesign name="logout" size={24} color={colorScheme.onSurface} />
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
                <AntDesign name="close" size={20} color={colorScheme.onSurface} />
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
                <AntDesign name="link" size={20} color={colorScheme.primary} />
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
                const storeAccess = await ServiceProvider.multiStore.getUserStoreAccess(
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

      {/* サービス紹介モーダル */}
      <ServiceIntroModal
        visible={showServiceIntro}
        onClose={() => setShowServiceIntro(false)}
      />

    </View>
  );
}
export default MasterHeader;
