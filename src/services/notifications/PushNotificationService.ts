/**
 * プッシュ通知サービス
 * LINE風通知機能を提供
 */

import { Platform } from 'react-native';

// Web環境では expo-notifications を動的インポート
let Notifications: any = null;
let Device: any = null;

if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
}
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-core';

// 通知動作設定（Web以外の環境のみ）
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class PushNotificationService {
  
  /**
   * プッシュ通知権限を取得
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      // Web環境では通知をサポートしない
      if (Platform.OS === 'web') {
        return false;
      }

      if (!Device || !Device.isDevice) {
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Expo Push Token を取得
   */
  static async getExpoPushToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return null;
      }

      if (!Device || !Device.isDevice) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        // @ts-ignore - Expo環境変数は実行時に利用可能
        projectId: __DEV__ ? 'dev-project-id' : 'prod-project-id',
      });

      return token.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * FCM Registration Token を取得（Android/iOS用）
   */
  static async getFCMToken(): Promise<string | null> {
    try {
      // Web プラットフォームの場合、FCMトークンを取得
      if (Platform.OS === 'web') {
        // Web用のFCM実装は後で追加
        return null;
      }

      // React Native用のFCMトークン取得
      // @react-native-firebase/messaging が必要
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * ユーザーのプッシュトークンをFirestoreに保存
   */
  static async saveUserPushToken(userId: string, storeId: string): Promise<void> {
    try {
      // 権限取得
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Push notification permission not granted');
      }

      // トークン取得
      const expoPushToken = await this.getExpoPushToken();
      if (!expoPushToken) {
        throw new Error('Failed to get push token');
      }

      // Firestoreに保存
      const tokenData = {
        expoPushToken,
        userId,
        storeId,
        platform: Platform.OS,
        deviceInfo: {
          isDevice: Device.isDevice,
          deviceName: Device.deviceName,
          osName: Device.osName,
          osVersion: Device.osVersion,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'pushTokens', userId), tokenData);

    } catch (error) {
      throw error;
    }
  }

  /**
   * 即座にローカル通知を表示（テスト用）
   */
  static async showLocalNotification(notification: NotificationData): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        return;
      }

      if (!Notifications) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
        },
        trigger: null, // 即座に表示
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * ユーザーのプッシュトークンを取得
   */
  static async getUserPushToken(userId: string): Promise<string | null> {
    try {
      const tokenDoc = await getDoc(doc(db, 'pushTokens', userId));
      if (tokenDoc.exists()) {
        const data = tokenDoc.data();
        return data.expoPushToken || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Expo Push API経由でリモート通知を送信
   */
  static async sendPushNotification(
    userIds: string[],
    notification: NotificationData
  ): Promise<void> {
    try {
      const messages = [];

      // 各ユーザーのプッシュトークンを取得
      for (const userId of userIds) {
        const pushToken = await this.getUserPushToken(userId);
        if (pushToken) {
          messages.push({
            to: pushToken,
            sound: 'default',
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
          });
        }
      }

      if (messages.length === 0) {
        return;
      }

      // Expo Push API に送信
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();

    } catch (error) {
      throw error;
    }
  }

  /**
   * デバッグ情報を取得
   */
  static async getDebugInfo(): Promise<{
    isDevice: boolean;
    permissions: any;
    expoPushToken: string | null;
    platform: string;
  }> {
    try {
      if (Platform.OS === 'web') {
        return {
          isDevice: false,
          permissions: { status: 'not-supported-on-web' },
          expoPushToken: null,
          platform: Platform.OS,
        };
      }

      const permissions = Notifications ? await Notifications.getPermissionsAsync() : null;
      const expoPushToken = await this.getExpoPushToken();

      return {
        isDevice: Device ? Device.isDevice : false,
        permissions,
        expoPushToken,
        platform: Platform.OS,
      };
    } catch (error) {
      return {
        isDevice: false,
        permissions: null,
        expoPushToken: null,
        platform: Platform.OS,
      };
    }
  }
}