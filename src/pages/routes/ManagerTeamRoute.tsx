import { useManagerContext } from '../../hooks/useManagerContext';
import ManagerTeam from '../ManagerTeam';

export default function ManagerTeamRoute() {
  const ctx = useManagerContext();
  return <ManagerTeam teamMembers={ctx.teamMembers} />;
}
