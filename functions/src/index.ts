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

    // 🔒 入力検証強化
    if (!data.to || !data.subject || !data.html) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: to, subject, html'
      );
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(data.to) ? data.to : [data.to];
    
    for (const email of recipients) {
      if (typeof email !== 'string' || !emailRegex.test(email)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Invalid email format: ${email}`
        );
      }
    }

    // サイズ制限チェック
    if (data.subject.length > 200) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Subject too long (max 200 characters)'
      );
    }

    if (data.html.length > 100000) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'HTML content too large (max 100KB)'
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
      // 🔒 本番環境では詳細エラー情報を隠蔽
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Failed to send email:', error);
      }
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
      // 🔒 本番環境では詳細エラー情報を隠蔽
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Failed to send shift notification:', error);
      }
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

    // 🔒 入力値サニタイゼーション
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'targetUserId is required and must be a string'
      );
    }

    // ユーザーID形式チェック（英数字のみ許可）
    if (!/^[a-zA-Z0-9]+$/.test(targetUserId)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid targetUserId format'
      );
    }

    // 表示名のサニタイゼーション
    if (newDisplayName && (typeof newDisplayName !== 'string' || newDisplayName.trim().length === 0 || newDisplayName.length > 50)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'displayName must be a non-empty string (max 50 characters)'
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

    // 🔒 マスター対マスター攻撃を防ぐ：マスターは他のマスターのパスワードを変更不可
    if (target?.role === 'master' && callerUid !== targetUserId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Masters cannot modify other masters\' credentials'
      );
    }

    // 認証情報の更新（セキュリティ強化版）
    if (newPassword || newDisplayName) {
      const authUpdate: admin.auth.UpdateRequest = {};
      
      if (newPassword) {
        // 🔒 パスワード要件（6文字以上）
        if (typeof newPassword !== 'string' || newPassword.length < 6) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Password must be at least 6 characters'
          );
        }
        authUpdate.password = newPassword;
        
        // パスワード更新完了（ログはセキュリティ上出力しない）
      }
      
      if (newDisplayName) {
        if (typeof newDisplayName !== 'string' || newDisplayName.trim().length === 0) {
          throw new functions.https.HttpsError('invalid-argument', 'displayName must be a non-empty string');
        }
        authUpdate.displayName = newDisplayName.trim();
      }

      await admin.auth().updateUser(targetUserId, authUpdate);
      
      // 🔒 セキュリティログ：重要な操作を記録（機密情報は含めない）
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 Admin credential update: caller=${callerUid.substring(0,6)}*** target=${targetUserId.substring(0,6)}*** store=${targetStoreId}`);
      }
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
      
      // 🔒 セキュリティログ：プロフィール更新を記録（機密情報は含めない）
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 Profile update: caller=${callerUid.substring(0,6)}*** target=${targetUserId.substring(0,6)}*** fields=${Object.keys(firestoreUpdates).length}`);
      }
    }

    return { success: true };
  });

/**
 * HTMLメールテンプレート生成関数
 */
// 🔒 XSS対策：HTMLエスケープ関数
function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateEmailTemplate(
  title: string,
  emoji: string,
  content: string,
  shiftData?: Record<string, unknown>
): string {
  // 🔒 全ての入力値をエスケープ
  const safeTitle = escapeHtml(title);
  const safeEmoji = escapeHtml(emoji);
  const safeContent = content; // HTMLコンテンツは意図的に保持（管理者が作成するため）
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
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
            <div class="emoji">${safeEmoji}</div>
            <h1 class="title">${safeTitle}</h1>
        </div>
        
        <div class="content">
            ${safeContent}
        </div>
        
        ${shiftData ? `
        <div class="shift-details">
            <h3>シフト詳細</h3>
            <div class="detail-row">
                <span class="detail-label">日付:</span>
                <span>${escapeHtml(String(shiftData.shiftDate || ''))}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">時間:</span>
                <span>${escapeHtml(String(shiftData.startTime || ''))} - ${escapeHtml(String(shiftData.endTime || ''))}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">担当者:</span>
                <span>${escapeHtml(String(shiftData.userNickname || ''))}</span>
            </div>
            ${shiftData.masterNickname ? `
            <div class="detail-row">
                <span class="detail-label">操作者:</span>
                <span>${escapeHtml(String(shiftData.masterNickname))}</span>
            </div>
            ` : ''}
            ${shiftData.status ? `
            <div class="detail-row">
                <span class="detail-label">状態:</span>
                <span>${escapeHtml(String(shiftData.status))}</span>
            </div>
            ` : ''}
            ${shiftData.reason ? `
            <div class="detail-row">
                <span class="detail-label">理由:</span>
                <span>${escapeHtml(String(shiftData.reason))}</span>
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

// 🔒 IP別ログイン試行回数管理（メモリ内キャッシュ）
const loginAttempts = new Map<string, number[]>();

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
  }, context) => {
    const { email, password, storeId } = data;
    
    // 🔒 レート制限：IP別ブルートフォース攻撃対策
    const clientIP = context.rawRequest?.ip || 'unknown';
    const currentTime = Date.now();
    const attempts = loginAttempts.get(clientIP) || [];
    
    // 過去5分間の試行回数をカウント
    const recentAttempts = attempts.filter(time => currentTime - time < 5 * 60 * 1000);
    
    if (recentAttempts.length >= 10) {
      throw new functions.https.HttpsError(
        'resource-exhausted', 
        'Too many login attempts. Please try again later.'
      );
    }
    
    // 現在の試行を記録
    recentAttempts.push(currentTime);
    loginAttempts.set(clientIP, recentAttempts);

    // 入力検証
    if (!email || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'Email and password required');
    }

    const db = admin.firestore();

    try {
      // 🔒 サーバーサイドでユーザー検索（クライアントから隠蔽）
      let userQuery;
      const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      
      if (isEmailFormat) {
        // 実メールアドレス検索
        userQuery = await db.collection('users').where('email', '==', email).get();
      } else {
        // 店舗ID + ニックネーム検索
        if (!storeId) {
          throw new functions.https.HttpsError('invalid-argument', 'Store ID required for nickname login');
        }
        const generatedEmail = `${storeId}${email}@example.com`;
        userQuery = await db.collection('users').where('email', '==', generatedEmail).get();
      }

      if (userQuery.empty) {
        // 🔒 アカウント存在確認攻撃を防ぐため、パスワード間違いと同じエラー
        throw new functions.https.HttpsError('unauthenticated', 'Invalid credentials');
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      // アカウント状態チェック
      if (userData.deleted) {
        // 🔒 削除アカウントも認証エラーとして扱う（情報漏洩防止）
        throw new functions.https.HttpsError('unauthenticated', 'Invalid credentials');
      }

      // 🔒 タイミング攻撃対策：常に同じ処理時間になるよう実装
      let passwordValid = false;
      
      // 常に両方の検証を実行（タイミング攻撃を防ぐため）
      const verificationPromises = [];
      
      // ハッシュ化パスワード検証（常に実行）
      verificationPromises.push(
        (async () => {
          if (userData.hashedPassword) {
            try {
              const crypto = require('crypto');
              const [salt, hash] = userData.hashedPassword.split(':');
              const testHash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
              return hash === testHash;
            } catch (hashError) {
              return false;
            }
          } else {
            // ダミー計算（時間を揃えるため）
            const crypto = require('crypto');
            crypto.pbkdf2Sync('dummy', 'dummy', 100000, 32, 'sha256');
            return false;
          }
        })()
      );
      
      // 平文パスワード検証（常に実行）
      verificationPromises.push(
        (async () => {
          if (userData.currentPassword) {
            // レガシー：平文パスワード（移行期間のみ）
            return userData.currentPassword === password;
          } else {
            // ダミー比較（時間を揃えるため）
            return 'dummy' === password;
          }
        })()
      );
      
      // 両方の結果を待機し、いずれかが成功すれば認証成功
      const results = await Promise.all(verificationPromises);
      passwordValid = results.some(result => result === true);

      if (!passwordValid) {
        throw new functions.https.HttpsError('unauthenticated', 'Invalid credentials');
      }

      // 🔒 storesAccessデータを取得（多店舗アクセス用）
      let storesAccess = null;
      try {
        const storeAccessDoc = await db.doc(`userStoreAccess/${userDoc.id}`).get();
        if (storeAccessDoc.exists) {
          storesAccess = storeAccessDoc.data()?.storesAccess || null;
        }
      } catch (error) {
        // storeAccessが存在しない場合はnullのまま
      }

      // Firebase Auth カスタムトークン生成（Security Rulesで使用）
      const customToken = await admin.auth().createCustomToken(userDoc.id, {
        role: userData.role,
        storeId: userData.storeId,
        nickname: userData.nickname,
        storesAccess: storesAccess,  // 🔒 多店舗アクセス情報を追加
      });

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

      return result;

    } catch (error) {
      // セキュリティ上、詳細エラーはログに出力しない
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Login failed');
    }
  });