# セキュリティ改善タスクリスト

## 🚨 優先度: 高 - 重大なセキュリティリスク

### 1. 認証フローの脆弱性
- **問題**: 認証チェックが`_layout.tsx`で実行されているが、`index.tsx`が先に読み込まれる可能性
- **影響**: 未認証ユーザーが一時的に保護されたコンテンツにアクセスできる可能性
- **対策**: 
  - 各ルートコンポーネントで認証チェックを実装
  - HOC (Higher-Order Component) または カスタムフックで認証を統一管理
  - ルートレベルのミドルウェアで認証を実施

### 2. IDの直接露出
- **問題**: Firebase ドキュメントIDやユーザーIDがフロントエンドに直接露出
- **影響**: 
  - 予測可能なIDによる列挙攻撃のリスク
  - 直接的なデータアクセスパターンの露出
- **対策**:
  - UUIDv4の使用またはハッシュ化されたIDの実装
  - APIレイヤーでのID変換処理
  - フロントエンド向けの別IDシステムの構築

### 3. 環境変数の露出
- **問題**: `EXPO_PUBLIC_*` プレフィックスにより全ての環境変数がクライアントに露出
- **影響**: APIキーや設定情報の漏洩リスク
- **対策**:
  - センシティブな情報はサーバーサイドのみで管理
  - Firebase Functions経由でのAPI呼び出し
  - 環境変数の分離（パブリック/プライベート）

## ⚠️ 優先度: 中 - 潜在的セキュリティリスク

### 4. TypeScript型チェックの不完全性
- **残存エラー数**: 約300件のインデックスシグネチャアクセスエラー
- **影響**: 
  - 型安全性の欠如によるランタイムエラーの可能性
  - データ整合性の問題
- **対策**:
  ```typescript
  // Before (現在の問題のあるコード)
  const nickname = userData.nickname;
  
  // After (修正後)
  const nickname = userData['nickname'];
  ```

### 5. console.log文の残存
- **検出数**: 84件（10ファイル）
- **影響**: 
  - 本番環境での情報漏洩
  - パフォーマンスへの影響
- **主要ファイル**:
  - `src/services/notifications/PushNotificationService.ts` (23件)
  - `src/services/notifications/EmailNotificationService.ts` (24件)
  - `src/services/firebase/firebase-shift.ts` (8件)
- **対策**:
  - 構造化ログシステムへの移行
  - 開発/本番環境での条件付きログ出力

### 6. Firebase Security Rules の検証
- **確認事項**:
  - ユーザーロールベースのアクセス制御
  - データ検証ルール
  - レート制限の実装
- **推奨改善**:
  ```javascript
  // 例: より厳格なルール
  match /shifts/{shiftId} {
    allow read: if request.auth != null 
      && request.auth.uid in resource.data.allowedUsers;
    allow write: if request.auth != null 
      && request.auth.token.role == 'master'
      && request.resource.data.keys().hasAll(['required', 'fields']);
  }
  ```

## 📋 優先度: 低 - コード品質改善

### 7. ハードコードされた値
- **検出パターン**:
  - IPアドレス（localhost, 192.168.x.x）
  - URL（.com, .org, .net, .io）
  - 長い文字列トークン
- **対策**:
  - 設定ファイルへの集約
  - 環境変数の活用

### 8. エラーハンドリングの標準化
- **現状**: 各サービスで異なるエラーハンドリングパターン
- **改善案**:
  - 統一されたエラークラスの実装
  - グローバルエラーハンドラーの設置
  - ユーザーフレンドリーなエラーメッセージ

## 🔧 実装推奨事項

### セキュアなデータアクセスパターン
```typescript
// ❌ 悪い例
export const getUserData = async (userId: string) => {
  const doc = await getDoc(doc(db, 'users', userId));
  return doc.data();
};

// ✅ 良い例
export const getUserData = async (userId: string) => {
  // 1. 認証チェック
  const currentUser = auth.currentUser;
  if (!currentUser) throw new UnauthorizedError();
  
  // 2. 権限チェック
  const hasPermission = await checkUserPermission(currentUser.uid, userId);
  if (!hasPermission) throw new ForbiddenError();
  
  // 3. データ取得とサニタイズ
  const doc = await getDoc(doc(db, 'users', userId));
  if (!doc.exists()) throw new NotFoundError();
  
  // 4. センシティブ情報の除外
  const data = doc.data();
  delete data['currentPassword'];
  delete data['internalNotes'];
  
  return data;
};
```

### 認証ミドルウェアの実装例
```typescript
// src/middleware/authMiddleware.ts
export const requireAuth = (Component: React.FC) => {
  return (props: any) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (!loading && !user) {
        router.replace('/login');
      }
    }, [user, loading]);
    
    if (loading) return <LoadingScreen />;
    if (!user) return null;
    
    return <Component {...props} />;
  };
};
```

## 📊 セキュリティ監査チェックリスト

- [ ] 全ての認証フローの見直し
- [ ] IDシステムの再設計
- [ ] 環境変数の分離と保護
- [ ] TypeScriptエラーの完全解消
- [ ] console.log文の除去
- [ ] Firebase Security Rulesの強化
- [ ] ハードコード値の設定ファイル化
- [ ] エラーハンドリングの統一
- [ ] ペネトレーションテストの実施
- [ ] セキュリティログの実装
- [ ] OWASP Top 10への対応確認

## 🎯 次のステップ

1. **即座に対応すべき項目**（24時間以内）
   - 認証フローの修正
   - 環境変数の見直し

2. **短期対応項目**（1週間以内）
   - IDシステムの改善
   - console.log文の除去
   - TypeScriptエラーの解消

3. **中期対応項目**（1ヶ月以内）
   - 完全なセキュリティ監査
   - ペネトレーションテスト
   - ドキュメント整備

---
*作成日: 2025-08-06*
*最終更新: 2025-08-06*
*担当: セキュリティエージェント向け*