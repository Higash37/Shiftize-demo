/**
 * @file index.ts
 * @description Zodスキーマ定義。型安全性とランタイムバリデーションを提供する
 *
 * ============================================================
 * 【なぜ "Schema" を使うのか — バリデーションスキーマの概念】
 * ============================================================
 *
 * ■ Schema とは
 *   データの「設計図」。
 *   型チェック（コンパイル時）とバリデーション（実行時）の両方を1箇所で定義する。
 *   例: UserBaseSchema は「uid は必須の文字列で、nickname は50文字以内」
 *   というルールをコードとして書いている。
 *
 * ■ なぜ TypeScript の型だけでは不十分なのか
 *   TypeScript の型（type, interface）はコンパイル時にしか存在しない。
 *   ビルドすると JavaScript に変換され、型情報は完全に消える。
 *   つまり、実行時（ユーザーがフォームに入力したとき、APIからデータが来たとき）には
 *   型チェックが一切行われない。
 *   → 実行時のバリデーションには Zod などのライブラリが必要。
 *
 * ■ Zod の z.infer の仕組み
 *   下記の `z.infer<typeof UserBaseSchema>` は、
 *   Zod スキーマから TypeScript の型を自動生成する機能。
 *   スキーマと型を二重に書く必要がなくなる（Single Source of Truth）。
 *
 * ■ ケースバイケース（Schema が必要 / 不要な場面）
 *   ✅ Schema 必須: ユーザー入力（フォーム）、外部 API からのレスポンス
 *     → 何が来るか分からないので、実行時にチェックしないと危険
 *   ❌ 型定義だけでOK: 内部で生成するデータ、コンポーネント間の Props
 *     → 自分のコードが作るデータなので、コンパイル時の型チェックで十分
 * ============================================================
 */

import { z } from "zod";

// --- ユーザー関連スキーマ ---

/** ユーザーロールのスキーマ */
export const UserRoleSchema = z.enum(["master", "user"]);

/** ユーザー基本情報のスキーマ */
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

/** パスワード付きユーザースキーマ */
export const UserWithPasswordSchema = UserBaseSchema.extend({
  password: z.string().min(6, "パスワードは6文字以上です").optional(),
  currentPassword: z.string().optional(),
});

// --- シフト関連スキーマ ---

/** シフトステータスのスキーマ */
export const ShiftStatusSchema = z.enum(["applied", "confirmed", "cancelled"]);

/** シフト基本情報のスキーマ */
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

// --- 店舗関連スキーマ ---

/** 店舗設定のスキーマ */
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

// --- 通知関連スキーマ ---

/** 通知データのスキーマ */
export const NotificationDataSchema = z.object({
  shiftDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  userNickname: z.string(),
  masterNickname: z.string(),
  reason: z.string(),
});

/** メールメッセージのスキーマ */
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

// --- 型推論 ---

export type User = z.infer<typeof UserBaseSchema>;
export type UserWithPassword = z.infer<typeof UserWithPasswordSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type Shift = z.infer<typeof ShiftBaseSchema>;
export type ShiftStatus = z.infer<typeof ShiftStatusSchema>;
export type StoreConfig = z.infer<typeof StoreConfigSchema>;
export type NotificationData = z.infer<typeof NotificationDataSchema>;
export type EmailMessage = z.infer<typeof EmailMessageSchema>;

// --- ヘルパー関数 ---

/** ユーザーデータを安全にパースする（エラーを投げずにResultを返す） */
export function safeParseUser(data: unknown) {
  return UserBaseSchema.safeParse(data);
}

/** シフトデータを安全にパースする */
export function safeParseShift(data: unknown) {
  return ShiftBaseSchema.safeParse(data);
}

/** ユーザー部分更新用スキーマ（全フィールドoptional） */
export const UserUpdateSchema = UserBaseSchema.partial();
/** シフト部分更新用スキーマ（全フィールドoptional） */
export const ShiftUpdateSchema = ShiftBaseSchema.partial();

export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type ShiftUpdate = z.infer<typeof ShiftUpdateSchema>;
