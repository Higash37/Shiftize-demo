# 🚨 Shiftize セキュリティ分析・対策レポート

## 📊 プロジェクト概要
- **プロジェクト**: Shift Scheduler App (Shiftize)
- **規模**: 81,631行 (472ファイル)
- **技術**: React Native + TypeScript + Firebase
- **分析日**: 2025-01-18
- **評価**: 商用化には重大なセキュリティリスクあり

## 🚨 **緊急レベル** セキュリティホール

### 1. **Firestore Rules - 全ユーザー情報漏洩リスク**
```javascript
// 📍 場所: firestore.rules:37
match /users/{userId} {
  allow read: if true;  // ⚠️ 全世界からアクセス可能
}
```

**影響**: 
- 全ユーザーのメールアドレス、店舗ID、役割が世界中から閲覧可能
- 競合他社による顧客情報収集が可能
- GDPR違反の可能性

**技術的詳細**:
- 認証前のログイン処理で `UserService.findUserByEmail()` が全ユーザー検索を実行
- そのために `allow read: if true` が必要だが、これが致命的な脆弱性
- 攻撃者は `getDocs(collection(db, "users"))` で全情報取得可能

### 2. **パスワード平文保存**
```typescript
// 📍 場所: firebase-group.ts:132, useAuth.ts:134
currentPassword: data.adminPassword,  // ⚠️ 平文保存
if (userData.currentPassword !== password) {  // ⚠️ 平文比較
```

**影響**:
- データベース侵害時に全パスワードが即座に露出
- 内部関係者による不正アクセス
- 他サービスでの使い回しパスワード悪用

### 3. **Cloud Functions 権限昇格**
```typescript
// 📍 場所: functions/src/index.ts:218
export const adminUpdateUserCredentials = functions.https.onCall(async (data) => {
  // マスターが他のユーザーのパスワードを変更可能
  // パスワード要件が甘い（8文字以上のみ）
  // セキュリティログが不十分
});
```

**影響**:
- マスター権限の悪用可能性
- 弱いパスワードの強制設定
- 権限昇格攻撃のリスク

### 4. **予測可能なメールアドレス生成**
```typescript
// 📍 場所: firebase-group.ts:98, useAuth.ts:106
const adminEmail = data.adminEmail || `${data.storeId}${data.adminNickname}@example.com`;
```

**影響**:
- 総当たり攻撃で他店舗のユーザーを推測可能
- フィッシング攻撃の標的化
- プライバシー侵害

## ⚠️ **高レベル** セキュリティ問題

### 5. **Storage Rules の脆弱性**
```javascript
// 📍 場所: storage.rules:30
return request.resource.size <= 100 * 1024 * 1024  // 100MB制限は過大
&& (
  request.resource.contentType.matches('text/.*')    // 危険：HTMLも含まれる
  || request.resource.contentType == 'application/zip'  // 危険：任意ファイル
)
```

**影響**:
- XSS攻撃用HTMLファイルのアップロード
- マルウェア配布用ZIPファイル
- サーバーリソース枯渇攻撃

### 6. **TypeScript エラー600件超**
```bash
# TypeScript型エラー状況
TS4111: 200+ 件 (index signature violations)
TS2532: 150+ 件 (undefined checks missing)
TS2345: 100+ 件 (type compatibility)
```

**影響**:
- 実行時エラーによるサービス停止
- セキュリティバイパスの可能性
- 保守性の劣化

### 7. **重複コード問題**
```
backend-migration/ と services/ で同一機能が重複
- firebase-auth.ts x2
- firebase-user.ts x2  
- firebase-multistore.ts x2
- useAuth.ts x2
```

**影響**:
- セキュリティ修正の漏れ
- 一貫性のない実装
- 攻撃面の拡大

## 🔧 **実装済み緊急修正**

### ✅ 1. パスワードハッシュ化実装
```typescript
// 📍 追加場所: encryptionUtils.ts:83
static hashPassword(password: string): string {
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 100000,  // 🔒 高強度
  });
  return `${salt}:${hash.toString()}`;
}
```

### ✅ 2. Cloud Functions権限強化
```typescript
// 📍 修正場所: functions/src/index.ts:69
// 🔒 メール送信をマスター限定
const userDoc = await db.doc(`users/${context.auth.uid}`).get();
if (!userDoc.exists || userDoc.data()?.role !== 'master') {
  throw new functions.https.HttpsError('permission-denied', 'Only master users can send emails');
}

// 🔒 パスワード要件強化
if (newPassword.length < 12 || 
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(newPassword)) {
  throw new functions.https.HttpsError('invalid-argument', 
    'Password must be at least 12 characters with uppercase, lowercase, number, and special character');
}
```

### ✅ 3. Storage Rules強化
```javascript
// 📍 修正場所: storage.rules:30
return request.resource.size <= 50 * 1024 * 1024   // 50MBに縮小
&& (
  request.resource.contentType.matches('image/(jpeg|jpg|png|gif|webp)') // 厳格化
  || request.resource.contentType == 'application/pdf'
)
&& !request.resource.contentType.matches('.*(executable|script|php|js|html|svg).*') // 危険ファイル拒否
```

## 🎯 **段階的セキュリティ改善計画**

### **Phase 1: 緊急対応（即座実行必要）**

#### 1.1 セキュアログイン実装
```typescript
// 📍 新規作成: functions/src/secureAuth.ts
export const secureLogin = functions.https.onCall(async (data) => {
  // サーバーサイドでユーザー検索・パスワード検証
  // クライアントには最小限の情報のみ返却
  // Firebase Auth カスタムトークン使用
});
```

#### 1.2 Firestore Rules段階的修正
```javascript
// Stage 1: メール検索を制限
match /users/{userId} {
  allow read: if isAuthenticated() && (
    request.auth.uid == userId ||
    resource.data.email == request.auth.token.email
  );
}

// Stage 2: 完全セキュア（認証システム修正後）
match /users/{userId} {
  allow read: if isAuthenticated() && request.auth.uid == userId;
}
```

### **Phase 2: 認証システム再設計（1-2週間）**

#### 2.1 レガシー認証からFirebase Auth正規化
```typescript
// 現在の問題: 自前認証 + Firebase Auth混在
// 解決策: Firebase Auth完全移行

// Before（危険）
const userInfo = await UserService.findUserByEmail(emailToUse); // 全ユーザー検索
if (userData.currentPassword !== password) { // 平文比較

// After（安全）  
const userCredential = await signInWithEmailAndPassword(auth, email, password); // Firebase Auth
const userData = await getDoc(doc(db, "users", userCredential.user.uid)); // 本人データのみ
```

#### 2.2 既存ユーザーのパスワード移行
```typescript
// Migration Script（要実装）
export const migratePasswords = functions.https.onCall(async () => {
  // 全ユーザーのcurrentPasswordをhashedPasswordに移行
  // currentPasswordフィールドを削除
  // 移行完了後にクライアント側認証ロジック更新
});
```

### **Phase 3: 完全セキュア化（1ヶ月）**

#### 3.1 TypeScriptエラー完全解消
- TS4111: index signature → bracket notation
- TS2532: undefined checks → optional chaining
- TS2345: type compatibility → proper interfaces

#### 3.2 コード重複解消
```bash
# 統合対象
backend-migration/ → services/ に統合
重複ファイル削除: firebase-*.ts x2 → x1
一貫した実装に統一
```

#### 3.3 監査・監視システム
```typescript
// Security Monitoring
- 異常ログイン検知
- 権限昇格監視  
- データアクセス監査
- リアルタイムアラート
```

## 🚨 **既存データ移行の注意点**

### **データベース移行リスク**
1. **現行ユーザー**: `currentPassword`（平文）で保存済み
2. **移行中断リスク**: サービス停止の可能性
3. **ロールバック準備**: 移行失敗時の復旧手順

### **推奨移行手順**
```bash
# Step 1: バックアップ
firebase firestore:backup --collection users

# Step 2: 段階的移行
- 新規ユーザー: hashedPassword使用
- 既存ユーザー: currentPassword併用（移行期間）
- 移行完了後: currentPassword削除

# Step 3: 認証ロジック更新
- クライアント側ログイン処理
- パスワード変更機能
- マスター権限機能
```

## 📋 **商用化に向けた必須対応項目**

### **即座対応（今日中）**
- [ ] Firestore Rules デプロイ（段階1）
- [ ] Cloud Functions デプロイ（権限強化版）
- [ ] Storage Rules デプロイ（強化版）

### **1週間以内**
- [ ] セキュアログイン機能実装・テスト
- [ ] 既存パスワード移行スクリプト作成
- [ ] 移行手順書作成・テスト環境検証

### **1ヶ月以内**
- [ ] TypeScriptエラー完全解消
- [ ] 重複コード統合
- [ ] セキュリティ監査システム実装
- [ ] 第三者セキュリティ診断実施

## 🔍 **コードの場所（重要ファイル）**

### **セキュリティ関連**
```
src/common/common-utils/security/
├── encryptionUtils.ts    # 暗号化・ハッシュ化機能
├── securityUtils.ts      # セキュリティログ・監査
└── auditLogger.ts        # 監査ログ

src/services/auth/
├── useAuth.ts           # ⚠️ 要修正：認証ロジック
└── AuthContext.tsx      # 認証コンテキスト

src/services/firebase/
├── firebase-group.ts    # ⚠️ 修正済：パスワードハッシュ化
├── firebase-user.ts     # ユーザー管理
└── firebase-multistore.ts # 店舗間連携

functions/src/
├── index.ts            # ⚠️ 修正済：Cloud Functions
└── secureAuth.ts       # 🆕 セキュアログイン機能
```

### **Firebase設定**
```
firestore.rules         # ⚠️ 現在: allow read: if true
storage.rules          # ✅ 修正済：強化版
firebase.json          # Firebase設定
```

## 🎯 **最優先アクション**

1. **即座**: `allow read: if true` を段階的に修正
2. **本日中**: セキュアログイン機能の実装・テスト
3. **今週中**: 既存パスワード移行計画の策定
4. **来月**: 第三者によるセキュリティ監査

## 💡 **WSL環境での作業推奨事項**

### **MCP活用**
- Firebase MCP: Rules、Functions、Firestoreの直接操作
- Git MCP: 安全な変更管理・ロールバック
- File MCP: 大量ファイルの一括修正

### **開発環境**
```bash
# セキュアな開発環境構築
npm run build          # TypeScriptエラー確認
npm run test           # セキュリティテスト
firebase emulators:start  # ローカル環境でテスト
```

この分析を基に、WSL環境でのセキュリティ対策実装を安全に進めることができます。