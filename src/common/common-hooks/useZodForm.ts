/**
 * @file useZodForm.ts
 * @description Zodスキーマによるフォームバリデーションフック群
 */
// ============================================================================
// 【なぜ Zod + カスタムフックの組み合わせなのか — フォーム管理の歴史】
// ============================================================================
// フォーム（入力画面）はWebアプリで最も複雑な部分の一つ。
// 「入力値の保持」「バリデーション」「エラー表示」「送信処理」を
// 全て手動で管理すると、すぐにコードが膨れ上がる。
//
// ■ フォーム管理の変遷:
//   1. 手動 state 管理（React 初期）:
//      各入力フィールドに useState を用意。フィールドが10個あれば useState も10個。
//      バリデーションも全て自分で if 文を書く → コードが膨大に
//
//   2. Formik（2017年〜）:
//      React のフォーム管理を簡素化した最初の人気ライブラリ。
//      しかし再レンダリングが多く、大きなフォームでパフォーマンスが劣化
//
//   3. React Hook Form（RHF, 2019年〜）:
//      非制御コンポーネント（Uncontrolled Components）を活用し、
//      再レンダリングを最小限に抑える設計。パフォーマンス重視
//
//   4. Zod（2020年〜）:
//      TypeScript-first のバリデーションライブラリ。
//      「型定義」と「バリデーションルール」を1つのスキーマで記述できる。
//      z.infer<typeof schema> で型を自動生成 → 型の二重定義が不要
//
// ■ なぜこのプロジェクトでは Zod + カスタムフックの構成なのか:
//   - Zod がバリデーションルールを宣言的に定義（「何を検証するか」を記述）
//   - useZodForm フックがフォームの状態管理を担当（値の保持、エラー管理、送信）
//   - この分離により、バリデーションルールの再利用やテストが容易
//   - z.infer<T> で型を自動推論 → フォームデータの型を手動で書く必要がない
//
// ■ ケースバイケース:
//   - シンプルなフォーム（入力1〜2個）→ useState で十分。ライブラリは不要
//   - 中規模フォーム（入力3〜10個）→ Zod + カスタムフック（このファイルの方式）
//   - 大規模・高頻度更新フォーム → React Hook Form + Zod（@hookform/resolvers）
//     が最適。非制御コンポーネントで再レンダリングを抑制
// ============================================================================

import { useState } from "react";
import { z } from "zod";
import { timeStringToMinutes } from "@/common/common-utils/util-shift/wageCalculator";

// --- 基本的なフォームフック ---

/** Zodスキーマを受け取り、バリデーション付きフォーム操作を返す汎用フック */
export function useZodForm<T extends z.ZodSchema>(schema: T) {
  type FormData = z.infer<T>;

  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data: unknown): data is FormData => {
    const result = schema.safeParse(data);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      for (const error of result.error.issues) {
        const path = error.path.join(".");
        newErrors[path] = error.message;
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (
    onSubmit: (data: FormData) => Promise<void> | void
  ) => {
    setIsSubmitting(true);

    try {
      if (validate(formData)) {
        await onSubmit(formData);
      }
    } catch (error) {
      setErrors({
        _submit: error instanceof Error ? error.message : "Submission failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // リアルタイムバリデーション（オプション）
    if (errors[field as string]) {
      const testData = { ...formData, [field]: value };
      const result = schema.safeParse(testData);

      if (
        result.success ||
        !result.error.issues.some((e: any) => e.path.includes(field as string))
      ) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    }
  };

  const reset = () => {
    setFormData({});
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    validate,
    handleSubmit,
    updateField,
    reset,
    hasErrors: Object.keys(errors).length > 0,
  };
}

// --- 特定用途のフォームフック ---

/** ユーザー作成フォーム専用フック */
export function useUserForm() {
  const UserFormSchema = z.object({
    nickname: z.string().min(1, "ニックネームは必須です"),
    email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "有効なメールアドレスを入力してください",
    }),
    password: z.string().min(6, "パスワードは6文字以上です"),
    role: z.enum(["master", "user"], {
      message: "ロールを選択してください",
    }),
    color: z.string().optional(),
    hourlyWage: z.number().positive("時給は正の数値です").optional(),
  });

  return useZodForm(UserFormSchema);
}

/** シフト作成フォーム専用フック */
export function useShiftForm() {
  const ShiftFormSchema = z
    .object({
      shiftDate: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "日付を選択してください",
      }),
      startTime: z.string().refine((val) => /^\d{2}:\d{2}$/.test(val), {
        message: "開始時刻を入力してください",
      }),
      endTime: z.string().refine((val) => /^\d{2}:\d{2}$/.test(val), {
        message: "終了時刻を入力してください",
      }),
      memo: z.string().max(500, "メモは500文字以内です").optional(),
    })
    .refine(
      (data) => {
        // 開始時刻 < 終了時刻 のバリデーション
        return timeStringToMinutes(data.startTime) < timeStringToMinutes(data.endTime);
      },
      {
        message: "終了時刻は開始時刻より後である必要があります",
        path: ["endTime"],
      }
    );

  return useZodForm(ShiftFormSchema);
}

// --- 使用例 ---

/*
// コンポーネント内での使用例:

export function UserCreateForm() {
  const { formData, errors, handleSubmit, updateField, hasErrors } = useUserForm();
  
  const onSubmit = async (data: UserFormData) => {
    // APIコール
    await createUser(data);
  };
  
  return (
    <View>
      <TextInput
        value={formData.nickname || ''}
        onChangeText={(text) => updateField('nickname', text)}
        placeholder="ニックネーム"
      />
      {errors.nickname && <Text style={{color: 'red'}}>{errors.nickname}</Text>}
      
      <Button 
        title="作成" 
        onPress={() => handleSubmit(onSubmit)}
        disabled={hasErrors}
      />
    </View>
  );
}
*/
