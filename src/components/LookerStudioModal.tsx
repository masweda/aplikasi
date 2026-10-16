import React, { useState } from 'react';
import {
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  Table,
  X,
} from 'lucide-react';
import { exportToLookerStudioCSV } from '../services/exportService';
import { UnifiedPendampingan, User } from '../types';

interface LookerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UnifiedPendampingan[];
  currentUser: User;
}

export const LookerStudioModal: React.FC<LookerStudioModalProps> = ({
  isOpen,
  onClose,
  data,
  currentUser,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formulas = [
    {
      title: 'Tingkat Cakupan PMT (PMT Coverage %)',
      key: 'pmt_rate',
      formula: 'SUM(is_pmt_flag) / COUNT(id_pendampingan)',
      desc: 'Menghitung persentase sasaran yang telah menerima intervensi makanan tambahan.',
    },
    {
      title: 'Prevalensi Risiko Anemia (%)',
      key: 'anemia_rate',
      formula: 'SUM(is_anemia_flag) / COUNT(id_pendampingan)',
      desc: 'Rasio sasaran berisiko anemia (Hb < 12 g/dL pada Catin atau < 11 g/dL pada Bumil).',
    },
    {
      title: 'Prevalensi Risiko KEK (%)',
      key: 'kek_rate',
      formula: 'SUM(is_kek_flag) / COUNT(id_pendampingan)',
      desc: 'Persentase wanita dengan Lingkar Lengan Atas (LiLA) < 23.5 cm.',
    },
    {
      title: 'Cakupan KB Pasca Persalinan (KBPP %)',
      key: 'kbpp_rate',
      formula: 'SUM(is_kbpp_flag) / COUNT(CASE WHEN jenis_sasaran = "BUFAS" THEN 1 ELSE NULL END)',
      desc: 'Proporsi ibu nifas yang menggunakan kontrasepsi modern pasca bersalin.',
    },
    {
      title: 'Total Sasaran Berisiko Stunting',
      key: 'stunting_count',
      formula: 'SUM(is_risiko_stunting_flag)',
      desc: 'Akumulasi sasaran dengan indikasi gizi kurang, anemia, rokok, atau BBLR.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Integrasi Google Looker Studio (Data Studio)
              </h2>
              <p className="text-xs text-slate-500">
                Panduan data pipeline dan formula kalkulasi siap pakai
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1 text-xs">
          {/* Quick CTA to Download Formatted Looker Dataset */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Dataset Siap Hubung ke Google Looker Studio</span>
              </h3>
              <p className="text-slate-600 mt-0.5 text-xs">
                Dataset CSV telah dinormalisasi dengan format tanggal ISO, kode numerik (0/1), dan dimensi geografis standard.
              </p>
            </div>
            <button
              onClick={() => exportToLookerStudioCSV(data, currentUser)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Looker</span>
            </button>
          </div>

          {/* 4 Steps Tutorial */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Langkah Menghubungkan ke Google Looker Studio:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-extrabold">
                    1
                  </span>
                  <span>Unduh Dataset CSV</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Klik tombol <strong>"Download CSV Looker"</strong> di atas untuk mendapatkan berkas data terstruktur.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-extrabold">
                    2
                  </span>
                  <span>Buka Google Looker Studio</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Buka{' '}
                  <a
                    href="https://lookerstudio.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    lookerstudio.google.com <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  , klik <strong>Create &gt; Data Source</strong>, lalu pilih <strong>File Upload (CSV)</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-extrabold">
                    3
                  </span>
                  <span>Konfirmasi Tipe Kolom</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Pastikan kolom <code>tanggal</code> dideteksi sebagai <em>Date (YYYY-MM-DD)</em> dan kolom <code>is_*_flag</code> bertipe <em>Numeric</em>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-extrabold">
                    4
                  </span>
                  <span>Buat Laporan / Visualisasi</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Tambahkan visualisasi peta, scorecard stunting, diagram lingkaran jenis sasaran, dan grafik batang per kelurahan.
                </p>
              </div>
            </div>
          </div>

          {/* Copyable Field Formulas */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Formula Kolom Kalkulasi (Calculated Fields) Siap Salin:
            </h3>

            <div className="space-y-2.5">
              {formulas.map(f => (
                <div key={f.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-slate-900">{f.title}</div>
                    <code className="block bg-slate-900 text-teal-400 p-2 rounded text-[11px] font-mono select-all">
                      {f.formula}
                    </code>
                    <p className="text-[11px] text-slate-500">{f.desc}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(f.formula, f.key)}
                    className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                    title="Salin Formula"
                  >
                    {copiedKey === f.key ? (
                      <Check className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Schema Dictionary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Kamus Data (Schema Dictionary):
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2 px-3">Nama Kolom</th>
                    <th className="py-2 px-3">Tipe di Looker</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-medium">tanggal</td>
                    <td className="py-1.5 px-3">Date (YYYYMMDD)</td>
                    <td className="py-1.5 px-3 text-slate-600">Tanggal pelaksanaan pendampingan</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-medium">kemantren</td>
                    <td className="py-1.5 px-3">Geo / Text</td>
                    <td className="py-1.5 px-3 text-slate-600">14 Kemantren di Kota Yogyakarta (Tingkat Kecamatan)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-medium">kelurahan</td>
                    <td className="py-1.5 px-3">Geo / Text</td>
                    <td className="py-1.5 px-3 text-slate-600">45 Kelurahan binaan TPK se-Kota Yogyakarta</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-medium">jenis_sasaran</td>
                    <td className="py-1.5 px-3">Text</td>
                    <td className="py-1.5 px-3 text-slate-600">CATIN, BUFAS, atau IBU_HAMIL</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-medium">is_pmt_flag</td>
                    <td className="py-1.5 px-3">Numeric (0/1)</td>
                    <td className="py-1.5 px-3 text-slate-600">1 jika sudah menerima PMT, 0 jika belum</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-medium">is_risiko_stunting_flag</td>
                    <td className="py-1.5 px-3">Numeric (0/1)</td>
                    <td className="py-1.5 px-3 text-slate-600">1 jika terdeteksi faktor risiko, 0 jika normal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Kompatibel dengan Google BigQuery, Google Sheets, dan Looker Studio
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
