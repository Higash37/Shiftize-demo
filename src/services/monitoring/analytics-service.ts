/**
 * Firebase Analytics・Performance監視サービス
 * 
 * アプリケーションの使用状況とパフォーマンスを追跡します。
 */

import { logEvent, setUserProperties, setUserId } from "firebase/analytics";
import { trace } from "firebase/performance";
import { analytics, performance } from "../firebase/firebase-core";

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

export interface UserProperties {
  role?: string;
  store_id?: string;
  user_type?: string;
  [key: string]: string | undefined;
}

/**
 * Analytics監視サービス
 */
export const AnalyticsService = {
  /**
   * カスタムイベントを記録
   */
  logEvent: (event: AnalyticsEvent) => {
    if (analytics) {
      logEvent(analytics, event.name, event.parameters);
    }
  },

  /**
   * ユーザープロパティを設定
   */
  setUserProperties: (properties: UserProperties) => {
    if (analytics) {
      setUserProperties(analytics, properties);
    }
  },

  /**
   * ユーザーIDを設定
   */
  setUserId: (userId: string) => {
    if (analytics) {
      setUserId(analytics, userId);
    }
  },

  /**
   * ページビューを記録
   */
  logPageView: (pageName: string, additionalData?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, "page_view", {
        page_title: pageName,
        ...additionalData,
      });
    }
  },

  /**
   * シフト操作イベント
   */
  logShiftAction: (action: "create" | "edit" | "delete" | "view", shiftData?: any) => {
    if (analytics) {
      logEvent(analytics, "shift_action", {
        action_type: action,
        shift_count: shiftData?.count || 1,
        store_id: shiftData?.storeId,
      });
    }
  },

  /**
   * エラーイベント
   */
  logError: (errorName: string, errorMessage: string, errorStack?: string) => {
    if (analytics) {
      logEvent(analytics, "app_error", {
        error_name: errorName,
        error_message: errorMessage,
        error_stack: errorStack,
      });
    }
  },
};

/**
 * Performance監視サービス
 */
export const PerformanceService = {
  /**
   * カスタムトレースを開始
   */
  startTrace: (traceName: string) => {
    if (performance) {
      const customTrace = trace(performance, traceName);
      customTrace.start();
      return customTrace;
    }
    return null;
  },

  /**
   * データ読み込み時間を測定
   */
  measureDataLoad: async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const traceInstance = PerformanceService.startTrace(`data_load_${operationName}`);
    
    try {
      const result = await operation();
      
      if (traceInstance) {
        traceInstance.putAttribute("success", "true");
        traceInstance.stop();
      }
      
      return result;
    } catch (error) {
      if (traceInstance) {
        traceInstance.putAttribute("success", "false");
        traceInstance.putAttribute("error", String(error));
        traceInstance.stop();
      }
      
      AnalyticsService.logError(
        `DataLoad_${operationName}`,
        String(error),
        error instanceof Error ? error.stack : undefined
      );
      
      throw error;
    }
  },

  /**
   * API呼び出し時間を測定
   */
  measureAPICall: async <T>(
    apiCall: () => Promise<T>,
    apiName: string
  ): Promise<T> => {
    return PerformanceService.measureDataLoad(apiCall, `api_${apiName}`);
  },

  /**
   * コンポーネント読み込み時間を測定
   */
  measureComponentLoad: (componentName: string) => {
    return PerformanceService.startTrace(`component_${componentName}`);
  },
};

/**
 * 統合監視フック
 */
export const useMonitoring = () => {
  return {
    analytics: AnalyticsService,
    performance: PerformanceService,
    
    // 便利なメソッド
    trackPageView: AnalyticsService.logPageView,
    trackError: AnalyticsService.logError,
    measureOperation: PerformanceService.measureDataLoad,
  };
};