import { useOutletContext } from 'react-router-dom';
import type { AccessRequest, TeamMember, TeamAsset, ActivityItem, Notification } from '../data/managerMockData';

export interface ManagerOutletContext {
  accessRequests: AccessRequest[];
  teamMembers: TeamMember[];
  teamAssets: TeamAsset[];
  activities: ActivityItem[];
  notifications: Notification[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onExport: () => void;
  onMarkNotificationRead: (id: string) => void;
}

export function useManagerContext() {
  return useOutletContext<ManagerOutletContext>();
}
