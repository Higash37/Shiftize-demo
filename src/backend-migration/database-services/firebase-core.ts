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
  // プライベート設定 - 実際の環境変数を使用
  const firebaseConfig = {
    apiKey: "AIzaSyDntgFz1JPkTqQ1kmsEV5qMro4gcq--hDA",
    authDomain: "shiftschedulerapp-71104.firebaseapp.com",
    projectId: "shiftschedulerapp-71104",
    storageBucket: "shiftschedulerapp-71104.firebasestorage.app",
    messagingSenderId: "518760996591",
    appId: "1:518760996591:web:b3bd6c7cbf1da277f6051a",
  };

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
