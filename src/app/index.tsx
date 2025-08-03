import { Redirect } from "expo-router";

export default function Index() {
  // 既存ユーザー向けに元の仕様に戻す
  return <Redirect href="/(auth)" />;
}
