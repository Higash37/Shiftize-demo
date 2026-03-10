/** @file ShiftModal.tsx
 *  @description シフト操作選択モーダルコンポーネント。
 *    承認済みシフトをタップした際に「シフト報告」と「シフト変更」の
 *    2つの操作を選択させるダイアログ。
 *
 *  【このファイルの位置づけ】
 *  - 依存: React / React Native / FormButton（共通ボタン）/
 *          useThemedStyles / MD3Theme
 *  - 利用先: ShiftListView（UserShiftList）内で表示される
 *
 *  【コンポーネント概要】
 *  - 表示内容: 半透明オーバーレイ上にカード型モーダル、2つのボタン
 *  - 主要Props: isModalVisible, setModalVisible, handleReportShift, handleEditShift
 */
import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

/** このモーダルに渡す Props */
interface ShiftModalProps {
  isModalVisible: boolean;                      // モーダルの表示/非表示
  setModalVisible: (visible: boolean) => void;  // 表示状態を変更するセッター
  handleReportShift: () => void;                // 「シフト報告」押下時のコールバック
  handleEditShift: () => void;                  // 「シフト変更」押下時のコールバック
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  isModalVisible,
  setModalVisible,
  handleReportShift,
  handleEditShift,
}) => {
  const styles = useThemedStyles(createShiftModalStyles);

  // --- Render ---
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>シフト操作</Text>

          <Button
            title="シフト報告をする"
            onPress={handleReportShift}
            variant="primary"
            size="large"
            fullWidth
            style={{ marginBottom: 12 }}
          />

          <Button
            title="シフト変更をする"
            onPress={handleEditShift}
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>
      </Pressable>
    </Modal>
  );
};

/** テーマを受け取ってスタイルシートを生成するファクトリ関数 */
const createShiftModalStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.32)",
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    modal: {
      backgroundColor: theme.colorScheme.surfaceContainerHigh,
      borderRadius: theme.shape.extraLarge,
      padding: theme.spacing.xxl,
      width: "100%",
      maxWidth: 400,
    },
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colorScheme.onSurface,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
  });

export default ShiftModal;
