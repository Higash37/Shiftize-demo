/**
 * @file supabase-client.ts
 * @description Supabaseクライアントのシングルトン初期化
 *
 * ============================================================
 * 【なぜ "シングルトン" パターンなのか — インスタンス管理の考え方】
 * ============================================================
 *
 * ■ シングルトンとは
 *   アプリ全体で「1つだけ」のインスタンスを共有するパターン。
 *   下記の supabaseInstance 変数が null なら新規作成し、
 *   すでに存在すればそれを返す — これがシングルトンの基本形。
 *
 * ■ なぜ DB クライアントは1つだけでいいのか
 *   - 接続プールの無駄遣い防止: DB クライアントを毎回 new すると、
 *     接続が際限なく増えてサーバーに負荷がかかる。
 *   - セッション管理の一貫性: 認証トークンの状態を1箇所で管理できる。
 *   - メモリ効率: 同じ設定のクライアントを複数作る意味がない。
 *
 * ■ ケースバイケース（シングルトンが適切 / 不適切な場面）
 *   ✅ 適切: DB 接続、設定オブジェクト、ロガー、キャッシュマネージャー
 *     → アプリ全体で1つあれば十分で、複数あると問題が起きるもの
 *   ❌ 不適切: UI コンポーネント、フォームの状態、ユーザーごとのデータ
 *     → それぞれ独立したインスタンスが必要なもの
 *
 * ■ 注意点
 *   シングルトンはテストしにくい（モックに差し替えにくい）という欠点がある。
 *   このプロジェクトでは getSupabase() 関数経由にすることで、
 *   テスト時にモジュールをモックできるようにしている。
 * ============================================================
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env['EXPO_PUBLIC_SUPABASE_URL'] || "";
const SUPABASE_ANON_KEY = process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] || "";

/** アプリ全体で共有される唯一の Supabase クライアントインスタンス（シングルトン） */
let supabaseInstance: SupabaseClient | null = null;

/** Supabaseクライアントを取得（未作成なら初期化、作成済みなら既存インスタンスを返す） */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        "Supabase URL and Anon Key must be set via EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // React Native環境ではAsyncStorageでセッション永続化
        storage: Platform.OS !== "web" ? AsyncStorage : undefined,
        // React Native環境ではURL検出を無効化
        detectSessionInUrl: Platform.OS === "web",
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return supabaseInstance;
}
