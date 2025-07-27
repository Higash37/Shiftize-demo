/**
 * プッシュ通知管理フック
 * アプリ起動時の初期化とトークン管理
 */

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { PushNotificationService } from '@/services/notifications/PushNotificationService';
import { useAuth } from '@/services/auth/useAuth';

// Web環境では expo-notifications を動的インポート
let Notifications: any = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

export const usePushNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * プッシュ通知初期化
   */
  const initializePushNotifications = async () => {
    try {
      if (__DEV__) console.log('🔄 Initializing push notifications...');
      setError(null);

      // Web環境では初期化をスキップ
      if (Platform.OS === 'web') {
        if (__DEV__) console.log('ℹ️ Push notifications skipped on web platform');
        setIsInitialized(true);
        return;
      }

      // 権限リクエスト
      const permission = await PushNotificationService.requestPermissions();
      setHasPermission(permission);

      if (!permission) {
        throw new Error('Push notification permission denied');
      }

      // プッシュトークン取得
      const token = await PushNotificationService.getExpoPushToken();
      setPushToken(token);

      if (!token) {
        throw new Error('Failed to get push token');
      }

      // ユーザーがログインしている場合、トークンをFirestoreに保存
      if (user && user.storeId) {
        await PushNotificationService.saveUserPushToken(user.uid, user.storeId);
        if (__DEV__) console.log('✅ Push notifications initialized successfully');
      }

      setIsInitialized(true);

    } catch (err: any) {
      console.error('❌ Failed to initialize push notifications:', err);
      setError(err.message || 'Unknown error');
      setIsInitialized(false);
    }
  };

  /**
   * 通知リスナーの設定
   */
  useEffect(() => {
    let notificationListener: any;
    let responseListener: any;

    if (isInitialized && Platform.OS !== 'web' && Notifications) {
      // 通知受信時のリスナー
      notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
        if (__DEV__) console.log('📱 Notification received:', notification);
        
        // カスタム処理（必要に応じて）
        const data = notification.request.content.data;
        if (data?.type === 'urgent_shift_change') {
          // 緊急通知の場合の特別な処理
          if (__DEV__) console.log('🚨 Urgent notification received');
        }
      });

      // 通知タップ時のリスナー
      responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
        if (__DEV__) console.log('👆 Notification tapped:', response);
        
        // 通知データから適切な画面に遷移
        const data = response.notification.request.content.data;
        handleNotificationTap(data);
      });
    }

    return () => {
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
      if (responseListener) {
        Notifications.removeNotificationSubscription(responseListener);
      }
    };
  }, [isInitialized]);

  /**
   * 通知タップ時の画面遷移処理
   */
  const handleNotificationTap = (data: any) => {
    try {
      if (__DEV__) console.log('🔄 Handling notification tap:', data);

      switch (data?.type) {
        case 'shift_created':
        case 'shift_deleted':
        case 'shift_approved':
          // シフト詳細画面に遷移
          if (data.shiftId) {
            // ナビゲーション処理（必要に応じて実装）
            if (__DEV__) console.log('📍 Navigate to shift:', data.shiftId);
          }
          break;

        case 'shift_change_requested':
          // 承認画面に遷移
          if (__DEV__) console.log('📍 Navigate to approval screen');
          break;

        case 'urgent_shift_change':
          // 緊急通知の場合はシフト一覧に遷移
          if (__DEV__) console.log('📍 Navigate to shift list');
          break;

        default:
          if (__DEV__) console.log('📍 Default navigation to home');
      }
    } catch (error) {
      console.error('❌ Failed to handle notification tap:', error);
    }
  };

  /**
   * 認証状態変更時の初期化
   */
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      initializePushNotifications();
    }
  }, [isAuthenticated, user, isInitialized]);

  /**
   * テスト通知送信
   */
  const sendTestNotification = async () => {
    try {
      await PushNotificationService.showLocalNotification({
        title: 'テスト通知',
        body: 'プッシュ通知が正常に動作しています！',
        data: { type: 'test' },
      });
      if (__DEV__) console.log('✅ Test notification sent');
    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
      throw error;
    }
  };

  /**
   * デバッグ情報取得
   */
  const getDebugInfo = async () => {
    try {
      const debugInfo = await PushNotificationService.getDebugInfo();
      return {
        ...debugInfo,
        isInitialized,
        hasPermission,
        pushToken,
        error,
        user: user ? { uid: user.uid, storeId: user.storeId } : null,
      };
    } catch (error) {
      console.error('❌ Failed to get debug info:', error);
      return null;
    }
  };

  return {
    // 状態
    isInitialized,
    hasPermission,
    pushToken,
    error,
    
    // 関数
    initializePushNotifications,
    sendTestNotification,
    getDebugInfo,
  };
};