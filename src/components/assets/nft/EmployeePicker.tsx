import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  getAllEmployeesFromFirestore,
  type FirestoreEmployee,
} from '../../../services/firebaseEmployeeService';
import { shortAddress } from '../../../config/blockchain';

/**
 * Employee picker for NFT assignment/transfer.
 *
 * Reads the EXISTING `employees` Firestore collection (no duplicate employee
 * database) and offers every employee whose record carries a registered
 * wallet address. The selected wallet is the DID-linked wallet from that
 * record — the same wallet the challenge/signature login verifies against.
 */

export interface EmployeeOption {
  employeeId: string;
  name: string;
  did?: string;
  walletAddress: string;
}

function toEmployeeOption(emp: FirestoreEmployee): EmployeeOption | null {
  const raw = (emp.walletAddress || emp.walletId || '').trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(raw)) return null;
  return {
    employeeId: emp.employeeId,
    name: emp.name || emp.employeeName || emp.employeeId,
    did: emp.did || undefined,
    walletAddress: ethers.getAddress(raw),
  };
}

export function useEmployeesWithWallets() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await getAllEmployeesFromFirestore();
        const options = all
          .map(toEmployeeOption)
          .filter((e): e is EmployeeOption => e !== null)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (mounted) setEmployees(options);
      } catch (err) {
        console.warn('[EmployeePicker] employee lookup failed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { employees, loading };
}

interface EmployeePickerProps {
  value: EmployeeOption | null;
  onChange: (employee: EmployeeOption | null) => void;
  disabled?: boolean;
  employees: EmployeeOption[];
  loading: boolean;
}

export default function EmployeePicker({
  value,
  onChange,
  disabled,
  employees,
  loading,
}: EmployeePickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">Assign to employee</label>
      <select
        value={value?.employeeId ?? ''}
        disabled={disabled || loading}
        onChange={(e) => {
          const next = employees.find((emp) => emp.employeeId === e.target.value) || null;
          onChange(next);
        }}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">
          {loading ? 'Loading employees from Firestore…' : 'Select an employee…'}
        </option>
        {employees.map((emp) => (
          <option key={emp.employeeId} value={emp.employeeId}>
            {emp.name} ({emp.employeeId}) · {shortAddress(emp.walletAddress)}
          </option>
        ))}
      </select>
      {!loading && employees.length === 0 && (
        <p className="text-xs text-amber-600">
          No employees with a registered wallet address were found in Firestore. Provision DID
          wallets first (scripts/provision-did.mjs).
        </p>
      )}
      {value && (
        <div className="text-xs text-slate-500 space-y-0.5 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
          <p>
            <span className="font-semibold text-slate-600">Wallet:</span>{' '}
            <span className="font-mono">{value.walletAddress}</span>
          </p>
          <p>
            <span className="font-semibold text-slate-600">DID:</span>{' '}
            <span className="font-mono break-all">{value.did || '⚠️ not linked yet'}</span>
          </p>
        </div>
      )}
    </div>
  );
}
