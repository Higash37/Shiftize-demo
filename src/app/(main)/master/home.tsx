/**
 * @file master/home.tsx
 * @description マスター（管理者）のホーム画面。カレンダー付きシフト一覧。
 *
 * MasterHeader + HomeCommonScreen の組み合わせで構成される。
 * MasterHeader はマスター用のヘッダー（ユーザー管理等へのリンクを含む）。
 * HomeCommonScreen はマスター・ユーザー共通のホーム画面コンポーネント。
 */

import React from "react";
import HomeCommonScreen from "../../../modules/home-view/home-screens/HomeCommonScreen";
// MasterHeader: マスター画面専用のヘッダーコンポーネント
import { MasterHeader } from "@/common/common-ui/ui-layout";

/**
 * MasterHomeScreen: マスターのホーム画面。
 */
export default function MasterHomeScreen() {
  return (
    <>
      <MasterHeader title="ホーム" />
      <HomeCommonScreen />
    </>
  );
}
