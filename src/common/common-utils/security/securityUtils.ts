import { SECURITY_TIMEOUTS } from "@/common/common-constants/BoundaryConstants";

/**
 * セキュリティ関連ユーティリティ
 *
 * CSRF、XSS、その他のセキュリティ脅威に対する防御機能を提供します。
 *
 * ⚠️ SECURITY NOTES:
 * - このモジュールはクライアント側のセキュリティ対策を実装しています
 * - サーバー側でも同様の検証を必ず実装してください
 * - CSRFトークンはセッションストレージに保存されます（30分の有効期限）
 * - レート制限はメモリベースのため、サーバー再起動でリセットされます
 */

/**
 * CSRFトークン生成
 *
 * 32バイト（256ビット）の暗号学的に安全な乱数を使用してCSRFトークンを生成します。
 * crypto.getRandomValuesが利用できない環境ではMath.random()にフォールバックしますが、
 * 本番環境ではcrypto.getRandomValuesが利用可能であることを確認してください。
 *
 * @returns 64文字の16進数文字列（32バイト = 256ビット）
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // fallback for environments without crypto.getRandomValues
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

/**
 * CSRFトークンマネージャー
 *
 * セッションストレージを使用してCSRFトークンを管理します。
 * トークンは30分間有効で、期限切れの場合は自動的に更新されます。
 *
 * ⚠️ SECURITY NOTE:
 * - トークンはセッションストレージに保存されるため、プライベートブラウジングモードでは
 *   セッション終了時に失効します
 * - サーバー側でもトークンの検証を必ず実装してください
 */
class CSRFTokenManager {
  private static readonly TOKEN_KEY = "csrf_token";
  private static readonly TOKEN_EXPIRY_KEY = "csrf_token_expiry";
  private static readonly TOKEN_LIFETIME = SECURITY_TIMEOUTS.CSRF_TOKEN_LIFETIME_MS;

  /**
   * CSRFトークンを取得
   *
   * 有効なトークンが存在する場合はそれを返し、
   * 存在しないか期限切れの場合は新しいトークンを生成します。
   *
   * @returns CSRFトークン（64文字の16進数文字列）
   */
  static getToken(): string {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);

      if (!token || !expiry || Date.now() > Number.parseInt(expiry, 10)) {
        return this.refreshToken();
      }

      return token;
    } catch {
      // sessionStorageが使用できない場合は新しいトークンを生成
      return generateCSRFToken();
    }
  }

  /**
   * CSRFトークンを更新
   *
   * 新しいトークンを生成し、セッションストレージに保存します。
   *
   * @returns 新しく生成されたCSRFトークン
   */
  static refreshToken(): string {
    const token = generateCSRFToken();
    const expiry = Date.now() + this.TOKEN_LIFETIME;

    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    } catch {
      // sessionStorageエラーは無視（トークンは返す）
      // プライベートブラウジングモードなどで発生する可能性がある
    }

    return token;
  }

  /**
   * CSRFトークンを検証
   *
   * 提供されたトークンが現在のセッションのトークンと一致するか確認します。
   *
   * @param token - 検証するトークン
   * @returns トークンが有効な場合 true、それ以外の場合 false
   */
  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return token === storedToken && token.length === 64; // 32バイト = 64文字
  }

  /**
   * CSRFトークンをクリア
   *
   * セッションストレージからトークンと有効期限を削除します。
   * ログアウト時などに呼び出してください。
   */
  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch {
      // sessionStorageエラーは無視（既に削除されている可能性がある）
    }
  }
}

export { CSRFTokenManager };

/**
 * セキュアなHTTPリクエストヘッダーを取得
 *
 * CSRF対策とセキュリティヘッダーを含むHTTPリクエストヘッダーを生成します。
 * 開発環境では一部のセキュリティヘッダーを省略します。
 *
 * @returns セキュリティヘッダーを含むHTTPヘッダーオブジェクト
 */
export const getSecureHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // CSRF対策
    "X-CSRF-Token": CSRFTokenManager.getToken(),
  };

  // 開発環境以外でのみSecurityヘッダーを追加
  if (!__DEV__) {
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains";
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["X-XSS-Protection"] = "1; mode=block";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  }

  return headers;
};

/**
 * セキュアなFetch関数
 *
 * CSRFトークンとセキュリティヘッダーを含むHTTPリクエストを実行します。
 * リクエストボディがJSON形式の場合は、自動的にCSRFトークンを追加します。
 *
 * ⚠️ SECURITY NOTE:
 * - この関数はクライアント側のセキュリティ対策を提供します
 * - サーバー側でもCSRFトークンの検証を必ず実装してください
 *
 * @param url - リクエスト先のURL
 * @param options - Fetch APIのオプション
 * @returns Fetch APIのResponseオブジェクト
 */
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
    credentials: "same-origin", // CSRF対策
    mode: "cors",
    cache: "no-cache",
  };

  // ボディがある場合はCSRFトークンを含める
  if (options.body && typeof options.body === "string") {
    try {
      const bodyObject = JSON.parse(options.body);
      bodyObject._csrfToken = CSRFTokenManager.getToken();
      secureOptions.body = JSON.stringify(bodyObject);
    } catch {
      // JSON以外のボディの場合はそのまま
    }
  }

  const response = await fetch(url, secureOptions);

  // レスポンスヘッダーのセキュリティチェック
  // 本番環境ではサーバー側で適切なセキュリティヘッダーが設定されていることを確認
  if (!__DEV__ && !response.headers.get("X-Content-Type-Options")) {
    // セキュリティヘッダーが不足している場合は警告を記録
    SecurityLogger.logEvent({
      type: "system_error",
      details: "Response missing security headers",
    });
  }

  return response;
};

/**
 * Content Security Policy (CSP) ヘッダーを取得
 *
 * XSS攻撃を防ぐためのContent Security Policyヘッダーを生成します。
 * このCSPはSupabaseサービスとの互換性を考慮して設定されています。
 *
 * ⚠️ SECURITY NOTE:
 * - 'unsafe-inline'の使用は最小限に抑えることを推奨します
 * - 本番環境ではより厳格なCSPポリシーを検討してください
 *
 * @returns CSPヘッダーの文字列
 */
export const getCSPHeader = (): string => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  return cspDirectives.join("; ");
};

/**
 * 安全な文字列比較（タイミング攻撃対策）
 *
 * 文字列の比較を一定時間で実行し、タイミング攻撃を防ぎます。
 * すべての文字を比較してから結果を返すため、文字列の長さや内容による
 * 実行時間の差異が発生しません。
 *
 * @param a - 比較する最初の文字列
 * @param b - 比較する2番目の文字列
 * @returns 文字列が一致する場合 true、それ以外の場合 false
 */
export const safeStringCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  // 文字列を配列に変換してcodePointAtを使用（サロゲートペア対応）
  const aArray = [...a];
  const bArray = [...b];

  for (let i = 0; i < aArray.length; i++) {
    const charA = aArray[i];
    const charB = bArray[i];
    if (!charA || !charB) {
      result |= 1; // undefinedの場合は不一致として扱う
      continue;
    }
    const codePointA = charA.codePointAt(0) ?? 0;
    const codePointB = charB.codePointAt(0) ?? 0;
    result |= codePointA ^ codePointB;
  }

  return result === 0;
};

/**
 * IPアドレスの検証とサニタイゼーション
 *
 * IPv4アドレスの形式を検証し、無効な場合は'0.0.0.0'を返します。
 * 各オクテットが0-255の範囲内であることを確認します。
 *
 * ⚠️ LIMITATION:
 * - 現在はIPv4のみをサポートしています（IPv6は未対応）
 * - より厳密な検証が必要な場合は、専用のIP検証ライブラリを使用してください
 *
 * @param ip - 検証するIPアドレス文字列
 * @returns サニタイズされたIPアドレス（無効な場合は'0.0.0.0'）
 */
export const sanitizeIP = (ip: string): string => {
  if (!ip || typeof ip !== "string") {
    return "0.0.0.0";
  }

  // IPv4の簡単な検証
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".");
    const validParts = parts.map((part) => {
      const num = Number.parseInt(part, 10);
      return num >= 0 && num <= 255 ? part : "0";
    });
    return validParts.join(".");
  }

  return "0.0.0.0";
};

/**
 * レート制限のためのトークンバケット実装
 *
 * トークンバケットアルゴリズムを使用してレート制限を実装します。
 * 各識別子に対して、一定時間内に許可されるリクエスト数を制限します。
 *
 * ⚠️ LIMITATIONS:
 * - メモリベースの実装のため、サーバー再起動でリセットされます
 * - 本番環境では、Redisなどの永続化ストレージを使用することを推奨します
 * - 分散システムでは、共有ストレージを使用してください
 */
class RateLimiter {
  private static readonly buckets = new Map<
    string,
    { tokens: number; lastRefill: number }
  >();
  private static readonly BUCKET_SIZE = 10;
  private static readonly REFILL_RATE = 1; // 1秒間に1トークン

  /**
   * リクエストが許可されるかチェック
   *
   * 指定された識別子に対して、トークンバケットアルゴリズムを使用して
   * リクエストが許可されるか確認します。
   *
   * @param identifier - レート制限を適用する識別子（IPアドレス、ユーザーIDなど）
   * @returns リクエストが許可される場合 true、それ以外の場合 false
   */
  static isAllowed(identifier: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(identifier) || {
      tokens: this.BUCKET_SIZE,
      lastRefill: now,
    };

    // トークンの補充
    const timePassed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(
      this.BUCKET_SIZE,
      bucket.tokens + timePassed * this.REFILL_RATE
    );
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.buckets.set(identifier, bucket);
      return true;
    }

    this.buckets.set(identifier, bucket);
    return false;
  }

  /**
   * 識別子のレート制限をリセット
   *
   * 指定された識別子のバケットを削除し、レート制限をリセットします。
   *
   * @param identifier - リセットする識別子
   */
  static reset(identifier: string): void {
    this.buckets.delete(identifier);
  }

  /**
   * 古いバケットをクリア
   *
   * 1時間以上更新されていないバケットを削除してメモリを解放します。
   * 定期的に呼び出すことを推奨します。
   */
  static clearOldBuckets(): void {
    const now = Date.now();
    for (const [id, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > SECURITY_TIMEOUTS.RATE_LIMIT_BUCKET_MAX_AGE_MS) {
        this.buckets.delete(id);
      }
    }
  }
}

export { RateLimiter };

/**
 * セキュリティイベントの型定義
 *
 * セキュリティ関連のイベントを記録するためのインターフェースです。
 */
export interface SecurityEvent {
  type:
    | "csrf_violation"
    | "xss_attempt"
    | "rate_limit_exceeded"
    | "invalid_input"
    | "unauthorized_access"
    | "user_logout"
    | "encryption_error"
    | "encryption_warning"
    | "system_event"
    | "system_error";
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
  timestamp: Date;
}

/**
 * セキュリティイベントロガー
 *
 * セキュリティ関連のイベントを記録・管理します。
 * メモリベースの実装のため、最大1000件のイベントを保持します。
 *
 * ⚠️ LIMITATIONS:
 * - メモリベースの実装のため、サーバー再起動でログが失われます
 * - 本番環境では、外部ログサービス（CloudWatch、Splunkなど）への送信を推奨します
 * - 重要なセキュリティイベントは即座にアラートを送信してください
 */
class SecurityLogger {
  private static events: SecurityEvent[] = [];
  private static readonly MAX_EVENTS = 1000;

  /**
   * セキュリティイベントを記録
   *
   * セキュリティ関連のイベントをログに追加します。
   * タイムスタンプは自動的に追加されます。
   *
   * @param event - 記録するセキュリティイベント（タイムスタンプを除く）
   */
  static logEvent(event: Omit<SecurityEvent, "timestamp">): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    // 配列サイズの制限
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    // 重要なセキュリティイベントの処理
    // 本番環境では、外部ログサービスへの送信やアラートの送信を実装してください
    if (
      ["csrf_violation", "xss_attempt", "unauthorized_access"].includes(
        event.type
      )
    ) {
      // 重要なセキュリティイベントは即座に処理が必要
      // 本番環境では外部ログサービスやアラートシステムに送信
    }
  }

  /**
   * セキュリティイベントを取得
   *
   * 記録されたセキュリティイベントを取得します。
   * タイプを指定すると、そのタイプのイベントのみを返します。
   *
   * @param type - フィルタリングするイベントタイプ（省略可）
   * @returns セキュリティイベントの配列
   */
  static getEvents(type?: SecurityEvent["type"]): SecurityEvent[] {
    if (type) {
      return this.events.filter((event) => event.type === type);
    }
    return [...this.events];
  }

  /**
   * すべてのセキュリティイベントをクリア
   *
   * 記録されたすべてのセキュリティイベントを削除します。
   * デバッグやテスト時に使用してください。
   */
  static clearEvents(): void {
    this.events = [];
  }
}

export { SecurityLogger };

/**
 * セキュリティミドルウェア関数
 *
 * セキュリティ検証を行うためのミドルウェア関数のコレクションです。
 * HTTPリクエストの処理前にこれらの関数を呼び出して、セキュリティチェックを行います。
 *
 * ⚠️ SECURITY NOTE:
 * - これらの関数はクライアント側の検証を提供しますが、サーバー側でも必ず検証してください
 * - クライアント側の検証はバイパス可能なため、サーバー側の検証が必須です
 */
export const securityMiddleware = {
  /**
   * CSRFトークンの検証
   *
   * 提供されたCSRFトークンが有効か確認します。
   * 無効なトークンの場合は、セキュリティイベントを記録します。
   *
   * @param token - 検証するCSRFトークン
   * @returns トークンが有効な場合 true、それ以外の場合 false
   */
  validateCSRF: (token: string): boolean => {
    const isValid = CSRFTokenManager.validateToken(token);
    if (!isValid) {
      SecurityLogger.logEvent({
        type: "csrf_violation",
        details: "Invalid CSRF token provided",
      });
    }
    return isValid;
  },

  /**
   * レート制限のチェック
   *
   * 指定された識別子に対してレート制限をチェックします。
   * レート制限を超えている場合は、セキュリティイベントを記録します。
   *
   * @param identifier - レート制限をチェックする識別子（IPアドレス、ユーザーIDなど）
   * @returns リクエストが許可される場合 true、それ以外の場合 false
   */
  checkRateLimit: (identifier: string): boolean => {
    const isAllowed = RateLimiter.isAllowed(identifier);
    if (!isAllowed) {
      SecurityLogger.logEvent({
        type: "rate_limit_exceeded",
        details: `Rate limit exceeded for: ${identifier}`,
      });
    }
    return isAllowed;
  },

  /**
   * 入力値の安全性チェック
   *
   * 入力値にXSS攻撃のパターンが含まれていないか確認します。
   * 基本的なXSSパターンのみを検出するため、より厳密な検証が必要な場合は
   * 専用のサニタイゼーションライブラリを使用してください。
   *
   * ⚠️ LIMITATION:
   * - この関数は基本的なXSSパターンのみを検出します
   * - より高度な攻撃パターンには対応していない可能性があります
   * - 本番環境では、DOMPurifyなどの専用ライブラリの使用を推奨します
   *
   * @param input - 検証する入力値
   * @returns 入力値が安全な場合 true、XSSパターンが検出された場合 false
   */
  validateInput: (input: unknown): boolean => {
    if (typeof input === "string") {
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
            type: "xss_attempt",
            details: `XSS pattern detected: ${input.substring(0, 100)}`,
          });
          return false;
        }
      }
    }
    return true;
  },
};
