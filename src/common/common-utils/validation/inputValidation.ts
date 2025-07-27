/**
 * 入力検証・サニタイゼーション ユーティリティ
 * セキュリティ強化のための包括的な入力検証システム
 */

// メールアドレス検証
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'メールアドレスが入力されていません' };
  }

  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'メールアドレスが入力されていません' };
  }

  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'メールアドレスが長すぎます（254文字以内）' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: '有効なメールアドレスを入力してください' };
  }

  // 危険な文字のチェック
  const dangerousChars = /<|>|"|'|`|;|&|\||\\|\//;
  if (dangerousChars.test(trimmedEmail)) {
    return { isValid: false, error: '無効な文字が含まれています' };
  }

  return { isValid: true };
};

// パスワード検証
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'パスワードが入力されていません' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'パスワードは8文字以上で入力してください' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'パスワードが長すぎます（128文字以内）' };
  }

  // 文字種の要求
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { 
      isValid: false, 
      error: 'パスワードは大文字、小文字、数字をそれぞれ含む必要があります' 
    };
  }

  return { isValid: true };
};

// テキスト入力のサニタイゼーション
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .substring(0, 1000); // 最大1000文字に制限
};

// HTML安全な文字列への変換
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return text.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char] || char);
};

// ファイル名の検証
export const validateFileName = (fileName: string): { isValid: boolean; error?: string } => {
  if (!fileName || typeof fileName !== 'string') {
    return { isValid: false, error: 'ファイル名が入力されていません' };
  }

  const trimmedName = fileName.trim();
  if (trimmedName.length === 0) {
    return { isValid: false, error: 'ファイル名が入力されていません' };
  }

  if (trimmedName.length > 255) {
    return { isValid: false, error: 'ファイル名が長すぎます（255文字以内）' };
  }

  // 危険な文字・パターンのチェック
  const dangerousPatterns = [
    /\.\./,           // パストラバーサル
    /[<>:"/\\|?*]/,   // 無効なファイル名文字
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows予約語
    /^\./,            // 隠しファイル
    /\.$|\.$/,        // 末尾のドット
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedName)) {
      return { isValid: false, error: '無効なファイル名です' };
    }
  }

  return { isValid: true };
};

// 日付の検証
export const validateDate = (dateString: string): { isValid: boolean; error?: string } => {
  if (!dateString || typeof dateString !== 'string') {
    return { isValid: false, error: '日付が入力されていません' };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: '有効な日付を入力してください' };
  }

  // 未来日の制限（シフト管理では通常必要）
  const today = new Date();
  const maxFutureDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());
  
  if (date > maxFutureDate) {
    return { isValid: false, error: '日付が遠すぎます（2年以内）' };
  }

  // 過去日の制限
  const minPastDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
  if (date < minPastDate) {
    return { isValid: false, error: '日付が古すぎます（5年以内）' };
  }

  return { isValid: true };
};

// 時間の検証
export const validateTime = (timeString: string): { isValid: boolean; error?: string } => {
  if (!timeString || typeof timeString !== 'string') {
    return { isValid: false, error: '時間が入力されていません' };
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeString)) {
    return { isValid: false, error: '有効な時間を入力してください（HH:MM形式）' };
  }

  return { isValid: true };
};

// StoreID検証
export const validateStoreId = (storeId: string): { isValid: boolean; error?: string } => {
  if (!storeId || typeof storeId !== 'string') {
    return { isValid: false, error: 'Store IDが入力されていません' };
  }

  const trimmedStoreId = storeId.trim();
  if (trimmedStoreId.length === 0) {
    return { isValid: false, error: 'Store IDが入力されていません' };
  }

  if (trimmedStoreId.length > 50) {
    return { isValid: false, error: 'Store IDが長すぎます（50文字以内）' };
  }

  // 英数字とハイフン、アンダースコアのみ許可
  const storeIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!storeIdRegex.test(trimmedStoreId)) {
    return { isValid: false, error: 'Store IDは英数字、ハイフン、アンダースコアのみ使用可能です' };
  }

  return { isValid: true };
};

// 数値の検証
export const validateNumber = (
  value: string | number, 
  min?: number, 
  max?: number
): { isValid: boolean; error?: string } => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { isValid: false, error: '有効な数値を入力してください' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `${min}以上の値を入力してください` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `${max}以下の値を入力してください` };
  }

  return { isValid: true };
};

// 包括的なフォーム検証
export interface FormValidationRule {
  value: any;
  type: 'email' | 'password' | 'text' | 'filename' | 'date' | 'time' | 'storeId' | 'number';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  customValidator?: (value: any) => { isValid: boolean; error?: string };
}

export const validateForm = (
  rules: { [key: string]: FormValidationRule }
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};
  
  for (const [fieldName, rule] of Object.entries(rules)) {
    const { value, type, required = false } = rule;
    
    // 必須チェック
    if (required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
      errors[fieldName] = `${fieldName}は必須項目です`;
      continue;
    }
    
    // 値がない場合はスキップ（必須でない場合）
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      continue;
    }
    
    // 型別検証
    let result: { isValid: boolean; error?: string };
    
    switch (type) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'filename':
        result = validateFileName(value);
        break;
      case 'date':
        result = validateDate(value);
        break;
      case 'time':
        result = validateTime(value);
        break;
      case 'storeId':
        result = validateStoreId(value);
        break;
      case 'number':
        result = validateNumber(value, rule.min, rule.max);
        break;
      case 'text':
      default:
        // 基本的なテキスト検証
        if (rule.minLength && value.length < rule.minLength) {
          result = { isValid: false, error: `${rule.minLength}文字以上入力してください` };
        } else if (rule.maxLength && value.length > rule.maxLength) {
          result = { isValid: false, error: `${rule.maxLength}文字以内で入力してください` };
        } else {
          result = { isValid: true };
        }
        break;
    }
    
    if (!result.isValid) {
      errors[fieldName] = result.error || '入力値が無効です';
      continue;
    }
    
    // カスタムバリデーター
    if (rule.customValidator) {
      const customResult = rule.customValidator(value);
      if (!customResult.isValid) {
        errors[fieldName] = customResult.error || '入力値が無効です';
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// XSS対策のための安全な文字列出力
export const safeString = (input: string): string => {
  return escapeHtml(sanitizeText(input));
};