/**
 * @file SupabaseUserAdapter.test.ts
 * @description SupabaseUserAdapterのユニットテスト。
 *   Supabaseクライアントをモックし、ユーザーCRUD・メール検索・GDPR削除を検証する。
 */

// --- Supabaseクエリビルダーのモックファクトリ ---
const createMockQueryBuilder = () => {
  const builder: any = {};
  const methods = [
    "select", "insert", "update", "delete",
    "eq", "limit",
  ];

  methods.forEach((method) => {
    builder[method] = jest.fn().mockReturnValue(builder);
  });

  // ターミナルメソッド
  builder.single = jest.fn().mockResolvedValue({ data: null, error: null });
  builder.maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });

  return builder;
};

const mockFrom = jest.fn();

jest.mock("./supabase-client", () => ({
  getSupabase: jest.fn(() => ({
    from: mockFrom,
  })),
}));

// --- セキュリティユーティリティのモック ---
jest.mock("@/common/common-utils/security/encryptionUtils", () => ({
  PersonalDataDeletion: {
    deleteUserData: jest.fn().mockResolvedValue(undefined),
    deleteUserDataByAdmin: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/common/common-utils/security/securityUtils", () => ({
  SecurityLogger: {
    logEvent: jest.fn(),
  },
}));

import { SupabaseUserAdapter } from "./SupabaseUserAdapter";
import { PersonalDataDeletion } from "@/common/common-utils/security/encryptionUtils";
import { SecurityLogger } from "@/common/common-utils/security/securityUtils";
import { ValidationError, PermissionError } from "@/common/common-errors/AppErrors";

// --- テスト用データ ---
const STORE_ID = "store-001";
const USER_ID = "user-001";
const ADMIN_ID = "admin-001";

const mockUserRow = {
  uid: USER_ID,
  role: "user",
  nickname: "テスト太郎",
  furigana: "テストタロウ",
  email: "test@example.com",
  color: "#FF0000",
  store_id: STORE_ID,
  hourly_wage: 1200,
  created_at: "2025-01-01T00:00:00Z",
  real_email: null,
  original_user_id: null,
  connected_stores: [],
};

describe("SupabaseUserAdapter", () => {
  let adapter: SupabaseUserAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new SupabaseUserAdapter();
  });

  // --- getUsers ---
  describe("getUsers（ユーザー一覧取得）", () => {
    it("正常系: 店舗IDでフィルタリングしてユーザー一覧を取得する", async () => {
      // from("users").select("*").eq("store_id", storeId) -> await
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: [mockUserRow], error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUsers(STORE_ID);

      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(builder.select).toHaveBeenCalledWith("*");
      expect(builder.eq).toHaveBeenCalledWith("store_id", STORE_ID);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        uid: USER_ID,
        nickname: "テスト太郎",
        email: "test@example.com",
        storeId: STORE_ID,
      });
    });

    it("正常系: storeId未指定で全ユーザーを取得する", async () => {
      // from("users").select("*") -> await (eqは呼ばれない)
      const builder = createMockQueryBuilder();
      builder.select.mockResolvedValue({ data: [mockUserRow], error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUsers();

      expect(result).toHaveLength(1);
    });

    it("データなし: 空配列を返す", async () => {
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUsers(STORE_ID);
      expect(result).toEqual([]);
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Connection failed" };
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: null, error: dbError });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.getUsers(STORE_ID)).rejects.toEqual(dbError);
    });

    it("正常系: nicknameやcolorがnullの場合のデフォルト値", async () => {
      const rowWithNulls = {
        ...mockUserRow,
        nickname: null,
        color: null,
        role: null,
        furigana: null,
        hourly_wage: null,
      };
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: [rowWithNulls], error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUsers(STORE_ID);

      expect(result[0]).toMatchObject({
        nickname: "",
        role: "user",
      });
    });
  });

  // --- deleteUser ---
  describe("deleteUser（ユーザー削除）", () => {
    it("正常系: ユーザーを削除する", async () => {
      // from("users").delete().eq("uid", id) -> await
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ error: null });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.deleteUser(USER_ID);

      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith("uid", USER_ID);
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Delete failed" };
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ error: dbError });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.deleteUser(USER_ID)).rejects.toEqual(dbError);
    });
  });

  // --- getUserData ---
  describe("getUserData（ユーザーデータ取得）", () => {
    it("正常系: ユーザーデータを取得する", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: mockUserRow, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUserData(USER_ID);

      expect(result).not.toBeNull();
      expect(result!.nickname).toBe("テスト太郎");
      expect(result!.role).toBe("user");
      expect(result!.email).toBe("test@example.com");
      expect(result!.hourlyWage).toBe(1200);
    });

    it("該当なし: nullを返す", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUserData("nonexistent");
      expect(result).toBeNull();
    });

    it("エラー時: nullを返す", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: null, error: { message: "DB error" } });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUserData(USER_ID);
      expect(result).toBeNull();
    });
  });

  // --- checkMasterExists ---
  describe("checkMasterExists（マスターユーザー存在確認）", () => {
    it("正常系: マスターが存在する場合trueを返す", async () => {
      // from("users").select("uid").eq("role","master").limit(1) のあと .eq("store_id",...) -> await
      const builder = createMockQueryBuilder();
      // checkMasterExists: limit(1)の後にeq("store_id",storeId)が呼ばれ、その結果をawait
      builder.eq.mockReturnValue(builder); // チェイン可能
      // 最後のeq呼び出し結果をPromise化
      // limit後の2回目のeq呼び出しで結果を返す
      let eqCallCount = 0;
      builder.eq.mockImplementation(() => {
        eqCallCount++;
        // 1回目: eq("role","master") -> chain
        // 2回目: eq("store_id", storeId) -> await result
        if (eqCallCount >= 2) {
          return Promise.resolve({ data: [{ uid: ADMIN_ID }], error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.checkMasterExists(STORE_ID);
      expect(result).toBe(true);
    });

    it("正常系: マスターが存在しない場合falseを返す", async () => {
      const builder = createMockQueryBuilder();
      let eqCallCount = 0;
      builder.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount >= 2) {
          return Promise.resolve({ data: [], error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.checkMasterExists(STORE_ID);
      expect(result).toBe(false);
    });

    it("正常系: dataがnullの場合falseを返す", async () => {
      const builder = createMockQueryBuilder();
      let eqCallCount = 0;
      builder.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount >= 2) {
          return Promise.resolve({ data: null, error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.checkMasterExists(STORE_ID);
      expect(result).toBe(false);
    });

    it("storeId未指定: limit後にawaitされるのみ", async () => {
      // storeIdなしの場合: from.select.eq("role","master").limit(1) -> await
      const builder = createMockQueryBuilder();
      builder.limit.mockResolvedValue({ data: [{ uid: ADMIN_ID }], error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.checkMasterExists();
      expect(result).toBe(true);
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Query failed" };
      const builder = createMockQueryBuilder();
      let eqCallCount = 0;
      builder.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount >= 2) {
          return Promise.resolve({ data: null, error: dbError });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.checkMasterExists(STORE_ID)).rejects.toEqual(dbError);
    });
  });

  // --- checkEmailExists ---
  describe("checkEmailExists（メール存在確認）", () => {
    it("正常系: メールが存在する場合trueを返す（storeId指定あり）", async () => {
      // from("users").select("uid").eq("email", email).eq("store_id", storeId) -> await
      const builder = createMockQueryBuilder();
      let eqCallCount = 0;
      builder.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount >= 2) {
          return Promise.resolve({ data: [{ uid: USER_ID }], error: null });
        }
        return builder;
      });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.checkEmailExists("test@example.com", STORE_ID);
      expect(result).toBe(true);
    });

    it("正常系: メールが存在しない場合falseを返す（storeIdなし）", async () => {
      // storeIdなし: from("users").select("uid").eq("email", email) -> await
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: [], error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.checkEmailExists("unknown@example.com");
      expect(result).toBe(false);
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Query failed" };
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: null, error: dbError });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.checkEmailExists("test@example.com")).rejects.toEqual(dbError);
    });
  });

  // --- checkEmailDuplicate ---
  describe("checkEmailDuplicate（メール重複チェック）", () => {
    it("正常系: 重複なしの場合エラーをスローしない", async () => {
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: [], error: null });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.checkEmailDuplicate("new@example.com")).resolves.not.toThrow();
    });

    it("重複あり: ValidationErrorをスローする", async () => {
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: [{ uid: USER_ID }], error: null });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.checkEmailDuplicate("test@example.com")).rejects.toThrow(
        ValidationError
      );
    });

    it("エラー時: 例外をスローする", async () => {
      const dbError = { message: "Query failed" };
      const builder = createMockQueryBuilder();
      builder.eq.mockResolvedValue({ data: null, error: dbError });
      mockFrom.mockReturnValueOnce(builder);

      await expect(adapter.checkEmailDuplicate("test@example.com")).rejects.toEqual(dbError);
    });
  });

  // --- secureDeleteUserByAdmin ---
  describe("secureDeleteUserByAdmin（管理者によるGDPR準拠削除）", () => {
    it("正常系: 管理者がユーザーを削除できる", async () => {
      // getUserData for admin check
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({
        data: { ...mockUserRow, uid: ADMIN_ID, role: "master" },
        error: null,
      });
      mockFrom.mockReturnValueOnce(builder);

      await adapter.secureDeleteUserByAdmin(USER_ID, STORE_ID, ADMIN_ID);

      expect(PersonalDataDeletion.deleteUserDataByAdmin).toHaveBeenCalledWith(
        USER_ID,
        STORE_ID,
        ADMIN_ID
      );
      expect(SecurityLogger.logEvent).toHaveBeenCalled();
    });

    it("権限なし: 管理者でなければPermissionErrorをスローする", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({
        data: { ...mockUserRow, uid: ADMIN_ID, role: "user" },
        error: null,
      });
      mockFrom.mockReturnValueOnce(builder);

      await expect(
        adapter.secureDeleteUserByAdmin(USER_ID, STORE_ID, ADMIN_ID)
      ).rejects.toThrow(PermissionError);
    });

    it("管理者が見つからない場合: PermissionErrorをスローする", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValueOnce(builder);

      await expect(
        adapter.secureDeleteUserByAdmin(USER_ID, STORE_ID, ADMIN_ID)
      ).rejects.toThrow(PermissionError);
    });

    it("削除失敗時: SecurityLoggerにエラーを記録して例外をスローする", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({
        data: { ...mockUserRow, uid: ADMIN_ID, role: "master" },
        error: null,
      });
      mockFrom.mockReturnValueOnce(builder);
      (PersonalDataDeletion.deleteUserDataByAdmin as jest.Mock).mockRejectedValueOnce(
        new Error("Deletion failed")
      );

      await expect(
        adapter.secureDeleteUserByAdmin(USER_ID, STORE_ID, ADMIN_ID)
      ).rejects.toThrow("Deletion failed");

      expect(SecurityLogger.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.stringContaining("Admin deletion failed"),
        })
      );
    });
  });

  // --- findUserByEmail ---
  describe("findUserByEmail（メールでユーザー検索）", () => {
    it("正常系: emailフィールドで見つかる", async () => {
      // 1回目: from("users").select("*").eq("email", email).limit(1) -> await
      const builder = createMockQueryBuilder();
      builder.limit.mockResolvedValue({ data: [mockUserRow] });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.findUserByEmail("test@example.com");

      expect(result).not.toBeNull();
      expect(result!.uid).toBe(USER_ID);
      expect(result!.email).toBe("test@example.com");
    });

    it("正常系: original_user_idがある場合、元アカウントの情報を返す", async () => {
      const realEmailRow = {
        ...mockUserRow,
        uid: "real-email-user",
        original_user_id: USER_ID,
      };
      const originalRow = {
        ...mockUserRow,
        uid: USER_ID,
        nickname: "元アカウント太郎",
      };
      // 1回目: emailフィールドで検索 -> original_user_idあり
      const b1 = createMockQueryBuilder();
      b1.limit.mockResolvedValue({ data: [realEmailRow] });
      // 2回目: 元アカウント取得
      const b2 = createMockQueryBuilder();
      b2.maybeSingle.mockResolvedValue({ data: originalRow });
      mockFrom.mockReturnValueOnce(b1).mockReturnValueOnce(b2);

      const result = await adapter.findUserByEmail("test@example.com");

      expect(result).not.toBeNull();
      expect(result!.uid).toBe(USER_ID);
      expect(result!.nickname).toBe("元アカウント太郎");
      expect(result!.realEmail).toBe("test@example.com");
    });

    it("正常系: emailで見つからない場合、real_emailで検索する", async () => {
      // 1回目: emailフィールドで検索 -> 見つからない
      const b1 = createMockQueryBuilder();
      b1.limit.mockResolvedValue({ data: [] });
      // 2回目: real_emailフィールドで検索
      const realEmailRow = {
        ...mockUserRow,
        real_email: "real@example.com",
      };
      const b2 = createMockQueryBuilder();
      b2.limit.mockResolvedValue({ data: [realEmailRow] });
      mockFrom.mockReturnValueOnce(b1).mockReturnValueOnce(b2);

      const result = await adapter.findUserByEmail("real@example.com");

      expect(result).not.toBeNull();
      expect(result!.realEmail).toBe("real@example.com");
    });

    it("該当なし: 両方の検索で見つからない場合nullを返す", async () => {
      const b1 = createMockQueryBuilder();
      b1.limit.mockResolvedValue({ data: [] });
      const b2 = createMockQueryBuilder();
      b2.limit.mockResolvedValue({ data: [] });
      mockFrom.mockReturnValueOnce(b1).mockReturnValueOnce(b2);

      const result = await adapter.findUserByEmail("nonexistent@example.com");
      expect(result).toBeNull();
    });
  });

  // --- getUserFullProfile ---
  describe("getUserFullProfile（完全プロフィール取得）", () => {
    it("正常系: ユーザーのフルプロフィールを取得する", async () => {
      const fullProfileRow = {
        uid: USER_ID,
        nickname: "テスト太郎",
        role: "user",
        email: "test@example.com",
        store_id: STORE_ID,
        connected_stores: ["store-002"],
        color: "#FF0000",
        hourly_wage: 1200,
      };
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: fullProfileRow, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUserFullProfile(USER_ID);

      expect(result).not.toBeNull();
      expect(result!.storeId).toBe(STORE_ID);
      expect(result!.connectedStores).toEqual(["store-002"]);
    });

    it("該当なし: nullを返す", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUserFullProfile("nonexistent");
      expect(result).toBeNull();
    });

    it("エラー時: nullを返す", async () => {
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: null, error: { message: "DB error" } });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUserFullProfile(USER_ID);
      expect(result).toBeNull();
    });

    it("正常系: connected_storesがnullの場合空配列を返す", async () => {
      const rowWithoutStores = {
        uid: USER_ID,
        nickname: "テスト太郎",
        role: "user",
        email: "test@example.com",
        store_id: STORE_ID,
        connected_stores: null,
        color: "#FF0000",
        hourly_wage: 1200,
      };
      const builder = createMockQueryBuilder();
      builder.maybeSingle.mockResolvedValue({ data: rowWithoutStores, error: null });
      mockFrom.mockReturnValueOnce(builder);

      const result = await adapter.getUserFullProfile(USER_ID);

      expect(result!.connectedStores).toEqual([]);
    });
  });
});
