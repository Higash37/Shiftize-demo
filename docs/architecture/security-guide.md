# 🛡️ セキュリティ実装ガイド

Firebase + React Native 環境での包括的な個人情報保護システム

## 📋 実装完了済み機能

### ✅ 基本セキュリティ対策
- **Firebase Security Rules**: 店舗分離 + ロール基盤アクセス制御
- **入力検証**: XSS/インジェクション攻撃防止
- **CSRF/XSS対策**: トークン管理・セキュアヘッダー
- **認証セキュリティ**: レート制限・強化されたバリデーション

### ✅ 個人情報保護対策
- **AES-256暗号化**: 業界標準の強力な暗号化（crypto-js使用）
- **PBKDF2キー導出**: パスワードベースのセキュアキー生成
- **セキュアデータ削除**: GDPR準拠の完全削除機能
- **監査ログ**: 個人情報アクセスの完全追跡
- **同意管理**: プライバシー同意の記録・管理

---

## 🔐 使用方法

### 1. 個人情報の暗号化（AES-256）

```typescript
import { PersonalInfoEncryption, AESEncryption } from '@/common/common-utils/security/encryptionUtils';

// 個人情報を暗号化して保存
const personalInfo = {
  nickname: 'たろう',
  email: 'taro@example.com',
  role: 'user',
  storeId: 'store001',
  realName: '田中太郎',        // 暗号化対象
  phoneNumber: '090-1234-5678', // 暗号化対象
  birthdayYear: 1990,
};

const encryptedData = await PersonalInfoEncryption.encryptPersonalInfo(personalInfo);
// Firestoreに保存...

// 復号化して使用
const decryptedData = await PersonalInfoEncryption.decryptPersonalInfo(encryptedData);

// 直接AES暗号化も可能
const key = AESEncryption.generateKey();
const encrypted = AESEncryption.encrypt('機密データ', key);
const decrypted = AESEncryption.decrypt(encrypted, key);

// パスワードベースのキー導出
const password = 'ユーザーパスワード';
const salt = 'ランダムソルト';
const derivedKey = AESEncryption.deriveKeyFromPassword(password, salt);
```

### 2. データ削除機能

```typescript
import { secureDeleteUser, secureDeleteUserByAdmin } from '@/services/firebase/firebase-user';

// ユーザー自身によるデータ削除（GDPR対応）
await secureDeleteUser(userId, storeId);

// 管理者による他ユーザーのデータ削除
await secureDeleteUserByAdmin(targetUserId, storeId, adminUserId);
```

### 3. 監査ログの記録

```typescript
import { PersonalInfoAudit } from '@/common/common-utils/security/auditLogger';

// 個人情報アクセスを記録
PersonalInfoAudit.logPersonalInfoAccess({
  userId: 'user123',
  storeId: 'store001',
  dataFields: ['realName', 'phoneNumber'],
  purpose: 'Display user profile',
  legalBasis: 'legitimate_interest'
});

// 管理者アクセスを記録
PersonalInfoAudit.logAdminAccess({
  adminUserId: 'admin123',
  targetUserId: 'user456',
  storeId: 'store001',
  purpose: 'User support inquiry',
  dataFields: ['realName', 'email']
});
```

### 4. React Hookでの監査ログ

```typescript
import { usePersonalInfoAudit } from '@/common/common-utils/security/auditLogger';

const UserProfileComponent = () => {
  const { logAccess, logUpdate } = usePersonalInfoAudit();

  const viewUserProfile = (userId: string) => {
    // アクセスログを記録
    logAccess({
      userId: currentUser.uid,
      targetUserId: userId,
      storeId: currentUser.storeId,
      dataFields: ['nickname', 'email'],
      purpose: 'View user profile'
    });
    
    // プロフィール表示処理...
  };

  const updateProfile = (updates: any) => {
    // 更新ログを記録
    logUpdate({
      userId: currentUser.uid,
      storeId: currentUser.storeId,
      dataFields: Object.keys(updates),
      purpose: 'User profile update'
    });
    
    // 更新処理...
  };
};
```

---

## 🔧 Firebase Security Rules

### Firestore Rules（実装済み）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 店舗分離とロール制御
    function belongsToSameStore(storeId) {
      return isAuthenticated() && getUserData().storeId == storeId;
    }
    
    function isMaster() {
      return isAuthenticated() && getUserData().role == "master";
    }
    
    // ユーザーコレクション
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwnerOrMaster(userId);
      allow delete: if isMaster();
    }
    
    // 以下、各コレクション毎に詳細な制御...
  }
}
```

### Storage Rules（実装済み）

```javascript
// 店舗別ファイル分離 + 安全性チェック
match /files/{storeId}/{allPaths=**} {
  allow read: if isAuthenticated() && belongsToSameStore(storeId);
  allow write: if isAuthenticated() && belongsToSameStore(storeId) 
                  && isValidFile() && isValidFilename();
}
```

---

## 📊 監査・コンプライアンス

### GDPR対応機能

1. **データポータビリティ**
   ```typescript
   import { AuditLogger } from '@/common/common-utils/security/auditLogger';
   
   // ユーザーデータのエクスポート
   const auditData = AuditLogger.exportUserAuditData(userId);
   ```

2. **忘れられる権利**
   ```typescript
   // 完全なデータ削除
   await PersonalInfoEncryption.secureDelete();
   await secureDeleteUser(userId, storeId);
   ```

3. **同意管理**
   ```typescript
   // 同意取得の記録
   PersonalInfoAudit.logConsentGiven({
     userId: 'user123',
     storeId: 'store001',
     consentType: 'data_processing',
     purpose: 'Shift scheduling service'
   });
   ```

### 監査レポート生成

```typescript
import { AuditLogger } from '@/common/common-utils/security/auditLogger';

// 管理者向け統計情報
const stats = AuditLogger.getAuditStatistics();

// 期間別ログ取得
const logs = AuditLogger.getLogsByDateRange(
  new Date('2025-01-01'),
  new Date('2025-12-31')
);
```

---

## ⚠️ セキュリティベストプラクティス

### データ保存の原則

```typescript
// ❌ 避けるべき - 平文で機密情報を保存
const userData = {
  name: '田中太郎',
  phone: '090-1234-5678',
  address: '東京都...'
};

// ✅ 推奨 - 暗号化して保存
const userData = await PersonalInfoEncryption.encryptPersonalInfo({
  nickname: 'たろう',      // 平文OK
  email: 'taro@example.com', // Firebase Auth管理
  realName: '田中太郎',     // 暗号化
  phoneNumber: '090-1234-5678', // 暗号化
});
```

### アクセス記録の原則

```typescript
// 個人情報にアクセスする際は必ずログを記録
const viewSensitiveData = async (userId: string) => {
  // ログ記録
  PersonalInfoAudit.logPersonalInfoAccess({
    userId: currentUser.uid,
    targetUserId: userId,
    storeId: currentUser.storeId,
    dataFields: ['realName', 'phoneNumber'],
    purpose: 'Customer support inquiry',
    legalBasis: 'legitimate_interest'
  });
  
  // データアクセス
  const data = await getUserSensitiveData(userId);
  return data;
};
```

### エラー処理の原則

```typescript
try {
  await processPersonalInfo(data);
} catch (error) {
  // セキュリティエラーは詳細をログに記録
  SecurityLogger.logEvent({
    type: 'invalid_input',
    details: `Personal info processing failed: ${error.message}`,
    userId: currentUser.uid,
    userAgent: navigator.userAgent,
  });
  
  // ユーザーには一般的なエラーメッセージのみ表示
  throw new Error('データ処理に失敗しました');
}
```

---

## 🚀 次のステップ（今後の拡張）

### バックエンド移行時の追加対策

1. **API認証トークン (JWT)**
2. **データベース暗号化**
3. **API Gateway + レート制限**
4. **分散監査ログシステム**

### プロダクション環境での監視

1. **セキュリティアラート**
2. **異常アクセス検知**  
3. **パフォーマンス監視**
4. **コンプライアンス自動チェック**

---

**📝 更新履歴**
- 2025-07-27: 初版作成 - 包括的セキュリティシステム実装完了
- Firebase + React Native 環境での個人情報保護ベストプラクティス準拠