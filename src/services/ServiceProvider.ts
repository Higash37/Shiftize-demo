import type { IAuthService } from "./interfaces/IAuthService";
import type { IUserService } from "./interfaces/IUserService";
import type { IShiftService } from "./interfaces/IShiftService";
import type { IStoreService } from "./interfaces/IStoreService";
import type { ISettingsService } from "./interfaces/ISettingsService";
import type { IAuditService } from "./interfaces/IAuditService";

class ServiceProviderImpl {
  private _auth: IAuthService | null = null;
  private _users: IUserService | null = null;
  private _shifts: IShiftService | null = null;
  private _stores: IStoreService | null = null;
  private _settings: ISettingsService | null = null;
  private _audit: IAuditService | null = null;

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
}

export const ServiceProvider = new ServiceProviderImpl();
