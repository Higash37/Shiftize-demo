/** @file LayoutHeader.tsx @description 講師用ヘッダー。タイトル、サービス紹介、設定、サインアウトを提供 */
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

/** 講師用ヘッダー。Props: title, showBackButton, onBack, onPressSettings */
export function Header({
  title,
  showBackButton = false,
  onBack,
  onPressSettings,
}: Readonly<HeaderProps>) {
  // --- Hooks ---
  const styles = useThemedStyles(createHeaderStyles);
  const { colorScheme } = useMD3Theme();
  const { signOut, user } = useAuth();
  useExtendedFonts();

  // --- State ---
  const [showServiceIntro, setShowServiceIntro] = useState(false);

  // --- Handlers ---
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      // サインアウトエラーは無視（ログイン画面に遷移済み）
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // --- Render ---
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
