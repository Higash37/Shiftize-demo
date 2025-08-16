import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";

export interface StoreConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentStoreId?: string;
  connectedStores?: string[];
  onConnectionSuccess?: () => void;
}

/**
 * StoreConnectionModal - 店舗接続モーダルコンポーネント
 * 
 * 店舗間の接続・切り替え機能を提供するモーダルです。
 * TODO: 実装予定のマルチ店舗機能用のプレースホルダーコンポーネント
 */
export function StoreConnectionModal({ visible, onClose, currentStoreId, connectedStores, onConnectionSuccess }: StoreConnectionModalProps) {
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
            店舗接続
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

export default StoreConnectionModal;