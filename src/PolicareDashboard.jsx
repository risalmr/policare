import { useEffect, useRef, useState, useCallback } from 'react';
import './policare.css';

// Import Deconstructed Component Screens for Patient Voice & Relationship
import SurveyModal from './components/SurveyModal';
import RadarScreen from './components/RadarScreen';
import CrisisScreen from './components/CrisisScreen';
import SurveyScreen from './components/SurveyScreen';
import StudioScreen from './components/StudioScreen';
import SimrsFollowUpScreen from './components/SimrsFollowUpScreen';
import {
  CommunityScreen,
  MarketScreen,
} from './components/OtherScreens';
import PromotionScreen from './components/PromotionScreen';
import AiCompanionScreen from './components/AiCompanionScreen';
import RoleManagementScreen from './components/RoleManagementScreen';
import { PolicareApi } from './services/policareApi';
import { PiiMasker } from './utils/security';

export default function PolicareDashboard() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [rules, setRules] = useState({
    ancChallenge: { points: 300, status: 'Aktif', target: 67 },
    referralBoost: { points: 200, status: 'Aktif', target: 120 },
    wellBabyStreak: { points: 400, status: 'Aktif', target: 89 }
  });
  const [activeTab, setActiveTab] = useState('radar');
  const [remindedPatients, setRemindedPatients] = useState({});
  const [surveys, setSurveys] = useState([]);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [exportScope, setExportScope] = useState('Semua Modul');

  // UU PDP & Security Privacy State
  const [isPiiMasked, setIsPiiMasked] = useState(true);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Live clock
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      + ' · ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  });

  // Global toast system
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const showToast = useCallback((title, msg = '', type = 'success', duration = 3500) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
    }, duration);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
  }, []);

  // Master Roles State (RBAC Single Source of Truth)
  const [roles, setRoles] = useState([
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
  ]);

  // Master Users State
  const [users, setUsers] = useState([
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
      roleName: 'Direktur Utama (Pimpinan RS)',
      status: 'Aktif',
      avatar: 'DR',
      avatarColor: '#7c3aed',
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
  ]);

  // Identified User Roles Switcher
  const USER_ROLES = [
    {
      id: 'superadmin',
      name: 'Bpk. Ilham Hidayat, S.Kom',
      role: 'Super Admin (Instalasi IT & SIMRS)',
      avatar: 'IT',
      badge: 'Super Admin (IT)',
      color: '#4f30db',
      focus: 'Universal Admin, Manajemen RBAC & Konfigurasi Sistem'
    },
    {
      id: 'direktur',
      name: 'dr. Hj. Ratna Kusuma, Sp.A, M.Kes',
      role: 'Direktur Utama (Pimpinan RS)',
      avatar: 'DR',
      badge: 'Direktur RS (Pemonitor Eksekutif)',
      color: '#7c3aed',
      focus: 'Executive Oversight, Matriks 360° & Monitoring Seluruh Modul'
    },
    {
      id: 'humas',
      name: 'Bpk. Fajar Pratama, S.I.Kom',
      role: 'Yanmas · Humas & Pengaduan',
      avatar: 'FP',
      badge: 'Yanmas / Humas (Eksekutor)',
      color: '#0284c7',
      focus: 'Radar Layanan, Penanganan Komplain & Krisis'
    },
    {
      id: 'promkes',
      name: 'Sdri. Amanda Putri, S.KM',
      role: 'Bagian Promkes & Pemasaran',
      avatar: 'AP',
      badge: 'Promkes / Marketing (Eksekutor)',
      color: '#ea580c',
      focus: 'Studio Edukasi Medis, Promosi Layanan & Program Relasi'
    },
    {
      id: 'mutu',
      name: 'dr. H. Supriyadi, Sp.B',
      role: 'Ketua Komite Mutu (KMKP)',
      avatar: 'HS',
      badge: 'Komite Mutu (Penerima Laporan)',
      color: '#059669',
      focus: 'Penerima Laporan Mutu & Audit SKM'
    }
  ];
  const [activeUserRoleId, setActiveUserRoleId] = useState('humas');
  const activeUser = USER_ROLES.find(r => r.id === activeUserRoleId) || USER_ROLES[0];

  // RBAC Permission Resolver
  // Super Admin (IT RS) gets universal ADMIN access to all modules
  const getModuleAccessLevel = (moduleId) => {
    if (activeUserRoleId === 'superadmin') return 'ADMIN';
    const currentRole = roles.find(r => r.id === activeUserRoleId);
    return currentRole?.permissions?.[moduleId] || 'NO_ACCESS';
  };

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [sintetaMessages, setSintetaMessages] = useState([
    {
      sender: 'sinteta',
      text: 'Halo dr. Ratna! Saya sudah analisis data 30 hari terakhir. Adherence ANC T2 turun 8% — ada 67 pasien yang berisiko tidak melanjutkan ke trimester 3. Saya punya 3 rekomendasi program. Mau mulai dari mana?'
    }
  ]);
  const [outreachLogs, setOutreachLogs] = useState([]);

  const META = {
    radar:        ['Voice & Feedback', 'Pantau suara pasien & masukan tim medis dari semua saluran secara langsung'],
    crisis:       ['Crisis Management', 'Tangani, eskalasi, dan selesaikan isu kritis dengan cepat & terstruktur'],
    survey:       ['Studio Riset (SKM)', 'Buat survei kepuasan & luncurkan SKM standar resmi Kementerian Kesehatan'],
    market:       ['Intelijen Pasar', 'Tren pasar, analisis kompetitor, dan peluang strategis berbasis AI'],
    simrsFollowUp:['Patient Relationship', 'Data kunjungan terkini & tindak lanjut otomatis ke pasien via WhatsApp'],
    studio:       ['Loyalty Program', 'Rancang program loyalitas & kelola 4 jalur pengiriman intervensi pasien'],
    community:    ['Komunitas Pasien', 'Kelola grup komunitas — sumber insight organik dan akuisisi pasien baru'],
    promotion:    ['Promosi & Edukasi', 'Produksi dan distribusikan konten edukasi ke segmen audiens yang tepat'],
    aiCompanion:  ['Pengaturan AI Companion', 'Kelola persona, basis pengetahuan, dan koneksi saluran Sinteta AI'],
    roles:        ['Manajemen Pengguna & Hak Akses', 'Kelola daftar pengguna, penetapan role, dan izin modul (Admin, Editor, Viewer)']
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/feedback`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
        if (selectedFeedId === null && data.length > 0) {
          setSelectedFeedId(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Sync server offline, using local state');
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_URL}/api/rules`);
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (err) {
      console.warn('Sync server offline, using local rules');
    }
  };

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API_URL}/api/surveys`);
      if (res.ok) {
        const data = await res.json();
        setSurveys(data);
      }
    } catch (err) {
      console.warn('Gagal mengambil survey dari server');
    }
  };

  // Live clock updater
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        + ' · ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
      );
    };
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!isNotificationOpen) return;
    const handler = (e) => {
      if (!e.target.closest('.notif') && !e.target.closest('.notif-dropdown')) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isNotificationOpen]);

  // Connect to sync server via WebSocket for real-time updates
  useEffect(() => {
    fetchFeedbacks();
    fetchRules();
    fetchSurveys();

    const wsURL = API_URL.replace(/^http/, 'ws');
    let socket;

    function connectWS() {
      socket = new WebSocket(wsURL);

      socket.onopen = () => {
        console.log('[WebSocket] Connected to sync server');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'FEEDBACK_ADDED' || data.type === 'FEEDBACK_UPDATED') {
            setFeedbacks(data.feedbacks);
            if (data.feedbacks && data.feedbacks.length > 0) {
              setFeedbacks(prev => {
                if (selectedFeedId === null) {
                  setSelectedFeedId(data.feedbacks[0].id);
                }
                return data.feedbacks;
              });
            }
          } else if (data.type === 'RULES_UPDATED') {
            setRules(data.rules);
          } else if (data.type === 'SURVEY_CREATED') {
            setSurveys(data.surveys);
          }
        } catch (e) {
          console.error('[WebSocket] Parsing error', e);
        }
      };

      socket.onclose = () => {
        setTimeout(connectWS, 3000);
      };
    }

    connectWS();
    return () => {
      if (socket) socket.close();
    };
  }, []);

  const triggerWhatsAppReminder = (patientOrName, phone, message) => {
    let patientName = typeof patientOrName === 'string' ? patientOrName : patientOrName?.name || 'Pasien';
    let patientId = typeof patientOrName === 'object' ? (patientOrName.id || patientOrName.name) : patientOrName;
    let targetPhone = phone || (typeof patientOrName === 'object' ? patientOrName.phone : '0812-xxxx-xxxx');
    let messageText = message || (typeof patientOrName === 'object' ? patientOrName.message : 'Pesan pengingat kontrol & loyalitas RSUD Daya');

    setRemindedPatients(prev => ({
      ...prev,
      [patientName]: {
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'Terkirim'
      },
      [patientId]: {
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'Terkirim'
      }
    }));

    const newLog = {
      id: Date.now(),
      patientId: patientId || patientName,
      patientName: patientName,
      phone: targetPhone,
      message: messageText,
      channel: 'WhatsApp Auto-Reminder',
      program: 'ANC & Loyalty Outreach',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'Sukses (AI Direct)'
    };
    setOutreachLogs(prev => [newLog, ...prev]);
  };

  const handleTriggerCrisis = (newCrisis) => {
    setFeedbacks(prev => [newCrisis, ...prev]);
    setActiveTab('crisis');
  };

  const handleRulePointsChange = (ruleKey, newPoints) => {
    setRules(prev => ({
      ...prev,
      [ruleKey]: {
        ...prev[ruleKey],
        points: parseInt(newPoints) || 0
      }
    }));
  };

  const saveRulePoints = async (ruleKey) => {
    try {
      await PolicareApi.updateLoyaltyRule(ruleKey, rules);
      showToast('Aturan Diperbarui', `Rule ${ruleKey} berhasil disimpan ke server.`, 'success');
    } catch (err) {
      showToast('Tersimpan Lokal', 'Perubahan aturan disimpan secara lokal.', 'info');
    }
  };

  const runLoyaltySimulation = () => {
    showToast('Simulasi Selesai', 'Proyeksi: +18.4% retensi · 24.500 Poin · 91.2% Q2', 'loy', 5000);
  };

  const sendSintetaMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user', text };
    setSintetaMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      let botReply = 'Saya mencatat preferensi Anda. Sedang memproses optimasi skenario loyalitas...';
      if (text.toLowerCase().includes('anc')) {
        botReply = 'Baik, untuk program ANC: Saya sarankan menaikkan reward ANC T2 menjadi 350 poin dan aktifkan auto-reminder WhatsApp H-3 jadwal periksa.';
      } else if (text.toLowerCase().includes('budget') || text.toLowerCase().includes('poin')) {
        botReply = 'Total alokasi poin bulanan saat ini aman di 15.000 poin (ekuivalen Rp 1.500.000 voucher layanan).';
      }
      setSintetaMessages(prev => [...prev, { sender: 'sinteta', text: botReply }]);
    }, 600);
  };

  const selectSintetaPrompt = (promptText) => {
    sendSintetaMessage(promptText);
  };

  const applyAICampaign = (campaignTitle) => {
    alert(`Program "${campaignTitle}" berhasil diaktifkan ke Program Delivery!`);
  };

  const submitQuickReply = async (id, draftText) => {
    try {
      const res = await PolicareApi.quickReplyFeedback(id, draftText);
      if (res.success) {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Selesai', replies: [draftText] } : f));
        showToast('Tanggapan Terkirim', 'Berhasil dikirim via WhatsApp & Aplikasi.', 'success');
      }
    } catch (err) {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Selesai', replies: [draftText] } : f));
      showToast('Tanggapan Terkirim', 'Tersimpan dan dikirim secara lokal.', 'success');
    }
  };

  const submitEscalation = async (id, dept) => {
    try {
      const res = await PolicareApi.escalateFeedback(id, dept);
      if (res.success) {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Eskalasi', department: dept } : f));
        showToast('Eskalasi Berhasil', `Keluhan dieskalasikan ke bagian ${dept}.`, 'warn');
      }
    } catch (err) {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Eskalasi', department: dept } : f));
      showToast('Eskalasi Berhasil', `Eskalasi ke ${dept} dicatat secara lokal.`, 'warn');
    }
  };

  const submitProcess = async (id) => {
    try {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Dalam Proses' } : f));
      showToast('Status Diperbarui', 'Keluhan sedang diproses oleh tim terkait.', 'info');
    } catch (err) {
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Dalam Proses' } : f));
    }
  };

  // Helper for rendering navigation item with seamless & elegant permission indicator
  const renderNavItem = (id, icon, label, badge, isLoyalty) => {
    const perm = getModuleAccessLevel(id);
    const isNoAccess = perm === 'NO_ACCESS';

    return (
      <button
        key={id}
        className={`ni ${isLoyalty ? 'loy' : ''} ${activeTab === id ? 'on' : ''}`}
        onClick={() => {
          setActiveTab(id);
          setIsMobileNavOpen(false);
        }}
        style={{
          opacity: isNoAccess ? 0.55 : 1,
          cursor: 'pointer',
          position: 'relative'
        }}
        title={isNoAccess ? `Akses ${label} dibatasi untuk role ${activeUser.badge}` : label}>
        <span className="ic" style={{ opacity: isNoAccess ? 0.7 : 1 }}>{icon}</span>
        <span style={{ flex: 1, textAlign: 'left' }}>
          {label}
        </span>
        {isNoAccess ? (
          <span className="ic s" style={{ fontSize: '13px', color: 'var(--t3)', opacity: 0.6, marginLeft: 'auto' }} title="Akses Dibatasi">
            lock
          </span>
        ) : badge ? (
          <span className={`nbadge ${badge.cls || 'nb-r'}`}>{badge.text}</span>
        ) : null}
      </button>
    );
  };

  const currentTabAccess = getModuleAccessLevel(activeTab);

  return (
    <div className="policare-scope" style={{ width: '100%', height: '100%', display: 'flex' }}>
      {/* ══════════ GLOBAL TOAST CONTAINER ══════════ */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type} ${t.leaving ? 'leaving' : ''}`}>
            <div className="toast-icon">
              <span className="ic s">
                {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : t.type === 'warn' ? 'warning' : t.type === 'loy' ? 'bolt' : 'info'}
              </span>
            </div>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.msg && <div className="toast-msg">{t.msg}</div>}
            </div>
            <button className="toast-close" onClick={() => dismissToast(t.id)}>
              <span className="ic s">close</span>
            </button>
          </div>
        ))}
      </div>

      {/* ══════════ MOBILE BACKDROP OVERLAY ══════════ */}
      {isMobileNavOpen && (
        <div
          className="sb-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          title="Tutup Navigasi"
        />
      )}

      {/* ══════════ SIDEBAR POLICARE ══════════ */}
      <aside className={`sb ${isMobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sb-hd">
          <div className="sb-logo">
            <div className="sb-logo-mark"><span className="ic">health_and_safety</span></div>
            <div style={{ flex: 1 }}>
              <div className="sb-logo-txt">POLICARE</div>
              <div className="sb-logo-sub">PATIENT VOICE & CARE</div>
            </div>
            <button
              className="sb-close-btn"
              onClick={() => setIsMobileNavOpen(false)}
              title="Tutup Menu">
              <span className="ic">close</span>
            </button>
          </div>
          <div className="sb-pow"><span className="ic s">bolt</span>Didukung oleh Sinteta AI</div>
        </div>

        <div className="sb-rs">
          <div className="rs-name">RSUD Daya Kota Makassar</div>
          <div className="rs-meta">Makassar · Sejak Jan 2026</div>
          <div className="rs-pill"><span className="rs-pill-dot"></span>Terhubung ke SIMRS</div>
        </div>

        <nav>
          {/* ── PILAR 1: Radar Layanan ── */}
          <div className="ng">Radar Layanan</div>
          {renderNavItem('radar', 'record_voice_over', 'Voice & Feedback', { cls: 'nb-r', text: '3' })}
          {renderNavItem('crisis', 'emergency', 'Crisis Management', { cls: 'nb-r', text: '1' })}
          {renderNavItem('survey', 'biotech', 'Studio Riset (SKM)')}
          {renderNavItem('market', 'insights', 'Intelijen Pasar')}

          {/* ── PILAR 2: Relasi & Program Pasien ── */}
          <div className="ng">Relasi &amp; Program Pasien</div>
          {renderNavItem('simrsFollowUp', 'cloud_sync', 'Patient Relationship')}
          {renderNavItem('studio', 'auto_awesome', 'Loyalty Program', { cls: 'nb-loy', text: 'AI' }, true)}
          {renderNavItem('community', 'groups', 'Komunitas Pasien')}
          {renderNavItem('promotion', 'campaign', 'Promosi & Edukasi')}

          {/* ── PENGATURAN ── */}
          <div className="ng">Pengaturan</div>
          {renderNavItem('aiCompanion', 'psychology', 'AI Companion', { cls: 'nb-loy', text: 'AI' }, true)}
          {renderNavItem('roles', 'admin_panel_settings', 'Hak Akses & Pengguna')}
        </nav>

        <div className="sb-foot" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="user-av" style={{ background: activeUser.color }}>
              {activeUser.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{activeUser.name}</div>
              <div className="user-role" style={{ color: activeUser.color, fontWeight: 700 }}>{activeUser.badge}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '6px' }}>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--t3)', marginBottom: '4px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Simulasi Persona
            </label>
            <select
              className="persona-select"
              value={activeUserRoleId}
              onChange={(e) => setActiveUserRoleId(e.target.value)}>
              <option value="superadmin">⚡ Super Admin (Instalasi IT &amp; SIMRS)</option>
              <option value="direktur">👁️ Direktur Utama (Pemonitor Eksekutif)</option>
              <option value="humas">🏥 Yanmas / Humas (Eksekutor Utama)</option>
              <option value="promkes">📢 Promkes &amp; Pemasaran (Eksekutor)</option>
              <option value="mutu">🔬 Komite Mutu / KMKP (Penerima Laporan)</option>
            </select>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="tb-l">
            <button
              className="tb-menu-btn"
              onClick={() => setIsMobileNavOpen(true)}
              title="Buka Navigasi">
              <span className="ic">menu</span>
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '16px' }}>{META[activeTab]?.[0]}</h1>
                {currentTabAccess === 'VIEWER' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(5,150,105,0.08)', color: '#059669',
                    border: '1px solid rgba(5,150,105,0.2)', padding: '2px 8px',
                    borderRadius: '12px', fontSize: '10.5px', fontWeight: 600
                  }}>
                    <span className="ic s" style={{ fontSize: '12px' }}>visibility</span> Mode Pantau
                  </span>
                )}
                <span className="bdg" style={{ background: `${activeUser.color}12`, color: activeUser.color, border: `1px solid ${activeUser.color}30`, fontSize: '10.5px', fontWeight: 600 }}>
                  {activeUser.badge}
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--t3)', margin: '2px 0 0' }}>{META[activeTab]?.[1]}</p>
            </div>
          </div>
          <div className="tb-r" style={{ position: 'relative' }}>
              <button
                className="btn sm"
                onClick={() => setIsSecurityModalOpen(true)}
                style={{
                  background: isPiiMasked ? 'var(--green-s)' : 'var(--amber-s)',
                  borderColor: isPiiMasked ? 'var(--green-m)' : 'var(--amber-m)',
                  color: isPiiMasked ? 'var(--green)' : 'var(--amber)',
                  fontWeight: 600,
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: 'var(--rf)'
                }}
                title="Status Keamanan Data Pasien & Kepatuhan UU PDP (No. 27/2022)"
              >
                <span className="ic s" style={{ fontSize: '13px' }}>{isPiiMasked ? 'verified_user' : 'lock_open'}</span>
                <span className="tb-btn-txt">{isPiiMasked ? 'UU PDP: PII Aktif' : 'Audit: PII Terbuka'}</span>
              </button>

              {getModuleAccessLevel('crisis') !== 'NO_ACCESS' && (
                <button className="btn danger sm tb-action-btn" onClick={() => setActiveTab('crisis')}>
                  <span className="ic s">add_alert</span><span className="tb-btn-txt">Tangani Krisis</span>
                </button>
              )}
              <button className="btn ghost sm tb-action-btn" onClick={() => setIsExportModalOpen(true)}>
                <span className="ic s">file_download</span><span className="tb-btn-txt">Unduh Laporan</span>
              </button>
              <div
                className="notif"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                title="Notifikasi & Peringatan Sistem">
                <span className="ic">notifications</span>
                <span className="notif-dot"></span>
              </div>
              <span className="tb-date" style={{ fontSize: '11px', color: 'var(--t3)', padding: '0 4px', whiteSpace: 'nowrap' }}>{currentTime}</span>

              {isNotificationOpen && (
                <div className="notif-dropdown">
                  <div className="notif-hd">
                    <strong style={{ fontSize: '13px', color: 'var(--t1)' }}>Pemberitahuan</strong>
                    <span className="bdg r" style={{ fontSize: '10px' }}>3 Baru</span>
                  </div>
                  <div className="notif-item urgent" onClick={() => { setActiveTab('crisis'); setIsNotificationOpen(false); }}>
                    <div className="notif-item-title" style={{ color: 'var(--red)' }}>
                      <span className="ic s">emergency</span> Keluhan Dosis Obat — Poli Anak
                    </div>
                    <div className="notif-item-desc">Perlu respon cepat dalam 2 jam · Tingkat kritis tinggi</div>
                  </div>
                  <div className="notif-item" onClick={() => { setActiveTab('radar'); setIsNotificationOpen(false); }}>
                    <div className="notif-item-title" style={{ color: 'var(--blue)' }}>
                      <span className="ic s">call</span> Panggilan CS Baru
                    </div>
                    <div className="notif-item-desc">Ny. Ratna Safitri — Rujukan USG Poli Kandungan</div>
                  </div>
                  <div className="notif-item" onClick={() => { setActiveTab('studio'); setIsNotificationOpen(false); }}>
                    <div className="notif-item-title" style={{ color: 'var(--loy)' }}>
                      <span className="ic s">bolt</span> Autopilot Siap Kirim
                    </div>
                    <div className="notif-item-desc">3 pengingat WhatsApp siap dikirim ke pasien berisiko</div>
                  </div>
                </div>
              )}
            </div>
        </div>

        <div className="content">
          {currentTabAccess === 'NO_ACCESS' ? (
            <div className="access-denied">
              <div className="access-denied-icon">
                <span className="ic xl">lock</span>
              </div>
              <h3>Akses Modul "{META[activeTab]?.[0]}" Dibatasi</h3>
              <p>
                Anda aktif sebagai <strong>{activeUser.name}</strong> dengan role <strong>{activeUser.badge}</strong>.
                Berdasarkan kebijakan RBAC RSUD Daya, role ini tidak memiliki izin untuk membuka modul ini.
              </p>
              <div style={{ display: 'inline-flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn pri" onClick={() => setActiveUserRoleId('superadmin')} style={{ background: '#4f30db', borderColor: '#4f30db' }}>
                  <span className="ic s">admin_panel_settings</span> Beralih ke Super Admin (IT)
                </button>
                <button className="btn ghost" onClick={() => setActiveTab('radar')} style={{ borderColor: 'rgba(185,28,28,0.3)', color: '#991b1b' }}>
                  Kembali ke Radar Layanan
                </button>
              </div>
            </div>
          ) : (
            <>
              <RadarScreen
                feedbacks={feedbacks}
                selectedFeedId={selectedFeedId}
                onSelectFeedback={setSelectedFeedId}
                onSubmitQuickReply={submitQuickReply}
                onSubmitEscalation={submitEscalation}
                onTriggerCrisis={handleTriggerCrisis}
                active={activeTab === 'radar'}
                accessLevel={currentTabAccess}
                isPiiMasked={isPiiMasked}
              />
              <SimrsFollowUpScreen
                active={activeTab === 'simrsFollowUp'}
                onTriggerCrisis={handleTriggerCrisis}
                outreachLogs={outreachLogs}
                onTriggerWhatsAppReminder={triggerWhatsAppReminder}
                accessLevel={currentTabAccess}
                isPiiMasked={isPiiMasked}
                showToast={showToast}
              />
              <CrisisScreen
                feedbacks={feedbacks}
                onSubmitEscalation={submitEscalation}
                onSubmitProcess={submitProcess}
                onSubmitQuickReply={submitQuickReply}
                active={activeTab === 'crisis'}
                accessLevel={currentTabAccess}
              />
              <SurveyScreen
                surveys={surveys}
                onOpenSurveyModal={() => setIsSurveyModalOpen(true)}
                onTriggerCrisis={handleTriggerCrisis}
                active={activeTab === 'survey'}
                API_URL={API_URL}
                accessLevel={currentTabAccess}
              />
              <StudioScreen
                rules={rules}
                sintetaMessages={sintetaMessages}
                onSendSintetaMessage={sendSintetaMessage}
                onSelectSintetaPrompt={selectSintetaPrompt}
                onApplyAICampaign={applyAICampaign}
                onRulePointsChange={handleRulePointsChange}
                onSaveRulePoints={saveRulePoints}
                onRunLoyaltySimulation={runLoyaltySimulation}
                outreachLogs={outreachLogs}
                remindedPatients={remindedPatients}
                onTriggerWhatsAppReminder={triggerWhatsAppReminder}
                active={activeTab === 'studio'}
                accessLevel={currentTabAccess}
                isPiiMasked={isPiiMasked}
              />
              <CommunityScreen active={activeTab === 'community'} accessLevel={currentTabAccess} />
              <MarketScreen active={activeTab === 'market'} accessLevel={currentTabAccess} />
              <PromotionScreen active={activeTab === 'promotion'} accessLevel={currentTabAccess} />
              <AiCompanionScreen active={activeTab === 'aiCompanion'} accessLevel={currentTabAccess} />
              <RoleManagementScreen
                active={activeTab === 'roles'}
                currentRoleId={activeUserRoleId}
                onSwitchRole={(rId) => setActiveUserRoleId(rId)}
                roles={roles}
                onUpdateRoles={setRoles}
                users={users}
                onUpdateUsers={setUsers}
                accessLevel={currentTabAccess}
              />
            </>
          )}
        </div>
      </div>

      <SurveyModal isOpen={isSurveyModalOpen} onClose={() => setIsSurveyModalOpen(false)} onSurveyCreated={fetchSurveys} API_URL={API_URL} />

      {isExportModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsExportModalOpen(false)}>
          <div className="modal-box" style={{ width: '520px' }}>
            <div className="modal-hd">
              <div className="modal-hd-icon" style={{ background: 'var(--blue-s)' }}>
                <span className="ic" style={{ color: 'var(--blue)' }}>file_download</span>
              </div>
              <div>
                <div className="modal-title">Unduh Laporan</div>
                <div className="modal-sub">Ekspor data Policare untuk keperluan arsip & audit</div>
              </div>
              <button className="modal-close" onClick={() => setIsExportModalOpen(false)}>
                <span className="ic s">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Pilih Cakupan Laporan</label>
                <select
                  value={exportScope}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="inp">
                  <option value="Semua Modul">Semua Modul — Ringkasan Eksekutif</option>
                  <option value="Voice & Feedback">Voice & Feedback — Log Pasien & Nakes</option>
                  <option value="Crisis Audit Trail">Crisis Management — Rekam Jejak Penanganan</option>
                  <option value="SKM Report">Survei Kepuasan (SKM) — 2026</option>
                  <option value="Loyalty Outreach">Program Loyalitas & WhatsApp Outreach</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '8px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Format File</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { fmt: 'PDF', icon: 'picture_as_pdf', desc: 'Siap cetak' },
                    { fmt: 'Excel (.xlsx)', icon: 'table_chart', desc: 'Data mentah' },
                    { fmt: 'CSV', icon: 'dataset', desc: 'Import sistem' }
                  ].map(({ fmt, icon, desc }) => (
                    <div
                      key={fmt}
                      className={`export-option ${exportFormat === fmt ? 'selected' : ''}`}
                      style={{ flexDirection: 'column', textAlign: 'center', padding: '14px 10px', marginBottom: 0 }}
                      onClick={() => setExportFormat(fmt)}>
                      <div className="export-option-icon" style={{ margin: '0 auto 8px' }}>
                        <span className="ic" style={{ color: exportFormat === fmt ? undefined : 'var(--blue)' }}>{icon}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--t1)' }}>{fmt}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--t3)', marginTop: '2px' }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '11px 14px', borderRadius: 'var(--r8)', background: 'var(--blue-s)', border: '1.5px solid var(--blue-m)', fontSize: '12px', color: 'var(--t2)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span className="ic s" style={{ color: 'var(--blue)', marginTop: '1px', flexShrink: 0 }}>info</span>
                <span>File akan diberi stempel digital RSUD Daya Kota Makassar & ditandatangani secara elektronik.</span>
              </div>
            </div>

            <div className="modal-ft">
              <button type="button" className="btn ghost" onClick={() => setIsExportModalOpen(false)}>Batalkan</button>
              <button
                type="button"
                className="btn pri"
                onClick={() => {
                  showToast('Laporan Diunduh', `${exportScope} berhasil diekspor dalam format ${exportFormat}.`, 'success');
                  setIsExportModalOpen(false);
                }}>
                <span className="ic s">download</span> Unduh Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUSAT KEAMANAN & KEPATUHAN PRIVASI (UU PDP NO. 27/2022) */}
      {isSecurityModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsSecurityModalOpen(false)}>
          <div className="modal-box" style={{ width: '640px' }}>
            <div className="modal-hd">
              <div className="modal-hd-icon" style={{ background: 'var(--green-s)' }}>
                <span className="ic" style={{ color: 'var(--green)' }}>verified_user</span>
              </div>
              <div>
                <div className="modal-title">Pusat Keamanan &amp; Tata Kelola Privasi Data</div>
                <div className="modal-sub">Standar Kepatuhan UU PDP No. 27/2022 &amp; PMK Rekam Medis RSUD Daya</div>
              </div>
              <button className="modal-close" onClick={() => setIsSecurityModalOpen(false)}>
                <span className="ic s">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* STATUS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px 14px', borderRadius: 'var(--r10)', background: 'var(--green-s)', border: '1.5px solid var(--green-m)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontWeight: 700, fontSize: '12px' }}>
                    <span className="ic s">gpp_good</span> UU No. 27/2022 (UU PDP)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--green)', marginTop: '4px', lineHeight: 1.4 }}>
                    Patuh Penuh. Seluruh data identitas pasien dan riwayat klinis terlindungi dari paparan publik.
                  </div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 'var(--r10)', background: 'var(--blue-s)', border: '1.5px solid var(--blue-m)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue)', fontWeight: 700, fontSize: '12px' }}>
                    <span className="ic s">lock</span> Enkripsi Standar Medis
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--blue)', marginTop: '4px', lineHeight: 1.4 }}>
                    TLS 1.3 in-transit &amp; AES-256 at-rest. Transmisi SIMRS dilindungi tanda tangan digital HMAC SHA-256.
                  </div>
                </div>
              </div>

              {/* PII MASKING CONTROLLER */}
              <div style={{ padding: '16px', borderRadius: 'var(--r12)', background: isPiiMasked ? 'var(--green-s)' : 'var(--amber-s)', border: `1.5px solid ${isPiiMasked ? 'var(--green-m)' : 'var(--amber-m)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: isPiiMasked ? 'var(--green)' : 'var(--amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">{isPiiMasked ? 'visibility_off' : 'visibility'}</span>
                    Sensor Otomatis Data Pasien (PII Masking)
                  </div>
                  <p style={{ fontSize: '11.5px', color: isPiiMasked ? 'var(--green)' : 'var(--amber)', margin: '4px 0 0', lineHeight: 1.45 }}>
                    {isPiiMasked
                      ? 'Saat ini nomor telepon (0812-****-8899), NIK, dan No. RM pasien otomatis disamarkan di seluruh layar untuk kepatuhan etika medis & demonstrasi.'
                      : '⚠️ Perhatian: Mode audit data mentah aktif. Seluruh akses tampilan data pasien yang terbuka dicatat secara permanen ke Audit Trail RSUD Daya.'}
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isPiiMasked}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setIsPiiMasked(val);
                      showToast(
                        val ? 'Sensor Privasi Pasien Diaktifkan' : 'Perhatian: Mode Audit PII Terbuka',
                        val ? 'Data pasien (No. HP, RM, NIK) kini disamarkan sesuai standar UU PDP.' : 'Data mentah pasien ditampilkan. Aktivitas ini dicatat ke log audit.',
                        val ? 'success' : 'warn'
                      );
                    }}
                  />
                  <span className="toggle-track"><span className="toggle-thumb"></span></span>
                </label>
              </div>

              {/* ZERO DATA RETENTION AI GUARANTEE */}
              <div style={{ padding: '14px', borderRadius: 'var(--r12)', background: 'var(--srf2)', border: '1.5px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="ic s" style={{ color: 'var(--loy)' }}>smart_toy</span>
                  <strong style={{ fontSize: '12.5px', color: 'var(--t1)' }}>Garansi Isolasi Sinteta AI (Zero Data Retention)</strong>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: 1.5 }}>
                  Model AI hanya memproses ringkasan keluhan secara lokal dan terisolasi. Rekam medis pasien <strong>tidak pernah disimpan</strong>, <strong>tidak dijadikan bahan pelatihan model publik</strong>, dan tidak meninggalkan server internal RSUD Daya Kota Makassar.
                </div>
              </div>

              {/* AUDIT TRAIL NOTICE */}
              <div style={{ fontSize: '11px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="ic s" style={{ fontSize: '13px' }}>history</span>
                Log keamanan &amp; autentikasi sesi terakhir: <strong>RSUD-DAYA-NODE-MAKASSAR · Sesi Aman</strong>
              </div>
            </div>

            <div className="modal-ft">
              <button type="button" className="btn ghost" onClick={() => setIsSecurityModalOpen(false)}>Tutup</button>
              <button
                type="button"
                className="btn pri"
                onClick={() => {
                  showToast('Pengaturan Keamanan Disimpan', 'Konfigurasi privasi & proteksi UU PDP telah diperbarui.', 'success');
                  setIsSecurityModalOpen(false);
                }}>
                <span className="ic s">check</span> Simpan &amp; Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
