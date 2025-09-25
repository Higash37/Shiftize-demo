// @ts-ignore
import packageJson from "../../../../package.json";

/**
 * アプリのバージョン情報を管理するユーティリティ
 */
export class AppVersion {
  /**
   * package.jsonからバージョンを取得
   */
  static getVersion(): string {
    return packageJson.version;
  }

  /**
   * バージョンをフォーマット済み文字列で取得
   */
  static getFormattedVersion(): string {
    return `Version ${packageJson.version}`;
  }

  /**
   * アプリ名を取得
   */
  static getAppName(): string {
    return "Shiftize -シフタイズ-";
  }

  /**
   * アプリの完全な情報を取得
   */
  static getAppInfo() {
    return {
      name: this.getAppName(),
      version: this.getVersion(),
      formattedVersion: this.getFormattedVersion(),
    };
  }
}