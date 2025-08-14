import React from "react";
import { Redirect } from "expo-router";

export default function Index() {
  // ルートアクセス時はwelcomeページにリダイレクト
  return <Redirect href="/(auth)/auth-welcome" />;
}
