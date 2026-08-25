import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from '../components/ManagerSidebar';
import ManagerHeader from '../components/ManagerHeader';
import ConfirmModal from '../components/ConfirmModal';
import { useAccessRequests } from '../hooks/useAccessRequests';
import { useTeam } from '../hooks/useTeam';
import { useAssets } from '../hooks/useAssets';
import { useActivities } from '../hooks/useActivities';
import { useNotifications } from '../hooks/useNotifications';


interface ManagerLayoutProps {
  onLogout: () => void;
}

export default function ManagerLayout({ onLogout }: ManagerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Reject confirmation modal
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; requestId: string | null }>({
    isOpen: false,
    requestId: null,
  });

  const { requests: accessRequests, updateRequestStatus } = useAccessRequests();
  const { teamMembers } = useTeam();
  const { assets: teamAssets } = useAssets();
  const { activities } = useActivities();
  const { notifications, markAsRead } = useNotifications();

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const logAudit = (action: string, resource: string, category: string, status: string) => {
    console.log(`[Audit] ${action} | ${resource} | ${category} | ${status}`);
  };

  const handleApprove = useCallback(async (id: string) => {
    const request = accessRequests.find((r: any) => r.id === id);
    if (!request) return;

    const res = await updateRequestStatus(id, 'Approved');
    if (res.error) {
      showToast('Failed to approve request', 'error');
    } else {
      showToast('Access request approved successfully');
      const reqName = typeof request.requester === 'string' ? request.requester : request.requester?.full_name;
      logAudit('approved access for', `${reqName} → ${request.resource}`, 'Access', 'success');
    }
  }, [accessRequests, updateRequestStatus, showToast]);

  const handleRejectClick = useCallback((id: string) => {
    setRejectModal({ isOpen: true, requestId: id });
  }, []);

  const handleRejectConfirm = useCallback(async () => {
    if (rejectModal.requestId) {
      const request = accessRequests.find((r: any) => r.id === rejectModal.requestId);
      const res = await updateRequestStatus(rejectModal.requestId, 'Rejected');
      
      if (res.error) {
        showToast('Failed to reject request', 'error');
      } else {
        showToast('Access request rejected');
        if (request) {
          const reqName = typeof request.requester === 'string' ? request.requester : request.requester?.full_name;
          logAudit('rejected access for', `${reqName} → ${request.resource}`, 'Access', 'error');
        }
      }
    }
    setRejectModal({ isOpen: false, requestId: null });
  }, [rejectModal.requestId, accessRequests, updateRequestStatus, showToast]);

  const handleExport = useCallback(() => {
    // Basic CSV export
    const csvHeader = 'Employee Name,Email,Department,Access Status,Created At\n';
    const csvRows = teamMembers
      .map((m: any) => `${m.employee?.full_name},${m.employee?.email},${m.employee?.department},${m.access_status},${m.created_at}`)
      .join('\n');
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BEL-manager-team-report.csv';
    a.click();
    URL.revokeObjectURL(url);

    logAudit('exported', 'Team Report (CSV)', 'Team', 'success');
    showToast('Report exported successfully');
  }, [teamMembers, showToast]);

  const handleMarkNotificationRead = useCallback(async (id: string) => {
    await markAsRead(id);
  }, [markAsRead]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <ManagerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ManagerHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet
            context={{
              accessRequests,
              teamMembers,
              teamAssets,
              activities,
              notifications,
              onApprove: handleApprove,
              onReject: handleRejectClick,
              onExport: handleExport,
              onMarkNotificationRead: handleMarkNotificationRead,
            }}
          />
        </main>
      </div>

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={rejectModal.isOpen}
        title="Reject Access Request"
        message="Reject this access request? This action cannot be undone."
        confirmLabel="Reject Request"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectModal({ isOpen: false, requestId: null })}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[200] px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-4 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
