export interface StatCardProps {
  title: string;
  value: number;
}

export interface MasterDashboardViewProps {
  users: any[];
  loading: boolean;
  error: string | null;
}
