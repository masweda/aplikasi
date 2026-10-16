import React, { useMemo, useState } from 'react';
import {
  Activity,
  Download,
  Filter,
  History,
  Lock,
  RotateCcw,
  Search,
  Shield,
  User,
} from 'lucide-react';
import { exportAuditLogsCSV } from '../services/exportService';
import { AuditLog, User as UserType } from '../types';

interface AuditLogViewProps {
  logs: AuditLog[];
  currentUser: UserType;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = log.username.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesEntity = log.entity.toLowerCase().includes(q);
        if (!matchesUser && !matchesDetails && !matchesEntity) return false;
      }

      if (filterAction !== 'all' && log.action !== filterAction) {
        return false;
      }

      return true;
    });
  }, [logs, searchQuery, filterAction]);

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Audit Log Aktivitas Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rekam jejak digital kepatuhan keamanan dan riwayat manipulasi data
          </p>
        </div>

        <button
          onClick={() => exportAuditLogsCSV(filteredLogs, currentUser)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Log (.csv)</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama petugas, aktivitas, atau rincian..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Tipe Aksi</option>
              <option value="TAMBAH">TAMBAH (Input Data)</option>
              <option value="EDIT">EDIT (Perubahan Data)</option>
              <option value="HAPUS">HAPUS (Penghapusan Data)</option>
              <option value="LOGIN">LOGIN (Otentikasi)</option>
              <option value="EXPORT_EXCEL">EXPORT EXCEL</option>
              <option value="EXPORT_CSV">EXPORT CSV</option>
              <option value="BACKUP_DB">BACKUP DATABASE</option>
              <option value="RESTORE_DB">RESTORE DATABASE</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong className="text-slate-800 tabular-nums">{filteredLogs.length}</strong> log
          </span>
          {(searchQuery || filterAction !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterAction('all');
              }}
              className="text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Waktu (Timestamp)</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Entitas</th>
                <th className="py-3 px-4">Keterangan Aktivitas</th>
                <th className="py-3 px-4 text-right">Alamat IP / Sesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                let badgeColor = 'bg-slate-100 text-slate-800';
                if (log.action === 'TAMBAH') badgeColor = 'bg-emerald-100 text-emerald-800';
                else if (log.action === 'EDIT') badgeColor = 'bg-blue-100 text-blue-800';
                else if (log.action === 'HAPUS') badgeColor = 'bg-rose-100 text-rose-800';
                else if (log.action === 'LOGIN') badgeColor = 'bg-teal-100 text-teal-800';
                else if (log.action.includes('EXPORT')) badgeColor = 'bg-indigo-100 text-indigo-800';
                else if (log.action.includes('DB')) badgeColor = 'bg-purple-100 text-purple-800';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 tabular-nums whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {log.username}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {log.entity} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 font-medium max-w-md">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {log.ip_address}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
