/**
 * Email Service Library
 * メール送信機能の抽象化レイヤー
 */

export interface EmailConfig {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * メール送信
   * 実際の実装では Firebase Cloud Functions や外部メールサービスを使用
   */
  async sendEmail(config: EmailConfig): Promise<EmailResponse> {
    try {
      // 開発環境では console.log でメール内容を出力
      if (__DEV__) {
        console.log('=== Email Service Debug ===');
        console.log('To:', config.to);
        console.log('Subject:', config.subject);
        console.log('HTML:', config.html);
        console.log('Text:', config.text);
        console.log('========================');
      }

      // TODO: 実際のメール送信実装
      // 例: Firebase Cloud Functions を呼び出し
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config),
      // });

      // 開発環境では成功を返す
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * メール件名のサニタイズ
   * セキュリティ対策とメール配信確実性のため
   */
  private sanitizeSubject(subject: string): string {
    // 改行文字を除去
    if (typeof subject !== 'string') {
      return '';
    }
    return subject.replace(/[\r\n]/g, ' ').trim();
  }

  /**
   * シフト作成通知メールのテンプレート
   */
  createShiftNotificationEmail(data: {
    shiftDate: string;
    startTime: string;
    endTime: string;
    userNickname: string;
  }): { subject: string; html: string; text: string } {
    const subject = 'シフト作成通知';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">シフト作成通知</h2>
        <p>新しいシフトが作成されました。</p>
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 12px 0;">シフト詳細</h3>
          <p><strong>日付:</strong> ${data.shiftDate}</p>
          <p><strong>時間:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>作成者:</strong> ${data.userNickname}</p>
        </div>
        <p>シフト管理システムで詳細を確認してください。</p>
      </div>
    `;

    const text = `
シフト作成通知

新しいシフトが作成されました。

シフト詳細:
日付: ${data.shiftDate}
時間: ${data.startTime} - ${data.endTime}
作成者: ${data.userNickname}

シフト管理システムで詳細を確認してください。
    `;

    return { 
      subject: this.sanitizeSubject(subject), 
      html, 
      text 
    };
  }

  /**
   * シフト更新通知メールのテンプレート
   */
  createShiftUpdateNotificationEmail(data: {
    shiftDate: string;
    startTime: string;
    endTime: string;
    userNickname: string;
  }): { subject: string; html: string; text: string } {
    const subject = 'シフト更新通知';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">シフト更新通知</h2>
        <p>シフトが更新されました。</p>
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 12px 0;">更新されたシフト詳細</h3>
          <p><strong>日付:</strong> ${data.shiftDate}</p>
          <p><strong>時間:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>更新者:</strong> ${data.userNickname}</p>
        </div>
        <p>シフト管理システムで詳細を確認してください。</p>
      </div>
    `;

    const text = `
シフト更新通知

シフトが更新されました。

更新されたシフト詳細:
日付: ${data.shiftDate}
時間: ${data.startTime} - ${data.endTime}
更新者: ${data.userNickname}

シフト管理システムで詳細を確認してください。
    `;

    return { 
      subject: this.sanitizeSubject(subject), 
      html, 
      text 
    };
  }

  /**
   * シフト削除通知メールのテンプレート
   */
  createShiftDeletionNotificationEmail(data: {
    shiftDate: string;
    startTime: string;
    endTime: string;
    userNickname: string;
  }): { subject: string; html: string; text: string } {
    const subject = 'シフト削除通知';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">シフト削除通知</h2>
        <p>シフトが削除されました。</p>
        <div style="background-color: #fff2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #e74c3c;">
          <h3 style="margin: 0 0 12px 0;">削除されたシフト詳細</h3>
          <p><strong>日付:</strong> ${data.shiftDate}</p>
          <p><strong>時間:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>削除者:</strong> ${data.userNickname}</p>
        </div>
        <p>必要に応じてシフト管理システムで新しいシフトを作成してください。</p>
      </div>
    `;

    const text = `
シフト削除通知

シフトが削除されました。

削除されたシフト詳細:
日付: ${data.shiftDate}
時間: ${data.startTime} - ${data.endTime}
削除者: ${data.userNickname}

必要に応じてシフト管理システムで新しいシフトを作成してください。
    `;

    return { 
      subject: this.sanitizeSubject(subject), 
      html, 
      text 
    };
  }

  /**
   * メールテンプレートを生成する（静的メソッド）
   */
  static generateEmailTemplate(data: {
    shiftDate: string;
    startTime: string;
    endTime: string;
    userNickname: string;
  }): { subject: string; html: string; text: string } {
    return EmailService.getInstance().createShiftNotificationEmail(data);
  }

  /**
   * メール送信（静的メソッド）
   */
  static async sendEmail(config: EmailConfig): Promise<EmailResponse> {
    return EmailService.getInstance().sendEmail(config);
  }
}

// シングルトンインスタンスをエクスポート
export const emailService = EmailService.getInstance();