import type { IAuthService } from "./interfaces/IAuthService";
import type { IUserService } from "./interfaces/IUserService";
import type { IShiftService } from "./interfaces/IShiftService";
import type { IStoreService } from "./interfaces/IStoreService";
import type { ISettingsService } from "./interfaces/ISettingsService";
import type { IAuditService } from "./interfaces/IAuditService";
import type { IShiftConfirmationService } from "./interfaces/IShiftConfirmationService";
import type { IQuickShiftTokenService } from "./interfaces/IQuickShiftTokenService";
import type { ITeacherStatusService } from "./interfaces/ITeacherStatusService";
import type { IShiftSubmissionService } from "./interfaces/IShiftSubmissionService";
import type { IMultiStoreService } from "./interfaces/IMultiStoreService";
import type { IGoogleCalendarService } from "./interfaces/IGoogleCalendarService";
import type { ITodoService } from "./interfaces/ITodoService";
import { ServiceNotInitializedError } from "@/common/common-errors/AppErrors";

function requireService<T>(service: T | null, name: string): T {
  if (!service) throw new ServiceNotInitializedError(name);
  return service;
}

class ServiceProviderImpl {
  private _auth: IAuthService | null = null;
  private _users: IUserService | null = null;
  private _shifts: IShiftService | null = null;
  private _stores: IStoreService | null = null;
  private _settings: ISettingsService | null = null;
  private _audit: IAuditService | null = null;
  private _shiftConfirmations: IShiftConfirmationService | null = null;
  private _quickShiftTokens: IQuickShiftTokenService | null = null;
  private _teacherStatus: ITeacherStatusService | null = null;
  private _shiftSubmissions: IShiftSubmissionService | null = null;
  private _multiStore: IMultiStoreService | null = null;
  private _googleCalendar: IGoogleCalendarService | null = null;
  private _todos: ITodoService | null = null;

  get auth(): IAuthService { return requireService(this._auth, "AuthService"); }
  setAuthService(service: IAuthService): void { this._auth = service; }

  get users(): IUserService { return requireService(this._users, "UserService"); }
  setUserService(service: IUserService): void { this._users = service; }

  get shifts(): IShiftService { return requireService(this._shifts, "ShiftService"); }
  setShiftService(service: IShiftService): void { this._shifts = service; }

  get stores(): IStoreService { return requireService(this._stores, "StoreService"); }
  setStoreService(service: IStoreService): void { this._stores = service; }

  get settings(): ISettingsService { return requireService(this._settings, "SettingsService"); }
  setSettingsService(service: ISettingsService): void { this._settings = service; }

  get audit(): IAuditService { return requireService(this._audit, "AuditService"); }
  setAuditService(service: IAuditService): void { this._audit = service; }

  get shiftConfirmations(): IShiftConfirmationService { return requireService(this._shiftConfirmations, "ShiftConfirmationService"); }
  setShiftConfirmationService(service: IShiftConfirmationService): void { this._shiftConfirmations = service; }

  get quickShiftTokens(): IQuickShiftTokenService { return requireService(this._quickShiftTokens, "QuickShiftTokenService"); }
  setQuickShiftTokenService(service: IQuickShiftTokenService): void { this._quickShiftTokens = service; }

  get teacherStatus(): ITeacherStatusService { return requireService(this._teacherStatus, "TeacherStatusService"); }
  setTeacherStatusService(service: ITeacherStatusService): void { this._teacherStatus = service; }

  get shiftSubmissions(): IShiftSubmissionService { return requireService(this._shiftSubmissions, "ShiftSubmissionService"); }
  setShiftSubmissionService(service: IShiftSubmissionService): void { this._shiftSubmissions = service; }

  get multiStore(): IMultiStoreService { return requireService(this._multiStore, "MultiStoreService"); }
  setMultiStoreService(service: IMultiStoreService): void { this._multiStore = service; }

  get googleCalendar(): IGoogleCalendarService { return requireService(this._googleCalendar, "GoogleCalendarService"); }
  setGoogleCalendarService(service: IGoogleCalendarService): void { this._googleCalendar = service; }

  get todos(): ITodoService { return requireService(this._todos, "TodoService"); }
  setTodoService(service: ITodoService): void { this._todos = service; }
}

export const ServiceProvider = new ServiceProviderImpl();
