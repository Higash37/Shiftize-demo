import { ServiceProvider } from "./ServiceProvider";
import { FirebaseAuthAdapter } from "./firebase/FirebaseAuthAdapter";
import { FirebaseUserAdapter } from "./firebase/FirebaseUserAdapter";
import { FirebaseShiftAdapter } from "./firebase/FirebaseShiftAdapter";
import { FirebaseStoreAdapter } from "./firebase/FirebaseStoreAdapter";
import { FirebaseSettingsAdapter } from "./firebase/FirebaseSettingsAdapter";
import { FirebaseAuditAdapter } from "./firebase/FirebaseAuditAdapter";

// Supabase adapters
import { SupabaseAuthAdapter } from "./supabase/SupabaseAuthAdapter";
import { SupabaseUserAdapter } from "./supabase/SupabaseUserAdapter";
import { SupabaseShiftAdapter } from "./supabase/SupabaseShiftAdapter";
import { SupabaseStoreAdapter } from "./supabase/SupabaseStoreAdapter";
import { SupabaseSettingsAdapter } from "./supabase/SupabaseSettingsAdapter";
import { SupabaseAuditAdapter } from "./supabase/SupabaseAuditAdapter";

const USE_SUPABASE = process.env['EXPO_PUBLIC_USE_SUPABASE'] === 'true';

let initialized = false;

export function initializeServices(): void {
  if (initialized) return;

  if (USE_SUPABASE) {
    // Supabase adapters (Firebase Auth + Supabase DB)
    ServiceProvider.setAuthService(new SupabaseAuthAdapter());
    ServiceProvider.setUserService(new SupabaseUserAdapter());
    ServiceProvider.setShiftService(new SupabaseShiftAdapter());
    ServiceProvider.setStoreService(new SupabaseStoreAdapter());
    ServiceProvider.setSettingsService(new SupabaseSettingsAdapter());
    ServiceProvider.setAuditService(new SupabaseAuditAdapter());
  } else {
    // Firebase adapters (default)
    ServiceProvider.setAuthService(new FirebaseAuthAdapter());
    ServiceProvider.setUserService(new FirebaseUserAdapter());
    ServiceProvider.setShiftService(new FirebaseShiftAdapter());
    ServiceProvider.setStoreService(new FirebaseStoreAdapter());
    ServiceProvider.setSettingsService(new FirebaseSettingsAdapter());
    ServiceProvider.setAuditService(new FirebaseAuditAdapter());
  }

  initialized = true;
}
