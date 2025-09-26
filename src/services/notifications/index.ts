/**
 * 通知サービス統合エクスポート
 */

// メール通知サービス
export { EmailNotificationService } from './EmailNotificationService';
export type { EmailNotificationData, NotificationRecipient } from './EmailNotificationService';

// プッシュ通知サービス
export { PushNotificationService } from './PushNotificationService';
export type { NotificationData } from './PushNotificationService';

// シフト通知サービス
export { ShiftNotificationService } from './ShiftNotificationService';
export type { NotificationRecipient as ShiftNotificationRecipient } from './ShiftNotificationService';

// メールサービス（低レベルAPI）
export { EmailService, ShiftEmailNotificationService } from './email-service';
export type {
  EmailConfig,
  EmailMessage,
  ShiftNotificationData
} from './email-service';