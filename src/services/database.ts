import bcrypt from 'bcryptjs';
import {
  AuditLog,
  Bufas,
  CatatanSingkat,
  Catin,
  IbuHamil,
  KategoriCatatanSingkat,
  Kelurahan,
  Pendampingan,
  RekapitulasiRow,
  UnifiedPendampingan,
  User,
} from '../types';
import { KOTA_YOGYAKARTA_KELURAHAN } from './kemantrenData';

const STORAGE_KEY = 'sistem_tpk_jogja_v3';
const SESSION_KEY = 'sistem_tpk_session_v3';

export interface DatabaseState {
  kelurahan: Kelurahan[];
  users: User[];
  pendampingan: Pendampingan[];
  catin: Catin[];
  bufas: Bufas[];
  ibu_hamil: IbuHamil[];
  audit_logs: AuditLog[];
  catatan_singkat: CatatanSingkat[];
}

const HASHED_ADMIN = bcrypt.hashSync('admin123', 10);
const HASHED_PETUGAS = bcrypt.hashSync('tpk123', 10);

const DEFAULT_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    password_hash: HASHED_ADMIN,
    full_name: 'Dr. Hendra Wijaya (Koordinator TPK Kota Yogyakarta)',
    role: 'ADMIN',
    kelurahan_id: null,
    no_hp: '081234567890',
    created_at: '2026-01-01 08:00:00',
  },
  {
    id: 2,
    username: 'petugas1',
    password_hash: HASHED_PETUGAS,
    full_name: 'Siti Rahmawati, A.Md.Keb',
    role: 'PETUGAS_TPK',
    kelurahan_id: 2, // Suryodiningratan (Mantrijeron)
    kelurahan_nama: 'Suryodiningratan',
    kemantren_nama: 'Mantrijeron',
    no_hp: '081398765432',
    created_at: '2026-01-05 09:30:00',
  },
  {
    id: 3,
    username: 'petugas2',
    password_hash: HASHED_PETUGAS,
    full_name: 'Dewi Lestari, S.Tr.Keb',
    role: 'PETUGAS_TPK',
    kelurahan_id: 12, // Giwangan (Umbulharjo)
    kelurahan_nama: 'Giwangan',
    kemantren_nama: 'Umbulharjo',
    no_hp: '085712349876',
    created_at: '2026-01-06 10:15:00',
  },
  {
    id: 4,
    username: 'petugas_kraton',
    password_hash: HASHED_PETUGAS,
    full_name: 'Tri Hastuti, S.Tr.Keb',
    role: 'PETUGAS_TPK',
    kelurahan_id: 6, // Kadipaten (Kraton)
    kelurahan_nama: 'Kadipaten',
    kemantren_nama: 'Kraton',
    no_hp: '087811223344',
    created_at: '2026-01-08 11:00:00',
  },
];

const SEED_PENDAMPINGAN: Pendampingan[] = [
  {
    id: 1,
    tanggal: '2026-09-12',
    kelurahan_id: 2, // Suryodiningratan (Mantrijeron)
    jenis_sasaran: 'CATIN',
    kunjungan_ke: 1,
    catatan_kunjungan: 'Catin wanita memiliki Hb 11.2 (anemia ringan), diberikan tablet tambah darah (TTD) dan edukasi gizi seimbang.',
    status_kunjungan: 'Selesai',
    jadwal_berikutnya: '2026-10-12',
    created_by: 2,
    created_at: '2026-09-12 10:30:00',
    updated_at: '2026-09-12 10:30:00',
  },
  {
    id: 2,
    tanggal: '2026-09-15',
    kelurahan_id: 12, // Giwangan (Umbulharjo)
    jenis_sasaran: 'IBU_HAMIL',
    kunjungan_ke: 2,
    catatan_kunjungan: 'Trimester 2, LiLA 22.8 cm (risiko KEK), telah terdaftar penerima PMT dari Puskesmas Umbulharjo.',
    status_kunjungan: 'Selesai',
    jadwal_berikutnya: '2026-10-15',
    created_by: 3,
    created_at: '2026-09-15 11:00:00',
    updated_at: '2026-09-15 11:00:00',
  },
  {
    id: 3,
    tanggal: '2026-09-18',
    kelurahan_id: 6, // Kadipaten (Kraton)
    jenis_sasaran: 'BUFAS',
    kunjungan_ke: 1,
    catatan_kunjungan: 'Kunjungan nifas KF1. Bayi lahir spontan BBL 3100 gr. Ibu telah memilih KBPP IUD di Puskesmas Kraton.',
    status_kunjungan: 'Selesai',
    jadwal_berikutnya: '2026-10-16',
    created_by: 4,
    created_at: '2026-09-18 14:20:00',
    updated_at: '2026-09-18 14:20:00',
  },
  {
    id: 4,
    tanggal: '2026-09-22',
    kelurahan_id: 1, // Gedongkiwo (Mantrijeron)
    jenis_sasaran: 'CATIN',
    kunjungan_ke: 1,
    catatan_kunjungan: 'Pemeriksaan kesehatan pranikah normal, Hb 12.8, LiLA 24.5 cm, tidak merokok.',
    status_kunjungan: 'Selesai',
    jadwal_berikutnya: '2026-10-22',
    created_by: 2,
    created_at: '2026-09-22 09:45:00',
    updated_at: '2026-09-22 09:45:00',
  },
  {
    id: 5,
    tanggal: '2026-09-28',
    kelurahan_id: 17, // Rejowinangun (Kotagede)
    jenis_sasaran: 'IBU_HAMIL',
    kunjungan_ke: 3,
    catatan_kunjungan: 'Trimester 3, tensi normal, Hb 11.5 g/dL, kesiapan persalinan dan rujukan sudah siap.',
    status_kunjungan: 'Selesai',
    jadwal_berikutnya: '2026-10-20',
    created_by: 1,
    created_at: '2026-09-28 13:10:00',
    updated_at: '2026-09-28 13:10:00',
  },
  {
    id: 6,
    tanggal: '2026-10-01',
    kelurahan_id: 20, // Demangan (Gondokusuman)
    jenis_sasaran: 'BUFAS',
    kunjungan_ke: 2,
    catatan_kunjungan: 'Kunjungan nifas KF2, luka jahitan baik, ASI eksklusif lancar, telah menggunakan KB Implan.',
    status_kunjungan: 'Selesai',
    jadwal_berikutnya: '2026-10-22',
    created_by: 1,
    created_at: '2026-10-01 10:15:00',
    updated_at: '2026-10-01 10:15:00',
  },
  {
    id: 7,
    tanggal: '2026-10-03',
    kelurahan_id: 42, // Karangwaru (Tegalrejo)
    jenis_sasaran: 'IBU_HAMIL',
    kunjungan_ke: 1,
    catatan_kunjungan: 'Trimester 1, mual muntah teratasi, Hb 10.8 g/dL (anemia ringan), diberikan rujukan ke Puskesmas Tegalrejo.',
    status_kunjungan: 'Perlu Rujukan',
    jadwal_berikutnya: '2026-10-10',
    created_by: 1,
    created_at: '2026-10-03 11:30:00',
    updated_at: '2026-10-03 11:30:00',
  },
  {
    id: 8,
    tanggal: '2026-10-04',
    kelurahan_id: 39, // Bumijo (Jetis)
    jenis_sasaran: 'CATIN',
    kunjungan_ke: 1,
    catatan_kunjungan: 'Catin wanita usia 21 tahun, LiLA 22.2 cm (risiko KEK), menerima biskuit PMT DAIS Yogyakarta.',
    status_kunjungan: 'Selesai',
    jadwal_berikutnya: '2026-10-18',
    created_by: 1,
    created_at: '2026-10-04 15:00:00',
    updated_at: '2026-10-04 15:00:00',
  },
  {
    id: 9,
    tanggal: '2026-10-05',
    kelurahan_id: 7, // Brontokusuman (Mergangsan)
    jenis_sasaran: 'BUFAS',
    kunjungan_ke: 1,
    catatan_kunjungan: 'Kunjungan nifas KF1, bayi sehat BBL 3200 gr, persalinan normal, ibu bersedia pasang IUD.',
    status_kunjungan: 'Selesai',
    jadwal_berikutnya: '2026-10-12',
    created_by: 1,
    created_at: '2026-10-05 09:00:00',
    updated_at: '2026-10-05 09:00:00',
  },
];

const SEED_CATIN: Catin[] = [
  {
    id: 1,
    pendampingan_id: 1,
    nama: 'Anisa Maharani',
    alamat: 'Jl. Suryodiningratan No. 24, RT 03/RW 04',
    no_hp: '081287654321',
    usia: 22,
    tinggi_badan: 152,
    berat_badan: 43.5,
    kadar_hb: 11.2,
    lila: 22.5,
    merokok_terpapar: 'Ya',
    status_pmt: 'Sudah',
    sumber_pmt: 'Puskesmas',
    lansia_dalam_rumah: 'Ada',
    created_by: 2,
    created_at: '2026-09-12 10:30:00',
  },
  {
    id: 2,
    pendampingan_id: 4,
    nama: 'Putri Anggita',
    alamat: 'Jl. Bantul Gang Melati No. 18, RT 01/RW 02, Gedongkiwo',
    no_hp: '081399887766',
    usia: 24,
    tinggi_badan: 158,
    berat_badan: 51,
    kadar_hb: 12.8,
    lila: 24.5,
    merokok_terpapar: 'Tidak',
    status_pmt: 'Belum',
    sumber_pmt: null,
    lansia_dalam_rumah: 'Tidak Ada',
    created_by: 2,
    created_at: '2026-09-22 09:45:00',
  },
  {
    id: 3,
    pendampingan_id: 8,
    nama: 'Nabila Syakirah',
    alamat: 'Jl. Tentara Rakyat Mataram No. 12, Bumijo',
    no_hp: '085811223344',
    usia: 21,
    tinggi_badan: 150,
    berat_badan: 41,
    kadar_hb: 10.9,
    lila: 22.2,
    merokok_terpapar: 'Ya',
    status_pmt: 'Sudah',
    sumber_pmt: 'DAIS',
    lansia_dalam_rumah: 'Ada',
    created_by: 1,
    created_at: '2026-10-04 15:00:00',
  },
];

const SEED_BUFAS: Bufas[] = [
  {
    id: 1,
    pendampingan_id: 3,
    nama: 'Rina Kusuma Dewi',
    alamat: 'Ngasem RT 12/RW 03, Kadipaten, Kraton',
    no_hp: '087812345678',
    anak_ke: 2,
    tgl_lahir_anak: '2026-09-14',
    bbl: 3100,
    pbl: 49.5,
    lika: 34,
    metode_persalinan: 'Normal (Spontan)',
    usia_kehamilan_saat_lahir: 39,
    status_kbpp: 'Sudah',
    jenis_kbpp: 'IUD / AKDR',
    komplikasi_nifas: 'Tidak ada komplikasi, involusi uteri normal',
    status_pmt: 'Sudah',
    sumber_pmt: 'GENTING',
    lansia_dalam_rumah: 'Tidak Ada',
    created_by: 4,
    created_at: '2026-09-18 14:20:00',
  },
  {
    id: 2,
    pendampingan_id: 6,
    nama: 'Titin Sumarni',
    alamat: 'Jl. Mrican Baru RT 04/RW 01, Demangan',
    no_hp: '081298877665',
    anak_ke: 1,
    tgl_lahir_anak: '2026-09-25',
    bbl: 2950,
    pbl: 48,
    lika: 33.5,
    metode_persalinan: 'Sesar (SC)',
    usia_kehamilan_saat_lahir: 38,
    status_kbpp: 'Sudah',
    jenis_kbpp: 'Implan / Susuk',
    komplikasi_nifas: 'Nyeri luka bekas operasi minimal, berangsur membaik',
    status_pmt: 'Sudah',
    sumber_pmt: 'Puskesmas',
    lansia_dalam_rumah: 'Ada',
    created_by: 1,
    created_at: '2026-10-01 10:15:00',
  },
  {
    id: 3,
    pendampingan_id: 9,
    nama: 'Wahyuningsih',
    alamat: 'Prawirotaman RT 05/RW 02, Brontokusuman',
    no_hp: '087766554433',
    anak_ke: 1,
    tgl_lahir_anak: '2026-09-30',
    bbl: 3200,
    pbl: 50,
    lika: 34.5,
    metode_persalinan: 'Normal (Spontan)',
    usia_kehamilan_saat_lahir: 40,
    status_kbpp: 'Sudah',
    jenis_kbpp: 'IUD / AKDR',
    komplikasi_nifas: 'Kondisi ibu dan bayi sehat',
    status_pmt: 'Sudah',
    sumber_pmt: 'DAIS',
    lansia_dalam_rumah: 'Ada',
    created_by: 1,
    created_at: '2026-10-05 09:00:00',
  },
];

const SEED_IBU_HAMIL: IbuHamil[] = [
  {
    id: 1,
    pendampingan_id: 2,
    nama: 'Fitri Handayani',
    alamat: 'Mergangsan Lor RT 02/RW 03, Giwangan',
    no_hp: '081211223344',
    usia: 26,
    usia_kehamilan_minggu: 22,
    hpht: '2026-04-12',
    htp: '2027-01-19',
    tinggi_badan: 153,
    berat_badan: 48,
    kadar_hb: 11.4,
    lila: 22.8,
    merokok_terpapar: 'Ya',
    status_pmt: 'Sudah',
    sumber_pmt: 'Puskesmas',
    lansia_dalam_rumah: 'Ada',
    created_by: 3,
    created_at: '2026-09-15 11:00:00',
  },
  {
    id: 2,
    pendampingan_id: 5,
    nama: 'Kurnia Agustin',
    alamat: 'Pilahan RT 05/RW 07, Rejowinangun, Kotagede',
    no_hp: '082155667788',
    usia: 29,
    usia_kehamilan_minggu: 34,
    hpht: '2026-01-20',
    htp: '2026-10-27',
    tinggi_badan: 160,
    berat_badan: 63,
    kadar_hb: 11.5,
    lila: 25.5,
    merokok_terpapar: 'Tidak',
    status_pmt: 'Belum',
    sumber_pmt: null,
    lansia_dalam_rumah: 'Tidak Ada',
    created_by: 1,
    created_at: '2026-09-28 13:10:00',
  },
  {
    id: 3,
    pendampingan_id: 7,
    nama: 'Laila Wardani',
    alamat: 'Kricak Kidul RT 01/RW 05, Karangwaru, Tegalrejo',
    no_hp: '085699881122',
    usia: 23,
    usia_kehamilan_minggu: 11,
    hpht: '2026-07-18',
    htp: '2027-04-25',
    tinggi_badan: 155,
    berat_badan: 46,
    kadar_hb: 10.8,
    lila: 23.0,
    merokok_terpapar: 'Tidak',
    status_pmt: 'Sudah',
    sumber_pmt: 'DAIS',
    lansia_dalam_rumah: 'Ada',
    created_by: 1,
    created_at: '2026-10-03 11:30:00',
  },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    username: 'admin',
    action: 'LOGIN',
    entity: 'Auth',
    entity_id: 1,
    details: 'Login Administrator Koordinator TPK Kota Yogyakarta',
    ip_address: '127.0.0.1',
    created_at: '2026-10-05 08:00:00',
  },
  {
    id: 2,
    user_id: 2,
    username: 'petugas1',
    action: 'TAMBAH',
    entity: 'Pendampingan',
    entity_id: 1,
    details: 'Input pendampingan CATIN di Suryodiningratan (Mantrijeron)',
    ip_address: '192.168.1.15',
    created_at: '2026-09-12 10:30:00',
  },
  {
    id: 3,
    user_id: 3,
    username: 'petugas2',
    action: 'TAMBAH',
    entity: 'Pendampingan',
    entity_id: 2,
    details: 'Input pendampingan IBU HAMIL KEK di Giwangan (Umbulharjo)',
    ip_address: '192.168.1.28',
    created_at: '2026-09-15 11:00:00',
  },
];

const SEED_CATATAN_SINGKAT: CatatanSingkat[] = [
  {
    id: 'cs-1',
    pendampingan_id: 1,
    tanggal: '2026-09-20',
    kategori: 'Progres',
    catatan: 'Sasaran patuh meminum Tablet Tambah Darah (TTD) 1x sehari malam hari, keluhan pusing mulai berkurang.',
    petugas_id: 2,
    petugas_nama: 'Siti Rahmawati, A.Md.Keb',
    created_at: '2026-09-20 14:15:00',
    status_update: 'Selesai',
    latitude: -7.81842,
    longitude: 110.38914,
    gps_accuracy: 5.8,
    lokasi_label: 'Giwangan, Umbulharjo',
    waktu_gps: '2026-09-20 14:14:45',
  },
  {
    id: 'cs-2',
    pendampingan_id: 1,
    tanggal: '2026-09-28',
    kategori: 'Kendala',
    catatan: 'Calon suami masih merokok di dalam rumah. TPK memberikan edukasi khusus bahaya paparan asap rokok pada calon ibu dan janin.',
    petugas_id: 2,
    petugas_nama: 'Siti Rahmawati, A.Md.Keb',
    created_at: '2026-09-28 16:30:00',
    latitude: -7.81831,
    longitude: 110.38925,
    gps_accuracy: 7.2,
    lokasi_label: 'Giwangan, Umbulharjo',
    waktu_gps: '2026-09-28 16:29:30',
  },
  {
    id: 'cs-3',
    pendampingan_id: 2,
    tanggal: '2026-09-25',
    kategori: 'PMT & Gizi',
    catatan: 'Biskuit PMT dari Puskesmas Umbulharjo telah diterima keluarga dan dikonsumsi teratur setiap pagi.',
    petugas_id: 3,
    petugas_nama: 'Dewi Lestari, S.Tr.Keb',
    created_at: '2026-09-25 10:20:00',
    latitude: -7.80512,
    longitude: 110.39245,
    gps_accuracy: 6.4,
    lokasi_label: 'Tahunan, Umbulharjo',
    waktu_gps: '2026-09-25 10:19:15',
  },
  {
    id: 'cs-4',
    pendampingan_id: 2,
    tanggal: '2026-10-02',
    kategori: 'Kendala',
    catatan: 'Ibu hamil mengeluh mual di pagi hari dan nafsu makan agak menurun. TPK menyarankan makan porsi kecil tapi sering dan konsumsi buah.',
    petugas_id: 3,
    petugas_nama: 'Dewi Lestari, S.Tr.Keb',
    created_at: '2026-10-02 11:45:00',
    latitude: -7.80522,
    longitude: 110.39239,
    gps_accuracy: 8.5,
    lokasi_label: 'Tahunan, Umbulharjo',
    waktu_gps: '2026-10-02 11:44:10',
  },
  {
    id: 'cs-5',
    pendampingan_id: 3,
    tanggal: '2026-09-26',
    kategori: 'Tindak Lanjut',
    catatan: 'Pemeriksaan tali pusat bayi telah puput normal, kontrol nifas lanjutan dijadwalkan bersamaan posyandu balita.',
    petugas_id: 4,
    petugas_nama: 'Tri Hastuti, S.Tr.Keb',
    created_at: '2026-09-26 09:10:00',
    status_update: 'Selesai',
    latitude: -7.8221,
    longitude: 110.3809,
    gps_accuracy: 6.0,
    lokasi_label: 'Sorosutan, Umbulharjo',
    waktu_gps: '2026-09-26 09:09:20',
  },
  {
    id: 'cs-6',
    pendampingan_id: 7,
    tanggal: '2026-10-06',
    kategori: 'Tindak Lanjut',
    catatan: 'Ibu telah dirujuk dan memeriksakan diri ke Poli KIA Puskesmas Tegalrejo. Diberikan suplemen zat besi dan vitamin kehamilan.',
    petugas_id: 1,
    petugas_nama: 'Dr. Hendra Wijaya (Koordinator TPK Kota Yogyakarta)',
    created_at: '2026-10-06 13:00:00',
    status_update: 'Selesai',
    latitude: -7.7885,
    longitude: 110.36015,
    gps_accuracy: 5.2,
    lokasi_label: 'Karangwaru, Tegalrejo',
    waktu_gps: '2026-10-06 12:59:40',
  },
];

class TpkDatabaseService {
  private state: DatabaseState;
  private broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sistem_tpk_realtime_channel') : null;

  constructor() {
    this.state = this.loadState();
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = () => {
        this.state = this.loadState();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('db-changed'));
        }
      };
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.state = this.loadState();
          window.dispatchEvent(new CustomEvent('db-changed'));
        }
      });
    }
  }

  private loadState(): DatabaseState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Verify kelurahan has 45 entries and Kemantren field
        if (parsed.kelurahan && parsed.kelurahan.length >= 45 && parsed.users) {
          if (parsed.pendampingan) {
            parsed.pendampingan = parsed.pendampingan.map((p: any) => {
              if (!p.jadwal_berikutnya) {
                const seedMatch = SEED_PENDAMPINGAN.find(s => s.id === p.id);
                if (seedMatch?.jadwal_berikutnya) {
                  return { ...p, jadwal_berikutnya: seedMatch.jadwal_berikutnya };
                }
              }
              return p;
            });
          }
          if (!parsed.catatan_singkat || !Array.isArray(parsed.catatan_singkat)) {
            parsed.catatan_singkat = SEED_CATATAN_SINGKAT;
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    const initial: DatabaseState = {
      kelurahan: KOTA_YOGYAKARTA_KELURAHAN,
      users: DEFAULT_USERS,
      pendampingan: SEED_PENDAMPINGAN,
      catin: SEED_CATIN,
      bufas: SEED_BUFAS,
      ibu_hamil: SEED_IBU_HAMIL,
      audit_logs: SEED_AUDIT_LOGS,
      catatan_singkat: SEED_CATATAN_SINGKAT,
    };
    this.saveState(initial);
    return initial;
  }

  private saveState(state: DatabaseState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota
    }
  }

  private persist(): void {
    this.saveState(this.state);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage('db_updated');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('db-changed'));
    }
  }

  // --- Auth Session Methods ---
  public getCurrentUser(): User | null {
    try {
      const sess = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (sess) {
        const parsed = JSON.parse(sess);
        const match = this.state.users.find(u => u.id === parsed.id);
        if (match) {
          const kel = match.kelurahan_id ? this.state.kelurahan.find(k => k.id === match.kelurahan_id) : undefined;
          return {
            ...match,
            kelurahan_nama: kel?.nama,
            kemantren_nama: kel?.kemantren,
          };
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  public login(username: string, passwordPlain: string): { success: boolean; user?: User; error?: string } {
    const user = this.state.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'Username tidak terdaftar di Sistem TPK Kota Yogyakarta.' };
    }

    const isMatch = bcrypt.compareSync(passwordPlain, user.password_hash);
    if (!isMatch) {
      return { success: false, error: 'Password yang dimasukkan salah.' };
    }

    const kel = user.kelurahan_id ? this.state.kelurahan.find(k => k.id === user.kelurahan_id) : undefined;
    const authUser: User = {
      ...user,
      kelurahan_nama: kel?.nama,
      kemantren_nama: kel?.kemantren,
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(authUser));

    this.logAudit({
      user_id: user.id,
      username: user.username,
      action: 'LOGIN',
      entity: 'Auth',
      entity_id: user.id,
      details: `User ${user.full_name} (${user.role}) berhasil masuk ke sistem.`,
    });

    return { success: true, user: authUser };
  }

  public logout(): void {
    const current = this.getCurrentUser();
    if (current) {
      this.logAudit({
        user_id: current.id,
        username: current.username,
        action: 'LOGOUT',
        entity: 'Auth',
        entity_id: current.id,
        details: `User ${current.full_name} keluar dari sistem.`,
      });
    }
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  // --- Audit Logging ---
  public logAudit(entry: {
    user_id: number;
    username: string;
    action: AuditLog['action'];
    entity: AuditLog['entity'];
    entity_id: number | null;
    details: string;
  }): void {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: this.state.audit_logs.length > 0 ? Math.max(...this.state.audit_logs.map(l => l.id)) + 1 : 1,
      user_id: entry.user_id,
      username: entry.username,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id,
      details: entry.details,
      ip_address: '127.0.0.1 (TPK Kota Yogyakarta)',
      created_at: now,
    };

    this.state.audit_logs = [newLog, ...this.state.audit_logs].slice(0, 200);
    this.persist();
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.audit_logs];
  }

  // --- Master Data ---
  public getKelurahanList(): Kelurahan[] {
    return [...this.state.kelurahan];
  }

  public getUsers(): User[] {
    return this.state.users.map(u => {
      const kel = u.kelurahan_id ? this.state.kelurahan.find(k => k.id === u.kelurahan_id) : undefined;
      return {
        ...u,
        password_hash: '••••••••',
        kelurahan_nama: kel?.nama,
        kemantren_nama: kel?.kemantren,
      };
    });
  }

  public createUser(userData: {
    username: string;
    passwordPlain: string;
    full_name: string;
    role: User['role'];
    kelurahan_id: number | null;
    no_hp: string;
  }, executor: User): { success: boolean; error?: string } {
    if (executor.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak: Hanya ADMIN yang dapat mengelola pengguna.' };
    }

    if (!userData.username || !userData.passwordPlain || !userData.full_name) {
      return { success: false, error: 'Semua field wajib diisi.' };
    }

    const exists = this.state.users.some(u => u.username.toLowerCase() === userData.username.trim().toLowerCase());
    if (exists) {
      return { success: false, error: 'Username sudah digunakan oleh akun lain.' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newId = Math.max(...this.state.users.map(u => u.id), 0) + 1;
    const password_hash = bcrypt.hashSync(userData.passwordPlain, 10);

    const newUser: User = {
      id: newId,
      username: userData.username.trim().toLowerCase(),
      password_hash,
      full_name: userData.full_name.trim(),
      role: userData.role,
      kelurahan_id: userData.kelurahan_id,
      no_hp: userData.no_hp.trim(),
      created_at: now,
    };

    this.state.users.push(newUser);
    this.persist();

    this.logAudit({
      user_id: executor.id,
      username: executor.username,
      action: 'TAMBAH',
      entity: 'User',
      entity_id: newId,
      details: `Menambahkan petugas baru ${newUser.username} (${newUser.role})`,
    });

    return { success: true };
  }

  public updateUser(id: number, updateData: {
    full_name: string;
    role: User['role'];
    kelurahan_id: number | null;
    no_hp: string;
    passwordPlain?: string;
  }, executor: User): { success: boolean; error?: string } {
    if (executor.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak.' };
    }

    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx === -1) {
      return { success: false, error: 'User tidak ditemukan.' };
    }

    const existing = this.state.users[idx];
    const password_hash = updateData.passwordPlain && updateData.passwordPlain.trim()
      ? bcrypt.hashSync(updateData.passwordPlain.trim(), 10)
      : existing.password_hash;

    this.state.users[idx] = {
      ...existing,
      full_name: updateData.full_name,
      role: updateData.role,
      kelurahan_id: updateData.kelurahan_id,
      no_hp: updateData.no_hp,
      password_hash,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    this.persist();

    this.logAudit({
      user_id: executor.id,
      username: executor.username,
      action: 'EDIT',
      entity: 'User',
      entity_id: id,
      details: `Memperbarui akun petugas ${existing.username}`,
    });

    return { success: true };
  }

  public deleteUser(id: number, executor: User): { success: boolean; error?: string } {
    if (executor.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak.' };
    }
    if (executor.id === id) {
      return { success: false, error: 'Tidak dapat menghapus akun Anda sendiri saat sedang aktif.' };
    }

    const userToDelete = this.state.users.find(u => u.id === id);
    if (!userToDelete) {
      return { success: false, error: 'User tidak ditemukan.' };
    }

    this.state.users = this.state.users.filter(u => u.id !== id);
    this.persist();

    this.logAudit({
      user_id: executor.id,
      username: executor.username,
      action: 'HAPUS',
      entity: 'User',
      entity_id: id,
      details: `Menghapus user ${userToDelete.username}`,
    });

    return { success: true };
  }

  // --- Joined Unified Pendampingan Query ---
  public getUnifiedPendampinganList(currentUser?: User | null): UnifiedPendampingan[] {
    const results: UnifiedPendampingan[] = [];
    const kelurahanMap = new Map(this.state.kelurahan.map(k => [k.id, k]));
    const userMap = new Map(this.state.users.map(u => [u.id, u]));

    let pendampinganSource = this.state.pendampingan;
    if (currentUser && currentUser.role === 'PETUGAS_TPK' && currentUser.kelurahan_id) {
      pendampinganSource = pendampinganSource.filter(p => p.kelurahan_id === currentUser.kelurahan_id);
    }

    for (const p of pendampinganSource) {
      const kel = kelurahanMap.get(p.kelurahan_id);
      const officer = userMap.get(p.created_by);

      let targetNama = '-';
      let targetAlamat = '-';
      let targetNoHp = '-';
      let targetPmt: any = 'Belum';
      let targetSumberPmt: any = null;
      let targetLansia: any = 'Tidak Ada';

      let catinData: Catin | undefined;
      let bufasData: Bufas | undefined;
      let ibuHamilData: IbuHamil | undefined;

      let imt: number | undefined;
      let isAnemia: boolean | undefined;
      let isKek: boolean | undefined;
      let isRisikoStunting: boolean | undefined;

      if (p.jenis_sasaran === 'CATIN') {
        catinData = this.state.catin.find(c => c.pendampingan_id === p.id);
        if (catinData) {
          targetNama = catinData.nama;
          targetAlamat = catinData.alamat;
          targetNoHp = catinData.no_hp;
          targetPmt = catinData.status_pmt;
          targetSumberPmt = catinData.sumber_pmt;
          targetLansia = catinData.lansia_dalam_rumah;

          if (catinData.tinggi_badan > 0 && catinData.berat_badan > 0) {
            const tbMeter = catinData.tinggi_badan / 100;
            imt = Number((catinData.berat_badan / (tbMeter * tbMeter)).toFixed(1));
          }
          isAnemia = catinData.kadar_hb < 12.0;
          isKek = catinData.lila < 23.5;
          isRisikoStunting = isAnemia || isKek || catinData.merokok_terpapar === 'Ya';
        }
      } else if (p.jenis_sasaran === 'BUFAS') {
        bufasData = this.state.bufas.find(b => b.pendampingan_id === p.id);
        if (bufasData) {
          targetNama = bufasData.nama;
          targetAlamat = bufasData.alamat;
          targetNoHp = bufasData.no_hp;
          targetPmt = bufasData.status_pmt;
          targetSumberPmt = bufasData.sumber_pmt;
          targetLansia = bufasData.lansia_dalam_rumah;

          isRisikoStunting = bufasData.bbl < 2500 || bufasData.pbl < 48;
        }
      } else if (p.jenis_sasaran === 'IBU_HAMIL') {
        ibuHamilData = this.state.ibu_hamil.find(h => h.pendampingan_id === p.id);
        if (ibuHamilData) {
          targetNama = ibuHamilData.nama;
          targetAlamat = ibuHamilData.alamat;
          targetNoHp = ibuHamilData.no_hp;
          targetPmt = ibuHamilData.status_pmt;
          targetSumberPmt = ibuHamilData.sumber_pmt;
          targetLansia = ibuHamilData.lansia_dalam_rumah;

          if (ibuHamilData.tinggi_badan > 0 && ibuHamilData.berat_badan > 0) {
            const tbMeter = ibuHamilData.tinggi_badan / 100;
            imt = Number((ibuHamilData.berat_badan / (tbMeter * tbMeter)).toFixed(1));
          }
          isAnemia = ibuHamilData.kadar_hb < 11.0;
          isKek = ibuHamilData.lila < 23.5;
          isRisikoStunting = isAnemia || isKek;
        }
      }

      results.push({
        id: p.id,
        tanggal: p.tanggal,
        kelurahan_id: p.kelurahan_id,
        kelurahan_nama: kel ? kel.nama : 'Tidak Diketahui',
        kemantren: kel ? kel.kemantren : 'Kota Yogyakarta',
        kecamatan: kel ? kel.kecamatan : 'Kota Yogyakarta',
        jenis_sasaran: p.jenis_sasaran,
        kunjungan_ke: p.kunjungan_ke,
        catatan_kunjungan: p.catatan_kunjungan,
        status_kunjungan: p.status_kunjungan,
        jadwal_berikutnya: p.jadwal_berikutnya,
        created_by: p.created_by,
        petugas_nama: officer ? officer.full_name : 'Petugas TPK',
        created_at: p.created_at,
        updated_at: p.updated_at,
        nama: targetNama,
        alamat: targetAlamat,
        no_hp: targetNoHp,
        status_pmt: targetPmt,
        sumber_pmt: targetSumberPmt,
        lansia_dalam_rumah: targetLansia,
        catin_data: catinData,
        bufas_data: bufasData,
        ibu_hamil_data: ibuHamilData,
        imt,
        is_anemia: isAnemia,
        is_kek: isKek,
        is_risiko_stunting: isRisikoStunting,
        catatan_singkat: (this.state.catatan_singkat || [])
          .filter(c => c.pendampingan_id === p.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        latitude: p.latitude ?? (this.state.catatan_singkat || []).find(c => c.pendampingan_id === p.id && c.latitude)?.latitude,
        longitude: p.longitude ?? (this.state.catatan_singkat || []).find(c => c.pendampingan_id === p.id && c.longitude)?.longitude,
        gps_accuracy: p.gps_accuracy ?? (this.state.catatan_singkat || []).find(c => c.pendampingan_id === p.id && c.gps_accuracy)?.gps_accuracy,
        lokasi_label: p.lokasi_label ?? (this.state.catatan_singkat || []).find(c => c.pendampingan_id === p.id && c.lokasi_label)?.lokasi_label,
      });
    }

    results.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    return results;
  }

  // --- CRUD Pendampingan & Target Entities ---
  public createPendampingan(
    pendampinganData: Omit<Pendampingan, 'id' | 'created_by' | 'created_at' | 'updated_at'>,
    targetData: {
      catin?: Omit<Catin, 'id' | 'pendampingan_id' | 'created_by' | 'created_at' | 'updated_at'>;
      bufas?: Omit<Bufas, 'id' | 'pendampingan_id' | 'created_by' | 'created_at' | 'updated_at'>;
      ibu_hamil?: Omit<IbuHamil, 'id' | 'pendampingan_id' | 'created_by' | 'created_at' | 'updated_at'>;
    },
    currentUser: User
  ): { success: boolean; id?: number; error?: string } {
    try {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newPendampinganId = Math.max(...this.state.pendampingan.map(p => p.id), 0) + 1;

      const newPendampingan: Pendampingan = {
        id: newPendampinganId,
        tanggal: pendampinganData.tanggal,
        kelurahan_id: Number(pendampinganData.kelurahan_id),
        jenis_sasaran: pendampinganData.jenis_sasaran,
        kunjungan_ke: Number(pendampinganData.kunjungan_ke || 1),
        catatan_kunjungan: pendampinganData.catatan_kunjungan || '',
        status_kunjungan: pendampinganData.status_kunjungan || 'Selesai',
        jadwal_berikutnya: pendampinganData.jadwal_berikutnya || undefined,
        created_by: currentUser.id,
        created_at: now,
        updated_at: now,
      };

      this.state.pendampingan.push(newPendampingan);
      let targetNameLogged = '';

      if (pendampinganData.jenis_sasaran === 'CATIN' && targetData.catin) {
        const catinId = Math.max(...this.state.catin.map(c => c.id), 0) + 1;
        const newCatin: Catin = {
          id: catinId,
          pendampingan_id: newPendampinganId,
          nama: targetData.catin.nama.trim(),
          alamat: targetData.catin.alamat.trim(),
          no_hp: targetData.catin.no_hp.trim(),
          usia: Number(targetData.catin.usia),
          tinggi_badan: Number(targetData.catin.tinggi_badan),
          berat_badan: Number(targetData.catin.berat_badan),
          kadar_hb: Number(targetData.catin.kadar_hb),
          lila: Number(targetData.catin.lila),
          merokok_terpapar: targetData.catin.merokok_terpapar,
          status_pmt: targetData.catin.status_pmt,
          sumber_pmt: targetData.catin.status_pmt === 'Sudah' ? targetData.catin.sumber_pmt : null,
          lansia_dalam_rumah: targetData.catin.lansia_dalam_rumah,
          created_by: currentUser.id,
          created_at: now,
          updated_at: now,
        };
        this.state.catin.push(newCatin);
        targetNameLogged = newCatin.nama;
      } else if (pendampinganData.jenis_sasaran === 'BUFAS' && targetData.bufas) {
        const bufasId = Math.max(...this.state.bufas.map(b => b.id), 0) + 1;
        const newBufas: Bufas = {
          id: bufasId,
          pendampingan_id: newPendampinganId,
          nama: targetData.bufas.nama.trim(),
          alamat: targetData.bufas.alamat.trim(),
          no_hp: targetData.bufas.no_hp.trim(),
          anak_ke: Number(targetData.bufas.anak_ke),
          tgl_lahir_anak: targetData.bufas.tgl_lahir_anak,
          bbl: Number(targetData.bufas.bbl),
          pbl: Number(targetData.bufas.pbl),
          lika: Number(targetData.bufas.lika),
          metode_persalinan: targetData.bufas.metode_persalinan,
          usia_kehamilan_saat_lahir: Number(targetData.bufas.usia_kehamilan_saat_lahir),
          status_kbpp: targetData.bufas.status_kbpp,
          jenis_kbpp: targetData.bufas.status_kbpp === 'Sudah' ? targetData.bufas.jenis_kbpp : null,
          komplikasi_nifas: targetData.bufas.komplikasi_nifas || 'Tidak ada',
          status_pmt: targetData.bufas.status_pmt,
          sumber_pmt: targetData.bufas.status_pmt === 'Sudah' ? targetData.bufas.sumber_pmt : null,
          lansia_dalam_rumah: targetData.bufas.lansia_dalam_rumah,
          created_by: currentUser.id,
          created_at: now,
          updated_at: now,
        };
        this.state.bufas.push(newBufas);
        targetNameLogged = newBufas.nama;
      } else if (pendampinganData.jenis_sasaran === 'IBU_HAMIL' && targetData.ibu_hamil) {
        const bumId = Math.max(...this.state.ibu_hamil.map(h => h.id), 0) + 1;
        const newBumil: IbuHamil = {
          id: bumId,
          pendampingan_id: newPendampinganId,
          nama: targetData.ibu_hamil.nama.trim(),
          alamat: targetData.ibu_hamil.alamat.trim(),
          no_hp: targetData.ibu_hamil.no_hp.trim(),
          usia: Number(targetData.ibu_hamil.usia),
          usia_kehamilan_minggu: Number(targetData.ibu_hamil.usia_kehamilan_minggu),
          hpht: targetData.ibu_hamil.hpht,
          htp: targetData.ibu_hamil.htp,
          tinggi_badan: Number(targetData.ibu_hamil.tinggi_badan),
          berat_badan: Number(targetData.ibu_hamil.berat_badan),
          kadar_hb: Number(targetData.ibu_hamil.kadar_hb),
          lila: Number(targetData.ibu_hamil.lila),
          merokok_terpapar: targetData.ibu_hamil.merokok_terpapar,
          status_pmt: targetData.ibu_hamil.status_pmt,
          sumber_pmt: targetData.ibu_hamil.status_pmt === 'Sudah' ? targetData.ibu_hamil.sumber_pmt : null,
          lansia_dalam_rumah: targetData.ibu_hamil.lansia_dalam_rumah,
          created_by: currentUser.id,
          created_at: now,
          updated_at: now,
        };
        this.state.ibu_hamil.push(newBumil);
        targetNameLogged = newBumil.nama;
      }

      this.persist();

      const kelObj = this.state.kelurahan.find(k => k.id === Number(pendampinganData.kelurahan_id));

      this.logAudit({
        user_id: currentUser.id,
        username: currentUser.username,
        action: 'TAMBAH',
        entity: 'Pendampingan',
        entity_id: newPendampinganId,
        details: `Menambahkan pendampingan ${pendampinganData.jenis_sasaran} "${targetNameLogged}" di Kel. ${kelObj?.nama || '-'} (${kelObj?.kemantren || '-'})`,
      });

      return { success: true, id: newPendampinganId };
    } catch (e: any) {
      return { success: false, error: e.message || 'Gagal menyimpan pendampingan.' };
    }
  }

  public updatePendampingan(
    id: number,
    pendampinganData: Omit<Pendampingan, 'id' | 'created_by' | 'created_at' | 'updated_at'>,
    targetData: {
      catin?: Partial<Catin>;
      bufas?: Partial<Bufas>;
      ibu_hamil?: Partial<IbuHamil>;
    },
    currentUser: User
  ): { success: boolean; error?: string } {
    try {
      const idx = this.state.pendampingan.findIndex(p => p.id === id);
      if (idx === -1) {
        return { success: false, error: 'Data pendampingan tidak ditemukan.' };
      }

      const existing = this.state.pendampingan[idx];

      if (currentUser.role === 'PETUGAS_TPK' && currentUser.kelurahan_id && existing.kelurahan_id !== currentUser.kelurahan_id) {
        return { success: false, error: 'Akses ditolak: Anda hanya dapat mengubah data di wilayah kelurahan Anda.' };
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      this.state.pendampingan[idx] = {
        ...existing,
        tanggal: pendampinganData.tanggal,
        kelurahan_id: Number(pendampinganData.kelurahan_id),
        jenis_sasaran: pendampinganData.jenis_sasaran,
        kunjungan_ke: Number(pendampinganData.kunjungan_ke),
        catatan_kunjungan: pendampinganData.catatan_kunjungan,
        status_kunjungan: pendampinganData.status_kunjungan,
        jadwal_berikutnya: pendampinganData.jadwal_berikutnya !== undefined ? pendampinganData.jadwal_berikutnya : existing.jadwal_berikutnya,
        updated_at: now,
      };

      let targetNameLogged = '';

      if (pendampinganData.jenis_sasaran === 'CATIN' && targetData.catin) {
        const catIdx = this.state.catin.findIndex(c => c.pendampingan_id === id);
        if (catIdx !== -1) {
          const old = this.state.catin[catIdx];
          this.state.catin[catIdx] = {
            ...old,
            nama: targetData.catin.nama ?? old.nama,
            alamat: targetData.catin.alamat ?? old.alamat,
            no_hp: targetData.catin.no_hp ?? old.no_hp,
            usia: Number(targetData.catin.usia ?? old.usia),
            tinggi_badan: Number(targetData.catin.tinggi_badan ?? old.tinggi_badan),
            berat_badan: Number(targetData.catin.berat_badan ?? old.berat_badan),
            kadar_hb: Number(targetData.catin.kadar_hb ?? old.kadar_hb),
            lila: Number(targetData.catin.lila ?? old.lila),
            merokok_terpapar: targetData.catin.merokok_terpapar ?? old.merokok_terpapar,
            status_pmt: targetData.catin.status_pmt ?? old.status_pmt,
            sumber_pmt: targetData.catin.status_pmt === 'Sudah' ? (targetData.catin.sumber_pmt ?? old.sumber_pmt) : null,
            lansia_dalam_rumah: targetData.catin.lansia_dalam_rumah ?? old.lansia_dalam_rumah,
            updated_at: now,
          };
          targetNameLogged = this.state.catin[catIdx].nama;
        }
      } else if (pendampinganData.jenis_sasaran === 'BUFAS' && targetData.bufas) {
        const bufIdx = this.state.bufas.findIndex(b => b.pendampingan_id === id);
        if (bufIdx !== -1) {
          const old = this.state.bufas[bufIdx];
          this.state.bufas[bufIdx] = {
            ...old,
            nama: targetData.bufas.nama ?? old.nama,
            alamat: targetData.bufas.alamat ?? old.alamat,
            no_hp: targetData.bufas.no_hp ?? old.no_hp,
            anak_ke: Number(targetData.bufas.anak_ke ?? old.anak_ke),
            tgl_lahir_anak: targetData.bufas.tgl_lahir_anak ?? old.tgl_lahir_anak,
            bbl: Number(targetData.bufas.bbl ?? old.bbl),
            pbl: Number(targetData.bufas.pbl ?? old.pbl),
            lika: Number(targetData.bufas.lika ?? old.lika),
            metode_persalinan: targetData.bufas.metode_persalinan ?? old.metode_persalinan,
            usia_kehamilan_saat_lahir: Number(targetData.bufas.usia_kehamilan_saat_lahir ?? old.usia_kehamilan_saat_lahir),
            status_kbpp: targetData.bufas.status_kbpp ?? old.status_kbpp,
            jenis_kbpp: targetData.bufas.status_kbpp === 'Sudah' ? (targetData.bufas.jenis_kbpp ?? old.jenis_kbpp) : null,
            komplikasi_nifas: targetData.bufas.komplikasi_nifas ?? old.komplikasi_nifas,
            status_pmt: targetData.bufas.status_pmt ?? old.status_pmt,
            sumber_pmt: targetData.bufas.status_pmt === 'Sudah' ? (targetData.bufas.sumber_pmt ?? old.sumber_pmt) : null,
            lansia_dalam_rumah: targetData.bufas.lansia_dalam_rumah ?? old.lansia_dalam_rumah,
            updated_at: now,
          };
          targetNameLogged = this.state.bufas[bufIdx].nama;
        }
      } else if (pendampinganData.jenis_sasaran === 'IBU_HAMIL' && targetData.ibu_hamil) {
        const bumIdx = this.state.ibu_hamil.findIndex(h => h.pendampingan_id === id);
        if (bumIdx !== -1) {
          const old = this.state.ibu_hamil[bumIdx];
          this.state.ibu_hamil[bumIdx] = {
            ...old,
            nama: targetData.ibu_hamil.nama ?? old.nama,
            alamat: targetData.ibu_hamil.alamat ?? old.alamat,
            no_hp: targetData.ibu_hamil.no_hp ?? old.no_hp,
            usia: Number(targetData.ibu_hamil.usia ?? old.usia),
            usia_kehamilan_minggu: Number(targetData.ibu_hamil.usia_kehamilan_minggu ?? old.usia_kehamilan_minggu),
            hpht: targetData.ibu_hamil.hpht ?? old.hpht,
            htp: targetData.ibu_hamil.htp ?? old.htp,
            tinggi_badan: Number(targetData.ibu_hamil.tinggi_badan ?? old.tinggi_badan),
            berat_badan: Number(targetData.ibu_hamil.berat_badan ?? old.berat_badan),
            kadar_hb: Number(targetData.ibu_hamil.kadar_hb ?? old.kadar_hb),
            lila: Number(targetData.ibu_hamil.lila ?? old.lila),
            merokok_terpapar: targetData.ibu_hamil.merokok_terpapar ?? old.merokok_terpapar,
            status_pmt: targetData.ibu_hamil.status_pmt ?? old.status_pmt,
            sumber_pmt: targetData.ibu_hamil.status_pmt === 'Sudah' ? (targetData.ibu_hamil.sumber_pmt ?? old.sumber_pmt) : null,
            lansia_dalam_rumah: targetData.ibu_hamil.lansia_dalam_rumah ?? old.lansia_dalam_rumah,
            updated_at: now,
          };
          targetNameLogged = this.state.ibu_hamil[bumIdx].nama;
        }
      }

      this.persist();

      this.logAudit({
        user_id: currentUser.id,
        username: currentUser.username,
        action: 'EDIT',
        entity: 'Pendampingan',
        entity_id: id,
        details: `Memperbarui data pendampingan #${id} (${pendampinganData.jenis_sasaran} "${targetNameLogged}")`,
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Gagal memperbarui data.' };
    }
  }

  public deletePendampingan(id: number, currentUser: User): { success: boolean; error?: string } {
    try {
      const existing = this.state.pendampingan.find(p => p.id === id);
      if (!existing) {
        return { success: false, error: 'Data tidak ditemukan.' };
      }

      if (currentUser.role === 'PETUGAS_TPK' && currentUser.kelurahan_id && existing.kelurahan_id !== currentUser.kelurahan_id) {
        return { success: false, error: 'Akses ditolak: Anda hanya dapat menghapus data di wilayah Anda.' };
      }

      this.state.pendampingan = this.state.pendampingan.filter(p => p.id !== id);
      this.state.catin = this.state.catin.filter(c => c.pendampingan_id !== id);
      this.state.bufas = this.state.bufas.filter(b => b.pendampingan_id !== id);
      this.state.ibu_hamil = this.state.ibu_hamil.filter(h => h.pendampingan_id !== id);
      this.state.catatan_singkat = (this.state.catatan_singkat || []).filter(c => c.pendampingan_id !== id);

      this.persist();

      this.logAudit({
        user_id: currentUser.id,
        username: currentUser.username,
        action: 'HAPUS',
        entity: 'Pendampingan',
        entity_id: id,
        details: `Menghapus pendampingan #${id} (${existing.jenis_sasaran})`,
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Gagal menghapus data.' };
    }
  }

  // --- Catatan Singkat & Log Lapangan TPK ---
  public getCatatanSingkat(pendampinganId: number): CatatanSingkat[] {
    return (this.state.catatan_singkat || [])
      .filter(c => c.pendampingan_id === pendampinganId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addCatatanSingkat(
    entry: {
      pendampinganId: number;
      kategori: KategoriCatatanSingkat;
      catatan: string;
      tanggal?: string;
      statusUpdate?: 'Selesai' | 'Perlu Rujukan' | 'Jadwal Ulang';
      jadwalBerikutnya?: string;
      latitude?: number;
      longitude?: number;
      gpsAccuracy?: number;
      lokasiLabel?: string;
      waktuGps?: string;
    },
    currentUser: User
  ): { success: boolean; data?: CatatanSingkat; error?: string } {
    try {
      const pIdx = this.state.pendampingan.findIndex(p => p.id === entry.pendampinganId);
      if (pIdx === -1) {
        return { success: false, error: 'Data pendampingan tidak ditemukan.' };
      }

      if (!entry.catatan || !entry.catatan.trim()) {
        return { success: false, error: 'Isi catatan singkat tidak boleh kosong.' };
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const todayDate = entry.tanggal || new Date().toISOString().substring(0, 10);
      const noteId = `cs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newNote: CatatanSingkat = {
        id: noteId,
        pendampingan_id: entry.pendampinganId,
        tanggal: todayDate,
        kategori: entry.kategori,
        catatan: entry.catatan.trim(),
        petugas_id: currentUser.id,
        petugas_nama: currentUser.full_name || currentUser.username,
        created_at: now,
        status_update: entry.statusUpdate,
        jadwal_berikutnya: entry.jadwalBerikutnya,
        latitude: entry.latitude,
        longitude: entry.longitude,
        gps_accuracy: entry.gpsAccuracy,
        lokasi_label: entry.lokasiLabel,
        waktu_gps: entry.waktuGps || (entry.latitude ? now : undefined),
      };

      if (!this.state.catatan_singkat) {
        this.state.catatan_singkat = [];
      }
      this.state.catatan_singkat.unshift(newNote);

      // Update pendampingan status, schedule, and latest verified GPS
      const existingP = this.state.pendampingan[pIdx];
      let pUpdated = false;
      if (entry.statusUpdate && entry.statusUpdate !== existingP.status_kunjungan) {
        existingP.status_kunjungan = entry.statusUpdate;
        pUpdated = true;
      }
      if (entry.jadwalBerikutnya && entry.jadwalBerikutnya !== existingP.jadwal_berikutnya) {
        existingP.jadwal_berikutnya = entry.jadwalBerikutnya;
        pUpdated = true;
      }
      if (entry.latitude && entry.longitude) {
        existingP.latitude = entry.latitude;
        existingP.longitude = entry.longitude;
        existingP.gps_accuracy = entry.gpsAccuracy;
        existingP.lokasi_label = entry.lokasiLabel;
        pUpdated = true;
      }
      if (pUpdated) {
        existingP.updated_at = now;
      }

      this.persist();

      const gpsDetails = entry.latitude
        ? ` [GPS Terverifikasi: ${entry.latitude.toFixed(5)}, ${entry.longitude?.toFixed(5)} ±${entry.gpsAccuracy?.toFixed(1) || '?'}m]`
        : '';

      this.logAudit({
        user_id: currentUser.id,
        username: currentUser.username,
        action: 'TAMBAH',
        entity: 'Pendampingan',
        entity_id: entry.pendampinganId,
        details: `Menambahkan Catatan Singkat [${entry.kategori}]${gpsDetails} untuk sasaran pendampingan #${entry.pendampinganId}: "${entry.catatan.trim().substring(0, 50)}..."`,
      });

      return { success: true, data: newNote };
    } catch (e: any) {
      return { success: false, error: e.message || 'Gagal menyimpan catatan singkat.' };
    }
  }

  public deleteCatatanSingkat(noteId: string, currentUser: User): { success: boolean; error?: string } {
    try {
      const idx = (this.state.catatan_singkat || []).findIndex(c => c.id === noteId);
      if (idx === -1) {
        return { success: false, error: 'Catatan tidak ditemukan.' };
      }

      const note = this.state.catatan_singkat[idx];
      if (currentUser.role !== 'ADMIN' && note.petugas_id !== currentUser.id) {
        return { success: false, error: 'Akses ditolak: Anda hanya dapat menghapus catatan yang Anda buat sendiri.' };
      }

      this.state.catatan_singkat.splice(idx, 1);
      this.persist();

      this.logAudit({
        user_id: currentUser.id,
        username: currentUser.username,
        action: 'HAPUS',
        entity: 'Pendampingan',
        entity_id: note.pendampingan_id,
        details: `Menghapus Catatan Singkat [${note.kategori}] dari pendampingan #${note.pendampingan_id}`,
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Gagal menghapus catatan.' };
    }
  }

  public getUnifiedRecordById(id: number, currentUser?: User | null): UnifiedPendampingan | null {
    const list = this.getUnifiedPendampinganList(currentUser);
    return list.find(r => r.id === id) || null;
  }

  // --- Rekapitulasi Aggregations ---
  public getRekapitulasi(): RekapitulasiRow[] {
    const list = this.getUnifiedPendampinganList();

    return this.state.kelurahan.map(kel => {
      const kelRecords = list.filter(r => r.kelurahan_id === kel.id);

      const catinRecords = kelRecords.filter(r => r.jenis_sasaran === 'CATIN');
      const bufasRecords = kelRecords.filter(r => r.jenis_sasaran === 'BUFAS');
      const bumilRecords = kelRecords.filter(r => r.jenis_sasaran === 'IBU_HAMIL');

      return {
        kelurahan_id: kel.id,
        kelurahan_nama: kel.nama,
        kemantren: kel.kemantren,
        kecamatan: kel.kemantren,
        total_catin: catinRecords.length,
        catin_anemia: catinRecords.filter(c => c.is_anemia).length,
        catin_kek: catinRecords.filter(c => c.is_kek).length,
        catin_pmt: catinRecords.filter(c => c.status_pmt === 'Sudah').length,

        total_bufas: bufasRecords.length,
        bufas_kbpp: bufasRecords.filter(b => b.bufas_data?.status_kbpp === 'Sudah').length,
        bufas_pmt: bufasRecords.filter(b => b.status_pmt === 'Sudah').length,

        total_bumil: bumilRecords.length,
        bumil_anemia: bumilRecords.filter(h => h.is_anemia).length,
        bumil_kek: bumilRecords.filter(h => h.is_kek).length,
        bumil_pmt: bumilRecords.filter(h => h.status_pmt === 'Sudah').length,

        total_pendampingan: kelRecords.length,
      };
    });
  }

  // --- Database Backup & Restore (Admin Only) ---
  public exportJSONBackup(currentUser: User): string {
    if (currentUser.role !== 'ADMIN') {
      throw new Error('Akses ditolak: Hanya ADMIN yang berhak mengunduh backup database mentah.');
    }

    this.logAudit({
      user_id: currentUser.id,
      username: currentUser.username,
      action: 'BACKUP_DB',
      entity: 'Database',
      entity_id: null,
      details: 'Mengunduh cadangan database mentah format JSON/SQLite.',
    });

    return JSON.stringify(
      {
        meta: {
          app: 'SISTEM PENDATAAN TPK KOTA YOGYAKARTA',
          export_date: new Date().toISOString(),
          version: '3.0.0-kemantren-hierarchy',
          exported_by: currentUser.username,
          kemantren_count: 14,
          kelurahan_count: this.state.kelurahan.length,
        },
        database: this.state,
      },
      null,
      2
    );
  }

  public exportSQLDump(currentUser: User): string {
    if (currentUser.role !== 'ADMIN') {
      throw new Error('Akses ditolak: Hanya ADMIN yang berhak mengunduh SQL dump.');
    }

    const s = this.state;
    let sql = `-- SISTEM PENDATAAN TPK (Tim Pendamping Keluarga) KOTA YOGYAKARTA
-- 14 Kemantren Termasuk 45 Kelurahan
-- Generated: ${new Date().toISOString()}
-- Exported by: ${currentUser.username}

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS kelurahan (
  id INTEGER PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE,
  kemantren VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  target_sasaran INTEGER DEFAULT 0,
  penanggung_jawab VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK(role IN ('ADMIN', 'PETUGAS_TPK')),
  kelurahan_id INTEGER REFERENCES kelurahan(id) ON DELETE SET NULL,
  no_hp VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pendampingan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal DATE NOT NULL,
  kelurahan_id INTEGER NOT NULL REFERENCES kelurahan(id) ON DELETE CASCADE,
  jenis_sasaran VARCHAR(20) NOT NULL CHECK(jenis_sasaran IN ('CATIN', 'BUFAS', 'IBU_HAMIL')),
  kunjungan_ke INTEGER DEFAULT 1,
  catatan_kunjungan TEXT,
  status_kunjungan VARCHAR(50) DEFAULT 'Selesai',
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pendampingan_id INTEGER NOT NULL UNIQUE REFERENCES pendampingan(id) ON DELETE CASCADE,
  nama VARCHAR(150) NOT NULL,
  alamat TEXT NOT NULL,
  no_hp VARCHAR(25) NOT NULL,
  usia INTEGER NOT NULL,
  tinggi_badan DECIMAL(5,2) NOT NULL,
  berat_badan DECIMAL(5,2) NOT NULL,
  kadar_hb DECIMAL(4,2) NOT NULL,
  lila DECIMAL(4,2) NOT NULL,
  merokok_terpapar VARCHAR(10) NOT NULL CHECK(merokok_terpapar IN ('Ya', 'Tidak')),
  status_pmt VARCHAR(10) NOT NULL CHECK(status_pmt IN ('Sudah', 'Belum')),
  sumber_pmt VARCHAR(50),
  lansia_dalam_rumah VARCHAR(15) NOT NULL CHECK(lansia_dalam_rumah IN ('Ada', 'Tidak Ada')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bufas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pendampingan_id INTEGER NOT NULL UNIQUE REFERENCES pendampingan(id) ON DELETE CASCADE,
  nama VARCHAR(150) NOT NULL,
  alamat TEXT NOT NULL,
  no_hp VARCHAR(25) NOT NULL,
  anak_ke INTEGER NOT NULL,
  tgl_lahir_anak DATE NOT NULL,
  bbl DECIMAL(6,2) NOT NULL,
  pbl DECIMAL(5,2) NOT NULL,
  lika DECIMAL(4,2) NOT NULL,
  metode_persalinan VARCHAR(50) NOT NULL,
  usia_kehamilan_saat_lahir INTEGER NOT NULL,
  status_kbpp VARCHAR(10) NOT NULL CHECK(status_kbpp IN ('Sudah', 'Belum')),
  jenis_kbpp VARCHAR(100),
  komplikasi_nifas TEXT,
  status_pmt VARCHAR(10) NOT NULL CHECK(status_pmt IN ('Sudah', 'Belum')),
  sumber_pmt VARCHAR(50),
  lansia_dalam_rumah VARCHAR(15) NOT NULL CHECK(lansia_dalam_rumah IN ('Ada', 'Tidak Ada')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ibu_hamil (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pendampingan_id INTEGER NOT NULL UNIQUE REFERENCES pendampingan(id) ON DELETE CASCADE,
  nama VARCHAR(150) NOT NULL,
  alamat TEXT NOT NULL,
  no_hp VARCHAR(25) NOT NULL,
  usia INTEGER NOT NULL,
  usia_kehamilan_minggu INTEGER NOT NULL,
  hpht DATE,
  htp DATE,
  tinggi_badan DECIMAL(5,2) NOT NULL,
  berat_badan DECIMAL(5,2) NOT NULL,
  kadar_hb DECIMAL(4,2) NOT NULL,
  lila DECIMAL(4,2) NOT NULL,
  merokok_terpapar VARCHAR(10) NOT NULL CHECK(merokok_terpapar IN ('Ya', 'Tidak')),
  status_pmt VARCHAR(10) NOT NULL CHECK(status_pmt IN ('Sudah', 'Belum')),
  sumber_pmt VARCHAR(50),
  lansia_dalam_rumah VARCHAR(15) NOT NULL CHECK(lansia_dalam_rumah IN ('Ada', 'Tidak Ada')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  username VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

    s.kelurahan.forEach(k => {
      sql += `INSERT OR REPLACE INTO kelurahan (id, nama, kemantren, kecamatan, target_sasaran, penanggung_jawab) VALUES (${k.id}, '${k.nama}', '${k.kemantren}', '${k.kecamatan}', ${k.target_sasaran}, '${k.penanggung_jawab}');\n`;
    });

    s.users.forEach(u => {
      sql += `INSERT OR REPLACE INTO users (id, username, password_hash, full_name, role, kelurahan_id, no_hp, created_at) VALUES (${u.id}, '${u.username}', '${u.password_hash}', '${u.full_name}', '${u.role}', ${u.kelurahan_id || 'NULL'}, '${u.no_hp}', '${u.created_at}');\n`;
    });

    s.pendampingan.forEach(p => {
      sql += `INSERT OR REPLACE INTO pendampingan (id, tanggal, kelurahan_id, jenis_sasaran, kunjungan_ke, catatan_kunjungan, status_kunjungan, created_by, created_at, updated_at) VALUES (${p.id}, '${p.tanggal}', ${p.kelurahan_id}, '${p.jenis_sasaran}', ${p.kunjungan_ke}, '${p.catatan_kunjungan.replace(/'/g, "''")}', '${p.status_kunjungan}', ${p.created_by}, '${p.created_at}', '${p.updated_at}');\n`;
    });

    return sql;
  }

  public restoreBackup(jsonString: string, currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak: Hanya ADMIN yang dapat merestore database.' };
    }

    try {
      const parsed = JSON.parse(jsonString);
      const incoming = parsed.database || parsed;

      if (!incoming.pendampingan || !incoming.users || !incoming.kelurahan) {
        return { success: false, error: 'Format berkas backup tidak valid (tabel wajib tidak lengkap).' };
      }

      if (!incoming.catatan_singkat || !Array.isArray(incoming.catatan_singkat)) {
        incoming.catatan_singkat = [];
      }

      this.state = incoming;
      this.persist();

      this.logAudit({
        user_id: currentUser.id,
        username: currentUser.username,
        action: 'RESTORE_DB',
        entity: 'Database',
        entity_id: null,
        details: 'Memulihkan database dari berkas backup JSON/SQLite.',
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Gagal memproses berkas backup: ' + e.message };
    }
  }

  public resetToFactory(currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Akses ditolak.' };
    }

    this.state = {
      kelurahan: KOTA_YOGYAKARTA_KELURAHAN,
      users: DEFAULT_USERS,
      pendampingan: SEED_PENDAMPINGAN,
      catin: SEED_CATIN,
      bufas: SEED_BUFAS,
      ibu_hamil: SEED_IBU_HAMIL,
      audit_logs: SEED_AUDIT_LOGS,
      catatan_singkat: SEED_CATATAN_SINGKAT,
    };
    this.persist();

    this.logAudit({
      user_id: currentUser.id,
      username: currentUser.username,
      action: 'RESTORE_DB',
      entity: 'Database',
      entity_id: null,
      details: 'Mereset database ke kondisi data awal 14 Kemantren dan 45 Kelurahan Kota Yogyakarta.',
    });

    return { success: true };
  }
}

export const dbService = new TpkDatabaseService();
