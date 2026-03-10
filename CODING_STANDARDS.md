# Shiftize コーディング規約

新しくコードを書くときはこのルールに合わせる。
既存コードも触ったついでに直していく。

---

## 1. ディレクトリ構成

```txt
src/
├── app/                    # ルーティング（Expo Router）
│   ├── (auth)/             # 認証前の画面
│   └── (main)/             # 認証後の画面
│       ├── master/         # 管理者画面
│       └── user/           # 一般ユーザー画面
│
├── common/                 # アプリ全体で共有するコード
│   ├── common-constants/   # 定数定義
│   ├── common-context/     # React Context
│   ├── common-hooks/       # カスタムフック
│   ├── common-models/      # データモデル（型定義）
│   ├── common-schemas/     # Zodバリデーションスキーマ
│   ├── common-theme/       # MD3テーマシステム
│   ├── common-types/       # グローバル型宣言（.d.ts）
│   ├── common-ui/          # 共通UIコンポーネント
│   └── common-utils/       # ユーティリティ関数
│
├── modules/                # 機能別モジュール（画面単位）
│   ├── home-view/          # ホーム画面
│   ├── login-view/         # ログイン画面
│   ├── master-view/        # 管理者画面群
│   ├── user-view/          # ユーザー画面群
│   └── reusable-widgets/   # 複数画面で再利用するウィジェット
│
└── services/               # バックエンド連携層
    ├── interfaces/         # サービスインターフェース定義
    ├── supabase/           # Supabaseアダプター実装
    └── auth/               # 認証関連サービス
```

### ルール

- **ディレクトリ名**: `kebab-case`（例: `common-utils/`, `home-view/`）
- **1機能 = 1ディレクトリ**: 関連ファイル（.tsx, .styles.ts, .types.ts）は同じディレクトリに置く
- **深さ制限**: `src/` から最大4階層まで。それ以上はフラットに整理する
- **index.ts**: barrel export が必要な場合のみ作成。不要なら作らない

---

## 2. ファイル命名規則

| 種類                     | 命名規則                 | 例                        |
| ------------------------ | ------------------------ | ------------------------- |
| Reactコンポーネント      | `PascalCase.tsx`         | `LoginForm.tsx`           |
| スタイル                 | `PascalCase.styles.ts`   | `LoginForm.styles.ts`     |
| 型定義                   | `PascalCase.types.ts`    | `LoginForm.types.ts`      |
| カスタムフック           | `useCamelCase.ts`        | `useAuthGuard.ts`         |
| ユーティリティ（クラス） | `PascalCase.ts`          | `DateFormatter.ts`        |
| ユーティリティ（関数集） | `camelCase.ts`           | `dateUtils.ts`            |
| 定数                     | `PascalCaseConstants.ts` | `ColorConstants.ts`       |
| サービスIF               | `IPascalCase.ts`         | `IAuthService.ts`         |
| アダプター               | `SupabasePascalCase.ts`  | `SupabaseShiftAdapter.ts` |
| データ                   | `PascalCase.data.ts`     | `Changelog.data.ts`       |

### コンポーネントファイルのセット

複雑なコンポーネントは以下のセットで構成する:

```txt
LoginForm/
├── LoginForm.tsx           # コンポーネント本体
├── LoginForm.styles.ts     # スタイル定義
├── LoginForm.types.ts      # Props・型定義
└── LoginForm.data.ts       # 固定データ（任意）
```

シンプルなコンポーネント（50行以下）は単一ファイルでOK。

---

## 3. TypeScript命名規則

```typescript
// ✅ 変数・関数: camelCase
const userName = "田中";
function calculateWage() { ... }

// ✅ 定数値: UPPER_SNAKE_CASE
const MAX_SHIFT_HOURS = 12;
const API_TIMEOUT_MS = 5000;

// ✅ 型・インターフェース: PascalCase（I接頭辞はサービスIFのみ）
type ShiftStatus = "approved" | "pending" | "rejected";
interface ShiftData { ... }

// ✅ サービスインターフェース: I接頭辞
interface IShiftService { ... }

// ✅ Props型: コンポーネント名 + Props
interface LoginFormProps { ... }

// ✅ Enum: PascalCase（値もPascalCase）
enum UserRole {
  Master = "master",
  Teacher = "teacher",
}

// ✅ React コンポーネント: PascalCase
const ShiftCalendar: React.FC<ShiftCalendarProps> = () => { ... }

// ✅ カスタムフック: use + PascalCase
function useShiftData() { ... }

// ❌ any型の使用は原則禁止
// やむを得ない場合はコメントで理由を明記する
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = response as any; // 外部API型定義なし
```

### DB ↔ TypeScript の変換

```typescript
// DB: snake_case → TypeScript: camelCase
// マッピングはアダプター層で行う

// ❌ コンポーネント内でsnake_caseを使わない
const user_name = row.user_name;

// ✅ アダプターで変換してからコンポーネントに渡す
const userName = row.user_name;
```

---

## 4. コンポーネント設計

### 基本構造

```typescript
/**
 * ログインフォーム
 * 店舗ID+ニックネームとパスワードでログインする。
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  errorMessage,
}) => {
  // --- State ---
  const [password, setPassword] = useState("");

  // --- Hooks ---
  const styles = useThemedStyles(createLoginFormStyles);

  // --- Handlers ---
  const handleLogin = useCallback(() => {
    onLogin(password);
  }, [password, onLogin]);

  // --- Render ---
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
};
```

### コンポーネント設計ルール

- **コンポーネント内のセクション順序**: State → Hooks → 派生値(useMemo) → Handlers → Render
- **セクションコメント**: `// --- セクション名 ---` で区切る
- **1コンポーネント = 1ファイル**: 例外はごく小さなヘルパーコンポーネントのみ
- **Props**: 3個以上なら `.types.ts` に分離する
- **スタイル**: インラインスタイルは動的な値のみ。固定値は `.styles.ts` に定義する

---

## 5. スタイル管理

### スタイルファイルの構造

```typescript
/** LoginFormのスタイル。テーマカラーを受け取ってStyleSheetを返す */
import { StyleSheet } from "react-native";
import { MD3ColorScheme } from "@/common/common-theme/md3/MD3ThemeContext";

export const createLoginFormStyles = (colorScheme: MD3ColorScheme) =>
  StyleSheet.create({
    /** フォーム全体のコンテナ */
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colorScheme.surface,
    },
    /** ログインボタン */
    loginButton: {
      backgroundColor: colorScheme.primary,
      borderRadius: 8,
      paddingVertical: 12,
    },
  });
```

### スタイル管理ルール

- **テーマカラー**: `colorScheme.xxx` を使う。ハードコードした色は禁止
- **マジックナンバー禁止**: `padding: 16` は許容するが、特殊な値は定数化する
- **レスポンシブ**: `Breakpoints.ts` の値を使って画面サイズ分岐する
- **Shadow**: MD3の`elevation`を使う。`shadow*` propsは使わない（Web非対応）

---

## 6. サービス層の設計

### アーキテクチャ（3層構造）

```txt
UI Layer（コンポーネント）
    ↓ ServiceProviderから取得
Service Layer（インターフェース + アダプター）
    ↓ Supabase SDK
Data Layer（Supabase / PostgreSQL）
```

### インターフェース定義

```typescript
/** シフトのCRUD操作。実装はアダプターが担当する */
export interface IShiftService {
  getShifts(storeId: string, month: string): Promise<Shift[]>;
  createShift(data: CreateShiftInput): Promise<Shift>;
  updateShift(id: string, data: UpdateShiftInput): Promise<void>;
  deleteShift(id: string): Promise<void>;
}
```

### アダプター実装

```typescript
/** IShiftServiceのSupabase実装。DB操作はここに集約する */
export class SupabaseShiftAdapter implements IShiftService {
  async getShifts(storeId: string, month: string): Promise<Shift[]> {
    // ...
  }
}
```

### サービス層ルール

- **コンポーネントからSupabaseを直接呼ばない**: 必ずServiceProvider経由
- **インターフェースに型をつける**: 引数・戻り値は明示的に型定義する
- **エラーハンドリング**: アダプター内でtry-catchし、意味のあるエラーメッセージを返す
- **DB列名の変換**: アダプター層で `snake_case` → `camelCase` に変換する

---

## 7. コメント規約

「このコード何してるんだっけ？」を防ぐためのルール。
読み手は半年後の自分、または初めてこのコードを見るメンバーを想定する。

### 7.1 ファイルヘッダー（必須）

ファイルの先頭、import文の前に書く。何のファイルか1〜2行でわかればOK。

```typescript
/**
 * @file ShiftCalendar.tsx
 * @description 月間カレンダーにシフトを表示し、日付タップで詳細を開く
 */
```

### 7.2 コンポーネント（必須）

何をするコンポーネントか + 主要Propsだけ書く。@exampleは大きいコンポーネントだけでいい。

```typescript
/**
 * 月間カレンダーにシフトの有無をドットで表示する。
 * 日付タップで詳細モーダルを開く。
 *
 * @param shifts - シフトデータの配列
 * @param onDateSelect - 日付タップ時のコールバック
 */
```

### 7.3 関数（exportする関数は必須）

やること + 引数 + 戻り値。ロジックが名前から自明なら省略してもいい。

```typescript
/**
 * 時間文字列を分数に変換する（"09:30" → 570）
 * ガントチャートの位置計算で使う。
 */
function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
```

### 7.4 型・インターフェース（必須）

各プロパティに `/** */` をつける。型の役割は冒頭に1行。

```typescript
/** 1つのシフト（出勤予定）。DBのshiftsテーブルに対応 */
interface Shift {
  /** UUID */
  id: string;
  /** シフトの所有者 */
  userId: string;
  /** "2026-03-10"形式 */
  date: string;
  /** "09:00"形式 */
  startTime: string;
  /** "18:00"形式 */
  endTime: string;
  status: "approved" | "pending" | "rejected";
}
```

### 7.5 インラインコメント（任意）

「なぜ」を書く。「何をしているか」はコードを読めばわかるので不要。

```typescript
// Supabaseは空配列をnullで返すのでフォールバック
const shifts = data?.shifts ?? [];

// 重複しないシフトをグループ化して列数を減らす
const groups = packShiftsIntoColumns(shifts);

// 管理者は全シフト編集可、一般ユーザーは自分のだけ
if (role === "master" || shift.userId === currentUserId) {
```

書かなくていい例:

```typescript
// ❌ 見ればわかる
i++; // iを1増やす

// ❌ 放置されたTODO
// TODO: あとで修正する ← いつの話？消すか直す
```

### 7.6 コンポーネント内のセクション区切り

```typescript
// --- State ---
const [shifts, setShifts] = useState<Shift[]>([]);

// --- Handlers ---
const handlePress = () => { ... };

// --- Render ---
return ( ... );
```

### コメント対象まとめ

| 対象 | 必須？ | 書くこと |
| --- | --- | --- |
| ファイルヘッダー | 必須 | 何のファイルか |
| コンポーネント | 必須 | 何をするか + 主要Props |
| export関数 | 必須 | やること + 引数 + 戻り値 |
| インターフェース | 必須 | 型の役割、各プロパティ |
| 内部関数 | 任意 | 複雑なものだけ |
| 定数 | 任意 | 名前で意味がわからない場合 |
| インライン | 任意 | 「なぜ」だけ |

---

## 8. Import規約

### 順序（上から下へ）

```typescript
// 1. React / React Native（フレームワーク）
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

// 2. 外部ライブラリ（node_modules）
import { Calendar } from "react-native-calendars";

// 3. 共通モジュール（@/ エイリアス）
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { DateFormatter } from "@/common/common-utils/util-date/DateFormatter";

// 4. 同一モジュール内の相対import
import { createShiftCalendarStyles } from "./ShiftCalendar.styles";
import type { ShiftCalendarProps } from "./ShiftCalendar.types";
```

### Import管理ルール

- **グループ間に空行**を入れる
- **type-only import**: 型だけの場合は `import type { ... }` を使う
- **未使用importは即削除**: ビルド時に警告が出る

---

## 9. エラーハンドリング

サービス層で具体的なエラーを投げて、コンポーネント層でユーザーに見せる。

```typescript
// サービス層: 何が失敗したかわかるメッセージを投げる
if (error) {
  throw new Error(`シフト取得に失敗: ${error.message}`);
}

// コンポーネント層: ユーザーに表示
try {
  const shifts = await shiftService.getShifts(storeId);
} catch (error) {
  Alert.alert("エラー", "シフトの読み込みに失敗しました。");
}
```

catchの中を空にしない。最低限ログを出すかユーザーに通知する。

---

## 10. セキュリティ規約

- SECRET_KEY / SERVICE_ROLE_KEY はクライアントに置かない
- `EXPO_PUBLIC_` は公開していい値だけにつける（ANON_KEYはOK）
- ユーザー入力はサニタイズする（XSS対策）
- innerHTML使うなら `escapeHtml()` を通す
- パスワードは平文でDBに保存しない（Supabase Authに任せる）

```bash
# クライアントに公開OK
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# クライアントに絶対置かない（Edge Functionsの環境変数に設定）
SUPABASE_SERVICE_ROLE_KEY=xxx
SIGNING_KEY_JWK=xxx
```

---

## 11. Git規約

### ブランチ命名

```txt
feat/機能名        # 新機能
fix/修正内容       # バグ修正
refactor/対象      # リファクタリング
chore/内容         # 雑務（依存更新、設定変更など）
```

### コミットメッセージ

```txt
feat: シフト自動配置機能を追加
fix: カレンダーの日付選択が動作しない問題を修正
refactor: サービス層のエラーハンドリングを統一
chore: 不要な依存パッケージを削除
```

- 日本語OK
- 1行目は50文字以内
- 「何を」ではなく「なぜ」を書く

---

## 12. パフォーマンス

- リスト表示は `FlatList` を使う（ScrollView + mapは重い）
- 計算が重いものは `useMemo` で囲む
- イベントハンドラは `useCallback` で囲む
- `setInterval` で全DOM走査みたいな力技はやらない
- `useEffect` の依存配列は正しく書く（無限ループ注意）

---

## PRを出す前の確認

- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run lint` が警告0
- [ ] `any` を増やしていない（どうしても必要ならコメントで理由を書く）
- [ ] 新規ファイルにヘッダーコメントがある
- [ ] export関数・コンポーネントにコメントがある
- [ ] 色のハードコードがない（`colorScheme.xxx` を使う）
- [ ] シークレットを `.env` に追加していない
- [ ] コンポーネントからSupabaseを直接呼んでいない
