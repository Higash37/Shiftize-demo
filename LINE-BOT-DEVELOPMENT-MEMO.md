# LINE Bot 開発メモ

## 🎯 現在のゴール

**LINE ボットで複数日選択可能なシフト追加機能の実装**

- LINE 標準の DateTimePicker は単一選択のみ対応
- 複数日を一度に選択できる機能が必要
- ユーザビリティを重視した 2 つの選択方法を提供

---

## 🔧 実装内容

### 複数日選択の 2 つの方法

1. **📝 テキスト入力方式**

   - フォーマット: `12/15 12/16 12/20` または `2025-12-15 2025-12-16` または `12月15日 12月16日`
   - 正規表現で複数の日付形式に対応
   - 一度に大量の日付を入力可能

2. **📅 1 日ずつ選択方式**
   - カレンダーで 1 日ずつタップして蓄積
   - セッション管理で選択状態を保持
   - 「現在 X 日選択中」でリアルタイム表示

### セッション管理

```javascript
const userSessions: Record<
  string,
  {
    selectedDates: string[],
    step: "selecting" | "confirming" | "time_setting",
    shiftTemplate?: {
      startTime: string,
      endTime: string,
    },
  }
> = {};
```

---

## 🚨 重要なトラブルシューティング

### Firebase Functions デプロイが反映されない問題

**症状:**

- `firebase deploy`で「No changes detected」と表示
- 実際にコードを変更してもデプロイされない
- 古いバージョンが動作し続ける

**原因:**

- Firebase Functions のキャッシュ機能
- 同じ関数名での上書きデプロイ時の変更検出の問題
- ハッシュ値ベースの変更検出が機能しない場合がある

**解決方法:**

```bash
# 1. 関数を完全削除
firebase functions:delete lineWebhook --force

# 2. 新規作成でデプロイ
firebase deploy --only functions:lineWebhook
```

**その他の対策:**

```bash
# 強制デプロイ
firebase deploy --force

# 一時的に関数名を変更してデプロイ
export const lineWebhookV2 = functions.https.onRequest(...)
```

**確認方法:**

- パッケージサイズの変化をチェック（109.9 KB → 116.55 KB）
- デプロイログの`firebase-functions-hash`を確認

---

## 📋 実装済み機能

### メッセージハンドリング

- ✅ 複数日シフト追加のトリガー認識
- ✅ テキスト入力の日付解析（複数形式対応）
- ✅ セッション状態管理
- ✅ 選択日数のリアルタイム表示

### ポストバック処理

- ✅ 選択方法の分岐処理
- ✅ カレンダー選択の蓄積機能
- ✅ 決定・キャンセル・クリアの操作

### エラーハンドリング

- ✅ 不正な日付形式の検証
- ✅ 最大選択数制限（現在 10 日）
- ✅ セッションの初期化・クリーンアップ

---

## 🔄 開発履歴

### 2025-09-14

- **Phase 1**: LINE 標準 DateTimePicker の制限判明
- **Phase 2**: 複数日選択機能の設計・実装
- **Phase 3**: Firebase Functions デプロイ問題の発生・解決
- **Phase 4**: 新機能の正常デプロイ完了

### 技術的課題と解決

1. **LINE DateTimePicker の単一選択制限** → 独自 UI 実装
2. **Firebase Functions キャッシュ問題** → 完全削除・再作成
3. **セッション管理の設計** → メモリベース（本格運用時は Firestore 推奨）

---

## 📝 今後の改善点

### 短期

- [ ] セッションの Firestore 移行（永続化）
- [ ] 日付選択の上限設定 UI
- [ ] 時刻設定機能の統合

### 中期

- [ ] カレンダー UI の改善（月跨ぎ対応）
- [ ] 選択日付の視覚的フィードバック強化
- [ ] 操作ログの詳細化

### 長期

- [ ] 他の複数選択 UI（週単位、月単位）
- [ ] AI による日付推薦機能
- [ ] リッチメニューとの統合

---

## 🔍 デバッグ用コマンド

```bash
# ログ確認
cd functions && firebase functions:log

# 関数一覧
firebase functions:list

# 強制デプロイ
firebase deploy --force

# 関数削除（緊急時）
firebase functions:delete lineWebhook --force
```

---

## 📞 LINE Bot 設定情報

- **Webhook URL**: `https://us-central1-shiftschedulerapp-71104.cloudfunctions.net/lineWebhook`
- **Runtime**: Node.js 20
- **Memory**: 256MB
- **Location**: us-central1

---

_最終更新: 2025-09-14_
_作成者: Claude Code Assistant_

1. 完全削除＋再デプロイ（推奨）
   firebase functions:delete lineWebhook --force
   firebase deploy --only functions:lineWebhook
2. 環境変数変更でキャッシュ無効化

   - 環境変数を変更すると全実行中イン

スタンスに伝播され、キャッシュクリア
が可能 3. デプロイタイムアウト延長
export
FUNCTIONS_DISCOVERY_TIMEOUT=30
firebase deploy --only functions

LINE Bot webhook 特有の問題：

- 伝播遅延: デプロイ完了後も 10-30 秒  
  間は古いバージョンが動作する
- 本番トラフィック処理中: 新旧両方の  
  バージョンが同時実行される期間がある

現在の状況分析：

あなたのケースは典型的な「コンテナイ  
 メージキャッシュ問題」です。Firebase  
 が古いビルドアーティファクトをキャッ  
 シュしている可能性が高いです。

推奨対応：
メモに記載の通り、firebase
functions:delete lineWebhook --force  
 を実行してから再デプロイするのが最  
 も確実な解決策です。原因判明：TypeScript のコンパイルが必  
 要だった！
