import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Code2,
  Copy,
  Database,
  Download,
  FileCode,
  FileText,
  RotateCcw,
  ShieldAlert,
  Upload,
  X,
} from 'lucide-react';
import { dbService } from '../services/database';
import { downloadJsonDatabaseBackup, downloadSqlDatabaseBackup } from '../services/exportService';
import { User } from '../types';

interface DatabaseBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onDataRestored: () => void;
}

export const DatabaseBackupModal: React.FC<DatabaseBackupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDataRestored,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'django'>('backup');
  const [copiedDjango, setCopiedDjango] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const res = dbService.restoreBackup(content, currentUser);
      if (res.success) {
        setRestoreStatus({ success: true, msg: 'Database berhasil dipulihkan dari berkas cadangan!' });
        onDataRestored();
      } else {
        setRestoreStatus({ success: false, msg: res.error || 'Gagal memulihkan database.' });
      }
    };
    reader.readAsText(file);
  };

  const handleResetFactory = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke setelan pabrik? Data yang belum dicadangkan akan hilang.')) {
      const res = dbService.resetToFactory(currentUser);
      if (res.success) {
        setRestoreStatus({ success: true, msg: 'Database berhasil direset ke kondisi pabrik.' });
        onDataRestored();
      } else {
        setRestoreStatus({ success: false, msg: res.error });
      }
    }
  };

  const djangoModelsCode = `# Django Models: tpk_app/models.py
# SISTEM PENDATAAN TPK (Tim Pendamping Keluarga)
from django.db import models
from django.contrib.auth.models import AbstractUser

class Kelurahan(models.Model):
    nama = models.CharField(max_length=100, unique=True)
    kecamatan = models.CharField(max_length=100)
    target_sasaran = models.PositiveIntegerField(default=0)
    penanggung_jawab = models.CharField(max_length=150, blank=True)

    class Meta:
        db_table = 'kelurahan'
        verbose_name_plural = 'Kelurahan'

    def __str__(self):
        return f"{self.nama} ({self.kecamatan})"

class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Koordinator TPK / Admin'),
        ('PETUGAS_TPK', 'Petugas Pendamping Lapangan'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PETUGAS_TPK')
    kelurahan = models.ForeignKey(Kelurahan, on_delete=models.SET_NULL, null=True, blank=True)
    no_hp = models.CharField(max_length=20, blank=True)

class Pendampingan(models.Model):
    SASARAN_CHOICES = [
        ('CATIN', 'Calon Pengantin'),
        ('BUFAS', 'Ibu Nifas'),
        ('IBU_HAMIL', 'Ibu Hamil'),
    ]
    tanggal = models.DateField()
    kelurahan = models.ForeignKey(Kelurahan, on_delete=models.CASCADE, related_name='pendampingan_list')
    jenis_sasaran = models.CharField(max_length=20, choices=SASARAN_CHOICES)
    kunjungan_ke = models.PositiveSmallIntegerField(default=1)
    catatan_kunjungan = models.TextField(blank=True)
    status_kunjungan = models.CharField(max_length=50, default='Selesai')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Catin(models.Model):
    pendampingan = models.OneToOneField(Pendampingan, on_delete=models.CASCADE, related_name='catin_detail')
    nama = models.CharField(max_length=150)
    alamat = models.TextField()
    no_hp = models.CharField(max_length=25)
    usia = models.PositiveSmallIntegerField()
    tinggi_badan = models.DecimalField(max_digits=5, decimal_places=2)
    berat_badan = models.DecimalField(max_digits=5, decimal_places=2)
    kadar_hb = models.DecimalField(max_digits=4, decimal_places=2)
    lila = models.DecimalField(max_digits=4, decimal_places=2)
    merokok_terpapar = models.CharField(max_length=10, choices=[('Ya', 'Ya'), ('Tidak', 'Tidak')])
    status_pmt = models.CharField(max_length=10, choices=[('Sudah', 'Sudah'), ('Belum', 'Belum')])
    sumber_pmt = models.CharField(max_length=50, null=True, blank=True)
    lansia_dalam_rumah = models.CharField(max_length=15, choices=[('Ada', 'Ada'), ('Tidak Ada', 'Tidak Ada')])

class Bufas(models.Model):
    pendampingan = models.OneToOneField(Pendampingan, on_delete=models.CASCADE, related_name='bufas_detail')
    nama = models.CharField(max_length=150)
    alamat = models.TextField()
    no_hp = models.CharField(max_length=25)
    anak_ke = models.PositiveSmallIntegerField()
    tgl_lahir_anak = models.DateField()
    bbl = models.DecimalField(max_digits=6, decimal_places=2)  # gram
    pbl = models.DecimalField(max_digits=5, decimal_places=2)  # cm
    lika = models.DecimalField(max_digits=4, decimal_places=2) # cm
    metode_persalinan = models.CharField(max_length=50)
    usia_kehamilan_saat_lahir = models.PositiveSmallIntegerField()
    status_kbpp = models.CharField(max_length=10, choices=[('Sudah', 'Sudah'), ('Belum', 'Belum')])
    jenis_kbpp = models.CharField(max_length=100, null=True, blank=True)
    komplikasi_nifas = models.TextField(blank=True)
    status_pmt = models.CharField(max_length=10, choices=[('Sudah', 'Sudah'), ('Belum', 'Belum')])
    sumber_pmt = models.CharField(max_length=50, null=True, blank=True)
    lansia_dalam_rumah = models.CharField(max_length=15, choices=[('Ada', 'Ada'), ('Tidak Ada', 'Tidak Ada')])

class IbuHamil(models.Model):
    pendampingan = models.OneToOneField(Pendampingan, on_delete=models.CASCADE, related_name='ibu_hamil_detail')
    nama = models.CharField(max_length=150)
    alamat = models.TextField()
    no_hp = models.CharField(max_length=25)
    usia = models.PositiveSmallIntegerField()
    usia_kehamilan_minggu = models.PositiveSmallIntegerField()
    hpht = models.DateField(null=True, blank=True)
    htp = models.DateField(null=True, blank=True)
    tinggi_badan = models.DecimalField(max_digits=5, decimal_places=2)
    berat_badan = models.DecimalField(max_digits=5, decimal_places=2)
    kadar_hb = models.DecimalField(max_digits=4, decimal_places=2)
    lila = models.DecimalField(max_digits=4, decimal_places=2)
    merokok_terpapar = models.CharField(max_length=10, choices=[('Ya', 'Ya'), ('Tidak', 'Tidak')])
    status_pmt = models.CharField(max_length=10, choices=[('Sudah', 'Sudah'), ('Belum', 'Belum')])
    sumber_pmt = models.CharField(max_length=50, null=True, blank=True)
    lansia_dalam_rumah = models.CharField(max_length=15, choices=[('Ada', 'Ada'), ('Tidak Ada', 'Tidak Ada')])

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    username = models.CharField(max_length=50)
    action = models.CharField(max_length=50)
    entity = models.CharField(max_length=50)
    entity_id = models.IntegerField(null=True, blank=True)
    details = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)`;

  const handleCopyDjango = () => {
    navigator.clipboard.writeText(djangoModelsCode);
    setCopiedDjango(true);
    setTimeout(() => setCopiedDjango(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Database Backup & Relational Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Fitur Administrasi Basis Data · Akses Khusus ADMIN
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Cadangkan (Backup)
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'restore'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Pemulihan & Reset
          </button>
          <button
            onClick={() => setActiveTab('django')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'django'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Python Django ORM Model
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1 text-xs">
          {restoreStatus && (
            <div
              className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                restoreStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <span>{restoreStatus.msg}</span>
              <button
                onClick={() => setRestoreStatus(null)}
                className="text-xs font-bold px-1.5 hover:underline"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Download className="w-4 h-4 text-teal-700" />
                  <span>Unduh Berkas Cadangan Basis Data Mentah</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Sesuai spesifikasi keamanan, hanya pengguna berotoritas <strong>ADMIN</strong> yang diizinkan mengunduh database mentah.
                  Petugas TPK biasa dilarang mengakses berkas ini.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Download SQL Dump */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      <span>SQL Relational Script (.sql)</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Berisi statement DDL lengkap: <code>CREATE TABLE</code>, foreign key constraints, dan <code>INSERT</code> kompatibel SQLite &amp; PostgreSQL.
                    </p>
                    <button
                      onClick={() => downloadSqlDatabaseBackup(currentUser)}
                      className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Database (.sql)</span>
                    </button>
                  </div>

                  {/* Download JSON Database */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-700" />
                      <span>JSON Database Backup (.json)</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Salinan penuh seluruh tabel relasional (Kelurahan, Users, Pendampingan, Catin, Bufas, Bumil, Audit Logs).
                    </p>
                    <button
                      onClick={() => downloadJsonDatabaseBackup(currentUser)}
                      className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Cadangan (.json)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'restore' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Pulihkan Database Dari Berkas Cadangan</span>
                </div>
                <p className="text-slate-600 text-xs">
                  Unggah berkas <code>.json</code> cadangan yang telah diunduh sebelumnya untuk memulihkan seluruh data dan riwayat audit.
                </p>

                <div className="pt-2">
                  <label className="block">
                    <span className="sr-only">Pilih berkas cadangan</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Reset Data ke Setelan Awal (Factory Defaults)</span>
                </div>
                <p className="text-slate-600 text-xs">
                  Mengembalikan database ke sampel data bawaan dengan 5 Kelurahan resmi, 3 akun petugas terverifikasi, dan catatan pendampingan teladan.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleResetFactory}
                    className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Database Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'django' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-teal-700" />
                    <span>Django ORM Models Definition (Python)</span>
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Struktur relasional dan ternormalisasi sesuai spesifikasi arsitektur data TPK
                  </p>
                </div>
                <button
                  onClick={handleCopyDjango}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                >
                  {copiedDjango ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDjango ? 'Tersalin!' : 'Salin models.py'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[350px]">
                <pre>{djangoModelsCode}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
