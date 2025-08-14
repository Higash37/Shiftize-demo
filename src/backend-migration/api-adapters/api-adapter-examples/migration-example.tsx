/**
 * API サービス移行例
 * 
 * 既存のコンポーネントが新しいAPIサービス抽象化層を使用する方法を示します。
 * この例は実際のコンポーネントには適用せず、参考用として保管します。
 */

import React, { useState, useEffect } from 'react';
import { ShiftAPIService } from '../ShiftAPIService';
import { Shift } from '@/common/common-models/ModelIndex';

// =============================================================================
// 移行前（現在の実装）
// =============================================================================

const ShiftListComponentBefore: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      setError(null);
      try {
        // 直接Firebase呼び出し
        const { ShiftService } = await import('@/services/firebase/firebase-shift');
        const fetchedShifts = await ShiftService.getShifts('store123');
        setShifts(fetchedShifts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  return (
    <div>
      {loading && <p>読み込み中...</p>}
      {error && <p>エラー: {error}</p>}
      {shifts.map(shift => (
        <div key={shift.id}>
          {shift.nickname} - {shift.date} ({shift.startTime}〜{shift.endTime})
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// 移行後（新しいAPIサービス使用）
// =============================================================================

const ShiftListComponentAfter: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      setError(null);
      try {
        // APIサービス抽象化層を使用
        const fetchedShifts = await ShiftAPIService.getShifts({ 
          storeId: 'store123' 
        });
        setShifts(fetchedShifts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  return (
    <div>
      {loading && <p>読み込み中...</p>}
      {error && <p>エラー: {error}</p>}
      {shifts.map(shift => (
        <div key={shift.id}>
          {shift.nickname} - {shift.date} ({shift.startTime}〜{shift.endTime})
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// 複雑な例：複数店舗対応
// =============================================================================

const MultiStoreShiftListComponent: React.FC<{
  userData: {
    storeId?: string;
    connectedStores?: string[];
  };
}> = ({ userData }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);
      setError(null);
      try {
        // 複数店舗対応APIを使用
        const fetchedShifts = await ShiftAPIService.getUserAccessibleShifts(userData);
        setShifts(fetchedShifts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [userData]);

  return (
    <div>
      <h3>アクセス可能なシフト一覧</h3>
      {loading && <p>読み込み中...</p>}
      {error && <p>エラー: {error}</p>}
      {shifts.map(shift => (
        <div key={shift.id}>
          <strong>店舗ID: {shift.storeId}</strong><br />
          {shift.nickname} - {shift.date} ({shift.startTime}〜{shift.endTime})
          <span style={{ color: getStatusColor(shift.status) }}>
            [{shift.status}]
          </span>
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// シフト作成例
// =============================================================================

const ShiftCreateComponent: React.FC = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateShift = async () => {
    setCreating(true);
    setError(null);
    try {
      // APIサービスを使用してシフト作成
      const newShiftId = await ShiftAPIService.createShift({
        userId: 'user123',
        storeId: 'store123',
        date: '2025-01-25',
        startTime: '09:00',
        endTime: '17:00',
        type: 'user',
        subject: '通常勤務',
        classes: [
          { startTime: '13:00', endTime: '14:00' }
        ]
      });
      
      alert('シフトを作成しました！');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h3>シフト作成</h3>
      <button 
        onClick={handleCreateShift} 
        disabled={creating}
      >
        {creating ? '作成中...' : 'シフトを作成'}
      </button>
      {error && <p style={{ color: 'red' }}>エラー: {error}</p>}
    </div>
  );
};

// =============================================================================
// ヘルパー関数
// =============================================================================

function getStatusColor(status: string): string {
  switch (status) {
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'pending': return 'orange';
    case 'completed': return 'blue';
    default: return 'gray';
  }
}

// =============================================================================
// デバッグ用コンポーネント
// =============================================================================

const APIDebugInfo: React.FC = () => {
  const debugInfo = ShiftAPIService.getDebugInfo();
  
  return (
    <div style={{ 
      background: '#f5f5f5', 
      padding: '10px', 
      margin: '10px 0', 
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h4>API デバッグ情報</h4>
      <p><strong>API使用:</strong> {debugInfo.useApiEndpoints ? 'Yes' : 'No (Firebase直接)'}</p>
      <p><strong>ベースURL:</strong> {debugInfo.apiBaseUrl || 'N/A'}</p>
      <p><strong>サービス:</strong> {debugInfo.service}</p>
    </div>
  );
};

// =============================================================================
// 実際の移行手順のコメント
// =============================================================================

/*
実際の移行手順:

1. 既存のコンポーネントを特定:
   - ShiftListView.tsx
   - ShiftReportModal.tsx
   - ExtendedShiftReportModal.tsx
   など

2. import文を変更:
   - Before: import { ShiftService } from "@/services/firebase/firebase-shift";
   - After:  import { ShiftAPIService } from "@/services/api";

3. メソッド呼び出しを変更:
   - Before: ShiftService.getShifts(storeId)
   - After:  ShiftAPIService.getShifts({ storeId })

4. エラーハンドリングの確認:
   - 新しいAPIサービスは統一されたエラーメッセージを提供

5. 段階的テスト:
   - 環境変数 EXPO_PUBLIC_USE_SHIFT_API=false で従来通り動作
   - 段階的に true に変更してAPI移行をテスト

6. 型安全性の確保:
   - TypeScriptの型チェックで移行の正確性を確認
*/

export {
  ShiftListComponentBefore,
  ShiftListComponentAfter,
  MultiStoreShiftListComponent,
  ShiftCreateComponent,
  APIDebugInfo
};