/**
 * シフト管理 API サービス
 * 
 * フェーズ1: Firebase直接呼び出しのラッパー
 * フェーズ2以降: 実際のAPIエンドポイントに移行
 */

import { Shift } from '@/common/common-models/ModelIndex';
import { ShiftService } from '@/services/firebase/firebase-shift';
import {
  GetShiftsParams,
  CreateShiftRequest,
  UpdateShiftRequest,
  BatchShiftRequest,
  RequestShiftChangeRequest
} from './types/api-requests';
import {
  GetShiftsResponse,
  GetShiftResponse,
  CreateShiftResponse,
  UpdateShiftResponse,
  DeleteShiftResponse,
  APIErrorResponse
} from './types/api-responses';

/**
 * 環境変数による段階的移行制御
 */
const USE_API_ENDPOINTS = process.env.EXPO_PUBLIC_USE_SHIFT_API === 'true';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

export class ShiftAPIService {
  
  /**
   * シフト一覧を取得
   */
  static async getShifts(params: GetShiftsParams = {}): Promise<Shift[]> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: 実際のAPIエンドポイント呼び出し
        return await this.fetchFromAPI('/api/shifts', {
          method: 'GET',
          params
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        const { storeId } = params;
        return await ShiftService.getShifts(storeId);
      }
    } catch (error) {
      throw this.handleError(error, 'シフト一覧の取得に失敗しました');
    }
  }

  /**
   * 複数店舗のシフト一覧を取得
   */
  static async getShiftsFromMultipleStores(storeIds: string[]): Promise<Shift[]> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        return await this.fetchFromAPI('/api/shifts/multiple-stores', {
          method: 'POST',
          body: { storeIds }
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        return await ShiftService.getShiftsFromMultipleStores(storeIds);
      }
    } catch (error) {
      throw this.handleError(error, '複数店舗のシフト取得に失敗しました');
    }
  }

  /**
   * ユーザーがアクセス可能な全シフトを取得
   */
  static async getUserAccessibleShifts(userData: {
    storeId?: string;
    connectedStores?: string[];
  }): Promise<Shift[]> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        return await this.fetchFromAPI('/api/shifts/user-accessible', {
          method: 'POST',
          body: userData
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        return await ShiftService.getUserAccessibleShifts(userData);
      }
    } catch (error) {
      throw this.handleError(error, 'アクセス可能シフトの取得に失敗しました');
    }
  }

  /**
   * 新しいシフトを作成
   */
  static async createShift(shiftData: CreateShiftRequest): Promise<string> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        const response: CreateShiftResponse = await this.fetchFromAPI('/api/shifts', {
          method: 'POST',
          body: shiftData
        });
        return response.data;
      } else {
        // フェーズ1: Firebase直接呼び出し
        return await ShiftService.addShift(shiftData as Omit<Shift, 'id'>);
      }
    } catch (error) {
      throw this.handleError(error, 'シフトの作成に失敗しました');
    }
  }

  /**
   * シフトを更新
   */
  static async updateShift(shiftId: string, updateData: UpdateShiftRequest): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI(`/api/shifts/${shiftId}`, {
          method: 'PUT',
          body: updateData
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        await ShiftService.updateShift(shiftId, updateData as Partial<Shift>);
      }
    } catch (error) {
      throw this.handleError(error, 'シフトの更新に失敗しました');
    }
  }

  /**
   * シフトを削除
   */
  static async deleteShift(shiftId: string, deletedBy?: { nickname: string; userId: string }, reason?: string): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI(`/api/shifts/${shiftId}`, {
          method: 'DELETE',
          body: JSON.stringify({ deletedBy, reason })
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        await ShiftService.markShiftAsDeleted(shiftId, deletedBy, reason);
      }
    } catch (error) {
      throw this.handleError(error, 'シフトの削除に失敗しました');
    }
  }

  /**
   * シフト変更を承認
   */
  static async approveShiftChanges(shiftId: string): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI(`/api/shifts/${shiftId}/approve`, {
          method: 'POST'
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        await ShiftService.approveShiftChanges(shiftId);
      }
    } catch (error) {
      throw this.handleError(error, 'シフト変更の承認に失敗しました');
    }
  }

  /**
   * シフトを完了状態にする
   */
  static async markShiftAsCompleted(shiftId: string): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI(`/api/shifts/${shiftId}/complete`, {
          method: 'POST'
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        await ShiftService.markShiftAsCompleted(shiftId);
      }
    } catch (error) {
      throw this.handleError(error, 'シフト完了の更新に失敗しました');
    }
  }

  /**
   * シフトにタスク情報を追加
   */
  static async updateShiftWithTasks(
    shiftId: string,
    tasks: { [key: string]: { count: number; time: number } },
    comments: string
  ): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI(`/api/shifts/${shiftId}/tasks`, {
          method: 'PUT',
          body: { tasks, comments }
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        await ShiftService.updateShiftWithTasks(shiftId, tasks, comments);
      }
    } catch (error) {
      throw this.handleError(error, 'シフトタスクの更新に失敗しました');
    }
  }

  /**
   * シフト報告を保存
   */
  static async addShiftReport(
    shiftId: string,
    reportData: {
      taskCounts: Record<string, { count: number; time: number }>;
      comments: string;
    }
  ): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI('/api/shifts/reports', {
          method: 'POST',
          body: { shiftId, ...reportData }
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        await ShiftService.addShiftReport(shiftId, reportData);
      }
    } catch (error) {
      throw this.handleError(error, 'シフト報告の保存に失敗しました');
    }
  }

  // =============================================================================
  // プライベートヘルパーメソッド
  // =============================================================================

  /**
   * APIエンドポイントからデータを取得（フェーズ2実装完了）
   */
  private static async fetchFromAPI(endpoint: string, options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, any>;
    body?: Record<string, any>;
    headers?: Record<string, string>;
  }): Promise<any> {
    try {
      // 認証トークンを取得
      const auth = await import('@/services/auth/useAuth');
      const token = await auth.getAuthToken?.(); // 実装に依存
      
      // URL構築
      let url = `${API_BASE_URL}${endpoint}`;
      
      // GET パラメータの追加
      if (options.method === 'GET' && options.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        url += `?${searchParams.toString()}`;
      }
      
      // リクエスト設定
      const fetchOptions: RequestInit = {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      };
      
      // POST/PUT ボディの追加
      if (options.body && ['POST', 'PUT'].includes(options.method)) {
        fetchOptions.body = JSON.stringify(options.body);
      }
      
      
      // API リクエスト実行
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // APIレスポンスの形式確認
      if (result.success === false) {
        throw new Error(result.error || 'API request failed');
      }
      
      
      // dataプロパティがある場合はそれを返す、ない場合は全体を返す
      return result.data !== undefined ? result.data : result;
      
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * エラーハンドリング
   */
  private static handleError(error: any, defaultMessage: string): Error {
    
    // Firebase エラーの場合
    if (error?.code) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error('このシフトにアクセスする権限がありません');
        case 'not-found':
          throw new Error('指定されたシフトが見つかりません');
        case 'unavailable':
          throw new Error('サービスが一時的に利用できません。しばらく待ってから再試行してください');
        default:
          throw new Error(`${defaultMessage}: ${error.message}`);
      }
    }

    // その他のエラー
    if (error?.message) {
      throw new Error(`${defaultMessage}: ${error.message}`);
    }

    throw new Error(defaultMessage);
  }

  /**
   * デバッグ情報を取得
   */
  static getDebugInfo(): {
    useApiEndpoints: boolean;
    apiBaseUrl: string;
    service: string;
  } {
    return {
      useApiEndpoints: USE_API_ENDPOINTS,
      apiBaseUrl: API_BASE_URL,
      service: 'ShiftAPIService'
    };
  }
}