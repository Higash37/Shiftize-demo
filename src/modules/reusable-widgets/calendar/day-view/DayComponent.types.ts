import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { DayComponentProps } from "../calendar-types/common.types";

/**
 * DayComponentのProps型定義
 */
export interface DayComponentPropsExtended {
  date?: DayComponentProps["date"];
  state?: DayComponentProps["state"];
  marking?: DayComponentProps["marking"];
  onPress: (dateString: string) => void;
  responsiveSize?: any;
}

/**
 * 動的スタイルの型定義
 */
export interface DynamicStyles {
  dayContainer: ViewStyle;
  selectedDay: ViewStyle;
  dayText: TextStyle;
}
