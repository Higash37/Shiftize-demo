/**
 * 日本語を含むメールアドレスをASCII互換に変換
 * Supabase Authは非ASCIIメールを受け付けないため
 *
 * 例: "1456教室長@example.com" → "1456u6559u5ba4u9577@example.com"
 */
export function toAsciiEmail(originalEmail: string): string {
  const atIndex = originalEmail.indexOf('@');
  if (atIndex === -1) return originalEmail;

  const localPart = originalEmail.substring(0, atIndex);
  const domain = originalEmail.substring(atIndex + 1);

  // ASCII文字のみの場合はそのまま返す
  if (/^[\x00-\x7F]+$/.test(localPart)) {
    return originalEmail;
  }

  // 非ASCII文字をユニコードエスケープに変換
  let asciiLocal = '';
  for (const char of localPart) {
    if (/^[\x00-\x7F]$/.test(char)) {
      asciiLocal += char;
    } else {
      asciiLocal += 'u' + char.charCodeAt(0).toString(16).padStart(4, '0');
    }
  }

  return `${asciiLocal}@${domain}`;
}
