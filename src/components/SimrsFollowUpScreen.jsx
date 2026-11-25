import { useState, useMemo } from 'react';
import { PiiMasker } from '../utils/security';
import { PolicareApi } from '../services/policareApi';

// ─── Helpers ────────────────────────────────────────────────────────────────
function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function fmtDate(d) {
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}
function fmtDateFull(d) {
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const TODAY = new Date('2026-09-15');

const MOCK_SCHEDULES = [
  {
    id: 'SCH-001', patientId: 'P-101', name: 'Rudi Hermawan', age: 42, gender: 'L',
    poli: 'Poli Penyakit Dalam', doctor: 'dr. H. Syarif, Sp.PD', doctorId: 'DOC-SYR',
    diagnosis: 'Hipertensi Primer & Dislipidemia',
    scheduleDate: addDays(TODAY, 2), phase: 'H-2',
    phone: '0812-4455-8899', rm: 'RM-2026-0441', status: 'DIJADWALKAN',
    lastVisit: addDays(TODAY, -5), cardNo: 'CTRL-0441-A',
    notes: 'Kontrol tekanan darah & evaluasi efek samping amlodipine.',
  },
  {
    id: 'SCH-002', patientId: 'P-102', name: 'Siti Aminah', age: 28, gender: 'P',
    poli: 'Poli Kandungan & Kebidanan', doctor: 'dr. Ratna Kusuma, Sp.OG', doctorId: 'DOC-RTN',
    diagnosis: 'G1P0A0 Hamil 14 Minggu — ANC T2',
    scheduleDate: addDays(TODAY, 1), phase: 'H-1',
    phone: '0853-9988-1122', rm: 'RM-2026-0278', cardNo: 'ANC-0278-T2',
    status: 'DIINGATKAN',
    lastVisit: addDays(TODAY, -14), notes: 'ANC trimester 2. Cek USG & lab darah lengkap.',
  },
  {
    id: 'SCH-003', patientId: 'P-103', name: 'Anak Kenzie Alvaro', age: 4, gender: 'L',
    poli: 'Poli Anak', doctor: 'dr. Ahmad Fauzi, Sp.A', doctorId: 'DOC-AHM',
    diagnosis: 'Post-Febris (susp. DHF) — Evaluasi Trombosit',
    scheduleDate: TODAY, phase: 'H+0',
    phone: '0811-2233-4455', rm: 'RM-2026-0519', cardNo: 'CTRL-0519-B',
    status: 'TIDAK_HADIR',
    lastVisit: addDays(TODAY, -3), notes: 'Cek trombosit ulang. Jika <100.000 rawat inap.',
  },
  {
    id: 'SCH-004', patientId: 'P-104', name: 'Haryono Basuki', age: 55, gender: 'L',
    poli: 'Poli Jantung', doctor: 'dr. Wibowo Santoso, Sp.JP', doctorId: 'DOC-WIB',
    diagnosis: 'Post-PCI — Evaluasi Rutin 3 Bulan',
    scheduleDate: addDays(TODAY, -1), phase: 'H+1',
    phone: '0813-7766-5544', rm: 'RM-2026-0112', cardNo: 'CTRL-0112-C',
    status: 'TIDAK_HADIR',
    lastVisit: addDays(TODAY, -95), notes: 'Evaluasi obat antiplatelet & fungsi jantung post-PCI.',
  },
  {
    id: 'SCH-005', patientId: 'P-105', name: 'Dewi Rahmawati', age: 36, gender: 'P',
    poli: 'Poli Penyakit Dalam', doctor: 'dr. H. Syarif, Sp.PD', doctorId: 'DOC-SYR',
    diagnosis: 'DM Tipe 2 — Kontrol Rutin HbA1c',
    scheduleDate: addDays(TODAY, -7), phase: 'H+7',
    phone: '0852-1234-5678', rm: 'RM-2026-0334', cardNo: 'CTRL-0334-DM',
    status: 'TIDAK_HADIR',
    lastVisit: addDays(TODAY, -37), notes: 'Target HbA1c < 7%. Evaluasi metformin & gaya hidup.',
  },
];

const MOCK_WELLNESS = [
  {
    id: 'WEL-001', patientId: 'P-201', name: 'Budi Santoso', age: 50, gender: 'L',
    poli: 'Poli Penyakit Dalam', doctor: 'dr. H. Syarif, Sp.PD', doctorId: 'DOC-SYR',
    diagnosis: 'Gastritis Kronis', phone: '0812-9900-1122', rm: 'RM-2026-0088',
    declaredHealthyDate: addDays(TODAY, -3), lastVisit: addDays(TODAY, -10),
    status: 'BELUM_DITANYA', doctorNote: 'Pasien sudah sembuh, tidak perlu kontrol lagi.',
    absenceDays: null, trigger: 'HEALTHY',
  },
  {
    id: 'WEL-002', patientId: 'P-202', name: 'Nuraeni Hasanah', age: 62, gender: 'P',
    poli: 'Poli Saraf', doctor: 'dr. Irwan Kurniawan, Sp.S', doctorId: 'DOC-IRW',
    diagnosis: 'Vertigo BPPV — Terapi Epley', phone: '0813-5544-3322', rm: 'RM-2026-0203',
    declaredHealthyDate: addDays(TODAY, -1), lastVisit: addDays(TODAY, -8),
    status: 'BELUM_DITANYA', doctorNote: 'Manuver Epley berhasil. Tidak perlu kontrol kecuali kambuh.',
    absenceDays: null, trigger: 'HEALTHY',
  },
  {
    id: 'WEL-003', patientId: 'P-203', name: 'Muh. Taufik Hidayat', age: 45, gender: 'L',
    poli: 'Poli Ortopedi', doctor: 'dr. Syamsul Bahri, Sp.OT', doctorId: 'DOC-SYM',
    diagnosis: 'LBP (Low Back Pain) — Fisioterapi', phone: '0852-7788-9900', rm: 'RM-2026-0367',
    declaredHealthyDate: null, lastVisit: addDays(TODAY, -21),
    status: 'BELUM_DITANYA', doctorNote: null,
    absenceDays: 21, trigger: 'LONG_ABSENCE',
  },
];

const MOCK_DOCTORS = {
  'DOC-SYR': { name: 'dr. H. Syarif, Sp.PD', poli: 'Poli Penyakit Dalam', avatar: 'SY', color: '#0284c7' },
  'DOC-RTN': { name: 'dr. Ratna Kusuma, Sp.OG', poli: 'Poli Kandungan', avatar: 'RK', color: '#7c3aed' },
  'DOC-AHM': { name: 'dr. Ahmad Fauzi, Sp.A', poli: 'Poli Anak', avatar: 'AF', color: '#ea580c' },
  'DOC-WIB': { name: 'dr. Wibowo Santoso, Sp.JP', poli: 'Poli Jantung', avatar: 'WS', color: '#dc2626' },
  'DOC-IRW': { name: 'dr. Irwan Kurniawan, Sp.S', poli: 'Poli Saraf', avatar: 'IK', color: '#059669' },
  'DOC-SYM': { name: 'dr. Syamsul Bahri, Sp.OT', poli: 'Poli Ortopedi', avatar: 'SB', color: '#d97706' },
};

function generateSlots(doctorId) {
  const slots = [];
  const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
  for (let d = 1; d <= 14; d++) {
    const date = addDays(TODAY, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;
    const dayTimes = times.filter((_, i) => (d + i) % 3 !== 0);
    dayTimes.forEach(t => slots.push({ date, time: t, label: fmtDate(date) + ' · ' + t + ' WITA', available: true }));
  }
  return slots;
}

const STATUS_CFG = {
  DIJADWALKAN:   { label: 'Dijadwalkan',   color: '#0284c7', bg: 'rgba(2,132,199,0.1)',   icon: 'event' },
  DIINGATKAN:    { label: 'Diingatkan',    color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  icon: 'notifications_active' },
  TIDAK_HADIR:   { label: 'Tidak Hadir',   color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   icon: 'person_off' },
  RESCHEDULE:    { label: 'Reschedule',    color: '#d97706', bg: 'rgba(217,119,6,0.1)',   icon: 'event_repeat' },
  SEHAT:         { label: 'Sudah Sehat',   color: '#059669', bg: 'rgba(5,150,105,0.1)',   icon: 'favorite' },
  ESKALASI:      { label: 'Eskalasi',      color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  icon: 'priority_high' },
  BELUM_DITANYA: { label: 'Belum Ditanya', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: 'help_outline' },
  SUDAH_DITANYA: { label: 'Sudah Ditanya', color: '#0284c7', bg: 'rgba(2,132,199,0.1)',   icon: 'mark_chat_read' },
};

const PHASE_CFG = {
  'H-2': { color: '#0284c7', label: 'H-2 (Lusa)' },
  'H-1': { color: '#7c3aed', label: 'H-1 (Besok)' },
  'H+0': { color: '#dc2626', label: 'Hari Ini' },
  'H+1': { color: '#ea580c', label: 'Kemarin (H+1)' },
  'H+7': { color: '#6b7280', label: '7 Hari Lalu' },
};

function StatusChip({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.DIJADWALKAN;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      color: cfg.color, background: cfg.bg, border: '1px solid ' + cfg.color + '30',
    }}>
      <span className="ic s" style={{ fontSize: '12px' }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function PhaseChip({ phase }) {
  const cfg = PHASE_CFG[phase] || PHASE_CFG['H-2'];
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 700,
      color: cfg.color, background: cfg.color + '14',
    }}>{cfg.label}</span>
  );
}

function PatientAvatar({ name, gender, size = 36 }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const color = gender === 'P' ? '#7c3aed' : '#0284c7';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color + '18',
      border: '2px solid ' + color + '30', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700, fontSize: size * 0.33, color, flexShrink: 0,
    }}>{initials}</div>
  );
}

function KpiCard({ icon, label, value, sub, color, trend }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--r12)',
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '12px 12px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: '10px', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="ic" style={{ fontSize: '20px', color }}>{icon}</span>
        </div>
        {trend != null && (
          <span style={{ fontSize: '11px', fontWeight: 700, color: trend > 0 ? '#059669' : '#dc2626' }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t2)' }}>{label}</div>
      {sub && <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>{sub}</div>}
    </div>
  );
}

function RescheduleModal({ patient, onClose, onConfirm }) {
  const slots = useMemo(() => generateSlots(patient && patient.doctorId), [patient && patient.doctorId]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const doctor = patient ? MOCK_DOCTORS[patient.doctorId] : null;

  const grouped = useMemo(() => {
    const map = {};
    slots.forEach(s => {
      const key = fmtDateFull(s.date);
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [slots]);

  if (!patient) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-box" style={{ width: '640px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-hd">
          <div className="modal-hd-icon" style={{ background: 'rgba(217,119,6,0.1)' }}>
            <span className="ic" style={{ color: '#d97706' }}>event_repeat</span>
          </div>
          <div>
            <div className="modal-title">Jadwalkan Ulang Kontrol</div>
            <div className="modal-sub">{patient.name} · {patient.poli}</div>
          </div>
          <button className="modal-close" onClick={onClose}><span className="ic s">close</span></button>
        </div>

        <div style={{ padding: '0 20px 14px', borderBottom: '1px solid var(--line)' }}>
          <div style={{
            background: 'rgba(2,132,199,0.06)', border: '1px solid rgba(2,132,199,0.2)',
            borderRadius: 'var(--r10)', padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start'
          }}>
            <span className="ic s" style={{ color: '#0284c7', marginTop: 2 }}>assignment</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '.04em' }}>Kartu Kontrol Sebelumnya</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginTop: '2px' }}>{patient.cardNo}</div>
              <div style={{ fontSize: '12px', color: 'var(--t2)', marginTop: '2px' }}>{patient.diagnosis}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '2px' }}>
                Kunjungan terakhir: {fmtDate(patient.lastVisit)} · Dokter: {patient.doctor}
              </div>
              {patient.notes && (
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginTop: '6px', fontStyle: 'italic' }}>
                  📋 {patient.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {doctor && (
          <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--line)' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: doctor.color + '18',
              border: '2px solid ' + doctor.color + '30', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: 12, color: doctor.color, flexShrink: 0,
            }}>{doctor.avatar}</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{doctor.name}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>{doctor.poli} · Slot tersedia 2 pekan ke depan</div>
            </div>
          </div>
        )}

        <div style={{ overflowY: 'auto', padding: '14px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(grouped).map(([dateLabel, daySlots]) => (
            <div key={dateLabel}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' }}>
                {dateLabel}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {daySlots.map((s, i) => {
                  const isSel = selectedSlot && selectedSlot.label === s.label;
                  return (
                    <button key={i} onClick={() => setSelectedSlot(s)} style={{
                      padding: '7px 14px', borderRadius: 'var(--rf)',
                      border: isSel ? '2px solid #d97706' : '1.5px solid var(--line)',
                      background: isSel ? 'rgba(217,119,6,0.1)' : 'var(--bg)',
                      color: isSel ? '#d97706' : 'var(--t2)',
                      fontWeight: isSel ? 700 : 500, fontSize: '12.5px', cursor: 'pointer',
                    }}>
                      <span className="ic s" style={{ fontSize: '13px', marginRight: 4 }}>schedule</span>
                      {s.time} WITA
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-ft" style={{ borderTop: '1px solid var(--line)', padding: '14px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          {selectedSlot && (
            <div style={{
              flex: 1, padding: '8px 12px', borderRadius: 'var(--r8)',
              background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
              fontSize: '12px', color: '#d97706', fontWeight: 600,
            }}>
              <span className="ic s" style={{ fontSize: '13px', marginRight: 4 }}>event</span>
              Slot: {selectedSlot.label}
            </div>
          )}
          <button className="btn ghost" onClick={onClose}>Batal</button>
          <button className="btn pri" disabled={!selectedSlot} style={{ opacity: selectedSlot ? 1 : 0.5 }} onClick={() => onConfirm(selectedSlot)}>
            <span className="ic s">check_circle</span> Konfirmasi Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

function NoShowResponsePanel({ patient, onResponse, isPiiMasked }) {
  const [expanded, setExpanded] = useState(false);
  const [otherNotes, setOtherNotes] = useState('');
  const [sent, setSent] = useState(false);

  const maskedName = isPiiMasked ? PiiMasker.maskName(patient.name) : patient.name;
  const maskedPhone = isPiiMasked ? PiiMasker.maskPhone(patient.phone) : patient.phone;

  const responses = [
    { key: 'HEALTHY',   icon: 'favorite',     label: 'Sudah Sehat',       sub: 'Tidak perlu kontrol lagi', color: '#059669' },
    { key: 'RESCHEDULE',icon: 'event_repeat',  label: 'Mau Reschedule',    sub: 'Ingin jadwal kontrol baru', color: '#d97706' },
    { key: 'OTHER',     icon: 'help_outline',  label: 'Alasan Lain',       sub: 'Kendala transportasi, biaya, dll.', color: '#6b7280' },
    { key: 'WORSENING', icon: 'emergency',     label: 'Kondisi Memburuk',  sub: 'Perlu tindakan segera', color: '#dc2626' },
  ];

  return (
    <div style={{
      background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--r12)', overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <PatientAvatar name={patient.name} gender={patient.gender} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>{maskedName}</span>
            <span style={{ fontSize: '11.5px', color: 'var(--t3)' }}>{patient.age}th · {patient.rm}</span>
            <StatusChip status={patient.status} />
            <PhaseChip phase={patient.phase} />
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--t2)', marginTop: '3px' }}>
            <span className="ic s" style={{ fontSize: '13px', color: '#dc2626', marginRight: 3 }}>local_hospital</span>
            {patient.diagnosis}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>
            <span className="ic s" style={{ fontSize: '12px', marginRight: 3 }}>stethoscope</span>
            {patient.doctor} · {patient.poli}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '4px', display: 'flex', gap: '12px' }}>
            <span><span className="ic s" style={{ fontSize: '12px' }}>event</span> Jadwal: {fmtDate(patient.scheduleDate)}</span>
            <span><span className="ic s" style={{ fontSize: '12px' }}>phone</span> {maskedPhone}</span>
          </div>
          {patient.notes && (
            <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '4px', fontStyle: 'italic' }}>
              📋 {patient.notes}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
          {!sent ? (
            <button className="btn sm"
              style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.25)', color: '#dc2626', fontWeight: 700 }}
              onClick={() => { setSent(true); setExpanded(true); }}>
              <span className="ic s">send</span> Kirim Tanya
            </button>
          ) : !expanded ? (
            <button className="btn sm"
              style={{ background: 'rgba(217,119,6,0.08)', border: '1.5px solid rgba(217,119,6,0.25)', color: '#d97706', fontWeight: 700 }}
              onClick={() => setExpanded(true)}>
              <span className="ic s">expand_more</span> Rekam Respons
            </button>
          ) : null}
        </div>
      </div>

      {sent && !expanded && (
        <div style={{ margin: '0 16px 14px', padding: '10px 12px', borderRadius: 'var(--r8)', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', fontSize: '12px', color: '#059669', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="ic s">mark_chat_read</span>
          Pesan tanya kondisi dikirim ke {maskedPhone} via WhatsApp. Menunggu respons...
        </div>
      )}

      {sent && expanded && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="ic s" style={{ color: '#d97706' }}>reply</span>
            Rekam Respons Pasien — Pilih jawaban yang diberikan:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {responses.map(r => (
              <button key={r.key} onClick={() => onResponse && onResponse(patient, r.key, otherNotes)}
                style={{
                  padding: '12px 14px', borderRadius: 'var(--r10)',
                  border: '1.5px solid ' + r.color + '35', background: r.color + '08',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', gap: '10px', alignItems: 'center',
                }}>
                <div style={{ width: 34, height: 34, borderRadius: '10px', background: r.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="ic" style={{ fontSize: '20px', color: r.color }}>{r.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: r.color }}>{r.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{r.sub}</div>
                </div>
              </button>
            ))}
          </div>
          <textarea className="inp" rows={2}
            placeholder="Catatan tambahan alasan tidak hadir (opsional)..."
            value={otherNotes} onChange={e => setOtherNotes(e.target.value)}
            style={{ fontSize: '12.5px', resize: 'none' }} />
        </div>
      )}
    </div>
  );
}

function ScheduleCard({ schedule, onRemind, isPiiMasked, reminded }) {
  const maskedName = isPiiMasked ? PiiMasker.maskName(schedule.name) : schedule.name;
  const maskedPhone = isPiiMasked ? PiiMasker.maskPhone(schedule.phone) : schedule.phone;
  const phaseColor = PHASE_CFG[schedule.phase] ? PHASE_CFG[schedule.phase].color : '#6b7280';
  return (
    <div style={{
      background: 'var(--card)', border: '1.5px solid var(--line)',
      borderLeft: '4px solid ' + phaseColor,
      borderRadius: 'var(--r12)', padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <PatientAvatar name={schedule.name} gender={schedule.gender} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--t1)' }}>{maskedName}</span>
            <span style={{ fontSize: '11.5px', color: 'var(--t3)' }}>{schedule.age}th · {schedule.rm}</span>
            <PhaseChip phase={schedule.phase} />
            <StatusChip status={schedule.status} />
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{schedule.diagnosis}</div>
          <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>{schedule.doctor} · {schedule.poli}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span><span className="ic s" style={{ fontSize: '12px' }}>event</span> {fmtDateFull(schedule.scheduleDate)}</span>
            <span><span className="ic s" style={{ fontSize: '12px' }}>phone</span> {maskedPhone}</span>
          </div>
          {schedule.notes && <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '4px', fontStyle: 'italic' }}>📋 {schedule.notes}</div>}
        </div>
        <div style={{ flexShrink: 0 }}>
          {reminded ? (
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="ic s">check_circle</span> Terkirim
            </span>
          ) : onRemind ? (
            <button className="btn sm"
              style={{ background: 'rgba(2,132,199,0.08)', border: '1.5px solid rgba(2,132,199,0.25)', color: '#0284c7', fontWeight: 700 }}
              onClick={() => onRemind(schedule)}>
              <span className="ic s">notifications_active</span> Ingatkan
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function WellnessCard({ patient, onSendWellness, isPiiMasked }) {
  const maskedName = isPiiMasked ? PiiMasker.maskName(patient.name) : patient.name;
  const maskedPhone = isPiiMasked ? PiiMasker.maskPhone(patient.phone) : patient.phone;
  const isLong = patient.trigger === 'LONG_ABSENCE';
  const col = isLong ? '#d97706' : '#059669';
  return (
    <div style={{
      background: 'var(--card)', border: '1.5px solid var(--line)',
      borderLeft: '4px solid ' + col, borderRadius: 'var(--r12)', padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <PatientAvatar name={patient.name} gender={patient.gender} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--t1)' }}>{maskedName}</span>
            <span style={{ fontSize: '11.5px', color: 'var(--t3)' }}>{patient.age}th · {patient.rm}</span>
            <span style={{
              padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              color: col, background: col + '12', border: '1px solid ' + col + '30',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}>
              <span className="ic s" style={{ fontSize: '12px' }}>{isLong ? 'hourglass_empty' : 'health_and_safety'}</span>
              {isLong ? 'Absen ' + patient.absenceDays + ' hari' : 'Dinyatakan Sehat'}
            </span>
            <StatusChip status={patient.status} />
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{patient.diagnosis}</div>
          <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>{patient.doctor} · {patient.poli}</div>
          {patient.doctorNote && (
            <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: 'var(--r8)', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.18)', fontSize: '11.5px', color: '#059669', display: 'flex', gap: '6px' }}>
              <span className="ic s" style={{ flexShrink: 0 }}>stethoscope</span>
              <span><strong>Catatan Dokter:</strong> {patient.doctorNote}</span>
            </div>
          )}
          {isLong && (
            <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: 'var(--r8)', background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.18)', fontSize: '11.5px', color: '#d97706', display: 'flex', gap: '6px' }}>
              <span className="ic s" style={{ flexShrink: 0 }}>info</span>
              Pasien tidak datang sejak {fmtDate(patient.lastVisit)} tanpa keterangan.
            </div>
          )}
          <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '6px' }}>
            <span className="ic s" style={{ fontSize: '12px' }}>phone</span> {maskedPhone}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {patient.status === 'BELUM_DITANYA' && onSendWellness ? (
            <button className="btn sm"
              style={{ background: col + '12', border: '1.5px solid ' + col + '35', color: col, fontWeight: 700 }}
              onClick={() => onSendWellness(patient)}>
              <span className="ic s">favorite</span> Tanya Kabar
            </button>
          ) : (
            <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="ic s">mark_chat_read</span> Terkirim
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorDelayPanel({ schedules, onNotifyPatients, showToast }) {
  const [selectedDoctor, setSelectedDoctor] = useState('DOC-SYR');
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [altTime, setAltTime] = useState('');
  const [option, setOption] = useState('PROPOSE_ALT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doctor = MOCK_DOCTORS[selectedDoctor];
  const affected = schedules.filter(s => s.doctorId === selectedDoctor && ['DIJADWALKAN','DIINGATKAN'].includes(s.status));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await PolicareApi.notifyDoctorDelay(selectedDoctor, delayMinutes, affected.map(p => p.patientId), option === 'PROPOSE_ALT' ? altTime : 'NEXT_SCHEDULE');
      if (showToast) showToast('Notifikasi Terkirim', affected.length + ' pasien dr. ' + (doctor && doctor.name) + ' berhasil diinformasikan.', 'success');
      onNotifyPatients(selectedDoctor);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'rgba(220,38,38,0.04)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 'var(--r12)', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="ic" style={{ color: '#dc2626' }}>warning</span>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626' }}>Skenario B — Dokter Tidak Tepat Waktu</div>
          <div style={{ fontSize: '12px', color: 'var(--t3)' }}>Dokter request/sounding keterlambatan · Notify semua pasien terdampak</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '6px' }}>Dokter</label>
          <select className="inp" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} style={{ fontSize: '12.5px' }}>
            {Object.entries(MOCK_DOCTORS).map(([id, d]) => <option key={id} value={id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '6px' }}>Terlambat</label>
          <select className="inp" value={delayMinutes} onChange={e => setDelayMinutes(Number(e.target.value))} style={{ fontSize: '12.5px' }}>
            {[15,30,45,60,90,120].map(m => <option key={m} value={m}>{m} menit</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '6px' }}>Penanganan</label>
          <select className="inp" value={option} onChange={e => setOption(e.target.value)} style={{ fontSize: '12.5px' }}>
            <option value="PROPOSE_ALT">Propose waktu pengganti</option>
            <option value="NEXT_SCHEDULE">Jadwal regular berikutnya</option>
          </select>
        </div>
      </div>
      {option === 'PROPOSE_ALT' && (
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '6px' }}>Waktu Pengganti</label>
          <input type="text" className="inp" placeholder="Contoh: Hari ini pukul 13:30 WITA" value={altTime} onChange={e => setAltTime(e.target.value)} style={{ fontSize: '12.5px' }} />
        </div>
      )}
      <div style={{ padding: '10px 12px', borderRadius: 'var(--r8)', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', marginBottom: '14px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>
          <span className="ic s" style={{ fontSize: '13px' }}>group</span> {affected.length} Pasien Terdampak
        </div>
        {affected.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--t3)' }}>Tidak ada pasien terjadwal hari ini untuk dokter ini.</div>
        ) : affected.map(p => (
          <div key={p.id} style={{ fontSize: '12.5px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span className="ic s" style={{ fontSize: '12px', color: '#dc2626' }}>person</span>
            {p.name} · {p.poli}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ flex: 1, fontSize: '11.5px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span className="ic s" style={{ color: 'var(--blue)' }}>info</span>
          Notifikasi ke: Pasien (WA), Humas, Departemen terkait.
        </div>
        <button className="btn pri" disabled={isSubmitting || affected.length === 0}
          style={{ background: '#dc2626', borderColor: '#dc2626', opacity: affected.length === 0 ? 0.5 : 1 }}
          onClick={handleSubmit}>
          <span className="ic s">{isSubmitting ? 'hourglass_empty' : 'send'}</span>
          {isSubmitting ? 'Mengirim...' : 'Notify ' + affected.length + ' Pasien'}
        </button>
      </div>
    </div>
  );
}

const INITIAL_HISTORY = [
  { id: 'H-001', time: '14 Sep 2026, 09:12', type: 'REMINDER',     patient: 'Siti Aminah',    action: 'Pengingat H-1 dikirim via WhatsApp', status: 'Sukses', actor: 'Auto-System',  poli: 'Poli Kandungan' },
  { id: 'H-002', time: '14 Sep 2026, 11:45', type: 'NO_SHOW',      patient: 'Haryono Basuki', action: 'Pasien tidak hadir — pesan tanya kondisi dikirim', status: 'Menunggu Respons', actor: 'Fajar Pratama', poli: 'Poli Jantung' },
  { id: 'H-003', time: '13 Sep 2026, 15:30', type: 'RESCHEDULE',   patient: 'Ahmad Yusuf',    action: 'Jadwal dikonfirmasi ulang: Sel, 17 Sep 2026 · 09:00', status: 'Sukses', actor: 'Fajar Pratama', poli: 'Poli Saraf' },
  { id: 'H-004', time: '13 Sep 2026, 08:00', type: 'WELLNESS',     patient: 'Budi Santoso',   action: 'Pesan tanya kabar dikirim — pasien dinyatakan sehat', status: 'Sukses', actor: 'Fajar Pratama', poli: 'Poli Penyakit Dalam' },
  { id: 'H-005', time: '12 Sep 2026, 16:15', type: 'DOCTOR_DELAY', patient: '3 pasien',       action: 'Notifikasi keterlambatan dr. Syarif (30 mnt) dikirim', status: 'Sukses', actor: 'Auto-System', poli: 'Poli Penyakit Dalam' },
];

const HIST_TYPE_CFG = {
  REMINDER:     { icon: 'notifications_active', color: '#7c3aed', label: 'Reminder' },
  NO_SHOW:      { icon: 'person_off',           color: '#dc2626', label: 'Tidak Hadir' },
  RESCHEDULE:   { icon: 'event_repeat',         color: '#d97706', label: 'Reschedule' },
  WELLNESS:     { icon: 'favorite',             color: '#059669', label: 'Tanya Kabar' },
  DOCTOR_DELAY: { icon: 'warning',              color: '#ea580c', label: 'Dokter Terlambat' },
};

export default function SimrsFollowUpScreen({ active, onTriggerCrisis, outreachLogs, onTriggerWhatsAppReminder, isPiiMasked = true, accessLevel = 'ADMIN', showToast }) {
  const isReadOnly = accessLevel === 'VIEWER';

  const [activeSubTab, setActiveSubTab] = useState('ringkasan');
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);
  const [wellnessPatients, setWellnessPatients] = useState(MOCK_WELLNESS);
  const [historyLogs, setHistoryLogs] = useState(INITIAL_HISTORY);
  const [remindedIds, setRemindedIds] = useState({});
  const [noShowResponses, setNoShowResponses] = useState({});
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [showDoctorDelay, setShowDoctorDelay] = useState(false);

  if (!active) return null;

  const upcoming  = schedules.filter(s => ['DIJADWALKAN','DIINGATKAN'].includes(s.status));
  const noShow    = schedules.filter(s => s.status === 'TIDAK_HADIR');
  const pendingWellness = wellnessPatients.filter(w => w.status === 'BELUM_DITANYA');
  const adherenceRate = Math.round(((schedules.length - noShow.length) / schedules.length) * 100);

  const handleRemind = async (schedule) => {
    setRemindedIds(prev => ({ ...prev, [schedule.id]: true }));
    if (onTriggerWhatsAppReminder) {
      onTriggerWhatsAppReminder(schedule, schedule.phone, 'Halo ' + schedule.name + ', pengingat kontrol ' + schedule.phase + ' di ' + schedule.poli + ' pada ' + fmtDateFull(schedule.scheduleDate) + '.');
    }
    setHistoryLogs(prev => [{ id: 'H-' + Date.now(), time: new Date().toLocaleString('id-ID'), type: 'REMINDER', patient: schedule.name, action: 'Pengingat ' + schedule.phase + ' dikirim via WhatsApp', status: 'Sukses', actor: 'Fajar Pratama', poli: schedule.poli }, ...prev]);
    if (showToast) showToast('Reminder Terkirim', 'Pengingat ' + schedule.phase + ' untuk ' + schedule.name + ' berhasil dikirim.', 'success');
  };

  const handleNoShowResponse = async (patient, responseKey, notes) => {
    setNoShowResponses(prev => ({ ...prev, [patient.patientId]: responseKey }));
    const newStatus = responseKey === 'RESCHEDULE' ? 'RESCHEDULE' : responseKey === 'HEALTHY' ? 'SEHAT' : responseKey === 'WORSENING' ? 'ESKALASI' : 'DIJADWALKAN';
    setSchedules(prev => prev.map(s => s.patientId === patient.patientId ? { ...s, status: newStatus } : s));
    await PolicareApi.recordNoShowResponse(patient.patientId, responseKey, notes);
    if (responseKey === 'RESCHEDULE') {
      setRescheduleTarget(patient);
    } else if (responseKey === 'WORSENING') {
      if (onTriggerCrisis) onTriggerCrisis({ id: 'CR-' + Date.now(), name: patient.name, type: 'Kondisi Pasien Memburuk' });
      if (showToast) showToast('Eskalasi Dipicu', 'Kondisi ' + patient.name + ' memburuk — eskalasi ke Humas.', 'error');
    } else {
      if (showToast) showToast('Respons Dicatat', responseKey === 'HEALTHY' ? 'Pasien menyatakan sudah sehat.' : 'Alasan ketidakhadiran dicatat.', 'success');
    }
    setHistoryLogs(prev => [{ id: 'H-' + Date.now(), time: new Date().toLocaleString('id-ID'), type: 'NO_SHOW', patient: patient.name, action: 'Respons pasien: ' + responseKey + (notes ? ' — ' + notes : ''), status: 'Dicatat', actor: 'Fajar Pratama', poli: patient.poli }, ...prev]);
  };

  const handleRescheduleConfirm = async (slot) => {
    if (!rescheduleTarget) return;
    await PolicareApi.rescheduleAppointment(rescheduleTarget.patientId, rescheduleTarget.doctorId, slot.label, rescheduleTarget.id);
    setSchedules(prev => prev.map(s => s.patientId === rescheduleTarget.patientId ? { ...s, status: 'RESCHEDULE', scheduleDate: slot.date } : s));
    setHistoryLogs(prev => [{ id: 'H-' + Date.now(), time: new Date().toLocaleString('id-ID'), type: 'RESCHEDULE', patient: rescheduleTarget.name, action: 'Jadwal baru: ' + slot.label, status: 'Sukses · Reporting ke Humas', actor: 'Fajar Pratama', poli: rescheduleTarget.poli }, ...prev]);
    if (showToast) showToast('Reschedule Berhasil', 'Jadwal ' + rescheduleTarget.name + ' diperbarui: ' + slot.label + '. Laporan ke Humas.', 'success');
    setRescheduleTarget(null);
  };

  const handleSendWellness = async (patient) => {
    await PolicareApi.sendWellnessCheckMessage(patient.patientId, 'Halo ' + patient.name + ', kami dari RSUD Daya ingin menanyakan kabar Anda. Semoga selalu sehat!');
    setWellnessPatients(prev => prev.map(w => w.patientId === patient.patientId ? { ...w, status: 'SUDAH_DITANYA' } : w));
    setHistoryLogs(prev => [{ id: 'H-' + Date.now(), time: new Date().toLocaleString('id-ID'), type: 'WELLNESS', patient: patient.name, action: 'Pesan tanya kabar dikirim via WhatsApp', status: 'Sukses', actor: 'Fajar Pratama', poli: patient.poli }, ...prev]);
    if (showToast) showToast('Tanya Kabar Terkirim', 'Pesan untuk ' + patient.name + ' berhasil dikirim.', 'success');
  };

  const TABS = [
    { id: 'ringkasan',    icon: 'dashboard',    label: 'Ringkasan' },
    { id: 'jadwal',       icon: 'event',        label: 'Jadwal Kontrol',  badge: upcoming.length,      badgeColor: '#0284c7' },
    { id: 'tidak_hadir',  icon: 'person_off',   label: 'Tidak Hadir',     badge: noShow.length,        badgeColor: '#dc2626' },
    { id: 'followup_aktif',icon: 'chat',        label: 'Follow-Up Aktif', badge: 0 },
    { id: 'tanya_kabar',  icon: 'favorite',     label: 'Tanya Kabar',     badge: pendingWellness.length, badgeColor: '#059669' },
    { id: 'riwayat',      icon: 'history',      label: 'Riwayat' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {rescheduleTarget && (
        <RescheduleModal patient={rescheduleTarget} onClose={() => setRescheduleTarget(null)} onConfirm={handleRescheduleConfirm} />
      )}

      {/* Sub-Tab Bar */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1.5px solid var(--line)', background: 'var(--card)', overflowX: 'auto', flexShrink: 0 }}>
        {TABS.map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '12px 16px', fontSize: '12.5px', fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--accent)' : 'var(--t3)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: isActive ? '2.5px solid var(--accent)' : '2.5px solid transparent',
              marginBottom: '-1.5px', whiteSpace: 'nowrap',
            }}>
              <span className="ic s" style={{ fontSize: '15px' }}>{tab.icon}</span>
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  padding: '1px 7px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 800,
                  background: (tab.badgeColor || 'var(--accent)') + '18',
                  color: tab.badgeColor || 'var(--accent)',
                  border: '1px solid ' + (tab.badgeColor || 'var(--accent)') + '30',
                }}>{tab.badge}</span>
              )}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
          <button className="btn sm" onClick={() => setShowDoctorDelay(p => !p)} style={{
            background: showDoctorDelay ? 'rgba(220,38,38,0.1)' : 'var(--bg)',
            border: '1.5px solid ' + (showDoctorDelay ? 'rgba(220,38,38,0.35)' : 'var(--line)'),
            color: showDoctorDelay ? '#dc2626' : 'var(--t2)', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            <span className="ic s">warning</span> Dokter Terlambat
          </button>
        </div>
      </div>

      {/* Skenario B Panel */}
      {showDoctorDelay && (
        <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--line)', background: 'var(--bg)' }}>
          <DoctorDelayPanel schedules={schedules} onNotifyPatients={(doctorId) => {
            setSchedules(prev => prev.map(s => s.doctorId === doctorId && ['DIJADWALKAN','DIINGATKAN'].includes(s.status) ? { ...s, status: 'DIINGATKAN' } : s));
          }} showToast={showToast} />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

        {/* ── RINGKASAN ── */}
        {activeSubTab === 'ringkasan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
              <KpiCard icon="event"        label="Jadwal Aktif"          value={upcoming.length}    sub="Butuh reminder / konfirmasi"               color="#0284c7" />
              <KpiCard icon="person_off"   label="Tidak Hadir (No-Show)" value={noShow.length}      sub="Perlu tindak lanjut segera"                color="#dc2626" />
              <KpiCard icon="track_changes"label="Adherence Rate"        value={adherenceRate + '%'} sub={(schedules.length - noShow.length) + ' dari ' + schedules.length + ' pasien hadir'} color="#059669" trend={adherenceRate >= 70 ? 5 : -8} />
              <KpiCard icon="favorite"     label="Menunggu Tanya Kabar"  value={pendingWellness.length} sub="Pasien sehat / absen panjang"           color="#7c3aed" />
            </div>

            {/* Skenario visual */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Skenario A */}
              <div style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--r12)', padding: '18px 20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>A</span>
                  Skenario A — Jadwal Kontrol Pasien
                </div>
                {[
                  { phase:'H-2', text:'Diingatkan minum obat & persiapan', color:'#0284c7' },
                  { phase:'H-1', text:'Konfirmasi hadir: Ya / Tidak / Reschedule', color:'#7c3aed' },
                  { phase:'H+0', text:'Jika tidak hadir → trigger follow-up', color:'#dc2626' },
                  { phase:'H+1', text:'Tanyakan kondisi → pilih jawaban pasien', color:'#ea580c' },
                  { phase:'✓',   text:'Reschedule / Sehat / Eskalasi / Dicatat', color:'#059669' },
                ].map((step, i, arr) => (
                  <div key={step.phase} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: step.color + '15', border: '2px solid ' + step.color + '35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: step.color }}>{step.phase}</div>
                      {i < arr.length - 1 && <div style={{ width: 2, height: 18, background: 'var(--line)', marginTop: 2 }} />}
                    </div>
                    <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{step.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skenario B */}
              <div style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--r12)', padding: '18px 20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>B</span>
                  Skenario B — Dokter Tidak Tepat Waktu
                </div>
                {[
                  { icon:'🔊', text:'Dokter request/sounding keterlambatan', color:'#ea580c' },
                  { icon:'⚙️', text:'Jamnya terlambat — pilih penanganan', color:'#d97706' },
                  { icon:'📢', text:'Notify pasien & role berkepentingan', color:'#0284c7' },
                  { icon:'📅', text:'Ikut waktu pengganti / jadwal berikut', color:'#7c3aed' },
                  { icon:'📋', text:'Reporting ke Humas & Departemen', color:'#059669' },
                ].map((step, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: step.color + '12', border: '2px solid ' + step.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{step.icon}</div>
                      {i < arr.length - 1 && <div style={{ width: 2, height: 18, background: 'var(--line)', marginTop: 2 }} />}
                    </div>
                    <div style={{ paddingTop: '4px', paddingBottom: '4px' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{step.text}</div>
                    </div>
                  </div>
                ))}
                <button className="btn sm" onClick={() => setShowDoctorDelay(true)}
                  style={{ marginTop: '14px', background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.25)', color: '#dc2626', fontWeight: 700 }}>
                  <span className="ic s">warning</span> Aktifkan Skenario B
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--r12)', padding: '16px 18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '12px' }}>Tindakan Cepat</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn sm" onClick={() => setActiveSubTab('tidak_hadir')} style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.25)', color: '#dc2626', fontWeight: 700 }}>
                  <span className="ic s">person_off</span> Lihat {noShow.length} Tidak Hadir
                </button>
                <button className="btn sm" onClick={() => setActiveSubTab('tanya_kabar')} style={{ background: 'rgba(5,150,105,0.08)', border: '1.5px solid rgba(5,150,105,0.25)', color: '#059669', fontWeight: 700 }}>
                  <span className="ic s">favorite</span> Tanya Kabar ({pendingWellness.length} Pasien)
                </button>
                <button className="btn sm" onClick={() => setActiveSubTab('jadwal')} style={{ background: 'rgba(2,132,199,0.08)', border: '1.5px solid rgba(2,132,199,0.25)', color: '#0284c7', fontWeight: 700 }}>
                  <span className="ic s">event</span> Jadwal Mendatang ({upcoming.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── JADWAL KONTROL ── */}
        {activeSubTab === 'jadwal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{upcoming.length} Jadwal Kontrol Aktif</div>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Sorted berdasarkan kedekatan jadwal</div>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--t3)', fontSize: '13px' }}>
                <span className="ic" style={{ fontSize: '40px', display: 'block', marginBottom: '8px', color: '#059669' }}>event_available</span>
                Tidak ada jadwal kontrol aktif.
              </div>
            ) : upcoming.sort((a,b) => a.scheduleDate - b.scheduleDate).map(s => (
              <ScheduleCard key={s.id} schedule={s} onRemind={!isReadOnly ? handleRemind : null} isPiiMasked={isPiiMasked} reminded={remindedIds[s.id]} />
            ))}
          </div>
        )}

        {/* ── TIDAK HADIR ── */}
        {activeSubTab === 'tidak_hadir' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{noShow.length} Pasien Tidak Hadir — Perlu Tindak Lanjut</div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--r8)', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--t3)' }}>
              {[
                { icon: 'send',               text: 'Kirim tanya kondisi via WA' },
                { icon: 'reply',              text: 'Rekam jawaban pasien' },
                { icon: 'fork_right',         text: 'Proses sesuai jawaban' },
                { icon: 'assignment_turned_in',text: 'Laporan ke Humas' },
              ].map((s, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="ic s" style={{ fontSize: '13px', color: '#dc2626' }}>{s.icon}</span>{s.text}
                  {i < 3 && <span style={{ marginLeft: '12px', color: 'var(--line)' }}>→</span>}
                </span>
              ))}
            </div>
            {noShow.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--t3)', fontSize: '13px' }}>
                <span className="ic" style={{ fontSize: '40px', display: 'block', marginBottom: '8px', color: '#059669' }}>check_circle</span>
                Tidak ada pasien yang tidak hadir hari ini. 🎉
              </div>
            ) : noShow.map(p => {
              const responded = noShowResponses[p.patientId];
              if (responded && responded !== 'RESCHEDULE') {
                const cfg = { HEALTHY: { color:'#059669', icon:'favorite', text:'Pasien menyatakan sudah sehat' }, OTHER: { color:'#6b7280', icon:'notes', text:'Alasan lain dicatat' }, WORSENING: { color:'#dc2626', icon:'emergency', text:'Kondisi memburuk — eskalasi aktif' } }[responded] || {};
                return (
                  <div key={p.id} style={{ background: 'var(--card)', border: '1.5px solid ' + cfg.color + '30', borderRadius: 'var(--r12)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PatientAvatar name={p.name} gender={p.gender} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>{isPiiMasked ? PiiMasker.maskName(p.name) : p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t3)' }}>{p.poli} · {p.doctor}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: cfg.color }}>
                      <span className="ic s">{cfg.icon}</span>{cfg.text}
                    </div>
                  </div>
                );
              }
              return <NoShowResponsePanel key={p.id} patient={p} onResponse={!isReadOnly ? handleNoShowResponse : null} isPiiMasked={isPiiMasked} />;
            })}
          </div>
        )}

        {/* ── FOLLOW-UP AKTIF ── */}
        {activeSubTab === 'followup_aktif' && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--t3)' }}>
            <span className="ic" style={{ fontSize: '48px', display: 'block', marginBottom: '12px', color: '#0284c7' }}>chat</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px' }}>Tidak Ada Follow-Up Aktif</div>
            <div style={{ fontSize: '12.5px' }}>Follow-up yang sedang menunggu respons pasien akan muncul di sini.</div>
          </div>
        )}

        {/* ── TANYA KABAR ── */}
        {activeSubTab === 'tanya_kabar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{wellnessPatients.length} Pasien Perlu Ditanya Kabar</div>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="ic s" style={{ fontSize: '13px' }}>info</span>
                Trigger: pasien dinyatakan sehat atau absen panjang tanpa keterangan
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--t3)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }} /> Dinyatakan Sehat oleh Dokter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--t3)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d97706' }} /> Absen Panjang tanpa Keterangan
              </div>
            </div>
            {wellnessPatients.map(w => (
              <WellnessCard key={w.id} patient={w} onSendWellness={!isReadOnly ? handleSendWellness : null} isPiiMasked={isPiiMasked} />
            ))}
          </div>
        )}

        {/* ── RIWAYAT ── */}
        {activeSubTab === 'riwayat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px' }}>Log Aktivitas Follow-Up — {historyLogs.length} Catatan</div>
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 'var(--r12)', overflow: 'hidden' }}>
              {historyLogs.map((log, i) => {
                const cfg = HIST_TYPE_CFG[log.type] || HIST_TYPE_CFG.REMINDER;
                return (
                  <div key={log.id} style={{ display: 'flex', gap: '14px', padding: '13px 16px', alignItems: 'flex-start', borderBottom: i < historyLogs.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '10px', background: cfg.color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="ic s" style={{ fontSize: '17px', color: cfg.color }}>{cfg.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>
                          {isPiiMasked && log.patient.includes(' ') ? PiiMasker.maskName(log.patient) : log.patient}
                        </span>
                        <span style={{ padding: '1px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 700, color: cfg.color, background: cfg.color + '12', border: '1px solid ' + cfg.color + '25' }}>{cfg.label}</span>
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{log.poli}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{log.action}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                        <span><span className="ic s" style={{ fontSize: '11px' }}>schedule</span> {log.time}</span>
                        <span><span className="ic s" style={{ fontSize: '11px' }}>person</span> {log.actor}</span>
                        <span style={{ color: log.status.includes('Sukses') ? '#059669' : 'var(--t3)', fontWeight: 600 }}>{log.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
