# 🟡 中優先度: API呼び出しの最適化

## 現状
- ❌ リクエストの重複防止メカニズムがない
- ❌ APIレスポンスのキャッシングがない
- ⚠️ `secureFetch`で`cache: 'no-cache'`が設定されている

## 影響
- 同じデータを複数回取得
- ネットワーク帯域の無駄
- レスポンス時間の増加

## 推奨改善

### 1. APIキャッシュの実装
```typescript
// src/services/api/apiCache.ts
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分

export class APICache {
  static get(key: string) {
    const cached = apiCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  static set(key: string, data: any) {
    apiCache.set(key, { data, timestamp: Date.now() });
  }

  static clear() {
    apiCache.clear();
  }
}
```

### 2. ShiftAPIService.tsの修正
```typescript
static async fetchFromAPI(endpoint: string, options: {...}) {
  const cacheKey = `${endpoint}-${JSON.stringify(options.params)}`;
  
  // キャッシュから取得を試みる
  const cached = APICache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // API呼び出し
  const result = await fetch(url, fetchOptions);
  
  // キャッシュに保存
  APICache.set(cacheKey, result);
  
  return result;
}
```

### 3. リクエストの重複防止
```typescript
const pendingRequests = new Map<string, Promise<any>>();

static async fetchFromAPI(endpoint: string, options: {...}) {
  const cacheKey = `${endpoint}-${JSON.stringify(options.params)}`;
  
  // 既に同じリクエストが進行中の場合は待機
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }
  
  const request = fetch(url, fetchOptions)
    .then(result => {
      pendingRequests.delete(cacheKey);
      return result;
    })
    .catch(error => {
      pendingRequests.delete(cacheKey);
      throw error;
    });
  
  pendingRequests.set(cacheKey, request);
  return request;
}
```

## 実装チェックリスト
- [ ] APIキャッシュクラスの実装
- [ ] `ShiftAPIService.fetchFromAPI`への統合
- [ ] リクエストの重複防止メカニズムの実装
- [ ] キャッシュのクリア機能の実装（ログアウト時など）
- [ ] ネットワークリクエスト数の削減を確認

## 関連Issue
#101

