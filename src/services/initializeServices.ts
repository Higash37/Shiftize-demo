/**
 * @file initializeServices.ts
 * @description アプリ起動時に1回だけ呼ばれ、ServiceProvider に全てのサービスアダプターを登録する。
 *
 * 【このファイルの位置づけ】
 *
 *   アプリ起動 (app/_layout.tsx)
 *       │
 *       │  initializeServices() を呼び出し
 *       ▼
 *   このファイル
 *       │
 *       │  各 Supabase アダプターを new して ServiceProvider にセット
 *       ▼
 *   ServiceProvider
 *       │
 *       │  コンポーネントが ServiceProvider.auth 等でアクセス
 *       ▼
 *   各コンポーネント
 *
 * なぜ initializeServices と ServiceProvider を分離するのか？
 * → ServiceProvider はサービスの「参照」だけを提供し、
 *   具体的にどのアダプター（Supabase? Firebase?）を使うかはこのファイルで決める。
 *   テスト時にモックアダプターに差し替えることも容易になる。
 */

import { ServiceProvider } from "./ServiceProvider";

// ────────────────────────────────────────────
// Supabase アダプターのインポート
// ────────────────────────────────────────────
// 各アダプターは対応するインターフェース（IAuthService 等）を実装している。
// Supabase のAPIを使ってデータベース操作・認証操作を行う。
import { SupabaseAuthAdapter } from "./supabase/SupabaseAuthAdapter";
import { SupabaseUserAdapter } from "./supabase/SupabaseUserAdapter";
import { SupabaseShiftAdapter } from "./supabase/SupabaseShiftAdapter";
import { SupabaseStoreAdapter } from "./supabase/SupabaseStoreAdapter";
import { SupabaseSettingsAdapter } from "./supabase/SupabaseSettingsAdapter";
import { SupabaseAuditAdapter } from "./supabase/SupabaseAuditAdapter";
import { SupabaseShiftConfirmationAdapter } from "./supabase/SupabaseShiftConfirmationAdapter";
import { SupabaseQuickShiftTokenAdapter } from "./supabase/SupabaseQuickShiftTokenAdapter";
import { SupabaseTeacherStatusAdapter } from "./supabase/SupabaseTeacherStatusAdapter";
import { SupabaseShiftSubmissionAdapter } from "./supabase/SupabaseShiftSubmissionAdapter";
import { SupabaseMultiStoreAdapter } from "./supabase/SupabaseMultiStoreAdapter";
import { GoogleCalendarSyncService } from "./google-calendar/GoogleCalendarSyncService";
import { SupabaseTodoAdapter } from "./supabase/SupabaseTodoAdapter";
import { loadJapaneseHolidays } from "@/common/common-utils/util-settings/japaneseHolidays";

// ────────────────────────────────────────────
// 初期化済みフラグ
// ────────────────────────────────────────────
// モジュールスコープの変数。2回目以降の呼び出しを防ぐ。
let initialized = false;

/**
 * 全サービスを初期化する関数。
 * アプリ起動時（app/_layout.tsx）で1回だけ呼ばれる。
 *
 * 処理の流れ:
 * 1. 各 Supabase アダプターをインスタンス化（new）
 * 2. ServiceProvider の setter メソッドで登録
 * 3. 祝日データをバックグラウンドで取得
 * 4. initialized フラグを true にして、2回目以降の呼び出しをスキップ
 */
export function initializeServices(): void {
  // 既に初期化済みなら何もしない（二重初期化防止）
  if (initialized) return;

  // ── 各サービスアダプターを ServiceProvider に登録 ──
  // new でインスタンスを生成し、setter で ServiceProvider に渡す。
  // 以降、ServiceProvider.auth と書くと SupabaseAuthAdapter のインスタンスが返る。
  ServiceProvider.setAuthService(new SupabaseAuthAdapter());
  ServiceProvider.setUserService(new SupabaseUserAdapter());
  ServiceProvider.setShiftService(new SupabaseShiftAdapter());
  ServiceProvider.setStoreService(new SupabaseStoreAdapter());
  ServiceProvider.setSettingsService(new SupabaseSettingsAdapter());
  ServiceProvider.setAuditService(new SupabaseAuditAdapter());
  ServiceProvider.setShiftConfirmationService(new SupabaseShiftConfirmationAdapter());
  ServiceProvider.setQuickShiftTokenService(new SupabaseQuickShiftTokenAdapter());
  ServiceProvider.setTeacherStatusService(new SupabaseTeacherStatusAdapter());
  ServiceProvider.setShiftSubmissionService(new SupabaseShiftSubmissionAdapter());
  ServiceProvider.setMultiStoreService(new SupabaseMultiStoreAdapter());
  ServiceProvider.setGoogleCalendarService(new GoogleCalendarSyncService());
  ServiceProvider.setTodoService(new SupabaseTodoAdapter());

  // 日本の祝日データをバックグラウンドで事前取得
  // （カレンダー表示で祝日を赤くするために使う）
  loadJapaneseHolidays();

  // 初期化完了フラグをセット
  initialized = true;
}
