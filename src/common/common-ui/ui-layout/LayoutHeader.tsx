import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { router } from "expo-router";
import { createHeaderStyles } from "./LayoutHeader.styles";
import { HeaderProps } from "./LayoutHeader.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { ServiceIntroModal } from "@/modules/reusable-widgets/service-intro/ServiceIntroModal";
import { useExtendedFonts } from "@/common/common-utils/performance/fontLoader";

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
}: Readonly<HeaderProps>) {
  const styles = useThemedStyles(createHeaderStyles);
  const { colorScheme } = useMD3Theme();
  const { signOut, user } = useAuth();

  // FontAwesomeフォントを遅延読み込み
  useExtendedFonts();

  const [showServiceIntro, setShowServiceIntro] = useState(false);

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
              color={colorScheme.onSurface}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* サービス紹介ボタン */}
        <TouchableOpacity
          onPress={() => setShowServiceIntro(true)}
          style={styles.signOutButton}
        >
          <AntDesign
            name="question-circle"
            size={24}
            color={colorScheme.onSurface}
          />
        </TouchableOpacity>

        {onPressSettings && (
          <TouchableOpacity
            onPress={onPressSettings}
            style={styles.signOutButton}
          >
            <FontAwesome name="cog" size={24} color={colorScheme.onSurface} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <FontAwesome name="sign-out" size={24} color={colorScheme.onSurface} />
        </TouchableOpacity>
      </View>

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
