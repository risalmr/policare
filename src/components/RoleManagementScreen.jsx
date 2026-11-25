import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 *  RoleManagementScreen.jsx — Manajemen Pengguna, Role & Hak Akses
 *  Pengaturan: Role-Based Access Control (RBAC) & User Management RSUD Daya
 *
 *  Fitur Utama:
 *  1. Kelola Pengguna (Tambah User, Edit Role, Status Akun)
 *  2. Matriks Hak Akses Granular (Admin, Editor, Viewer, No Access per Modul)
 *  3. Buat Role Kustom & Konfigurasi Izin
 *  4. Simulasi Akses Persona Pengguna
 * ─────────────────────────────────────────────────────────────────────────────*/

export default function RoleManagementScreen({
  active,
  currentRoleId = 'humas',
  onSwitchRole,
  roles: parentRoles,
  onUpdateRoles,
  users: parentUsers,
  onUpdateUsers,
  accessLevel = 'ADMIN'
}) {
  const isReadOnly = accessLevel === 'VIEWER';
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'matrix'

  // Modules List in Policare
  const MODULES = [
    { id: 'radar', name: 'Voice & Feedback (Radar)', desc: 'Suara Pasien & Masukan Internal Nakes' },
    { id: 'crisis', name: 'Crisis Management Center', desc: 'Penanganan Isu Kritis & Notifikasi Mutu' },
    { id: 'survey', name: 'Studio Riset (SKM Kemenkes)', desc: 'Survei Kepuasan & SKM Permenpan-RB' },
    { id: 'market', name: 'Intelijen Pasar & Tren', desc: 'Analisis Permintaan & Peluang RS' },
    { id: 'simrsFollowUp', name: 'Patient Relationship', desc: 'Sinkronisasi SIMRS & WhatsApp Follow-up' },
    { id: 'studio', name: 'Loyalty Program', desc: 'Rancang Program Loyalitas & Intervensi' },
    { id: 'community', name: 'Komunitas Pasien', desc: 'Manajemen Komunitas & Akuisisi Pasien' },
    { id: 'promotion', name: 'Promosi & Edukasi Medis', desc: 'Studio Konten, Edukasi Medis & Promo' },
    { id: 'aiCompanion', name: 'AI Companion (Sinteta AI)', desc: 'Konfigurasi Persona & Knowledge Base' },
    { id: 'roles', name: 'Pengaturan & Hak Akses', desc: 'Role Management & Sistem Konfigurasi' }
  ];

  // Access Levels Definition
  const ACCESS_LEVELS = {
    ADMIN: { label: 'Admin (Penuh)', color: '#4f30db', bg: 'rgba(79,48,219,0.12)', icon: 'shield' },
    EDITOR: { label: 'Editor (Aksi)', color: '#0284c7', bg: 'rgba(2,132,199,0.12)', icon: 'edit' },
    VIEWER: { label: 'Viewer (Pantau)', color: '#059669', bg: 'rgba(5,150,105,0.12)', icon: 'visibility' },
    NO_ACCESS: { label: 'Terkunci', color: '#dc2626', bg: 'rgba(220,38,38,0.12)', icon: 'lock' }
  };

  // Default Roles if not passed
  const defaultRoles = [
    {
      id: 'superadmin',
      name: 'Super Admin (Instalasi IT & SIMRS)',
      badgeColor: '#4f30db',
      userCount: 2,
      description: 'Akses teknis dan konfigurasi penuh terhadap seluruh modul, audit sistem, dan pengaturan hak akses RBAC.',
      permissions: {
        radar: 'ADMIN',
        crisis: 'ADMIN',
        survey: 'ADMIN',
        market: 'ADMIN',
        simrsFollowUp: 'ADMIN',
        studio: 'ADMIN',
        community: 'ADMIN',
        promotion: 'ADMIN',
        aiCompanion: 'ADMIN',
        roles: 'ADMIN'
      }
    },
    {
      id: 'direktur',
      name: 'Direktur Utama (Pimpinan RS)',
      badgeColor: '#7c3aed',
      userCount: 2,
      description: 'Penerima dan pemonitor laporan akhir. Memiliki akses pantau (View) ke seluruh modul tanpa aksi eksekusi teknis operasional.',
      permissions: {
        radar: 'VIEWER',
        crisis: 'VIEWER',
        survey: 'VIEWER',
        market: 'VIEWER',
        simrsFollowUp: 'VIEWER',
        studio: 'VIEWER',
        community: 'VIEWER',
        promotion: 'VIEWER',
        aiCompanion: 'VIEWER',
        roles: 'VIEWER'
      }
    },
    {
      id: 'humas',
      name: 'Yanmas / Humas & Pengaduan',
      badgeColor: '#0284c7',
      userCount: 4,
      description: 'Eksekutor utama penanganan suara pasien, tindak lanjut komplain, resolusi krisis, riset SKM, dan follow-up WhatsApp.',
      permissions: {
        radar: 'ADMIN',
        crisis: 'ADMIN',
        survey: 'ADMIN',
        market: 'VIEWER',
        simrsFollowUp: 'ADMIN',
        studio: 'VIEWER',
        community: 'ADMIN',
        promotion: 'VIEWER',
        aiCompanion: 'ADMIN',
        roles: 'VIEWER'
      }
    },
    {
      id: 'promkes',
      name: 'Bagian Promkes & Pemasaran',
      badgeColor: '#ea580c',
      userCount: 3,
      description: 'Eksekutor produksi konten edukasi kesehatan, kampanye promosi layanan, riset pasar, dan komunitas pasien.',
      permissions: {
        radar: 'VIEWER',
        crisis: 'NO_ACCESS',
        survey: 'VIEWER',
        market: 'ADMIN',
        simrsFollowUp: 'VIEWER',
        studio: 'ADMIN',
        community: 'ADMIN',
        promotion: 'ADMIN',
        aiCompanion: 'EDITOR',
        roles: 'NO_ACCESS'
      }
    },
    {
      id: 'mutu',
      name: 'Komite Mutu & Keselamatan (KMKP)',
      badgeColor: '#059669',
      userCount: 3,
      description: 'Penerima laporan mutu dan audit indikator. Memantau keluhan mutu dan capaian SKM tanpa eksekusi langsung ke publik.',
      permissions: {
        radar: 'VIEWER',
        crisis: 'VIEWER',
        survey: 'VIEWER',
        market: 'NO_ACCESS',
        simrsFollowUp: 'VIEWER',
        studio: 'NO_ACCESS',
        community: 'NO_ACCESS',
        promotion: 'VIEWER',
        aiCompanion: 'VIEWER',
        roles: 'NO_ACCESS'
      }
    }
  ];

  const roles = parentRoles || defaultRoles;
  const setRoles = (updater) => {
    const updated = typeof updater === 'function' ? updater(roles) : updater;
    if (onUpdateRoles) onUpdateRoles(updated);
  };

  // Default Users List
  const defaultUsers = [
    {
      id: 'u-0',
      name: 'Bpk. Ilham Hidayat, S.Kom',
      nip: '19850614 201001 1 008',
      email: 'ilham.it@rsuddaya.makassar.go.id',
      phone: '0813-5566-7788',
      unit: 'Instalasi Sistem Informasi & TI (SIMRS)',
      roleId: 'superadmin',
      roleName: 'Super Admin (Instalasi IT & SIMRS)',
      status: 'Aktif',
      avatar: 'IH',
      avatarColor: '#4f30db',
      lastActive: 'Online sekarang'
    },
    {
      id: 'u-1',
      name: 'Bpk. Fajar Pratama, S.I.Kom',
      nip: '19880412 201201 1 004',
      email: 'fajar.humas@rsuddaya.makassar.go.id',
      phone: '0812-4455-6677',
      unit: 'Sub Bagian Humas & Pengaduan Masyarakat',
      roleId: 'humas',
      roleName: 'Yanmas / Humas & Pengaduan',
      status: 'Aktif',
      avatar: 'FP',
      avatarColor: '#0284c7',
      lastActive: 'Hari ini, 09:12 WITA'
    },
    {
      id: 'u-2',
      name: 'dr. Hj. Ratna Kusuma, Sp.A, M.Kes',
      nip: '19750915 200312 2 001',
      email: 'ratna.kusuma@rsuddaya.makassar.go.id',
      phone: '0811-9876-5432',
      unit: 'Direksi / Pimpinan Utama RSUD Daya',
      roleId: 'direktur',
      roleName: 'Direktur / Pimpinan RS',
      status: 'Aktif',
      avatar: 'DR',
      avatarColor: '#4f30db',
      lastActive: 'Hari ini, 08:30 WITA'
    },
    {
      id: 'u-3',
      name: 'Sdri. Amanda Putri, S.KM',
      nip: '19920318 201502 2 003',
      email: 'amanda.promkes@rsuddaya.makassar.go.id',
      phone: '0852-3344-5566',
      unit: 'Instalasi Promosi Kesehatan RS (PKRS)',
      roleId: 'promkes',
      roleName: 'Bagian Promkes & Pemasaran',
      status: 'Aktif',
      avatar: 'AP',
      avatarColor: '#ea580c',
      lastActive: 'Kemarin, 16:45 WITA'
    },
    {
      id: 'u-4',
      name: 'dr. Ahmad Asy’ari, Sp.OG',
      nip: '19810620 200801 1 007',
      email: 'ahmad.asyari@rsuddaya.makassar.go.id',
      phone: '0813-2211-9988',
      unit: 'Komite Medik & Validator Konten',
      roleId: 'promkes',
      roleName: 'Bagian Promkes & Pemasaran',
      status: 'Aktif',
      avatar: 'AA',
      avatarColor: '#10b981',
      lastActive: '2 hari lalu'
    },
    {
      id: 'u-5',
      name: 'dr. H. Supriyadi, Sp.B (Ketua KMKP)',
      nip: '19781105 200604 1 002',
      email: 'supriyadi.mutu@rsuddaya.makassar.go.id',
      phone: '0812-9900-1122',
      unit: 'Komite Mutu & Keselamatan Pasien',
      roleId: 'mutu',
      roleName: 'Komite Mutu (KMKP)',
      status: 'Aktif',
      avatar: 'HS',
      avatarColor: '#059669',
      lastActive: 'Hari ini, 07:50 WITA'
    }
  ];

  const users = parentUsers || defaultUsers;
  const setUsers = (updater) => {
    const updated = typeof updater === 'function' ? updater(users) : updater;
    if (onUpdateUsers) onUpdateUsers(updated);
  };

  // Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserNip, setNewUserNip] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserUnit, setNewUserUnit] = useState('Sub Bagian Humas & Pengaduan Masyarakat');
  const [newUserRoleId, setNewUserRoleId] = useState('humas');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add New User Handler
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Nama Lengkap dan Email wajib diisi!');
      return;
    }

    const selectedRole = roles.find(r => r.id === newUserRoleId) || roles[0];
    const initials = newUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const newUser = {
      id: `u-${Date.now()}`,
      name: newUserName,
      nip: newUserNip || 'NIP Belum Diatur',
      email: newUserEmail,
      phone: newUserPhone || '0812-xxxx-xxxx',
      unit: newUserUnit,
      roleId: selectedRole.id,
      roleName: selectedRole.name,
      status: 'Aktif',
      avatar: initials,
      avatarColor: selectedRole.badgeColor,
      lastActive: 'Baru dibuat'
    };

    setUsers([newUser, ...users]);
    setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, userCount: r.userCount + 1 } : r));

    setIsAddUserModalOpen(false);
    showToast(`✅ Pengguna "${newUserName}" berhasil ditambahkan dengan role ${selectedRole.name}!`);

    // Reset Form
    setNewUserName('');
    setNewUserNip('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  // Toggle User Status
  const handleToggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        showToast(`Status pengguna ${u.name} diubah menjadi ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Delete User
  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${userName}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`Pengguna ${userName} telah dihapus.`);
    }
  };

  // Open Edit Role Modal
  const handleOpenEditRole = (role) => {
    setSelectedRoleForEdit(JSON.parse(JSON.stringify(role)));
    setIsEditRoleModalOpen(true);
  };

  // Update Permission in Edit Role Modal
  const handlePermissionChange = (moduleId, level) => {
    if (!selectedRoleForEdit) return;
    setSelectedRoleForEdit(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: level
      }
    }));
  };

  // Save Role Changes
  const handleSaveRoleChanges = (e) => {
    e.preventDefault();
    if (!selectedRoleForEdit) return;

    setRoles(prev => prev.map(r => r.id === selectedRoleForEdit.id ? selectedRoleForEdit : r));
    setIsEditRoleModalOpen(false);
    showToast(`Hak akses untuk role "${selectedRoleForEdit.name}" berhasil diperbarui!`);
  };

  if (!active) return null;

  return (
    <div className="screen on" id="s-role-management">
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
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* HEADER SCREEN */}
      <div className="ph">
        <div className="ph-text">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79,48,219,0.1)', color: '#4f30db', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
            <span className="ic s" style={{ fontSize: '14px' }}>admin_panel_settings</span> PENGATURAN SISTEM &amp; KEAMANAN
          </div>
          <h2>Manajemen Pengguna &amp; Hak Akses (Role Management)</h2>
          <p>Atur hak akses pengguna rumah sakit (Yanmas/Humas, Direktur, Promkes &amp; Pemasaran, Komite Mutu) dengan tingkat izin Granular: <strong>Admin</strong>, <strong>Editor</strong>, dan <strong>Viewer</strong>.</p>
        </div>
        <div className="ph-act" style={{ display: 'flex', gap: '8px' }}>
          {!isReadOnly ? (
            <button className="btn pri" onClick={() => setIsAddUserModalOpen(true)} style={{ background: '#4f30db' }}>
              <span className="ic s">person_add</span> Tambah Pengguna Baru
            </button>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--srf2)', border: '1px solid var(--line)', borderRadius: 'var(--r8)', fontSize: '11.5px', color: 'var(--t3)', fontWeight: 600 }}>
              <span className="ic s" style={{ fontSize: '14px' }}>visibility</span> Mode Pantau (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* EXECUTIVE VIEW BANNER FOR READ-ONLY */}
      {isReadOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--blue-s)', border: '1.5px solid var(--blue-m)', padding: '12px 16px', borderRadius: 'var(--r10)', marginBottom: '16px' }}>
          <span className="ic s" style={{ color: 'var(--blue)', fontSize: '20px' }}>info</span>
          <div style={{ fontSize: '12px', color: 'var(--t1)', lineHeight: 1.4 }}>
            <strong>Mode Pantau Eksekutif (Pimpinan RS):</strong> Anda memiliki hak pengawasan penuh terhadap struktur hak akses dan daftar pengguna RSUD Daya. Penambahan pengguna dan pengubahan matriks RBAC hanya dapat dieksekusi oleh <strong>Super Admin (Instalasi IT &amp; SIMRS)</strong>.
          </div>
        </div>
      )}

      {/* METRIC KPI STRIP */}
      <div className="kstrip k4" style={{ marginBottom: '16px' }}>
        <div className="kcard kl">
          <div className="kcard-ic"><span className="ic" style={{ color: '#4f30db' }}>badge</span></div>
          <div className="kcard-lbl">Total Role Terkonfigurasi</div>
          <div className="kcard-v">{roles.length} <small>Role</small></div>
          <div className="kcard-d up">Yanmas, Direksi, Promkes, Mutu</div>
        </div>
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic" style={{ color: '#10b981' }}>group</span></div>
          <div className="kcard-lbl">Pengguna Aktif</div>
          <div className="kcard-v">{users.filter(u => u.status === 'Aktif').length} <small>User</small></div>
          <div className="kcard-d up">Terdaftar di RSUD Daya</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#0284c7' }}>security</span></div>
          <div className="kcard-lbl">Tipe Izin Akses</div>
          <div className="kcard-v">4 <small>Level</small></div>
          <div className="kcard-d up">Admin · Editor · Viewer · Lock</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#ea580c' }}>lock_clock</span></div>
          <div className="kcard-lbl">Audit Log Akses</div>
          <div className="kcard-v">100<small>%</small></div>
          <div className="kcard-d up">Tercatat di Audit Trail</div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION (RESPONSIVE SCROLLABLE) */}
      <div className="tabs subtabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1.5px solid var(--line2)', paddingBottom: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {[
          { id: 'users',  label: `Daftar Pengguna (${users.length})`, icon: 'people' },
          { id: 'roles',  label: `Daftar Role & Deskripsi (${roles.length})`, icon: 'badge' },
          { id: 'matrix', label: 'Matriks Hak Akses Granular per Modul', icon: 'grid_view' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: activeTab === t.id ? '#4f30db' : 'var(--srf)',
              color: activeTab === t.id ? '#fff' : 'var(--t2)',
              display: 'flex', alignItems: 'center', gap: '6px', transition: '.15s',
              flexShrink: 0,
              boxShadow: activeTab === t.id ? '0 2px 8px rgba(79, 48, 219, 0.25)' : 'none'
            }}>
            <span className="ic s" style={{ fontSize: '16px' }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 1: DAFTAR PENGGUNA (USER MANAGEMENT)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l">
              <div className="card-title">Daftar Akun Pengguna Rumah Sakit</div>
              <div className="card-sub">Kelola data personel, NIP, unit kerja, serta penetapan role akses ke dasbor Policare.</div>
            </div>
            {!isReadOnly && (
              <div className="card-hd-r">
                <button className="btn pri sm" onClick={() => setIsAddUserModalOpen(true)} style={{ background: '#4f30db' }}>
                  <span className="ic s">person_add</span> + Tambah User
                </button>
              </div>
            )}
          </div>

          <table className="tbl" style={{ fontSize: '12.5px' }}>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>NIP / Identitas</th>
                <th>Unit / Bagian RS</th>
                <th>Role yang Ditetapkan</th>
                <th>Status Akun</th>
                <th>Aktivitas Terakhir</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: u.avatarColor || '#4f30db', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700
                      }}>
                        {u.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--t2)' }}>{u.nip}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--t2)' }}>{u.unit}</span>
                  </td>
                  <td>
                    <span className="bdg" style={{
                      background: u.roleId === 'direktur' ? '#ede9fe' : u.roleId === 'humas' ? '#e0f2fe' : u.roleId === 'promkes' ? '#ffedd5' : '#dcfce7',
                      color: u.roleId === 'direktur' ? '#4f30db' : u.roleId === 'humas' ? '#0284c7' : u.roleId === 'promkes' ? '#ea580c' : '#059669',
                      fontWeight: 700, fontSize: '11px'
                    }}>
                      {u.roleName}
                    </span>
                  </td>
                  <td>
                    <span className={`bdg ${u.status === 'Aktif' ? 'g' : 'r'}`}>
                      {u.status === 'Aktif' ? '✓ Aktif' : '✕ Nonaktif'}
                    </span>
                  </td>
                  <td style={{ fontSize: '11.5px', color: 'var(--t3)' }}>
                    {u.lastActive}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn ghost xs"
                        title="Simulasikan login sebagai pengguna ini"
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole(u.roleId);
                          showToast(`Sekarang mensimulasikan akses sebagai ${u.name} (${u.roleName}).`);
                        }}>
                        <span className="ic s">switch_account</span> Uji Akses
                      </button>
                      {!isReadOnly && (
                        <>
                          <button
                            className="btn ghost xs"
                            title="Ubah status akun"
                            onClick={() => handleToggleUserStatus(u.id)}>
                            {u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            className="btn danger xs"
                            title="Hapus user"
                            onClick={() => handleDeleteUser(u.id, u.name)}>
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 2: DAFTAR ROLE & DESKRIPSI TUGAS
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {roles.map(role => (
            <div key={role.id} className="card" style={{ borderTop: `4px solid ${role.badgeColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--t1)' }}>
                    {role.name}
                  </h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>
                    👥 <strong>{role.userCount} Pengguna</strong> Terdaftar
                  </div>
                </div>
                {!isReadOnly && (
                  <button className="btn ghost sm" onClick={() => handleOpenEditRole(role)} style={{ color: role.badgeColor, fontWeight: 700 }}>
                    <span className="ic s">tune</span> Atur Izin
                  </button>
                )}
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--t2)', lineHeight: 1.5, marginBottom: '14px' }}>
                {role.description}
              </p>

              {/* PERMISSION SUMMARY PILLS */}
              <div style={{ background: 'var(--srf2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--t3)', marginBottom: '6px' }}>RINGKASAN HAK AKSES MODUL:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {MODULES.slice(0, 6).map(mod => {
                    const permKey = role.permissions[mod.id] || 'NO_ACCESS';
                    const permObj = ACCESS_LEVELS[permKey];
                    return (
                      <span key={mod.id} style={{
                        background: permObj.bg,
                        color: permObj.color,
                        fontSize: '10.5px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        {mod.name.split(' ')[0]}: {permKey === 'ADMIN' ? '👑 Admin' : permKey === 'EDITOR' ? '✍️ Editor' : permKey === 'VIEWER' ? '👁️ Viewer' : '🚫 No Access'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 3: MATRIKS HAK AKSES GRANULAR PER MODUL (FULL MATRIX)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'matrix' && (
        <div className="card">
          <div className="card-hd">
            <div className="card-hd-l">
              <div className="card-title">Matriks Hak Akses Modul Lengkap (Role-Based Matrix)</div>
              <div className="card-sub">Menunjukkan tingkat izin setiap role terhadap 10 modul fungsional di platform Policare.</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="tbl" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Modul / Fitur Sistem</th>
                  {roles.map(r => (
                    <th key={r.id} style={{ textAlign: 'center', minWidth: '160px' }}>
                      <div style={{ fontWeight: 700, color: r.badgeColor }}>{r.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(mod => (
                  <tr key={mod.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{mod.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{mod.desc}</div>
                    </td>
                    {roles.map(r => {
                      const permKey = r.permissions[mod.id] || 'NO_ACCESS';
                      const permObj = ACCESS_LEVELS[permKey];
                      return (
                        <td key={r.id} style={{ textAlign: 'center' }}>
                          <span style={{
                            background: permObj.bg,
                            color: permObj.color,
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '11px',
                            display: 'inline-block'
                          }}>
                            {permObj.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * MODAL 1: TAMBAH PENGGUNA BARU
       * ═════════════════════════════════════════════════════════════════════*/}
      {isAddUserModalOpen && (
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
            <div style={{ padding: '16px 20px', background: '#ede9fe', borderBottom: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic l" style={{ color: '#4f30db' }}>person_add</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#4338ca' }}>Tambah Pengguna Baru</h3>
                  <div style={{ fontSize: '11px', color: '#6d28d9' }}>Daftarkan personel RSUD Daya dan tetapkan hak akses modul</div>
                </div>
              </div>
              <button className="btn ghost xs ico" onClick={() => setIsAddUserModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddUser} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: dr. Ahmad, Sp.OG / Bpk. Fajar"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>NIP / ID Karyawan RS</label>
                  <input
                    type="text"
                    placeholder="1988xxxx xxxxx x xxx"
                    value={newUserNip}
                    onChange={e => setNewUserNip(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Email Resmi *</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@rsuddaya.makassar.go.id"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Unit / Bagian RS</label>
                  <select
                    value={newUserUnit}
                    onChange={e => setNewUserUnit(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)' }}>
                    <option value="Sub Bagian Humas & Pengaduan Masyarakat">Sub Bagian Humas &amp; Pengaduan</option>
                    <option value="Direksi / Pimpinan Utama">Direksi / Pimpinan Utama</option>
                    <option value="Instalasi Promosi Kesehatan RS (PKRS)">Instalasi Promosi Kesehatan RS (PKRS)</option>
                    <option value="Komite Mutu & Keselamatan Pasien">Komite Mutu &amp; Keselamatan Pasien (KMKP)</option>
                    <option value="Poliklinik Rawat Jalan & Medis">Poliklinik Rawat Jalan &amp; Medis</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '3px' }}>Tetapkan Role Akses *</label>
                  <select
                    value={newUserRoleId}
                    onChange={e => setNewUserRoleId(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r6)', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--srf)', fontWeight: 600 }}>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost" onClick={() => setIsAddUserModalOpen(false)}>Batal</button>
                <button type="submit" className="btn pri" style={{ background: '#4f30db' }}>
                  <span className="ic s">save</span> Simpan &amp; Beri Akses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * MODAL 2: ATUR HAK AKSES GRANULAR ROLE (EDIT ROLE PERMISSIONS)
       * ═════════════════════════════════════════════════════════════════════*/}
      {isEditRoleModalOpen && selectedRoleForEdit && (
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
            maxWidth: '680px',
            boxShadow: 'var(--sh2)',
            border: '1px solid var(--line)',
            overflow: 'hidden',
            animation: 'fadeup-demo .2s ease'
          }}>
            <div style={{ padding: '16px 20px', background: '#ede9fe', borderBottom: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic l" style={{ color: '#4f30db' }}>tune</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#4338ca' }}>
                    Konfigurasi Izin Role: {selectedRoleForEdit.name}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#6d28d9' }}>Pilih peran (Admin, Editor, Viewer, No Access) untuk tiap modul</div>
                </div>
              </div>
              <button className="btn ghost xs ico" onClick={() => setIsEditRoleModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveRoleChanges} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {MODULES.map(mod => {
                  const currentLevel = selectedRoleForEdit.permissions[mod.id] || 'NO_ACCESS';
                  return (
                    <div key={mod.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: '8px', background: 'var(--srf2)', border: '1px solid var(--line)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--t1)' }}>{mod.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{mod.desc}</div>
                      </div>

                      <select
                        value={currentLevel}
                        onChange={e => handlePermissionChange(mod.id, e.target.value)}
                        style={{
                          padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700,
                          border: '1px solid var(--line2)',
                          background: currentLevel === 'ADMIN' ? '#ede9fe' : currentLevel === 'EDITOR' ? '#e0f2fe' : currentLevel === 'VIEWER' ? '#d1fae5' : '#fee2e2',
                          color: currentLevel === 'ADMIN' ? '#4f30db' : currentLevel === 'EDITOR' ? '#0284c7' : currentLevel === 'VIEWER' ? '#059669' : '#dc2626'
                        }}>
                        <option value="ADMIN">👑 Admin (Full Control)</option>
                        <option value="EDITOR">✍️ Editor / Operator</option>
                        <option value="VIEWER">👁️ Viewer (Read-Only)</option>
                        <option value="NO_ACCESS">🚫 Tidak Ada Akses</option>
                      </select>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <button type="button" className="btn ghost" onClick={() => setIsEditRoleModalOpen(false)}>Batal</button>
                <button type="submit" className="btn pri" style={{ background: '#4f30db' }}>
                  <span className="ic s">save</span> Simpan Perubahan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
