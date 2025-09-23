/**
 * バージョン管理とアプリ自動更新システム
 * 
 * デプロイ後に既存ユーザーのアプリを自動更新する仕組み
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/firebase-core';

// アプリのバージョン（package.jsonから取得するか、環境変数で管理）
const CURRENT_VERSION = '1.0.1'; // デプロイ時に更新

interface AppVersion {
  version: string;
  forceUpdate: boolean;
  updateMessage?: string;
  updatedAt: Date;
}

export class VersionManager {
  private static readonly VERSION_KEY = 'app_version';
  private static readonly CHECK_INTERVAL = 60000; // 1分ごとにチェック
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * バージョンチェックを開始
   */
  static async startVersionCheck(onUpdateRequired?: () => void) {
    // 既存のインターバルをクリア
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // 初回チェック
    await this.checkVersion(onUpdateRequired);

    // 定期チェック開始
    this.intervalId = setInterval(async () => {
      await this.checkVersion(onUpdateRequired);
    }, this.CHECK_INTERVAL);
  }

  /**
   * バージョンチェックを停止
   */
  static stopVersionCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 現在のバージョンをチェック
   */
  private static async checkVersion(onUpdateRequired?: () => void) {
    try {
      // Firestoreから最新バージョン情報を取得
      const versionDoc = await getDoc(doc(db, 'settings', 'app_version'));
      
      if (versionDoc.exists()) {
        const data = versionDoc.data() as AppVersion;
        
        // バージョン比較
        if (this.isUpdateRequired(CURRENT_VERSION, data.version)) {
          
          // 強制アップデート or 通知
          if (data.forceUpdate) {
            this.forceReload(data.updateMessage);
          } else if (onUpdateRequired) {
            onUpdateRequired();
          }
        }
      }
    } catch (error) {
      // Silent error handling for version check
    }
  }

  /**
   * バージョン比較
   */
  private static isUpdateRequired(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      
      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    
    return false;
  }

  /**
   * 強制リロード（キャッシュクリア付き）
   */
  private static forceReload(message?: string) {
    if (message) {
      alert(message || '新しいバージョンが利用可能です。アプリを再読み込みします。');
    }

    // Service Workerのキャッシュをクリア
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }

    // キャッシュを無視してリロード
    setTimeout(() => {
      // クエリパラメータを追加してキャッシュ回避
      const timestamp = new Date().getTime();
      const url = new URL(window.location.href);
      url.searchParams.set('v', timestamp.toString());
      window.location.href = url.toString();
    }, 100);
  }

  /**
   * ローカルストレージのバージョンを更新
   */
  static updateLocalVersion(version: string) {
    localStorage.setItem(this.VERSION_KEY, version);
  }

  /**
   * ローカルストレージのバージョンを取得
   */
  static getLocalVersion(): string | null {
    return localStorage.getItem(this.VERSION_KEY);
  }

  /**
   * アプリ起動時のバージョンチェック（即座に実行）
   */
  static async checkForUpdatesOnStartup(): Promise<boolean> {
    try {
      const versionDoc = await getDoc(doc(db, 'settings', 'app_version'));
      
      if (versionDoc.exists()) {
        const data = versionDoc.data() as AppVersion;
        
        if (this.isUpdateRequired(CURRENT_VERSION, data.version)) {
          if (data.forceUpdate) {
            // 強制アップデート
            this.forceReload(data.updateMessage);
            return true;
          } else {
            // オプショナルアップデート
            const userChoice = confirm(
              data.updateMessage || '新しいバージョンが利用可能です。今すぐ更新しますか？'
            );
            
            if (userChoice) {
              this.forceReload();
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      // Silent error handling for startup version check
      return false;
    }
  }
}

/**
 * アプリのバージョン情報を更新（管理者用）
 */
export async function updateAppVersion(
  version: string,
  forceUpdate: boolean = false,
  updateMessage?: string
) {
  try {
    await setDoc(doc(db, 'settings', 'app_version'), {
      version,
      forceUpdate,
      updateMessage,
      updatedAt: new Date()
    });
    
  } catch (error) {
    // Silent error handling for version update
    throw error;
  }
}