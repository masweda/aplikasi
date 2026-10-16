import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Baby,
  Calendar,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Heart,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
  Utensils,
} from 'lucide-react';
import { exportToExcel, exportToLookerStudioCSV, exportToPDF, exportSingleRecordPDF } from '../services/exportService';
import { Kelurahan, RekapitulasiRow, UnifiedPendampingan, User } from '../types';
import { KEMANTREN_LIST } from '../services/kemantrenData';
import { PendampinganProgressBar } from './PendampinganProgressBar';

interface PendataanListViewProps {
  data: UnifiedPendampingan[];
  kelurahanList: Kelurahan[];
  rekapitulasi: RekapitulasiRow[];
  currentUser: User;
  onOpenCreateModal: () => void;
  onOpenDetailModal: (record: UnifiedPendampingan) => void;
  onOpenEditModal: (record: UnifiedPendampingan) => void;
  onDeleteRecord: (id: number) => Promise<void>;
  initialSasaranFilter?: string;
  initialKelurahanFilter?: string;
  initialKemantrenFilter?: string;
}

export const PendataanListView: React.FC<PendataanListViewProps> = ({
  data,
  kelurahanList,
  rekapitulasi,
  currentUser,
  onOpenCreateModal,
  onOpenDetailModal,
  onOpenEditModal,
  onDeleteRecord,
  initialSasaranFilter,
  initialKelurahanFilter,
  initialKemantrenFilter,
}) => {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKemantren, setFilterKemantren] = useState(initialKemantrenFilter || 'all');
  const [filterKelurahan, setFilterKelurahan] = useState(initialKelurahanFilter || 'all');
  const [filterSasaran, setFilterSasaran] = useState(initialSasaranFilter || 'all');
  const [filterPmt, setFilterPmt] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Sync initial filters when props change
  useEffect(() => {
    if (initialSasaranFilter) setFilterSasaran(initialSasaranFilter);
  }, [initialSasaranFilter]);

  useEffect(() => {
    if (initialKelurahanFilter) setFilterKelurahan(initialKelurahanFilter);
  }, [initialKelurahanFilter]);

  useEffect(() => {
    if (initialKemantrenFilter) setFilterKemantren(initialKemantrenFilter);
  }, [initialKemantrenFilter]);

  // Delete confirmation modal state
  const [recordToDelete, setRecordToDelete] = useState<UnifiedPendampingan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk selection and deletion states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Available kelurahan for sub-filter
  const selectableKelurahans = useMemo(() => {
    if (filterKemantren === 'all') return kelurahanList;
    return kelurahanList.filter(k => k.kemantren.toLowerCase() === filterKemantren.toLowerCase());
  }, [kelurahanList, filterKemantren]);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return data.filter(record => {
      // 1. Search query (nama, NIK/ID, keterangan/catatan, alamat, etc.)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = record.nama.toLowerCase().includes(q);
        const matchesAlamat = record.alamat.toLowerCase().includes(q);
        const matchesHp = record.no_hp.toLowerCase().includes(q);
        const matchesPetugas = record.petugas_nama.toLowerCase().includes(q);
        const matchesKemantren = record.kemantren.toLowerCase().includes(q);
        const matchesKelurahan = record.kelurahan_nama.toLowerCase().includes(q);
        const matchesCatatan = record.catatan_kunjungan?.toLowerCase().includes(q) || false;
        const matchesId = String(record.id).includes(q);
        const matchesKomplikasi = (record.bufas_data?.komplikasi_nifas && record.bufas_data.komplikasi_nifas.toLowerCase().includes(q)) || false;
        const matchesLokasi = (record.lokasi_label && record.lokasi_label.toLowerCase().includes(q)) || false;

        if (!matchesName && !matchesAlamat && !matchesHp && !matchesPetugas && !matchesKemantren && !matchesKelurahan && !matchesCatatan && !matchesId && !matchesKomplikasi && !matchesLokasi) {
          return false;
        }
      }

      // 2. Kemantren filter
      if (filterKemantren !== 'all' && record.kemantren.toLowerCase() !== filterKemantren.toLowerCase()) {
        return false;
      }

      // 3. Kelurahan filter
      if (filterKelurahan !== 'all' && String(record.kelurahan_id) !== filterKelurahan) {
        return false;
      }

      // 4. Sasaran filter
      if (filterSasaran !== 'all' && record.jenis_sasaran !== filterSasaran) {
        return false;
      }

      // 5. PMT filter
      if (filterPmt !== 'all' && record.status_pmt !== filterPmt) {
        return false;
      }

      // 6. Date range filter
      if (filterStartDate && record.tanggal < filterStartDate) {
        return false;
      }
      if (filterEndDate && record.tanggal > filterEndDate) {
        return false;
      }

      return true;
    });
  }, [data, searchQuery, filterKemantren, filterKelurahan, filterSasaran, filterPmt, filterStartDate, filterEndDate]);

  // Reset selection when filtered records change
  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => filteredRecords.some(r => r.id === id)));
  }, [filteredRecords]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    for (const id of selectedIds) {
      await onDeleteRecord(id);
    }
    setIsBulkDeleting(false);
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterKemantren('all');
    setFilterKelurahan('all');
    setFilterSasaran('all');
    setFilterPmt('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setSelectedIds([]);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    await onDeleteRecord(recordToDelete.id);
    setIsDeleting(false);
    setRecordToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pendataan &amp; Monitoring Sasaran TPK
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              {filteredRecords.length} Sasaran Ditampilkan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data sasaran (Catin, Bufas, Ibu Hamil), catat kunjungan, unduh laporan offline, dan hapus data.
          </p>
        </div>

        {/* Export and Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export PDF */}
          <button
            onClick={() => exportToPDF(filteredRecords, currentUser)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            title="Unduh Rekap PDF"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportToExcel(filteredRecords, rekapitulasi, currentUser)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            title="Ekspor ke Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>

          {/* Export Looker CSV */}
          <button
            onClick={() => exportToLookerStudioCSV(filteredRecords, currentUser)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>CSV (Looker)</span>
          </button>

          {/* Add Record Button */}
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Data</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama sasaran, NIK, atau keterangan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
          </div>

          {/* 1. Filter Kemantren (14 Wilayah) */}
          <div>
            <select
              value={filterKemantren}
              onChange={e => {
                const newKem = e.target.value;
                setFilterKemantren(newKem);
                setFilterKelurahan('all');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Kemantren (14)</option>
              {KEMANTREN_LIST.map(kem => (
                <option key={kem} value={kem}>
                  Kem. {kem}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter Kelurahan (Hierarki di bawah Kemantren) */}
          <div>
            <select
              value={filterKelurahan}
              onChange={e => setFilterKelurahan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">
                {filterKemantren === 'all' ? 'Semua Kelurahan (45)' : `Semua di ${filterKemantren}`}
              </option>
              {selectableKelurahans.map(k => (
                <option key={k.id} value={String(k.id)}>
                  Kel. {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Sasaran */}
          <div>
            <select
              value={filterSasaran}
              onChange={e => setFilterSasaran(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Sasaran</option>
              <option value="CATIN">1. CATIN</option>
              <option value="BUFAS">2. BUFAS</option>
              <option value="IBU_HAMIL">3. IBU HAMIL</option>
            </select>
          </div>

          {/* Filter PMT */}
          <div>
            <select
              value={filterPmt}
              onChange={e => setFilterPmt(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Status PMT</option>
              <option value="Sudah">Sudah Dapat PMT</option>
              <option value="Belum">Belum Dapat PMT</option>
            </select>
          </div>
        </div>

        {/* Date Range & Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Rentang Tanggal:</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={e => setFilterStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={e => setFilterEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Hapus Semua Filter
            </button>
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 cursor-pointer"
            >
              + Input Sasaran Baru
            </button>
          </div>
        </div>
      </div>

      {/* BULK DELETE ACTION BAR (APPEARS ONLY WHEN ITEMS ARE SELECTED) */}
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {selectedIds.length}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-red-900">
                {selectedIds.length} data pendampingan dipilih
              </h4>
              <p className="text-[11px] text-red-700">
                Anda dapat menghapus data yang dicentang secara massal dari database sistem.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Batalkan Pilihan
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Data Presentation */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tidak ada data pendampingan ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah filter wilayah dan kategori sasaran di atas.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filter &amp; Pencarian
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                        title="Pilih semua data pada halaman ini"
                      />
                    </th>
                    <th className="py-3 px-4">Tanggal · Kunjungan</th>
                    <th className="py-3 px-4">Sasaran & Kategori</th>
                    <th className="py-3 px-4">Kelurahan & Kemantren</th>
                    <th className="py-3 px-4">Status PMT</th>
                    <th className="py-3 px-4">Indikator Kesehatan</th>
                    <th className="py-3 px-4">Petugas</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map(record => {
                    const canEditOrDelete =
                      currentUser.role === 'ADMIN' ||
                      currentUser.id === record.created_by ||
                      currentUser.kelurahan_id === record.kelurahan_id;

                    const isChecked = selectedIds.includes(record.id);

                    return (
                      <tr
                        key={record.id}
                        className={`hover:bg-slate-50/60 transition-colors group ${
                          isChecked ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(record.id)}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>

                        {/* Tanggal & Kunjungan */}
                        <td className="py-3 px-4 min-w-[150px]">
                          <div className="font-semibold text-slate-900 tabular-nums">
                            {record.tanggal}
                          </div>
                          <div className="mt-1">
                            <PendampinganProgressBar
                              currentKunjungan={record.kunjungan_ke}
                              jenisSasaran={record.jenis_sasaran}
                              variant="compact"
                              showSteps={false}
                            />
                          </div>
                          {record.jadwal_berikutnya && (
                            <div className="text-[10px] text-amber-700 font-medium mt-1">
                              Jatuh tempo: {record.jadwal_berikutnya}
                            </div>
                          )}
                        </td>

                        {/* Nama Sasaran & Kategori */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                record.jenis_sasaran === 'CATIN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : record.jenis_sasaran === 'BUFAS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {record.jenis_sasaran}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {record.nama}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {record.alamat}
                          </div>
                        </td>

                        {/* Kelurahan & Kemantren */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            Kel. {record.kelurahan_nama}
                          </div>
                          <div className="text-[11px] text-teal-700 font-medium">
                            Kem. {record.kemantren}
                          </div>
                        </td>

                        {/* Status PMT */}
                        <td className="py-3 px-4">
                          {record.status_pmt === 'Sudah' ? (
                            <div>
                              <span className="text-teal-800 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                                Sudah PMT
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Sumber: {record.sumber_pmt || 'Puskesmas'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 font-medium">Belum Menerima</span>
                          )}
                        </td>

                        {/* Indikator Kesehatan & Risiko */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            {record.is_risiko_stunting ? (
                              <span className="text-rose-700 font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                Ada Faktor Risiko
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Kondisi Terpantau Baik</span>
                            )}
                            <div className="text-slate-500 flex items-center gap-1">
                              {record.imt && <span className="tabular-nums">IMT: {record.imt}</span>}
                              {record.is_anemia && <span>· Anemia</span>}
                              {record.is_kek && <span>· KEK</span>}
                            </div>
                          </div>
                        </td>

                        {/* Petugas TPK */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700 truncate max-w-[130px]">
                            {record.petugas_nama}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ID: #{record.id}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onOpenDetailModal(record)}
                              title="Lihat Detail Lengkap"
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => exportSingleRecordPDF(record, currentUser)}
                              title="Unduh Lembar PDF Sasaran (Dokumentasi Offline)"
                              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-rose-600" />
                            </button>

                            {canEditOrDelete && (
                              <>
                                <button
                                  onClick={() => onOpenEditModal(record)}
                                  title="Edit Data"
                                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setRecordToDelete(record)}
                                  title="Hapus Data"
                                  className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View (Optimized for field officers on smartphones) */}
          <div className="md:hidden space-y-3">
            {filteredRecords.map(record => {
              const canEditOrDelete =
                currentUser.role === 'ADMIN' ||
                currentUser.id === record.created_by ||
                currentUser.kelurahan_id === record.kelurahan_id;

              const isChecked = selectedIds.includes(record.id);

              return (
                <div
                  key={record.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs space-y-3 transition-colors ${
                    isChecked ? 'border-teal-500 bg-teal-50/40' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(record.id)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-1 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              record.jenis_sasaran === 'CATIN'
                                ? 'bg-rose-100 text-rose-800'
                                : record.jenis_sasaran === 'BUFAS'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {record.jenis_sasaran}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm">{record.nama}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{record.alamat}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600 tabular-nums shrink-0">
                      {record.tanggal}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Wilayah (Kel. / Kem.)</span>
                      <span className="font-semibold text-slate-800">
                        {record.kelurahan_nama}
                      </span>
                      <span className="text-[10px] text-teal-700 block font-medium">
                        Kem. {record.kemantren}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Status PMT</span>
                      <span className="font-semibold text-slate-800">
                        {record.status_pmt === 'Sudah' ? `Sudah (${record.sumber_pmt || 'Puskesmas'})` : 'Belum'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Risiko Stunting</span>
                      <span
                        className={`font-semibold ${
                          record.is_risiko_stunting ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {record.is_risiko_stunting ? 'Ada Faktor Risiko' : 'Terpantau Baik'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Petugas</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {record.petugas_nama}
                      </span>
                    </div>
                  </div>

                  {/* Actions for mobile */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onOpenDetailModal(record)}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail Lengkap</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => exportSingleRecordPDF(record, currentUser)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Unduh Lembar PDF Offline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      {canEditOrDelete && (
                        <>
                          <button
                            onClick={() => onOpenEditModal(record)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(record)}
                            className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal (Single) */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Data</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data pendampingan {recordToDelete.jenis_sasaran} atas nama{' '}
              <span className="font-bold text-slate-900">{recordToDelete.nama}</span> di Kelurahan{' '}
              <span className="font-semibold text-slate-800">{recordToDelete.kelurahan_nama}</span>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Massal</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-red-600">{selectedIds.length} data pendampingan</span> yang dipilih secara permanen dari sistem?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isBulkDeleting ? 'Menghapus...' : `Ya, Hapus ${selectedIds.length} Data`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
