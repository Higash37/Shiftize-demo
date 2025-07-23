# ファイル管理システム仕様書

## 概要

シフトスケジューラーアプリに統合されたファイル管理システムです。過去問の PDF や教材ファイルを階層フォルダ構造で管理し、ブラウザ経由で印刷できる機能を提供します。

## システム構成

### データベース構造

#### Firestore Collections

**folders コレクション**

```typescript
interface Folder {
  id: string;
  name: string;
  parentId?: string; // ルートフォルダの場合はundefined
  path: string; // "/数学/1年生/代数" のような階層パス
  level: number; // 階層レベル（ルート = 0）
  storeId: string; // 店舗ID（マルチテナント対応）
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // ユーザーUID
  isDeleted: boolean;
  childrenCount: number; // 子フォルダ数
  filesCount: number; // 直下のファイル数
}
```

**files コレクション**

```typescript
interface FileItem {
  id: string;
  name: string;
  originalName: string; // 元のファイル名
  type: FileType; // "pdf" | "image" | "document" | "video" | "audio" | "other"
  mimeType: string;
  size: number; // バイト数
  folderId: string; // 空文字の場合はルートフォルダ
  folderPath?: string; // フォルダの階層パス
  storeId: string;
  storageUrl: string; // Firebase Storage URL
  downloadUrl?: string; // 公開ダウンロードURL
  thumbnailUrl?: string; // サムネイルURL（将来実装）
  metadata: FileMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isDeleted: boolean;
  downloadCount: number;
  lastAccessedAt?: Date;
}
```

### Firebase Storage 構造

```
files/
  {storeId}/
    root/          # ルートフォルダのファイル
      {timestamp}  # ファイル名（重複回避）
    {folderId}/    # 各フォルダのファイル
      {timestamp}  # ファイル名（重複回避）
```

## 実装済み機能 ✅

### 基本機能

1. **階層フォルダ構造**

   - エクスプローラー風の UI
   - 無制限の階層レベル
   - パンくずリスト表示

2. **ファイルアップロード**

   - 複数ファイル同時アップロード
   - ドラッグ&ドロップ対応（Web）
   - ファイル形式の自動判定
   - サイズ制限とバリデーション

3. **フォルダ作成**

   - 任意の階層でのフォルダ作成
   - 名前の重複チェック
   - 階層パスの自動生成

4. **ファイル表示・プレビュー**

   - ファイルタイプ別アイコン表示
   - ブラウザでの直接表示（PDF 等）
   - ダウンロード回数の記録

5. **ナビゲーション**
   - フォルダクリックでの移動
   - パンくずリストでの階層移動
   - ルートフォルダへの戻り

### UI/UX 機能

1. **レスポンシブデザイン**

   - PC: 4 列グリッド表示
   - モバイル: 2 列グリッド表示
   - タブレット: 3 列グリッド表示

2. **統合ナビゲーション**

   - 講師用フッター: ホーム、ファイル、設定、シフト追加（4 アイコン）
   - マスター用フッター: ファイルタブ追加

3. **ローディング状態**
   - アップロード進捗表示
   - データ読み込み中の表示

### セキュリティ機能

1. **認証・認可**

   - Firebase Authentication 連携
   - 店舗 ID（storeId）による分離
   - ユーザー権限に基づくアクセス制御

2. **データ保護**
   - Firestore Security Rules
   - Firebase Storage Security Rules
   - 論理削除（isDeleted フラグ）

## 今後の実装予定機能 🚧

### Phase 1: 基本操作の拡張

1. **ファイル・フォルダの一括操作**

   - 複数選択機能（チェックボックス）
   - 一括削除
   - 一括移動
   - 一括複製

2. **移動・複製機能**

   - ドラッグ&ドロップでの移動
   - 右クリックコンテキストメニュー
   - フォルダ選択ダイアログ
   - 階層を跨いだ移動・複製

3. **ファイル管理操作**
   - ファイル名の変更
   - フォルダ名の変更
   - ファイル・フォルダの削除
   - ゴミ箱機能（削除の取り消し）

### Phase 2: 検索・フィルタリング

1. **高度な検索機能**

   - ファイル名での全文検索
   - ファイルタイプでのフィルタリング
   - 作成日・更新日での範囲検索
   - 作成者での絞り込み

2. **ソート機能**
   - 名前順（昇順・降順）
   - 作成日順（昇順・降順）
   - ファイルサイズ順
   - ダウンロード数順

### Phase 3: プレビュー・編集機能

1. **ファイルプレビュー**

   - PDF 埋め込みビューア
   - 画像プレビュー
   - 動画・音声プレビュー
   - テキストファイル表示

2. **印刷機能の強化**
   - 複数ファイルの一括印刷
   - 印刷設定の保存
   - 印刷履歴の記録

### Phase 4: 共有・コラボレーション

1. **共有機能**

   - フォルダ・ファイルの共有リンク生成
   - 期限付きアクセス
   - パスワード保護

2. **権限管理**
   - フォルダ単位での権限設定
   - 読み取り専用・編集可能の設定
   - ユーザーグループでの権限管理

### Phase 5: 統計・分析機能

1. **使用状況の分析**

   - ファイルダウンロード統計
   - 人気ファイルのランキング
   - ストレージ使用量の監視

2. **管理機能**
   - 自動バックアップ
   - ファイル重複の検出・削除
   - 古いファイルの自動アーカイブ

## 技術実装詳細

### 使用技術スタック

- **フロントエンド**: React Native (Expo)
- **バックエンド**: Firebase (Firestore, Storage, Functions)
- **認証**: Firebase Authentication
- **ファイルストレージ**: Firebase Cloud Storage
- **UI Framework**: React Native Elements, Expo Vector Icons

### パフォーマンス最適化

1. **遅延読み込み**

   - フォルダ内容の必要時読み込み
   - 画像サムネイルの遅延生成

2. **キャッシュ機能**

   - ダウンロード URL のキャッシュ
   - フォルダ構造のローカルキャッシュ

3. **バッチ処理**
   - 複数ファイルの一括処理
   - Firestore 書き込みの最適化

### セキュリティ対策

1. **アクセス制御**

   - 店舗 ID による完全分離
   - ユーザー認証の必須化
   - ファイルアクセスの監査ログ

2. **ファイル検証**
   - アップロード時のファイル形式チェック
   - ウイルススキャン（将来実装）
   - ファイルサイズ制限

## 開発ガイドライン

### ファイル構成

```
src/
├── modules/file-management/
│   ├── FileManagerView.tsx           # メインビュー
│   └── components/
│       ├── FileExplorer/             # ファイル一覧表示
│       ├── FileUploadModal/          # アップロードモーダル
│       └── CreateFolderModal/        # フォルダ作成モーダル
├── services/file/
│   ├── fileService.ts                # Firestoreサービス
│   ├── storageService.ts             # Firebase Storageサービス
│   └── collectionRecovery.ts         # データ復旧サービス
└── common/common-models/model-file/
    └── FileModel.ts                  # 型定義
```

### コーディング規約

1. **非同期処理**: async/await を使用
2. **エラーハンドリング**: try-catch で適切な例外処理
3. **TypeScript**: 厳密な型定義を徹底
4. **ログ出力**: console.log でデバッグ情報を出力
5. **コメント**: 日本語でのコメント記述

## テスト項目

### 基本機能テスト

- [ ] フォルダ作成・削除
- [ ] ファイルアップロード・ダウンロード
- [ ] 階層移動・ナビゲーション
- [ ] 権限チェック（店舗分離）

### パフォーマンステスト

- [ ] 大量ファイル（1000 件以上）での動作
- [ ] 大容量ファイル（100MB 以上）のアップロード
- [ ] 同時アクセス時の動作

### セキュリティテスト

- [ ] 他店舗データへの不正アクセス防止
- [ ] 未認証ユーザーのアクセス拒否
- [ ] ファイル形式制限の動作確認

## 既知の問題・制限事項

### 現在の制限

1. **ファイルサイズ制限**: Firebase Storage の制限に依存
2. **同時アップロード数**: ブラウザの制限に依存
3. **ファイル形式**: 実行可能ファイルは制限
4. **階層制限**: 理論上は無制限だが、パフォーマンスを考慮

### 今後の改善予定

1. **スクロール問題**: ヘッダー・フッター固定の完全対応
2. **モバイル最適化**: タッチ操作の改善
3. **オフライン対応**: ローカルキャッシュの活用
4. **国際化**: 多言語対応

---

**更新日**: 2024 年 1 月
**バージョン**: v1.0.0
**担当者**: 開発チーム
