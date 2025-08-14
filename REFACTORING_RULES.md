# リファクタリングルール 2025

## 📋 基本原則

### 🎯 ファイル分割の判断基準
- **行数**: 500行を超えたら分割を検討
- **責任の単一性**: 1つのファイルは1つの責任のみ
- **再利用性**: 他のコンポーネントから使用される場合は即座に分割
- **保守性**: コードの理解に時間がかかる場合は分割

---

## 📁 フォルダ構造ガイドライン

### 🗂️ Expo Router対応構造
```
src/
├── app/                    # ルーティング（Expo Router）
├── components/             # 再利用可能コンポーネント
│   ├── ui/                # UI基底コンポーネント
│   └── feature/           # 機能固有コンポーネント
├── modules/               # 機能別モジュール（現在の構造維持）
├── hooks/                 # カスタムフック
├── services/              # 外部サービス（Firebase等）
├── types/                 # TypeScript型定義
├── constants/             # 定数
└── utils/                 # ユーティリティ関数
```

### 📂 モジュール内構造
```
modules/
└── feature-name/
    ├── components/        # 機能固有コンポーネント
    │   ├── ComponentName.tsx
    │   ├── ComponentName.styles.ts
    │   ├── ComponentName.types.ts
    │   └── index.ts
    ├── hooks/             # 機能固有フック
    ├── services/          # 機能固有サービス
    ├── types/             # 機能固有型定義
    └── utils/             # 機能固有ユーティリティ
```

---

## 🔧 コンポーネント分割ルール

### ✅ 分割すべき場合
1. **大型コンポーネント** (500行+)
2. **複数の責任を持つコンポーネント**
3. **再利用されるロジック・UI**
4. **独立してテスト可能な部分**

### 🎯 分割の優先順位
1. **UI コンポーネント** - 見た目の責任
2. **ロジックフック** - 状態管理・ビジネスロジック
3. **型定義** - TypeScript インターフェース
4. **スタイル** - スタイリング定義
5. **定数・設定** - 設定値・定数

### 📝 命名規則
- **コンポーネント**: PascalCase (`UserProfile.tsx`)
- **フック**: camelCaseでuseプレフィックス (`useUserData.ts`)
- **型**: PascalCaseでインターフェース (`UserProfileProps`)
- **スタイル**: kebab-case (`user-profile.styles.ts`)

---

## 🛠️ TypeScript最適化

### 📊 型安全性の強化
```typescript
// ❌ 避けるべき
const data: any = fetchData();

// ✅ 推奨
interface ApiResponse {
  users: User[];
  total: number;
}
const data: ApiResponse = fetchData();
```

### 🔒 厳密な型チェック対応
- `exactOptionalPropertyTypes: true` 対応
- `undefined` vs オプショナルプロパティの明確な区別
- Null合体演算子 (`??`) の積極的使用

---

## 📈 パフォーマンス最適化

### ⚡ コード分割
- **React.lazy()** でコンポーネント遅延読み込み
- **Dynamic imports** でモジュール分割
- **ルートレベル分割** でページ単位の最適化

### 🎯 メモ化
```typescript
// コンポーネントレベル
const OptimizedComponent = React.memo(MyComponent);

// フックレベル
const memoizedValue = useMemo(() => computeValue(data), [data]);
const memoizedCallback = useCallback(() => handleAction(), [dependency]);
```

---

## 🧪 テスタビリティ

### 🔍 単体テストしやすい設計
- **純粋関数**の分離
- **カスタムフック**の独立性
- **Props**の明確な型定義

### 📋 テストファイル配置
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.styles.ts
└── index.ts
```

---

## 🔄 段階的リファクタリング手順

### 1️⃣ **分析フェーズ**
- ファイルサイズ・複雑度の測定
- 責任の境界線の特定
- 依存関係の可視化

### 2️⃣ **抽出フェーズ**
- UIコンポーネントの抽出
- カスタムフックの作成
- 型定義の分離

### 3️⃣ **統合フェーズ**
- インポート・エクスポートの整理
- バレルエクスポートの活用
- パフォーマンステスト

### 4️⃣ **検証フェーズ**
- TypeScriptエラーの解消
- ビルドテストの実行
- 機能テストの確認

---

## 🚀 現行プロジェクト適用戦略

### 📊 優先順位
1. **SimpleLanding.tsx** (2,595行) - マーケティングウィジェット分離
2. **ShiftPrintModal.tsx** (2,279行) - 印刷ロジック・UIの分離
3. **TaskCreateModal.tsx** (1,119行) - フォーム・バリデーション分離
4. **GanttChartMonthView.tsx** (953行) - 表示ロジック・UI分離

### 🔧 段階的実行
- **週次リファクタリング**: 1ファイル/週のペース
- **エラー最優先**: TypeScriptエラー箇所を優先的に修正
- **テスト実行**: リファクタリング後は必ずビルド・テスト確認

---

## ✅ 成功指標

- **ファイルサイズ**: 500行以下を維持
- **TypeScriptエラー**: 段階的にゼロへ
- **ビルド時間**: パフォーマンス維持・向上
- **開発効率**: 新機能追加・バグ修正の高速化

---

## 📚 参考資料

- [React Code Splitting](https://legacy.reactjs.org/docs/code-splitting.html)
- [TypeScript Best Practices 2025](https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb)
- [React Native Project Structure](https://medium.com/@mar.cardona.96/react-native-project-structure-using-expo-and-typescript-552b4a42b8b5)
- [Expo Router Documentation](https://docs.expo.dev/develop/file-based-routing/)