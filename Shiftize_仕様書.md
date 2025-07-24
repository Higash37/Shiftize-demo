# Shiftize システム仕様書

## 1. プロジェクト概要

### 1.1 プロダクト名

**Shiftize（シフタイズ）**

### 1.2 プロダクト概要

Shiftize は、学習塾運営における**シフト管理**と**タスク管理**を統合した Web アプリケーションです。React Native for Web で構築され、Firebase Firestore をバックエンドとして、リアルタイムでの情報共有と効率的な業務管理を実現します。

### 1.3 開発背景・課題解決

**既存の課題：**

- **LINE による手動管理**: 授業とは別に教室運営スタッフの希望日時を全て手打ちで管理
- **管理の曖昧さ**: シフト情報の散在により管理が不透明
- **無断欠席の多発**: 明確なシフト管理システムの不在
- **学習コストの壁**: Google カレンダー等の既存ツールは浸透せず
- **シフト登録の形骸化**: LINE 管理により当月になってもシフトが集まらない状況が頻発
- **既存アプリの課題**: 授業時間がシフトに組み込まれる学習塾特有の要件に他社アプリが対応できず

**解決アプローチ：**

- **既存 UI/UX の踏襲**: 塾で既に使用中のサイトデザインを基本ベース
- **慣れ親しんだフロー**: 既存のシフト登録フローをそのまま活用
- **段階的移行**: 大きな変化を避け、自然な移行を実現
- **学習塾特化設計**: 授業時間とスタッフシフトが混在する独特な業務形態に完全対応

**導入効果（実績データ）：**

- **シフト提出率の劇的改善**: 平均月 10 件 → **30 件（3 倍向上）**
- **事前計画性の向上**: 来月分シフトが既に 25 件登録済み（運用開始後初月）
- **継続的な改善**: 残り 7 日で更なる登録増加が見込まれる状況
- **業務効率化**: 手動 LINE 管理からの完全脱却を実現
- **作業時間の大幅削減**: シフト登録時間が**10 分 → 1 分（90%削減）**
  - 対象：スタッフ 3 名からの聞き取り調査結果
  - 今後の習熟によりさらなる短縮が期待される

### 1.4 対象ユーザー

- **主要対象**: 学習塾（特に教室運営スタッフ管理）
- **ユーザータイプ**:
  - **マスター（管理者）**: 塾長、教室主宰者、運営責任者
  - **ユーザー（一般従業員）**: 教室運営スタッフ、アルバイト講師

### 1.5 技術スタック

- **フロントエンド**: React Native for Web, TypeScript, Expo Router
- **バックエンド**: Firebase (Firestore, Authentication, Storage)
- **UI/UX**: Material-UI, React Native Elements
- **デプロイ**: Vercel (Web), Expo (Mobile)

---

## 2. システムアーキテクチャ

### 2.1 全体構成

```
[Web/Mobile Client] ←→ [Firebase Services] ←→ [Vercel Hosting]
                            ↓
                    [Firestore Database]
                    [Firebase Auth]
                    [Firebase Storage]
```

### 2.2 多店舗対応アーキテクチャ

- **店舗 ID（storeId）**による論理的データ分離
- 各ユーザーは特定店舗に所属し、所属店舗のデータにのみアクセス可能
- 将来的なクロスストア機能（複数店舗勤務）に対応可能な設計

### 2.3 認証システム

- **複合認証方式**: 店舗 ID + ニックネーム + パスワード
- **Firebase Authentication**活用による安全な認証
- **メールアドレス形式**：`{storeId}{nickname}@example.com`
- **権限管理**: `master`（管理者）/ `user`（一般従業員）の 2 階層

---

## 3. 主要機能仕様

### 3.1 ユーザー管理機能

#### 3.1.1 認証・ログイン

- **店舗 ID、ニックネーム、パスワード**による 3 要素認証
- **自動ログイン維持**（トークンベース）
- **パスワード変更機能**（ユーザー自身による変更）

#### 3.1.2 ユーザー管理（マスター専用）

- **従業員の追加・編集・削除**
- **権限変更**（マスター ⇔ ユーザー）
- **アクティブ状態管理**（有効/無効切り替え）
- **招待機能**（新規ユーザー招待フォーム）

### 3.2 シフト管理機能

#### 3.2.1 シフト基本機能

- **シフト登録**: 日時、開始・終了時間、シフトタイプ選択
- **シフト編集・削除**: 権限に応じた編集制限
- **シフト申請・承認ワークフロー**:
  - `draft`（下書き）→ `pending`（申請中）→ `approved`（承認済み）
  - `rejected`（却下）, `completed`（完了）, `cancelled`（キャンセル）

#### 3.2.2 シフトタイプ

- **user**: 一般従業員シフト
- **class**: クラス・イベント用シフト
- **staff**: スタッフ専用シフト
- **deleted**: 削除済みシフト

#### 3.2.3 変更要請機能

- **変更履歴管理**: `requestedChanges`配列による変更追跡
- **変更理由記録**: 変更内容と理由の詳細保存

### 3.3 ガントチャート機能

#### 3.3.1 ビジュアル表示

- **時間軸表示**: 9:00〜22:00 を 15 分刻みで表示
- **週・月表示切り替え**: 動的なビューモード変更
- **重複シフト管理**: レイヤー計算による適切な重複表示
- **リアルタイム更新**: Firebase 連動による即座な情報同期

#### 3.3.2 レスポンシブ対応

- **デスクトップ**: フルガントチャート表示
- **タブレット**: 縮小ガントチャート
- **スマートフォン**: カード形式表示に自動切り替え

#### 3.3.3 給与計算機能

- **時給設定**: ユーザー別時給管理
- **自動計算**: シフト時間 × 時給による給与算出
- **給与サマリー**: 期間別給与集計表示

### 3.4 タスク管理機能

#### 3.4.1 基本タスク管理

- **タスク作成・編集・削除**: CRUD 操作完備
- **ステータス管理**: 未実施 → 実施中 → 完了
- **カンバン形式表示**: ドラッグ&ドロップ対応
- **優先度設定**: Low / Medium / High

#### 3.4.2 拡張タスク機能（ExtendedTask）

- **タスクタイプ**:

  - `standard`: 標準タスク
  - `time_specific`: 時間指定タスク
  - `custom`: カスタムタスク
  - `user_defined`: ユーザー定義タスク
  - `class`: クラス関連タスク

- **時間制約**: 特定時間帯でのみ実行可能なタスク設定
- **難易度設定**: タスクの複雑さを 3 段階で評価
- **推定所要時間**: タスク完了までの予想時間

#### 3.4.3 パフォーマンス分析

- **6 指標評価**:

  - 効率性 (efficiency)
  - 一貫性 (consistency)
  - 積極性 (initiative)
  - 頻度 (frequency)
  - 完了率 (completion_rate)
  - 正確性 (accuracy)

- **TaskExecution 記録**: シフト内でのタスク実行履歴
- **分析レポート**: ユーザー別・タスク別パフォーマンス追跡

#### 3.4.4 チャット機能

- **タスクメモ**: タスクに紐づくチャット形式のメモ機能
- **リアルタイム更新**: メッセージの即座同期
- **ファイル添付**: 画像・文書ファイルの添付可能

### 3.5 ファイル管理機能

#### 3.5.1 ファイルストレージ

- **Firebase Storage 連携**: 安全なクラウドストレージ
- **フォルダ階層管理**: ディレクトリ構造による整理
- **ファイル形式**: 画像、PDF、文書ファイルなど多形式対応

#### 3.5.2 ファイル操作

- **アップロード**: ドラッグ&ドロップまたはファイル選択
- **ダウンロード**: 直接ダウンロードリンク生成
- **プレビュー**: 画像・PDF のブラウザ内プレビュー
- **権限管理**: マスターのみアップロード、ユーザーは閲覧のみ

---

## 4. 画面構成・UI 仕様

### 4.1 認証・オンボーディング

- **ログイン画面**: 店舗 ID・ニックネーム・パスワード入力
- **ウェルカム画面**: 初回ログイン時の案内
- **オンボーディング**: 機能説明スライド
- **グループ作成**: 新規店舗セットアップ

### 4.2 マスター（管理者）画面

#### 4.2.1 ダッシュボード

- **ホーム**: 今日のシフト概要、重要通知
- **情報ダッシュボード**:
  - 予算分析、コスト分析
  - 生産性分析、スタッフ効率性
  - トレンド分析、タスクパフォーマンス

#### 4.2.2 シフト管理

- **ガントビュー**: ビジュアルスケジュール管理
- **ガント編集**: ドラッグ&ドロップによるシフト調整
- **シフト作成**: 新規シフト登録フォーム

#### 4.2.3 タスク管理

- **タスク一覧**: フィルタリング・検索機能付き
- **カンバンビュー**: ステータス別タスク管理
- **タスク分析**: パフォーマンス・レポート表示

#### 4.2.4 設定管理

- **シフトルール**: 勤務時間制限、休憩時間設定
- **休日設定**: 日本の祝日、店舗独自の休日
- **外観設定**: シフトタイプ別色設定
- **シフトステータス**: ステータス別色・表示設定
- **バックアップ**: データエクスポート・インポート

#### 4.2.5 ユーザー管理

- **従業員一覧**: 全従業員の状態・権限確認
- **ユーザー編集**: 個別従業員情報の編集
- **権限変更**: マスター権限の付与・剥奪

#### 4.2.6 ファイル管理

- **ファイル一覧**: フォルダ階層表示
- **ファイルアップロード**: 新規ファイル追加
- **フォルダ作成**: 新規フォルダ作成

### 4.3 ユーザー（一般従業員）画面

#### 4.3.1 基本機能

- **ホーム**: 個人シフト確認、今日のタスク
- **シフト管理**:
  - **シフト一覧**: 個人シフトの確認
  - **シフト作成**: 新規シフト申請
- **ファイル管理**: 店舗ファイルの閲覧・ダウンロード
- **パスワード変更**: 個人パスワードの変更

---

## 5. データベース設計

### 5.1 主要コレクション

#### 5.1.1 users コレクション

```typescript
interface User {
  id: string;
  nickname: string;
  storeId: string;
  role: "master" | "user";
  email: string;
  currentPassword: string;
  hourlyRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.1.2 shifts コレクション

```typescript
interface Shift {
  id: string;
  userId: string;
  storeId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: "user" | "class" | "staff" | "deleted";
  status:
    | "draft"
    | "pending"
    | "approved"
    | "rejected"
    | "completed"
    | "cancelled";
  requestedChanges: ChangeRequest[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.1.3 extendedTasks コレクション

```typescript
interface ExtendedTask {
  id: string;
  storeId: string;
  title: string;
  description: string;
  taskType: "standard" | "time_specific" | "custom" | "user_defined" | "class";
  priority: "low" | "medium" | "high";
  difficulty: "low" | "medium" | "high";
  estimatedMinutes: number;
  specificTimeStart?: string;
  specificTimeEnd?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.1.4 taskPerformances コレクション

```typescript
interface TaskPerformance {
  id: string;
  userId: string;
  taskId: string;
  storeId: string;
  efficiency: number;
  consistency: number;
  initiative: number;
  frequency: number;
  completion_rate: number;
  accuracy: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション - 認証済みユーザーのみアクセス可能
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                      (request.auth.uid == userId ||
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master");
      allow delete: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master";
    }

    // シフトコレクション - 認証済みユーザー、本人またはマスターのみ編集可能
    match /shifts/{shiftId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                              (resource.data.userId == request.auth.uid ||
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "master");
    }

    // タスクコレクション - 認証済みユーザーのみアクセス可能
    match /extendedTasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 6. API・サービス設計

### 6.1 Firebase サービス構成

#### 6.1.1 認証サービス (`firebase-auth.ts`)

- `createUser`: 新規ユーザー作成
- `updateUser`: ユーザー情報更新
- `getUserByEmail`: メールアドレスでユーザー検索
- `authenticateUser`: ログイン認証

#### 6.1.2 シフトサービス (`firebase-shift.ts`)

- `createShift`: シフト作成
- `updateShift`: シフト更新
- `deleteShift`: シフト削除
- `getShiftsByStore`: 店舗別シフト取得
- `getShiftsByDateRange`: 期間指定シフト取得

#### 6.1.3 タスクサービス (`firebase-extended-task.ts`)

- `createExtendedTask`: 拡張タスク作成
- `updateTaskPerformance`: パフォーマンス更新
- `getTaskAnalytics`: タスク分析データ取得
- `getTaskExecutions`: タスク実行履歴取得

#### 6.1.4 ファイルサービス (`fileService.ts`, `storageService.ts`)

- `uploadFile`: ファイルアップロード
- `deleteFile`: ファイル削除
- `createFolder`: フォルダ作成
- `getFilesByFolder`: フォルダ別ファイル取得

### 6.2 カスタムフック

#### 6.2.1 認証関連

- `useAuth`: 認証状態管理、ログイン・ログアウト
- `useUser`: ユーザー情報取得・更新

#### 6.2.2 シフト関連

- `useShiftActions`: シフト CRUD 操作
- `useShiftQueries`: シフトデータクエリ
- `useHomeGanttState`: ガントチャート状態管理

#### 6.2.3 タスク関連

- `useTaskManagementHook`: タスク管理統合フック

---

## 7. セキュリティ仕様

### 7.1 認証セキュリティ

- **Firebase Authentication**による堅牢な認証基盤
- **パスワードハッシュ化**（Firebase 標準）
- **セッション管理**（Firebase トークンベース）
- **自動ログアウト**（一定時間非活動時）

### 7.2 データアクセス制御

- **Firestore Security Rules**による細かいアクセス制御
- **店舗 ID 基準**でのデータ分離
- **ロールベース**権限管理（master/user）
- **所有者制限**（自分のデータのみアクセス可能）

### 7.3 通信セキュリティ

- **HTTPS 強制**（ Firebase 自動対応）
- **CORS 設定**適切な配信元制限
- **Firebase SDK**標準セキュリティ機能活用

---

## 8. パフォーマンス・スケーラビリティ

### 8.1 フロントエンド最適化

- **React Native for Web**によるコード共有
- **遅延ローディング**（画面別コード分割）
- **メモ化**（React.memo、useMemo 活用）
- **レスポンシブ画像**（画面サイズ対応）

### 8.2 データベース最適化

- **複合インデックス**設定による高速クエリ
- **リアルタイムリスナー**最小化
- **ページネーション**対応（大量データ処理）
- **キャッシュ戦略**（Firebase 標準キャッシュ活用）

### 8.3 スケーラビリティ対応

- **多店舗対応アーキテクチャ**
- **Firebase 自動スケーリング**活用
- **CDN 配信**（Vercel Edge Network）
- **将来的なマイクロサービス化**に対応可能な設計

---

## 9. 運用・メンテナンス

### 9.1 デプロイメント

- **本番環境**: Render
- **モバイル**: Expo Application Services
- **継続的インテグレーション**: GitHub Actions

### 9.2 監視・ログ

- **Firebase Analytics**: ユーザー行動分析
- **Crashlytics**: エラー監視（モバイル）
- **Vercel Analytics**: パフォーマンス監視（Web）

### 9.3 バックアップ・復旧

- **Firebase 自動バックアップ**
- **データエクスポート機能**（管理者向け）
- **段階的復旧プロセス**

---

## 10. 今後の拡張計画

### 10.1 短期計画（3-6 ヶ月）別プロジェクトとして本番仕様版を現在構築中

- **通知機能**: プッシュ通知、メール通知
- **モバイルアプリ化**: iOS・Android 対応
- **レポート機能強化**: より詳細な分析機能

### 10.2 中期計画（6-12 ヶ月）

- **AI 機能**: シフト最適化提案、需要予測
- **外部連携**: 会計ソフト、POS システム連携

### 10.3 長期計画（1 年以上）

- **エンタープライズ機能**: 大規模チェーン店対応
- **API 公開**: サードパーティ連携
- **ホワイトラベル化**: 他社ブランドでの提供

---

## 11. まとめ

Shiftize は、学習塾の実際の運営課題から生まれた、現場のニーズに特化したシフト管理・タスク管理アプリケーションです。既存の業務フローを尊重しながら、デジタル化による効率化を実現します。

**主な特徴**:

- 🎯 **実用性重視**: 実際の塾運営で発生した課題の直接的解決
- 📊 **直感的 UI**: 既存サイトのデザインを踏襲し学習コストを最小化
- 📱 **段階的移行**: 大きな変化を避けた自然な業務デジタル化
- 🔒 **セキュア**: Firebase 基盤による堅牢なセキュリティ
- ⚡ **リアルタイム**: LINE 管理からの脱却、即座の情報同期
- 📈 **透明性**: 曖昧だった管理を明確化、無断欠席問題の解決

**ROI（投資対効果）実績**:

**定量的効果:**

- 📈 **シフト提出率**: 10 件/月 → 30 件/月（**300%向上**）
- ⏱️ **作業時間短縮**: 10 分 → 3 分
- 📅 **計画性向上**: 翌月シフト 25 件事前登録（従来 10 件）
- 💰 **運用コスト**: 手動管理工数の大幅削減

**定性的効果:**

- ✅ 手動 LINE 管理からの完全脱却
- ✅ シフト情報の一元管理と透明化
- ✅ 既存業務フローの維持による円滑な移行
- ✅ スタッフの業務満足度向上（操作時間短縮による）
- ✅ 学習塾特有の複雑なシフト形態（授業＋運営業務）への完全対応
- ✅ 既存アプリでは実現困難だった業界特化機能の実装

**継続的価値:**

- 🚀 習熟によるさらなる効率化が期待
- 📊 データ蓄積による分析・最適化の可能性
- 🔄 スケーラブルな多店舗展開への対応力
