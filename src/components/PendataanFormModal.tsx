import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Baby,
  Calculator,
  Calendar,
  CheckCircle2,
  Heart,
  HelpCircle,
  Info,
  MapPin,
  Phone,
  Save,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  Bufas,
  Catin,
  IbuHamil,
  JenisKBPP,
  JenisSasaran,
  Kelurahan,
  LansiaDalamRumah,
  MerokokOption,
  MetodePersalinan,
  Pendampingan,
  StatusKBPP,
  StatusPMT,
  SumberPMT,
  UnifiedPendampingan,
  User as UserType,
} from '../types';
import { KEMANTREN_LIST } from '../services/kemantrenData';
import { LogoPemkotJogja } from './LogoPemkotJogja';

interface PendataanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  kelurahanList: Kelurahan[];
  currentUser: UserType;
  editingRecord?: UnifiedPendampingan | null;
  onSave: (
    pendampinganData: Omit<Pendampingan, 'id' | 'created_by' | 'created_at' | 'updated_at'>,
    targetData: {
      catin?: any;
      bufas?: any;
      ibu_hamil?: any;
    }
  ) => Promise<{ success: boolean; error?: string }>;
}

export const PendataanFormModal: React.FC<PendataanFormModalProps> = ({
  isOpen,
  onClose,
  kelurahanList,
  currentUser,
  editingRecord,
  onSave,
}) => {
  // Main Pendampingan State
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().substring(0, 10));
  
  const initialKel = kelurahanList.find(k => k.id === (currentUser.kelurahan_id || (kelurahanList[0]?.id ?? 1)));
  const [selectedKemantren, setSelectedKemantren] = useState<string>(initialKel?.kemantren || 'Mantrijeron');
  const [kelurahanId, setKelurahanId] = useState<number>(
    currentUser.kelurahan_id || (kelurahanList[0]?.id ?? 1)
  );
  const [jenisSasaran, setJenisSasaran] = useState<JenisSasaran>('CATIN');
  const [kunjunganKe, setKunjunganKe] = useState<number>(1);
  const [statusKunjungan, setStatusKunjungan] = useState<'Selesai' | 'Perlu Rujukan' | 'Jadwal Ulang'>('Selesai');
  const [jadwalBerikutnya, setJadwalBerikutnya] = useState<string>('');
  const [catatanKunjungan, setCatatanKunjungan] = useState<string>('');

  // Common target states
  const [nama, setNama] = useState<string>('');
  const [alamat, setAlamat] = useState<string>('');
  const [noHp, setNoHp] = useState<string>('');
  const [statusPmt, setStatusPmt] = useState<StatusPMT>('Belum');
  const [sumberPmt, setSumberPmt] = useState<SumberPMT>('Puskesmas');
  const [lansiaRumah, setLansiaRumah] = useState<LansiaDalamRumah>('Tidak Ada');

  // Catin Specific
  const [catinUsia, setCatinUsia] = useState<string>('22');
  const [catinTb, setCatinTb] = useState<string>('155');
  const [catinBb, setCatinBb] = useState<string>('47');
  const [catinHb, setCatinHb] = useState<string>('12.0');
  const [catinLila, setCatinLila] = useState<string>('24.0');
  const [catinMerokok, setCatinMerokok] = useState<MerokokOption>('Tidak');

  // Bufas Specific
  const [bufasAnakKe, setBufasAnakKe] = useState<string>('1');
  const [bufasTglLahir, setBufasTglLahir] = useState<string>(new Date().toISOString().substring(0, 10));
  const [bufasBbl, setBufasBbl] = useState<string>('3100');
  const [bufasPbl, setBufasPbl] = useState<string>('49');
  const [bufasLika, setBufasLika] = useState<string>('34');
  const [bufasMetode, setBufasMetode] = useState<MetodePersalinan>('Normal (Spontan)');
  const [bufasUsiaHamilLahir, setBufasUsiaHamilLahir] = useState<string>('39');
  const [bufasStatusKbpp, setBufasStatusKbpp] = useState<StatusKBPP>('Sudah');
  const [bufasJenisKbpp, setBufasJenisKbpp] = useState<JenisKBPP>('IUD / AKDR');
  const [bufasKomplikasi, setBufasKomplikasi] = useState<string>('Tidak ada komplikasi');

  // Ibu Hamil Specific
  const [bumilUsia, setBumilUsia] = useState<string>('25');
  const [bumilUsiaHamil, setBumilUsiaHamil] = useState<string>('16');
  const [bumilHpht, setBumilHpht] = useState<string>('');
  const [bumilHtp, setBumilHtp] = useState<string>('');
  const [bumilTb, setBumilTb] = useState<string>('155');
  const [bumilBb, setBumilBb] = useState<string>('52');
  const [bumilHb, setBumilHb] = useState<string>('11.5');
  const [bumilLila, setBumilLila] = useState<string>('24.0');
  const [bumilMerokok, setBumilMerokok] = useState<MerokokOption>('Tidak');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prefill when editing
  useEffect(() => {
    if (editingRecord) {
      setTanggal(editingRecord.tanggal);
      setKelurahanId(editingRecord.kelurahan_id);
      const matchedKel = kelurahanList.find(k => k.id === editingRecord.kelurahan_id);
      if (matchedKel) {
        setSelectedKemantren(matchedKel.kemantren);
      }
      setJenisSasaran(editingRecord.jenis_sasaran);
      setKunjunganKe(editingRecord.kunjungan_ke);
      setStatusKunjungan(editingRecord.status_kunjungan);
      setJadwalBerikutnya(editingRecord.jadwal_berikutnya || '');
      setCatatanKunjungan(editingRecord.catatan_kunjungan || '');

      setNama(editingRecord.nama);
      setAlamat(editingRecord.alamat);
      setNoHp(editingRecord.no_hp);
      setStatusPmt(editingRecord.status_pmt);
      if (editingRecord.sumber_pmt) setSumberPmt(editingRecord.sumber_pmt);
      setLansiaRumah(editingRecord.lansia_dalam_rumah);

      if (editingRecord.jenis_sasaran === 'CATIN' && editingRecord.catin_data) {
        const c = editingRecord.catin_data;
        setCatinUsia(String(c.usia));
        setCatinTb(String(c.tinggi_badan));
        setCatinBb(String(c.berat_badan));
        setCatinHb(String(c.kadar_hb));
        setCatinLila(String(c.lila));
        setCatinMerokok(c.merokok_terpapar);
      } else if (editingRecord.jenis_sasaran === 'BUFAS' && editingRecord.bufas_data) {
        const b = editingRecord.bufas_data;
        setBufasAnakKe(String(b.anak_ke));
        setBufasTglLahir(b.tgl_lahir_anak);
        setBufasBbl(String(b.bbl));
        setBufasPbl(String(b.pbl));
        setBufasLika(String(b.lika));
        setBufasMetode(b.metode_persalinan);
        setBufasUsiaHamilLahir(String(b.usia_kehamilan_saat_lahir));
        setBufasStatusKbpp(b.status_kbpp);
        if (b.jenis_kbpp) setBufasJenisKbpp(b.jenis_kbpp);
        setBufasKomplikasi(b.komplikasi_nifas || '');
      } else if (editingRecord.jenis_sasaran === 'IBU_HAMIL' && editingRecord.ibu_hamil_data) {
        const h = editingRecord.ibu_hamil_data;
        setBumilUsia(String(h.usia));
        setBumilUsiaHamil(String(h.usia_kehamilan_minggu));
        setBumilHpht(h.hpht || '');
        setBumilHtp(h.htp || '');
        setBumilTb(String(h.tinggi_badan));
        setBumilBb(String(h.berat_badan));
        setBumilHb(String(h.kadar_hb));
        setBumilLila(String(h.lila));
        setBumilMerokok(h.merokok_terpapar);
      }
    } else {
      // Defaults for new record
      const defaultKelId = currentUser.kelurahan_id || (kelurahanList[0]?.id ?? 1);
      const defKel = kelurahanList.find(k => k.id === defaultKelId);
      setSelectedKemantren(defKel?.kemantren || 'Mantrijeron');
      setTanggal(new Date().toISOString().substring(0, 10));
      setKelurahanId(defaultKelId);
      setJenisSasaran('CATIN');
      setKunjunganKe(1);
      setStatusKunjungan('Selesai');
      setCatatanKunjungan('');
      setNama('');
      setAlamat('');
      setNoHp('');
      setStatusPmt('Belum');
      setSumberPmt('Puskesmas');
      setLansiaRumah('Tidak Ada');
    }
  }, [editingRecord, isOpen, currentUser, kelurahanList]);

  // Filtered Kelurahan for the selected Kemantren
  const availableKelurahans = React.useMemo(() => {
    return kelurahanList.filter(k => k.kemantren.toLowerCase() === selectedKemantren.toLowerCase());
  }, [kelurahanList, selectedKemantren]);

  const handleKemantrenChange = (newKem: string) => {
    setSelectedKemantren(newKem);
    const inKem = kelurahanList.filter(k => k.kemantren.toLowerCase() === newKem.toLowerCase());
    if (inKem.length > 0) {
      setKelurahanId(inKem[0].id);
    }
  };

  // Real-time Health Indicators Calculations
  const calculatedMetrics = React.useMemo(() => {
    let imt = 0;
    let isAnemia = false;
    let isKek = false;

    if (jenisSasaran === 'CATIN') {
      const tb = parseFloat(catinTb) || 0;
      const bb = parseFloat(catinBb) || 0;
      const hb = parseFloat(catinHb) || 0;
      const lila = parseFloat(catinLila) || 0;
      if (tb > 0 && bb > 0) imt = Number((bb / Math.pow(tb / 100, 2)).toFixed(1));
      isAnemia = hb < 12.0;
      isKek = lila < 23.5;
    } else if (jenisSasaran === 'IBU_HAMIL') {
      const tb = parseFloat(bumilTb) || 0;
      const bb = parseFloat(bumilBb) || 0;
      const hb = parseFloat(bumilHb) || 0;
      const lila = parseFloat(bumilLila) || 0;
      if (tb > 0 && bb > 0) imt = Number((bb / Math.pow(tb / 100, 2)).toFixed(1));
      isAnemia = hb < 11.0;
      isKek = lila < 23.5;
    } else if (jenisSasaran === 'BUFAS') {
      const bbl = parseFloat(bufasBbl) || 0;
      const isBblr = bbl > 0 && bbl < 2500;
      return { imt: 0, isAnemia: false, isKek: false, isBblr };
    }

    return { imt, isAnemia, isKek, isBblr: false };
  }, [jenisSasaran, catinTb, catinBb, catinHb, catinLila, bumilTb, bumilBb, bumilHb, bumilLila, bufasBbl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validation
    if (!nama.trim()) {
      setErrorMsg('Nama sasaran wajib diisi.');
      return;
    }
    if (!alamat.trim()) {
      setErrorMsg('Alamat sasaran wajib diisi.');
      return;
    }
    if (!noHp.trim()) {
      setErrorMsg('Nomor HP sasaran wajib diisi.');
      return;
    }

    setLoading(true);

    const pendampinganPayload = {
      tanggal,
      kelurahan_id: kelurahanId,
      jenis_sasaran: jenisSasaran,
      kunjungan_ke: Number(kunjunganKe),
      catatan_kunjungan: catatanKunjungan,
      status_kunjungan: statusKunjungan,
      jadwal_berikutnya: jadwalBerikutnya || undefined,
    };

    const targetPayload: any = {};

    if (jenisSasaran === 'CATIN') {
      targetPayload.catin = {
        nama,
        alamat,
        no_hp: noHp,
        usia: parseInt(catinUsia) || 20,
        tinggi_badan: parseFloat(catinTb) || 150,
        berat_badan: parseFloat(catinBb) || 45,
        kadar_hb: parseFloat(catinHb) || 12.0,
        lila: parseFloat(catinLila) || 23.5,
        merokok_terpapar: catinMerokok,
        status_pmt: statusPmt,
        sumber_pmt: statusPmt === 'Sudah' ? sumberPmt : null,
        lansia_dalam_rumah: lansiaRumah,
      };
    } else if (jenisSasaran === 'BUFAS') {
      targetPayload.bufas = {
        nama,
        alamat,
        no_hp: noHp,
        anak_ke: parseInt(bufasAnakKe) || 1,
        tgl_lahir_anak: bufasTglLahir,
        bbl: parseFloat(bufasBbl) || 3000,
        pbl: parseFloat(bufasPbl) || 49,
        lika: parseFloat(bufasLika) || 33,
        metode_persalinan: bufasMetode,
        usia_kehamilan_saat_lahir: parseInt(bufasUsiaHamilLahir) || 39,
        status_kbpp: bufasStatusKbpp,
        jenis_kbpp: bufasStatusKbpp === 'Sudah' ? bufasJenisKbpp : null,
        komplikasi_nifas: bufasKomplikasi,
        status_pmt: statusPmt,
        sumber_pmt: statusPmt === 'Sudah' ? sumberPmt : null,
        lansia_dalam_rumah: lansiaRumah,
      };
    } else if (jenisSasaran === 'IBU_HAMIL') {
      targetPayload.ibu_hamil = {
        nama,
        alamat,
        no_hp: noHp,
        usia: parseInt(bumilUsia) || 25,
        usia_kehamilan_minggu: parseInt(bumilUsiaHamil) || 12,
        hpht: bumilHpht,
        htp: bumilHtp,
        tinggi_badan: parseFloat(bumilTb) || 155,
        berat_badan: parseFloat(bumilBb) || 50,
        kadar_hb: parseFloat(bumilHb) || 11.5,
        lila: parseFloat(bumilLila) || 24.0,
        merokok_terpapar: bumilMerokok,
        status_pmt: statusPmt,
        sumber_pmt: statusPmt === 'Sudah' ? sumberPmt : null,
        lansia_dalam_rumah: lansiaRumah,
      };
    }

    const res = await onSave(pendampinganPayload, targetPayload);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <LogoPemkotJogja className="w-8 h-10 shrink-0 drop-shadow-xs" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingRecord ? 'Edit Data Pendampingan TPK' : 'Form Pendampingan TPK Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Petugas: <span className="font-semibold text-slate-700">{currentUser.full_name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* =================================================== */}
          {/* SECTION F: FORM PENDAMPINGAN                       */}
          {/* =================================================== */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Data Kunjungan Pendampingan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Tanggal Pendampingan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pendampingan *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* 1. Kemantren (14 Kemantren Se-Kota Yogyakarta) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kemantren (14 Wilayah) *
                </label>
                <select
                  required
                  value={selectedKemantren}
                  onChange={e => handleKemantrenChange(e.target.value)}
                  disabled={currentUser.role === 'PETUGAS_TPK' && currentUser.kelurahan_id !== null}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 font-semibold text-teal-900"
                >
                  {KEMANTREN_LIST.map(kem => (
                    <option key={kem} value={kem}>
                      Kemantren {kem}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-0.5">Pilih Kemantren terlebih dahulu</p>
              </div>

              {/* 2. Kelurahan Dropdown (Hierarki di bawah Kemantren yang dipilih) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelurahan (45 Wilayah) *
                </label>
                <select
                  required
                  value={kelurahanId}
                  onChange={e => setKelurahanId(Number(e.target.value))}
                  disabled={currentUser.role === 'PETUGAS_TPK' && currentUser.kelurahan_id !== null}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 font-semibold"
                >
                  {availableKelurahans.map(k => (
                    <option key={k.id} value={k.id}>
                      Kel. {k.nama}
                    </option>
                  ))}
                </select>
                {currentUser.role === 'PETUGAS_TPK' && currentUser.kelurahan_id ? (
                  <p className="text-[10px] text-slate-400 mt-0.5">Terkunci sesuai penugasan Anda</p>
                ) : (
                  <p className="text-[10px] text-teal-700 mt-0.5">
                    {availableKelurahans.length} kelurahan di {selectedKemantren}
                  </p>
                )}
              </div>

              {/* Kunjungan Ke */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kunjungan Ke
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={kunjunganKe}
                  onChange={e => setKunjunganKe(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Siklus pendampingan</p>
              </div>
            </div>

            {/* Jenis Sasaran (Segmented Button / Tab) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jenis Sasaran *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setJenisSasaran('CATIN')}
                  className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                    jenisSasaran === 'CATIN'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>1. CATIN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setJenisSasaran('BUFAS')}
                  className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                    jenisSasaran === 'BUFAS'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Baby className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. BUFAS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setJenisSasaran('IBU_HAMIL')}
                  className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                    jenisSasaran === 'IBU_HAMIL'
                      ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>3. IBU HAMIL</span>
                </button>
              </div>
            </div>
          </div>

          {/* =================================================== */}
          {/* COMMON TARGET INFO: Nama, Alamat, HP                */}
          {/* =================================================== */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Identitas Sasaran ({jenisSasaran})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Sasaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Aisyah"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={noHp}
                  onChange={e => setNoHp(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Domisili Lengkap (RT/RW/Gang/No. Rumah) *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Jl. Mawar No. 14, RT 02 / RW 05"
                value={alamat}
                onChange={e => setAlamat(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* =================================================== */}
          {/* SECTION G: FORM CATIN                              */}
          {/* =================================================== */}
          {jenisSasaran === 'CATIN' && (
            <div className="border border-rose-200 bg-rose-50/20 rounded-xl p-4 space-y-4">
              <div className="border-b border-rose-200 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Parameter Kesehatan Calon Pengantin (CATIN)
                </h3>
                <span className="text-[11px] text-rose-700 font-medium">BKKBN Elsimil Standard</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usia (Tahun) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="60"
                    required
                    value={catinUsia}
                    onChange={e => setCatinUsia(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tinggi Badan (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="120"
                    max="220"
                    required
                    value={catinTb}
                    onChange={e => setCatinTb(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Berat Badan (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="180"
                    required
                    value={catinBb}
                    onChange={e => setCatinBb(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kadar Hb (g/dL) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="20"
                    required
                    value={catinHb}
                    onChange={e => setCatinHb(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LiLA (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="15"
                    max="50"
                    required
                    value={catinLila}
                    onChange={e => setCatinLila(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* Status Merokok */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merokok / Terpapar Asap Rokok *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="catinMerokok"
                      value="Ya"
                      checked={catinMerokok === 'Ya'}
                      onChange={() => setCatinMerokok('Ya')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Ya (Perokok aktif / pasif serumah)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="catinMerokok"
                      value="Tidak"
                      checked={catinMerokok === 'Tidak'}
                      onChange={() => setCatinMerokok('Tidak')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Tidak</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* SECTION H: FORM BUFAS                              */}
          {/* =================================================== */}
          {jenisSasaran === 'BUFAS' && (
            <div className="border border-amber-200 bg-amber-50/20 rounded-xl p-4 space-y-4">
              <div className="border-b border-amber-200 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Data Ibu Nifas & Bayi (BUFAS)
                </h3>
                <span className="text-[11px] text-amber-700 font-medium">Monitoring Pasca Persalinan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Anak Ke *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    value={bufasAnakKe}
                    onChange={e => setBufasAnakKe(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir Anak *
                  </label>
                  <input
                    type="date"
                    required
                    value={bufasTglLahir}
                    onChange={e => setBufasTglLahir(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usia Kehamilan Saat Bayi Lahir (Minggu) *
                  </label>
                  <input
                    type="number"
                    min="24"
                    max="44"
                    required
                    value={bufasUsiaHamilLahir}
                    onChange={e => setBufasUsiaHamilLahir(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* Ukuran Bayi: BBL, PBL, LiKA, Metode Persalinan */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    BBL (Berat Lahir - gram) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1000"
                    max="6000"
                    required
                    value={bufasBbl}
                    onChange={e => setBufasBbl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                  {parseFloat(bufasBbl) < 2500 && (
                    <span className="text-[10px] text-red-600 font-semibold mt-0.5 block">
                      ⚠ BBLR (Berat Rendah &lt; 2500g)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PBL (Panjang Lahir - cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="60"
                    required
                    value={bufasPbl}
                    onChange={e => setBufasPbl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LiKA (Lingkar Kepala - cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="50"
                    required
                    value={bufasLika}
                    onChange={e => setBufasLika(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Metode Persalinan *
                  </label>
                  <select
                    value={bufasMetode}
                    onChange={e => setBufasMetode(e.target.value as MetodePersalinan)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium"
                  >
                    <option value="Normal (Spontan)">Normal (Spontan)</option>
                    <option value="Sesar (SC)">Sesar (SC)</option>
                    <option value="Vakum / Tindakan Lain">Vakum / Tindakan Lain</option>
                  </select>
                </div>
              </div>

              {/* Status KB Pasca Persalinan (KBPP) */}
              <div className="p-3 bg-white border border-amber-200 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status KBPP (KB Pasca Persalinan) *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="bufasKbpp"
                        value="Sudah"
                        checked={bufasStatusKbpp === 'Sudah'}
                        onChange={() => setBufasStatusKbpp('Sudah')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>Sudah Ber-KB</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="bufasKbpp"
                        value="Belum"
                        checked={bufasStatusKbpp === 'Belum'}
                        onChange={() => setBufasStatusKbpp('Belum')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>Belum Ber-KB</span>
                    </label>
                  </div>
                </div>

                {/* Conditional Jenis KBPP */}
                {bufasStatusKbpp === 'Sudah' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis KBPP yang Digunakan *
                    </label>
                    <select
                      value={bufasJenisKbpp}
                      onChange={e => setBufasJenisKbpp(e.target.value as JenisKBPP)}
                      className="w-full sm:w-1/2 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900"
                    >
                      <option value="IUD / AKDR">IUD / AKDR (Spiral)</option>
                      <option value="Implan / Susuk">Implan / Susuk</option>
                      <option value="Suntik 3 Bulan">Suntik 3 Bulan (Progestin)</option>
                      <option value="Suntik 1 Bulan">Suntik 1 Bulan</option>
                      <option value="Pil KB">Pil KB (Mini Pil)</option>
                      <option value="Tubektomi (MOW)">Tubektomi (MOW)</option>
                      <option value="Vasektomi (MOP)">Vasektomi (MOP)</option>
                      <option value="Kondom">Kondom</option>
                      <option value="MAL (Metode Amenore Laktasi)">MAL (Metode Amenore Laktasi)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Komplikasi Nifas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Komplikasi Pada Masa Nifas (Jika Ada)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Perdarahan ringan / luka jahitan terawat / tidak ada"
                  value={bufasKomplikasi}
                  onChange={e => setBufasKomplikasi(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* SECTION IBU HAMIL (BUMIL)                           */}
          {/* =================================================== */}
          {jenisSasaran === 'IBU_HAMIL' && (
            <div className="border border-blue-200 bg-blue-50/20 rounded-xl p-4 space-y-4">
              <div className="border-b border-blue-200 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Parameter Kesehatan Ibu Hamil (BUMIL)
                </h3>
                <span className="text-[11px] text-blue-700 font-medium">Buku KIA & Pemantauan Janin</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usia Ibu (Tahun) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="55"
                    required
                    value={bumilUsia}
                    onChange={e => setBumilUsia(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usia Kehamilan (Minggu) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="44"
                    required
                    value={bumilUsiaHamil}
                    onChange={e => setBumilUsiaHamil(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HPHT (Haid Terakhir)
                  </label>
                  <input
                    type="date"
                    value={bumilHpht}
                    onChange={e => setBumilHpht(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HTP (Taksiran Lahir)
                  </label>
                  <input
                    type="date"
                    value={bumilHtp}
                    onChange={e => setBumilHtp(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tinggi Badan (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="120"
                    max="220"
                    required
                    value={bumilTb}
                    onChange={e => setBumilTb(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Berat Badan (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="180"
                    required
                    value={bumilBb}
                    onChange={e => setBumilBb(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kadar Hb (g/dL) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="20"
                    required
                    value={bumilHb}
                    onChange={e => setBumilHb(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LiLA (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="15"
                    max="50"
                    required
                    value={bumilLila}
                    onChange={e => setBumilLila(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merokok / Terpapar Asap Rokok *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="bumilMerokok"
                      value="Ya"
                      checked={bumilMerokok === 'Ya'}
                      onChange={() => setBumilMerokok('Ya')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Ya (Perokok aktif / pasif serumah)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="bumilMerokok"
                      value="Tidak"
                      checked={bumilMerokok === 'Tidak'}
                      onChange={() => setBumilMerokok('Tidak')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Tidak</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* PMT & LANSIA (APPLIES TO ALL TARGET CATEGORIES)     */}
          {/* =================================================== */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Pemberian Makanan Tambahan (PMT) & Lingkungan Rumah
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Mendapat PMT */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Status Mendapat PMT *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="statusPmt"
                      value="Sudah"
                      checked={statusPmt === 'Sudah'}
                      onChange={() => setStatusPmt('Sudah')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Sudah Mendapat PMT</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="statusPmt"
                      value="Belum"
                      checked={statusPmt === 'Belum'}
                      onChange={() => setStatusPmt('Belum')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Belum</span>
                  </label>
                </div>

                {/* Sumber Pemberian PMT (Wajib jika PMT = Sudah, Tidak Wajib/Hidden jika Belum) */}
                {statusPmt === 'Sudah' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sumber Pemberian PMT *
                    </label>
                    <select
                      value={sumberPmt}
                      onChange={e => setSumberPmt(e.target.value as SumberPMT)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-900"
                    >
                      <option value="DAIS">DAIS (Dana Alokasi Khusus / Istimewa)</option>
                      <option value="Puskesmas">Puskesmas (BOK / APBD)</option>
                      <option value="GENTING">GENTING (Gerakan Atasi Stunting)</option>
                      <option value="Lainnya">Lainnya (CSR / Swadaya)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Lansia Dalam Satu Rumah */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Ada / Tidak Lansia Dalam Satu Rumah *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="lansiaRumah"
                      value="Ada"
                      checked={lansiaRumah === 'Ada'}
                      onChange={() => setLansiaRumah('Ada')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Ada Lansia</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="lansiaRumah"
                      value="Tidak Ada"
                      checked={lansiaRumah === 'Tidak Ada'}
                      onChange={() => setLansiaRumah('Tidak Ada')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Tidak Ada</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Penting untuk penilaian beban ketergantungan gizi keluarga.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================== */}
          {/* CATATAN & STATUS KUNJUNGAN                          */}
          {/* =================================================== */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Kunjungan Petugas TPK
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan edukasi gizi, sanitasi, konseling, atau kendala..."
                  value={catatanKunjungan}
                  onChange={e => setCatatanKunjungan(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Kunjungan *
                </label>
                <select
                  value={statusKunjungan}
                  onChange={e => setStatusKunjungan(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                >
                  <option value="Selesai">Selesai (Normal)</option>
                  <option value="Perlu Rujukan">Perlu Rujukan ke Puskesmas</option>
                  <option value="Jadwal Ulang">Jadwal Kunjungan Ulang</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rencana Kunjungan Ulang / Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={jadwalBerikutnya}
                  onChange={e => setJadwalBerikutnya(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Pengingat notifikasi dashboard</p>
              </div>
            </div>

            {/* Indicator Quick Calculation Alert */}
            {(calculatedMetrics.isAnemia || calculatedMetrics.isKek || calculatedMetrics.isBblr) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Deteksi Otomatis Faktor Risiko Kesehatan:</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                  {calculatedMetrics.isAnemia && (
                    <span className="bg-amber-100 text-amber-900 font-medium px-2 py-0.5 rounded">
                      Kadar Hb rendah (Risiko Anemia)
                    </span>
                  )}
                  {calculatedMetrics.isKek && (
                    <span className="bg-amber-100 text-amber-900 font-medium px-2 py-0.5 rounded">
                      LiLA &lt; 23.5 cm (Risiko KEK / Kurang Energi Kronis)
                    </span>
                  )}
                  {calculatedMetrics.isBblr && (
                    <span className="bg-rose-100 text-rose-900 font-medium px-2 py-0.5 rounded">
                      Berat Bayi Lahir Rendah (BBLR &lt; 2500 gr)
                    </span>
                  )}
                  {calculatedMetrics.imt > 0 && (
                    <span className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded tabular-nums">
                      IMT: {calculatedMetrics.imt}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : editingRecord ? 'Simpan Perubahan' : 'Simpan Data'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
