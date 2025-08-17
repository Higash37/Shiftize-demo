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
    console.error("Firebase configuration missing required environment variables");
    console.error("Current config:", firebaseConfig);
    throw new Error("Firebase configuration is incomplete");
  }

  // アプリ初期化
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

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
    firebaseConfig,
  };
})();

// Firebase認証とデータベース参照をエクスポート
export const auth = FirebaseCore.auth;
export const db = FirebaseCore.db;
export const storage = FirebaseCore.storage;
export const app = FirebaseCore.app;
export const firebaseConfig = FirebaseCore.firebaseConfig;
