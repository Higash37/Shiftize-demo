"use strict";
/**
 * Firebase Cloud Functions
 * メール送信機能を提供
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendShiftNotification = exports.sendEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const nodemailer = __importStar(require("nodemailer"));
const admin = __importStar(require("firebase-admin"));
// Firebase Admin SDK初期化
admin.initializeApp();
// Gmail SMTP設定を環境変数から取得
const getEmailConfig = () => {
    var _a, _b;
    const config = functions.config();
    if (!((_a = config.email) === null || _a === void 0 ? void 0 : _a.user) || !((_b = config.email) === null || _b === void 0 ? void 0 : _b.password)) {
        throw new Error('Email configuration not found. Please set email.user and email.password');
    }
    return {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: config.email.user,
            pass: config.email.password,
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
exports.sendEmail = functions
    .region('asia-northeast1') // 東京リージョン
    .https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    // 入力検証
    if (!data.to || !data.subject || !data.html) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: to, subject, html');
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
        console.log('✅ Email sent successfully:', {
            messageId: result.messageId,
            recipients: data.to,
            subject: data.subject,
        });
        return {
            success: true,
            messageId: result.messageId,
            recipients: Array.isArray(data.to) ? data.to.length : 1,
        };
    }
    catch (error) {
        console.error('❌ Failed to send email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
});
/**
 * シフト通知専用関数
 * より簡単なインターフェースでシフト通知を送信
 */
exports.sendShiftNotification = functions
    .region('asia-northeast1')
    .https.onCall(async (data, context) => {
    // 認証チェック
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    let title;
    let emoji;
    let content;
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
            throw new functions.https.HttpsError('invalid-argument', 'Invalid notification type');
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
        console.log('✅ Shift notification sent successfully:', {
            messageId: result.messageId,
            type: data.type,
            recipients: data.to,
        });
        return {
            success: true,
            messageId: result.messageId,
            recipients: Array.isArray(data.to) ? data.to.length : 1,
        };
    }
    catch (error) {
        console.error('❌ Failed to send shift notification:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
});
/**
 * HTMLメールテンプレート生成関数
 */
function generateEmailTemplate(title, emoji, content, shiftData) {
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
//# sourceMappingURL=index.js.map