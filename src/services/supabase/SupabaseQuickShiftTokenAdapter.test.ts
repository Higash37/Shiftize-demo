/**
 * @file SupabaseQuickShiftTokenAdapter.test.ts
 * @description SupabaseQuickShiftTokenAdapterのユニットテスト。
 *   Supabaseクライアントとexpo-cryptoをモックし、トークンCRUD・検証・URL生成を検証する。
 */

// --- Supabaseクライアントのモック ---
const mockMaybeSingle = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn();

const createChainable = () => {
  const chainable: any = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    maybeSingle: mockMaybeSingle,
  };
  Object.values(chainable).forEach((fn: any) => {
    fn.mockReturnValue(chainable);
  });
  return chainable;
};

let chainable: any;

jest.mock("./supabase-client", () => ({
  getSupabase: jest.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

// --- expo-cryptoのモック ---
jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn().mockResolvedValue(
    new Uint8Array([
      0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89,
      0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89,
    ])
  ),
}));

import { SupabaseQuickShiftTokenAdapter } from "./SupabaseQuickShiftTokenAdapter";

// --- テスト用データ ---
const STORE_ID = "store-001";
const CREATOR_ID = "user-001";
const TOKEN_ID = "abcdef0123456789abcdef0123456789";
const SHIFT_IDS = ["shift-001", "shift-002"];

const mockTokenRow = {
  id: TOKEN_ID,
  store_id: STORE_ID,
  created_by: CREATOR_ID,
  token_type: "recruitment",
  recruitment_shift_ids: SHIFT_IDS,
  allowed_date_range: null,
  expires_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
  max_uses: 10,
  current_uses: 3,
  allowed_user_ids: null,
  require_line_auth: true,
  is_active: true,
  created_at: "2025-03-01T00:00:00Z",
  updated_at: "2025-03-01T00:00:00Z",
  last_used_at: null,
  usage_log: [],
};

describe("SupabaseQuickShiftTokenAdapter", () => {
  let adapter: SupabaseQuickShiftTokenAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new SupabaseQuickShiftTokenAdapter();
    chainable = createChainable();
    mockFrom.mockReturnValue(chainable);
  });

  // --- createRecruitmentToken ---
  describe("createRecruitmentToken（募集トークン作成）", () => {
    it("正常系: 募集用トークンを作成してトークンIDを返す", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      const result = await adapter.createRecruitmentToken(STORE_ID, CREATOR_ID, SHIFT_IDS);

      expect(mockFrom).toHaveBeenCalledWith("quick_shift_tokens");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          store_id: STORE_ID,
          created_by: CREATOR_ID,
          token_type: "recruitment",
          recruitment_shift_ids: SHIFT_IDS,
          is_active: true,
          current_uses: 0,
          require_line_auth: true,
        })
      );
      // expo-cryptoのモックにより固定のトークンIDが生成される
      expect(result).toBe(TOKEN_ID);
    });

    it("正常系: オプションを渡すとmaxUsesとallowedUserIdsが設定される", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      await adapter.createRecruitmentToken(STORE_ID, CREATOR_ID, SHIFT_IDS, {
        expiresInHours: 24,
        maxUses: 5,
        allowedUserIds: ["user-002"],
        requireLineAuth: false,
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          max_uses: 5,
          allowed_user_ids: ["user-002"],
          require_line_auth: false,
        })
      );
    });

    it("正常系: デフォルトの有効期限は168時間（7日）", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      const before = Date.now();
      await adapter.createRecruitmentToken(STORE_ID, CREATOR_ID, SHIFT_IDS);
      const after = Date.now();

      const insertCall = mockInsert.mock.calls[0][0];
      const expiresAt = new Date(insertCall.expires_at).getTime();
      const expectedMin = before + 168 * 3600000;
      const expectedMax = after + 168 * 3600000;

      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });
  });

  // --- createFreeAddToken ---
  describe("createFreeAddToken（自由追加トークン作成）", () => {
    it("正常系: 自由追加用トークンを作成してトークンIDを返す", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      const result = await adapter.createFreeAddToken(STORE_ID, CREATOR_ID);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          store_id: STORE_ID,
          created_by: CREATOR_ID,
          token_type: "free_add",
          is_active: true,
        })
      );
      expect(result).toBe(TOKEN_ID);
    });

    it("正常系: オプションを渡すと設定が反映される", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      await adapter.createFreeAddToken(STORE_ID, CREATOR_ID, {
        expiresInHours: 48,
        maxUses: 3,
        requireLineAuth: false,
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          max_uses: 3,
          require_line_auth: false,
        })
      );
    });
  });

  // --- validateToken ---
  describe("validateToken（トークン検証）", () => {
    it("正常系: 有効なトークンの場合valid=trueとトークンオブジェクトを返す", async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: mockTokenRow });

      const result = await adapter.validateToken(TOKEN_ID);

      expect(result.valid).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.token!.id).toBe(TOKEN_ID);
      expect(result.token!.storeId).toBe(STORE_ID);
    });

    it("トークンが見つからない場合: valid=falseとエラーメッセージを返す", async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null });

      const result = await adapter.validateToken("nonexistent");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("トークンが見つかりません");
    });

    it("無効化されたトークン: valid=falseを返す", async () => {
      mockMaybeSingle.mockResolvedValueOnce({
        data: { ...mockTokenRow, is_active: false },
      });

      const result = await adapter.validateToken(TOKEN_ID);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("無効化");
    });

    it("期限切れトークン: valid=falseを返す", async () => {
      const expiredRow = {
        ...mockTokenRow,
        expires_at: new Date(Date.now() - 3600000).toISOString(), // 1時間前
      };
      mockMaybeSingle.mockResolvedValueOnce({ data: expiredRow });

      const result = await adapter.validateToken(TOKEN_ID);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("期限切れ");
    });

    it("使用上限に達したトークン: valid=falseを返す", async () => {
      const maxedOutRow = {
        ...mockTokenRow,
        max_uses: 5,
        current_uses: 5,
      };
      mockMaybeSingle.mockResolvedValueOnce({ data: maxedOutRow });

      const result = await adapter.validateToken(TOKEN_ID);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("使用上限");
    });

    it("許可されていないユーザー: valid=falseを返す", async () => {
      const restrictedRow = {
        ...mockTokenRow,
        allowed_user_ids: ["user-002", "user-003"],
      };
      mockMaybeSingle.mockResolvedValueOnce({ data: restrictedRow });

      const result = await adapter.validateToken(TOKEN_ID, "user-999");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("権限がありません");
    });

    it("許可されたユーザー: valid=trueを返す", async () => {
      const restrictedRow = {
        ...mockTokenRow,
        allowed_user_ids: ["user-002", "user-003"],
      };
      mockMaybeSingle.mockResolvedValueOnce({ data: restrictedRow });

      const result = await adapter.validateToken(TOKEN_ID, "user-002");

      expect(result.valid).toBe(true);
    });

    it("allowedUserIdsが空配列の場合: 誰でもアクセスできる", async () => {
      const openRow = {
        ...mockTokenRow,
        allowed_user_ids: [],
      };
      mockMaybeSingle.mockResolvedValueOnce({ data: openRow });

      const result = await adapter.validateToken(TOKEN_ID, "any-user");

      expect(result.valid).toBe(true);
    });

    it("maxUsesがnull（無制限）の場合: 使用回数制限なしでvalid=true", async () => {
      const unlimitedRow = {
        ...mockTokenRow,
        max_uses: null,
        current_uses: 9999,
      };
      mockMaybeSingle.mockResolvedValueOnce({ data: unlimitedRow });

      const result = await adapter.validateToken(TOKEN_ID);

      expect(result.valid).toBe(true);
    });

    it("例外発生時: valid=falseとエラーメッセージを返す", async () => {
      mockMaybeSingle.mockRejectedValueOnce(new Error("DB error"));

      const result = await adapter.validateToken(TOKEN_ID);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("エラーが発生しました");
    });
  });

  // --- recordTokenUsage ---
  describe("recordTokenUsage（トークン使用記録）", () => {
    it("正常系: RPC経由で使用を記録する", async () => {
      mockRpc.mockResolvedValueOnce({ error: null });

      await adapter.recordTokenUsage(TOKEN_ID, "user-002", "shift-001");

      expect(mockRpc).toHaveBeenCalledWith("record_token_usage", {
        p_token_id: TOKEN_ID,
        p_user_id: "user-002",
        p_shift_id: "shift-001",
      });
    });

    it("RPCエラー時: 例外をスローせず正常終了する（握りつぶし）", async () => {
      mockRpc.mockResolvedValueOnce({ error: { message: "RPC failed" } });

      // recordTokenUsageのcatch内で例外が握りつぶされる
      await expect(
        adapter.recordTokenUsage(TOKEN_ID, "user-002", "shift-001")
      ).resolves.not.toThrow();
    });

    it("例外発生時: 握りつぶして正常終了する", async () => {
      mockRpc.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        adapter.recordTokenUsage(TOKEN_ID, "user-002", "shift-001")
      ).resolves.not.toThrow();
    });
  });

  // --- deactivateToken ---
  describe("deactivateToken（トークン無効化）", () => {
    it("正常系: トークンのis_activeをfalseに更新する", async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await adapter.deactivateToken(TOKEN_ID);

      expect(mockFrom).toHaveBeenCalledWith("quick_shift_tokens");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: false })
      );
      expect(mockEq).toHaveBeenCalledWith("id", TOKEN_ID);
    });
  });

  // --- deleteToken ---
  describe("deleteToken（トークン削除）", () => {
    it("正常系: トークンを物理削除する", async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await adapter.deleteToken(TOKEN_ID);

      expect(mockFrom).toHaveBeenCalledWith("quick_shift_tokens");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", TOKEN_ID);
    });
  });

  // --- getStoreTokens ---
  describe("getStoreTokens（店舗トークン一覧取得）", () => {
    it("正常系: 店舗のトークン一覧を取得する", async () => {
      mockEq.mockResolvedValueOnce({ data: [mockTokenRow] });

      const result = await adapter.getStoreTokens(STORE_ID);

      expect(mockFrom).toHaveBeenCalledWith("quick_shift_tokens");
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(TOKEN_ID);
      expect(result[0]!.storeId).toBe(STORE_ID);
      expect(result[0]!.tokenType).toBe("recruitment");
    });

    it("データなし: 空配列を返す", async () => {
      mockEq.mockResolvedValueOnce({ data: null });

      const result = await adapter.getStoreTokens(STORE_ID);
      expect(result).toEqual([]);
    });

    it("例外発生時: 空配列を返す（握りつぶし）", async () => {
      mockEq.mockRejectedValueOnce(new Error("DB error"));

      const result = await adapter.getStoreTokens(STORE_ID);
      expect(result).toEqual([]);
    });
  });

  // --- generateQuickShiftUrl ---
  describe("generateQuickShiftUrl（URL生成）", () => {
    it("正常系: recruitment用URLを生成する", () => {
      const url = adapter.generateQuickShiftUrl(TOKEN_ID, "recruitment");

      expect(url).toBe(
        `https://shiftschedulerapp-71104.web.app/quick-recruit?token=${TOKEN_ID}`
      );
    });

    it("正常系: free_add用URLを生成する", () => {
      const url = adapter.generateQuickShiftUrl(TOKEN_ID, "free_add");

      expect(url).toBe(
        `https://shiftschedulerapp-71104.web.app/quick-add?token=${TOKEN_ID}`
      );
    });
  });
});
