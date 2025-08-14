import React from "react";
import { KanbanTaskView } from "../../../../modules/master-view/master-kanban-task/KanbanTaskView";

export default function KanbanTaskScreen() {
  return <KanbanTaskView />;
}

export const screenOptions = {
  title: "タスク管理",
};
