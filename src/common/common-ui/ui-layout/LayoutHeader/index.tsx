import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { router } from "expo-router";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "./styles";
import { HeaderProps } from "./types";

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
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      // Error signing out
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
            <AntDesign name="arrowleft" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
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
    </View>
  );
}

export { MasterHeader } from "./MasterHeader";
export default Header;
