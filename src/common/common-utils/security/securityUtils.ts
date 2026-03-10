/**
 * @file securityUtils.ts
 * @description セキュリティ関連ユーティリティ。
 *              CSRF対策、XSS検出、レート制限、セキュリティヘッダー、セキュリティログ機能を提供する。
 *
 * 【このファイルの位置づけ】
 * - HTTPリクエスト発行時のセキュリティ対策を一元管理
 * - 各サービスアダプタ（Supabase連携）から呼び出される
 * - 関連ファイル: BoundaryConstants.ts（タイムアウト定数）, encryptionUtils.ts（暗号化）
 *
 * 【セキュリティの基本概念】
 * - CSRF (Cross-Site Request Forgery): 別サイトからユーザーのブラウザを騙して
 *   不正リクエストを送る攻撃。CSRFトークンで防御する
 * - XSS (Cross-Site Scripting): 悪意のあるスクリプトをWebページに埋め込む攻撃
 * - レート制限: 短時間に大量のリクエストを送る攻撃（DoS）を防ぐ仕組み
 *
 * ⚠️ セキュリティ注意事項:
 * - このモジュールはクライアント側のセキュリティ対策を実装している
 * - サーバー側でも同様の検証を必ず実装すること
 * - CSRFトークンはセッションストレージに保存される（30分の有効期限）
 * - レート制限はメモリベースのため、サーバー再起動でリセットされる
 */

import { SECURITY_TIMEOUTS } from "@/common/common-constants/BoundaryConstants";

// ============================================================================
// CSRFトークン生成
// ============================================================================

/**
 * generateCSRFToken - CSRF対策用のトークンを生成する
 *
 * 【CSRFトークンとは】
 * サーバーがユーザーのセッションに紐づけた秘密の文字列。
 * フォーム送信やAPIリクエスト時にこのトークンを含めることで、
 * リクエストが本当にこのアプリから送信されたものかを検証できる。
 *
 * 【処理の詳細】
 * ステップ1: 32バイト（256ビット）の配列を作成
 * ステップ2: 暗号学的に安全な乱数で配列を埋める
 * ステップ3: 各バイトを16進数文字列に変換して連結
 *
 * @returns 64文字の16進数文字列（32バイト = 256ビット）
 */
export const generateCSRFToken = (): string => {
  // Uint8Array(32) → 0～255の値を32個格納できる配列を作成
  const array = new Uint8Array(32);

  // crypto.getRandomValues → ブラウザの暗号API。予測不可能な乱数を生成する
  // Math.random()と違い、暗号学的に安全（攻撃者が予測できない）
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // fallback: crypto APIが使えない環境（古いブラウザ等）ではMath.random()で代替
    // ⚠️ Math.random()は暗号学的に安全ではないため、本番環境では避けるべき
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  // Array.from(array, callback) → 各バイトを16進数文字列に変換
  // byte.toString(16) → 10進数を16進数文字列に変換（例: 255 → "ff"）
  // padStart(2, "0") → 1桁の場合は先頭に0を付ける（例: "a" → "0a"）
  // .join("") → 配列の全要素を連結して1つの文字列にする
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

// ============================================================================
// CSRFトークンマネージャー
// ============================================================================

/**
 * CSRFTokenManager - CSRFトークンのライフサイクル管理クラス
 *
 * セッションストレージを使用してCSRFトークンを管理する。
 * トークンは30分間有効で、期限切れの場合は自動更新される。
 *
 * 【セッションストレージとは】
 * ブラウザのタブ/ウィンドウ単位でデータを保存する仕組み。
 * タブを閉じるとデータが消えるため、CSRFトークンの保存に適している。
 *
 * 【static メソッドとは】
 * インスタンス化（new CSRFTokenManager()）せずに CSRFTokenManager.getToken() と
 * クラス名で直接呼び出せるメソッド。シングルトン的な使い方に便利。
 *
 * ⚠️ セキュリティ注意: サーバー側でもトークン検証を必ず実装すること
 */
class CSRFTokenManager {
  /** セッションストレージのキー名（トークン本体） */
  private static readonly TOKEN_KEY = "csrf_token";
  /** セッションストレージのキー名（有効期限） */
  private static readonly TOKEN_EXPIRY_KEY = "csrf_token_expiry";
  /** トークンの有効期限（ミリ秒）。BoundaryConstantsから取得 */
  private static readonly TOKEN_LIFETIME = SECURITY_TIMEOUTS.CSRF_TOKEN_LIFETIME_MS;

  /**
   * getToken - 有効なCSRFトークンを取得する
   *
   * 【処理の流れ】
   * 1. セッションストレージからトークンと有効期限を取得
   * 2. トークンが存在しない、または期限切れの場合は新規生成
   * 3. 有効なトークンを返す
   *
   * @returns CSRFトークン（64文字の16進数文字列）
   */
  static getToken(): string {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);

      // トークンが未保存、有効期限が未設定、または有効期限切れの場合
      // Number.parseInt(expiry, 10) → 文字列を10進数の整数に変換
      if (!token || !expiry || Date.now() > Number.parseInt(expiry, 10)) {
        return this.refreshToken();
      }

      return token;
    } catch {
      // sessionStorageが使用できない場合（プライベートブラウジング等）
      // 新しいトークンを生成して返す（保存はされない）
      return generateCSRFToken();
    }
  }

  /**
   * refreshToken - 新しいCSRFトークンを生成して保存する
   *
   * @returns 新しく生成されたCSRFトークン
   */
  static refreshToken(): string {
    const token = generateCSRFToken();
    // 現在時刻 + 有効期限（ミリ秒）= 有効期限切れのタイムスタンプ
    const expiry = Date.now() + this.TOKEN_LIFETIME;

    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    } catch {
      // sessionStorageエラーは無視（トークンは返す）
      // プライベートブラウジングモード等でストレージが使えない場合に発生
    }

    return token;
  }

  /**
   * validateToken - 提供されたトークンが有効かを検証する
   *
   * 【検証条件】
   * 1. 提供されたトークンが保存されたトークンと一致すること
   * 2. トークンの長さが64文字であること（32バイト = 64文字の16進数）
   *
   * @param token - 検証するトークン
   * @returns トークンが有効なら true
   */
  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    // token.length === 64 → 32バイトの16進数表現は必ず64文字
    return token === storedToken && token.length === 64;
  }

  /**
   * clearToken - セッションストレージからトークンを削除する
   *
   * ログアウト時に呼び出して、古いトークンをクリアする。
   */
  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch {
      // sessionStorageエラーは無視
    }
  }
}

export { CSRFTokenManager };

// ============================================================================
// セキュアHTTPヘッダー
// ============================================================================

/**
 * getSecureHeaders - セキュリティ対策を含むHTTPリクエストヘッダーを生成する
 *
 * 【各ヘッダーの意味】
 * - Content-Type: application/json
 *   → リクエストボディがJSON形式であることを宣言
 *
 * - X-Requested-With: XMLHttpRequest
 *   → CSRF対策。ブラウザの同一オリジンポリシーにより、
 *     別サイトからのリクエストにはこのヘッダーが付かない
 *
 * - X-CSRF-Token
 *   → CSRFトークン。サーバー側でリクエストの正当性を検証するために使用
 *
 * 【本番環境のみのヘッダー】
 * - Strict-Transport-Security (HSTS)
 *   → HTTPS接続を強制する。HTTPでのアクセスをHTTPSにリダイレクトする
 *
 * - X-Content-Type-Options: nosniff
 *   → ブラウザのMIMEタイプ推測を無効化。悪意のあるファイルの実行を防ぐ
 *
 * - X-Frame-Options: DENY
 *   → iframe内での表示を禁止。クリックジャッキング攻撃を防ぐ
 *
 * - X-XSS-Protection: 1; mode=block
 *   → ブラウザのXSSフィルターを有効化。XSS攻撃を検出した場合にページ表示をブロック
 *
 * - Referrer-Policy: strict-origin-when-cross-origin
 *   → 外部サイトへのリクエスト時に、URLの詳細を送信しない（プライバシー保護）
 *
 * @returns セキュリティヘッダーを含むHTTPヘッダーオブジェクト
 */
export const getSecureHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "X-CSRF-Token": CSRFTokenManager.getToken(),
  };

  // __DEV__ → React Nativeのグローバル変数。開発環境でtrue、本番環境でfalse
  // 開発環境ではセキュリティヘッダーを省略（ローカルサーバーでのテストを容易にするため）
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

// ============================================================================
// セキュアFetch
// ============================================================================

/**
 * secureFetch - セキュリティ対策付きのHTTPリクエスト関数
 *
 * 標準のfetch()をラップし、CSRFトークンとセキュリティヘッダーを自動付与する。
 *
 * 【追加されるセキュリティ設定】
 * - credentials: "same-origin"
 *   → 同一オリジン（同じドメイン）のリクエストにのみCookieを送信。CSRF対策
 *
 * - mode: "cors"
 *   → Cross-Origin Resource Sharing。異なるドメインへのリクエストを明示的に許可
 *
 * - cache: "no-cache"
 *   → キャッシュを使わず、常にサーバーに問い合わせる（セキュリティデータの鮮度を保証）
 *
 * 【リクエストボディへのCSRFトークン埋め込み】
 * JSONボディがある場合、_csrfToken プロパティとしてCSRFトークンを自動追加する。
 * サーバー側でヘッダーとボディの両方でCSRFトークンを検証できる（二重防御）。
 *
 * ⚠️ セキュリティ注意: サーバー側でもCSRFトークンの検証を必ず実装すること
 *
 * @param url - リクエスト先のURL
 * @param options - Fetch APIのオプション（method, body, headers等）
 * @returns Fetch APIのResponseオブジェクト
 */
export const secureFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // 既存のオプションにセキュリティ設定をマージ
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...getSecureHeaders(),    // セキュリティヘッダーを追加
      ...options.headers,       // 呼び出し元のヘッダーで上書き可能
    },
    credentials: "same-origin", // 同一オリジンのみCookieを送信
    mode: "cors",               // CORSを明示的に有効化
    cache: "no-cache",          // キャッシュを無効化
  };

  // ボディがJSON文字列の場合、CSRFトークンを埋め込む
  if (options.body && typeof options.body === "string") {
    try {
      // JSON.parse → 文字列をJavaScriptオブジェクトに変換
      const bodyObject = JSON.parse(options.body);
      // _csrfToken プロパティを追加
      bodyObject._csrfToken = CSRFTokenManager.getToken();
      // JSON.stringify → オブジェクトを文字列に変換し直す
      secureOptions.body = JSON.stringify(bodyObject);
    } catch {
      // JSON以外のボディ（FormData等）の場合はそのまま送信
    }
  }

  // 実際のHTTPリクエストを実行
  const response = await fetch(url, secureOptions);

  // 本番環境でレスポンスのセキュリティヘッダーをチェック
  // サーバー側で適切なセキュリティヘッダーが設定されているかの監視
  if (!__DEV__ && !response.headers.get("X-Content-Type-Options")) {
    SecurityLogger.logEvent({
      type: "system_error",
      details: "Response missing security headers",
    });
  }

  return response;
};

// ============================================================================
// Content Security Policy (CSP)
// ============================================================================

/**
 * getCSPHeader - Content Security Policy ヘッダーを生成する
 *
 * 【CSP とは】
 * ブラウザに「このページではどのリソースをどこから読み込んでよいか」を指示する仕組み。
 * XSS攻撃で注入されたスクリプトの実行を防ぐ最も強力な防御手段の一つ。
 *
 * 【各ディレクティブの意味】
 * - default-src 'self'
 *   → デフォルトでは同一オリジンからのリソースのみ許可
 *
 * - script-src 'self' 'unsafe-inline' https://apis.google.com
 *   → スクリプトの読み込み元を制限。Google APIは許可
 *   ⚠️ 'unsafe-inline' はインラインスクリプトを許可（セキュリティリスクあり）
 *
 * - style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
 *   → スタイルシートの読み込み元を制限。Google Fontsは許可
 *
 * - font-src 'self' https://fonts.gstatic.com
 *   → フォントファイルの読み込み元を制限
 *
 * - img-src 'self' data: https: blob:
 *   → 画像の読み込み元を制限。data:URI、HTTPS、Blobを許可
 *
 * - connect-src 'self' https://*.supabase.co
 *   → API接続先を制限。Supabaseへの接続を許可
 *
 * - object-src 'none'
 *   → <object>, <embed>, <applet> タグを完全禁止
 *
 * - base-uri 'self'
 *   → <base> タグのURLを同一オリジンに制限
 *
 * - frame-ancestors 'none'
 *   → このページをiframeに埋め込むことを禁止（クリックジャッキング対策）
 *
 * - upgrade-insecure-requests
 *   → HTTPリクエストを自動的にHTTPSにアップグレード
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

  // 各ディレクティブを "; " で連結して1つのCSPヘッダー文字列にする
  return cspDirectives.join("; ");
};

// ============================================================================
// タイミング攻撃対策
// ============================================================================

/**
 * safeStringCompare - タイミング攻撃を防ぐ安全な文字列比較
 *
 * 【タイミング攻撃とは】
 * 通常の文字列比較（=== など）は、最初に一致しない文字を見つけた時点で処理を中断する。
 * 攻撃者はこの処理時間の差を計測して、正しい文字列を1文字ずつ推測できる。
 *
 * 【この関数の防御方法】
 * すべての文字を比較してから結果を返すため、
 * 一致する文字数に関わらず処理時間が一定になる。
 *
 * 【ビット演算 XOR (^) の使い方】
 * - `codePointA ^ codePointB` → 2つの値が同じなら0、異なるなら非0
 * - `result |= ...` → OR代入。一度でも不一致があるとresultが非0になる
 * - 最後に `result === 0` で全文字一致を判定
 *
 * 【codePointAt とは】
 * 文字のUnicodeコードポイント（数値）を取得する。
 * サロゲートペア（絵文字等の2バイト以上の文字）にも対応。
 *
 * @param a - 比較する最初の文字列
 * @param b - 比較する2番目の文字列
 * @returns 文字列が一致する場合 true
 */
export const safeStringCompare = (a: string, b: string): boolean => {
  // 長さが異なる場合は即座にfalseを返す
  // ⚠️ 長さの差は時間差から判明するが、内容は判明しない
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  // スプレッド構文 [...a] → 文字列を1文字ずつの配列に分解
  // サロゲートペア（絵文字等）を正しく1文字として扱う
  const aArray = [...a];
  const bArray = [...b];

  for (let i = 0; i < aArray.length; i++) {
    const charA = aArray[i];
    const charB = bArray[i];
    if (!charA || !charB) {
      result |= 1; // undefinedの場合は不一致として扱う
      continue;
    }
    // codePointAt(0) → 文字のUnicodeコードポイント（数値）を取得
    const codePointA = charA.codePointAt(0) ?? 0;
    const codePointB = charB.codePointAt(0) ?? 0;
    // XOR: 同じ値なら0、異なる値なら非0
    // OR代入: 一度でも非0になると、resultは非0のまま
    result |= codePointA ^ codePointB;
  }

  // 全文字が一致していればresultは0のまま → true
  return result === 0;
};

// ============================================================================
// IPアドレスサニタイゼーション
// ============================================================================

/**
 * sanitizeIP - IPアドレスの形式を検証しサニタイズする
 *
 * 不正なIPアドレス文字列を安全な値に変換する。
 * SQLインジェクション等の攻撃でIPアドレスフィールドに悪意のある文字列が
 * 入る可能性があるため、サニタイゼーションが必要。
 *
 * 【正規表現の解説】
 * `/^(\d{1,3}\.){3}\d{1,3}$/`
 * - `^` → 文字列の先頭
 * - `(\d{1,3}\.){3}` → 「1-3桁の数字 + ピリオド」を3回繰り返す（例: "192.168.1."）
 * - `\d{1,3}` → 最後の1-3桁の数字（例: "100"）
 * - `$` → 文字列の末尾
 * つまり "数字.数字.数字.数字" の形式にマッチ
 *
 * ⚠️ 制限: IPv4のみ対応。IPv6は未対応
 *
 * @param ip - 検証するIPアドレス文字列
 * @returns サニタイズされたIPアドレス（無効な場合は'0.0.0.0'）
 */
export const sanitizeIP = (ip: string): string => {
  if (!ip || typeof ip !== "string") {
    return "0.0.0.0";
  }

  // IPv4の形式チェック
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    // 各オクテットが0-255の範囲内かチェック
    const parts = ip.split(".");
    const validParts = parts.map((part) => {
      // Number.parseInt(part, 10) → 文字列を10進数の整数に変換
      const num = Number.parseInt(part, 10);
      // 0-255の範囲外なら "0" に置換
      return num >= 0 && num <= 255 ? part : "0";
    });
    return validParts.join(".");
  }

  // IPv4形式でない場合は安全な値を返す
  return "0.0.0.0";
};

// ============================================================================
// レート制限（トークンバケットアルゴリズム）
// ============================================================================

/**
 * RateLimiter - トークンバケットアルゴリズムによるレート制限
 *
 * 【トークンバケットアルゴリズムとは】
 * バケツ（bucket）にトークンが入っていて、リクエストごとにトークンを1つ消費する。
 * トークンがなくなるとリクエストが拒否される。
 * 時間経過でトークンが補充されるため、一定期間後に再びリクエスト可能になる。
 *
 * 【なぜレート制限が必要か】
 * - DoS攻撃（大量リクエストでサーバーをダウンさせる）の防御
 * - ブルートフォース攻撃（パスワード総当たり）の防御
 * - APIの過剰使用の防止
 *
 * 【Map とは】
 * キーと値のペアを管理するJavaScriptの組み込みデータ構造。
 * オブジェクト({})と似ているが、キーに任意の型を使え、順序が保証される。
 *
 * ⚠️ 制限:
 * - メモリベースの実装のため、サーバー再起動でリセットされる
 * - 本番環境ではRedis等の永続化ストレージの使用を推奨
 */
class RateLimiter {
  /** 識別子ごとのバケット情報を管理するMap */
  private static readonly buckets = new Map<
    string,
    { tokens: number; lastRefill: number }
  >();
  /** バケットの最大容量（最大トークン数） */
  private static readonly BUCKET_SIZE = 10;
  /** トークンの補充レート（1秒あたり1トークン） */
  private static readonly REFILL_RATE = 1;

  /**
   * isAllowed - 指定された識別子のリクエストが許可されるかチェックする
   *
   * 【処理の流れ】
   * 1. 識別子に対応するバケットを取得（なければ新規作成）
   * 2. 前回からの経過時間に応じてトークンを補充
   * 3. トークンが1以上あれば消費してtrue、なければfalse
   *
   * @param identifier - レート制限を適用する識別子（IPアドレス、ユーザーID等）
   * @returns リクエストが許可される場合 true
   */
  static isAllowed(identifier: string): boolean {
    const now = Date.now();
    // || → バケットが存在しない場合は新規バケットを作成（フル充填）
    const bucket = this.buckets.get(identifier) || {
      tokens: this.BUCKET_SIZE,
      lastRefill: now,
    };

    // トークンの補充: 経過秒数 × 補充レート分のトークンを追加
    const timePassed = (now - bucket.lastRefill) / 1000; // ミリ秒→秒に変換
    // Math.min → バケットの最大容量を超えないように上限を設定
    bucket.tokens = Math.min(
      this.BUCKET_SIZE,
      bucket.tokens + timePassed * this.REFILL_RATE
    );
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1; // トークンを1つ消費
      this.buckets.set(identifier, bucket);
      return true; // リクエスト許可
    }

    this.buckets.set(identifier, bucket);
    return false; // トークン不足でリクエスト拒否
  }

  /**
   * reset - 指定された識別子のレート制限をリセットする
   *
   * @param identifier - リセットする識別子
   */
  static reset(identifier: string): void {
    this.buckets.delete(identifier);
  }

  /**
   * clearOldBuckets - 古いバケットを削除してメモリを解放する
   *
   * 1時間以上更新されていないバケットを削除する。
   * メモリリーク防止のため、定期的に呼び出すことを推奨。
   */
  static clearOldBuckets(): void {
    const now = Date.now();
    // for...of → MapやSetのイテレーション（反復処理）に使う構文
    // .entries() → [キー, 値] のペアを返すイテレータ
    for (const [id, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > SECURITY_TIMEOUTS.RATE_LIMIT_BUCKET_MAX_AGE_MS) {
        this.buckets.delete(id);
      }
    }
  }
}

export { RateLimiter };

// ============================================================================
// セキュリティイベント型定義
// ============================================================================

/**
 * SecurityEvent - セキュリティイベントのデータ構造
 *
 * セキュリティ関連のイベント（攻撃検知、ログアウト等）を記録するための型。
 *
 * 【TypeScript構文の解説】
 * - ユニオン型（|）: type プロパティが取りうる値の一覧を列挙
 *   "csrf_violation" | "xss_attempt" | ... のいずれかのみ代入可能
 * - `?` (オプショナルプロパティ): 省略可能なプロパティ
 */
export interface SecurityEvent {
  /** イベントの種別 */
  type:
    | "csrf_violation"        // CSRFトークンの不正使用が検出された
    | "xss_attempt"           // XSS攻撃パターンが検出された
    | "rate_limit_exceeded"   // レート制限を超過した
    | "invalid_input"         // 不正な入力値が検出された
    | "unauthorized_access"   // 権限のないアクセスが行われた
    | "user_logout"           // ユーザーがログアウトした
    | "encryption_error"      // 暗号化処理でエラーが発生した
    | "encryption_warning"    // 暗号化処理で警告が発生した
    | "system_event"          // システム一般イベント
    | "system_error";         // システムエラー
  userId?: string;            // 関連するユーザーID（オプション）
  ip?: string;                // 発生元のIPアドレス（オプション）
  userAgent?: string;         // ブラウザのUser-Agent（オプション）
  details?: string;           // イベントの詳細説明（オプション）
  timestamp: Date;            // イベント発生日時
}

// ============================================================================
// セキュリティログ
// ============================================================================

/**
 * SecurityLogger - セキュリティイベントのログ管理クラス
 *
 * セキュリティ関連のイベントをメモリ上に記録・管理する。
 * 最大1000件のイベントを保持し、古いイベントから削除される（FIFO）。
 *
 * 【FIFO とは】
 * First In, First Out（先入れ先出し）。最初に入ったデータが最初に削除される。
 * Array.shift() で先頭要素を削除することで実現。
 *
 * ⚠️ 制限:
 * - メモリベースのため、サーバー再起動でログが失われる
 * - 本番環境では外部ログサービス（CloudWatch、Splunk等）への送信を推奨
 *
 * 【TypeScript構文の解説】
 * - `Omit<SecurityEvent, "timestamp">` → SecurityEvent型からtimestampプロパティを除外した型。
 *   タイムスタンプは自動付与するため、呼び出し元で指定する必要がない
 */
class SecurityLogger {
  /** 記録されたセキュリティイベントの配列 */
  private static events: SecurityEvent[] = [];
  /** イベントの最大保持数 */
  private static readonly MAX_EVENTS = 1000;

  /**
   * logEvent - セキュリティイベントを記録する
   *
   * タイムスタンプは自動的に付与される。
   * 配列が最大数を超えた場合、最も古いイベントが削除される。
   *
   * @param event - 記録するイベント（timestampを除く）
   */
  static logEvent(event: Omit<SecurityEvent, "timestamp">): void {
    const fullEvent: SecurityEvent = {
      ...event,                  // スプレッド構文で全プロパティをコピー
      timestamp: new Date(),     // 現在日時を自動追加
    };

    this.events.push(fullEvent); // 配列の末尾に追加

    // 配列サイズが上限を超えた場合、先頭（最も古い）のイベントを削除
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift(); // shift() → 配列の先頭要素を削除して返す
    }

    // 重要なセキュリティイベント（CSRF違反、XSS試行、不正アクセス）は
    // 本番環境では外部ログサービスやアラートシステムに即座に送信すべき
    if (
      ["csrf_violation", "xss_attempt", "unauthorized_access"].includes(
        event.type
      )
    ) {
      // TODO: 本番環境では外部ログサービスへの送信を実装
    }
  }

  /**
   * getEvents - 記録されたセキュリティイベントを取得する
   *
   * @param type - フィルタリングするイベントタイプ（省略で全件取得）
   * @returns セキュリティイベントの配列
   */
  static getEvents(type?: SecurityEvent["type"]): SecurityEvent[] {
    if (type) {
      // filter() → 条件に合致する要素だけの新しい配列を作る
      return this.events.filter((event) => event.type === type);
    }
    // [...this.events] → スプレッド構文で配列のコピーを返す（元の配列を保護）
    return [...this.events];
  }

  /**
   * clearEvents - すべてのセキュリティイベントを削除する
   *
   * デバッグやテスト時に使用する。
   */
  static clearEvents(): void {
    this.events = [];
  }
}

export { SecurityLogger };

// ============================================================================
// セキュリティミドルウェア
// ============================================================================

/**
 * securityMiddleware - セキュリティ検証を行うミドルウェア関数のコレクション
 *
 * HTTPリクエストの処理前にこれらの関数を呼び出して、セキュリティチェックを行う。
 *
 * 【ミドルウェアとは】
 * リクエスト処理の「間」に挟む処理のこと。
 * メインの処理（データ取得、画面表示等）の前に、セキュリティチェックを行う。
 *
 * ⚠️ クライアント側の検証はバイパス可能なため、サーバー側の検証が必須
 */
export const securityMiddleware = {
  /**
   * validateCSRF - CSRFトークンの有効性を検証する
   *
   * 無効なトークンの場合はセキュリティイベントを記録する。
   *
   * @param token - 検証するCSRFトークン
   * @returns トークンが有効な場合 true
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
   * checkRateLimit - レート制限のチェック
   *
   * レート制限を超えている場合はセキュリティイベントを記録する。
   *
   * @param identifier - レート制限をチェックする識別子
   * @returns リクエストが許可される場合 true
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
   * validateInput - 入力値のXSSパターン検出
   *
   * 入力値に危険なHTMLやJavaScriptパターンが含まれていないかチェックする。
   *
   * 【検出する攻撃パターン】
   * - <script>タグ: JavaScriptの直接埋め込み
   * - javascript: プロトコル: URLにスクリプトを埋め込む手法
   * - onXXX= イベントハンドラ: HTML属性経由のスクリプト実行
   * - <iframe>タグ: 外部ページの埋め込み（クリックジャッキング）
   *
   * 【正規表現の解説】
   * - `/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi`
   *   → <script>タグとその中身にマッチ
   *   - `\b` → 単語境界（"scriptx" にはマッチしない）
   *   - `[^<]*` → < 以外の任意の文字の繰り返し
   *   - `(?:...)` → キャプチャしないグループ
   *   - `(?!<\/script>)` → </script> でないことを先読み確認
   *   - `gi` → g=全体検索, i=大文字小文字を区別しない
   *
   * - `/on\w+\s*=/gi`
   *   → onXXX= 形式のイベントハンドラにマッチ
   *   - `\w+` → 1文字以上の英数字・アンダースコア
   *   - `\s*` → 0個以上の空白文字
   *   例: onclick=, onmouseover=, onload= 等
   *
   * ⚠️ 基本的なパターンのみ検出。高度な攻撃にはDOMPurify等の専用ライブラリを推奨
   *
   * @param input - 検証する入力値
   * @returns 安全な場合 true、XSSパターン検出時 false
   */
  validateInput: (input: unknown): boolean => {
    if (typeof input === "string") {
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
            // substring(0, 100) → 先頭100文字だけ記録（ログが巨大になるのを防ぐ）
            details: `XSS pattern detected: ${input.substring(0, 100)}`,
          });
          return false;
        }
      }
    }
    return true;
  },
};
