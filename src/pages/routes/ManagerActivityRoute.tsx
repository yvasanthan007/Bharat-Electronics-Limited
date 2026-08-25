import { useManagerContext } from '../../hooks/useManagerContext';
import ManagerActivity from '../ManagerActivity';

export default function ManagerActivityRoute() {
  const ctx = useManagerContext();
  return <ManagerActivity activities={ctx.activities} />;
}
