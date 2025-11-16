/**
 * 🔐 Zodバリデーションユーティリティ
 * APIリクエスト・レスポンス・フォームの検証に使用
 */

import { z } from "zod";
import {
  UserBaseSchema,
  ShiftBaseSchema,
  EmailMessageSchema,
  NotificationDataSchema,
} from "@/common/common-schemas";

// ==========================================
// 🌐 APIリクエスト/レスポンス検証
// ==========================================

/**
 * APIレスポンスの共通フォーマット
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  timestamp: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Invalid datetime string",
    })
    .optional(),
});

/**
 * Firebase Authレスポンス
 */
export const AuthResponseSchema = z.object({
  user: z.object({
    uid: z.string(),
    email: z
      .string()
      .refine((val) => val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Invalid email format",
      })
      .nullable(),
    displayName: z.string().nullable(),
  }),
  token: z.string(),
});

// ==========================================
// 🎯ランタイムバリデーション関数
// ==========================================

/**
 * ユーザーデータの検証
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
    const errorMessage = result.error.issues
      .map((err: any) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { success: false, error: errorMessage };
  }
}

/**
 * シフトデータの検証
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
 * 通知データの検証
 */
export function validateNotificationData(data: unknown) {
  const result = NotificationDataSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`通知データが無効です: ${result.error.issues[0]?.message}`);
  }
  return result.data;
}

/**
 * メールメッセージの検証
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

// ==========================================
// 🎨 React Hook Form連携
// ==========================================

/**
 * React Hook FormのresolverでZodを使用
 * npm install @hookform/resolvers が必要
 */
export const userFormResolver = {
  // zodResolver(UserWithPasswordSchema) // @hookform/resolversをインストール後に有効化
};

// ==========================================
// 🔧 開発者向けヘルパー
// ==========================================

/**
 * 開発時のデータ検証（デバッグ用）
 */
export function debugValidation<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label: string
) {
  const result = schema.safeParse(data);

  if (result.success) {
    // eslint-disable-next-line no-console
    console.log(`[${label}] Validation passed`);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[${label}] Validation failed:`, result.error.issues);
  }

  return result;
}

// ==========================================
// 🔒 型ガード関数
// ==========================================

export function isValidUser(
  data: unknown
): data is z.infer<typeof UserBaseSchema> {
  return UserBaseSchema.safeParse(data).success;
}

export function isValidShift(
  data: unknown
): data is z.infer<typeof ShiftBaseSchema> {
  return ShiftBaseSchema.safeParse(data).success;
}
