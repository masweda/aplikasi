export type UserRole = 'ADMIN' | 'PETUGAS_TPK';

export type JenisSasaran = 'CATIN' | 'BUFAS' | 'IBU_HAMIL';

export type StatusPMT = 'Sudah' | 'Belum';

export type SumberPMT = 'DAIS' | 'Puskesmas' | 'GENTING' | 'Lainnya';

export type LansiaDalamRumah = 'Ada' | 'Tidak Ada';

export type MerokokOption = 'Ya' | 'Tidak';

export type StatusKBPP = 'Sudah' | 'Belum';

export type JenisKBPP =
  | 'IUD / AKDR'
  | 'Implan / Susuk'
  | 'Suntik 3 Bulan'
  | 'Suntik 1 Bulan'
  | 'Pil KB'
  | 'Tubektomi (MOW)'
  | 'Vasektomi (MOP)'
  | 'Kondom'
  | 'MAL (Metode Amenore Laktasi)';

export type MetodePersalinan = 'Normal (Spontan)' | 'Sesar (SC)' | 'Vakum / Tindakan Lain';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  kelurahan_id: number | null;
  kelurahan_nama?: string;
  kemantren_nama?: string;
  no_hp: string;
  created_at: string;
  updated_at?: string;
}

export interface Kelurahan {
  id: number;
  nama: string;
  kemantren: string; // 14 Kemantren di Kota Yogyakarta
  kecamatan: string; // Sinonim Kemantren untuk kompatibilitas data
  target_sasaran: number;
  penanggung_jawab: string;
}

export type KategoriCatatanSingkat =
  | 'Progres'
  | 'Kendala'
  | 'Tindak Lanjut'
  | 'Kondisi Kesehatan'
  | 'PMT & Gizi';

export interface CatatanSingkat {
  id: string;
  pendampingan_id: number;
  tanggal: string; // YYYY-MM-DD
  kategori: KategoriCatatanSingkat;
  catatan: string;
  petugas_id: number;
  petugas_nama: string;
  created_at: string; // YYYY-MM-DD HH:mm:ss
  status_update?: 'Selesai' | 'Perlu Rujukan' | 'Jadwal Ulang';
  jadwal_berikutnya?: string; // YYYY-MM-DD
  latitude?: number;
  longitude?: number;
  gps_accuracy?: number; // meter (misal: 6.5)
  lokasi_label?: string; // misal: "Giwangan, Umbulharjo (±6m)"
  waktu_gps?: string; // Timestamp pengambilan GPS
}

export interface Pendampingan {
  id: number;
  tanggal: string; // YYYY-MM-DD
  kelurahan_id: number;
  jenis_sasaran: JenisSasaran;
  kunjungan_ke: number;
  catatan_kunjungan: string;
  status_kunjungan: 'Selesai' | 'Perlu Rujukan' | 'Jadwal Ulang';
  jadwal_berikutnya?: string; // YYYY-MM-DD (Rencana kunjungan ulang / jatuh tempo pendampingan berikutnya)
  catatan_singkat?: CatatanSingkat[];
  latitude?: number;
  longitude?: number;
  gps_accuracy?: number;
  lokasi_label?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Catin {
  id: number;
  pendampingan_id: number;
  nama: string;
  alamat: string;
  no_hp: string;
  usia: number;
  tinggi_badan: number; // cm
  berat_badan: number; // kg
  kadar_hb: number; // g/dL
  lila: number; // cm (Lingkar Lengan Atas)
  merokok_terpapar: MerokokOption;
  status_pmt: StatusPMT;
  sumber_pmt: SumberPMT | null;
  lansia_dalam_rumah: LansiaDalamRumah;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Bufas {
  id: number;
  pendampingan_id: number;
  nama: string;
  alamat: string;
  no_hp: string;
  anak_ke: number;
  tgl_lahir_anak: string; // YYYY-MM-DD
  bbl: number; // gram
  pbl: number; // cm
  lika: number; // cm (Lingkar Kepala Anak)
  metode_persalinan: MetodePersalinan;
  usia_kehamilan_saat_lahir: number; // minggu
  status_kbpp: StatusKBPP;
  jenis_kbpp: JenisKBPP | null;
  komplikasi_nifas: string;
  status_pmt: StatusPMT;
  sumber_pmt: SumberPMT | null;
  lansia_dalam_rumah: LansiaDalamRumah;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IbuHamil {
  id: number;
  pendampingan_id: number;
  nama: string;
  alamat: string;
  no_hp: string;
  usia: number;
  usia_kehamilan_minggu: number;
  hpht: string; // Hari Pertama Haid Terakhir (YYYY-MM-DD)
  htp: string; // Hari Taksiran Persalinan (YYYY-MM-DD)
  tinggi_badan: number; // cm
  berat_badan: number; // kg
  kadar_hb: number; // g/dL
  lila: number; // cm
  merokok_terpapar: MerokokOption;
  status_pmt: StatusPMT;
  sumber_pmt: SumberPMT | null;
  lansia_dalam_rumah: LansiaDalamRumah;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action: 'LOGIN' | 'LOGOUT' | 'TAMBAH' | 'EDIT' | 'HAPUS' | 'EXPORT_EXCEL' | 'EXPORT_CSV' | 'EXPORT_PDF' | 'BACKUP_DB' | 'RESTORE_DB';
  entity: 'Pendampingan' | 'Catin' | 'Bufas' | 'IbuHamil' | 'User' | 'Database' | 'Auth';
  entity_id: number | null;
  details: string;
  ip_address: string;
  created_at: string;
}

// Unified joined record for display, filtering, and export
export interface UnifiedPendampingan {
  id: number;
  tanggal: string;
  kelurahan_id: number;
  kelurahan_nama: string;
  kemantren: string;
  kecamatan: string;
  jenis_sasaran: JenisSasaran;
  kunjungan_ke: number;
  catatan_kunjungan: string;
  status_kunjungan: 'Selesai' | 'Perlu Rujukan' | 'Jadwal Ulang';
  jadwal_berikutnya?: string;
  created_by: number;
  petugas_nama: string;
  created_at: string;
  updated_at: string;
  catatan_singkat?: CatatanSingkat[];
  latitude?: number;
  longitude?: number;
  gps_accuracy?: number;
  lokasi_label?: string;

  // Target common fields
  nama: string;
  alamat: string;
  no_hp: string;
  status_pmt: StatusPMT;
  sumber_pmt: SumberPMT | null;
  lansia_dalam_rumah: LansiaDalamRumah;

  // Catin specific
  catin_data?: Catin;

  // Bufas specific
  bufas_data?: Bufas;

  // Bumil specific
  ibu_hamil_data?: IbuHamil;

  // Calculated Health Risk Indicators
  imt?: number;
  is_anemia?: boolean;
  is_kek?: boolean;
  is_risiko_stunting?: boolean;
}

export interface RekapitulasiRow {
  kelurahan_id: number;
  kelurahan_nama: string;
  kemantren: string;
  kecamatan: string;
  total_catin: number;
  catin_anemia: number;
  catin_kek: number;
  catin_pmt: number;
  total_bufas: number;
  bufas_kbpp: number;
  bufas_pmt: number;
  total_bumil: number;
  bumil_anemia: number;
  bumil_kek: number;
  bumil_pmt: number;
  total_pendampingan: number;
}

// Chat message interface for Gemini Multi-Turn Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
