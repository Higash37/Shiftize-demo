/**
 * @file onboarding.ts
 * @description オンボーディング（初回起動時の案内画面）の完了状態をローカルに永続化するモジュール。
 *
 * 【このファイルの位置づけ】
 * アプリを初めて起動したユーザーにはオンボーディング画面を表示し、
 * 完了したら二度と表示しない。この「完了したかどうか」の情報を
 * AsyncStorage（ブラウザのlocalStorage相当）に保存する。
 *
 *   アプリ起動
 *        ↓ isOnboardingCompleted() で確認
 *   OnboardingStorage（★このファイル）
 *        ↓ 読み書き
 *   AsyncStorage（@react-native-async-storage/async-storage）
 *        ↓
 *   ブラウザのlocalStorage / ネイティブのKeyValueStore
 *
 * 【AsyncStorageとは】
 * React Native向けのキーバリューストア。
 * ブラウザ（Web版）では内部的にlocalStorageを使う。
 * 非同期API（async/await）で読み書きする。
 * アプリを閉じてもデータは消えない（永続化）。
 *
 * 【staticメソッドとは】
 * インスタンスを作らなくても OnboardingStorage.isOnboardingCompleted() のように
 * クラス名から直接呼べるメソッド。ユーティリティ的な使い方に適している。
 */

// AsyncStorage: React Native向けの永続化ストレージライブラリ
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * AsyncStorageに保存する際のキー名。
 * "@" プレフィックスは慣例で、アプリ固有のキーであることを示す。
 */
const ONBOARDING_KEY = "@onboarding_completed";

/**
 * OnboardingStorage: オンボーディングの完了状態を管理するユーティリティクラス。
 * 全メソッドが static なので、インスタンス化せずに使用する。
 */
export class OnboardingStorage {
  /**
   * setOnboardingCompleted: オンボーディングを完了済みとしてマークする。
   * オンボーディング画面の最後のステップで呼ぶ。
   *
   * AsyncStorage.setItem(key, value) でキーバリューペアを保存する。
   * 値は文字列のみ対応のため、boolean の true を文字列 "true" として保存する。
   */
  static async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (error) {
      // AsyncStorageの書き込み失敗は致命的ではないためエラーを握りつぶす。
      // 次回起動時にオンボーディングが再表示されるだけで、データは失われない。
    }
  }

  /**
   * isOnboardingCompleted: オンボーディングが完了済みかどうかを確認する。
   * アプリ起動時にこの関数を呼んで、完了済みならオンボーディングをスキップする。
   *
   * AsyncStorage.getItem(key) で値を取得する。
   * キーが存在しない場合は null が返る。
   *
   * @returns Promise<boolean> - true: 完了済み、false: 未完了またはエラー
   */
  static async isOnboardingCompleted(): Promise<boolean> {
    try {
      // AsyncStorageから値を取得（存在しなければnull）
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      // 文字列 "true" と厳密比較。null や他の文字列なら false
      const isCompleted = value === "true";

      return isCompleted;
    } catch (error) {
      // 読み取りエラー時は「未完了」として扱う（安全側に倒す）
      return false;
    }
  }

  /**
   * clearOnboardingStatus: オンボーディングの完了状態をリセットする。
   * デバッグ用途やアカウントリセット時に使用する。
   * リセット後、次回起動時にオンボーディングが再表示される。
   *
   * AsyncStorage.removeItem(key) で指定キーのデータを削除する。
   */
  static async clearOnboardingStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      // 削除失敗は致命的ではないためエラーを握りつぶす
    }
  }
}
