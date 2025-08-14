import React from "react";
import { Redirect } from "expo-router";

export default function AuthIndex() {
  // オンボーディング判定をスキップし、常にウェルカム画面へリダイレクト
  return <Redirect href="/(auth)/auth-welcome" />;
}
