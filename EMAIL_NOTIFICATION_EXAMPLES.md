# メール通知機能の例

## 🔍 Firestoreデータ例

### users コレクション
```javascript
// 教室長1
{
  uid: "master123",
  email: "master@example.com",
  nickname: "田中教室長", 
  role: "master",
  storeId: "store001",
  deleted: false,
  currentPassword: "password123"
}

// 教室長2（同じ店舗）
{
  uid: "master456", 
  email: "yamada@example.com",
  nickname: "山田副教室長",
  role: "master", 
  storeId: "store001",
  deleted: false,
  currentPassword: "password456"
}

// 講師1
{
  uid: "user789",
  email: "lecturer1@example.com", 
  nickname: "佐藤先生",
  role: "user",
  storeId: "store001", 
  deleted: false,
  currentPassword: "password789"
}

// 講師2
{
  uid: "user101", 
  email: "lecturer2@example.com",
  nickname: "鈴木先生",
  role: "user",
  storeId: "store001",
  deleted: false,
  currentPassword: "password101"
}
```

### shifts コレクション
```javascript
{
  id: "shift001",
  userId: "user789",      // 佐藤先生のUID
  storeId: "store001", 
  nickname: "佐藤先生",
  date: "2025-01-15",
  startTime: "14:00",
  endTime: "18:00", 
  status: "draft",
  type: "user"
}
```

## 📧 メール通知の例

### 1. シフト作成時の通知

**トリガー:** 佐藤先生がシフトを作成

**送信先:** 
- master@example.com (田中教室長)
- yamada@example.com (山田副教室長)

**メール内容:**
```
件名: 新しいシフトが追加されました - 2025-01-15

📅 新しいシフトが追加されました

シフト詳細
作成者: 佐藤先生
日付: 2025-01-15  
時間: 14:00 - 18:00
状態: draft

アプリで詳細を確認し、必要に応じて承認を行ってください。
```

### 2. シフト削除時の通知

**トリガー:** 田中教室長が佐藤先生のシフトを削除

**送信先:**
- lecturer1@example.com (佐藤先生)

**メール内容:**
```
件名: シフトが削除されました - 2025-01-15

🗑️ シフトが削除されました

こんにちは、佐藤先生さん

田中教室長さんがあなたの以下のシフトを削除しました：

削除されたシフト
日付: 2025-01-15
時間: 14:00 - 18:00
理由: 人員調整のため

ご質問がある場合は、田中教室長さんまたは管理者にお問い合わせください。
```

### 3. シフト承認時の通知

**トリガー:** 田中教室長が佐藤先生のシフトを承認

**送信先:**
- lecturer1@example.com (佐藤先生)

**メール内容:**
```
件名: シフトが承認されました - 2025-01-15

✅ シフトが承認されました

こんにちは、佐藤先生さん

田中教室長さんがあなたのシフトを承認しました！

承認されたシフト
日付: 2025-01-15
時間: 14:00 - 18:00  
状態: 承認済み

シフトが確定しました。当日の勤務をよろしくお願いします。
```

## 🔧 実装時のコード例

### 1. シフト作成時（firebase-shift.ts内）
```typescript
// 佐藤先生がシフトを作成
const shift = {
  userId: "user789",
  storeId: "store001", 
  nickname: "佐藤先生",
  date: "2025-01-15",
  startTime: "14:00",
  endTime: "18:00"
};

await ShiftService.addShift(shift);

// 内部でEmailNotificationService.notifyShiftCreatedByEmail()が実行される
// → master@example.com と yamada@example.com にメール送信
```

### 2. シフト削除時
```typescript
// 田中教室長がシフトを削除
await ShiftService.markShiftAsDeleted(
  "shift001", 
  { nickname: "田中教室長", userId: "master123" },
  "人員調整のため"
);

// 内部でEmailNotificationService.notifyShiftDeletedByEmail()が実行される  
// → lecturer1@example.com にメール送信
```

### 3. シフト承認時
```typescript
// 田中教室長がシフトを承認
await ShiftService.approveShiftChanges(
  "shift001",
  { nickname: "田中教室長", userId: "master123" }
);

// 内部でEmailNotificationService.notifyShiftApprovedByEmail()が実行される
// → lecturer1@example.com にメール送信
```

## 🚨 重要な条件

### 通知が送信される条件:
✅ 教室長・講師ともに`email`フィールドが存在する
✅ `deleted: false`（削除されていない）
✅ 同じ`storeId`
✅ 教室長は`role: "master"`
✅ 講師は`role: "user"`

### 通知が送信されない場合:
❌ `email`フィールドが空・存在しない
❌ `deleted: true`
❌ 異なる`storeId`
❌ 自分で自分のシフトを削除した場合

## 📱 プラットフォーム別動作

### Web環境（現在）:
- メール通知のみ
- HTMLメールで美しい表示

### モバイル環境（将来）:
- プッシュ通知のみ
- リアルタイム通知

現在のWeb版では、これらのメール通知が自動で送信されます！