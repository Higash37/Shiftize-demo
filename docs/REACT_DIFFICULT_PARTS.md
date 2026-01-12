# React の難しい部分 - 実践的な解説

## 📋 このドキュメントについて

このドキュメントは、Shiftize プロジェクトで実際に使われている React の**難しい部分**を、実例とともに解説します。  
大学生・初心者向けに、**なぜ難しいのか**、**どう解決するのか**を説明します。

---

## 🎯 目次

1. [Hooks の難しい部分](#1-hooks-の難しい部分)
2. [状態管理のパターン](#2-状態管理のパターン)
3. [パフォーマンス最適化](#3-パフォーマンス最適化)
4. [非同期処理](#4-非同期処理)
5. [エラーハンドリング](#5-エラーハンドリング)
6. [型安全性（TypeScript）](#6-型安全性typescript)

---

## 1. Hooks の難しい部分

### 1.1 useEffect の依存配列

**問題**: 無限ループが発生する

**実例（Shiftize プロジェクトから）:**

```typescript
// ❌ 悪い例: 無限ループが発生
const InfoDashboard = () => {
  const [shifts, setShifts] = useState([]);
  
  useEffect(() => {
    // 毎回新しい関数が作成される
    const fetchShifts = async () => {
      const data = await getShifts();
      setShifts(data);
    };
    fetchShifts();
  }, [shifts]); // shifts が変わるたびに再実行 → 無限ループ
};
```

**解決策:**

```typescript
// ✅ 良い例1: 依存配列を空にする（初回のみ実行）
useEffect(() => {
  const fetchShifts = async () => {
    const data = await getShifts();
    setShifts(data);
  };
  fetchShifts();
}, []); // 空の配列 = 初回のみ実行

// ✅ 良い例2: useCallback で関数をメモ化
const fetchShifts = useCallback(async () => {
  const data = await getShifts();
  setShifts(data);
}, []); // 依存配列が空 = 関数は再作成されない

useEffect(() => {
  fetchShifts();
}, [fetchShifts]);
```

### 1.2 クリーンアップ関数

**問題**: メモリリークが発生する

**実例:**

```typescript
// ❌ 悪い例: クリーンアップしない
useEffect(() => {
  const interval = setInterval(() => {
    updateData();
  }, 1000);
  // クリーンアップしない → メモリリーク
}, []);

// ✅ 良い例: クリーンアップ関数を返す
useEffect(() => {
  const interval = setInterval(() => {
    updateData();
  }, 1000);
  
  // クリーンアップ関数を返す
  return () => {
    clearInterval(interval);
  };
}, []);
```

### 1.3 カスタムフックの作成

**実例（Shiftize プロジェクトから）:**

```typescript
// src/common/common-utils/util-shift/useShiftsRealtime.ts
export const useShiftsRealtime = (storeId?: string) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    // Firestore のリアルタイムリスナーを設定
    const shiftsRef = collection(db, "shifts");
    const q = query(shiftsRef, where("storeId", "==", storeId));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Shift[];
        setShifts(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // クリーンアップ: コンポーネントがアンマウントされたらリスナーを解除
    return () => unsubscribe();
  }, [storeId]);

  return { shifts, loading, error };
};
```

**使い方:**

```typescript
const MyComponent = () => {
  const { shifts, loading, error } = useShiftsRealtime(storeId);
  
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <ShiftList shifts={shifts} />;
};
```

---

## 2. 状態管理のパターン

### 2.1 Context API の使い方

**問題**: Props のバケツリレー（Props Drilling）

**実例（Shiftize プロジェクトから）:**

```typescript
// ❌ 悪い例: Props を何層も渡す
const App = () => {
  const [user, setUser] = useState(null);
  return <Layout user={user} />;
};

const Layout = ({ user }) => {
  return <Header user={user} />;
};

const Header = ({ user }) => {
  return <UserMenu user={user} />;
};
```

**解決策: Context API**

```typescript
// ✅ 良い例: Context で状態を共有
// src/services/auth/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"master" | "user" | null>(null);

  return (
    <AuthContext.Provider value={{ user, role, setUser, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// どこからでもアクセス可能
const MyComponent = () => {
  const { user, role } = useAuth(); // Context から取得
  return <div>{user?.email}</div>;
};
```

### 2.2 状態の更新パターン

**問題**: 状態の更新が正しく反映されない

**実例:**

```typescript
// ❌ 悪い例: 直接状態を変更しようとする
const [shifts, setShifts] = useState([]);

const addShift = (newShift) => {
  shifts.push(newShift); // 直接変更 → 再レンダリングされない
  setShifts(shifts);
};

// ✅ 良い例: 新しい配列を作成
const addShift = (newShift) => {
  setShifts([...shifts, newShift]); // 新しい配列を作成
};

// ✅ 良い例: 関数型更新
const addShift = (newShift) => {
  setShifts(prev => [...prev, newShift]); // 前の状態を参照
};
```

---

## 3. パフォーマンス最適化

### 3.1 useMemo の使い方

**問題**: 不要な再計算が発生する

**実例（Shiftize プロジェクトから）:**

```typescript
// ❌ 悪い例: 毎回計算される
const InfoDashboard = () => {
  const { shifts } = useShiftsRealtime(storeId);
  
  // 毎回再計算される（shifts が変わるたび）
  const totalWage = shifts.reduce((sum, shift) => {
    return sum + calculateWage(shift);
  }, 0);
  
  return <div>総人件費: {totalWage}円</div>;
};

// ✅ 良い例: useMemo でメモ化
const InfoDashboard = () => {
  const { shifts } = useShiftsRealtime(storeId);
  
  // shifts が変わったときだけ再計算
  const totalWage = useMemo(() => {
    return shifts.reduce((sum, shift) => {
      return sum + calculateWage(shift);
    }, 0);
  }, [shifts]);
  
  return <div>総人件費: {totalWage}円</div>;
};
```

### 3.2 useCallback の使い方

**問題**: 子コンポーネントが不要に再レンダリングされる

**実例:**

```typescript
// ❌ 悪い例: 毎回新しい関数が作成される
const Parent = () => {
  const [count, setCount] = useState(0);
  
  // 毎回新しい関数が作成される
  const handleClick = () => {
    console.log('clicked');
  };
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <Child onClick={handleClick} /> {/* 毎回再レンダリング */}
    </div>
  );
};

// ✅ 良い例: useCallback でメモ化
const Parent = () => {
  const [count, setCount] = useState(0);
  
  // 関数をメモ化（依存配列が空なので、関数は再作成されない）
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <Child onClick={handleClick} /> {/* 再レンダリングされない */}
    </div>
  );
};
```

### 3.3 React.memo の使い方

**問題**: 親が再レンダリングされると、子も再レンダリングされる

**実例:**

```typescript
// ❌ 悪い例: 毎回再レンダリングされる
const ShiftCard = ({ shift }) => {
  return <div>{shift.date}</div>;
};

// ✅ 良い例: React.memo でメモ化
const ShiftCard = React.memo(({ shift }) => {
  return <div>{shift.date}</div>;
});

// props が変わったときだけ再レンダリング
```

---

## 4. 非同期処理

### 4.1 async/await の使い方

**問題**: エラーハンドリングが難しい

**実例（Shiftize プロジェクトから）:**

```typescript
// ❌ 悪い例: エラーハンドリングがない
const createShift = async (shiftData) => {
  const result = await addDoc(collection(db, "shifts"), shiftData);
  return result.id;
};

// ✅ 良い例: try-catch でエラーハンドリング
const createShift = async (shiftData) => {
  try {
    const result = await addDoc(collection(db, "shifts"), shiftData);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("シフト作成エラー:", error);
    return { success: false, error: error.message };
  }
};
```

### 4.2 Promise のチェーン

**実例:**

```typescript
// ✅ 良い例: Promise チェーン
const fetchUserAndShifts = async (userId) => {
  try {
    // 1. ユーザー情報を取得
    const user = await getUser(userId);
    
    // 2. ユーザー情報が取得できたら、シフトを取得
    const shifts = await getShifts(user.storeId);
    
    // 3. 両方のデータを返す
    return { user, shifts };
  } catch (error) {
    throw new Error(`データ取得に失敗: ${error.message}`);
  }
};
```

---

## 5. エラーハンドリング

### 5.1 Error Boundary の使い方

**問題**: エラーが発生するとアプリ全体がクラッシュする

**実例（Shiftize プロジェクトから）:**

```typescript
// Error Boundary コンポーネント
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // エラーをログに記録
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// 使い方
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 5.2 統一されたエラーハンドリング

**実例（Shiftize プロジェクトから）:**

```typescript
// src/services/api/ShiftAPIService.ts
private static handleError(error: any, defaultMessage: string): Error {
  // Firebase エラーの場合
  if (error?.code) {
    switch (error.code) {
      case 'permission-denied':
        throw new Error('このシフトにアクセスする権限がありません');
      case 'not-found':
        throw new Error('指定されたシフトが見つかりません');
      case 'unavailable':
        throw new Error('サービスが一時的に利用できません');
      default:
        throw new Error(`${defaultMessage}: ${error.message}`);
    }
  }
  
  throw new Error(defaultMessage);
}
```

---

## 6. 型安全性（TypeScript）

### 6.1 型定義の重要性

**問題**: 型エラーが実行時まで発見されない

**実例:**

```typescript
// ❌ 悪い例: any 型を使う
const processShift = (shift: any) => {
  return shift.date + shift.startTime; // 実行時エラーの可能性
};

// ✅ 良い例: 型を定義する
interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

const processShift = (shift: Shift) => {
  return `${shift.date} ${shift.startTime}`; // 型安全
};
```

### 6.2 ジェネリクスの使い方

**実例:**

```typescript
// ジェネリクスで型安全な関数を作成
const fetchData = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  return response.json();
};

// 使い方
const shifts = await fetchData<Shift[]>('/api/shifts');
const user = await fetchData<User>('/api/user');
```

### 6.3 ユーティリティ型の使い方

**実例:**

```typescript
// Partial: すべてのプロパティをオプショナルに
type PartialShift = Partial<Shift>;

// Pick: 特定のプロパティだけを選択
type ShiftSummary = Pick<Shift, 'id' | 'date' | 'startTime'>;

// Omit: 特定のプロパティを除外
type ShiftWithoutId = Omit<Shift, 'id'>;
```

---

## 🎯 まとめ

### 重要なポイント

1. **Hooks の依存配列を正しく設定する**
2. **クリーンアップ関数を忘れない**
3. **状態の更新は新しいオブジェクト/配列を作成**
4. **パフォーマンス最適化（useMemo, useCallback）を適切に使う**
5. **エラーハンドリングを必ず実装する**
6. **TypeScript の型を活用する**

### 学習の進め方

1. **小さなコンポーネントから始める**
2. **エラーが出たら、なぜエラーが出たか理解する**
3. **実例を見て、パターンを覚える**
4. **自分でコードを書いて試す**

---

**作成日**: 2025-01-30  
**対象**: 大学生・初心者向け  
**目的**: React の難しい部分を実践的に学習
