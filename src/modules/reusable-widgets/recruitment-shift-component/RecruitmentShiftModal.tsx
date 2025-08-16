import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";

export interface RecruitmentShiftModalProps {
  visible: boolean;
  onClose: () => void;
  userRole?: string;
}

/**
 * RecruitmentShiftModal - 募集シフトモーダルコンポーネント
 * 
 * シフト募集機能を提供するモーダルです。
 * TODO: 実装予定の募集シフト機能用のプレースホルダーコンポーネント
 */
export function RecruitmentShiftModal({ visible, onClose, userRole }: RecruitmentShiftModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 10,
          width: '80%',
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            募集シフト
          </Text>
          <Text style={{ marginBottom: 20 }}>
            この機能は現在開発中です。
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#007AFF',
              padding: 10,
              borderRadius: 5,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white' }}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default RecruitmentShiftModal;