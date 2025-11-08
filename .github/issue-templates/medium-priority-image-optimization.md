# 🟡 中優先度: 画像最適化

## 現状
- ✅ サムネイル生成機能が存在（`StorageService.getThumbnailUrl`）
- ❌ 画像の遅延読み込み（lazy loading）が実装されていない
- ❌ WebP形式への変換が行われていない
- ⚠️ ランディングページのスクリーンショットが即座に読み込まれる

## 影響
- 初期ページロード時間が長い
- 帯域幅の無駄
- モバイル環境でのパフォーマンス低下

## 推奨改善

### 1. 画像の遅延読み込み
```typescript
// src/common/common-ui/ui-image/OptimizedImage.tsx
import { Image } from 'react-native';

export const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <Image
      source={{ uri: src }}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};
```

### 2. ランディングページのスクリーンショット
```typescript
// src/app/(landing)/_marketing-widgets/Screenshots.tsx
const ScreenshotImage = ({ src, alt }) => (
  <img 
    src={src} 
    loading="lazy" 
    decoding="async"
    alt={alt}
    style={{ maxWidth: '100%', height: 'auto' }}
  />
);
```

### 3. WebP形式への変換（検討）
- ビルド時にWebP形式に変換
- または、Firebase Storageで自動変換

## 実装チェックリスト
- [ ] `OptimizedImage`コンポーネントの作成
- [ ] ランディングページの画像に遅延読み込みを適用
- [ ] スクリーンショット画像に遅延読み込みを適用
- [ ] WebP形式への変換の検討・実装
- [ ] 初期ロード時間の改善を確認

## 関連Issue
#101

