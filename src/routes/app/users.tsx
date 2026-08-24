import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, MoreVertical, Plus, RotateCcw, Search, ShieldAlert, UserCheck, Users, XCircle } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill } from "@/components/bel/primitives";
import { ROLE_LABEL, USERS, type DemoUser } from "@/lib/bel-store";

export const Route = createFileRoute("/app/users")({
  head: () => ({
    meta: [
      { title: "User Management — BEL Digital Trust" },
      { name: "description", content: "Directory of enterprise identities, roles, and account security states." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  return (
    <AppShell>
      <UsersContent />
    </AppShell>
  );
}

function UsersContent() {
  const [usersList, setUsersList] = useState<DemoUser[]>(USERS);
  const [search, setSearch] = useState("");

  const toggleStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "Active" ? "Suspended" : "Active",
              verified: u.status === "Active" ? false : true,
            }
          : u,
      ),
    );
  };

  const filtered = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Enterprise User Management"
        subtitle="Manage employee identity credentials, corporate departments, and session privileges."
        action={
          <button
            onClick={() => alert("Enterprise user provisioning is synchronized via SCIM / Active Directory.")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Provision User
          </button>
        }
      />

      <Panel>
        <div className="flex items-center justify-between gap-4 pb-6 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} employees</span>
        </div>

        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-3 font-semibold">User Name</th>
                <th className="pb-3 font-semibold">Employee ID</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Assigned Role</th>
                <th className="pb-3 font-semibold">Account Status</th>
                <th className="pb-3 font-semibold">Last Active</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-4 font-semibold">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold">
                        {u.name.split(" ").map((p) => p[0]).join("")}
                      </span>
                      <div>
                        <span>{u.name}</span>
                        <span className="block text-[11px] font-normal text-muted-foreground">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs text-muted-foreground">{u.employeeId}</td>
                  <td className="py-4 text-xs">{u.department}</td>
                  <td className="py-4 text-xs font-medium">{ROLE_LABEL[u.role]}</td>
                  <td className="py-4">
                    <Pill tone={u.status === "Active" ? "success" : "danger"}>
                      {u.status}
                    </Pill>
                  </td>
                  <td className="py-4 text-xs text-muted-foreground">{u.lastActive}</td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                        u.status === "Active"
                          ? "bg-danger-soft text-danger border-danger/30 hover:bg-danger hover:text-danger-foreground"
                          : "bg-success-soft text-success border-success/30 hover:bg-success hover:text-success-foreground"
                      }`}
                    >
                      {u.status === "Active" ? (
                        <>
                          <XCircle className="size-3" /> Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3" /> Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => alert(`Password and MFA session reset initiated for ${u.name}.`)}
                      className="inline-flex items-center gap-1 rounded-lg border bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-card transition-colors"
                      title="Reset Access"
                    >
                      <RotateCcw className="size-3" /> Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
