/**
 * API リクエスト型定義
 * バックエンド移行時に使用される統一リクエスト形式
 */

// =============================================================================
// 基本リクエスト型
// =============================================================================

/**
 * ページネーションパラメータ
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * フィルタリングパラメータ
 */
export interface FilterParams {
  storeId?: string;
  userId?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
}

// =============================================================================
// シフト関連リクエスト型
// =============================================================================

/**
 * シフト一覧取得パラメータ
 */
export interface GetShiftsParams extends PaginationParams, FilterParams {}

/**
 * シフト作成リクエスト
 */
export interface CreateShiftRequest {
  userId: string;
  storeId: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: 'user' | 'class' | 'staff';
  subject?: string;
  classes?: Array<{
    startTime: string;
    endTime: string;
  }>;
  extendedTasks?: Array<{
    taskId: string;
    startTime: string;
    endTime: string;
  }>;
}

/**
 * シフト更新リクエスト
 */
export interface UpdateShiftRequest {
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  subject?: string;
  classes?: Array<{
    startTime: string;
    endTime: string;
  }>;
  extendedTasks?: Array<{
    taskId: string;
    startTime: string;
    endTime: string;
  }>;
}

/**
 * シフト一括処理リクエスト
 */
export interface BatchShiftRequest {
  action: 'approve' | 'reject' | 'delete';
  shiftIds: string[];
  reason?: string; // reject の場合
}

/**
 * シフト変更申請リクエスト
 */
export interface RequestShiftChangeRequest {
  shiftId: string;
  changes: {
    date?: string;
    startTime?: string;
    endTime?: string;
    subject?: string;
  };
  reason?: string;
}

// =============================================================================
// 認証関連リクエスト型
// =============================================================================

/**
 * ログインリクエスト
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * トークン更新リクエスト
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * パスワード変更リクエスト
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// =============================================================================
// 多店舗管理関連リクエスト型
// =============================================================================

/**
 * 店舗連携リクエスト
 */
export interface ConnectStoreRequest {
  fromStoreId: string;
  toStoreId: string;
  connectionPassword: string;
}

/**
 * 店舗連携解除リクエスト
 */
export interface DisconnectStoreRequest {
  fromStoreId: string;
  toStoreId: string;
}

/**
 * ユーザー招待リクエスト
 */
export interface InviteUserRequest {
  email: string;
  storeId: string;
  role: 'master' | 'user';
  nickname: string;
}

// =============================================================================
// タスク関連リクエスト型
// =============================================================================

/**
 * タスク一覧取得パラメータ
 */
export interface GetTasksParams extends PaginationParams {
  storeId?: string;
  type?: string[];
  isActive?: boolean;
}

/**
 * タスク作成リクエスト
 */
export interface CreateTaskRequest {
  title: string;
  shortName?: string;
  description: string;
  type: 'standard' | 'time_specific' | 'custom' | 'user_defined' | 'class';
  baseTimeMinutes: number;
  baseCountPerShift: number;
  restrictedTimeRanges?: Array<{
    startTime: string;
    endTime: string;
  }>;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'low' | 'medium' | 'high';
  color?: string;
  icon?: string;
  storeId: string;
}

/**
 * タスク更新リクエスト
 */
export interface UpdateTaskRequest {
  title?: string;
  shortName?: string;
  description?: string;
  baseTimeMinutes?: number;
  baseCountPerShift?: number;
  restrictedTimeRanges?: Array<{
    startTime: string;
    endTime: string;
  }>;
  priority?: 'low' | 'medium' | 'high';
  difficulty?: 'low' | 'medium' | 'high';
  color?: string;
  icon?: string;
  isActive?: boolean;
}

// =============================================================================
// 通知関連リクエスト型
// =============================================================================

/**
 * 通知送信リクエスト
 */
export interface SendNotificationRequest {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/**
 * FCMトークン登録リクエスト
 */
export interface RegisterTokenRequest {
  token: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceId?: string;
}

/**
 * 通知設定更新リクエスト
 */
export interface UpdateNotificationSettingsRequest {
  shiftApproval: boolean;
  shiftRejection: boolean;
  newShiftAssignment: boolean;
  scheduleChanges: boolean;
  reminders: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

// =============================================================================
// 給与計算関連リクエスト型
// =============================================================================

/**
 * 給与計算リクエスト
 */
export interface CalculateWageRequest {
  shiftId: string;
  hourlyWage?: number;
}

/**
 * 給与レポート取得パラメータ
 */
export interface GetWageReportParams {
  userId: string;
  storeId: string;
  dateFrom: string;
  dateTo: string;
  format?: 'json' | 'csv' | 'pdf';
}

// =============================================================================
// ファイル関連リクエスト型
// =============================================================================

/**
 * ファイルアップロードリクエスト
 */
export interface UploadFileRequest {
  file: File | Blob;
  fileName: string;
  fileType: string;
  category: 'profile' | 'document' | 'report' | 'other';
  storeId: string;
}