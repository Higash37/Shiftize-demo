/**
 * プッシュ通知テストパネル
 * 開発時のテスト・デバッグ用コンポーネント
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { colors, shadows } from '@/common/common-constants/ThemeConstants';

interface NotificationTestPanelProps {
  isVisible?: boolean;
}

export const NotificationTestPanel: React.FC<NotificationTestPanelProps> = ({ 
  isVisible = false 
}) => {
  const { 
    isInitialized, 
    hasPermission, 
    pushToken, 
    error,
    sendTestNotification,
    getDebugInfo 
  } = usePushNotifications();
  
  const [isLoading, setIsLoading] = useState(false);

  if (!isVisible) return null;

  /**
   * テスト通知送信
   */
  const handleSendTestNotification = async () => {
    try {
      setIsLoading(true);
      await sendTestNotification();
      Alert.alert('成功', 'テスト通知を送信しました！');
    } catch (error: any) {
      Alert.alert('エラー', `通知送信に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * デバッグ情報表示
   */
  const handleShowDebugInfo = async () => {
    try {
      const debugInfo = await getDebugInfo();
      Alert.alert(
        'デバッグ情報',
        JSON.stringify(debugInfo, null, 2),
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('エラー', `デバッグ情報の取得に失敗しました: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 プッシュ通知テストパネル</Text>
      </View>

      {/* 状態表示 */}
      <View style={styles.statusContainer}>
        <StatusItem 
          label="初期化状態" 
          value={isInitialized ? '✅ 完了' : '❌ 未完了'}
          isGood={isInitialized}
        />
        <StatusItem 
          label="権限状態" 
          value={hasPermission ? '✅ 許可済み' : '❌ 未許可'}
          isGood={hasPermission}
        />
        <StatusItem 
          label="プッシュトークン" 
          value={pushToken ? '✅ 取得済み' : '❌ 未取得'}
          isGood={!!pushToken}
        />
        {error && (
          <StatusItem 
            label="エラー" 
            value={error}
            isGood={false}
          />
        )}
      </View>

      {/* ボタン */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleSendTestNotification}
          disabled={!isInitialized || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '送信中...' : 'テスト通知送信'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.debugButton]}
          onPress={handleShowDebugInfo}
        >
          <Text style={styles.buttonText}>デバッグ情報表示</Text>
        </TouchableOpacity>
      </View>

      {/* トークン情報（開発用） */}
      {pushToken && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenLabel}>Push Token:</Text>
          <Text style={styles.tokenText} numberOfLines={3}>
            {pushToken}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * 状態表示アイテム
 */
const StatusItem: React.FC<{
  label: string;
  value: string;
  isGood: boolean;
}> = ({ label, value, isGood }) => (
  <View style={styles.statusItem}>
    <Text style={styles.statusLabel}>{label}:</Text>
    <Text style={[
      styles.statusValue, 
      { color: isGood ? colors.success : colors.error }
    ]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    ...shadows.card,
  },
  
  header: {
    marginBottom: 16,
  },
  
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  
  statusContainer: {
    marginBottom: 16,
  },
  
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  
  statusLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  
  testButton: {
    backgroundColor: colors.primary,
  },
  
  debugButton: {
    backgroundColor: colors.secondary,
  },
  
  buttonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  tokenContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  
  tokenLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  
  tokenText: {
    fontSize: 10,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
});