"use client";

import * as React from "react";
import { Phone, CheckCircle2, Inbox } from "lucide-react";

export function AdminPhoneNumbersClient({ initialNumbers, vomyraNumbers }: { initialNumbers: any[], vomyraNumbers: any[] }) {
  const [numbers] = React.useState(initialNumbers);

  const assignedNumbers = numbers.filter(n => n.workspace_id !== null);
  const unassignedDbNumbers = numbers.filter(n => n.workspace_id === null);

  // Compute how many Vomyra numbers are completely free (not in our DB)
  const allDbPhones = new Set(numbers.map(n => n.phone_number));
  const trulyAvailableVomyra = vomyraNumbers.filter(n => {
    const clean = String(n.phone_number || n.number).trim();
    return !allDbPhones.has(clean);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow text-neutral-500">// ADMIN PANEL</p>
          <h1 className="text-3xl font-bold tracking-tight text-black mt-1">Phone Numbers Inventory</h1>
          <p className="text-sm text-neutral-600">Track all assigned numbers and monitor the available Vomyra pool.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Numbers */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Assigned to Workspaces ({assignedNumbers.length})
          </h2>
          {assignedNumbers.length === 0 ? (
            <div className="p-8 border border-hairline rounded-[10px] text-center text-sm text-neutral-500 bg-surface-soft">
              No numbers currently assigned to any workspace.
            </div>
          ) : (
            <div className="space-y-3">
              {assignedNumbers.map(n => (
                <div key={n.id} className="p-4 border border-hairline rounded-[10px] bg-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black font-mono">{n.phone_number}</h3>
                      <p className="text-xs text-neutral-500">{n.workspaces?.name || n.workspace_id}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Pool */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-500" />
            Available in Pool ({trulyAvailableVomyra.length + unassignedDbNumbers.length})
          </h2>
          
          <div className="space-y-3">
            {unassignedDbNumbers.map(n => (
              <div key={n.id} className="p-3 border border-hairline rounded-[10px] bg-white flex items-center justify-between opacity-80">
                <span className="font-mono text-sm font-semibold">{n.phone_number}</span>
                <span className="text-xs text-neutral-500">Local Pool</span>
              </div>
            ))}
            
            {trulyAvailableVomyra.map((n: any, idx: number) => {
              const num = String(n.phone_number || n.number).trim();
              return (
                <div key={idx} className="p-3 border border-hairline rounded-[10px] bg-white flex items-center justify-between opacity-80">
                  <span className="font-mono text-sm font-semibold">{num}</span>
                  <span className="text-xs text-indigo-500 font-medium">Vomyra Pool</span>
                </div>
              );
            })}

            {unassignedDbNumbers.length === 0 && trulyAvailableVomyra.length === 0 && (
              <div className="p-8 border border-hairline rounded-[10px] text-center text-sm text-neutral-500 bg-surface-soft">
                No numbers available in the pool.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
