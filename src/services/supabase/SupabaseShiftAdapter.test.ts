/**
 * @file SupabaseShiftAdapter.test.ts
 * @description SupabaseShiftAdapterのユニットテスト。
 *   Supabaseクライアントをモックし、シフトCRUD操作・月別取得・承認処理を検証する。
 */

// --- Supabaseクライアントのモック ---

/**
 * Supabaseのクエリビルダーチェインをシミュレートするモック。
 * from().select().eq().single() のような呼び出しをサポートする。
 * resolveNextWith() で次のターミナル呼び出し（single/maybeSingle/最後のorder等）の
 * 戻り値を設定できる。
 */
let pendingResolves: any[] = [];

const createMockQueryBuilder = () => {
  const builder: any = {};
  const methods = [
    "select", "insert", "update", "delete",
    "eq", "gte", "lte", "in", "order", "limit",
  ];

  // 全チェインメソッドはbuilder自身を返す
  methods.forEach((method) => {
    builder[method] = jest.fn().mockReturnValue(builder);
  });

  // ターミナルメソッド（チェインの最後で結果を返す）
  builder.single = jest.fn().mockImplementation(() => {
    return pendingResolves.length > 0
      ? pendingResolves.shift()
      : Promise.resolve({ data: null, error: null });
  });
  builder.maybeSingle = jest.fn().mockImplementation(() => {
    return pendingResolves.length > 0
      ? pendingResolves.shift()
      : Promise.resolve({ data: null, error: null });
  });

  // orderの場合、チェインされるか結果を返すかは状況による
  // orderをデフォルトではchainableにしつつ、resolveで結果を返せるようにする
  const originalOrder = builder.order;
  builder.order = jest.fn().mockImplementation(() => {
    // pendingResolvesに値があり、次のorderが呼ばれたらそれを返す
    // → 2回目のorderで結果を返すパターン
    return builder;
  });

  // then対応: awaitされた場合に結果を返すための仕組み
  builder.then = undefined; // デフォルトではthenableでない

  return builder;
};

let mockBuilder: any;
const mockFrom = jest.fn();
const mockChannel = jest.fn();
const mockOn = jest.fn();
const mockSubscribe = jest.fn();
const mockRemoveChannel = jest.fn();

jest.mock("./supabase-client", () => ({
  getSupabase: jest.fn(() => ({
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  })),
}));

// --- shift-history/shiftHistoryLoggerのモック ---
jest.mock("@/services/shift-history/shiftHistoryLogger", () => ({
  logShiftChange: jest.fn().mockResolvedValue(undefined),
  determineActionType: jest.fn().mockReturnValue("create"),
}));

// --- ServiceProviderのモック ---
jest.mock("../ServiceProvider", () => ({
  ServiceProvider: {
    googleCalendar: {
      syncShiftToCalendar: jest.fn().mockResolvedValue(undefined),
      removeShiftFromCalendar: jest.fn().mockResolvedValue(undefined),
    },
  },
}));

import { SupabaseShiftAdapter } from "./SupabaseShiftAdapter";
import { logShiftChange } from "@/services/shift-history/shiftHistoryLogger";
import { ServiceProvider } from "../ServiceProvider";

// --- テスト用データ ---
const STORE_ID = "store-001";
const SHIFT_ID = "shift-001";
const USER_ID = "user-001";

const mockShiftRow = {
  id: SHIFT_ID,
  user_id: USER_ID,
  store_id: STORE_ID,
  nickname: "テスト太郎",
  date: "2025-03-10",
  start_time: "09:00",
  end_time: "17:00",
  type: "user" as const,
  subject: null,
  notes: null,
  is_completed: false,
  status: "approved" as const,
  duration: 8,
  created_at: "2025-03-01T00:00:00Z",
  updated_at: "2025-03-01T00:00:00Z",
  classes: [],
  requested_changes: null,
  google_calendar_event_id: null,
};

const mockActor = {
  userId: "admin-001",
  nickname: "管理者",
  role: "master" as const,
};

/**
 * mockFromの呼び出しごとに新しいbuilderを返すように設定するヘルパー。
 * 各from()呼び出しで独立したチェインを構築する。
 */
const setupMockFrom = () => {
  mockFrom.mockImplementation(() => {
    mockBuilder = createMockQueryBuilder();
    return mockBuilder;
  });
};

/**
 * mockFrom呼び出しで返すbuilderを1つずつ設定するヘルパー。
 * 各builderごとにレスポンスをコントロールしたい場合に使う。
 */
const createBuilderWithResolve = (resolveValue: any) => {
  const builder = createMockQueryBuilder();
  // singleとmaybeSingleに固定値を設定
  builder.single.mockResolvedValue(resolveValue);
  builder.maybeSingle.mockResolvedValue(resolveValue);
  // orderの最後でも結果を返せるように
  // チェインの最後でawaitされる場合のためにthenを設定
  return builder;
};

describe("SupabaseShiftAdapter", () => {
  let adapter: SupabaseShiftAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    pendingResolves = [];
    adapter = new SupabaseShiftAdapter();
    setupMockFrom();
    mockChannel.mockReturnValue({ on: mockOn });
    mockOn.mockReturnValue({ subscribe: mockSubscribe });
    mockRemoveChannel.mockResolvedValue(undefined);
  });

  // --- getShift ---
  describe("getShift（シフト1件取得）", () => {
    it("正常系: IDでシフトを取得できる", async () => {
      // from("shifts").select("*").eq("id", id).maybeSingle()
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: mockShiftRow, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShift(SHIFT_ID);

      expect(mockFrom).toHaveBeenCalledWith("shifts");
      expect(builder.select).toHaveBeenCalledWith("*");
      expect(builder.eq).toHaveBeenCalledWith("id", SHIFT_ID);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(SHIFT_ID);
      expect(result!.userId).toBe(USER_ID);
      expect(result!.startTime).toBe("09:00");
      expect(result!.endTime).toBe("17:00");
      expect(result!.status).toBe("approved");
    });

    it("該当なし: nullを返す", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShift("nonexistent");
      expect(result).toBeNull();
    });

    it("エラー時: nullを返す", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: null, error: { message: "DB error" } });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShift(SHIFT_ID);
      expect(result).toBeNull();
    });
  });

  // --- getShifts ---
  describe("getShifts（シフト一覧取得）", () => {
    it("正常系: 店舗IDでフィルタリングしてシフト一覧を取得する", async () => {
      // from("shifts").select("*").eq("store_id", storeId).order().order()
      const builder = createMockQueryBuilder();
      // 2回目のorder()呼び出しで結果を返す（awaitはthen経由）
      let orderCallCount = 0;
      builder.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve({ data: [mockShiftRow], error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShifts(STORE_ID);

      expect(mockFrom).toHaveBeenCalledWith("shifts");
      expect(builder.eq).toHaveBeenCalledWith("store_id", STORE_ID);
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(SHIFT_ID);
    });

    it("正常系: storeId未指定で全シフトを取得する", async () => {
      const builder = createMockQueryBuilder();
      let orderCallCount = 0;
      builder.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve({ data: [mockShiftRow], error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShifts();

      // eqはstoreIdなしでは呼ばれない
      expect(builder.eq).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it("データなし: 空配列を返す", async () => {
      const builder = createMockQueryBuilder();
      let orderCallCount = 0;
      builder.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve({ data: null, error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShifts(STORE_ID);
      expect(result).toEqual([]);
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Connection failed" };
      const builder = createMockQueryBuilder();
      let orderCallCount = 0;
      builder.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve({ data: null, error: dbError });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.getShifts(STORE_ID)).rejects.toEqual(dbError);
    });
  });

  // --- addShift ---
  describe("addShift（シフト追加）", () => {
    const newShift = {
      userId: USER_ID,
      storeId: STORE_ID,
      nickname: "テスト太郎",
      date: "2025-03-10",
      startTime: "09:00",
      endTime: "17:00",
      status: "draft" as const,
      createdAt: new Date("2025-03-01"),
      updatedAt: new Date("2025-03-01"),
    };

    it("正常系: シフトを追加してIDを返す", async () => {
      // from("shifts").insert(row).select("id").single()
      const builder = createMockQueryBuilder();
      builder.single.mockResolvedValue({ data: { id: "new-shift-id" }, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.addShift(newShift);

      expect(mockFrom).toHaveBeenCalledWith("shifts");
      expect(builder.insert).toHaveBeenCalled();
      expect(result).toBe("new-shift-id");
    });

    it("正常系: actorを渡すと監査ログを記録する", async () => {
      const builder = createMockQueryBuilder();
      builder.single.mockResolvedValue({ data: { id: "new-shift-id" }, error: null });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.addShift(newShift, mockActor);

      expect(logShiftChange).toHaveBeenCalled();
    });

    it("正常系: approved状態ならGoogle Calendar同期を呼ぶ", async () => {
      const builder = createMockQueryBuilder();
      builder.single.mockResolvedValue({ data: { id: "new-shift-id" }, error: null });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.addShift({ ...newShift, status: "approved" });

      expect(ServiceProvider.googleCalendar.syncShiftToCalendar).toHaveBeenCalled();
    });

    it("正常系: draft状態ならGoogle Calendar同期を呼ばない", async () => {
      const builder = createMockQueryBuilder();
      builder.single.mockResolvedValue({ data: { id: "new-shift-id" }, error: null });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.addShift(newShift);

      expect(ServiceProvider.googleCalendar.syncShiftToCalendar).not.toHaveBeenCalled();
    });

    it("エラー時: DB挿入エラーで例外をスローする", async () => {
      const dbError = { message: "Insert failed" };
      const builder = createMockQueryBuilder();
      builder.single.mockResolvedValue({ data: null, error: dbError });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.addShift(newShift)).rejects.toEqual(dbError);
    });
  });

  // --- updateShift ---
  describe("updateShift（シフト更新）", () => {
    it("正常系: シフトを更新する", async () => {
      // 1回目: fetchShiftById -> from("shifts").select("*").eq("id", id).single()
      const builder1 = createMockQueryBuilder();
      builder1.single.mockResolvedValue({ data: mockShiftRow, error: null });
      // 2回目: update -> from("shifts").update(row).eq("id", id)
      const builder2 = createMockQueryBuilder();
      builder2.eq.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

      await adapter.updateShift(SHIFT_ID, { startTime: "10:00" });

      expect(builder2.update).toHaveBeenCalled();
    });

    it("正常系: actorを渡すと監査ログを記録する", async () => {
      const builder1 = createMockQueryBuilder();
      builder1.single.mockResolvedValue({ data: mockShiftRow, error: null });
      const builder2 = createMockQueryBuilder();
      builder2.eq.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

      await adapter.updateShift(SHIFT_ID, { startTime: "10:00" }, mockActor);

      expect(logShiftChange).toHaveBeenCalled();
    });

    it("正常系: approvedシフトを更新するとCalendar同期する", async () => {
      const builder1 = createMockQueryBuilder();
      builder1.single.mockResolvedValue({ data: mockShiftRow, error: null });
      const builder2 = createMockQueryBuilder();
      builder2.eq.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

      await adapter.updateShift(SHIFT_ID, { startTime: "10:00" });

      expect(ServiceProvider.googleCalendar.syncShiftToCalendar).toHaveBeenCalled();
    });

    it("エラー時: DB更新エラーで例外をスローする", async () => {
      const builder1 = createMockQueryBuilder();
      builder1.single.mockResolvedValue({ data: mockShiftRow, error: null });
      const dbError = { message: "Update failed" };
      const builder2 = createMockQueryBuilder();
      builder2.eq.mockResolvedValue({ error: dbError });
      mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

      await expect(
        adapter.updateShift(SHIFT_ID, { startTime: "10:00" })
      ).rejects.toEqual(dbError);
    });
  });

  // --- markShiftAsDeleted ---
  describe("markShiftAsDeleted（シフト削除）", () => {
    it("正常系: シフトを削除する", async () => {
      // 1回目: fetchShiftById
      const builder1 = createMockQueryBuilder();
      builder1.single.mockResolvedValue({ data: mockShiftRow, error: null });
      // 2回目: delete
      const builder2 = createMockQueryBuilder();
      builder2.eq.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

      await adapter.markShiftAsDeleted(SHIFT_ID);

      expect(builder2.delete).toHaveBeenCalled();
    });

    it("正常系: deletedByを渡すと監査ログを記録する", async () => {
      const builder1 = createMockQueryBuilder();
      builder1.single.mockResolvedValue({ data: mockShiftRow, error: null });
      const builder2 = createMockQueryBuilder();
      builder2.eq.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

      await adapter.markShiftAsDeleted(SHIFT_ID, mockActor);

      expect(logShiftChange).toHaveBeenCalled();
    });

    it("正常系: GoogleCalendarEventIdがあればCalendarから削除する", async () => {
      const rowWithCalendar = {
        ...mockShiftRow,
        google_calendar_event_id: "cal-event-123",
      };
      const builder1 = createMockQueryBuilder();
      builder1.single.mockResolvedValue({ data: rowWithCalendar, error: null });
      const builder2 = createMockQueryBuilder();
      builder2.eq.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

      await adapter.markShiftAsDeleted(SHIFT_ID);

      expect(ServiceProvider.googleCalendar.removeShiftFromCalendar).toHaveBeenCalledWith(
        SHIFT_ID,
        "cal-event-123"
      );
    });

    it("エラー時: DB削除エラーで例外をスローする", async () => {
      const builder1 = createMockQueryBuilder();
      builder1.single.mockResolvedValue({ data: mockShiftRow, error: null });
      const dbError = { message: "Delete failed" };
      const builder2 = createMockQueryBuilder();
      builder2.eq.mockResolvedValue({ error: dbError });
      mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

      await expect(adapter.markShiftAsDeleted(SHIFT_ID)).rejects.toEqual(dbError);
    });
  });

  // --- getShiftsByMonth ---
  describe("getShiftsByMonth（月別シフト取得）", () => {
    const createOrderChainBuilder = (resolveValue: any) => {
      const builder = createMockQueryBuilder();
      let orderCallCount = 0;
      builder.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve(resolveValue);
        }
        return builder;
      });
      return builder;
    };

    it("正常系: 指定月のシフトを取得する（month=2はMarch）", async () => {
      const builder = createOrderChainBuilder({ data: [mockShiftRow], error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShiftsByMonth(STORE_ID, 2025, 2);

      // month=2 (0-based) => "03"
      expect(builder.gte).toHaveBeenCalledWith("date", "2025-03-01");
      expect(builder.lte).toHaveBeenCalledWith("date", "2025-03-31");
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(SHIFT_ID);
    });

    it("正常系: 12月の取得（month=11）", async () => {
      const builder = createOrderChainBuilder({ data: [], error: null });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.getShiftsByMonth(STORE_ID, 2025, 11);

      expect(builder.gte).toHaveBeenCalledWith("date", "2025-12-01");
      expect(builder.lte).toHaveBeenCalledWith("date", "2025-12-31");
    });

    it("データなし: 空配列を返す", async () => {
      const builder = createOrderChainBuilder({ data: null, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShiftsByMonth(STORE_ID, 2025, 0);
      expect(result).toEqual([]);
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Query failed" };
      const builder = createOrderChainBuilder({ data: null, error: dbError });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.getShiftsByMonth(STORE_ID, 2025, 0)).rejects.toEqual(dbError);
    });
  });

  // --- approveShiftChanges ---
  describe("approveShiftChanges（シフト承認）", () => {
    it("正常系: pendingシフトを承認する", async () => {
      const pendingRow = { ...mockShiftRow, status: "pending", requested_changes: null };
      // 1回目: fetchShiftById
      const b1 = createMockQueryBuilder();
      b1.single.mockResolvedValue({ data: pendingRow, error: null });
      // 2回目: applyApproval内のupdate
      const b2 = createMockQueryBuilder();
      b2.eq.mockResolvedValue({ error: null });
      // 3回目: fetchShiftById(Calendar同期用)
      const b3 = createMockQueryBuilder();
      b3.single.mockResolvedValue({ data: { ...pendingRow, status: "approved" }, error: null });
      mockFrom.mockReturnValueOnce(b1).mockReturnValueOnce(b2).mockReturnValueOnce(b3);

      await adapter.approveShiftChanges(SHIFT_ID);

      expect(b2.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "approved" })
      );
    });

    it("正常系: requestedChangesがあれば変更を適用して承認する", async () => {
      const pendingRowWithChanges = {
        ...mockShiftRow,
        status: "pending",
        requested_changes: [{ startTime: "10:00", endTime: "18:00" }],
      };
      const b1 = createMockQueryBuilder();
      b1.single.mockResolvedValue({ data: pendingRowWithChanges, error: null });
      const b2 = createMockQueryBuilder();
      b2.eq.mockResolvedValue({ error: null });
      const b3 = createMockQueryBuilder();
      b3.single.mockResolvedValue({
        data: { ...pendingRowWithChanges, status: "approved", start_time: "10:00", end_time: "18:00" },
        error: null,
      });
      mockFrom.mockReturnValueOnce(b1).mockReturnValueOnce(b2).mockReturnValueOnce(b3);

      await adapter.approveShiftChanges(SHIFT_ID);

      expect(b2.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "approved",
          start_time: "10:00",
          end_time: "18:00",
          requested_changes: null,
        })
      );
    });

    it("シフトが見つからない場合: 何もせず正常終了する", async () => {
      const b1 = createMockQueryBuilder();
      b1.single.mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValueOnce(b1);

      await adapter.approveShiftChanges(SHIFT_ID);

      // updateが呼ばれていないことを確認
      expect(mockFrom).toHaveBeenCalledTimes(1);
    });

    it("pendingでもrequested_changesもない場合: 何もせず正常終了する", async () => {
      const approvedRow = { ...mockShiftRow, status: "approved", requested_changes: null };
      const b1 = createMockQueryBuilder();
      b1.single.mockResolvedValue({ data: approvedRow, error: null });
      mockFrom.mockReturnValueOnce(b1);

      await adapter.approveShiftChanges(SHIFT_ID);

      expect(mockFrom).toHaveBeenCalledTimes(1);
    });

    it("正常系: approverを渡すと監査ログを記録する", async () => {
      const pendingRow = { ...mockShiftRow, status: "pending", requested_changes: null };
      const b1 = createMockQueryBuilder();
      b1.single.mockResolvedValue({ data: pendingRow, error: null });
      const b2 = createMockQueryBuilder();
      b2.eq.mockResolvedValue({ error: null });
      const b3 = createMockQueryBuilder();
      b3.single.mockResolvedValue({ data: { ...pendingRow, status: "approved" }, error: null });
      mockFrom.mockReturnValueOnce(b1).mockReturnValueOnce(b2).mockReturnValueOnce(b3);

      await adapter.approveShiftChanges(SHIFT_ID, mockActor);

      expect(logShiftChange).toHaveBeenCalled();
    });
  });

  // --- markShiftAsCompleted ---
  describe("markShiftAsCompleted（シフト完了）", () => {
    it("正常系: シフトを完了状態にする", async () => {
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.markShiftAsCompleted(SHIFT_ID);

      expect(builder.update).toHaveBeenCalledWith({ status: "completed" });
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Update failed" };
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ error: dbError });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.markShiftAsCompleted(SHIFT_ID)).rejects.toEqual(dbError);
    });
  });

  // --- getShiftsFromMultipleStores ---
  describe("getShiftsFromMultipleStores（複数店舗シフト取得）", () => {
    it("正常系: 複数店舗IDでフィルタしてシフトを取得する", async () => {
      const builder = createMockQueryBuilder();
      let orderCallCount = 0;
      builder.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve({ data: [mockShiftRow], error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getShiftsFromMultipleStores([STORE_ID, "store-002"]);

      expect(builder.in).toHaveBeenCalledWith("store_id", [STORE_ID, "store-002"]);
      expect(result).toHaveLength(1);
    });

    it("空配列の場合: DBクエリを実行せず空配列を返す", async () => {
      const result = await adapter.getShiftsFromMultipleStores([]);

      expect(mockFrom).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  // --- getUserAccessibleShifts ---
  describe("getUserAccessibleShifts（ユーザーアクセス可能シフト取得）", () => {
    it("正常系: storeIdとconnectedStoresを統合してシフトを取得する", async () => {
      const builder = createMockQueryBuilder();
      let orderCallCount = 0;
      builder.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve({ data: [mockShiftRow], error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUserAccessibleShifts({
        storeId: STORE_ID,
        connectedStores: ["store-002"],
      });

      expect(builder.in).toHaveBeenCalledWith("store_id", [STORE_ID, "store-002"]);
      expect(result).toHaveLength(1);
    });

    it("重複するstoreIdは排除される", async () => {
      const builder = createMockQueryBuilder();
      let orderCallCount = 0;
      builder.order.mockImplementation(() => {
        orderCallCount++;
        if (orderCallCount >= 2) {
          return Promise.resolve({ data: [], error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.getUserAccessibleShifts({
        storeId: STORE_ID,
        connectedStores: [STORE_ID, "store-002"],
      });

      expect(builder.in).toHaveBeenCalledWith("store_id", [STORE_ID, "store-002"]);
    });
  });

  // --- addShiftReport ---
  describe("addShiftReport（業務報告追加）", () => {
    it("正常系: 業務報告を保存する", async () => {
      const builder = createMockQueryBuilder();
      builder.insert.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.addShiftReport(SHIFT_ID, {
        taskCounts: { "レジ打ち": { count: 3, time: 60 } },
        comments: "特になし",
      });

      expect(mockFrom).toHaveBeenCalledWith("reports");
      expect(builder.insert).toHaveBeenCalledWith({
        shift_id: SHIFT_ID,
        task_counts: { "レジ打ち": { count: 3, time: 60 } },
        comments: "特になし",
      });
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Insert failed" };
      const builder = createMockQueryBuilder();
      builder.insert.mockResolvedValue({ error: dbError });
      mockFrom.mockReturnValueOnce(builder);

      await expect(
        adapter.addShiftReport(SHIFT_ID, { taskCounts: {}, comments: "" })
      ).rejects.toEqual(dbError);
    });
  });
});
