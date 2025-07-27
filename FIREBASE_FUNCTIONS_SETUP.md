# Firebase Cloud Functions メール通知セットアップガイド

## 概要
このガイドでは、Shiftizeアプリのメール通知機能をFirebase Cloud Functionsで動作させるための手順を説明します。

## 前提条件
- Firebaseプロジェクトが作成済み
- Firebase CLIがインストール済み（`npm install -g firebase-tools`）
- Node.js v20以上（推奨）またはv18（最小要件）
- Gmailアカウントと2段階認証設定済み
- Gmailアプリパスワード取得済み

## セットアップ手順

### 1. 依存関係のインストール

```bash
# functionsディレクトリに移動
cd functions

# 依存関係をインストール
npm install
```

### 2. Firebase CLIでログイン

```bash
firebase login
```

### 3. Firebaseプロジェクトの選択

```bash
firebase use <your-project-id>
```

### 4. Gmail認証情報の設定

```bash
# Gmail認証情報を環境変数として設定
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.password="your-app-specific-password"
```

#### Gmailアプリパスワードの取得方法：
1. [Googleアカウント設定](https://myaccount.google.com/security)にアクセス
2. 「2段階認証」を有効化
3. 「アプリパスワード」を選択
4. アプリで「メール」を選択
5. デバイスで「その他（カスタム名）」を選択し、「Shiftize」と入力
6. 生成された16文字のパスワードをコピー

### 5. 環境変数の確認

```bash
# 設定した環境変数を確認
firebase functions:config:get
```

以下のような出力が表示されれば成功：
```json
{
  "email": {
    "user": "your-gmail@gmail.com",
    "password": "your-app-password"
  }
}
```

### 6. TypeScriptのビルド

```bash
# functionsディレクトリで実行
npm run build
```

### 7. Cloud Functionsのデプロイ

```bash
# functionsディレクトリで実行
npm run deploy

# または、プロジェクトルートから
firebase deploy --only functions
```

### 8. アプリ側の環境変数設定

`.env.local`ファイルに以下を追加：

```bash
# メール通知設定
EXPO_PUBLIC_USE_EMAIL_MOCK=false  # 本番環境でメール送信を有効化
NODE_ENV=production               # 本番環境設定
```

## 動作確認

### 1. Firebase Consoleで確認
- [Firebase Console](https://console.firebase.google.com/)にアクセス
- プロジェクトを選択
- 「Functions」セクションで`sendEmail`と`sendShiftNotification`が表示されることを確認

### 2. ログの確認
```bash
firebase functions:log
```

### 3. アプリでテスト
1. アプリにログイン
2. シフトを作成（講師アカウントで）
3. Firebase Functionsのログでメール送信を確認
4. 教室長のメールアドレスに通知が届くことを確認

## トラブルシューティング

### エラー: "Email configuration not found"
環境変数が正しく設定されていません。手順4を再実行してください。

### エラー: "Authentication failed"
- Gmailの2段階認証が有効になっているか確認
- アプリパスワードが正しいか確認
- アプリパスワードにスペースが含まれていないか確認

### メールが届かない
1. Gmail側で「安全性の低いアプリのアクセス」がブロックされていないか確認
2. 迷惑メールフォルダを確認
3. Firebase Functionsのログを確認：`firebase functions:log`

### デプロイエラー
```bash
# Node.jsバージョンを確認
node --version

# v20以上でない場合は、functions/package.jsonのenginesを修正
"engines": {
  "node": "18"  // または "20"
}
```

## 開発環境での動作

開発中はメール送信をモックしたい場合：

```bash
# .env.localに追加
EXPO_PUBLIC_USE_EMAIL_MOCK=true
```

これにより、実際のメール送信は行われず、コンソールログに内容が出力されます。

## 料金について

Firebase Cloud Functionsの無料枠：
- 月間125,000回の呼び出し
- 月間40,000GB-秒のコンピューティング時間

通常の使用では無料枠内で収まります。

## セキュリティ注意事項

1. **環境変数の管理**
   - Gmailのパスワードは絶対にソースコードにコミットしない
   - `.env.local`ファイルは`.gitignore`に含める

2. **認証チェック**
   - Cloud Functionsは認証済みユーザーのみ呼び出し可能
   - 不正なアクセスは自動的にブロック

3. **レート制限**
   - 大量のメール送信を防ぐため、アプリ側で適切な制限を実装

## 次のステップ

1. **メール送信の監視**
   - Firebase Consoleでメール送信数を監視
   - エラー率をチェック

2. **テンプレートのカスタマイズ**
   - `functions/src/index.ts`の`generateEmailTemplate`関数を編集
   - 企業ロゴやカスタムスタイルの追加

3. **追加の通知タイプ**
   - シフト変更通知
   - リマインダー通知
   - 月次レポート通知

---

問題が発生した場合は、以下を確認してください：
- Firebase Functionsのログ：`firebase functions:log`
- Firebase Console：https://console.firebase.google.com/
- アプリのコンソールログ