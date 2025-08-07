import React from "react";
import { Header } from "@/common/common-ui/ui-layout";
import HomeCommonScreen from "../../../modules/home-view/home-screens/HomeCommonScreen";

export const screenOptions = {
  title: "ホーム",
  headerBackVisible: false,
};

export default function UserHomeScreen() {
  return (
    <>
      <Header title="ホーム" />
      <HomeCommonScreen />
    </>
  );
}
