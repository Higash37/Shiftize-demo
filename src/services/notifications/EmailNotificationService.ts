/**
 * メール通知サービス
 * Web版・PWA用のメール通知機能
 */

import { doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-core';
import { Shift } from '@/common/common-models/ModelIndex';

export interface EmailNotificationData {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

export interface NotificationRecipient {
  userId: string;
  email: string;
  nickname: string;
  role: 'master' | 'user';
}

export class EmailNotificationService {

  /**
   * シフト作成時のメール通知
   * → 教室長（master）にメール送信
   */
  static async notifyShiftCreatedByEmail(shift: Shift, creatorNickname: string): Promise<void> {
    try {
      console.log('📧 Sending shift created email notification:', shift.id);

      // 同じ店舗の教室長（master）を取得
      const masters = await this.getStoreMasters(shift.storeId, shift.userId);
      
      if (masters.length === 0) {
        console.log('ℹ️ No masters found for email notification:', shift.storeId);
        return;
      }

      // 新しいEmailServiceテンプレートを使用
      const { EmailService } = await import('@/lib/email-service');
      
      const shiftData = {
        shiftDate: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        userNickname: creatorNickname,
      };

      const emailData: EmailNotificationData = {
        to: masters.map(m => m.email),
        subject: `新しいシフトが追加されました - ${shift.date}`,
        html: EmailService.generateEmailTemplate(
          '新しいシフトが追加されました',
          '📅',
          `<p><strong>${creatorNickname}</strong>さんが新しいシフトを作成しました。</p><p>アプリで詳細を確認し、必要に応じて承認を行ってください。</p>`,
          shiftData
        ),
        text: `${creatorNickname}さんが${shift.date}のシフトを作成しました。詳細はアプリで確認してください。`,
      };

      // メール送信（実装方法は後で選択）
      await this.sendEmail(emailData);

      console.log('✅ Shift created email sent to masters:', masters.map(m => m.email));

    } catch (error) {
      console.error('❌ Failed to send shift created email:', error);
    }
  }

  /**
   * シフト削除時のメール通知
   * → シフト作成者にメール送信
   */
  static async notifyShiftDeletedByEmail(
    shift: Shift,
    deletedByNickname: string,
    reason?: string
  ): Promise<void> {
    try {
      console.log('📧 Sending shift deleted email notification:', shift.id);

      // シフト作成者の情報を取得
      const userInfo = await this.getUserInfo(shift.userId);
      if (!userInfo) {
        console.log('ℹ️ User not found for email notification:', shift.userId);
        return;
      }

      // 新しいEmailServiceテンプレートを使用
      const { EmailService } = await import('@/lib/email-service');
      
      const shiftData = {
        shiftDate: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        userNickname: userInfo.nickname,
        masterNickname: deletedByNickname,
        reason,
      };

      const emailData: EmailNotificationData = {
        to: [userInfo.email],
        subject: `シフトが削除されました - ${shift.date}`,
        html: EmailService.generateEmailTemplate(
          'シフトが削除されました',
          '🗑️',
          `<p>こんにちは、<strong>${userInfo.nickname}</strong>さん</p><p><strong>${deletedByNickname}</strong>さんがあなたの以下のシフトを削除しました。</p><p>ご質問がある場合は、${deletedByNickname}さんまたは管理者にお問い合わせください。</p>`,
          shiftData
        ),
        text: `${deletedByNickname}さんがあなたの${shift.date}のシフトを削除しました。${reason ? `理由: ${reason}` : ''}`,
      };

      await this.sendEmail(emailData);

      console.log('✅ Shift deleted email sent to user:', userInfo.email);

    } catch (error) {
      console.error('❌ Failed to send shift deleted email:', error);
    }
  }

  /**
   * シフト承認時のメール通知
   * → シフト作成者にメール送信
   */
  static async notifyShiftApprovedByEmail(
    shift: Shift,
    approverNickname: string
  ): Promise<void> {
    try {
      console.log('📧 Sending shift approved email notification:', shift.id);

      // シフト作成者の情報を取得
      const userInfo = await this.getUserInfo(shift.userId);
      if (!userInfo) {
        console.log('ℹ️ User not found for email notification:', shift.userId);
        return;
      }

      // 新しいEmailServiceテンプレートを使用
      const { EmailService } = await import('@/lib/email-service');
      
      const shiftData = {
        shiftDate: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        userNickname: userInfo.nickname,
        masterNickname: approverNickname,
        status: '承認済み',
      };

      const emailData: EmailNotificationData = {
        to: [userInfo.email],
        subject: `シフトが承認されました - ${shift.date}`,
        html: EmailService.generateEmailTemplate(
          'シフトが承認されました',
          '✅',
          `<p>こんにちは、<strong>${userInfo.nickname}</strong>さん</p><p><strong>${approverNickname}</strong>さんがあなたのシフトを承認しました！</p><p>シフトが確定しました。当日の勤務をよろしくお願いします。</p>`,
          shiftData
        ),
        text: `${approverNickname}さんがあなたの${shift.date}のシフトを承認しました。`,
      };

      await this.sendEmail(emailData);

      console.log('✅ Shift approved email sent to user:', userInfo.email);

    } catch (error) {
      console.error('❌ Failed to send shift approved email:', error);
    }
  }

  // =============================================================================
  // プライベートヘルパーメソッド
  // =============================================================================

  /**
   * 店舗の教室長（master）一覧を取得
   */
  private static async getStoreMasters(storeId: string, excludeUserId?: string): Promise<NotificationRecipient[]> {
    try {
      const usersRef = collection(db, 'users');
      const mastersQuery = query(
        usersRef,
        where('storeId', '==', storeId),
        where('role', '==', 'master')
      );

      const snapshot = await getDocs(mastersQuery);
      const masters: NotificationRecipient[] = [];

      console.log(`🔍 EmailNotificationService - Query result: ${snapshot.docs.length} users found for storeId: ${storeId}`);

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`🔍 EmailNotificationService - User ${doc.id}:`, {
          storeId: data.storeId,
          role: data.role,
          deleted: data.deleted,
          email: data.email,
          nickname: data.nickname
        });
        
        // 削除されたユーザーをスキップ
        if (data.deleted === true) {
          console.log(`🔍 EmailNotificationService - Skipping deleted user: ${doc.id}`);
          return;
        }

        // 除外ユーザーをスキップ
        if (excludeUserId && doc.id === excludeUserId) {
          console.log(`🔍 EmailNotificationService - Skipping excluded user: ${doc.id}`);
          return;
        }

        if (data.email) {
          console.log(`🔍 EmailNotificationService - Adding master to notification list: ${data.nickname} (${data.email})`);
          masters.push({
            userId: doc.id,
            email: data.email,
            nickname: data.nickname || 'Unknown',
            role: data.role,
          });
        }
      });

      console.log(`🔍 Found ${masters.length} masters with email for store ${storeId}`);
      return masters;

    } catch (error) {
      console.error('❌ Failed to get store masters:', error);
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
        if (data.email) {
          return {
            userId,
            email: data.email,
            nickname: data.nickname || 'Unknown',
            role: data.role || 'user',
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get user info:', error);
      return null;
    }
  }

  /**
   * メール送信（新しいemail-serviceを使用）
   */
  private static async sendEmail(emailData: EmailNotificationData): Promise<void> {
    try {
      // 新しいEmailServiceを使用
      const { EmailService } = await import('@/lib/email-service');
      
      const success = await EmailService.sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      if (!success) {
        throw new Error('EmailService returned false');
      }

      console.log('✅ Email sent successfully via EmailService');

    } catch (error) {
      console.error('❌ Failed to send email via EmailService:', error);
      
      // フォールバック: コンソールログ（開発時）
      console.log('📧 Email fallback - would be sent:', {
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
      });
    }
  }

}