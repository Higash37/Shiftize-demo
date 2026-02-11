import { ServiceProvider } from "./ServiceProvider";

// Supabase adapters
import { SupabaseAuthAdapter } from "./supabase/SupabaseAuthAdapter";
import { SupabaseUserAdapter } from "./supabase/SupabaseUserAdapter";
import { SupabaseShiftAdapter } from "./supabase/SupabaseShiftAdapter";
import { SupabaseStoreAdapter } from "./supabase/SupabaseStoreAdapter";
import { SupabaseSettingsAdapter } from "./supabase/SupabaseSettingsAdapter";
import { SupabaseAuditAdapter } from "./supabase/SupabaseAuditAdapter";
import { SupabaseShiftConfirmationAdapter } from "./supabase/SupabaseShiftConfirmationAdapter";
import { SupabaseQuickShiftTokenAdapter } from "./supabase/SupabaseQuickShiftTokenAdapter";
import { SupabaseTeacherStatusAdapter } from "./supabase/SupabaseTeacherStatusAdapter";
import { SupabaseShiftSubmissionAdapter } from "./supabase/SupabaseShiftSubmissionAdapter";
import { SupabaseRecruitmentShiftAdapter } from "./supabase/SupabaseRecruitmentShiftAdapter";
import { SupabaseMultiStoreAdapter } from "./supabase/SupabaseMultiStoreAdapter";
import { GoogleCalendarSyncService } from "./google-calendar/GoogleCalendarSyncService";

let initialized = false;

export function initializeServices(): void {
  if (initialized) return;

  ServiceProvider.setAuthService(new SupabaseAuthAdapter());
  ServiceProvider.setUserService(new SupabaseUserAdapter());
  ServiceProvider.setShiftService(new SupabaseShiftAdapter());
  ServiceProvider.setStoreService(new SupabaseStoreAdapter());
  ServiceProvider.setSettingsService(new SupabaseSettingsAdapter());
  ServiceProvider.setAuditService(new SupabaseAuditAdapter());
  ServiceProvider.setShiftConfirmationService(new SupabaseShiftConfirmationAdapter());
  ServiceProvider.setQuickShiftTokenService(new SupabaseQuickShiftTokenAdapter());
  ServiceProvider.setTeacherStatusService(new SupabaseTeacherStatusAdapter());
  ServiceProvider.setShiftSubmissionService(new SupabaseShiftSubmissionAdapter());
  ServiceProvider.setRecruitmentShiftService(new SupabaseRecruitmentShiftAdapter());
  ServiceProvider.setMultiStoreService(new SupabaseMultiStoreAdapter());
  ServiceProvider.setGoogleCalendarService(new GoogleCalendarSyncService());

  initialized = true;
}
