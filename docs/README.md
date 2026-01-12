# Shiftize

## 概要

Shiftize は、店舗運営におけるシフト管理とタスク管理を統合した Web アプリケーションです。React Native for Web で構築され、Firebase をバックエンドとして使用しています。現在、エンタープライズ級のセキュリティ対策とスケーラブルなバックエンドアーキテクチャへの移行を進行中です。

## 現在の実装状況

### 基盤機能（完成済み）

- ✅ ユーザー認証・権限管理システム
- ✅ Firebase Firestore によるリアルタイムデータ同期
- ✅ レスポンシブデザイン対応
- ✅ 単一店舗運営システム（多店舗対応基盤実装済み）

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

### 🔒 セキュリティ強化プロジェクト（Phase 1 - 完了済み）

1. **包括的セキュリティ実装**
   - ✅ AES-256 暗号化によるデータ保護実装済み
   - ✅ GDPR 準拠のデータ管理・監査システム実装済み
   - ✅ Firebase Security Rules 完全見直し・強化済み
   - ✅ 入力値検証・XSS/CSRF 対策実装済み

### 🎯 Firebase 最適化プロジェクト（Phase 2 - 継続開発）

1. **アーキテクチャ決定（2025-01-30）**

   - ✅ **Firebase 継続**: 移行コスト vs メリットを総合判断
   - ✅ 現在の機能レベル（info ページ程度）に Firebase が最適と判断
   - 🎯 既存システムの最適化・拡張に注力

2. **Firebase 最適化施策**
   - 🔧 パフォーマンス改善: クエリ最適化・インデックス見直し
   - 🔧 機能拡張: 現在レベル内での分析機能追加
   - 🔧 運用改善: ログ監視・エラーハンドリング強化

### 📈 スケーラビリティ向上

1. **パフォーマンス最適化**
   - ✅ コードの最適化とリファクタリング完了
   - ✅ TypeScript 型安全性向上完了
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

- **Firebase Firestore** (継続採用決定)
- **Firebase Authentication** (ロールベース認証)
- **Firebase Storage** (ファイル管理)
- **Firebase Security Rules** (完全店舗分離)

### 開発・デプロイ

- Render（本番環境）
- Expo Development Build
- Git/GitHub

## 開発環境セットアップ

### 初心者向けガイド

**大学生・初心者の方は、まず以下のガイドを読んでください:**

- 📚 [開発環境セットアップガイド](./docs/DEVELOPMENT_ENVIRONMENT_SETUP.md) - 完全なセットアップ手順
- 📚 [React の難しい部分](./docs/REACT_DIFFICULT_PARTS.md) - React の実践的な解説

### 学習記録・ロードマップ

**Qiita で学習記録を公開するためのテンプレート:**

- 📝 [学習ロードマップテンプレート](./docs/QIITA_ROADMAP_TEMPLATE.md) - 8 週間の学習計画
- 📝 [開発日記テンプレート](./docs/QIITA_DAILY_LOG_TEMPLATE.md) - 毎日の学習記録
- 📝 [週間振り返りテンプレート](./docs/QIITA_WEEKLY_SUMMARY_TEMPLATE.md) - 週の振り返り
- 📝 [Qiita 記事投稿ガイドライン](./docs/QIITA_ARTICLE_GUIDELINES.md) - 質の高い記事を書くためのガイド

### クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm start

# ビルド
npm run build
```

## アーキテクチャ

現在は単一店舗向けとして運用していますが、多店舗対応の基盤（店舗分離、アクセス制御）は実装済み。Firebase Firestore を中心としたリアルタイム同期システム。

### 将来的な多店舗対応拡張

- 店舗間データ連携機能
- クロスストア勤務管理
- グローバル管理者機能
- 店舗別レポート・分析機能
