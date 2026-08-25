import { useManagerContext } from '../../hooks/useManagerContext';
import ManagerDashboard from '../ManagerDashboard';

export default function ManagerDashboardRoute() {
  const ctx = useManagerContext();
  return (
    <ManagerDashboard
      accessRequests={ctx.accessRequests}
      activities={ctx.activities}
      teamMembers={ctx.teamMembers}
      teamAssets={ctx.teamAssets}
      onApprove={ctx.onApprove}
      onReject={ctx.onReject}
      onExport={ctx.onExport}
    />
  );
}
