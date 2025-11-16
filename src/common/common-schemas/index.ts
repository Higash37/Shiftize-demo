/**
 * 🔐 Zodスキーマ定義
 * 型安全性とランタイムバリデーションを提供
 */

import { z } from "zod";

// ==========================================
// 🧑‍💼 ユーザー関連スキーマ
// ==========================================

export const UserRoleSchema = z.enum(["master", "user"]);

export const UserBaseSchema = z.object({
  uid: z.string().min(1, "UIDは必須です"),
  nickname: z
    .string()
    .min(1, "ニックネームは必須です")
    .max(50, "ニックネームは50文字以内です"),
  email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: "有効なメールアドレスを入力してください",
  }),
  role: UserRoleSchema,
  storeId: z.string().min(1, "店舗IDは必須です"),
  color: z.string().optional(),
  hourlyWage: z
    .number()
    .positive("時給は正の数値である必要があります")
    .optional(),
  deleted: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const UserWithPasswordSchema = UserBaseSchema.extend({
  password: z.string().min(6, "パスワードは6文字以上です").optional(),
  currentPassword: z.string().optional(),
});

// ==========================================
// 📅 シフト関連スキーマ
// ==========================================

export const ShiftStatusSchema = z.enum(["applied", "confirmed", "cancelled"]);

export const ShiftBaseSchema = z.object({
  id: z.string().min(1, "シフトIDは必須です"),
  userId: z.string().min(1, "ユーザーIDは必須です"),
  storeId: z.string().min(1, "店舗IDは必須です"),
  shiftDate: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "日付形式はYYYY-MM-DDです",
  }),
  startTime: z.string().refine((val) => /^\d{2}:\d{2}$/.test(val), {
    message: "時刻形式はHH:MMです",
  }),
  endTime: z.string().refine((val) => /^\d{2}:\d{2}$/.test(val), {
    message: "時刻形式はHH:MMです",
  }),
  status: ShiftStatusSchema.default("confirmed"),
  memo: z.string().max(500, "メモは500文字以内です").optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ==========================================
// 🏪 店舗関連スキーマ
// ==========================================

export const StoreConfigSchema = z.object({
  name: z
    .string()
    .min(1, "店舗名は必須です")
    .max(100, "店舗名は100文字以内です"),
  timezone: z.string().default("Asia/Tokyo"),
  businessHours: z.object({
    start: z.string().refine((val) => /^\d{2}:\d{2}$/.test(val), {
      message: "時刻形式はHH:MMです",
    }),
    end: z.string().refine((val) => /^\d{2}:\d{2}$/.test(val), {
      message: "時刻形式はHH:MMです",
    }),
  }),
  holidays: z.array(z.string()).default([]),
});

// ==========================================
// 📧 通知関連スキーマ
// ==========================================

export const NotificationDataSchema = z.object({
  shiftDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  userNickname: z.string(),
  masterNickname: z.string(),
  reason: z.string(),
});

export const EmailMessageSchema = z.object({
  to: z.array(
    z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "有効なメールアドレスを入力してください",
    })
  ),
  subject: z.string().min(1, "件名は必須です"),
  html: z.string().min(1, "HTMLコンテンツは必須です"),
  text: z.string(),
});

// ==========================================
// 🔍 型推論の実行
// ==========================================

export type User = z.infer<typeof UserBaseSchema>;
export type UserWithPassword = z.infer<typeof UserWithPasswordSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type Shift = z.infer<typeof ShiftBaseSchema>;
export type ShiftStatus = z.infer<typeof ShiftStatusSchema>;
export type StoreConfig = z.infer<typeof StoreConfigSchema>;
export type NotificationData = z.infer<typeof NotificationDataSchema>;
export type EmailMessage = z.infer<typeof EmailMessageSchema>;

// ==========================================
// 🛠️ ヘルパー関数
// ==========================================

/**
 * 安全な解析（パースエラーを返す）
 */
export function safeParseUser(data: unknown) {
  return UserBaseSchema.safeParse(data);
}

export function safeParseShift(data: unknown) {
  return ShiftBaseSchema.safeParse(data);
}

/**
 * 部分的な更新用スキーマ
 */
export const UserUpdateSchema = UserBaseSchema.partial();
export const ShiftUpdateSchema = ShiftBaseSchema.partial();

export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type ShiftUpdate = z.infer<typeof ShiftUpdateSchema>;
