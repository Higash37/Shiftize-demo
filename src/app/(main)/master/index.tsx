import React from "react";
import { useUser } from "@/modules/reusable-widgets/user-management/user-hooks/useUser";
import { MasterDashboardView } from "@/modules/master-view/masterDashboard/MasterDashboardView";

export default function MasterDashboardScreen() {
  const { users, loading, error } = useUser();
  return <MasterDashboardView users={users} loading={loading} error={error} />;
}
