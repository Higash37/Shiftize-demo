/**
 * @file ServiceProvider.ts
 * @description アプリ全体で使うサービス（認証・ユーザー・シフト等）を一元管理するハブ。
 *              コンポーネントは ServiceProvider.auth や ServiceProvider.shifts のように
 *              このファイル経由でサービスにアクセスする。
 *
 * ============================================================
 * 【なぜ "ServiceProvider" パターンなのか — サービスロケーターの歴史】
 * ============================================================
 *
 * ■ サービスロケーター vs DI（Dependency Injection）の違い
 *   どちらも「コードが具体的な実装に直接依存しないようにする」ための設計パターン。
 *
 *   - サービスロケーター（このファイルのアプローチ）:
 *     「レジストリ（登録簿）」に全てのサービスを登録しておき、
 *     使う側が ServiceProvider.auth のように名前で取り出す。
 *     使う側が「自分から取りに行く」（pull型）。
 *
 *   - DI（Dependency Injection = 依存性注入）:
 *     フレームワークが「外から注入する」（push型）。
 *     Java の Spring や .NET の ASP.NET Core では、コンストラクタの引数に
 *     IAuthService を書くだけで、フレームワークが自動的にインスタンスを渡してくれる。
 *     例: constructor(private auth: IAuthService) ← Spring が自動注入する
 *
 * ■ なぜ React アプリでは DI コンテナを使わないのか
 *   - React はコンポーネントベース: クラスのコンストラクタではなく、関数コンポーネントが主流。
 *     Spring のようなコンストラクタ注入の仕組みが言語レベルで存在しない。
 *   - React の DI は Context: React では Context API が DI の代わりを果たす。
 *     ただし Context は「React コンポーネントの中」でしか使えない。
 *   - サービス層は React の外: このファイルのサービス群はReactコンポーネントではなく、
 *     純粋なTypeScriptクラス。Context では管理できないため、サービスロケーターが自然な選択。
 *
 * ■ この場合にサービスロケーターが適切な理由
 *   - サービスの数が多い（13種類）: 全てを Context で管理すると Provider のネストが深くなる。
 *   - React の外でも使いたい: ユーティリティ関数やサービス同士の連携で、
 *     React コンポーネントの外からサービスにアクセスする場面がある。
 *   - テスト容易性: setAuthService() でモックサービスを注入できるため、
 *     テスト時に Supabase を使わずにテストできる。
 *
 * ■ 代替手段: 直接 import vs ServiceProvider
 *   ケースバイケースの判断基準:
 *   - 直接 import が適切: ユーティリティ関数（DateFormatter等）のように、
 *     実装が1つしかなく、差し替える必要がないもの。
 *   - ServiceProvider が適切: バックエンドとの通信層のように、
 *     将来的に実装を差し替える可能性があるもの（Supabase → Firebase 等）。
 *     また、テスト時にモックに差し替えたいもの。
 * ============================================================
 *
 * 【このファイルの位置づけ】
 *
 *   コンポーネント (React)
 *       │
 *       │  ServiceProvider.auth.signIn(...)   ← コンポーネントはこう呼ぶ
 *       ▼
 *   ServiceProvider (このファイル)  ── 全サービスのハブ ──
 *       │         │         │         │         ...
 *       ▼         ▼         ▼         ▼
 *   IAuthService  IUserService  IShiftService  IStoreService  ...  (インターフェース)
 *       │         │         │         │
 *       ▼         ▼         ▼         ▼
 *   SupabaseAuth  SupabaseUser  SupabaseShift  SupabaseStore  ...  (具体的なアダプター)
 *   Adapter       Adapter       Adapter        Adapter
 *       │
 *       ▼
 *   Supabase (データベース / 認証API)
 *
 * ポイント:
 * - ServiceProviderは「サービスロケーター」パターンの実装
 * - インターフェース（IAuthService等）を間に挟むことで、
 *   将来 Supabase 以外のバックエンドに切り替える場合もコンポーネント側の変更が不要
 * - initializeServices.ts で各アダプターがセットされる（アプリ起動時に1回だけ実行）
 */

// ────────────────────────────────────────────
// インターフェースのインポート
// ────────────────────────────────────────────
// `import type` はTypeScriptの構文で、「型情報だけをインポートする」という意味。
// ビルド後のJavaScriptには含まれないため、バンドルサイズに影響しない。
import type { IAuthService } from "./interfaces/IAuthService";
import type { IUserService } from "./interfaces/IUserService";
import type { IShiftService } from "./interfaces/IShiftService";
import type { IStoreService } from "./interfaces/IStoreService";
import type { ISettingsService } from "./interfaces/ISettingsService";
import type { IAuditService } from "./interfaces/IAuditService";
import type { IShiftConfirmationService } from "./interfaces/IShiftConfirmationService";
import type { IQuickShiftTokenService } from "./interfaces/IQuickShiftTokenService";
import type { ITeacherStatusService } from "./interfaces/ITeacherStatusService";
import type { IShiftSubmissionService } from "./interfaces/IShiftSubmissionService";
import type { IMultiStoreService } from "./interfaces/IMultiStoreService";
import type { IGoogleCalendarService } from "./interfaces/IGoogleCalendarService";
import type { ITodoService } from "./interfaces/ITodoService";
import { ServiceNotInitializedError } from "@/common/common-errors/AppErrors";

// ────────────────────────────────────────────
// ヘルパー関数
// ────────────────────────────────────────────

/**
 * サービスが null でないことを保証するヘルパー関数。
 * null だった場合は「まだ初期化されていない」エラーを投げる。
 *
 * 【TypeScript構文解説】
 * - `<T>` はジェネリクス（汎用型）。呼び出し側が渡す型に応じて T が決まる。
 *   例: requireService<IAuthService>(this._auth, "AuthService")
 *        → T は IAuthService になる
 * - `T | null` はユニオン型。「T 型か null のどちらか」を意味する。
 * - 戻り値の `T` は「null ではない T 型」を保証している。
 *
 * @param service - チェック対象のサービスインスタンス（null の可能性あり）
 * @param name   - エラーメッセージに含めるサービス名
 * @returns null でないことが保証されたサービスインスタンス
 */
function requireService<T>(service: T | null, name: string): T {
  // service が null（= まだ initializeServices() が呼ばれていない）ならエラー
  if (!service) throw new ServiceNotInitializedError(name);
  return service;
}

// ────────────────────────────────────────────
// ServiceProviderImpl クラス
// ────────────────────────────────────────────

/**
 * サービスプロバイダーの実装クラス。
 *
 * 各サービスを private フィールドとして保持し、
 * getter（読み取り）と setter（書き込み）メソッドのペアで管理する。
 *
 * - getter: コンポーネントから使われる。null チェック付きで安全にサービスを返す。
 * - setter: initializeServices.ts から使われる。具体的なアダプターをセットする。
 *
 * 【TypeScript構文解説: private】
 * `private` はクラス外からアクセスできないフィールド。
 * 直接 `ServiceProvider._auth` とアクセスするとコンパイルエラーになる。
 * 必ず getter の `ServiceProvider.auth` 経由でアクセスさせることで、
 * null チェックを強制している。
 */
class ServiceProviderImpl {
  // ── 各サービスのプライベートフィールド ──
  // 初期値は全て null（= まだアダプターがセットされていない状態）
  private _auth: IAuthService | null = null;
  private _users: IUserService | null = null;
  private _shifts: IShiftService | null = null;
  private _stores: IStoreService | null = null;
  private _settings: ISettingsService | null = null;
  private _audit: IAuditService | null = null;
  private _shiftConfirmations: IShiftConfirmationService | null = null;
  private _quickShiftTokens: IQuickShiftTokenService | null = null;
  private _teacherStatus: ITeacherStatusService | null = null;
  private _shiftSubmissions: IShiftSubmissionService | null = null;
  private _multiStore: IMultiStoreService | null = null;
  private _googleCalendar: IGoogleCalendarService | null = null;
  private _todos: ITodoService | null = null;

  // ── 認証サービス ──
  // get は TypeScript の getter 構文。ServiceProvider.auth でプロパティのようにアクセスできる。
  get auth(): IAuthService { return requireService(this._auth, "AuthService"); }
  /** initializeServices.ts から呼ばれ、具体的な認証アダプター（SupabaseAuthAdapter）をセットする */
  setAuthService(service: IAuthService): void { this._auth = service; }

  // ── ユーザーサービス ──
  get users(): IUserService { return requireService(this._users, "UserService"); }
  setUserService(service: IUserService): void { this._users = service; }

  // ── シフトサービス ──
  get shifts(): IShiftService { return requireService(this._shifts, "ShiftService"); }
  setShiftService(service: IShiftService): void { this._shifts = service; }

  // ── 店舗サービス ──
  get stores(): IStoreService { return requireService(this._stores, "StoreService"); }
  setStoreService(service: IStoreService): void { this._stores = service; }

  // ── 設定サービス ──
  get settings(): ISettingsService { return requireService(this._settings, "SettingsService"); }
  setSettingsService(service: ISettingsService): void { this._settings = service; }

  // ── 監査ログサービス（GDPR準拠の操作記録） ──
  get audit(): IAuditService { return requireService(this._audit, "AuditService"); }
  setAuditService(service: IAuditService): void { this._audit = service; }

  // ── シフト確認サービス ──
  get shiftConfirmations(): IShiftConfirmationService { return requireService(this._shiftConfirmations, "ShiftConfirmationService"); }
  setShiftConfirmationService(service: IShiftConfirmationService): void { this._shiftConfirmations = service; }

  // ── クイックシフトトークンサービス（募集シフト用） ──
  get quickShiftTokens(): IQuickShiftTokenService { return requireService(this._quickShiftTokens, "QuickShiftTokenService"); }
  setQuickShiftTokenService(service: IQuickShiftTokenService): void { this._quickShiftTokens = service; }

  // ── 講師ステータスサービス ──
  get teacherStatus(): ITeacherStatusService { return requireService(this._teacherStatus, "TeacherStatusService"); }
  setTeacherStatusService(service: ITeacherStatusService): void { this._teacherStatus = service; }

  // ── シフト提出サービス ──
  get shiftSubmissions(): IShiftSubmissionService { return requireService(this._shiftSubmissions, "ShiftSubmissionService"); }
  setShiftSubmissionService(service: IShiftSubmissionService): void { this._shiftSubmissions = service; }

  // ── マルチ店舗サービス ──
  get multiStore(): IMultiStoreService { return requireService(this._multiStore, "MultiStoreService"); }
  setMultiStoreService(service: IMultiStoreService): void { this._multiStore = service; }

  // ── Google Calendar 連携サービス ──
  get googleCalendar(): IGoogleCalendarService { return requireService(this._googleCalendar, "GoogleCalendarService"); }
  setGoogleCalendarService(service: IGoogleCalendarService): void { this._googleCalendar = service; }

  // ── Todo サービス ──
  get todos(): ITodoService { return requireService(this._todos, "TodoService"); }
  setTodoService(service: ITodoService): void { this._todos = service; }
}

// ────────────────────────────────────────────
// シングルトンインスタンスのエクスポート
// ────────────────────────────────────────────

/**
 * アプリ全体で共有される唯一の ServiceProvider インスタンス。
 * `new ServiceProviderImpl()` はここで1回だけ実行される（シングルトンパターン）。
 *
 * 使い方:
 *   import { ServiceProvider } from "@/services/ServiceProvider";
 *   const user = await ServiceProvider.users.getUser(uid);
 */
export const ServiceProvider = new ServiceProviderImpl();
