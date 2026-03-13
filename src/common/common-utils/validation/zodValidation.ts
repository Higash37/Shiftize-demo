/**
 * @file zodValidation.ts
 * @description Zodスキーマベースのバリデーションユーティリティ。
 *              APIリクエスト/レスポンスの検証、ランタイム型チェック、型ガード関数を提供する。
 *
 * 【このファイルの位置づけ】
 * - common-schemas/ で定義されたZodスキーマを使ってランタイムバリデーションを行う
 * - APIレスポンスの検証、フォームデータの検証に使用される
 * - 関連ファイル: common-schemas/index.ts（Zodスキーマ定義）
 *
 * 【Zod とは】
 * TypeScriptファーストのスキーマ宣言・バリデーションライブラリ。
 * 以下の特徴を持つ:
 * - スキーマ定義から自動的にTypeScriptの型を生成できる
 * - ランタイム（実行時）のデータ検証が可能
 * - safeParse() で例外を投げずにバリデーション結果を取得可能
 *
 * 【なぜZodが必要か】
 * TypeScriptの型チェックはコンパイル時のみ。APIレスポンスやユーザー入力など、
 * 実行時に入ってくるデータの型はTypeScriptでは保証できない。
 * Zodを使えば、実行時にもデータの構造と型を検証できる。
 */

import { z } from "zod";
import {
  UserBaseSchema,
  ShiftBaseSchema,
  EmailMessageSchema,
  NotificationDataSchema,
} from "@/common/common-schemas";

// ============================================================================
// APIリクエスト/レスポンス検証スキーマ
// ============================================================================

/**
 * ApiResponseSchema - APIレスポンスの共通フォーマットを定義するZodスキーマ
 *
 * 全てのAPIレスポンスが準拠すべき共通構造。
 *
 * 【Zodメソッドの解説】
 * - z.object({}) → オブジェクト型のスキーマを定義
 * - z.boolean() → boolean型
 * - z.unknown() → any型に近いが、使用前に型チェックが必要
 * - .optional() → このフィールドは省略可能
 * - .refine(callback, options) → カスタムバリデーション。callbackがtrueを返す必要あり
 *
 * 【refine の使い方】
 * .refine((val) => !Number.isNaN(Date.parse(val)), { message: "..." })
 * → val を Date.parse() で変換し、NaN でないことを確認
 * → ISO日付文字列として有効かどうかのカスタム検証
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),               // 成功/失敗フラグ
  data: z.unknown().optional(),       // レスポンスデータ（型は状況により異なる）
  error: z.string().optional(),       // エラーメッセージ
  timestamp: z                         // レスポンス日時（ISO 8601形式の文字列）
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Invalid datetime string",
    })
    .optional(),
});

/**
 * AuthResponseSchema - Supabase認証レスポンスのZodスキーマ
 *
 * 【.nullable() の解説】
 * null値を許容する。email や displayName は未設定の場合 null になる。
 * optional() → フィールド自体がない（undefined）を許容
 * nullable() → フィールドはあるが値がnullを許容
 *
 * 【カスタムメール検証の解説】
 * .refine((val) => val === null || /正規表現/.test(val))
 * → null は許容するが、文字列の場合はメール形式チェック
 */
export const AuthResponseSchema = z.object({
  user: z.object({
    uid: z.string(),
    email: z
      .string()
      .refine(
        (val) =>
          val === null ||
          // セキュリティ修正: メール正規表現を強化
          // - TLD 2文字以上必須（.c のような不正TLDを拒否）
          // - 連続ドット禁止（user..name@example.com を拒否）
          // - ローカルパートとドメインの先頭・末尾のドットを禁止
          /^[^\s@.][^\s@]*[^\s@.]@[^\s@.][^\s@]*(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(val),
        {
          message: "Invalid email format",
        }
      )
      .nullable(),              // null を許容（メール未設定の場合）
    displayName: z.string().nullable(), // null を許容
  }),
  token: z.string(),
});

// ============================================================================
// ランタイムバリデーション関数
// ============================================================================

/**
 * validateUser - ユーザーデータのランタイムバリデーション
 *
 * 【safeParse vs parse の違い】
 * - safeParse(): 失敗時にエラーを投げず、{ success, data/error } オブジェクトを返す
 * - parse(): 失敗時に ZodError を投げる
 * ユーザー入力の検証では safeParse() が安全。
 *
 * 【result.error.issues の構造】
 * バリデーションエラーの詳細配列。各要素は:
 * - path: エラーが発生したプロパティのパス（例: ["email"]）
 * - message: エラーメッセージ（例: "Invalid email"）
 * .map() で "path: message" 形式に変換し、.join(", ") で連結する。
 *
 * @param data - 検証するデータ（型不明な外部データ）
 * @returns { success: boolean, data?: 検証済みデータ, error?: エラーメッセージ }
 */
export function validateUser(data: unknown): {
  success: boolean;
  data?: any;
  error?: string;
} {
  const result = UserBaseSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // エラーの各issueを "path: message" 形式にして連結
    const errorMessage = result.error.issues
      .map((err: any) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { success: false, error: errorMessage };
  }
}

/**
 * validateShift - シフトデータのランタイムバリデーション
 *
 * @param data - 検証するデータ
 * @returns { success, data?, error? }
 */
export function validateShift(data: unknown): {
  success: boolean;
  data?: any;
  error?: string;
} {
  const result = ShiftBaseSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errorMessage = result.error.issues
      .map((err: any) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { success: false, error: errorMessage };
  }
}

/**
 * validateNotificationData - 通知データのバリデーション
 *
 * safeParse() を使い、失敗時はErrorをthrowする。
 *
 * 【?. (オプショナルチェーニング) の解説】
 * result.error.issues[0]?.message
 * → issues[0] が存在しない場合（配列が空の場合）でも安全にアクセス。
 *   存在しなければ undefined を返す
 *
 * @param data - 検証するデータ
 * @returns 検証済みの通知データ
 * @throws Error バリデーション失敗時
 */
export function validateNotificationData(data: unknown) {
  const result = NotificationDataSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`通知データが無効です: ${result.error.issues[0]?.message}`);
  }
  return result.data;
}

/**
 * validateEmailMessage - メールメッセージのバリデーション
 *
 * @param data - 検証するデータ
 * @returns 検証済みのメールメッセージデータ
 * @throws Error バリデーション失敗時
 */
export function validateEmailMessage(data: unknown) {
  const result = EmailMessageSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `メールデータが無効です: ${result.error.issues[0]?.message}`
    );
  }
  return result.data;
}

// ============================================================================
// React Hook Form 連携
// ============================================================================

/**
 * userFormResolver - React Hook FormでZodスキーマを使うためのリゾルバー
 *
 * @hookform/resolvers パッケージをインストールすると有効化可能。
 * zodResolver(UserWithPasswordSchema) を設定すると、
 * フォーム送信時に自動的にZodスキーマで検証される。
 *
 * 【使い方の例（有効化後）】
 * ```typescript
 * import { zodResolver } from "@hookform/resolvers/zod";
 * const { register, handleSubmit } = useForm({
 *   resolver: zodResolver(UserWithPasswordSchema),
 * });
 * ```
 */
export const userFormResolver = {
  // zodResolver(UserWithPasswordSchema) // @hookform/resolversをインストール後に有効化
};

// ============================================================================
// 開発者向けヘルパー
// ============================================================================

/**
 * debugValidation - 開発時のデータ検証デバッグ関数
 *
 * バリデーション結果をコンソールに出力する。本番環境では使用しない。
 *
 * 【ジェネリクス <T> の解説】
 * - `<T>` → 型パラメータ。呼び出し時に具体的な型が決まる
 * - `z.ZodSchema<T>` → T型のデータを検証するZodスキーマ
 * これにより、任意のZodスキーマとデータのペアでこの関数を使える。
 *
 * @param schema - 検証に使用するZodスキーマ
 * @param data - 検証するデータ
 * @param label - ログ出力時のラベル（識別用）
 * @returns safeParse の結果オブジェクト
 */
export function debugValidation<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label: string
) {
  const result = schema.safeParse(data);

  // バリデーション結果はresultオブジェクトで返す（ログ出力なし）

  return result;
}

// ============================================================================
// 型ガード関数
// ============================================================================

/**
 * isValidUser - ユーザーデータの型ガード関数
 *
 * 【型ガード関数とは】
 * 戻り値が `data is 型` の形式で、if文で使うとTypeScriptが自動的に型を絞り込む。
 *
 * 【z.infer<typeof Schema> の解説】
 * Zodスキーマから TypeScript の型を自動推論する。
 * z.infer<typeof UserBaseSchema> → UserBaseSchema で定義した構造の TypeScript 型が生成される。
 *
 * @param data - チェックするデータ
 * @returns データがUserBaseSchemaに準拠している場合 true
 */
export function isValidUser(
  data: unknown
): data is z.infer<typeof UserBaseSchema> {
  return UserBaseSchema.safeParse(data).success;
}

/**
 * isValidShift - シフトデータの型ガード関数
 *
 * @param data - チェックするデータ
 * @returns データがShiftBaseSchemaに準拠している場合 true
 */
export function isValidShift(
  data: unknown
): data is z.infer<typeof ShiftBaseSchema> {
  return ShiftBaseSchema.safeParse(data).success;
}
