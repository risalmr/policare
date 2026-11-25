import { useState, useEffect } from 'react';

export function CommunityScreen({ active, accessLevel = 'ADMIN' }) {
  const isReadOnly = accessLevel === 'VIEWER';
  const [commActiveTab, setCommActiveTab] = useState('ct-semua');
  const [searchMember, setSearchMember] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [enrollerFilter, setEnrollerFilter] = useState('ALL');

  // Modals state
  const [isCreateCommOpen, setIsCreateCommOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedCommForMember, setSelectedCommForMember] = useState('c1');
  const [transferMemberModal, setTransferMemberModal] = useState(null); // member object
  const [targetTransferCommId, setTargetTransferCommId] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Initial Communities State
  const [communities, setCommunities] = useState([
    {
      id: 'c1',
      tabKey: 'ct-bumil',
      name: 'Bumil Trimester 3',
      category: 'Kehamilan & Persalinan',
      doctorDpjp: 'dr. Rina Handayani, Sp.OG',
      doctorRole: 'Dokter Spesialis Kandungan (DPJP)',
      nurseFacilitator: 'Bidan Sri Wahyuni, S.ST',
      nurseRole: 'Bidan Senior Educatress',
      membersCount: 124,
      discussionsCount: 18,
      engagement: 82,
      status: 'Aktif',
      mode: 'Rujukan Dokter',
      description: 'Wadah edukasi, persiapan tas persalinan, pemantauan ANC trimester akhir, dan latihan napas.',
      whatsappGroup: 'https://chat.whatsapp.com/BumilT3RSUDDaya',
      createdDate: '10 Jan 2026',
      icon: 'pregnant_woman',
      badgeColor: 'green'
    },
    {
      id: 'c2',
      tabKey: 'ct-alumni',
      name: 'Alumni Persalinan RSUD Daya',
      category: 'Pasca Persalinan',
      doctorDpjp: 'dr. Rina Handayani, Sp.OG',
      doctorRole: 'Dokter Spesialis Kandungan (DPJP)',
      nurseFacilitator: 'Bidan Sri Wahyuni, S.ST',
      nurseRole: 'Bidan Konselor Laktasi & Nifas',
      membersCount: 287,
      discussionsCount: 11,
      engagement: 64,
      status: 'Aktif',
      mode: 'Publik RS',
      description: 'Komunitas alumni persalinan untuk berbagi pengalaman pasca nifas, perawatan luka, dan dukungan psikologis.',
      whatsappGroup: 'https://chat.whatsapp.com/AlumniRSUDDaya',
      createdDate: '15 Feb 2026',
      icon: 'favorite',
      badgeColor: 'blue'
    },
    {
      id: 'c3',
      tabKey: 'ct-parenting',
      name: 'Parenting Club 0–2 Tahun',
      category: 'Parenting & Tumbuh Kembang',
      doctorDpjp: 'dr. Ahmad Fauzi, Sp.A',
      doctorRole: 'Dokter Spesialis Anak (DPJP)',
      nurseFacilitator: 'Ns. Ani Susanti, S.Kep',
      nurseRole: 'Perawat Tumbuh Kembang Anak',
      membersCount: 418,
      discussionsCount: 24,
      engagement: 91,
      status: 'Aktif',
      mode: 'Publik RS',
      description: 'Edukasi MPASI, stimulasi sensori anak 0-24 bulan, dan konsultasi kesehatan anak rutin.',
      whatsappGroup: 'https://chat.whatsapp.com/ParentingRSUDDaya',
      createdDate: '01 Mar 2026',
      icon: 'child_care',
      badgeColor: 'green'
    },
    {
      id: 'c4',
      tabKey: 'ct-imunisasi',
      name: 'Imunisasi Tracker Parents',
      category: 'Imunisasi & Gizi',
      doctorDpjp: 'dr. Ahmad Fauzi, Sp.A',
      doctorRole: 'Dokter Spesialis Anak (DPJP)',
      nurseFacilitator: 'Ns. Ani Susanti, S.Kep',
      nurseRole: 'Perawat Edukator Vaksinasi',
      membersCount: 196,
      discussionsCount: 8,
      engagement: 47,
      status: 'Launching',
      mode: 'Rujukan Dokter',
      description: 'Pengingat otomatis jadwal vaksinasi anak sesuai rekomendasi IDAI dan diskusi tumbuh kembang.',
      whatsappGroup: 'https://chat.whatsapp.com/ImunisasiRSUDDaya',
      createdDate: '20 Apr 2026',
      icon: 'vaccines',
      badgeColor: 'amber'
    },
    {
      id: 'c5',
      tabKey: 'ct-kronis',
      name: 'Diabetes & Preeklamsia Care',
      category: 'Penyakit Kronis & Risti',
      doctorDpjp: 'dr. Rina Handayani, Sp.OG',
      doctorRole: 'Dokter Spesialis Kandungan (DPJP)',
      nurseFacilitator: 'Bidan Nurul Hikmah, Amd.Keb',
      nurseRole: 'Bidan Case Manager Risti',
      membersCount: 64,
      discussionsCount: 14,
      engagement: 88,
      status: 'Aktif',
      mode: 'Rujukan Dokter',
      description: 'Pemantauan tekanan darah, gula darah puasa, dan nutrisi khusus kehamilan risiko tinggi.',
      whatsappGroup: 'https://chat.whatsapp.com/GDMRSUDDaya',
      createdDate: '05 Mei 2026',
      icon: 'monitor_heart',
      badgeColor: 'red'
    }
  ]);

  // Initial Members State (Populated by Doctors, Midwives, and Staff)
  const [members, setMembers] = useState([
    {
      id: 'm1',
      communityId: 'c1',
      name: 'Ny. Sari Wulandari',
      rmNumber: 'RM-882193',
      phone: '0812-4112-9801',
      addedBy: 'dr. Rina Handayani, Sp.OG',
      addedRole: 'Dokter Sp.OG',
      addedDate: '20 Mei 2026',
      medicalCondition: 'G2P1A0 (32 mgg)',
      riskLevel: 'Sedang',
      adherenceScore: 94,
      status: 'Aktif',
      notes: 'Rutin ANC 2 mingguan. Telah klaim voucher senam hamil.'
    },
    {
      id: 'm2',
      communityId: 'c1',
      name: 'Ny. Rahmawati',
      rmNumber: 'RM-883421',
      phone: '0852-9981-2234',
      addedBy: 'Bidan Sri Wahyuni, S.ST',
      addedRole: 'Bidan Senior',
      addedDate: '22 Mei 2026',
      medicalCondition: 'G1P0A0 (35 mgg)',
      riskLevel: 'Rendah',
      adherenceScore: 88,
      status: 'Aktif',
      notes: 'Ikut kelas teknik pernapasan persalinan.'
    },
    {
      id: 'm3',
      communityId: 'c1',
      name: 'Ny. Novi Yanti',
      rmNumber: 'RM-884510',
      phone: '0813-8871-0021',
      addedBy: 'dr. Rina Handayani, Sp.OG',
      addedRole: 'Dokter Sp.OG',
      addedDate: '15 Mei 2026',
      medicalCondition: 'G3P2A0 (36 mgg, Preeklamsia Ringan)',
      riskLevel: 'Tinggi',
      adherenceScore: 98,
      status: 'Aktif',
      notes: 'Monitoring TD harian via WhatsApp Sinteta & diet rendah garam.'
    },
    {
      id: 'm4',
      communityId: 'c1',
      name: 'Ny. Amalia Putri',
      rmNumber: 'RM-881023',
      phone: '0821-6677-4433',
      addedBy: 'Bidan Sri Wahyuni, S.ST',
      addedRole: 'Bidan Senior',
      addedDate: '24 Mei 2026',
      medicalCondition: 'G1P0A0 (30 mgg)',
      riskLevel: 'Rendah',
      adherenceScore: 90,
      status: 'Aktif',
      notes: 'Persiapan tas persalinan & konsultasi nutrisi.'
    },
    {
      id: 'm5',
      communityId: 'c2',
      name: 'Ny. Fitriani Anwar',
      rmNumber: 'RM-889013',
      phone: '0811-9988-7766',
      addedBy: 'dr. Rina Handayani, Sp.OG',
      addedRole: 'Dokter Sp.OG',
      addedDate: '12 Mei 2026',
      medicalCondition: 'Pasca Melahirkan SC (H+14)',
      riskLevel: 'Rendah',
      adherenceScore: 92,
      status: 'Aktif',
      notes: 'Laktasi lancar, jahitan SC kering bersih.'
    },
    {
      id: 'm6',
      communityId: 'c3',
      name: 'Ny. Mega Utami',
      rmNumber: 'RM-889014',
      phone: '0853-2211-4455',
      addedBy: 'dr. Ahmad Fauzi, Sp.A',
      addedRole: 'Dokter Sp.A',
      addedDate: '05 Mei 2026',
      medicalCondition: 'Bayi 6 Bulan (Persiapan MPASI)',
      riskLevel: 'Rendah',
      adherenceScore: 96,
      status: 'Aktif',
      notes: 'Aktif bertanya di forum diskusi MPASI.'
    },
    {
      id: 'm7',
      communityId: 'c4',
      name: 'Ny. Dewi Sartika',
      rmNumber: 'RM-886711',
      phone: '0878-1122-3344',
      addedBy: 'Ns. Ani Susanti, S.Kep',
      addedRole: 'Perawat Edukator',
      addedDate: '18 Mei 2026',
      medicalCondition: 'Bayi 4 Bulan (Vaksinasi DPT-2)',
      riskLevel: 'Rendah',
      adherenceScore: 85,
      status: 'Aktif',
      notes: 'Sudah terima jadwal pengingat vaksinasi DPT-2.'
    },
    {
      id: 'm8',
      communityId: 'c5',
      name: 'Ny. Tari Pramita',
      rmNumber: 'RM-889016',
      phone: '0812-9900-1122',
      addedBy: 'dr. Rina Handayani, Sp.OG',
      addedRole: 'Dokter Sp.OG',
      addedDate: '25 Mei 2026',
      medicalCondition: 'G2P1A0 (28 mgg, Diabetes Gestasional)',
      riskLevel: 'Tinggi',
      adherenceScore: 95,
      status: 'Aktif',
      notes: 'Lapor GDP rutin tiap Senin pagi.'
    }
  ]);

  // SIMRS Patient Database for Quick Selection
  const simrsPatients = [
    { name: 'Ny. Clarissa Dewi', rm: 'RM-889012', phone: '0812-3344-5566', condition: 'G1P0A0 (Trimester 3 - 34 Mgg)', doctor: 'dr. Rina Handayani, Sp.OG', risk: 'Rendah', defaultCommId: 'c1' },
    { name: 'Ny. Retno Hapsari', rm: 'RM-889015', phone: '0852-7788-9900', condition: 'G2P1A0 (Trimester 3 - 31 Mgg)', doctor: 'Bidan Sri Wahyuni, S.ST', risk: 'Sedang', defaultCommId: 'c1' },
    { name: 'Ny. Linda Permata', rm: 'RM-889018', phone: '0813-1122-3344', condition: 'Pasca Lahir Normal (H+5)', doctor: 'dr. Rina Handayani, Sp.OG', risk: 'Rendah', defaultCommId: 'c2' },
    { name: 'Ny. Kartika Putri', rm: 'RM-889019', phone: '0821-4455-6677', condition: 'Bayi 8 Bulan (Berat Badan Stagnan)', doctor: 'dr. Ahmad Fauzi, Sp.A', risk: 'Sedang', defaultCommId: 'c3' },
    { name: 'Ny. Hendrawati', rm: 'RM-889020', phone: '0877-8899-0011', condition: 'G3P2A0 (Preeklamsia & Hipertensi)', doctor: 'dr. Rina Handayani, Sp.OG', risk: 'Tinggi', defaultCommId: 'c5' }
  ];

  // Create Community Form State (Wajib Dokter DPJP + Bidan/Perawat Pendamping)
  const [newCommName, setNewCommName] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('Kehamilan & Persalinan');
  const [newCommDoctor, setNewCommDoctor] = useState('dr. Rina Handayani, Sp.OG');
  const [newCommDoctorRole, setNewCommDoctorRole] = useState('Dokter Spesialis Kandungan (DPJP)');
  const [newCommNurse, setNewCommNurse] = useState('Bidan Sri Wahyuni, S.ST');
  const [newCommNurseRole, setNewCommNurseRole] = useState('Bidan Senior Educatress');
  const [newCommMode, setNewCommMode] = useState('Rujukan Dokter');
  const [newCommQuota, setNewCommQuota] = useState('250');
  const [newCommWaLink, setNewCommWaLink] = useState('https://chat.whatsapp.com/KomunitasRSUDDaya');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommAutoWa, setNewCommAutoWa] = useState(true);

  // Add Member Form State
  const [memberSourceMode, setMemberSourceMode] = useState('SIMRS'); // 'SIMRS' or 'MANUAL'
  const [selectedSimrsPatient, setSelectedSimrsPatient] = useState(simrsPatients[0]);
  const [inputMemberName, setInputMemberName] = useState('');
  const [inputMemberRm, setInputMemberRm] = useState('');
  const [inputMemberPhone, setInputMemberPhone] = useState('');
  const [inputMemberCondition, setInputMemberCondition] = useState('');
  const [inputMemberRisk, setInputMemberRisk] = useState('Rendah');
  const [inputMemberEnroller, setInputMemberEnroller] = useState('dr. Rina Handayani, Sp.OG');
  const [inputMemberNotes, setInputMemberNotes] = useState('');
  const [sendWaInvitation, setSendWaInvitation] = useState(true);

  // Helper Toast trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Create Community Handler
  const handleCreateCommunity = (e) => {
    e.preventDefault();
    if (!newCommName.trim()) {
      alert('Nama komunitas harus diisi!');
      return;
    }
    if (!newCommDoctor || !newCommNurse) {
      alert('Komunitas wajib memiliki minimal 1 Dokter Penanggung Jawab (DPJP) dan 1 Perawat/Bidan Pendamping!');
      return;
    }
    const newId = `c${communities.length + 1}`;
    const newTabKey = `ct-custom-${newId}`;
    const createdObj = {
      id: newId,
      tabKey: newTabKey,
      name: newCommName,
      category: newCommCategory,
      doctorDpjp: newCommDoctor,
      doctorRole: newCommDoctorRole,
      nurseFacilitator: newCommNurse,
      nurseRole: newCommNurseRole,
      membersCount: 0,
      discussionsCount: 0,
      engagement: 100,
      status: 'Aktif',
      mode: newCommMode,
      description: newCommDesc || 'Komunitas baru yang dibina oleh tim medis RSUD Daya.',
      whatsappGroup: newCommWaLink,
      createdDate: 'Hari ini',
      icon: newCommCategory.includes('Kehamilan') ? 'pregnant_woman' : newCommCategory.includes('Anak') ? 'child_care' : 'groups',
      badgeColor: 'loy'
    };

    setCommunities([...communities, createdObj]);
    setIsCreateCommOpen(false);
    setCommActiveTab(newTabKey);
    showToast(`🎉 Komunitas "${newCommName}" berhasil dibuat! Pembina: ${newCommDoctor} & ${newCommNurse}`);
    // Reset
    setNewCommName('');
    setNewCommDesc('');
  };

  // Add Member Handler
  const handleAddMember = (e) => {
    e.preventDefault();
    let name = '', rm = '', phone = '', condition = '', risk = 'Rendah';

    if (memberSourceMode === 'SIMRS') {
      name = selectedSimrsPatient.name;
      rm = selectedSimrsPatient.rm;
      phone = selectedSimrsPatient.phone;
      condition = selectedSimrsPatient.condition;
      risk = selectedSimrsPatient.risk;
    } else {
      if (!inputMemberName.trim() || !inputMemberRm.trim()) {
        alert('Nama Pasien dan No. RM wajib diisi!');
        return;
      }
      name = inputMemberName;
      rm = inputMemberRm;
      phone = inputMemberPhone || '0812-0000-1111';
      condition = inputMemberCondition || 'Pasien Umum / Rujukan Medis';
      risk = inputMemberRisk;
    }

    const newMemObj = {
      id: `m${members.length + 1}`,
      communityId: selectedCommForMember,
      name,
      rmNumber: rm,
      phone,
      addedBy: inputMemberEnroller,
      addedRole: inputMemberEnroller.includes('dr.') ? 'Dokter Spesialis' : inputMemberEnroller.includes('Bidan') ? 'Bidan Senior' : 'Petugas Medis',
      addedDate: 'Hari ini',
      medicalCondition: condition,
      riskLevel: risk,
      adherenceScore: 90,
      status: 'Aktif',
      notes: inputMemberNotes || 'Member baru di-assign oleh user.'
    };

    // Append member
    setMembers([newMemObj, ...members]);

    // Update community count
    setCommunities(communities.map(c => c.id === selectedCommForMember ? { ...c, membersCount: c.membersCount + 1 } : c));

    setIsAddMemberOpen(false);
    const targetCommName = communities.find(c => c.id === selectedCommForMember)?.name || 'Komunitas';
    showToast(`✅ Pasien ${name} (${rm}) berhasil dimasukkan ke ${targetCommName} oleh ${inputMemberEnroller}! ${sendWaInvitation ? 'Undangan WA terkirim 📲' : ''}`);

    // Reset manual input
    setInputMemberName('');
    setInputMemberRm('');
    setInputMemberPhone('');
    setInputMemberCondition('');
    setInputMemberNotes('');
  };

  // Transfer Member Handler
  const handleTransferMember = () => {
    if (!transferMemberModal || !targetTransferCommId) return;
    const oldComm = communities.find(c => c.id === transferMemberModal.communityId);
    const newComm = communities.find(c => c.id === targetTransferCommId);

    setMembers(members.map(m => m.id === transferMemberModal.id ? { ...m, communityId: targetTransferCommId, notes: `Dipindahkan dari ${oldComm?.name || ''} ke ${newComm?.name || ''}` } : m));

    setCommunities(communities.map(c => {
      if (c.id === transferMemberModal.communityId) return { ...c, membersCount: Math.max(0, c.membersCount - 1) };
      if (c.id === targetTransferCommId) return { ...c, membersCount: c.membersCount + 1 };
      return c;
    }));

    showToast(`🔄 Member ${transferMemberModal.name} berhasil dipindahkan ke ${newComm?.name}!`);
    setTransferMemberModal(null);
  };

  // Remove Member Handler
  const handleRemoveMember = (memId, memName) => {
    if (confirm(`Apakah Anda yakin ingin mengeluarkan ${memName} dari komunitas ini?`)) {
      const targetMem = members.find(m => m.id === memId);
      if (targetMem) {
        setCommunities(communities.map(c => c.id === targetMem.communityId ? { ...c, membersCount: Math.max(0, c.membersCount - 1) } : c));
      }
      setMembers(members.filter(m => m.id !== memId));
      showToast(`🗑️ ${memName} telah dikeluarkan dari komunitas.`);
    }
  };

  // Filtered members calculation for current active view
  const currentCommObj = communities.find(c => c.tabKey === commActiveTab) || (commActiveTab === 'ct-semua' ? null : communities[0]);

  const displayedMembers = members.filter(m => {
    if (commActiveTab !== 'ct-semua' && currentCommObj && m.communityId !== currentCommObj.id) return false;
    if (searchMember) {
      const q = searchMember.toLowerCase();
      const match = m.name.toLowerCase().includes(q) || m.rmNumber.toLowerCase().includes(q) || m.medicalCondition.toLowerCase().includes(q) || m.addedBy.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (riskFilter !== 'ALL' && m.riskLevel !== riskFilter) return false;
    if (enrollerFilter !== 'ALL' && !m.addedBy.includes(enrollerFilter)) return false;
    return true;
  });

  const totalMembersCount = members.length;
  const activeDiscussionsCount = communities.reduce((acc, c) => acc + c.discussionsCount, 0);

  if (!active) return null;

  return (
    <div className="screen on" id="s-community">
      {/* Toast Banner */}
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

      {/* HEADER PAGE */}
      <div className="ph">
        <div className="ph-text">
          <h2>Komunitas Pasien</h2>
          <p>Kelola grup komunitas, tambah anggota oleh dokter &amp; staf medis, dan pantau partisipasi pasien.</p>
        </div>
        <div className="ph-act" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isReadOnly ? (
            <>
              <button className="btn ghost" onClick={() => { setSelectedCommForMember(communities[0].id); setIsAddMemberOpen(true); }}>
                <span className="ic s">person_add</span>Tambah Anggota
              </button>
              <button className="btn pri" onClick={() => setIsCreateCommOpen(true)}>
                <span className="ic s">group_add</span>Buat Komunitas
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
          <span className="ic s" style={{ color: 'var(--blue)', fontSize: '20px' }}>groups</span>
          <div style={{ fontSize: '12px', color: 'var(--t1)', lineHeight: 1.4 }}>
            <strong>Mode Pemonitor Eksekutif (Pimpinan RS):</strong> Anda dapat memantau seluruh komunitas pasien, anggota, dokter DPJP penanggung jawab, serta tingkat engagement. Penambahan komunitas dan penambahan anggota baru dilakukan oleh <strong>Yanmas/Humas</strong> atau <strong>Promkes</strong>.
          </div>
        </div>
      )}

      {/* KEY METRICS STRIP */}
      <div className="kstrip k4">
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic">groups</span></div>
          <div className="kcard-lbl">Komunitas Aktif</div>
          <div className="kcard-v">{communities.length}</div>
          <div className="kcard-d up"><span className="ic s">add_circle</span>Semua berjalan bulan ini</div>
        </div>
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic">person</span></div>
          <div className="kcard-lbl">Total Anggota</div>
          <div className="kcard-v">{1800 + totalMembersCount}</div>
          <div className="kcard-d up"><span className="ic s">trending_up</span>{members.length} ditambah dokter</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic">forum</span></div>
          <div className="kcard-lbl">Diskusi Aktif</div>
          <div className="kcard-v">{activeDiscussionsCount}</div>
          <div className="kcard-d fl">Minggu ini</div>
        </div>
        <div className="kcard kl">
          <div className="kcard-ic"><span className="ic">health_and_safety</span></div>
          <div className="kcard-lbl">Via Rujukan Dokter</div>
          <div className="kcard-v">94<small>%</small></div>
          <div className="kcard-d up">Bergabung atas rekomendasi</div>
        </div>
      </div>

      {/* COMMUNITY TABS */}
      <div className="tabs" id="comm-tabs" style={{ flexWrap: 'wrap' }}>
        <button className={`tab ${commActiveTab === 'ct-semua' ? 'on' : ''}`} onClick={() => setCommActiveTab('ct-semua')}>
          <span className="ic s">grid_view</span>Semua Komunitas ({communities.length})
        </button>

        {communities.map(c => (
          <button key={c.id} className={`tab ${commActiveTab === c.tabKey ? 'on' : ''}`} onClick={() => setCommActiveTab(c.tabKey)}>
            <span className="ic s">{c.icon}</span>
            {c.name}
            <span style={{
              background: c.badgeColor === 'green' ? 'var(--green)' : c.badgeColor === 'red' ? 'var(--red)' : c.badgeColor === 'amber' ? 'var(--amber)' : 'var(--blue)',
              color: '#fff',
              padding: '1px 7px',
              borderRadius: 'var(--rf)',
              fontSize: '10.5px',
              fontWeight: '700',
              marginLeft: '4px'
            }}>
              {c.membersCount}
            </span>
          </button>
        ))}
      </div>

      {/* VIEW: SEMUA KOMUNITAS OVERVIEW */}
      {commActiveTab === 'ct-semua' && (
        <div id="ct-semua" className="comm-panel cp-on">
          <div className="g21">
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l">
                  <div className="card-title">Komunitas &amp; Tim Medis Pembina</div>
                  <div className="card-sub">Setiap komunitas dibina oleh Dokter Penanggung Jawab (DPJP) &amp; Perawat/Bidan Pendamping</div>
                </div>
              </div>

              <table className="tbl">
                <thead>
                  <tr>
                    <th>Komunitas &amp; Tim Medis</th>
                    <th>Akses</th>
                    <th>Anggota</th>
                    <th>Diskusi</th>
                    <th>Partisipasi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="td1" style={{ fontWeight: 600, color: 'var(--t1)' }}>{c.name}</div>
                        <div className="td2" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--blue)' }}>
                            <span className="ic s" style={{ fontSize: '13px' }}>medical_services</span>
                            <span><strong>DPJP:</strong> {c.doctorDpjp || c.facilitator}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--t3)' }}>
                            <span className="ic s" style={{ fontSize: '13px', color: 'var(--green)' }}>person</span>
                            <span><strong>Pendamping:</strong> {c.nurseFacilitator || 'Bidan RSUD Daya'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`bdg ${c.mode === 'Rujukan Dokter' ? 'b' : c.mode === 'Publik RS' ? 'g' : 'loy'}`}>
                          {c.mode}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{c.membersCount} pasien</div>
                      </td>
                      <td>{c.discussionsCount} topik</td>
                      <td>
                        <div style={{ width: '65px' }}>
                          <div className="bar">
                            <div className={`bf ${c.engagement >= 80 ? 'bfg' : c.engagement >= 60 ? 'bfb' : 'bfa'}`} style={{ width: `${c.engagement}%` }}></div>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px', fontWeight: 600 }}>{c.engagement}%</div>
                        </div>
                      </td>
                      <td>
                        <span className={`bdg ${c.status === 'Aktif' ? 'g' : 'a'}`}>
                          <span className="pdot"></span>{c.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {!isReadOnly && (
                            <button className="btn ghost xs" title="Tambah anggota ke komunitas ini" onClick={() => { setSelectedCommForMember(c.id); setIsAddMemberOpen(true); }}>
                              <span className="ic s">person_add</span> Tambah
                            </button>
                          )}
                          <button className="btn ghost xs" onClick={() => setCommActiveTab(c.tabKey)}>
                            Lihat →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SIDE PANEL: RECENT ENROLMENT LOG & SINTETA SIGNAL */}
            <div className="col">
              {/* Card Pengisian Member oleh User */}
              <div className="card">
                <div className="card-hd">
                  <div className="card-hd-l">
                    <div className="card-title">
                      <span className="ic s" style={{ color: 'var(--blue)' }}>badge</span> Log Pengisian Member Terbaru
                    </div>
                    <div className="card-sub">Enrolment oleh Dokter &amp; Tim Medis</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {members.slice(0, 4).map(m => {
                    const c = communities.find(comm => comm.id === m.communityId);
                    return (
                      <div key={m.id} style={{ padding: '10px 12px', borderRadius: 'var(--r8)', background: 'var(--srf2)', border: '1px solid var(--line)', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span style={{ color: 'var(--t1)' }}>{m.name} ({m.rmNumber})</span>
                          <span className={`bdg ${m.riskLevel === 'Tinggi' ? 'r' : m.riskLevel === 'Sedang' ? 'a' : 'g'}`} style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                            {m.riskLevel}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>
                          Komunitas: <strong>{c?.name}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--blue)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span className="ic s">person</span> Di-assign oleh: <strong>{m.addedBy}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card AI Signal */}
              <div className="card">
                <div className="card-hd">
                  <div className="card-hd-l">
                    <div className="card-title">
                      <span className="ic s" style={{ color: 'var(--loy)' }}>smart_toy</span> Sinteta AI Insight
                    </div>
                  </div>
                </div>
                <div className="ab loy">
                  <div className="ab-hd">Auto-Enrol Pasien HPL Trimester 3</div>
                  <div className="ab-body">
                    Terdapat 5 pasien Poli Obgyn dengan HPL &lt; 30 Hari yang belum masuk ke Komunitas Bumil T3. Rekomendasikan pendaftaran otomatis?
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '7px', marginTop: '9px' }}>
                  <button className="btn loy" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                    // Auto batch add sample
                    const countAdded = simrsPatients.length;
                    showToast(`⚡ Sinteta AI berhasil me-referensikan ${countAdded} pasien dari SIMRS ke Komunitas Bumil T3!`);
                  }}>
                    <span className="ic s">auto_awesome</span> Enrol Semua ({simrsPatients.length} Pasien)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SPECIFIC COMMUNITY DETAIL & MEMBER ROSTER */}
      {commActiveTab !== 'ct-semua' && currentCommObj && (
        <div className="comm-panel cp-on">
          <div className="g21" style={{ marginBottom: '16px' }}>
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-hd">
                <div className="card-hd-l">
                  <div className="card-title" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="ic" style={{ color: 'var(--blue)' }}>{currentCommObj.icon}</span>
                    {currentCommObj.name}
                  </div>
                  <div className="card-sub" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span>👨‍⚕️ <strong>Dokter DPJP:</strong> {currentCommObj.doctorDpjp || currentCommObj.facilitator} ({currentCommObj.doctorRole || 'Dokter Spesialis'})</span>
                    <span>👩‍⚕️ <strong>Perawat/Bidan:</strong> {currentCommObj.nurseFacilitator || 'Bidan Edukator RSUD Daya'} ({currentCommObj.nurseRole || 'Edukator Medis'})</span>
                    <span>🔒 <strong>Mode:</strong> {currentCommObj.mode}</span>
                  </div>
                </div>
                <div className="card-hd-r">
                  <span className={`bdg ${currentCommObj.status === 'Aktif' ? 'g' : 'a'}`}>
                    <span className="pdot"></span>{currentCommObj.status}
                  </span>
                  {!isReadOnly && (
                    <button className="btn pri sm" onClick={() => { setSelectedCommForMember(currentCommObj.id); setIsAddMemberOpen(true); }}>
                      <span className="ic s">person_add</span> Enrol Member Baru
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', background: 'var(--srf2)', padding: '12px 14px', borderRadius: 'var(--r8)', border: '1px solid var(--line)', marginBottom: '14px' }}>
                <div className="mp" style={{ flex: 1 }}>
                  <div className="v">{currentCommObj.membersCount}</div>
                  <div className="l">Total Anggota</div>
                </div>
                <div className="mp" style={{ flex: 1 }}>
                  <div className="v" style={{ color: 'var(--green)' }}>{currentCommObj.engagement}%</div>
                  <div className="l">Engagement Rate</div>
                </div>
                <div className="mp" style={{ flex: 1 }}>
                  <div className="v" style={{ color: 'var(--blue)' }}>{currentCommObj.discussionsCount}</div>
                  <div className="l">Diskusi Mingguan</div>
                </div>
                <div className="mp" style={{ flex: 1 }}>
                  <div className="v" style={{ color: 'var(--loy)' }}>94%</div>
                  <div className="l">Adherence ANC / Kontrol</div>
                </div>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--t2)', lineHeight: '1.5' }}>
                {currentCommObj.description}
              </p>
            </div>
          </div>

          {/* MEMBER ROSTER & ENROLLMENT SECTION */}
          <div className="card">
            <div className="card-hd" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <div className="card-hd-l">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s" style={{ color: 'var(--blue)' }}>badge</span>
                  Daftar Pasien &amp; Member Terdaftar ({displayedMembers.length})
                </div>
                <div className="card-sub">Dipantau dan di-assign oleh User/Dokter Penanggung Jawab</div>
              </div>

              {/* FILTERS & SEARCH */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <input
                  type="text"
                  placeholder="Cari nama pasien / RM / dokter..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--r6)',
                    border: '1px solid var(--line)',
                    background: 'var(--srf)',
                    fontSize: '12px',
                    width: '210px'
                  }}
                />

                {/* Filter Risk */}
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)' }}>
                  <option value="ALL">Semua Tingkat Risiko</option>
                  <option value="Rendah">Risiko Rendah</option>
                  <option value="Sedang">Risiko Sedang</option>
                  <option value="Tinggi">Risiko Tinggi</option>
                </select>

                {/* Filter Enroller */}
                <select
                  value={enrollerFilter}
                  onChange={(e) => setEnrollerFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)' }}>
                  <option value="ALL">Semua Dokter / Staff</option>
                  <option value="dr. Rina">dr. Rina Handayani</option>
                  <option value="Bidan Sri">Bidan Sri Wahyuni</option>
                  <option value="dr. Ahmad">dr. Ahmad Fauzi</option>
                </select>

                {!isReadOnly && (
                  <button className="btn pri sm" onClick={() => { setSelectedCommForMember(currentCommObj.id); setIsAddMemberOpen(true); }}>
                    <span className="ic s">person_add</span> Enrol Pasien
                  </button>
                )}
              </div>
            </div>

            {/* MEMBER TABLE */}
            {displayedMembers.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--t3)' }}>
                <span className="ic l" style={{ fontSize: '36px', marginBottom: '8px' }}>search_off</span>
                <div>Belum ada member pasien yang cocok dengan pencarian / filter ini.</div>
                <button className="btn ghost sm" style={{ marginTop: '10px' }} onClick={() => { setSearchMember(''); setRiskFilter('ALL'); setEnrollerFilter('ALL'); }}>
                  Reset Filter
                </button>
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Pasien &amp; No. RM</th>
                    <th>Kondisi Medis &amp; Risiko</th>
                    <th>Di-assign Oleh (User)</th>
                    <th>Tgl Masuk</th>
                    <th>Adherence</th>
                    <th>Status</th>
                    <th>Aksi Management</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMembers.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: m.riskLevel === 'Tinggi' ? 'var(--red-s)' : 'var(--blue-s)',
                            color: m.riskLevel === 'Tinggi' ? 'var(--red)' : 'var(--blue)',
                            fontWeight: '700',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="td1" style={{ fontWeight: 600, color: 'var(--t1)' }}>{m.name}</div>
                            <div className="td2" style={{ fontSize: '11px', color: 'var(--t3)' }}>{m.rmNumber} · 📲 {m.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{m.medicalCondition}</div>
                        <div style={{ marginTop: '2px' }}>
                          <span className={`bdg ${m.riskLevel === 'Tinggi' ? 'r' : m.riskLevel === 'Sedang' ? 'a' : 'g'}`} style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                            Risiko {m.riskLevel}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue)' }}>{m.addedBy}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>{m.addedRole}</div>
                      </td>
                      <td>{m.addedDate}</td>
                      <td>
                        <div style={{ width: '70px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>
                            <span>Kepatuhan</span>
                            <span>{m.adherenceScore}%</span>
                          </div>
                          <div className="bar">
                            <div className={`bf ${m.adherenceScore >= 90 ? 'bfg' : 'bfb'}`} style={{ width: `${m.adherenceScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="bdg g"><span className="pdot"></span>{m.status}</span>
                      </td>
                      <td>
                        {!isReadOnly ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="btn ghost xs ico"
                              title="Kirim pesan WA"
                              onClick={() => alert(`📱 Mengirim WhatsApp pengingat / chat ke ${m.name} (${m.phone})`)}>
                              <span className="ic s" style={{ color: '#10b981' }}>chat</span>
                            </button>
                            <button
                              className="btn ghost xs ico"
                              title="Pindahkan ke komunitas lain"
                              onClick={() => { setTransferMemberModal(m); setTargetTransferCommId(communities.find(c => c.id !== m.communityId)?.id || ''); }}>
                              <span className="ic s" style={{ color: 'var(--blue)' }}>swap_horiz</span>
                            </button>
                            <button
                              className="btn ghost xs ico"
                              title="Keluarkan member"
                              onClick={() => handleRemoveMember(m.id, m.name)}>
                              <span className="ic s" style={{ color: 'var(--red)' }}>delete</span>
                            </button>
                          </div>
                        ) : (
                          <span className="bdg n" style={{ fontSize: '10px' }}>👁️ Pantau</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: BUAT KOMUNITAS BARU */}
      {isCreateCommOpen && (
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
            maxWidth: '560px',
            boxShadow: 'var(--sh2)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            animation: 'fadeup-demo .2s ease'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--srf2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic l" style={{ color: 'var(--blue)' }}>group_add</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--t1)' }}>Buat Komunitas Pasien Baru</h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Rancang grup komunitas untuk meningkatkan kepatuhan &amp; akuisisi pasien</div>
                </div>
              </div>
              <button className="btn ghost xs ico" onClick={() => setIsCreateCommOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCommunity} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>Nama Komunitas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Komunitas Ibu Menyusui & Laktasi"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>Kategori Medis</label>
                  <select
                    value={newCommCategory}
                    onChange={(e) => setNewCommCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)' }}>
                    <option value="Kehamilan & Persalinan">Kehamilan &amp; Persalinan</option>
                    <option value="Pasca Persalinan">Pasca Persalinan / Nifas</option>
                    <option value="Parenting & Tumbuh Kembang">Parenting &amp; Tumbuh Kembang</option>
                    <option value="Imunisasi & Gizi">Imunisasi &amp; Gizi</option>
                    <option value="Penyakit Kronis & Risti">Penyakit Kronis &amp; Risti</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>Mode Akses</label>
                  <select
                    value={newCommMode}
                    onChange={(e) => setNewCommMode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)' }}>
                    <option value="Rujukan Dokter">Rujukan Dokter / Tim Medis</option>
                    <option value="Publik RS">Publik Pasien RSUD Daya</option>
                    <option value="Privat (Undangan Khusus)">Privat (Undangan Khusus)</option>
                  </select>
                </div>
              </div>

              {/* Dual Facilitator Selection (Dokter DPJP + Perawat/Bidan Pendamping) */}
              <div style={{ border: '1.5px solid var(--blue-m)', borderRadius: 'var(--r8)', padding: '14px', background: 'var(--blue-s)' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--t1)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s" style={{ color: 'var(--blue)' }}>verified_user</span> Tim Medis Pembina Komunitas (Wajib Minimal 1 Dokter &amp; 1 Perawat/Bidan)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--t3)', marginBottom: '10px' }}>
                  Sesuai standar operasional RSUD Daya, setiap komunitas pasien harus didampingi oleh Dokter Penanggung Jawab (DPJP) dan Perawat/Bidan fasilitator.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* 1. Dokter DPJP */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--blue)', marginBottom: '4px' }}>
                      1. Dokter Penanggung Jawab (DPJP) *
                    </label>
                    <select
                      value={newCommDoctor}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewCommDoctor(val);
                        if (val.includes('Rina')) setNewCommDoctorRole('Dokter Spesialis Kandungan (DPJP)');
                        else if (val.includes('Ahmad')) setNewCommDoctorRole('Dokter Spesialis Anak (DPJP)');
                        else if (val.includes('Syarif')) setNewCommDoctorRole('Dokter Spesialis Penyakit Dalam (DPJP)');
                        else setNewCommDoctorRole('Dokter Penanggung Jawab Pelayanan (DPJP)');
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)', fontWeight: 600 }}>
                      <option value="dr. Rina Handayani, Sp.OG">dr. Rina Handayani, Sp.OG (Obgyn)</option>
                      <option value="dr. Ahmad Fauzi, Sp.A">dr. Ahmad Fauzi, Sp.A (Anak)</option>
                      <option value="dr. H. Syarif, Sp.PD">dr. H. Syarif, Sp.PD (Penyakit Dalam)</option>
                      <option value="dr. Ratna Kusuma, Sp.A">dr. Ratna Kusuma, Sp.A (Direktur / Konsulen)</option>
                    </select>
                  </div>

                  {/* 2. Perawat / Bidan Pendamping */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--green)', marginBottom: '4px' }}>
                      2. Perawat / Bidan Pendamping *
                    </label>
                    <select
                      value={newCommNurse}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewCommNurse(val);
                        if (val.includes('Sri')) setNewCommNurseRole('Bidan Senior Educatress');
                        else if (val.includes('Ani')) setNewCommNurseRole('Perawat Edukator Medis');
                        else if (val.includes('Nurul')) setNewCommNurseRole('Bidan Case Manager Risti');
                        else setNewCommNurseRole('Perawat Pendamping Pasien');
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)', fontWeight: 600 }}>
                      <option value="Bidan Sri Wahyuni, S.ST">Bidan Sri Wahyuni, S.ST (Educatress)</option>
                      <option value="Ns. Ani Susanti, S.Kep">Ns. Ani Susanti, S.Kep (Perawat Edukator)</option>
                      <option value="Bidan Nurul Hikmah, Amd.Keb">Bidan Nurul Hikmah, Amd.Keb (Case Manager)</option>
                      <option value="Ns. Hendra Wijaya, S.Kep">Ns. Hendra Wijaya, S.Kep (Koordinator Poli)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--t3)', marginBottom: '3px' }}>Target Kuota Pasien</label>
                  <input
                    type="number"
                    value={newCommQuota}
                    onChange={(e) => setNewCommQuota(e.target.value)}
                    style={{ width: '120px', padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>Link Group WhatsApp / Kanal Policare</label>
                <input
                  type="text"
                  value={newCommWaLink}
                  onChange={(e) => setNewCommWaLink(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>Deskripsi &amp; Tujuan Komunitas</label>
                <textarea
                  rows="2"
                  placeholder="Tuliskan tujuan dan aturan komunitas..."
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--r8)', background: 'var(--blue-s)' }}>
                <input
                  type="checkbox"
                  id="auto-wa-check"
                  checked={newCommAutoWa}
                  onChange={(e) => setNewCommAutoWa(e.target.checked)}
                />
                <label htmlFor="auto-wa-check" style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>
                  Kirim pesan WhatsApp selamat datang otomatis kepada pasien yang di-assign oleh Dokter
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost" onClick={() => setIsCreateCommOpen(false)}>Batal</button>
                <button type="submit" className="btn pri">
                  <span className="ic s">check</span> Buat Komunitas Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PENGISIAN MEMBER OLEH USER (DOKTER / STAFF) */}
      {isAddMemberOpen && (
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
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--srf2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic l" style={{ color: 'var(--blue)' }}>person_add</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--t1)' }}>Pengisian Member / Enrol Pasien oleh Dokter/User</h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>Masukkan pasien ke grup komunitas sesuai kondisi medis &amp; rujukan dokter</div>
                </div>
              </div>
              <button className="btn ghost xs ico" onClick={() => setIsAddMemberOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddMember} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>

              {/* TARGET COMMUNITY SELECT */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t1)', marginBottom: '4px' }}>
                  Target Komunitas Pasien *
                </label>
                <select
                  value={selectedCommForMember}
                  onChange={(e) => setSelectedCommForMember(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r8)', border: '1.5px solid var(--blue-m)', fontSize: '13px', fontWeight: 600, background: 'var(--srf)' }}>
                  {communities.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category}) — Dipandu: {c.facilitator}
                    </option>
                  ))}
                </select>
              </div>

              {/* SOURCE METHOD TAB */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                <button
                  type="button"
                  className={`btn ${memberSourceMode === 'SIMRS' ? 'pri' : 'ghost'} sm`}
                  onClick={() => setMemberSourceMode('SIMRS')}>
                  <span className="ic s">dataset</span> Pilih dari SIMRS RSUD Daya (Poli/Rawat)
                </button>
                <button
                  type="button"
                  className={`btn ${memberSourceMode === 'MANUAL' ? 'pri' : 'ghost'} sm`}
                  onClick={() => setMemberSourceMode('MANUAL')}>
                  <span className="ic s">edit_note</span> Input Pasien Baru Manual
                </button>
              </div>

              {/* MODE A: SIMRS PATIENT SELECT */}
              {memberSourceMode === 'SIMRS' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--t3)', marginBottom: '6px' }}>
                    PILIH PASIEN REKOMENDASI SIMRS HARI INI:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {simrsPatients.map((sp, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedSimrsPatient(sp)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--r8)',
                          border: selectedSimrsPatient.rm === sp.rm ? '2px solid var(--blue)' : '1px solid var(--line)',
                          background: selectedSimrsPatient.rm === sp.rm ? 'var(--blue-s)' : 'var(--srf2)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--t1)' }}>
                            {sp.name} <span style={{ fontSize: '11px', color: 'var(--t3)' }}>({sp.rm})</span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginTop: '2px' }}>
                            Kondisi: <strong>{sp.condition}</strong>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--blue)', marginTop: '2px' }}>
                            Dokter Penanggung Jawab: {sp.doctor}
                          </div>
                        </div>
                        <span className={`bdg ${sp.risk === 'Tinggi' ? 'r' : sp.risk === 'Sedang' ? 'a' : 'g'}`}>
                          {sp.risk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE B: MANUAL INPUT */}
              {memberSourceMode === 'MANUAL' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '3px' }}>Nama Lengkap Pasien *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Ny. Clarissa"
                        value={inputMemberName}
                        onChange={(e) => setInputMemberName(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '3px' }}>No. Rekam Medis (RM) *</label>
                      <input
                        type="text"
                        placeholder="Contoh: RM-889099"
                        value={inputMemberRm}
                        onChange={(e) => setInputMemberRm(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '3px' }}>No. WhatsApp / HP</label>
                      <input
                        type="text"
                        placeholder="0812-xxxx-xxxx"
                        value={inputMemberPhone}
                        onChange={(e) => setInputMemberPhone(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '3px' }}>Tingkat Risiko Medis</label>
                      <select
                        value={inputMemberRisk}
                        onChange={(e) => setInputMemberRisk(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)' }}>
                        <option value="Rendah">Risiko Rendah</option>
                        <option value="Sedang">Risiko Sedang</option>
                        <option value="Tinggi">Risiko Tinggi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '3px' }}>Diagnosa / Kondisi Medis Pasien</label>
                    <input
                      type="text"
                      placeholder="Contoh: G2P1A0 32 Mgg / Preeklamsia / Post-Op SC"
                      value={inputMemberCondition}
                      onChange={(e) => setInputMemberCondition(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                    />
                  </div>
                </div>
              )}

              {/* USER / DOKTER ENROLLER SELECTION */}
              <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r8)', padding: '12px', background: 'var(--srf2)' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t1)', marginBottom: '4px' }}>
                  Di-assign oleh User / Dokter Siapa? *
                </label>
                <select
                  value={inputMemberEnroller}
                  onChange={(e) => setInputMemberEnroller(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px', background: 'var(--srf)', fontWeight: 600 }}>
                  <option value="dr. Rina Handayani, Sp.OG">dr. Rina Handayani, Sp.OG (Dokter Spesialis Kandungan)</option>
                  <option value="Bidan Sri Wahyuni, S.ST">Bidan Sri Wahyuni, S.ST (Bidan Edukator)</option>
                  <option value="dr. Ahmad Fauzi, Sp.A">dr. Ahmad Fauzi, Sp.A (Dokter Spesialis Anak)</option>
                  <option value="Ns. Ani Susanti, S.Kep">Ns. Ani Susanti, S.Kep (Perawat Edukator)</option>
                  <option value="Admin CS Policare RSUD Daya">Admin CS Policare RSUD Daya</option>
                </select>

                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--t3)', marginBottom: '3px' }}>Catatan Rekomendasi Medis Dokter</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pantau tekanan darah & ingatkan jadwal ANC 2 minggu lagi"
                    value={inputMemberNotes}
                    onChange={(e) => setInputMemberNotes(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* WA INVITATION CHECKBOX & PREVIEW */}
              <div style={{ padding: '10px', borderRadius: 'var(--r8)', background: 'var(--green-s)', border: '1px solid var(--green-m)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="wa-invite-check"
                    checked={sendWaInvitation}
                    onChange={(e) => setSendWaInvitation(e.target.checked)}
                  />
                  <label htmlFor="wa-invite-check" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--green)', cursor: 'pointer' }}>
                    Kirim Pesan WhatsApp Undangan Otomatis ke Pasien
                  </label>
                </div>
                {sendWaInvitation && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--t2)', background: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: '6px', fontStyle: 'italic' }}>
                    "Halo Ibu {memberSourceMode === 'SIMRS' ? selectedSimrsPatient.name : (inputMemberName || '[Nama Pasien]')}, {inputMemberEnroller} telah me-referensikan Anda ke Komunitas Pasien RSUD Daya. Silakan bergabung..."
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost" onClick={() => setIsAddMemberOpen(false)}>Batal</button>
                <button type="submit" className="btn pri">
                  <span className="ic s">check</span> Masukkan Member Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRANSFER MEMBER (PINDAHKAN KOMUNITAS) */}
      {transferMemberModal && (
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
            maxWidth: '460px',
            boxShadow: 'var(--sh2)',
            border: '1px solid var(--line)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span className="ic l" style={{ color: 'var(--blue)' }}>swap_horiz</span>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--t1)' }}>Pindahkan Komunitas Pasien</h3>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--t2)', marginBottom: '14px' }}>
              Pindahkan pasien <strong>{transferMemberModal.name}</strong> ({transferMemberModal.rmNumber}) ke grup komunitas baru (misalnya pasca melahirkan atau naik jenjang).
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>Pilih Komunitas Tujuan *</label>
              <select
                value={targetTransferCommId}
                onChange={(e) => setTargetTransferCommId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r8)', border: '1px solid var(--line)', fontSize: '13px', background: 'var(--srf)' }}>
                {communities.filter(c => c.id !== transferMemberModal.communityId).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
              <button className="btn ghost" onClick={() => setTransferMemberModal(null)}>Batal</button>
              <button className="btn pri" onClick={handleTransferMember}>
                <span className="ic s">check</span> Konfirmasi Pindah Komunitas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MarketScreen({ active }) {
  if (!active) return null;
  return (
    <div className="screen on" id="s-market">
      <div className="ph">
        <div className="ph-text"><h2>Intelijen Pasar</h2><p>Data pasar, kompetitor, dan peluang strategis — otomatis dari Sinteta.</p></div>
        <div className="ph-act"><button className="btn pri" onClick={() => alert('Refreshing insights...')}><span className="ic s">refresh</span>Refresh Insight</button></div>
      </div>
      <div className="kstrip k4">
        <div className="kcard kg"><div className="kcard-ic"><span className="ic">trending_up</span></div><div className="kcard-lbl">Market Share</div><div className="kcard-v">34<small>%</small></div><div className="kcard-d up">RS Ibu &amp; Anak Makassar</div></div>
        <div className="kcard"><div className="kcard-ic"><span className="ic">star</span></div><div className="kcard-lbl">Reputation Score</div><div className="kcard-v">4.8<small>/5</small></div><div className="kcard-d up"><span className="ic s">arrow_upward</span>Tertinggi di segmen</div></div>
        <div className="kcard"><div className="kcard-ic"><span className="ic">business</span></div><div className="kcard-lbl">Kompetitor Dipantau</div><div className="kcard-v">6</div><div className="kcard-d fl">Active monitoring</div></div>
        <div className="kcard"><div className="kcard-ic"><span className="ic">newspaper</span></div><div className="kcard-lbl">Industry Signals</div><div className="kcard-v">3</div><div className="kcard-d up">Tren relevan</div></div>
      </div>
      <div className="g21">
        <div className="col">
          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><div className="card-title">Get Data</div><div className="card-sub">Market, Consumer &amp; Industry · Academic Findings</div></div><span className="bdg b">Auto-collect</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <div className="ab b"><div className="ab-hd"><span className="ic s">trending_up</span>Telemedicine ANC — +24% YoY</div><div className="ab-body">Minat konsultasi ANC online naik 38% di Makassar. Policare menjadi kanal telemedicine langsung.</div></div>
              <div className="ab m"><div className="ab-hd"><span className="ic s">pregnant_woman</span>Paket Wellness Pasca Lahir</div><div className="ab-body">RS Bunda Makassar baru luncurkan paket post-partum. Potensi Rp 15–25 jt/pasien via Policare.</div></div>
              <div className="ab b"><div className="ab-hd"><span className="ic s">hub</span>Komunitas Ibu Digital +45%</div><div className="ab-body">Grup parenting Makassar sangat aktif. Komunitas Policare menjadi kanal retensi organik.</div></div>
            </div>
          </div>
          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><div className="card-title">Service Benchmarking</div></div><span className="bdg b">6 Peers</span></div>
            <table className="tbl"><thead><tr><th>#</th><th>RS</th><th>Rating</th><th>Loyalty</th></tr></thead><tbody>
              <tr><td style={{ color: 'var(--t3)', fontWeight: '700' }}>★</td><td><div className="td1" style={{ color: 'var(--blue)' }}>RSUD Daya Kota Makassar</div><div className="td2">Policare aktif</div></td><td style={{ color: 'var(--green)', fontWeight: '700' }}>4.8</td><td><span className="bdg loy">Policare</span></td></tr>
              <tr><td style={{ color: 'var(--t3)', fontWeight: '700' }}>2</td><td><div className="td1">RS Bunda Makassar</div></td><td style={{ color: 'var(--amber)', fontWeight: '700' }}>4.5</td><td><span className="bdg n">Sendiri</span></td></tr>
              <tr><td style={{ color: 'var(--t3)', fontWeight: '700' }}>3</td><td><div className="td1">RSIA Siti Fatimah</div></td><td style={{ fontWeight: '700' }}>4.2</td><td><span className="bdg n">Tidak ada</span></td></tr>
              <tr><td style={{ color: 'var(--t3)', fontWeight: '700' }}>4</td><td><div className="td1">Klinik Kartini</div></td><td style={{ fontWeight: '700' }}>4.1</td><td><span className="bdg n">Tidak ada</span></td></tr>
            </tbody></table>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-hd"><div className="card-hd-l"><div className="card-title">Key Insight → Aksi</div></div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '12px 14px', borderRadius: 'var(--r12)', border: '1px solid var(--loy-m)', background: 'var(--loy-s)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--loy)' }}>Peluang: Telemedicine ANC</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: '1.5' }}>Aktifkan fitur konsultasi online di Policare App. Potensi 200+ pasien baru/bulan.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
