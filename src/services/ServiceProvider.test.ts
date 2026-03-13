/**
 * @file ServiceProvider.test.ts
 * @description ServiceProviderのユニットテスト。
 *   シングルトンパターン・サービス登録・取得・未初期化エラーを検証する。
 */

describe("ServiceProvider", () => {
  // --- シングルトンパターン ---
  describe("シングルトンパターン", () => {
    it("同一のインスタンスが返される", () => {
      // 同じモジュールから2回importしても同じオブジェクト
      const { ServiceProvider: sp1 } = require("./ServiceProvider");
      const { ServiceProvider: sp2 } = require("./ServiceProvider");

      expect(sp1).toBe(sp2);
    });
  });

  // --- サービス未初期化時のエラー ---
  describe("サービス未初期化時のエラー", () => {
    let ServiceProvider: any;

    beforeEach(() => {
      // 各テストで新しいモジュールインスタンスを使用
      jest.isolateModules(() => {
        ServiceProvider = require("./ServiceProvider").ServiceProvider;
      });
    });

    it("auth未設定時: ServiceNotInitializedErrorをスローする", () => {
      expect(() => ServiceProvider.auth).toThrow();
      expect(() => ServiceProvider.auth).toThrow(/AuthService.*not initialized/);
    });

    it("users未設定時: エラーメッセージにサービス名を含む", () => {
      expect(() => ServiceProvider.users).toThrow(/UserService.*not initialized/);
    });

    it("shifts未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.shifts).toThrow(/ShiftService.*not initialized/);
    });

    it("stores未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.stores).toThrow(/StoreService.*not initialized/);
    });

    it("settings未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.settings).toThrow(/SettingsService.*not initialized/);
    });

    it("audit未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.audit).toThrow(/AuditService.*not initialized/);
    });

    it("shiftConfirmations未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.shiftConfirmations).toThrow(/ShiftConfirmationService.*not initialized/);
    });

    it("quickShiftTokens未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.quickShiftTokens).toThrow(/QuickShiftTokenService.*not initialized/);
    });

    it("teacherStatus未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.teacherStatus).toThrow(/TeacherStatusService.*not initialized/);
    });

    it("shiftSubmissions未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.shiftSubmissions).toThrow(/ShiftSubmissionService.*not initialized/);
    });

    it("multiStore未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.multiStore).toThrow(/MultiStoreService.*not initialized/);
    });

    it("googleCalendar未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.googleCalendar).toThrow(/GoogleCalendarService.*not initialized/);
    });

    it("todos未設定時: エラーをスローする", () => {
      expect(() => ServiceProvider.todos).toThrow(/TodoService.*not initialized/);
    });

    it("エラーのnameプロパティがServiceNotInitializedErrorである", () => {
      try {
        ServiceProvider.auth;
        fail("例外がスローされるべき");
      } catch (error: any) {
        expect(error.name).toBe("ServiceNotInitializedError");
        expect(error.code).toBe("SERVICE_NOT_INITIALIZED");
      }
    });
  });

  // --- サービス登録・取得 ---
  describe("サービス登録・取得", () => {
    let ServiceProvider: any;

    beforeEach(() => {
      jest.isolateModules(() => {
        ServiceProvider = require("./ServiceProvider").ServiceProvider;
      });
    });

    it("setAuthService後にauthを取得できる", () => {
      const mockAuth = { signIn: jest.fn() };
      ServiceProvider.setAuthService(mockAuth);

      expect(ServiceProvider.auth).toBe(mockAuth);
    });

    it("setUserService後にusersを取得できる", () => {
      const mockUsers = { getUsers: jest.fn() };
      ServiceProvider.setUserService(mockUsers);

      expect(ServiceProvider.users).toBe(mockUsers);
    });

    it("setShiftService後にshiftsを取得できる", () => {
      const mockShifts = { getShifts: jest.fn() };
      ServiceProvider.setShiftService(mockShifts);

      expect(ServiceProvider.shifts).toBe(mockShifts);
    });

    it("setStoreService後にstoresを取得できる", () => {
      const mockStores = { getStore: jest.fn() };
      ServiceProvider.setStoreService(mockStores);

      expect(ServiceProvider.stores).toBe(mockStores);
    });

    it("setSettingsService後にsettingsを取得できる", () => {
      const mockSettings = { getSettings: jest.fn() };
      ServiceProvider.setSettingsService(mockSettings);

      expect(ServiceProvider.settings).toBe(mockSettings);
    });

    it("setAuditService後にauditを取得できる", () => {
      const mockAudit = { getAuditLogs: jest.fn() };
      ServiceProvider.setAuditService(mockAudit);

      expect(ServiceProvider.audit).toBe(mockAudit);
    });

    it("setShiftConfirmationService後にshiftConfirmationsを取得できる", () => {
      const mockConf = { confirm: jest.fn() };
      ServiceProvider.setShiftConfirmationService(mockConf);

      expect(ServiceProvider.shiftConfirmations).toBe(mockConf);
    });

    it("setQuickShiftTokenService後にquickShiftTokensを取得できる", () => {
      const mockTokens = { validateToken: jest.fn() };
      ServiceProvider.setQuickShiftTokenService(mockTokens);

      expect(ServiceProvider.quickShiftTokens).toBe(mockTokens);
    });

    it("setTeacherStatusService後にteacherStatusを取得できる", () => {
      const mockStatus = { getStatus: jest.fn() };
      ServiceProvider.setTeacherStatusService(mockStatus);

      expect(ServiceProvider.teacherStatus).toBe(mockStatus);
    });

    it("setShiftSubmissionService後にshiftSubmissionsを取得できる", () => {
      const mockSub = { submit: jest.fn() };
      ServiceProvider.setShiftSubmissionService(mockSub);

      expect(ServiceProvider.shiftSubmissions).toBe(mockSub);
    });

    it("setMultiStoreService後にmultiStoreを取得できる", () => {
      const mockMulti = { getStores: jest.fn() };
      ServiceProvider.setMultiStoreService(mockMulti);

      expect(ServiceProvider.multiStore).toBe(mockMulti);
    });

    it("setGoogleCalendarService後にgoogleCalendarを取得できる", () => {
      const mockCal = { syncShiftToCalendar: jest.fn() };
      ServiceProvider.setGoogleCalendarService(mockCal);

      expect(ServiceProvider.googleCalendar).toBe(mockCal);
    });

    it("setTodoService後にtodosを取得できる", () => {
      const mockTodos = { getTodos: jest.fn() };
      ServiceProvider.setTodoService(mockTodos);

      expect(ServiceProvider.todos).toBe(mockTodos);
    });
  });

  // --- サービス上書き ---
  describe("サービス上書き", () => {
    let ServiceProvider: any;

    beforeEach(() => {
      jest.isolateModules(() => {
        ServiceProvider = require("./ServiceProvider").ServiceProvider;
      });
    });

    it("サービスを上書き登録できる（テスト用モック差し替え）", () => {
      const mockAuth1 = { signIn: jest.fn().mockReturnValue("v1") };
      const mockAuth2 = { signIn: jest.fn().mockReturnValue("v2") };

      ServiceProvider.setAuthService(mockAuth1);
      expect(ServiceProvider.auth).toBe(mockAuth1);

      ServiceProvider.setAuthService(mockAuth2);
      expect(ServiceProvider.auth).toBe(mockAuth2);
    });
  });
});
