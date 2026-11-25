import { useState, useEffect } from 'react';
import { PiiMasker } from '../utils/security';

/* ─────────────────────────────────────────────────────────────────────────────
 *  RadarScreen.jsx — Voice & Feedback Intelligence Hub (Pilar 1)
 *
 *  Arsitektur Pemisahan Suara:
 *  1. Suara Pasien (Voice of Customer / VOC):
 *     - Kanal: WhatsApp CS, Telepon, Tatap Muka, Kotak Saran, Policare App, Google Reviews.
 *     - Mengukur sentimen pasien, skor SKM Permenpan-RB & NPS resmi rumah sakit.
 *  2. Suara Tim Medis & Staf Internal (Voice of Employee / VOE):
 *     - Kanal: Masukan Dokter DPJP, Bidan VK, Perawat, Farmasi, Admisi, Analis Lab.
 *     - Fitur: Upvoting sejawat, urgensi klinis, kendala SIMRS/alkes, tindak lanjut manajemen.
 *  3. Matriks Korelasi Layanan 360° (Cross-Voice 360° Correlation Matrix):
 *     - Mempertemukan sinyal keluhan pasien dengan kendala internal staf secara berdampingan
 *       tanpa mencampuradukkan data dasar dan skor kepuasan pasien.
 * ─────────────────────────────────────────────────────────────────────────────*/

export default function RadarScreen({
  feedbacks = [],
  selectedFeedId,
  onSelectFeedback,
  onSubmitQuickReply,
  onSubmitEscalation,
  onTriggerCrisis,
  active,
  accessLevel = 'ADMIN',
  isPiiMasked = true
}) {
  const isReadOnly = accessLevel === 'VIEWER';
  const [activeSubTab, setActiveSubTab] = useState('patient'); // 'patient' | 'staff' | 'matrix' | 'analytics'

  // Patient Voice Filters
  const [patientChannelFilter, setPatientChannelFilter] = useState('Semua');
  const [patientSentimentFilter, setPatientSentimentFilter] = useState('Semua');

  // Staff Voice Filters
  const [staffRoleFilter, setStaffRoleFilter] = useState('Semua');
  const [staffCategoryFilter, setStaffCategoryFilter] = useState('Semua');
  const [staffShiftFilter, setStaffShiftFilter] = useState('Semua');

  // Selected Item States
  const [selectedPatientFeedId, setSelectedPatientFeedId] = useState(selectedFeedId || null);
  const [selectedStaffFeedId, setSelectedStaffFeedId] = useState('sf-1');

  // Modals
  const [isManualPatientModalOpen, setIsManualPatientModalOpen] = useState(false);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [isStaffInputModalOpen, setIsStaffInputModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Manual Patient Input Form State
  const [manualName, setManualName] = useState('');
  const [manualRm, setManualRm] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualChannel, setManualChannel] = useState('Telepon Langsung ke CS / Humas');
  const [manualDept, setManualDept] = useState('Poli Obgyn (Kebidanan)');
  const [manualCategory, setManualCategory] = useState('Waktu Tunggu & Antrean');
  const [manualSentiment, setManualSentiment] = useState('Kritis');
  const [manualStars, setManualStars] = useState(2);
  const [manualBody, setManualBody] = useState('');
  const [manualRecorder, setManualRecorder] = useState('Bpk. Fajar Pratama (Humas PR)');

  // Spreadsheet Modal State
  const [sheetsUrl, setSheetsUrl] = useState('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZj_RSUD_Daya_CallLogs_2026/edit');
  const [sheetsStatus, setSheetsStatus] = useState('Terkoneksi (Sinkronisasi Otomatis Tiap 15 Menit)');
  const [isSyncing, setIsSyncing] = useState(false);

  // Staff Voice Input Form State
  const [staffName, setStaffName] = useState('');
  const [staffIsAnonymous, setStaffIsAnonymous] = useState(false);
  const [staffRole, setStaffRole] = useState('Bidan');
  const [staffUnit, setStaffUnit] = useState('Kamar Bersalin (VK)');
  const [staffShift, setStaffShift] = useState('Shift Pagi (07:00-14:00)');
  const [staffCategory, setStaffCategory] = useState('Sistem SIMRS & IT');
  const [staffUrgency, setStaffUrgency] = useState('Tinggi');
  const [staffTitle, setStaffTitle] = useState('');
  const [staffBody, setStaffBody] = useState('');

  // Initial Patient Feedbacks (Voice of Customer / VOC)
  const [patientFeedbacks, setPatientFeedbacks] = useState([
    {
      id: 'pf-1',
      name: 'Ny. Ratna S.',
      meta: 'Ibu Pasien Anak · RM-882103',
      phone: '0812-4455-6677',
      channel: 'Telepon CS',
      channelType: 'manual_phone',
      recorder: 'Dicatat oleh Bpk. Fajar (Humas) via Panggilan Telepon CS',
      sentiment: 'Kritis',
      stars: 1,
      time: 'Hari ini, 08:30 WITA',
      category: 'Pelayanan Medis',
      department: 'Poli Anak & Farmasi',
      status: 'Open',
      body: 'Ibu pasien menelepon ke nomor Humas mengeluhkan dugaan takaran sirup obat anak berbeda dengan arahan dokter di Poli Anak.',
      aiReplyDraft: 'Yth. Ibu Ratna, terima kasih telah menghubungi Humas RSUD Daya. Tim Manajerial Medis kami segera mengonfirmasi resep ke dokter spesialis anak penanggung jawab dan menghubungi Ibu kembali dalam 30 menit.',
      replies: []
    },
    {
      id: 'pf-2',
      name: 'Ny. Hendrawati',
      meta: 'Pasien Kebidanan · RM-883912',
      phone: '0852-9988-1122',
      channel: 'Tatap Muka / Front Desk',
      channelType: 'manual_frontdesk',
      recorder: 'Dicatat oleh Sdri. Amanda (Front Office CS Meja Informasi)',
      sentiment: 'Medium',
      stars: 3,
      time: 'Hari ini, 09:15 WITA',
      category: 'Waktu Tunggu & Antrean',
      department: 'Poli Obgyn',
      status: 'Open',
      body: 'Pasien menyampaikan langsung di meja informasi bahwa antrean USG 4D agak padat dan ruang tunggu perlu tambahan kursi cadangan.',
      aiReplyDraft: 'Terima kasih atas saran Ibu Hendrawati. Kami telah menambahkan 6 kursi tambahan di lobi Poliklinik Kebidanan.',
      replies: []
    },
    {
      id: 'pf-3',
      name: 'Bpk. Ridwan Hakim',
      meta: 'Keluarga Pasien Rawat Inap',
      phone: '0813-1122-3344',
      channel: 'Kotak Saran Fisik',
      channelType: 'manual_box',
      recorder: 'Pengambilan berkala Kotak Saran Bangsal Melati Lt. 3',
      sentiment: 'Positif',
      stars: 5,
      time: 'Kemarin, 16:45 WITA',
      category: 'Pelayanan Rawat Inap',
      department: 'Rawat Inap Melati',
      status: 'Selesai',
      body: 'Perawat Bangsal Melati sangat tanggap dan ramah saat membantu proses ganti infus anak saya di malam hari. Luar biasa!',
      aiReplyDraft: 'Terima kasih banyak atas apresiasi Bpk. Ridwan Hakim. Ucapan terima kasih telah kami teruskan ke tim perawat Bangsal Melati.',
      replies: ['Telah dibacakan pada Morning Briefing Keperawatan']
    },
    {
      id: 'pf-4',
      name: 'Ibu Maya Lestari',
      meta: 'Pasien Umum · Google Review',
      phone: '0878-3344-5566',
      channel: 'Google Reviews',
      channelType: 'digital_google',
      recorder: 'Sinkronisasi Otomatis Google Business Profile',
      sentiment: 'Kritis',
      stars: 1,
      time: 'Hari ini, 07:10 WITA',
      category: 'Waktu Tunggu & Antrean',
      department: 'Depo Farmasi',
      status: 'Open',
      body: 'Antre obat racikan sampai 2.5 jam padahal kondisi sedang pusing setelah periksa dokter. Tolong ditambah petugas raciknya.',
      aiReplyDraft: 'Halo Ibu Maya, mohon maaf atas waktu tunggu farmasi yang kurang nyaman. Kami sedang melakukan penambahan asisten apoteker di jam sibuk pagi ini.',
      replies: []
    },
    {
      id: 'pf-5',
      name: 'Ibu Dian Safitri',
      meta: 'Pasien Member · Policare App',
      phone: '0821-5566-7788',
      channel: 'Policare App',
      channelType: 'digital_app',
      recorder: 'Rating Pasca Konsultasi Aplikasi Mobile',
      sentiment: 'Positif',
      stars: 5,
      time: 'Kemarin, 19:20 WITA',
      category: 'Fasilitas & Layanan',
      department: 'Klinik Laktasi',
      status: 'Selesai',
      body: 'Konsultasi laktasi dengan Bidan Sri sangat mencerahkan! Teknik menyusuinya langsung cocok untuk bayi saya yang baru 1 minggu.',
      aiReplyDraft: 'Senang mendengar kabar baik ini Ibu Dian! Jangan ragu untuk bergabung di Komunitas Alumni Persalinan RSUD Daya.',
      replies: ['Poin reward +50 telah dikirimkan']
    }
  ]);

  // Initial Internal Staff Feedbacks (Voice of Employee / VOE)
  const [staffFeedbacks, setStaffFeedbacks] = useState([
    {
      id: 'sf-1',
      name: 'dr. Supriyadi, Sp.B',
      role: 'Dokter Spesialis Bedah',
      unit: 'Kamar Operasi (OK)',
      shift: 'Shift Pagi (07:00-14:00)',
      category: 'Ketersediaan Obat & Alkes',
      urgency: 'Tinggi',
      title: 'Stok benang bedah Vicryl 3-0 sering terlambat dikirim dari Gudang Farmasi ke OK',
      body: 'Beberapa kali jadwal tindakan operasi tergeser 15-20 menit karena menunggu pengiriman benang bedah dari gudang utama. Mohon disiapkan buffer stock tetap di depo OK.',
      time: 'Hari ini, 08:15 WITA',
      status: 'Dalam Tindak Lanjut',
      upvotes: 19,
      hasUpvoted: false,
      managementResponse: 'Telah disetujui bersama Kepala Farmasi: Buffer stock di depo OK ditambah 5 box per shift per hari ini.'
    },
    {
      id: 'sf-2',
      name: 'Bidan Sri Wahyuni, S.ST',
      role: 'Bidan Koordinator VK',
      unit: 'Kamar Bersalin (VK)',
      shift: 'Shift Siang (14:00-21:00)',
      category: 'Sistem SIMRS & IT',
      urgency: 'Tinggi',
      title: 'Fitur input partograf digital di SIMRS sering lag saat jam pergantian shift',
      body: 'Saat jam 14:00 WITA sistem SIMRS lambat memuat data riwayat persalinan. Mohon tim IT melakukan optimasi server dan alokasi bandwidth khusus ruang bersalin.',
      time: 'Kemarin, 15:30 WITA',
      status: 'Ditangani Tim IT',
      upvotes: 26,
      hasUpvoted: true,
      managementResponse: 'Tim IT RS telah mengalokasikan dedicated memory cache untuk modul persalinan SIMRS Ruang VK.'
    },
    {
      id: 'sf-3',
      name: 'Apt. Hendra Kurniawan, S.Farm',
      role: 'Apoteker Penanggung Jawab',
      unit: 'Depo Farmasi Rawat Jalan',
      shift: 'Shift Pagi (07:00-14:00)',
      category: 'Fasilitas & Alur Kerja',
      urgency: 'Tinggi',
      title: 'Usulan penambahan printer barcode etiket resep kedua & staf racik cadangan jam sibuk',
      body: 'Untuk memangkas waktu tunggu farmasi dari 28 menit menjadi < 15 menit, kami membutuhkan 1 unit printer thermal etiket tambahan agar petugas racik tidak mengantre mesin cetak pada jam puncak 09:00-11:30.',
      time: '2 Hari lalu',
      status: 'Disetujui Pengadaan',
      upvotes: 34,
      hasUpvoted: false,
      managementResponse: 'Pengajuan 1 unit printer etiket telah disetujui Direktur dan diteruskan ke Bagian Pengadaan (Procurement).'
    },
    {
      id: 'sf-4',
      name: 'Ns. Ratna Dewi, S.Kep',
      role: 'Perawat Bangsal',
      unit: 'Rawat Inap Bangsal Melati',
      shift: 'Shift Malam (21:00-07:00)',
      category: 'Inovasi Pelayanan',
      urgency: 'Inovasi',
      title: 'Ide: Pasang QR Code Panggil Perawat Tambahan di Dekat Tempat Tidur Pasien',
      body: 'Selain tombol bel kabel, keluarga pasien sering menanyakan jadwal obat/infus. Jika ada QR Call terhubung ke station perawat, respon keluhan di kamar bisa lebih cepat teratasi sebelum jadi komplain.',
      time: '3 Hari lalu',
      status: 'Review Komite Mutu',
      upvotes: 17,
      hasUpvoted: false,
      managementResponse: 'Ide sangat inovatif! Sedang diuji coba (pilot project) di 5 kamar VIP Bangsal Melati.'
    },
    {
      id: 'sf-5',
      name: 'Anonim (Staf Admisi / Kasir)',
      role: 'Staf Admisi & Billing',
      unit: 'Kasir Rawat Jalan',
      shift: 'Shift Pagi (07:00-14:00)',
      category: 'Komunikasi Antar-Unit',
      urgency: 'Sedang',
      title: 'Pembaruan tarif paket persalinan belum seragam di brosur cetak vs SIMRS',
      body: 'Ada selisih informasi antara lembar brosur promosi lama dengan tarif paket SC terkini di sistem. Mohon Humas memperbarui banner & brosur fisik di lobi.',
      time: '4 Hari lalu',
      status: 'Selesai',
      upvotes: 12,
      hasUpvoted: false,
      managementResponse: 'Brosur lama telah ditarik seluruhnya dan diganti dengan cetakan versi Agustus 2026.'
    }
  ]);

  // Sync external feedbacks if passed
  useEffect(() => {
    if (feedbacks && feedbacks.length > 0) {
      setPatientFeedbacks(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newFromProps = feedbacks.filter(f => !existingIds.has(f.id)).map(f => ({
          ...f,
          channelType: f.channel?.toLowerCase().includes('telepon') ? 'manual_phone' : 'digital_app',
          recorder: f.recorder || 'Sistem Terintegrasi'
        }));
        return [...newFromProps, ...prev];
      });
    }
  }, [feedbacks]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Submit Manual Patient Feedback
  const handleSaveManualPatientFeedback = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualBody.trim()) {
      alert('Nama Pasien dan Isi Keluhan wajib diisi!');
      return;
    }

    const newId = `pf-manual-${Date.now()}`;
    const newFeedback = {
      id: newId,
      name: manualName,
      meta: manualRm ? `Pasien · ${manualRm}` : 'Pasien Umum (Non-RM)',
      phone: manualPhone || '0812-xxxx-xxxx',
      channel: manualChannel,
      channelType: manualChannel.includes('Telepon') ? 'manual_phone' : manualChannel.includes('Tatap Muka') ? 'manual_frontdesk' : 'manual_box',
      recorder: `Dicatat oleh ${manualRecorder}`,
      sentiment: manualSentiment,
      stars: manualStars,
      time: 'Baru saja',
      category: manualCategory,
      department: manualDept,
      status: 'Open',
      body: manualBody,
      aiReplyDraft: `Yth. ${manualName}, terima kasih atas masukan yang disampaikan kepada tim Humas RSUD Daya mengenai ${manualCategory}. Kami sedang menindaklanjutinya ke bagian ${manualDept}.`,
      replies: []
    };

    setPatientFeedbacks([newFeedback, ...patientFeedbacks]);
    setSelectedPatientFeedId(newId);
    setIsManualPatientModalOpen(false);
    showToast(`✅ Suara Pasien "${manualName}" berhasil dicatat oleh Humas ke Voice & Feedback!`);

    // Reset
    setManualName('');
    setManualRm('');
    setManualPhone('');
    setManualBody('');
  };

  // Sync / Import Spreadsheet
  const handleSyncSpreadsheet = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const importedData = [
        {
          id: `pf-sheet-${Date.now()}-1`,
          name: 'Ny. Desy Anggraini',
          meta: 'Pasien Kebidanan · RM-884012',
          phone: '0812-7788-9900',
          channel: 'Telepon CS',
          channelType: 'manual_phone',
          recorder: 'Diimpor otomatis dari Google Sheets "Log_Telepon_CS_Agustus"',
          sentiment: 'Medium',
          stars: 3,
          time: 'Hari ini, 10:00 WITA',
          category: 'Jadwal Dokter',
          department: 'Poli Obgyn',
          status: 'Open',
          body: 'Menanyakan kepastian jam praktik dokter Sp.OG yang bergeser 30 menit karena operasi darurat.',
          aiReplyDraft: 'Halo Ibu Desy, jadwal praktik dokter hari ini dimulai pukul 10.30 WITA setelah operasi selesai.',
          replies: []
        }
      ];

      setPatientFeedbacks(prev => [...importedData, ...prev]);
      setIsSpreadsheetModalOpen(false);
      showToast(`📊 Berhasil mengimpor data telepon pasien dari Google Sheets!`);
    }, 1000);
  };

  // Submit Staff Voice Input
  const handleSaveStaffFeedback = (e) => {
    e.preventDefault();
    if (!staffTitle.trim() || !staffBody.trim()) {
      alert('Judul dan Uraian Masukan Internal wajib diisi!');
      return;
    }

    const newStaffItem = {
      id: `sf-${Date.now()}`,
      name: staffIsAnonymous ? 'Anonim (Tenaga Medis / Karyawan)' : (staffName || 'Staf Medis RSUD Daya'),
      role: staffRole,
      unit: staffUnit,
      shift: staffShift,
      category: staffCategory,
      urgency: staffUrgency,
      title: staffTitle,
      body: staffBody,
      time: 'Baru saja',
      status: 'Review Komite Mutu',
      upvotes: 1,
      hasUpvoted: true,
      managementResponse: 'Aspirasi telah masuk ke Radar Suara Internal Nakes & diteruskan ke pimpinan unit.'
    };

    setStaffFeedbacks([newStaffItem, ...staffFeedbacks]);
    setSelectedStaffFeedId(newStaffItem.id);
    setIsStaffInputModalOpen(false);
    showToast(`🩺 Masukan internal dari unit ${staffUnit} berhasil disampaikan!`);

    // Reset
    setStaffTitle('');
    setStaffBody('');
    setStaffName('');
  };

  // Upvote staff issue
  const handleUpvoteStaffIssue = (issueId) => {
    setStaffFeedbacks(prev => prev.map(item => {
      if (item.id === issueId) {
        const isUpvoted = item.hasUpvoted;
        return {
          ...item,
          upvotes: isUpvoted ? item.upvotes - 1 : item.upvotes + 1,
          hasUpvoted: !isUpvoted
        };
      }
      return item;
    }));
  };

  // Filtered Patient Feedbacks
  const filteredPatients = patientFeedbacks.filter(feed => {
    if (patientChannelFilter === 'Telepon CS' && !feed.channel.includes('Telepon')) return false;
    if (patientChannelFilter === 'Tatap Muka' && !feed.channel.includes('Tatap Muka') && !feed.channel.includes('Front Desk')) return false;
    if (patientChannelFilter === 'Kotak Saran' && !feed.channel.includes('Kotak Saran')) return false;
    if (patientChannelFilter === 'WhatsApp' && !feed.channel.includes('WA') && !feed.channel.includes('WhatsApp')) return false;
    if (patientChannelFilter === 'Aplikasi' && !feed.channel.includes('Aplikasi') && !feed.channel.includes('Policare App')) return false;
    if (patientChannelFilter === 'Google' && !feed.channel.includes('Google')) return false;

    if (patientSentimentFilter !== 'Semua' && feed.sentiment !== patientSentimentFilter) return false;
    return true;
  });

  // Filtered Staff Feedbacks
  const filteredStaff = staffFeedbacks.filter(item => {
    if (staffRoleFilter !== 'Semua' && !item.role.includes(staffRoleFilter)) return false;
    if (staffCategoryFilter !== 'Semua' && item.category !== staffCategoryFilter) return false;
    if (staffShiftFilter !== 'Semua' && !item.shift?.includes(staffShiftFilter)) return false;
    return true;
  });

  const selectedPatient = patientFeedbacks.find(f => f.id === selectedPatientFeedId) || patientFeedbacks[0];
  const selectedStaff = staffFeedbacks.find(s => s.id === selectedStaffFeedId) || staffFeedbacks[0];

  const totalPatientCritical = patientFeedbacks.filter(p => p.sentiment === 'Kritis' && p.status === 'Open').length;
  const totalStaffUrgent = staffFeedbacks.filter(s => s.urgency === 'Tinggi').length;

  if (!active) return null;

  return (
    <div className="screen on" id="s-radar">
      {/* Toast Notification */}
      {toastMessage && (
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
          <span>{toastMessage}</span>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }} onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* KPI STRIP SUMMARY (CLEAN DUAL METRIC METADATA) */}
      <div className="kstrip k4">
        <div className="kcard kr">
          <div className="kcard-ic"><span className="ic">emergency</span></div>
          <div className="kcard-lbl">Keluhan Kritis Pasien (VOC)</div>
          <div className="kcard-v">{totalPatientCritical}</div>
          <div className="kcard-d dn">Kanal Pasien Eksternal</div>
        </div>
        <div className="kcard ka">
          <div className="kcard-ic"><span className="ic">clinical_notes</span></div>
          <div className="kcard-lbl">Masukan Urgen Nakes (VOE)</div>
          <div className="kcard-v">{totalStaffUrgent}</div>
          <div className="kcard-d fl">Aspirasi Lapangan Internal</div>
        </div>
        <div className="kcard kl">
          <div className="kcard-ic"><span className="ic">hub</span></div>
          <div className="kcard-lbl">Korelasi Layanan 360°</div>
          <div className="kcard-v">4 <small>Titik</small></div>
          <div className="kcard-d up">Keluhan ↔ Akar Masalah Staf</div>
        </div>
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic">sentiment_satisfied</span></div>
          <div className="kcard-lbl">Indeks SKM Resmi Pasien</div>
          <div className="kcard-v">86.4<small>/100</small></div>
          <div className="kcard-d up"><span className="ic s">verified</span>Kemenpan-RB Murni Pasien</div>
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
            <strong>Mode Pantau (Read-Only) Aktif:</strong> Anda memiliki izin untuk meninjau data suara pasien dan aspirasi internal staf. Tombol input manual dan balasan keluhan dinonaktifkan untuk role ini.
          </div>
        </div>
      )}

      {/* MAIN TOP-LEVEL NAVIGATION SUB-TABS (CLEAR TAXONOMY) */}
      <div style={{
        background: 'var(--srf)',
        padding: '8px 12px',
        borderRadius: 'var(--r12)',
        border: '1px solid var(--line)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* SUB-TABS SELECTOR */}
        <div className="tabs" style={{ margin: 0 }}>
          <button
            className={`tab ${activeSubTab === 'patient' ? 'on' : ''}`}
            onClick={() => setActiveSubTab('patient')}
            style={{ fontWeight: 700, fontSize: '13px', padding: '6px 14px' }}>
            <span className="ic s">people</span> 1. Suara Pasien (VOC)
            <span style={{
              background: 'var(--blue)',
              color: '#fff',
              padding: '1px 7px',
              borderRadius: 'var(--rf)',
              fontSize: '11px',
              fontWeight: 700,
              marginLeft: '4px'
            }}>
              {patientFeedbacks.length}
            </span>
          </button>

          <button
            className={`tab ${activeSubTab === 'staff' ? 'on' : ''}`}
            onClick={() => setActiveSubTab('staff')}
            style={{ fontWeight: 700, fontSize: '13px', padding: '6px 14px' }}>
            <span className="ic s">badge</span> 2. Suara Tim Medis &amp; Staf (VOE)
            <span style={{
              background: 'var(--green)',
              color: '#fff',
              padding: '1px 7px',
              borderRadius: 'var(--rf)',
              fontSize: '11px',
              fontWeight: 700,
              marginLeft: '4px'
            }}>
              {staffFeedbacks.length}
            </span>
          </button>

          <button
            className={`tab ${activeSubTab === 'matrix' ? 'on' : ''}`}
            onClick={() => setActiveSubTab('matrix')}
            style={{ fontWeight: 700, fontSize: '13px', padding: '6px 14px', background: activeSubTab === 'matrix' ? '#4f30db' : undefined, color: activeSubTab === 'matrix' ? '#fff' : undefined }}>
            <span className="ic s">hub</span> 3. Radar Korelasi 360° (Dual-Lens)
          </button>

          <button
            className={`tab ${activeSubTab === 'analytics' ? 'on' : ''}`}
            onClick={() => setActiveSubTab('analytics')}
            style={{ fontWeight: 600, fontSize: '13px', padding: '6px 14px' }}>
            <span className="ic s">insights</span> Analisis Sentimen
          </button>
        </div>

        {/* HEADER ACTION BUTTONS (HIDDEN / DISABLED IF READ-ONLY) */}
        {!isReadOnly ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeSubTab === 'patient' && (
              <>
                <button
                  className="btn ghost sm"
                  onClick={() => setIsSpreadsheetModalOpen(true)}
                  title="Sinkronkan Google Sheets atau impor CSV">
                  <span className="ic s" style={{ color: '#10b981' }}>table_view</span> Impor Spreadsheet
                </button>
                <button
                  className="btn pri sm"
                  onClick={() => setIsManualPatientModalOpen(true)}
                  title="Catat feedback dari telepon, tatap muka, atau kotak saran">
                  <span className="ic s">add_call</span> + Catat Suara Pasien
                </button>
              </>
            )}

            {activeSubTab === 'staff' && (
              <button
                className="btn pri sm"
                onClick={() => setIsStaffInputModalOpen(true)}
                style={{ background: 'var(--green)' }}>
                <span className="ic s">post_add</span> + Tulis Masukan Internal Nakes
              </button>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: 600, padding: '4px 8px', background: 'var(--srf2)', borderRadius: '6px' }}>
            🔒 Mode Pantau (Read-Only)
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: SUARA PASIEN (PATIENT FEEDBACK / VOC) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'patient' && (
        <div className="g21">
          {/* LEFT: PATIENT FEEDBACK LIST */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Kanal Suara Pasien (Voice of Customer)</div>
                <div className="card-sub">Ulasan murni dari pasien via WhatsApp, Telepon CS, Tatap Muka, Kotak Saran, App &amp; Google Reviews.</div>
              </div>
              <div className="card-hd-r">
                <span className="bdg g"><span className="pdot"></span>Live Sync Pasien</span>
              </div>
            </div>

            {/* CHANNEL FILTERS */}
            <div className="tabs" style={{ flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
              {['Semua', 'Telepon CS', 'Tatap Muka', 'Kotak Saran', 'WhatsApp', 'Aplikasi', 'Google'].map(ch => (
                <button
                  key={ch}
                  className={`tab ${patientChannelFilter === ch ? 'on' : ''}`}
                  onClick={() => setPatientChannelFilter(ch)}
                  style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                  {ch === 'Telepon CS' && <span className="ic s" style={{ fontSize: '13px' }}>call</span>}
                  {ch === 'Tatap Muka' && <span className="ic s" style={{ fontSize: '13px' }}>person</span>}
                  {ch === 'Kotak Saran' && <span className="ic s" style={{ fontSize: '13px' }}>mail</span>}
                  {ch}
                </button>
              ))}
            </div>

            {/* FEED ITEMS LIST */}
            <div className="feedbox" id="feedbox-list" style={{ maxHeight: '580px', overflowY: 'auto' }}>
              {filteredPatients.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--t3)' }}>
                  Tidak ada feedback pasien untuk filter ini.
                </div>
              ) : (
                filteredPatients.map(feed => {
                  const isSelected = feed.id === selectedPatient?.id;
                  const sentimentClass = feed.sentiment === 'Kritis' ? 'r' : feed.sentiment === 'Medium' ? 'a' : 'g';

                  return (
                    <div
                      key={feed.id}
                      onClick={() => {
                        setSelectedPatientFeedId(feed.id);
                        if (onSelectFeedback) onSelectFeedback(feed.id);
                      }}
                      className={`feed ${isSelected ? 'selected-feed' : ''}`}
                      style={{
                        cursor: 'pointer',
                        borderLeft: `4px solid ${feed.sentiment === 'Kritis' ? 'var(--red)' : feed.sentiment === 'Medium' ? 'var(--amber)' : 'var(--green)'}`,
                        borderColor: isSelected ? 'var(--blue)' : undefined,
                        background: isSelected ? 'var(--blue-s)' : undefined,
                        padding: '12px'
                      }}>
                      
                      <div className="f-hd" style={{ flexWrap: 'wrap', gap: '6px' }}>
                        <span className={`bdg ${sentimentClass}`}>
                          {feed.sentiment === 'Kritis' && <span className="pdot"></span>}
                          {feed.sentiment}
                        </span>

                        <span className="bdg b" style={{ fontSize: '11px', fontWeight: 600 }}>
                          {feed.channel}
                        </span>

                        <span className="f-name" style={{ fontWeight: 700 }}>
                          {isPiiMasked ? PiiMasker.maskName(feed.name) : feed.name}
                        </span>
                        {isPiiMasked && (
                          <span className="bdg g" style={{ fontSize: '9px', padding: '1px 5px' }}>PDP</span>
                        )}
                        <span className="f-src" style={{ marginLeft: 'auto', fontSize: '11px' }}>{feed.time}</span>
                      </div>

                      <div style={{ marginTop: '4px', fontSize: '11.5px', color: 'var(--t3)' }}>
                        {feed.meta} · {feed.department || feed.category}
                      </div>

                      <div className="f-body" style={{ marginTop: '6px', fontSize: '12.5px', color: 'var(--t1)' }}>
                        "{feed.body}"
                      </div>

                      {feed.recorder && (
                        <div style={{ marginTop: '6px', fontSize: '10.5px', color: 'var(--t3)', fontStyle: 'italic' }}>
                          ℹ️ {feed.recorder}
                        </div>
                      )}

                      <div className="f-act" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="bdg n" style={{ fontSize: '10.5px' }}>Status: {feed.status || 'Open'}</span>
                        <span style={{ fontSize: '11.5px', color: 'var(--amber)', fontWeight: 700 }}>
                          {'★'.repeat(feed.stars || 4)}{'☆'.repeat(5 - (feed.stars || 4))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: PATIENT FEEDBACK DETAIL & RESOLUTION */}
          <div className="col">
            {selectedPatient ? (
              <div className="card" style={{ border: '2px solid var(--blue-m)' }}>
                <div className="card-hd">
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s" style={{ color: 'var(--blue)' }}>contact_page</span> Detail Suara Pasien
                  </div>
                  <span className={`bdg ${selectedPatient.sentiment === 'Kritis' ? 'r' : 'g'}`}>
                    {selectedPatient.sentiment}
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--t1)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{isPiiMasked ? PiiMasker.maskName(selectedPatient.name) : selectedPatient.name}</span>
                    {isPiiMasked && <span className="bdg g" style={{ fontSize: '10px' }}>🛡️ UU PDP Protected</span>}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '6px' }}>
                    {selectedPatient.meta} · Kontak: <strong>{isPiiMasked ? PiiMasker.maskPhone(selectedPatient.phone || '0812-4455-8899') : (selectedPatient.phone || '0812-4455-8899')}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginBottom: '10px' }}>
                    Kanal: <strong>{selectedPatient.channel}</strong> · Departemen: <strong>{selectedPatient.department}</strong>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: '1.5', background: 'var(--srf2)', padding: '12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)' }}>
                    "{selectedPatient.body}"
                  </div>
                </div>

                {/* AI RESPONSE DRAFT */}
                <div style={{ background: 'var(--blue-s)', border: '1px solid var(--blue-m)', borderRadius: 'var(--r8)', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">auto_awesome</span> Draf Rekomendasi Balasan Humas (Sinteta AI)
                  </div>
                  <textarea
                    id="patient-reply-input"
                    defaultValue={selectedPatient.aiReplyDraft}
                    rows="3"
                    disabled={isReadOnly}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--r6)', border: '1px solid var(--blue-m)', fontSize: '12px', background: isReadOnly ? 'var(--srf2)' : '#fff', cursor: isReadOnly ? 'not-allowed' : 'text' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    {isReadOnly ? (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>👁️ Mode Pantau: Pengiriman respon dinonaktifkan</span>
                    ) : <span />}
                    <button
                      className="btn pri sm"
                      disabled={isReadOnly}
                      onClick={() => {
                        if (isReadOnly) return;
                        const val = document.getElementById('patient-reply-input')?.value;
                        if (onSubmitQuickReply) onSubmitQuickReply(selectedPatient.id, val || 'Tanggapan terkirim.');
                        setPatientFeedbacks(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, status: 'Selesai', replies: [val || 'Respon terkirim'] } : p));
                        showToast(`📲 Tanggapan berhasil dikirimkan ke ${selectedPatient.name}!`);
                      }}
                      style={{ opacity: isReadOnly ? 0.6 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>
                      <span className="ic s">send</span> Kirim Respon ke Pasien
                    </button>
                  </div>
                </div>

                {/* ESKALASI KE CRISIS / UNIT */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--t3)', marginBottom: '4px' }}>
                    ESKALASI TINDAK LANJUT
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      id="patient-escalate-select"
                      disabled={isReadOnly}
                      style={{ flex: 1, padding: '6px', border: '1px solid var(--line2)', borderRadius: '6px', fontSize: '12px', background: 'var(--srf)', opacity: isReadOnly ? 0.7 : 1 }}>
                      <option value="Poli Obgyn">Poli Kebidanan (Obgyn)</option>
                      <option value="Instalasi Farmasi">Instalasi Farmasi RS</option>
                      <option value="Admisi & Pendaftaran">Admisi &amp; Pendaftaran</option>
                      <option value="Manajemen Pelayanan Medis">Manajemen Pelayanan Medis</option>
                      <option value="Rawat Inap">Rawat Inap &amp; Keperawatan</option>
                      <option value="Crisis Management">🚨 Alihkan ke Crisis Center</option>
                    </select>
                    <button
                      className="btn danger sm"
                      disabled={isReadOnly}
                      onClick={() => {
                        if (isReadOnly) return;
                        const dept = document.getElementById('patient-escalate-select')?.value || 'Departemen';
                        if (onSubmitEscalation) onSubmitEscalation(selectedPatient.id, dept);
                        if (dept === 'Crisis Management' || selectedPatient.sentiment === 'Kritis') {
                          if (onTriggerCrisis) {
                            onTriggerCrisis({
                              id: `cr-radar-${selectedPatient.id}-${Date.now()}`,
                              title: `Eskalasi Keluhan: ${selectedPatient.name} (${selectedPatient.category})`,
                              sourceType: 'RADAR',
                              sourceName: `📡 Radar Layanan Pasien (${selectedPatient.channel})`,
                              reporter: `${selectedPatient.name} (${selectedPatient.meta})`,
                              department: selectedPatient.department || selectedPatient.category,
                              severity: 'Kritis',
                              timeReceived: 'Baru saja',
                              status: 'Open',
                              body: selectedPatient.body,
                              riskImpact: 'Keluhan dieskalasikan ke Crisis Center',
                              aiRecommendation: {
                                riskAnalysis: 'Memerlukan koordinasi Humas dan DPJP.',
                                actionPlan: `1. Hubungi pasien di nomor ${selectedPatient.phone || 'SIMRS'}.\n2. Verifikasi tindak lanjut bagian ${selectedPatient.department}.\n3. Siapkan draf klarifikasi.`,
                                pressRelease: selectedPatient.aiReplyDraft,
                                compensation: 'Voucher Layanan RS'
                              }
                            });
                          }
                        }
                        setPatientFeedbacks(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, status: 'Eskalasi' } : p));
                        showToast(`🚨 Keluhan diteruskan ke ${dept}!`);
                      }}
                      style={{ opacity: isReadOnly ? 0.6 : 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}>
                      Eskalasi
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--t3)' }}>
                Pilih feedback untuk detail &amp; aksi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: SUARA TIM MEDIS & STAF INTERNAL (VOICE OF EMPLOYEE / VOE) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'staff' && (
        <div className="g21">
          {/* LEFT: STAFF VOICE FEED */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Kanal Suara Tim Medis &amp; Staf (VOE)</div>
                <div className="card-sub">Aspirasi klinis, kendala alkes/obat, bug SIMRS, beban shift &amp; usulan inovasi nakes.</div>
              </div>
              <div className="card-hd-r">
                <button className="btn pri sm" onClick={() => setIsStaffInputModalOpen(true)} style={{ background: 'var(--green)' }}>
                  <span className="ic s">post_add</span> Tulis Masukan Nakes
                </button>
              </div>
            </div>

            {/* STAFF FILTERS */}
            <div className="tabs" style={{ flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
              {['Semua', 'Dokter', 'Bidan', 'Perawat', 'Apoteker', 'Admisi'].map(r => (
                <button
                  key={r}
                  className={`tab ${staffRoleFilter === r ? 'on' : ''}`}
                  onClick={() => setStaffRoleFilter(r)}
                  style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                  {r}
                </button>
              ))}
            </div>

            {/* STAFF ITEMS LIST */}
            <div className="feedbox" style={{ maxHeight: '580px', overflowY: 'auto' }}>
              {filteredStaff.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--t3)' }}>
                  Tidak ada aspirasi staf pada kategori ini.
                </div>
              ) : (
                filteredStaff.map(staff => {
                  const isSelected = staff.id === selectedStaff?.id;
                  const urgencyClass = staff.urgency === 'Tinggi' ? 'r' : staff.urgency === 'Sedang' ? 'a' : 'g';

                  return (
                    <div
                      key={staff.id}
                      onClick={() => setSelectedStaffFeedId(staff.id)}
                      className={`feed ${isSelected ? 'selected-feed' : ''}`}
                      style={{
                        cursor: 'pointer',
                        borderLeft: `4px solid ${staff.urgency === 'Tinggi' ? 'var(--red)' : staff.urgency === 'Sedang' ? 'var(--amber)' : 'var(--green)'}`,
                        borderColor: isSelected ? 'var(--green)' : undefined,
                        background: isSelected ? 'var(--green-s)' : undefined,
                        padding: '12px'
                      }}>
                      
                      <div className="f-hd" style={{ flexWrap: 'wrap', gap: '6px' }}>
                        <span className={`bdg ${urgencyClass}`}>
                          {staff.urgency === 'Tinggi' && <span className="pdot"></span>}
                          {staff.urgency}
                        </span>

                        <span className="bdg g" style={{ fontWeight: 600 }}>
                          {staff.role} · {staff.unit}
                        </span>

                        <span className="f-name" style={{ fontWeight: 700 }}>{staff.name}</span>
                        <span className="f-src" style={{ marginLeft: 'auto', fontSize: '11px' }}>{staff.time}</span>
                      </div>

                      <div style={{ marginTop: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>
                        {staff.title}
                      </div>

                      <div className="f-body" style={{ marginTop: '4px', fontSize: '12px', color: 'var(--t2)' }}>
                        "{staff.body}"
                      </div>

                      {/* MANAGEMENT RESPONSE PREVIEW */}
                      {staff.managementResponse && (
                        <div style={{ marginTop: '8px', background: 'var(--srf2)', border: '1px solid var(--line)', padding: '6px 10px', borderRadius: 'var(--r6)', fontSize: '11px', color: 'var(--t2)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--green)' }}>✓ Tindak Lanjut:</span> {staff.managementResponse}
                        </div>
                      )}

                      <div className="f-act" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="bdg n" style={{ fontSize: '10.5px' }}>{staff.category} · {staff.shift || 'Shift Terjadwal'}</span>

                        <button
                          type="button"
                          className="btn ghost xs"
                          onClick={(e) => { e.stopPropagation(); handleUpvoteStaffIssue(staff.id); }}
                          style={{
                            background: staff.hasUpvoted ? 'var(--green-s)' : undefined,
                            color: staff.hasUpvoted ? 'var(--green)' : undefined,
                            borderColor: staff.hasUpvoted ? 'var(--green)' : undefined,
                            fontWeight: 700
                          }}>
                          <span className="ic s" style={{ fontSize: '14px' }}>thumb_up</span>
                          Dukungan Sejawat ({staff.upvotes})
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: STAFF VOICE DETAIL & RESOLUTION */}
          <div className="col">
            {selectedStaff ? (
              <div className="card" style={{ border: '2px solid var(--green-m)' }}>
                <div className="card-hd">
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s" style={{ color: 'var(--green)' }}>medical_services</span> Detail Masukan Nakes
                  </div>
                  <span className={`bdg ${selectedStaff.urgency === 'Tinggi' ? 'r' : 'g'}`}>
                    {selectedStaff.urgency}
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>
                    {selectedStaff.title}
                  </h4>
                  <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginBottom: '8px' }}>
                    Oleh: <strong>{selectedStaff.name}</strong> ({selectedStaff.role}) · Unit: <strong>{selectedStaff.unit}</strong> ({selectedStaff.shift})
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--t2)', lineHeight: '1.5', background: 'var(--srf2)', padding: '10px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)' }}>
                    "{selectedStaff.body}"
                  </div>
                </div>

                {/* DISPOSISI MANAJEMEN */}
                <div style={{ background: 'var(--green-s)', border: '1px solid var(--green-m)', borderRadius: 'var(--r8)', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">task_alt</span> Status Tindak Lanjut Manajemen &amp; Komite
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--t1)', lineHeight: '1.4' }}>
                    {selectedStaff.managementResponse || 'Dalam proses koordinasi komite terkait.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn pri sm"
                    style={{ flex: 1, justifyContent: 'center', background: 'var(--green)' }}
                    onClick={() => {
                      alert(`Aspirasi nakes berhasil diteruskan ke agenda Komite Mutu & Pengadaan RS.`);
                    }}>
                    <span className="ic s">forward_to_inbox</span> Teruskan ke Komite Mutu
                  </button>
                  <button
                    className="btn ghost sm"
                    onClick={() => handleUpvoteStaffIssue(selectedStaff.id)}>
                    <span className="ic s">thumb_up</span> {selectedStaff.hasUpvoted ? 'Didukung' : 'Dukung'} ({selectedStaff.upvotes})
                  </button>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--t3)' }}>
                Pilih aspirasi untuk detail &amp; tindak lanjut.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: MATRIKS KORELASI LAYANAN 360° (DUAL-LENS CORRELATION) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* BANNER EXPLANATION */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', color: '#fff', padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="ic" style={{ color: '#a855f7', fontSize: '28px' }}>hub</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: '#fff' }}>
                  Radar Layanan 360°: Korelasi Suara Pasien (VOC) &amp; Suara Staf (VOE)
                </h3>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '3px' }}>
                  Menghubungkan <strong>apa yang dirasakan pasien</strong> dengan <strong>akar kendala operasional yang dialami nakes di lapangan</strong> secara berdampingan tanpa mencampuradukkan data dasar survei kepuasan pasien.
                </div>
              </div>
            </div>
          </div>

          {/* DUAL-LENS CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* PAIR 1: FARMASI */}
            <div className="card" style={{ borderLeft: '5px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="bdg r" style={{ fontWeight: 700 }}>KORELASI 1: WAKTU TUNGGU FARMASI</span>
                  <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Unit: Depo Farmasi Rawat Jalan</span>
                </div>
                <span className="bdg g">Korelasi Kuat (94%)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* SISI PASIEN */}
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="ic s">people</span> Sisi Pasien (VOC): Keluhan Waktu Tunggu 2.5 Jam
                  </div>
                  <p style={{ fontSize: '12px', color: '#7f1d1d', margin: 0 }}>
                    "Antre obat racikan sampai 2.5 jam padahal kondisi sedang pusing setelah periksa dokter..."
                  </p>
                  <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '6px', fontWeight: 600 }}>
                    Sumber: Google Review &amp; WhatsApp CS (18% responden mengeluhkan hal serupa)
                  </div>
                </div>

                {/* SISI STAF */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="ic s">medical_services</span> Sisi Staf (VOE): Usulan Printer Barcode &amp; Shift
                  </div>
                  <p style={{ fontSize: '12px', color: '#14532d', margin: 0 }}>
                    "Apoteker lapor mesin cetak etiket resep hanya 1 unit sehingga tim racik antre cetak etiket pada jam puncak 09:00-11:30..."
                  </p>
                  <div style={{ fontSize: '11px', color: '#15803d', marginTop: '6px', fontWeight: 600 }}>
                    Status: Disetujui Pengadaan 1 Unit Printer Etiket Tambahan (Didukung 34 Staf)
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--srf2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--t2)' }}>💡 <strong>Rekomendasi Solusi Terpadu:</strong> Percepat instalasi printer etiket + aktifkan Layanan Antar Obat Gratis.</span>
                {!isReadOnly ? (
                  <button className="btn pri sm" onClick={() => alert('Disposisi prioritas eksekutif berhasil diteruskan!')} style={{ background: '#4f30db' }}>
                    Tindak Lanjuti Akar Masalah
                  </button>
                ) : (
                  <span className="bdg n" style={{ fontSize: '11px' }}>👁️ Mode Pantau Eksekutif</span>
                )}
              </div>
            </div>

            {/* PAIR 2: POLI OBGYN */}
            <div className="card" style={{ borderLeft: '5px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="bdg b" style={{ fontWeight: 700 }}>KORELASI 2: ANTREAN USG 4D POLI KEBIDANAN</span>
                  <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Unit: Poliklinik Obgyn</span>
                </div>
                <span className="bdg g">Korelasi Sedang (82%)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* SISI PASIEN */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="ic s">people</span> Sisi Pasien (VOC): Kursi Tunggu Padat saat Jam Praktik
                  </div>
                  <p style={{ fontSize: '12px', color: '#1e3a8a', margin: 0 }}>
                    "Antrean USG 4D agak padat dan ruang tunggu perlu tambahan kursi cadangan untuk ibu hamil..."
                  </p>
                  <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '6px', fontWeight: 600 }}>
                    Sumber: Tatap Muka Meja Informasi &amp; SKM
                  </div>
                </div>

                {/* SISI STAF */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="ic s">medical_services</span> Sisi Staf (VOE): Alokasi Shift Slot USG
                  </div>
                  <p style={{ fontSize: '12px', color: '#14532d', margin: 0 }}>
                    "Bidan Poliklinik mengusulkan pembagian slot booking berbasis jam kedatangan via WhatsApp Policare agar pasien tidak menumpuk di jam yang sama..."
                  </p>
                  <div style={{ fontSize: '11px', color: '#15803d', marginTop: '6px', fontWeight: 600 }}>
                    Status: Fitur Slot Booking Telah Diaktifkan di Policare Studio
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--srf2)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--t2)' }}>💡 <strong>Rekomendasi Solusi Terpadu:</strong> Terapkan sistem booking per jam + sediakan 6 kursi tambahan.</span>
                {!isReadOnly ? (
                  <button className="btn pri sm" onClick={() => alert('Penataan alur poli telah disetujui!')} style={{ background: '#4f30db' }}>
                    Tindak Lanjuti Akar Masalah
                  </button>
                ) : (
                  <span className="bdg n" style={{ fontSize: '11px' }}>👁️ Mode Pantau Eksekutif</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: SENTIMEN & ANALYTICS ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'analytics' && (
        <div className="g21">
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Matriks Sentimen Layanan</div>
                <div className="card-sub">Perbandingan proporsi kepuasan pasien &amp; kepuasan staf secara independen</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* PASIEN */}
              <div style={{ background: 'var(--srf2)', border: '1px solid var(--line)', borderRadius: 'var(--r12)', padding: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s">people</span> Suara Pasien (Indeks SKM 86.4%)
                </div>
                <div className="sbar" style={{ marginBottom: '8px' }}>
                  <div className="sg" style={{ width: '78%' }}></div>
                  <div className="sn" style={{ width: '14%' }}></div>
                  <div className="sr" style={{ width: '8%' }}></div>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: '1.6' }}>
                  • <strong>Apresiasi Tertinggi:</strong> Keramahan Bidan VK (94%)<br />
                  • <strong>Keluhan Utama:</strong> Antrean Depo Farmasi (18%)
                </div>
              </div>

              {/* NAKES */}
              <div style={{ background: 'var(--srf2)', border: '1px solid var(--line)', borderRadius: 'var(--r12)', padding: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s">medical_services</span> Suara Staf (Indeks Dukungan 84%)
                </div>
                <div className="sbar" style={{ marginBottom: '8px' }}>
                  <div className="sg" style={{ width: '74%', background: 'var(--green)' }}></div>
                  <div className="sn" style={{ width: '16%' }}></div>
                  <div className="sr" style={{ width: '10%' }}></div>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: '1.6' }}>
                  • <strong>Aspirasi Terbanyak:</strong> Printer etiket farmasi (34 votes)<br />
                  • <strong>Kebutuhan Logistik:</strong> Buffer stock OK (19 votes)
                </div>
              </div>
            </div>

            {/* SINTESIS AI */}
            <div style={{ background: 'var(--loy-s)', border: '1px solid var(--loy-m)', borderRadius: 'var(--r8)', padding: '12px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--loy)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="ic s">smart_toy</span> Sintesis AI Cross-Insight
              </div>
              <p style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: '1.5' }}>
                Data menunjukkan pemisahan yang bersih: Skor SKM Pasien tetap objektif 86.4% tanpa distorsi suara internal, sementara aspirasi nakes terwadahi dengan baik dan memicu perbaikan pengadaan printer etiket farmasi secara proaktif.
              </p>
            </div>
          </div>

          <div className="col">
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l"><div className="card-title">Topik Tren Minggu Ini</div></div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C', padding: '4px 10px', borderRadius: 'var(--rf)', fontSize: '12px', fontWeight: '700' }}>🔥 #FarmasiAntrean</span>
                <span style={{ background: 'var(--green-s)', border: '1px solid var(--green-m)', color: 'var(--green)', padding: '4px 10px', borderRadius: 'var(--rf)', fontSize: '12px', fontWeight: '600' }}>#BidanSriRamah</span>
                <span style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#C2410C', padding: '4px 10px', borderRadius: 'var(--rf)', fontSize: '12px', fontWeight: '700' }}>🔥 #StokBenangOK</span>
                <span style={{ background: 'var(--srf2)', border: '1px solid var(--line)', color: 'var(--t2)', padding: '4px 10px', borderRadius: 'var(--rf)', fontSize: '12px' }}>#SIMRSPartograf</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: INPUT SUARA PASIEN MANUAL OLEH HUMAS ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {isManualPatientModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--srf)',
            borderRadius: 'var(--r16)',
            width: '100%',
            maxWidth: '580px',
            boxShadow: 'var(--sh2)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            animation: 'fadeup-demo .2s ease'
          }}>
            <div style={{ padding: '16px 20px', background: 'var(--blue-s)', borderBottom: '1px solid var(--blue-m)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic l" style={{ color: 'var(--blue)' }}>add_call</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--blue)' }}>Input Suara Pasien Manual</h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>Untuk data offline (telepon CS, tatap muka front desk, kotak saran)</div>
                </div>
              </div>
              <button className="btn ghost xs ico" onClick={() => setIsManualPatientModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveManualPatientFeedback} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Nama Pasien</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Nomor Rekam Medis (RM)</label>
                  <input
                    type="text"
                    placeholder="No. RM"
                    value={manualRm}
                    onChange={(e) => setManualRm(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Nomor Kontak Pasien</label>
                  <input
                    type="text"
                    placeholder="WhatsApp/Telepon"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Saluran Penerimaan</label>
                  <select
                    value={manualChannel}
                    onChange={(e) => setManualChannel(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)' }}>
                    <option value="Telepon Langsung ke CS / Humas">📞 Telepon Langsung ke CS</option>
                    <option value="Tatap Muka di Meja Informasi / CS">🏢 Tatap Muka Front Desk</option>
                    <option value="Kotak Saran Fisik Ruangan">📬 Kotak Saran Fisik</option>
                    <option value="WhatsApp Personal Humas">💬 WhatsApp CS</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Unit Layanan Terkait</label>
                  <select
                    value={manualDept}
                    onChange={(e) => setManualDept(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)' }}>
                    <option value="Poli Obgyn (Kebidanan)">Poli Kebidanan (Obgyn)</option>
                    <option value="Poli Spesialis Anak">Poli Spesialis Anak</option>
                    <option value="Depo Farmasi / Apotek">Depo Farmasi / Apotek</option>
                    <option value="Rawat Inap & Keperawatan">Rawat Inap &amp; Keperawatan</option>
                    <option value="Kasir & Admisi">Kasir &amp; Admisi</option>
                    <option value="UGD / Gawat Darurat">UGD / Gawat Darurat</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Tingkat Sentimen Pasien</label>
                  <select
                    value={manualSentiment}
                    onChange={(e) => setManualSentiment(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)' }}>
                    <option value="Kritis">🔴 Kritis (Potensi Krisis / Komplain Berat)</option>
                    <option value="Medium">🟡 Medium / Netral (Pertanyaan & Saran)</option>
                    <option value="Positif">🟢 Positif (Apresiasi / Pujian Layanan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Isi Keluhan Pasien *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tuliskan isi keluhan atau saran pasien..."
                  value={manualBody}
                  onChange={(e) => setManualBody(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                ></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Dicatat oleh</label>
                <input
                  type="text"
                  value={manualRecorder}
                  onChange={(e) => setManualRecorder(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost" onClick={() => setIsManualPatientModalOpen(false)}>Batal</button>
                <button type="submit" className="btn pri">
                  <span className="ic s">save</span> Simpan ke Suara Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: INTEGRASI & TARIK SPREADSHEET ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {isSpreadsheetModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--srf)',
            borderRadius: 'var(--r16)',
            width: '100%',
            maxWidth: '620px',
            boxShadow: 'var(--sh2)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            animation: 'fadeup-demo .2s ease'
          }}>
            <div style={{ padding: '16px 20px', background: '#ECFDF5', borderBottom: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic l" style={{ color: '#059669' }}>table_view</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#065F46' }}>Integrasi Spreadsheet Log Pasien</h3>
                  <div style={{ fontSize: '11px', color: '#047857' }}>Sinkronisasi Google Sheets Log Telepon CS &amp; Formulir Pasien Offline</div>
                </div>
              </div>
              <button className="btn ghost xs ico" onClick={() => setIsSpreadsheetModalOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ border: '1.5px solid #A7F3D0', background: '#F0FDF4', borderRadius: 'var(--r10)', padding: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#065F46', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s">sync</span> Google Sheets Real-time Connector
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--t3)', marginBottom: '3px' }}>URL Spreadsheet:</label>
                  <input
                    type="text"
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid #A7F3D0', fontSize: '12px', background: '#fff' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Status: 🟢 {sheetsStatus}</span>
                  <button
                    type="button"
                    className="btn pri sm"
                    disabled={isSyncing}
                    onClick={handleSyncSpreadsheet}
                    style={{ background: '#059669' }}>
                    <span className="ic s">cloud_download</span> {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan & Impor Data'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost" onClick={() => setIsSpreadsheetModalOpen(false)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 3: TULIS MASUKAN INTERNAL NAKES / STAF ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {isStaffInputModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--srf)',
            borderRadius: 'var(--r16)',
            width: '100%',
            maxWidth: '580px',
            boxShadow: 'var(--sh2)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            animation: 'fadeup-demo .2s ease'
          }}>
            <div style={{ padding: '16px 20px', background: 'var(--green-s)', borderBottom: '1px solid var(--green-m)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic l" style={{ color: 'var(--green)' }}>post_add</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green)' }}>Sampaikan Aspirasi &amp; Masukan Internal Nakes</h3>
                  <div style={{ fontSize: '11px', color: 'var(--t2)' }}>Wadah aspirasi Dokter, Bidan, Perawat &amp; Staf untuk perbaikan alur kerja &amp; sarana RS</div>
                </div>
              </div>
              <button className="btn ghost xs ico" onClick={() => setIsStaffInputModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveStaffFeedback} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--r8)', background: 'var(--srf2)', border: '1px solid var(--line)' }}>
                <input
                  type="checkbox"
                  id="staff-anon-check"
                  checked={staffIsAnonymous}
                  onChange={(e) => setStaffIsAnonymous(e.target.checked)}
                />
                <label htmlFor="staff-anon-check" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)', cursor: 'pointer' }}>
                  🔒 Kirim Masukan Secara Anonim (Identitas nakes dirahasiakan)
                </label>
              </div>

              {!staffIsAnonymous && (
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Nama &amp; Gelar Staf / Nakes</label>
                  <input
                    type="text"
                    placeholder="Contoh: dr. Supriyadi, Sp.B / Bidan Sri Wahyuni, S.ST"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Profesi / Role</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)' }}>
                    <option value="Dokter Spesialis">Dokter Spesialis</option>
                    <option value="Dokter Umum">Dokter Umum</option>
                    <option value="Bidan">Bidan</option>
                    <option value="Perawat">Perawat</option>
                    <option value="Apoteker / Farmasi">Apoteker / Farmasi</option>
                    <option value="Staf Admisi & Billing">Staf Admisi &amp; Billing</option>
                    <option value="Laboratorium & Penunjang">Laboratorium &amp; Penunjang</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Unit / Ruangan</label>
                  <select
                    value={staffUnit}
                    onChange={(e) => setStaffUnit(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)' }}>
                    <option value="Kamar Bersalin (VK)">Kamar Bersalin (VK)</option>
                    <option value="Kamar Operasi (OK)">Kamar Operasi (OK)</option>
                    <option value="Poliklinik Rawat Jalan">Poliklinik Rawat Jalan</option>
                    <option value="Rawat Inap Bangsal">Rawat Inap Bangsal</option>
                    <option value="Depo Farmasi">Depo Farmasi</option>
                    <option value="UGD / IGD">UGD / IGD</option>
                    <option value="Admisi & Pendaftaran">Admisi &amp; Pendaftaran</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Shift Kerja</label>
                  <select
                    value={staffShift}
                    onChange={(e) => setStaffShift(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)' }}>
                    <option value="Shift Pagi (07:00-14:00)">Shift Pagi</option>
                    <option value="Shift Siang (14:00-21:00)">Shift Siang</option>
                    <option value="Shift Malam (21:00-07:00)">Shift Malam</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Kategori Masukan</label>
                  <select
                    value={staffCategory}
                    onChange={(e) => setStaffCategory(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)' }}>
                    <option value="Ketersediaan Obat & Alkes">Ketersediaan Obat &amp; Alkes</option>
                    <option value="Sistem SIMRS & IT">Sistem SIMRS &amp; IT</option>
                    <option value="Fasilitas & Alur Kerja">Fasilitas &amp; Alur Kerja</option>
                    <option value="Komunikasi Antar-Unit">Komunikasi Antar-Unit</option>
                    <option value="Inovasi Pelayanan">Ide Inovasi Pelayanan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Tingkat Urgensi</label>
                  <select
                    value={staffUrgency}
                    onChange={(e) => setStaffUrgency(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)' }}>
                    <option value="Tinggi">🔴 Tinggi (Menghambat Alur Pasien / Urgent)</option>
                    <option value="Sedang">🟡 Sedang (Perlu Perbaikan Bertahap)</option>
                    <option value="Inovasi">🟢 Inovasi / Usulan Peningkatan Mutu</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Judul Pokok Masukan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Stok benang bedah Vicryl 3-0 sering terlambat di OK"
                  value={staffTitle}
                  onChange={(e) => setStaffTitle(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Uraian Detail &amp; Usulan Solusi *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Jelaskan kendala di lapangan dan saran solusi yang diharapkan dari manajemen..."
                  value={staffBody}
                  onChange={(e) => setStaffBody(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost" onClick={() => setIsStaffInputModalOpen(false)}>Batal</button>
                <button type="submit" className="btn pri" style={{ background: 'var(--green)' }}>
                  <span className="ic s">send</span> Kirim Masukan Nakes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
