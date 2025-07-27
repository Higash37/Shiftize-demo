# バックエンド移行仕様書

## 概要
Shiftizeアプリのフロントエンド直接Firebase構成から、セキュアなバックエンドAPI構成への段階的移行計画。

## 🔒 セキュリティ対策完了状況 (2025-01-27)

### ✅ Phase 1: セキュリティ強化完了
- **AES-256暗号化**: 個人情報の完全暗号化実装
- **GDPR準拠**: データ管理・監査システム完全実装
- **Firebase Security Rules**: 完全見直し・強化完了
- **入力値検証**: XSS/CSRF対策・包括的バリデーション実装
- **監査ログ**: 7年保存対応の監査システム実装

## 現在のシステム構成

### Firebaseサービス一覧
| ファイル | 行数 | 主要機能 | 移行優先度 |
|---------|------|----------|------------|
| firebase-shift.ts | 313行 | シフトCRUD、多店舗対応 | **高** |
| firebase-multistore.ts | 775行 | 店舗連携、権限管理 | **高** |
| firebase-extended-task.ts | 384行 | 拡張タスク管理 | 中 |
| firebase-auth.ts | 309行 | 認証・ユーザー管理 | **高** |
| firebase-group.ts | 240行 | グループ管理 | 低 |
| firebase-user.ts | 126行 | ユーザー情報管理 | 中 |
| firebase-task.ts | 68行 | 基本タスク管理 | 低 |

### データモデル構造

#### シフト関連
```typescript
interface Shift {
  id: string;
  userId: string;
  storeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus; // draft | pending | approved | rejected | deletion_requested | deleted | completed | purged
  nickname?: string;
  type?: ShiftType; // user | class | staff | deleted
  classes?: ClassTimeSlot[];
  extendedTasks?: ShiftTaskSlot[];
  requestedChanges?: ChangeRequest[];
}
```

#### タスク関連
```typescript
interface ExtendedTask {
  id: string;
  title: string;
  shortName?: string;
  type: TaskType; // standard | time_specific | custom | user_defined | class
  baseTimeMinutes: number;
  baseCountPerShift: number;
  restrictedTimeRanges?: TimeRange[];
  priority: TaskLevel; // low | medium | high
  storeId: string;
  isActive: boolean;
}
```

### セキュリティ上の問題点
1. **クライアント側でのデータ操作**: 全てのビジネスロジックがクライアント側で実行
2. **緩いFirestoreルール**: 認証済みユーザーは全データアクセス可能
3. **クライアント側でのロール判定**: `user.email?.includes("master")` で権限決定
4. **給与計算の露出**: 時給計算ロジックがクライアント側で公開

## 移行戦略

### フェーズ1: サービス抽象化層の構築 ⭐
**目標**: 既存コードを壊さずにAPI層を準備
**期間**: 1-2週間

#### 1.1 APIサービス層の作成
```
src/services/api/
├── ShiftAPIService.ts        # ShiftService のラッパー
├── MultiStoreAPIService.ts   # MultiStoreService のラッパー
├── AuthAPIService.ts         # AuthService のラッパー
├── TaskAPIService.ts         # TaskService のラッパー
└── types/
    ├── api-responses.ts      # API レスポンス型定義
    └── api-requests.ts       # API リクエスト型定義
```

#### 1.2 初期実装例
```typescript
// src/services/api/ShiftAPIService.ts
import { ShiftService } from '../firebase/firebase-shift';

export class ShiftAPIService {
  // 初期は Firebase を直接呼び出し
  static async getShifts(storeId?: string) {
    return ShiftService.getShifts(storeId);
  }
  
  // 段階的に API エンドポイントに切り替え
  // static async getShifts(storeId?: string) {
  //   const response = await fetch(`/api/shifts?storeId=${storeId}`);
  //   return response.json();
  // }
}
```

#### 1.3 コンポーネント側の変更
```typescript
// Before
import { ShiftService } from '@/services/firebase/firebase-shift';
ShiftService.getShifts(storeId)

// After
import { ShiftAPIService } from '@/services/api/ShiftAPIService';
ShiftAPIService.getShifts(storeId)
```

### フェーズ2: Next.js API Routes の構築
**目標**: バックエンドAPI基盤の構築
**期間**: 2-3週間

#### 2.1 APIディレクトリ構造
```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── verify/route.ts
├── shifts/
│   ├── route.ts              # GET /api/shifts
│   ├── [id]/route.ts         # GET/PUT/DELETE /api/shifts/[id]
│   └── batch/route.ts        # POST /api/shifts/batch
├── multistore/
│   ├── connect/route.ts      # POST /api/multistore/connect
│   ├── access/route.ts       # GET /api/multistore/access
│   └── disconnect/route.ts   # POST /api/multistore/disconnect
├── tasks/
│   ├── route.ts              # GET/POST /api/tasks
│   ├── [id]/route.ts         # GET/PUT/DELETE /api/tasks/[id]
│   └── extended/route.ts     # Extended tasks endpoints
├── users/
│   ├── route.ts              # GET/POST /api/users
│   ├── [id]/route.ts         # GET/PUT/DELETE /api/users/[id]
│   └── invite/route.ts       # POST /api/users/invite
├── notifications/
│   ├── send/route.ts         # POST /api/notifications/send
│   ├── register/route.ts     # POST /api/notifications/register
│   └── history/route.ts      # GET /api/notifications/history
└── wage/
    ├── calculate/route.ts    # POST /api/wage/calculate
    └── report/route.ts       # GET /api/wage/report
```

#### 2.2 認証ミドルウェア
```typescript
// lib/auth-middleware.ts
import { NextRequest } from 'next/server';
import { admin } from './firebase-admin';

export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('認証トークンが必要です');
  }

  const token = authHeader.split(' ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken;
}

export async function authorizeStoreAccess(userId: string, storeId: string) {
  // 店舗アクセス権限チェック
  const userDoc = await admin.firestore()
    .collection('userStoreAccess')
    .doc(userId)
    .get();
    
  const userData = userDoc.data();
  return userData?.storesAccess?.[storeId] != null;
}
```

#### 2.3 API実装例（シフト取得）
```typescript
// app/api/shifts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeStoreAccess } from '@/lib/auth-middleware';
import { admin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const user = await authenticateRequest(request);
    
    // パラメータ取得
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }
    
    // 権限チェック
    if (!await authorizeStoreAccess(user.uid, storeId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // データ取得
    const shiftsRef = admin.firestore().collection('shifts');
    const snapshot = await shiftsRef.where('storeId', '==', storeId).get();
    
    const shifts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // サーバー側でソート
    shifts.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare === 0 ? a.startTime.localeCompare(b.startTime) : dateCompare;
    });
    
    return NextResponse.json(shifts);
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### フェーズ3: 段階的API移行
**目標**: サービスごとにAPI化
**期間**: 4-6週間

#### 3.1 移行順序
1. **認証API** → 最も重要、他の機能の前提
2. **シフトAPI** → 最も使用頻度が高い
3. **多店舗管理API** → 複雑なロジックを優先
4. **タスクAPI** → 給与計算に関連
5. **通知API** → 新機能として追加

#### 3.2 各段階での切り替え
```typescript
// ShiftAPIService.ts の段階的更新
export class ShiftAPIService {
  private static USE_API = process.env.EXPO_PUBLIC_USE_SHIFT_API === 'true';
  
  static async getShifts(storeId?: string) {
    if (this.USE_API) {
      // API経由
      const response = await fetch(`/api/shifts?storeId=${storeId}`, {
        headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
      });
      return response.json();
    } else {
      // 従来のFirebase直接アクセス
      return ShiftService.getShifts(storeId);
    }
  }
}
```

### フェーズ4: 高度機能の実装
**目標**: プッシュ通知とバックグラウンド処理
**期間**: 2-3週間

#### 4.1 プッシュ通知システム
```typescript
// app/api/notifications/send/route.ts
import { admin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  const { userId, title, body, data } = await request.json();
  
  // FCMトークン取得
  const userTokenDoc = await admin.firestore()
    .collection('userTokens')
    .doc(userId)
    .get();
    
  const tokens = userTokenDoc.data()?.tokens || [];
  
  // 通知送信
  const message = {
    notification: { title, body },
    data,
    tokens
  };
  
  const response = await admin.messaging().sendMulticast(message);
  return NextResponse.json({ success: response.successCount });
}
```

#### 4.2 通知トリガー（Cloud Functions）
```typescript
// functions/src/shift-notifications.ts
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { sendNotification } from './notification-service';

export const onShiftStatusChange = onDocumentUpdated(
  'shifts/{shiftId}',
  async (event) => {
    const newData = event.data?.after.data();
    const oldData = event.data?.before.data();
    
    if (newData?.status !== oldData?.status) {
      switch (newData?.status) {
        case 'approved':
          await sendNotification(newData.userId, {
            title: 'シフト承認',
            body: 'あなたのシフトが承認されました',
            data: { shiftId: event.params.shiftId }
          });
          break;
        case 'rejected':
          await sendNotification(newData.userId, {
            title: 'シフト却下',
            body: 'シフトが却下されました。理由を確認してください',
            data: { shiftId: event.params.shiftId }
          });
          break;
      }
    }
  }
);
```

## セキュリティ強化

### Firestoreセキュリティルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // シフトドキュメント
    match /shifts/{shiftId} {
      allow read: if isAuthenticated() && hasStoreAccess(resource.data.storeId);
      allow write: if isAuthenticated() && hasStoreAccess(resource.data.storeId) && isValidShiftWrite();
    }
    
    // ユーザー店舗アクセス
    match /userStoreAccess/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && isMasterOfStore();
    }
    
    // 関数定義
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasStoreAccess(storeId) {
      return get(/databases/$(database)/documents/userStoreAccess/$(request.auth.uid)).data.storesAccess[storeId] != null;
    }
    
    function isValidShiftWrite() {
      return request.resource.data.keys().hasAll(['userId', 'storeId', 'date', 'startTime', 'endTime']);
    }
  }
}
```

## 環境変数設定

### 段階的移行用フラグ
```bash
# .env.local
EXPO_PUBLIC_USE_SHIFT_API=false        # シフトAPI使用フラグ
EXPO_PUBLIC_USE_AUTH_API=false         # 認証API使用フラグ
EXPO_PUBLIC_USE_MULTISTORE_API=false   # 多店舗API使用フラグ
EXPO_PUBLIC_USE_TASK_API=false         # タスクAPI使用フラグ
EXPO_PUBLIC_USE_NOTIFICATION_API=true  # 通知API使用フラグ（新機能）

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key

# 通知設定
FCM_SERVER_KEY=your-fcm-server-key
```

## テスト戦略

### 段階的テスト
1. **API抽象化層**: 既存機能が壊れないことを確認
2. **API個別テスト**: 各エンドポイントの単体テスト
3. **統合テスト**: フロントエンド→API→Firebaseの一連の流れ
4. **A/Bテスト**: 環境変数フラグでの段階的切り替え

## 移行リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| API移行時のデータ整合性問題 | 高 | 段階的移行、フラグでの制御 |
| 認証トークン管理の複雑化 | 中 | 統一された認証ミドルウェア |
| パフォーマンス劣化 | 中 | API応答時間監視、キャッシュ実装 |
| 既存機能の破綻 | 高 | 十分なテスト、ロールバック計画 |

## 成功指標

### パフォーマンス
- API応答時間: < 500ms
- シフト一覧読み込み時間: < 2秒
- 通知配信成功率: > 95%

### セキュリティ
- 不正アクセス試行の検出・ブロック
- 適切な権限制御の実装
- 監査ログの完備

### 機能性
- 既存機能の100%互換性維持
- プッシュ通知機能の追加
- バックグラウンド処理の実装

## 運用・保守

### 監視項目
- API エラー率
- レスポンス時間
- Firebase 使用量
- 通知配信状況

### ログ管理  
- リクエスト/レスポンス ログ
- エラー ログ
- セキュリティ監査ログ
- パフォーマンス メトリクス

---

## 更新履歴
- 2025-01-24: 初版作成
- 2025-01-24: **フェーズ1完了** - APIサービス抽象化層の構築完了

## フェーズ1実装状況 ✅

### 完了項目
- [x] `src/services/api/` ディレクトリ構造作成
- [x] API型定義ファイル作成 (`types/api-requests.ts`, `types/api-responses.ts`)
- [x] `ShiftAPIService` 実装（Firebase直接呼び出し版）
- [x] APIサービス統合exports (`index.ts`)
- [x] 移行例とドキュメント作成 (`examples/migration-example.tsx`)

### 作成ファイル一覧
```
src/services/api/
├── ShiftAPIService.ts          # シフト管理API抽象化層
├── index.ts                    # API統合エクスポート
├── types/
│   ├── api-requests.ts         # リクエスト型定義
│   ├── api-responses.ts        # レスポンス型定義
│   └── index.ts               # 型定義エクスポート
└── examples/
    └── migration-example.tsx   # 移行方法の例
```

### 使用方法
```typescript
// 従来
import { ShiftService } from '@/services/firebase/firebase-shift';
const shifts = await ShiftService.getShifts(storeId);

// 新方式（フェーズ1）
import { ShiftAPIService } from '@/services/api';
const shifts = await ShiftAPIService.getShifts({ storeId });
```

### 環境変数制御
```bash
# Firebase直接呼び出し（現在の設定）
EXPO_PUBLIC_USE_SHIFT_API=false

# API移行後（フェーズ2以降）
EXPO_PUBLIC_USE_SHIFT_API=true
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### フェーズ1実動作テスト結果 ✅

**テスト日時**: 2025-01-24  
**テスト環境**: 開発環境（EXPO_PUBLIC_USE_SHIFT_API=false）

#### テスト結果
```
🔄 useShiftActions - API移行テスト中: Object
✅ useShiftActions - シフト取得成功: 35 件
```

#### 確認された動作
- ✅ アプリ正常起動
- ✅ 新APIサービス経由でFirebase直接アクセス動作
- ✅ シフト一覧取得成功（35件）
- ✅ デバッグログ正常出力
- ✅ 既存機能に影響なし
- ✅ エラーハンドリング機能追加

#### 修正された問題
- ✅ TypeScript型エラー修正
- ✅ インポートパス問題解決
- ✅ APIサービス抽象化層の安定動作確認

## 分離状況分析（2025-01-24現在）

### 移行完了状況: 約5% ✅
- **完了**: ShiftAPIService（1/6サービス）
- **移行済みコンポーネント**: 1件（useShiftActions.ts）
- **残存直接Firebase呼び出し**: 33+コンポーネント

### 必要なAPIサービス（優先度順）
| サービス | 使用箇所 | 優先度 | 状況 |
|---------|---------|-------|------|
| ShiftAPIService | 1箇所 | 高 | ✅ 完了 |
| MultiStoreAPIService | 4箇所 | 高 | ❌ 未実装 |
| ExtendedTaskAPIService | 4箇所 | 高 | ❌ 未実装 |
| TaskAPIService | 3箇所 | 中 | ❌ 未実装 |
| UserAPIService | 2箇所 | 中 | ❌ 未実装 |
| AuthAPIService | 1箇所 | 低 | ❌ 未実装 |
| GroupAPIService | 1箇所 | 低 | ❌ 未実装 |

### 直接Firebase呼び出しが残る主要コンポーネント
- **マスター管理**: gantt-edit.tsx, GanttChartMonthView.tsx など
- **ユーザー操作**: ShiftListView.tsx, ShiftCreateForm.tsx など  
- **設定管理**: users/index.tsx, shift-status.tsx など
- **多店舗管理**: StoreConnectionModal.tsx など

### フェーズ2開始: Next.js API Routes構築 🚀
**現在進行中**: 2025-01-24開始

#### フェーズ2実装完了項目 ✅
- [x] 分離状況分析完了
- [x] Firebase Admin SDK セットアップ
- [x] 認証ミドルウェア作成  
- [x] API Routes実装完了
  - [x] `GET/POST /api/shifts` - シフト一覧・作成
  - [x] `GET/PUT/DELETE /api/shifts/[id]` - 個別シフト操作
  - [x] `POST /api/shifts/user-accessible` - 多店舗対応取得
  - [x] `POST /api/shifts/[id]/approve` - シフト承認
- [ ] 段階的切り替えテスト（EXPO_PUBLIC_USE_SHIFT_API=true）

#### フェーズ2で実装された機能
1. **Firebase Admin SDK基盤**
   - サーバーサイドFirestore操作
   - 環境変数による設定管理
   - エラーハンドリング

2. **包括的認証・認可システム**
   - JWTトークン検証
   - 店舗アクセス権限チェック
   - マスター権限確認
   - レート制限機能

3. **完全なShift API Routes**
   - RESTful API設計
   - 適切なHTTPステータスコード
   - 統一されたレスポンス形式
   - セキュリティ機能完備

4. **高度なセキュリティ機能**
   - ロールベースアクセス制御
   - 店舗間権限分離
   - リクエスト制限
   - 監査ログ出力

#### フェーズ2完了後の目標
- ShiftAPIService が実際のAPIエンドポイント経由で動作
- 残り5つのAPIサービスも同様の構造で実装可能
- 全33+コンポーネントの段階的移行基盤完成

### 今後の移行戦略
1. **フェーズ2**: ShiftAPIServiceのAPI化完成
2. **フェーズ3**: MultiStoreAPIService実装（最優先）
3. **フェーズ4**: ExtendedTaskAPIService実装
4. **フェーズ5**: 残りサービス順次実装
5. **フェーズ6**: 全コンポーネント移行完了

## 作成されたファイル構造

### フェーズ2で追加されたファイル
```
src/
├── lib/
│   ├── firebase-admin.ts      # Firebase Admin SDK設定
│   └── auth-middleware.ts     # 認証・認可ミドルウェア
└── app/api/shifts/
    ├── route.ts              # GET/POST /api/shifts
    ├── [id]/
    │   ├── route.ts         # GET/PUT/DELETE /api/shifts/[id]
    │   └── approve/
    │       └── route.ts     # POST /api/shifts/[id]/approve
    └── user-accessible/
        └── route.ts          # POST /api/shifts/user-accessible
```

### 環境変数設定
```bash
# API制御フラグ
EXPO_PUBLIC_USE_SHIFT_API=false  # フェーズ2テスト時は true に変更

# Firebase Admin SDK用
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```

## 次回テスト手順

1. **Firebase Admin SDK設定**
   - 正しいサービスアカウントキーを環境変数に設定
   - serviceAccountKey.json から必要な情報を抽出

2. **API切り替えテスト**
   ```bash
   # .env ファイル変更
   EXPO_PUBLIC_USE_SHIFT_API=true
   
   # アプリ重起動
   npm start
   ```

3. **動作確認**
   - シフト一覧取得が API 経由で動作
   - 認証・認可が正常機能
   - エラーハンドリングが適切

4. **ログ確認**
   - サーバーコンソールでAPI呼び出しログ確認
   - 認証・権限チェックログ確認

[今後の更新履歴をここに記録]