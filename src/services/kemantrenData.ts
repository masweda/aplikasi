import { Kelurahan } from '../types';

export const KEMANTREN_LIST = [
  'Mantrijeron',
  'Kraton',
  'Mergangsan',
  'Umbulharjo',
  'Kotagede',
  'Gondokusuman',
  'Danurejan',
  'Pakualaman',
  'Gondomanan',
  'Ngampilan',
  'Wirobrajan',
  'Gedongtengen',
  'Jetis',
  'Tegalrejo',
] as const;

export type KemantrenName = (typeof KEMANTREN_LIST)[number];

export const KOTA_YOGYAKARTA_KELURAHAN: Kelurahan[] = [
  // 1. Mantrijeron
  { id: 1, nama: 'Gedongkiwo', kemantren: 'Mantrijeron', kecamatan: 'Mantrijeron', target_sasaran: 95, penanggung_jawab: 'Bidan Ratna Sari, S.Tr.Keb' },
  { id: 2, nama: 'Suryodiningratan', kemantren: 'Mantrijeron', kecamatan: 'Mantrijeron', target_sasaran: 105, penanggung_jawab: 'Bidan Nurul Aini, A.Md.Keb' },
  { id: 3, nama: 'Mantrijeron', kemantren: 'Mantrijeron', kecamatan: 'Mantrijeron', target_sasaran: 110, penanggung_jawab: 'Bidan Endang Wahyuni, S.ST' },

  // 2. Kraton
  { id: 4, nama: 'Patehan', kemantren: 'Kraton', kecamatan: 'Kraton', target_sasaran: 85, penanggung_jawab: 'Bidan Sri Mulyani, A.Md.Keb' },
  { id: 5, nama: 'Panembahan', kemantren: 'Kraton', kecamatan: 'Kraton', target_sasaran: 90, penanggung_jawab: 'Bidan Dian Anggraeni, S.Tr.Keb' },
  { id: 6, nama: 'Kadipaten', kemantren: 'Kraton', kecamatan: 'Kraton', target_sasaran: 80, penanggung_jawab: 'Bidan Tri Hastuti, S.Tr.Keb' },

  // 3. Mergangsan
  { id: 7, nama: 'Brontokusuman', kemantren: 'Mergangsan', kecamatan: 'Mergangsan', target_sasaran: 115, penanggung_jawab: 'Bidan Siti Marwah, A.Md.Keb' },
  { id: 8, nama: 'Keparakan', kemantren: 'Mergangsan', kecamatan: 'Mergangsan', target_sasaran: 100, penanggung_jawab: 'Bidan Retno Wulandari, S.ST' },
  { id: 9, nama: 'Wirogunan', kemantren: 'Mergangsan', kecamatan: 'Mergangsan', target_sasaran: 120, penanggung_jawab: 'Bidan Anisa Fitri, A.Md.Keb' },

  // 4. Umbulharjo (7 Kelurahan)
  { id: 10, nama: 'Pandeyan', kemantren: 'Umbulharjo', kecamatan: 'Umbulharjo', target_sasaran: 130, penanggung_jawab: 'Bidan Wahyu Lestari, S.Tr.Keb' },
  { id: 11, nama: 'Sorosutan', kemantren: 'Umbulharjo', kecamatan: 'Umbulharjo', target_sasaran: 140, penanggung_jawab: 'Bidan Kusuma Wardani, S.ST' },
  { id: 12, nama: 'Giwangan', kemantren: 'Umbulharjo', kecamatan: 'Umbulharjo', target_sasaran: 95, penanggung_jawab: 'Bidan Fitria Utami, A.Md.Keb' },
  { id: 13, nama: 'Warungboto', kemantren: 'Umbulharjo', kecamatan: 'Umbulharjo', target_sasaran: 105, penanggung_jawab: 'Bidan Dewi Astuti, S.Tr.Keb' },
  { id: 14, nama: 'Muja Muju', kemantren: 'Umbulharjo', kecamatan: 'Umbulharjo', target_sasaran: 125, penanggung_jawab: 'Bidan Rina Septiana, A.Md.Keb' },
  { id: 15, nama: 'Semaki', kemantren: 'Umbulharjo', kecamatan: 'Umbulharjo', target_sasaran: 85, penanggung_jawab: 'Bidan Eka Purwanti, S.ST' },
  { id: 16, nama: 'Tahunan', kemantren: 'Umbulharjo', kecamatan: 'Umbulharjo', target_sasaran: 110, penanggung_jawab: 'Bidan Yuliana Safitri, A.Md.Keb' },

  // 5. Kotagede
  { id: 17, nama: 'Rejowinangun', kemantren: 'Kotagede', kecamatan: 'Kotagede', target_sasaran: 120, penanggung_jawab: 'Bidan Rahayu Ningsih, S.Tr.Keb' },
  { id: 18, nama: 'Prenggan', kemantren: 'Kotagede', kecamatan: 'Kotagede', target_sasaran: 105, penanggung_jawab: 'Bidan Maryati, A.Md.Keb' },
  { id: 19, nama: 'Purbayan', kemantren: 'Kotagede', kecamatan: 'Kotagede', target_sasaran: 115, penanggung_jawab: 'Bidan Heni Susanti, S.ST' },

  // 6. Gondokusuman (5 Kelurahan)
  { id: 20, nama: 'Demangan', kemantren: 'Gondokusuman', kecamatan: 'Gondokusuman', target_sasaran: 125, penanggung_jawab: 'Bidan Arum Sekar, S.Tr.Keb' },
  { id: 21, nama: 'Klitren', kemantren: 'Gondokusuman', kecamatan: 'Gondokusuman', target_sasaran: 130, penanggung_jawab: 'Bidan Nita Agustina, A.Md.Keb' },
  { id: 22, nama: 'Terban', kemantren: 'Gondokusuman', kecamatan: 'Gondokusuman', target_sasaran: 110, penanggung_jawab: 'Bidan Dwi Handayani, S.ST' },
  { id: 23, nama: 'Kotabaru', kemantren: 'Gondokusuman', kecamatan: 'Gondokusuman', target_sasaran: 75, penanggung_jawab: 'Bidan Novita Sari, S.Tr.Keb' },
  { id: 24, nama: 'Baciro', kemantren: 'Gondokusuman', kecamatan: 'Gondokusuman', target_sasaran: 135, penanggung_jawab: 'Bidan Maya Indriani, A.Md.Keb' },

  // 7. Danurejan
  { id: 25, nama: 'Bausasran', kemantren: 'Danurejan', kecamatan: 'Danurejan', target_sasaran: 95, penanggung_jawab: 'Bidan Lilik Ernawati, S.ST' },
  { id: 26, nama: 'Tegalpanggung', kemantren: 'Danurejan', kecamatan: 'Danurejan', target_sasaran: 100, penanggung_jawab: 'Bidan Asri Rahmawati, A.Md.Keb' },
  { id: 27, nama: 'Suryatmajan', kemantren: 'Danurejan', kecamatan: 'Danurejan', target_sasaran: 85, penanggung_jawab: 'Bidan Sulastri, S.Tr.Keb' },

  // 8. Pakualaman
  { id: 28, nama: 'Purwokinanti', kemantren: 'Pakualaman', kecamatan: 'Pakualaman', target_sasaran: 90, penanggung_jawab: 'Bidan Sri Rahayu, S.ST' },
  { id: 29, nama: 'Gunungketur', kemantren: 'Pakualaman', kecamatan: 'Pakualaman', target_sasaran: 85, penanggung_jawab: 'Bidan Indah Permata, A.Md.Keb' },

  // 9. Gondomanan
  { id: 30, nama: 'Prawirodirjan', kemantren: 'Gondomanan', kecamatan: 'Gondomanan', target_sasaran: 105, penanggung_jawab: 'Bidan Kurniawati, S.Tr.Keb' },
  { id: 31, nama: 'Ngupasan', kemantren: 'Gondomanan', kecamatan: 'Gondomanan', target_sasaran: 80, penanggung_jawab: 'Bidan Ismi Wardani, A.Md.Keb' },

  // 10. Ngampilan
  { id: 32, nama: 'Notoprajan', kemantren: 'Ngampilan', kecamatan: 'Ngampilan', target_sasaran: 95, penanggung_jawab: 'Bidan Fajar Nurhayati, S.ST' },
  { id: 33, nama: 'Ngampilan', kemantren: 'Ngampilan', kecamatan: 'Ngampilan', target_sasaran: 110, penanggung_jawab: 'Bidan Suci Pratiwi, S.Tr.Keb' },

  // 11. Wirobrajan
  { id: 34, nama: 'Patangpuluhan', kemantren: 'Wirobrajan', kecamatan: 'Wirobrajan', target_sasaran: 100, penanggung_jawab: 'Bidan Anggun Cipta, A.Md.Keb' },
  { id: 35, nama: 'Wirobrajan', kemantren: 'Wirobrajan', kecamatan: 'Wirobrajan', target_sasaran: 115, penanggung_jawab: 'Bidan Ayu Widyaningsih, S.ST' },
  { id: 36, nama: 'Pakuncen', kemantren: 'Wirobrajan', kecamatan: 'Wirobrajan', target_sasaran: 105, penanggung_jawab: 'Bidan Desi Ratnasari, S.Tr.Keb' },

  // 12. Gedongtengen
  { id: 37, nama: 'Sosromenduran', kemantren: 'Gedongtengen', kecamatan: 'Gedongtengen', target_sasaran: 90, penanggung_jawab: 'Bidan Wiwik Setyowati, A.Md.Keb' },
  { id: 38, nama: 'Pringgokusuman', kemantren: 'Gedongtengen', kecamatan: 'Gedongtengen', target_sasaran: 110, penanggung_jawab: 'Bidan Haryati, S.ST' },

  // 13. Jetis
  { id: 39, nama: 'Bumijo', kemantren: 'Jetis', kecamatan: 'Jetis', target_sasaran: 115, penanggung_jawab: 'Bidan Nur Hidayah, S.Tr.Keb' },
  { id: 40, nama: 'Gowongan', kemantren: 'Jetis', kecamatan: 'Jetis', target_sasaran: 100, penanggung_jawab: 'Bidan Septi Anggraini, A.Md.Keb' },
  { id: 41, nama: 'Cokrodiningratan', kemantren: 'Jetis', kecamatan: 'Jetis', target_sasaran: 120, penanggung_jawab: 'Bidan Wulan Dari, S.ST' },

  // 14. Tegalrejo (4 Kelurahan)
  { id: 42, nama: 'Karangwaru', kemantren: 'Tegalrejo', kecamatan: 'Tegalrejo', target_sasaran: 125, penanggung_jawab: 'Bidan Titik Sumarni, S.Tr.Keb' },
  { id: 43, nama: 'Kricak', kemantren: 'Tegalrejo', kecamatan: 'Tegalrejo', target_sasaran: 130, penanggung_jawab: 'Bidan Esti Rahmawati, A.Md.Keb' },
  { id: 44, nama: 'Bener', kemantren: 'Tegalrejo', kecamatan: 'Tegalrejo', target_sasaran: 90, penanggung_jawab: 'Bidan Melati Indah, S.ST' },
  { id: 45, nama: 'Tegalrejo', kemantren: 'Tegalrejo', kecamatan: 'Tegalrejo', target_sasaran: 120, penanggung_jawab: 'Bidan Anjar Sari, S.Tr.Keb' },
];

export function getKelurahanByKemantren(kemantren: string): Kelurahan[] {
  return KOTA_YOGYAKARTA_KELURAHAN.filter(k => k.kemantren.toLowerCase() === kemantren.toLowerCase());
}

export function getKelurahanById(id: number): Kelurahan | undefined {
  return KOTA_YOGYAKARTA_KELURAHAN.find(k => k.id === id);
}
