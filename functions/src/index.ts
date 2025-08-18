/**
 * Firebase Cloud Functions
 * メール送信機能 + セキュア認証機能を提供
 */

import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// 環境変数を読み込み
config();

// Firebase Admin SDK初期化
admin.initializeApp();

// メール送信データの型定義
interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Gmail SMTP設定を環境変数から取得
const getEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  if (!emailUser || !emailPassword) {
    throw new Error('Email configuration not found. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
  }
  
  return {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  };
};

/**
 * メール送信関数（HTTPSトリガー）
 * 
 * 使用方法:
 * POST https://[region]-[project].cloudfunctions.net/sendEmail
 * Body: {
 *   to: string | string[],
 *   subject: string,
 *   html: string,
 *   text?: string
 * }
 */
export const sendEmail = functions
  .region('asia-northeast1') // 東京リージョン
  .https.onCall(async (data: EmailData, context) => {
    // 🔒 認証 + 権限チェック強化
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    // 🔒 メール送信権限をマスターに限定
    const db = admin.firestore();
    const userDoc = await db.doc(`users/${context.auth.uid}`).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'master') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only master users can send emails'
      );
    }

    // 入力検証
    if (!data.to || !data.subject || !data.html) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: to, subject, html'
      );
    }

    try {
      // Nodemailerトランスポーター作成
      const emailConfig = getEmailConfig();
      const transporter = nodemailer.createTransport(emailConfig);

      // メール送信オプション
      const mailOptions = {
        from: `"Shiftize" <${emailConfig.auth.user}>`,
        to: Array.isArray(data.to) ? data.to.join(',') : data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || 'This is an HTML email. Please use an HTML-compatible email client.',
      };

      // メール送信
      const result = await transporter.sendMail(mailOptions);
      

      return {
        success: true,
        messageId: result.messageId,
        recipients: Array.isArray(data.to) ? data.to.length : 1,
      };

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send email'
      );
    }
  });

/**
 * シフト通知専用関数
 * より簡単なインターフェースでシフト通知を送信
 */
export const sendShiftNotification = functions
  .region('asia-northeast1')
  .https.onCall(async (data: {
    type: 'shift_created' | 'shift_deleted' | 'shift_approved';
    to: string | string[];
    shiftData: {
      shiftDate: string;
      startTime: string;
      endTime: string;
      userNickname: string;
      masterNickname?: string;
      reason?: string;
      status?: string;
    };
  }, context) => {
    // 認証チェック
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    let title: string;
    let emoji: string;
    let content: string;

    // 通知タイプに応じたコンテンツ生成
    switch (data.type) {
      case 'shift_created':
        title = '新しいシフトが追加されました';
        emoji = '📅';
        content = `
          <p><strong>${data.shiftData.userNickname}</strong>さんが新しいシフトを作成しました。</p>
          <p>アプリで詳細を確認し、必要に応じて承認を行ってください。</p>
        `;
        break;

      case 'shift_deleted':
        title = 'シフトが削除されました';
        emoji = '🗑️';
        content = `
          <p>こんにちは、<strong>${data.shiftData.userNickname}</strong>さん</p>
          <p><strong>${data.shiftData.masterNickname}</strong>さんがあなたの以下のシフトを削除しました。</p>
          <p>ご質問がある場合は、${data.shiftData.masterNickname}さんまたは管理者にお問い合わせください。</p>
        `;
        break;

      case 'shift_approved':
        title = 'シフトが承認されました';
        emoji = '✅';
        content = `
          <p>こんにちは、<strong>${data.shiftData.userNickname}</strong>さん</p>
          <p><strong>${data.shiftData.masterNickname}</strong>さんがあなたのシフトを承認しました！</p>
          <p>シフトが確定しました。当日の勤務をよろしくお願いします。</p>
        `;
        break;

      default:
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid notification type'
        );
    }

    // HTMLテンプレート生成
    const html = generateEmailTemplate(title, emoji, content, data.shiftData);
    const subject = `${title} - ${data.shiftData.shiftDate}`;

    // 直接内部実装を呼び出す
    try {
      const emailConfig = getEmailConfig();
      const transporter = nodemailer.createTransport(emailConfig);
      
      const mailOptions = {
        from: `"Shiftize" <${emailConfig.auth.user}>`,
        to: Array.isArray(data.to) ? data.to.join(',') : data.to,
        subject,
        html,
        text: 'This is an HTML email. Please use an HTML-compatible email client.',
      };

      const result = await transporter.sendMail(mailOptions);
      

      return {
        success: true,
        messageId: result.messageId,
        recipients: Array.isArray(data.to) ? data.to.length : 1,
      };
    } catch (error) {
      console.error('❌ Failed to send shift notification:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send notification'
      );
    }
  });

/**
 * 管理（マスター）用: 同一店舗の講師の認証情報・プロフィールを更新
 * - パスワード更新は Admin SDK 経由でのみ許可
 * - 表示名や氏名などのプロフィールは Firestore `users/{uid}` を更新
 * - 呼び出しユーザーが master で、対象ユーザーと同一店舗であることを検証
 */
export const adminUpdateUserCredentials = functions
  .region('asia-northeast1')
  .https.onCall(async (
    data: {
      targetUserId: string;
      password?: string;
      displayName?: string;
      profileUpdates?: Partial<{
        realName: string;
        nickname: string;
        phoneNumber: string;
        address: string;
        notes: string;
      }>;
    },
    context
  ) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const callerUid = context.auth.uid;
    const targetUserId = data?.targetUserId;
    const newPassword = data?.password;
    const newDisplayName = data?.displayName;
    const profileUpdates = data?.profileUpdates ?? {};

    if (!targetUserId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'targetUserId is required'
      );
    }

    // Firestore 参照
    const db = admin.firestore();

    const [callerSnap, targetSnap, callerAccessSnap] = await Promise.all([
      db.doc(`users/${callerUid}`).get(),
      db.doc(`users/${targetUserId}`).get(),
      db.doc(`userStoreAccess/${callerUid}`).get(),
    ]);

    if (!callerSnap.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Caller user not found');
    }
    if (!targetSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Target user not found');
    }

    const caller = callerSnap.data() as any;
    const target = targetSnap.data() as any;

    if (caller?.role !== 'master') {
      throw new functions.https.HttpsError('permission-denied', 'Only master can perform this action');
    }

    const targetStoreId: string | undefined = target?.storeId;
    if (!targetStoreId) {
      throw new functions.https.HttpsError('failed-precondition', 'Target user has no storeId');
    }

    // マスターの店舗アクセス検証
    const storesAccess = (callerAccessSnap.data() as any)?.storesAccess ?? {};
    const hasAccess =
      (caller?.storeId && caller.storeId === targetStoreId) ||
      (storesAccess[targetStoreId]?.isActive === true);

    if (!hasAccess) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Master does not have access to the target user\'s store'
      );
    }

    // 認証情報の更新（セキュリティ強化版）
    if (newPassword || newDisplayName) {
      const authUpdate: admin.auth.UpdateRequest = {};
      
      if (newPassword) {
        // 🔒 パスワード要件を強化
        if (typeof newPassword !== 'string' || 
            newPassword.length < 12 || 
            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(newPassword)) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Password must be at least 12 characters with uppercase, lowercase, number, and special character'
          );
        }
        authUpdate.password = newPassword;
        
        // 🔒 セキュリティログ記録
        console.log(`🔒 Admin ${callerUid} updated password for user ${targetUserId} in store ${targetStoreId}`);
      }
      
      if (newDisplayName) {
        if (typeof newDisplayName !== 'string' || newDisplayName.trim().length === 0) {
          throw new functions.https.HttpsError('invalid-argument', 'displayName must be a non-empty string');
        }
        authUpdate.displayName = newDisplayName.trim();
      }

      await admin.auth().updateUser(targetUserId, authUpdate);
    }

    // Firestore プロフィールの更新（許可フィールドのみ）
    const allowedProfileKeys = new Set(['realName', 'nickname', 'phoneNumber', 'address', 'notes']);
    const firestoreUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(profileUpdates)) {
      if (allowedProfileKeys.has(key) && value !== undefined) {
        firestoreUpdates[key] = value;
      }
    }

    if (newDisplayName && !('nickname' in firestoreUpdates)) {
      // 表示名をニックネームに同期したい場合はここで反映
      firestoreUpdates['nickname'] = newDisplayName;
    }

    if (Object.keys(firestoreUpdates).length > 0) {
      // storeId / role は変更不可
      firestoreUpdates['updatedAt'] = admin.firestore.FieldValue.serverTimestamp();
      firestoreUpdates['updatedBy'] = callerUid;
      await db.doc(`users/${targetUserId}`).set(firestoreUpdates, { merge: true });
    }

    return { success: true };
  });

/**
 * HTMLメールテンプレート生成関数
 */
function generateEmailTemplate(
  title: string,
  emoji: string,
  content: string,
  shiftData?: Record<string, unknown>
): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff;
        }
        .emoji {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .title {
            color: #007bff;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        .content {
            margin-bottom: 30px;
            font-size: 16px;
        }
        .shift-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
        }
        .shift-details h3 {
            margin-top: 0;
            color: #007bff;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .app-name {
            color: #007bff;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="emoji">${emoji}</div>
            <h1 class="title">${title}</h1>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        ${shiftData ? `
        <div class="shift-details">
            <h3>シフト詳細</h3>
            <div class="detail-row">
                <span class="detail-label">日付:</span>
                <span>${shiftData.shiftDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">時間:</span>
                <span>${shiftData.startTime} - ${shiftData.endTime}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">担当者:</span>
                <span>${shiftData.userNickname}</span>
            </div>
            ${shiftData.masterNickname ? `
            <div class="detail-row">
                <span class="detail-label">操作者:</span>
                <span>${shiftData.masterNickname}</span>
            </div>
            ` : ''}
            ${shiftData.status ? `
            <div class="detail-row">
                <span class="detail-label">状態:</span>
                <span>${shiftData.status}</span>
            </div>
            ` : ''}
            ${shiftData.reason ? `
            <div class="detail-row">
                <span class="detail-label">理由:</span>
                <span>${shiftData.reason}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}
        
        <div class="footer">
            <p>このメールは <span class="app-name">Shiftize</span> から自動送信されています。</p>
            <p>アプリで詳細を確認し、必要に応じて対応を行ってください。</p>
        </div>
    </div>
</body>
</html>
  `;
}

// ========================================
// 🔒 セキュア認証機能
// ========================================

/**
 * セキュアログイン：サーバーサイドでユーザー検索・認証
 * Firestore Rules の allow read: if true 問題を解決
 */
export const secureLogin = functions
  .region('asia-northeast1')
  .https.onCall(async (data: {
    email: string;
    password: string;
    storeId?: string;
  }) => {
    const { email, password, storeId } = data;

    // 入力検証
    if (!email || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and password required');
    }

    const db = admin.firestore();

    try {
      console.log('🔐 Secure login attempt:', { email, hasStoreId: !!storeId });
      
      // 🔒 サーバーサイドでユーザー検索（クライアントから隠蔽）
      let userQuery;
      const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      
      console.log('📧 Email format check:', { email, isEmailFormat });
      
      if (isEmailFormat) {
        // 実メールアドレス検索
        console.log('🔍 Searching by real email:', email);
        userQuery = await db.collection('users').where('email', '==', email).get();
      } else {
        // 店舗ID + ニックネーム検索
        if (!storeId) {
          console.log('❌ Store ID missing for nickname login');
          throw new functions.https.HttpsError('invalid-argument', 'Store ID required for nickname login');
        }
        const generatedEmail = `${storeId}${email}@example.com`;
        console.log('🔍 Searching by generated email:', generatedEmail);
        userQuery = await db.collection('users').where('email', '==', generatedEmail).get();
      }
      
      console.log('📊 Query result:', { isEmpty: userQuery.empty, size: userQuery.size });

      if (userQuery.empty) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      console.log('👤 Found user:', { 
        uid: userDoc.id, 
        email: userData.email, 
        nickname: userData.nickname,
        role: userData.role,
        hasCurrentPassword: !!userData.currentPassword,
        hasHashedPassword: !!userData.hashedPassword,
        deleted: !!userData.deleted
      });

      // アカウント状態チェック
      if (userData.deleted) {
        console.log('❌ Account is deleted');
        throw new functions.https.HttpsError('failed-precondition', 'Account deleted');
      }

      // 🔒 サーバーサイドでパスワード検証
      let passwordValid = false;
      
      console.log('🔑 Starting password verification');
      
      if (userData.hashedPassword) {
        // 新方式：ハッシュ化パスワード検証
        console.log('🔐 Using hashed password verification');
        try {
          const crypto = require('crypto');
          const [salt, hash] = userData.hashedPassword.split(':');
          const testHash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
          passwordValid = hash === testHash;
          console.log('🔐 Hashed password check result:', passwordValid);
        } catch (hashError) {
          console.error('❌ Hashed password verification error:', hashError);
        }
      } else if (userData.currentPassword) {
        // レガシー：平文パスワード（移行期間のみ）
        console.log('🔓 Using legacy password verification');
        passwordValid = userData.currentPassword === password;
        console.log('🔓 Legacy password check result:', passwordValid);
      } else {
        console.log('❌ No password found in user data');
      }

      if (!passwordValid) {
        console.log('❌ Password validation failed');
        throw new functions.https.HttpsError('unauthenticated', 'Invalid password');
      }

      console.log('✅ Password verified, generating custom token');

      // Firebase Auth カスタムトークン生成
      const customToken = await admin.auth().createCustomToken(userDoc.id, {
        role: userData.role,
        storeId: userData.storeId,
        nickname: userData.nickname,
      });

      console.log('🎟️ Custom token generated successfully');

      // 🔒 最小限のユーザー情報のみ返却
      const result = {
        customToken,
        user: {
          uid: userDoc.id,
          email: userData.email,
          nickname: userData.nickname,
          role: userData.role,
          storeId: userData.storeId,
        }
      };

      console.log('✅ Login successful, returning user data');
      return result;

    } catch (error) {
      console.error('Secure login error:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Login failed');
    }
  });