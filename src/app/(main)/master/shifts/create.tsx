/**
 * @file master/shifts/create.tsx
 * @description マスター用シフト作成/編集画面。
 *
 * URLパラメータからモード（create/edit）と初期値を取得し、
 * MasterShiftCreateView に渡す。
 *
 * ユーザーの shifts/create.tsx と同様の構造だが、
 * マスター専用のシフト作成フォーム（MasterShiftCreateView）を使用する。
 * マスター版では担当者の選択機能等が追加されている。
 */

import React from "react";
// useLocalSearchParams: URLクエリパラメータを取得するフック
import { useLocalSearchParams } from "expo-router";
// MasterShiftCreateView: マスター用シフト作成/編集UIコンポーネント
import { MasterShiftCreateView } from "@/modules/master-view/master-shift-create-view";

/**
 * MasterShiftCreateScreen: マスターのシフト作成/編集画面。
 */
export default function MasterShiftCreateScreen() {
  // URLパラメータをデストラクチャリングで取得
  const { mode, shiftId, date, startTime, endTime, classes } =
    useLocalSearchParams();
  return (
    <MasterShiftCreateView
      // 三項演算子でモードを判定: "edit" なら編集、それ以外は新規作成
      mode={(mode as string) === "edit" ? "edit" : "create"}
      shiftId={shiftId as string}
      date={date as string}
      startTime={startTime as string}
      endTime={endTime as string}
      classes={classes as string}
    />
  );
}
