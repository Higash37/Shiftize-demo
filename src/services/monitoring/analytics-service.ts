/**
 * Firebase Analytics・Performance監視サービス
 * 
 * アプリケーションの使用状況とパフォーマンスを追跡します。
 */

import { getAnalytics, getPerformance } from "../firebase/firebase-core";

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
  logEvent: async (event: AnalyticsEvent) => {
    try {
      const analyticsInstance = await getAnalytics();
      if (analyticsInstance) {
        const { logEvent } = await import("firebase/analytics");
        logEvent(analyticsInstance, event.name, event.parameters);
      }
    } catch (error) {
      // Silent error handling for analytics logging
    }
  },

  /**
   * ユーザープロパティを設定
   */
  setUserProperties: async (properties: UserProperties) => {
    try {
      const analyticsInstance = await getAnalytics();
      if (analyticsInstance) {
        const { setUserProperties } = await import("firebase/analytics");
        setUserProperties(analyticsInstance, properties);
      }
    } catch (error) {
      // Silent error handling for analytics user properties
    }
  },

  /**
   * ユーザーIDを設定
   */
  setUserId: async (userId: string) => {
    try {
      const analyticsInstance = await getAnalytics();
      if (analyticsInstance) {
        const { setUserId } = await import("firebase/analytics");
        setUserId(analyticsInstance, userId);
      }
    } catch (error) {
      // Silent error handling for analytics setUserId
    }
  },

  /**
   * ページビューを記録
   */
  logPageView: async (pageName: string, additionalData?: Record<string, any>) => {
    try {
      const analyticsInstance = await getAnalytics();
      if (analyticsInstance) {
        const { logEvent } = await import("firebase/analytics");
        logEvent(analyticsInstance, "page_view", {
          page_title: pageName,
          ...additionalData,
        });
      }
    } catch (error) {
      // Silent error handling for analytics logPageView
    }
  },

  /**
   * シフト操作イベント
   */
  logShiftAction: async (action: "create" | "edit" | "delete" | "view", shiftData?: any) => {
    try {
      const analyticsInstance = await getAnalytics();
      if (analyticsInstance) {
        const { logEvent } = await import("firebase/analytics");
        logEvent(analyticsInstance, "shift_action", {
          action_type: action,
          shift_count: shiftData?.count || 1,
          store_id: shiftData?.storeId,
        });
      }
    } catch (error) {
      // Silent error handling for analytics logShiftAction
    }
  },

  /**
   * エラーイベント
   */
  logError: async (errorName: string, errorMessage: string, errorStack?: string) => {
    try {
      const analyticsInstance = await getAnalytics();
      if (analyticsInstance) {
        const { logEvent } = await import("firebase/analytics");
        logEvent(analyticsInstance, "app_error", {
          error_name: errorName,
          error_message: errorMessage,
          error_stack: errorStack,
        });
      }
    } catch (error) {
      // Silent error handling for analytics logError
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
  startTrace: async (traceName: string) => {
    try {
      const performanceInstance = await getPerformance();
      if (performanceInstance) {
        const { trace } = await import("firebase/performance");
        const customTrace = trace(performanceInstance, traceName);
        customTrace.start();
        return customTrace;
      }
    } catch (error) {
      // Silent error handling for performance trace
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
    const traceInstance = await PerformanceService.startTrace(`data_load_${operationName}`);
    
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
  measureComponentLoad: async (componentName: string) => {
    return await PerformanceService.startTrace(`component_${componentName}`);
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