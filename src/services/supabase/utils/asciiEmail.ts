/**
 * 日本語を含むメールアドレスをASCII互換に変換
 * Supabase Authは非ASCIIメールを受け付けないため
 *
 * エンコード方式: 非ASCII文字を "u" + Unicode code point (4桁hex) に変換
 * 例: "1456教室長@example.com" → "1456u6559u5ba4u9577@example.com"
 *
 * 衝突リスク分析:
 * - メール形式は "{storeId}{nickname}@example.com" で固定
 * - storeIdは数字、nicknameは日本語が主なため "u" + 4桁hex パターンとの
 *   自然衝突リスクは極めて低い
 * - ドメインは常に "example.com" (ASCII) のため変換不要
 */
export function toAsciiEmail(originalEmail: string): string {
  const atIndex = originalEmail.indexOf('@');
  if (atIndex === -1) return originalEmail;

  const localPart = originalEmail.substring(0, atIndex);
  const domain = originalEmail.substring(atIndex + 1);

  // ローカルパートをASCII化
  const asciiLocal = encodeLocalPart(localPart);

  // ドメインも非ASCIIの場合はASCII化（通常は example.com なので不要）
  const asciiDomain = /^[\x20-\x7E]+$/.test(domain) ? domain : encodeLocalPart(domain);

  return `${asciiLocal}@${asciiDomain}`;
}

/**
 * 非ASCII文字をUnicode code point hex表現に変換
 */
function encodeLocalPart(input: string): string {
  // ASCII文字のみの場合はそのまま返す
  if (/^[\x00-\x7F]+$/.test(input)) {
    return input;
  }

  let result = '';
  for (const char of input) {
    if (/^[\x00-\x7F]$/.test(char)) {
      result += char;
    } else {
      result += 'u' + char.charCodeAt(0).toString(16).padStart(4, '0');
    }
  }

  return result;
}
