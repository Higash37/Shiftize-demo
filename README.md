# Shiftize

## 概要

Shiftize は、店舗運営におけるシフト管理とタスク管理を統合した Web アプリケーションです。React Native for Web で構築され、Firebase をバックエンドとして使用しています。現在、エンタープライズ級のセキュリティ対策とスケーラブルなバックエンドアーキテクチャへの移行を進行中です。

## 現在の実装状況

### 基盤機能（完成済み）

- ✅ ユーザー認証・権限管理システム
- ✅ Firebase Firestore によるリアルタイムデータ同期
- ✅ レスポンシブデザイン対応
- ✅ 多店舗対応の基本実装

### シフト管理機能（完成済み）

- ✅ ガントチャート表示によるシフト可視化
- ✅ シフト申請・承認フロー
- ✅ シフト変更の即時同期
- ✅ PDF 出力機能

### タスク管理機能（開発中）

- ✅ 基本的なタスク作成・編集・削除
- ✅ タスクステータス管理（未実施・実施中・完了）
- ✅ カンバン形式でのタスク表示
- ✅ チャット形式のメモ機能
- 🔧 通知機能との連携（実装予定）

## 現在進行中のプロジェクト

### 🔒 セキュリティ強化プロジェクト（Phase 1）

1. **包括的セキュリティ実装**
   - ✅ AES-256暗号化によるデータ保護実装済み
   - ✅ GDPR準拠のデータ管理・監査システム実装済み  
   - ✅ Firebase Security Rules完全見直し・強化済み
   - ✅ 入力値検証・XSS/CSRF対策実装済み
   - 🔧 多要素認証システム（実装予定）

2. **バックエンドアーキテクチャ移行（Phase 2）**
   - 🔧 Firebase Functions → Node.js/Express API移行
   - 🔧 データベース層の抽象化
   - 🔧 APIゲートウェイ・レート制限実装
   - 🔧 キャッシュ戦略の最適化

### 📈 スケーラビリティ向上

1. **パフォーマンス最適化**
   - ✅ コードの最適化とリファクタリング完了
   - ✅ TypeScript型安全性向上完了
   - 🔧 リアルタイム同期の効率化
   - 🔧 CDN・静的ファイル最適化

### 優先度 2: 高度なタスク管理

1. **タスク & 通知機能**

   - 人員要請機能：「この日に人が欲しい」申請
   - 申請に対する応答機能
   - リアルタイム通知システム

2. **ガントチャート改善**
   - 更新ボタンなしの即時反映
   - ドラッグ&ドロップによる直感的操作
   - パフォーマンスの最適化

### 優先度 3: 運用支援機能

1. **レポート機能**

   - シフト勤務統計
   - タスク完了率分析
   - 人員配置最適化提案

2. **モバイルアプリ化**
   - React Native Expo を活用
   - プッシュ通知対応
   - オフライン機能

## Firebase 設定

### Security Rules（基本設定）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                      (request.auth.uid == userId ||
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master");
      allow delete: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master";
    }

    // シフトコレクション
    match /shifts/{shiftId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                              (resource.data.userId == request.auth.uid ||
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master");
    }

    // タスクコレクション
    match /NormalTasks/{taskId} {
      allow read, write: if request.auth != null;
    }

    // タスクメモコレクション
    match /TaskMemos/{memoId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 技術スタック

### フロントエンド

- React Native for Web
- TypeScript
- Expo Router
- React Native Elements

### バックエンド

- Firebase Firestore
- Firebase Authentication
- Firebase Storage

### 開発・デプロイ

- Vercel（本番環境）
- Expo Development Build
- Git/GitHub

## 開発環境セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm start

# ビルド
npm run build
```

## 多店舗対応アーキテクチャ

現在、基本的な多店舗対応を実装済み。各店舗は独立した storeId で管理され、ユーザーは所属店舗のデータにのみアクセス可能。

### 将来的な拡張予定

- クロスストア機能（複数店舗での勤務対応）
- 店舗間データ連携
- グローバル管理者機能
