import { useState } from 'react';
import { PiiMasker } from '../utils/security';

export default function StudioScreen({
  rules = {},
  sintetaMessages = [],
  onSendSintetaMessage,
  onSelectSintetaPrompt,
  onApplyAICampaign,
  onRulePointsChange,
  onSaveRulePoints,
  onRunLoyaltySimulation,
  outreachLogs = [],
  remindedPatients = {},
  onTriggerWhatsAppReminder,
  active,
  isPiiMasked = true,
  accessLevel = 'ADMIN'
}) {
  const isReadOnly = accessLevel === 'VIEWER';
  // Main Studio Sections: 'design' | 'delivery' | 'active' | 'tiers' | 'ai'
  const [activeSection, setActiveSection] = useState('design');

  // Program Creator Modal/Form State
  const [showNewProgramForm, setShowNewProgramForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPoints, setNewPoints] = useState(250);
  const [newTarget, setNewTarget] = useState(100);
  const [newSchedule, setNewSchedule] = useState('4 minggu');
  const [newCategory, setNewCategory] = useState('Risk-based');

  // Custom Programs State
  const [customPrograms, setCustomPrograms] = useState([]);

  // Delivery Lanes Open State
  const [openLanes, setOpenLanes] = useState({
    'lane-risk': true,
    'lane-ref': true,
    'lane-referral': false,
    'lane-milestone': false
  });

  // Autopilot Modal State
  const [isAutopilotModalOpen, setIsAutopilotModalOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [autopilotPatients, setAutopilotPatients] = useState([
    { id: 1, name: 'Fatimah Zahra', phone: '0812-3456-7890', riskType: 'Hamil 32 minggu · Missed ANC 3×', score: '89%', selected: true, message: 'Halo Ibu Fatimah Zahra, jadwal kontrol ANC ke-4 Anda tersisa 3 hari lagi di RSUD Daya. Hadir tepat waktu untuk mendapatkan +100 Poin Loyalitas & voucher USG!' },
    { id: 2, name: 'Nur Aisyah', phone: '0815-9988-7766', riskType: 'Bayi 9 bulan · Imunisasi overdue 6 minggu', score: '82%', selected: true, message: 'Halo Ibu Nur Aisyah, jadwal vaksinasi lanjutan bayi Anda sudah dapat diambil minggu ini di Poli Anak RSUD Daya. Hadir untuk klaim bonus +200 Poin!' },
    { id: 3, name: 'Rini Marlina', phone: '0813-1122-3344', riskType: 'Post-partum 6 minggu · butuh follow-up', score: '71%', selected: true, message: 'Halo Ibu Rini Marlina, kami mengundang Anda untuk konsultasi laktasi & evaluasi nifas gratis di RSUD Daya. Selesaikan kunjungan & dapatkan bonus +150 Poin!' }
  ]);

  if (!active) return null;

  const toggleLane = (id) => {
    setOpenLanes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReminderClick = (name) => {
    const patient = autopilotPatients.find(p => p.name === name);
    const msg = patient ? patient.message : `Halo Ibu ${name}, kami mengingatkan jadwal kunjungan Anda di RSUD Daya. Hadir untuk klaim reward poin!`;
    const phone = patient ? patient.phone : '0812-3456-7890';
    if (onTriggerWhatsAppReminder) {
      onTriggerWhatsAppReminder({ id: Date.now(), name, phone, message: msg });
    }
  };

  const handleTogglePatientSelected = (id) => {
    setAutopilotPatients(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const handleMessageChange = (id, newMsg) => {
    setAutopilotPatients(prev => prev.map(p => p.id === id ? { ...p, message: newMsg } : p));
  };

  const handleBulkOutreachSubmit = () => {
    const selected = autopilotPatients.filter(p => p.selected);
    if (selected.length === 0) {
      alert('Pilih minimal satu pasien untuk dikirimi outreach.');
      return;
    }
    if (!authorized) {
      alert('Anda harus memberikan otorisasi medis sebelum mengirim pesan massal.');
      return;
    }
    selected.forEach(p => {
      if (onTriggerWhatsAppReminder) {
        onTriggerWhatsAppReminder({ id: Date.now() + Math.random(), name: p.name, phone: p.phone, message: p.message });
      }
    });
    alert(`Otorisasi sukses! ${selected.length} pesan outreach dikirim massal via WhatsApp.`);
    setIsAutopilotModalOpen(false);
    setAuthorized(false);
  };

  const handleCreateProgram = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert('Nama program dan deskripsi wajib diisi!');
      return;
    }

    const newProg = {
      key: `custom_${Date.now()}`,
      title: newTitle,
      desc: newDesc,
      target: `${newTarget} pasien`,
      schedule: newSchedule,
      category: newCategory,
      colorClass: 'loy',
      loyClass: 'loy-s',
      loyBorder: 'loy-m',
      isCustom: true,
      points: newPoints
    };

    setCustomPrograms([...customPrograms, newProg]);
    alert(`Program "${newTitle}" berhasil dibuat dan siap dieksekusi di Studio & Delivery!`);
    
    // Reset states
    setNewTitle('');
    setNewDesc('');
    setNewPoints(250);
    setNewTarget(100);
    setNewSchedule('4 minggu');
    setShowNewProgramForm(false);
  };

  const baseRuleItems = [
    {
      key: 'ancChallenge',
      title: 'ANC Completion Challenge',
      desc: 'Pasien ANC T2 hadir 3× berturut-turut → reward poin bonus + prioritas USG 4D.',
      target: '67 pasien',
      schedule: '6 minggu',
      category: 'Risk-based',
      colorClass: 'loy',
      loyClass: 'loy-s',
      loyBorder: 'loy-m'
    },
    {
      key: 'referralBoost',
      title: 'Referral Boost — Komunitas Bumil',
      desc: 'Member Gold & Platina dapat link referral eksklusif. Ajak 1 teman periksa ANC = 200 Poin.',
      target: '120 pasien',
      schedule: '4 minggu',
      category: 'Referral-purposed',
      colorClass: 'blue',
      loyClass: 'blue-s',
      loyBorder: 'blue-m'
    },
    {
      key: 'wellBabyStreak',
      title: 'Well-baby Streak Reward',
      desc: 'Imunisasi anak 3× on-schedule berturut-turut tanpa skip = bonus voucher konsultasi dokter anak.',
      target: '89 bayi',
      schedule: '8 minggu',
      category: 'Milestone-based',
      colorClass: 'green',
      loyClass: 'green-s',
      loyBorder: 'green-m'
    },
    ...customPrograms
  ];

  // Active Running Programs Mock
  const activeRunningPrograms = [
    {
      id: 'ap-1',
      title: 'ANC Trimester 2 Booster',
      lane: 'Risk-based',
      targetAudience: 'Bumil T2 Berisiko Dropout',
      participants: 67,
      completed: 48,
      progress: 72,
      pointsSpent: '14.400 Poin',
      status: 'Sedang Berjalan',
      color: 'var(--red)'
    },
    {
      id: 'ap-2',
      title: 'Vaksinasi Dasar Tepat Waktu (Well-Baby)',
      lane: 'Milestone-based',
      targetAudience: 'Orang Tua Bayi 0-9 Bulan',
      participants: 89,
      completed: 76,
      progress: 85,
      pointsSpent: '30.400 Poin',
      status: 'Sedang Berjalan',
      color: 'var(--green)'
    },
    {
      id: 'ap-3',
      title: 'Member Get Member Komunitas Bumil',
      lane: 'Referral-purposed',
      targetAudience: 'Member Gold & Platinum',
      participants: 142,
      completed: 114,
      progress: 80,
      pointsSpent: '22.800 Poin',
      status: 'Sedang Berjalan',
      color: 'var(--loy)'
    }
  ];

  return (
    <div className="screen on" id="s-studio">
      {/* HEADER SCREEN */}
      <div className="ph">
        <div className="ph-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2>Studio &amp; Delivery Program</h2>
            <span className="bdg loy" style={{ fontSize: '11px', padding: '3px 10px' }}>
              <span className="ic s">auto_awesome</span> Unified Studio &amp; Delivery
            </span>
          </div>
          <p>Pusat terpadu untuk <strong>merancang</strong>, <strong>mensimulasikan ROI</strong>, dan <strong>mengeksekusi pengiriman</strong> program loyalitas pasien melalui 4 jalur intervensi klinis.</p>
        </div>
        <div className="ph-act" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isReadOnly ? (
            <>
              <button className="btn ghost" onClick={() => setIsAutopilotModalOpen(true)}>
                <span className="ic s" style={{ color: 'var(--loy)' }}>bolt</span> Jalankan Autopilot Delivery
              </button>
              <button className="btn loy" onClick={() => setShowNewProgramForm(true)}>
                <span className="ic s">add_circle</span> Buat Program Baru
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
          <span className="ic s" style={{ color: 'var(--blue)', fontSize: '20px' }}>insights</span>
          <div style={{ fontSize: '12px', color: 'var(--t1)', lineHeight: 1.4 }}>
            <strong>Mode Pemonitor Eksekutif (Pimpinan RS):</strong> Anda dapat memantau seluruh performa program loyalitas, 4 jalur intervensi pasien, data tiering, dan simulasi retensi. Perancangan dan eksekusi pengiriman program dilakukan oleh <strong>Promkes &amp; Pemasaran / Humas</strong>.
          </div>
        </div>
      )}

      {/* TOP KPI STRIP */}
      <div className="kstrip k4">
        <div className="kcard kl">
          <div className="kcard-ic"><span className="ic">loyalty</span></div>
          <div className="kcard-lbl">Program Aktif</div>
          <div className="kcard-v">3</div>
          <div className="kcard-d up"><span className="ic s">trending_up</span>+1 kustom bulan ini</div>
        </div>
        <div className="kcard kr">
          <div className="kcard-ic"><span className="ic">person_alert</span></div>
          <div className="kcard-lbl">Risk-based Delivery</div>
          <div className="kcard-v">7 Pasien</div>
          <div className="kcard-d dn">Intervensi segera</div>
        </div>
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic">celebration</span></div>
          <div className="kcard-lbl">Milestone Terpenuhi</div>
          <div className="kcard-v">89 Bayi</div>
          <div className="kcard-d up">Klaim reward minggu ini</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic">share</span></div>
          <div className="kcard-lbl">Referral Komunitas</div>
          <div className="kcard-v">142</div>
          <div className="kcard-d up">Member advocate aktif</div>
        </div>
      </div>

      {/* NEW PROGRAM CREATOR POPUP FORM */}
      {showNewProgramForm && (
        <div style={{ background: 'var(--srf)', border: '1.5px solid var(--loy-m)', borderRadius: 'var(--r12)', padding: '16px', marginBottom: '16px', animation: 'fadeup-demo 0.2s ease', boxShadow: 'var(--sh)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="ic s" style={{ color: 'var(--loy)' }}>add_circle</span>
              <h4 style={{ fontWeight: '700', color: 'var(--loy)', fontSize: '14px' }}>Buat Program Loyalitas &amp; Delivery Baru</h4>
            </div>
            <span className="ic s" style={{ cursor: 'pointer', color: 'var(--t3)' }} onClick={() => setShowNewProgramForm(false)}>close</span>
          </div>

          <form onSubmit={handleCreateProgram} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>NAMA PROGRAM *</label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Contoh: Booster Kepatuhan Vitamin Bumil" style={{ width: '100%', padding: '8px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>JALUR DELIVERY</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }}>
                  <option value="Risk-based">1. Risk-based (Risiko)</option>
                  <option value="Reference-based">2. Reference-based (Profil)</option>
                  <option value="Referral-purposed">3. Referral-purposed</option>
                  <option value="Milestone-based">4. Milestone-based</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>DURASI</label>
                <input type="text" value={newSchedule} onChange={(e) => setNewSchedule(e.target.value)} placeholder="Contoh: 4 minggu" style={{ width: '100%', padding: '8px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>DESKRIPSI &amp; TRIGGER INTERVENSI *</label>
              <textarea required value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Deskripsikan kriteria kepatuhan pasien dan reward poin yang diberikan..." style={{ width: '100%', height: '50px', padding: '8px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px', resize: 'none', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>REWARD POIN</label>
                <input type="number" min="50" max="1000" step="50" value={newPoints} onChange={(e) => setNewPoints(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '8px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>TARGET SASARAN (PASIEN)</label>
                <input type="number" value={newTarget} onChange={(e) => setNewTarget(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '8px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button type="button" className="btn ghost sm" onClick={() => setShowNewProgramForm(false)}>Batal</button>
              <button type="submit" className="btn loy sm"><span className="ic s">check</span>Luncurkan ke Studio</button>
            </div>
          </form>
        </div>
      )}

      {/* AI COLLABORATOR STRIP */}
      <div className="ai-strip" style={{ marginBottom: '14px' }}>
        <div className="ai-strip-av"><span className="ic l" style={{ color: '#fff' }}>smart_toy</span></div>
        <div className="ai-strip-text">
          <strong>Sinteta AI Program Optimizer</strong>
          <span>Berdasarkan data 1.248 member &amp; 4 jalur delivery, terdapat penurunan kepatuhan ANC T2 sebesar 8%. Rekomendasi: aktifkan jalur <strong>Risk-based Delivery</strong> dengan booster poin 300.</span>
        </div>
        <div className="ai-strip-actions">
          <button className="btn" style={{ background: 'rgba(255,255,255,.15)', borderColor: 'rgba(255,255,255,.25)', color: '#fff', fontSize: '12px' }} onClick={() => setActiveSection('delivery')}><span className="ic s">route</span>Buka Jalur Delivery</button>
          <button className="btn" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)', fontSize: '12px' }} onClick={() => setActiveSection('ai')}><span className="ic s">chat</span>Tanya Sinteta</button>
        </div>
      </div>

      {/* UNIFIED SECTION NAVIGATION TABS (RESPONSIVE TOUCH-SCROLL) */}
      <div className="subtabs" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', marginBottom: '18px' }}>
        <button className={`btn ${activeSection === 'design' ? 'pri' : 'ghost'} sm`} onClick={() => setActiveSection('design')} style={{ flexShrink: 0, borderRadius: 'var(--r10)', fontWeight: 600, background: activeSection === 'design' ? 'var(--loy)' : 'var(--srf)', borderColor: activeSection === 'design' ? 'var(--loy)' : 'var(--line)' }}>
          <span className="ic s">auto_awesome</span> Rancang Program
          <span style={{ background: 'rgba(255,255,255,0.25)', color: activeSection === 'design' ? '#fff' : 'var(--loy)', padding: '1px 6px', borderRadius: 'var(--rf)', fontSize: '10px', fontWeight: '700', marginLeft: '4px' }}>3</span>
        </button>
        <button className={`btn ${activeSection === 'delivery' ? 'pri' : 'ghost'} sm`} onClick={() => setActiveSection('delivery')} style={{ flexShrink: 0, borderRadius: 'var(--r10)', fontWeight: 600, background: activeSection === 'delivery' ? 'var(--loy)' : 'var(--srf)', borderColor: activeSection === 'delivery' ? 'var(--loy)' : 'var(--line)' }}>
          <span className="ic s">route</span> Jalur Pengiriman (Delivery)
          <span style={{ background: 'var(--red)', color: '#fff', padding: '1px 6px', borderRadius: 'var(--rf)', fontSize: '10px', fontWeight: '700', marginLeft: '4px' }}>4</span>
        </button>
        <button className={`btn ${activeSection === 'active' ? 'pri' : 'ghost'} sm`} onClick={() => setActiveSection('active')} style={{ flexShrink: 0, borderRadius: 'var(--r10)', fontWeight: 600, background: activeSection === 'active' ? 'var(--loy)' : 'var(--srf)', borderColor: activeSection === 'active' ? 'var(--loy)' : 'var(--line)' }}>
          <span className="ic s">play_circle</span> Program Berjalan &amp; Monitoring
          <span style={{ background: 'var(--green)', color: '#fff', padding: '1px 6px', borderRadius: 'var(--rf)', fontSize: '10px', fontWeight: '700', marginLeft: '4px' }}>3</span>
        </button>
        <button className={`btn ${activeSection === 'tiers' ? 'pri' : 'ghost'} sm`} onClick={() => setActiveSection('tiers')} style={{ flexShrink: 0, borderRadius: 'var(--r10)', fontWeight: 600, background: activeSection === 'tiers' ? 'var(--loy)' : 'var(--srf)', borderColor: activeSection === 'tiers' ? 'var(--loy)' : 'var(--line)' }}>
          <span className="ic s">layers</span> Tier Loyalitas &amp; Aturan Poin
        </button>
        <button className={`btn ${activeSection === 'ai' ? 'pri' : 'ghost'} sm`} onClick={() => setActiveSection('ai')} style={{ flexShrink: 0, borderRadius: 'var(--r10)', fontWeight: 600, background: activeSection === 'ai' ? 'var(--loy)' : 'var(--srf)', borderColor: activeSection === 'ai' ? 'var(--loy)' : 'var(--line)' }}>
          <span className="ic s">chat</span> Tanya Sinteta AI
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 1: RANCANG PROGRAM (STUDIO DESIGN & ROI SIMULATOR) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'design' && (
        <div className="g32">
          <div className="col">
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l">
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s" style={{ color: 'var(--loy)' }}>auto_awesome</span> Rekomendasi Program &amp; Aturan Poin
                  </div>
                  <div className="card-sub">Sesuaikan reward poin dan target intervensi pasien secara real-time</div>
                </div>
                <span className="bdg loy">{baseRuleItems.length} Program</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} id="studio-rules-list">
                {baseRuleItems.map(item => {
                  const ruleData = rules[item.key] || { points: item.points || 200 };
                  return (
                    <div key={item.key} style={{ border: `1px solid var(--${item.loyBorder || 'loy-m'})`, borderRadius: 'var(--r12)', padding: '13px 15px', background: `var(--${item.loyClass || 'loy-s'})`, marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: `var(--${item.colorClass})`, marginBottom: '3px' }}>{item.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: '1.5' }}>{item.desc}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ background: `var(--${item.colorClass})`, color: '#fff', padding: '2px 9px', borderRadius: 'var(--rf)', fontSize: '10.5px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {item.isCustom ? 'Kustom' : 'Saran AI'}
                          </span>
                          <span className="bdg n" style={{ fontSize: '9.5px' }}>{item.category}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: '500' }}>Reward Poin:</span>
                        <input type="number" min="50" max="1000" step="50" value={ruleData.points} onChange={(e) => {
                          if (item.isCustom) {
                            setCustomPrograms(customPrograms.map(p => p.key === item.key ? { ...p, points: parseInt(e.target.value) || 0 } : p));
                          } else {
                            if (onRulePointsChange) onRulePointsChange(item.key, e.target.value);
                          }
                        }} style={{ width: '70px', padding: '4px 6px', border: '1px solid var(--line2)', borderRadius: '6px', fontSize: '12px', outline: 'none' }} />
                        <input type="range" min="50" max="1000" step="50" value={ruleData.points} onChange={(e) => {
                          if (item.isCustom) {
                            setCustomPrograms(customPrograms.map(p => p.key === item.key ? { ...p, points: parseInt(e.target.value) || 0 } : p));
                          } else {
                            if (onRulePointsChange) onRulePointsChange(item.key, e.target.value);
                          }
                        }} style={{ flex: 1, minWidth: '100px', accentColor: 'var(--loy)' }} />
                        <button className="btn loy xs" onClick={() => {
                          if (item.isCustom) {
                            alert(`Program kustom "${item.title}" dengan reward ${ruleData.points} Poin disimpan!`);
                          } else {
                            if (onSaveRulePoints) onSaveRulePoints(item.key);
                          }
                        }}>{item.isCustom ? 'Aktifkan' : 'Simpan Poin'}</button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: 'var(--t3)', marginTop: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span className="ic s">group</span>{item.target}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span className="ic s">schedule</span>{item.schedule}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COL: WHY THIS SUGGESTION & REACTIVE ROI SIMULATOR */}
          <div className="col">
            <div className="card">
              <div className="card-hd"><div className="card-hd-l"><div className="card-title">Rasional Intervensi AI</div><div className="card-sub">Alasan Sinteta memilih program ini</div></div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: 'var(--r8)', background: 'var(--srf2)', border: '1px solid var(--line)' }}><div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--loy-s)', color: 'var(--loy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="ic s">trending_down</span></div><div><div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t1)' }}>Adherence ANC T2 turun 8%</div><div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '1px' }}>67 pasien berisiko tidak melanjutkan ke T3</div></div></div>
                <div style={{ display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: 'var(--r8)', background: 'var(--srf2)', border: '1px solid var(--line)' }}><div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--blue-s)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="ic s">hub</span></div><div><div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t1)' }}>Komunitas bumil sangat aktif bulan ini</div><div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '1px' }}>Momentum tepat untuk referral campaign</div></div></div>
                <div style={{ display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: 'var(--r8)', background: 'var(--srf2)', border: '1px solid var(--line)' }}><div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green-s)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="ic s">child_care</span></div><div><div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t1)' }}>89 bayi mendekati jadwal imunisasi</div><div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '1px' }}>Window intervensi reward terbuka 3 minggu ke depan</div></div></div>
              </div>
            </div>
            
            {/* Reactive ROI Simulator Card */}
            {(() => {
              const pointsANC = rules.ancChallenge?.points || 0;
              const pointsRef = rules.referralBoost?.points || 0;
              const pointsStreak = rules.wellBabyStreak?.points || 0;
              const totalPoints = pointsANC + pointsRef + pointsStreak;
              const compliancePercent = Math.min(30, Math.round(5 + (totalPoints * 0.02)));
              const extraRevenue = Math.round((totalPoints * 45000) / 1000000).toFixed(1);

              return (
                <div className="card" style={{ borderColor: 'var(--loy-m)', background: 'var(--loy-s)' }}>
                  <div className="card-hd" style={{ marginBottom: '8px' }}><div className="card-hd-l"><div className="card-title" style={{ color: 'var(--loy)' }}><span className="ic s">smart_toy</span> Simulasi Dampak &amp; ROI</div></div></div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div className="mp" style={{ flex: 1 }}><div className="v" style={{ color: 'var(--green)' }} id="sim-adherence-val">+{compliancePercent}%</div><div className="l">Estimasi kenaikan adherence</div></div>
                    <div className="mp" style={{ flex: 1 }}><div className="v" style={{ color: 'var(--loy)' }} id="sim-revenue-val">~Rp {extraRevenue}Jt</div><div className="l">Estimasi revenue tambahan</div></div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '12px 0', background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '8px', border: '0.5px solid var(--loy-m)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--t1)', lineHeight: '1.4' }}>
                      Poin reward yang Anda atur memproyeksikan peningkatan <strong>retensi pasien Q2 sebesar 91.2%</strong>.
                    </div>
                  </div>
                  <button className="btn loy" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onRunLoyaltySimulation && onRunLoyaltySimulation()}>
                    <span className="ic s">analytics</span> Jalankan Simulasi Lengkap
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 2: JALUR PENGIRIMAN (PROGRAM DELIVERY - 4 LANES) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'delivery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Autopilot Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--srf)', border: '1.5px solid var(--loy-m)', padding: '14px 18px', borderRadius: 'var(--r12)', boxShadow: 'var(--sh)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="ic s" style={{ color: 'var(--loy)' }}>smart_toy</span> Policare Autopilot Delivery Engine
              </div>
              <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>Deteksi otomatis pasien berisiko dan kumpulkan antrean WhatsApp outreach untuk diotorisasi perawat/dokter sekaligus.</div>
            </div>
            {!isReadOnly ? (
              <button className="btn loy" onClick={() => setIsAutopilotModalOpen(true)}>
                <span className="ic s">bolt</span> Jalankan Autopilot ({autopilotPatients.length} Antrean)
              </button>
            ) : (
              <span className="bdg n" style={{ fontSize: '11px' }}>👁️ Mode Pantau Eksekutif</span>
            )}
          </div>

          {/* LANE 1: RISK-BASED */}
          <div className={`lane ${openLanes['lane-risk'] ? 'open' : ''}`} id="lane-risk">
            <div className="lane-hd" onClick={() => toggleLane('lane-risk')}>
              <div className="lane-color" style={{ background: 'var(--red)' }}></div>
              <div className="lane-ic" style={{ background: 'var(--red-s)' }}><span className="ic" style={{ color: 'var(--red)' }}>person_alert</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lane-title">1. Risk-based Delivery</div>
                <div className="lane-desc">Pasien terdeteksi berisiko dropout oleh Sinteta AI (Missed visits, keluhan, komplikasi)</div>
              </div>
              <div className="lane-badge"><span className="bdg r"><span className="pdot"></span>7 Pasien Kritis</span></div>
              <span className="ic s lane-toggle">{openLanes['lane-risk'] ? 'expand_less' : 'expand_more'}</span>
            </div>
            {openLanes['lane-risk'] && (
              <div className="lane-body">
                {/* Step flow */}
                <div className="step-flow" style={{ '--flow-color': 'var(--red)' }}>
                  <div className="step"><div className="step-dot" style={{ background: 'var(--red)' }}>1</div><div className="step-lbl">Sistem deteksi</div></div>
                  <div className="step"><div className="step-dot" style={{ background: 'var(--red)' }}>2</div><div className="step-lbl">Susun saran</div></div>
                  <div className="step"><div className="step-dot" style={{ background: 'var(--red)' }}>3</div><div className="step-lbl">Buat deliverable</div></div>
                  <div className="step"><div className="step-dot" style={{ background: 'var(--red)' }}>4</div><div className="step-lbl">Kirim ke audiens</div></div>
                  <div className="step"><div className="step-dot" style={{ background: 'var(--red)' }}>5</div><div className="step-lbl">Pantau performa</div></div>
                </div>

                {/* Patients Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <div className="riskrow hi">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}>
                      <div className="risk-av" style={{ background: 'var(--red-s)', color: 'var(--red)' }}>FZ</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)' }}>Fatimah Zahra</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Hamil 32 minggu · Missed ANC 3×</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="risk-pct">89%</div>
                        <div className="bar sm" style={{ width: '60px', marginTop: '2px' }}><div className="bf bfr" style={{ width: '89%' }}></div></div>
                      </div>
                      <button className="btn danger sm" onClick={() => handleReminderClick('Fatimah Zahra')}>
                        {remindedPatients['Fatimah Zahra'] ? 'WA Terkirim ✓' : 'Kirim WA Reminder'}
                      </button>
                    </div>
                  </div>

                  <div className="riskrow hi">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}>
                      <div className="risk-av" style={{ background: 'var(--red-s)', color: 'var(--red)' }}>NA</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)' }}>Nur Aisyah</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Bayi 9 bulan · Imunisasi overdue 6 minggu</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="risk-pct">82%</div>
                        <div className="bar sm" style={{ width: '60px', marginTop: '2px' }}><div className="bf bfr" style={{ width: '82%' }}></div></div>
                      </div>
                      <button className="btn danger sm" onClick={() => handleReminderClick('Nur Aisyah')}>
                        {remindedPatients['Nur Aisyah'] ? 'WA Terkirim ✓' : 'Kirim WA Reminder'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LANE 2: REFERENCE-BASED */}
          <div className={`lane ${openLanes['lane-ref'] ? 'open' : ''}`} id="lane-ref">
            <div className="lane-hd" onClick={() => toggleLane('lane-ref')}>
              <div className="lane-color" style={{ background: 'var(--blue)' }}></div>
              <div className="lane-ic" style={{ background: 'var(--blue-s)' }}><span className="ic" style={{ color: 'var(--blue)' }}>person_search</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lane-title">2. Reference-based Delivery</div>
                <div className="lane-desc">Program berdasarkan profil, riwayat klinis &amp; segmentasi pasien</div>
              </div>
              <div className="lane-badge"><span className="bdg b">23 Pasien</span></div>
              <span className="ic s lane-toggle">{openLanes['lane-ref'] ? 'expand_less' : 'expand_more'}</span>
            </div>
            {openLanes['lane-ref'] && (
              <div className="lane-body">
                <div className="ab b"><div className="ab-hd"><span className="ic s">smart_toy</span>Segmen Aktif: Silver to Gold Upgrade</div><div className="ab-body">23 pasien Silver mendekati threshold Gold. Targetkan dengan broadcast reminder + voucher konsultasi laktasi gratis untuk mendorong kunjungan berikutnya.</div></div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button className="btn pri sm" onClick={() => alert('Broadcast WhatsApp terkirim ke 23 Pasien Silver!')}><span className="ic s">send</span>Kirim Broadcast ke 23 Pasien</button>
                </div>
              </div>
            )}
          </div>

          {/* LANE 3: REFERRAL-PURPOSED */}
          <div className={`lane ${openLanes['lane-referral'] ? 'open' : ''}`} id="lane-referral">
            <div className="lane-hd" onClick={() => toggleLane('lane-referral')}>
              <div className="lane-color" style={{ background: 'var(--loy)' }}></div>
              <div className="lane-ic" style={{ background: 'var(--loy-s)' }}><span className="ic" style={{ color: 'var(--loy)' }}>share</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lane-title">3. Referral-purposed Delivery</div>
                <div className="lane-desc">Program khusus mendorong member komunitas merekomendasikan layanan RSUD Daya</div>
              </div>
              <div className="lane-badge"><span className="bdg l">142 Referral</span></div>
              <span className="ic s lane-toggle">{openLanes['lane-referral'] ? 'expand_less' : 'expand_more'}</span>
            </div>
            {openLanes['lane-referral'] && (
              <div className="lane-body">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div className="mp" style={{ flex: 1 }}><div className="v" style={{ color: 'var(--green)' }}>142</div><div className="l">Referral Berhasil</div></div>
                  <div className="mp" style={{ flex: 1 }}><div className="v" style={{ color: 'var(--blue)' }}>+28</div><div className="l">Pasien Baru Terdaftar</div></div>
                  <div className="mp" style={{ flex: 1 }}><div className="v">34.000</div><div className="l">Poin Reward Terdistribusi</div></div>
                </div>
                <div className="ab loy"><div className="ab-hd"><span className="ic s">star</span>Top Advocate Member</div><div className="ab-body"><strong>Ny. Maya Lestari</strong> — 8 referral sukses ke Poli Obgyn · 2.400 poin reward dikirimkan via WhatsApp.</div></div>
              </div>
            )}
          </div>

          {/* LANE 4: MILESTONE-BASED */}
          <div className={`lane ${openLanes['lane-milestone'] ? 'open' : ''}`} id="lane-milestone">
            <div className="lane-hd" onClick={() => toggleLane('lane-milestone')}>
              <div className="lane-color" style={{ background: 'var(--green)' }}></div>
              <div className="lane-ic" style={{ background: 'var(--green-s)' }}><span className="ic" style={{ color: 'var(--green)' }}>celebration</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lane-title">4. Milestone-based Delivery</div>
                <div className="lane-desc">Trigger otomatis dari pemenuhan event klinis pasien (Lulus Trimester 3, Vaksin Lengkap, Ultah Anak)</div>
              </div>
              <div className="lane-badge"><span className="bdg g">89 Bulan Ini</span></div>
              <span className="ic s lane-toggle">{openLanes['lane-milestone'] ? 'expand_less' : 'expand_more'}</span>
            </div>
            {openLanes['lane-milestone'] && (
              <div className="lane-body">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div className="mp" style={{ flex: 1 }}><div className="v" style={{ color: 'var(--green)' }}>89</div><div className="l">Milestone Lengkap</div></div>
                  <div className="mp" style={{ flex: 1 }}><div className="v" style={{ color: 'var(--blue)' }}>94%</div><div className="l">Klaim Reward Voucher</div></div>
                </div>
                <div className="ab g"><div className="ab-hd"><span className="ic s">check_circle</span>Auto-Trigger Status</div><div className="ab-body">89 ibu yang menuntaskan ANC T3 otomatis menerima voucher persalinan &amp; undangan grup Komunitas Alumni Persalinan.</div></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 3: PROGRAM BERJALAN & MONITORING ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'active' && (
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l">
              <div className="card-title">Daftar Program Sedang Berjalan</div>
              <div className="card-sub">Monitoring performa, partisipasi pasien, dan poin yang terdistribusi</div>
            </div>
            <span className="bdg g"><span className="pdot"></span>3 Kampanye Aktif</span>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Nama Program &amp; Sasaran</th>
                <th>Jalur Delivery</th>
                <th>Target vs Realisasi</th>
                <th>Progress Kepatuhan</th>
                <th>Poin Dikeluarkan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activeRunningPrograms.map(prog => (
                <tr key={prog.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{prog.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t3)' }}>Sasaran: {prog.targetAudience}</div>
                  </td>
                  <td>
                    <span className="bdg b">{prog.lane}</span>
                  </td>
                  <td>
                    <strong>{prog.completed}</strong> / {prog.participants} Pasien
                  </td>
                  <td>
                    <div style={{ width: '80px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', fontWeight: 600, marginBottom: '2px' }}>
                        <span>{prog.progress}%</span>
                      </div>
                      <div className="bar">
                        <div className="bf bfg" style={{ width: `${prog.progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>{prog.pointsSpent}</td>
                  <td>
                    <span className="bdg g"><span className="pdot"></span>{prog.status}</span>
                  </td>
                  <td>
                    <button className="btn ghost xs" onClick={() => alert(`Pengaturan program ${prog.title} dibuka.`)}>
                      Kelola
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 4: TIER LOYALITAS & ATURAN POIN ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'tiers' && (
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l">
              <div className="card-title">Struktur Tier Loyalitas Pasien RSUD Daya</div>
              <div className="card-sub">Hierarki membership berbasis kepatuhan kontrol &amp; riwayat kunjungan</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '10px' }}>
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r12)', padding: '16px', background: 'var(--srf2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#92400E' }}>🥉 Bronze Member</span>
                <span className="bdg n">0 - 499 Poin</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: '1.5' }}>
                • Kupon diskon 5% Poli Gigi<br />
                • Pengingat WhatsApp ANC otomatis<br />
                • Akses komunitas pasien umum
              </div>
            </div>

            <div style={{ border: '1.5px solid var(--blue-m)', borderRadius: 'var(--r12)', padding: '16px', background: 'var(--blue-s)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--blue)' }}>🥈 Silver Member</span>
                <span className="bdg b">500 - 1.499 Poin</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: '1.5' }}>
                • Prioritas pendaftaran antrean admisi<br />
                • 1x Voucher konsultasi laktasi gratis<br />
                • Pengganda poin 1.2x setiap kunjungan
              </div>
            </div>

            <div style={{ border: '1.5px solid #F59E0B', borderRadius: 'var(--r12)', padding: '16px', background: '#FFFBEB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#B45309' }}>🥇 Gold Member</span>
                <span className="bdg a">1.500 - 2.999 Poin</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: '1.5' }}>
                • Free upgrade kamar rawat inap (jika tersedia)<br />
                • Voucher USG 4D diskon 25%<br />
                • Kode referral teman berhadiah 200 Poin
              </div>
            </div>

            <div style={{ border: '1.5px solid var(--loy-m)', borderRadius: 'var(--r12)', padding: '16px', background: 'var(--loy-s)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--loy)' }}>💎 Platinum Member</span>
                <span className="bdg loy">&gt; 3.000 Poin</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: '1.5' }}>
                • Akses VIP Lounge &amp; Layanan Antar Obat Gratis<br />
                • Dedicated Personal Care Assistant (WA Prioritas)<br />
                • Paket Medical Check-Up Tahunan Diskon 50%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 5: TANYA SINTETA AI (COPILOT) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'ai' && (
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="ic s" style={{ color: 'var(--loy)' }}>smart_toy</span> Tanya Sinteta AI Program Copilot
              </div>
              <div className="card-sub">Konsultasikan strategi retensi pasien, simulasi budget poin, dan formulasi pesan outreach</div>
            </div>
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'var(--srf2)', borderRadius: 'var(--r10)', marginBottom: '14px' }}>
            {sintetaMessages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: 'var(--r12)',
                  fontSize: '12.5px',
                  lineHeight: '1.4',
                  background: msg.sender === 'user' ? 'var(--loy)' : '#fff',
                  color: msg.sender === 'user' ? '#fff' : 'var(--t1)',
                  boxShadow: 'var(--sh)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--line)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* PROMPT SUGGESTIONS */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <button className="btn ghost xs" onClick={() => onSelectSintetaPrompt && onSelectSintetaPrompt('Bagaimana cara menaikkan adherence ANC trimester 2?')}>
              💡 Naikkan adherence ANC T2
            </button>
            <button className="btn ghost xs" onClick={() => onSelectSintetaPrompt && onSelectSintetaPrompt('Berapa budget poin bulanan yang ideal?')}>
              💰 Hitung budget poin bulanan
            </button>
            <button className="btn ghost xs" onClick={() => onSelectSintetaPrompt && onSelectSintetaPrompt('Buat pesan outreach untuk pasien missed appointment')}>
              ✉️ Draf pesan WhatsApp outreach
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              id="sinteta-chat-input"
              placeholder="Ketik pertanyaan untuk Sinteta AI..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  if (onSendSintetaMessage) onSendSintetaMessage(e.target.value);
                  e.target.value = '';
                }
              }}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)', fontSize: '13px' }}
            />
            <button className="btn loy" onClick={() => {
              const input = document.getElementById('sinteta-chat-input');
              if (input && input.value) {
                if (onSendSintetaMessage) onSendSintetaMessage(input.value);
                input.value = '';
              }
            }}>
              <span className="ic s">send</span> Kirim
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── AUTOPILOT DELIVERY MODAL (WHATSAPP OUTREACH BATCH AUTHORIZATION) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {isAutopilotModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsAutopilotModalOpen(false)}>
          <div className="modal-box" style={{ width: '680px' }}>
            <div className="modal-hd">
              <div className="modal-hd-icon" style={{ background: 'var(--loy-s)' }}>
                <span className="ic" style={{ color: 'var(--loy)' }}>bolt</span>
              </div>
              <div>
                <div className="modal-title">Policare Autopilot — Otorisasi WhatsApp Outreach</div>
                <div className="modal-sub">Verifikasi pesan AI sebelum dikirimkan ke pasien berisiko dropout</div>
              </div>
              <button className="modal-close" onClick={() => setIsAutopilotModalOpen(false)}>
                <span className="ic s">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              {autopilotPatients.map(patient => (
                <div key={patient.id} style={{ border: `1.5px solid ${patient.selected ? 'var(--loy-m)' : 'var(--line)'}`, borderRadius: 'var(--r12)', padding: '14px', background: patient.selected ? 'var(--loy-s)' : 'var(--srf)', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={patient.selected}
                        onChange={() => handleTogglePatientSelected(patient.id)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--loy)' }}
                      />
                      <strong style={{ fontSize: '13.5px', color: 'var(--t1)' }}>{isPiiMasked ? PiiMasker.maskName(patient.name) : patient.name}</strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--t3)' }}>({isPiiMasked ? PiiMasker.maskPhone(patient.phone) : patient.phone})</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isPiiMasked && (
                        <span className="bdg g" style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                          <span className="ic s" style={{ fontSize: '11px' }}>shield</span> UU PDP
                        </span>
                      )}
                      <span className="bdg r" style={{ fontSize: '10.5px' }}>Skor Dropout: {patient.score}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '8px', paddingLeft: '24px' }}>
                    Kondisi: <strong>{patient.riskType}</strong>
                  </div>

                  <div style={{ paddingLeft: '24px' }}>
                    <textarea
                      rows="2"
                      value={patient.message}
                      onChange={(e) => handleMessageChange(patient.id, e.target.value)}
                      className="inp"
                      style={{ fontSize: '12px', resize: 'none', lineHeight: '1.45' }}
                    />
                  </div>
                </div>
              ))}

              <div style={{ padding: '12px 16px', borderRadius: 'var(--r10)', background: 'var(--amber-s)', border: '1.5px solid var(--amber-m)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="auth-check"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--amber)' }}
                />
                <label htmlFor="auth-check" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--amber)', cursor: 'pointer', lineHeight: 1.5 }}>
                  Saya menyatakan telah memverifikasi pesan outreach di atas sesuai etika komunikasi medis dan riwayat rekam medis pasien di RSUD Daya.
                </label>
              </div>
            </div>

            <div className="modal-ft">
              <button type="button" className="btn ghost" onClick={() => setIsAutopilotModalOpen(false)}>Batalkan</button>
              <button
                type="button"
                className="btn loy"
                disabled={!authorized || autopilotPatients.filter(p => p.selected).length === 0}
                onClick={handleBulkOutreachSubmit}>
                <span className="ic s">send</span> Otorisasi &amp; Kirim Massal ({autopilotPatients.filter(p => p.selected).length} Pasien)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
