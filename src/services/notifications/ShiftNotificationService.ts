/**
 * シフト関連通知サービス
 * シフトイベント（作成・削除・承認）時のプッシュ通知を管理
 */

import { PushNotificationService, NotificationData } from './PushNotificationService';
import { doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-core';
import { Shift } from '@/common/common-models/ModelIndex';

export interface NotificationRecipient {
  userId: string;
  nickname: string;
  role: 'master' | 'user';
}

export class ShiftNotificationService {

  /**
   * シフト作成時の通知
   * → 教室長（master）に通知
   */
  static async notifyShiftCreated(shift: Shift, creatorNickname: string): Promise<void> {
    try {

      // 同じ店舗の教室長（master）を取得
      const masters = await this.getStoreMasters(shift.storeId, shift.userId);
      
      if (masters.length === 0) {
        return;
      }

      const notification: NotificationData = {
        title: '新しいシフトが追加されました',
        body: `${creatorNickname}さんが${shift.date}のシフトを作成しました`,
        data: {
          type: 'shift_created',
          shiftId: shift.id,
          date: shift.date,
          creatorId: shift.userId,
          storeId: shift.storeId,
        },
      };

      // 教室長たちに通知送信
      const masterIds = masters.map(m => m.userId);
      await PushNotificationService.sendPushNotification(masterIds, notification);


    } catch (error) {
      // console.error('Failed to send shift created notification:', error);
    }
  }

  /**
   * シフト削除時の通知
   * → シフト作成者（削除される本人）に通知
   */
  static async notifyShiftDeleted(
    shift: Shift,
    deletedByNickname: string,
    reason?: string
  ): Promise<void> {
    try {

      // シフト作成者が削除実行者と同じ場合は通知しない（自分で削除した場合）
      if (shift.userId === shift.userId) {
        return;
      }

      const notification: NotificationData = {
        title: 'シフトが削除されました',
        body: `${deletedByNickname}さんがあなたの${shift.date}のシフトを削除しました${reason ? `: ${reason}` : ''}`,
        data: {
          type: 'shift_deleted',
          shiftId: shift.id,
          date: shift.date,
          deletedBy: deletedByNickname,
          storeId: shift.storeId,
          reason: reason || '',
        },
      };

      // シフト作成者に通知送信
      await PushNotificationService.sendPushNotification([shift.userId], notification);


    } catch (error) {
      // console.error('Failed to send shift deleted notification:', error);
    }
  }

  /**
   * シフト承認時の通知
   * → シフト作成者に通知
   */
  static async notifyShiftApproved(
    shift: Shift,
    approverNickname: string,
    userNickname: string
  ): Promise<void> {
    try {

      const notification: NotificationData = {
        title: 'シフトが承認されました',
        body: `${approverNickname}さんがあなたの${shift.date}のシフトを承認しました`,
        data: {
          type: 'shift_approved',
          shiftId: shift.id,
          date: shift.date,
          approver: approverNickname,
          storeId: shift.storeId,
        },
      };

      // シフト作成者に通知送信
      await PushNotificationService.sendPushNotification([shift.userId], notification);


    } catch (error) {
      // console.error('Failed to send shift approved notification:', error);
    }
  }

  /**
   * シフト変更要求時の通知
   * → 教室長（master）に通知
   */
  static async notifyShiftChangeRequested(
    shift: Shift,
    requesterNickname: string,
    changeReason: string
  ): Promise<void> {
    try {

      // 同じ店舗の教室長（master）を取得
      const masters = await this.getStoreMasters(shift.storeId, shift.userId);
      
      if (masters.length === 0) {
        return;
      }

      const notification: NotificationData = {
        title: 'シフト変更要求があります',
        body: `${requesterNickname}さんが${shift.date}のシフト変更を要求しました: ${changeReason}`,
        data: {
          type: 'shift_change_requested',
          shiftId: shift.id,
          date: shift.date,
          requesterId: shift.userId,
          storeId: shift.storeId,
          reason: changeReason,
        },
      };

      // 教室長たちに通知送信
      const masterIds = masters.map(m => m.userId);
      await PushNotificationService.sendPushNotification(masterIds, notification);


    } catch (error) {
      // console.error('Failed to send shift change request notification:', error);
    }
  }

  /**
   * 店舗の教室長（master）一覧を取得
   */
  private static async getStoreMasters(storeId: string, excludeUserId?: string): Promise<NotificationRecipient[]> {
    try {
      const usersRef = collection(db, 'users');
      const mastersQuery = query(
        usersRef,
        where('storeId', '==', storeId),
        where('role', '==', 'master'),
        where('deleted', '==', false)
      );

      const snapshot = await getDocs(mastersQuery);
      const masters: NotificationRecipient[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // 除外ユーザーをスキップ
        if (excludeUserId && doc.id === excludeUserId) {
          return;
        }

        masters.push({
          userId: doc.id,
          nickname: data['nickname'] || 'Unknown',
          role: data['role'],
        });
      });

      return masters;

    } catch (error) {
      // console.error('Failed to get store masters:', error);
      return [];
    }
  }

  /**
   * 特定ユーザーの情報を取得
   */
  private static async getUserInfo(userId: string): Promise<NotificationRecipient | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          userId,
          nickname: data['nickname'] || 'Unknown',
          role: data['role'] || 'user',
        };
      }

      return null;
    } catch (error) {
      // console.error('Failed to get user info:', error);
      return null;
    }
  }

  /**
   * 緊急シフト通知（当日のシフト変更など）
   */
  static async notifyUrgentShiftChange(
    shift: Shift,
    message: string,
    recipients: string[]
  ): Promise<void> {
    try {

      const notification: NotificationData = {
        title: '🚨 緊急シフト通知',
        body: message,
        data: {
          type: 'urgent_shift_change',
          shiftId: shift.id,
          date: shift.date,
          storeId: shift.storeId,
          urgent: true,
        },
      };

      await PushNotificationService.sendPushNotification(recipients, notification);


    } catch (error) {
      // console.error('Failed to send urgent shift notification:', error);
    }
  }

  /**
   * 週次シフト確認リマインダー
   */
  static async sendWeeklyShiftReminder(storeId: string): Promise<void> {
    try {

      // 店舗の全ユーザーを取得
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        where('storeId', '==', storeId),
        where('deleted', '==', false)
      );

      const snapshot = await getDocs(usersQuery);
      const userIds = snapshot.docs.map(doc => doc.id);

      if (userIds.length === 0) {
        return;
      }

      const notification: NotificationData = {
        title: '週次シフト確認',
        body: '来週のシフトを確認してください。変更がある場合は早めにお知らせください。',
        data: {
          type: 'weekly_reminder',
          storeId,
        },
      };

      await PushNotificationService.sendPushNotification(userIds, notification);


    } catch (error) {
      // console.error('Failed to send weekly shift reminder:', error);
    }
  }
}