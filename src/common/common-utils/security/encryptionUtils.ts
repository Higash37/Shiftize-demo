/**
 * 個人情報暗号化ユーティリティ
 * Firebase + React Native 環境での安全なデータ暗号化
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';

// 本格的なAES暗号化 - 業界標準のセキュリティレベル
class AESEncryption {
  /**
   * 暗号学的に安全な256bit暗号化キーを生成
   */
  static generateKey(): string {
    // 32バイト = 256bit の暗号学的に安全なランダムキー
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * AES-256で暗号化（crypto-js標準・自動IV生成）
   */
  static encrypt(plaintext: string, key: string): string {
    try {
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('無効な平文データです');
      }

      // AES暗号化（自動でIV生成・塩つき）
      const encrypted = CryptoJS.AES.encrypt(plaintext, key);
      return encrypted.toString();
    } catch (error) {
      throw new Error(`暗号化に失敗しました: ${error}`);
    }
  }

  /**
   * AES-256で復号化
   */
  static decrypt(ciphertext: string, key: string): string {
    try {
      if (!ciphertext || typeof ciphertext !== 'string') {
        throw new Error('無効な暗号化データです');
      }

      // AES復号化
      const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, key);
      const result = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!result) {
        throw new Error('復号化に失敗しました - 無効なキーまたはデータ');
      }

      return result;
    } catch (error) {
      throw new Error(`復号化に失敗しました: ${error}`);
    }
  }

  /**
   * パスワードベースのキー導出（PBKDF2）
   */
  static deriveKeyFromPassword(password: string, salt: string): string {
    try {
      // PBKDF2でパスワードから256bitキーを導出
      // 10,000回の反復で総当たり攻撃を困難にする
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,  // 32バイト = 256bit
        iterations: 10000
      });
      
      return key.toString();
    } catch (error) {
      throw new Error(`キー導出に失敗しました: ${error}`);
    }
  }
}

// セキュアストレージでの暗号化キー管理
class EncryptionKeyManager {
  private static readonly KEY_NAME = 'encryption_master_key';
  private static cachedKey: string | null = null;

  static async getOrCreateKey(): Promise<string> {
    if (this.cachedKey) {
      return this.cachedKey;
    }

    try {
      // Web環境では localStorage、ネイティブではSecureStoreを使用
      if (Platform.OS === 'web') {
        let key = localStorage.getItem(this.KEY_NAME);
        if (!key) {
          key = AESEncryption.generateKey();
          localStorage.setItem(this.KEY_NAME, key);
        }
        this.cachedKey = key;
        return key;
      } else {
        // React Native環境
        let key = await SecureStore.getItemAsync(this.KEY_NAME);
        if (!key) {
          key = AESEncryption.generateKey();
          await SecureStore.setItemAsync(this.KEY_NAME, key);
        }
        this.cachedKey = key;
        return key;
      }
    } catch (error) {
      // フォールバック: セッション限定キー
      if (!this.cachedKey) {
        this.cachedKey = AESEncryption.generateKey();
      }
      return this.cachedKey;
    }
  }

  static async clearKey(): Promise<void> {
    this.cachedKey = null;
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(this.KEY_NAME);
      } else {
        await SecureStore.deleteItemAsync(this.KEY_NAME);
      }
    } catch (error) {
      // エラーは無視（削除目的なので）
    }
  }
}

// 個人情報の暗号化インターface
export interface EncryptedPersonalInfo {
  realName?: string;      // 実名（暗号化対象）
  phoneNumber?: string;   // 電話番号（暗号化対象）
  address?: string;       // 住所（暗号化対象）
  notes?: string;         // 個人メモ（暗号化対象）
  // 暗号化しないフィールド
  nickname: string;       // ニックネーム（平文OK）
  email: string;          // メールアドレス（Firebase Auth管理）
  birthdayYear?: number;  // 誕生年（年のみなら平文OK）
  role: 'master' | 'user';
  storeId: string;
}

// 個人情報暗号化サービス
export class PersonalInfoEncryption {
  /**
   * 個人情報を暗号化してFirestore保存用に変換
   */
  static async encryptPersonalInfo(data: EncryptedPersonalInfo): Promise<any> {
    try {
      const key = await EncryptionKeyManager.getOrCreateKey();
      const result: any = {
        // 平文で保存するフィールド
        nickname: data.nickname,
        email: data.email,
        role: data.role,
        storeId: data.storeId,
        birthdayYear: data.birthdayYear,
        // 暗号化フラグ
        isEncrypted: true,
        encryptedAt: new Date().toISOString(),
      };

      // 機密情報をAES-256で暗号化
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
      throw new Error('個人情報の暗号化に失敗しました');
    }
  }

  /**
   * Firestoreから取得したデータを復号化
   */
  static async decryptPersonalInfo(encryptedData: any): Promise<EncryptedPersonalInfo> {
    try {
      if (!encryptedData.isEncrypted) {
        // 暗号化されていないデータはそのまま返す
        return encryptedData as EncryptedPersonalInfo;
      }

      const key = await EncryptionKeyManager.getOrCreateKey();
      const result: EncryptedPersonalInfo = {
        nickname: encryptedData.nickname,
        email: encryptedData.email,
        role: encryptedData.role,
        storeId: encryptedData.storeId,
        birthdayYear: encryptedData.birthdayYear,
      };

      // 暗号化されたフィールドをAES-256で復号化
      if (encryptedData.realName) {
        result.realName = AESEncryption.decrypt(encryptedData.realName, key);
      }
      if (encryptedData.phoneNumber) {
        result.phoneNumber = AESEncryption.decrypt(encryptedData.phoneNumber, key);
      }
      if (encryptedData.address) {
        result.address = AESEncryption.decrypt(encryptedData.address, key);
      }
      if (encryptedData.notes) {
        result.notes = AESEncryption.decrypt(encryptedData.notes, key);
      }

      return result;
    } catch (error) {
      throw new Error('個人情報の復号化に失敗しました');
    }
  }

  /**
   * 個人情報を安全に削除（暗号化キーごと削除）
   */
  static async secureDelete(): Promise<void> {
    await EncryptionKeyManager.clearKey();
    // 追加: ローカルキャッシュも削除
    if (Platform.OS === 'web') {
      // WebのlocalStorageをクリア
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('personal_info')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
}

// データ削除サービス
export class PersonalDataDeletion {
  /**
   * ユーザーアカウントと関連データの完全削除
   */
  static async deleteUserData(userId: string, storeId: string): Promise<void> {
    try {
      // 1. 個人情報暗号化キーの削除
      await PersonalInfoEncryption.secureDelete();
      
      // 2. Firebase関連の削除（実装は認証システム側で行う）
      const { getAuth, deleteUser } = await import('firebase/auth');
      const { doc, deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/services/firebase/firebase-core');
      
      const auth = getAuth();
      
      // 3. Firestoreからユーザーデータを削除
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      // 4. 関連するシフトデータを削除（論理削除）
      const shiftsQuery = query(
        collection(db, 'shifts'),
        where('userId', '==', userId),
        where('storeId', '==', storeId)
      );
      const shiftsSnapshot = await getDocs(shiftsQuery);
      
      const deletePromises = shiftsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      
      // 5. Firebase Authアカウントの削除
      if (auth.currentUser && auth.currentUser.uid === userId) {
        await deleteUser(auth.currentUser);
      }

      // 6. セキュリティログ
      const { SecurityLogger } = await import('./securityUtils');
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        userId: userId,
        details: 'User data deletion completed',
        userAgent: navigator.userAgent,
      });

    } catch (error) {
      throw new Error(`データ削除に失敗しました: ${error}`);
    }
  }

  /**
   * 管理者による他ユーザーのデータ削除
   */
  static async deleteUserDataByAdmin(targetUserId: string, storeId: string, adminUserId: string): Promise<void> {
    try {
      // 管理者権限チェックは呼び出し側で実装済みと仮定
      
      const { doc, deleteDoc, updateDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/services/firebase/firebase-core');
      
      // ユーザーデータを削除ではなく論理削除に変更（監査目的）
      const userRef = doc(db, 'users', targetUserId);
      await updateDoc(userRef, {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: adminUserId,
        // 個人情報をクリア
        realName: null,
        phoneNumber: null,
        address: null,
        notes: null,
      });
      
      // 関連シフトも論理削除
      const shiftsQuery = query(
        collection(db, 'shifts'),
        where('userId', '==', targetUserId),
        where('storeId', '==', storeId)
      );
      const shiftsSnapshot = await getDocs(shiftsQuery);
      
      const updatePromises = shiftsSnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: adminUserId,
        })
      );
      await Promise.all(updatePromises);

      // セキュリティログ
      const { SecurityLogger } = await import('./securityUtils');
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        userId: adminUserId,
        details: `Admin deleted user data: ${targetUserId}`,
        userAgent: navigator.userAgent,
      });

    } catch (error) {
      throw new Error(`管理者によるデータ削除に失敗しました: ${error}`);
    }
  }
}

// 使用例とテスト関数
export const encryptionExample = {
  // AES-256暗号化のテスト
  async testEncryption() {
    const personalInfo: EncryptedPersonalInfo = {
      nickname: 'たろう',
      email: 'taro@example.com',
      role: 'user',
      storeId: 'store001',
      realName: '田中太郎',
      phoneNumber: '090-1234-5678',
      birthdayYear: 1990,
    };

    // 暗号化
    const encrypted = await PersonalInfoEncryption.encryptPersonalInfo(personalInfo);
    console.log('暗号化後:', encrypted);

    // 復号化
    const decrypted = await PersonalInfoEncryption.decryptPersonalInfo(encrypted);
    console.log('復号化後:', decrypted);

    return decrypted.realName === personalInfo.realName;
  },

  // 直接AES暗号化テスト
  async testDirectAES() {
    const testData = '田中太郎';
    const key = AESEncryption.generateKey();
    
    console.log('🔑 Generated Key:', key);
    
    // 暗号化
    const encrypted = AESEncryption.encrypt(testData, key);
    console.log('🔒 Encrypted:', encrypted);
    
    // 復号化
    const decrypted = AESEncryption.decrypt(encrypted, key);
    console.log('🔓 Decrypted:', decrypted);
    
    return testData === decrypted;
  },

  // PBKDF2キー導出テスト
  async testPBKDF2() {
    const password = 'mySecurePassword123';
    const salt = 'randomSalt456';
    
    const derivedKey1 = AESEncryption.deriveKeyFromPassword(password, salt);
    const derivedKey2 = AESEncryption.deriveKeyFromPassword(password, salt);
    
    console.log('🔐 PBKDF2 Key 1:', derivedKey1);
    console.log('🔐 PBKDF2 Key 2:', derivedKey2);
    
    // 同じパスワード・ソルトからは同じキーが生成される
    return derivedKey1 === derivedKey2;
  }
};