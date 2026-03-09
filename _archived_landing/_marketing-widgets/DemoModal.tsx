import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface DemoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ visible, onClose }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleLoginRedirect = () => {
    onClose();
    router.push('/(auth)/login');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[
            styles.modalContainer,
            isTablet && styles.modalContainerTablet
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <MaterialIcons name="play-circle-filled" size={32} color="#3b82f6" />
            <Text style={styles.title}>デモ教室のご案内</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* コンテンツ */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoCard}>
              <MaterialIcons name="info" size={24} color="#3b82f6" />
              <Text style={styles.infoText}>
                現在、0000教室がデモ環境として公開されています。
                どなたでも下記の情報でログインして、実際の機能をお試しいただけます。
              </Text>
            </View>

            <View style={styles.loginInfo}>
              <Text style={styles.loginTitle}>ログイン情報</Text>
              <View style={styles.loginDetail}>
                <Text style={styles.loginLabel}>店舗ID + ニックネーム:</Text>
                <Text style={styles.loginValue}>0000佐藤</Text>
              </View>
              <View style={styles.loginDetail}>
                <Text style={styles.loginLabel}>パスワード:</Text>
                <Text style={styles.loginValue}>123456</Text>
              </View>
            </View>

            <View style={styles.noteCard}>
              <MaterialIcons name="warning" size={20} color="#f59e0b" />
              <Text style={styles.noteText}>
                ※ デモ環境のため、データは他の利用者と共有されます。
                個人情報の入力はお控えください。
              </Text>
            </View>
          </ScrollView>

          {/* ボタン */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLoginRedirect}>
              <MaterialIcons name="login" size={20} color="#ffffff" />
              <Text style={styles.loginButtonText}>ログイン画面へ</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalContainerTablet: {
    maxWidth: 500,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 12,
  },
  loginInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loginTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  loginDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loginLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  loginButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

// Expo Router のルート解決のための default export
export default function DemoModalPage() {
  return null; // このファイルは直接ルートとしては使用しない
}