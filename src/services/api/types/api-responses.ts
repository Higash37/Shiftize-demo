/**
 * API レスポンス型定義
 * バックエンド移行時に使用される統一レスポンス形式
 */

/**
 * 基本APIレスポンス形式
 */
export interface BaseAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * ページネーション付きレスポンス
 */
export interface PaginatedAPIResponse<T = any> extends BaseAPIResponse<T[]> {
  pagination: PaginationInfo;
}

/**
 * エラーレスポンス詳細
 */
export interface APIErrorResponse extends BaseAPIResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: Record<string, any>;
}

/**
 * 成功レスポンス
 */
export interface APISuccessResponse<T = any> extends BaseAPIResponse<T> {
  success: true;
  data: T;
}

// =============================================================================
// シフト関連レスポンス型
// =============================================================================

/**
 * シフト一覧取得レスポンス
 */
export interface GetShiftsResponse extends APISuccessResponse<any[]> {
  data: any[]; // Shift[] 型は既存の型定義を使用
}

/**
 * シフト詳細取得レスポンス
 */
export interface GetShiftResponse extends APISuccessResponse<any> {
  data: any; // Shift 型は既存の型定義を使用
}

/**
 * シフト作成レスポンス
 */
export interface CreateShiftResponse extends APISuccessResponse<string> {
  data: string; // 作成されたシフトのID
}

/**
 * シフト更新レスポンス
 */
export interface UpdateShiftResponse extends APISuccessResponse<null> {
  data: null;
  message: string;
}

/**
 * シフト削除レスポンス
 */
export interface DeleteShiftResponse extends APISuccessResponse<null> {
  data: null;
  message: string;
}

// =============================================================================
// 認証関連レスポンス型
// =============================================================================

/**
 * ログインレスポンス
 */
export interface LoginResponse extends APISuccessResponse<{
  user: any; // User 型は既存の型定義を使用
  token: string;
  refreshToken?: string;
  expiresIn: number;
}> {}

/**
 * トークン検証レスポンス
 */
export interface VerifyTokenResponse extends APISuccessResponse<{
  valid: boolean;
  user?: any; // User 型は既存の型定義を使用
  expiresAt?: string;
}> {}

// =============================================================================
// 多店舗管理関連レスポンス型
// =============================================================================

/**
 * 店舗アクセス権限取得レスポンス
 */
export interface GetStoreAccessResponse extends APISuccessResponse<any> {
  data: any; // UserStoreAccess 型は既存の型定義を使用
}

/**
 * 店舗連携レスポンス
 */
export interface ConnectStoreResponse extends APISuccessResponse<{
  connectionId: string;
  status: 'pending' | 'approved' | 'rejected';
}> {}

// =============================================================================
// タスク関連レスポンス型
// =============================================================================

/**
 * タスク一覧取得レスポンス
 */
export interface GetTasksResponse extends APISuccessResponse<any[]> {
  data: any[]; // ExtendedTask[] 型は既存の型定義を使用
}

/**
 * タスク作成レスポンス
 */
export interface CreateTaskResponse extends APISuccessResponse<string> {
  data: string; // 作成されたタスクのID
}

// =============================================================================
// 通知関連レスポンス型
// =============================================================================

/**
 * 通知送信レスポンス
 */
export interface SendNotificationResponse extends APISuccessResponse<{
  successCount: number;
  failureCount: number;
  results: Array<{
    userId: string;
    success: boolean;
    error?: string;
  }>;
}> {}

/**
 * FCMトークン登録レスポンス
 */
export interface RegisterTokenResponse extends APISuccessResponse<null> {
  data: null;
  message: string;
}

// =============================================================================
// 給与計算関連レスポンス型
// =============================================================================

/**
 * 給与計算レスポンス
 */
export interface CalculateWageResponse extends APISuccessResponse<{
  totalMinutes: number;
  totalWage: number;
  details: Array<{
    type: string;
    minutes: number;
    wage: number;
  }>;
}> {}

/**
 * 給与レポートレスポンス
 */
export interface WageReportResponse extends APISuccessResponse<{
  period: {
    start: string;
    end: string;
  };
  totalWage: number;
  shifts: Array<{
    shiftId: string;
    date: string;
    wage: number;
    minutes: number;
  }>;
}> {}