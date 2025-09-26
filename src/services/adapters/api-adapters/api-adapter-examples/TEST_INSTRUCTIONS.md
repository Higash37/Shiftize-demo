# APIサービス移行テスト手順

## 🎯 テスト目的
新しく作成した`ShiftAPIService`が既存のFirebaseサービスと同等に動作することを確認する。

## 📋 テスト準備

### 1. 環境変数確認
`.env`ファイルに以下が設定されていることを確認：
```bash
# Firebase直接呼び出しモード（フェーズ1テスト）
EXPO_PUBLIC_USE_SHIFT_API=false
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 2. バックアップ確認
オリジナルファイルがバックアップされていることを確認：
- `useShiftActions.ts.backup` ← 元ファイル

### 3. 変更されたファイル
- ✅ `useShiftActions.ts` - 新APIサービス使用に変更済み
- ✅ `TestComponent.tsx` - テスト用コンポーネント作成済み

## 🧪 テスト手順

### ステップ1: 基本動作確認

1. **アプリを起動**
   ```bash
   npm start
   # または
   expo start
   ```

2. **コンソールログを確認**
   開発者ツールで以下のログが表示されることを確認：
   ```
   🔄 useShiftActions - API移行テスト中: {
     useApiEndpoints: false,
     apiBaseUrl: "http://localhost:3000",
     service: "ShiftAPIService"
   }
   ```

3. **既存のシフト一覧画面で動作確認**
   - シフト一覧が正常に表示される
   - 読み込み中の表示が正常
   - エラーが発生しない

### ステップ2: 機能テスト

1. **シフト取得テスト**
   - 異なる権限（master/user）でログイン
   - シフト一覧が正常に取得される
   - 複数店舗連携がある場合は連携店舗のシフトも取得される

2. **シフト操作テスト**
   - シフト作成
   - シフト編集
   - シフト削除
   - シフト承認（masterの場合）

### ステップ3: テストコンポーネント使用

1. **TestComponent.tsxの配置**
   テスト用コンポーネントを適当な画面に一時的に追加：
   ```typescript
   import TestComponent from '@/services/api/examples/TestComponent';
   
   // 適当な画面に追加
   <TestComponent />
   ```

2. **テスト項目確認**
   - ✅ ユーザー情報表示
   - ✅ API状態表示（Firebase直接 = false）
   - ✅ シフト取得状況
   - ✅ エラーハンドリング
   - ✅ デバッグ情報
   - ✅ テストログ表示

## 📊 期待される結果

### 正常動作の場合
```
✅ ユーザー認証済み: user@example.com (user)
🔄 デバッグ情報: {"useApiEndpoints":false,"apiBaseUrl":"http://localhost:3000","service":"ShiftAPIService"}
✅ シフト取得成功: 5件
```

### エラーがある場合
```
❌ エラー発生: このシフトにアクセスする権限がありません
❌ シフト取得エラー: Firebase error details...
```

## 🔄 テスト切り替え

### Firebase直接モード（現在）
```bash
EXPO_PUBLIC_USE_SHIFT_API=false
```
- 新APIサービス経由でFirebaseを直接呼び出し
- 既存機能と100%同等の動作を期待

### APIエンドポイントモード（フェーズ2以降）
```bash
EXPO_PUBLIC_USE_SHIFT_API=true
```
- 実際のAPIエンドポイント呼び出し
- ⚠️ 現在は実装されていないためエラーになる

## 🚨 問題が発生した場合

### 1. 元に戻す方法
```bash
# バックアップから復元
cp useShiftActions.ts.backup useShiftActions.ts
```

### 2. よくある問題

**インポートエラー**
```
Error: Cannot resolve module '@/services/api'
```
→ TypeScriptの設定やパス解決の問題

**Firebase接続エラー**
```
Error: Firebase app not initialized
```
→ 環境変数やFirebase設定の問題

**権限エラー**
```
Error: permission-denied
```
→ Firestoreセキュリティルールの問題

### 3. デバッグ方法
- コンソールログで`🔄`マークのログを確認
- `ShiftAPIService.getDebugInfo()`の結果を確認
- エラーメッセージの詳細を確認

## ✅ テスト完了チェックリスト

- [ ] アプリが正常に起動する
- [ ] シフト一覧が表示される
- [ ] デバッグログで`useApiEndpoints: false`が確認できる
- [ ] シフト作成が動作する
- [ ] シフト編集が動作する
- [ ] シフト削除が動作する
- [ ] エラーハンドリングが適切に動作する
- [ ] 既存機能に影響がない

## 📝 テスト結果記録

テスト実行者: _______________
テスト日時: _______________
テスト環境: _______________

### 結果
- [ ] ✅ すべて正常
- [ ] ⚠️ 一部問題あり（詳細: _______________）  
- [ ] ❌ 重大な問題あり（詳細: _______________）

### 次のステップ
- [ ] フェーズ2（Next.js API Routes）に進む
- [ ] 他のサービス（AuthAPIService等）も移行する
- [ ] 元の実装に戻す