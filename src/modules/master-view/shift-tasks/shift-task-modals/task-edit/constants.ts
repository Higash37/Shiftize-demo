import { TaskType, TaskTag } from "@/common/common-models/model-shift/shiftTypes";
import { TaskTypeOption, TaskTagOption } from "./types";

export const taskTypes: TaskTypeOption[] = [
  {
    value: "standard",
    label: "通常タスク",
    description: "営業時間中いつでも実行可能な一般的な業務タスク",
  },
  {
    value: "time_specific",
    label: "時間指定タスク",
    description:
      "特定の時間帯（例：7:00~9:00, 13:00~16:00）でのみ実行するタスク",
  },
  {
    value: "custom",
    label: "独自設定タスク",
    description:
      "別店舗での作業、休憩、イレギュラー業務など通常業務以外のタスク",
  },
];

export const taskTags: TaskTagOption[] = [
  { value: "limited_time", label: "期間限定" },
  { value: "staff_only", label: "スタッフ限定" },
  { value: "high_priority", label: "高優先度" },
  { value: "training", label: "研修" },
  { value: "event", label: "イベント" },
];