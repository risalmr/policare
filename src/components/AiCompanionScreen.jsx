import { useState } from 'react';
import AiPatientInfoHub from './AiPatientInfoHub';

/* ─────────────────────────────────────────────────────────────────────────────
 *  AiCompanionScreen.jsx — Repository & Pengaturan AI Companion (Sinteta AI)
 *  RSUD Daya Kota Makassar Piloting
 *
 *  Fitur Utama:
 *  1. 📚 Basis Pengetahuan (Public, Internal, Hybrid Knowledge Spaces)
 *  2. 🔄 Pengaturan Jadwal & Penarikan Data SIMRS (Scheduled & Automated Sync)
 *  3. 🛡️ Guardrails AI: Monitoring & Pengaturan Keamanan Medis & Etika
 *  4. 💰 Smart Token & Cost Saver Engine (Mode Hemat Kuota untuk Non-Teknis)
 *  5. 🔌 Konektor Saluran (WhatsApp Official, Web Widget, EHR Copilot)
 *  6. 📊 Performa & Analisis Percakapan
 * ─────────────────────────────────────────────────────────────────────────────*/

export default function AiCompanionScreen({ active }) {
  const [activeTab, setActiveTab] = useState('patient-info'); // 'patient-info' | 'knowledge' | 'simrs-sync' | 'guardrails' | 'cost-saver' | 'channels' | 'analytics'
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState('all'); // 'all' | 'public' | 'internal' | 'hybrid'
  const [toastMsg, setToastMsg] = useState(null);

  // Helper toast notification
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // 1. KNOWLEDGE BASE STATE
  // ---------------------------------------------------------------------------
  const [knowledgeList, setKnowledgeList] = useState([
    { id: 1, name: 'SOP Pelayanan & Tarif Layanan RSUD 2026.pdf', category: 'Tarif & Layanan', size: '4.2 MB', status: 'Terindeks', count: '142 Poin Knowledge', space: 'hybrid', spaceLabel: '🤝 Shared / Hybrid', desc: 'Dapat diakses Pasien & Staf Internal dengan penyesuaian gaya bahasa AI' },
    { id: 2, name: 'Buku Panduan Syarat & Alur BPJS Kesehatan.pdf', category: 'Administrasi', size: '2.1 MB', status: 'Terindeks', count: '86 Poin Knowledge', space: 'public', spaceLabel: '📢 Public Space', desc: 'Digunakan AI untuk menjawab pertanyaan pasien di WhatsApp & Website' },
    { id: 3, name: 'Katalog Formularium & Dosis Obat Farmasi 2026.xlsx', category: 'Klinis & Obat', size: '1.8 MB', status: 'Terindeks', count: '412 Poin Knowledge', space: 'internal', spaceLabel: '🔒 Internal Space', desc: 'Kerahasiaan tinggi. Hanya diakses Dokter/Perawat di SIMRS Internal' },
    { id: 4, name: 'Jadwal Dokter & Kuota Poli (Direct SIMRS API)', category: 'Real-time SIMRS', size: 'API Direct', status: 'Live Sync', count: 'Real-time', space: 'hybrid', spaceLabel: '🤝 Shared / Hybrid', desc: 'Direct SIMRS API sync untuk informasi jadwal publik & internal' },
    { id: 5, name: 'Protokol Penanganan Darurat Maternal & Neonatal.pdf', category: 'SOP Klinis', size: '3.5 MB', status: 'Terindeks', count: '94 Poin Knowledge', space: 'internal', spaceLabel: '🔒 Internal Space', desc: 'Panduan medis darurat khusus Nakes & Tim Medis RS' },
    { id: 6, name: 'Panduan Fasilitas, Jam Besuk & Denah RS.pdf', category: 'Fasilitas & Layanan', size: '1.5 MB', status: 'Terindeks', count: '45 Poin Knowledge', space: 'public', spaceLabel: '📢 Public Space', desc: 'Informasi umum kunjungan untuk pasien & keluarga' },
  ]);

  // AI Testing Playground State
  const [testMode, setTestMode] = useState('external'); // 'external' | 'internal'
  const [testQuery, setTestQuery] = useState('');
  const [testAnswer, setTestAnswer] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // New Document Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCat, setDocCat] = useState('Tarif & Layanan');
  const [docSpace, setDocSpace] = useState('public');

  // ---------------------------------------------------------------------------
  // 2. SIMRS SYNC & SCHEDULE CONFIGURATION STATE
  // ---------------------------------------------------------------------------
  const [simrsEndpoint, setSimrsEndpoint] = useState('https://simrs.rsuddaya.makassar.go.id/api/v2/bridging');
  const [simrsStatus, setSimrsStatus] = useState('Terhubung & Stabil (Latency: 42ms)');
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Hari ini, 07:00 WITA');
  const [syncFrequency, setSyncFrequency] = useState('SCHEDULED_TWICE_DAILY'); // 'HOURLY', 'SHIFT_BASED', 'SCHEDULED_TWICE_DAILY', 'MANUAL_ONLY'
  const [morningSyncTime, setMorningSyncTime] = useState('06:30');
  const [eveningSyncTime, setEveningSyncTime] = useState('18:00');
  
  // Scope penarikan data
  const [syncScope, setSyncScope] = useState({
    outpatientVisits: true,      // Kunjungan Rawat Jalan 3 hari terakhir (Follow-up)
    inpatientDischarge: true,    // Pasien KRS (Pulang Rawat Inap) untuk edukasi nifas/post-op
    doctorSchedule: true,        // Kuota & Jadwal Dokter Poliklinik
    pharmacyPrescriptions: true, // Status penebusan obat pasien kronis
    labRadiologyResults: false   // Hasil lab (sensitif - dimatikan default demi privasi)
  });

  // ---------------------------------------------------------------------------
  // 3. GUARDRAIL AI SETTINGS & MONITORING LOGS
  // ---------------------------------------------------------------------------
  const [guardrailSettings, setGuardrailSettings] = useState({
    blockSelfDiagnosis: true,       // Larang diagnosa definitif mandiri
    redactPiiData: true,            // Sensor otomatis NIK, Rekam Medis, & Alamat
    interceptEmergencyWords: true,  // Cegat kata darurat -> alihkan ke IGD 24 Jam
    enforceEmpathyTone: true,       // Format sopan empati ramah khas humas
    blockInternalDocuments: true,   // Cegah kebocoran dokumen internal ke WhatsApp
    requireDoctorSignOff: true      // Wajib persetujuan dokter untuk draf konten promosi
  });

  const [guardrailLogs, setGuardrailLogs] = useState([
    {
      id: 'gl-101',
      time: 'Hari ini, 08:14 WITA',
      channel: 'WhatsApp CS',
      patientText: 'Dokter, saya muntah darah dan pusing sekali dari semalam.',
      riskCategory: '🚨 Kritis / Gawat Darurat',
      actionTaken: 'Dialog umum dicegat. AI otomatis kirim nomor kontak darurat IGD RSUD Daya (+62 811-4455-999) & lokasi navigasi.',
      status: 'Terproteksi'
    },
    {
      id: 'gl-102',
      time: 'Hari ini, 07:45 WITA',
      channel: 'Website Chatbot',
      patientText: 'Saya demam 3 hari bintik merah, apakah ini pasti demam berdarah?',
      riskCategory: '⚠️ Permintaan Diagnosa Definitif',
      actionTaken: 'Diagnosa mandiri ditolak. AI memberikan edukasi umum gejala & menyarankan pendaftaran ke Poli Penyakit Dalam / Anak.',
      status: 'Terproteksi'
    },
    {
      id: 'gl-103',
      time: 'Kemarin, 21:10 WITA',
      channel: 'WhatsApp CS',
      patientText: 'Tolong berikan SOP dosis obat bius operasi caesar dokter.',
      riskCategory: '🔒 Dokumen Rahasia Internal',
      actionTaken: 'Akses ditolak oleh Guardrail Isolasi Space. Dokumen internal tidak disajikan ke publik.',
      status: 'Terproteksi'
    }
  ]);

  // ---------------------------------------------------------------------------
  // 4. SMART TOKEN & COST SAVER ENGINE STATE (HEMAT BIAYA & KUOTA)
  // ---------------------------------------------------------------------------
  const [costSavingMode, setCostSavingMode] = useState('STANDARD'); // 'MAX_SAVER', 'STANDARD', 'DEEP_REASONING'
  const [semanticCacheActive, setSemanticCacheActive] = useState(true);
  const [pruneOldRecords, setPruneOldRecords] = useState(true);
  const [deduplicateChats, setDeduplicateChats] = useState(true);

  if (!active) return null;

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const handleRunTest = (e) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    setIsTesting(true);

    setTimeout(() => {
      let ans = '';
      let citation = '';
      let queriedSpace = '';

      if (testMode === 'external') {
        queriedSpace = '📢 Public Space & 🤝 Shared Hybrid Space (Akses Terisolasi Ambil Data Pasien)';
        if (testQuery.toLowerCase().includes('usg') || testQuery.toLowerCase().includes('tarif')) {
          ans = 'Halo Ayah & Bunda! 😊 Tarif pemeriksaan USG 4D di RSUD Daya Kota Makassar adalah Rp 250.000 (sudah termasuk print foto 4D & konsultasi dokter spesialis kandungan). Anda bisa mendaftar online melalui WhatsApp ini atau aplikasi Policare.';
          citation = 'Dokumen: SOP Pelayanan & Tarif Layanan RSUD 2026.pdf [🤝 Shared Space] (Hlm 14)';
        } else if (testQuery.toLowerCase().includes('bpjs') || testQuery.toLowerCase().includes('syarat')) {
          ans = 'Untuk pelayanan BPJS Kesehatan di RSUD Daya, harap membawa: 1) Kartu BPJS/KIS aktif, 2) KTP/KK, dan 3) Surat Rujukan Faskes 1 (Puskesmas/Klinik). Pendaftaran dibuka mulai pukul 07.30 WITA.';
          citation = 'Dokumen: Buku Panduan Syarat & Alur BPJS Kesehatan.pdf [📢 Public Space] (Hlm 3)';
        } else if (testQuery.toLowerCase().includes('preeklem') || testQuery.toLowerCase().includes('dosis') || testQuery.toLowerCase().includes('obat keras')) {
          ans = 'Mohon maaf, mengenai detail dosis & protokol medis khusus tersebut merupakan informasi internal tim medis. Apabila Anda mengalami keluhan darurat kehamilan, mohon segera ke IGD RSUD Daya (24 Jam) atau hubungi Call Center Emergency kami di +62 811-4455-999.';
          citation = '🛡️ Security Guardrail Active: Internal Space documents blocked from Public WhatsApp/Web Query.';
        } else {
          ans = `Terima kasih telah menghubungi RSUD Daya Kota Makassar. Mengenai "${testQuery}", petugas layanan kami siap membantu. Jam operasional poliklinik adalah Senin - Sabtu (08.00 - 20.00 WITA). Ingin kami bantu jadwalkan kunjungan dokter spesialis?`;
          citation = 'Dokumen: Panduan Fasilitas & Layanan RS.pdf [📢 Public Space] & Direct SIMRS API';
        }
      } else {
        queriedSpace = '🔒 Internal Space & 🤝 Shared Hybrid Space (Akses Terautentikasi Staf Medis)';
        if (testQuery.toLowerCase().includes('preeklem') || testQuery.toLowerCase().includes('sop')) {
          ans = '[INTERNAL COPILOT RSUD DAYA] Protokol Preeklamsia Berat (PEB): 1) Pemberian MgSO4 dosis awal 4g IV (20% dalam 20cc) pelan 5 menit, 2) Dosis pemeliharaan 6g MgSO4 dalam 500cc Ringer Laktat (28 tetes/menit), 3) Evaluasi refleks patella & respirasi (>16x/m) tiap jam.';
          citation = 'Dokumen: Protokol Penanganan Darurat Maternal & Neonatal.pdf [🔒 Internal Space] (SOP Klinis #PEB-04)';
        } else {
          ans = `[INTERNAL COPILOT RSUD DAYA] Hasil penelusuran sistem SIMRS & SOP RS mengenai "${testQuery}": Pastikan input rekam medis elektronik menggunakan format SOAP terstandar. Untuk verifikasi klaim BPJS rawat inap, batas pengunggahan berkas adalah 2x24 jam pasca KRS.`;
          citation = 'Dokumen: Katalog Formularium & Dosis Obat Farmasi 2026.xlsx [🔒 Internal Space]';
        }
      }

      setTestAnswer({ text: ans, citation, queriedSpace });
      setIsTesting(false);
    }, 500);
  };

  const handleUploadDoc = (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      alert('Nama dokumen harus diisi!');
      return;
    }

    const spaceLabel = docSpace === 'public' ? '📢 Public Space' : docSpace === 'internal' ? '🔒 Internal Space' : '🤝 Shared / Hybrid';
    const spaceDesc = docSpace === 'public'
      ? 'Digunakan AI untuk menjawab pertanyaan pasien di WhatsApp & Website'
      : docSpace === 'internal'
      ? 'Kerahasiaan tinggi. Hanya diakses Dokter/Perawat di SIMRS Internal'
      : 'Dapat diakses Pasien & Staf Internal dengan penyesuaian gaya bahasa AI';

    const newDoc = {
      id: Date.now(),
      name: docName,
      category: docCat,
      size: '2.4 MB',
      status: 'Terindeks',
      count: '98 Poin Knowledge',
      space: docSpace,
      spaceLabel,
      desc: spaceDesc
    };

    setKnowledgeList([newDoc, ...knowledgeList]);
    setShowUploadModal(false);
    setDocName('');
    showToast(`✅ Dokumen "${docName}" berhasil diindeks ke ${spaceLabel}`);
  };

  const handleTriggerManualSync = () => {
    setIsSyncingNow(true);
    setTimeout(() => {
      setIsSyncingNow(false);
      const timeStr = `Hari ini, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`;
      setLastSyncTime(timeStr);
      showToast('🔄 Penarikan data dari SIMRS RSUD Daya berhasil disinkronkan!');
    }, 1200);
  };

  const handleTestSimrsConnection = () => {
    showToast('⚡ Menguji koneksi bridging SIMRS RSUD Daya... Status: OK (Latency 38ms, HTTP 200)');
  };

  const toggleGuardrail = (key) => {
    setGuardrailSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`🛡️ Guardrail "${key}" diperbarui`);
      return updated;
    });
  };

  const toggleSyncScope = (key) => {
    setSyncScope(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredKnowledge = selectedSpaceFilter === 'all'
    ? knowledgeList
    : knowledgeList.filter(k => k.space === selectedSpaceFilter);

  return (
    <div className="screen on" id="s-ai-companion">
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '10px',
          boxShadow: 'var(--sh2)', border: '1.5px solid var(--blue)', fontSize: '13px',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeup-demo .2s ease'
        }}>
          <span className="ic s" style={{ color: '#38bdf8' }}>info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="ph">
        <div className="ph-text">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
            <span className="ic s" style={{ fontSize: '14px' }}>smart_toy</span> SINTETA AI COMPANION · RSUD DAYA
          </div>
          <h2>Pengaturan &amp; Pusat Kontrol Sinteta AI</h2>
          <p>Kelola jadwal penarikan data SIMRS, guardrail keamanan medis, mode hemat kuota token, dan basis pengetahuan terisolasi.</p>
        </div>
        <div className="ph-act" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn pri" onClick={() => setShowUploadModal(true)} style={{ background: '#2563eb' }}>
            <span className="ic s">upload_file</span> Unggah Dokumen Knowledge
          </button>
        </div>
      </div>

      {/* STATUS METRICS STRIP */}
      <div className="kstrip k4" style={{ marginBottom: '16px' }}>
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic" style={{ color: '#10b981' }}>psychology</span></div>
          <div className="kcard-lbl">Status AI Engine</div>
          <div className="kcard-v" style={{ color: '#10b981', fontSize: '18px' }}>Sinteta v3.5</div>
          <div className="kcard-d up"><span className="ic s">bolt</span>{costSavingMode === 'MAX_SAVER' ? 'Mode Super Hemat' : 'Mode Standar RS'}</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#2563eb' }}>sync</span></div>
          <div className="kcard-lbl">Bridging SIMRS RSUD Daya</div>
          <div className="kcard-v" style={{ fontSize: '16px', color: 'var(--blue)' }}>Otomatis Terjadwal</div>
          <div className="kcard-d up">Sinkron: {lastSyncTime}</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#f59e0b' }}>verified_user</span></div>
          <div className="kcard-lbl">Guardrail Keamanan Medis</div>
          <div className="kcard-v">98.4<small>%</small></div>
          <div className="kcard-d up">3 Kasus Dicegat Hari Ini</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#10b981' }}>savings</span></div>
          <div className="kcard-lbl">Efisiensi Kuota Token</div>
          <div className="kcard-v" style={{ color: '#10b981' }}>74<small>%</small></div>
          <div className="kcard-d up">Hemat ~84.200 Query/Bln</div>
        </div>
      </div>

      {/* SUBTABS NAVIGATION (RESPONSIVE SCROLLABLE) */}
      <div className="subtabs" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', marginBottom: '20px' }}>
        {[
          { id: 'patient-info', label: 'Akses Informasi Pasien (Layanan & SIMRS)', icon: 'hub' },
          { id: 'knowledge',  label: 'Basis Pengetahuan (3 Spaces)',       icon: 'menu_book' },
          { id: 'simrs-sync', label: 'Jadwal Tarik SIMRS (Automated)',     icon: 'sync' },
          { id: 'guardrails', label: 'Guardrails Keamanan & Etika Medis',  icon: 'gpp_good' },
          { id: 'cost-saver', label: 'Smart Token & Mode Hemat Biaya',     icon: 'savings' },
          { id: 'channels',   label: 'Konektor Saluran (WA & Web)',        icon: 'settings_remote' },
          { id: 'analytics',  label: 'Performa & Analytics Chatbot',       icon: 'analytics' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`btn ${activeTab === t.id ? 'pri' : 'ghost'} sm`}
            style={{
              flexShrink: 0,
              borderRadius: 'var(--r10)',
              background: activeTab === t.id ? 'var(--blue)' : 'var(--srf)',
              borderColor: activeTab === t.id ? 'var(--blue)' : 'var(--line)',
              fontWeight: 600
            }}>
            <span className="ic s">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 1: BASIS PENGETAHUAN & PLAYGROUND
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'knowledge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* FILTER SPACE BADGES */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t3)' }}>Filter Ruang Akses (Spaces):</span>
            {[
              { id: 'all',      label: 'Semua Ruang Akses (6)' },
              { id: 'public',   label: '📢 Public Space (2)' },
              { id: 'internal', label: '🔒 Internal Space (2)' },
              { id: 'hybrid',   label: '🤝 Shared / Hybrid Space (2)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedSpaceFilter(f.id)}
                className={`btn ${selectedSpaceFilter === f.id ? 'pri' : 'ghost'} xs`}
                style={{ borderRadius: '20px' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* TABLE OF KNOWLEDGE */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Daftar Dokumen &amp; SOP RS Terindeks</div>
                <div className="card-sub">Dokumen disinkronkan ke vektor AI dengan proteksi isolasi ruang akses</div>
              </div>
            </div>

            <table className="tbl" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Nama Dokumen / File</th>
                  <th>Kategori</th>
                  <th>Ruang Akses (Scope)</th>
                  <th>Kapasitas Knowledge</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredKnowledge.map(k => (
                  <tr key={k.id}>
                    <td>
                      <div className="td1" style={{ fontWeight: 600, color: 'var(--t1)' }}>{k.name}</div>
                      <div className="td2">{k.desc}</div>
                    </td>
                    <td><span className="bdg n">{k.category}</span></td>
                    <td>
                      <span className={`bdg ${k.space === 'public' ? 'g' : k.space === 'internal' ? 'purple' : 'b'}`}>
                        {k.spaceLabel}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{k.count}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{k.size}</div>
                    </td>
                    <td>
                      <span className="bdg g"><span className="pdot"></span>{k.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI TESTING PLAYGROUND */}
          <div className="card" style={{ border: '1.5px solid var(--blue-m)', background: 'var(--blue-s)' }}>
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ic" style={{ color: 'var(--blue)' }}>terminal</span>
                  Playground Simulasi Pengujian AI Companion
                </div>
                <div className="card-sub">Uji coba pertanyaan untuk memverifikasi apakah Guardrail dan Ruang Akses berfungsi dengan benar</div>
              </div>
              <div className="card-hd-r">
                <div style={{ display: 'flex', gap: '6px', background: 'var(--srf)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <button
                    type="button"
                    className={`btn ${testMode === 'external' ? 'pri' : 'ghost'} xs`}
                    onClick={() => setTestMode('external')}>
                    Pasien (WhatsApp/Web)
                  </button>
                  <button
                    type="button"
                    className={`btn ${testMode === 'internal' ? 'pri' : 'ghost'} xs`}
                    onClick={() => setTestMode('internal')}>
                    Staf Medis (EHR Copilot)
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleRunTest} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input
                type="text"
                value={testQuery}
                onChange={e => setTestQuery(e.target.value)}
                placeholder={testMode === 'external' ? 'Coba tanyakan: Berapa tarif USG 4D? / Syarat BPJS / Dosis obat penurun tensi...' : 'Coba tanyakan: SOP penanganan Preeklamsia Berat / Batas klaim BPJS...'}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '13px' }}
              />
              <button type="submit" className="btn pri" disabled={isTesting}>
                <span className="ic s">{isTesting ? 'sync' : 'send'}</span>
                {isTesting ? 'Memproses...' : 'Uji AI'}
              </button>
            </form>

            {testAnswer && (
              <div style={{ marginTop: '14px', padding: '14px', borderRadius: '8px', background: 'var(--srf)', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 700, marginBottom: '6px' }}>
                  HASIL RESPON SINTETA AI ({testAnswer.queriedSpace}):
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {testAnswer.text}
                </div>
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--t3)', borderTop: '1px dashed var(--line)', paddingTop: '6px' }}>
                  <strong>Kutipan Sumber / Guardrail:</strong> {testAnswer.citation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 0: AKSES INFORMASI PASIEN DARI RS (KATALOG PUBLIK & SIMRS)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'patient-info' && (
        <AiPatientInfoHub showToast={showToast} />
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 2: JADWAL & PENARIKAN DATA SIMRS
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'simrs-sync' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* SIMRS CONNECTION STATUS */}
          <div className="card" style={{ border: '1.5px solid var(--blue-m)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--green-s)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="ic" style={{ color: 'var(--green)', fontSize: '24px' }}>hub</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--t1)' }}>Koneksi Bridging SIMRS RSUD Daya Kota Makassar</h3>
                  <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>{simrsStatus}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn ghost sm" onClick={handleTestSimrsConnection}>
                  <span className="ic s">wifi_tethering</span> Uji Koneksi (Ping)
                </button>
                <button className="btn pri sm" onClick={handleTriggerManualSync} disabled={isSyncingNow}>
                  <span className="ic s">{isSyncingNow ? 'sync' : 'refresh'}</span>
                  {isSyncingNow ? 'Menarik Data...' : 'Tarik Data Sekarang'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '14px', background: 'var(--srf2)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--t3)' }}>Endpoint API Bridging: </span>
                <code style={{ background: 'var(--srf)', padding: '2px 8px', borderRadius: '4px', color: 'var(--blue)', fontWeight: 600 }}>{simrsEndpoint}</code>
              </div>
              <div>
                <span style={{ color: 'var(--t3)' }}>Terakhir Disinkronkan: </span>
                <strong>{lastSyncTime}</strong>
              </div>
            </div>
          </div>

          {/* SETUP KAPAN NARIK DATA (SCHEDULE CONFIG) */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Setup Jadwal Penarikan Data Otomatis</div>
                <div className="card-sub">Tentukan kapan sistem Policare secara otomatis mengambil data rekam medis &amp; kunjungan dari SIMRS RSUD Daya</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '6px' }}>
              {/* Option 1: 2x Sehari (Rekomendasi) */}
              <div
                onClick={() => { setSyncFrequency('SCHEDULED_TWICE_DAILY'); showToast('Jadwal diatur: 2x Sehari'); }}
                style={{
                  padding: '14px', borderRadius: '10px', cursor: 'pointer', transition: '.15s',
                  border: syncFrequency === 'SCHEDULED_TWICE_DAILY' ? '2px solid var(--blue)' : '1px solid var(--line)',
                  background: syncFrequency === 'SCHEDULED_TWICE_DAILY' ? 'var(--blue-s)' : 'var(--srf)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--t1)' }}>🌅 2x Sehari (Rekomendasi)</div>
                  <span className="bdg g" style={{ fontSize: '10px' }}>Paling Efisien</span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                  Tarik data sebelum poli buka (pagi) dan saat rawat jalan selesai (sore). Sangat hemat beban server SIMRS &amp; kuota AI.
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--t2)' }}>
                  <span>Pagi:</span>
                  <input type="time" value={morningSyncTime} onChange={e => setMorningSyncTime(e.target.value)} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '11px' }} />
                  <span>Sore:</span>
                  <input type="time" value={eveningSyncTime} onChange={e => setEveningSyncTime(e.target.value)} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--line)', fontSize: '11px' }} />
                </div>
              </div>

              {/* Option 2: Shift-based */}
              <div
                onClick={() => { setSyncFrequency('SHIFT_BASED'); showToast('Jadwal diatur: Tiap Pergantian Shift'); }}
                style={{
                  padding: '14px', borderRadius: '10px', cursor: 'pointer', transition: '.15s',
                  border: syncFrequency === 'SHIFT_BASED' ? '2px solid var(--blue)' : '1px solid var(--line)',
                  background: syncFrequency === 'SHIFT_BASED' ? 'var(--blue-s)' : 'var(--srf)'
                }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--t1)', marginBottom: '6px' }}>🏥 Tiap Pergantian Shift Nakes</div>
                <p style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: 1.4, margin: 0 }}>
                  Sinkronisasi otomatis tiap pukul 07:00, 14:00, dan 21:00 WITA untuk memperbarui rekam jejak pasien rawat inap dan IGD.
                </p>
              </div>

              {/* Option 3: Tiap Jam */}
              <div
                onClick={() => { setSyncFrequency('HOURLY'); showToast('Jadwal diatur: Tiap 1 Jam'); }}
                style={{
                  padding: '14px', borderRadius: '10px', cursor: 'pointer', transition: '.15s',
                  border: syncFrequency === 'HOURLY' ? '2px solid var(--blue)' : '1px solid var(--line)',
                  background: syncFrequency === 'HOURLY' ? 'var(--blue-s)' : 'var(--srf)'
                }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--t1)', marginBottom: '6px' }}>⏱️ Tiap 1 Jam Sekali</div>
                <p style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: 1.4, margin: 0 }}>
                  Pembaruan berkala real-time untuk poliklinik dengan antrean pasien sangat dinamis.
                </p>
              </div>

              {/* Option 4: Manual Only */}
              <div
                onClick={() => { setSyncFrequency('MANUAL_ONLY'); showToast('Jadwal diatur: Tarik Manual Saja'); }}
                style={{
                  padding: '14px', borderRadius: '10px', cursor: 'pointer', transition: '.15s',
                  border: syncFrequency === 'MANUAL_ONLY' ? '2px solid var(--blue)' : '1px solid var(--line)',
                  background: syncFrequency === 'MANUAL_ONLY' ? 'var(--blue-s)' : 'var(--srf)'
                }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--t1)', marginBottom: '6px' }}>✋ Tarik Manual Saja</div>
                <p style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: 1.4, margin: 0 }}>
                  Data hanya ditarik saat petugas menekan tombol &quot;Tarik Data Sekarang&quot;.
                </p>
              </div>
            </div>
          </div>

          {/* SCOPE PENARIKAN DATA */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Cakupan Data yang Diambil dari SIMRS</div>
                <div className="card-sub">Pilih jenis data yang relevan agar proses sinkronisasi cepat dan hemat memori</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'var(--srf2)', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={syncScope.outpatientVisits} onChange={() => toggleSyncScope('outpatientVisits')} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>Data Pasien Rawat Jalan 3 Hari Terakhir</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)' }}>Diperlukan untuk follow-up kepatuhan minum obat &amp; kondisi pasien</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'var(--srf2)', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={syncScope.inpatientDischarge} onChange={() => toggleSyncScope('inpatientDischarge')} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>Data Kepulangan Pasien Rawat Inap (KRS)</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)' }}>Untuk edukasi perawatan nifas, luka operasi, &amp; survei kepuasan SKM</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'var(--srf2)', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={syncScope.doctorSchedule} onChange={() => toggleSyncScope('doctorSchedule')} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>Jadwal &amp; Kuota Poliklinik Dokter Spesialis</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)' }}>Agar AI Companion di WhatsApp selalu memberikan jadwal akurat</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: 'var(--srf2)', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" checked={syncScope.pharmacyPrescriptions} onChange={() => toggleSyncScope('pharmacyPrescriptions')} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>Status Resep Farmasi Pasien Kronis</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)' }}>Pengingat otomatis tebus obat hipertensi &amp; diabetes sebelum habis</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 3: MONITOR & GUARDRAILS AI
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'guardrails' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* GUARDRAIL TOGGLES */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Pengaturan Guardrail Keamanan &amp; Etika Medis</div>
                <div className="card-sub">AI secara aktif memvalidasi setiap pesan sebelum dikirimkan ke pasien atau staf</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '6px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--r12)', background: guardrailSettings.blockSelfDiagnosis ? 'var(--green-s)' : 'var(--srf2)', border: `1.5px solid ${guardrailSettings.blockSelfDiagnosis ? 'var(--green-m)' : 'var(--line)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', transition: 'all var(--dur-base)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: guardrailSettings.blockSelfDiagnosis ? 'var(--green)' : 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">medical_information</span> 1. Larangan Diagnosa Medis Mandiri
                  </div>
                  <p style={{ fontSize: '11.5px', color: guardrailSettings.blockSelfDiagnosis ? 'var(--green)' : 'var(--t3)', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                    AI dicegah memberikan vonis penyakit definitif. AI wajib menganjurkan pasien untuk periksa ke dokter spesialis RSUD Daya.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={guardrailSettings.blockSelfDiagnosis} onChange={() => toggleGuardrail('blockSelfDiagnosis')} />
                  <span className="toggle-track"><span className="toggle-thumb"></span></span>
                </label>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--r12)', background: guardrailSettings.redactPiiData ? 'var(--green-s)' : 'var(--srf2)', border: `1.5px solid ${guardrailSettings.redactPiiData ? 'var(--green-m)' : 'var(--line)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', transition: 'all var(--dur-base)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: guardrailSettings.redactPiiData ? 'var(--green)' : 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">visibility_off</span> 2. Sensor Otomatis Data Pribadi (PII)
                  </div>
                  <p style={{ fontSize: '11.5px', color: guardrailSettings.redactPiiData ? 'var(--green)' : 'var(--t3)', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                    Nomor NIK, No. BPJS, &amp; alamat disensor otomatis sebelum diproses oleh model AI untuk menjaga kerahasiaan pasien.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={guardrailSettings.redactPiiData} onChange={() => toggleGuardrail('redactPiiData')} />
                  <span className="toggle-track"><span className="toggle-thumb"></span></span>
                </label>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--r12)', background: guardrailSettings.interceptEmergencyWords ? 'var(--green-s)' : 'var(--srf2)', border: `1.5px solid ${guardrailSettings.interceptEmergencyWords ? 'var(--green-m)' : 'var(--line)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', transition: 'all var(--dur-base)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: guardrailSettings.interceptEmergencyWords ? 'var(--green)' : 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">emergency</span> 3. Deteksi Darurat &amp; Alihkan ke IGD 24 Jam
                  </div>
                  <p style={{ fontSize: '11.5px', color: guardrailSettings.interceptEmergencyWords ? 'var(--green)' : 'var(--t3)', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                    Pesan dengan tanda bahaya (kejang, pendarahan, nyeri dada) langsung dialihkan ke nomor Call Center IGD RSUD Daya (+62 811-4455-999).
                  </p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={guardrailSettings.interceptEmergencyWords} onChange={() => toggleGuardrail('interceptEmergencyWords')} />
                  <span className="toggle-track"><span className="toggle-thumb"></span></span>
                </label>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--r12)', background: guardrailSettings.blockInternalDocuments ? 'var(--green-s)' : 'var(--srf2)', border: `1.5px solid ${guardrailSettings.blockInternalDocuments ? 'var(--green-m)' : 'var(--line)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', transition: 'all var(--dur-base)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: guardrailSettings.blockInternalDocuments ? 'var(--green)' : 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">lock</span> 4. Isolasi Dokumen Rahasia Internal RS
                  </div>
                  <p style={{ fontSize: '11.5px', color: guardrailSettings.blockInternalDocuments ? 'var(--green)' : 'var(--t3)', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                    Dokumen formularium internal, tarif dasar, &amp; catatan audit RS diblokir 100% dari akses pasien di WhatsApp.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={guardrailSettings.blockInternalDocuments} onChange={() => toggleGuardrail('blockInternalDocuments')} />
                  <span className="toggle-track"><span className="toggle-thumb"></span></span>
                </label>
              </div>
            </div>
          </div>

          {/* LIVE GUARDRAIL INTERCEPTION MONITOR */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Log Pemantauan Pencegatan Guardrail (Live Interception Monitor)</div>
                <div className="card-sub">Rekam jejak pesan yang dicegat atau disesuaikan oleh sistem keamanan AI</div>
              </div>
            </div>

            <table className="tbl" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Waktu &amp; Saluran</th>
                  <th>Pesan Masuk dari Pasien</th>
                  <th>Kategori Risiko</th>
                  <th>Tindakan Pencegatan Guardrail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {guardrailLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ width: '140px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{log.time}</div>
                      <div style={{ fontSize: '11px', color: 'var(--blue)' }}>{log.channel}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontStyle: 'italic', color: 'var(--t2)' }}>&quot;{log.patientText}&quot;</div>
                    </td>
                    <td>
                      <span className="bdg a" style={{ fontSize: '11px' }}>{log.riskCategory}</span>
                    </td>
                    <td style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: 1.35 }}>
                      {log.actionTaken}
                    </td>
                    <td>
                      <span className="bdg g"><span className="pdot"></span>{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 4: SMART TOKEN & COST SAVER ENGINE (HEMAT KUOTA)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'cost-saver' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* BANNER HEMAT KUOTA */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', color: '#fff', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                  <span className="ic s">savings</span> SMART TOKEN OPTIMIZER
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Skema Hemat Kuota &amp; Biaya AI Otomatis</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#a7f3d0', maxWidth: '650px', lineHeight: 1.4 }}>
                  Dirancang khusus agar staf RSUD Daya tidak perlu pusing memikirkan tokenisasi teknis. Sistem secara cerdas mengoptimasi query rekam medis dan menyimpan jawaban serupa.
                </p>
              </div>

              <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.25)', padding: '12px 20px', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399' }}>~74% Lebih Hemat</div>
                <div style={{ fontSize: '11px', color: '#d1fae5' }}>Est. Penghematan: Rp 3.420.000 / Bulan</div>
              </div>
            </div>
          </div>

          {/* PRESET MODE HEMAT */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Pilih Profil Efisiensi AI</div>
                <div className="card-sub">Pilih salah satu mode sesuai kebutuhan operasional RSUD Daya</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', marginTop: '6px' }}>
              {/* Mode Super Hemat */}
              <div
                onClick={() => { setCostSavingMode('MAX_SAVER'); showToast('Mode Super Hemat diaktifkan!'); }}
                style={{
                  padding: '16px', borderRadius: '10px', cursor: 'pointer', transition: '.15s',
                  border: costSavingMode === 'MAX_SAVER' ? '2px solid #10b981' : '1px solid var(--line)',
                  background: costSavingMode === 'MAX_SAVER' ? '#ecfdf5' : 'var(--srf)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#065f46' }}>🟢 Mode Super Hemat</span>
                  <span className="bdg g" style={{ fontSize: '10px' }}>Hemat 85%</span>
                </div>
                <p style={{ fontSize: '12px', color: '#047857', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                  Hanya mengekstrak 3 poin kunci rekam medis. Pertanyaan umum (jadwal/tarif) dijawab dari memori lokal gratis tanpa panggil AI.
                </p>
                <div style={{ fontSize: '11px', color: '#065f46', fontWeight: 600 }}>Cocok untuk: WhatsApp Pelayanan Umum</div>
              </div>

              {/* Mode Standar RS */}
              <div
                onClick={() => { setCostSavingMode('STANDARD'); showToast('Mode Standar RS diaktifkan!'); }}
                style={{
                  padding: '16px', borderRadius: '10px', cursor: 'pointer', transition: '.15s',
                  border: costSavingMode === 'STANDARD' ? '2px solid var(--blue)' : '1px solid var(--line)',
                  background: costSavingMode === 'STANDARD' ? 'var(--blue-s)' : 'var(--srf)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--blue)' }}>🔵 Mode Standar RS (Rekomendasi)</span>
                  <span className="bdg b" style={{ fontSize: '10px' }}>Hemat 65%</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                  Keseimbangan sempurna antara bahasa empati ramah yang luwes dan efisiensi kuota. Ideal untuk edukasi pasien &amp; reminder follow-up.
                </p>
                <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 600 }}>Cocok untuk: Semua Layanan RS</div>
              </div>

              {/* Mode Analisis Mendalam */}
              <div
                onClick={() => { setCostSavingMode('DEEP_REASONING'); showToast('Mode Analisis Mendalam diaktifkan!'); }}
                style={{
                  padding: '16px', borderRadius: '10px', cursor: 'pointer', transition: '.15s',
                  border: costSavingMode === 'DEEP_REASONING' ? '2px solid #8b5cf6' : '1px solid var(--line)',
                  background: costSavingMode === 'DEEP_REASONING' ? '#f5f3ff' : 'var(--srf)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#5b21b6' }}>🟣 Mode Analisis Lengkap</span>
                  <span className="bdg purple" style={{ fontSize: '10px' }}>Presisi Tinggi</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6d28d9', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                  Menganalisis seluruh riwayat diagnosa dan interaksi obat. Digunakan untuk Co-Pilot Internal Dokter Penanggung Jawab.
                </p>
                <div style={{ fontSize: '11px', color: '#5b21b6', fontWeight: 600 }}>Cocok untuk: Internal Medis &amp; EHR</div>
              </div>
            </div>
          </div>

          {/* FITUR CERDAS PENGHEMAT TOKEN */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Fitur Otomatisasi Hemat Biaya</div>
                <div className="card-sub">Fitur cerdas yang bekerja di latar belakang tanpa memerlukan konfigurasi teknis</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'var(--srf2)', border: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>⚡ Jawaban Cepat dari Memori (Semantic FAQ Cache)</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Pertanyaan berulang seperti &quot;Jam besuk&quot;, &quot;Syarat BPJS&quot;, &quot;Tarif USG&quot; langsung dijawab dari memori lokal (Hemat 100% token).</div>
                </div>
                <input type="checkbox" checked={semanticCacheActive} onChange={e => setSemanticCacheActive(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'var(--srf2)', border: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>✂️ Ekstraksi Riwayat Rekam Medis Ringkas (Auto-Pruning)</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Hanya mengambil riwayat 3 hari terakhir yang relevan dengan kunjungan dokter saat ini, bukan seluruh rekam medis 10 tahun lalu.</div>
                </div>
                <input type="checkbox" checked={pruneOldRecords} onChange={e => setPruneOldRecords(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', background: 'var(--srf2)', border: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>🛡️ Abaikan Pesan Pendek &amp; Spam (Chat Deduplication)</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Pesan seperti &quot;Halo&quot;, &quot;P&quot;, &quot;Test&quot;, &quot;Siang&quot; ditanggapi oleh template statis cepat tanpa memanggil pemrosesan AI berbayar.</div>
                </div>
                <input type="checkbox" checked={deduplicateChats} onChange={e => setDeduplicateChats(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 5: KONEKTOR SALURAN
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'channels' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* WHATSAPP OFFICIAL */}
          <div className="card" style={{ border: '1.5px solid #22c55e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="ic" style={{ color: '#22c55e', fontSize: '28px' }}>chat</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--t1)' }}>WhatsApp Official Business API RSUD Daya</h3>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>CONNECTED ✓ (+62 811-4455-900)</div>
                </div>
              </div>
              <span className="bdg g">Public &amp; Hybrid Space Only</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.5, marginBottom: '14px' }}>
              AI Companion terhubung langsung ke WhatsApp Official RSUD Daya untuk menjawab pertanyaan pasien. AI secara ketat <strong>hanya mengakses Public &amp; Hybrid Knowledge Space</strong>.
            </p>
            <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '8px', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Space Terhubung:</span><strong style={{ color: '#2563eb' }}>📢 Public Space &amp; 🤝 Shared Hybrid Space</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Isolasi Internal Space:</span><strong style={{ color: '#10b981' }}>Terproteksi 100% (Di-block)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Rerata Respon WA:</span><strong style={{ color: '#10b981' }}>&lt; 2.4 Detik</strong>
              </div>
            </div>
            <button className="btn ghost sm" style={{ marginTop: '14px', width: '100%' }} onClick={() => showToast('Pengaturan Webhook WhatsApp disimpan.')}>
              Konfigurasi Webhook &amp; CS Handoff
            </button>
          </div>

          {/* WEBSITE LIVE CHATBOT WIDGET */}
          <div className="card" style={{ border: '1.5px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="ic" style={{ color: '#2563eb', fontSize: '28px' }}>language</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--t1)' }}>Website Live Chatbot Widget</h3>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>EMBEDDED ON RSUD DAYA WEBSITE</div>
                </div>
              </div>
              <span className="bdg b">Public &amp; Hybrid Space Only</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.5, marginBottom: '14px' }}>
              Widget melayang di sudut kanan bawah website resmi RSUD Daya yang menyapa pengunjung dan memberikan panduan layanan serta jadwal dokter.
            </p>
            <div style={{ background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px', overflowX: 'auto', marginBottom: '14px' }}>
              &lt;script src=&quot;https://policare.rsuddaya.makassar.go.id/widget.js&quot; data-rs-id=&quot;RSUD-DAYA-MKS&quot; async&gt;&lt;/script&gt;
            </div>
            <button className="btn ghost sm" style={{ width: '100%' }} onClick={() => showToast('Script embed berhasil disalin ke clipboard!')}>
              <span className="ic s">content_copy</span> Salin Kode Embed Script
            </button>
          </div>

          {/* INTERNAL STAFF COPILOT */}
          <div className="card" style={{ border: '1.5px solid #8b5cf6', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="ic" style={{ color: '#8b5cf6', fontSize: '28px' }}>medical_services</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--t1)' }}>Internal Staff Co-Pilot (SIMRS EHR &amp; Portal Medis)</h3>
                  <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600 }}>AKSES TERBATAS STAF MEDIS RSUD DAYA</div>
                </div>
              </div>
              <span className="bdg purple">Akses Semua Space (Internal + Hybrid + Public)</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.5 }}>
              AI Assistant khusus untuk Dokter, Perawat, dan Staf Administrasi di dalam SIMRS RSUD Daya untuk pencarian cepat SOP Klinis, Dosis Obat, Kode ICD-10, &amp; Status Kamar Rawat Inap secara instan dari <strong>🔒 Internal Knowledge Space</strong> &amp; <strong>🤝 Shared Hybrid Space</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 6: PERFORMA & ANALYTICS CHATBOT
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="g21">
            <div className="card">
              <div className="card-hd"><div className="card-hd-l"><div className="card-title">Top 5 Pertanyaan Paling Sering Ditanyakan Pasien RSUD Daya</div></div></div>
              <table className="tbl" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Topik Pertanyaan</th>
                    <th style={{ textAlign: 'right' }}>Jumlah Chat</th>
                    <th style={{ textAlign: 'right' }}>Penanganan Otomatis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ textAlign: 'center' }}>1</td><td><strong>Jadwal Praktik Dokter Spesialis Kandungan &amp; Anak</strong></td><td style={{ textAlign: 'right', fontWeight: 700 }}>4.855</td><td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 700 }}>100% (Cache)</td></tr>
                  <tr><td style={{ textAlign: 'center' }}>2</td><td><strong>Syarat &amp; Rujukan Berobat BPJS Kesehatan</strong></td><td style={{ textAlign: 'right', fontWeight: 700 }}>3.210</td><td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 700 }}>98% (Cache)</td></tr>
                  <tr><td style={{ textAlign: 'center' }}>3</td><td><strong>Tarif Pemeriksaan USG 4D &amp; Paket Bersalin</strong></td><td style={{ textAlign: 'right', fontWeight: 700 }}>2.450</td><td style={{ textAlign: 'right', color: 'var(--blue)', fontWeight: 700 }}>94% (AI)</td></tr>
                  <tr><td style={{ textAlign: 'center' }}>4</td><td><strong>Jam Besuk &amp; Tata Tertib Rawat Inap</strong></td><td style={{ textAlign: 'right', fontWeight: 700 }}>1.999</td><td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 700 }}>100% (Cache)</td></tr>
                  <tr><td style={{ textAlign: 'center' }}>5</td><td><strong>Ketersediaan Kamar Perawatan (VVIP/VIP/Kls 1)</strong></td><td style={{ textAlign: 'right', fontWeight: 700 }}>1.716</td><td style={{ textAlign: 'right', color: 'var(--blue)', fontWeight: 700 }}>91% (Live SIMRS)</td></tr>
                </tbody>
              </table>
            </div>

            <div className="col">
              <div className="card">
                <div className="card-hd"><div className="card-hd-l"><div className="card-title">Rasio Penanganan AI vs Human CS</div></div></div>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>95.8%</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#064e3b' }}>Ditangani Mandiri oleh AI Sinteta</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '6px' }}>Hanya 4.2% (600 chat) yang dialihkan ke CS manusia</div>
                </div>
              </div>

              <div className="card">
                <div className="card-hd"><div className="card-hd-l"><div className="card-title">Penghematan Biaya Operasional</div></div></div>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--blue)' }}>Rp 18.5 Jt</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--blue)' }}>Efisiensi SDM &amp; Token / Bulan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL WITH SPACE SELECTION */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--srf)', borderRadius: '14px', width: '100%', maxWidth: '580px', padding: '24px', border: '1.5px solid var(--line2)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--t1)' }}>Unggah Dokumen &amp; Tentukan Ruang Akses (Space)</h3>
              <span className="ic s" style={{ cursor: 'pointer', color: 'var(--t3)' }} onClick={() => setShowUploadModal(false)}>close</span>
            </div>
            
            <form onSubmit={handleUploadDoc} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '4px' }}>NAMA DOKUMEN / FILE</label>
                <input type="text" value={docName} onChange={e => setDocName(e.target.value)} placeholder="Contoh: SOP Pelayanan IGD & Tarif 2026.pdf" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '4px' }}>KATEGORI DOKUMEN</label>
                <select value={docCat} onChange={e => setDocCat(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '13px' }}>
                  <option value="Tarif & Layanan">Tarif &amp; Layanan</option>
                  <option value="Administrasi">Administrasi &amp; BPJS</option>
                  <option value="Klinis & Obat">Klinis &amp; Farmasi</option>
                  <option value="SOP RS">SOP &amp; Regulasi Internal</option>
                  <option value="Fasilitas & Layanan">Fasilitas &amp; Kunjungan</option>
                </select>
              </div>

              {/* SPACE SELECTION CARDS */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '6px' }}>PILIH RUANG AKSES KNOWLEDGE (KNOWLEDGE SPACE SCOPE)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Public Space Option */}
                  <div
                    onClick={() => setDocSpace('public')}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                      border: docSpace === 'public' ? '2px solid #22c55e' : '1px solid var(--line2)',
                      background: docSpace === 'public' ? '#f0fdf4' : 'var(--srf)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>📢 Public Space (Akses Terbuka Pasien)</div>
                      <div style={{ fontSize: '11px', color: '#15803d' }}>Boleh dijawab ke WhatsApp pasien &amp; widget website resmi RS</div>
                    </div>
                    {docSpace === 'public' && <span className="ic s" style={{ color: '#22c55e' }}>check_circle</span>}
                  </div>

                  {/* Shared Hybrid Space Option */}
                  <div
                    onClick={() => setDocSpace('hybrid')}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                      border: docSpace === 'hybrid' ? '2px solid #2563eb' : '1px solid var(--line2)',
                      background: docSpace === 'hybrid' ? '#eff6ff' : 'var(--srf)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>🤝 Shared / Hybrid Space (Akses Bersama)</div>
                      <div style={{ fontSize: '11px', color: '#1d4ed8' }}>Dapat diakses Pasien &amp; Staf Medis dengan penyesuaian gaya bahasa AI</div>
                    </div>
                    {docSpace === 'hybrid' && <span className="ic s" style={{ color: '#2563eb' }}>check_circle</span>}
                  </div>

                  {/* Internal Space Option */}
                  <div
                    onClick={() => setDocSpace('internal')}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                      border: docSpace === 'internal' ? '2px solid #8b5cf6' : '1px solid var(--line2)',
                      background: docSpace === 'internal' ? '#f5f3ff' : 'var(--srf)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#6d28d9' }}>🔒 Internal Space (Rahasia Khusus Staf Medis)</div>
                      <div style={{ fontSize: '11px', color: '#7c3aed' }}>Dibatasi ketat hanya untuk dokter &amp; nakes internal di EHR SIMRS</div>
                    </div>
                    {docSpace === 'internal' && <span className="ic s" style={{ color: '#8b5cf6' }}>check_circle</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn ghost" onClick={() => setShowUploadModal(false)}>Batal</button>
                <button type="submit" className="btn pri" style={{ background: '#2563eb' }}>
                  <span className="ic s">cloud_upload</span> Indeks Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
