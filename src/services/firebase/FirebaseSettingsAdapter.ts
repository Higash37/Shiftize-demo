import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase-core";
import type { ISettingsService } from "../interfaces/ISettingsService";
import type { AppSettings } from "@/common/common-utils/util-settings/useAppSettings";

export class FirebaseSettingsAdapter implements ISettingsService {
  async getSettings(): Promise<AppSettings | null> {
    const settingsRef = doc(db, "settings", "shiftApp");
    const snapshot = await getDoc(settingsRef);
    if (snapshot.exists()) {
      return snapshot.data() as AppSettings;
    }
    return null;
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const settingsRef = doc(db, "settings", "shiftApp");
    await setDoc(settingsRef, settings, { merge: true });
  }

  async resetSettings(defaults: AppSettings): Promise<void> {
    const settingsRef = doc(db, "settings", "shiftApp");
    await setDoc(settingsRef, defaults);
  }

  onSettingsChanged(callback: (settings: AppSettings | null) => void): () => void {
    const settingsRef = doc(db, "settings", "shiftApp");
    return onSnapshot(
      settingsRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          callback(docSnapshot.data() as AppSettings);
        } else {
          callback(null);
        }
      },
      (error) => {
        if (error.code === "permission-denied") {
          return;
        }
        console.error("Settings listener error:", error.message);
      }
    );
  }
}
