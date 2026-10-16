import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Baby,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Eye,
  Filter,
  Heart,
  HelpCircle,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { UnifiedPendampingan } from '../types';
import { PendampinganProgressBar } from './PendampinganProgressBar';

export interface ReminderItem {
  id: string;
  record: UnifiedPendampingan;
  nama: string;
  jenisSasaran: 'CATIN' | 'BUFAS' | 'IBU_HAMIL';
  kemantren: string;
  kelurahanNama: string;
  noHp: string;
  dueDate: string; // YYYY-MM-DD
  daysRemaining: number;
  urgency: 'overdue' | 'critical' | 'upcoming' | 'planned';
  title: string;
  reason: string;
  category: 'HTP' | 'RUJUKAN' | 'RISIKO' | 'NIFAS' | 'TERJADWAL';
  statusKunjungan: string;
  petugasNama: string;
}

interface DashboardRemindersWidgetProps {
  data: UnifiedPendampingan[];
  selectedKemantren?: string;
  selectedKelurahan?: string;
  onOpenDetailModal?: (record: UnifiedPendampingan) => void;
  onOpenCreateModal: () => void;
  onNavigateToPendataan: (filterSasaran?: string) => void;
}

export const DashboardRemindersWidget: React.FC<DashboardRemindersWidgetProps> = ({
  data,
  selectedKemantren = 'all',
  selectedKelurahan = 'all',
  onOpenDetailModal,
  onOpenCreateModal,
  onNavigateToPendataan,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'htp' | 'rujukan' | 'risiko' | 'nifas'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('tpk_dismissed_reminders_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Calculate reference date (Anchor to October 2026 based on seed dates, or system date if newer)
  const referenceDate = useMemo(() => {
    // Check latest record date to keep reminders relative and lively
    const dates = data.map(d => d.tanggal).filter(Boolean);
    if (dates.length > 0) {
      dates.sort();
      const latest = dates[dates.length - 1];
      // Use the latest record date as baseline anchor
      return new Date(latest);
    }
    return new Date('2026-10-06');
  }, [data]);

  // Compute all reminders
  const allReminders = useMemo(() => {
    const list: ReminderItem[] = [];

    data.forEach(rec => {
      // 1. Explicit scheduled next visit (jadwal_berikutnya)
      if (rec.jadwal_berikutnya) {
        const due = new Date(rec.jadwal_berikutnya);
        const diffDays = Math.round((due.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24));
        
        let urgency: 'overdue' | 'critical' | 'upcoming' | 'planned' = 'planned';
        if (diffDays < 0) urgency = 'overdue';
        else if (diffDays <= 3) urgency = 'critical';
        else if (diffDays <= 7) urgency = 'upcoming';

        let cat: 'HTP' | 'RUJUKAN' | 'RISIKO' | 'NIFAS' | 'TERJADWAL' = 'TERJADWAL';
        let reason = rec.catatan_kunjungan 
          ? `Tindak lanjut kunjungan: "${rec.catatan_kunjungan.substring(0, 80)}${rec.catatan_kunjungan.length > 80 ? '...' : ''}"`
          : 'Kunjungan ulang pendampingan terjadwal oleh Petugas TPK.';

        if (rec.status_kunjungan === 'Perlu Rujukan') {
          cat = 'RUJUKAN';
          reason = 'Tindak lanjut rujukan faskes Puskesmas dan konfirmasi hasil pemeriksaan dokter/bidan.';
        } else if (rec.is_risiko_stunting) {
          cat = 'RISIKO';
          reason = `Evaluasi berkala sasaran berisiko stunting (${rec.is_kek ? 'LiLA KEK' : ''}${rec.is_kek && rec.is_anemia ? ' & ' : ''}${rec.is_anemia ? 'Hb Anemia' : ''}).`;
        }

        list.push({
          id: `sched-${rec.id}`,
          record: rec,
          nama: rec.nama,
          jenisSasaran: rec.jenis_sasaran,
          kemantren: rec.kemantren,
          kelurahanNama: rec.kelurahan_nama,
          noHp: rec.no_hp,
          dueDate: rec.jadwal_berikutnya,
          daysRemaining: diffDays,
          urgency,
          title: rec.status_kunjungan === 'Perlu Rujukan' ? 'Tindak Lanjut Rujukan Faskes' : 'Kunjungan Pendampingan Terjadwal',
          reason,
          category: cat,
          statusKunjungan: rec.status_kunjungan,
          petugasNama: rec.petugas_nama,
        });
        return;
      }

      // 2. Bumil approaching HTP (Hari Taksiran Persalinan)
      if (rec.jenis_sasaran === 'IBU_HAMIL' && rec.ibu_hamil_data?.htp) {
        const htpDate = new Date(rec.ibu_hamil_data.htp);
        const diffDays = Math.round((htpDate.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24));

        // If HTP is within 35 days or trimester 3
        if (diffDays <= 35 && diffDays >= -14) {
          let urgency: 'overdue' | 'critical' | 'upcoming' | 'planned' = 'upcoming';
          if (diffDays < 0) urgency = 'overdue';
          else if (diffDays <= 7) urgency = 'critical';
          else if (diffDays <= 14) urgency = 'upcoming';
          else urgency = 'planned';

          list.push({
            id: `htp-${rec.id}`,
            record: rec,
            nama: rec.nama,
            jenisSasaran: rec.jenis_sasaran,
            kemantren: rec.kemantren,
            kelurahanNama: rec.kelurahan_nama,
            noHp: rec.no_hp,
            dueDate: rec.ibu_hamil_data.htp,
            daysRemaining: diffDays,
            urgency,
            title: 'Mendekati Hari Taksiran Persalinan (HTP)',
            reason: `Usia kehamilan ${rec.ibu_hamil_data.usia_kehamilan_minggu} minggu. Persiapan persalinan aman di faskes, donor darah, dan tanda bahaya persalinan.`,
            category: 'HTP',
            statusKunjungan: rec.status_kunjungan,
            petugasNama: rec.petugas_nama,
          });
          return;
        }
      }

      // 3. Status Perlu Rujukan (if no explicit jadwal)
      if (rec.status_kunjungan === 'Perlu Rujukan') {
        const visitDate = new Date(rec.tanggal);
        const autoDue = new Date(visitDate.getTime() + 7 * 24 * 3600 * 1000);
        const autoDueStr = autoDue.toISOString().substring(0, 10);
        const diffDays = Math.round((autoDue.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24));

        let urgency: 'overdue' | 'critical' | 'upcoming' | 'planned' = 'critical';
        if (diffDays < 0) urgency = 'overdue';
        else if (diffDays <= 3) urgency = 'critical';
        else urgency = 'upcoming';

        list.push({
          id: `rujukan-${rec.id}`,
          record: rec,
          nama: rec.nama,
          jenisSasaran: rec.jenis_sasaran,
          kemantren: rec.kemantren,
          kelurahanNama: rec.kelurahan_nama,
          noHp: rec.no_hp,
          dueDate: autoDueStr,
          daysRemaining: diffDays,
          urgency,
          title: 'Tindak Lanjut Hasil Rujukan Faskes',
          reason: `Sasaran memerlukan rujukan ke faskes/Puskesmas (${rec.catatan_kunjungan || 'kondisi medis berisiko'}). Pastikan hasil rujukan terpantau.`,
          category: 'RUJUKAN',
          statusKunjungan: rec.status_kunjungan,
          petugasNama: rec.petugas_nama,
        });
        return;
      }

      // 4. Bufas Nifas Follow-Up (KF2 / KF3 / KBPP)
      if (rec.jenis_sasaran === 'BUFAS' && rec.bufas_data?.tgl_lahir_anak) {
        const birthDate = new Date(rec.bufas_data.tgl_lahir_anak);
        // KF2 (day 7) or KF3 (day 14)
        const kfDueDate = new Date(birthDate.getTime() + 14 * 24 * 3600 * 1000);
        const kfDueStr = kfDueDate.toISOString().substring(0, 10);
        const diffDays = Math.round((kfDueDate.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 30 && diffDays >= -14) {
          let urgency: 'overdue' | 'critical' | 'upcoming' | 'planned' = 'upcoming';
          if (diffDays < 0) urgency = 'overdue';
          else if (diffDays <= 3) urgency = 'critical';

          list.push({
            id: `nifas-${rec.id}`,
            record: rec,
            nama: rec.nama,
            jenisSasaran: rec.jenis_sasaran,
            kemantren: rec.kemantren,
            kelurahanNama: rec.kelurahan_nama,
            noHp: rec.no_hp,
            dueDate: kfDueStr,
            daysRemaining: diffDays,
            urgency,
            title: 'Kunjungan Masa Nifas (KF) & KBPP',
            reason: `Pemantauan nifas lanjutan (bayi lahir ${rec.bufas_data.tgl_lahir_anak}), pemantauan involusi uteri, ASI eksklusif, dan kesiapan KB Pasca Persalinan.`,
            category: 'NIFAS',
            statusKunjungan: rec.status_kunjungan,
            petugasNama: rec.petugas_nama,
          });
          return;
        }
      }

      // 5. Catin / Bumil Berisiko Stunting (Anemia / KEK)
      if (rec.is_risiko_stunting) {
        const visitDate = new Date(rec.tanggal);
        const nextDue = new Date(visitDate.getTime() + 30 * 24 * 3600 * 1000);
        const nextDueStr = nextDue.toISOString().substring(0, 10);
        const diffDays = Math.round((nextDue.getTime() - referenceDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 21 && diffDays >= -14) {
          let urgency: 'overdue' | 'critical' | 'upcoming' | 'planned' = 'upcoming';
          if (diffDays < 0) urgency = 'overdue';
          else if (diffDays <= 3) urgency = 'critical';

          list.push({
            id: `risiko-${rec.id}`,
            record: rec,
            nama: rec.nama,
            jenisSasaran: rec.jenis_sasaran,
            kemantren: rec.kemantren,
            kelurahanNama: rec.kelurahan_nama,
            noHp: rec.no_hp,
            dueDate: nextDueStr,
            daysRemaining: diffDays,
            urgency,
            title: 'Evaluasi Risiko Stunting & PMT',
            reason: `Evaluasi berkala kepatuhan PMT / TTD dan perbaikan gizi (${rec.is_kek ? 'LiLA < 23.5 cm KEK' : ''}${rec.is_kek && rec.is_anemia ? ', ' : ''}${rec.is_anemia ? 'Kadar Hb Rendah' : ''}).`,
            category: 'RISIKO',
            statusKunjungan: rec.status_kunjungan,
            petugasNama: rec.petugas_nama,
          });
        }
      }
    });

    // Sort by urgency: overdue -> critical -> upcoming -> planned, then by daysRemaining asc
    const priorityWeight = { overdue: 0, critical: 1, upcoming: 2, planned: 3 };
    list.sort((a, b) => {
      const pDiff = priorityWeight[a.urgency] - priorityWeight[b.urgency];
      if (pDiff !== 0) return pDiff;
      return a.daysRemaining - b.daysRemaining;
    });

    return list;
  }, [data, referenceDate]);

  // Apply Kemantren / Kelurahan filters from dashboard
  const filteredReminders = useMemo(() => {
    return allReminders.filter(rem => {
      if (selectedKemantren !== 'all' && rem.kemantren.toLowerCase() !== selectedKemantren.toLowerCase()) {
        return false;
      }
      if (selectedKelurahan !== 'all' && String(rem.record.kelurahan_id) !== selectedKelurahan) {
        return false;
      }
      return true;
    });
  }, [allReminders, selectedKemantren, selectedKelurahan]);

  // Active items (excluding dismissed)
  const activeReminders = useMemo(() => {
    return filteredReminders.filter(rem => !dismissedIds.includes(rem.id));
  }, [filteredReminders, dismissedIds]);

  // Tab filter
  const displayedReminders = useMemo(() => {
    if (activeTab === 'all') return activeReminders;
    if (activeTab === 'htp') return activeReminders.filter(r => r.category === 'HTP');
    if (activeTab === 'rujukan') return activeReminders.filter(r => r.category === 'RUJUKAN');
    if (activeTab === 'risiko') return activeReminders.filter(r => r.category === 'RISIKO');
    if (activeTab === 'nifas') return activeReminders.filter(r => r.category === 'NIFAS');
    return activeReminders;
  }, [activeReminders, activeTab]);

  // Counts by urgency
  const counts = useMemo(() => {
    const overdue = activeReminders.filter(r => r.urgency === 'overdue').length;
    const critical = activeReminders.filter(r => r.urgency === 'critical').length;
    const upcoming = activeReminders.filter(r => r.urgency === 'upcoming').length;
    const planned = activeReminders.filter(r => r.urgency === 'planned').length;
    const htp = activeReminders.filter(r => r.category === 'HTP').length;
    const rujukan = activeReminders.filter(r => r.category === 'RUJUKAN').length;
    const risiko = activeReminders.filter(r => r.category === 'RISIKO').length;
    const nifas = activeReminders.filter(r => r.category === 'NIFAS').length;
    return {
      total: activeReminders.length,
      overdue,
      critical,
      upcoming,
      planned,
      htp,
      rujukan,
      risiko,
      nifas,
    };
  }, [activeReminders]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('tpk_dismissed_reminders_v1', JSON.stringify(updated));
    } catch {
      // quota
    }
  };

  const handleResetDismissed = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem('tpk_dismissed_reminders_v1');
    } catch {
      // ignore
    }
  };

  const formatDaysLabel = (days: number) => {
    if (days < 0) {
      return `Lewat ${Math.abs(days)} hari`;
    }
    if (days === 0) {
      return 'Hari ini!';
    }
    if (days === 1) {
      return 'Besok (1 hari lagi)';
    }
    return `${days} hari lagi`;
  };

  const getUrgencyBadge = (urgency: ReminderItem['urgency'], days: number) => {
    switch (urgency) {
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            {formatDaysLabel(days)}
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            Segera ({formatDaysLabel(days)})
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <Calendar className="w-3 h-3 text-sky-600" />
            {formatDaysLabel(days)}
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formatDaysLabel(days)}
          </span>
        );
    }
  };

  const getSasaranBadge = (sasaran: 'CATIN' | 'BUFAS' | 'IBU_HAMIL') => {
    switch (sasaran) {
      case 'CATIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Heart className="w-3 h-3 text-rose-500" />
            CATIN
          </span>
        );
      case 'BUFAS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Baby className="w-3 h-3 text-amber-600" />
            BUFAS
          </span>
        );
      case 'IBU_HAMIL':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Users className="w-3 h-3 text-blue-600" />
            IBU HAMIL
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Widget Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-teal-700/60 border border-teal-500/30 text-white shadow-xs">
            <Bell className="w-5 h-5 text-amber-300" />
            {counts.total > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs ring-2 ring-teal-900">
                {counts.total}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Pengingat Pendampingan Jatuh Tempo</span>
              </h2>
              {counts.total > 0 && (
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold bg-amber-400 text-teal-950 rounded-full">
                  {counts.total} Tindak Lanjut
                </span>
              )}
            </div>
            <p className="text-xs text-teal-200/90 mt-0.5">
              Sasaran prioritas di Kota Yogyakarta yang memerlukan kunjungan &amp; monitoring dalam waktu dekat
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {dismissedIds.length > 0 && (
            <button
              onClick={handleResetDismissed}
              title="Tampilkan kembali pengingat yang disembunyikan"
              className="text-[11px] text-teal-200 hover:text-white bg-teal-800/60 hover:bg-teal-700/80 px-2.5 py-1.5 rounded-lg border border-teal-600/40 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset ({dismissedIds.length} Disembunyikan)</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-white bg-teal-700/60 hover:bg-teal-600/80 px-3 py-1.5 rounded-lg border border-teal-500/40 flex items-center gap-1.5 font-medium transition-colors"
          >
            <span>{isExpanded ? 'Kecilkan' : 'Buka Pengingat'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Widget Content (When Expanded) */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Semua</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {counts.total}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('htp')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'htp'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Mendekati HTP ({counts.htp})</span>
              </button>

              <button
                onClick={() => setActiveTab('rujukan')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'rujukan'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Perlu Rujukan ({counts.rujukan})</span>
              </button>

              <button
                onClick={() => setActiveTab('risiko')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'risiko'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Risiko KEK &amp; Anemia ({counts.risiko})</span>
              </button>

              <button
                onClick={() => setActiveTab('nifas')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'nifas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>Nifas &amp; KBPP ({counts.nifas})</span>
              </button>
            </div>

            {/* Wilayah indicator badge */}
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-700" />
              <span>
                Wilayah:{' '}
                <strong className="text-slate-800">
                  {selectedKemantren === 'all' ? '14 Kemantren' : selectedKemantren}
                  {selectedKelurahan !== 'all' && ` · Kelurahan ID ${selectedKelurahan}`}
                </strong>
              </span>
            </div>
          </div>

          {/* Reminders List */}
          {displayedReminders.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">
                Semua Pendampingan Terkendali
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {selectedKemantren !== 'all' || selectedKelurahan !== 'all'
                  ? 'Tidak ada pengingat jatuh tempo untuk filter wilayah yang sedang dipilih.'
                  : 'Tidak ada sasaran dengan jadwal jatuh tempo mendesak saat ini. Pendampingan berjalan sesuai rencana.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {displayedReminders.map(rem => (
                <div
                  key={rem.id}
                  className={`relative bg-white rounded-xl border p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-3 ${
                    rem.urgency === 'overdue'
                      ? 'border-rose-300 bg-rose-50/20'
                      : rem.urgency === 'critical'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 hover:border-teal-400'
                  }`}
                >
                  {/* Top Bar inside card: Tags & Status */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getSasaranBadge(rem.jenisSasaran)}
                        {getUrgencyBadge(rem.urgency, rem.daysRemaining)}
                      </div>

                      {/* Dismiss button */}
                      <button
                        onClick={e => handleDismiss(rem.id, e)}
                        title="Tandai sudah diingatkan / sembunyikan sementara"
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Target Name & Location */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {rem.nama}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                          Jatuh Tempo: <strong className="text-slate-800 font-semibold">{rem.dueDate}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span className="truncate">
                          Kem. {rem.kemantren} · Kel. {rem.kelurahanNama}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar Pendampingan */}
                    <div className="mt-2.5 p-2.5 bg-slate-50/80 border border-slate-200/70 rounded-lg">
                      <PendampinganProgressBar
                        currentKunjungan={rem.record.kunjungan_ke}
                        jenisSasaran={rem.record.jenis_sasaran}
                        variant="standard"
                        showSteps={true}
                      />
                    </div>

                    {/* Reminder Cause & Clinical Context */}
                    <div className="mt-2.5 p-2.5 bg-slate-50/80 border border-slate-100 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{rem.title}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {rem.reason}
                      </p>
                    </div>

                    {/* Metadata: Petugas & No HP */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Petugas: <strong className="text-slate-700">{rem.petugasNama}</strong></span>
                      {rem.noHp && rem.noHp !== '-' && (
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {rem.noHp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {onOpenDetailModal && (
                      <button
                        onClick={() => onOpenDetailModal(rem.record)}
                        className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-700" />
                        <span>Lihat Dossier</span>
                      </button>
                    )}

                    {rem.noHp && rem.noHp !== '-' && (
                      <a
                        href={`https://wa.me/${rem.noHp.replace(/\D/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        title="Hubungi via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    <button
                      onClick={() => onOpenCreateModal()}
                      className="py-1.5 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      title="Catat Kunjungan Baru"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                      <span>Input Kunjungan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
