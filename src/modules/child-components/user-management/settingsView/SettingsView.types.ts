export interface SettingsViewProps {
  user: {
    uid: string;
    role: string;
    nickname: string;
  } | null;
  role: string;
  onLogout: () => void;
  onUserManage?: () => void;
}
