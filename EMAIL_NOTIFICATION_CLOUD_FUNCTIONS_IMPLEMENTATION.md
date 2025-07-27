# メール通知機能 Firebase Cloud Functions実装記録

## 実装日: 2025年7月26日

## 背景
React Native for Web（Expo Router）環境では、直接SMTPメール送信ができないため、Firebase Cloud Functionsを使用してメール送信機能を実装しました。

## 実装の流れ

### 1. 現状分析
- Next.js API Routes（`src/app/api/`）がExpo環境で動作しないことが判明
- `Unable to resolve "next/server"` エラーが発生
- Next.js特有のディレクトリを削除

### 2. 実装方針の決定
3つのオプションから検討：
- **オプション1: Firebase Cloud Functions（選択）** ✅
- オプション2: 外部メールAPIサービス（SendGrid等）
- オプション3: 独自のバックエンドAPI

### 3. Firebase Functions構造の作成

#### ディレクトリ構造
```
functions/
├── src/
│   └── index.ts         # Cloud Functions実装
├── package.json         # 依存関係定義
├── tsconfig.json        # TypeScript設定
└── .gitignore          # Git除外設定
```

#### package.json
```json
{
  "name": "functions",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^11.11.0",
    "firebase-functions": "^4.5.0",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "@types/node": "^18.11.9",
    "@types/nodemailer": "^6.4.14",
    "typescript": "^4.9.0",
    "firebase-functions-test": "^3.1.0"
  }
}
```

### 4. Cloud Functions実装

2つの関数を実装：
1. **sendEmail**: 汎用メール送信関数
2. **sendShiftNotification**: シフト通知専用関数

主な機能：
- Gmail SMTP経由でのメール送信
- 認証チェック（Firebase Auth連携）
- 東京リージョン（asia-northeast1）設定
- 美しいHTMLメールテンプレート

### 5. EmailServiceの更新

`src/lib/email-service.ts`を更新：
- Firebase Cloud Functions呼び出しに対応
- 開発環境でのモック機能維持
- エラーハンドリング追加

```typescript
// Firebase Cloud Functionsを使用
import { getFunctions, httpsCallable } from 'firebase/functions';

// 開発環境制御
if (process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_USE_EMAIL_MOCK === 'true') {
  // モック動作
} else {
  // Cloud Functions呼び出し
}
```

### 6. トラブルシューティング

#### 問題1: パッケージバージョンの不整合
```
npm error notarget No matching version found for @types/nodemailer@^6.4.19
```
**解決**: より安定したバージョンに変更

#### 問題2: TypeScriptビルドエラー（149エラー）
**解決**: tsconfig.jsonに以下を追加
- `"skipLibCheck": true`
- `"esModuleInterop": true`
- `"types": ["node"]`
- excludeディレクトリの明示

#### 問題3: 関数名のタイポ
```
Property 'createTransporter' does not exist
```
**解決**: `createTransporter` → `createTransport`

## 現在の状態

✅ **完了した作業**
- Firebase Functions構造作成
- メール送信Cloud Functions実装
- EmailServiceのCloud Functions対応
- TypeScript設定の最適化
- ビルド成功確認

⏳ **次のステップ**（別途実施）
1. Firebase CLIでのGmail認証情報設定
2. Cloud Functionsのデプロイ
3. 本番環境でのテスト

## 重要なファイル

1. **functions/src/index.ts** - Cloud Functions実装
2. **src/lib/email-service.ts** - クライアント側のメール送信サービス
3. **FIREBASE_FUNCTIONS_SETUP.md** - セットアップガイド
4. **functions/package.json** - 依存関係定義
5. **functions/tsconfig.json** - TypeScript設定

## 環境変数

開発環境（`.env.local`）:
```bash
# メール送信をモックする場合
EXPO_PUBLIC_USE_EMAIL_MOCK=true

# 本番環境で実際に送信する場合
EXPO_PUBLIC_USE_EMAIL_MOCK=false
```

Firebase Functions設定:
```bash
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.password="your-app-specific-password"
```

## まとめ

React Native for Web環境でのメール通知機能を、Firebase Cloud Functionsを使用して実装しました。これにより、セキュアで拡張性の高いメール送信が可能になりました。次回は、実際のデプロイと本番環境でのテストを行います。