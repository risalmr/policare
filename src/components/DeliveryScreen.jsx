import { useState } from 'react';
import { PiiMasker } from '../utils/security';

export default function DeliveryScreen({ outreachLogs, remindedPatients, onTriggerWhatsAppReminder, active, isPiiMasked = true, accessLevel = 'ADMIN' }) {
  const isReadOnly = accessLevel === 'VIEWER';
  const [openLanes, setOpenLanes] = useState({
    'lane-risk': true,
    'lane-ref': false,
    'lane-referral': false,
    'lane-milestone': false
  });

  const [isAutopilotModalOpen, setIsAutopilotModalOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [autopilotPatients, setAutopilotPatients] = useState([
    { id: 1, name: 'Fatimah Zahra', phone: '0812-3456-7890', riskType: 'Hamil 32 minggu · Missed ANC 3×', score: '89%', selected: true, message: 'Halo Ibu Fatimah Zahra, jadwal kontrol ANC ke-4 Anda tersisa 3 hari lagi. Hadir tepat waktu untuk mendapatkan +100 Poin Loyalitas dan voucher reward!' },
    { id: 2, name: 'Nur Aisyah', phone: '0815-9988-7766', riskType: 'Bayi 9 mudan · Imunisasi overdue 6 minggu', score: '82%', selected: true, message: 'Halo Ibu Nur Aisyah, jadwal imunisasi bayi Anda sudah terlambat 6 minggu. Hadir ke klinik minggu ini untuk klaim bonus +200 Poin!' },
    { id: 3, name: 'Rini Marlina', phone: '0813-1122-3344', riskType: 'Post-partum 6 minggu · feedback negatif', score: '71%', selected: true, message: 'Halo Ibu Rini Marlina, kami mengundang Anda untuk konsultasi laktasi gratis pasca melahirkan. Selesaikan kunjungan dan dapatkan bonus +150 Poin!' }
  ]);

  if (!active) return null;

  const toggleLane = (id) => {
    setOpenLanes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReminderClick = (name) => {
    const patient = autopilotPatients.find(p => p.name === name);
    const msg = patient ? patient.message : `Halo Ibu ${name}, jadwal kontrol ANC ke-4 Anda tersisa 3 hari lagi. Hadir tepat waktu untuk mendapatkan +100 Poin Loyalitas dan voucher reward!`;
    const phone = patient ? patient.phone : '0812-3456-7890';
    onTriggerWhatsAppReminder(name, phone, msg);
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
      onTriggerWhatsAppReminder(p.name, p.phone, p.message);
    });
    alert(`Otorisasi sukses! ${selected.length} pesan outreach dikirim massal via WhatsApp.`);
    setIsAutopilotModalOpen(false);
    setAuthorized(false);
  };

  return (
    <div className="screen on" id="s-delivery">
      <div className="ph">
        <div className="ph-text"><h2>Program Delivery</h2><p>Kelola empat jalur pengiriman program loyalitas berdasarkan tujuan intervensi pasien.</p></div>
        <div className="ph-act"><button className="btn pri"><span className="ic s">launch</span>Luncurkan Program</button></div>
      </div>
      <div className="kstrip k4">
        <div className="kcard kr"><div className="kcard-ic"><span className="ic">person_alert</span></div><div className="kcard-lbl">Risiko Dropout</div><div className="kcard-v">7</div><div className="kcard-d dn">Perlu intervensi segera</div></div>
        <div className="kcard ka"><div className="kcard-ic"><span className="ic">person_search</span></div><div className="kcard-lbl">Dalam Pemantauan</div><div className="kcard-v">23</div><div className="kcard-d fl">Monitor &amp; outreach</div></div>
        <div className="kcard kl"><div className="kcard-ic"><span className="ic">share</span></div><div className="kcard-lbl">Program Referral</div><div className="kcard-v">142</div><div className="kcard-d up"><span className="ic s">trending_up</span>Bulan ini</div></div>
        <div className="kcard kg"><div className="kcard-ic"><span className="ic">celebration</span></div><div className="kcard-lbl">Milestone Tercapai</div><div className="kcard-v">89</div><div className="kcard-d up">Minggu ini</div></div>
      </div>

      {/* LANES VERTICAL STACK */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {/* LANE 1: RISK-BASED */}
        <div className={`lane ${openLanes['lane-risk'] ? 'open' : ''}`} id="lane-risk">
          <div className="lane-hd" onClick={() => toggleLane('lane-risk')}>
            <div className="lane-color" style={{ background: 'var(--red)' }}></div>
            <div className="lane-ic" style={{ background: 'var(--red-s)' }}><span className="ic" style={{ color: 'var(--red)' }}>person_alert</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lane-title">Risk-based</div>
              <div className="lane-desc">Pasien terdeteksi berisiko dropout oleh Sinteta</div>
            </div>
            <div className="lane-badge"><span className="bdg r"><span className="pdot"></span>7 Kritis</span></div>
            <span className="ic s lane-toggle">expand_more</span>
          </div>
          {openLanes['lane-risk'] && (
            <div className="lane-body">
              {/* Step flow */}
              <div className="step-flow" style={{ '--flow-color': 'var(--red)' }}>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--red)' }}>1</div>
                  <div className="step-lbl">Sistem deteksi</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--red)' }}>2</div>
                  <div className="step-lbl">Susun saran</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--red)' }}>3</div>
                  <div className="step-lbl">Buat deliverable</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--red)' }}>4</div>
                  <div className="step-lbl">Kirim ke audiens</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--red)' }}>5</div>
                  <div className="step-lbl">Pantau performa</div>
                </div>
              </div>

              {/* Policare Autopilot Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--srf2)', border: '1px dashed var(--line)', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s" style={{ color: 'var(--loy)' }}>smart_toy</span> Policare Autopilot
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>Deteksi dan kirim outreach massal — diotorisasi oleh perawat sebelum dikirim.</div>
                </div>
                {!isReadOnly ? (
                  <button className="btn loy sm" onClick={() => setIsAutopilotModalOpen(true)}>
                    <span className="ic s">bolt</span> Jalankan Autopilot
                  </button>
                ) : (
                  <span className="bdg n" style={{ fontSize: '11px' }}>👁️ Mode Pantau Eksekutif</span>
                )}
              </div>

              {/* Patients */}
              <div className="riskrow hi">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}>
                  <div className="risk-av" style={{ background: 'var(--red-s)', color: 'var(--red)' }}>FZ</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{isPiiMasked ? PiiMasker.maskName('Fatimah Zahra') : 'Fatimah Zahra'}</span>
                      {isPiiMasked && <span className="bdg g" style={{ fontSize: '9px', padding: '1px 5px' }}>PDP</span>}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Hamil 32 minggu · Missed ANC 3×</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="risk-pct">89%</div>
                    <div className="bar sm" style={{ width: '60px', marginTop: '2px' }}><div className="bf bfr" style={{ width: '89%' }}></div></div>
                  </div>
                  <button className="btn danger sm" disabled={isReadOnly || !!remindedPatients['Fatimah Zahra']} onClick={() => handleReminderClick('Fatimah Zahra')}>
                    {remindedPatients['Fatimah Zahra'] ? 'WA Terkirim ✓' : isReadOnly ? 'Mode Pantau' : 'Hubungi'}
                  </button>
                </div>
              </div>
              <div className="riskrow hi">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}>
                  <div className="risk-av" style={{ background: 'var(--red-s)', color: 'var(--red)' }}>NA</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{isPiiMasked ? PiiMasker.maskName('Nur Aisyah') : 'Nur Aisyah'}</span>
                      {isPiiMasked && <span className="bdg g" style={{ fontSize: '9px', padding: '1px 5px' }}>PDP</span>}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Bayi 9 bulan · Imunisasi overdue 6 minggu</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="risk-pct">82%</div>
                    <div className="bar sm" style={{ width: '60px', marginTop: '2px' }}><div className="bf bfr" style={{ width: '82%' }}></div></div>
                  </div>
                  <button className="btn danger sm" disabled={isReadOnly || !!remindedPatients['Nur Aisyah']} onClick={() => handleReminderClick('Nur Aisyah')}>
                    {remindedPatients['Nur Aisyah'] ? 'WA Terkirim ✓' : isReadOnly ? 'Mode Pantau' : 'Eskalasi'}
                  </button>
                </div>
              </div>
              <div className="riskrow md">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}>
                  <div className="risk-av" style={{ background: 'var(--amber-s)', color: 'var(--amber)' }}>RM</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{isPiiMasked ? PiiMasker.maskName('Rini Marlina') : 'Rini Marlina'}</span>
                      {isPiiMasked && <span className="bdg g" style={{ fontSize: '9px', padding: '1px 5px' }}>PDP</span>}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Post-partum 6 minggu · feedback negatif</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="risk-pct">71%</div>
                    <div className="bar sm" style={{ width: '60px', marginTop: '2px' }}><div className="bf bfa" style={{ width: '71%' }}></div></div>
                  </div>
                  <button className="btn sm" disabled={isReadOnly || !!remindedPatients['Rini Marlina']} style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }} onClick={() => handleReminderClick('Rini Marlina')}>
                    {remindedPatients['Rini Marlina'] ? 'WA Terkirim ✓' : isReadOnly ? 'Mode Pantau' : 'Tawarkan'}
                  </button>
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
              <div className="lane-title">Reference-based</div>
              <div className="lane-desc">Program berdasarkan profil &amp; segmentasi pasien</div>
            </div>
            <div className="lane-badge"><span className="bdg b">23 Pasien</span></div>
            <span className="ic s lane-toggle">expand_more</span>
          </div>
          {openLanes['lane-ref'] && (
            <div className="lane-body">
              <div className="step-flow" style={{ '--flow-color': 'var(--blue)' }}>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--blue)' }}>1</div>
                  <div className="step-lbl">Dapat profil pasien</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--blue)' }}>2</div>
                  <div className="step-lbl">Identifikasi kebutuhan</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--blue)' }}>3</div>
                  <div className="step-lbl">Buat deliverable</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--blue)' }}>4</div>
                  <div className="step-lbl">Kirim ke audiens</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--blue)' }}>5</div>
                  <div className="step-lbl">Pantau performa</div>
                </div>
              </div>
              <div className="ab b"><div className="ab-hd"><span className="ic s">smart_toy</span>Segmen aktif</div><div className="ab-body">23 pasien Silver mendekati threshold Gold. Targetkan dengan reminder + penawaran sesi konsul gratis untuk push naik tier.</div></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-start' }}>
                <button className="btn pri sm" onClick={() => alert('Broadcast dikirim ke 23 pasien!')}><span className="ic s">send</span>Kirim ke 23 Pasien</button>
                <button className="btn ghost sm">Edit segmen</button>
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
              <div className="lane-title">Referral-purposed</div>
              <div className="lane-desc">Program khusus mendorong member merekomendasikan RS</div>
            </div>
            <div className="lane-badge"><span className="bdg l">142 Referral</span></div>
            <span className="ic s lane-toggle">expand_more</span>
          </div>
          {openLanes['lane-referral'] && (
            <div className="lane-body">
              <div className="step-flow" style={{ '--flow-color': 'var(--loy)' }}>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--loy)' }}>1</div>
                  <div className="step-lbl">Picu advokasi</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--loy)' }}>2</div>
                  <div className="step-lbl">Set objective referral</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--loy)' }}>3</div>
                  <div className="step-lbl">Dapat segment</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--loy)' }}>4</div>
                  <div className="step-lbl">Formulasi deliverable</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--loy)' }}>5</div>
                  <div className="step-lbl">Kirim</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div className="mp" style={{ flex: 1 }}><div className="v" style={{ color: 'var(--green)' }}>142</div><div className="l">Referral berhasil</div></div>
                <div className="mp" style={{ flex: 1 }}><div className="v" style={{ color: 'var(--blue)' }}>+28</div><div className="l">Pasien baru</div></div>
                <div className="mp" style={{ flex: 1 }}><div className="v">34K</div><div className="l">Poin reward</div></div>
              </div>
              <div className="ab loy"><div className="ab-hd"><span className="ic s">star</span>Top Referrer</div><div className="ab-body"><strong>Maya Lestari</strong> — 8 referral sukses · 2.400 poin reward dikirim</div></div>
            </div>
          )}
        </div>

        {/* LANE 4: MILESTONE-BASED */}
        <div className={`lane ${openLanes['lane-milestone'] ? 'open' : ''}`} id="lane-milestone">
          <div className="lane-hd" onClick={() => toggleLane('lane-milestone')}>
            <div className="lane-color" style={{ background: 'var(--green)' }}></div>
            <div className="lane-ic" style={{ background: 'var(--green-s)' }}><span className="ic" style={{ color: 'var(--green)' }}>celebration</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lane-title">Milestone-based</div>
              <div className="lane-desc">Trigger otomatis dari event klinis pasien</div>
            </div>
            <div className="lane-badge"><span className="bdg g">89 Bulan Ini</span></div>
            <span className="ic s lane-toggle">expand_more</span>
          </div>
          {openLanes['lane-milestone'] && (
            <div className="lane-body">
              <div className="step-flow" style={{ '--flow-color': 'var(--green)' }}>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--green)' }}>1</div>
                  <div className="step-lbl">Reminding &amp; Educating</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--green)' }}>2</div>
                  <div className="step-lbl">Treatment dipantau</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--green)' }}>3</div>
                  <div className="step-lbl">Treatment dipenuhi</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--green)' }}>4</div>
                  <div className="step-lbl">Evaluasi treatment</div>
                </div>
                <div className="step">
                  <div className="step-dot" style={{ background: 'var(--green)' }}>5</div>
                  <div className="step-lbl">Treatment berlanjut</div>
                </div>
              </div>

              <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--t3)', marginBottom: '10px' }}>Trigger Aktif</div>
              <div className="trigger-grid">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--r8)', background: 'var(--green-s)', border: '1px solid var(--green-m)', transition: 'transform 0.15s' }}>
                  <span className="ic s" style={{ color: 'var(--green)', fontSize: '18px' }}>pregnant_woman</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--green)' }}>ANC Selesai Semua Trimester</div><div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>→ 200 poin bonus · 34 pasien minggu ini</div></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--r8)', background: 'var(--green-s)', border: '1px solid var(--green-m)', transition: 'transform 0.15s' }}>
                  <span className="ic s" style={{ color: 'var(--green)', fontSize: '18px' }}>child_care</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--green)' }}>Imunisasi On-Schedule 1 Tahun</div><div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>→ 500 poin + badge · 12 bayi bulan ini</div></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--r8)', background: 'var(--blue-s)', border: '1px solid var(--blue-m)', transition: 'transform 0.15s' }}>
                  <span className="ic s" style={{ color: 'var(--blue)', fontSize: '18px' }}>cake</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--blue)' }}>Ulang Tahun Bayi 1 Tahun</div><div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>→ Pesan selamat + 100 poin · 8 bayi bulan ini</div></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--r8)', background: 'var(--amber-s)', border: '1px solid var(--amber-m)', transition: 'transform 0.15s' }}>
                  <span className="ic s" style={{ color: 'var(--amber)', fontSize: '18px' }}>schedule</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--amber)' }}>HPL -30 Hari</div><div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>→ Reminder persalinan + booking kamar · 18 bumil</div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOG AKTIVITAS OUTREACH */}
      <div className="card" style={{ marginTop: '20px', width: '100%' }}>
        <div className="card-hd">
          <div className="card-hd-l">
            <div className="card-title"><span className="ic s" style={{ color: 'var(--blue)' }}>history</span> Log Aktivitas Outreach</div>
            <div className="card-sub">Daftar reminder WhatsApp yang baru saja terkirim ke pasien</div>
          </div>
          <span className="bdg b" id="outreach-log-count">{outreachLogs.length} Terkirim</span>
        </div>
        <div id="outreach-log-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', padding: '4px' }}>
          {outreachLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-state-icon" style={{ width: '48px', height: '48px', marginBottom: '10px' }}>
                <span className="ic" style={{ fontSize: '24px' }}>send_and_archive</span>
              </div>
              <h4 style={{ fontSize: '13px' }}>Belum Ada Aktivitas Outreach</h4>
              <p style={{ fontSize: '11.5px', marginBottom: 0 }}>Pesan reminder atau notifikasi WhatsApp otomatis akan tercatat di sini secara langsung.</p>
            </div>
          ) : (
            outreachLogs.map((log, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--srf2)', border: '1.5px solid var(--line)', borderRadius: 'var(--r10)', padding: '10px 14px', fontSize: '12px', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--r8)', background: 'var(--blue-s)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="ic s" style={{ color: 'var(--blue)' }}>chat</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: 'var(--t1)' }}>{log.patientName}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--t3)' }}>({log.channel})</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginTop: '2px', maxWidth: '400px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      "{log.message}"
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className="bdg g" style={{ fontSize: '10.5px' }}>{log.status}</span>
                  <div style={{ fontSize: '10.5px', color: 'var(--t3)', marginTop: '3px' }}>{log.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Policare Autopilot Review & Otorisasi Modal */}
      {isAutopilotModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsAutopilotModalOpen(false)}>
          <div className="modal-box" style={{ width: '720px' }}>
            <div className="modal-hd">
              <div className="modal-hd-icon" style={{ background: 'var(--loy-s)' }}>
                <span className="ic" style={{ color: 'var(--loy)' }}>smart_toy</span>
              </div>
              <div>
                <div className="modal-title">Policare Autopilot — Tinjau Antrean Outreach</div>
                <div className="modal-sub">Tinjau, sesuaikan pesan, dan otorisasi pengiriman pesan pengingat massal</div>
              </div>
              <button className="modal-close" onClick={() => setIsAutopilotModalOpen(false)}>
                <span className="ic s">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
              {autopilotPatients.map(p => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', border: `1.5px solid ${p.selected ? 'var(--loy-m)' : 'var(--line)'}`, borderRadius: 'var(--r12)', background: p.selected ? 'var(--loy-s)' : 'var(--srf)', opacity: p.selected ? 1 : 0.65, transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={p.selected}
                        onChange={() => handleTogglePatientSelected(p.id)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--loy)' }}
                      />
                      <strong style={{ fontSize: '13.5px', color: 'var(--t1)' }}>{isPiiMasked ? PiiMasker.maskName(p.name) : p.name}</strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--t3)' }}>({isPiiMasked ? PiiMasker.maskPhone(p.phone) : p.phone})</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isPiiMasked && (
                        <span className="bdg g" style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                          <span className="ic s" style={{ fontSize: '11px' }}>shield</span> UU PDP
                        </span>
                      )}
                      <span className="bdg r" style={{ fontSize: '11px', padding: '3px 10px' }}>Risk: {p.score}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t2)', paddingLeft: '26px' }}>{p.riskType}</div>
                  
                  {p.selected && (
                    <div style={{ paddingLeft: '26px', marginTop: '4px' }}>
                      <textarea
                        value={p.message}
                        onChange={(e) => handleMessageChange(p.id, e.target.value)}
                        className="inp"
                        style={{ height: '60px', fontSize: '12px', resize: 'none', lineHeight: '1.45' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--srf2)', padding: '14px 18px', borderRadius: 'var(--r12)', border: '1.5px solid var(--line2)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '12px', color: 'var(--t1)', lineHeight: '1.5' }}>
                <input
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--loy)' }}
                />
                <span><strong>Otorisasi Medis Perawat (Human-in-the-loop)</strong>: Saya menyatakan bertanggung jawab penuh secara klinis atas pengiriman pesan edukasi / outreach di atas dan telah memverifikasi kesesuaian target intervensi dengan riwayat rekam medis pasien.</span>
              </label>
            </div>

            <div className="modal-ft">
              <button className="btn ghost" onClick={() => setIsAutopilotModalOpen(false)}>Batalkan</button>
              <button
                className="btn loy"
                disabled={!authorized || autopilotPatients.filter(p => p.selected).length === 0}
                onClick={handleBulkOutreachSubmit}
              >
                <span className="ic s">send</span> Otorisasi &amp; Kirim Massal ({autopilotPatients.filter(p => p.selected).length} Pasien)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
