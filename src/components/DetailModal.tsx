import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Baby,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  FileEdit,
  FileText,
  Heart,
  Loader2,
  Locate,
  MapPin,
  MessageSquare,
  Navigation,
  NotebookPen,
  Phone,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  User,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import {
  CatatanSingkat,
  KategoriCatatanSingkat,
  UnifiedPendampingan,
  User as UserType,
} from '../types';
import { exportSingleRecordPDF } from '../services/exportService';
import { PendampinganProgressBar } from './PendampinganProgressBar';
import { dbService } from '../services/database';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: UnifiedPendampingan | null;
  onEdit: (record: UnifiedPendampingan) => void;
  currentUser?: UserType | null;
  onRecordUpdated?: (updatedRecord: UnifiedPendampingan) => void;
}

const KATEGORI_CONFIG: Record<
  KategoriCatatanSingkat,
  { label: string; badgeClass: string; borderClass: string; icon: React.FC<{ className?: string }> }
> = {
  Progres: {
    label: 'Progres',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderClass: 'border-l-emerald-500',
    icon: CheckCircle2,
  },
  Kendala: {
    label: 'Kendala',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    borderClass: 'border-l-rose-500',
    icon: AlertTriangle,
  },
  'Tindak Lanjut': {
    label: 'Tindak Lanjut',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    borderClass: 'border-l-sky-500',
    icon: Calendar,
  },
  'Kondisi Kesehatan': {
    label: 'Kondisi Kesehatan',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-l-amber-500',
    icon: Heart,
  },
  'PMT & Gizi': {
    label: 'PMT & Gizi',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    borderClass: 'border-l-purple-500',
    icon: Utensils,
  },
};

const QUICK_PRESETS = [
  {
    kategori: 'Progres' as KategoriCatatanSingkat,
    label: 'Kepatuhan TTD / Vitamin',
    text: 'Sasaran patuh mengonsumsi Tablet Tambah Darah (TTD) dan vitamin, tidak ada keluhan.',
  },
  {
    kategori: 'Kendala' as KategoriCatatanSingkat,
    label: 'Sasaran Tidak di Rumah',
    text: 'Sasaran tidak berada di rumah saat didatangi. Dilakukan koordinasi via WhatsApp dan dijadwalkan ulang.',
  },
  {
    kategori: 'Tindak Lanjut' as KategoriCatatanSingkat,
    label: 'Koordinasi Puskesmas / Bidan',
    text: 'Telah berkoordinasi dengan Bidan Desa / Puskesmas setempat untuk pemantauan dan rujukan lebih lanjut.',
  },
  {
    kategori: 'PMT & Gizi' as KategoriCatatanSingkat,
    label: 'Distribusi PMT Baik',
    text: 'Paket makanan tambahan (PMT) telah diterima keluarga dan dikonsumsi teratur sesuai anjuran posyandu.',
  },
  {
    kategori: 'Kondisi Kesehatan' as KategoriCatatanSingkat,
    label: 'Keluhan Mual / Pusing',
    text: 'Sasaran mengeluh pusing dan mual ringan. Diberikan edukasi pola makan teratur dan istirahat cukup.',
  },
];

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onEdit,
  currentUser: propUser,
  onRecordUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const currentUser = propUser || dbService.getCurrentUser();

  // Notes state
  const [notes, setNotes] = useState<CatatanSingkat[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [kategori, setKategori] = useState<KategoriCatatanSingkat>('Progres');
  const [catatanText, setCatatanText] = useState('');
  const [tanggalNote, setTanggalNote] = useState(() => new Date().toISOString().substring(0, 10));
  const [statusUpdate, setStatusUpdate] = useState<string>('Tetap');
  const [jadwalBerikutnyaNote, setJadwalBerikutnyaNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // GPS Coordinates state
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsData, setGpsData] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    label?: string;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [includeGps, setIncludeGps] = useState(true);

  // Sync notes when record changes
  useEffect(() => {
    if (record) {
      const fetched = dbService.getCatatanSingkat(record.id);
      setNotes(fetched);
      setJadwalBerikutnyaNote(record.jadwal_berikutnya || '');
      setIsAddingNote(false);
      setCatatanText('');
      setFeedback(null);
      setGpsData(null);
      setGpsError(null);
      setIsCapturingGps(false);
      setIncludeGps(true);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Peramban atau perangkat tidak mendukung Geolocation GPS.');
      return;
    }

    setIsCapturingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsCapturingGps(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const acc = Number(position.coords.accuracy.toFixed(1));
        const timeNow = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const locLabel = `${record.kelurahan_nama}, ${record.kemantren || record.kecamatan}`;

        setGpsData({
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          timestamp: timeNow,
          label: locLabel,
        });
        setGpsError(null);
        setIncludeGps(true);
      },
      (error) => {
        setIsCapturingGps(false);
        let msg = 'Gagal mendeteksi koordinat GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin akses GPS ditolak peramban. Silakan aktifkan izin lokasi di peramban Anda.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Sinyal GPS perangkat tidak tersedia atau sedang offline.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Waktu permintaan koordinat GPS habis (timeout). Silakan coba lagi.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSimulateGps = () => {
    // Coordinate within Kota Yogyakarta bounds
    const baseLat = -7.795 - Math.random() * 0.025;
    const baseLng = 110.365 + Math.random() * 0.025;
    const lat = Number(baseLat.toFixed(6));
    const lng = Number(baseLng.toFixed(6));
    const acc = Number((4.5 + Math.random() * 4.5).toFixed(1));
    const timeNow = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const locLabel = `${record.kelurahan_nama}, ${record.kemantren || record.kecamatan}`;

    setGpsData({
      latitude: lat,
      longitude: lng,
      accuracy: acc,
      timestamp: timeNow,
      label: locLabel,
    });
    setGpsError(null);
    setIncludeGps(true);
  };

  const handleClearGps = () => {
    setGpsData(null);
    setGpsError(null);
  };

  const handleCopyReport = () => {
    let reportText = `*LAPORAN PENDAMPINGAN TPK*\n`;
    reportText += `Tanggal: ${record.tanggal}\n`;
    reportText += `Wilayah: Kemantren ${record.kemantren || record.kecamatan}, Kelurahan ${record.kelurahan_nama}\n`;
    reportText += `Jenis Sasaran: ${record.jenis_sasaran}\n`;
    reportText += `Nama Sasaran: ${record.nama}\n`;
    reportText += `Alamat: ${record.alamat}\n`;
    reportText += `No. HP: ${record.no_hp}\n`;
    reportText += `Status PMT: ${record.status_pmt} ${record.sumber_pmt ? `(Sumber: ${record.sumber_pmt})` : ''}\n`;
    reportText += `Lansia Serumah: ${record.lansia_dalam_rumah}\n`;

    if (record.jenis_sasaran === 'CATIN' && record.catin_data) {
      const c = record.catin_data;
      reportText += `Usia: ${c.usia} thn | TB: ${c.tinggi_badan} cm | BB: ${c.berat_badan} kg | IMT: ${record.imt || '-'}\n`;
      reportText += `Kadar Hb: ${c.kadar_hb} g/dL (${record.is_anemia ? 'Risiko Anemia' : 'Normal'})\n`;
      reportText += `LiLA: ${c.lila} cm (${record.is_kek ? 'Risiko KEK' : 'Normal'})\n`;
      reportText += `Paparan Asap Rokok: ${c.merokok_terpapar}\n`;
    } else if (record.jenis_sasaran === 'BUFAS' && record.bufas_data) {
      const b = record.bufas_data;
      reportText += `Anak Ke: ${b.anak_ke} | Tgl Lahir: ${b.tgl_lahir_anak} | Usia Kehamilan: ${b.usia_kehamilan_saat_lahir} mgg\n`;
      reportText += `BBL: ${b.bbl} gram | PBL: ${b.pbl} cm | LiKA: ${b.lika} cm\n`;
      reportText += `Metode Persalinan: ${b.metode_persalinan}\n`;
      reportText += `Status KBPP: ${b.status_kbpp} ${b.jenis_kbpp ? `(${b.jenis_kbpp})` : ''}\n`;
      reportText += `Komplikasi: ${b.komplikasi_nifas || 'Tidak ada'}\n`;
    } else if (record.jenis_sasaran === 'IBU_HAMIL' && record.ibu_hamil_data) {
      const h = record.ibu_hamil_data;
      reportText += `Usia: ${h.usia} thn | Usia Kehamilan: ${h.usia_kehamilan_minggu} minggu\n`;
      reportText += `HPHT: ${h.hpht || '-'} | HTP: ${h.htp || '-'}\n`;
      reportText += `TB: ${h.tinggi_badan} cm | BB: ${h.berat_badan} kg | IMT: ${record.imt || '-'}\n`;
      reportText += `Kadar Hb: ${h.kadar_hb} g/dL (${record.is_anemia ? 'Anemia' : 'Normal'})\n`;
      reportText += `LiLA: ${h.lila} cm (${record.is_kek ? 'Risiko KEK' : 'Normal'})\n`;
    }

    reportText += `Catatan Kunjungan: ${record.catatan_kunjungan || '-'}\n`;
    reportText += `Status: ${record.status_kunjungan}\n`;
    reportText += `Petugas Pendamping: ${record.petugas_nama}\n`;

    if (record.latitude && record.longitude) {
      reportText += `Koordinat GPS: https://www.google.com/maps?q=${record.latitude},${record.longitude} (Akurasi: ±${record.gps_accuracy || 0}m)\n`;
    }

    if (notes.length > 0) {
      reportText += `\n*LOG CATATAN SINGKAT LAPANGAN (${notes.length}):*\n`;
      notes.forEach((n, idx) => {
        reportText += `${idx + 1}. [${n.tanggal}] [${n.kategori}] ${n.catatan} (oleh: ${n.petugas_nama})\n`;
        if (n.latitude && n.longitude) {
          reportText += `   📍 GPS: https://www.google.com/maps?q=${n.latitude},${n.longitude} (Akurasi: ±${n.gps_accuracy || 0}m)\n`;
        }
      });
    }

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setKategori(preset.kategori);
    setCatatanText(preset.text);
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatanText.trim()) {
      setFeedback({ type: 'error', message: 'Tuliskan isi catatan singkat terlebih dahulu.' });
      return;
    }

    if (!currentUser) {
      setFeedback({ type: 'error', message: 'Sesi petugas tidak valid. Silakan login kembali.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const updateStatusVal = statusUpdate !== 'Tetap' ? (statusUpdate as any) : undefined;
    const nextScheduleVal = jadwalBerikutnyaNote.trim() ? jadwalBerikutnyaNote.trim() : undefined;

    const res = dbService.addCatatanSingkat(
      {
        pendampinganId: record.id,
        kategori,
        catatan: catatanText.trim(),
        tanggal: tanggalNote,
        statusUpdate: updateStatusVal,
        jadwalBerikutnya: nextScheduleVal,
        latitude: includeGps && gpsData ? gpsData.latitude : undefined,
        longitude: includeGps && gpsData ? gpsData.longitude : undefined,
        gpsAccuracy: includeGps && gpsData ? gpsData.accuracy : undefined,
        lokasiLabel: includeGps && gpsData ? `${gpsData.label || record.kelurahan_nama} (±${gpsData.accuracy}m)` : undefined,
        waktuGps: includeGps && gpsData ? new Date().toISOString().replace('T', ' ').substring(0, 19) : undefined,
      },
      currentUser
    );

    setIsSubmitting(false);

    if (res.success && res.data) {
      const updatedNotes = dbService.getCatatanSingkat(record.id);
      setNotes(updatedNotes);
      setCatatanText('');
      setIsAddingNote(false);
      setGpsData(null);
      setGpsError(null);
      setFeedback({
        type: 'success',
        message: includeGps && gpsData
          ? 'Catatan singkat dan validasi koordinat GPS lapangan berhasil disimpan!'
          : 'Catatan singkat berhasil disimpan ke log!',
      });
      setTimeout(() => setFeedback(null), 4000);

      // Refresh record in parent components
      const freshRecord = dbService.getUnifiedRecordById(record.id, currentUser);
      if (freshRecord && onRecordUpdated) {
        onRecordUpdated(freshRecord);
      }
    } else {
      setFeedback({ type: 'error', message: res.error || 'Gagal menyimpan catatan singkat.' });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (!currentUser) return;
    if (!window.confirm('Hapus catatan singkat ini dari log?')) return;

    const res = dbService.deleteCatatanSingkat(noteId, currentUser);
    if (res.success) {
      const updatedNotes = dbService.getCatatanSingkat(record.id);
      setNotes(updatedNotes);
      setFeedback({ type: 'success', message: 'Catatan singkat berhasil dihapus.' });
      setTimeout(() => setFeedback(null), 3000);

      const freshRecord = dbService.getUnifiedRecordById(record.id, currentUser);
      if (freshRecord && onRecordUpdated) {
        onRecordUpdated(freshRecord);
      }
    } else {
      setFeedback({ type: 'error', message: res.error || 'Gagal menghapus catatan.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                record.jenis_sasaran === 'CATIN'
                  ? 'bg-rose-100 text-rose-800'
                  : record.jenis_sasaran === 'BUFAS'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {record.jenis_sasaran}
            </span>
            <h2 className="text-base font-bold text-slate-900 truncate">
              {record.nama}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Risk Alert Banner if Any */}
          {record.is_risiko_stunting && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold block">Terindikasi Faktor Risiko Prioritas Stunting</span>
                <span className="text-amber-800">
                  {record.is_anemia && 'Kadar Hb rendah (< batas normal). '}
                  {record.is_kek && 'LiLA di bawah 23.5 cm (Kurang Energi Kronis). '}
                  {record.catin_data?.merokok_terpapar === 'Ya' && 'Terpapar asap rokok. '}
                  {record.bufas_data && record.bufas_data.bbl < 2500 && 'Berat lahir bayi rendah (BBLR). '}
                  Harap pastikan rujukan dan pendampingan gizi intensif berkala.
                </span>
              </div>
            </div>
          )}

          {/* Visit & Officer Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Tanggal Kunjungan</span>
              <span className="font-bold text-slate-900 tabular-nums">{record.tanggal}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Kunjungan Ke</span>
              <span className="font-bold text-slate-900 tabular-nums">Ke-{record.kunjungan_ke}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Wilayah / Kelurahan</span>
              <span className="font-bold text-slate-900 block truncate">Kel. {record.kelurahan_nama}</span>
              <span className="text-[10px] text-teal-700 font-semibold block">Kem. {record.kemantren || record.kecamatan}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status Kunjungan</span>
              <span className="font-bold text-slate-900">{record.status_kunjungan}</span>
              {record.jadwal_berikutnya && (
                <span className="text-[10px] text-amber-800 font-semibold block mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Jatuh Tempo: {record.jadwal_berikutnya}
                </span>
              )}
            </div>

            {/* Verified Location Indicator if available */}
            {record.latitude && record.longitude && (
              <div className="col-span-2 sm:col-span-4 bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs mt-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-emerald-900">
                    <span className="font-bold">Lokasi Kunjungan Terverifikasi GPS: </span>
                    <span className="font-mono text-[11px] font-semibold text-emerald-800">
                      {record.latitude.toFixed(5)}, {record.longitude.toFixed(5)}
                    </span>
                    {record.gps_accuracy && (
                      <span className="text-emerald-700 font-normal ml-1">
                        (Akurasi ±{record.gps_accuracy.toFixed(1)}m)
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-950 underline bg-white px-2 py-0.5 rounded border border-teal-200 shadow-2xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buka di Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Visual Progress Bar Siklus Pendampingan */}
          <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1">
            <span className="text-xs font-bold text-slate-800 block">
              Progres Siklus Pendampingan BKKBN
            </span>
            <PendampinganProgressBar
              currentKunjungan={record.kunjungan_ke}
              jenisSasaran={record.jenis_sasaran}
              variant="detailed"
              showSteps={true}
            />
          </div>

          {/* Demographic & Contact */}
          <div className="space-y-2 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Profil Sasaran
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Nama Lengkap</span>
                <span className="font-semibold text-slate-900 text-sm">{record.nama}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nomor HP / WhatsApp</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  {record.no_hp || '-'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Alamat Tinggal</span>
                <span className="font-medium text-slate-800 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  {record.alamat}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Status PMT (Pemberian Makanan Tambahan)</span>
                <span className="font-semibold text-slate-900">
                  {record.status_pmt}{' '}
                  {record.sumber_pmt && (
                    <span className="text-slate-500 font-normal">({record.sumber_pmt})</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Lansia Serumah</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {record.lansia_dalam_rumah}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Target Specific Data */}
          {record.jenis_sasaran === 'CATIN' && record.catin_data && (
            <div className="space-y-2 border border-rose-200 bg-rose-50/30 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                Data Klinis Calon Pengantin (Catin)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Usia Catin</span>
                  <span className="font-bold text-slate-900">{record.catin_data.usia} tahun</span>
                </div>
                <div>
                  <span className="text-slate-500 block">IMT (Indeks Massa Tubuh)</span>
                  <span className="font-bold text-slate-900">{record.imt || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kadar Hemoglobin (Hb)</span>
                  <span
                    className={`font-bold ${
                      record.is_anemia ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {record.catin_data.kadar_hb} g/dL {record.is_anemia && '(Risiko Anemia)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lingkar Lengan Atas (LiLA)</span>
                  <span
                    className={`font-bold ${
                      record.is_kek ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {record.catin_data.lila} cm {record.is_kek && '(Risiko KEK)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Terpapar Asap Rokok</span>
                  <span
                    className={`font-bold ${
                      record.catin_data.merokok_terpapar === 'Ya' ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {record.catin_data.merokok_terpapar}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">TB / BB</span>
                  <span className="font-semibold text-slate-800">
                    {record.catin_data.tinggi_badan} cm / {record.catin_data.berat_badan} kg
                  </span>
                </div>
              </div>
            </div>
          )}

          {record.jenis_sasaran === 'BUFAS' && record.bufas_data && (
            <div className="space-y-2 border border-amber-200 bg-amber-50/30 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Baby className="w-3.5 h-3.5 text-amber-600" />
                Data Klinis Ibu Pasca Persalinan (Bufas)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Anak Ke-</span>
                  <span className="font-bold text-slate-900">{record.bufas_data.anak_ke}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tgl Lahir Anak</span>
                  <span className="font-semibold text-slate-900">{record.bufas_data.tgl_lahir_anak}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Metode Persalinan</span>
                  <span className="font-semibold text-slate-900">{record.bufas_data.metode_persalinan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Berat Bayi Lahir (BBL)</span>
                  <span
                    className={`font-bold ${
                      record.bufas_data.bbl < 2500 ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {record.bufas_data.bbl} gram {record.bufas_data.bbl < 2500 && '(BBLR)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Panjang Bayi Lahir (PBL)</span>
                  <span className="font-semibold text-slate-900">{record.bufas_data.pbl} cm</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lingkar Kepala (LiKA)</span>
                  <span className="font-semibold text-slate-900">{record.bufas_data.lika} cm</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Status KB Pasca Persalinan (KBPP)</span>
                  <span className="font-bold text-slate-900">
                    {record.bufas_data.status_kbpp}{' '}
                    {record.bufas_data.jenis_kbpp && `(${record.bufas_data.jenis_kbpp})`}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500 block">Komplikasi Masa Nifas</span>
                  <span className="font-medium text-slate-800">
                    {record.bufas_data.komplikasi_nifas || 'Tidak ada catatan komplikasi'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {record.jenis_sasaran === 'IBU_HAMIL' && record.ibu_hamil_data && (
            <div className="space-y-2 border border-blue-200 bg-blue-50/30 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-blue-600" />
                Data Klinis Ibu Hamil (Bumil)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Usia Ibu</span>
                  <span className="font-bold text-slate-900">{record.ibu_hamil_data.usia} tahun</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Usia Kehamilan</span>
                  <span className="font-bold text-slate-900">
                    {record.ibu_hamil_data.usia_kehamilan_minggu} minggu
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Perkiraan Lahir (HTP)</span>
                  <span className="font-semibold text-slate-900">{record.ibu_hamil_data.htp || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kadar Hemoglobin (Hb)</span>
                  <span
                    className={`font-bold ${
                      record.is_anemia ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {record.ibu_hamil_data.kadar_hb} g/dL {record.is_anemia && '(Risiko Anemia)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lingkar Lengan Atas (LiLA)</span>
                  <span
                    className={`font-bold ${
                      record.is_kek ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {record.ibu_hamil_data.lila} cm {record.is_kek && '(Risiko KEK)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">IMT</span>
                  <span className="font-bold text-slate-900">{record.imt || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Officer Visit Notes Initial */}
          <div className="space-y-1.5 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Catatan Kunjungan Saat Pendaftaran
            </h3>
            <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200">
              "{record.catatan_kunjungan || 'Tidak ada catatan tambahan.'}"
            </p>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Dicatat oleh: {record.petugas_nama}</span>
              <span>Input: {record.created_at}</span>
            </div>
          </div>

          {/* FITUR UTAMA: Catatan Singkat & Log Kendala/Progres Harian TPK dengan GPS */}
          <div className="border border-teal-200 bg-teal-50/20 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-700 text-white rounded-lg">
                  <NotebookPen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Catatan Singkat & Log Kendala Harian
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      {notes.length} Catatan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    TPK dapat menambahkan log harian dan memvalidasi koordinat GPS langsung di lapangan tanpa mengedit seluruh formulir.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAddingNote(!isAddingNote);
                  setFeedback(null);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                  isAddingNote
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-teal-700 text-white hover:bg-teal-800'
                }`}
              >
                {isAddingNote ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Tutup Form</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Catatan Singkat</span>
                  </>
                )}
              </button>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Form Tambah Catatan Singkat */}
            {isAddingNote && (
              <form
                onSubmit={handleSubmitNote}
                className="bg-white border border-teal-200 rounded-xl p-4 shadow-sm space-y-3.5 animate-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <FileEdit className="w-3.5 h-3.5 text-teal-700" />
                    Input Log Cepat Petugas Lapangan
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Oleh: {currentUser?.full_name || currentUser?.username || 'Petugas TPK'}
                  </span>
                </div>

                {/* Kategori Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Pilih Kategori Catatan:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(KATEGORI_CONFIG) as KategoriCatatanSingkat[]).map(catKey => {
                      const cfg = KATEGORI_CONFIG[catKey];
                      const Icon = cfg.icon;
                      const isSelected = kategori === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setKategori(catKey)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? `${cfg.badgeClass} ring-2 ring-teal-600/30 font-bold shadow-xs`
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Presets for Rapid Field Entry */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Preset Cepat (Klik untuk menyalin teks umum lapangan):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="text-[10px] bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 px-2 py-1 rounded border border-slate-200 hover:border-teal-300 transition-colors"
                        title={p.text}
                      >
                        + {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tanggal & Optional Status Updates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tanggal Catatan
                    </label>
                    <input
                      type="date"
                      value={tanggalNote}
                      onChange={e => setTanggalNote(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Perbarui Status Kunjungan?
                    </label>
                    <select
                      value={statusUpdate}
                      onChange={e => setStatusUpdate(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:bg-white"
                    >
                      <option value="Tetap">Tetap ({record.status_kunjungan})</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Perlu Rujukan">Perlu Rujukan</option>
                      <option value="Jadwal Ulang">Jadwal Ulang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Rencana Tanggal Berikutnya
                    </label>
                    <input
                      type="date"
                      value={jadwalBerikutnyaNote}
                      onChange={e => setJadwalBerikutnyaNote(e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* FITUR UTAMA BARU: Validasi Koordinat GPS Lapangan TPK */}
                <div className="rounded-xl border border-teal-200/90 bg-linear-to-r from-teal-50/50 via-slate-50 to-emerald-50/30 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-teal-700" />
                      <span className="text-xs font-bold text-slate-900">
                        Validasi Koordinat GPS Lapangan
                      </span>
                    </div>
                    <span className="text-[10px] text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full font-medium">
                      Verifikasi Lapangan TPK
                    </span>
                  </div>

                  {/* Kondisi 1: Belum mengambil GPS dan tidak sedang loading */}
                  {!gpsData && !isCapturingGps && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-600 leading-normal">
                        Kunci titik lokasi koordinat geografis saat melakukan pendampingan di lapangan untuk menjamin akurasi dan validitas kehadiran fisik petugas.
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCaptureGps}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
                        >
                          <Locate className="w-3.5 h-3.5" />
                          <span>Ambil Koordinat GPS Sekarang</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSimulateGps}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                          title="Simulasikan koordinat realistis wilayah Kota Yogyakarta jika izin GPS dibatasi"
                        >
                          <Navigation className="w-3 h-3 text-slate-500" />
                          <span>Simulasi Titik Wilayah</span>
                        </button>
                      </div>

                      {gpsError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <span>{gpsError}</span>
                            <div className="mt-1">
                              <button
                                type="button"
                                onClick={handleSimulateGps}
                                className="text-rose-900 underline font-semibold hover:text-rose-950"
                              >
                                Gunakan koordinat simulasi wilayah kelurahan ini
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Kondisi 2: Sedang proses pengambilan GPS */}
                  {isCapturingGps && (
                    <div className="p-3 bg-teal-100/40 border border-teal-300 rounded-xl flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-teal-700 animate-spin shrink-0" />
                      <div className="text-xs text-teal-900">
                        <p className="font-bold">Mengakses sensor GPS perangkat...</p>
                        <p className="text-[11px] text-teal-700">
                          Memindai satelit untuk mengunci koordinat presisi tinggi. Mohon tunggu sesaat.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Kondisi 3: Koordinat GPS Berhasil Diperoleh */}
                  {gpsData && (
                    <div className="bg-white border border-emerald-300 rounded-xl p-3 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-950 block">
                              Koordinat Lapangan Terkunci
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Diambil pukul {gpsData.timestamp} • Wilayah: {gpsData.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleCaptureGps}
                            className="text-[11px] font-medium text-teal-700 hover:text-teal-900 px-2 py-0.5 rounded hover:bg-teal-50"
                            title="Ambil ulang GPS"
                          >
                            Ambil Ulang
                          </button>
                          <button
                            type="button"
                            onClick={handleClearGps}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Hapus koordinat ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {gpsData.latitude}, {gpsData.longitude}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            gpsData.accuracy <= 10
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          Akurasi: ±{gpsData.accuracy} m
                        </span>

                        <a
                          href={`https://www.google.com/maps?q=${gpsData.latitude},${gpsData.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 underline ml-auto"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Lihat di Google Maps
                        </a>
                      </div>

                      <div className="pt-1.5 flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeGps}
                            onChange={e => setIncludeGps(e.target.checked)}
                            className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                          />
                          <span>Lampirkan koordinat GPS ini pada log catatan pendampingan</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Textarea Catatan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Uraian Catatan Singkat / Kendala Lapangan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={catatanText}
                    onChange={e => setCatatanText(e.target.value)}
                    placeholder="Contoh: Sasaran menyampaikan keluhan nafsu makan menurun. Telah diedukasi dan diberikan biskuit PMT tambahan. Rencana follow-up via WA 3 hari ke depan..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !catatanText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
                  >
                    {isSubmitting ? (
                      <span>Menyimpan...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Simpan Catatan Singkat</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Timeline List of Quick Notes */}
            {notes.length === 0 ? (
              <div className="bg-white/80 border border-dashed border-teal-200 rounded-xl p-5 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-teal-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Belum ada catatan singkat harian untuk sasaran ini.
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Catat progres ketaatan, kendala kunjungan lapangan, atau hasil koordinasi faskes secara cepat lengkap dengan validasi titik koordinat GPS.
                </p>
                {!isAddingNote && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tulis Catatan Pertama</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {notes.map(note => {
                  const cfg = KATEGORI_CONFIG[note.kategori] || KATEGORI_CONFIG['Progres'];
                  const Icon = cfg.icon;
                  const canDelete =
                    currentUser &&
                    (currentUser.role === 'ADMIN' || currentUser.id === note.petugas_id);

                  return (
                    <div
                      key={note.id}
                      className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs transition-all hover:border-slate-300 border-l-4 ${cfg.borderClass}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${cfg.badgeClass}`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{note.kategori}</span>
                          </span>

                          <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {note.tanggal}
                          </span>

                          {note.status_update && (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              Status: {note.status_update}
                            </span>
                          )}

                          {note.jadwal_berikutnya && (
                            <span className="text-[10px] font-medium bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                              Jatuh tempo: {note.jadwal_berikutnya}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Hapus catatan ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Isi Catatan */}
                      <p className="mt-2 text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                        {note.catatan}
                      </p>

                      {/* GPS Coordinates Badge if available on note */}
                      {note.latitude && note.longitude && (
                        <div className="mt-2.5 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg flex flex-wrap items-center justify-between gap-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-emerald-800">GPS Terverifikasi:</span>
                            <span className="font-mono text-emerald-900">
                              {note.latitude.toFixed(5)}, {note.longitude.toFixed(5)}
                            </span>
                            {note.gps_accuracy && (
                              <span className="text-emerald-700 text-[10px]">
                                (±{note.gps_accuracy.toFixed(1)}m)
                              </span>
                            )}
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${note.latitude},${note.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 hover:text-teal-950 underline bg-white px-1.5 py-0.5 rounded border border-teal-200"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Peta
                          </a>
                        </div>
                      )}

                      {/* Note Footer */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Dicatat oleh: <strong className="text-slate-600 font-semibold">{note.petugas_nama}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{note.created_at}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleRecordPDF(record, currentUser || undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 shadow-xs"
              title="Unduh Lembar PDF Sasaran Ini untuk Dokumentasi Offline"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>Unduh Lembar PDF</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-300"
              title="Salin ringkasan dossier beserta catatan log dan titik koordinat GPS ke clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Teks Tersalin!' : 'Salin Laporan WhatsApp'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
            >
              Edit Seluruh Formulir
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
