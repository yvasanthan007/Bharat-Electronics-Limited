import { useManagerContext } from '../../hooks/useManagerContext';
import ManagerAssets from '../ManagerAssets';

export default function ManagerAssetsRoute() {
  const ctx = useManagerContext();
  return <ManagerAssets teamAssets={ctx.teamAssets} />;
}
