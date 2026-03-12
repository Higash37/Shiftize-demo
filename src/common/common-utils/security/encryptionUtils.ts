/**
 * @file encryptionUtils.ts
 * @description 個人情報暗号化ユーティリティ。
 *              AES-256暗号化、パスワードハッシュ化、セキュアストレージ管理、
 *              個人情報の暗号化/復号化、GDPR準拠のデータ削除機能を提供する。
 *
 * 【このファイルの位置づけ】
 * - Supabase + React Native 環境での安全なデータ暗号化を担当
 * - securityUtils.ts の SecurityLogger を使用してエラーを記録
 * - UserModel.ts の UserRole 型を使用
 * - 関連ファイル: securityUtils.ts（セキュリティログ）, supabase-client.ts（DB操作）
 *
 * 【暗号化の基本概念】
 * - AES-256: Advanced Encryption Standard の256ビット鍵版。
 *   現在最も広く使われている対称鍵暗号。同じ鍵で暗号化・復号化を行う
 * - PBKDF2: Password-Based Key Derivation Function 2。
 *   パスワードから暗号化鍵を導出する関数。総当たり攻撃を遅くする
 * - ソルト: ハッシュ化の際に追加するランダムなデータ。
 *   同じパスワードでも異なるハッシュ値になるため、レインボーテーブル攻撃を防ぐ
 *
 * 【なぜクライアントサイド暗号化が必要か】
 * 個人情報（実名、電話番号等）をデータベースに保存する際、
 * 万が一データベースが流出しても情報が読めないようにするため。
 *
 * ⚠️ セキュリティ注意:
 * - Web環境ではクライアントサイド暗号化は使用できない（鍵が安全に保管できないため）
 * - React Native環境でのみ expo-secure-store を使用して鍵を保管する
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import CryptoJS from "crypto-js";
import { SecurityLogger } from "./securityUtils";
import type { UserRole } from "@/common/common-models/model-user/UserModel";

// ============================================================================
// AES暗号化クラス
// ============================================================================

/**
 * AESEncryption - AES-256暗号化/復号化を提供するクラス
 *
 * 【AES-256 とは】
 * - AES = Advanced Encryption Standard（高度暗号化標準）
 * - 256 = 鍵の長さ（ビット数）。256ビット = 32バイト
 * - 対称鍵暗号: 暗号化と復号化に同じ鍵を使用する
 * - 2^256通りの鍵パターンがあり、総当たりでの解読は事実上不可能
 *
 * 【CryptoJS ライブラリ】
 * JavaScriptで暗号化処理を行うためのライブラリ。
 * AES、PBKDF2、SHA-256等の暗号アルゴリズムを提供する。
 */
export class AESEncryption {
  /**
   * generateKey - 暗号学的に安全な256ビット暗号化キーを生成する
   *
   * 【処理の詳細】
   * - CryptoJS.lib.WordArray.random(32) → 32バイト（256ビット）のランダムデータ生成
   * - .toString() → 16進数文字列に変換（64文字）
   *
   * @returns 64文字の16進数文字列（256ビットの暗号化キー）
   */
  static generateKey(): string {
    // 32バイト = 256ビット の暗号学的に安全なランダムキーを生成
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * encrypt - AES-256でテキストを暗号化する
   *
   * 【処理の詳細】
   * CryptoJS.AES.encrypt() は内部で以下を自動実行する:
   * 1. ランダムなソルト（塩）を生成
   * 2. ソルトとキーからOpenSSL互換の鍵導出（EVP_BytesToKey）
   * 3. ランダムなIV（初期化ベクトル）を生成
   * 4. AES-256-CBC モードで暗号化
   * 5. ソルト + IV + 暗号文を結合してBase64エンコード
   *
   * 【IV（初期化ベクトル）とは】
   * 暗号化ごとに異なるランダム値を使うことで、
   * 同じ平文を同じ鍵で暗号化しても毎回異なる暗号文になる。
   * これにより、暗号文のパターン分析を防ぐ。
   *
   * @param plaintext - 暗号化する平文テキスト
   * @param key - 暗号化キー
   * @returns Base64エンコードされた暗号文
   */
  static encrypt(plaintext: string, key: string): string {
    try {
      if (!plaintext || typeof plaintext !== "string") {
        throw new Error("無効な平文データです");
      }

      // AES暗号化を実行（自動でIV生成・ソルト付き）
      const encrypted = CryptoJS.AES.encrypt(plaintext, key);
      // .toString() → OpenSSL互換のBase64文字列に変換
      return encrypted.toString();
    } catch (error) {
      throw new Error(`暗号化に失敗しました: ${error}`);
    }
  }

  /**
   * decrypt - AES-256で暗号文を復号化する
   *
   * 【処理の詳細】
   * 1. Base64文字列からソルト・IV・暗号文を分離
   * 2. ソルトとキーから同じ鍵を導出
   * 3. AES-256-CBCモードで復号化
   * 4. UTF-8文字列に変換
   *
   * @param ciphertext - Base64エンコードされた暗号文
   * @param key - 復号化キー（暗号化時と同じキー）
   * @returns 復号化された平文テキスト
   */
  static decrypt(ciphertext: string, key: string): string {
    try {
      if (!ciphertext || typeof ciphertext !== "string") {
        throw new Error("無効な暗号化データです");
      }

      // AES復号化を実行
      const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, key);
      // CryptoJS.enc.Utf8 → バイト列をUTF-8文字列に変換
      const result = decryptedBytes.toString(CryptoJS.enc.Utf8);

      // 復号化結果が空の場合、キーが間違っているかデータが破損している
      if (!result) {
        throw new Error("復号化に失敗しました - 無効なキーまたはデータ");
      }

      return result;
    } catch (error) {
      throw new Error(`復号化に失敗しました: ${error}`);
    }
  }

  /**
   * deriveKeyFromPassword - パスワードから暗号化キーを導出する（PBKDF2）
   *
   * 【PBKDF2 とは】
   * Password-Based Key Derivation Function 2。
   * パスワードとソルトを使い、大量の計算（反復処理）を経て暗号化キーを生成する。
   * 反復回数が多いほど、総当たり攻撃のコストが高くなる。
   *
   * 【パラメータの意味】
   * - keySize: 256/32 → 256ビット÷32ビット = 8ワード（CryptoJSの単位）
   * - iterations: 10,000 → ハッシュ計算を10,000回繰り返す
   *   攻撃者が1つのパスワードを試すのに10,000倍の時間がかかる
   *
   * @param password - 元となるパスワード
   * @param salt - ソルト（ランダムな文字列）
   * @returns 導出された256ビットの暗号化キー（16進数文字列）
   */
  static deriveKeyFromPassword(password: string, salt: string): string {
    try {
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,   // 256ビット = 8ワード
        iterations: 10000,    // 10,000回反復（総当たり攻撃対策）
      });

      return key.toString();
    } catch (error) {
      throw new Error(`キー導出に失敗しました: ${error}`);
    }
  }

  /**
   * hashPassword - パスワードを安全にハッシュ化する（保存用）
   *
   * 【ハッシュ化 とは】
   * 元のデータから固定長のデータ（ハッシュ値）を生成する不可逆な変換。
   * ハッシュ値から元のパスワードを復元することはできない。
   * パスワードをデータベースに保存する際は、平文ではなくハッシュ値を保存する。
   *
   * 【ソルトの役割】
   * 同じパスワードでも異なるソルトを使えば異なるハッシュ値になる。
   * これにより、事前に計算されたハッシュ表（レインボーテーブル）での攻撃を防ぐ。
   *
   * 【保存形式: "ソルト:ハッシュ値"】
   * 検証時にソルトが必要なため、ソルトとハッシュ値をコロンで連結して保存する。
   *
   * @deprecated 新しい passwordUtils.ts の PasswordHasher を使用すること
   *
   * @param password - ハッシュ化するパスワード
   * @returns "ソルト:ハッシュ値" の形式の文字列
   */
  static hashPassword(password: string): string {
    try {
      if (!password || typeof password !== "string") {
        throw new Error("無効なパスワードです");
      }

      // 非推奨メソッドの使用を警告ログとして記録
      SecurityLogger.logEvent({
        type: "encryption_warning",
        details:
          "Deprecated hashPassword method used. Migrate to PasswordHasher.",
      });

      // ランダムソルト生成（128ビット = 16バイト）
      const salt = CryptoJS.lib.WordArray.random(16).toString();

      // PBKDF2でハッシュ化（100,000回反復 - 高セキュリティ設定）
      // 反復回数が多いほど安全だが、処理に時間がかかる
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000,  // 10万回反復（deriveKeyFromPasswordの10倍）
      });

      // "ソルト:ハッシュ値" の形式で返す
      return `${salt}:${hash.toString()}`;
    } catch (error) {
      throw new Error(`パスワードハッシュ化に失敗しました: ${error}`);
    }
  }

  /**
   * verifyPassword - ハッシュ化されたパスワードと入力パスワードを照合する
   *
   * 【処理の流れ】
   * 1. 保存された "ソルト:ハッシュ値" を分離
   * 2. 入力パスワードに同じソルトを使ってハッシュ化
   * 3. 2つのハッシュ値を比較
   *
   * @deprecated 新しい passwordUtils.ts の PasswordHasher を使用すること
   *
   * @param password - 検証するパスワード（ユーザー入力）
   * @param hashedPassword - 保存されたハッシュ値（"ソルト:ハッシュ値" 形式）
   * @returns パスワードが一致する場合 true
   */
  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      if (!password || !hashedPassword) {
        return false;
      }

      SecurityLogger.logEvent({
        type: "encryption_warning",
        details:
          "Deprecated verifyPassword method used. Migrate to PasswordHasher.",
      });

      // "ソルト:ハッシュ値" を分解代入で分離
      const [salt, hash] = hashedPassword.split(":");
      if (!salt || !hash) {
        return false;
      }

      // 同じソルトで入力パスワードをハッシュ化
      const inputHash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000,
      });

      // ⚠️ この比較は === を使っているため、タイミング攻撃に弱い
      // 本来は safeStringCompare() を使うべき
      return hash === inputHash.toString();
    } catch (error) {
      return false;
    }
  }
}

// ============================================================================
// 暗号化キー管理
// ============================================================================

/**
 * EncryptionKeyManager - 暗号化マスターキーの安全な管理クラス
 *
 * 【暗号化キーの管理方針】
 * - React Native（ネイティブ）: expo-secure-store で安全に保管
 *   → デバイスのセキュアエンクレーブ（ハードウェアレベルの暗号化ストレージ）を使用
 * - Web環境: 暗号化機能そのものを無効化
 *   → JavaScript変数にキーを保持しても、デベロッパーツールから参照可能なため安全でない
 *
 * 【キャッシュの目的】
 * SecureStoreへのアクセスは非同期処理で時間がかかるため、
 * 一度取得したキーをメモリにキャッシュして高速化する。
 */
class EncryptionKeyManager {
  /** SecureStoreに保存するキーの名前 */
  private static readonly KEY_NAME = "encryption_master_key";
  /** メモリキャッシュされたキー（パフォーマンス最適化） */
  private static cachedKey: string | null = null;

  /**
   * getOrCreateKey - マスター暗号化キーを取得、または新規作成する
   *
   * 【処理の流れ】
   * 1. Web環境の場合はエラー（暗号化不可）
   * 2. キャッシュにキーがあればそれを返す（高速パス）
   * 3. SecureStoreからキーを取得
   * 4. SecureStoreにキーがなければ新規生成して保存
   * 5. キーをキャッシュして返す
   *
   * 【async/await の解説】
   * - async → この関数が非同期であることを宣言
   * - await → Promiseの完了を待つ。SecureStoreの読み書きは非同期
   * - Promise<string> → 最終的にstring型の値を返すPromise
   *
   * @returns マスター暗号化キー
   * @throws Web環境の場合はエラー
   */
  static async getOrCreateKey(): Promise<string> {
    // Web環境ではクライアントサイド暗号化を禁止
    if (Platform.OS === "web") {
      throw new Error(
        "Web環境ではクライアントサイド暗号化は使用できません。サーバーサイド暗号化を使用してください。"
      );
    }

    // キャッシュがあればそれを返す（SecureStoreへの問い合わせを省略）
    if (this.cachedKey) {
      return this.cachedKey;
    }

    try {
      // SecureStoreからキーを取得（React Native環境のみ）
      let key = await SecureStore.getItemAsync(this.KEY_NAME);
      if (!key) {
        // キーが存在しない場合は新規生成して保存
        key = AESEncryption.generateKey();
        await SecureStore.setItemAsync(this.KEY_NAME, key);
      }
      this.cachedKey = key; // メモリにキャッシュ
      return key;
    } catch (error) {
      // SecureStoreが使えない場合のフォールバック
      // セッション限定（アプリを閉じると消える）のキーを生成
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Key retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      if (!this.cachedKey) {
        this.cachedKey = AESEncryption.generateKey();
      }
      return this.cachedKey;
    }
  }

  /**
   * clearKey - マスター暗号化キーを削除する
   *
   * ログアウト時やデータ削除時に呼び出す。
   * メモリキャッシュとSecureStoreの両方からキーを削除する。
   */
  static async clearKey(): Promise<void> {
    this.cachedKey = null; // メモリキャッシュをクリア
    try {
      if (Platform.OS === "web") {
        throw new Error("Web環境では暗号化キーの操作はできません");
      } else {
        await SecureStore.deleteItemAsync(this.KEY_NAME);
      }
    } catch (error) {
      // 削除エラーは無視（既に削除されている可能性がある）
      SecurityLogger.logEvent({
        type: "encryption_warning",
        userId: "system",
        details: `Key clearing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  }
}

// ============================================================================
// 暗号化する個人情報の型定義
// ============================================================================

/**
 * EncryptedPersonalInfo - 暗号化対象の個人情報の型定義
 *
 * 【暗号化対象フィールド（機密情報）】
 * - realName:    実名 → 暗号化してDB保存
 * - phoneNumber: 電話番号 → 暗号化してDB保存
 * - address:     住所 → 暗号化してDB保存
 * - notes:       個人メモ → 暗号化してDB保存
 *
 * 【暗号化しないフィールド（平文で保存）】
 * - nickname:     ニックネーム → アプリ内表示名のため平文でOK
 * - email:        メールアドレス → Supabase Authが管理するため平文
 * - birthdayYear: 誕生年 → 年のみなら個人特定が困難なため平文でOK
 * - role:         ユーザーロール → アクセス制御に使うため平文
 * - storeId:      店舗ID → 参照キーのため平文
 *
 * 【TypeScript構文の解説】
 * - `?` (オプショナル) → このプロパティは省略可能
 */
export interface EncryptedPersonalInfo {
  realName?: string;      // 実名（暗号化対象）
  phoneNumber?: string;   // 電話番号（暗号化対象）
  address?: string;       // 住所（暗号化対象）
  notes?: string;         // 個人メモ（暗号化対象）
  // 暗号化しないフィールド
  nickname: string;       // ニックネーム（平文OK）
  email: string;          // メールアドレス（Supabase Auth管理）
  birthdayYear?: number;  // 誕生年（年のみなら平文OK）
  role: UserRole;         // ユーザーロール（"master" | "teacher"等）
  storeId: string;        // 店舗ID
}

// ============================================================================
// 個人情報暗号化サービス
// ============================================================================

/**
 * PersonalInfoEncryption - 個人情報の暗号化・復号化サービスクラス
 *
 * 【暗号化の流れ】
 * 1. EncryptionKeyManager からマスターキーを取得
 * 2. 機密フィールド（実名、電話番号等）をAES-256で暗号化
 * 3. 暗号化フラグ（isEncrypted: true）と暗号化日時を付与
 * 4. 平文フィールドはそのまま保持
 * 5. Supabaseに保存
 *
 * 【復号化の流れ】
 * 1. isEncryptedフラグを確認（falseなら平文のまま返す）
 * 2. EncryptionKeyManagerから同じマスターキーを取得
 * 3. 暗号化フィールドをAES-256で復号化
 * 4. 復号化されたデータを返す
 */
export class PersonalInfoEncryption {
  /**
   * encryptPersonalInfo - 個人情報を暗号化してDB保存用に変換する
   *
   * @param data - 暗号化する個人情報
   * @returns 暗号化済みのデータオブジェクト（Supabase保存用）
   * @throws Web環境の場合、または暗号化に失敗した場合はエラー
   */
  static async encryptPersonalInfo(data: EncryptedPersonalInfo): Promise<any> {
    // Web環境では暗号化機能を使用禁止
    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    try {
      // マスターキーを取得（SecureStoreから）
      const key = await EncryptionKeyManager.getOrCreateKey();

      // 平文で保存するフィールド + メタデータを設定
      const result: any = {
        nickname: data.nickname,
        email: data.email,
        role: data.role,
        storeId: data.storeId,
        birthdayYear: data.birthdayYear,
        isEncrypted: true,                    // 暗号化済みフラグ
        encryptedAt: new Date().toISOString(), // 暗号化日時
      };

      // 機密情報をAES-256で暗号化（存在する場合のみ）
      if (data.realName) {
        result.realName = AESEncryption.encrypt(data.realName, key);
      }
      if (data.phoneNumber) {
        result.phoneNumber = AESEncryption.encrypt(data.phoneNumber, key);
      }
      if (data.address) {
        result.address = AESEncryption.encrypt(data.address, key);
      }
      if (data.notes) {
        result.notes = AESEncryption.encrypt(data.notes, key);
      }

      return result;
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Personal info encryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      throw new Error("個人情報の暗号化に失敗しました");
    }
  }

  /**
   * decryptPersonalInfo - DB取得データを復号化する
   *
   * isEncryptedフラグがfalseの場合（暗号化前のデータ）はそのまま返す。
   *
   * 【TypeScript構文の解説】
   * - `as EncryptedPersonalInfo` → 型アサーション。
   *   TypeScriptに「このデータはEncryptedPersonalInfo型である」と明示的に伝える
   *
   * @param encryptedData - Supabaseから取得した暗号化データ
   * @returns 復号化された個人情報
   */
  static async decryptPersonalInfo(
    encryptedData: any
  ): Promise<EncryptedPersonalInfo> {
    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    try {
      // 暗号化されていないデータ（移行前のデータ等）はそのまま返す
      if (!encryptedData.isEncrypted) {
        return encryptedData as EncryptedPersonalInfo;
      }

      // マスターキーを取得
      const key = await EncryptionKeyManager.getOrCreateKey();
      const result: EncryptedPersonalInfo = {
        nickname: encryptedData.nickname,
        email: encryptedData.email,
        role: encryptedData.role,
        storeId: encryptedData.storeId,
        birthdayYear: encryptedData.birthdayYear,
      };

      // 暗号化フィールドをAES-256で復号化
      if (encryptedData.realName) {
        result.realName = AESEncryption.decrypt(encryptedData.realName, key);
      }
      if (encryptedData.phoneNumber) {
        result.phoneNumber = AESEncryption.decrypt(
          encryptedData.phoneNumber,
          key
        );
      }
      if (encryptedData.address) {
        result.address = AESEncryption.decrypt(encryptedData.address, key);
      }
      if (encryptedData.notes) {
        result.notes = AESEncryption.decrypt(encryptedData.notes, key);
      }

      return result;
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Personal info decryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      throw new Error("個人情報の復号化に失敗しました");
    }
  }

  /**
   * secureDelete - 個人情報を安全に削除する（暗号化キーごと削除）
   *
   * 暗号化キーを削除すると、暗号化されたデータは復号化不可能になる。
   * データ本体がDBに残っていても、キーがなければ読めないため安全。
   * これは「暗号学的消去（Crypto Shredding）」と呼ばれる手法。
   */
  static async secureDelete(): Promise<void> {
    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    await EncryptionKeyManager.clearKey();
  }
}

// ============================================================================
// データ削除サービス（GDPR準拠）
// ============================================================================

/**
 * PersonalDataDeletion - ユーザーデータの完全削除サービス
 *
 * 【GDPR とは】
 * General Data Protection Regulation（一般データ保護規則）。
 * EU/EEAの個人情報保護法。以下の権利を保障する:
 * - 忘れられる権利（データ削除要求権）
 * - データポータビリティ権
 * - 処理制限権
 *
 * 【物理削除 vs 論理削除】
 * - 物理削除: DBからレコードを完全に削除（deleteUserData）
 * - 論理削除: deletedフラグを立てて非表示にする（deleteUserDataByAdmin）
 *   監査目的で削除した記録を残す必要がある場合に使用
 *
 * 【動的インポートの解説】
 * `await import("...")` → モジュールを実行時に読み込む。
 * 起動時に暗号化関連のモジュールを全て読み込むとパフォーマンスに影響するため、
 * データ削除という稀な操作の時だけsupabase-clientを読み込む。
 */
export class PersonalDataDeletion {
  /**
   * deleteUserData - ユーザー自身によるアカウントとデータの完全削除（物理削除）
   *
   * 【処理の流れ】
   * 1. 暗号化キーの削除（復号化不可にする）
   * 2. usersテーブルからユーザーデータを物理削除
   * 3. shiftsテーブルから関連シフトデータを物理削除
   * 4. セキュリティログに記録
   *
   * @param userId - 削除するユーザーのID
   * @param storeId - ユーザーが所属する店舗のID
   */
  static async deleteUserData(userId: string, storeId: string): Promise<void> {
    try {
      // 1. 暗号化キーを削除（暗号学的消去）
      await PersonalInfoEncryption.secureDelete();

      // 2. Supabaseクライアントを動的にインポート
      const { getSupabase } = await import("@/services/supabase/supabase-client");
      const supabase = getSupabase();

      // 3. usersテーブルからユーザーデータを物理削除
      // .delete() → DELETE文、.eq() → WHERE条件
      await supabase.from("users").delete().eq("uid", userId);

      // 4. shiftsテーブルから関連シフトデータを物理削除
      await supabase
        .from("shifts")
        .delete()
        .eq("user_id", userId)
        .eq("store_id", storeId);

      // 5. セキュリティログに記録
      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: userId,
        details: "User data deletion completed",
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      throw new Error(`データ削除に失敗しました: ${error}`);
    }
  }

  /**
   * deleteUserDataByAdmin - 管理者による他ユーザーのデータ削除（論理削除）
   *
   * 監査目的でデータの痕跡を残すため、物理削除ではなく論理削除を行う。
   * 個人情報フィールドはnullに更新し、deletedフラグをtrueにする。
   *
   * 【論理削除で設定するフィールド】
   * - deleted: true → 削除済みフラグ
   * - deleted_at: ISO日時文字列 → 削除日時
   * - deleted_by: 管理者のユーザーID → 誰が削除したか
   * - real_name, phone_number, address, notes: null → 個人情報をクリア
   *
   * @param targetUserId - 削除対象のユーザーID
   * @param storeId - ユーザーが所属する店舗のID
   * @param adminUserId - 削除操作を行った管理者のユーザーID
   */
  static async deleteUserDataByAdmin(
    targetUserId: string,
    storeId: string,
    adminUserId: string
  ): Promise<void> {
    try {
      const { getSupabase } = await import("@/services/supabase/supabase-client");
      const supabase = getSupabase();

      // ユーザーデータを論理削除 + 個人情報をnullに更新
      // .update() → UPDATE文
      await supabase
        .from("users")
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: adminUserId,
          real_name: null,      // 個人情報をクリア
          phone_number: null,   // 個人情報をクリア
          address: null,        // 個人情報をクリア
          notes: null,          // 個人情報をクリア
        })
        .eq("uid", targetUserId);

      // 関連シフトも論理削除
      await supabase
        .from("shifts")
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: adminUserId,
        })
        .eq("user_id", targetUserId)
        .eq("store_id", storeId);

      // セキュリティログに記録（誰が誰のデータを削除したか）
      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: adminUserId,
        details: `Admin deleted user data: ${targetUserId}`,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      throw new Error(`管理者によるデータ削除に失敗しました: ${error}`);
    }
  }
}
