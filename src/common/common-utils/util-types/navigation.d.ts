import { NavigatorScreenParams } from "@react-navigation/native";

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      OnboardingScreen: undefined;
      LoginScreen: undefined;
      GanttChartMonthView: undefined;
      // 他の画面を追加する場合はここに記述
    }
  }
}
