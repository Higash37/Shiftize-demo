/**
 * @file shiftHistoryLogger.ts
 * @description シフト変更の履歴（監査ログ）をSupabaseに記録するモジュール。
 *
 * 【このファイルの位置づけ】
 * シフトの追加・変更・削除時にこのモジュールの関数を呼ぶことで、
 * 「いつ・誰が・何を・どう変更したか」の記録をDBに保存する。
 * これは監査（audit）目的で、問題が起きた時の調査やGDPR準拠に使用する。
 *
 *   シフト操作（マスターまたは講師が実行）
 *        ↓ logShiftChange() を呼ぶ
 *   shiftHistoryLogger（★このファイル）
 *        ↓ 変更前後の差分を整理 + 要約文を生成
 *   Supabase DB（shift_change_logs テーブルに保存）
 *
 * 【エクスポートされる主要な関数】
 * - logShiftChange: 汎用の変更ログ記録
 * - logBatchApprove: 一括承認のログ記録
 * - determineActionType: 変更前後のシフトからアクションタイプを自動判定
 * - createActor: ユーザー情報からアクター（操作者）オブジェクトを構築
 */

// getSupabase: Supabaseクライアント取得
import { getSupabase } from "@/services/supabase/supabase-client";
// ShiftItem: アプリ内のシフトデータ型、ShiftStatus: シフトステータスの文字列リテラル型
import { ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

/**
 * ShiftActionType: シフトに対して行われた操作の種類。
 * TypeScriptのユニオンリテラル型: 指定された文字列のいずれかしか代入できない。
 *
 * - "create": マスターによるシフト新規作成
 * - "update_time": 時間の変更
 * - "update_user": 担当者の変更
 * - "update_status": ステータスの変更（承認、却下等）
 * - "delete": シフトの削除
 * - "teacher_create": 講師によるシフト申請
 * - "teacher_update": 講師によるシフト変更
 * - "batch_approve": 一括承認
 */
export type ShiftActionType =
  | "create"
  | "update_time"
  | "update_user"
  | "update_status"
  | "delete"
  | "teacher_create"
  | "teacher_update"
  | "batch_approve";

/**
 * ActorRole: 操作を実行した人のロール。
 * - "master": 教室長（管理者）
 * - "teacher": 講師（一般ユーザー）
 * - "system": システム自動処理
 */
export type ActorRole = "master" | "teacher" | "system";

/**
 * ShiftHistoryActor: シフト変更を行った人（操作者）の情報。
 */
export interface ShiftHistoryActor {
  userId: string;     // ユーザーUID
  nickname: string;   // 表示名
  role: ActorRole;    // ロール
}

/**
 * createActor: ユーザー情報から監査ログ用のアクター（操作者）オブジェクトを構築する。
 *
 * @param user - ログイン中のユーザー情報（null/undefined可）
 * @param defaultRole - ロールが不明な場合のデフォルト値（デフォルト: "master"）
 * @returns ShiftHistoryActor | undefined - ユーザーがいない場合はundefined
 */
export const createActor = (
  user: { uid: string; nickname?: string; role?: string } | null | undefined,
  defaultRole: ActorRole = "master"
): ShiftHistoryActor | undefined => {
  // ユーザーがいなければundefined（ログ記録をスキップするため）
  if (!user) return undefined;
  return {
    userId: user.uid,
    nickname: user.nickname || "教室長",                     // ニックネーム未設定時のデフォルト
    role: (user.role as ActorRole) || defaultRole,           // as で型アサーション（型変換）
  };
};

/**
 * ShiftChangeSnapshot: シフト変更前後の差分を保持する構造。
 * prev（変更前）と next（変更後）に使う。
 * 全フィールドが optional（?）なのは、変更されたフィールドだけ記録するため。
 */
export interface ShiftChangeSnapshot {
  startTime?: string;       // 開始時刻
  endTime?: string;         // 終了時刻
  userId?: string;          // 担当者のUID
  userNickname?: string;    // 担当者の表示名
  status?: ShiftStatus;     // ステータス（approved, pending, rejected等）
  statusLabel?: string;     // ステータスの日本語ラベル（"承認済み"等）
  type?: string;            // シフトタイプ
}

/**
 * ShiftChangeMetadata: シフト変更に関する追加情報。
 * 一括承認時の対象月や件数など、シフト単体では表現できない情報を保持する。
 */
export interface ShiftChangeMetadata {
  yearMonth?: string;   // 対象年月（例: "2025-03"）
  count?: number;       // 対象件数
  notes?: string;       // 備考
  reason?: string;      // 変更理由
}

/**
 * ShiftHistoryEntry: shift_change_logs テーブルに保存する1レコード分のデータ。
 */
export interface ShiftHistoryEntry {
  id?: string;                            // レコードID（自動採番）
  storeId: string;                        // 店舗ID
  shiftId?: string | null;                // 対象シフトID
  action: ShiftActionType;                // アクションタイプ
  actor: ShiftHistoryActor;               // 操作者
  timestamp?: string;                     // タイムスタンプ（DB側で自動設定）
  date: string;                           // シフトの日付（YYYY-MM-DD）
  prev?: ShiftChangeSnapshot;             // 変更前の差分
  next?: ShiftChangeSnapshot;             // 変更後の差分
  summary: string;                        // 要約文（人が読める形）
  notes?: string;                         // 備考
  prevSnapshot?: Partial<ShiftItem>;      // 変更前の完全スナップショット
  nextSnapshot?: Partial<ShiftItem>;      // 変更後の完全スナップショット
}

/**
 * getStatusLabel: ステータスの英語コードを日本語ラベルに変換するヘルパー関数。
 *
 * Record<string, string> は「キーがstring、値がstringのオブジェクト」を表すTypeScript型。
 *
 * @param status - ステータスの英語コード
 * @returns 日本語ラベル。未知のステータスはそのまま返す
 */
const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    approved: "承認済み",
    pending: "申請中",
    rejected: "却下",
    deleted: "削除済み",
    completed: "完了",
  };
  return statusMap[status] || status;
};

/**
 * toHistorySnapshot: ShiftItemから監査ログ用のスナップショットを生成する。
 * 全フィールドではなく、ログに必要なフィールドだけを抽出する。
 *
 * Partial<ShiftItem>: ShiftItemの全プロパティをオプショナル（?）にした型。
 * 「シフトの一部分だけを持つオブジェクト」を表現できる。
 *
 * @param shift - 元のシフトデータ
 * @returns Partial<ShiftItem> - ログ用に絞り込まれたスナップショット
 */
const toHistorySnapshot = (shift: ShiftItem): Partial<ShiftItem> => {
  // 必須フィールドをまず設定
  const snapshot: Partial<ShiftItem> = {
    id: shift.id,
    storeId: shift.storeId,
    userId: shift.userId,
    nickname: shift.nickname,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    status: shift.status,
    type: shift.type,
  };

  // オプショナルフィールドは存在する場合のみ追加
  // !== undefined チェックで、明示的にundefinedでない場合のみコピー
  if (shift.subject !== undefined) {
    snapshot.subject = shift.subject;
  }

  if (shift.notes !== undefined) {
    snapshot.notes = shift.notes;
  }

  if (shift.classes !== undefined) {
    snapshot.classes = shift.classes;
  }

  return snapshot;
};

/**
 * generateSummary: アクションタイプに基づいて人が読める要約文を生成する。
 * ログ一覧画面で「何が起きたか」を一目で把握するための文章。
 *
 * @param action - アクションタイプ
 * @param actor - 操作者
 * @param date - シフト日付
 * @param prev - 変更前の情報
 * @param next - 変更後の情報
 * @param metadata - 追加メタデータ（一括承認の件数等）
 * @returns 要約文（例: "教室長 が 2025-03-10 のシフトを追加しました"）
 */
const generateSummary = (
  action: ShiftActionType,
  actor: ShiftHistoryActor,
  date: string,
  prev?: ShiftChangeSnapshot,
  next?: ShiftChangeSnapshot,
  metadata?: ShiftChangeMetadata
): string => {
  // 操作者の表示名: 講師の場合は「講師 田中」、マスターの場合は「教室長」
  const actorName = actor.role === "teacher" ? `講師 ${actor.nickname}` : actor.nickname;

  // アクションタイプごとに適切な要約文を生成
  switch (action) {
    case "create":
      return `${actorName} が ${date} のシフトを追加しました（${next?.startTime}-${next?.endTime}, 担当: ${next?.userNickname}）`;

    case "teacher_create":
      return `講師 ${actor.nickname} が ${date} にシフトを申請しました（${next?.startTime}-${next?.endTime}）`;

    case "update_time":
      // 変更前後の時刻を「→」で表示
      return `${actorName} が ${date} のシフト時間を ${prev?.startTime}-${prev?.endTime} → ${next?.startTime}-${next?.endTime} に変更しました（担当: ${next?.userNickname}）`;

    case "update_user":
      return `${actorName} が ${date} の担当を ${prev?.userNickname} → ${next?.userNickname} に変更しました（${next?.startTime}-${next?.endTime}）`;

    case "update_status":
      return `${actorName} が ${date} のシフトステータスを ${prev?.statusLabel} → ${next?.statusLabel} に変更しました（${next?.userNickname}）`;

    case "delete":
      return `${actorName} が ${date} のシフトを削除しました（${prev?.startTime}-${prev?.endTime}, 担当: ${prev?.userNickname}）`;

    case "batch_approve":
      return `${actorName} が ${metadata?.yearMonth || date} のシフトを一括承認しました（対象: ${metadata?.count || 0}件）`;

    case "teacher_update":
      return `講師 ${actor.nickname} が ${date} のシフトを変更しました`;

    default:
      return `${actorName} が ${date} のシフトを変更しました`;
  }
};

/**
 * logShiftChange: シフト変更をshift_change_logsテーブルに記録するメイン関数。
 *
 * 【処理の流れ】
 * 1. ログエントリの基本情報を構築
 * 2. 変更前（prev）・変更後（next）のスナップショットを作成
 * 3. 要約文を生成
 * 4. Supabase DBに保存
 *
 * @param action - アクションタイプ
 * @param actor - 操作者情報
 * @param storeId - 店舗ID
 * @param shift - 変更後のシフト（新規作成・更新時）。削除時はnull
 * @param prevShift - 変更前のシフト（更新・削除時）。新規作成時はnull
 * @param metadata - 追加メタデータ
 */
export const logShiftChange = async (
  action: ShiftActionType,
  actor: ShiftHistoryActor,
  storeId: string,
  shift?: ShiftItem | null,
  prevShift?: ShiftItem | null,
  metadata?: ShiftChangeMetadata
): Promise<void> => {
  try {
    // 店舗IDがない場合はログ記録をスキップ
    if (!storeId) {
      console.warn("logShiftChange: storeId is missing, skipping history log");
      return;
    }

    // --- ログエントリの基本情報を構築 ---
    const entry: ShiftHistoryEntry = {
      storeId,
      // シフトIDは変更後 or 変更前から取得。どちらもなければnull
      shiftId: shift?.id || prevShift?.id || null,
      action,
      actor,
      // 日付: シフトから取得。どちらもない場合は今日の日付
      date: shift?.date || prevShift?.date || new Date().toISOString().split("T")[0]!,
      summary: "",  // 後で生成する
      // スプレッド構文 ...({}) で条件付きプロパティ追加
      // metadata.notes がある場合のみ notes プロパティを追加
      ...(metadata?.notes && { notes: metadata.notes }),
    };

    // --- 変更前のデータを設定 ---
    if (prevShift) {
      // prev: 差分表示用の簡易スナップショット
      entry.prev = {
        startTime: prevShift.startTime,
        endTime: prevShift.endTime,
        userId: prevShift.userId,
        userNickname: prevShift.nickname,
        status: prevShift.status,
        statusLabel: getStatusLabel(prevShift.status),
        type: prevShift.type,
      };
      // prevSnapshot: 完全なスナップショット（詳細調査用）
      entry.prevSnapshot = toHistorySnapshot(prevShift);
    }

    // --- 変更後のデータを設定 ---
    if (shift) {
      entry.next = {
        startTime: shift.startTime,
        endTime: shift.endTime,
        userId: shift.userId,
        userNickname: shift.nickname,
        status: shift.status,
        statusLabel: getStatusLabel(shift.status),
        type: shift.type,
      };
      entry.nextSnapshot = toHistorySnapshot(shift);
    }

    // --- 要約文を生成 ---
    entry.summary = generateSummary(
      action,
      actor,
      entry.date,
      entry.prev,
      entry.next,
      metadata
    );

    // --- Supabaseに保存 ---
    const supabase = getSupabase();
    const { error } = await supabase.from("shift_change_logs").insert({
      store_id: entry.storeId,            // 店舗ID
      shift_id: entry.shiftId,            // シフトID
      action: entry.action,               // アクション種別
      actor: entry.actor,                 // 操作者（JSONBカラム）
      date: entry.date,                   // 日付
      prev: entry.prev || null,           // 変更前差分（JSONBカラム）
      next: entry.next || null,           // 変更後差分（JSONBカラム）
      summary: entry.summary,             // 要約文
      notes: entry.notes || null,         // 備考
      prev_snapshot: entry.prevSnapshot || null,  // 変更前スナップショット（JSONBカラム）
      next_snapshot: entry.nextSnapshot || null,  // 変更後スナップショット（JSONBカラム）
    });

    if (error) {
      // ログ記録の失敗は業務処理をブロックしない（エラーログのみ）
      console.error("Shift history logging failed:", error.message);
    }
  } catch (error: any) {
    // try-catch全体で囲むことで、ログ記録の失敗がシフト操作に影響しないようにする
    console.error("Shift history logging failed:", error);
  }
};

/**
 * logBatchApprove: 一括承認のログを記録する便利関数。
 * logShiftChange のラッパーで、一括承認に特化したパラメータ設定を行う。
 *
 * @param actor - 操作者（一括承認を実行したマスター）
 * @param storeId - 店舗ID
 * @param yearMonth - 対象年月（例: "2025-03"）
 * @param count - 承認した件数
 */
export const logBatchApprove = async (
  actor: ShiftHistoryActor,
  storeId: string,
  yearMonth: string,
  count: number
): Promise<void> => {
  // shift, prevShift は null（個別のシフトではなく一括操作のため）
  await logShiftChange(
    "batch_approve",
    actor,
    storeId,
    null,  // shift（変更後）: 一括操作なので個別シフトなし
    null,  // prevShift（変更前）: 同上
    { yearMonth, count }  // メタデータに対象月と件数を渡す
  );
};

/**
 * determineActionType: 変更前後のシフトからアクションタイプを自動判定する。
 *
 * 判定ロジック:
 * - prevShift=null, nextShift=あり → 新規作成（create or teacher_create）
 * - prevShift=あり, nextShift=null → 削除（delete）
 * - 両方あり → 更新（何が変わったかで詳細判定）
 *   - 時間が変わった → update_time
 *   - 担当者が変わった → update_user
 *   - ステータスが変わった → update_status
 *   - 講師が変更した → teacher_update
 *
 * @param prevShift - 変更前のシフト（null = 新規作成）
 * @param nextShift - 変更後のシフト（null = 削除）
 * @param actor - 操作者（ロールで判定分岐する）
 * @returns ShiftActionType - 判定されたアクションタイプ
 */
export const determineActionType = (
  prevShift: ShiftItem | null,
  nextShift: ShiftItem | null,
  actor: ShiftHistoryActor
): ShiftActionType => {
  // --- 新規作成の判定 ---
  if (!prevShift && nextShift) {
    // 講師が作成した場合は "teacher_create"（申請扱い）
    return actor.role === "teacher" ? "teacher_create" : "create";
  }

  // --- 削除の判定 ---
  if (prevShift && !nextShift) {
    return "delete";
  }

  // --- 更新の判定 ---
  if (prevShift && nextShift) {
    // 講師による変更は一律 "teacher_update"
    if (actor.role === "teacher") {
      return "teacher_update";
    }

    // 時間変更の判定: 開始時刻 or 終了時刻が変わった
    if (prevShift.startTime !== nextShift.startTime ||
        prevShift.endTime !== nextShift.endTime) {
      return "update_time";
    }

    // 担当者変更の判定: userIdが変わった
    if (prevShift.userId !== nextShift.userId) {
      return "update_user";
    }

    // ステータス変更の判定: statusが変わった
    if (prevShift.status !== nextShift.status) {
      return "update_status";
    }
  }

  // デフォルト: どの条件にも該当しない場合は "create" として記録
  return "create";
};
