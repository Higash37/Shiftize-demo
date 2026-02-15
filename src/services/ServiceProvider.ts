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

  // --- Auth ---
  get auth(): IAuthService {
    if (!this._auth) throw new Error("AuthService not initialized. Call ServiceProvider.setAuthService() first.");
    return this._auth;
  }
  setAuthService(service: IAuthService): void {
    this._auth = service;
  }

  // --- Users ---
  get users(): IUserService {
    if (!this._users) throw new Error("UserService not initialized. Call ServiceProvider.setUserService() first.");
    return this._users;
  }
  setUserService(service: IUserService): void {
    this._users = service;
  }

  // --- Shifts ---
  get shifts(): IShiftService {
    if (!this._shifts) throw new Error("ShiftService not initialized. Call ServiceProvider.setShiftService() first.");
    return this._shifts;
  }
  setShiftService(service: IShiftService): void {
    this._shifts = service;
  }

  // --- Stores ---
  get stores(): IStoreService {
    if (!this._stores) throw new Error("StoreService not initialized. Call ServiceProvider.setStoreService() first.");
    return this._stores;
  }
  setStoreService(service: IStoreService): void {
    this._stores = service;
  }

  // --- Settings ---
  get settings(): ISettingsService {
    if (!this._settings) throw new Error("SettingsService not initialized. Call ServiceProvider.setSettingsService() first.");
    return this._settings;
  }
  setSettingsService(service: ISettingsService): void {
    this._settings = service;
  }

  // --- Audit ---
  get audit(): IAuditService {
    if (!this._audit) throw new Error("AuditService not initialized. Call ServiceProvider.setAuditService() first.");
    return this._audit;
  }
  setAuditService(service: IAuditService): void {
    this._audit = service;
  }

  // --- ShiftConfirmations ---
  get shiftConfirmations(): IShiftConfirmationService {
    if (!this._shiftConfirmations) throw new Error("ShiftConfirmationService not initialized.");
    return this._shiftConfirmations;
  }
  setShiftConfirmationService(service: IShiftConfirmationService): void {
    this._shiftConfirmations = service;
  }

  // --- QuickShiftTokens ---
  get quickShiftTokens(): IQuickShiftTokenService {
    if (!this._quickShiftTokens) throw new Error("QuickShiftTokenService not initialized.");
    return this._quickShiftTokens;
  }
  setQuickShiftTokenService(service: IQuickShiftTokenService): void {
    this._quickShiftTokens = service;
  }

  // --- TeacherStatus ---
  get teacherStatus(): ITeacherStatusService {
    if (!this._teacherStatus) throw new Error("TeacherStatusService not initialized.");
    return this._teacherStatus;
  }
  setTeacherStatusService(service: ITeacherStatusService): void {
    this._teacherStatus = service;
  }

  // --- ShiftSubmissions ---
  get shiftSubmissions(): IShiftSubmissionService {
    if (!this._shiftSubmissions) throw new Error("ShiftSubmissionService not initialized.");
    return this._shiftSubmissions;
  }
  setShiftSubmissionService(service: IShiftSubmissionService): void {
    this._shiftSubmissions = service;
  }

  // --- MultiStore ---
  get multiStore(): IMultiStoreService {
    if (!this._multiStore) throw new Error("MultiStoreService not initialized.");
    return this._multiStore;
  }
  setMultiStoreService(service: IMultiStoreService): void {
    this._multiStore = service;
  }

  // --- GoogleCalendar ---
  get googleCalendar(): IGoogleCalendarService {
    if (!this._googleCalendar) throw new Error("GoogleCalendarService not initialized.");
    return this._googleCalendar;
  }
  setGoogleCalendarService(service: IGoogleCalendarService): void {
    this._googleCalendar = service;
  }
}

export const ServiceProvider = new ServiceProviderImpl();
