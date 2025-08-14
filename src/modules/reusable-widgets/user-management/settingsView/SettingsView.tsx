import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Header } from "@/common/common-ui/ui-layout";
import { Footer } from "@/common/common-ui/ui-layout";
import { settingsViewStyles as styles } from "./SettingsView.styles";
import type { SettingsViewProps } from "./SettingsView.types";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";
import { useState } from "react";

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  role,
  onLogout,
  onUserManage,
}) => {
  const menuItems = [
    ...(role === "master"
      ? [
          {
            label: "ユーザー管理",
            onPress: onUserManage,
            icon: "👥",
          },
        ]
      : []),
    {
      label: "ログアウト",
      onPress: onLogout,
      icon: "🚪",
    },
  ];

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <Header title="設定" onPressSettings={() => setShowPasswordModal(true)} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.debugInfo}>
            <Text>UID: {user?.uid}</Text>
            <Text>Role: {user?.role}</Text>
            <Text>Nickname: {user?.nickname}</Text>
          </View>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Footer />
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
      </Modal>
    </>
  );
};
