/**
 * @file auth-create-group/success.tsx
 * @description グループ作成成功画面のルートファイル。
 *
 * グループ（店舗）の作成が完了した後に表示される画面。
 * 実際のコンポーネントは modules/create-group-module/CreateGroupSuccessScreen.tsx に実装。
 *
 * 【Expo Router のファイル名ルーティング】
 * ファイル名 success.tsx → URL /(auth)/auth-create-group/success に対応する。
 * index.tsx は "/" 、それ以外のファイル名はそのままパスになる。
 */

export { CreateGroupSuccessScreen as default } from "@/modules/create-group-module/CreateGroupSuccessScreen";
