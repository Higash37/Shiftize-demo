# バックエンド移行対象ファイル一覧

## 📊 **ファイル分類状況**

### 🔐 **認証サービス** (3ファイル)
- `AuthContext.tsx` - 認証コンテキスト
- `useAuth.ts` - 認証フック  
- `auth.d.ts` - 認証型定義

### 🗄️ **データベースサービス** (9ファイル)
- `firebase-core.ts` - Firebase初期化
- `firebase-auth.ts` - 認証サービス
- `firebase-user.ts` - ユーザー管理
- `firebase-shift.ts` - シフト管理
- `firebase-task.ts` - タスク管理
- `firebase-group.ts` - グループ管理
- `firebase-multistore.ts` - マルチストア対応
- `firebase-extended-task.ts` - 拡張タスク
- `firebase.ts` - メインエクスポート

### 🔄 **APIアダプター** (8ファイル)
- `ShiftAPIService.ts` - シフトAPI抽象化
- `index.ts` - APIサービス統合
- `types/` - API型定義フォルダ
- `examples/` - 移行例・テスト

### ☁️ **クラウド機能** (4ファイル)
- `email-service.ts` - メール送信サービス  
- `index.ts` - Cloud Functions定義
- `server.js` - Express サーバー
- `firebase-functions/` - Functions関連ファイル

## 🎯 **移行優先度**

### **高優先度** (即座に移行検討)
1. `server.js` - 独立サーバーとして分離可能
2. `email-service.ts` - 外部API化候補
3. API アダプター層 - 既に抽象化済み

### **中優先度** (段階的移行)
1. 認証サービス - Auth0等外部サービス検討
2. ユーザー・グループ管理 - REST API化

### **低優先度** (最終段階)
1. シフト・タスク管理 - 複雑な業務ロジック
2. マルチストア機能 - 大規模変更必要

## ⚡ **次のアクション**

1. ✅ ファイル分類完了
2. 🔄 依存関係マッピング
3. 📋 移行テスト計画
4. 🚀 段階的移行実行