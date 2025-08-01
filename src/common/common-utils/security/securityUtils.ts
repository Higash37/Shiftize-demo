/**
 * セキュリティ関連ユーティリティ
 * CSRF、XSS、その他のセキュリティ脅威に対する防御機能
 */

// CSRFトークン生成
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // fallback for environments without crypto.getRandomValues
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// セッションストレージでCSRFトークンを管理
class CSRFTokenManager {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_EXPIRY_KEY = 'csrf_token_expiry';
  private static readonly TOKEN_LIFETIME = 30 * 60 * 1000; // 30分

  static getToken(): string {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (!token || !expiry || Date.now() > parseInt(expiry)) {
        return this.refreshToken();
      }
      
      return token;
    } catch (error) {
      // sessionStorageが使用できない場合は新しいトークンを生成
      return generateCSRFToken();
    }
  }

  static refreshToken(): string {
    const token = generateCSRFToken();
    const expiry = Date.now() + this.TOKEN_LIFETIME;
    
    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      // sessionStorageエラーは無視（トークンは返す）
    }
    
    return token;
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return token === storedToken && token.length === 64; // 32バイト = 64文字
  }

  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch (error) {
      // sessionStorageエラーは無視
    }
  }
}

export { CSRFTokenManager };

// セキュアなHTTPリクエストヘッダー
export const getSecureHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF対策
    'X-CSRF-Token': CSRFTokenManager.getToken(),
  };

  // 開発環境以外でのみSecurityヘッダーを追加
  if (!__DEV__) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Frame-Options'] = 'DENY';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  }

  return headers;
};

// セキュアなFetch関数
export const secureFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...getSecureHeaders(),
      ...options.headers,
    },
    credentials: 'same-origin', // CSRF対策
    mode: 'cors',
    cache: 'no-cache',
  };

  // ボディがある場合はCSRFトークンを含める
  if (options.body && typeof options.body === 'string') {
    try {
      const bodyObject = JSON.parse(options.body);
      bodyObject._csrfToken = CSRFTokenManager.getToken();
      secureOptions.body = JSON.stringify(bodyObject);
    } catch (error) {
      // JSON以外のボディの場合はそのまま
    }
  }

  const response = await fetch(url, secureOptions);
  
  // レスポンスヘッダーのセキュリティチェック
  if (!__DEV__ && !response.headers.get('X-Content-Type-Options')) {
    console.warn('Response missing security headers');
  }

  return response;
};

// Content Security Policy設定
export const getCSPHeader = (): string => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://functions.cloudfunctions.net",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  return cspDirectives.join('; ');
};

// 安全な文字列比較（タイミング攻撃対策）
export const safeStringCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

// IPアドレスの検証とサニタイゼーション
export const sanitizeIP = (ip: string): string => {
  if (!ip || typeof ip !== 'string') {
    return '0.0.0.0';
  }
  
  // IPv4の簡単な検証
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    const validParts = parts.map(part => {
      const num = parseInt(part, 10);
      return (num >= 0 && num <= 255) ? part : '0';
    });
    return validParts.join('.');
  }
  
  return '0.0.0.0';
};

// レート制限のための簡単なトークンバケット
class RateLimiter {
  private static buckets = new Map<string, { tokens: number; lastRefill: number }>();
  private static readonly BUCKET_SIZE = 10;
  private static readonly REFILL_RATE = 1; // 1秒間に1トークン
  
  static isAllowed(identifier: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(identifier) || { tokens: this.BUCKET_SIZE, lastRefill: now };
    
    // トークンの補充
    const timePassed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(this.BUCKET_SIZE, bucket.tokens + timePassed * this.REFILL_RATE);
    bucket.lastRefill = now;
    
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.buckets.set(identifier, bucket);
      return true;
    }
    
    this.buckets.set(identifier, bucket);
    return false;
  }
  
  static reset(identifier: string): void {
    this.buckets.delete(identifier);
  }
  
  static clearOldBuckets(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1時間
    
    for (const [id, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(id);
      }
    }
  }
}

export { RateLimiter };

// セキュリティイベントのログ
export interface SecurityEvent {
  type: 'csrf_violation' | 'xss_attempt' | 'rate_limit_exceeded' | 'invalid_input' | 'unauthorized_access' | 'user_logout';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
  timestamp: Date;
}

class SecurityLogger {
  private static events: SecurityEvent[] = [];
  private static readonly MAX_EVENTS = 1000;
  
  static logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };
    
    this.events.push(fullEvent);
    
    // 配列サイズの制限
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }
    
    // 重要なセキュリティイベントは即座にログ出力（ログアウトは除外）
    if (['csrf_violation', 'xss_attempt', 'unauthorized_access'].includes(event.type)) {
      console.error('🚨 Security Event:', fullEvent);
    } else if (event.type === 'user_logout') {
      console.info('ℹ️ User Action:', fullEvent);
    }
  }
  
  static getEvents(type?: SecurityEvent['type']): SecurityEvent[] {
    if (type) {
      return this.events.filter(event => event.type === type);
    }
    return [...this.events];
  }
  
  static clearEvents(): void {
    this.events = [];
  }
}

export { SecurityLogger };

// セキュリティミドルウェア関数
export const securityMiddleware = {
  // CSRF検証
  validateCSRF: (token: string): boolean => {
    const isValid = CSRFTokenManager.validateToken(token);
    if (!isValid) {
      SecurityLogger.logEvent({
        type: 'csrf_violation',
        details: 'Invalid CSRF token provided',
      });
    }
    return isValid;
  },
  
  // レート制限チェック
  checkRateLimit: (identifier: string): boolean => {
    const isAllowed = RateLimiter.isAllowed(identifier);
    if (!isAllowed) {
      SecurityLogger.logEvent({
        type: 'rate_limit_exceeded',
        details: `Rate limit exceeded for: ${identifier}`,
      });
    }
    return isAllowed;
  },
  
  // 入力値の安全性チェック
  validateInput: (input: any): boolean => {
    if (typeof input === 'string') {
      // 基本的なXSS攻撃パターンのチェック
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      ];
      
      for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
          SecurityLogger.logEvent({
            type: 'xss_attempt',
            details: `XSS pattern detected: ${input.substring(0, 100)}`,
          });
          return false;
        }
      }
    }
    return true;
  },
};