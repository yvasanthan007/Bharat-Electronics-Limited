import { useManagerContext } from '../../hooks/useManagerContext';
import ManagerAccessRequests from '../ManagerAccessRequests';

export default function ManagerAccessRequestsRoute() {
  const ctx = useManagerContext();
  return (
    <ManagerAccessRequests
      accessRequests={ctx.accessRequests}
      onApprove={ctx.onApprove}
      onReject={ctx.onReject}
    />
  );
}
