import { useState, useMemo } from 'react';
import { PolicareApi } from '../services/policareApi';

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO CHIME HELPER (Dual-tone Hospital Ding-Dong via Web Audio API)
// ─────────────────────────────────────────────────────────────────────────────
function playHospitalChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (E5: 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.75);

    // Second tone (C5: 523.25Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.32);
    gain2.gain.setValueAtTime(0.32, now + 0.32);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.32);
    osc2.stop(now + 1.4);
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA KATALOG TARIF & INFORMASI PUBLIK (Sesuai Diagram Riset RSUD Daya)
// ─────────────────────────────────────────────────────────────────────────────
const PUBLIC_TARIFFS = [
  // 1. LAB
  {
    id: 'LAB-01', category: 'LAB', catLabel: 'Laboratorium',
    name: 'Darah Lengkap (CBC) + LED',
    code: 'LAB-CBC-01', price: 85000,
    specimen: 'Darah Vena (3 ml)', duration: '30-45 Menit',
    terms: 'Tidak wajib puasa. Hasil diverifikasi dokter Sp.PK.',
    desc: 'Pemeriksaan Hb, Leukosit, Trombosit, Eritrosit, Hematokrit, dan Laju Endap Darah.'
  },
  {
    id: 'LAB-02', category: 'LAB', catLabel: 'Laboratorium',
    name: 'Kimia Darah (SGOT, SGPT, Ureum, Kreatinin)',
    code: 'LAB-KIM-02', price: 160000,
    specimen: 'Serum Darah Vena', duration: '60 Menit',
    terms: 'Disarankan puasa 8 jam sebelum pengambilan darah.',
    desc: 'Skrining fungsi organ hati (SGOT/SGPT) dan fungsi ginjal (Ureum/Kreatinin).'
  },
  {
    id: 'LAB-03', category: 'LAB', catLabel: 'Laboratorium',
    name: 'Profil Lipid (Kolesterol Total, HDL, LDL, Trigliserida)',
    code: 'LAB-LIP-03', price: 175000,
    specimen: 'Serum Darah Vena', duration: '60 Menit',
    terms: 'WAJIB PUASA 10-12 jam (hanya boleh minum air putih).',
    desc: 'Pemeriksaan kadar kolesterol lengkap untuk evaluasi risiko kardiovaskular & jantung.'
  },
  {
    id: 'LAB-04', category: 'LAB', catLabel: 'Laboratorium',
    name: 'Glukosa Darah (Puasa / 2 Jam PP / Sewaktu)',
    code: 'LAB-GLU-04', price: 60000,
    specimen: 'Darah Vena / Kapiler', duration: '15 Menit',
    terms: 'Puasa 8-10 jam untuk Glukosa Puasa. 2 jam pasca makan untuk 2 Jam PP.',
    desc: 'Skrining dan pemantauan diabetes melitus.'
  },
  {
    id: 'LAB-05', category: 'LAB', catLabel: 'Laboratorium',
    name: 'Urin Lengkap & Sedimen Otomatis',
    code: 'LAB-URN-05', price: 45000,
    specimen: 'Urin Porsi Tengah (Midstream)', duration: '30 Menit',
    terms: 'Gunakan wadah steril yang disediakan loket lab. Bersihkan area genital sebelum berkemih.',
    desc: 'Pemeriksaan infeksi saluran kemih, batu ginjal, proteinuria, dan silinder urin.'
  },

  // 2. RONTGEN
  {
    id: 'RAD-01', category: 'RONTGEN', catLabel: 'Radiologi / Rontgen',
    name: 'Rontgen Thorax PA (Foto Dada)',
    code: 'RAD-THX-01', price: 145000,
    specimen: 'Pemeriksaan Radiologi X-Ray', duration: '15-20 Menit (Ekspertise 60 Mnt)',
    terms: 'Lepas perhiasan logam di area dada. Pasien wanita wajib konfirmasi tidak sedang hamil.',
    desc: 'Pemeriksaan paru-paru, jantung, dan tulang rusuk. Standar utama MCU & keluhan batuk.'
  },
  {
    id: 'RAD-02', category: 'RONTGEN', catLabel: 'Radiologi / Rontgen',
    name: 'Rontgen Ekstremitas Tulang (2 Posisi AP/Lat)',
    code: 'RAD-EKS-02', price: 135000,
    specimen: 'X-Ray Digital', duration: '15 Menit',
    terms: 'Lepas aksesoris logam di area tungkai/lengan yang difoto.',
    desc: 'Evaluasi fraktur (patah tulang), dislokasi sendi, dan kelainan susunan tulang.'
  },
  {
    id: 'RAD-03', category: 'RONTGEN', catLabel: 'Radiologi / Rontgen',
    name: "Rontgen Sinus Paranasal (Water's View)",
    code: 'RAD-SPN-03', price: 160000,
    specimen: 'X-Ray Digital Kepala', duration: '20 Menit',
    terms: 'Posisi kepala mendongak sesuai instruksi radiografer. Lepas anting & kacamata.',
    desc: 'Evaluasi sinusitis maksilaris, deviasi septum, dan pembengkakan rongga hidung.'
  },

  // 3. FOTO GIGI
  {
    id: 'GGI-01', category: 'FOTO_GIGI', catLabel: 'Radiologi Gigi',
    name: 'Foto Panoramic Digital Gigi (OPG)',
    code: 'RAD-PAN-01', price: 175000,
    specimen: 'Panoramic X-Ray 2D', duration: '10-15 Menit',
    terms: 'Lepas gigi palsu lepas-pasang, kacamata, anting, dan tindik lidah/mulut.',
    desc: 'Gambaran menyeluruh rahang atas, rahang bawah, gigi bungsu (impaksi), dan sendi TMJ.'
  },
  {
    id: 'GGI-02', category: 'FOTO_GIGI', catLabel: 'Radiologi Gigi',
    name: 'Foto Dental Periapikal Digital',
    code: 'RAD-PRP-02', price: 65000,
    specimen: 'Sensor Intraoral', duration: '10 Menit',
    terms: 'Sensor ditempatkan di dalam mulut di belakang gigi yang diperiksa.',
    desc: 'Foto detail 1-2 gigi untuk evaluasi akar gigi, abses, saluran akar, dan karies dalam.'
  },

  // 4. USG
  {
    id: 'USG-01', category: 'USG', catLabel: 'Ultrasonografi (USG)',
    name: 'USG Kandungan 4D Real-Time + Konsultasi Sp.OG',
    code: 'USG-OBG-4D', price: 250000,
    specimen: 'Transabdominal Probe', duration: '20-30 Menit',
    terms: 'Usia kehamilan ideal 24-28 minggu untuk detail wajah janin. Termasuk print foto 4D.',
    desc: 'Pemeriksaan visual real-time wajah dan anatomi janin dengan dokter spesialis obstetri.'
  },
  {
    id: 'USG-02', category: 'USG', catLabel: 'Ultrasonografi (USG)',
    name: 'USG Abdomen Lengkap (Hati, Empedu, Ginjal, Limpa)',
    code: 'USG-ABD-02', price: 220000,
    specimen: 'Transabdominal Probe', duration: '25 Menit',
    terms: 'Wajib puasa 6-8 jam sebelum tindakan. Tahan kencing 1 jam agar kandung kemih terisi.',
    desc: 'Skrining batu empedu, perlemakan hati, batu ginjal, kista, dan tumor rongga perut.'
  },
  {
    id: 'USG-03', category: 'USG', catLabel: 'Ultrasonografi (USG)',
    name: 'USG Doppler Vaskular Ekstremitas',
    code: 'USG-DOP-03', price: 350000,
    specimen: 'Linear Vascular Probe', duration: '30-40 Menit',
    terms: 'Gunakan pakaian longgar. Tidak memerlukan puasa.',
    desc: 'Evaluasi aliran darah vena/arteri, deteksi DVT (trombosis) dan varises berat.'
  },

  // 5. OPERASI LASER AMBIENS (WASIR)
  {
    id: 'OPS-01', category: 'OPERASI_LASER', catLabel: 'Bedah Laser Wasir',
    name: 'Operasi Metode Laser untuk Ambiens (Laser Hemorrhoidoplasty)',
    code: 'SRG-LSR-AMB', price: 9500000,
    specimen: 'Tindakan Bedah Minimal Invasif', duration: '30-45 Menit (Rawat 1 Hari)',
    terms: 'Konsultasi Poliklinik Bedah Umum, lab pra-bedah, puasa 6 jam sebelum anestesi.',
    desc: 'Teknologi diode laser mutakhir untuk mengempiskan wasir grade II-IV tanpa pisau bedah. Minim rasa nyeri, tanpa luka potong terbuka, pemulihan cepat (One-Day Care).'
  },

  // 6. HARGA MCU
  {
    id: 'MCU-01', category: 'MCU', catLabel: 'Medical Check-Up',
    name: 'Paket MCU Basic RSUD Daya',
    code: 'MCU-BSC-01', price: 350000,
    specimen: 'Pemeriksaan Lengkap', duration: '2-3 Jam (Hasil 1 Hari)',
    terms: 'Fotokopi KTP/KK (2 lbr), pas foto 3x4 (2 lbr), puasa 10 jam. Loket MCU Lt. 2.',
    desc: 'Meliputi pemeriksaan fisik dokter umum, Darah Rutin, Urin Lengkap, dan Rontgen Thorax.'
  },
  {
    id: 'MCU-02', category: 'MCU', catLabel: 'Medical Check-Up',
    name: 'Paket MCU Calon Pegawai / Kedinasan',
    code: 'MCU-CPN-02', price: 550000,
    specimen: 'Pemeriksaan Kedinasan', duration: '3-4 Jam',
    terms: 'KTP asli & foto 3x4 (3 lbr), puasa 10 jam. Termasuk surat bebas buta warna & bebas narkoba 2P.',
    desc: 'Standar resmi pemberkasan CPNS, PPPK, dan BUMN: Fisik, EKG Jantung, Thorax, Lab, Narkoba.'
  },
  {
    id: 'MCU-03', category: 'MCU', catLabel: 'Medical Check-Up',
    name: 'Paket MCU Executive RSUD Daya',
    code: 'MCU-EXE-03', price: 1450000,
    specimen: 'Comprehensive Executive', duration: '1 Hari Kerja',
    terms: 'Puasa 10-12 jam. Disarankan appointment H-1. Bawa pakaian olahraga untuk treadmill.',
    desc: 'Lengkap: Kimia darah komprehensif, Treadmill Jantung, USG Abdomen, Konsul Sp.PD & Sp.JP.'
  },

  // 7. PAKET SKRINING
  {
    id: 'PKT-01', category: 'PAKET', catLabel: 'Paket Skrining',
    name: 'Paket Skrining Jantung & Hipertensi',
    code: 'PKT-JNT-01', price: 650000,
    specimen: 'Kardiovaskular Screening', duration: '2 Jam',
    terms: 'Puasa 10 jam untuk profil lemak. Bawa sepatu kets untuk pemeriksaan treadmill.',
    desc: 'Perekaman EKG, Uji Latih Jantung (Treadmill), Rontgen Dada, Lab Profil Lipid, Konsultasi dr. Sp.JP.'
  },
  {
    id: 'PKT-02', category: 'PAKET', catLabel: 'Paket Skrining',
    name: 'Paket Skrining Pra-Nikah (Premarital) per Pasangan',
    code: 'PKT-MRG-02', price: 850000,
    specimen: 'Calon Pengantin (Pria & Wanita)', duration: '2 Jam',
    terms: 'Kedua calon pengantin hadir bersama. Bawa fotokopi KTP & pas foto berdampingan.',
    desc: 'Hematologi lengkap, Golongan Darah & Rhesus, Skrining Hepatitis B (HBsAg), VDRL/Sifilis, Konseling Catin.'
  },

  // 8. SINGLE TEST
  {
    id: 'SNG-01', category: 'SINGLE', catLabel: 'Layanan Single',
    name: 'Surat Keterangan Berbadan Sehat',
    code: 'SNG-SKS-01', price: 50000,
    specimen: 'Pemeriksaan Fisik Dokter', duration: '15-20 Menit',
    terms: 'Bawa KTP/KK asli dan pas foto 3x4 berwarna (2 lembar). Langsung jadi hari yang sama.',
    desc: 'Surat keterangan resmi ditandatangani dokter RSUD Daya untuk keperluan melamar kerja / sekolah.'
  },
  {
    id: 'SNG-02', category: 'SINGLE', catLabel: 'Layanan Single',
    name: 'Tes Rohani / MMPI (Kesehatan Jiwa)',
    code: 'SNG-MMPI-02', price: 250000,
    specimen: 'Psikometri & Konsultasi Psikiater', duration: '1.5 - 2 Jam (Hasil 1-2 Hari)',
    terms: 'Bawa KTP asli, pensil 2B & penghapus. Meliputi 567 butir soal MMPI & wawancara dr. Sp.KJ.',
    desc: 'Surat Keterangan Bebas Gangguan Jiwa / Kesehatan Rohani untuk calon pejabat, caleg, CPNS, & profesi.'
  },
  {
    id: 'SNG-03', category: 'SINGLE', catLabel: 'Layanan Single',
    name: 'Tes Bebas Narkoba 2 Parameter (Amphetamine & THC)',
    code: 'SNG-NRK-2P', price: 120000,
    specimen: 'Sampel Urin', duration: '30-45 Menit',
    terms: 'Bawa KTP asli dan pas foto 3x4. Pengambilan urin diawasi langsung petugas lab di toilet khusus.',
    desc: 'Deteksi zat Amphetamine (Sabu/Ekstasi) dan THC (Ganja). Surat resmi bebas narkoba RSUD Daya.'
  },
  {
    id: 'SNG-04', category: 'SINGLE', catLabel: 'Layanan Single',
    name: 'Tes Bebas Narkoba 6 Parameter (Lengkap)',
    code: 'SNG-NRK-6P', price: 250000,
    specimen: 'Sampel Urin 6 Panel', duration: '45-60 Menit',
    terms: 'Bawa KTP asli & pas foto 3x4 (2 lbr). Pengambilan sampel urin dalam pengawasan ketat petugas.',
    desc: 'Skrining 6 zat narkotika: AMP, METH, THC, MOR, COC, BZO. Standar resmi CPNS, Kedinasan, BUMN, TNI/Polri.'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA PASIEN AKTIF DI SIMRS (MULTI-QUEUE JOURNEY HARI INI)
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_ACTIVE_PATIENTS = [
  {
    id: 'PAT-01',
    rm: 'RM-2026-0441',
    name: 'Rudi Hermawan',
    gender: 'L',
    age: 42,
    phone: '0812-4455-8899',
    type: 'BPJS Kesehatan PBI',
    poliId: 'POLI-INT',
    poliName: 'Poli Penyakit Dalam',
    doctorName: 'dr. H. Syarif, Sp.PD',
    room: 'Gedung A Lt. 1 R. 101',
    ticketNo: 'A-035',
    currentServingNo: 'A-028',
    totalQueue: 35,
    avgMinsPerPerson: 2,
    stages: [
      { id: 'ADMISI', label: 'Admisi / Pendaftaran', status: 'COMPLETED', time: '08:15 WITA', detail: 'Loket 2 BPJS - Berkas Terverifikasi' },
      { id: 'POLI', label: 'Poli Penyakit Dalam', status: 'IN_PROGRESS', time: 'Menunggu Panggilan', detail: 'R. 101 dr. H. Syarif, Sp.PD (Tersisa 7 Orang)' },
      { id: 'PENUNJANG', label: 'Penunjang Medis (Lab)', status: 'WAITING', time: 'Pasca Konsul Dokter', detail: 'Rujukan Darah Lengkap (Instalasi Lab Lt. 1)' },
      { id: 'FARMASI', label: 'Instalasi Farmasi', status: 'WAITING', time: 'Pasca Selesai', detail: 'Loket 1 (Pengambilan Obat Non-Racik)' }
    ]
  },
  {
    id: 'PAT-02',
    rm: 'RM-2026-0278',
    name: 'Siti Aminah',
    gender: 'P',
    age: 28,
    phone: '0853-9988-1122',
    type: 'Pasien Umum / Mandiri',
    poliId: 'POLI-OBG',
    poliName: 'Poli Kandungan & Kebidanan',
    doctorName: 'dr. Ratna Kusuma, Sp.OG',
    room: 'Gedung B Lt. 1 R. 104',
    ticketNo: 'B-021',
    currentServingNo: 'B-019',
    totalQueue: 30,
    avgMinsPerPerson: 3,
    stages: [
      { id: 'ADMISI', label: 'Admisi / Pendaftaran', status: 'COMPLETED', time: '08:40 WITA', detail: 'Loket 4 Mandiri - Pembayaran Terverifikasi' },
      { id: 'POLI', label: 'Poli Kandungan (Obsgyn)', status: 'IN_PROGRESS', time: '⚡ Segera Bersiap!', detail: 'R. 104 dr. Ratna Kusuma, Sp.OG (Tersisa 2 Orang)' },
      { id: 'PENUNJANG', label: 'Pemeriksaan USG 4D', status: 'IN_PROGRESS', time: 'Sekaligus di Poli', detail: 'Tindakan USG 4D Trimester 2' },
      { id: 'FARMASI', label: 'Instalasi Farmasi', status: 'WAITING', time: 'Pasca Selesai', detail: 'Loket 1 (Vitamin & Suplemen Kehamilan)' }
    ]
  },
  {
    id: 'PAT-03',
    rm: 'RM-2026-0519',
    name: 'Anak Kenzie Alvaro',
    gender: 'L',
    age: 4,
    phone: '0811-2233-4455',
    type: 'BPJS Kesehatan Non-PBI',
    poliId: 'POLI-PED',
    poliName: 'Poli Anak',
    doctorName: 'dr. Ahmad Fauzi, Sp.A',
    room: 'Gedung A Lt. 1 R. 108',
    ticketNo: 'C-040',
    currentServingNo: 'C-032',
    totalQueue: 40,
    avgMinsPerPerson: 2,
    stages: [
      { id: 'ADMISI', label: 'Admisi / Pendaftaran', status: 'COMPLETED', time: '08:55 WITA', detail: 'Loket 1 Pendaftaran Khusus Anak' },
      { id: 'POLI', label: 'Poli Anak', status: 'IN_PROGRESS', time: 'Menunggu Panggilan', detail: 'R. 108 dr. Ahmad Fauzi, Sp.A (Tersisa 8 Orang)' },
      { id: 'PENUNJANG', label: 'Pemeriksaan Lab Trombosit', status: 'WAITING', time: 'Pasca Konsul', detail: 'Evaluasi Rutin Trombosit DHF' },
      { id: 'FARMASI', label: 'Instalasi Farmasi', status: 'WAITING', time: 'Pasca Selesai', detail: 'Loket 2 (Racikan Sirup & Puyer Anak)' }
    ]
  },
  {
    id: 'PAT-04',
    rm: 'RM-2026-0112',
    name: 'Haryono Basuki',
    gender: 'L',
    age: 55,
    phone: '0813-7766-5544',
    type: 'BPJS Kesehatan Mandiri',
    poliId: 'POLI-CAR',
    poliName: 'Poli Jantung & Pembuluh Darah',
    doctorName: 'dr. Wibowo Santoso, Sp.JP',
    room: 'Gedung C Lt. 2 R. 201',
    ticketNo: 'D-017',
    currentServingNo: 'D-016',
    totalQueue: 25,
    avgMinsPerPerson: 4,
    stages: [
      { id: 'ADMISI', label: 'Admisi / Pendaftaran', status: 'COMPLETED', time: '08:00 WITA', detail: 'Loket 3 Rujukan Jantung' },
      { id: 'POLI', label: 'Poli Jantung', status: 'IN_PROGRESS', time: '⚡ Panggilan Selanjutnya!', detail: 'R. 201 dr. Wibowo Santoso, Sp.JP (Tinggal 1 Orang)' },
      { id: 'PENUNJANG', label: 'Pemeriksaan EKG Jantung', status: 'COMPLETED', time: '08:30 WITA', detail: 'Perekaman EKG 12-Lead telah selesai' },
      { id: 'FARMASI', label: 'Instalasi Farmasi', status: 'WAITING', time: 'Pasca Selesai', detail: 'Loket 1 (Obat Kardiovaskular Kronis)' }
    ]
  }
];

const MOCK_DOCTORS_SCHEDULE = [
  { id: 'DOC-01', name: 'dr. H. Syarif, Sp.PD', poli: 'Poli Penyakit Dalam', days: 'Senin, Rabu, Jumat', hours: '08.30 - 13.00 WITA', quotaLeft: 7, totalQuota: 35, status: 'PRAKTEK' },
  { id: 'DOC-02', name: 'dr. Ratna Kusuma, Sp.OG', poli: 'Poli Kandungan & Kebidanan', days: 'Senin s/d Kamis', hours: '09.00 - 13.30 WITA', quotaLeft: 4, totalQuota: 30, status: 'PRAKTEK' },
  { id: 'DOC-03', name: 'dr. Ahmad Fauzi, Sp.A', poli: 'Poli Anak', days: 'Setiap Hari Kerja', hours: '08.00 - 12.30 WITA', quotaLeft: 12, totalQuota: 40, status: 'PRAKTEK' },
  { id: 'DOC-04', name: 'dr. Wibowo Santoso, Sp.JP', poli: 'Poli Jantung & Pembuluh Darah', days: 'Selasa & Kamis', hours: '10.00 - 14.00 WITA', quotaLeft: 3, totalQuota: 25, status: 'PRAKTEK' },
  { id: 'DOC-05', name: 'dr. Syamsul Bahri, Sp.B', poli: 'Poli Bedah Umum (Laser Wasir)', days: 'Senin, Selasa, Kamis', hours: '09.00 - 13.00 WITA', quotaLeft: 9, totalQuota: 25, status: 'PRAKTEK' },
  { id: 'DOC-06', name: 'dr. Irwan Kurniawan, Sp.S', poli: 'Poli Saraf', days: 'Rabu & Jumat', hours: '09.00 - 12.30 WITA', quotaLeft: 6, totalQuota: 25, status: 'PRAKTEK' },
  { id: 'DOC-07', name: 'dr. Hj. Maryam, Sp.KJ', poli: 'Poli Jiwa & Tes MMPI', days: 'Senin s/d Jumat', hours: '08.30 - 14.00 WITA', quotaLeft: 8, totalQuota: 20, status: 'PRAKTEK' },
  { id: 'DOC-08', name: 'drg. Andi Nurul, Sp.KG', poli: 'Poli Gigi & Mulut', days: 'Senin, Rabu, Kamis', hours: '08.30 - 13.00 WITA', quotaLeft: 5, totalQuota: 20, status: 'PRAKTEK' }
];

const MOCK_PHARMACY_QUEUE = [
  { rxId: 'RX-8841', rm: 'RM-2026-0441', patientName: 'Rudi Hermawan', poli: 'Penyakit Dalam', type: 'Non-Racikan', status: 'SIAP_AMBIL', counter: 'Loket 1 (Non-Racik)', time: '09:12 WITA', notified: true },
  { rxId: 'RX-8842', rm: 'RM-2026-0278', patientName: 'Siti Aminah', poli: 'Kandungan', type: 'Non-Racikan', status: 'SIAP_AMBIL', counter: 'Loket 1 (Non-Racik)', time: '09:20 WITA', notified: false },
  { rxId: 'RX-8843', rm: 'RM-2026-0519', patientName: 'Anak Kenzie Alvaro', poli: 'Anak', type: 'Racikan Sirup/Puyer', status: 'DIRACIK', counter: 'Loket 2 (Racik)', time: '09:35 WITA', notified: false },
  { rxId: 'RX-8844', rm: 'RM-2026-0112', patientName: 'Haryono Basuki', poli: 'Jantung', type: 'Non-Racikan', status: 'DIRACIK', counter: 'Loket 1 (Non-Racik)', time: '09:40 WITA', notified: false },
  { rxId: 'RX-8845', rm: 'RM-2026-0334', patientName: 'Dewi Rahmawati', poli: 'Penyakit Dalam', type: 'Racikan Salep/Kapsul', status: 'VERIFIKASI', counter: 'Loket 2 (Racik)', time: '09:48 WITA', notified: false }
];

const MOCK_SURGERY_SCHEDULES = [
  {
    id: 'SRG-101', rm: 'RM-2026-0782', patientName: 'Baharuddin M.', age: 48, gender: 'L',
    procedure: 'Operasi Laser Wasir (Laser Hemorrhoidoplasty)', doctor: 'dr. Syamsul Bahri, Sp.B',
    date: 'Besok, 17 Sep 2026', time: '09.00 WITA', room: 'OK Bedah Sentral 2',
    phase: 'H-1', fastingHours: 'Mulai pkl 23.00 WITA malam ini (Puasa 8 Jam)',
    phone: '0812-4455-8899', reminderSent: false, notes: 'Konfirmasi kamar rawat Cendrawasih Lt. 3 sudah siap.'
  },
  {
    id: 'SRG-102', rm: 'RM-2026-0612', patientName: 'Nurhayati Daeng Ratu', age: 64, gender: 'P',
    procedure: 'Operasi Katarak Phacoemulsifikasi + IOL', doctor: 'dr. Rosdiana, Sp.M',
    date: 'Lusa, 18 Sep 2026', time: '08.30 WITA', room: 'OK Mata 1',
    phase: 'H-2', fastingHours: 'Puasa 6 jam sebelum tindakan (dimulai H-1 malam)',
    phone: '0852-7711-2233', reminderSent: true, notes: 'Sudah konfirmasi kesiapan berkas rujukan.'
  },
  {
    id: 'SRG-103', rm: 'RM-2026-0921', patientName: 'Sitti Marwah', age: 31, gender: 'P',
    procedure: 'Sectio Caesarea (SC Elektif Trimester 3)', doctor: 'dr. Ratna Kusuma, Sp.OG',
    date: '19 Sep 2026', time: '10.00 WITA', room: 'OK Obsgyn Bersalin',
    phase: 'H-3', fastingHours: 'Instruksi puasa diberikan pada H-1',
    phone: '0813-9988-4422', reminderSent: false, notes: 'Crossmatch darah 2 labu di PMI telah standby.'
  }
];

export default function AiPatientInfoHub({ showToast }) {
  const [activeSubView, setActiveSubView] = useState('patient'); // Default to 'patient' as per user interest
  const [publicCatFilter, setPublicCatFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFaqModal, setShowFaqModal] = useState(false);

  // Active Multi-Queue Patients State
  const [activePatients, setActivePatients] = useState(INITIAL_ACTIVE_PATIENTS);
  const [selectedCustomerFacingPatient, setSelectedCustomerFacingPatient] = useState(null);

  // Pharmacy & Surgery Action states
  const [pharmacyList, setPharmacyList] = useState(MOCK_PHARMACY_QUEUE);
  const [surgeryList, setSurgeryList] = useState(MOCK_SURGERY_SCHEDULES);

  // Simulator State
  const [chatLog, setChatLog] = useState([
    {
      sender: 'system',
      text: 'Simulator Chatbot Pasien aktif. Tanyakan posisi antrean Anda (misal: "Cek antrean saya RM-2026-0441") atau info tarif.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Format currency IDR
  const fmtRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

  // Filter Public Tariffs
  const filteredTariffs = useMemo(() => {
    return PUBLIC_TARIFFS.filter(item => {
      const matchCat = publicCatFilter === 'ALL' || item.category === publicCatFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery = !q ||
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.catLabel.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [publicCatFilter, searchQuery]);

  // Handle Advancing Queue Counter (Simulasi Panggilan Antrean Maju)
  const handleAdvanceQueue = (patientId) => {
    setActivePatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      // Extract number, e.g. A-028 -> 28
      const prefix = p.currentServingNo.split('-')[0];
      const curNum = parseInt(p.currentServingNo.split('-')[1], 10);
      const myNum = parseInt(p.ticketNo.split('-')[1], 10);

      if (curNum < myNum) {
        const nextNum = curNum + 1;
        const nextServingNo = `${prefix}-${String(nextNum).padStart(3, '0')}`;
        playHospitalChime();
        if (showToast) {
          showToast('Antrean Maju', `Nomor ${nextServingNo} (${p.poliName}) dipanggil di ${p.room}.`, 'info');
        }
        return {
          ...p,
          currentServingNo: nextServingNo
        };
      }
      return p;
    }));
  };

  // Send WhatsApp Live Tracking Link to Patient
  const handleSendTrackingLink = (p) => {
    PolicareApi.sendQueueLinkToPatient(p.rm, p.phone);
    if (showToast) {
      showToast('Tautan Terkirim', `Link tracking antrean pasien ${p.name} (${p.rm}) berhasil dikirim ke WhatsApp ${p.phone}.`, 'success');
    }
  };

  // Open Customer Facing Portal for a specific patient
  const handleOpenCustomerFacing = (p) => {
    setSelectedCustomerFacingPatient(p);
  };

  // Handle WhatsApp copy template for tariff
  const handleCopyWa = (item) => {
    if (!item) return;
    const text = '*INFORMASI LAYANAN RSUD DAYA KOTA MAKASSAR*\n' +
      '📌 *Layanan:* ' + item.name + '\n' +
      '💰 *Tarif Pasien Umum:* ' + fmtRp(item.price) + '\n' +
      '📋 *Syarat & Tahapan:* ' + item.terms + '\n' +
      '⏱️ *Estimasi Pengerjaan:* ' + item.duration + '\n' +
      'ℹ️ *Keterangan:* ' + item.desc + '\n\n' +
      '_RSUD Daya Kota Makassar siap melayani dengan sepenuh hati._';
    navigator.clipboard?.writeText(text);
    if (showToast) showToast('Teks Disalin', 'Format informasi WhatsApp untuk ' + item.name + ' berhasil disalin ke clipboard.', 'success');
  };

  // Trigger test directly into simulator
  const handleTestInSimulator = (query) => {
    setInputMessage(query);
    handleSendSimulation(query);
  };

  // Send Pharmacy Ready Notification
  const handleNotifyPharmacy = (rx) => {
    setPharmacyList(prev => prev.map(p => p.rxId === rx.rxId ? { ...p, notified: true } : p));
    if (showToast) showToast('Notifikasi Terkirim', 'Pemberitahuan obat siap ambil terkirim via WhatsApp ke pasien ' + rx.patientName + ' (' + rx.counter + ').', 'success');
  };

  // Send Surgery Reminder
  const handleSendSurgeryReminder = (surg) => {
    setSurgeryList(prev => prev.map(s => s.id === surg.id ? { ...s, reminderSent: true } : s));
    PolicareApi.sendSurgeryReminder(surg.rm, surg.phase);
    if (showToast) showToast('Reminder Operasi Terkirim', 'Pengingat ' + surg.phase + ' & instruksi puasa berhasil dikirim via WhatsApp ke ' + surg.patientName + '.', 'success');
  };

  // Handle Simulator Bot Response (Included multi-queue personal tracking)
  const handleSendSimulation = (customQuery) => {
    const q = (customQuery || inputMessage).trim();
    if (!q) return;

    const userMsg = { sender: 'patient', text: q, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
    setChatLog(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAiThinking(true);

    setTimeout(() => {
      let botReply = '';
      const lower = q.toLowerCase();

      // Case: Check personal queue
      if (lower.includes('antre') || lower.includes('antri') || lower.includes('rm-2026-0441') || lower.includes('posisi')) {
        const p = activePatients.find(item => item.rm === 'RM-2026-0441') || activePatients[0];
        const curNum = parseInt(p.currentServingNo.split('-')[1], 10);
        const myNum = parseInt(p.ticketNo.split('-')[1], 10);
        const remaining = Math.max(0, myNum - curNum);
        const estWait = remaining * p.avgMinsPerPerson;

        botReply = `Halo Bapak ${p.name} (${p.rm})! 🏥\n\n` +
          `Status Antrean Terkini Anda di RSUD Daya Kota Makassar:\n` +
          `• 🎟️ *Nomor Antrean Anda:* *${p.ticketNo}*\n` +
          `• 📢 *Sedang Dilayani Saat Ini:* *${p.currentServingNo}*\n` +
          `• ⏳ *Sisa Antrean di Depan Anda:* *${remaining} Orang* (Estimasi waktu: ~${estWait} menit)\n` +
          `• 📍 *Poli & Ruangan:* ${p.poliName} · ${p.room}\n` +
          `• 👨‍⚕️ *Dokter:* ${p.doctorName}\n\n` +
          `📋 *Alur Pelayanan Anda Hari Ini:*\n` +
          `1. ✅ Pendaftaran / Admisi (Selesai)\n` +
          `2. ⏳ ${p.poliName} (Sedang Berjalan)\n` +
          `3. ⏸️ Lab Darah Lengkap (Menunggu Rujukan)\n` +
          `4. ⏸️ Farmasi Obat (Loket 1)\n\n` +
          `🔗 Buka live tracking antrean digital di ponsel Anda: https://policare.rsuddaya.go.id/antrean?rm=${p.rm}`;
      } else if (lower.includes('laser') || lower.includes('ambeien') || lower.includes('wasir')) {
        botReply = 'Halo Bapak/Ibu! 😊 Di RSUD Daya Kota Makassar tersedia tindakan *Operasi Wasir Metode Laser (Laser Hemorrhoidoplasty)* bersama dr. Syamsul Bahri, Sp.B.\n\n' +
          '✨ *Keunggulan Metode Laser:*\n' +
          '• Tanpa sayatan pisau bedah & tanpa jahitan terbuka\n' +
          '• Nyeri pasca-tindakan minimal\n' +
          '• Pemulihan cepat (One-Day Care / rawat 1 hari)\n\n' +
          '💰 *Estimasi Biaya Paket Umum:* Mulai Rp 9.500.000 (tindakan + kamar + obat).\n' +
          '📋 *Tahapan:* Kunjungi Poliklinik Bedah Umum hari Senin, Selasa, atau Kamis (09.00 - 13.00 WITA) untuk evaluasi derajat wasir terlebih dahulu.';
      } else if (lower.includes('narkoba') || lower.includes('mmpi') || lower.includes('rohani') || lower.includes('sehat')) {
        botReply = 'Halo! Berikut rincian tarif dan persyaratan layanan surat keterangan & tes di RSUD Daya Kota Makassar:\n\n' +
          '1. 🩺 *Surat Berbadan Sehat:* Rp 50.000 (Syarat: KTP & pas foto 3x4 2 lbr, langsung jadi 20 mnt).\n' +
          '2. 🧠 *Tes Rohani / MMPI:* Rp 250.000 (Pemeriksaan kesehatan jiwa oleh dr. Hj. Maryam, Sp.KJ, 567 soal MMPI, bawa pensil 2B, durasi 1.5 jam).\n' +
          '3. 🧪 *Tes Bebas Narkoba 2 Parameter (AMP & THC):* Rp 120.000\n' +
          '4. 🛡️ *Tes Bebas Narkoba 6 Parameter (AMP, METH, THC, MOR, COC, BZO):* Rp 250.000 (Standar BNN/Kedinasan/CPNS).\n\n' +
          'Loket pemeriksaan buka Senin - Jumat pukul 08.00 - 13.00 WITA di Gedung Poliklinik Lt. 2.';
      } else if (lower.includes('sktm') || lower.includes('tidak mampu') || lower.includes('tidak punya bpjs') || lower.includes('bukan bpjs')) {
        botReply = 'Halo Bapak/Ibu, terima kasih pertanyaannya. 🙏\n\n' +
          '✅ *Ya, masih berlaku.* Warga Kota Makassar yang belum memiliki BPJS Kesehatan aktif dan tergolong keluarga prasejahtera tetap dapat berobat di RSUD Daya Kota Makassar melalui skema *Bantuan Jamkesda / SKTM Dinas Sosial*.\n\n' +
          '📋 *Syarat Berkas yang Harus Dibawa:*\n' +
          '1. Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan yang telah divalidasi Dinas Sosial Kota Makassar.\n' +
          '2. Fotokopi Kartu Tanda Penduduk (KTP) & Kartu Keluarga (KK) Kota Makassar.\n' +
          '3. Surat Pengantar Rujukan dari Puskesmas setempat (kecuali gawat darurat IGD).\n\n' +
          'Silakan bawa berkas ke loket Pelayanan Yanmas / Humas di Gedung Utama Lt. 1 untuk validasi pembebasan biaya.';
      } else if (lower.includes('usg') || lower.includes('rontgen') || lower.includes('gigi') || lower.includes('foto')) {
        botReply = 'Halo! Berikut informasi tarif pemeriksaan diagnostik & radiologi di RSUD Daya:\n\n' +
          '• 👶 *USG Kandungan 4D Real-Time:* Rp 250.000 (Termasuk cetak foto 4D & konsul Sp.OG).\n' +
          '• 🩻 *USG Abdomen Lengkap:* Rp 220.000 (Wajib puasa 6-8 jam).\n' +
          '• 🫁 *Rontgen Thorax PA (Foto Dada):* Rp 145.000 (Hasil cetak film + ekspertise spesialis radiologi).\n' +
          '• 🦷 *Foto Panoramik Digital Gigi (OPG):* Rp 175.000 (Seluruh rahang atas & bawah).\n' +
          '• 🦷 *Foto Dental Periapikal:* Rp 65.000 per gigi.';
      } else if (lower.includes('obat') || lower.includes('resep') || lower.includes('farmasi')) {
        botReply = 'Halo! 💊 Resep obat Anda dari Poliklinik RSUD Daya saat ini sedang dalam proses peracikan. Anda akan menerima notifikasi otomatis via WhatsApp saat obat telah siap diambil di Loket Farmasi.';
      } else if (lower.includes('operasi') || lower.includes('puasa') || lower.includes('jadwal bedah')) {
        botReply = 'Halo! 🏥 Jadwal operasi elektif Anda terjadwal sesuai arahan dokter spesialis bedah. Harap pastikan instruksi puasa makan & minum dipatuhi mulai H-1 malam sebelum tindakan.';
      } else {
        botReply = 'Halo! Terima kasih telah menghubungi Sinteta AI Companion RSUD Daya Kota Makassar. Mengenai "' + q + '", Anda dapat menanyakan posisi antrean Anda di poli, jadwal dokter, tarif lab, USG, operasi laser ambeien, maupun status obat farmasi.';
      }

      setChatLog(prev => [...prev, {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsAiThinking(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* BANNER HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff', padding: '20px 24px', borderRadius: '14px',
        boxShadow: 'var(--sh2)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
            <span className="ic s" style={{ fontSize: '14px' }}>hub</span> REPOSITORI AKSES INFORMASI PASIEN · RSUD DAYA
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Pusat Akses Informasi Pasien dari RS (Katalog Publik &amp; Integrasi SIMRS)
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
            Hubungkan data SIMRS secara realtime agar pasien dapat mengetahui sekarang antrean ke berapa di berbagai titik layanan (Admisi, Poli, Penunjang, &amp; Farmasi) serta akses mandiri di portal Customer Facing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenCustomerFacing(activePatients[0])}
            className="btn pri sm"
            style={{ background: '#10b981', borderColor: '#10b981', color: '#fff', fontWeight: 700 }}>
            <span className="ic s">phone_iphone</span> Buka Layar Pasien (Customer Facing)
          </button>
          <button
            onClick={() => setShowFaqModal(true)}
            className="btn ghost sm"
            style={{ color: '#f8fafc', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <span className="ic s" style={{ color: '#fbbf24' }}>help_center</span> FAQ SKTM Non-BPJS
          </button>
        </div>
      </div>

      {/* KPI METRICS STRIP */}
      <div className="kstrip k4" style={{ marginBottom: '0px' }}>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#2563eb' }}>queue</span></div>
          <div className="kcard-lbl">Pasien Aktif di SIMRS Hari Ini</div>
          <div className="kcard-v" style={{ color: 'var(--blue)' }}>{activePatients.length} <small>Pasien</small></div>
          <div className="kcard-d up">Admisi ➔ Poli ➔ Lab ➔ Farmasi</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#10b981' }}>sensors</span></div>
          <div className="kcard-lbl">Bridging SIMRS Multi-Queue</div>
          <div className="kcard-v" style={{ color: '#10b981', fontSize: '17px' }}>Live Syncing</div>
          <div className="kcard-d up">Latency: 28ms · HTTP 200</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#f59e0b' }}>medication</span></div>
          <div className="kcard-lbl">Antrean Resep Farmasi</div>
          <div className="kcard-v" style={{ color: '#f59e0b' }}>{pharmacyList.filter(p => p.status === 'SIAP_AMBIL').length} / {pharmacyList.length}</div>
          <div className="kcard-d up">Resep Siap Diambil di Loket</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#8b5cf6' }}>healing</span></div>
          <div className="kcard-lbl">Jadwal Operasi Elektif</div>
          <div className="kcard-v" style={{ color: '#8b5cf6' }}>{surgeryList.length} <small>Pasien</small></div>
          <div className="kcard-d up">Reminder H-2 &amp; H-1 Aktif</div>
        </div>
      </div>

      {/* 2 MAIN PILAR SWITCH TABS */}
      <div style={{
        display: 'flex', background: 'var(--srf)', border: '1px solid var(--line)',
        borderRadius: '12px', padding: '4px', gap: '4px'
      }}>
        <button
          onClick={() => setActiveSubView('patient')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all .15s ease',
            background: activeSubView === 'patient' ? '#2563eb' : 'transparent',
            color: activeSubView === 'patient' ? '#ffffff' : 'var(--t2)'
          }}>
          <span className="ic s" style={{ fontSize: '18px' }}>contact_phone</span>
          1. INFORMASI KE PASIEN (Live SIMRS Multi-Queue, Tracking Pasien, &amp; Customer Facing)
        </button>

        <button
          onClick={() => setActiveSubView('public')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all .15s ease',
            background: activeSubView === 'public' ? '#2563eb' : 'transparent',
            color: activeSubView === 'public' ? '#ffffff' : 'var(--t2)'
          }}>
          <span className="ic s" style={{ fontSize: '18px' }}>public</span>
          2. INFORMASI PUBLIK &amp; DAFTAR TARIF (Lab, Rontgen, Gigi, USG, Laser Wasir, MCU, Single)
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
       * PILAR 1: INFORMASI KE PASIEN (LIVE SIMRS MULTI-QUEUE & CUSTOMER FACING)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeSubView === 'patient' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* SIMRS LIVE MULTI-QUEUE TRACKING DASHBOARD (NEW!) */}
          <div className="card" style={{ border: '1.5px solid var(--blue)' }}>
            <div className="card-hd" style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.06) 0%, transparent 100%)' }}>
              <div className="card-hd-l">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ic" style={{ color: '#2563eb', fontSize: '20px' }}>sync_alt</span>
                  <div className="card-title">Live Tracking Antrean Pasien Terdaftar (SIMRS Multi-Queue Journey)</div>
                  <span className="bdg s" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', fontSize: '10px', fontWeight: 700 }}>
                    ● REALTIME BRIDGING AKTIF
                  </span>
                </div>
                <div className="card-sub">
                  Pasien dapat mengetahui posisi antreannya di berbagai stasiun pelayanan RS (Admisi, Poli, Penunjang, &amp; Farmasi) secara terintegrasi.
                </div>
              </div>
            </div>

            {/* TABLE OF ACTIVE PATIENTS */}
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Identitas Pasien &amp; No. RM</th>
                    <th>Poli &amp; Dokter Penanggung Jawab</th>
                    <th>Nomor Antrean Pasien</th>
                    <th>Nomor Dipanggil Saat Ini</th>
                    <th>Sisa Antrean &amp; Est. Waktu</th>
                    <th>Status Multi-Stasiun RS</th>
                    <th style={{ textAlign: 'right' }}>Aksi Pelayanan</th>
                  </tr>
                </thead>
                <tbody>
                  {activePatients.map(p => {
                    const curNum = parseInt(p.currentServingNo.split('-')[1], 10);
                    const myNum = parseInt(p.ticketNo.split('-')[1], 10);
                    const remaining = Math.max(0, myNum - curNum);
                    const estMins = remaining * p.avgMinsPerPerson;
                    const isNext = remaining <= 2 && remaining > 0;
                    const isNow = remaining === 0;

                    return (
                      <tr key={p.id} style={{ background: isNow ? '#eff6ff' : isNext ? '#fffbeb' : 'transparent' }}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {p.name}
                            <span style={{ fontSize: '10px', color: 'var(--t3)', fontWeight: 500 }}>({p.gender}/{p.age} thn)</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 700 }}>{p.rm}</div>
                          <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{p.type} · {p.phone}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{p.poliName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--t2)' }}>👨‍⚕️ {p.doctorName}</div>
                          <div style={{ fontSize: '10px', color: 'var(--t3)' }}>📍 {p.room}</div>
                        </td>

                        <td>
                          <span style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb', fontFamily: 'monospace' }}>
                            {p.ticketNo}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: isNow ? '#16a34a' : 'var(--t1)', fontFamily: 'monospace' }}>
                              {p.currentServingNo}
                            </span>
                            {isNow && (
                              <span className="bdg s" style={{ background: '#dcfce7', color: '#15803d', fontSize: '9px', fontWeight: 800 }}>
                                GILIRAN
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--t3)' }}>Total: {p.totalQueue} Pasien</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: isNow ? '#16a34a' : isNext ? '#d97706' : 'var(--t1)' }}>
                            {isNow ? 'Sedang Masuk Ruang Poli' : `${remaining} Orang di Depan`}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--t3)' }}>
                            {isNow ? 'Panggilan Aktif' : `~${estMins} Menit lagi`}
                          </div>
                        </td>

                        <td style={{ maxWidth: '240px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {p.stages.map((st, sIdx) => (
                              <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  color: st.status === 'COMPLETED' ? '#16a34a' : st.status === 'IN_PROGRESS' ? '#2563eb' : '#94a3b8'
                                }}>
                                  {st.status === 'COMPLETED' ? '●' : st.status === 'IN_PROGRESS' ? '◐' : '○'}
                                </span>
                                <span style={{ fontWeight: st.status === 'IN_PROGRESS' ? 700 : 500, color: st.status === 'IN_PROGRESS' ? 'var(--blue)' : 'var(--t2)' }}>
                                  {st.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                            <button
                              onClick={() => handleOpenCustomerFacing(p)}
                              className="btn pri xs"
                              style={{ background: '#10b981', borderColor: '#10b981', color: '#fff', fontWeight: 700 }}>
                              <span className="ic s">visibility</span> Layar Pasien
                            </button>

                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => handleAdvanceQueue(p.id)}
                                disabled={isNow}
                                className="btn ghost xs"
                                title="Simulasikan Panggilan Nomor Berikutnya">
                                <span className="ic s">skip_next</span> Panggil +1
                              </button>
                              <button
                                onClick={() => handleSendTrackingLink(p)}
                                className="btn ghost xs"
                                title="Kirim Link Tracking Antrean ke WhatsApp Pasien">
                                <span className="ic s">share</span> WA
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 STATIONS OF PATIENT JOURNEY DETAIL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '16px' }}>

            {/* 1. JADWAL DOKTER */}
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic" style={{ color: '#2563eb', fontSize: '18px' }}>calendar_month</span>
                    <div className="card-title">Jadwal Dokter Poliklinik (Live SIMRS)</div>
                  </div>
                  <div className="card-sub">Data jadwal harian, jam praktek, dan sisa kuota antrean hari ini</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {MOCK_DOCTORS_SCHEDULE.map(doc => (
                  <div key={doc.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--srf)'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{doc.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 600 }}>{doc.poli}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>
                        🗓️ {doc.days} · ⏰ {doc.hours}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="bdg s" style={{ fontSize: '11px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                        Sisa Kuota: {doc.quotaLeft} / {doc.totalQuota}
                      </span>
                      <div style={{ marginTop: '4px' }}>
                        <button
                          onClick={() => handleTestInSimulator('Kapan jadwal praktek ' + doc.name + ' di ' + doc.poli + '?')}
                          className="btn ghost xs">
                          <span className="ic s">chat</span> Tanya Jadwal
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. ANTRIAN OBAT (FARMASI) */}
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic" style={{ color: '#f59e0b', fontSize: '18px' }}>medication</span>
                    <div className="card-title">Antrian Obat (Instalasi Farmasi)</div>
                  </div>
                  <div className="card-sub">Pelacakan status penyiapan &amp; pengambilan resep obat pasien</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {pharmacyList.map(rx => (
                  <div key={rx.rxId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--srf)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t1)' }}>{rx.patientName}</span>
                        <span className="bdg n" style={{ fontSize: '9px' }}>{rx.rm}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>
                        {rx.rxId} · {rx.type} ({rx.poli})
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>Masuk: {rx.time}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`bdg ${rx.status === 'SIAP_AMBIL' ? 's' : rx.status === 'DIRACIK' ? 'p' : 'w'}`} style={{ fontSize: '10px', fontWeight: 700 }}>
                        {rx.status === 'SIAP_AMBIL' ? '✅ SIAP DIAMBIL' : rx.status === 'DIRACIK' ? '⚙️ SEDANG DIRACIK' : '⏳ VERIFIKASI'}
                      </span>
                      <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>{rx.counter}</div>
                      {rx.status === 'SIAP_AMBIL' && (
                        <div style={{ marginTop: '4px' }}>
                          <button
                            onClick={() => handleNotifyPharmacy(rx)}
                            disabled={rx.notified}
                            className="btn pri xs"
                            style={{ background: rx.notified ? '#94a3b8' : '#16a34a', fontSize: '10px', padding: '2px 6px' }}>
                            <span className="ic s" style={{ fontSize: '12px' }}>send</span>
                            {rx.notified ? 'WA Terkirim' : 'Kirim Notif WA'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. DIINGATKAN UNTUK OPERASI (REMINDER PRA-BEDAH) */}
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic" style={{ color: '#8b5cf6', fontSize: '18px' }}>notifications_active</span>
                    <div className="card-title">Diingatkan untuk Operasi (Reminder Pra-Bedah)</div>
                  </div>
                  <div className="card-sub">Pengingat jadwal operasi, instruksi puasa &amp; konfirmasi kesiapan pasien</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {surgeryList.map(surg => (
                  <div key={surg.id} style={{
                    padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--srf)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--t1)' }}>{surg.patientName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--t3)', marginLeft: '6px' }}>({surg.gender}/{surg.age} thn) · {surg.rm}</span>
                      </div>
                      <span className="bdg p" style={{ fontSize: '10px', fontWeight: 700 }}>
                        {surg.phase}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue)' }}>
                      🩺 {surg.procedure}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>
                      👨‍⚕️ {surg.doctor} · 📍 {surg.room}
                    </div>
                    <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
                      📅 {surg.date} pkl {surg.time}
                    </div>
                    <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600, background: '#fef2f2', padding: '4px 8px', borderRadius: '6px', marginTop: '4px' }}>
                      ⚠️ <b>Instruksi Puasa:</b> {surg.fastingHours}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--line)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--t3)' }}>{surg.notes}</span>
                      <button
                        onClick={() => handleSendSurgeryReminder(surg)}
                        disabled={surg.reminderSent}
                        className="btn pri xs"
                        style={{ background: surg.reminderSent ? '#94a3b8' : '#8b5cf6' }}>
                        <span className="ic s">notifications</span>
                        {surg.reminderSent ? 'Reminder Terkirim' : 'Kirim Pengingat WA (' + surg.phase + ')'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. INFO PANDUAN RUANGAN & ALUR PASIEN */}
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic" style={{ color: '#0ea5e9', fontSize: '18px' }}>map</span>
                    <div className="card-title">Panduan Lokasi &amp; Alur Pasien RSUD Daya</div>
                  </div>
                  <div className="card-sub">Denah alur pemeriksaan dari Pendaftaran hingga Farmasi</div>
                </div>
              </div>
              <div style={{ padding: '4px 0', fontSize: '12px', lineHeight: '1.6', color: 'var(--t2)' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
                  <div>
                    <b style={{ color: 'var(--t1)' }}>Gedung Utama Lt. 1:</b> Loket Admisi Pendaftaran Rawat Jalan &amp; Kasir Utama.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
                  <div>
                    <b style={{ color: 'var(--t1)' }}>Gedung Rawat Jalan:</b> Poliklinik Spesialis (Penyakit Dalam R. 101, Obsgyn R. 104, Anak R. 108).
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
                  <div>
                    <b style={{ color: 'var(--t1)' }}>Gedung Penunjang:</b> Laboratorium Sentral &amp; Radiologi Rontgen/USG.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>4</div>
                  <div>
                    <b style={{ color: 'var(--t1)' }}>Instalasi Farmasi:</b> Loket 1 (Non-Racikan) &amp; Loket 2 (Racikan).
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * PILAR 2: INFORMASI PUBLIK & KATALOG TARIF
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeSubView === 'public' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* FILTER PILLS */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {[
              { id: 'ALL', label: 'Semua Tarif', icon: 'dataset' },
              { id: 'LAB', label: 'Lab', icon: 'biotech' },
              { id: 'RONTGEN', label: 'Rontgen', icon: 'view_in_ar' },
              { id: 'FOTO_GIGI', label: 'Foto Gigi', icon: 'dentistry' },
              { id: 'USG', label: 'USG', icon: 'pregnant_woman' },
              { id: 'OPERASI_LASER', label: 'Operasi Laser Wasir', icon: 'local_hospital' },
              { id: 'MCU', label: 'Harga MCU', icon: 'fact_check' },
              { id: 'PAKET', label: 'Paket Skrining', icon: 'medical_information' },
              { id: 'SINGLE', label: 'Single (Sehat, MMPI, Narkoba)', icon: 'assignment' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setPublicCatFilter(cat.id)}
                className={`btn ${publicCatFilter === cat.id ? 'pri' : 'ghost'} sm`}
                style={{
                  flexShrink: 0, borderRadius: '20px', fontSize: '12px',
                  background: publicCatFilter === cat.id ? 'var(--blue)' : 'var(--srf)',
                  borderColor: publicCatFilter === cat.id ? 'var(--blue)' : 'var(--line)'
                }}>
                <span className="ic s">{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>

          {/* SEARCH & ACTION BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <span className="ic s" style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--t3)' }}>search</span>
              <input
                type="text"
                placeholder="Cari nama layanan, tarif, syarat berkas, rontgen, USG, tes narkoba, MMPI..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px',
                  border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '13px'
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t3)', fontWeight: 600 }}>
              Menampilkan {filteredTariffs.length} item informasi tarif
            </div>
          </div>

          {/* TABLE OF TARIFFS */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Direktori Tarif Pasien Umum RSUD Daya</div>
                <div className="card-sub">Data acuan resmi yang digunakan AI Companion saat menjawab pertanyaan pasien publik</div>
              </div>
            </div>

            <table className="tbl" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Kode &amp; Kategori</th>
                  <th>Nama Layanan / Pemeriksaan</th>
                  <th>Tarif Umum</th>
                  <th>Syarat Berkas &amp; Tahapan</th>
                  <th>Durasi / Sampel</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTariffs.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className="bdg n" style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px' }}>
                        {item.code}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{item.catLabel}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>{item.desc}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '13px' }}>
                        {fmtRp(item.price)}
                      </span>
                    </td>
                    <td style={{ maxWidth: '260px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--t2)', lineHeight: '1.3' }}>
                        {item.terms}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '11px', fontWeight: 600 }}>{item.duration}</div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{item.specimen}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          onClick={() => handleCopyWa(item)}
                          className="btn ghost xs"
                          title="Salin Teks Format WhatsApp">
                          <span className="ic s">content_copy</span> WA
                        </button>
                        <button
                          onClick={() => handleTestInSimulator('Berapa tarif ' + item.name + ' dan apa saja syaratnya?')}
                          className="btn ghost xs"
                          title="Uji Tanya di Chat Simulator">
                          <span className="ic s">smart_toy</span> Tes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * SIMULATOR CHATBOT AI PASIEN (WHATSAPP / WEB WIDGET PREVIEW)
       * ═════════════════════════════════════════════════════════════════════*/}
      <div className="card" style={{ marginTop: '6px' }}>
        <div className="card-hd">
          <div className="card-hd-l">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="ic" style={{ color: '#2563eb' }}>chat</span>
              <div className="card-title">Simulator Interaksi Pasien (WhatsApp &amp; Web Chatbot AI)</div>
            </div>
            <div className="card-sub">Uji bagaimana Sinteta AI Companion merespons pertanyaan pasien publik &amp; status antrean SIMRS</div>
          </div>
          <div className="card-hd-r">
            <button
              onClick={() => setChatLog([{ sender: 'system', text: 'Riwayat obrolan direset.' }])}
              className="btn ghost xs">
              <span className="ic s">refresh</span> Reset Chat
            </button>
          </div>
        </div>

        {/* QUICK QUESTION PILLS (FROM DIAGRAM) */}
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--t3)', alignSelf: 'center' }}>Pertanyaan Cepat:</span>
          {[
            'Cek posisi antrean saya No RM RM-2026-0441',
            'Berapa tarif USG 4D dan Rontgen Thorax?',
            'Biaya operasi laser wasir dan persyaratannya?',
            'Apa syarat berkas & biaya tes narkoba 6P serta MMPI?',
            'Apakah surat keterangan tidak mampu masih berlaku untuk non-BPJS?',
            'Resep obat saya RM-2026-0441 sudah bisa diambil?'
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleTestInSimulator(prompt)}
              className="btn ghost xs"
              style={{ borderRadius: '14px', fontSize: '11px', padding: '3px 10px' }}>
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* CHAT DISPLAY BOX */}
        <div style={{
          height: '240px', overflowY: 'auto', background: '#f8fafc',
          borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
          padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          {chatLog.map((c, cIdx) => (
            <div key={cIdx} style={{
              display: 'flex',
              justifyContent: c.sender === 'patient' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start'
            }}>
              {c.sender === 'bot' && (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, marginRight: '8px', flexShrink: 0
                }}>
                  AI
                </div>
              )}

              {c.sender === 'system' ? (
                <div style={{ width: '100%', textAlign: 'center', fontSize: '11px', color: 'var(--t3)', fontStyle: 'italic' }}>
                  {c.text}
                </div>
              ) : (
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: c.sender === 'patient' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: c.sender === 'patient' ? '#2563eb' : '#ffffff',
                  color: c.sender === 'patient' ? '#ffffff' : 'var(--t1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  border: c.sender === 'patient' ? 'none' : '1px solid #e2e8f0',
                  fontSize: '12.5px', lineHeight: '1.5', whiteSpace: 'pre-line'
                }}>
                  {c.text}
                  {c.time && (
                    <div style={{
                      fontSize: '9px', marginTop: '4px', textAlign: 'right',
                      color: c.sender === 'patient' ? 'rgba(255,255,255,0.8)' : 'var(--t3)'
                    }}>
                      {c.time}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isAiThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t3)', fontSize: '11px', fontStyle: 'italic' }}>
              <span className="ic s" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
              Sinteta AI sedang mencari data di SIMRS RSUD Daya...
            </div>
          )}
        </div>

        {/* CHAT INPUT FORM */}
        <form
          onSubmit={e => { e.preventDefault(); handleSendSimulation(); }}
          style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Ketik pertanyaan pasien (misal: Cek antrean saya RM-2026-0441)..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            style={{
              flex: 1, padding: '9px 14px', borderRadius: '8px',
              border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '13px'
            }}
          />
          <button type="submit" className="btn pri sm" style={{ background: '#2563eb' }}>
            <span className="ic s">send</span> Kirim Pertanyaan
          </button>
        </form>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
       * MODAL CUSTOMER FACING (TAMPILAN TERBUKA UNTUK PASIEN / PORTAL MANDIRI)
       * ═════════════════════════════════════════════════════════════════════*/}
      {selectedCustomerFacingPatient && (() => {
        const p = selectedCustomerFacingPatient;
        const curNum = parseInt(p.currentServingNo.split('-')[1], 10);
        const myNum = parseInt(p.ticketNo.split('-')[1], 10);
        const remaining = Math.max(0, myNum - curNum);
        const estWaitMins = remaining * p.avgMinsPerPerson;
        const isNow = remaining === 0;
        const isNext = remaining <= 2 && remaining > 0;

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(6px)'
          }}>
            {/* SMARTPHONE DEVICE WRAPPER FRAME */}
            <div style={{
              background: '#ffffff', borderRadius: '28px', width: '100%', maxWidth: '440px',
              height: '92vh', maxHeight: '820px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '8px solid #0f172a',
              position: 'relative'
            }}>
              {/* SMARTPHONE TOP NOTCH / SPEAKER */}
              <div style={{
                height: '24px', background: '#0f172a', display: 'flex',
                justifyContent: 'center', alignItems: 'center'
              }}>
                <div style={{ width: '60px', height: '4px', background: '#334155', borderRadius: '2px' }} />
              </div>

              {/* CUSTOMER PORTAL APP HEADER */}
              <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                color: '#fff', padding: '16px 20px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontWeight: 900, fontSize: '18px'
                  }}>
                    🏥
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>RSUD DAYA MAKASSAR</div>
                    <div style={{ fontSize: '11px', color: '#bfdbfe' }}>Portal Pelacak Antrean Pasien</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomerFacingPatient(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Tutup Pratinjau Layar Pasien">
                  ✕
                </button>
              </div>

              {/* PORTAL SCROLLABLE CONTENT */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8fafc' }}>
                
                {/* PATIENT IDENTITY CARD */}
                <div style={{
                  background: '#ffffff', borderRadius: '14px', padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{p.name}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8' }}>
                      {p.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>
                    No. Rekam Medis: {p.rm}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    🗓️ Kunjungan: Hari ini, 16 Sep 2026 · {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {p.age} Tahun
                  </div>
                </div>

                {/* BIG DIGITAL TICKET CARD */}
                <div style={{
                  background: isNow
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : isNext
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#ffffff', borderRadius: '18px', padding: '20px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', textAlign: 'center', position: 'relative'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
                    NOMOR ANTREAN ANDA
                  </div>
                  <div style={{
                    fontSize: '44px', fontWeight: 900, fontFamily: 'monospace',
                    letterSpacing: '2px', margin: '4px 0 8px 0'
                  }}>
                    {p.ticketNo}
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 14px',
                    display: 'flex', justifyContent: 'space-around', alignItems: 'center', backdropFilter: 'blur(4px)'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>SEDANG DIPANGGIL</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace' }}>{p.currentServingNo}</div>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>SISA DI DEPAN</div>
                      <div style={{ fontSize: '20px', fontWeight: 800 }}>{remaining} Orang</div>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>ESTIMASI</div>
                      <div style={{ fontSize: '17px', fontWeight: 800 }}>~{estWaitMins} Mnt</div>
                    </div>
                  </div>

                  {/* ALERT CALLOUT */}
                  <div style={{
                    marginTop: '12px', padding: '8px 12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)', fontSize: '11.5px', fontWeight: 600, lineHeight: '1.4'
                  }}>
                    {isNow
                      ? '🔔 GILIRAN ANDA! Silakan masuk sekarang ke Ruang Periksa dokter.'
                      : isNext
                      ? '⚡ SEGERA BERSIAP! Tinggal 2 nomor lagi di depan Anda. Harap duduk di depan pintu poli.'
                      : '⏳ Antrean masih berjalan. Anda dapat beristirahat di ruang tunggu utama.'}
                  </div>
                </div>

                {/* DOCTOR & ROOM INFO */}
                <div style={{
                  background: '#ffffff', borderRadius: '14px', padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    LOKASI &amp; DOKTER POLIKLINIK
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e40af' }}>{p.poliName}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    👨‍⚕️ {p.doctorName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 700, marginTop: '4px' }}>
                    📍 {p.room}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Petunjuk: Masuk melalui selasar Poliklinik Lantai 1, sebelah kanan lift rawat jalan.
                  </div>
                </div>

                {/* MULTI-QUEUE JOURNEY STEPPER */}
                <div style={{
                  background: '#ffffff', borderRadius: '14px', padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍</span> PERJALANAN ANTREAN HARI INI
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                    {p.stages.map((st, idx) => {
                      const isDone = st.status === 'COMPLETED';
                      const isAct = st.status === 'IN_PROGRESS';

                      return (
                        <div key={st.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            background: isDone ? '#10b981' : isAct ? '#2563eb' : '#e2e8f0',
                            color: isDone || isAct ? '#ffffff' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 800, flexShrink: 0
                          }}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: isAct ? '#2563eb' : '#0f172a' }}>
                                {st.label}
                              </span>
                              <span style={{ fontSize: '10px', color: isAct ? '#2563eb' : '#64748b', fontWeight: isAct ? 700 : 500 }}>
                                {st.time}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {st.detail}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TEST CHIME SOUND & ADVANCE CONTROLS */}
                <div style={{
                  background: '#f1f5f9', borderRadius: '14px', padding: '12px 14px',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                    SIMULASI &amp; PENGUJIAN FITUR (ADMIN/STAF RS):
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={playHospitalChime}
                      className="btn pri sm"
                      style={{ flex: 1, background: '#2563eb', fontSize: '11px' }}>
                      <span className="ic s">volume_up</span> Uji Lonceng Panggilan
                    </button>
                    <button
                      onClick={() => handleAdvanceQueue(p.id)}
                      disabled={isNow}
                      className="btn ghost sm"
                      style={{ flex: 1, background: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px' }}>
                      <span className="ic s">fast_forward</span> Majukan Antrean (+1)
                    </button>
                  </div>
                </div>

              </div>

              {/* PHONE BOTTOM BAR */}
              <div style={{
                padding: '10px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'center'
              }}>
                <div style={{ width: '120px', height: '4px', background: '#0f172a', borderRadius: '2px' }} />
              </div>

            </div>
          </div>
        );
      })()}

      {/* ═════════════════════════════════════════════════════════════════════
       * MODAL FAQ: KEBIJAKAN SKTM NON-BPJS
       * ═════════════════════════════════════════════════════════════════════*/}
      {showFaqModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--srf)', borderRadius: '14px', width: '100%', maxWidth: '580px',
            boxShadow: 'var(--sh3)', border: '1px solid var(--line)', overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--line)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic" style={{ color: '#f59e0b' }}>help_center</span>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Kebijakan Surat Keterangan Tidak Mampu (SKTM) Non-BPJS</div>
              </div>
              <button onClick={() => setShowFaqModal(false)} className="btn ghost xs" style={{ border: 'none' }}>
                <span className="ic s">close</span>
              </button>
            </div>

            <div style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--t2)' }}>
              <div style={{ background: '#fef3c7', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fcd34d', color: '#92400e', marginBottom: '14px', fontWeight: 600 }}>
                💡 Pertanyaan Pasien: "Apakah masih berlaku keterangan tidak mampu untuk yang tidak punya BPJS?"
              </div>

              <p style={{ margin: '0 0 10px 0' }}>
                <b>Jawaban Resmi RSUD Daya Kota Makassar:</b><br />
                Ya, skema <b>Surat Keterangan Tidak Mampu (SKTM) / Jamkesda Kota Makassar</b> masih tetap berlaku bagi warga Kota Makassar yang belum memiliki kepesertaan BPJS Kesehatan aktif dan memenuhi kriteria keluarga prasejahtera.
              </p>

              <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: '6px' }}>Persyaratan Berkas:</div>
              <ul style={{ margin: '0 0 14px 0', paddingLeft: '20px' }}>
                <li>Surat Keterangan Tidak Mampu (SKTM) asli dari Kelurahan setempat yang telah diverifikasi oleh Dinas Sosial Kota Makassar.</li>
                <li>Fotokopi KTP Kota Makassar dan Kartu Keluarga (KK) Kota Makassar (masing-masing 3 lembar).</li>
                <li>Surat Pengantar Rujukan dari Puskesmas wilayah domisili (kecuali pasien gawat darurat di Instalasi Gawat Darurat / IGD).</li>
              </ul>

              <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: '6px' }}>Alur Verifikasi:</div>
              <p style={{ margin: 0 }}>
                Pasien atau keluarga melapor ke <b>Loket Pelayanan Yanmas / Humas RSUD Daya (Lantai 1)</b> maksimal 3x24 jam hari kerja sejak pasien masuk perawatan untuk proses verifikasi jaminan daerah.
              </p>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', background: 'var(--srf2)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowFaqModal(false)} className="btn pri sm" style={{ background: '#2563eb' }}>
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
