import React, { useMemo, useState } from 'react';
import {
  BarChart2,
  Building2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  Layers,
  MapPin,
  Printer,
  Search,
} from 'lucide-react';
import { exportToExcel } from '../services/exportService';
import { KEMANTREN_LIST } from '../services/kemantrenData';
import { RekapitulasiRow, UnifiedPendampingan, User } from '../types';

interface RekapitulasiViewProps {
  rekapitulasi: RekapitulasiRow[];
  data: UnifiedPendampingan[];
  currentUser: User;
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({
  rekapitulasi,
  data,
  currentUser,
}) => {
  const [selectedKemantren, setSelectedKemantren] = useState<string>('all');
  const [searchKelurahan, setSearchKelurahan] = useState<string>('');
  const [viewMode, setViewMode] = useState<'hierarki' | 'agregat'>('hierarki');

  // Filtered rows for 45 Kelurahan
  const filteredKelurahanRows = useMemo(() => {
    return rekapitulasi.filter(r => {
      const kem = r.kemantren || r.kecamatan;
      if (selectedKemantren !== 'all' && kem.toLowerCase() !== selectedKemantren.toLowerCase()) {
        return false;
      }
      if (searchKelurahan.trim()) {
        const q = searchKelurahan.toLowerCase();
        const matchesKel = r.kelurahan_nama.toLowerCase().includes(q);
        const matchesKem = kem.toLowerCase().includes(q);
        if (!matchesKel && !matchesKem) return false;
      }
      return true;
    });
  }, [rekapitulasi, selectedKemantren, searchKelurahan]);

  // Grouped rows by Kemantren
  const groupedByKemantren = useMemo(() => {
    const map = new Map<string, RekapitulasiRow[]>();
    filteredKelurahanRows.forEach(r => {
      const kem = r.kemantren || r.kecamatan;
      if (!map.has(kem)) {
        map.set(kem, []);
      }
      map.get(kem)!.push(r);
    });
    return map;
  }, [filteredKelurahanRows]);

  // Aggregate rows per 14 Kemantren
  const kemantrenAggregates = useMemo(() => {
    return KEMANTREN_LIST.map(kem => {
      const matchingRows = rekapitulasi.filter(
        r => (r.kemantren || r.kecamatan).toLowerCase() === kem.toLowerCase()
      );
      const subtotal = matchingRows.reduce(
        (acc, r) => ({
          kelurahanCount: acc.kelurahanCount + 1,
          catin: acc.catin + r.total_catin,
          catin_anemia: acc.catin_anemia + r.catin_anemia,
          catin_kek: acc.catin_kek + r.catin_kek,
          catin_pmt: acc.catin_pmt + r.catin_pmt,
          bufas: acc.bufas + r.total_bufas,
          bufas_kbpp: acc.bufas_kbpp + r.bufas_kbpp,
          bufas_pmt: acc.bufas_pmt + r.bufas_pmt,
          bumil: acc.bumil + r.total_bumil,
          bumil_anemia: acc.bumil_anemia + r.bumil_anemia,
          bumil_kek: acc.bumil_kek + r.bumil_kek,
          bumil_pmt: acc.bumil_pmt + r.bumil_pmt,
          total: acc.total + r.total_pendampingan,
        }),
        {
          kelurahanCount: 0,
          catin: 0,
          catin_anemia: 0,
          catin_kek: 0,
          catin_pmt: 0,
          bufas: 0,
          bufas_kbpp: 0,
          bufas_pmt: 0,
          bumil: 0,
          bumil_anemia: 0,
          bumil_kek: 0,
          bumil_pmt: 0,
          total: 0,
        }
      );

      return {
        kemantren: kem,
        ...subtotal,
      };
    }).filter(item => {
      if (selectedKemantren !== 'all' && item.kemantren.toLowerCase() !== selectedKemantren.toLowerCase()) {
        return false;
      }
      if (searchKelurahan.trim()) {
        const q = searchKelurahan.toLowerCase();
        return item.kemantren.toLowerCase().includes(q);
      }
      return true;
    });
  }, [rekapitulasi, selectedKemantren, searchKelurahan]);

  // Aggregate grand totals of current active filter
  const grandTotal = useMemo(() => {
    return filteredKelurahanRows.reduce(
      (acc, r) => ({
        catin: acc.catin + r.total_catin,
        catin_anemia: acc.catin_anemia + r.catin_anemia,
        catin_kek: acc.catin_kek + r.catin_kek,
        catin_pmt: acc.catin_pmt + r.catin_pmt,

        bufas: acc.bufas + r.total_bufas,
        bufas_kbpp: acc.bufas_kbpp + r.bufas_kbpp,
        bufas_pmt: acc.bufas_pmt + r.bufas_pmt,

        bumil: acc.bumil + r.total_bumil,
        bumil_anemia: acc.bumil_anemia + r.bumil_anemia,
        bumil_kek: acc.bumil_kek + r.bumil_kek,
        bumil_pmt: acc.bumil_pmt + r.bumil_pmt,

        total: acc.total + r.total_pendampingan,
      }),
      {
        catin: 0,
        catin_anemia: 0,
        catin_kek: 0,
        catin_pmt: 0,
        bufas: 0,
        bufas_kbpp: 0,
        bufas_pmt: 0,
        bumil: 0,
        bumil_anemia: 0,
        bumil_kek: 0,
        bumil_pmt: 0,
        total: 0,
      }
    );
  }, [filteredKelurahanRows]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Rekapitulasi Wilayah &amp; Intervensi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hierarki 14 Kemantren &amp; 45 Kelurahan se-Kota Yogyakarta · Agregat Stunting, Anemia, KEK, KBPP, &amp; PMT
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Rekap</span>
          </button>

          <button
            onClick={() => exportToExcel(data, rekapitulasi, currentUser)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Rekap Excel (Lengkap)</span>
          </button>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">Total Sasaran</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{grandTotal.total}</span>
          <span className="text-xs text-slate-500 block mt-1">
            {selectedKemantren === 'all'
              ? '45 Kelurahan di 14 Kemantren'
              : `Kelurahan di Kem. ${selectedKemantren}`}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-rose-600 block uppercase">Risiko Anemia (Hb Rendah)</span>
          <span className="text-2xl font-bold text-rose-600 tabular-nums">
            {grandTotal.catin_anemia + grandTotal.bumil_anemia}
          </span>
          <span className="text-xs text-slate-500 block mt-1">
            Catin ({grandTotal.catin_anemia}) + Bumil ({grandTotal.bumil_anemia})
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-amber-600 block uppercase">Risiko KEK (LiLA &lt; 23.5cm)</span>
          <span className="text-2xl font-bold text-amber-600 tabular-nums">
            {grandTotal.catin_kek + grandTotal.bumil_kek}
          </span>
          <span className="text-xs text-slate-500 block mt-1">Prioritas suplementasi PMT</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-teal-700 block uppercase">Cakupan PMT</span>
          <span className="text-2xl font-bold text-teal-700 tabular-nums">
            {grandTotal.catin_pmt + grandTotal.bufas_pmt + grandTotal.bumil_pmt}
          </span>
          <span className="text-xs text-slate-500 block mt-1">Paket makanan tambahan tersalur</span>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('hierarki')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'hierarki'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              <span>Hierarki 45 Kelurahan</span>
            </button>
            <button
              onClick={() => setViewMode('agregat')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'agregat'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Agregat 14 Kemantren</span>
            </button>
          </div>

          {/* Kemantren Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedKemantren}
              onChange={e => setSelectedKemantren(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Kemantren (14)</option>
              {KEMANTREN_LIST.map(kem => (
                <option key={kem} value={kem}>
                  Kemantren {kem}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kelurahan / kemantren..."
            value={searchKelurahan}
            onChange={e => setSearchKelurahan(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Recapitulation Matrix Table */}
      {viewMode === 'hierarki' ? (
        /* HIERARCHICAL KELURAHAN VIEW GROUPED BY KEMANTREN */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th rowSpan={2} className="py-3 px-4 border-r border-slate-200 bg-slate-50 min-w-[200px]">
                    Wilayah (Kemantren &amp; Kelurahan)
                  </th>
                  <th colSpan={4} className="py-2 px-3 text-center border-r border-slate-200 bg-rose-50/50 text-rose-900">
                    1. Calon Pengantin (CATIN)
                  </th>
                  <th colSpan={3} className="py-2 px-3 text-center border-r border-slate-200 bg-amber-50/50 text-amber-900">
                    2. Ibu Nifas (BUFAS)
                  </th>
                  <th colSpan={4} className="py-2 px-3 text-center border-r border-slate-200 bg-blue-50/50 text-blue-900">
                    3. Ibu Hamil (BUMIL)
                  </th>
                  <th rowSpan={2} className="py-3 px-4 text-center bg-teal-50 text-teal-900 font-bold">
                    Total
                  </th>
                </tr>
                <tr className="border-t border-slate-200 bg-slate-50/60 text-[10px]">
                  {/* Catin */}
                  <th className="py-1.5 px-2.5 text-center">Total</th>
                  <th className="py-1.5 px-2.5 text-center text-rose-700">Anemia</th>
                  <th className="py-1.5 px-2.5 text-center text-amber-700">KEK</th>
                  <th className="py-1.5 px-2.5 text-center text-teal-800 border-r border-slate-200">PMT</th>

                  {/* Bufas */}
                  <th className="py-1.5 px-2.5 text-center">Total</th>
                  <th className="py-1.5 px-2.5 text-center text-emerald-700">KBPP</th>
                  <th className="py-1.5 px-2.5 text-center text-teal-800 border-r border-slate-200">PMT</th>

                  {/* Bumil */}
                  <th className="py-1.5 px-2.5 text-center">Total</th>
                  <th className="py-1.5 px-2.5 text-center text-rose-700">Anemia</th>
                  <th className="py-1.5 px-2.5 text-center text-amber-700">KEK</th>
                  <th className="py-1.5 px-2.5 text-center text-teal-800 border-r border-slate-200">PMT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from(groupedByKemantren.entries()).map(([kemantren, rows]) => {
                  // Subtotal for this kemantren
                  const kemTotal = rows.reduce(
                    (acc, r) => ({
                      catin: acc.catin + r.total_catin,
                      catin_anemia: acc.catin_anemia + r.catin_anemia,
                      catin_kek: acc.catin_kek + r.catin_kek,
                      catin_pmt: acc.catin_pmt + r.catin_pmt,
                      bufas: acc.bufas + r.total_bufas,
                      bufas_kbpp: acc.bufas_kbpp + r.bufas_kbpp,
                      bufas_pmt: acc.bufas_pmt + r.bufas_pmt,
                      bumil: acc.bumil + r.total_bumil,
                      bumil_anemia: acc.bumil_anemia + r.bumil_anemia,
                      bumil_kek: acc.bumil_kek + r.bumil_kek,
                      bumil_pmt: acc.bumil_pmt + r.bumil_pmt,
                      total: acc.total + r.total_pendampingan,
                    }),
                    {
                      catin: 0,
                      catin_anemia: 0,
                      catin_kek: 0,
                      catin_pmt: 0,
                      bufas: 0,
                      bufas_kbpp: 0,
                      bufas_pmt: 0,
                      bumil: 0,
                      bumil_anemia: 0,
                      bumil_kek: 0,
                      bumil_pmt: 0,
                      total: 0,
                    }
                  );

                  return (
                    <React.Fragment key={kemantren}>
                      {/* Kemantren Header Row */}
                      <tr className="bg-teal-900 text-white font-bold text-xs tracking-wide">
                        <td colSpan={13} className="py-2.5 px-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-teal-300" />
                              <span>KEMANTREN {kemantren.toUpperCase()}</span>
                              <span className="text-[10px] font-normal text-teal-200">
                                ({rows.length} Kelurahan)
                              </span>
                            </span>
                            <span className="text-xs font-semibold text-teal-200">
                              Subtotal Wilayah: {kemTotal.total} sasaran
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Kelurahan Rows within Kemantren */}
                      {rows.map(row => (
                        <tr key={row.kelurahan_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-100 pl-7">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              <span>Kel. {row.kelurahan_nama}</span>
                            </div>
                          </td>

                          {/* Catin */}
                          <td className="py-2 px-2.5 text-center tabular-nums font-semibold text-slate-800">{row.total_catin}</td>
                          <td className="py-2 px-2.5 text-center tabular-nums text-rose-700 font-medium">{row.catin_anemia}</td>
                          <td className="py-2 px-2.5 text-center tabular-nums text-amber-700 font-medium">{row.catin_kek}</td>
                          <td className="py-2 px-2.5 text-center tabular-nums text-teal-800 font-medium border-r border-slate-100">
                            {row.catin_pmt}
                          </td>

                          {/* Bufas */}
                          <td className="py-2 px-2.5 text-center tabular-nums font-semibold text-slate-800">{row.total_bufas}</td>
                          <td className="py-2 px-2.5 text-center tabular-nums text-emerald-700 font-medium">{row.bufas_kbpp}</td>
                          <td className="py-2 px-2.5 text-center tabular-nums text-teal-800 font-medium border-r border-slate-100">
                            {row.bufas_pmt}
                          </td>

                          {/* Bumil */}
                          <td className="py-2 px-2.5 text-center tabular-nums font-semibold text-slate-800">{row.total_bumil}</td>
                          <td className="py-2 px-2.5 text-center tabular-nums text-rose-700 font-medium">{row.bumil_anemia}</td>
                          <td className="py-2 px-2.5 text-center tabular-nums text-amber-700 font-medium">{row.bumil_kek}</td>
                          <td className="py-2 px-2.5 text-center tabular-nums text-teal-800 font-medium border-r border-slate-100">
                            {row.bumil_pmt}
                          </td>

                          {/* Total */}
                          <td className="py-2 px-4 text-center tabular-nums font-bold text-slate-900 bg-teal-50/40">
                            {row.total_pendampingan}
                          </td>
                        </tr>
                      ))}

                      {/* Kemantren Subtotal Row */}
                      <tr className="bg-slate-100/90 font-semibold text-[11px] text-slate-800 border-b-2 border-slate-200">
                        <td className="py-2 px-4 border-r border-slate-200 font-bold text-teal-900 pl-7">
                          Subtotal Kemantren {kemantren}
                        </td>
                        <td className="py-2 px-2.5 text-center tabular-nums font-bold">{kemTotal.catin}</td>
                        <td className="py-2 px-2.5 text-center tabular-nums text-rose-700">{kemTotal.catin_anemia}</td>
                        <td className="py-2 px-2.5 text-center tabular-nums text-amber-700">{kemTotal.catin_kek}</td>
                        <td className="py-2 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-200">{kemTotal.catin_pmt}</td>

                        <td className="py-2 px-2.5 text-center tabular-nums font-bold">{kemTotal.bufas}</td>
                        <td className="py-2 px-2.5 text-center tabular-nums text-emerald-700">{kemTotal.bufas_kbpp}</td>
                        <td className="py-2 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-200">{kemTotal.bufas_pmt}</td>

                        <td className="py-2 px-2.5 text-center tabular-nums font-bold">{kemTotal.bumil}</td>
                        <td className="py-2 px-2.5 text-center tabular-nums text-rose-700">{kemTotal.bumil_anemia}</td>
                        <td className="py-2 px-2.5 text-center tabular-nums text-amber-700">{kemTotal.bumil_kek}</td>
                        <td className="py-2 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-200">{kemTotal.bumil_pmt}</td>

                        <td className="py-2 px-4 text-center tabular-nums font-bold text-teal-950 bg-teal-100/50">
                          {kemTotal.total}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-200/90 font-bold border-t-2 border-slate-400 text-slate-900 text-xs">
                <tr>
                  <td className="py-3 px-4 border-r border-slate-300 font-extrabold">TOTAL KESELURUHAN</td>
                  <td className="py-3 px-2.5 text-center tabular-nums font-extrabold">{grandTotal.catin}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-rose-700">{grandTotal.catin_anemia}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-amber-700">{grandTotal.catin_kek}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-300">{grandTotal.catin_pmt}</td>

                  <td className="py-3 px-2.5 text-center tabular-nums font-extrabold">{grandTotal.bufas}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-emerald-700">{grandTotal.bufas_kbpp}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-300">{grandTotal.bufas_pmt}</td>

                  <td className="py-3 px-2.5 text-center tabular-nums font-extrabold">{grandTotal.bumil}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-rose-700">{grandTotal.bumil_anemia}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-amber-700">{grandTotal.bumil_kek}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-300">{grandTotal.bumil_pmt}</td>

                  <td className="py-3 px-4 text-center tabular-nums bg-teal-200/80 text-teal-950 font-black text-sm">
                    {grandTotal.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* AGGREGATE 14 KEMANTREN VIEW */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th rowSpan={2} className="py-3 px-4 border-r border-slate-200 bg-slate-50 min-w-[180px]">
                    14 Kemantren (Kecamatan)
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center border-r border-slate-200 bg-slate-50">
                    Jml Kelurahan
                  </th>
                  <th colSpan={4} className="py-2 px-3 text-center border-r border-slate-200 bg-rose-50/50 text-rose-900">
                    1. Calon Pengantin (CATIN)
                  </th>
                  <th colSpan={3} className="py-2 px-3 text-center border-r border-slate-200 bg-amber-50/50 text-amber-900">
                    2. Ibu Nifas (BUFAS)
                  </th>
                  <th colSpan={4} className="py-2 px-3 text-center border-r border-slate-200 bg-blue-50/50 text-blue-900">
                    3. Ibu Hamil (BUMIL)
                  </th>
                  <th rowSpan={2} className="py-3 px-4 text-center bg-teal-50 text-teal-900 font-bold">
                    Total Sasaran
                  </th>
                </tr>
                <tr className="border-t border-slate-200 bg-slate-50/60 text-[10px]">
                  {/* Catin */}
                  <th className="py-1.5 px-2.5 text-center">Total</th>
                  <th className="py-1.5 px-2.5 text-center text-rose-700">Anemia</th>
                  <th className="py-1.5 px-2.5 text-center text-amber-700">KEK</th>
                  <th className="py-1.5 px-2.5 text-center text-teal-800 border-r border-slate-200">PMT</th>

                  {/* Bufas */}
                  <th className="py-1.5 px-2.5 text-center">Total</th>
                  <th className="py-1.5 px-2.5 text-center text-emerald-700">KBPP</th>
                  <th className="py-1.5 px-2.5 text-center text-teal-800 border-r border-slate-200">PMT</th>

                  {/* Bumil */}
                  <th className="py-1.5 px-2.5 text-center">Total</th>
                  <th className="py-1.5 px-2.5 text-center text-rose-700">Anemia</th>
                  <th className="py-1.5 px-2.5 text-center text-amber-700">KEK</th>
                  <th className="py-1.5 px-2.5 text-center text-teal-800 border-r border-slate-200">PMT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kemantrenAggregates.map((item, idx) => (
                  <tr key={item.kemantren} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>Kemantren {item.kemantren}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center border-r border-slate-100 font-semibold text-slate-600">
                      {item.kelurahanCount} Kel.
                    </td>

                    {/* Catin */}
                    <td className="py-3 px-2.5 text-center tabular-nums font-semibold text-slate-800">{item.catin}</td>
                    <td className="py-3 px-2.5 text-center tabular-nums text-rose-700 font-medium">{item.catin_anemia}</td>
                    <td className="py-3 px-2.5 text-center tabular-nums text-amber-700 font-medium">{item.catin_kek}</td>
                    <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 font-medium border-r border-slate-100">
                      {item.catin_pmt}
                    </td>

                    {/* Bufas */}
                    <td className="py-3 px-2.5 text-center tabular-nums font-semibold text-slate-800">{item.bufas}</td>
                    <td className="py-3 px-2.5 text-center tabular-nums text-emerald-700 font-medium">{item.bufas_kbpp}</td>
                    <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 font-medium border-r border-slate-100">
                      {item.bufas_pmt}
                    </td>

                    {/* Bumil */}
                    <td className="py-3 px-2.5 text-center tabular-nums font-semibold text-slate-800">{item.bumil}</td>
                    <td className="py-3 px-2.5 text-center tabular-nums text-rose-700 font-medium">{item.bumil_anemia}</td>
                    <td className="py-3 px-2.5 text-center tabular-nums text-amber-700 font-medium">{item.bumil_kek}</td>
                    <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 font-medium border-r border-slate-100">
                      {item.bumil_pmt}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-center tabular-nums font-extrabold text-teal-950 bg-teal-50/50">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-200/90 font-bold border-t-2 border-slate-400 text-slate-900 text-xs">
                <tr>
                  <td className="py-3 px-4 border-r border-slate-300 font-extrabold">TOTAL 14 KEMANTREN</td>
                  <td className="py-3 px-3 text-center border-r border-slate-300 font-bold">45 Kel.</td>
                  <td className="py-3 px-2.5 text-center tabular-nums font-extrabold">{grandTotal.catin}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-rose-700">{grandTotal.catin_anemia}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-amber-700">{grandTotal.catin_kek}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-300">{grandTotal.catin_pmt}</td>

                  <td className="py-3 px-2.5 text-center tabular-nums font-extrabold">{grandTotal.bufas}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-emerald-700">{grandTotal.bufas_kbpp}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-300">{grandTotal.bufas_pmt}</td>

                  <td className="py-3 px-2.5 text-center tabular-nums font-extrabold">{grandTotal.bumil}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-rose-700">{grandTotal.bumil_anemia}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-amber-700">{grandTotal.bumil_kek}</td>
                  <td className="py-3 px-2.5 text-center tabular-nums text-teal-800 border-r border-slate-300">{grandTotal.bumil_pmt}</td>

                  <td className="py-3 px-4 text-center tabular-nums bg-teal-200/80 text-teal-950 font-black text-sm">
                    {grandTotal.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
