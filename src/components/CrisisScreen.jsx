import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 *  CrisisScreen.jsx — Crisis Management Center (Pilar 1: Issue & Crisis Resolution)
 *
 *  Fitur Utama:
 *  1. Monitoring Sinyal Krisis dari Voice & Feedback Pasien & Hasil Riset SKM
 *  2. Sinteta AI Risk Analyzer & Rekomendasi Penanganan Cepat
 *  3. Mekanisme Pemberitahuan ke Bagian Mutu (KMKP) untuk Verifikasi Data Pasien di SIMRS
 *  4. Human-in-the-Loop Decision (Terima, Modifikasi, atau Tolak AI)
 *  5. Rekam Jejak (Audit Trail) Lengkap dan Terkunci
 * ─────────────────────────────────────────────────────────────────────────────*/

export default function CrisisScreen({
  feedbacks = [],
  onSubmitEscalation,
  onSubmitProcess,
  onSubmitQuickReply,
  active,
  accessLevel = 'ADMIN'
}) {
  const isReadOnly = accessLevel === 'VIEWER';
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL' | 'RADAR' | 'RISET'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'PENDING' | 'MUTU_NOTIFIED' | 'ESCALATED' | 'RESOLVED'

  // Selected Crisis Item for Modal & Detailed Inspection
  const [selectedCrisis, setSelectedCrisis] = useState(null);

  // Modals state
  const [aiDecision, setAiDecision] = useState('ACCEPTED'); // 'ACCEPTED' | 'EDITED' | 'REJECTED'
  const [customActionText, setCustomActionText] = useState('');
  const [customPressRelease, setCustomPressRelease] = useState('');
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateRecipient, setEscalateRecipient] = useState('Direktur Utama RSUD Daya');
  const [escalateNote, setEscalateNote] = useState('');
  const [showExecutiveBriefing, setShowExecutiveBriefing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Modal Pemberitahuan ke Bagian Mutu State
  const [isMutuModalOpen, setIsMutuModalOpen] = useState(false);
  const [mutuTargetCrisis, setMutuTargetCrisis] = useState(null);
  const [mutuDispatchChannel, setMutuDispatchChannel] = useState('WA'); // 'WA' | 'EMAIL' | 'INTERNAL'
  const [mutuCustomNote, setMutuCustomNote] = useState('');

  // Crisis Items Data State
  const [crisisItems, setCrisisItems] = useState([
    {
      id: 'cr-101',
      title: 'Dugaan Kelalaian Dosis Obat di Poli Spesialis Anak',
      sourceType: 'RADAR',
      sourceName: '📡 Radar Suara Pasien (WhatsApp CS & Rating 1-Star)',
      reporter: 'Ny. Ratna S. (Ibu Pasien)',
      patientRmHint: 'RM-882103 (Disebutkan pelapor)',
      department: 'Poli Anak & Depo Apotek Utama',
      severity: 'Kritis',
      timeReceived: 'Hari ini, 08:30 WITA',
      status: 'Open',
      mutuNotificationStatus: 'Belum Dikirim', // 'Belum Dikirim' | 'Pemberitahuan Terkirim ke Mutu' | 'Terverifikasi Pasien SIMRS' | 'Bukan Pasien Terdaftar'
      riskImpact: 'Potensi Viralisasi Medsos & Dampak Reputasi Legal RS (Skala 9/10)',
      body: 'Pasien mengaku menerima sirup antibiotik dengan dosis double setelah pulang dari Poli Anak. Pasien mengancam akan memposting ke grup komunitas & media sosial.',
      aiRecommendation: {
        riskAnalysis: 'Tingkat risiko reputasi sangat tinggi. Waktu tanggap ideal: < 2 jam.',
        actionPlan: '1. Kirim pemberitahuan ke Bagian Mutu untuk cek keabsahan pasien & resep di SIMRS.\n2. Hubungi pasien via telepon & jadwalkan klarifikasi bersama Tim Medis.\n3. Siapkan langkah mitigasi klarifikasi Humas.',
        pressRelease: 'Yth. Ibu Ratna, RSUD Daya menyampaikan permohonan maaf mendalam atas ketidaknyamanan ini. Tim Humas & Medis kami sedang memverifikasi kronologi resep guna memastikan keselamatan pasien.',
        compensation: 'Penggantian Obat Gratis + Voucher Medical Check-Up Anak'
      },
      handlingDecision: 'Menunggu Keputusan',
      auditTrail: [
        { time: '08:30 WITA', user: 'System (Sinteta AI)', event: 'Sinyal Krisis masuk dari 📡 Radar Suara Pasien (WA CS).' },
        { time: '08:32 WITA', user: 'Sinteta AI', event: 'Penilaian risiko reputasi otomatis (Level: KRITIS). Draf rekomendasi & pemberitahuan Mutu dibuat.' }
      ]
    },
    {
      id: 'cr-102',
      title: 'Temuan Riset SKM Q2: 42% Pasien Rawat Inap Mengeluhkan Ketidaktransparan Biaya',
      sourceType: 'RISET',
      sourceName: '📊 Hasil Riset / Survey SKM Kementerian (150 Responden)',
      reporter: 'Tim Riset Internal RS & Data SKM Q2 2026',
      patientRmHint: 'Kumpulan 63 Responden Pasien Rawat Inap',
      department: 'Kasir, Admisi & Keuangan Rawat Inap',
      severity: 'Tinggi',
      timeReceived: 'Kemarin, 14:15 WITA',
      status: 'Pemberitahuan Terkirim ke Mutu',
      mutuNotificationStatus: 'Pemberitahuan Terkirim ke Mutu',
      riskImpact: 'Penurunan Skor SKM RS & Potensi Dropout Pasien Rawat Inap hingga 25%',
      body: 'Analisis riset menunjukkan 42% responden pasien BPJS & Umum merasa kejutan tagihan di akhir rawat inap karena kurang penjelasan rincian rujukan obat non-BPJS di awal.',
      aiRecommendation: {
        riskAnalysis: 'Masalah sistemik administrasi. Berdampak pada penilaian Akreditasi RS.',
        actionPlan: '1. Cetak Lembar Edukasi Transparansi Biaya di Meja Admisi.\n2. Wajibkan Petugas Admisi melakukan briefing estimasi biaya sebelum pasien masuk rawat inap.',
        pressRelease: 'RSUD Daya berkomitmen meningkatkan transparansi informasi rincian biaya rawat inap melalui peluncuran Sistem Estimasi Biaya Digital.',
        compensation: 'Panduan Transparansi Biaya & Konsultasi Finansial Gratis'
      },
      handlingDecision: 'Saran AI Diterima',
      auditTrail: [
        { time: 'Kemarin 14:15', user: 'System (RisetHub)', event: 'Hasil survey riset SKM disinkronisasi. Temuan kritis terdeteksi (42% keluhan biaya).' },
        { time: 'Kemarin 14:20', user: 'Sinteta AI', event: 'Membuat draf program transparansi biaya & SOP baru.' },
        { time: 'Kemarin 15:00', user: 'Bpk. Fajar (Humas PR)', event: 'Pemberitahuan terkirim ke Bagian Mutu (KMKP) untuk telaah alur SIMRS Billing.' }
      ]
    },
    {
      id: 'cr-103',
      title: 'AC Mati & Penumpukan Antrean di Ruang Tunggu Poli Obgyn',
      sourceType: 'RADAR',
      sourceName: '📡 Radar Suara Pasien (Aplikasi Policare)',
      reporter: 'Ny. Sari Wulandari & 12 Pasien Poli',
      patientRmHint: 'RM-884102 & Pasien Rawat Jalan',
      department: 'Fasilitas & Layanan Poliklinik Kebidanan',
      severity: 'Sedang',
      timeReceived: '2 Hari lalu, 09:00 WITA',
      status: 'Selesai',
      mutuNotificationStatus: 'Terverifikasi Pasien SIMRS',
      riskImpact: 'Ketidaknyamanan Ibu Hamil Trimester 3 saat antre ANC',
      body: 'Keluhan disampaikan oleh beberapa ibu hamil karena ruang tunggu poli panas akibat AC sentral mati saat jam sibuk dokter.',
      aiRecommendation: {
        riskAnalysis: 'Risiko kepuasan fisik pasien kebidanan.',
        actionPlan: 'Pindahkan pasien sementara ke Lounge VIP, sediakan minuman dingin gratis, panggil teknisi darurat.',
        pressRelease: 'Mohon maaf atas gangguan fasilitas AC. Saat ini perbaikan telah selesai dan fasilitas kembali beroperasi dingin.',
        compensation: 'Voucher Refreshment Snack & Minuman Lounge VIP'
      },
      handlingDecision: 'Saran AI Diterima',
      auditTrail: [
        { time: '2 Hari lalu 09:00', user: 'System (Policare App)', event: 'Keluhan masuk dari 📡 Radar Layanan.' },
        { time: '2 Hari lalu 09:10', user: 'Bpk. Fajar (Humas PR)', event: 'Menerima saran AI & mengirim tim fasilitas darurat.' },
        { time: '2 Hari lalu 10:30', user: 'Teknisi RS', event: 'Perbaikan kompresor AC selesai. Pasien dipindahkan kembali.' },
        { time: '2 Hari lalu 11:00', user: 'Bpk. Fajar (Humas PR)', event: 'Krisis ditandai SELESAI. Audit Trail dikunci.' }
      ]
    }
  ]);

  // Sync incoming crisis events from props
  useEffect(() => {
    if (feedbacks && feedbacks.length > 0) {
      const incomingCrises = feedbacks
        .filter(f => f.sentiment === 'Kritis' || f.status === 'Eskalasi' || f.id?.toString().startsWith('SIMRS-CRISIS') || f.sourceType)
        .map(f => ({
          id: f.id || `cr-${Date.now()}`,
          title: f.title || `Keluhan Kritis: ${f.name || f.reporter || 'Pasien'} (${f.category || f.department || 'Layanan'})`,
          sourceType: f.sourceType || 'RADAR',
          sourceName: f.sourceName || `📡 Radar Suara Pasien (${f.channel || 'Kanal Langsung'})`,
          reporter: f.reporter || f.name || 'Pasien RSUD Daya',
          patientRmHint: f.meta || 'Perlu Cek SIMRS',
          department: f.department || f.category || 'Pelayanan Terkait',
          severity: 'Kritis',
          timeReceived: f.time || 'Baru saja',
          status: f.status === 'Selesai' ? 'Selesai' : f.status === 'Eskalasi' ? 'Eskalasi Pimpinan' : 'Open',
          mutuNotificationStatus: 'Belum Dikirim',
          riskImpact: f.riskImpact || 'Potensi Eskalasi Komplain Medis & Reputasi RS',
          body: f.body || 'Keluhan kritis memerlukan tanggapan segera dari tim Humas dan koordinasi verifikasi ke Bagian Mutu.',
          aiRecommendation: f.aiRecommendation || {
            riskAnalysis: 'Tingkat urgensi tinggi. Perlu verifikasi status pasien di SIMRS oleh Bagian Mutu.',
            actionPlan: `1. Kirim notifikasi pemberitahuan ke Bagian Mutu untuk cek data di SIMRS.\n2. Hubungi ${f.name || 'pasien'} untuk klarifikasi kronologis.\n3. Siapkan draf tanggapan resmi Humas.`,
            pressRelease: f.aiReplyDraft || `Yth. ${f.name || 'Pasien'}, RSUD Daya sedang menindaklanjuti keluhan Anda dengan prioritas utama.`,
            compensation: 'Voucher Layanan / Konsultasi Dokter DPJP'
          },
          handlingDecision: 'Menunggu Keputusan',
          auditTrail: f.auditTrail || [
            { time: f.time || 'Baru saja', user: 'System (Radar Layanan)', event: `Sinyal krisis masuk via ${f.channel || 'Sistem'}.` },
            { time: 'Baru saja', user: 'Sinteta AI', event: 'Penilaian risiko reputasi otomatis (Level: KRITIS).' }
          ]
        }));

      setCrisisItems(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const toAdd = incomingCrises.filter(c => !existingIds.has(c.id));
        return toAdd.length > 0 ? [...toAdd, ...prev] : prev;
      });
    }
  }, [feedbacks]);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Open Mutu Notification Modal
  const handleOpenMutuModal = (crisis) => {
    setMutuTargetCrisis(crisis);
    setMutuCustomNote(`Mohon bantuan Bagian Mutu (KMKP) untuk memeriksa di database SIMRS apakah pelapor (${crisis.reporter}) terdaftar sebagai pasien RSUD Daya, riwayat kunjungan terakhir, serta DPJP yang menangani.`);
    setIsMutuModalOpen(true);
  };

  // Dispatch Mutu Notification
  const handleSendMutuNotification = (e) => {
    e.preventDefault();
    if (!mutuTargetCrisis) return;

    const updatedStatus = 'Pemberitahuan Terkirim ke Mutu';

    setCrisisItems(prev => prev.map(item => {
      if (item.id === mutuTargetCrisis.id) {
        return {
          ...item,
          mutuNotificationStatus: updatedStatus,
          status: item.status === 'Open' ? 'Dalam Proses' : item.status,
          auditTrail: [
            ...item.auditTrail,
            {
              time: 'Baru saja',
              user: 'Bpk. Fajar (Humas PR)',
              event: `Pemberitahuan resmi DIKIRIM ke Bagian Mutu (KMKP) via ${mutuDispatchChannel === 'WA' ? 'WhatsApp Resmi Mutu' : mutuDispatchChannel === 'EMAIL' ? 'Email Komite Mutu' : 'Memo Internal RS'}. Permohonan: Cek status rekam medis pelapor di SIMRS.`
            }
          ]
        };
      }
      return item;
    }));

    if (selectedCrisis?.id === mutuTargetCrisis.id) {
      setSelectedCrisis(prev => ({
        ...prev,
        mutuNotificationStatus: updatedStatus,
        status: prev.status === 'Open' ? 'Dalam Proses' : prev.status
      }));
    }

    setIsMutuModalOpen(false);
    showToast(`📩 Pemberitahuan berhasil dikirimkan ke Bagian Mutu (Instruksi Cek SIMRS tercatat)!`);
  };

  // Update Status Verifikasi Pasien (Manual toggle by Humas based on Mutu's check)
  const handleUpdateSimrsStatus = (crisisId, simrsResult) => {
    setCrisisItems(prev => prev.map(item => {
      if (item.id === crisisId) {
        const newStatus = simrsResult === 'VERIFIED' ? 'Terverifikasi Pasien SIMRS' : 'Bukan Pasien Terdaftar';
        return {
          ...item,
          mutuNotificationStatus: newStatus,
          auditTrail: [
            ...item.auditTrail,
            {
              time: 'Baru saja',
              user: 'Humas / Bagian Mutu',
              event: `Hasil Cek SIMRS: ${simrsResult === 'VERIFIED' ? 'PELAPOR TERVERIFIKASI sebagai pasien aktif RSUD Daya.' : 'PELAPOR BUKAN PASIEN terdaftar di SIMRS (Potensi isu publik/eksternal).'}`
            }
          ]
        };
      }
      return item;
    }));

    if (selectedCrisis?.id === crisisId) {
      setSelectedCrisis(prev => ({
        ...prev,
        mutuNotificationStatus: simrsResult === 'VERIFIED' ? 'Terverifikasi Pasien SIMRS' : 'Bukan Pasien Terdaftar'
      }));
    }

    showToast(`Status SIMRS diperbarui: ${simrsResult === 'VERIFIED' ? 'Terverifikasi Pasien' : 'Bukan Pasien Terdaftar'}`);
  };

  // Accept AI Suggestion
  const handleAcceptAiSuggestion = (crisisId) => {
    setCrisisItems(prev => prev.map(item => {
      if (item.id === crisisId) {
        return {
          ...item,
          status: 'Dalam Proses',
          handlingDecision: 'Saran AI Diterima',
          auditTrail: [
            ...item.auditTrail,
            { time: 'Baru saja', user: 'Bpk. Fajar (Humas PR)', event: 'Humas MENYETUJUI Saran Penanganan AI & menjalankan draf klarifikasi resmi.' }
          ]
        };
      }
      return item;
    }));
    showToast('✅ Saran Penanganan AI disetujui & dijalankan oleh Humas!');
    if (selectedCrisis?.id === crisisId) {
      setSelectedCrisis(prev => ({
        ...prev,
        status: 'Dalam Proses',
        handlingDecision: 'Saran AI Diterima'
      }));
    }
  };

  // Modify AI Suggestion
  const handleEditAiSuggestion = (crisisId) => {
    setCrisisItems(prev => prev.map(item => {
      if (item.id === crisisId) {
        return {
          ...item,
          status: 'Dalam Proses',
          handlingDecision: 'Dimodifikasi Humas',
          aiRecommendation: {
            ...item.aiRecommendation,
            actionPlan: customActionText || item.aiRecommendation.actionPlan,
            pressRelease: customPressRelease || item.aiRecommendation.pressRelease
          },
          auditTrail: [
            ...item.auditTrail,
            { time: 'Baru saja', user: 'Bpk. Fajar (Humas PR)', event: 'Humas MEMODIFIKASI saran AI & menggunakan pernyataan resmi kustom Humas.' }
          ]
        };
      }
      return item;
    }));
    showToast('✎ Saran Penanganan berhasil dimodifikasi oleh Humas!');
  };

  // Reject AI Suggestion
  const handleRejectAiSuggestion = (crisisId) => {
    setCrisisItems(prev => prev.map(item => {
      if (item.id === crisisId) {
        return {
          ...item,
          status: 'Dalam Proses',
          handlingDecision: 'Saran AI Ditolak',
          auditTrail: [
            ...item.auditTrail,
            { time: 'Baru saja', user: 'Bpk. Fajar (Humas PR)', event: 'Humas MENOLAK saran AI dan menentukan prosedur kustom independen.' }
          ]
        };
      }
      return item;
    }));
    showToast('✕ Saran AI ditolak. Humas menggunakan penanganan kustom.');
  };

  // Escalate to Leadership
  const handleConfirmEscalation = (e) => {
    e.preventDefault();
    if (!selectedCrisis) return;

    setCrisisItems(prev => prev.map(item => {
      if (item.id === selectedCrisis.id) {
        return {
          ...item,
          status: 'Eskalasi Pimpinan',
          auditTrail: [
            ...item.auditTrail,
            { time: 'Baru saja', user: 'Bpk. Fajar (Humas PR)', event: `Krisis DIESKALASI ke ${escalateRecipient}. Catatan Humas: "${escalateNote || 'Mohon arahan & persetujuan langkah hukum/medis.'}"` }
          ]
        };
      }
      return item;
    }));

    setIsEscalateModalOpen(false);
    showToast(`🏛️ Laporan Krisis berhasil dieskalasi ke ${escalateRecipient}!`);
    setEscalateNote('');
  };

  // Resolve Crisis
  const handleResolveCrisis = (crisisId) => {
    setCrisisItems(prev => prev.map(item => {
      if (item.id === crisisId) {
        return {
          ...item,
          status: 'Selesai',
          auditTrail: [
            ...item.auditTrail,
            { time: 'Baru saja', user: 'Bpk. Fajar (Humas PR)', event: 'Krisis resmi ditandai SELESAI & Rekam Jejak (Audit Trail) dikunci.' }
          ]
        };
      }
      return item;
    }));
    showToast('🎉 Krisis berhasil diselesaikan dan dicatat secara detail!');
  };

  // Filtering calculations
  const filteredCrisis = crisisItems.filter(item => {
    if (sourceFilter === 'RADAR' && item.sourceType !== 'RADAR') return false;
    if (sourceFilter === 'RISET' && item.sourceType !== 'RISET') return false;

    if (statusFilter === 'OPEN' && item.status !== 'Open') return false;
    if (statusFilter === 'PENDING' && item.status !== 'Dalam Proses') return false;
    if (statusFilter === 'MUTU_NOTIFIED' && item.mutuNotificationStatus !== 'Pemberitahuan Terkirim ke Mutu') return false;
    if (statusFilter === 'ESCALATED' && item.status !== 'Eskalasi Pimpinan') return false;
    if (statusFilter === 'RESOLVED' && item.status !== 'Selesai') return false;

    return true;
  });

  const countRadar = crisisItems.filter(c => c.sourceType === 'RADAR').length;
  const countRiset = crisisItems.filter(c => c.sourceType === 'RISET').length;
  const countOpen = crisisItems.filter(c => c.status === 'Open').length;
  const countMutu = crisisItems.filter(c => c.mutuNotificationStatus === 'Pemberitahuan Terkirim ke Mutu').length;
  const countEscalated = crisisItems.filter(c => c.status === 'Eskalasi Pimpinan').length;
  const countResolved = crisisItems.filter(c => c.status === 'Selesai').length;

  if (!active) return null;

  return (
    <div className="screen on" id="s-crisis">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          background: 'var(--t1)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--r12)',
          boxShadow: 'var(--sh2)',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeup-demo .2s ease'
        }}>
          <span>{toastMsg}</span>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }} onClick={() => setToastMsg(null)}>✕</button>
        </div>
      )}

      {/* HEADER SCREEN WITH OPERATOR IDENTITY */}
      <div className="ph">
        <div className="ph-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2>Crisis Management Center</h2>
            <span className="bdg loy" style={{ fontSize: '11px', padding: '3px 10px' }}>
              <span className="ic s" style={{ color: 'var(--loy)' }}>badge</span> {isReadOnly ? 'Mode Pantau Mutu & Audit' : 'Tim Yanmas & Humas Pengaduan'}
            </span>
          </div>
          <p>Tangani isu kritis dari <strong>📡 Suara Pasien</strong> &amp; <strong>📊 Hasil Riset SKM</strong> — kirim pemberitahuan ke Bagian Mutu untuk verifikasi data di SIMRS, jalankan rekomendasi AI, dan eskalasi pimpinan.</p>
        </div>
        <div className="ph-act" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn ghost" onClick={() => setShowExecutiveBriefing(true)}>
            <span className="ic s">description</span> Buat Laporan Pimpinan
          </button>
        </div>
      </div>

      {/* READ-ONLY BANNER IF VIEWER */}
      {isReadOnly && (
        <div style={{
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          color: '#065f46',
          padding: '10px 16px',
          borderRadius: 'var(--r12)',
          fontSize: '12.5px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span className="ic s" style={{ color: '#059669', fontSize: '18px' }}>visibility</span>
          <div>
            <strong>Mode Pantau (Read-Only) Aktif:</strong> Anda memiliki hak akses untuk meninjau isu kritis, detail keluhan, dan rekam jejak audit trail. Eksekusi penutupan krisis dan persetujuan rilis resmi dikelola oleh Humas &amp; Direktur.
          </div>
        </div>
      )}

      {/* STRIP KPI METRICS */}
      <div className="kstrip k4">
        <div className="kcard kr">
          <div className="kcard-ic"><span className="ic">emergency</span></div>
          <div className="kcard-lbl">Isu Kritis Baru</div>
          <div className="kcard-v">{countOpen}</div>
          <div className="kcard-d dn">Perlu respon Humas Segera</div>
        </div>
        <div className="kcard ka">
          <div className="kcard-ic"><span className="ic">forward_to_inbox</span></div>
          <div className="kcard-lbl">Notifikasi ke Mutu</div>
          <div className="kcard-v">{countMutu}</div>
          <div className="kcard-d fl">Pemberitahuan Cek SIMRS</div>
        </div>
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic">task_alt</span></div>
          <div className="kcard-lbl">Terselesaikan</div>
          <div className="kcard-v">{countResolved}</div>
          <div className="kcard-d up"><span className="ic s">trending_up</span>Audit trail terkunci</div>
        </div>
        <div className="kcard kl">
          <div className="kcard-ic"><span className="ic">hub</span></div>
          <div className="kcard-lbl">Sumber Sinyal Krisis</div>
          <div className="kcard-v" style={{ fontSize: '16px' }}>
            📡 Radar ({countRadar}) | 📊 Riset ({countRiset})
          </div>
          <div className="kcard-d up">2 Saluran Terkoneksi</div>
        </div>
      </div>

      {/* FILTER PIPELINE BAR */}
      <div style={{
        background: 'var(--srf)',
        borderRadius: 'var(--r12)',
        padding: '12px 16px',
        border: '1px solid var(--line)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t3)', marginRight: '4px' }}>SUMBER:</span>
          <button
            className={`tab ${sourceFilter === 'ALL' ? 'on' : ''}`}
            onClick={() => setSourceFilter('ALL')}>
            Semua ({crisisItems.length})
          </button>
          <button
            className={`tab ${sourceFilter === 'RADAR' ? 'on' : ''}`}
            onClick={() => setSourceFilter('RADAR')}>
            📡 Suara Pasien ({countRadar})
          </button>
          <button
            className={`tab ${sourceFilter === 'RISET' ? 'on' : ''}`}
            onClick={() => setSourceFilter('RISET')}>
            📊 Hasil Riset ({countRiset})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t3)', marginRight: '4px' }}>STATUS:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf2)' }}>
            <option value="ALL">Semua Status</option>
            <option value="OPEN">Baru (Open)</option>
            <option value="PENDING">Sedang Ditangani</option>
            <option value="MUTU_NOTIFIED">Notifikasi ke Mutu Dikirim</option>
            <option value="ESCALATED">Eskalasi Pimpinan</option>
            <option value="RESOLVED">Selesai</option>
          </select>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="g21">
        {/* LEFT COLUMN: CRISIS LIST & HANDLING */}
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic s" style={{ color: 'var(--red)' }}>warning</span>
                Daftar Isu &amp; Krisis ({filteredCrisis.length})
              </div>
              <div className="card-sub">Klik isu untuk respon AI, kirim pemberitahuan ke Bagian Mutu, atau eskalasi.</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCrisis.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--t3)' }}>
                Tidak ada krisis yang sesuai dengan filter ini.
              </div>
            ) : (
              filteredCrisis.map(crisis => (
                <div
                  key={crisis.id}
                  onClick={() => setSelectedCrisis(crisis)}
                  className={`feed ${selectedCrisis?.id === crisis.id ? 'sel' : ''}`}
                  style={{
                    cursor: 'pointer',
                    borderLeft: crisis.severity === 'Kritis' ? '4px solid var(--red)' : crisis.severity === 'Tinggi' ? '4px solid var(--amber)' : '4px solid var(--blue)',
                    background: selectedCrisis?.id === crisis.id ? 'var(--blue-s)' : 'var(--srf)',
                    transition: 'all 0.15s ease',
                    padding: '14px',
                    borderRadius: 'var(--r8)',
                    border: '1px solid var(--line)'
                  }}>
                  
                  {/* CARD HEADER */}
                  <div className="f-hd" style={{ flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                    <span className={`bdg ${crisis.severity === 'Kritis' ? 'r' : crisis.severity === 'Tinggi' ? 'a' : 'b'}`}>
                      <span className="pdot"></span>{crisis.severity}
                    </span>

                    <span className={`bdg ${crisis.sourceType === 'RADAR' ? 'b' : 'loy'}`} style={{ fontWeight: 700 }}>
                      {crisis.sourceType === 'RADAR' ? '📡 Suara Pasien' : '📊 Hasil Riset'}
                    </span>

                    {/* STATUS PEMBERITAHUAN KE BAGIAN MUTU */}
                    <span className="bdg" style={{
                      background: crisis.mutuNotificationStatus === 'Pemberitahuan Terkirim ke Mutu' ? '#e0e7ff' : crisis.mutuNotificationStatus === 'Terverifikasi Pasien SIMRS' ? '#dcfce7' : crisis.mutuNotificationStatus === 'Bukan Pasien Terdaftar' ? '#fee2e2' : '#f1f5f9',
                      color: crisis.mutuNotificationStatus === 'Pemberitahuan Terkirim ke Mutu' ? '#4338ca' : crisis.mutuNotificationStatus === 'Terverifikasi Pasien SIMRS' ? '#15803d' : crisis.mutuNotificationStatus === 'Bukan Pasien Terdaftar' ? '#b91c1c' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      {crisis.mutuNotificationStatus === 'Pemberitahuan Terkirim ke Mutu' ? '📩 Mutu: Terkirim (Cek SIMRS)' : crisis.mutuNotificationStatus === 'Terverifikasi Pasien SIMRS' ? '✓ SIMRS: Pasien Terdaftar' : crisis.mutuNotificationStatus === 'Bukan Pasien Terdaftar' ? '⚠️ SIMRS: Bukan Pasien' : 'Belum Lapor Mutu'}
                    </span>

                    <span style={{ fontSize: '11px', color: 'var(--t3)', marginLeft: 'auto' }}>
                      🕒 {crisis.timeReceived}
                    </span>
                  </div>

                  {/* BODY & DETAIL */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>
                      {crisis.title}
                    </h4>
                    <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginBottom: '6px' }}>
                      Pelapor: <strong>{crisis.reporter}</strong> ({crisis.patientRmHint}) · Unit: <strong>{crisis.department}</strong>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--t2)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                      "{crisis.body}"
                    </p>
                  </div>

                  {/* ACTION BAR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn ghost xs"
                        style={{ color: '#4338ca', borderColor: '#c7d2fe', fontWeight: 600 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMutuModal(crisis);
                        }}>
                        <span className="ic s" style={{ fontSize: '13px' }}>send</span> Kirim Notifikasi ke Mutu
                      </button>
                    </div>

                    <span className={`bdg ${crisis.status === 'Selesai' ? 'g' : crisis.status === 'Eskalasi Pimpinan' ? 'r' : 'b'}`}>
                      {crisis.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL, AI SUGGESTION & AUDIT TRAIL */}
        <div className="col">
          {selectedCrisis ? (
            <div className="card" style={{ border: '2px solid var(--blue-m)' }}>
              <div className="card-hd">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s" style={{ color: 'var(--blue)' }}>shield</span> Detail Penanganan Krisis
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn ghost xs" onClick={() => handleOpenMutuModal(selectedCrisis)} style={{ color: '#4338ca', fontWeight: 600 }}>
                    <span className="ic s">forward_to_inbox</span> Lapor Mutu
                  </button>
                  <button className="btn danger xs" onClick={() => setIsEscalateModalOpen(true)}>
                    <span className="ic s">gavel</span> Eskalasi
                  </button>
                  <button className="btn pri xs" onClick={() => handleResolveCrisis(selectedCrisis.id)} style={{ background: 'var(--green)' }}>
                    <span className="ic s">task_alt</span> Selesai
                  </button>
                </div>
              </div>

              {/* CRISIS SUMMARY */}
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>
                  {selectedCrisis.title}
                </h4>
                <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginBottom: '6px' }}>
                  Pelapor: <strong>{selectedCrisis.reporter}</strong> ({selectedCrisis.patientRmHint})
                </div>

                {/* STATUS NOTIFIKASI BAGIAN MUTU & KRONOLOGI SIMRS */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="ic s" style={{ fontSize: '14px', color: '#4338ca' }}>health_and_safety</span>
                      Pemberitahuan ke Bagian Mutu (KMKP):
                    </span>
                    <span className="bdg" style={{
                      background: selectedCrisis.mutuNotificationStatus === 'Pemberitahuan Terkirim ke Mutu' ? '#e0e7ff' : selectedCrisis.mutuNotificationStatus === 'Terverifikasi Pasien SIMRS' ? '#dcfce7' : selectedCrisis.mutuNotificationStatus === 'Bukan Pasien Terdaftar' ? '#fee2e2' : '#f1f5f9',
                      color: selectedCrisis.mutuNotificationStatus === 'Pemberitahuan Terkirim ke Mutu' ? '#4338ca' : selectedCrisis.mutuNotificationStatus === 'Terverifikasi Pasien SIMRS' ? '#15803d' : selectedCrisis.mutuNotificationStatus === 'Bukan Pasien Terdaftar' ? '#b91c1c' : '#64748b',
                      fontSize: '10.5px',
                      fontWeight: 700
                    }}>
                      {selectedCrisis.mutuNotificationStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                    {selectedCrisis.mutuNotificationStatus === 'Belum Dikirim' ? (
                      <span>Belum ada pemberitahuan ke Bagian Mutu. Klik tombol <strong>&quot;Kirim Notifikasi ke Mutu&quot;</strong> agar tim mutu dapat memeriksa rekam medis pelapor di SIMRS.</span>
                    ) : selectedCrisis.mutuNotificationStatus === 'Pemberitahuan Terkirim ke Mutu' ? (
                      <span>Pemberitahuan telah terkirim ke Bagian Mutu. Menunggu Bagian Mutu mengecek di SIMRS apakah pelapor merupakan pasien aktif atau bukan.</span>
                    ) : selectedCrisis.mutuNotificationStatus === 'Terverifikasi Pasien SIMRS' ? (
                      <span style={{ color: '#166534', fontWeight: 600 }}>✓ Terverifikasi di SIMRS: Pelapor terdaftar sebagai pasien RSUD Daya. Tangani secara klinis &amp; kepuasan pasien.</span>
                    ) : (
                      <span style={{ color: '#991b1b', fontWeight: 600 }}>⚠️ Cek SIMRS Selesai: Pelapor tidak terdaftar di SIMRS. Tangani melalui pendekatan Humas / klarifikasi publik.</span>
                    )}
                  </div>

                  {/* UPDATE HASIL DARI MUTU QUICK BUTTONS */}
                  {selectedCrisis.mutuNotificationStatus === 'Pemberitahuan Terkirim ke Mutu' && (
                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--t3)', fontWeight: 600 }}>Konfirmasi Mutu:</span>
                      <button
                        className="btn ghost xs"
                        style={{ fontSize: '10.5px', color: '#15803d', padding: '2px 8px' }}
                        onClick={() => handleUpdateSimrsStatus(selectedCrisis.id, 'VERIFIED')}>
                        ✓ Pasien Terdaftar di SIMRS
                      </button>
                      <button
                        className="btn ghost xs"
                        style={{ fontSize: '10.5px', color: '#b91c1c', padding: '2px 8px' }}
                        onClick={() => handleUpdateSimrsStatus(selectedCrisis.id, 'UNVERIFIED')}>
                        ✕ Bukan Pasien RS
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--t2)', background: 'var(--srf2)', padding: '10px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)' }}>
                  "{selectedCrisis.body}"
                </div>
              </div>

              {/* SINTETA AI RECOMMENDATION PANEL */}
              <div style={{ background: 'var(--blue-s)', border: '1px solid var(--blue-m)', borderRadius: 'var(--r10)', padding: '12px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s">psychology</span> Analisis &amp; Rekomendasi Sinteta AI
                </div>

                {/* DECISION SELECTOR */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    className={`btn ${aiDecision === 'ACCEPTED' ? 'pri' : 'ghost'} xs`}
                    style={{ flex: 1, fontSize: '11px', justifyContent: 'center' }}
                    onClick={() => { setAiDecision('ACCEPTED'); handleAcceptAiSuggestion(selectedCrisis.id); }}>
                    ✓ Terima Saran AI
                  </button>
                  <button
                    type="button"
                    className={`btn ${aiDecision === 'EDITED' ? 'pri' : 'ghost'} xs`}
                    style={{ flex: 1, fontSize: '11px', justifyContent: 'center' }}
                    onClick={() => setAiDecision('EDITED')}>
                    ✎ Modifikasi
                  </button>
                  <button
                    type="button"
                    className={`btn ${aiDecision === 'REJECTED' ? 'danger' : 'ghost'} xs`}
                    style={{ flex: 1, fontSize: '11px', justifyContent: 'center' }}
                    onClick={() => { setAiDecision('REJECTED'); handleRejectAiSuggestion(selectedCrisis.id); }}>
                    ✕ Tolak AI
                  </button>
                </div>

                {aiDecision === 'EDITED' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>
                        Langkah Aksi Humas:
                      </label>
                      <textarea
                        rows="3"
                        value={customActionText}
                        onChange={(e) => setCustomActionText(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px' }}
                      ></textarea>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>
                        Draf Klarifikasi Resmi:
                      </label>
                      <textarea
                        rows="3"
                        value={customPressRelease}
                        onChange={(e) => setCustomPressRelease(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px' }}
                      ></textarea>
                    </div>

                    <button className="btn pri sm" onClick={() => handleEditAiSuggestion(selectedCrisis.id)}>
                      Simpan &amp; Jalankan
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>Rencana Aksi AI:</div>
                    <div style={{ whiteSpace: 'pre-line', background: 'var(--srf2)', padding: '8px', borderRadius: 'var(--r6)', marginBottom: '8px' }}>
                      {selectedCrisis.aiRecommendation.actionPlan}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>Draf Pernyataan Resmi:</div>
                    <div style={{ fontStyle: 'italic', background: 'var(--srf2)', padding: '8px', borderRadius: 'var(--r6)' }}>
                      "{selectedCrisis.aiRecommendation.pressRelease}"
                    </div>
                  </div>
                )}
              </div>

              {/* AUDIT TRAIL TIMELINE */}
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s" style={{ color: 'var(--blue)' }}>history</span>
                  Rekam Jejak Penanganan (Audit Trail)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px', borderLeft: '2px dashed var(--line2)' }}>
                  {selectedCrisis.auditTrail.map((log, idx) => (
                    <div key={idx} style={{ position: 'relative', paddingLeft: '12px' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-13px',
                        top: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: idx === selectedCrisis.auditTrail.length - 1 ? 'var(--green)' : 'var(--blue)'
                      }}></div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--t3)' }}>
                        {log.time} · <span style={{ color: 'var(--blue)' }}>{log.user}</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--t1)', marginTop: '2px', lineHeight: '1.3' }}>
                        {log.event}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
              <span className="ic l" style={{ fontSize: '42px', marginBottom: '8px', color: 'var(--blue)' }}>touch_app</span>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--t1)' }}>Pilih isu dari panel kiri</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>untuk melihat rincian, mengirim pemberitahuan ke Mutu, dan rekam jejak.</div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: PEMBERITAHUAN / LAPORAN KE BAGIAN MUTU (KMKP) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {isMutuModalOpen && mutuTargetCrisis && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsMutuModalOpen(false)}>
          <div className="modal-box" style={{ width: '560px' }}>
            <div className="modal-hd">
              <div className="modal-hd-icon" style={{ background: '#eef2ff' }}>
                <span className="ic" style={{ color: '#4338ca' }}>health_and_safety</span>
              </div>
              <div>
                <div className="modal-title" style={{ color: '#312e81' }}>Pemberitahuan ke Bagian Mutu (KMKP)</div>
                <div className="modal-sub">Kirim informasi keluhan &amp; permohonan cek status pasien di SIMRS</div>
              </div>
              <button className="modal-close" onClick={() => setIsMutuModalOpen(false)}>
                <span className="ic s">close</span>
              </button>
            </div>

            <form onSubmit={handleSendMutuNotification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--srf2)', border: '1.5px solid var(--line)', borderRadius: 'var(--r12)', padding: '14px', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: '4px', fontSize: '13px' }}>{mutuTargetCrisis.title}</div>
                <div style={{ color: 'var(--t2)', marginBottom: '2px' }}>Pelapor: <strong>{mutuTargetCrisis.reporter}</strong> ({mutuTargetCrisis.patientRmHint})</div>
                <div style={{ color: 'var(--t3)' }}>Unit Terkait: {mutuTargetCrisis.department}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  Saluran Pemberitahuan
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'WA', label: 'WhatsApp Mutu', icon: 'chat' },
                    { id: 'EMAIL', label: 'Email Resmi', icon: 'mail' },
                    { id: 'INTERNAL', label: 'E-Disposisi', icon: 'sync' },
                  ].map(ch => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setMutuDispatchChannel(ch.id)}
                      className={`btn ${mutuDispatchChannel === ch.id ? 'pri' : 'ghost'} sm`}
                      style={{
                        background: mutuDispatchChannel === ch.id ? '#4338ca' : 'var(--srf)',
                        borderColor: mutuDispatchChannel === ch.id ? '#4338ca' : 'var(--line)',
                        justifyContent: 'center'
                      }}>
                      <span className="ic s">{ch.icon}</span>{ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  Catatan / Instruksi Cek SIMRS
                </label>
                <textarea
                  rows="3"
                  required
                  value={mutuCustomNote}
                  onChange={(e) => setMutuCustomNote(e.target.value)}
                  className="inp"
                  style={{ fontSize: '12px', resize: 'none', lineHeight: '1.45' }}
                />
              </div>

              <div style={{ background: 'var(--green-s)', border: '1.5px solid var(--green-m)', borderRadius: 'var(--r10)', padding: '12px 14px', fontSize: '12px', color: 'var(--green)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span className="ic s" style={{ color: 'var(--green)', marginTop: '1px' }}>verified_user</span>
                <span>Pemberitahuan ini akan otomatis memicu tim KMKP untuk memvalidasi nomor RM pasien di SIMRS secara terenkripsi.</span>
              </div>

              <div className="modal-ft">
                <button type="button" className="btn ghost" onClick={() => setIsMutuModalOpen(false)}>Batal</button>
                <button type="submit" className="btn pri" style={{ background: '#4338ca', borderColor: '#4338ca' }}>
                  <span className="ic s">send</span> Kirim ke Bagian Mutu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ESKALASI KE DIREKSI */}
      {isEscalateModalOpen && selectedCrisis && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsEscalateModalOpen(false)}>
          <div className="modal-box" style={{ width: '520px' }}>
            <div className="modal-hd">
              <div className="modal-hd-icon" style={{ background: 'var(--red-s)' }}>
                <span className="ic" style={{ color: 'var(--red)' }}>gavel</span>
              </div>
              <div>
                <div className="modal-title" style={{ color: 'var(--red)' }}>Eskalasi ke Pimpinan RS</div>
                <div className="modal-sub">Kirim laporan darurat &amp; minta arahan resmi dari Direksi Utama</div>
              </div>
              <button className="modal-close" onClick={() => setIsEscalateModalOpen(false)}>
                <span className="ic s">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmEscalation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  Tujukan Kepada
                </label>
                <select
                  value={escalateRecipient}
                  onChange={(e) => setEscalateRecipient(e.target.value)}
                  className="inp"
                  style={{ fontWeight: 600 }}>
                  <option value="Direktur Utama RSUD Daya">Direktur Utama RSUD Daya</option>
                  <option value="Kabid Pelayanan & Etika Medis">Kabid Pelayanan &amp; Etika Medis</option>
                  <option value="Head of Legal & Legal Compliance">Head of Legal &amp; Legal Compliance</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  Catatan Ringkas Disposisi
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tuliskan alasan eskalasi dan hal-hal yang membutuhkan keputusan Direksi..."
                  value={escalateNote}
                  onChange={(e) => setEscalateNote(e.target.value)}
                  className="inp"
                  style={{ fontSize: '12px', resize: 'none', lineHeight: '1.45' }}
                />
              </div>

              <div className="modal-ft">
                <button type="button" className="btn ghost" onClick={() => setIsEscalateModalOpen(false)}>Batal</button>
                <button type="submit" className="btn danger">
                  <span className="ic s">send</span> Kirim ke Pimpinan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXECUTIVE BRIEFING REPORT */}
      {showExecutiveBriefing && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setShowExecutiveBriefing(false)}>
          <div className="modal-box" style={{ width: '650px' }}>
            <div className="modal-hd">
              <div className="modal-hd-icon" style={{ background: 'var(--blue-s)' }}>
                <span className="ic" style={{ color: 'var(--blue)' }}>description</span>
              </div>
              <div>
                <div className="modal-title">Laporan Krisis untuk Pimpinan</div>
                <div className="modal-sub">Executive briefing disusun otomatis oleh Humas &amp; Sinteta AI</div>
              </div>
              <button className="modal-close" onClick={() => setShowExecutiveBriefing(false)}>
                <span className="ic s">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--r12)', padding: '16px', background: 'var(--srf2)', fontSize: '12px', lineHeight: '1.6' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--t1)', marginBottom: '4px' }}>
                  LAPORAN EKSEKUTIF PENANGANAN KRISIS &amp; REPUTASI RSUD DAYA
                </div>
                <div style={{ fontSize: '11px', color: 'var(--t3)', marginBottom: '12px' }}>
                  Tanggal: 28 Mei 2026 · Disusun oleh: Bpk. Fajar Pratama, S.I.Kom (Humas &amp; Pengaduan)
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong>1. Ringkasan Status Krisis:</strong><br />
                  • Total Kasus: {crisisItems.length} ({countOpen} Open, {countMutu} Diberitahukan ke Mutu, {countResolved} Selesai)<br />
                  • Sumber Masukan: {countRadar} dari 📡 Suara Pasien Langsung, {countRiset} dari 📊 Hasil Riset SKM
                </div>

                <div>
                  <strong>2. Koordinasi dengan Bagian Mutu (KMKP):</strong><br />
                  • Mekanisme notifikasi berjalan otomatis untuk verifikasi data SIMRS sebelum tindakan mediasi dilakukan.
                </div>
              </div>
            </div>

            <div className="modal-ft">
              <button className="btn ghost" onClick={() => setShowExecutiveBriefing(false)}>Tutup</button>
              <button className="btn pri" onClick={() => { alert('🖨️ Laporan Executive Briefing PDF sedang diunduh!'); setShowExecutiveBriefing(false); }}>
                <span className="ic s">download</span> Unduh PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
