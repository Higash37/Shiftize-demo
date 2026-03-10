/**
 * @file master/settings.tsx
 * @description マスター用設定画面。アプリの各種設定を管理する。
 *
 * SettingsView コンポーネントに全ての設定UIとロジックを委譲する。
 */

import React from "react";
// SettingsView: 設定画面のUIコンポーネント
import { SettingsView } from "@/modules/master-view/settingsView/SettingsView";

/**
 * MasterSettingsScreen: 設定画面。
 */
export default function MasterSettingsScreen() {
  return <SettingsView />;
}
