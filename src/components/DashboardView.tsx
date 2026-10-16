import React, { useMemo, useState } from 'react';
import {
  Baby,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Filter,
  Heart,
  Info,
  MapPin,
  PieChart,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { Kelurahan, UnifiedPendampingan, User } from '../types';
import { KEMANTREN_LIST } from '../services/kemantrenData';
import { DashboardRemindersWidget } from './DashboardRemindersWidget';
import { PendampinganProgressBar } from './PendampinganProgressBar';
import { DashboardMapWidget } from './DashboardMapWidget';

interface DashboardViewProps {
  data: UnifiedPendampingan[];
  kelurahanList: Kelurahan[];
  currentUser?: User | null;
  onNavigateToPendataan: (filterSasaran?: string, filterKelurahan?: string, filterKemantren?: string) => void;
  onOpenCreateModal: () => void;
  onOpenDetailModal?: (record: UnifiedPendampingan) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  kelurahanList,
  currentUser,
  onNavigateToPendataan,
  onOpenCreateModal,
  onOpenDetailModal,
}) => {
  const [selectedKemantren, setSelectedKemantren] = useState<string>('all');
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>('all');
  const [kelurahanSearchText, setKelurahanSearchText] = useState<string>('');
  const [geoViewTab, setGeoViewTab] = useState<'kemantren' | 'kelurahan'>('kemantren');
  const [cardSasaranFilter, setCardSasaranFilter] = useState<'all' | 'CATIN' | 'BUFAS' | 'IBU_HAMIL'>('all');
  const [showAllCards, setShowAllCards] = useState<boolean>(false);

  // Find user assigned kelurahan if logged in as Petugas TPK
  const userAssignedKelurahan = useMemo(() => {
    if (!currentUser?.kelurahan_id) return null;
    return kelurahanList.find(k => k.id === currentUser.kelurahan_id) || null;
  }, [currentUser, kelurahanList]);

  // Active kelurahan object if specific kelurahan is filtered
  const activeKelurahanObj = useMemo(() => {
    if (selectedKelurahan === 'all') return null;
    return kelurahanList.find(k => String(k.id) === selectedKelurahan) || null;
  }, [kelurahanList, selectedKelurahan]);

  // Filtered kelurahans for the selected kemantren and search text
  const selectableKelurahans = useMemo(() => {
    let list = kelurahanList;
    if (selectedKemantren !== 'all') {
      list = list.filter(k => k.kemantren.toLowerCase() === selectedKemantren.toLowerCase());
    }
    if (kelurahanSearchText.trim()) {
      const q = kelurahanSearchText.toLowerCase();
      list = list.filter(k => k.nama.toLowerCase().includes(q) || k.kemantren.toLowerCase().includes(q));
    }
    return list;
  }, [kelurahanList, selectedKemantren, kelurahanSearchText]);

  // Handler to select kelurahan and synchronize kemantren
  const handleSelectKelurahan = (kelIdStr: string) => {
    setSelectedKelurahan(kelIdStr);
    if (kelIdStr === 'all') {
      // keep selectedKemantren
    } else {
      const found = kelurahanList.find(k => String(k.id) === kelIdStr);
      if (found) {
        setSelectedKemantren(found.kemantren);
      }
    }
  };

  // Handler to select kemantren and safely update kelurahan
  const handleSelectKemantren = (kemVal: string) => {
    setSelectedKemantren(kemVal);
    if (selectedKelurahan !== 'all') {
      const currentKel = kelurahanList.find(k => String(k.id) === selectedKelurahan);
      if (!currentKel || (kemVal !== 'all' && currentKel.kemantren.toLowerCase() !== kemVal.toLowerCase())) {
        setSelectedKelurahan('all');
      }
    }
  };

  // Handler to reset all filters
  const handleResetFilters = () => {
    setSelectedKemantren('all');
    setSelectedKelurahan('all');
    setKelurahanSearchText('');
  };

  // Toggle user's assigned kelurahan filter
  const handleToggleMyTerritory = () => {
    if (!userAssignedKelurahan) return;
    if (selectedKelurahan === String(userAssignedKelurahan.id)) {
      handleResetFilters();
    } else {
      setSelectedKemantren(userAssignedKelurahan.kemantren);
      setSelectedKelurahan(String(userAssignedKelurahan.id));
    }
  };

  // Filtered dataset for aggregate calculations if kemantren/kelurahan is chosen
  const filteredData = useMemo(() => {
    return data.filter(d => {
      if (selectedKemantren !== 'all' && d.kemantren.toLowerCase() !== selectedKemantren.toLowerCase()) {
        return false;
      }
      if (selectedKelurahan !== 'all' && String(d.kelurahan_id) !== selectedKelurahan) {
        return false;
      }
      return true;
    });
  }, [data, selectedKemantren, selectedKelurahan]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filteredData.length;
    const catin = filteredData.filter(d => d.jenis_sasaran === 'CATIN').length;
    const bufas = filteredData.filter(d => d.jenis_sasaran === 'BUFAS').length;
    const bumil = filteredData.filter(d => d.jenis_sasaran === 'IBU_HAMIL').length;

    // Special risk flags for territory follow-up
    const risikoStunting = filteredData.filter(d => d.is_risiko_stunting).length;
    const perluRujukan = filteredData.filter(d => d.status_kunjungan === 'Perlu Rujukan').length;
    const kekCount = filteredData.filter(d => d.is_kek).length;
    const anemiaCount = filteredData.filter(d => d.is_anemia).length;

    // This month (current simulated date: October 2026)
    const currentYearMonth = '2026-10';
    const thisMonth = filteredData.filter(d => d.tanggal.startsWith(currentYearMonth)).length;

    // PMT coverage
    const pmtSudah = filteredData.filter(d => d.status_pmt === 'Sudah').length;
    const pmtBelum = filteredData.filter(d => d.status_pmt === 'Belum').length;
    const pmtPercentage = total > 0 ? Math.round((pmtSudah / total) * 100) : 0;

    // PMT by source
    const pmtSources: Record<string, number> = {
      Puskesmas: 0,
      DAIS: 0,
      GENTING: 0,
      Lainnya: 0,
    };
    filteredData.forEach(d => {
      if (d.status_pmt === 'Sudah' && d.sumber_pmt) {
        pmtSources[d.sumber_pmt] = (pmtSources[d.sumber_pmt] || 0) + 1;
      }
    });

    // Monthly trend (last 6 months)
    const months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const monthLabels = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
    const monthlyCounts = months.map(m => filteredData.filter(d => d.tanggal.startsWith(m)).length);

    // Distribution across 14 Kemantren
    const kemantrenDist = KEMANTREN_LIST.map(kem => {
      const kelsInKem = kelurahanList.filter(k => k.kemantren.toLowerCase() === kem.toLowerCase());
      const count = data.filter(d => d.kemantren.toLowerCase() === kem.toLowerCase()).length;
      const target = kelsInKem.reduce((acc, k) => acc + k.target_sasaran, 0);
      const percentage = Math.min(100, Math.round((count / (target || 1)) * 100));
      return {
        nama: kem,
        kelurahanCount: kelsInKem.length,
        count,
        target,
        percentage,
      };
    });

    // Distribution by Kelurahan (filtered by selectedKemantren if active)
    const kelurahanDist = selectableKelurahans.map(k => {
      const count = data.filter(d => d.kelurahan_id === k.id).length;
      return {
        id: k.id,
        nama: k.nama,
        kemantren: k.kemantren,
        kecamatan: k.kecamatan,
        count,
        target: k.target_sasaran,
        percentage: Math.min(100, Math.round((count / (k.target_sasaran || 1)) * 100)),
      };
    });

    return {
      total,
      catin,
      bufas,
      bumil,
      risikoStunting,
      perluRujukan,
      kekCount,
      anemiaCount,
      thisMonth,
      pmtSudah,
      pmtBelum,
      pmtPercentage,
      pmtSources,
      monthLabels,
      monthlyCounts,
      kemantrenDist,
      kelurahanDist,
    };
  }, [filteredData, data, kelurahanList, selectableKelurahans]);

  // Max value for chart scales
  const maxMonthly = Math.max(...stats.monthlyCounts, 5);

  // Filtered pendampingan records for cards section
  const cardList = useMemo(() => {
    let list = filteredData;
    if (cardSasaranFilter !== 'all') {
      list = list.filter(d => d.jenis_sasaran === cardSasaranFilter);
    }
    return list;
  }, [filteredData, cardSasaranFilter]);

  const isFilterActive = selectedKemantren !== 'all' || selectedKelurahan !== 'all';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dashboard Monitoring TPK Kota Yogyakarta
            </h1>
            {isFilterActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                <Filter className="w-3 h-3" />
                Filter Wilayah Aktif
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hierarki 14 Kemantren &amp; 45 Kelurahan · Intervensi Pencegahan Stunting BKKBN
          </p>
        </div>

        {/* Hierarchical Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Pintas Wilayah Tugas Petugas (Jika Ditugaskan di Kelurahan Tertentu) */}
          {userAssignedKelurahan && (
            <button
              onClick={handleToggleMyTerritory}
              title={`Klik untuk ${selectedKelurahan === String(userAssignedKelurahan.id) ? 'melepas filter' : 'melihat statistik wilayah tugas Anda'}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                selectedKelurahan === String(userAssignedKelurahan.id)
                  ? 'bg-teal-700 text-white ring-2 ring-teal-500'
                  : 'bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Wilayah Tugas: Kel. {userAssignedKelurahan.nama}</span>
              {selectedKelurahan === String(userAssignedKelurahan.id) && (
                <X className="w-3 h-3 ml-0.5 hover:text-rose-200" />
              )}
            </button>
          )}

          {/* Kemantren Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Kemantren:</span>
            </span>
            <select
              value={selectedKemantren}
              onChange={e => handleSelectKemantren(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs"
            >
              <option value="all">Semua Kemantren (14)</option>
              {KEMANTREN_LIST.map(kem => (
                <option key={kem} value={kem}>
                  Kem. {kem}
                </option>
              ))}
            </select>
          </div>

          {/* Kelurahan Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Kelurahan:</span>
            </span>
            <select
              value={selectedKelurahan}
              onChange={e => handleSelectKelurahan(e.target.value)}
              className="text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-xs max-w-[200px] sm:max-w-[240px] truncate"
            >
              <option value="all">
                {selectedKemantren === 'all'
                  ? 'Semua Kelurahan (45)'
                  : `Semua Kelurahan di ${selectedKemantren} (${selectableKelurahans.length})`}
              </option>
              {selectedKemantren === 'all'
                ? // Grouped by Kemantren for smooth browsing of all 45 kelurahans
                  KEMANTREN_LIST.map(kem => {
                    const kels = kelurahanList.filter(k => k.kemantren.toLowerCase() === kem.toLowerCase());
                    if (kels.length === 0) return null;
                    return (
                      <optgroup key={kem} label={`Kem. ${kem}`}>
                        {kels.map(k => (
                          <option key={k.id} value={String(k.id)}>
                            Kel. {k.nama}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })
                : selectableKelurahans.map(k => (
                    <option key={k.id} value={String(k.id)}>
                      Kel. {k.nama}
                    </option>
                  ))}
            </select>
          </div>

          {/* Tombol Reset Filter */}
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              title="Reset filter wilayah (tampilkan seluruh kota)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* BANNER KHUSUS: STATISTIK SPESIFIK WILAYAH KELURAHAN YANG DIFILTER */}
      {activeKelurahanObj && (
        <div className="bg-gradient-to-r from-teal-50 via-teal-50/60 to-emerald-50/50 border-2 border-teal-300 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-teal-200/70">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Statistik Wilayah: Kelurahan {activeKelurahanObj.nama}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-700 text-white">
                    Kemantren {activeKelurahanObj.kemantren}
                  </span>
                  {userAssignedKelurahan?.id === activeKelurahanObj.id && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      ★ Wilayah Tugas Anda
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Penanggung Jawab Lapangan: <span className="font-semibold text-slate-800">{activeKelurahanObj.penanggung_jawab}</span> · Kode Wilayah: #{activeKelurahanObj.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() =>
                  onNavigateToPendataan(undefined, String(activeKelurahanObj.id), activeKelurahanObj.kemantren)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors"
              >
                <span>Lihat Data Kelurahan Ini ({stats.total})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetFilters}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                title="Tutup mode fokus kelurahan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Detail Ringkasan Capaian Kelurahan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-teal-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Target Sasaran BKKBN</span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 tabular-nums">
                {activeKelurahanObj.target_sasaran}{' '}
                <span className="text-xs font-normal text-slate-500">sasaran</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Kuota tahunan kelurahan</div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-teal-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Realisasi Pendampingan</span>
              <div className="text-lg sm:text-xl font-bold text-teal-800 mt-0.5 tabular-nums">
                {stats.total}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({Math.min(100, Math.round((stats.total / (activeKelurahanObj.target_sasaran || 1)) * 100))}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, Math.round((stats.total / (activeKelurahanObj.target_sasaran || 1)) * 100))}%`,
                  }}
                  className="bg-teal-600 h-1.5 rounded-full"
                />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-teal-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Sasaran Berisiko Stunting</span>
              <div className="text-lg sm:text-xl font-bold text-rose-700 mt-0.5 tabular-nums">
                {stats.risikoStunting}{' '}
                <span className="text-xs font-normal text-slate-500">sasaran</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {stats.perluRujukan} sasaran perlu rujukan faskes
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3 rounded-lg border border-teal-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Cakupan Bantuan PMT</span>
              <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5 tabular-nums">
                {stats.pmtPercentage}%{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({stats.pmtSudah}/{stats.total})
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Penerima paket PMT aktif</div>
            </div>
          </div>
        </div>
      )}

      {/* BANNER JIKA HANYA MEMILIH KEMANTREN (DENGAN TOMBOL CEPAT KE KELURAHAN-KELURAHANNYA) */}
      {selectedKemantren !== 'all' && selectedKelurahan === 'all' && (
        <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-700" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                Pilih Kelurahan Spesifik di Kemantren {selectedKemantren}:
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Menampilkan agregat {selectableKelurahans.length} kelurahan ({stats.total} total sasaran)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {selectableKelurahans.map(k => {
              const kelCount = data.filter(d => d.kelurahan_id === k.id).length;
              return (
                <button
                  key={k.id}
                  onClick={() => handleSelectKelurahan(String(k.id))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 hover:border-teal-300 transition-colors shadow-xs"
                >
                  <MapPin className="w-3 h-3 text-teal-600" />
                  <span>Kel. {k.nama}</span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-600">
                    {kelCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fitur Notifikasi Pengingat Pendampingan Jatuh Tempo */}
      <DashboardRemindersWidget
        data={data}
        selectedKemantren={selectedKemantren}
        selectedKelurahan={selectedKelurahan}
        onOpenDetailModal={onOpenDetailModal}
        onOpenCreateModal={onOpenCreateModal}
        onNavigateToPendataan={onNavigateToPendataan}
      />

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pendampingan */}
        <div
          onClick={() =>
            onNavigateToPendataan(
              undefined,
              selectedKelurahan !== 'all' ? selectedKelurahan : undefined,
              selectedKemantren !== 'all' ? selectedKemantren : undefined
            )
          }
          className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Pendampingan</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stats.total}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Bulan Ini:</span>
            <span className="font-semibold text-teal-700 tabular-nums">{stats.thisMonth} kunjungan</span>
          </div>
        </div>

        {/* Total CATIN */}
        <div
          onClick={() =>
            onNavigateToPendataan(
              'CATIN',
              selectedKelurahan !== 'all' ? selectedKelurahan : undefined,
              selectedKemantren !== 'all' ? selectedKemantren : undefined
            )
          }
          className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Calon Pengantin (CATIN)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stats.catin}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Proporsi:</span>
            <span className="font-medium text-slate-700 tabular-nums">
              {stats.total > 0 ? Math.round((stats.catin / stats.total) * 100) : 0}% total
            </span>
          </div>
        </div>

        {/* Total BUFAS */}
        <div
          onClick={() =>
            onNavigateToPendataan(
              'BUFAS',
              selectedKelurahan !== 'all' ? selectedKelurahan : undefined,
              selectedKemantren !== 'all' ? selectedKemantren : undefined
            )
          }
          className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Ibu Nifas (BUFAS)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stats.bufas}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Proporsi:</span>
            <span className="font-medium text-slate-700 tabular-nums">
              {stats.total > 0 ? Math.round((stats.bufas / stats.total) * 100) : 0}% total
            </span>
          </div>
        </div>

        {/* Total IBU HAMIL */}
        <div
          onClick={() =>
            onNavigateToPendataan(
              'IBU_HAMIL',
              selectedKelurahan !== 'all' ? selectedKelurahan : undefined,
              selectedKemantren !== 'all' ? selectedKemantren : undefined
            )
          }
          className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Ibu Hamil (BUMIL)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {stats.bumil}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Proporsi:</span>
            <span className="font-medium text-slate-700 tabular-nums">
              {stats.total > 0 ? Math.round((stats.bumil / stats.total) * 100) : 0}% total
            </span>
          </div>
        </div>
      </div>

      {/* KARTU PENDAMPINGAN SASARAN DENGAN VISUAL PROGRESS BAR SIKLUS KUNJUNGAN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-700" />
                <span>Kartu Pendampingan Sasaran &amp; Progres Siklus Kunjungan</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                {cardList.length} Sasaran
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualisasi persentase tahapan progres pendampingan lapangan (misal: kunjungan ke-1 dari 3) sesuai standar BKKBN
            </p>
          </div>

          {/* Filter Sasaran Pill Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setCardSasaranFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                cardSasaranFilter === 'all'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({filteredData.length})
            </button>
            <button
              onClick={() => setCardSasaranFilter('CATIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                cardSasaranFilter === 'CATIN'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>CATIN ({stats.catin})</span>
            </button>
            <button
              onClick={() => setCardSasaranFilter('BUFAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                cardSasaranFilter === 'BUFAS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>BUFAS ({stats.bufas})</span>
            </button>
            <button
              onClick={() => setCardSasaranFilter('IBU_HAMIL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                cardSasaranFilter === 'IBU_HAMIL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>BUMIL ({stats.bumil})</span>
            </button>
          </div>
        </div>

        {/* Grid Kartu Pendampingan */}
        {cardList.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">Tidak ada sasaran pendampingan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tidak ditemukan data sasaran untuk kategori atau wilayah yang sedang difilter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showAllCards ? cardList : cardList.slice(0, 6)).map(item => {
              const isRisiko = item.is_risiko_stunting;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 hover:border-teal-400 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Jenis Sasaran & Status Kunjungan */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.jenis_sasaran === 'CATIN'
                            ? 'bg-rose-100 text-rose-800'
                            : item.jenis_sasaran === 'BUFAS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.jenis_sasaran === 'CATIN' ? (
                          <Heart className="w-3 h-3" />
                        ) : item.jenis_sasaran === 'BUFAS' ? (
                          <Baby className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        <span>{item.jenis_sasaran}</span>
                      </span>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          item.status_kunjungan === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status_kunjungan === 'Perlu Rujukan'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status_kunjungan}
                      </span>
                    </div>

                    {/* Identitas Sasaran & Wilayah */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors truncate">
                        {item.nama}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span className="truncate">
                          Kel. {item.kelurahan_nama} · Kem. {item.kemantren}
                        </span>
                      </div>
                    </div>

                    {/* KOMPONEN PROGRESS BAR KUNJUNGAN */}
                    <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
                      <PendampinganProgressBar
                        currentKunjungan={item.kunjungan_ke}
                        jenisSasaran={item.jenis_sasaran}
                        variant="standard"
                        showSteps={true}
                      />
                    </div>

                    {/* Ringkasan Indikator Klinis / PMT */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {isRisiko ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          Ada Faktor Risiko
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Terpantau Baik
                        </span>
                      )}

                      <span
                        className={`px-1.5 py-0.5 rounded border ${
                          item.status_pmt === 'Sudah'
                            ? 'bg-teal-50 text-teal-800 border-teal-200 font-medium'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        PMT: {item.status_pmt}
                      </span>

                      {item.is_anemia && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                          Anemia
                        </span>
                      )}

                      {item.is_kek && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          KEK
                        </span>
                      )}
                    </div>

                    {/* Info Tanggal & Petugas */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.tanggal}</span>
                      </span>
                      <span className="truncate max-w-[120px] text-slate-600">
                        Oleh: <strong>{item.petugas_nama}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {onOpenDetailModal && (
                      <button
                        onClick={() => onOpenDetailModal(item)}
                        className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-700" />
                        <span>Lihat Dossier</span>
                      </button>
                    )}
                    <button
                      onClick={onOpenCreateModal}
                      className="py-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Catat kunjungan berikutnya"
                    >
                      <span>+ Kunjungan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Navigation & Expand Button */}
        {cardList.length > 6 && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => setShowAllCards(!showAllCards)}
              className="text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-lg border border-teal-200 transition-colors self-start cursor-pointer"
            >
              {showAllCards
                ? 'Tampilkan Lebih Sedikit (6 Kartu)'
                : `Tampilkan Semua ${cardList.length} Kartu Pendampingan`}
            </button>

            <button
              onClick={() =>
                onNavigateToPendataan(
                  cardSasaranFilter !== 'all' ? cardSasaranFilter : undefined,
                  selectedKelurahan !== 'all' ? selectedKelurahan : undefined,
                  selectedKemantren !== 'all' ? selectedKemantren : undefined
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              <span>Buka Seluruh {cardList.length} Data di Tabel Pendataan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Peta Sebaran Sasaran Pendampingan (react-leaflet) */}
      <DashboardMapWidget
        data={data}
        onOpenDetailModal={onOpenDetailModal}
        selectedKemantren={selectedKemantren}
        selectedKelurahan={selectedKelurahan}
      />

      {/* 4 Interactive Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik 1: Pendampingan Per Bulan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">1. Tren Pendampingan Per Bulan</h2>
              <p className="text-xs text-slate-500">Aktivitas kunjungan 6 bulan terakhir</p>
            </div>
            <div className="text-xs font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
              Tahun 2026
            </div>
          </div>

          {/* SVG Bar Chart with values */}
          <div className="h-52 w-full pt-4 pb-2">
            <div className="h-full flex items-end justify-between gap-2 px-2 border-b border-slate-200">
              {stats.monthLabels.map((lbl, idx) => {
                const count = stats.monthlyCounts[idx];
                const heightPercent = Math.max(8, Math.round((count / maxMonthly) * 100));
                return (
                  <div key={lbl} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[11px] font-semibold text-slate-700 tabular-nums group-hover:text-teal-700">
                      {count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[40px] bg-teal-600 group-hover:bg-teal-700 rounded-t transition-all duration-300"
                    />
                    <span className="text-xs font-medium text-slate-500 mt-1">
                      {lbl}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata: {(stats.total / 6).toFixed(1)} sasaran/bulan</span>
            <span>Puncak: {maxMonthly} kunjungan</span>
          </div>
        </div>

        {/* Grafik 2: Pendampingan Per Kelurahan */}
        {/* Grafik 2: Pendampingan Per Kemantren & Kelurahan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">2. Capaian Wilayah (14 Kemantren &amp; 45 Kelurahan)</h2>
                {selectedKelurahan !== 'all' && (
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                    Kelurahan Terfilter
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Klik salah satu wilayah untuk memfilter seluruh statistik dashboard
              </p>
            </div>
            
            {/* Toggle Tab */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold shrink-0">
              <button
                onClick={() => setGeoViewTab('kemantren')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  geoViewTab === 'kemantren' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                14 Kemantren
              </button>
              <button
                onClick={() => setGeoViewTab('kelurahan')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  geoViewTab === 'kelurahan' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelurahan ({selectableKelurahans.length})
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-1 overflow-y-auto max-h-64 pr-1">
            {geoViewTab === 'kemantren' ? (
              stats.kemantrenDist.map(kem => {
                const isSelected = selectedKemantren.toLowerCase() === kem.nama.toLowerCase();
                return (
                  <div
                    key={kem.nama}
                    onClick={() => {
                      handleSelectKemantren(kem.nama);
                      setGeoViewTab('kelurahan');
                    }}
                    title={`Klik untuk memfilter ke Kemantren ${kem.nama}`}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50 border border-teal-300 ring-1 ring-teal-400'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>Kemantren {kem.nama}</span>
                        <span className="text-[11px] text-slate-400 font-normal">({kem.kelurahanCount} Kelurahan)</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold bg-teal-700 text-white px-1.5 py-0.2 rounded">
                            ✓ Terpilih
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-slate-600 tabular-nums">
                        {kem.count} / {kem.target} ({kem.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(kem.count > 0 ? 8 : 0, kem.percentage)}%` }}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          kem.count > 0 ? 'bg-teal-600' : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              stats.kelurahanDist.map(k => {
                const isSelected = selectedKelurahan === String(k.id);
                return (
                  <div
                    key={k.id}
                    onClick={() => handleSelectKelurahan(isSelected ? 'all' : String(k.id))}
                    title={`Klik untuk ${isSelected ? 'membatalkan filter' : 'memfilter seluruh dashboard ke Kelurahan ' + k.nama}`}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/90 border-2 border-teal-500 shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`} />
                        <span>Kel. {k.nama}</span>
                        <span className="font-normal text-slate-400">({k.kemantren})</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold bg-teal-700 text-white px-1.5 py-0.2 rounded">
                            ✓ Aktif
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-slate-600 tabular-nums">
                        {k.count} / {k.target} ({k.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.max(k.count > 0 ? 8 : 0, k.percentage)}%` }}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isSelected
                            ? 'bg-teal-600'
                            : k.count > 0
                            ? 'bg-emerald-600'
                            : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            {selectedKelurahan !== 'all' && activeKelurahanObj ? (
              <span className="text-teal-800 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-teal-600" />
                Difokuskan ke Kel. {activeKelurahanObj.nama}
              </span>
            ) : (
              <span>Total Target 45 Kelurahan: {kelurahanList.reduce((acc, k) => acc + k.target_sasaran, 0)} sasaran</span>
            )}
            {isFilterActive ? (
              <button
                onClick={handleResetFilters}
                className="text-teal-700 hover:text-teal-900 font-medium underline cursor-pointer"
              >
                Reset Filter Wilayah
              </button>
            ) : (
              <span className="text-teal-700 font-medium">BKKBN Kota Yogyakarta</span>
            )}
          </div>
        </div>

        {/* Grafik 3: Distribusi Jenis Sasaran (CATIN / BUFAS / BUMIL) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">3. Komposisi Jenis Sasaran</h2>
              <p className="text-xs text-slate-500">Proporsi sasaran prioritas intervensi TPK</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          {stats.total === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Belum ada data sasaran</div>
          ) : (
            <div className="space-y-4">
              {/* Stacked bar visualization */}
              <div className="h-6 w-full flex rounded-lg overflow-hidden shadow-inner">
                {stats.catin > 0 && (
                  <div
                    style={{ width: `${(stats.catin / stats.total) * 100}%` }}
                    className="bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                    title={`CATIN: ${stats.catin}`}
                  >
                    {Math.round((stats.catin / stats.total) * 100)}%
                  </div>
                )}
                {stats.bufas > 0 && (
                  <div
                    style={{ width: `${(stats.bufas / stats.total) * 100}%` }}
                    className="bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                    title={`BUFAS: ${stats.bufas}`}
                  >
                    {Math.round((stats.bufas / stats.total) * 100)}%
                  </div>
                )}
                {stats.bumil > 0 && (
                  <div
                    style={{ width: `${(stats.bumil / stats.total) * 100}%` }}
                    className="bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                    title={`IBU HAMIL: ${stats.bumil}`}
                  >
                    {Math.round((stats.bumil / stats.total) * 100)}%
                  </div>
                )}
              </div>

              {/* Legend & Count Details */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => onNavigateToPendataan('CATIN')}
                  className="p-3 bg-rose-50/60 hover:bg-rose-50 rounded-lg text-left border border-rose-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span>CATIN</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                    {stats.catin}
                  </div>
                  <div className="text-[11px] text-slate-500">Calon Pengantin</div>
                </button>

                <button
                  onClick={() => onNavigateToPendataan('BUFAS')}
                  className="p-3 bg-amber-50/60 hover:bg-amber-50 rounded-lg text-left border border-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>BUFAS</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                    {stats.bufas}
                  </div>
                  <div className="text-[11px] text-slate-500">Ibu Nifas</div>
                </button>

                <button
                  onClick={() => onNavigateToPendataan('IBU_HAMIL')}
                  className="p-3 bg-blue-50/60 hover:bg-blue-50 rounded-lg text-left border border-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span>BUMIL</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                    {stats.bumil}
                  </div>
                  <div className="text-[11px] text-slate-500">Ibu Hamil</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grafik 4: Status Penerimaan PMT (Sudah vs Belum & Sumber) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">4. Status Penerimaan PMT</h2>
              <p className="text-xs text-slate-500">Cakupan Pemberian Makanan Tambahan</p>
            </div>
            <Utensils className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            {/* Split Comparison Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-teal-800 font-semibold">
                  Sudah Menerima: {stats.pmtSudah} ({stats.pmtPercentage}%)
                </span>
                <span className="text-slate-600">
                  Belum: {stats.pmtBelum} ({100 - stats.pmtPercentage}%)
                </span>
              </div>
              <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${stats.pmtPercentage}%` }}
                  className="bg-teal-600 h-full transition-all duration-500"
                />
                <div
                  style={{ width: `${100 - stats.pmtPercentage}%` }}
                  className="bg-slate-300 h-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Sumber PMT Breakdown */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                Distribusi Sumber PMT (Bagi yang Sudah Menerima):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(stats.pmtSources).map(([source, count]) => (
                  <div key={source} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <span className="text-[11px] font-semibold text-slate-600 block">{source}</span>
                    <span className="text-base font-bold text-slate-900 tabular-nums">{count}</span>
                    <span className="text-[10px] text-slate-500 block">paket</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standar BKKBN: Prioritas sasaran KEK / Anemia</span>
            <span className="text-teal-700 font-semibold">Intervensi Gizi Sensitif</span>
          </div>
        </div>
      </div>

      {/* Quick Action Footer / Health Protocol Notice */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
              Kepatuhan Privasi Data Kesehatan (UU PDP & Kebijakan BKKBN)
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Dashboard ini hanya menyajikan data agregasi anonim. Nomor HP dan identitas privat terlindungi pada level rekap.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            + Tambah Sasaran Baru
          </button>
        </div>
      </div>
    </div>
  );
};
