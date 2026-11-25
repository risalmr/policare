/* ─────────────────────────────────────────────────────────────────────────────
 * bpjsClaimGuardData.js
 * Comprehensive Data Repository for BPJS Claim Integrity & Fraud Pre-Audit Engine
 * Based on Permenkes No. 16/2019, Permenkes No. 26/2021, and BAKB Kemenkes-BPJS
 * ─────────────────────────────────────────────────────────────────────────────*/

export const initialClaimsData = [
  {
    id: 'SEP-2026-08821',
    sepNumber: '0192R0010826V008821',
    patientName: 'Ny. Sinta Pertiwi',
    mrNo: 'RM-77412',
    dept: 'Kebidanan (Rawat Inap)',
    doctor: 'dr. Hendra Sp.OG',
    admissionDate: '2026-08-10',
    dischargeDate: '2026-08-13',
    los: '3 Hari',
    primaryDiagnosis: {
      icd10: 'O14.1',
      name: 'Severe Pre-eclampsia (Preeklamsia Berat - PEB)',
      suggestedIcd: 'O14.0',
      suggestedName: 'Mild to Moderate Pre-eclampsia (PER)'
    },
    secondaryDiagnoses: [
      { icd10: 'Z37.0', name: 'Single Live Birth' }
    ],
    procedures: [
      { icd9: '73.59', name: 'Manually Assisted Delivery' }
    ],
    inaCbgCode: 'O-6-10-II',
    inaCbgName: 'Persalinan Vaginal dengan Komplikasi Berat',
    tariff: 6850000,
    correctedTariff: 4920000,
    risk: 'high',
    riskLabel: '🚨 High Risk Fraud (Upcoding)',
    anomalyCategory: 'UPCODING',
    anomalyTitle: 'Upcoding Severity Level Diagnosis Utama',
    issueDetail: 'Koder menginput O14.1 (PEB) yang masuk Severity II. Namun data rekam medis menunjukkan TTV TD: 135/85 mmHg dan Hasil Lab Proteinuria: Negatif (0 mg/dL). Kriteria diagnosis PEB (TD >= 160/110 atau Proteinuria >= 2+) tidak terpenuhi.',
    recommendation: 'Turunkan diagnosis utama ke O14.0 (Preeklamsia Ringan) atau lampirkan lembar lab ulangan proteinuria positif sebelum submit.',
    soapNoteSummary: 'Pasien G2P1A0 hamil 38 minggu mengeluh pusing ringan. TTV: TD 135/85 mmHg, Nadi 84x/m, RR 18x/m, Suhu 36.6 C. DJJ 142x/m. Urin rutin: Proteinuria (-). Partus spontan pervaginam.',
    vitals: { td: '135/85 mmHg', hr: '84 x/mnt', rr: '18 x/mnt', temp: '36.6 °C' },
    labResults: [
      { test: 'Proteinuria Kualitatif', result: 'Negatif (-)', normal: 'Negatif (-)', status: 'normal' },
      { test: 'Hemoglobin (Hb)', result: '11.8 g/dL', normal: '11.0 - 15.0 g/dL', status: 'normal' },
      { test: 'Trombosit', result: '240.000 /uL', normal: '150.000 - 450.000', status: 'normal' }
    ],
    mandatoryDocs: [
      { name: 'Resume Medis Lengkap Bertanda Tangan DPJP', status: 'valid' },
      { name: 'Lembar Partograf & Catatan Persalinan', status: 'valid' },
      { name: 'Hasil Laboratorium Proteinuria Valid', status: 'invalid', note: 'Hasil lab tidak mendukung O14.1' },
      { name: 'Surat Eligibilitas Peserta (SEP)', status: 'valid' }
    ],
    status: 'Flagged Pre-Audit'
  },
  {
    id: 'SEP-2026-08845',
    sepNumber: '0192R0010826V008845',
    patientName: 'By. Ny. Rahmawati',
    mrNo: 'RM-77490',
    dept: 'Perinatologi / NICU',
    doctor: 'dr. Maya Sp.A(K)',
    admissionDate: '2026-08-08',
    dischargeDate: '2026-08-15',
    los: '7 Hari',
    primaryDiagnosis: {
      icd10: 'P22.0',
      name: 'Respiratory Distress Syndrome of Newborn',
      suggestedIcd: 'P22.0',
      suggestedName: 'Respiratory Distress Syndrome of Newborn'
    },
    secondaryDiagnoses: [
      { icd10: 'P07.3', name: 'Preterm Newborn 34 Weeks' }
    ],
    procedures: [
      { icd9: '93.96', name: 'Continuous Positive Airway Pressure (CPAP)' }
    ],
    inaCbgCode: 'P-8-08-III',
    inaCbgName: 'Neonatus dengan Gangguan Pernapasan Berat (Tier III)',
    tariff: 14200000,
    correctedTariff: 14200000,
    risk: 'high',
    riskLabel: '🚨 High Risk Fraud (Unbundling)',
    anomalyCategory: 'UNBUNDLING',
    anomalyTitle: 'Unbundling Tagihan Penunjang dalam Paket INA-CBG',
    issueDetail: 'Sistem billing SIMRS menerbitkan tagihan mandiri terpisah #BILL-LAB-9921 untuk Analisa Gas Darah (AGD) harian sebesar Rp 1.850.000 di luar paket INA-CBG P-8-08-III yang seharusnya sudah inklusif.',
    recommendation: 'Hapus penagihan sekunder item lab AGD terpisah dan konsolidasikan seluruh rincian biaya ke dalam satu bundel tarif INA-CBG.',
    soapNoteSummary: 'Bayi lahir prematur 34 minggu merintih dan retraksi dinding dada (+). Terpasang bubble CPAP PEEP 6 FiO2 30%. Evaluasi serial AGD menunjukkan asidosis respiratorik terkompensasi.',
    vitals: { td: '65/40 mmHg', hr: '148 x/mnt', rr: '58 x/mnt', temp: '36.8 °C' },
    labResults: [
      { test: 'Analisa Gas Darah (pH)', result: '7.32', normal: '7.35 - 7.45', status: 'abnormal' },
      { test: 'pCO2', result: '49 mmHg', normal: '35 - 45 mmHg', status: 'abnormal' },
      { test: 'pO2', result: '78 mmHg', normal: '80 - 100 mmHg', status: 'abnormal' }
    ],
    mandatoryDocs: [
      { name: 'Resume Medis & Lembar Monitoring NICU', status: 'valid' },
      { name: 'Lembar Bukti Pemasangan CPAP / Ventilasi', status: 'valid' },
      { name: 'Kwitansi Billing Tunggal INA-CBG', status: 'invalid', note: 'Terdeteksi 1 billing terpisah unbundled' },
      { name: 'SEP Bayi', status: 'valid' }
    ],
    status: 'Flagged Pre-Audit'
  },
  {
    id: 'SEP-2026-08912',
    sepNumber: '0192R0010826V008912',
    patientName: 'Tn. Hendra Wijaya',
    mrNo: 'RM-76210',
    dept: 'Penyakit Dalam (Rawat Inap)',
    doctor: 'dr. Bambang Sp.PD',
    admissionDate: '2026-08-11',
    dischargeDate: '2026-08-14',
    los: '3 Hari',
    primaryDiagnosis: {
      icd10: 'E11.5',
      name: 'Type 2 Diabetes Mellitus with Peripheral Vascular Complications',
      suggestedIcd: 'E11.5',
      suggestedName: 'Type 2 Diabetes Mellitus with Peripheral Vascular Complications'
    },
    secondaryDiagnoses: [
      { icd10: 'I10', name: 'Essential Hypertension' },
      { icd10: 'E87.7', name: 'Fluid Overload / Edema' }
    ],
    procedures: [
      { icd9: '99.04', name: 'Transfusion of Packed Cells' }
    ],
    inaCbgCode: 'E-4-10-I',
    inaCbgName: 'Diabetes Mellitus Tanpa Komplikasi Berat',
    tariff: 4500000,
    correctedTariff: 4500000,
    risk: 'medium',
    riskLabel: '⚠️ Dispute Risk (Evidence Gap)',
    anomalyCategory: 'EVIDENCE_GAP',
    anomalyTitle: 'Restriksi Fornas: Lampiran Bukti Serum Albumin Belum Ada',
    issueDetail: 'Tercatat pemberian obat restriksi khusus Albumin Human 20% 100 mL senilai Rp 1.450.000, namun tidak terlampir bukti hasil pemeriksaan laboratorium kadar serum Albumin < 2.5 g/dL yang merupakan syarat mutlak klaim BPJS.',
    recommendation: 'Unggah hasil laboratorium serum albumin pasien tanggal 11 Agustus 2026 atau konfirmasi koder untuk menghapus klaim obat restriksi jika tidak ada bukti.',
    soapNoteSummary: 'Pasien DM dengan ulkus pedis dan edema tungkai bilateral. Albumin serum klinis dicurigai rendah. Diberikan infus Albumin 20% 1 kolf.',
    vitals: { td: '140/90 mmHg', hr: '88 x/mnt', rr: '20 x/mnt', temp: '37.1 °C' },
    labResults: [
      { test: 'Gula Darah Sewaktu (GDS)', result: '245 mg/dL', normal: '< 140 mg/dL', status: 'abnormal' },
      { test: 'Serum Albumin', result: 'Belum Terlampir', normal: '3.5 - 5.2 g/dL', status: 'missing' },
      { test: 'HbA1c', result: '8.4 %', normal: '< 6.5 %', status: 'abnormal' }
    ],
    mandatoryDocs: [
      { name: 'Resume Medis Rawat Inap', status: 'valid' },
      { name: 'Catatan Pemberian Obat Restriksi (CPPT)', status: 'valid' },
      { name: 'Hasil Lab Serum Albumin (< 2.5 g/dL)', status: 'invalid', note: 'Dokumen belum diunggah' },
      { name: 'SEP Terverifikasi', status: 'valid' }
    ],
    status: 'Pending Evidence'
  },
  {
    id: 'SEP-2026-08950',
    sepNumber: '0192R0010826V008950',
    patientName: 'Ny. Dewinta Sari',
    mrNo: 'RM-78102',
    dept: 'Kebidanan & Kandungan',
    doctor: 'dr. Hendra Sp.OG',
    admissionDate: '2026-08-12',
    dischargeDate: '2026-08-16',
    los: '4 Hari',
    primaryDiagnosis: {
      icd10: 'T81.4',
      name: 'Infection following a procedure / Surgical Site Infection',
      suggestedIcd: 'T81.4',
      suggestedName: 'Infection following a procedure'
    },
    secondaryDiagnoses: [
      { icd10: 'O82.0', name: 'Delivery by Elective Caesarean Section (Previous)' }
    ],
    procedures: [
      { icd9: '86.22', name: 'Excisional Debridement of Wound' }
    ],
    inaCbgCode: 'T-4-12-I',
    inaCbgName: 'Infeksi Pasca Tindakan Bedah Ringan',
    tariff: 7800000,
    correctedTariff: 7800000,
    risk: 'medium',
    riskLabel: '⚠️ Dispute Risk (Readmission)',
    anomalyCategory: 'READMISSION',
    anomalyTitle: 'Readmisi Pasien Rawat Inap < 7 Hari Pasca KRS SC',
    issueDetail: 'Pasien baru KRS pasca Sectio Caesarea tanggal 8 Agustus 2026 dan kembali dirawat inap tanggal 12 Agustus 2026 (interval 4 hari). Berkas rawan dispute audit klaim readmisi tanpa Surat Justifikasi Medis Terpisah dari DPJP.',
    recommendation: 'Lampirkan Surat Justifikasi Medis DPJP yang menerangkan bahwa readmisi disebabkan oleh infeksi sekunder akut tak terduga pasca operasi, bukan karena premature discharge.',
    soapNoteSummary: 'Pasien post SC hari ke-6 datang dengan luka operasi basah berbau dan demam 38.4 C. Dilakukan wound toilet dan debridement superficial.',
    vitals: { td: '120/80 mmHg', hr: '96 x/mnt', rr: '20 x/mnt', temp: '38.4 °C' },
    labResults: [
      { test: 'Leukosit', result: '16.400 /uL', normal: '4.000 - 10.000 /uL', status: 'abnormal' },
      { test: 'CRP Kuantitatif', result: '48 mg/L', normal: '< 5 mg/L', status: 'abnormal' }
    ],
    mandatoryDocs: [
      { name: 'Resume Medis Rawat Inap Sekarang', status: 'valid' },
      { name: 'Resume Medis Rawat Inap Sebelumnya (8 Agt)', status: 'valid' },
      { name: 'Surat Justifikasi Medis Readmisi DPJP', status: 'invalid', note: 'Belum ada surat justifikasi komplikasi' },
      { name: 'Laporan Tindakan Wound Debridement', status: 'valid' }
    ],
    status: 'Pending Justification'
  },
  {
    id: 'SEP-2026-08978',
    sepNumber: '0192R0010826V008978',
    patientName: 'Tn. Rudi Gunawan',
    mrNo: 'RM-75890',
    dept: 'Jantung & Pembuluh Darah',
    doctor: 'dr. Faisal Sp.JP(K)',
    admissionDate: '2026-08-11',
    dischargeDate: '2026-08-15',
    los: '4 Hari',
    primaryDiagnosis: {
      icd10: 'I21.0',
      name: 'Acute Transmural Myocardial Infarction of Anterior Wall (STEMI)',
      suggestedIcd: 'I20.0',
      suggestedName: 'Unstable Angina Pectoris (UAP)'
    },
    secondaryDiagnoses: [
      { icd10: 'I25.1', name: 'Atherosclerotic Heart Disease' }
    ],
    procedures: [
      { icd9: '88.56', name: 'Coronary Arteriography' }
    ],
    inaCbgCode: 'I-4-10-III',
    inaCbgName: 'Infark Miokard Akut dengan Prosedur Invasif (Tier III)',
    tariff: 22400000,
    correctedTariff: 14800000,
    risk: 'high',
    riskLabel: '🚨 High Risk Fraud (Evidence Gap & Upcoding)',
    anomalyCategory: 'EVIDENCE_GAP',
    anomalyTitle: 'Diagnosis STEMI Tanpa Bukti ST Elevasi EKG & Troponin Positif',
    issueDetail: 'Koder memasukkan I21.0 (STEMI Anterior), namun lembar EKG yang diunggah menunjukkan ST Depresi 1mm di lead V4-V6 (Gambaran NSTEMI/UAP), serta hasil Troponin I kuantitatif belum dilampirkan.',
    recommendation: 'Lampirkan lembar EKG 12-lead serial dan hasil lab Troponin I atau sesuaikan kode diagnosis ke I20.0 / I21.4 (NSTEMI).',
    soapNoteSummary: 'Nyeri dada tipikal substernal tembus ke punggung > 30 menit. EKG menunjukkan depresi segmen ST V4-V6. Terapi aspilet, clopidogrel, dan fondaparinux dimulai.',
    vitals: { td: '150/95 mmHg', hr: '92 x/mnt', rr: '22 x/mnt', temp: '36.7 °C' },
    labResults: [
      { test: 'Troponin I Kuantitatif', result: 'Belum Terlampir', normal: '< 0.04 ng/mL', status: 'missing' },
      { test: 'CK-MB', result: '32 U/L', normal: '< 25 U/L', status: 'abnormal' }
    ],
    mandatoryDocs: [
      { name: 'Resume Medis Kardiovaskular', status: 'valid' },
      { name: 'Lembar EKG 12 Lead Awal & Serial', status: 'valid' },
      { name: 'Hasil Lab Enzim Jantung (Troponin I / T)', status: 'invalid', note: 'Hasil lab tidak terunggah di berkas EMR' },
      { name: 'Laporan Angiografi Koroner', status: 'valid' }
    ],
    status: 'Flagged Pre-Audit'
  },
  {
    id: 'SEP-2026-09001',
    sepNumber: '0192R0010826V009001',
    patientName: 'An. Rizky Pratama',
    mrNo: 'RM-79331',
    dept: 'Anak (Rawat Jalan)',
    doctor: 'dr. Ratna Sp.A',
    admissionDate: '2026-08-16',
    dischargeDate: '2026-08-16',
    los: 'Rawat Jalan (0 Hari)',
    primaryDiagnosis: {
      icd10: 'J45.9',
      name: 'Asthma, Unspecified',
      suggestedIcd: 'J45.9',
      suggestedName: 'Asthma, Unspecified'
    },
    secondaryDiagnoses: [],
    procedures: [
      { icd9: '93.94', name: 'Respiratory Medication Administered by Nebulizer' }
    ],
    inaCbgCode: 'Q-5-34-TP',
    inaCbgName: 'Konsultasi & Prosedur Terapi Inhalasi Poliklinik',
    tariff: 285000,
    correctedTariff: 285000,
    risk: 'clear',
    riskLabel: '🟢 Clear & Safe to Submit',
    anomalyCategory: 'NONE',
    anomalyTitle: 'Tidak Ada Anomali Ditemukan',
    issueDetail: 'Semua berkas lengkap 100%. Resume rawat jalan, resep nebulisasi, bukti tindakan, dan SEP terverifikasi sinkron.',
    recommendation: 'Berkas aman dan siap dikirim ke V-Klaim BPJS Kesehatan.',
    soapNoteSummary: 'Batuk dan sesak napas. Auskultasi wheezing (+/+). Telah diberikan inhalasi Salbutamol 1 respule + NaCl 0.9%. Wheezing berkurang drastis.',
    vitals: { td: '100/65 mmHg', hr: '98 x/mnt', rr: '24 x/mnt', temp: '36.5 °C' },
    labResults: [],
    mandatoryDocs: [
      { name: 'Lembar Poliklinik Rawat Jalan', status: 'valid' },
      { name: 'Lembar Bukti Tindakan Nebulisasi', status: 'valid' },
      { name: 'SEP Terverifikasi', status: 'valid' }
    ],
    status: 'Cleared Pre-Audit'
  },
  {
    id: 'SEP-2026-09015',
    sepNumber: '0192R0010826V009015',
    patientName: 'Ny. Halimah Binti Syamsul',
    mrNo: 'RM-74119',
    dept: 'Bedah Umum (Rawat Inap)',
    doctor: 'dr. Gunawan Sp.B',
    admissionDate: '2026-08-09',
    dischargeDate: '2026-08-12',
    los: '3 Hari',
    primaryDiagnosis: {
      icd10: 'K35.8',
      name: 'Acute Appendicitis, Other and Unspecified',
      suggestedIcd: 'K35.8',
      suggestedName: 'Acute Appendicitis'
    },
    secondaryDiagnoses: [],
    procedures: [
      { icd9: '47.09', name: 'Other Appendectomy (Laparoscopic / Open)' }
    ],
    inaCbgCode: 'K-1-10-I',
    inaCbgName: 'Apendiktomi Ringan Tanpa Komplikasi',
    tariff: 8900000,
    correctedTariff: 8900000,
    risk: 'clear',
    riskLabel: '🟢 Clear & Safe to Submit',
    anomalyCategory: 'NONE',
    anomalyTitle: 'Tidak Ada Anomali Ditemukan',
    issueDetail: 'Laporan operasi apendiktomi lengkap, bukti patologi anatomi terlampir, dan resume medis valid dengan tanda tangan DPJP.',
    recommendation: 'Berkas siap disubmit ke V-Klaim.',
    soapNoteSummary: 'Nyeri perut kanan bawah McBurney sign (+). Telah dilakukan open apendiktomi. Temuan intraoperasi: apendiks hiperemis udematous non-perforasi.',
    vitals: { td: '120/75 mmHg', hr: '80 x/mnt', rr: '18 x/mnt', temp: '36.8 °C' },
    labResults: [
      { test: 'Leukosit', result: '13.200 /uL', normal: '4.000 - 10.000 /uL', status: 'abnormal' },
      { test: 'Hasil PA Apendiks', result: 'Appendicitis Akut Katarrhalis', normal: 'Normal', status: 'normal' }
    ],
    mandatoryDocs: [
      { name: 'Resume Medis Rawat Inap', status: 'valid' },
      { name: 'Laporan Operasi Apendiktomi Lengkap', status: 'valid' },
      { name: 'Hasil Pemeriksaan Patologi Anatomi (PA)', status: 'valid' },
      { name: 'SEP Rawat Inap', status: 'valid' }
    ],
    status: 'Cleared Pre-Audit'
  }
];

export const anomalyPatternsData = [
  {
    id: 'pat-1',
    category: 'UPCODING',
    title: '1. Upcoding Severity Level & Overcoding Diagnosis',
    regulationRef: 'Permenkes No. 16/2019 Pasal 6 Ayat 1 (a) & Permenkes 26/2021',
    flaggedCount: 14,
    disputeLossRisk: 'Rp 94.600.000',
    color: '#ef4444',
    description: 'Pengkodean ICD-10 pada tingkat keparahan (Severity Tier II/III) yang lebih tinggi tanpa didukung bukti klinis objektif di rekam medis.',
    examples: [
      'Mengklaim Preeklamsia Berat (O14.1) padahal TD < 140/90 dan Proteinuria negatif.',
      'Mengklaim Sepsis Berat (A41.9) padahal hanya febris bakterial tanpa bukti kriteria SIRS / Syok.',
      'Mengklaim Stroke Hemoragik (I61.9) padahal hasil CT Scan kepala non-kontras menunjukkan Infark Iskemik.'
    ],
    aiDetectionLogic: 'Sinteta memvalidasi kode ICD-10 terhadap nilai TTV (tekanan darah, MAP, SpO2), hasil laboratorium kritis, dan narasi CPPT Dokter.'
  },
  {
    id: 'pat-2',
    category: 'UNBUNDLING',
    title: '2. Unbundling & Fragmentasi Tagihan INA-CBG',
    regulationRef: 'Permenkes No. 16/2019 Pasal 6 Ayat 1 (c) & Pedoman INA-CBG',
    flaggedCount: 8,
    disputeLossRisk: 'Rp 54.800.000',
    color: '#f59e0b',
    description: 'Memisahkan penagihan paket tarif INA-CBG menjadi billing mandiri terpisah untuk pemeriksaan penunjang (lab/radiologi) atau obat rawat inap.',
    examples: [
      'Menagihkan Analisa Gas Darah (AGD) harian terpisah pada pasien NICU paket CPAP/Ventilator.',
      'Menagihkan alat medis disposabel / kasa hemostatik terpisah pada paket tindakan bedah.',
      'Memecah episode rawat jalan kontrol luka pasca operasi menjadi tagihan poli baru.'
    ],
    aiDetectionLogic: 'Sinteta mendeteksi nomor transaksi billing SIMRS yang terjadi dalam rentang tanggal rawat inap yang sama dengan SEP INA-CBG.'
  },
  {
    id: 'pat-3',
    category: 'EVIDENCE_GAP',
    title: '3. Clinical Evidence & Mandatory Document Gap',
    regulationRef: 'Berita Acara Kesepakatan Bersama (BAKB) Kemenkes & BPJS',
    flaggedCount: 11,
    disputeLossRisk: 'Rp 48.200.000',
    color: '#2563eb',
    description: 'Klaim obat restriksi Fornas mahal atau tindakan intervensi khusus yang tidak melampirkan berkas bukti pendukung wajib.',
    examples: [
      'Penagihan Albumin 20% tanpa lampiran hasil lab serum albumin < 2.5 g/dL.',
      'Penagihan Eritropoietin (EPO) pada pasien CKD HD tanpa bukti Hb < 8 g/dL.',
      'Klaim tindakan PTCA / Pasang Stent Jantung tanpa lampiran rekaman hasil Cath Lab.'
    ],
    aiDetectionLogic: 'Sinteta melakukan audit checklist dokumen otomatis terhadap berkas digital EMR sebelum berkas diserahkan ke verifikator BPJS.'
  },
  {
    id: 'pat-4',
    category: 'READMISSION',
    title: '4. Readmission Anomaly (< 7 & < 30 Hari)',
    regulationRef: 'Panduan Praktis Verifikasi Klaim BPJS Kesehatan',
    flaggedCount: 5,
    disputeLossRisk: 'Rp 22.400.000',
    color: '#8b5cf6',
    description: 'Pasien rawat inap yang masuk kembali dalam interval pendek (< 7 hari pasca KRS) dengan diagnosis utama terkait.',
    examples: [
      'Masuk rawat inap ulang hari ke-4 post SC dengan infeksi luka tanpa Surat Justifikasi Komplikasi.',
      'Pasien gagal jantung kongestif (CHF) dipulangkan 1 hari kemudian masuk kembali dengan sesak berat.'
    ],
    aiDetectionLogic: 'Sinteta melacak riwayat nomor rekam medis (MRN) lintas episode dan mendeteksi selisih hari discharge-to-admission.'
  },
  {
    id: 'pat-5',
    category: 'LOS_OUTLIER',
    title: '5. Inappropriate Length of Stay (LOS) & Prosedur Batal',
    regulationRef: 'Permenkes No. 26/2021 & Standar Clinical Pathway RS',
    flaggedCount: 4,
    disputeLossRisk: 'Rp 18.500.000',
    color: '#10b981',
    description: 'Perpanjangan hari rawat (LOS) tanpa indikasi klinis medis atau menagihkan prosedur bedah yang dibatalkan di ruang operasi.',
    examples: [
      'Pasien partus normal dirawat hingga hari ke-5 tanpa catatan medis komplikasi nifas.',
      'Klaim tindakan laparotomi penuh padahal operasi dibatalkan pasca induksi anestesi karena cardiac arrest.'
    ],
    aiDetectionLogic: 'Sinteta membandingkan LOS aktual dengan Clinical Pathway serta memvalidasi laporan operasi definitif.'
  }
];

export const regulationRulesData = [
  {
    id: 'RULE-PERMENKES-16',
    regTitle: 'Permenkes RI No. 16 Tahun 2019',
    subtitle: 'Pencegahan dan Penanganan Kecurangan (Fraud) dalam Program Jaminan Kesehatan',
    articles: [
      'Pasal 4: Fasyankes wajib membangun Sistem Pencegahan Fraud internal.',
      'Pasal 6: Larangan Upcoding, Phantom Billing, Unbundling, dan Readmisi yang disengaja.',
      'Pasal 10: Sanksi pengembalian kelebihan klaim serta denda administratif investigatif.'
    ],
    activeStatus: true,
    engineChecklistCount: 24
  },
  {
    id: 'RULE-PERMENKES-26',
    regTitle: 'Permenkes RI No. 26 Tahun 2021',
    subtitle: 'Pedoman Pencegahan Kecurangan dan Penanganan Dispute Klaim JKN',
    articles: [
      'Pedoman verifikasi kepatuhan koding ICD-10 (Rules MB1 s/d MB5).',
      'Standar pembuktian klinis untuk severity level II dan III.',
      'Ketentuan justifikasi medis tertulis DPJP untuk kasus readmisi < 30 hari.'
    ],
    activeStatus: true,
    engineChecklistCount: 18
  },
  {
    id: 'RULE-BAKB-2024',
    regTitle: 'Berita Acara Kesepakatan Bersama (BAKB) Kemenkes - BPJS',
    subtitle: 'Resolusi Dispute Klaim Nasional & Restriksi Fornas',
    articles: [
      'Pemberian Albumin 20%: Wajib melampirkan hasil lab Albumin < 2.5 g/dL atau ascites masif.',
      'Pemberian Injeksi Antibiotik Lini 3 (Meropenem): Wajib hasil kultur resistensi kuman.',
      'Klaim SC Elektif (O82.0): Wajib indikasi medis panggul sempit / CPD / riwayat SC 2x.'
    ],
    activeStatus: true,
    engineChecklistCount: 32
  }
];

export const claimAnalyticsSummary = {
  totalClaimsReady: 1420,
  totalClaimsRupiah: 'Rp 4.250.000.000',
  healthIndex: 96.8,
  cleanSafeCount: 1386,
  flaggedCount: 34,
  potentialPenaltyPrevented: 'Rp 238.500.000',
  disputeRatioCurrent: '0.6%',
  disputeRatioBefore: '18.4%',
  byDepartmentRisk: [
    { dept: 'Kebidanan & Kandungan', claims: 340, flagged: 12, riskRp: 'Rp 82.400.000', compliance: '96.4%' },
    { dept: 'Penyakit Dalam', claims: 410, flagged: 9, riskRp: 'Rp 61.200.000', compliance: '97.8%' },
    { dept: 'Perinatologi & NICU', claims: 180, flagged: 6, riskRp: 'Rp 48.500.000', compliance: '96.6%' },
    { dept: 'Jantung & Pembuluh Darah', claims: 150, flagged: 4, riskRp: 'Rp 32.100.000', compliance: '97.3%' },
    { dept: 'Bedah Umum & Ortopedi', claims: 340, flagged: 3, riskRp: 'Rp 14.300.000', compliance: '99.1%' }
  ]
};
