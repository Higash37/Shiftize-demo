/**
 * @file VersionManager.ts
 * @description アプリのバージョン管理と自動更新システム。
 *
 * 【このファイルの位置づけ】
 * デプロイ後に既存ユーザーのアプリを自動更新する仕組みを提供する。
 * Supabase DBの settings テーブルに「最新バージョン情報」を保存し、
 * クライアント側で定期的にチェックして、更新が必要ならリロードする。
 *
 *   アプリ起動 → VersionManager.checkForUpdatesOnStartup()
 *        ↓
 *   VersionManager（★このファイル）
 *        ↓ 最新バージョンを取得
 *   Supabase DB（settings テーブルの "app_version" レコード）
 *        ↓ 比較
 *   現在のバージョン（package.json から取得）
 *        ↓ 更新が必要なら
 *   Service Worker キャッシュクリア → 強制リロード
 *
 * 【セマンティックバージョニング（SemVer）】
 * major.minor.patch 形式（例: 1.2.3）
 * - major: 破壊的変更（1.x.x → 2.0.0）
 * - minor: 新機能追加（1.1.x → 1.2.0）
 * - patch: バグ修正（1.2.0 → 1.2.1）
 * 各パートを数値比較して、latestの方が大きければ更新が必要。
 */

// getSupabase: Supabaseクライアント取得
import { getSupabase } from "@/services/supabase/supabase-client";
// AppVersion: package.jsonからバージョン文字列を取得するユーティリティ
import { AppVersion } from "@/common/common-utils/util-version/AppVersion";

/** 現在のアプリバージョン（package.jsonから取得した文字列） */
const CURRENT_VERSION = AppVersion.getVersion();

/**
 * AppVersionData: settingsテーブルに保存されるバージョン情報の型。
 */
interface AppVersionData {
  version: string;          // 最新バージョン（例: "1.3.0"）
  forceUpdate: boolean;     // 強制アップデートかどうか
  updateMessage?: string;   // 更新時にユーザーに表示するメッセージ
  updatedAt: string;        // 最終更新日時
}

/**
 * VersionManager: バージョンチェックと自動更新を管理するクラス。
 * 全メソッドが static（インスタンス化不要）。
 */
export class VersionManager {
  /** settingsテーブルのキー名 */
  private static readonly VERSION_KEY = 'app_version';

  /** バージョンチェックの間隔（ミリ秒） */
  private static readonly CHECK_INTERVAL_MS = 60_000;

  /** Service Worker処理完了を待つ遅延（ミリ秒） */
  private static readonly RELOAD_DELAY_MS = 100;

  /**
   * intervalId: setIntervalの戻り値を保持する。
   * stopVersionCheck() で clearInterval するために必要。
   * NodeJS.Timeout: setIntervalの戻り値の型（Node.js環境）
   */
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * startVersionCheck: 定期的なバージョンチェックを開始する。
   * アプリ起動時に1回呼ぶ。以後、CHECK_INTERVAL（60秒）ごとに自動チェック。
   *
   * @param onUpdateRequired - 更新が必要な場合に呼ばれるコールバック関数（任意）
   */
  static async startVersionCheck(onUpdateRequired?: () => void) {
    // 既存のインターバルがあればクリア（二重登録防止）
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // 初回チェック: 即座に実行
    await this.checkVersion(onUpdateRequired);

    // 定期チェック: CHECK_INTERVAL ミリ秒ごとに実行
    // setInterval: 指定間隔で繰り返し関数を実行するタイマー
    this.intervalId = setInterval(async () => {
      await this.checkVersion(onUpdateRequired);
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * stopVersionCheck: 定期的なバージョンチェックを停止する。
   * コンポーネントのアンマウント時にクリーンアップとして呼ぶ。
   */
  static stopVersionCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);  // タイマーを解除
      this.intervalId = null;
    }
  }

  /**
   * fetchVersionData: Supabaseから最新バージョン情報を取得する。
   *
   * private: クラス外部からは呼べない（内部メソッド）。
   *
   * クエリ:
   *   SELECT data FROM settings WHERE settings_key = 'app_version' LIMIT 1
   *
   * @returns Promise<AppVersionData | null> - バージョン情報、取得失敗時はnull
   */
  private static async fetchVersionData(): Promise<AppVersionData | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("settings")
      .select("data")                       // dataカラム（JSONB型）
      .eq("settings_key", "app_version")   // WHERE settings_key = 'app_version'
      .maybeSingle();                       // 0件ならnull、1件ならオブジェクト

    if (error || !data) return null;
    // data.data: settingsテーブルの"data"カラムの値をAppVersionDataとしてキャスト
    return data.data as AppVersionData;
  }

  /**
   * checkVersion: 現在のバージョンと最新バージョンを比較し、
   * 更新が必要なら適切なアクション（強制リロード or コールバック呼び出し）を実行する。
   *
   * @param onUpdateRequired - オプショナルアップデート時のコールバック
   */
  private static async checkVersion(onUpdateRequired?: () => void) {
    try {
      // DBから最新バージョン情報を取得
      const versionData = await this.fetchVersionData();

      if (versionData) {
        // 現在のバージョンと最新バージョンを比較
        if (this.isUpdateRequired(CURRENT_VERSION, versionData.version)) {

          if (versionData.forceUpdate) {
            // 強制アップデート: ユーザーの確認なしにリロード
            this.forceReload(versionData.updateMessage);
          } else if (onUpdateRequired) {
            // オプショナルアップデート: コールバックを呼んでUIで通知
            onUpdateRequired();
          }
        }
      }
    } catch (error) {
      // バージョンチェックの失敗はアプリ動作をブロックしない（サイレントエラー）
    }
  }

  /**
   * isUpdateRequired: セマンティックバージョニングで比較し、更新が必要か判定する。
   *
   * 比較ロジック:
   *   current="1.2.3", latest="1.3.0" の場合:
   *     パート0: 1 vs 1 → 同じ、次のパートへ
   *     パート1: 2 vs 3 → latest が大きい → true（更新必要）
   *
   *   current="2.0.0", latest="1.9.9" の場合:
   *     パート0: 2 vs 1 → current が大きい → false（更新不要）
   *
   * @param current - 現在のバージョン文字列
   * @param latest - 最新のバージョン文字列
   * @returns true: 更新が必要、false: 最新版を使用中
   */
  private static isUpdateRequired(current: string, latest: string): boolean {
    // "1.2.3" → [1, 2, 3] に変換
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    // 各パートを左から順に比較
    // Math.max: パート数が異なる場合に長い方に合わせる
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;  // パートがなければ0扱い
      const latestPart = latestParts[i] || 0;

      if (latestPart > currentPart) return true;   // latest が大きい → 更新必要
      if (latestPart < currentPart) return false;  // current が大きい → 更新不要
      // 同じなら次のパートへ
    }

    // 全パートが同じ → 更新不要
    return false;
  }

  /**
   * forceReload: キャッシュをクリアしてページを強制リロードする。
   *
   * 処理の流れ:
   * 1. メッセージがあればalertで表示
   * 2. Service Workerに SKIP_WAITING メッセージを送信（待機中のSWを即時有効化）
   * 3. URLにタイムスタンプパラメータを追加してリロード（ブラウザキャッシュ回避）
   *
   * @param message - ユーザーに表示するメッセージ（任意）
   */
  private static forceReload(message?: string) {
    if (message) {
      // alert: ブラウザのダイアログでメッセージを表示
      alert(message || '新しいバージョンが利用可能です。アプリを再読み込みします。');
    }

    // Service Workerのキャッシュをクリア
    // Service Worker: ブラウザのバックグラウンドで動作し、リソースをキャッシュする仕組み
    // SKIP_WAITING: 待機中のService Workerを即座にアクティブにするメッセージ
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }

    // RELOAD_DELAY_MS後にリロード（Service Workerの処理完了を待つため）
    setTimeout(() => {
      // URLにタイムスタンプを追加してキャッシュ回避
      // 例: https://app.shiftize.com/?v=1709876543210
      const timestamp = new Date().getTime();
      const url = new URL(window.location.href);
      url.searchParams.set('v', timestamp.toString());
      // window.location.href への代入でページ遷移（リロード）
      window.location.href = url.toString();
    }, this.RELOAD_DELAY_MS);
  }

  /**
   * updateLocalVersion: ローカルストレージにバージョン番号を保存する。
   * アプリが更新された後に呼んで、次回のチェックで再更新を防ぐ。
   *
   * @param version - 保存するバージョン文字列
   */
  static updateLocalVersion(version: string) {
    // localStorage: ブラウザの永続的なキーバリューストア
    localStorage.setItem(this.VERSION_KEY, version);
  }

  /**
   * getLocalVersion: ローカルストレージからバージョン番号を取得する。
   *
   * @returns バージョン文字列、未設定の場合はnull
   */
  static getLocalVersion(): string | null {
    return localStorage.getItem(this.VERSION_KEY);
  }

  /**
   * checkForUpdatesOnStartup: アプリ起動時のバージョンチェック（即座に実行）。
   * startVersionCheck とは別に、起動直後に1回だけチェックを行う。
   *
   * 強制アップデートの場合はユーザー確認なしにリロード。
   * オプショナルアップデートの場合はconfirmダイアログで確認する。
   *
   * @returns Promise<boolean> - true: アップデートを実行した（リロード中）、false: 最新版
   */
  static async checkForUpdatesOnStartup(): Promise<boolean> {
    try {
      const versionData = await this.fetchVersionData();

      if (versionData) {
        if (this.isUpdateRequired(CURRENT_VERSION, versionData.version)) {
          if (versionData.forceUpdate) {
            // 強制アップデート: 即座にリロード
            this.forceReload(versionData.updateMessage);
            return true;
          } else {
            // オプショナルアップデート: ユーザーに確認
            // confirm: OK/キャンセルのダイアログを表示し、ユーザーの選択をbooleanで返す
            const userChoice = confirm(
              versionData.updateMessage || '新しいバージョンが利用可能です。今すぐ更新しますか？'
            );

            if (userChoice) {
              // ユーザーが「OK」を選択 → リロード
              this.forceReload();
              return true;
            }
            // ユーザーが「キャンセル」→ 更新せずに続行
          }
        }
      }

      // 更新不要 or ユーザーがキャンセル
      return false;
    } catch (error) {
      // バージョンチェックの失敗はアプリ起動をブロックしない
      return false;
    }
  }
}

/**
 * updateAppVersion: アプリのバージョン情報をSupabase DBに保存する（管理者用）。
 * デプロイ時やバージョンアップ時に管理者が実行する。
 *
 * 【処理の流れ】
 * 1. settingsテーブルに "app_version" キーのレコードがあるか確認
 * 2. あればUPDATE、なければINSERT
 *
 * @param version - 新しいバージョン文字列（例: "1.3.0"）
 * @param forceUpdate - 強制アップデートにするか（デフォルト: false）
 * @param updateMessage - 更新時に表示するメッセージ（任意）
 * @throws Error - DB操作失敗時
 */
export async function updateAppVersion(
  version: string,
  forceUpdate: boolean = false,
  updateMessage?: string
) {
  const supabase = getSupabase();

  // 保存するバージョンデータの構築
  const versionData = {
    version,
    forceUpdate,
    updateMessage,
    updatedAt: new Date().toISOString(),
  };

  // 既存レコードの確認
  const { data: existing } = await supabase
    .from("settings")
    .select("store_id")
    .eq("settings_key", "app_version")
    .maybeSingle();

  if (existing) {
    // 既存レコードがある → UPDATE
    const { error } = await supabase
      .from("settings")
      .update({ data: versionData })           // dataカラム（JSONB）を更新
      .eq("settings_key", "app_version")
      .eq("store_id", existing.store_id);
    if (error) throw error;
  } else {
    // 既存レコードがない → INSERT
    // グローバル設定として store_id を空文字で保存（全店舗共通）
    const { error } = await supabase
      .from("settings")
      .insert({
        store_id: "",                         // グローバル設定
        settings_key: "app_version",
        data: versionData,
      });
    if (error) throw error;
  }
}
