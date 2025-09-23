/**
 * Firebase コア設定モジュール
 *
 * Firebaseの初期化と基本的なサービス (認証、データベース) へのアクセスを提供します。
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { Platform } from "react-native";

/**
 * Firebase初期化とコア設定
 */
const FirebaseCore = (() => {
  // 環境変数から設定を取得
  const firebaseConfig = {
    apiKey: process.env["EXPO_PUBLIC_FIREBASE_API_KEY"] || "",
    authDomain: process.env["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"] || "",
    projectId: process.env["EXPO_PUBLIC_FIREBASE_PROJECT_ID"] || "",
    storageBucket: process.env["EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"] || "",
    messagingSenderId: process.env["EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] || "",
    appId: process.env["EXPO_PUBLIC_FIREBASE_APP_ID"] || "",
  };

  // 必須環境変数の検証
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    // Silent error handling for Firebase configuration
    throw new Error("Firebase configuration is incomplete");
  }

  // アプリ初期化
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const functions = getFunctions(app, 'asia-northeast1');

  // Analytics・Performance（Lazy Loading）
  let analytics: any = null;
  let performance: any = null;

  // 必要時にのみ動的ロード
  const getAnalyticsInstance = async () => {
    if (Platform.OS === "web" && !analytics) {
      try {
        const { getAnalytics, isSupported } = await import("firebase/analytics");
        const supported = await isSupported();
        if (supported) {
          analytics = getAnalytics(app);
        }
      } catch (error) {
        // Analytics not supported
      }
    }
    return analytics;
  };

  const getPerformanceInstance = async () => {
    if (Platform.OS === "web" && !performance) {
      try {
        const { getPerformance } = await import("firebase/performance");
        performance = getPerformance(app);
      } catch (error) {
        // Performance monitoring disabled
      }
    }
    return performance;
  };

  // Web環境での認証永続化設定
  if (Platform.OS === "web") {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      // Authentication persistence setup failed
    });
  }

  return {
    app,
    auth,
    db,
    storage,
    functions,
    getAnalyticsInstance,
    getPerformanceInstance,
    firebaseConfig,
  };
})();

// Firebase認証とデータベース参照をエクスポート
export const auth = FirebaseCore.auth;
export const db = FirebaseCore.db;
export const storage = FirebaseCore.storage;
export const functions = FirebaseCore.functions;
export const getAnalytics = FirebaseCore.getAnalyticsInstance;
export const getPerformance = FirebaseCore.getPerformanceInstance;
export const app = FirebaseCore.app;
export const firebaseConfig = FirebaseCore.firebaseConfig;
