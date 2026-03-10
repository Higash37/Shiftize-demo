/**
 * @file asciiEmail.ts
 * @description 日本語を含むメールアドレスをASCII互換に変換するユーティリティ。
 *
 * 【このファイルの位置づけ】
 * Supabase Authはメールアドレスに非ASCII文字（日本語等）を受け付けない。
 * しかしこのアプリでは「店舗ID + ニックネーム + @example.com」形式のダミーメールを
 * ユーザー認証に使用しており、ニックネームに日本語が含まれる。
 *
 * そのため、日本語部分をUnicodeコードポイントのHEX表現に変換する。
 *   例: "1456教室長@example.com" → "1456u6559u5ba4u9577@example.com"
 *
 *   LoginForm → AuthContext.signIn()
 *                    ↓ toAsciiEmail() で変換
 *              supabase.auth.signInWithPassword({ email: "1456u6559..." })
 *
 * 【エンコード方式】
 * 非ASCII文字を "u" + Unicode code point（4桁以上のHEX）に変換する。
 *   "教" → コードポイント 0x6559 → "u6559"
 *   "室" → コードポイント 0x5BA4 → "u5ba4"
 *
 * 【衝突リスク分析】
 * メール形式は "{storeId}{nickname}@example.com" で固定:
 * - storeIdは数字のみ
 * - nicknameは日本語が主
 * → "u" + 4桁hex のパターンが自然発生するリスクは極めて低い
 */

/**
 * toAsciiEmail: メールアドレス全体をASCII互換に変換する。
 *
 * 処理の流れ:
 * 1. "@" でローカルパート（@の左）とドメイン（@の右）を分離
 * 2. ローカルパートの非ASCII文字をエンコード
 * 3. ドメインも非ASCIIの場合はエンコード（通常は example.com なので不要）
 * 4. 再結合して返す
 *
 * @param originalEmail - 変換前のメールアドレス（日本語を含む可能性がある）
 * @returns ASCII文字のみで構成されたメールアドレス
 */
export function toAsciiEmail(originalEmail: string): string {
  // "@" の位置を検索。indexOf は見つからなければ -1 を返す
  const atIndex = originalEmail.indexOf('@');
  // "@" がなければメールアドレスではないのでそのまま返す
  if (atIndex === -1) return originalEmail;

  // substring(start, end): 文字列の一部を切り出す
  const localPart = originalEmail.substring(0, atIndex);     // "@" の左側
  const domain = originalEmail.substring(atIndex + 1);       // "@" の右側

  // ローカルパートをASCII化
  const asciiLocal = encodeLocalPart(localPart);

  // ドメインが全てASCIIなら変換不要、非ASCIIを含む場合はエンコード
  // 正規表現 /^[\x20-\x7e]+$/ は「印刷可能ASCII文字のみ」にマッチ
  // \x20: 空白(スペース), \x7e: ~(チルダ) → この範囲が印刷可能ASCII
  const asciiDomain = /^[\x20-\x7e]+$/.test(domain) ? domain : encodeLocalPart(domain);

  // テンプレートリテラル `${a}@${b}` で再結合
  return `${asciiLocal}@${asciiDomain}`;
}

/**
 * encodeLocalPart: 文字列中の非ASCII文字をUnicodeコードポイントのHEX表現に変換する。
 *
 * 変換例:
 *   "1456教室長" → "1456u6559u5ba4u9577"
 *   "hello"     → "hello"（ASCII文字のみなのでそのまま）
 *
 * 【codePointAt と charCodeAt の違い】
 * - charCodeAt: UTF-16のコード単位を返す。サロゲートペア（BMP外文字）は2つに分かれる
 * - codePointAt: Unicodeコードポイントを正しく返す。絵文字等も1つの数値で表現
 * → ここでは codePointAt を使って正確な変換を行う
 *
 * @param input - 変換対象の文字列
 * @returns ASCII文字のみで構成された文字列
 */
function encodeLocalPart(input: string): string {
  // まず全文字が印刷可能ASCIIかチェック。そうならそのまま返す（最適化）
  if (/^[\x20-\x7E]+$/.test(input)) {
    return input;
  }

  let result = '';
  // for...of ループ: 文字列をUnicode文字単位でイテレート
  // サロゲートペア（絵文字等）も1文字として正しく処理される
  for (const char of input) {
    if (/^[\x20-\x7E]$/.test(char)) {
      // ASCII文字はそのまま追加
      result += char;
    } else {
      // 非ASCII文字: コードポイントを取得してHEX文字列に変換
      // codePointAt(0): 文字の最初の位置のコードポイントを返す
      // || 0: codePointAtがundefinedを返す場合のフォールバック
      const cp = char.codePointAt(0) || 0;
      // toString(16): 10進数を16進数文字列に変換
      // padStart(4, '0'): 4桁未満の場合は先頭を0で埋める
      // 例: 0x41 → "0041"、0x6559 → "6559"
      result += 'u' + cp.toString(16).padStart(4, '0');
    }
  }

  return result;
}
