import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuditLog, RekapitulasiRow, UnifiedPendampingan, User } from '../types';
import { dbService } from './database';

function downloadFile(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToExcel(
  data: UnifiedPendampingan[],
  rekapitulasi: RekapitulasiRow[],
  currentUser: User
) {
  const wb = XLSX.utils.book_new();

  // 1. Rekapitulasi per 14 Kemantren Sheet
  const kemantrenMap = new Map<string, {
    kemantren: string;
    kelurahanCount: number;
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
  }>();

  rekapitulasi.forEach(r => {
    const kem = r.kemantren || r.kecamatan;
    if (!kemantrenMap.has(kem)) {
      kemantrenMap.set(kem, {
        kemantren: kem,
        kelurahanCount: 0,
        total_catin: 0,
        catin_anemia: 0,
        catin_kek: 0,
        catin_pmt: 0,
        total_bufas: 0,
        bufas_kbpp: 0,
        bufas_pmt: 0,
        total_bumil: 0,
        bumil_anemia: 0,
        bumil_kek: 0,
        bumil_pmt: 0,
        total_pendampingan: 0,
      });
    }
    const item = kemantrenMap.get(kem)!;
    item.kelurahanCount += 1;
    item.total_catin += r.total_catin;
    item.catin_anemia += r.catin_anemia;
    item.catin_kek += r.catin_kek;
    item.catin_pmt += r.catin_pmt;
    item.total_bufas += r.total_bufas;
    item.bufas_kbpp += r.bufas_kbpp;
    item.bufas_pmt += r.bufas_pmt;
    item.total_bumil += r.total_bumil;
    item.bumil_anemia += r.bumil_anemia;
    item.bumil_kek += r.bumil_kek;
    item.bumil_pmt += r.bumil_pmt;
    item.total_pendampingan += r.total_pendampingan;
  });

  const rekapKemantrenData = Array.from(kemantrenMap.values()).map(k => ({
    'Kemantren': k.kemantren,
    'Jumlah Kelurahan': k.kelurahanCount,
    'Total Catin': k.total_catin,
    'Catin Anemia': k.catin_anemia,
    'Catin KEK (LiLA < 23.5cm)': k.catin_kek,
    'Catin Penerima PMT': k.catin_pmt,
    'Total Bufas': k.total_bufas,
    'Bufas Ber-KBPP': k.bufas_kbpp,
    'Bufas Penerima PMT': k.bufas_pmt,
    'Total Ibu Hamil': k.total_bumil,
    'Bumil Anemia': k.bumil_anemia,
    'Bumil KEK': k.bumil_kek,
    'Bumil Penerima PMT': k.bumil_pmt,
    'Total Pendampingan': k.total_pendampingan,
  }));
  const wsKemantren = XLSX.utils.json_to_sheet(rekapKemantrenData);
  XLSX.utils.book_append_sheet(wb, wsKemantren, 'Rekap 14 Kemantren');

  // 2. Rekapitulasi per 45 Kelurahan Sheet
  const rekapKelurahanData = rekapitulasi.map(r => ({
    'Kemantren': r.kemantren || r.kecamatan,
    'Kelurahan': r.kelurahan_nama,
    'Total Catin': r.total_catin,
    'Catin Anemia': r.catin_anemia,
    'Catin KEK (LiLA < 23.5cm)': r.catin_kek,
    'Catin Penerima PMT': r.catin_pmt,
    'Total Bufas': r.total_bufas,
    'Bufas Ber-KBPP': r.bufas_kbpp,
    'Bufas Penerima PMT': r.bufas_pmt,
    'Total Ibu Hamil': r.total_bumil,
    'Bumil Anemia': r.bumil_anemia,
    'Bumil KEK': r.bumil_kek,
    'Bumil Penerima PMT': r.bumil_pmt,
    'Total Pendampingan': r.total_pendampingan,
  }));
  const wsRekap = XLSX.utils.json_to_sheet(rekapKelurahanData);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap 45 Kelurahan');

  // 3. Data Semua Pendampingan
  const allData = data.map((d, index) => ({
    'No': index + 1,
    'ID Pendampingan': d.id,
    'Tanggal': d.tanggal,
    'Kemantren': d.kemantren || d.kecamatan,
    'Kelurahan': d.kelurahan_nama,
    'Jenis Sasaran': d.jenis_sasaran,
    'Nama Sasaran': d.nama,
    'Alamat': d.alamat,
    'Nomor HP': d.no_hp,
    'Status PMT': d.status_pmt,
    'Sumber PMT': d.sumber_pmt || '-',
    'Lansia Serumah': d.lansia_dalam_rumah,
    'Kunjungan Ke': d.kunjungan_ke,
    'Status Kunjungan': d.status_kunjungan,
    'Jatuh Tempo Berikutnya': d.jadwal_berikutnya || '-',
    'Catatan Kunjungan': d.catatan_kunjungan,
    'Petugas TPK': d.petugas_nama,
    'Risiko Stunting': d.is_risiko_stunting ? 'Ya' : 'Tidak',
  }));
  const wsAll = XLSX.utils.json_to_sheet(allData);
  XLSX.utils.book_append_sheet(wb, wsAll, 'Semua Pendampingan');

  // 3. Data Catin Detail
  const catinOnly = data
    .filter(d => d.jenis_sasaran === 'CATIN' && d.catin_data)
    .map((d, index) => {
      const c = d.catin_data!;
      return {
        'No': index + 1,
        'Tanggal': d.tanggal,
        'Kelurahan': d.kelurahan_nama,
        'Nama Catin': c.nama,
        'Alamat': c.alamat,
        'No HP': c.no_hp,
        'Usia (Thn)': c.usia,
        'Tinggi Badan (cm)': c.tinggi_badan,
        'Berat Badan (kg)': c.berat_badan,
        'IMT': d.imt || '-',
        'Kadar Hb (g/dL)': c.kadar_hb,
        'Status Anemia': d.is_anemia ? 'Anemia (< 12 g/dL)' : 'Normal',
        'LiLA (cm)': c.lila,
        'Status KEK': d.is_kek ? 'Risiko KEK (< 23.5 cm)' : 'Normal',
        'Merokok / Terpapar': c.merokok_terpapar,
        'Status PMT': c.status_pmt,
        'Sumber PMT': c.sumber_pmt || '-',
        'Lansia Serumah': c.lansia_dalam_rumah,
        'Petugas': d.petugas_nama,
      };
    });
  const wsCatin = XLSX.utils.json_to_sheet(catinOnly);
  XLSX.utils.book_append_sheet(wb, wsCatin, 'Data CATIN');

  // 4. Data Bufas Detail
  const bufasOnly = data
    .filter(d => d.jenis_sasaran === 'BUFAS' && d.bufas_data)
    .map((d, index) => {
      const b = d.bufas_data!;
      return {
        'No': index + 1,
        'Tanggal': d.tanggal,
        'Kelurahan': d.kelurahan_nama,
        'Nama Bufas': b.nama,
        'Alamat': b.alamat,
        'No HP': b.no_hp,
        'Anak Ke': b.anak_ke,
        'Tgl Lahir Anak': b.tgl_lahir_anak,
        'BBL (gram)': b.bbl,
        'PBL (cm)': b.pbl,
        'LiKA (cm)': b.lika,
        'Metode Persalinan': b.metode_persalinan,
        'Usia Kehamilan Saat Lahir': b.usia_kehamilan_saat_lahir,
        'Status KBPP': b.status_kbpp,
        'Jenis KBPP': b.jenis_kbpp || '-',
        'Komplikasi Nifas': b.komplikasi_nifas,
        'Status PMT': b.status_pmt,
        'Sumber PMT': b.sumber_pmt || '-',
        'Lansia Serumah': b.lansia_dalam_rumah,
        'Petugas': d.petugas_nama,
      };
    });
  const wsBufas = XLSX.utils.json_to_sheet(bufasOnly);
  XLSX.utils.book_append_sheet(wb, wsBufas, 'Data BUFAS');

  // 5. Data Bumil Detail
  const bumilOnly = data
    .filter(d => d.jenis_sasaran === 'IBU_HAMIL' && d.ibu_hamil_data)
    .map((d, index) => {
      const h = d.ibu_hamil_data!;
      return {
        'No': index + 1,
        'Tanggal': d.tanggal,
        'Kelurahan': d.kelurahan_nama,
        'Nama Ibu Hamil': h.nama,
        'Alamat': h.alamat,
        'No HP': h.no_hp,
        'Usia (Thn)': h.usia,
        'Usia Kehamilan (Minggu)': h.usia_kehamilan_minggu,
        'HPHT': h.hpht,
        'HTP': h.htp,
        'Tinggi Badan (cm)': h.tinggi_badan,
        'Berat Badan (kg)': h.berat_badan,
        'IMT': d.imt || '-',
        'Kadar Hb (g/dL)': h.kadar_hb,
        'Status Anemia': d.is_anemia ? 'Anemia (< 11 g/dL)' : 'Normal',
        'LiLA (cm)': h.lila,
        'Status KEK': d.is_kek ? 'Risiko KEK (< 23.5 cm)' : 'Normal',
        'Merokok / Terpapar': h.merokok_terpapar,
        'Status PMT': h.status_pmt,
        'Sumber PMT': h.sumber_pmt || '-',
        'Lansia Serumah': h.lansia_dalam_rumah,
        'Petugas': d.petugas_nama,
      };
    });
  const wsBumil = XLSX.utils.json_to_sheet(bumilOnly);
  XLSX.utils.book_append_sheet(wb, wsBumil, 'Data IBU HAMIL');

  const todayStr = new Date().toISOString().substring(0, 10);
  const filename = `Laporan_TPK_Lengkap_${todayStr}.xlsx`;

  XLSX.writeFile(wb, filename);

  dbService.logAudit({
    user_id: currentUser.id,
    username: currentUser.username,
    action: 'EXPORT_EXCEL',
    entity: 'Pendampingan',
    entity_id: null,
    details: `Export laporan Excel lengkap (${data.length} records)`,
  });
}

/**
 * Standard CSV for Google Looker Studio / BigQuery / Google Sheets
 * Formatted with clean ISO dates, numeric flags (0/1), and consistent dimensional taxonomy.
 */
export function exportToLookerStudioCSV(data: UnifiedPendampingan[], currentUser: User) {
  const headers = [
    'id_pendampingan',
    'tanggal',
    'tahun',
    'bulan',
    'tahun_bulan',
    'kemantren',
    'kelurahan',
    'kecamatan',
    'jenis_sasaran',
    'nama_sasaran',
    'alamat',
    'usia',
    'tinggi_badan_cm',
    'berat_badan_kg',
    'imt',
    'kadar_hb_gdL',
    'status_anemia',
    'is_anemia_flag',
    'lila_cm',
    'status_kek',
    'is_kek_flag',
    'status_pmt',
    'is_pmt_flag',
    'sumber_pmt',
    'merokok_terpapar',
    'lansia_dalam_rumah',
    'status_kbpp',
    'is_kbpp_flag',
    'jenis_kbpp',
    'bbl_gram',
    'pbl_cm',
    'metode_persalinan',
    'usia_kehamilan_minggu',
    'status_kunjungan',
    'risiko_stunting',
    'is_risiko_stunting_flag',
    'nama_petugas',
  ];

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map(d => {
    const tgl = new Date(d.tanggal);
    const tahun = tgl.getFullYear() || 2026;
    const bulan = String((tgl.getMonth() || 0) + 1).padStart(2, '0');
    const tahunBulan = `${tahun}-${bulan}`;

    let usia = '';
    let tb = '';
    let bb = '';
    let imt = d.imt ? String(d.imt) : '';
    let hb = '';
    let lila = '';
    let merokok = '';
    let kbpp = '';
    let jenisKbpp = '';
    let bbl = '';
    let pbl = '';
    let persalinan = '';
    let usiaHamil = '';

    if (d.jenis_sasaran === 'CATIN' && d.catin_data) {
      usia = String(d.catin_data.usia);
      tb = String(d.catin_data.tinggi_badan);
      bb = String(d.catin_data.berat_badan);
      hb = String(d.catin_data.kadar_hb);
      lila = String(d.catin_data.lila);
      merokok = d.catin_data.merokok_terpapar;
    } else if (d.jenis_sasaran === 'BUFAS' && d.bufas_data) {
      kbpp = d.bufas_data.status_kbpp;
      jenisKbpp = d.bufas_data.jenis_kbpp || '';
      bbl = String(d.bufas_data.bbl);
      pbl = String(d.bufas_data.pbl);
      persalinan = d.bufas_data.metode_persalinan;
      usiaHamil = String(d.bufas_data.usia_kehamilan_saat_lahir);
    } else if (d.jenis_sasaran === 'IBU_HAMIL' && d.ibu_hamil_data) {
      usia = String(d.ibu_hamil_data.usia);
      tb = String(d.ibu_hamil_data.tinggi_badan);
      bb = String(d.ibu_hamil_data.berat_badan);
      hb = String(d.ibu_hamil_data.kadar_hb);
      lila = String(d.ibu_hamil_data.lila);
      merokok = d.ibu_hamil_data.merokok_terpapar;
      usiaHamil = String(d.ibu_hamil_data.usia_kehamilan_minggu);
    }

    const isAnemiaFlag = d.is_anemia ? 1 : 0;
    const isKekFlag = d.is_kek ? 1 : 0;
    const isPmtFlag = d.status_pmt === 'Sudah' ? 1 : 0;
    const isKbppFlag = kbpp === 'Sudah' ? 1 : 0;
    const isStuntingRiskFlag = d.is_risiko_stunting ? 1 : 0;

    return [
      escapeCSV(d.id),
      escapeCSV(d.tanggal),
      escapeCSV(tahun),
      escapeCSV(bulan),
      escapeCSV(tahunBulan),
      escapeCSV(d.kemantren || d.kecamatan),
      escapeCSV(d.kelurahan_nama),
      escapeCSV(d.kecamatan),
      escapeCSV(d.jenis_sasaran),
      escapeCSV(d.nama),
      escapeCSV(d.alamat),
      escapeCSV(usia),
      escapeCSV(tb),
      escapeCSV(bb),
      escapeCSV(imt),
      escapeCSV(hb),
      escapeCSV(d.is_anemia ? 'Anemia' : 'Normal'),
      escapeCSV(isAnemiaFlag),
      escapeCSV(lila),
      escapeCSV(d.is_kek ? 'KEK' : 'Normal'),
      escapeCSV(isKekFlag),
      escapeCSV(d.status_pmt),
      escapeCSV(isPmtFlag),
      escapeCSV(d.sumber_pmt || 'Tidak Ada'),
      escapeCSV(merokok || 'Tidak Diketahui'),
      escapeCSV(d.lansia_dalam_rumah),
      escapeCSV(kbpp || 'N/A'),
      escapeCSV(isKbppFlag),
      escapeCSV(jenisKbpp || 'N/A'),
      escapeCSV(bbl),
      escapeCSV(pbl),
      escapeCSV(persalinan || 'N/A'),
      escapeCSV(usiaHamil),
      escapeCSV(d.status_kunjungan),
      escapeCSV(d.is_risiko_stunting ? 'Risiko' : 'Aman'),
      escapeCSV(isStuntingRiskFlag),
      escapeCSV(d.petugas_nama),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const filename = `TPK_LookerStudio_Dataset_${new Date().toISOString().substring(0, 10)}.csv`;

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

  dbService.logAudit({
    user_id: currentUser.id,
    username: currentUser.username,
    action: 'EXPORT_CSV',
    entity: 'Pendampingan',
    entity_id: null,
    details: `Export dataset CSV Google Looker Studio (${data.length} records)`,
  });
}

export function exportAuditLogsCSV(logs: AuditLog[], currentUser: User) {
  const headers = ['id', 'timestamp', 'username', 'action', 'entity', 'entity_id', 'details', 'ip_address'];
  const rows = logs.map(l => [
    l.id,
    `"${l.created_at}"`,
    `"${l.username}"`,
    `"${l.action}"`,
    `"${l.entity}"`,
    l.entity_id || '',
    `"${l.details.replace(/"/g, '""')}"`,
    `"${l.ip_address}"`,
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  downloadFile(csvContent, `TPK_Audit_Log_${new Date().toISOString().substring(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function downloadSqlDatabaseBackup(currentUser: User) {
  const sql = dbService.exportSQLDump(currentUser);
  downloadFile(sql, `tpk_database_backup_${new Date().toISOString().substring(0, 10)}.sql`, 'application/sql;charset=utf-8;');
}

export function downloadJsonDatabaseBackup(currentUser: User) {
  const json = dbService.exportJSONBackup(currentUser);
  downloadFile(json, `tpk_database_backup_${new Date().toISOString().substring(0, 10)}.json`, 'application/json;charset=utf-8;');
}

export function exportToPDF(
  data: UnifiedPendampingan[],
  currentUser: User,
  filterSummary?: {
    kemantren?: string;
    kelurahan?: string;
    sasaran?: string;
  }
) {
  // A4 Landscape orientation: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header background banner
  doc.setFillColor(15, 118, 110); // Teal 700 (#0f766e)
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Gold accent bar
  doc.setFillColor(217, 119, 6); // Amber 600 (#d97706)
  doc.rect(0, 24, pageWidth, 2.5, 'F');

  // Title in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('PEMERINTAH KOTA YOGYAKARTA', 14, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('DINAS PEMBERDAYAAN PEREMPUAN, PERLINDUNGAN ANAK, PENGENDALIAN PENDUDUK DAN KB', 14, 14.5);
  doc.text('TIM PENDAMPING KELUARGA (TPK) — LAPORAN REKAPITULASI PENDAMPINGAN SASARAN RISIKO STUNTING', 14, 19.5);

  // Metadata section
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85); // Slate 700
  doc.setFont('helvetica', 'bold');
  doc.text('DOKUMEN PENDAMPINGAN LAPANGAN (OFFLINE)', 14, 32);

  doc.setFont('helvetica', 'normal');
  const kemantrenLabel = filterSummary?.kemantren && filterSummary.kemantren !== 'all'
    ? `Kemantren ${filterSummary.kemantren}`
    : 'Semua Kemantren (14 Wilayah)';
  const kelurahanLabel = filterSummary?.kelurahan && filterSummary.kelurahan !== 'all'
    ? `Kel. ${filterSummary.kelurahan}`
    : 'Semua Kelurahan (45)';
  const sasaranLabel = filterSummary?.sasaran && filterSummary.sasaran !== 'all'
    ? filterSummary.sasaran
    : 'Semua Sasaran (CATIN, BUFAS, BUMIL)';

  doc.text(`Wilayah: ${kemantrenLabel} · ${kelurahanLabel} | Filter: ${sasaranLabel}`, 14, 37);
  doc.text(`Dicetak Oleh: ${currentUser.full_name || currentUser.username} (${currentUser.role}) | Tanggal Cetak: ${todayStr}`, 14, 42);

  // Summary KPI stats box
  const totalRecords = data.length;
  const totalCatin = data.filter(d => d.jenis_sasaran === 'CATIN').length;
  const totalBufas = data.filter(d => d.jenis_sasaran === 'BUFAS').length;
  const totalBumil = data.filter(d => d.jenis_sasaran === 'IBU_HAMIL').length;
  const totalRisiko = data.filter(d => d.is_risiko_stunting).length;
  const totalPmt = data.filter(d => d.status_pmt === 'Sudah').length;

  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(pageWidth - 110, 28, 96, 17, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`RINGKASAN DATA (${totalRecords} SASARAN)`, pageWidth - 106, 32.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Catin: ${totalCatin} | Bufas: ${totalBufas} | Bumil: ${totalBumil}`, pageWidth - 106, 37);
  doc.setTextColor(190, 18, 60); // Rose 700
  doc.text(`Risiko Stunting: ${totalRisiko}`, pageWidth - 106, 41.5);
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text(`Penerima PMT: ${totalPmt}`, pageWidth - 60, 41.5);

  // Table rows formatting
  const tableRows = data.map((d, index) => {
    let indikatorText = '';
    if (d.jenis_sasaran === 'CATIN' && d.catin_data) {
      indikatorText = `Usia: ${d.catin_data.usia} th | IMT: ${d.imt || '-'} | Hb: ${d.catin_data.kadar_hb} | LiLA: ${d.catin_data.lila} cm`;
    } else if (d.jenis_sasaran === 'BUFAS' && d.bufas_data) {
      indikatorText = `Anak Ke-${d.bufas_data.anak_ke} | BBL: ${d.bufas_data.bbl}g | PBL: ${d.bufas_data.pbl}cm | KB: ${d.bufas_data.status_kbpp}`;
    } else if (d.jenis_sasaran === 'IBU_HAMIL' && d.ibu_hamil_data) {
      indikatorText = `Gestasi: ${d.ibu_hamil_data.usia_kehamilan_minggu} mgg | Hb: ${d.ibu_hamil_data.kadar_hb} | LiLA: ${d.ibu_hamil_data.lila}cm | HTP: ${d.ibu_hamil_data.htp || '-'}`;
    } else {
      indikatorText = `LiLA: ${d.is_kek ? 'KEK (<23.5)' : 'Normal'} | Hb: ${d.is_anemia ? 'Anemia' : 'Normal'}`;
    }

    const risikoStr = d.is_risiko_stunting ? 'RISIKO' : 'Aman';
    const pmtStr = d.status_pmt === 'Sudah' ? 'PMT: Ya' : 'PMT: Blm';

    const jadwalStr = d.jadwal_berikutnya
      ? `Jatuh Tempo: ${d.jadwal_berikutnya}\n(${d.status_kunjungan})`
      : d.status_kunjungan;

    return [
      String(index + 1),
      `${d.tanggal}\n(Kunj.${d.kunjungan_ke})`,
      `${d.nama}\nHP: ${d.no_hp || '-'}\n${d.alamat}`,
      d.jenis_sasaran,
      `Kem. ${d.kemantren || d.kecamatan}\nKel. ${d.kelurahan_nama}`,
      indikatorText,
      `${risikoStr}\n[${pmtStr}]`,
      jadwalStr,
      d.petugas_nama || 'Petugas TPK',
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [
      ['No', 'Tgl / Kunj.', 'Nama Sasaran & Alamat', 'Sasaran', 'Wilayah', 'Parameter Klinis / Indikator', 'Status', 'Tindak Lanjut / Jadwal', 'Petugas TPK']
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110], // Teal 700
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      fontSize: 7.2,
      valign: 'middle',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center' },
      1: { cellWidth: 19, halign: 'center' },
      2: { cellWidth: 44 },
      3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 35 },
      5: { cellWidth: 52 },
      6: { cellWidth: 24, halign: 'center' },
      7: { cellWidth: 38 },
      8: { cellWidth: 28 },
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (dataHook) => {
      if (dataHook.pageNumber > 1) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 118, 110);
        doc.text('PEMERINTAH KOTA YOGYAKARTA · TIM PENDAMPING KELUARGA (TPK)', 14, 10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Laporan Pendampingan Lapangan (Offline) — Dicetak: ${todayStr}`, 14, 14);
      }

      const pageCount = (doc as any).internal.getNumberOfPages ? (doc as any).internal.getNumberOfPages() : dataHook.pageNumber;
      const str = `Halaman ${dataHook.pageNumber} dari ${pageCount}`;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 14, pageHeight - 8, { align: 'right' });
      doc.text('Dokumen Resmi Tim Pendamping Keluarga (TPK) Pemerintah Kota Yogyakarta', 14, pageHeight - 8);
    },
  });

  // Signature Block
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 140;
  let signY = finalY + 12;
  if (signY + 36 > pageHeight) {
    doc.addPage();
    signY = 24;
  }

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');

  const signCol1 = 28;
  const signCol2 = pageWidth - 80;

  doc.text('Mengetahui / Verifikasi,', signCol1, signY);
  doc.text('Koordinator TPK Kemantren', signCol1, signY + 4);
  doc.text('(..................................................)', signCol1, signY + 24);
  doc.text('NIP / ID TPK: ...................................', signCol1, signY + 28);

  doc.text(`Yogyakarta, ${todayStr}`, signCol2, signY);
  doc.text('Petugas Pendamping Lapangan,', signCol2, signY + 4);
  doc.setFont('helvetica', 'bold');
  doc.text(currentUser.full_name || currentUser.username, signCol2, signY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(`Peran: ${currentUser.role}`, signCol2, signY + 28);

  const fileDate = new Date().toISOString().substring(0, 10);
  const fileName = `Laporan_TPK_Yogyakarta_${fileDate}.pdf`;
  doc.save(fileName);

  dbService.logAudit({
    user_id: currentUser.id,
    username: currentUser.username,
    action: 'EXPORT_PDF',
    entity: 'Pendampingan',
    entity_id: null,
    details: `Export dokumen laporan PDF pendampingan offline (${data.length} sasaran)`,
  });
}

export function exportSingleRecordPDF(record: UnifiedPendampingan, currentUser?: User) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header banner
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 28, pageWidth, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('PEMERINTAH KOTA YOGYAKARTA', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('DINAS PEMBERDAYAAN PEREMPUAN, PERLINDUNGAN ANAK, PENGENDALIAN PENDUDUK DAN KB', 14, 17);
  doc.text('LEMBAR PENDAMPINGAN SASARAN INDIVIDU — TIM PENDAMPING KELUARGA (TPK)', 14, 23);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Sasaran Info Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 36, pageWidth - 28, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 36, pageWidth - 28, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(record.nama, 18, 43);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Jenis Sasaran: ${record.jenis_sasaran} | Kunjungan Ke-${record.kunjungan_ke} (${record.tanggal})`, 18, 48.5);
  doc.text(`Alamat: ${record.alamat} | No. HP: ${record.no_hp || '-'}`, 18, 54);
  doc.text(`Wilayah: Kemantren ${record.kemantren || record.kecamatan}, Kelurahan ${record.kelurahan_nama}`, 18, 59.5);

  // Status Badge on the right
  const badgeColor: [number, number, number] = record.is_risiko_stunting ? [190, 18, 60] : [4, 120, 87];
  doc.setFillColor(...badgeColor);
  doc.roundedRect(pageWidth - 65, 40, 48, 12, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(record.is_risiko_stunting ? 'BERISIKO STUNTING' : 'TIDAK BERISIKO', pageWidth - 41, 47.5, { align: 'center' });

  // Data parameter klinis table
  const detailRows: [string, string][] = [
    ['Tanggal Pendampingan', record.tanggal],
    ['Kunjungan Ke', `Ke-${record.kunjungan_ke}`],
    ['Status Kunjungan', record.status_kunjungan],
    ['Jadwal / Jatuh Tempo Berikutnya', record.jadwal_berikutnya || 'Belum Dijadwalkan'],
    ['Status Bantuan PMT', `${record.status_pmt} ${record.sumber_pmt ? `(Sumber: ${record.sumber_pmt})` : ''}`],
    ['Lansia Serumah', record.lansia_dalam_rumah ? 'Ya (Ada Lansia)' : 'Tidak Ada'],
  ];

  if (record.jenis_sasaran === 'CATIN' && record.catin_data) {
    const c = record.catin_data;
    detailRows.push(
      ['Usia Catin', `${c.usia} Tahun`],
      ['Antropometri (BB / TB)', `${c.berat_badan} kg / ${c.tinggi_badan} cm (IMT: ${record.imt || '-'})`],
      ['Lingkar Lengan Atas (LiLA)', `${c.lila} cm ${record.is_kek ? '[TERINDIKASI KEK < 23.5 cm]' : '[Normal]'}`],
      ['Kadar Hemoglobin (Hb)', `${c.kadar_hb} g/dL ${record.is_anemia ? '[TERINDIKASI ANEMIA < 12 g/dL]' : '[Normal]'}`],
      ['Paparan Asap Rokok', c.merokok_terpapar]
    );
  } else if (record.jenis_sasaran === 'BUFAS' && record.bufas_data) {
    const b = record.bufas_data;
    detailRows.push(
      ['Data Anak', `Anak Ke-${b.anak_ke} | Tgl Lahir: ${b.tgl_lahir_anak} | Gestasi: ${b.usia_kehamilan_saat_lahir} mgg`],
      ['Antropometri Bayi', `BBL: ${b.bbl} gram | PBL: ${b.pbl} cm | LiKA: ${b.lika} cm`],
      ['Metode Persalinan', b.metode_persalinan],
      ['Status KB Pasca Persalinan (KBPP)', `${b.status_kbpp} ${b.jenis_kbpp ? `(${b.jenis_kbpp})` : ''}`],
      ['Komplikasi Masa Nifas', b.komplikasi_nifas || 'Tidak Ada']
    );
  } else if (record.jenis_sasaran === 'IBU_HAMIL' && record.ibu_hamil_data) {
    const h = record.ibu_hamil_data;
    detailRows.push(
      ['Usia Ibu & Kehamilan', `Usia ${h.usia} Thn | Usia Kehamilan: ${h.usia_kehamilan_minggu} Minggu`],
      ['HPHT & Taksiran Persalinan (HTP)', `HPHT: ${h.hpht || '-'} | HTP: ${h.htp || '-'}`],
      ['Antropometri (BB / TB)', `${h.berat_badan} kg / ${h.tinggi_badan} cm (IMT: ${record.imt || '-'})`],
      ['Lingkar Lengan Atas (LiLA)', `${h.lila} cm ${record.is_kek ? '[TERINDIKASI KEK < 23.5 cm]' : '[Normal]'}`],
      ['Kadar Hemoglobin (Hb)', `${h.kadar_hb} g/dL ${record.is_anemia ? '[TERINDIKASI ANEMIA < 11 g/dL]' : '[Normal]'}`]
    );
  }

  detailRows.push(
    ['Catatan Kunjungan Petugas', record.catatan_kunjungan || 'Tidak ada catatan tambahan'],
    ['Petugas TPK Pendamping', record.petugas_nama || 'Petugas TPK']
  );

  if (record.latitude && record.longitude) {
    detailRows.push([
      'Koordinat GPS Lapangan',
      `${record.latitude.toFixed(5)}, ${record.longitude.toFixed(5)} ${record.gps_accuracy ? `(Akurasi ±${record.gps_accuracy.toFixed(1)}m)` : ''} ${record.lokasi_label ? `— ${record.lokasi_label}` : ''}`
    ]);
  }

  if (record.catatan_singkat && record.catatan_singkat.length > 0) {
    const notesSummary = record.catatan_singkat
      .map((n, idx) => {
        let line = `${idx + 1}. [${n.tanggal}] (${n.kategori}) ${n.catatan} — oleh ${n.petugas_nama}`;
        if (n.latitude && n.longitude) {
          line += ` [GPS: ${n.latitude.toFixed(5)}, ${n.longitude.toFixed(5)} ±${n.gps_accuracy ? n.gps_accuracy.toFixed(1) + 'm' : ''}]`;
        }
        return line;
      })
      .join('\n');
    detailRows.push(['Log Catatan Singkat Lapangan', notesSummary]);
  }

  autoTable(doc, {
    startY: 68,
    head: [['Indikator & Parameter', 'Keterangan Hasil Pendampingan']],
    body: detailRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 118, 110],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold', textColor: [51, 65, 85] },
      1: { cellWidth: 115, textColor: [30, 41, 59] },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 190;
  const signY = finalY + 16;

  if (signY + 40 <= pageHeight) {
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Mengetahui / Sasaran Pendampingan,', 24, signY);
    doc.text('(..................................................)', 24, signY + 24);
    doc.text(record.nama, 24, signY + 28);

    doc.text(`Yogyakarta, ${todayStr}`, pageWidth - 80, signY);
    doc.text('Petugas Pendamping TPK,', pageWidth - 80, signY + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(currentUser ? (currentUser.full_name || currentUser.username) : record.petugas_nama, pageWidth - 80, signY + 24);
    doc.setFont('helvetica', 'normal');
    doc.text('Tim Pendamping Keluarga', pageWidth - 80, signY + 28);
  }

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen Resmi Tim Pendamping Keluarga (TPK) Pemerintah Kota Yogyakarta', 14, pageHeight - 10);
  doc.text(`Dicetak: ${todayStr}`, pageWidth - 14, pageHeight - 10, { align: 'right' });

  const cleanName = record.nama.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Lembar_Pendampingan_${cleanName}_${record.tanggal}.pdf`);

  if (currentUser) {
    dbService.logAudit({
      user_id: currentUser.id,
      username: currentUser.username,
      action: 'EXPORT_PDF',
      entity: 'Pendampingan',
      entity_id: record.id,
      details: `Export lembar PDF individual sasaran ${record.nama} (${record.jenis_sasaran})`,
    });
  }
}
