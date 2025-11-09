/**
 * APIキャッシュ管理ユーティリティ
 * 
 * GETリクエストのレスポンスをキャッシュし、重複リクエストを防ぎます。
 * キャッシュTTLはデフォルト5分です。
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

class APICache {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5分

  /**
   * キャッシュキーを生成
   */
  private generateCacheKey(
    endpoint: string,
    method: string,
    params?: Record<string, any>
  ): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}:${endpoint}:${paramsStr}`;
  }

  /**
   * キャッシュからデータを取得
   */
  get(
    endpoint: string,
    method: string,
    params?: Record<string, any>
  ): any | null {
    // GETリクエストのみキャッシュ対象
    if (method !== 'GET') {
      return null;
    }

    const key = this.generateCacheKey(endpoint, method, params);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // TTLチェック
    const age = Date.now() - cached.timestamp;
    if (age > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * キャッシュにデータを保存
   */
  set(
    endpoint: string,
    method: string,
    data: any,
    params?: Record<string, any>
  ): void {
    // GETリクエストのみキャッシュ対象
    if (method !== 'GET') {
      return;
    }

    const key = this.generateCacheKey(endpoint, method, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 特定のエンドポイントのキャッシュをクリア
   */
  clear(endpoint?: string, method?: string, params?: Record<string, any>): void {
    if (endpoint && method) {
      const key = this.generateCacheKey(endpoint, method, params);
      this.cache.delete(key);
    } else {
      // 全てのキャッシュをクリア
      this.cache.clear();
    }
  }

  /**
   * 期限切れのキャッシュを削除
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 重複リクエストを防ぐためのPromise管理
   */
  getPendingRequest(key: string): Promise<any> | undefined {
    return this.pendingRequests.get(key);
  }

  setPendingRequest(key: string, promise: Promise<any>): void {
    this.pendingRequests.set(key, promise);
    
    // リクエスト完了後にpendingRequestsから削除
    promise
      .then(() => {
        this.pendingRequests.delete(key);
      })
      .catch(() => {
        this.pendingRequests.delete(key);
      });
  }

  /**
   * キャッシュ統計情報を取得（デバッグ用）
   */
  getStats(): { size: number; pendingRequests: number } {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// シングルトンインスタンスをエクスポート
export const apiCache = new APICache();

