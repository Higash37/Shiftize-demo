import React, { useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  BackHandler,
  Platform
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/common/common-constants/ColorConstants';
import { designSystem } from '@/common/common-constants/DesignSystem';

/**
 * サービス紹介モーダルのプロパティ
 */
interface ServiceIntroModalProps {
  /** モーダルの表示状態 */
  visible: boolean;
  /** モーダルを閉じる際のコールバック */
  onClose: () => void;
  /** アクセシビリティラベル */
  accessibilityLabel?: string;
  /** テストID */
  testID?: string;
}

export const ServiceIntroModal: React.FC<ServiceIntroModalProps> = ({
  visible,
  onClose,
  accessibilityLabel = 'Shiftizeサービス紹介',
  testID = 'service-intro-modal',
}) => {
  // バックボタンハンドリング（Androidのみ）
  const handleBackPress = useCallback(() => {
    if (visible) {
      onClose();
      return true; // バックイベントを処理済みとする
    }
    return false;
  }, [visible, onClose]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }
  }, [handleBackPress]);

  // クローズハンドラー（セキュア）
  const handleClose = useCallback(() => {
    // バリデーション - onCloseが関数であることを確認
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.overlay}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text 
                style={styles.title}
                accessible={true}
                accessibilityRole="header"
                accessibilityLevel={1}
              >
                Shiftizeについて
              </Text>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="モーダルを閉じる"
                accessibilityHint="サービス紹介モーダルを閉じます"
                testID={`${testID}-close-button`}
              >
                <AntDesign name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
              <Text 
                style={styles.description}
                accessible={true}
                accessibilityRole="text"
              >
                Shiftizeは効率的なシフト管理を実現するエンタープライズ級アプリケーションです。
              </Text>
              
              <View style={styles.features}>
                <Text 
                  style={styles.featureTitle}
                  accessible={true}
                  accessibilityRole="header"
                  accessibilityLevel={2}
                >
                  主な機能:
                </Text>
                {[
                  'シフトの作成・編集・削除',
                  'ガントチャート表示（PC/タブレット/モバイル対応）',
                  '分割レイアウト（カレンダー + 1日ガントチャート）',
                  '募集シフト機能',
                  '通知機能',
                  'AES-256暗号化セキュリティシステム',
                  'GDPR準拠データ管理'
                ].map((feature, index) => (
                  <Text 
                    key={index}
                    style={styles.feature}
                    accessible={true}
                    accessibilityRole="text"
                  >
                    • {feature}
                  </Text>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.okButton} 
              onPress={handleClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="OK"
              accessibilityHint="モーダルを閉じて元の画面に戻ります"
              testID={`${testID}-ok-button`}
              activeOpacity={0.8}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  modal: {
    backgroundColor: colors.background.primary || 'white',
    borderRadius: designSystem.border.radius.large || 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border?.primary || '#E0E0E0',
  },
  title: {
    fontSize: designSystem.text?.headerTitle?.fontSize || 22,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background?.secondary || '#F5F5F5',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 24,
    textAlign: 'left',
  },
  features: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  feature: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 10,
    lineHeight: 22,
    paddingLeft: 8,
  },
  okButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: designSystem.border?.radius?.medium || 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});