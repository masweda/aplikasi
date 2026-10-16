import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  Filter,
  MapPin,
  Search,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Building2,
  MessageSquare,
} from 'lucide-react';
import { UnifiedPendampingan, Kelurahan, RekapitulasiRow, User } from '../types';
import { exportToExcel } from '../services/exportService';

interface LaporanViewProps {
  data: UnifiedPendampingan[];
  kelurahanList: Kelurahan[];
  rekapitulasi: RekapitulasiRow[];
  currentUser: User;
  onOpenDetailModal: (record: UnifiedPendampingan) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  data,
  kelurahanList,
  rekapitulasi,
  currentUser,
  onOpenDetailModal,
}) => {
  const [periodeType, setperiodeType] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // YYYY-MM
  );
  const [selectedKelurahanFilter, setSelectedKelurahanFilter] = useState<string>('all');
  const [selectedJenisSasaran, setSelectedJenisSasaran] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // If TPK Officer, restrict kelurahan to their own
  const effectiveData = useMemo(() => {
    let list = data;
    if (currentUser.role === 'PETUGAS_TPK' && currentUser.kelurahan_id) {
      list = list.filter(item => item.kelurahan_id === currentUser.kelurahan_id);
    }
    return list;
  }, [data, currentUser]);

  // Filter records based on period (harian, mingguan, bulanan)
  const periodFilteredData = useMemo(() => {
    return effectiveData.filter(item => {
      // 1. Kelurahan filter (for admin)
      if (
        currentUser.role === 'ADMIN' &&
        selectedKelurahanFilter !== 'all' &&
        item.kelurahan_id.toString() !== selectedKelurahanFilter
      ) {
        return false;
      }

      // 2. Jenis Sasaran filter
      if (selectedJenisSasaran !== 'all' && item.jenis_sasaran !== selectedJenisSasaran) {
        return false;
      }

      // 3. Status filter
      if (selectedStatus !== 'all' && item.status_kunjungan !== selectedStatus) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.nama.toLowerCase().includes(q);
        const matchesAlamat = item.alamat.toLowerCase().includes(q);
        const matchesNotes = item.catatan_kunjungan.toLowerCase().includes(q);
        const matchesPetugas = item.petugas_nama.toLowerCase().includes(q);
        const matchesKel = item.kelurahan_nama.toLowerCase().includes(q);
        if (!matchesName && !matchesAlamat && !matchesNotes && !matchesPetugas && !matchesKel) {
          return false;
        }
      }

      // 5. Period filtering (harian, mingguan, bulanan based on item.tanggal)
      const itemDateStr = item.tanggal; // YYYY-MM-DD
      if (!itemDateStr) return false;

      if (periodeType === 'harian') {
        return itemDateStr === selectedDate;
      } else if (periodeType === 'bulanan') {
        return itemDateStr.startsWith(selectedMonth);
      } else if (periodeType === 'mingguan') {
        const itemTime = new Date(itemDateStr).getTime();
        const refTime = new Date(selectedDate).getTime();
        const diffDays = (refTime - itemTime) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }

      return true;
    });
  }, [
    effectiveData,
    currentUser,
    selectedKelurahanFilter,
    selectedJenisSasaran,
    selectedStatus,
    searchQuery,
    periodeType,
    selectedDate,
    selectedMonth,
  ]);

  // Summary statistics for the filtered period
  const stats = useMemo(() => {
    const total = periodFilteredData.length;
    const catin = periodFilteredData.filter(i => i.jenis_sasaran === 'CATIN').length;
    const ibuHamil = periodFilteredData.filter(i => i.jenis_sasaran === 'IBU_HAMIL').length;
    const bufas = periodFilteredData.filter(i => i.jenis_sasaran === 'BUFAS').length;

    const selesai = periodFilteredData.filter(i => i.status_kunjungan === 'Selesai').length;
    const rujukan = periodFilteredData.filter(i => i.status_kunjungan === 'Perlu Rujukan').length;
    const jadwalUlang = periodFilteredData.filter(i => i.status_kunjungan === 'Jadwal Ulang').length;

    const risikoStunting = periodFilteredData.filter(i => i.is_risiko_stunting).length;
    const pmtSudah = periodFilteredData.filter(i => i.status_pmt === 'Sudah').length;

    return {
      total,
      catin,
      ibuHamil,
      bufas,
      selesai,
      rujukan,
      jadwalUlang,
      risikoStunting,
      pmtSudah,
    };
  }, [periodFilteredData]);

  const handleExportExcel = () => {
    exportToExcel(periodFilteredData, rekapitulasi, currentUser);
  };

  const handleCopyWhatsApp = () => {
    const dateObj = new Date(selectedDate);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('id-ID', options);

    const bumilList = periodFilteredData.filter(i => i.jenis_sasaran === 'IBU_HAMIL');
    const catinList = periodFilteredData.filter(i => i.jenis_sasaran === 'CATIN');
    const bufasList = periodFilteredData.filter(i => i.jenis_sasaran === 'BUFAS');

    let text = `LAPORAN PENDAMPINGAN TPK\n${formattedDate}\n\nBUMIL :`;
    if (bumilList.length === 0) {
      text += ` 0`;
    } else {
      text += `\n` + bumilList.map((item, idx) => {
        const d = item.ibu_hamil_data;
        const usia = d?.usia ? `usia: ${d.usia} th` : '';
        const bb = d?.berat_badan ? `BB: ${d.berat_badan}` : '';
        const tb = d?.tinggi_badan ? `TB: ${d.tinggi_badan}` : '';
        const rokok = d?.merokok_terpapar === 'Ya' ? 'paparan asap rokok' : 'tidak terpapar asap rokok';
        const hb = d?.kadar_hb ? `Hb: ${d.kadar_hb}` : '';
        const lila = d?.lila ? `LiLA: ${d.lila}` : '';
        const riwayat = 'tidak ada riwayat penyakit';
        const usiaKehamilan = d?.usia_kehamilan_minggu ? `${d.usia_kehamilan_minggu} MINGGU` : '';
        
        const riskReasons: string[] = [];
        if (d && d.kadar_hb < 11) riskReasons.push('Hb<11 anemia');
        if (d && d.lila < 23.5) riskReasons.push('KEK');
        if (d && d.merokok_terpapar === 'Ya') riskReasons.push('paparan asap rokok');
        if (d && d.usia > 35) riskReasons.push('usia>35');
        if (item.catatan_kunjungan && item.catatan_kunjungan.toLowerCase().includes('4t')) riskReasons.push('4T');

        const risikoStr = item.is_risiko_stunting || riskReasons.length > 0
          ? `(Berisiko: ${riskReasons.length > 0 ? riskReasons.join(', ') : (item.catatan_kunjungan || 'risiko stunting')})`
          : '';

        const alamat = `${item.alamat || ''}, ${item.kelurahan_nama}`;

        const parts = [
          item.nama,
          usia ? `usia: ${usia}` : '',
          bb,
          tb,
          rokok,
          hb,
          lila ? `${lila} cm` : '',
          riwayat,
          usiaKehamilan,
          risikoStr,
          alamat
        ].filter(Boolean);

        const prefix = bumilList.length > 1 ? `${idx + 1}. ` : '';
        return `${prefix}${parts.join(', ')}`;
      }).join('\n');
    }

    text += `\n\nCATIN :`;
    if (catinList.length === 0) {
      text += ` 0`;
    } else {
      text += `\n` + catinList.map((item, idx) => {
        const d = item.catin_data;
        const usia = d?.usia ? `Usia: ${d.usia}` : '';
        const tb = d?.tinggi_badan ? `TB: ${d.tinggi_badan}` : '';
        const bb = d?.berat_badan ? `BB: ${d.berat_badan}` : '';
        const hb = d?.kadar_hb ? `Hb: ${d.kadar_hb}` : '';
        const lila = d?.lila ? `LiLA: ${d.lila}` : '';
        const rokok = d?.merokok_terpapar === 'Ya' ? 'Paparan asap rokok' : 'Tidak terpapar asap rokok';

        const riskReasons: string[] = [];
        if (d && d.kadar_hb < 12) riskReasons.push('Hb<12 anemia');
        if (d && d.lila < 23.5) riskReasons.push('KEK');
        if (d && d.merokok_terpapar === 'Ya') riskReasons.push('paparan asap rokok');
        if (d && d.usia > 35) riskReasons.push('4T usia> 35');

        const risikoStr = item.is_risiko_stunting || riskReasons.length > 0
          ? `(Berisiko: ${riskReasons.join(', ')})`
          : '';

        const alamat = `${item.alamat || ''}, ${item.kelurahan_nama}`;

        const parts = [
          item.nama,
          usia,
          tb,
          bb,
          hb,
          lila,
          rokok,
          risikoStr,
          alamat
        ].filter(Boolean);

        const prefix = catinList.length > 1 ? `${idx + 1}. ` : '';
        return `${prefix}${parts.join(', ')}`;
      }).join('\n');
    }

    text += `\n\nBUFAS :`;
    if (bufasList.length === 0) {
      text += ` 0`;
    } else {
      text += `\n` + bufasList.map((item, idx) => {
        const d = item.bufas_data;
        const bbl = d?.bbl ? `BBL Bayi: ${d.bbl}gr` : '';
        const pbl = d?.pbl ? `PBL Bayi: ${d.pbl}cm` : '';
        const persalinan = d?.metode_persalinan ? `Persalinan ${d.metode_persalinan.replace(' (Spontan)', '')}` : '';
        const uk = d?.usia_kehamilan_saat_lahir ? `UK: ${d.usia_kehamilan_saat_lahir} minggu` : '';
        const kbpp = d?.status_kbpp === 'Belum' ? 'Belum KBPP' : 'Sudah KBPP';

        const riskReasons: string[] = [];
        if (d && d.pbl < 48) riskReasons.push('PB<48cm');
        if (d && d.bbl < 2500) riskReasons.push('BBL<2500gr');
        if (d && d.status_kbpp === 'Belum') riskReasons.push('Belum KBPP');

        const risikoStr = riskReasons.length > 0 ? `(Berisiko: ${riskReasons.join(', ')})` : '';
        const alamat = `${item.alamat || ''}, ${item.kelurahan_nama}`;

        const parts = [
          item.nama,
          bbl,
          pbl,
          persalinan,
          uk,
          kbpp,
          risikoStr,
          alamat
        ].filter(Boolean);

        const prefix = bufasList.length > 1 ? `${idx + 1}. ` : '';
        return `${prefix}${parts.join(', ')}`;
      }).join('\n');
    }

    navigator.clipboard.writeText(text);
    alert('Laporan berhasil disalin ke format WhatsApp!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/40 text-teal-200 text-xs font-semibold mb-2 border border-teal-600/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>Dashboard Laporan Pendampingan TPK</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Laporan {periodeType === 'harian' ? 'Harian' : periodeType === 'mingguan' ? 'Mingguan' : 'Bulanan'}
            </h1>
            <p className="text-teal-100 text-sm mt-1 max-w-2xl">
              {currentUser.role === 'ADMIN'
                ? 'Menampilkan rekapitulasi laporan pendampingan seluruh wilayah Kota Yogyakarta.'
                : `Menampilkan rekapitulasi laporan khusus wilayah kerja Kelurahan ${currentUser.kelurahan_nama || 'Anda'}.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Salin Format WhatsApp</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Laporan Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Period Selection & Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Period Toggle Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setperiodeType('harian')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                periodeType === 'harian'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan Harian
            </button>
            <button
              onClick={() => setperiodeType('mingguan')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                periodeType === 'mingguan'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan Mingguan
            </button>
            <button
              onClick={() => setperiodeType('bulanan')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                periodeType === 'bulanan'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan Bulanan
            </button>
          </div>

          {/* Date or Month Picker */}
          <div className="flex items-center gap-2">
            {periodeType === 'bulanan' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Pilih Bulan:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Pilih Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Additional Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Kelurahan filter for Admin */}
          {currentUser.role === 'ADMIN' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Filter Kelurahan
              </label>
              <select
                value={selectedKelurahanFilter}
                onChange={e => setSelectedKelurahanFilter(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">Semua Kelurahan (Kota Jogja)</option>
                {kelurahanList.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.kemantren})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Jenis Sasaran */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Jenis Sasaran
            </label>
            <select
              value={selectedJenisSasaran}
              onChange={e => setSelectedJenisSasaran(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Jenis Sasaran</option>
              <option value="CATIN">Catin (Calon Pengantin)</option>
              <option value="IBU_HAMIL">Ibu Hamil</option>
              <option value="BUFAS">Ibu Nifas (Bufas)</option>
            </select>
          </div>

          {/* Status Kunjungan */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Status Kunjungan
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Perlu Rujukan">Perlu Rujukan</option>
              <option value="Jadwal Ulang">Jadwal Ulang</option>
            </select>
          </div>

          {/* Search query */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Cari Data Sasaran / Petugas
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Nama, alamat, petugas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Laporan</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <p className="text-[11px] text-teal-600 font-medium mt-1">Periode aktif</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Catin</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.catin}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Calon Pengantin</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ibu Hamil</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats.ibuHamil}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Sasaran Bumil</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bufas</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.bufas}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Ibu Nifas</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Perlu Rujukan</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.rujukan}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Butuh Tindak Lanjut</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Risiko Stunting</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.risikoStunting}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Perlu Perhatian</p>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daftar Rincian Laporan Pendampingan
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {periodFilteredData.length} catatan pendampingan sesuai filter periode.
            </p>
          </div>
        </div>

        {periodFilteredData.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">Tidak ada data laporan ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">
              Coba ubah filter periode, tanggal, atau wilayah kerja Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Sasaran & Wilayah</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Status & Risiko</th>
                  <th className="py-3 px-4">Catatan Kunjungan</th>
                  <th className="py-3 px-4">Petugas TPK</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {periodFilteredData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{item.tanggal}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Kunjungan ke-{item.kunjungan_ke}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.nama}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {item.kelurahan_nama}, {item.kemantren}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.jenis_sasaran === 'CATIN'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : item.jenis_sasaran === 'IBU_HAMIL'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.jenis_sasaran}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            item.status_kunjungan === 'Selesai'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status_kunjungan === 'Perlu Rujukan'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {item.status_kunjungan === 'Selesai' && <CheckCircle2 className="w-3 h-3" />}
                          {item.status_kunjungan === 'Perlu Rujukan' && <AlertTriangle className="w-3 h-3" />}
                          {item.status_kunjungan === 'Jadwal Ulang' && <RotateCcw className="w-3 h-3" />}
                          <span>{item.status_kunjungan}</span>
                        </span>
                        {item.is_risiko_stunting && (
                          <div className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded inline-block">
                            ⚠ Risiko Stunting
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-700 line-clamp-2">{item.catatan_kunjungan}</p>
                      {item.catatan_singkat && item.catatan_singkat.length > 0 && (
                        <p className="text-[11px] text-teal-700 font-medium mt-1">
                          + {item.catatan_singkat.length} log catatan singkat terbaru
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{item.petugas_nama}</div>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onOpenDetailModal(item)}
                        title="Lihat Detail & Dossier"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
