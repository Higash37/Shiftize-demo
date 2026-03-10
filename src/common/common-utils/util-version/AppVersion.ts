/**
 * @file AppVersion.ts
 * @description アプリのバージョン情報を管理するユーティリティクラス。
 *              package.json からバージョン番号を直接読み込み、アプリ内に表示する。
 *
 * 【このファイルの位置づけ】
 * - 設定画面やフッター等でバージョン表示に使用される
 * - package.json を直接インポートしてバージョン番号を取得する
 * - npm run release:patch/minor/major で package.json のバージョンが更新されると、
 *   このクラスの出力も自動的に変わる
 * - 関連ファイル: package.json（バージョン番号の管理元）
 *
 * 【セマンティックバージョニング（SemVer）】
 * バージョン番号は major.minor.patch の形式（例: 1.2.3）
 * - major: 破壊的変更（互換性のない変更）時にインクリメント
 * - minor: 後方互換性のある新機能追加時にインクリメント
 * - patch: バグ修正時にインクリメント
 *
 * 【@ts-ignore の解説】
 * TypeScriptはデフォルトでJSONファイルのインポートに型チェックを行う。
 * package.json にはモジュール型宣言がないため、@ts-ignore で
 * 型チェックエラーを意図的に無視している。
 * resolveJsonModule が tsconfig.json で有効な場合は不要になる。
 */

// @ts-ignore → 次の行のTypeScriptエラーを無視する指示
// package.json を直接インポート（JSONモジュール）
import packageJson from "../../../../package.json";

/**
 * AppVersion - アプリのバージョン情報を管理するクラス
 *
 * 全メソッドが static（静的メソッド）のため、インスタンス化不要。
 * AppVersion.getVersion() のようにクラス名で直接呼び出す。
 */
export class AppVersion {
  /**
   * getVersion - package.json からバージョン番号を取得する
   *
   * @returns バージョン番号の文字列（例: "1.2.3"）
   */
  static getVersion(): string {
    // packageJson.version → package.json の "version" フィールドの値
    return packageJson.version;
  }

  /**
   * getFormattedVersion - フォーマット済みバージョン文字列を取得する
   *
   * UI表示用に "Version " プレフィックスを付けた文字列を返す。
   *
   * @returns フォーマット済み文字列（例: "Version 1.2.3"）
   */
  static getFormattedVersion(): string {
    return `Version ${packageJson.version}`;
  }

  /**
   * getAppName - アプリ名を取得する
   *
   * @returns アプリ名の文字列
   */
  static getAppName(): string {
    return "Shiftize -シフタイズ-";
  }

  /**
   * getAppInfo - アプリの完全な情報をオブジェクトで取得する
   *
   * 名前、バージョン、フォーマット済みバージョンをまとめて返す。
   *
   * 【this の解説】
   * static メソッド内の this はクラス自体を指す（インスタンスではない）。
   * this.getAppName() = AppVersion.getAppName() と同じ。
   *
   * @returns { name, version, formattedVersion } オブジェクト
   */
  static getAppInfo() {
    return {
      name: this.getAppName(),
      version: this.getVersion(),
      formattedVersion: this.getFormattedVersion(),
    };
  }
}
