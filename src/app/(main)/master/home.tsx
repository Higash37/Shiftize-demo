import React from "react";
import HomeCommonScreen from "../../../modules/home-view/home-screens/HomeCommonScreen";
import { MasterHeader } from "@/common/common-ui/ui-layout";

export default function MasterHomeScreen() {
  return (
    <>
      <MasterHeader title="ホーム" />
      <HomeCommonScreen />
    </>
  );
}
