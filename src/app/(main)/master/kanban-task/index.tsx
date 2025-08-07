import React from "react";
import { KanbanTaskView } from "../../../../modules/master-view/kanban-task/KanbanTaskView";

export default function KanbanTaskScreen() {
  return <KanbanTaskView />;
}

export const screenOptions = {
  title: "タスク管理",
};
