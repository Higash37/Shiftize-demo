/**
 * シフト管理 API サービス
 * 
 * フェーズ1: Firebase直接呼び出しのラッパー
 * フェーズ2以降: 実際のAPIエンドポイントに移行
 */

import { Shift } from '@/common/common-models/ModelIndex';
import { ShiftHistoryActor } from '@/services/shift-history/shiftHistoryLogger';
import { ShiftService } from '@/services/firebase/firebase-shift';
import {
  GetShiftsParams,
  CreateShiftRequest,
  UpdateShiftRequest,
  BatchShiftRequest,
  RequestShiftChangeRequest
} from './api-contracts/api-requests';
import {
  GetShiftsResponse,
  GetShiftResponse,
  CreateShiftResponse,
  UpdateShiftResponse,
  DeleteShiftResponse,
  APIErrorResponse
} from './api-contracts/api-responses';
import { apiCache } from './apiCache';

/**
 * 環境変数による段階的移行制御
 * React Native/Expoでは直接的な環境変数アクセスを使用
 */
// @ts-ignore - Expo環境変数は実行時に利用可能
const USE_API_ENDPOINTS = __DEV__ ? false : false; // フェーズ1では常にFirebaseを使用
// @ts-ignore - Expo環境変数は実行時に利用可能
const API_BASE_URL = '';

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
  static async createShift(shiftData: CreateShiftRequest, actor?: ShiftHistoryActor): Promise<string> {
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
        return await ShiftService.addShift(shiftData as Omit<Shift, 'id'>, actor);
      }
    } catch (error) {
      throw this.handleError(error, 'シフトの作成に失敗しました');
    }
  }

  /**
   * シフトを更新
   */
  static async updateShift(shiftId: string, updateData: UpdateShiftRequest, actor?: ShiftHistoryActor): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI(`/api/shifts/${shiftId}`, {
          method: 'PUT',
          body: updateData
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        await ShiftService.updateShift(shiftId, updateData as Partial<Shift>, actor);
      }
    } catch (error) {
      throw this.handleError(error, 'シフトの更新に失敗しました');
    }
  }

  /**
   * シフトを削除
   */
  static async deleteShift(shiftId: string, deletedBy?: { nickname: string; userId: string }, reason?: string, actor?: ShiftHistoryActor): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI(`/api/shifts/${shiftId}`, {
          method: 'DELETE',
          body: { deletedBy, reason },
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        const historyActor = actor ?? (deletedBy
          ? { userId: deletedBy.userId || "", nickname: deletedBy.nickname || "", role: 'master' as const }
          : undefined);
        await ShiftService.markShiftAsDeleted(shiftId, historyActor, reason);
      }
    } catch (error) {
      throw this.handleError(error, 'シフトの削除に失敗しました');
    }
  }

  /**
   * シフト変更を承認
   */
  static async approveShiftChanges(shiftId: string, actor?: ShiftHistoryActor): Promise<void> {
    try {
      if (USE_API_ENDPOINTS) {
        // フェーズ2以降: APIエンドポイント
        await this.fetchFromAPI(`/api/shifts/${shiftId}/approve`, {
          method: 'POST'
        });
      } else {
        // フェーズ1: Firebase直接呼び出し
        await ShiftService.approveShiftChanges(shiftId, actor);
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
    comments: string,
    actor?: ShiftHistoryActor
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
        await ShiftService.updateShiftWithTasks(shiftId, tasks, comments, actor);
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
   * キャッシュ機能と重複リクエスト防止機能を統合
   */
  private static async fetchFromAPI(endpoint: string, options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, any>;
    body?: Record<string, any>;
    headers?: Record<string, string>;
    skipCache?: boolean; // キャッシュをスキップするオプション
  }): Promise<any> {
    try {
      const cacheKey = `${options.method}:${endpoint}:${JSON.stringify(options.params || {})}`;

      // GETリクエストの場合、キャッシュから取得を試みる
      if (options.method === 'GET' && !options.skipCache) {
        const cached = apiCache.get(endpoint, options.method, options.params);
        if (cached !== null) {
          return cached;
        }

        // 重複リクエストをチェック
        const pendingRequest = apiCache.getPendingRequest(cacheKey);
        if (pendingRequest) {
          return await pendingRequest;
        }
      }

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
      
      // API リクエスト実行（Promiseを作成して重複リクエスト防止に登録）
      const requestPromise = (async () => {
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
        const data = result.data !== undefined ? result.data : result;
        
        // GETリクエストの場合、キャッシュに保存
        if (options.method === 'GET' && !options.skipCache) {
          apiCache.set(endpoint, options.method, data, options.params);
        }
        
        // POST/PUT/DELETEの場合、関連するキャッシュをクリア
        if (['POST', 'PUT', 'DELETE'].includes(options.method)) {
          // エンドポイントに関連するキャッシュをクリア
          // 例: /api/shifts へのPOST/PUT/DELETEの場合、/api/shifts のGETキャッシュをクリア
          apiCache.clear(endpoint, 'GET');
        }
        
        return data;
      })();

      // GETリクエストの場合、重複リクエスト防止に登録
      if (options.method === 'GET' && !options.skipCache) {
        apiCache.setPendingRequest(cacheKey, requestPromise);
      }
      
      return await requestPromise;
      
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

