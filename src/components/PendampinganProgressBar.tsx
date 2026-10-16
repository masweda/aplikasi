import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { JenisSasaran } from '../types';

export interface PendampinganProgressBarProps {
  currentKunjungan: number;
  totalKunjungan?: number;
  jenisSasaran?: JenisSasaran;
  variant?: 'compact' | 'standard' | 'detailed';
  showSteps?: boolean;
  className?: string;
}

/**
 * Mendapatkan target jumlah kunjungan standar BKKBN berdasarkan jenis sasaran
 */
export const getDefaultTargetKunjungan = (jenisSasaran?: JenisSasaran): number => {
  switch (jenisSasaran) {
    case 'CATIN':
      return 3; // Skrining 3 bulan pranikah, Edukasi/Gizi, Verifikasi Elsimil
    case 'BUFAS':
      return 3; // KF1 (1-3 hari), KF2 (4-28 hari), KF3 (29-42 hari & KBPP)
    case 'IBU_HAMIL':
      return 4; // K1 (Trimester 1), K2 (Trimester 2), K3 & K4 (Trimester 3 menjelang HTP)
    default:
      return 3; // Default standar siklus pendampingan 3 kunjungan
  }
};

/**
 * Mendapatkan keterangan deskripsi tahapan kunjungan sesuai jenis sasaran
 */
export const getTahapDescription = (
  kunjunganKe: number,
  jenisSasaran?: JenisSasaran
): string => {
  if (jenisSasaran === 'CATIN') {
    switch (kunjunganKe) {
      case 1:
        return 'Skrining Awal & Registrasi Elsimil';
      case 2:
        return 'Intervensi Gizi, TTD & Konseling Pranikah';
      case 3:
      default:
        return 'Verifikasi Akhir & Sertifikat Layak Nikah';
    }
  }

  if (jenisSasaran === 'BUFAS') {
    switch (kunjunganKe) {
      case 1:
        return 'KF1: Pemantauan Pasca Salin Hari 1-3';
      case 2:
        return 'KF2: Evaluasi ASI Eksklusif & Kondisi Bayi';
      case 3:
      default:
        return 'KF3: Pemantauan Tumbuh Kembang & KBPP';
    }
  }

  if (jenisSasaran === 'IBU_HAMIL') {
    switch (kunjunganKe) {
      case 1:
        return 'Trimester 1: Skrining Awal & Pencegahan KEK';
      case 2:
        return 'Trimester 2: Pemantauan Hb & Intervensi PMT';
      case 3:
        return 'Trimester 3: Kesiapan Persalinan & P4K';
      case 4:
      default:
        return 'Menjelang Persalinan & Rujukan Faskes';
    }
  }

  return `Kunjungan Tahap Ke-${kunjunganKe}`;
};

export const PendampinganProgressBar: React.FC<PendampinganProgressBarProps> = ({
  currentKunjungan,
  totalKunjungan,
  jenisSasaran,
  variant = 'standard',
  showSteps = true,
  className = '',
}) => {
  const current = Math.max(1, currentKunjungan || 1);
  const target = Math.max(current, totalKunjungan || getDefaultTargetKunjungan(jenisSasaran));
  const rawPercentage = Math.round((current / target) * 100);
  const percentage = Math.min(100, rawPercentage);
  const isCompleted = current >= target;

  // Skema warna dinamis berdasarkan sasaran & progres
  const getProgressColor = () => {
    if (isCompleted) {
      return 'from-emerald-500 to-teal-600';
    }
    switch (jenisSasaran) {
      case 'CATIN':
        return 'from-rose-500 to-pink-600';
      case 'BUFAS':
        return 'from-amber-500 to-orange-600';
      case 'IBU_HAMIL':
        return 'from-blue-600 to-indigo-600';
      default:
        return 'from-teal-500 to-teal-700';
    }
  };

  const getBadgeStyle = () => {
    if (isCompleted) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    switch (jenisSasaran) {
      case 'CATIN':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'BUFAS':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'IBU_HAMIL':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  // Versi Ringkas (Compact): Ideal untuk tabel atau kartu berukuran mini
  if (variant === 'compact') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-700 tabular-nums">
            Kunjungan {current}/{target}
          </span>
          <span className="font-bold text-slate-900 tabular-nums">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
          />
        </div>
      </div>
    );
  }

  // Versi Standar & Detail
  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header teks progres */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Progres:</span>
          <span className="font-bold text-slate-900">
            Kunjungan ke-{current} dari {target}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              <Check className="w-2.5 h-2.5" />
              Selesai
            </span>
          )}
        </div>

        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border tabular-nums ${getBadgeStyle()}`}
        >
          {percentage}%
        </span>
      </div>

      {/* Bar visual progres */}
      <div className="relative pt-0.5">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 relative`}
          />
        </div>

        {/* Tanda penanda langkah (Step Markers) jika diminta dan target <= 6 */}
        {showSteps && target <= 6 && (
          <div className="flex justify-between items-center px-0.5 mt-1.5">
            {Array.from({ length: target }, (_, i) => i + 1).map(step => {
              const isPassed = step <= current;
              const isCurrent = step === current;

              return (
                <div
                  key={step}
                  className="flex flex-col items-center group relative"
                  title={`Kunjungan Ke-${step}: ${getTahapDescription(step, jenisSasaran)}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-teal-700 text-white ring-2 ring-teal-300 ring-offset-1'
                        : isPassed
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPassed && step < current ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={`text-[9px] mt-0.5 tabular-nums transition-colors ${
                      isCurrent
                        ? 'font-bold text-teal-800'
                        : isPassed
                        ? 'font-semibold text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    K-{step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deskripsi tahapan aktif untuk varian detail */}
      {variant === 'detailed' && (
        <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
          <span className="truncate">
            Tahap aktif: <strong className="text-slate-700">{getTahapDescription(current, jenisSasaran)}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
