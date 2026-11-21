export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string; // ← add this if missing
  caseInfoId?: number;
  isRead: boolean;
  createdAt: string;
}
