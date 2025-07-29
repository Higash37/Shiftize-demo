# パスエイリアス使用ガイド

## 🎯 利用可能なパスエイリアス

### 基本エイリアス
- `@/` - src/以下のすべてのファイル
  ```typescript
  import { useAuth } from '@/services/auth/useAuth';
  ```

### 機能別エイリアス
- `@core/` - 共通機能 (src/common/)
  ```typescript
  import { Button } from '@core/common-ui/ui-forms/FormButton';
  ```

- `@features/` - 機能モジュール (src/modules/)
  ```typescript
  import { HomeScreen } from '@features/home-view/home-screens/HomeCommonScreen';
  ```

- `@backend/` - バックエンド移行関連 (src/backend-migration/)
  ```typescript
  import { ShiftAPIService } from '@backend/api-adapters/ShiftAPIService';
  ```

### UI/デザイン関連
- `@components/` - UIコンポーネント (src/common/common-ui/)
  ```typescript
  import { FormInput } from '@components/ui-forms/FormInput';
  ```

- `@styles/` - スタイル定義 (src/styles/)
  ```typescript
  import { buttonStyles } from '@styles/components/button';
  ```

- `@theme/` - テーマ定義 (src/common/common-theme/)
  ```typescript
  import { theme } from '@theme/ThemeDefinition';
  ```

- `@constants/` - 定数定義 (src/common/common-constants/)
  ```typescript
  import { colors } from '@constants/ColorConstants';
  ```

### ユーティリティ
- `@utils/` - ユーティリティ関数 (src/common/common-utils/)
  ```typescript
  import { formatDate } from '@utils/date/dateUtils';
  ```

- `@hooks/` - カスタムフック (src/hooks/)
  ```typescript
  import { usePushNotifications } from '@hooks/usePushNotifications';
  ```

- `@types/` - 型定義 (src/common/common-models/)
  ```typescript
  import { UserModel } from '@types/model-user/UserModel';
  ```

### その他
- `@services/` - サービス層 (src/services/)
  ```typescript
  import { db } from '@services/firebase/firebase-core';
  ```

- `@providers/` - プロバイダー (src/providers/)
  ```typescript
  import { AppProvider } from '@providers/AppProvider';
  ```

## 🔄 移行ガイド

### Before (相対パス)
```typescript
import { Button } from '../../../common/common-ui/ui-forms/FormButton';
import { useAuth } from '../../services/auth/useAuth';
```

### After (パスエイリアス)
```typescript
import { Button } from '@components/ui-forms/FormButton';
import { useAuth } from '@services/auth/useAuth';
```

## ⚠️ 注意事項

1. **VSCodeの設定**: 自動インポートが正しく動作するよう、VSCodeを再起動してください
2. **既存コードの更新**: 既存の相対パスは徐々に新しいエイリアスに更新していきます
3. **新規ファイル**: 新しく作成するファイルでは必ずパスエイリアスを使用してください

## 🚀 メリット

- ✅ コードの可読性向上
- ✅ リファクタリング時の変更箇所削減
- ✅ ファイル移動時のimport文の自動更新
- ✅ ディレクトリ構造の把握が容易