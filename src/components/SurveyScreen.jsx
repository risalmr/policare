import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 *  SurveyScreen.jsx — Studio Riset & Analytics Kepuasan
 *  Pilar 1: Patient Voice & Market Intelligence
 *
 *  Mendukung:
 *  1. Riset Kustom (Custom Survey & Kolam Segmen Pasien)
 *  2. Survei Kepuasan Masyarakat (SKM) Standar Kementerian (PermenPAN-RB No. 14/2017)
 *  3. Laporan Akhir SKM Otomatis & Generator Laporan Lengkap 21 Halaman
 *     (Sesuai Laporan Akhir SKM Tahun 2025 RSUD Daya.pdf)
 * ─────────────────────────────────────────────────────────────────────────────*/

export default function SurveyScreen({ surveys, onOpenSurveyModal, onTriggerCrisis, active, API_URL, accessLevel = 'ADMIN' }) {
  const isReadOnly = accessLevel === 'VIEWER';
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' | 'skm' | 'laporan'
  const [segmentPools, setSegmentPools] = useState([]);
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [skmModalOpen, setSkmModalOpen] = useState(false);
  const [fullReportModalOpen, setFullReportModalOpen] = useState(false);

  // Segment pool form states
  const [poolName, setPoolName] = useState('');
  const [poolSource, setPoolSource] = useState('SIMRS Direct API');
  const [poolCount, setPoolCount] = useState(150);
  const [uploadedExcelName, setUploadedExcelName] = useState('');

  // SKM Launch State
  const [skmPeriode, setSkmPeriode] = useState('Tahun 2026 - Semester I');
  const [skmTargetResp, setSkmTargetResp] = useState(2800);
  
  // All Available Hospital Placement Units
  const ALL_HOSPITAL_UNITS = [
    { id: 'lobi', name: 'Ruang Tunggu Lobi & Pendaftaran', category: 'Admisi', desk: 'Meja Customer Service & Pendaftaran' },
    { id: 'poli-obgyn', name: 'Poli Kebidanan & Kandungan (Obgyn)', category: 'Poliklinik', desk: 'Meja Perawat & Ruang Konsultasi Dokter' },
    { id: 'poli-anak', name: 'Poli Anak & Tumbuh Kembang', category: 'Poliklinik', desk: 'Meja Timbang & Ruang Dokter Anak' },
    { id: 'poli-pd', name: 'Poli Penyakit Dalam (Interna)', category: 'Poliklinik', desk: 'Ruang Konsultasi Poli Interna' },
    { id: 'poli-bedah', name: 'Poli Bedah Umum', category: 'Poliklinik', desk: 'Ruang Tindakan & Konsultasi Bedah' },
    { id: 'poli-gigi', name: 'Poli Gigi & Mulut (Dental)', category: 'Poliklinik', desk: 'Meja Registrasi & Dental Chair' },
    { id: 'farmasi', name: 'Instalasi Farmasi / Apotek', category: 'Penunjang', desk: 'Loket Penyerahan Obat & Konseling Farmasi' },
    { id: 'kasir', name: 'Kasir & Loket Pembayaran', category: 'Admisi', desk: 'Meja Kasir Pembayaran BPJS / Umum' },
    { id: 'igd', name: 'Instalasi Gawat Darurat (IGD)', category: 'Gawat Darurat', desk: 'Meja Triage & Nurse Station IGD' },
    { id: 'lab', name: 'Laboratorium & Patologi', category: 'Penunjang', desk: 'Loket Pengambilan Sampel Darah' },
    { id: 'radiologi', name: 'Radiologi & USG', category: 'Penunjang', desk: 'Ruang Tunggu X-Ray & USG' },
    { id: 'inap', name: 'Rawat Inap (Lantai 2 & 3)', category: 'Rawat Inap', desk: 'Nurse Station Melati & Edelweiss' },
    { id: 'ponek', name: 'IGD PONEK / Kamar Bersalin', category: 'Gawat Darurat', desk: 'Ruang Observasi & Kamar Bersalin (VK)' }
  ];

  // SKM Selected Units & Barcode Standee Generator States
  const [skmSelectedUnitIds, setSkmSelectedUnitIds] = useState([
    'lobi', 'poli-obgyn', 'poli-anak', 'poli-pd', 'farmasi', 'kasir', 'igd'
  ]);
  const [autoGenBarcode, setAutoGenBarcode] = useState(true);
  const [autoTagLocation, setAutoTagLocation] = useState(true);
  const [qrStandeeModalOpen, setQrStandeeModalOpen] = useState(false);
  const [selectedStandeeUnitId, setSelectedStandeeUnitId] = useState('poli-obgyn');
  const [standeeSurveyTitle, setStandeeSurveyTitle] = useState('Survei Kepuasan Masyarakat (SKM) 2026');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // SKM Default Questions (9 Unsur Standar PermenPAN-RB No. 14 Tahun 2017)
  const DEFAULT_SKM_QUESTIONS = [
    {
      code: 'U1',
      name: 'Persyaratan Pelayanan',
      question: 'Bagaimana pendapat Anda tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya di RSUD Daya?',
      options: ['Tidak Sesuai', 'Kurang Sesuai', 'Sesuai', 'Sangat Sesuai'],
      mandatory: true
    },
    {
      code: 'U2',
      name: 'Sistem, Mekanisme & Prosedur',
      question: 'Bagaimana pendapat Anda tentang kemudahan prosedur dan alur pelayanan di rumah sakit ini?',
      options: ['Tidak Mudah', 'Kurang Mudah', 'Mudah', 'Sangat Mudah'],
      mandatory: true
    },
    {
      code: 'U3',
      name: 'Waktu Penyelesaian',
      question: 'Bagaimana pendapat Anda tentang kecepatan waktu dalam memberikan pelayanan kepada pasien?',
      options: ['Tidak Cepat / Sangat Lama', 'Kurang Cepat', 'Cepat', 'Sangat Cepat'],
      mandatory: true
    },
    {
      code: 'U4',
      name: 'Biaya / Tarif Pelayanan',
      question: 'Bagaimana pendapat Anda tentang kewajaran biaya/tarif dalam pelayanan (atau kejelasan alur jaminan BPJS Kesehatan)?',
      options: ['Sangat Mahal / Tidak Jelas', 'Cukup Mahal', 'Murah / Wajar', 'Gratis (BPJS) / Sangat Sesuai'],
      mandatory: true
    },
    {
      code: 'U5',
      name: 'Produk Spesifikasi Jenis Pelayanan',
      question: 'Bagaimana pendapat Anda tentang kesesuaian antara produk pelayanan yang tercantum dalam standar pelayanan dengan hasil yang diberikan?',
      options: ['Tidak Sesuai', 'Kurang Sesuai', 'Sesuai', 'Sangat Sesuai'],
      mandatory: true
    },
    {
      code: 'U6',
      name: 'Kompetensi Pelaksana',
      question: 'Bagaimana pendapat Anda tentang kemampuan, keterampilan, dan kejelasan dokter serta tenaga medis dalam memberikan pelayanan?',
      options: ['Tidak Kompeten', 'Kurang Kompeten', 'Kompeten', 'Sangat Kompeten & Jelas'],
      mandatory: true
    },
    {
      code: 'U7',
      name: 'Perilaku Pelaksana',
      question: 'Bagaimana pendapat Anda tentang sikap, keramahan, dan kesopanan petugas/perawat/staf dalam memberikan pelayanan?',
      options: ['Tidak Ramah', 'Kurang Ramah', 'Ramah & Sopan', 'Sangat Ramah & Peduli'],
      mandatory: true
    },
    {
      code: 'U8',
      name: 'Sarana dan Prasarana',
      question: 'Bagaimana pendapat Anda tentang kualitas sarana dan prasarana (kebersihan, kenyamanan AC, toilet, dan ruang tunggu RS)?',
      options: ['Buruk / Tidak Nyaman', 'Kurang Baik', 'Baik & Bersih', 'Sangat Bersih & Nyaman'],
      mandatory: true
    },
    {
      code: 'U9',
      name: 'Penanganan Pengaduan & Masukan',
      question: 'Bagaimana pendapat Anda tentang penanganan pengaduan, saran, dan masukan dari pengguna layanan oleh pihak RS?',
      options: ['Tidak Ada / Diabaikan', 'Kurang Ditanggapi', 'Ditangani dengan Baik', 'Respon Sangat Cepat & Solutif'],
      mandatory: true
    }
  ];

  // SKM Sub-Tab & Question Customization States
  const [skmSubTab, setSkmSubTab] = useState('results'); // 'results' | 'questions'
  const [skmQuestions, setSkmQuestions] = useState(DEFAULT_SKM_QUESTIONS);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobilePreviewStep, setMobilePreviewStep] = useState(0);
  const [mobileAnswers, setMobileAnswers] = useState({});
  const [questionToast, setQuestionToast] = useState(null);

  const showQToast = (msg) => {
    setQuestionToast(msg);
    setTimeout(() => setQuestionToast(null), 3000);
  };

  const handleUpdateQuestionText = (index, newText) => {
    setSkmQuestions(prev => prev.map((q, idx) => idx === index ? { ...q, question: newText } : q));
  };

  const handleUpdateOptionText = (qIndex, optIndex, newOptText) => {
    setSkmQuestions(prev => prev.map((q, idx) => {
      if (idx === qIndex) {
        const nextOptions = [...q.options];
        nextOptions[optIndex] = newOptText;
        return { ...q, options: nextOptions };
      }
      return q;
    }));
  };

  const handleAddCustomSkmQuestion = () => {
    const nextNum = skmQuestions.length + 1;
    setSkmQuestions(prev => [
      ...prev,
      {
        code: `U${nextNum}`,
        name: `Pertanyaan Tambahan Khusus RS #${nextNum - 9}`,
        question: 'Bagaimana pendapat Anda mengenai kenyamanan dan kejelasan informasi tambahan dari fasyankes kami?',
        options: ['Tidak Baik', 'Kurang Baik', 'Baik', 'Sangat Baik'],
        mandatory: false
      }
    ]);
    showQToast('✅ Pertanyaan kustom tambahan berhasil ditambahkan!');
  };

  const handleDeleteSkmQuestion = (index) => {
    setSkmQuestions(prev => prev.filter((_, idx) => idx !== index));
    showQToast('🗑️ Pertanyaan kustom berhasil dihapus.');
  };

  const handleResetSkmQuestions = () => {
    setSkmQuestions(DEFAULT_SKM_QUESTIONS);
    showQToast('🔄 Susunan kuesioner berhasil dikembalikan ke Template Baku PermenPAN-RB No. 14/2017.');
  };

  const handleSaveSkmQuestions = () => {
    showQToast('💾 Perubahan kuesioner berhasil disimpan! Kuesioner langsung aktif untuk barcode standee & online.');
  };

  const toggleUnitSelection = (unitId) => {
    setSkmSelectedUnitIds(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  const handleSelectAllUnits = () => {
    setSkmSelectedUnitIds(ALL_HOSPITAL_UNITS.map(u => u.id));
  };

  const handleSelectPoliOnly = () => {
    setSkmSelectedUnitIds(ALL_HOSPITAL_UNITS.filter(u => u.category === 'Poliklinik').map(u => u.id));
  };

  const handleSelectFastTrack = () => {
    setSkmSelectedUnitIds(['lobi', 'farmasi', 'kasir', 'lab', 'radiologi']);
  };

  const handleOpenStandeeModal = (title = 'Survei Kepuasan Masyarakat (SKM) 2026', defaultUnit = 'poli-obgyn') => {
    setStandeeSurveyTitle(title);
    setSelectedStandeeUnitId(defaultUnit);
    setQrStandeeModalOpen(true);
  };

  const activeStandeeUnit = ALL_HOSPITAL_UNITS.find(u => u.id === selectedStandeeUnitId) || ALL_HOSPITAL_UNITS[0];

  const generateStandeeUrl = (unitId) => {
    return `https://policare.id/survey/skm-2026?unit=${unitId}&source=standee_qr`;
  };

  const handleCopyStandeeLink = () => {
    const url = generateStandeeUrl(selectedStandeeUnitId);
    navigator.clipboard?.writeText?.(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const fetchSegmentPools = async () => {
    try {
      const res = await fetch(`${API_URL}/api/segments`);
      if (res.ok) {
        const data = await res.json();
        setSegmentPools(data);
      }
    } catch (err) {
      console.warn('Gagal memuat kolam segmen');
    }
  };

  useEffect(() => {
    if (active) {
      fetchSegmentPools();
    }
  }, [active]);

  const handleCreatePool = async (e) => {
    e.preventDefault();
    if (!poolName.trim()) {
      alert('Nama kolam segmen harus diisi!');
      return;
    }
    const payload = {
      name: poolName,
      source: poolSource,
      count: poolSource === 'Excel Upload' ? Math.floor(50 + Math.random() * 200) : poolCount
    };
    try {
      const res = await fetch(`${API_URL}/api/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchSegmentPools();
        setShowCreatePool(false);
        setPoolName('');
        setUploadedExcelName('');
      } else {
        alert('Gagal membuat kolam segmen');
      }
    } catch (err) {
      alert('Gagal menyambung ke server');
    }
  };

  const handleLaunchSKM = (e) => {
    e.preventDefault();
    setSkmModalOpen(false);
    if (autoGenBarcode) {
      setStandeeSurveyTitle(`Survei Kepuasan Masyarakat (SKM) - ${skmPeriode}`);
      setSelectedStandeeUnitId(skmSelectedUnitIds[0] || 'poli-obgyn');
      setQrStandeeModalOpen(true);
    }
  };

  if (!active) return null;

  // Data SKM PermenPAN-RB No. 14 Tahun 2017 (Berdasarkan Laporan RSUD Daya 2025)
  const skmUnsurList = [
    { code: 'U1', name: 'Persyaratan Pelayanan', score: 3.28, pctBaik: 89.5, status: 'Baik', buruk: 0.1, cukup: 10.4, sangatBaik: 12.3 },
    { code: 'U2', name: 'Sistem, Mekanisme & Prosedur', score: 3.42, pctBaik: 92.1, status: 'Baik', tag: 'Unggulan', buruk: 0.05, cukup: 7.85, sangatBaik: 15.2 },
    { code: 'U3', name: 'Waktu Penyelesaian', score: 3.12, pctBaik: 78.4, status: 'Baik', buruk: 1.2, cukup: 20.4, sangatBaik: 9.8 },
    { code: 'U4', name: 'Biaya / Tarif Pelayanan', score: 3.45, pctBaik: 93.8, status: 'Sangat Baik', tag: 'Unggulan', buruk: 0.0, cukup: 6.2, sangatBaik: 21.5 },
    { code: 'U5', name: 'Produk Spesifikasi Jenis Pelayanan', score: 3.25, pctBaik: 82.1, status: 'Baik', buruk: 0.3, cukup: 17.6, sangatBaik: 11.2 },
    { code: 'U6', name: 'Kompetensi Pelaksana', score: 3.08, pctBaik: 76.2, status: 'Baik', tag: 'Perlu Perbaikan', buruk: 0.8, cukup: 23.0, sangatBaik: 8.5 },
    { code: 'U7', name: 'Perilaku Pelaksana', score: 3.05, pctBaik: 75.8, status: 'Baik', tag: 'Perlu Perbaikan', buruk: 1.1, cukup: 23.1, sangatBaik: 8.2 },
    { code: 'U8', name: 'Sarana dan Prasarana', score: 3.38, pctBaik: 90.2, status: 'Baik', buruk: 0.04, cukup: 0.04, sangatBaik: 9.71 },
    { code: 'U9', name: 'Penanganan Pengaduan & Masukan', score: 3.52, pctBaik: 99.5, status: 'Sangat Baik', tag: 'Tertinggi', buruk: 0.04, cukup: 0.5, sangatBaik: 24.8 },
  ];

  const skmUnitList = [
    { no: 1, name: 'Ruang Tunggu Lobi', resp: 197, pct: 7.03, score: 3.25, issue: 'Respon pendaftaran & kejelasan alur' },
    { no: 2, name: 'Rawat Jalan / Poliklinik', resp: 340, pct: 12.13, score: 3.30, issue: 'Jadwal dokter & antrean RME' },
    { no: 3, name: 'Rawat Inap / Ruang Perawatan', resp: 391, pct: 13.95, score: 3.36, issue: 'Kebersihan & kenyamanan toilet' },
    { no: 4, name: 'Radiologi', resp: 212, pct: 7.57, score: 3.38, issue: 'Panduan alur pemeriksaan' },
    { no: 5, name: 'Laboratorium', resp: 196, pct: 7.00, score: 3.40, issue: 'Estimasi sampel siap' },
    { no: 6, name: 'Apotek / Farmasi', resp: 154, pct: 5.50, score: 3.02, issue: 'Waktu tunggu obat racikan lama' },
    { no: 7, name: 'Ruang Operasi / OK', resp: 235, pct: 8.39, score: 3.48, issue: 'Orientasi keluarga pasien' },
    { no: 8, name: 'PICU', resp: 209, pct: 7.46, score: 3.42, issue: 'Komunikasi intensif' },
    { no: 9, name: 'NICU', resp: 211, pct: 7.53, score: 3.41, issue: 'Akses kunjungan ortu' },
    { no: 10, name: 'ICU', resp: 179, pct: 6.39, score: 3.35, issue: 'Update kondisi berkala' },
    { no: 11, name: 'RICU', resp: 4, pct: 0.14, score: 3.50, issue: '—' },
    { no: 12, name: 'IGD', resp: 232, pct: 8.28, score: 3.04, issue: 'Primary triage & verifikasi jaminan' },
    { no: 13, name: 'IGD Ponek / Bersalin', resp: 219, pct: 7.82, score: 3.40, issue: 'Kenyamanan tempat transit' },
    { no: 14, name: 'Pemulasaran Jenazah', resp: 0, pct: 0.00, score: 0.00, issue: '—' },
    { no: 15, name: 'Pelayanan Gizi', resp: 23, pct: 0.82, score: 3.45, issue: 'Variasi diet pasien' },
  ];

  return (
    <div className="screen on" id="s-survey">
      {/* PAGE HEADER */}
      <div className="ph">
        <div className="ph-text">
          <h2>Studio Riset &amp; Analytics Kepuasan</h2>
          <p>Pilar 1: Patient Voice &amp; Market Intelligence — Rancang survey kustom, kelola segmen, dan luncurkan Survei Kepuasan Masyarakat (SKM) terstandar Kementerian (PermenPAN-RB No. 14/2017) untuk menghasilkan laporan otomatis resmi.</p>
        </div>
        <div className="ph-act" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn ghost" onClick={() => handleOpenStandeeModal('Survei Kepuasan Masyarakat (SKM) 2026')} style={{ color: '#10b981', borderColor: '#10b981' }}>
            <span className="ic s">qr_code_2</span>QR Barcode Standee
          </button>
          {!isReadOnly ? (
            <>
              <button className="btn ghost" onClick={() => setSkmModalOpen(true)} style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>
                <span className="ic s">verified</span>Launch SKM PermenPAN-RB
              </button>
              <button className="btn ghost" onClick={() => setShowCreatePool(true)}>
                <span className="ic s">group_add</span>Kolam Segmen
              </button>
              <button className="btn pri" onClick={onOpenSurveyModal}>
                <span className="ic s">add_circle</span>Buat Survey Kustom
              </button>
            </>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--srf2)', border: '1px solid var(--line)', borderRadius: 'var(--r8)', fontSize: '11.5px', color: 'var(--t3)', fontWeight: 600 }}>
              <span className="ic s" style={{ fontSize: '14px' }}>visibility</span> Mode Pantau Eksekutif (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* EXECUTIVE BANNER IF READ-ONLY */}
      {isReadOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--blue-s)', border: '1.5px solid var(--blue-m)', padding: '12px 16px', borderRadius: 'var(--r10)', marginBottom: '16px' }}>
          <span className="ic s" style={{ color: 'var(--blue)', fontSize: '20px' }}>assessment</span>
          <div style={{ fontSize: '12px', color: 'var(--t1)', lineHeight: 1.4 }}>
            <strong>Mode Pemonitor Eksekutif (Pimpinan RS):</strong> Anda memiliki hak akses penuh untuk melihat analitik IKM, laporan kepuasan pasien, dan dokumen resmi 21 halaman SKM. Peluncuran riset baru dilakukan oleh <strong>Yanmas/Humas</strong>.
          </div>
        </div>
      )}

      {/* TOP STUDIO NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1.5px solid var(--line2)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('custom')}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            background: activeTab === 'custom' ? 'var(--blue)' : 'var(--srf)',
            color: activeTab === 'custom' ? '#fff' : 'var(--t2)',
            display: 'flex', alignItems: 'center', gap: '6px', transition: '.15s'
          }}>
          <span className="ic s" style={{ fontSize: '16px' }}>dashboard</span>Riset &amp; Survey Kustom
        </button>
        <button
          onClick={() => setActiveTab('skm')}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            background: activeTab === 'skm' ? 'var(--blue)' : 'var(--srf)',
            color: activeTab === 'skm' ? '#fff' : 'var(--t2)',
            display: 'flex', alignItems: 'center', gap: '6px', transition: '.15s'
          }}>
          <span className="ic s" style={{ fontSize: '16px' }}>verified_user</span>SKM PermenPAN-RB (Permen No 14/2017)
        </button>
        <button
          onClick={() => setActiveTab('laporan')}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            background: activeTab === 'laporan' ? 'var(--blue)' : 'var(--srf)',
            color: activeTab === 'laporan' ? '#fff' : 'var(--t2)',
            display: 'flex', alignItems: 'center', gap: '6px', transition: '.15s'
          }}>
          <span className="ic s" style={{ fontSize: '16px' }}>description</span>Laporan Akhir SKM 2025 (Otomatis)
        </button>
      </div>

      {/* LAUNCH SKM MODAL WITH UNIT SELECTION & BARCODE GENERATION */}
      {skmModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setSkmModalOpen(false)}>
          <div className="modal-box" style={{ width: '720px' }}>
            <div className="modal-hd">
              <div className="modal-hd-icon" style={{ background: 'rgba(37,99,235,0.12)' }}>
                <span className="ic" style={{ color: 'var(--blue)' }}>verified</span>
              </div>
              <div>
                <div className="modal-title">Launch Survei Kepuasan Masyarakat (SKM)</div>
                <div className="modal-sub">Standar Resmi Kementerian PAN-RB No. 14 Tahun 2017 &amp; Distribusi Multi-Titik</div>
              </div>
              <button className="modal-close" onClick={() => setSkmModalOpen(false)}>
                <span className="ic s">close</span>
              </button>
            </div>

            <form onSubmit={handleLaunchSKM} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '4px' }}>PERIODE SURVEI</label>
                  <input type="text" value={skmPeriode} onChange={e => setSkmPeriode(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '4px' }}>TARGET RESPONDEN (RUMUS KREJCIE-MORGAN)</label>
                  <input type="number" value={skmTargetResp} onChange={e => setSkmTargetResp(+e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }} />
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════════════
               * SEKSI PILIHAN LOKASI PENEMPATAN / POLI SURVEI
               * ══════════════════════════════════════════════════════════════════*/}
              <div style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="ic s" style={{ color: 'var(--blue)' }}>place</span> PILIH TITIK PENEMPATAN SURVEI ({skmSelectedUnitIds.length} Lokasi Terpilih)
                    </label>
                    <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>Tentukan di mana barcode standee survei akan dipasang di fasyankes.</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={handleSelectAllUnits} className="btn ghost sm" style={{ fontSize: '10px', padding: '3px 8px' }}>Pilih Semua</button>
                    <button type="button" onClick={handleSelectPoliOnly} className="btn ghost sm" style={{ fontSize: '10px', padding: '3px 8px' }}>Hanya Poli</button>
                    <button type="button" onClick={handleSelectFastTrack} className="btn ghost sm" style={{ fontSize: '10px', padding: '3px 8px' }}>Lobi/Farmasi/Kasir</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {ALL_HOSPITAL_UNITS.map(unit => {
                    const isChecked = skmSelectedUnitIds.includes(unit.id);
                    return (
                      <div
                        key={unit.id}
                        onClick={() => toggleUnitSelection(unit.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                          background: isChecked ? 'rgba(37,99,235,0.08)' : 'var(--srf)',
                          border: isChecked ? '1.5px solid var(--blue)' : '1px solid var(--line2)',
                          transition: '.15s'
                        }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by container onClick
                          style={{ cursor: 'pointer', accentColor: 'var(--blue)' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {unit.name}
                          </div>
                          <div style={{ fontSize: '9.5px', color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {unit.desk}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                          background: unit.category === 'Poliklinik' ? '#eff6ff' : unit.category === 'Admisi' ? '#fef3c7' : unit.category === 'Gawat Darurat' ? '#fee2e2' : '#f0fdf4',
                          color: unit.category === 'Poliklinik' ? '#1d4ed8' : unit.category === 'Admisi' ? '#b45309' : unit.category === 'Gawat Darurat' ? '#b91c1c' : '#15803d'
                        }}>
                          {unit.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════════════
               * SEKSI OPSI DISTRIBUSI & GENERATE BARCODE STANDEE
               * ══════════════════════════════════════════════════════════════════*/}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s" style={{ color: '#10b981' }}>qr_code_2</span> OPSI DISTRIBUSI &amp; BARCODE GENERATOR:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#1e293b', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoGenBarcode}
                      onChange={e => setAutoGenBarcode(e.target.checked)}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span><strong>Generate Barcode / QR Standee Akrilik Meja Otomatis</strong> untuk masing-masing titik yang dipilih</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#1e293b', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoTagLocation}
                      onChange={e => setAutoTagLocation(e.target.checked)}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span><strong>Auto-Tagging Lokasi:</strong> Responden otomatis terdata berasal dari unit/poli tempat QR barcode discan</span>
                  </label>
                </div>
              </div>

              {/* 9 UNSUR WAJIB PREVIEW */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '4px' }}>9 UNSUR PELAYANAN WAJIB (PERMENPAN-RB)</label>
                <div style={{ background: 'var(--bg2)', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', color: 'var(--t2)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  <span>✓ U1. Persyaratan</span>
                  <span>✓ U2. Prosedur &amp; Alur</span>
                  <span>✓ U3. Waktu Penyelesaian</span>
                  <span>✓ U4. Biaya / Tarif</span>
                  <span>✓ U5. Produk Spesifikasi</span>
                  <span>✓ U6. Kompetensi Petugas</span>
                  <span>✓ U7. Perilaku / Keramahan</span>
                  <span>✓ U8. Sarana &amp; Prasarana</span>
                  <span>✓ U9. Penanganan Aduan</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn ghost" onClick={() => setSkmModalOpen(false)}>Batal</button>
                <button type="submit" className="btn pri" style={{ background: 'var(--blue)', padding: '10px 20px' }}>
                  <span className="ic s">rocket_launch</span>Luncurkan &amp; Hasilkan Barcode Standee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * MODAL: QR CODE BARCODE STANDEE GENERATOR & PRINTABLE DISPLAY
       * ═════════════════════════════════════════════════════════════════════*/}
      {qrStandeeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--srf)', borderRadius: '16px', width: '100%', maxWidth: '880px', maxHeight: '92vh', overflowY: 'auto', border: '1.5px solid var(--line2)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="ic" style={{ color: '#10b981', fontSize: '22px' }}>qr_code_2</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--t1)' }}>
                    Generator Barcode &amp; Standee Akrilik Meja Survei
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--t3)' }}>
                    {standeeSurveyTitle} • {skmSelectedUnitIds.length} Titik Lokasi Fasyankes Siap Cetak
                  </div>
                </div>
              </div>
              <button onClick={() => setQrStandeeModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: '4px' }}>
                <span className="ic">close</span>
              </button>
            </div>

            {/* Modal Body: Left unit picker + Right standee visual preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, minHeight: '440px' }}>
              
              {/* LEFT SIDEBAR: List of Selected Units */}
              <div style={{ padding: '14px', borderRight: '1px solid var(--line2)', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '500px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  PILIH PREVIEW LOKASI ({skmSelectedUnitIds.length})
                </div>

                {ALL_HOSPITAL_UNITS.filter(u => skmSelectedUnitIds.includes(u.id)).map(u => {
                  const isCurrent = u.id === selectedStandeeUnitId;
                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedStandeeUnitId(u.id)}
                      style={{
                        padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                        background: isCurrent ? '#2563eb' : 'var(--srf)',
                        color: isCurrent ? '#fff' : 'var(--t1)',
                        border: isCurrent ? '1.5px solid #1d4ed8' : '1px solid var(--line2)',
                        transition: '.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: '9.5px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.desk}
                        </div>
                      </div>
                      <span className="ic s" style={{ fontSize: '14px', marginLeft: '6px' }}>{isCurrent ? 'check' : 'chevron_right'}</span>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT CONTENT: Standee Acrylic Graphic Preview & Actions */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                
                {/* Physical Standee Mockup Container */}
                <div id="printable-standee" style={{
                  width: '320px', background: '#ffffff', borderRadius: '16px', padding: '20px 18px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.15)', border: '2px solid #cbd5e1',
                  textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  {/* Top Branding */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1e293b', letterSpacing: '0.3px' }}>RSIA ANANDA MAKASSAR</span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', lineHeight: 1.2 }}>
                    SURVEI KEPUASAN MASYARAKAT
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600, marginTop: '2px', marginBottom: '12px' }}>
                    PermenPAN-RB No. 14 Tahun 2017
                  </div>

                  {/* Location Badge */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', color: '#fff',
                    padding: '6px 12px', borderRadius: '20px', width: '100%', marginBottom: '12px',
                    boxShadow: '0 4px 10px rgba(37,99,235,0.25)'
                  }}>
                    <div style={{ fontSize: '8.5px', fontWeight: 700, letterSpacing: '0.5px', opacity: 0.9 }}>📍 TITIK PENEMPATAN:</div>
                    <div style={{ fontSize: '11px', fontWeight: 800 }}>{activeStandeeUnit.name}</div>
                    <div style={{ fontSize: '8px', opacity: 0.85 }}>{activeStandeeUnit.desk}</div>
                  </div>

                  {/* High Quality Vector QR Code Frame */}
                  <div style={{
                    padding: '10px', background: '#fff', border: '2px dashed #2563eb', borderRadius: '12px',
                    marginBottom: '10px', position: 'relative'
                  }}>
                    {/* SVG Vector QR Code Graphic */}
                    <svg width="150" height="150" viewBox="0 0 150 150" style={{ display: 'block' }}>
                      <rect width="150" height="150" fill="#ffffff"/>
                      {/* Top-Left Corner Box */}
                      <rect x="10" y="10" width="38" height="38" fill="#1e293b" rx="4"/>
                      <rect x="16" y="16" width="26" height="26" fill="#ffffff" rx="2"/>
                      <rect x="22" y="22" width="14" height="14" fill="#2563eb" rx="1"/>

                      {/* Top-Right Corner Box */}
                      <rect x="102" y="10" width="38" height="38" fill="#1e293b" rx="4"/>
                      <rect x="108" y="16" width="26" height="26" fill="#ffffff" rx="2"/>
                      <rect x="114" y="22" width="14" height="14" fill="#2563eb" rx="1"/>

                      {/* Bottom-Left Corner Box */}
                      <rect x="10" y="102" width="38" height="38" fill="#1e293b" rx="4"/>
                      <rect x="16" y="108" width="26" height="26" fill="#ffffff" rx="2"/>
                      <rect x="22" y="114" width="14" height="14" fill="#2563eb" rx="1"/>

                      {/* Decorative QR Pattern Blocks */}
                      <rect x="56" y="14" width="8" height="8" fill="#1e293b"/>
                      <rect x="72" y="14" width="16" height="8" fill="#1e293b"/>
                      <rect x="56" y="30" width="12" height="12" fill="#2563eb"/>
                      <rect x="76" y="34" width="14" height="6" fill="#1e293b"/>
                      
                      <rect x="14" y="56" width="8" height="14" fill="#1e293b"/>
                      <rect x="30" y="56" width="14" height="8" fill="#2563eb"/>
                      <rect x="54" y="54" width="42" height="42" fill="#0f172a" rx="4"/>
                      <circle cx="75" cy="75" r="14" fill="#ffffff"/>
                      <text x="75" y="79" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">+</text>

                      <rect x="104" y="56" width="12" height="10" fill="#1e293b"/>
                      <rect x="124" y="60" width="14" height="8" fill="#1e293b"/>

                      <rect x="56" y="104" width="16" height="8" fill="#1e293b"/>
                      <rect x="80" y="104" width="8" height="18" fill="#2563eb"/>
                      <rect x="104" y="102" width="14" height="14" fill="#1e293b"/>
                      <rect x="126" y="112" width="12" height="16" fill="#1e293b"/>
                      <rect x="56" y="128" width="36" height="10" fill="#1e293b"/>
                      <rect x="104" y="124" width="14" height="14" fill="#2563eb"/>
                    </svg>
                  </div>

                  {/* Instructions */}
                  <div style={{ fontSize: '9.5px', color: '#334155', fontWeight: 600, lineHeight: 1.35, marginBottom: '6px' }}>
                    📲 <strong>Buka Kamera HP / WhatsApp Anda</strong><br />
                    Arahkan ke QR Code di atas untuk mengisi survei (1 Menit).
                  </div>

                  <div style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {generateStandeeUrl(activeStandeeUnit.id)}
                  </div>
                </div>

                {/* Standee Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn pri sm"
                    onClick={() => {
                      window.print();
                    }}
                    style={{ background: '#2563eb', padding: '8px 14px' }}>
                    <span className="ic s">print</span> Cetak Standee Akrilik (A5/PDF)
                  </button>

                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={() => alert(`📥 Gambar QR Code Standee untuk ${activeStandeeUnit.name} berhasil diunduh (PNG High-Res).`)}
                    style={{ background: '#fff' }}>
                    <span className="ic s">download</span> Unduh QR PNG
                  </button>

                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={handleCopyStandeeLink}
                    style={{ background: '#fff', color: copiedUrl ? '#10b981' : 'var(--t1)' }}>
                    <span className="ic s">{copiedUrl ? 'check' : 'content_copy'}</span>
                    {copiedUrl ? 'Tautan Disalin!' : 'Salin URL Lokasi'}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SEGMENT POOL MODAL/PANEL SIMULATOR */}
      {showCreatePool && (
        <div style={{ background: 'var(--srf)', border: '1.5px solid var(--line2)', borderRadius: 'var(--r12)', padding: '16px', marginBottom: '16px', animation: 'fadeup-demo 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: '700', color: 'var(--t1)' }}>Buat Kolam Segmen Pasien Kustom</h4>
            <span className="ic s" style={{ cursor: 'pointer', color: 'var(--t3)' }} onClick={() => setShowCreatePool(false)}>close</span>
          </div>
          <form onSubmit={handleCreatePool} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>NAMA KOLAM SEGMEN</label>
              <input type="text" value={poolName} onChange={(e) => setPoolName(e.target.value)} placeholder="Contoh: Ibu Hamil ANC Trimester 3" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }} />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>SUMBER DATA PASIEN</label>
              <select value={poolSource} onChange={(e) => setPoolSource(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }}>
                <option value="SIMRS Direct API">SIMRS Direct API (Real-time)</option>
                <option value="Excel Upload">Upload Dokumen/Excel External</option>
                <option value="Bebaik App Segment">Bebaik Apps Connection</option>
              </select>
            </div>
            
            {poolSource === 'Excel Upload' ? (
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>PILIH FILE EXCEL (.XLSX)</label>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setUploadedExcelName(e.target.files[0]?.name || '')} style={{ fontSize: '11px', width: '100%' }} />
              </div>
            ) : (
              <div style={{ width: '100px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>PASIEN</label>
                <input type="number" value={poolCount} onChange={(e) => setPoolCount(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }} />
              </div>
            )}

            <button type="submit" className="btn pri" style={{ padding: '6px 14px', height: '32px' }}>
              <span className="ic s">add</span>Tarik &amp; Masukkan Daftar Target
            </button>
          </form>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 1: RISET & SURVEY KUSTOM
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'custom' && (
        <>
          <div className="kstrip k4">
            <div className="kcard kg"><div className="kcard-ic"><span className="ic">star</span></div><div className="kcard-lbl">Overall CSAT</div><div className="kcard-v">4.6<small>/5</small></div><div className="kcard-d up"><span className="ic s">trending_up</span>+0.2 vs Q1</div></div>
            <div className="kcard kg"><div className="kcard-ic"><span className="ic">sentiment_satisfied</span></div><div className="kcard-lbl">NPS Score</div><div className="kcard-v">72</div><div className="kcard-d up"><span className="ic s">arrow_upward</span>+8 vs Q1</div></div>
            <div className="kcard"><div className="kcard-ic"><span className="ic">how_to_reg</span></div><div className="kcard-lbl">Response Rate</div><div className="kcard-v">64<small>%</small></div><div className="kcard-d fl">Target: 70%</div></div>
            <div className="kcard"><div className="kcard-ic"><span className="ic">quiz</span></div><div className="kcard-lbl">Survey Aktif</div><div className="kcard-v">{surveys.length}</div><div className="kcard-d up">Berjalan saat ini</div></div>
          </div>

          <div className="g21">
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l"><div className="card-title">Survey Kustom Aktif &amp; Distribusi</div></div>
                {!isReadOnly && (
                  <button className="btn pri sm" onClick={onOpenSurveyModal}><span className="ic s">add</span>Survey Baru</button>
                )}
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Nama Survey</th>
                    <th>Segmen</th>
                    <th>Sumber Data</th>
                    <th>Jenis Form</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="dashboard-survey-list">
                  {surveys.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--t3)' }}>Memuat daftar survey...</td></tr>
                  ) : (
                    surveys.map((survey, index) => (
                      <tr key={index}>
                        <td>
                          <div className="td1">{survey.name}</div>
                          {survey.questionnaireLink && (
                            <div style={{ fontSize: '10.5px', color: 'var(--blue)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <span className="ic s" style={{ fontSize: '11px' }}>link</span>
                              <a href={survey.questionnaireLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>{survey.questionnaireLink}</a>
                            </div>
                          )}
                        </td>
                        <td>{survey.segment}</td>
                        <td>
                          <span className="bdg" style={{ background: 'var(--srf2)', border: '1px solid var(--line)', color: 'var(--t2)' }}>
                            {survey.dataSource || 'SIMRS Direct API'}
                          </span>
                        </td>
                        <td>{survey.questionnaireType || 'Form Kustom'}</td>
                        <td>
                          <span className={`bdg ${survey.statusClass}`}>
                            <span className="pdot" style={survey.status === 'Live' ? { animation: 'blink-demo 1.4s infinite' } : {}}></span>
                            {survey.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <hr className="div" />
              <div className="card-hd" style={{ marginBottom: '10px' }}>
                <div className="card-hd-l">
                  <div className="card-title">Kolam Segmen Pasien (Target Pools)</div>
                  <div className="card-sub">Kelola segmen sasaran, impor excel target, atau saring rekam medis SIMRS.</div>
                </div>
                <button className="btn ghost sm" onClick={() => setShowCreatePool(true)}><span className="ic s">add</span>Buat Kolam Segmen</button>
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Nama Kolam Segmen</th>
                    <th>Metode Tarik Data</th>
                    <th>Jumlah Pasien</th>
                    <th>Tanggal Tarik</th>
                    <th>Status Integrasi</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentPools.map((pool, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: 'var(--t1)' }}>{pool.name}</strong></td>
                      <td>
                        <span style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span className="ic s" style={{ fontSize: '12px' }}>
                            {pool.source === 'SIMRS Direct API' ? 'sync' : pool.source === 'Excel Upload' ? 'description' : 'phone_iphone'}
                          </span>
                          {pool.source}
                        </span>
                      </td>
                      <td><span style={{ fontWeight: '600', color: 'var(--blue)' }}>{pool.count} Pasien</span></td>
                      <td>{pool.dateCreated}</td>
                      <td>
                        <span className={`bdg ${pool.status === 'Sinkron' ? 'g' : pool.status === 'Aktif' ? 'b' : 'n'}`}>
                          {pool.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="col">
              <div className="card">
                <div className="card-hd"><div className="card-hd-l"><div className="card-title">NPS Breakdown</div></div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="nps-ring"><div className="nps-inner"><div style={{ fontFamily: "'Lexend',sans-serif", fontSize: '18px', fontWeight: '700', color: 'var(--t1)' }}>72</div><div style={{ fontSize: '9.5px', color: 'var(--t3)' }}>NPS</div></div></div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><span style={{ minWidth: '52px' }}>Promoter</span><div style={{ flex: 1 }}><div className="bar"><div className="bf bfg" style={{ width: '72%' }}></div></div></div><span style={{ minWidth: '26px', textAlign: 'right', fontWeight: '600', color: 'var(--green)' }}>72%</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><span style={{ minWidth: '52px' }}>Pasif</span><div style={{ flex: 1 }}><div className="bar"><div className="bf bfn" style={{ width: '15%' }}></div></div></div><span style={{ minWidth: '26px', textAlign: 'right', fontWeight: '600' }}>15%</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}><span style={{ minWidth: '52px' }}>Detractor</span><div style={{ flex: 1 }}><div className="bar"><div className="bf bfr" style={{ width: '13%' }}></div></div></div><span style={{ minWidth: '26px', textAlign: 'right', fontWeight: '600', color: 'var(--red)' }}>13%</span></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-hd"><div className="card-hd-l"><div className="card-title">SKM Quick Overview</div></div></div>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--blue)' }}>83.46</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>MUTU PELAYANAN B (BAIK)</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '4px' }}>Survei Kepuasan Masyarakat (PermenPAN-RB No. 14/2017)</div>
                  <button className="btn ghost sm" style={{ marginTop: '10px', width: '100%' }} onClick={() => setActiveTab('skm')}>
                    Lihat Analisis SKM Lengkap &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 2: SURVEI KEPUASAN MASYARAKAT (SKM PERMENPAN-RB NO 14 TAHUN 2017)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'skm' && (
        <>
          {/* TOAST FOR QUESTION EDITOR */}
          {questionToast && (
            <div style={{
              position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
              background: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn .2s ease-in-out'
            }}>
              {questionToast}
            </div>
          )}

          {/* KPI STAT STRIP */}
          <div className="kstrip k4" style={{ marginBottom: '16px' }}>
            <div className="kcard kg">
              <div className="kcard-ic"><span className="ic" style={{ color: 'var(--blue)' }}>military_tech</span></div>
              <div className="kcard-lbl">Indeks SKM (IKM)</div>
              <div className="kcard-v" style={{ color: 'var(--blue)' }}>83.46</div>
              <div className="kcard-d up"><span className="ic s">verified</span>Mutu B (BAIK)</div>
            </div>
            <div className="kcard">
              <div className="kcard-ic"><span className="ic">groups</span></div>
              <div className="kcard-lbl">Total Responden</div>
              <div className="kcard-v">2.802</div>
              <div className="kcard-d fl">Krejcie &amp; Morgan (5%)</div>
            </div>
            <div className="kcard">
              <div className="kcard-ic"><span className="ic">grade</span></div>
              <div className="kcard-lbl">NRR Tertimbang</div>
              <div className="kcard-v">3.339<small>/4.0</small></div>
              <div className="kcard-d up">Skala 1 - 4</div>
            </div>
            <div className="kcard">
              <div className="kcard-ic"><span className="ic">domain</span></div>
              <div className="kcard-lbl">Unit Pelayanan</div>
              <div className="kcard-v">15</div>
              <div className="kcard-d fl">Lobi, Poli, Inap, IGD, dll</div>
            </div>
          </div>

          {/* SUB-TABS: HASIL & EVALUASI VS SUSUNAN KUESIONER EDITOR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line2)', paddingBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setSkmSubTab('results')}
                style={{
                  padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700,
                  background: skmSubTab === 'results' ? 'var(--blue)' : 'var(--srf)',
                  color: skmSubTab === 'results' ? '#fff' : 'var(--t2)',
                  display: 'flex', alignItems: 'center', gap: '6px', transition: '.15s'
                }}>
                <span className="ic s" style={{ fontSize: '15px' }}>bar_chart</span>Hasil &amp; Evaluasi 9 Unsur
              </button>
              <button
                onClick={() => setSkmSubTab('questions')}
                style={{
                  padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700,
                  background: skmSubTab === 'questions' ? 'var(--blue)' : 'var(--srf)',
                  color: skmSubTab === 'questions' ? '#fff' : 'var(--t2)',
                  display: 'flex', alignItems: 'center', gap: '6px', transition: '.15s'
                }}>
                <span className="ic s" style={{ fontSize: '15px' }}>edit_note</span>Susunan Kuesioner &amp; Editor Pertanyaan ({skmQuestions.length})
              </button>
            </div>

            {skmSubTab === 'questions' && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setMobilePreviewStep(0);
                    setShowMobilePreview(true);
                  }}
                  className="btn ghost sm"
                  style={{ color: '#2563eb', borderColor: '#2563eb' }}>
                  <span className="ic s">phone_android</span>Preview Pasien (Mobile View)
                </button>
                <button
                  onClick={handleAddCustomSkmQuestion}
                  className="btn ghost sm">
                  <span className="ic s">add</span>+ Tambah Pertanyaan Kustom
                </button>
                <button
                  onClick={handleResetSkmQuestions}
                  className="btn ghost sm"
                  style={{ color: '#64748b' }}>
                  <span className="ic s">restart_alt</span>Reset Standar
                </button>
                <button
                  onClick={handleSaveSkmQuestions}
                  className="btn pri sm"
                  style={{ background: '#10b981' }}>
                  <span className="ic s">save</span>Simpan Perubahan
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
           * VIEW 1: HASIL & EVALUASI 9 UNSUR
           * ══════════════════════════════════════════════════════════════════*/}
          {skmSubTab === 'results' && (
            <>
              <div className="g21">
                {/* 9 UNSUR PELAYANAN TABLE */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-hd-l">
                      <div className="card-title">Evaluasi 9 Unsur Pelayanan Publik (PermenPAN-RB No. 14/2017)</div>
                      <div className="card-sub">Bobot Nilai Rata-Rata Tertimbang = 0.111 per Unsur</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn ghost sm" onClick={() => setSkmSubTab('questions')}>
                        <span className="ic s">edit_note</span>Lihat Pertanyaan
                      </button>
                      <button className="btn pri sm" onClick={() => setActiveTab('laporan')}>
                        <span className="ic s">description</span>Buka Laporan Akhir SKM
                      </button>
                    </div>
                  </div>

                  <table className="tbl" style={{ fontSize: '12.5px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>Kode</th>
                        <th>Unsur Pelayanan</th>
                        <th style={{ textAlign: 'right' }}>Nilai NRR</th>
                        <th style={{ textAlign: 'right' }}>Persentase Baik</th>
                        <th>Kategori Mutu</th>
                        <th>Catatan &amp; Tag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skmUnsurList.map(u => (
                        <tr key={u.code}>
                          <td style={{ fontWeight: '700', color: 'var(--blue)' }}>{u.code}</td>
                          <td style={{ fontWeight: '600' }}>{u.name}</td>
                          <td style={{ textAlign: 'right', fontWeight: '700' }}>{u.score.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>{u.pctBaik}%</td>
                          <td>
                            <span className={`bdg ${u.status === 'Sangat Baik' ? 'g' : 'b'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td>
                            {u.tag && (
                              <span className={`bdg ${u.tag === 'Tertinggi' || u.tag === 'Unggulan' ? 'g' : 'r'}`}>
                                {u.tag}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SUMMARY RIGHT PANEL */}
                <div className="col">
                  <div className="card" style={{ background: 'var(--bg2)', border: '1.5px solid var(--blue)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                      KATEGORI MUTU SKM (PERMENPAN-RB)
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: 'var(--srf)' }}>
                        <span>88.31 – 100.00</span><strong style={{ color: '#10b981' }}>A (Sangat Baik)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <span>76.61 – 88.30</span><strong style={{ color: '#2563eb' }}>B (Baik) ← RSUD DAYA (83.46)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: 'var(--srf)' }}>
                        <span>65.00 – 76.60</span><strong style={{ color: '#f59e0b' }}>C (Kurang Baik)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: 'var(--srf)' }}>
                        <span>25.00 – 64.99</span><strong style={{ color: '#ef4444' }}>D (Tidak Baik)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-hd"><div className="card-hd-l"><div className="card-title">Unsur Tertinggi &amp; Terendah</div></div></div>
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ padding: '8px 12px', background: '#f0fdf4', borderLeft: '3px solid #10b981', borderRadius: '6px' }}>
                        <div style={{ fontWeight: '700', color: '#064e3b' }}>🏆 Unsur Tertinggi</div>
                        <div style={{ color: '#047857', marginTop: '2px' }}>U9. Penanganan Pengaduan (3.52) &amp; U4. Biaya/Tarif (3.45)</div>
                      </div>
                      <div style={{ padding: '8px 12px', background: '#fef2f2', borderLeft: '3px solid #ef4444', borderRadius: '6px' }}>
                        <div style={{ fontWeight: '700', color: '#991b1b' }}>⚠️ Unsur Perlu Perbaikan</div>
                        <div style={{ color: '#b91c1c', marginTop: '2px' }}>U7. Perilaku Pelaksana (3.05) &amp; U6. Kompetensi (3.08)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 15 UNIT PELAYANAN TABLE */}
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-hd">
                  <div className="card-hd-l">
                    <div className="card-title">Breakdown Kepuasan per 15 Unit Pelayanan RS</div>
                    <div className="card-sub">Distribusi 2.802 responden dan poin area kritis per jenis pelayanan.</div>
                  </div>
                </div>
                <table className="tbl" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}>No</th>
                      <th>Jenis Pelayanan / Unit</th>
                      <th style={{ textAlign: 'right' }}>Jumlah Responden</th>
                      <th style={{ textAlign: 'right' }}>Persentase</th>
                      <th style={{ textAlign: 'right' }}>Skor SKM</th>
                      <th>Fokus Isu Utama (Umpan Balik)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skmUnitList.map(unit => (
                      <tr key={unit.no}>
                        <td style={{ textAlign: 'center', color: 'var(--t3)' }}>{unit.no}</td>
                        <td style={{ fontWeight: '600', color: 'var(--t1)' }}>{unit.name}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{unit.resp}</td>
                        <td style={{ textAlign: 'right' }}>{unit.pct.toFixed(2)}%</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: unit.score >= 3.3 ? '#10b981' : unit.score >= 3.1 ? 'var(--blue)' : '#ef4444' }}>
                          {unit.score > 0 ? unit.score.toFixed(2) : '—'}
                        </td>
                        <td style={{ color: 'var(--t2)', fontSize: '11.5px' }}>{unit.issue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
           * VIEW 2: SUSUNAN KUESIONER & EDITOR PERTANYAAN SKM (9 UNSUR)
           * ══════════════════════════════════════════════════════════════════*/}
          {skmSubTab === 'questions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Information Banner */}
              <div style={{ padding: '14px 18px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span className="ic" style={{ color: '#2563eb', fontSize: '24px', marginTop: '2px' }}>info</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#1e40af' }}>
                    Panduan Kustomisasi Kuesioner SKM (PermenPAN-RB No. 14 Tahun 2017)
                  </div>
                  <div style={{ fontSize: '12px', color: '#1e3a8a', marginTop: '4px', lineHeight: 1.5 }}>
                    Format ini memuat 9 Unsur Pelayanan Publik baku. Anda dapat menyesuaikan redaksi kalimat pertanyaan agar lebih komunikatif bagi pasien RS (misal menyebutkan nama Poli/Dokter) serta menyunting 4 opsi jawaban skala Likert (Nilai 1 s/d 4). Perubahan akan otomatis teraplikasikan pada kuesioner saat pasien men-scan barcode standee.
                  </div>
                </div>
              </div>

              {/* Questions List Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {skmQuestions.map((q, qIdx) => (
                  <div
                    key={q.code || qIdx}
                    className="card"
                    style={{ borderLeft: q.mandatory ? '4px solid var(--blue)' : '4px solid #10b981', padding: '16px 20px' }}>
                    
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: q.mandatory ? 'var(--blue)' : '#10b981', color: '#fff',
                          padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800
                        }}>
                          {q.code}
                        </span>
                        <strong style={{ fontSize: '13.5px', color: 'var(--t1)' }}>{q.name}</strong>
                        {q.mandatory ? (
                          <span style={{ fontSize: '10px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            Mandatori PermenPAN-RB
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            Pertanyaan Kustom RS
                          </span>
                        )}
                      </div>

                      {!q.mandatory && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSkmQuestion(qIdx)}
                          className="btn ghost sm"
                          style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '3px 8px', fontSize: '11px' }}>
                          <span className="ic s" style={{ fontSize: '14px' }}>delete</span> Hapus
                        </button>
                      )}
                    </div>

                    {/* Question Text Editor */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t3)', marginBottom: '4px' }}>
                        TEKS PERTANYAAN (YANG DITAMPILKAN KE PASIEN):
                      </label>
                      <textarea
                        value={q.question}
                        onChange={e => handleUpdateQuestionText(qIdx, e.target.value)}
                        rows={2}
                        style={{
                          width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line2)',
                          background: 'var(--srf)', fontSize: '12.5px', color: 'var(--t1)', fontFamily: 'inherit',
                          lineHeight: 1.4, resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* 4 Scale Options Grid */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--t3)' }}>
                          4 PILIHAN JAWABAN SKALA LIKERT (BOBOT NILAI 1 - 4):
                        </label>
                        <span style={{ fontSize: '10px', color: 'var(--t3)' }}>Kiri: Nilai 1 (Terendah) → Kanan: Nilai 4 (Tertinggi)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} style={{ background: 'var(--bg2)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--line2)' }}>
                            <div style={{ fontSize: '9.5px', fontWeight: 700, color: optIdx === 0 ? '#ef4444' : optIdx === 1 ? '#f59e0b' : optIdx === 2 ? '#2563eb' : '#10b981', marginBottom: '3px' }}>
                              Skala {optIdx + 1} ({optIdx === 0 ? 'Kurang' : optIdx === 1 ? 'Cukup' : optIdx === 2 ? 'Baik' : 'Sangat Baik'})
                            </div>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '11.5px', color: 'var(--t1)' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--srf)', borderRadius: '12px', border: '1px solid var(--line2)' }}>
                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
                  Total <strong>{skmQuestions.length} Butir Pertanyaan</strong> aktif untuk Survei SKM RSUD Daya.
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setMobilePreviewStep(0);
                      setShowMobilePreview(true);
                    }}
                    className="btn ghost"
                    style={{ color: '#2563eb', borderColor: '#2563eb' }}>
                    <span className="ic s">phone_android</span>Preview Pasien (Mobile)
                  </button>
                  <button
                    onClick={handleSaveSkmQuestions}
                    className="btn pri"
                    style={{ background: '#10b981' }}>
                    <span className="ic s">save</span>Simpan Semua Perubahan
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
           * MODAL: SMARTPHONE MOBILE SURVEY SIMULATOR (PREVIEW PASIEN)
           * ══════════════════════════════════════════════════════════════════*/}
          {showMobilePreview && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)',
              zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}>
              <div style={{
                width: '360px', height: '680px', background: '#ffffff', borderRadius: '36px',
                border: '8px solid #1e293b', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
              }}>
                {/* Phone Speaker & Notch */}
                <div style={{ height: '24px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '48px', height: '4px', background: '#475569', borderRadius: '2px' }}></div>
                </div>

                {/* Mobile App Header */}
                <div style={{ padding: '12px 16px', background: '#2563eb', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', opacity: 0.85, letterSpacing: '0.5px' }}>RSIA ANANDA MAKASSAR</div>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>Survei Kepuasan Pasien</div>
                  </div>
                  <button
                    onClick={() => setShowMobilePreview(false)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}>
                    <span className="ic s">close</span>
                  </button>
                </div>

                {/* Mobile Progress Bar */}
                <div style={{ height: '4px', background: '#e2e8f0', width: '100%' }}>
                  <div style={{
                    height: '100%', background: '#10b981',
                    width: `${((mobilePreviewStep + 1) / skmQuestions.length) * 100}%`,
                    transition: 'width .2s ease-in-out'
                  }}></div>
                </div>

                {/* Mobile Body Content */}
                <div style={{ flex: 1, padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
                  {mobilePreviewStep < skmQuestions.length ? (
                    <div>
                      {/* Step Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px' }}>
                          {skmQuestions[mobilePreviewStep].code} • {skmQuestions[mobilePreviewStep].name}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                          {mobilePreviewStep + 1} dari {skmQuestions.length}
                        </span>
                      </div>

                      {/* Question Text */}
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.45, marginBottom: '18px' }}>
                        {skmQuestions[mobilePreviewStep].question}
                      </div>

                      {/* 4 Interactive Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {skmQuestions[mobilePreviewStep].options.map((opt, oIdx) => {
                          const isSelected = mobileAnswers[mobilePreviewStep] === oIdx;
                          return (
                            <div
                              key={oIdx}
                              onClick={() => {
                                setMobileAnswers(prev => ({ ...prev, [mobilePreviewStep]: oIdx }));
                              }}
                              style={{
                                padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                                background: isSelected ? '#eff6ff' : '#f8fafc',
                                border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                transition: '.15s'
                              }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '24px', height: '24px', borderRadius: '50%',
                                  background: isSelected ? '#2563eb' : '#fff',
                                  color: isSelected ? '#fff' : '#64748b',
                                  border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                                  fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  {oIdx + 1}
                                </div>
                                <span style={{ fontSize: '12.5px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1e40af' : '#1e293b' }}>
                                  {opt}
                                </span>
                              </div>
                              {isSelected && <span className="ic s" style={{ color: '#2563eb', fontSize: '18px' }}>check_circle</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Completion Screen */
                    <div style={{ textAlign: 'center', padding: '40px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        <span className="ic" style={{ fontSize: '36px' }}>verified</span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>Terima Kasih!</h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                        Penilaian Anda terhadap 9 Unsur Pelayanan Publik RSUD Daya telah berhasil direkam ke sistem SKM.
                      </p>
                      <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '11.5px', color: '#15803d', fontWeight: 700 }}>
                        🎁 +20 Poin Loyalitas Pasien Ditambahkan
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                      type="button"
                      disabled={mobilePreviewStep === 0}
                      onClick={() => setMobilePreviewStep(prev => Math.max(0, prev - 1))}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1',
                        background: '#fff', color: '#475569', fontSize: '12px', fontWeight: 700,
                        cursor: mobilePreviewStep === 0 ? 'not-allowed' : 'pointer', opacity: mobilePreviewStep === 0 ? 0.4 : 1
                      }}>
                      Kembali
                    </button>

                    {mobilePreviewStep < skmQuestions.length ? (
                      <button
                        type="button"
                        onClick={() => setMobilePreviewStep(prev => prev + 1)}
                        style={{
                          flex: 1.5, padding: '10px', borderRadius: '10px', border: 'none',
                          background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                        }}>
                        {mobilePreviewStep === skmQuestions.length - 1 ? 'Kirim Survei' : 'Berikutnya →'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMobilePreviewStep(0);
                          setMobileAnswers({});
                        }}
                        style={{
                          flex: 1.5, padding: '10px', borderRadius: '10px', border: 'none',
                          background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                        }}>
                        Ulangi Simulasi ↺
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div style={{ height: '18px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100px', height: '4px', background: '#94a3b8', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 3: LAPORAN AKHIR SKM OTOMATIS & BANNER DOKUMEN LENGKAP
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'laporan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px', margin: '0 auto' }}>
          
          {/* BANNER UTAMA — GENERATE LAPORAN LENGKAP (21 HALAMAN) */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            borderRadius: '16px', padding: '24px 28px', color: '#fff', boxShadow: '0 12px 30px rgba(49, 46, 129, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                <span className="ic s" style={{ fontSize: '14px', color: '#fbbf24' }}>star</span> Dokumen Resmi Kinerja Pelayanan Publik
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff', lineHeight: 1.3 }}>
                Generate Laporan Lengkap SKM Tahun 2025 (PDF 21 Halaman)
              </h2>
              <p style={{ fontSize: '13px', color: '#e0e7ff', margin: 0, lineHeight: 1.5, opacity: 0.9 }}>
                Hasilkan dokumen cetak resmi secara otomatis dengan struktur lengkap persis <strong>Laporan Akhir SKM Tahun 2025 RSUD Daya.pdf</strong> (Cover, BAB I Pendahuluan, BAB II Analisis 9 Unsur &amp; Demografi, BAB III Rekomendasi Per Unit, serta Lembar Pengesahan).
              </p>
            </div>
            <button
              onClick={() => setFullReportModalOpen(true)}
              style={{
                background: '#ffffff', color: '#312e81', border: 'none', padding: '14px 24px', borderRadius: '12px',
                fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }}>
              <span className="ic" style={{ fontSize: '20px', color: '#4338ca' }}>picture_as_pdf</span>
              Generate &amp; Pratinjau Laporan Lengkap (21 Hlm)
            </button>
          </div>

          {/* DOKUMEN RINGKASAN DISPLAY */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {/* TOOLBAR BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                Pratinjau Ringkas Laporan Akhir SKM Tahun 2025
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn ghost sm" onClick={() => setFullReportModalOpen(true)} style={{ color: '#2563eb', borderColor: '#bfdbfe' }}>
                  <span className="ic s">visibility</span>Pratinjau Laporan Full (21 Hlm)
                </button>
                <button className="btn ghost sm" onClick={() => window.print()} style={{ color: '#475569' }}>
                  <span className="ic s">print</span>Cetak Halaman Ini
                </button>
              </div>
            </div>

            {/* DOCUMENT HEADER / COVER */}
            <div style={{ textAlign: 'center', marginBottom: '36px', borderBottom: '3px double #0f172a', paddingBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '1px', color: '#475569', textTransform: 'uppercase' }}>RUMAH SAKIT UMUM DAERAH DAYA KOTA MAKASSAR</div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px 0', textTransform: 'uppercase' }}>
                LAPORAN AKHIR SURVEI KEPUASAN MASYARAKAT (SKM)
              </h1>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#2563eb' }}>TAHUN ANGGARAN 2025</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Berdasarkan Peraturan Menteri PAN-RB No. 14 Tahun 2017</div>
            </div>

            {/* BAB I */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px' }}>
                BAB I: PENDAHULUAN
              </h3>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#334155', textAlign: 'justify', marginBottom: '10px' }}>
                Survei Kepuasan Masyarakat (SKM) pada RSUD Daya Kota Makassar dilaksanakan sebagai upaya peningkatan mutu pelayanan publik dan akuntabilitas organisasi secara berkesinambungan. Pelaksanaan survei berpedoman pada Peraturan Menteri PAN-RB Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Metodologi Sampel (Krejcie &amp; Morgan)</div>
                  <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>
                    Perhitungan sampel menggunakan taraf kesalahan 5% (λ² = 3.841, d = 0.05) dengan metode <i>incidental sampling</i>. Dari hasil pencacahan, diperoleh total <strong>2.802 Responden</strong> dari 15 unit pelayanan.
                  </div>
                </div>
                <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>Hasil Indeks Kepuasan (IKM)</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>Nilai IKM: 83.46</div>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#166534' }}>MUTU PELAYANAN: B (BAIK)</div>
                  <div style={{ fontSize: '11px', color: '#1e40af' }}>Nilai NRR Tertimbang: 3.339 dari skala 4.00</div>
                </div>
              </div>
            </div>

            {/* BAB II */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px' }}>
                BAB II: ANALISIS HASIL SURVEI
              </h3>
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                1. Evaluasi 9 Unsur Pelayanan Publik
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#0f172a' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>Unsur</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Nama Unsur Pelayanan</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>Nilai NRR</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>NRR Tertimbang</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>Mutu</th>
                  </tr>
                </thead>
                <tbody>
                  {skmUnsurList.map(u => (
                    <tr key={u.code}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '700' }}>{u.code}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{u.name}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right', fontWeight: '600' }}>{u.score.toFixed(2)}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>{(u.score * 0.111).toFixed(3)}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', fontWeight: '600', color: u.status === 'Sangat Baik' ? '#166534' : '#1e40af' }}>
                        {u.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BAB III */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '12px' }}>
                BAB III: PENUTUP &amp; REKOMENDASI TINDAKAN PERBAIKAN (SINTETA AI)
              </h3>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#334155', marginBottom: '12px' }}>
                Berdasarkan hasil survei, unsur dengan nilai terendah terdapat pada <strong>U7. Perilaku Pelaksana (3.05)</strong> dan <strong>U6. Kompetensi Pelaksana (3.08)</strong>. Berikut matriks rekomendasi perbaikan per unit pelayanan:
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', lineHeight: '1.4' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    <th style={{ border: '1px solid #0f172a', padding: '6px', width: '120px' }}>Unit Pelayanan</th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px', width: '90px' }}>Unsur Kritis</th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px' }}>Alasan &amp; Opini Responden</th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px' }}>Kemungkinan Faktor Penyebab</th>
                    <th style={{ border: '1px solid #0f172a', padding: '6px' }}>Rekomendasi Perbaikan (AI Sinteta)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>1. Ruang Tunggu Lobi</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '600' }}>U3. Waktu Penyelesaian</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Kurang cepat respon &amp; penyampaian alur belum konsisten</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Petugas pendaftaran belum terstandarisasi penjelasannya</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Latih komunikasi efektif &amp; buat sosialisasi alur singkat saat pendaftaran</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>2. Poliklinik</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '600' }}>U3. Waktu Penyelesaian</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Dokter belum hadir sesuai jadwal, antrean RME lambat</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Jadwal poli/visite bentrok &amp; gangguan koneksi jaringan IT</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Atur ulang jadwal dokter jam padat &amp; sediakan fallback jaringan manual RME</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>3. Apotek / Farmasi</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '600' }}>U3. Waktu Penyelesaian</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Waktu tunggu obat racikan lama &amp; penanganan kurang cepat</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Proses racikan manual &amp; penumpukan resep pada jam puncak</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Buka loket khusus resep sederhana &amp; gunakan barcode tracking racikan</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>4. IGD</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '600' }}>U1 &amp; U7. Perilaku</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Verifikasi jaminan lambat &amp; kurang empatik saat penanganan</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Stres kerja tinggi &amp; kendala jaminan BPJS/umum di pintu masuk</td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Terapkan primary triage di pintu masuk &amp; pelatihan komunikasi empati berkala</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Dokumen resmi digenerate otomatis oleh Sinteta AI<br />
                  Policare Platform — RSUD Daya Kota Makassar
                </div>
                <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#0f172a' }}>
                  Makassar, 31 Desember 2025<br />
                  <strong>Ketua Tim Survei Kepuasan Masyarakat</strong><br /><br /><br />
                  <u><strong>dr. Ratna Kusuma, M.Kes</strong></u><br />
                  NIP. 19780512 200501 2 004
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * FULL REPORT MODAL (21-PAGE REPORT VIEWER BASED ON RSUD DAYA 2025 PDF)
       * ═════════════════════════════════════════════════════════════════════*/}
      {fullReportModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)',
          zIndex: 99999, display: 'flex', flexDirection: 'column', padding: '16px'
        }}>
          {/* MODAL HEADER */}
          <div style={{
            background: '#1e293b', color: '#fff', borderRadius: '12px 12px 0 0', padding: '14px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="ic" style={{ color: '#38bdf8', fontSize: '24px' }}>picture_as_pdf</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                  Laporan Akhir Survei Kepuasan Masyarakat (SKM) Tahun 2025 — Dokumen Lengkap
                </h3>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Struktur Resmi 21 Halaman · RSUD Daya Kota Makassar (PermenPAN-RB No. 14/2017)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn ghost sm" onClick={() => window.print()} style={{ color: '#38bdf8', borderColor: '#0284c7' }}>
                <span className="ic s">print</span>Cetak Dokumen PDF
              </button>
              <button className="btn pri sm" onClick={() => alert('Mengunduh file PDF Laporan Akhir SKM Tahun 2025 RSUD Daya (21 Halaman)...')}>
                <span className="ic s">download</span>Unduh PDF (.pdf)
              </button>
              <button onClick={() => setFullReportModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                <span className="ic">close</span>
              </button>
            </div>
          </div>

          {/* MODAL BODY (SCROLLABLE DOKUMEN 21 HALAMAN) */}
          <div style={{
            flex: 1, overflowY: 'auto', background: '#f1f5f9', padding: '24px', borderRadius: '0 0 12px 12px',
            display: 'flex', justifyContent: 'center'
          }}>
            <div style={{ width: '100%', maxWidth: '900px', background: '#ffffff', color: '#0f172a', padding: '48px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', fontSize: '12px', lineHeight: '1.6' }}>

              {/* COVER PAGE */}
              <div style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '40px', marginBottom: '40px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#334155', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px' }}>
                  LAPORAN AKHIR
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>
                  SURVEI KEPUASAN MASYARAKAT (SKM)
                </h1>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb', margin: 0 }}>
                  RSUD DAYA KOTA MAKASSAR
                </h2>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#475569', marginTop: '6px' }}>
                  TAHUN 2025
                </div>

                <div style={{ marginTop: '120px', fontSize: '12px', color: '#64748b', lineHeight: '1.8' }}>
                  <strong>PEMERINTAH KOTA MAKASSAR</strong><br />
                  DINAS KESEHATAN KOTA MAKASSAR<br />
                  RUMAH SAKIT UMUM DAERAH DAYA KOTA MAKASSAR<br />
                  JL. PERINTIS KEMERDEKAAN KM. 14 MAKASSAR
                </div>
              </div>

              {/* DAFTAR ISI & KATA PENGANTAR */}
              <div style={{ marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #0f172a', paddingBottom: '4px', marginBottom: '14px' }}>
                  DAFTAR ISI LAPORAN AKHIR
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span><strong>BAB I PENDAHULUAN</strong></span><span>Halaman 2</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>1. Latar Belakang</span><span>Hlm 2</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>2. Tujuan Kegiatan</span><span>Hlm 2</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>3. Metodologi (Populasi, Sampel Krejcie &amp; Morgan, Responden)</span><span>Hlm 2 - 3</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>4. Tim Survei &amp; Jadwal Pelaksanaan</span><span>Hlm 3</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}><span><strong>BAB II ANALISIS &amp; HASIL SURVEI</strong></span><span>Halaman 4</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>1. Jenis Pelayanan (15 Unit Pelayanan)</span><span>Hlm 4</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>2. Analisis Demografi Responden</span><span>Hlm 5 - 6</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>3. Evaluasi 9 Unsur Pelayanan Publik (U1 s.d. U9)</span><span>Hlm 7 - 15</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>4. Ulasan &amp; Saran Masukan Responden</span><span>Hlm 15</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}><span><strong>BAB III PENUTUP &amp; REKOMENDASI</strong></span><span>Halaman 16</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>1. Kesimpulan (IKM: 83.46 / Mutu B BAIK)</span><span>Hlm 16</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}><span>2. Rekomendasi Tindakan Perbaikan Per Unit</span><span>Hlm 16 - 21</span></div>
                </div>
              </div>

              {/* BAB I PENDAHULUAN LENGKAP */}
              <div style={{ marginBottom: '36px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #2563eb', paddingBottom: '4px', marginBottom: '14px' }}>
                  BAB I: PENDAHULUAN
                </h2>
                
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>1. Latar Belakang</h4>
                <p style={{ textAlign: 'justify', color: '#334155', marginBottom: '12px' }}>
                  Survei Kepuasan Masyarakat pada RSUD Daya Kota Makassar dilaksanakan sebagai bagian dari upaya peningkatan mutu layanan publik dan akuntabilitas organisasi. Latar belakang pelaksanaan survei ini didasari oleh kebutuhan untuk mengukur sejauh mana pelayanan rumah sakit telah memenuhi harapan dan kebutuhan pasien serta keluarga, sekaligus sebagai instrumen evaluasi terhadap penerapan standar pelayanan kesehatan yang telah ditetapkan oleh pemerintah daerah dan kementerian terkait.
                </p>

                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>2. Tujuan Kegiatan</h4>
                <p style={{ textAlign: 'justify', color: '#334155', marginBottom: '12px' }}>
                  Kegiatan Survei Kepuasan Masyarakat terhadap pelayanan publik bertujuan untuk mendapatkan feedback / umpan balik atas kinerja pelayanan yang diberikan kepada masyarakat guna perbaikan dan peningkatan kinerja pelayanan secara berkesinambungan.
                </p>

                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>3. Metodologi</h4>
                <p style={{ textAlign: 'justify', color: '#334155', marginBottom: '8px' }}>
                  <strong>3.1 Populasi:</strong> Populasi dari kegiatan Survei Kepuasan Masyarakat adalah pasien, keluarga pasien, dan pengunjung RSUD Daya Kota Makassar.<br />
                  <strong>3.2 Sampel (Rumus Krejcie &amp; Morgan):</strong>
                </p>
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', fontFamily: 'monospace', fontSize: '13px', color: '#0f172a', marginBottom: '10px' }}>
                  S = (λ² · N · P · Q) / (d² (N - 1) + λ² · P · Q)
                  <div style={{ fontSize: '11px', fontFamily: 'sans-serif', color: '#475569', marginTop: '6px' }}>
                    Keterangan: S = Jumlah sampel, λ² = 3.841 (taraf kesalahan 5%), P = Q = 0.5, d = 0.05.
                  </div>
                </div>
                <p style={{ textAlign: 'justify', color: '#334155', marginBottom: '12px' }}>
                  Dari pelaksanaan survei yang dilakukan, jumlah responden yang berhasil dihimpun secara sah adalah sebanyak <strong>2.802 responden</strong>.
                </p>
              </div>

              {/* BAB II ANALISIS LENGKAP */}
              <div style={{ marginBottom: '36px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #2563eb', paddingBottom: '4px', marginBottom: '14px' }}>
                  BAB II: ANALISIS &amp; HASIL SURVEI
                </h2>

                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>1. Persentase Responden Berdasarkan Jenis Pelayanan (Tabel 1)</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#fff' }}>
                      <th style={{ border: '1px solid #0f172a', padding: '6px', width: '30px' }}>No</th>
                      <th style={{ border: '1px solid #0f172a', padding: '6px' }}>Jenis Pelayanan</th>
                      <th style={{ border: '1px solid #0f172a', padding: '6px', textAlign: 'right' }}>Jumlah Responden</th>
                      <th style={{ border: '1px solid #0f172a', padding: '6px', textAlign: 'right' }}>Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skmUnitList.map(u => (
                      <tr key={u.no}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>{u.no}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', fontWeight: '600' }}>{u.name}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'right', fontWeight: '700' }}>{u.resp}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'right' }}>{u.pct.toFixed(2)}%</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f1f5f9', fontWeight: '800' }}>
                      <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>TOTAL RESPONDEN</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>2.802</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>100%</td>
                    </tr>
                  </tbody>
                </table>

                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>2. Hasil Evaluasi 9 Unsur Pelayanan Publik (U1 - U9)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  {skmUnsurList.map(u => (
                    <div key={u.code} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '800', color: '#2563eb' }}>{u.code}. {u.name}</span>
                        <strong style={{ color: '#0f172a' }}>{u.score.toFixed(2)} / 4.00</strong>
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Baik: {u.pctBaik}%</span>
                        <span>Sangat Baik: {u.sangatBaik}%</span>
                        <span>Cukup/Buruk: {(u.cukup + u.buruk).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BAB III PENUTUP & REKOMENDASI LENGKAP */}
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #2563eb', paddingBottom: '4px', marginBottom: '14px' }}>
                  BAB III: PENUTUP &amp; REKOMENDASI TINDAKAN
                </h2>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e40af', marginBottom: '4px' }}>1. KESIMPULAN HASIL SURVEI</div>
                  <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.6' }}>
                    • Nilai Indeks Kepuasan Masyarakat (IKM): <strong>3.339</strong><br />
                    • Nilai Konversi IKM (Skala 25–100): <strong>83.46</strong><br />
                    • Mutu Pelayanan Publik: <strong style={{ color: '#166534' }}>B (BAIK)</strong><br />
                    • Unsur Tertinggi: <strong>U9 (Penanganan Pengaduan 3.52), U4 (Biaya/Tarif 3.45), U2 (Prosedur 3.42)</strong><br />
                    • Unsur Terendah: <strong>U7 (Perilaku Pelaksana 3.05), U6 (Kompetensi Pelaksana 3.08)</strong>
                  </div>
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>2. Matriks Rekomendasi Tindakan Perbaikan Lengkap Per Unit</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', lineHeight: '1.4' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#fff' }}>
                      <th style={{ border: '1px solid #0f172a', padding: '6px', width: '110px' }}>Unit Pelayanan</th>
                      <th style={{ border: '1px solid #0f172a', padding: '6px', width: '80px' }}>Unsur</th>
                      <th style={{ border: '1px solid #0f172a', padding: '6px' }}>Alasan &amp; Opini Responden</th>
                      <th style={{ border: '1px solid #0f172a', padding: '6px' }}>Kemungkinan Penyebab</th>
                      <th style={{ border: '1px solid #0f172a', padding: '6px' }}>Rekomendasi Perbaikan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>1. Ruang Tunggu Lobi</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '700' }}>U3. Waktu</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Kurang cepat respon &amp; informasi alur belum konsisten</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Penjelasan alur pendaftaran oleh petugas belum terstandar</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Latih komunikasi efektif &amp; sosialisasi alur singkat saat pendaftaran</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>2. Poliklinik</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '700' }}>U3. Waktu</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Dokter hadir tidak sesuai jadwal, antrean RME lambat</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Jadwal poli/visite/operasi bentrok &amp; gangguan jaringan IT</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Analisis beban jam padat, atur ulang jadwal dokter, &amp; perbaiki jaringan IT</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>3. Rawat Inap</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '700' }}>U8. Sarpras</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Toilet kurang nyaman &amp; kebersihan kamar perawatan</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Frekuensi pembersihan belum teratur di jam sibuk</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Sediakan checklist pemeliharaan rutin &amp; survei fasilitas harian</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>4. Radiologi</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '700' }}>U2. Prosedur</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Prosedur persiapan pemeriksaan susah dipahami</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Ketiadaan panduan visual persiapan pasien (puasa/kontras)</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Pasang poster infografis persiapan pemeriksaan di depan rontgen/CT-Scan</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>5. Apotek / Farmasi</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '700' }}>U3. Waktu</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Waktu tunggu obat racikan lama &amp; antrean menumpuk</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Kapasitas racikan manual tidak sebanding volume resep</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Buka loket khusus resep simpel, gunakan barcode tracking, &amp; estimasi display</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>6. ICU / HCU</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '700' }}>U3. Waktu</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Informasi perkembangan kondisi pasien belum cepat</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Prosedur edukasi keluarga pasien intensif belum terjadwal</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Tetapkan jam konsultasi berkala Dokter DPJP dengan keluarga pasien</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: '700' }}>7. IGD</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#b91c1c', fontWeight: '700' }}>U1 &amp; U7</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Verifikasi jaminan lambat &amp; petugas kurang ramah saat krisis</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Beban kerja tinggi di triase &amp; komunikasi empati kurang</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '6px', background: '#f0fdf4' }}>Terapkan primary triage di pintu masuk &amp; pelatihan service excellence berkala</td>
                    </tr>
                  </tbody>
                </table>

                {/* SIGNATURE BOX */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Dokumen Hasil Olahan Otomatis Platform Policare<br />
                    Berdasarkan Data Mentah 2.802 Responden Terverifikasi
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#0f172a' }}>
                    Makassar, 31 Desember 2025<br />
                    <strong>Direktur RSUD Daya Kota Makassar</strong><br /><br /><br /><br />
                    <u><strong>dr. H. Ahmad Asy’ari, Sp.OG, M.Kes</strong></u><br />
                    NIP. 19740315 200212 1 003
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* MODAL FOOTER */}
          <div style={{
            background: '#1e293b', color: '#fff', borderRadius: '0 0 12px 12px', padding: '12px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155'
          }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Dokumen Resmi RSUD Daya Kota Makassar — Generasi Sinteta AI</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn ghost sm" onClick={() => setFullReportModalOpen(false)} style={{ color: '#94a3b8', borderColor: '#475569' }}>
                Tutup Pratinjau
              </button>
              <button className="btn pri sm" onClick={() => window.print()} style={{ background: '#2563eb' }}>
                <span className="ic s">print</span>Cetak Laporan Full (21 Hlm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
