import React, { useState } from 'react';
import { INITIAL_RBA_OFFICIAL_DATA } from '../data/rbaOfficialData';
import { INITIAL_MULTI_PENGADAAN_REALISASI } from '../data/realisasiMultiPengadaanData';

/* ─────────────────────────────────────────────────────────────────────────────
 *  ProcurementScreen.jsx
 *  Sistem Pengadaan Barang & Jasa BLUD — Policare Dashboard (Business & Operational Suite)
 *
 *  Dirancang berdasarkan 4 Lampiran Utama:
 *  1. Master Data & Database Surat (Lampiran 1)
 *  2. Registrasi RBA & DPA Baseline (Lampiran 2) - Pokok vs Perubahan
 *  3. Seamless Excel Import & Alur Dokumen Pengadaan (Lampiran 3)
 *  4. Dashboard Monitoring & Cek Realisasi (Lampiran 4) - Barang vs Jasa
 * ─────────────────────────────────────────────────────────────────────────────*/

// Helper: Converter nominal angka ke Terbilang Bahasa Indonesia
function terbilang(n) {
  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  n = Math.floor(Math.abs(n));
  if (n < 12) return angka[n];
  if (n < 20) return terbilang(n - 10) + ' Belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
  if (n < 200) return 'Seratus ' + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
  if (n < 2000) return 'Seribu ' + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' Juta ' + terbilang(n % 1000000);
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' Milyar ' + terbilang(n % 1000000000);
  return '';
}

export default function ProcurementScreen({ active }) {
  // Main Top View: 'rba' (Lampiran 2), 'pengadaan' (Lampiran 3), 'dashboard' (Lampiran 4), 'master' (Lampiran 1)
  const [mainTab, setMainTab] = useState('rba');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  // View state inside 'pengadaan' tab
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab] = useState('ringkasan'); // 'ringkasan' | 'nego' | 'bappInspect' | 'lampiran' | 'berkas' | 'cetakDoc'
  const [wizardStep, setWizardStep] = useState(1);
  const [filterStage, setFilterStage] = useState('all');
  const [filterKat, setFilterKat] = useState('all');
  const [docPrintType, setDocPrintType] = useState('dp'); // 'nego' | 'dp' | 'bapp' | 'bast' | 'bap' | 'kuitansi'
  const [dashView, setDashView] = useState('uang'); // 'uang' | 'barang'
  const [expandedRba, setExpandedRba] = useState(null); // which rba row is drilled-down

  // Mobile Inspection Mode Toggle for BAPP
  const [isMobileBappMode, setIsMobileBappMode] = useState(false);

  // Saved Custom Accounts State & Modal (Kode Rekening & Uraian History Persistence)
  const [savedCustomAccounts, setSavedCustomAccounts] = useState([
    {
      kode: '1.02.01.2.10.0001.5.1.02.01.001.00024',
      uraian: 'Belanja Barang dan Jasa BLUD (Belanja Alat Tulis Kantor untuk Bulan Maret 2026)',
      kegiatan: 'Peningkatan Pelayanan BLUD',
      subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
      opd: 'Dinas Kesehatan — Puskesmas Tamalanrea',
    },
    {
      kode: '1.02.01.2.10.0001.5.1.02.01.001.00088',
      uraian: 'Belanja Bahan Medis Habis Pakai (BMHP) & Reagen Laboratorium',
      kegiatan: 'Peningkatan Pelayanan BLUD',
      subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
      opd: 'Dinas Kesehatan — Puskesmas Tamalanrea',
    },
    {
      kode: '1.02.01.2.10.0001.5.1.02.02.001.00012',
      uraian: 'Belanja Pemeliharaan Peralatan dan Mesin BLUD',
      kegiatan: 'Peningkatan Pelayanan BLUD',
      subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
      opd: 'Dinas Kesehatan — Puskesmas Tamalanrea',
    },
  ]);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    kode: '',
    uraian: '',
    kegiatan: 'Peningkatan Pelayanan BLUD',
    subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
    opd: 'Dinas Kesehatan — Puskesmas Tamalanrea',
  });

  // External Attachments Modal State (KTP Vendor, NPWP, Rek Koran, Foto Barang, etc.)
  const [isAddAttachmentModalOpen, setIsAddAttachmentModalOpen] = useState(false);
  const [newAttachmentForm, setNewAttachmentForm] = useState({
    nama: '',
    kategori: 'Legalitas Vendor',
    fileUrl: '',
    catatan: '',
    tglUpload: '',
  });

  // Excel Seamless Import Modal State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [rawPastedText, setRawPastedText] = useState('');
  const [parsedExcelItems, setParsedExcelItems] = useState([]);
  const [excelTargetPaketId, setExcelTargetPaketId] = useState(null);

  // BPKAD Audit Export Modal State
  const [isExportBpkadModalOpen, setIsExportBpkadModalOpen] = useState(false);
  const [exportReportType, setExportReportType] = useState('rba_realisasi'); // 'rba_realisasi' | 'register_spj' | 'rekap_pajak' | 'audit_fisik'
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  // Signer Roles State & Management (Requirement 2)
  const [editingSignerId, setEditingSignerId] = useState(null);
  const [editingSignerData, setEditingSignerData] = useState(null);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    title: '',
    nama: '',
    nip: '',
    jabatan: '',
    tugas: ['BAST'],
    aksesType: 'Penandatangan Utama & Approval Final',
    color: '#3b82f6',
    icon: 'person',
  });

  // Vendor State & Management (Requirement 1)
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    id: '',
    nama: '',
    npwp: '',
    norek: '',
    bank: 'Bank Sulselbar',
    direktur: '',
    telp: '',
    alamat: '',
  });

  // Custom Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    type: null, // 'signer' | 'vendor'
    id: null,
    title: '',
    subtitle: '',
    detail: '',
  });

  const triggerDeleteSigner = (signer) => {
    setDeleteModalState({
      isOpen: true,
      type: 'signer',
      id: signer.id,
      title: signer.title,
      subtitle: `${signer.nama || 'Tanpa Nama'} (${signer.jabatan || 'Tanpa Jabatan'})`,
      detail: `NIP: ${signer.nip || '-'} | Akses: ${signer.aksesType}`,
    });
  };

  const triggerDeleteVendor = (vendor) => {
    setDeleteModalState({
      isOpen: true,
      type: 'vendor',
      id: vendor.id,
      title: vendor.nama,
      subtitle: `ID Vendor: ${vendor.id} | NPWP: ${vendor.npwp || '-'}`,
      detail: `Bank: ${vendor.norek} (${vendor.bank}) | Pimpinan: ${vendor.direktur || '-'}`,
    });
  };

  const confirmExecuteDelete = () => {
    const { type, id } = deleteModalState;
    if (type === 'signer') {
      setMasterData((prev) => ({
        ...prev,
        signers: prev.signers.filter((s) => s.id !== id),
      }));
    } else if (type === 'vendor') {
      setMasterData((prev) => ({
        ...prev,
        vendors: prev.vendors.filter((v) => v.id !== id),
      }));
    }
    setDeleteModalState({ isOpen: false, type: null, id: null, title: '', subtitle: '', detail: '' });
  };

  // Process Definition for Granular Permission Matrix (User Request)
  const PROCESS_DEF = [
    { key: 'DPA', label: 'RBA / DPA (Perencanaan)' },
    { key: 'SPK', label: 'Surat Pesanan / SPK' },
    { key: 'BAPP', label: 'BAPP (Pemeriksaan Fisik)' },
    { key: 'BAST', label: 'BASTHP (Serah Terima)' },
    { key: 'BAP', label: 'BAP (Berita Acara Bayar)' },
    { key: 'Kwitansi', label: 'Kuitansi Terbit & Lunas' },
    { key: 'Realisasi', label: 'Monitoring Realisasi' },
  ];

  const getSignerMatrix = (signer) => {
    if (signer && signer.processMatrix) return signer.processMatrix;
    const legacyTugas = (signer && signer.tugas) || [];
    const matrix = {};
    PROCESS_DEF.forEach((proc) => {
      const isAssigned = legacyTugas.includes(proc.key);
      matrix[proc.key] = {
        view: true,
        edit: isAssigned && (proc.key === 'DPA' || proc.key === 'SPK' || proc.key === 'BAPP' || proc.key === 'BAST'),
        ttd: isAssigned && proc.key !== 'Realisasi',
        approve: isAssigned,
      };
    });
    return matrix;
  };

  // ---------------------------------------------------------------------------
  // LAMPIRAN 1: MASTER DATA STATE
  // ---------------------------------------------------------------------------
  const [masterData, setMasterData] = useState({
    puskesmas: {
      nama: 'PUSKESMAS TAMALANREA',
      alamat: 'Jl. Kesejahteraan Timur BTP Blok B Telp. (0411) 582 289',
      telp: '(0411) 582 289',
      email: 'Pkmtamalanrea@gmail.com',
      kota: 'Makassar',
    },
    kapus: {
      nama: 'drg. Weri L.P. Saroengoe',
      nip: '196905172006042009',
      jabatan: 'Pemimpin BLUD',
      role: 'Pemimpin BLUD Selaku Pejabat Pembuat Komitmen / Kuasa Pengguna Anggaran',
      alamat: 'Jl. Kesejahteraan Timur 1 BTP Blok B Makassar',
      pangkat: 'Pembina / IV.a',
    },
    bendahara: {
      nama: 'Sri Sartika. S.Gz',
      nip: '19940926 202203 2 009',
      jabatan: 'Bendahara Pengeluaran BLUD',
    },
    petugasBarang: {
      nama: 'Muhammad Aris, S.Kom',
      nip: '19900315 201503 1 008',
      jabatan: 'Pengurus / Petugas Barang BLUD',
    },
    pptk: {
      nama: 'H. Sudirman, SKM, M.Adm.Kes',
      nip: '19801104 200604 1 009',
      jabatan: 'Pejabat Pelaksana Teknis Kegiatan (PPTK)',
    },
    signers: [
      {
        id: 'SIG-001',
        roleKey: 'kapus',
        title: 'DATA PEMIMPIN BLUD / PPK / KPA',
        nama: 'drg. Weri L.P. Saroengoe',
        nip: '196905172006042009',
        jabatan: 'Pemimpin BLUD Selaku Pejabat Pembuat Komitmen',
        color: '#3b82f6',
        icon: 'person',
        tugas: ['SPK', 'BAST', 'BAP', 'Kwitansi', 'DPA'],
        aksesType: 'Penandatangan Utama & Approval Final',
        processMatrix: {
          DPA: { view: true, edit: true, ttd: true, approve: true },
          SPK: { view: true, edit: false, ttd: true, approve: true },
          BAPP: { view: true, edit: false, ttd: true, approve: true },
          BAST: { view: true, edit: false, ttd: true, approve: true },
          BAP: { view: true, edit: false, ttd: true, approve: true },
          Kwitansi: { view: true, edit: false, ttd: true, approve: true },
          Realisasi: { view: true, edit: false, ttd: false, approve: true },
        },
      },
      {
        id: 'SIG-002',
        roleKey: 'pptk',
        title: 'DATA PPTK (Pejabat Pelaksana Teknis)',
        nama: 'H. Sudirman, SKM, M.Adm.Kes',
        nip: '19801104 200604 1 009',
        jabatan: 'Pejabat Pelaksana Teknis Kegiatan (PPTK)',
        color: '#8b5cf6',
        icon: 'assignment_ind',
        tugas: ['SPK', 'DPA'],
        aksesType: 'Pejabat Pelaksana Teknis & Verifikator RAB',
        processMatrix: {
          DPA: { view: true, edit: true, ttd: true, approve: true },
          SPK: { view: true, edit: true, ttd: true, approve: true },
          BAPP: { view: true, edit: true, ttd: false, approve: true },
          BAST: { view: true, edit: false, ttd: false, approve: false },
          BAP: { view: true, edit: false, ttd: false, approve: false },
          Kwitansi: { view: true, edit: false, ttd: false, approve: false },
          Realisasi: { view: true, edit: false, ttd: false, approve: false },
        },
      },
      {
        id: 'SIG-003',
        roleKey: 'bendahara',
        title: 'DATA BENDAHARA PENGELUARAN',
        nama: 'Sri Sartika. S.Gz',
        nip: '19940926 202203 2 009',
        jabatan: 'Bendahara Pengeluaran BLUD',
        color: '#10b981',
        icon: 'payments',
        tugas: ['BAP', 'Kwitansi'],
        aksesType: 'Verifikasi Pembayaran & Pencairan Keuangan',
        processMatrix: {
          DPA: { view: true, edit: false, ttd: false, approve: false },
          SPK: { view: true, edit: false, ttd: false, approve: false },
          BAPP: { view: true, edit: false, ttd: false, approve: false },
          BAST: { view: true, edit: false, ttd: false, approve: false },
          BAP: { view: true, edit: true, ttd: true, approve: true },
          Kwitansi: { view: true, edit: true, ttd: true, approve: true },
          Realisasi: { view: true, edit: false, ttd: false, approve: false },
        },
      },
      {
        id: 'SIG-004',
        roleKey: 'petugasBarang',
        title: 'DATA PETUGAS / PENGURUS BARANG',
        nama: 'Muhammad Aris, S.Kom',
        nip: '19900315 201503 1 008',
        jabatan: 'Pengurus / Petugas Barang BLUD',
        color: '#f59e0b',
        icon: 'inventory',
        tugas: ['BAPP', 'BAST'],
        aksesType: 'Pemeriksaan Fisik Barang & BASTHP',
        processMatrix: {
          DPA: { view: true, edit: false, ttd: false, approve: false },
          SPK: { view: true, edit: false, ttd: false, approve: false },
          BAPP: { view: true, edit: true, ttd: true, approve: true },
          BAST: { view: true, edit: true, ttd: true, approve: true },
          BAP: { view: true, edit: false, ttd: false, approve: false },
          Kwitansi: { view: true, edit: false, ttd: false, approve: false },
          Realisasi: { view: true, edit: false, ttd: false, approve: false },
        },
      },
    ],
    vendors: [
      {
        id: 'VND-001',
        nama: 'CV. BARA UTAMA PERSADA',
        npwp: '01.345.678.9-801.000',
        norek: '1000-2938-4821',
        bank: 'Bank Sulselbar',
        direktur: 'Akbar',
        alamat: 'Jl. Politeknik No. 74, Kelurahan Tamalanrea Indah, Kec. Tamalanrea, Kota Makassar',
        telp: '0812-4112-9988',
      },
      {
        id: 'VND-002',
        nama: 'PT. SYSMEX INDONESIA',
        npwp: '02.998.112.4-015.000',
        norek: '554-0091-2234',
        bank: 'Bank Mandiri',
        direktur: 'Herry Wibowo, S.Si',
        alamat: 'Menara Palma Lt. 12, Jakarta / Cab. Makassar',
        telp: '0811-9982-100',
      },
      {
        id: 'VND-003',
        nama: 'PT. MEDITECH NUSANTARA',
        npwp: '03.771.554.1-805.000',
        norek: '882-0192-3311',
        bank: 'Bank BCA',
        direktur: 'Ir. Ahmad Zulkarnain',
        alamat: 'Jl. Veteran Selatan No. 120, Makassar',
        telp: '0852-9911-4433',
      },
    ],
    suratRules: {
      prefixSP: 'KEU-DP/PKM.TREA',
      prefixBAPP: 'KEU-BAPP/PKM.TREA',
      prefixBAST: 'KEU-BASTHP/PKM.TREA',
      prefixBAP: 'KEU-BAP/PKM.TREA',
      counter: 25,
    },
  });

  // Signer Role Handlers (Requirement 2)
  const handleSaveSignerEdit = () => {
    if (!editingSignerData) return;
    setMasterData((prev) => {
      const updatedSigners = prev.signers.map((s) => (s.id === editingSignerData.id ? { ...editingSignerData } : s));
      const kapus = updatedSigners.find((s) => s.roleKey === 'kapus') || prev.kapus;
      const pptk = updatedSigners.find((s) => s.roleKey === 'pptk') || prev.pptk;
      const bendahara = updatedSigners.find((s) => s.roleKey === 'bendahara') || prev.bendahara;
      const petugasBarang = updatedSigners.find((s) => s.roleKey === 'petugasBarang') || prev.petugasBarang;
      return {
        ...prev,
        signers: updatedSigners,
        kapus: { ...prev.kapus, nama: kapus.nama, nip: kapus.nip, jabatan: kapus.jabatan },
        pptk: { ...prev.pptk, nama: pptk.nama, nip: pptk.nip, jabatan: pptk.jabatan },
        bendahara: { ...prev.bendahara, nama: bendahara.nama, nip: bendahara.nip, jabatan: bendahara.jabatan },
        petugasBarang: { ...prev.petugasBarang, nama: petugasBarang.nama, nip: petugasBarang.nip, jabatan: petugasBarang.jabatan },
      };
    });
    setEditingSignerId(null);
    setEditingSignerData(null);
  };

  const handleDeleteSigner = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus role penandatangan ini?')) {
      setMasterData((prev) => ({
        ...prev,
        signers: prev.signers.filter((s) => s.id !== id),
      }));
    }
  };

  const handleAddNewRole = () => {
    if (!newRoleForm.title || !newRoleForm.nama) {
      alert('Mohon isi Judul Role dan Nama Pejabat.');
      return;
    }
    const newId = `SIG-00${masterData.signers.length + 1}`;
    const newSigner = {
      id: newId,
      ...newRoleForm,
    };
    setMasterData((prev) => ({
      ...prev,
      signers: [...prev.signers, newSigner],
    }));
    setIsAddRoleModalOpen(false);
    setNewRoleForm({
      title: '',
      nama: '',
      nip: '',
      jabatan: '',
      tugas: ['BAST'],
      aksesType: 'Penandatangan Utama & Approval Final',
      color: '#3b82f6',
      icon: 'person',
    });
  };

  // Vendor Handlers (Requirement 1)
  const handleOpenAddVendor = () => {
    const nextNum = masterData.vendors.length + 1;
    setVendorForm({
      id: `VND-00${nextNum}`,
      nama: '',
      npwp: '',
      norek: '',
      bank: 'Bank Sulselbar',
      direktur: '',
      telp: '',
      alamat: '',
    });
    setEditingVendorId(null);
    setIsVendorModalOpen(true);
  };

  const handleOpenEditVendor = (v) => {
    setVendorForm({ ...v });
    setEditingVendorId(v.id);
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = () => {
    if (!vendorForm.nama) {
      alert('Nama perusahaan vendor wajib diisi.');
      return;
    }
    if (editingVendorId) {
      setMasterData((prev) => ({
        ...prev,
        vendors: prev.vendors.map((v) => (v.id === editingVendorId ? { ...vendorForm } : v)),
      }));
    } else {
      setMasterData((prev) => ({
        ...prev,
        vendors: [...prev.vendors, { ...vendorForm }],
      }));
    }
    setIsVendorModalOpen(false);
  };

  const handleDeleteVendor = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus vendor ini dari database rekanan?')) {
      setMasterData((prev) => ({
        ...prev,
        vendors: prev.vendors.filter((v) => v.id !== id),
      }));
    }
  };

  // ---------------------------------------------------------------------------
  // LAMPIRAN 2: RBA - Sub navigation
  const [rbaSubTab, setRbaSubTab] = useState('aktif'); // 'aktif' | 'revisi' | 'riwayat'

  // RBA Pokok (baseline, always read-only)
  const [rbaPokok, setRbaPokok] = useState({
    dpaNomor: 'DPA/A.1/1.02.0.00.0.00.01.0000/001/2026',
    tglDpa: '02 Januari 2026',
    diterbitkanOleh: 'Walikota Makassar',
    tglAccBpkad: '15 Januari 2026',
    totalPagu: 444000000,
  });

  // RBA Perubahan Aktif (null = belum ada, hanya berlaku setelah proses formal)
  const [rbaPerubahanAktif, setRbaPerubahanAktif] = useState({
    dpaNomor: 'DPA/A.1/1.02.0.00.0.00.01.0000/001-P/2026',
    tglDpa: '25 Mei 2026',
    diterbitkanOleh: 'Walikota Makassar',
    tglAccBpkad: '20 Mei 2026',
    noDpaBaru: 'DPA/A.1/1.02.0.00.0.00.01.0000/001-P/2026',
    alasanRevisi: 'Peningkatan kebutuhan obat-obatan dan penambahan volume layanan laboratorium akibat lonjakan pasien Q1 2026.',
    noSuratPermohonan: '440/RS.ANANDA/V/2026',
    revisiKe: 1,
    totalPagu: 533000000,
    berlakuSejak: '25 Mei 2026',
  });

  // Which version is the ACTIVE acuan for the system (dashboard/calculations)
  const [rbaAcuanAktif, setRbaAcuanAktif] = useState('perubahan'); // 'pokok' | 'perubahan'

  // Revision draft state - tracks a revision in-progress
  const [rbaRevisiDraft, setRbaRevisiDraft] = useState(null);
  // Structure: { id, status: 'draft'|'diajukan'|'disetujui'|'ditolak'|'berlaku',
  //   alasan, noSuratPermohonan, tglPermohonan, noDpaBaru, tglDpaBaru,
  //   catatanBpkad, tglKeputusan, items: [...] }

  // Historical revisions
  const [rbaRiwayat] = useState([
    {
      id: 'REV-001',
      revisiKe: 1,
      status: 'berlaku',
      alasan: 'Peningkatan kebutuhan obat-obatan dan penambahan volume layanan laboratorium akibat lonjakan pasien Q1 2026.',
      noSuratPermohonan: '440/RS.ANANDA/V/2026',
      tglPermohonan: '10 Mei 2026',
      tglAccBpkad: '20 Mei 2026',
      noDpaBaru: 'DPA/A.1/1.02.0.00.0.00.01.0000/001-P/2026',
      tglDpaBaru: '25 Mei 2026',
      deltaPagu: '+89.000.000',
      catatanBpkad: 'Disetujui dengan catatan: volume obat generik dibatasi maksimum 1.200 box/botol.',
    },
  ]);

  // Modal for triggering edit mode
  const [rbaUsulModal, setRbaUsulModal] = useState({ open: false, alasan: '' });

  // Working copy of items while in edit mode
  const [rbaEditItems, setRbaEditItems] = useState([]);

  // Alasan revisi yang diisi user di modal warning
  const [rbaRevisiAlasan, setRbaRevisiAlasan] = useState('');
  const [rbaOfficialData, setRbaOfficialData] = useState(INITIAL_RBA_OFFICIAL_DATA);
  const [multiPengadaanData, setMultiPengadaanData] = useState(INITIAL_MULTI_PENGADAAN_REALISASI);
  const [realisasiSearchQuery, setRealisasiSearchQuery] = useState('');
  const [realisasiActiveKategori, setRealisasiActiveKategori] = useState('all');
  const [realisasiViewMode, setRealisasiViewMode] = useState('multi-matrix'); // 'multi-matrix' | 'high-level'
  const [rbaEditOfficialData, setRbaEditOfficialData] = useState(INITIAL_RBA_OFFICIAL_DATA);
  const [rbaFilterSection, setRbaFilterSection] = useState('all'); // 'all' | 'pendapatan' | 'barjas-blud' | 'modal'
  const [rbaActiveScheme, setRbaActiveScheme] = useState('table'); // 'attachment' | 'excel-sync' | 'table'
  
  // Scheme 1: Lampiran Dokumen State
  const [rbaAttachments, setRbaAttachments] = useState([
    { id: 'att-1', nama: 'DPA_Walikota_Makassar_RBA_Definitif_2026.pdf', size: '3.4 MB', tglUpload: '05 Januari 2026', tipe: 'PDF', status: 'Disahkan BPKAD', nomorSurat: 'DPA/A.1/1.02.0.00.0.00.01.0000/001/2026' },
    { id: 'att-2', nama: 'Surat_Keputusan_Pagu_BLUD_Puskesmas_2026.pdf', size: '1.8 MB', tglUpload: '10 Januari 2026', tipe: 'PDF', status: 'SK Walikota', nomorSurat: '440/128/Diskes/I/2026' },
    { id: 'att-3', nama: 'Berita_Acara_Koreksi_RBA_Perubahan_Q1.pdf', size: '2.1 MB', tglUpload: '20 Mei 2026', tipe: 'PDF', status: 'Revisi BPKAD', nomorSurat: 'BA-902/BPKAD/V/2026' },
  ]);
  const [rbaAttachMeta, setRbaAttachMeta] = useState({
    dpaNomor: 'DPA/A.1/1.02.0.00.0.00.01.0000/001/2026',
    tglDpa: '02 Januari 2026',
    paguGlobal: 2138164671,
    pejabatPenerbit: 'Walikota Makassar & BPKAD',
    catatan: 'Dokumen RBA dan DPA Induk telah diverifikasi dan menjadi dasar hukum belanja BLUD T.A. 2026.'
  });

  // Scheme 2: Excel Sync / Mirroring State
  const [excelSyncStatus, setExcelSyncStatus] = useState({
    lastSync: '14 Agustus 2026, 14:30 WITA',
    fileName: 'RBA_Puskesmas_Tamalanrea_TA_2026_Final.xlsx',
    rowCount: 142,
    syncMode: 'Auto Mirroring (Aktif)',
    status: 'Tersinkronisasi 100%'
  });
  const [excelPasteInput, setExcelPasteInput] = useState('');
  const [excelParsedPreview, setExcelParsedPreview] = useState(null);
  
  // Scheme 3: Print Preview Modal State
  const [isRbaPrintPreviewOpen, setIsRbaPrintPreviewOpen] = useState(false);

  // Legacy compat - rbaActiveVersion used by dashboard calculations
  const rbaActiveVersion = rbaAcuanAktif;

  const [rbaItems, setRbaItems] = useState([
    {
      id: 'RBA-001',
      kodeRekening: '1.02.01.2.10.0001.5.1.02.01.001.00024',
      uraian: 'Belanja Alat Tulis Kantor (ATK) Operasional Rutin',
      kategori: 'Barang',
      volPokok: 12,
      volPerubahan: 15,
      satuan: 'Paket Bulanan',
      hpsPokok: 4500000,
      hpsPerubahan: 5000000,
      paguPokok: 54000000,
      paguPerubahan: 75000000,
      terpakai: 24500000,
    },
    {
      id: 'RBA-002',
      kodeRekening: '1.02.01.2.10.0001.5.1.02.01.001.00088',
      uraian: 'Belanja Reagen Hematologi & BHP Laboratorium',
      kategori: 'Barang',
      volPokok: 4,
      volPerubahan: 4,
      satuan: 'Triwulan',
      hpsPokok: 30000000,
      hpsPerubahan: 35000000,
      paguPokok: 120000000,
      paguPerubahan: 140000000,
      terpakai: 34500000,
    },
    {
      id: 'RBA-003',
      kodeRekening: '1.02.01.2.10.0001.5.2.02.05.001.00005',
      uraian: 'Belanja Modal Alat Kesehatan (USG 4D Portable)',
      kategori: 'Barang',
      volPokok: 1,
      volPerubahan: 1,
      satuan: 'Unit',
      hpsPokok: 90000000,
      hpsPerubahan: 90000000,
      paguPokok: 90000000,
      paguPerubahan: 90000000,
      terpakai: 84300000,
    },
    {
      id: 'RBA-004',
      kodeRekening: '1.02.01.2.10.0001.5.1.02.01.001.00031',
      uraian: 'Belanja Obat-Obatan Generik DOEN Pelayanan Puskesmas',
      kategori: 'Barang',
      volPokok: 1000,
      volPerubahan: 1200,
      satuan: 'Box/Botol',
      hpsPokok: 150000,
      hpsPerubahan: 150000,
      paguPokok: 150000000,
      paguPerubahan: 180000000,
      terpakai: 46000000,
    },
    {
      id: 'RBA-005',
      kodeRekening: '1.02.01.2.10.0001.5.1.02.02.001.00012',
      uraian: 'Belanja Jasa Servis & Pemeliharaan Berkala Genset',
      kategori: 'Jasa',
      volPokok: 12,
      volPerubahan: 12,
      satuan: 'Bulan',
      hpsPokok: 2500000,
      hpsPerubahan: 2500000,
      paguPokok: 30000000,
      paguPerubahan: 30000000,
      terpakai: 7500000,
    },
  ]);

  // ---------------------------------------------------------------------------
  // LAMPIRAN 3: PENGADAAN & EKSEKUSI BELANJA STATE
  // ---------------------------------------------------------------------------
  const [pakets, setPakets] = useState([
    {
      id: 'PKT-2026-001',
      namaPaket: 'Belanja Alat Tulis Kantor (ATK) Bulan Maret 2026',
      subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
      kodeRekening: '1.02.01.2.10.0001.5.1.02.01.001.00024',
      sumberDana: 'BLUD Puskesmas Tamalanrea Kota Makassar T.A. 2026',
      penyedia: 'CV. BARA UTAMA PERSADA',
      kategori: 'ATK',
      tglPengajuan: '01 Maret 2026',
      stage: 7, // Completed full 7 sequential stages
      tglDP: '02 Maret 2026',
      noDP: '001/KEU-DP/PKM.TREA/I/2026',
      tglBAPP: '05 Maret 2026',
      noBAPP: '002/KEU-BAPP/PKM.TREA/I/2026',
      tglBASTHP: '05 Maret 2026', // Locked same with BAPP
      noBASTHP: '003/KEU-BASTHP/PKM.TREA/I/2026',
      tglBAP: '09 Maret 2026',
      noBAP: '004/KEU-BAP/PKM.TREA/I/2026',
      noKuitansi: 'KWT-001/BLUD/I/2026',
      tglKuitansi: '09 Maret 2026',
      catatan: 'Pengadaan ATK rutin operasional bulanan. Telah melalui nego harga, penerbitan daftar pesanan, pemeriksaan fisik barang, serah terima, hingga berita acara pembayaran.',
      items: [
        {
          no: 1,
          uraian: 'Sticky Notes isi 25 Lembar',
          kategori: 'Barang',
          satuan: 'Pack',
          qty: 7,
          hargaRAB: 15500,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 15000,
          h1U: 'https://katalog.inaproc.id/planindo-pratama/stick-note',
          h2N: 'PT. Karya Pertama Mandiri',
          h2H: 16200,
          h2U: '',
          h3N: 'UD. Maju Sejahtera',
          h3H: 20000,
          h3U: '',
          ng1B: 14500,
          ng1P: 15000,
          ng2B: 15000,
          ng2P: null,
          deal: 15000,
          ongkir: 0,
          realisasiQty: 7,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Kondisi fisik baik & segel utuh',
        },
        {
          no: 2,
          uraian: 'Bolpoin Non Gel isi 12 Pcs',
          kategori: 'Barang',
          satuan: 'Pack',
          qty: 13,
          hargaRAB: 28400,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 28200,
          h1U: 'https://katalog.inaproc.id/cartini-nusantara/balpoint-non-gel',
          h2N: 'CV. Cartini Nusantara',
          h2H: 28300,
          h2U: '',
          h3N: 'PT. Mutiara Biru',
          h3H: 28416,
          h3U: '',
          ng1B: 27000,
          ng1P: 28200,
          ng2B: 28000,
          ng2P: null,
          deal: 28200,
          ongkir: 0,
          realisasiQty: 13,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Tinta hitam pekat, tidak bocor',
        },
        {
          no: 3,
          uraian: 'Pensil 2B isi 12 Pcs',
          kategori: 'Barang',
          satuan: 'Pack',
          qty: 3,
          hargaRAB: 57100,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 55000,
          h1U: '',
          h2N: 'CV. Arrow Media Creative',
          h2H: 59700,
          h2U: '',
          h3N: 'UD. Sinar Abadi',
          h3H: 83250,
          h3U: '',
          ng1B: 54000,
          ng1P: 55000,
          ng2B: 55000,
          ng2P: null,
          deal: 55000,
          ongkir: 0,
          realisasiQty: 3,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Lengkap 12 pcs per kotak',
        },
        {
          no: 4,
          uraian: 'Tinta Stempel trodat Uk. 25 ml',
          kategori: 'Barang',
          satuan: 'Botol',
          qty: 3,
          hargaRAB: 60300,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 60000,
          h1U: '',
          h2N: 'PT. Mitra Bangun Persada',
          h2H: 68000,
          h2U: '',
          h3N: 'UD. Cahaya Prima',
          h3H: 74925,
          h3U: '',
          ng1B: 57000,
          ng1P: 60000,
          ng2B: 60000,
          ng2P: null,
          deal: 60000,
          ongkir: 0,
          realisasiQty: 3,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Segel tutup botol rapat',
        },
        {
          no: 5,
          uraian: 'Binder Clip / Double Clip No. 107',
          kategori: 'Barang',
          satuan: 'Pack',
          qty: 4,
          hargaRAB: 49500,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 48000,
          h1U: '',
          h2N: 'PT. Karya Pertama Mandiri',
          h2H: 51000,
          h2U: '',
          h3N: 'UD. Maju Sejahtera',
          h3H: 52000,
          h3U: '',
          ng1B: 45000,
          ng1P: 48000,
          ng2B: 48000,
          ng2P: null,
          deal: 48000,
          ongkir: 0,
          realisasiQty: 4,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Klip presisi tidak berkarat',
        },
        {
          no: 6,
          uraian: 'Double Clip / Binder Clip no.111',
          kategori: 'Barang',
          satuan: 'Pack',
          qty: 4,
          hargaRAB: 54000,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 53000,
          h1U: '',
          h2N: 'PT. Mitra Bangun Persada',
          h2H: 55000,
          h2U: '',
          h3N: 'UD. Cahaya Prima',
          h3H: 56000,
          h3U: '',
          ng1B: 50000,
          ng1P: 53000,
          ng2B: 53000,
          ng2P: null,
          deal: 53000,
          ongkir: 0,
          realisasiQty: 4,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Lengkap 12 pcs per pack',
        },
        {
          no: 7,
          uraian: 'Buku Folio Uk. 200 lbr',
          kategori: 'Barang',
          satuan: 'Buah',
          qty: 3,
          hargaRAB: 38000,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 36000,
          h1U: '',
          h2N: 'CV. Arrow Media Creative',
          h2H: 39000,
          h2U: '',
          h3N: 'UD. Sinar Abadi',
          h3H: 40000,
          h3U: '',
          ng1B: 35000,
          ng1P: 36000,
          ng2B: 36000,
          ng2P: null,
          deal: 36000,
          ongkir: 0,
          realisasiQty: 3,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Hardcover tebal, jilid rapi',
        },
        {
          no: 8,
          uraian: 'Lakban Hitam Uk. 2 Inch',
          kategori: 'Barang',
          satuan: 'Roll',
          qty: 10,
          hargaRAB: 21000,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 20000,
          h1U: '',
          h2N: 'PT. Karya Pertama Mandiri',
          h2H: 22000,
          h2U: '',
          h3N: 'UD. Maju Sejahtera',
          h3H: 23000,
          h3U: '',
          ng1B: 17000,
          ng1P: 20000,
          ng2B: 20000,
          ng2P: null,
          deal: 20000,
          ongkir: 0,
          realisasiQty: 10,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Daya rekat kuat, panjang pas',
        },
        {
          no: 9,
          uraian: 'Pulpen Tanda Tangan',
          kategori: 'Barang',
          satuan: 'Buah',
          qty: 10,
          hargaRAB: 240000,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 237000,
          h1U: '',
          h2N: 'PT. Mitra Bangun Persada',
          h2H: 245000,
          h2U: '',
          h3N: 'UD. Cahaya Prima',
          h3H: 250000,
          h3U: '',
          ng1B: 233000,
          ng1P: 237000,
          ng2B: 237000,
          ng2P: null,
          deal: 237000,
          ongkir: 0,
          realisasiQty: 10,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Rollerball pen mewah, kondisi baru',
        },
        {
          no: 10,
          uraian: 'Map Ordner F4 5 cm',
          kategori: 'Barang',
          satuan: 'Buah',
          qty: 40,
          hargaRAB: 31500,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 30000,
          h1U: '',
          h2N: 'CV. Arrow Media Creative',
          h2H: 32000,
          h2U: '',
          h3N: 'UD. Sinar Abadi',
          h3H: 33000,
          h3U: '',
          ng1B: 26000,
          ng1P: 30000,
          ng2B: 30000,
          ng2P: null,
          deal: 30000,
          ongkir: 0,
          realisasiQty: 40,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Mekanik pengunci kokoh',
        },
        {
          no: 11,
          uraian: 'Kertas HVS A4 80gr 500 Lembar',
          kategori: 'Barang',
          satuan: 'Rim',
          qty: 60,
          hargaRAB: 57000,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 55000,
          h1U: '',
          h2N: 'PT. Karya Pertama Mandiri',
          h2H: 56500,
          h2U: '',
          h3N: 'UD. Maju Sejahtera',
          h3H: 58000,
          h3U: '',
          ng1B: 53000,
          ng1P: 55000,
          ng2B: 55000,
          ng2P: null,
          deal: 55000,
          ongkir: 0,
          realisasiQty: 60,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Kertas putih bersih, kemasan utuh',
        },
        {
          no: 12,
          uraian: 'Map Snelhecter Plastik Transparan',
          kategori: 'Barang',
          satuan: 'Buah',
          qty: 100,
          hargaRAB: 6000,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 55000 / 10,
          h1U: '',
          h2N: 'PT. Mitra Bangun Persada',
          h2H: 6200,
          h2U: '',
          h3N: 'UD. Cahaya Prima',
          h3H: 6500,
          h3U: '',
          ng1B: 5000,
          ng1P: 5500,
          ng2B: 5500,
          ng2P: null,
          deal: 5500,
          ongkir: 0,
          realisasiQty: 100,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Plastik mika tebal 0.15mm',
        },
        {
          no: 13,
          uraian: 'Spidol Whiteboard Hitam isi 12',
          kategori: 'Barang',
          satuan: 'Pack',
          qty: 15,
          hargaRAB: 98000,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 95000,
          h1U: '',
          h2N: 'CV. Arrow Media Creative',
          h2H: 97000,
          h2U: '',
          h3N: 'UD. Sinar Abadi',
          h3H: 100000,
          h3U: '',
          ng1B: 92000,
          ng1P: 95000,
          ng2B: 95000,
          ng2P: null,
          deal: 95000,
          ongkir: 0,
          realisasiQty: 15,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Mudah dihapus, tinta jelas',
        },
        {
          no: 14,
          uraian: 'Correction Pen / Tip-Ex Cair',
          kategori: 'Barang',
          satuan: 'Buah',
          qty: 24,
          hargaRAB: 29000,
          h1N: 'CV. BARA UTAMA PERSADA',
          h1H: 28300,
          h1U: '',
          h2N: 'PT. Karya Pertama Mandiri',
          h2H: 29500,
          h2U: '',
          h3N: 'UD. Maju Sejahtera',
          h3H: 30000,
          h3U: '',
          ng1B: 27500,
          ng1P: 28300,
          ng2B: 28300,
          ng2P: null,
          deal: 28300,
          ongkir: 0,
          realisasiQty: 24,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Cepat kering, ujung metal',
        },
      ],
      externalAttachments: [
        {
          id: 'att-1',
          nama: 'Fotocopy KTP Pimpinan Penyedia (Akbar)',
          kategori: 'Identitas Rekanan',
          fileUrl: 'https://policare-docs.internal/ktp_akbar_direktur.pdf',
          status: 'Terverifikasi',
          tglUpload: '02 Maret 2026',
          catatan: 'KTP Asli telah dicocokkan & sah seumur hidup',
        },
        {
          id: 'att-2',
          nama: 'NPWP CV. BARA UTAMA PERSADA',
          kategori: 'Legalitas Usaha',
          fileUrl: 'https://policare-docs.internal/npwp_cv_bara_utama.pdf',
          status: 'Terverifikasi',
          tglUpload: '02 Maret 2026',
          catatan: 'NPWP 01.345.678.9-801.000 aktif KPP Makassar',
        },
        {
          id: 'att-3',
          nama: 'Buku Rekening Bank Sulselbar',
          kategori: 'Perbankan & Keuangan',
          fileUrl: 'https://policare-docs.internal/buku_tabungan_sulselbar.pdf',
          status: 'Terverifikasi',
          tglUpload: '02 Maret 2026',
          catatan: 'No. Rek 1000-2938-4821 a.n. CV. BARA UTAMA PERSADA',
        },
        {
          id: 'att-4',
          nama: 'Surat Penawaran Harga Asli Rekanan',
          kategori: 'Dokumen Penawaran',
          fileUrl: 'https://policare-docs.internal/surat_penawaran_harga_cv_bara.pdf',
          status: 'Terverifikasi',
          tglUpload: '01 Maret 2026',
          catatan: 'Sesuai lampiran negosiasi awal di sistem',
        },
        {
          id: 'att-5',
          nama: 'Foto Dokumentasi Fisik Barang Tiba di Gudang',
          kategori: 'Dokumentasi Lapangan',
          fileUrl: 'https://policare-docs.internal/foto_penerimaan_barang_tamalanrea.jpg',
          status: 'Terverifikasi',
          tglUpload: '05 Maret 2026',
          catatan: 'Diperiksa langsung oleh Petugas Pengurus Barang & PPK',
        },
        {
          id: 'att-6',
          nama: 'Faktur Pembelian & E-Billing Pajak Retribusi',
          kategori: 'Perpajakan',
          fileUrl: 'https://policare-docs.internal/faktur_ebilling_pajak.pdf',
          status: 'Terverifikasi',
          tglUpload: '05 Maret 2026',
          catatan: 'INV-2026-0041 / Pajak telah lunas',
        },
      ],
      berkasStatus: {
        kwitansi: { ada: true, tgl: '09 Maret 2026', no: 'KWT-001/BLUD/I/2026' },
        suratKuasa: { ada: true, tgl: '09 Maret 2026', no: '' },
        faktur: { ada: true, tgl: '05 Maret 2026', no: 'INV-2026-0041' },
        ringkasanKontrak: { ada: true, tgl: '02 Maret 2026', no: '' },
        suratPesanan: { ada: true, tgl: '02 Maret 2026', no: '001/KEU-DP/PKM.TREA/I/2026' },
        baPemeriksaan: { ada: true, tgl: '05 Maret 2026', no: '002/KEU-BAPP/PKM.TREA/I/2026' },
        baSerahTerima: { ada: true, tgl: '05 Maret 2026', no: '003/KEU-BASTHP/PKM.TREA/I/2026' },
        baPembayaran: { ada: true, tgl: '09 Maret 2026', no: '004/KEU-BAP/PKM.TREA/I/2026' },
        dpa: { ada: true, tgl: '02 Januari 2026', no: 'DPA/2026' },
        rekeningKoran: { ada: true, tgl: '09 Maret 2026', no: '' },
        npwp: { ada: true, tgl: '', no: '01.345.678.9-801.000' },
        ktp: { ada: true, tgl: '', no: '' },
        penelitianDokumen: { ada: true, tgl: '09 Maret 2026', no: '' },
        justifikasiHarga: { ada: true, tgl: '02 Maret 2026', no: '' },
        baEvaluasiNego: { ada: true, tgl: '02 Maret 2026', no: '' },
      },
    },
    {
      id: 'PKT-2026-002',
      namaPaket: 'Pengadaan Reagen Hematologi & BHP Laboratorium Q2 2026',
      subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
      kodeRekening: '1.02.01.2.10.0001.5.1.02.01.001.00088',
      sumberDana: 'BLUD RSUD Daya Kota Makassar T.A. 2026',
      penyedia: 'PT. SYSMEX INDONESIA',
      kategori: 'Lab',
      tglPengajuan: '05 April 2026',
      stage: 4,
      tglDP: '07 April 2026',
      noDP: '005/KEU-DP/PKM.TREA/IV/2026',
      tglBAPP: '12 April 2026',
      noBAPP: '006/KEU-BAPP/PKM.TREA/IV/2026',
      tglBASTHP: '12 April 2026',
      noBASTHP: '007/KEU-BASTHP/PKM.TREA/IV/2026',
      tglBAP: '',
      noBAP: '',
      noKuitansi: '',
      tglKuitansi: '',
      catatan: 'Penyediaan kit reagen hematology analyzer 5-part diff dan tabung EDTA 3ml.',
      items: [
        {
          no: 1,
          uraian: 'Cellpack DCL 20L Reagen Hematologi',
          kategori: 'Barang',
          satuan: 'Galon',
          qty: 4,
          hargaRAB: 4600000,
          h1N: 'PT. SYSMEX INDONESIA',
          h1H: 4500000,
          h1U: '',
          h2N: 'PT. MEDITECH NUSANTARA',
          h2H: 4700000,
          h2U: '',
          h3N: 'PT. Karya Pertama Mandiri',
          h3H: 4800000,
          h3U: '',
          ng1B: 4300000,
          ng1P: 4500000,
          ng2B: 4450000,
          ng2P: 4450000,
          deal: 4450000,
          ongkir: 0,
          realisasiQty: 4,
          realisasiCheck: 'valid',
          catatanPemeriksa: 'Suhu cold-chain terjaga baik',
        },
      ],
      externalAttachments: [],
      berkasStatus: {
        kwitansi: { ada: false, tgl: '', no: '' },
        suratKuasa: { ada: false, tgl: '', no: '' },
        faktur: { ada: true, tgl: '12 April 2026', no: 'INV-SYS-8821' },
        ringkasanKontrak: { ada: true, tgl: '07 April 2026', no: '' },
        suratPesanan: { ada: true, tgl: '07 April 2026', no: '005/KEU-DP/PKM.TREA/IV/2026' },
        baPemeriksaan: { ada: true, tgl: '12 April 2026', no: '006/KEU-BAPP/PKM.TREA/IV/2026' },
        baSerahTerima: { ada: false, tgl: '', no: '' },
        baPembayaran: { ada: false, tgl: '', no: '' },
        dpa: { ada: true, tgl: '', no: '' },
        rekeningKoran: { ada: false, tgl: '', no: '' },
        npwp: { ada: true, tgl: '', no: '' },
        ktp: { ada: true, tgl: '', no: '' },
        penelitianDokumen: { ada: false, tgl: '', no: '' },
        justifikasiHarga: { ada: true, tgl: '06 April 2026', no: '' },
        baEvaluasiNego: { ada: true, tgl: '07 April 2026', no: '' },
      },
    },
  ]);

  const emptyForm = () => ({
    namaPaket: '',
    subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
    kodeRekening: '1.02.01.2.10.0001.5.1.02.01.001.00024',
    sumberDana: 'BLUD Puskesmas Tamalanrea Kota Makassar T.A. 2026',
    penyedia: 'CV. BARA UTAMA PERSADA',
    kategori: 'ATK',
    catatan: '',
    items: [
      {
        no: 1,
        uraian: '',
        kategori: 'Barang',
        satuan: 'Pack',
        qty: 1,
        hargaRAB: 0,
        h1N: 'CV. BARA UTAMA PERSADA',
        h1H: 0,
        h1U: '',
        h2N: '',
        h2H: 0,
        h2U: '',
        h3N: '',
        h3H: 0,
        h3U: '',
        ng1B: 0,
        ng1P: 0,
        ng2B: 0,
        ng2P: 0,
        deal: 0,
        ongkir: 0,
        realisasiQty: 1,
        realisasiCheck: 'valid',
        catatanPemeriksa: 'Kondisi fisik baik',
      },
    ],
  });
  const [newForm, setNewForm] = useState(emptyForm());

  if (!active) return null;

  // 7-Stage Procurement Execution Workflow (Lampiran 3 Official Flow)
  const STAGES = [
    { n: 1, label: '1. Nego & Penawaran Final', icon: 'handshake', col: '#8b5cf6', bg: '#f5f3ff' },
    { n: 2, label: '2. Bikin Kontrak / Daftar Pesanan', icon: 'description', col: '#06b6d4', bg: '#ecfeff' },
    { n: 3, label: '3. Tunggu Barang (Logistik)', icon: 'local_shipping', col: '#f59e0b', bg: '#fffbeb' },
    { n: 4, label: '4. Berita Acara Pemeriksaan (BAPP)', icon: 'checklist_rtl', col: '#3b82f6', bg: '#eff6ff' },
    { n: 5, label: '5. Berita Acara Serah Terima (BASTHP)', icon: 'inventory_2', col: '#10b981', bg: '#f0fdf4' },
    { n: 6, label: '6. Berita Acara Pembayaran (BAP)', icon: 'payments', col: '#6366f1', bg: '#eef2ff' },
    { n: 7, label: '7. Kuitansi Terbit & Cair', icon: 'receipt_long', col: '#059669', bg: '#ecfdf5' },
  ];

  const BERKAS = [
    { key: 'kwitansi', label: 'Kwitansi Bermaterai / Terbit', icon: 'receipt_long', reqStage: 7 },
    { key: 'suratKuasa', label: 'Surat Kuasa Direktur', icon: 'badge', reqStage: 7 },
    { key: 'faktur', label: 'Faktur / E-Billing Tax', icon: 'description', reqStage: 4 },
    { key: 'ringkasanKontrak', label: 'Ringkasan Kontrak SPK', icon: 'article', reqStage: 2 },
    { key: 'suratPesanan', label: 'Surat Pesanan (SP/DP)', icon: 'local_shipping', reqStage: 2 },
    { key: 'baPemeriksaan', label: 'BA Pemeriksaan Barang (BAPP)', icon: 'checklist_rtl', reqStage: 4 },
    { key: 'baSerahTerima', label: 'BA Serah Terima (BASTHP)', icon: 'swap_horiz', reqStage: 5 },
    { key: 'baPembayaran', label: 'BA Pembayaran (BAP)', icon: 'payments', reqStage: 6 },
    { key: 'dpa', label: 'Fotocopy DPA / RBA Perubahan', icon: 'account_balance', reqStage: 1 },
    { key: 'rekeningKoran', label: 'Rekening Koran Bank BLUD', icon: 'account_balance_wallet', reqStage: 7 },
    { key: 'npwp', label: 'NPWP Vendor / Penyedia', icon: 'assured_workload', reqStage: 1 },
    { key: 'ktp', label: 'KTP Pimpinan Penyedia', icon: 'person', reqStage: 1 },
    { key: 'penelitianDokumen', label: 'Lembar Penelitian Dokumen', icon: 'manage_search', reqStage: 6 },
    { key: 'justifikasiHarga', label: 'Justifikasi Harga Penawaran', icon: 'price_check', reqStage: 1 },
    { key: 'baEvaluasiNego', label: 'BA Evaluasi & Negosiasi', icon: 'handshake', reqStage: 1 },
  ];

  const KATEGORI_LIST = ['ATK', 'Alkes', 'Farmasi', 'BHP', 'Lab', 'Peralatan', 'IT/Sistem', 'Infrastruktur', 'Lainnya'];
  const SATUAN_LIST = ['Pack', 'Botol', 'Dus', 'Buah', 'Pcs', 'Unit', 'Box', 'Galon', 'Lembar', 'Set', 'Roll', 'Strip', 'Kotak', 'Vial', 'Liter', 'Rim', 'Paket'];

  const fmtRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const fmtJuta = (n) => (n >= 1e6 ? 'Rp ' + (n / 1e6).toFixed(1) + ' Jt' : fmtRp(n));
  const calcRAB = (items) => (items || []).reduce((s, i) => s + (i.hargaRAB || 0) * (i.qty || 1), 0);
  const calcDeal = (items) => (items || []).reduce((s, i) => s + (i.deal || i.hargaRAB || 0) * (i.qty || 1), 0);

  // Kalkulator Pajak Otomatis (PPN 11%, PPh 22 Barang 1.5%, PPh 23 Jasa 2%)
  const calcTaxDetails = (totalDeal, taxScheme = 'ppn_pph22', hasNpwp = true, isHargaIncludePpn = true) => {
    const total = Number(totalDeal) || 0;
    if (taxScheme === 'bebas_pajak' || taxScheme === 'non_pkp' || total <= 0) {
      return {
        dpp: total,
        ppn: 0,
        pph22: 0,
        pph23: 0,
        totalPph: 0,
        totalPajak: 0,
        netto: total,
        ppnTarif: '0%',
        pphTarif: '0%',
        pphJenis: '-',
        skemaLabel: 'Bebas Pajak / Non-PKP (< Rp 2 Jt)',
      };
    }

    let dpp = total;
    let ppn = 0;
    let pph22 = 0;
    let pph23 = 0;

    if (isHargaIncludePpn) {
      // Harga sudah termasuk PPN 11% (Standard Belanja Pemerintah BLUD)
      dpp = Math.round(total / 1.11);
      ppn = Math.round(dpp * 0.11);
    } else {
      dpp = total;
      ppn = Math.round(dpp * 0.11);
    }

    // Tarif PPh: PPh 22 adalah 1.5% (ber-NPWP) atau 3.0% (tanpa NPWP)
    // PPh 23 adalah 2.0% (ber-NPWP) atau 4.0% (tanpa NPWP)
    const npwpMultiplier = hasNpwp ? 1.0 : 2.0;

    if (taxScheme === 'ppn_pph22') {
      const pphRate = 0.015 * npwpMultiplier;
      pph22 = Math.round(dpp * pphRate);
    } else if (taxScheme === 'ppn_pph23') {
      const pphRate = 0.02 * npwpMultiplier;
      pph23 = Math.round(dpp * pphRate);
    } else if (taxScheme === 'ppn_only') {
      pph22 = 0;
      pph23 = 0;
    }

    const totalPph = pph22 + pph23;
    const totalPajak = ppn + totalPph;
    // Netto cair ke rekening rekanan (Nilai total dipotong PPh)
    const netto = total - totalPph;

    return {
      dpp,
      ppn,
      pph22,
      pph23,
      totalPph,
      totalPajak,
      netto,
      ppnTarif: '11%',
      pphTarif: taxScheme === 'ppn_pph22' ? (hasNpwp ? '1.5%' : '3.0%') : taxScheme === 'ppn_pph23' ? (hasNpwp ? '2.0%' : '4.0%') : '0%',
      pphJenis: taxScheme === 'ppn_pph22' ? 'PPh Pasal 22 (Barang)' : taxScheme === 'ppn_pph23' ? 'PPh Pasal 23 (Jasa)' : '-',
      skemaLabel: taxScheme === 'ppn_pph22' ? 'PPN 11% + PPh 22 (1.5% Belanja Barang)' : taxScheme === 'ppn_pph23' ? 'PPN 11% + PPh 23 (2.0% Belanja Jasa)' : 'PPN 11% Saja',
    };
  };

  const updatePaketTax = (paketId, field, val) => {
    setPakets((prev) =>
      prev.map((p) => {
        if (p.id !== paketId) return p;
        return { ...p, [field]: val };
      })
    );
  };

  const calcComp = (bs) => {
    if (!bs) return { pct: 0, done: 0, total: 15 };
    const keys = Object.keys(bs);
    const done = keys.filter((k) => bs[k]?.ada).length;
    return { pct: Math.round((done / keys.length) * 100), done, total: keys.length };
  };
  const stageOf = (n) => STAGES[n - 1] || STAGES[0];
  const today = () => new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const currentPaket = pakets.find((p) => p.id === selectedId);

  // Calculations for Monitoring Dashboard (Lampiran 4)
  const activeRbaList = rbaItems;
  const totalRbaPagu = activeRbaList.reduce(
    (s, i) => s + (rbaActiveVersion === 'perubahan' ? i.paguPerubahan : i.paguPokok),
    0
  );
  const totalRealisasiKeuangan = pakets.reduce((s, p) => (p.stage === 7 ? s + calcDeal(p.items) : s), 0);
  const totalRealisasiProses = pakets.reduce((s, p) => (p.stage < 7 ? s + calcDeal(p.items) : s), 0);
  const pctRealisasiKeuangan = totalRbaPagu > 0 ? ((totalRealisasiKeuangan / totalRbaPagu) * 100).toFixed(1) : '0';

  // Breakdown Barang vs Jasa (Lampiran 4 Requirement)
  const itemsBarang = pakets.flatMap((p) => (p.items || []).filter((i) => (i.kategori || 'Barang') === 'Barang'));
  const itemsJasa = pakets.flatMap((p) => (p.items || []).filter((i) => (i.kategori || '') === 'Jasa'));

  const totalNilaiBarang = itemsBarang.reduce((s, i) => s + (i.deal || i.hargaRAB || 0) * i.qty, 0);
  const totalNilaiJasa = itemsJasa.reduce((s, i) => s + (i.deal || i.hargaRAB || 0) * i.qty, 0);
  const countBarang = itemsBarang.reduce((s, i) => s + i.qty, 0);
  const countJasa = itemsJasa.reduce((s, i) => s + i.qty, 0);

  const filteredPakets = pakets
    .filter((p) => filterStage === 'all' || p.stage === parseInt(filterStage))
    .filter((p) => filterKat === 'all' || p.kategori === filterKat);

  // Handlers for Pengadaan
  const openDetail = (id) => {
    setSelectedId(id);
    setView('detail');
    setDetailTab('ringkasan');
  };
  const backToList = () => {
    setView('list');
    setSelectedId(null);
  };

  const advanceStage = (paketId) => {
    setPakets((prev) =>
      prev.map((p) => {
        if (p.id !== paketId || p.stage >= 7) return p;
        const nextStage = p.stage + 1;
        const newNoDP = p.noDP || `001/${masterData.suratRules.prefixSP}/I/2026`;
        const newTglDP = p.tglDP || '02 Maret 2026';
        const newNoBAPP = nextStage >= 4 && !p.noBAPP ? `002/${masterData.suratRules.prefixBAPP}/I/2026` : p.noBAPP;
        const newTglBAPP = nextStage >= 4 && !p.tglBAPP ? '05 Maret 2026' : p.tglBAPP;
        const newTglBAST = newTglBAPP; // Rule: BAST date MUST match BAPP date exactly!
        const newNoBAST = nextStage >= 5 && !p.noBASTHP ? `003/${masterData.suratRules.prefixBAST}/I/2026` : p.noBASTHP;
        const newNoBAP = nextStage >= 6 && (!p.noBAP || p.noBAP === 'Belum Terbit') ? `004/${masterData.suratRules.prefixBAP}/I/2026` : p.noBAP;
        const newTglBAP = nextStage >= 6 && !p.tglBAP ? '09 Maret 2026' : p.tglBAP;
        const newKuitansi = nextStage === 7 && !p.noKuitansi ? `KWT-001/BLUD/I/2026` : p.noKuitansi;
        const newTglKuitansi = nextStage === 7 && !p.tglKuitansi ? newTglBAP : p.tglKuitansi;

        // Auto update berkas checklist
        const updatedBS = { ...p.berkasStatus };
        if (nextStage >= 2) {
          updatedBS.suratPesanan = { ada: true, tgl: newTglDP, no: newNoDP };
          updatedBS.ringkasanKontrak = { ada: true, tgl: newTglDP, no: '' };
        }
        if (nextStage >= 4) {
          updatedBS.baPemeriksaan = { ada: true, tgl: newTglBAPP, no: newNoBAPP };
          updatedBS.faktur = { ada: true, tgl: newTglBAPP, no: 'INV-2026-0041' };
        }
        if (nextStage >= 5) {
          updatedBS.baSerahTerima = { ada: true, tgl: newTglBAST, no: newNoBAST };
        }
        if (nextStage >= 6) {
          updatedBS.baPembayaran = { ada: true, tgl: newTglBAP, no: newNoBAP };
        }
        if (nextStage === 7) {
          updatedBS.kwitansi = { ada: true, tgl: newTglKuitansi, no: newKuitansi };
          updatedBS.rekeningKoran = { ada: true, tgl: newTglKuitansi, no: '' };
        }

        return {
          ...p,
          stage: nextStage,
          noDP: newNoDP,
          tglDP: newTglDP,
          noBAPP: newNoBAPP,
          tglBAPP: newTglBAPP,
          noBASTHP: newNoBAST,
          tglBASTHP: newTglBAST,
          noBAP: newNoBAP,
          tglBAP: newTglBAP,
          noKuitansi: newKuitansi,
          tglKuitansi: newTglKuitansi,
          berkasStatus: updatedBS,
        };
      })
    );
  };

  // Inspection Checklist Handler (BAPP)
  const updateBappItem = (paketId, itemIndex, field, value) => {
    setPakets((prev) =>
      prev.map((p) => {
        if (p.id !== paketId) return p;
        const newItems = p.items.map((it, idx) => {
          if (idx !== itemIndex) return it;
          return { ...it, [field]: value };
        });
        return { ...p, items: newItems };
      })
    );
  };

  const setAllBappValid = (paketId) => {
    setPakets((prev) =>
      prev.map((p) => {
        if (p.id !== paketId) return p;
        const newItems = p.items.map((it) => ({
          ...it,
          realisasiQty: it.qty,
          realisasiCheck: 'valid',
          catatanPemeriksa: it.catatanPemeriksa || 'Kondisi fisik baik & sesuai spesifikasi',
        }));
        return { ...p, items: newItems };
      })
    );
  };

  // External Attachments Handlers
  const handleAddExternalAttachment = (paketId) => {
    if (!newAttachmentForm.nama.trim()) {
      alert('Nama dokumen lampiran wajib diisi.');
      return;
    }
    const newAtt = {
      id: `att-${Date.now()}`,
      nama: newAttachmentForm.nama,
      kategori: newAttachmentForm.kategori,
      fileUrl: newAttachmentForm.fileUrl || '#',
      catatan: newAttachmentForm.catatan || '-',
      tglUpload: newAttachmentForm.tglUpload || today(),
      status: 'Terverifikasi',
    };
    setPakets((prev) =>
      prev.map((p) => (p.id === paketId ? { ...p, externalAttachments: [...(p.externalAttachments || []), newAtt] } : p))
    );
    setNewAttachmentForm({ nama: '', kategori: 'Legalitas Vendor', fileUrl: '', catatan: '', tglUpload: '' });
    setIsAddAttachmentModalOpen(false);
  };

  const handleDeleteExternalAttachment = (paketId, attId) => {
    setPakets((prev) =>
      prev.map((p) => (p.id === paketId ? { ...p, externalAttachments: (p.externalAttachments || []).filter((a) => a.id !== attId) } : p))
    );
  };

  // Custom Account Handlers (History Persistence)
  const handleSaveCustomAccount = () => {
    if (!newAccountForm.kode.trim() || !newAccountForm.uraian.trim()) {
      alert('Kode Rekening dan Uraian Pekerjaan wajib diisi.');
      return;
    }
    setSavedCustomAccounts((prev) => [
      { ...newAccountForm },
      ...prev.filter((a) => a.kode !== newAccountForm.kode),
    ]);
    setIsAddAccountModalOpen(false);
    setNewAccountForm({
      kode: '',
      uraian: '',
      kegiatan: 'Peningkatan Pelayanan BLUD',
      subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
      opd: 'Dinas Kesehatan — Puskesmas Tamalanrea',
    });
  };

  const toggleBerkas = (paketId, key) => {
    setPakets((prev) =>
      prev.map((p) => {
        if (p.id !== paketId) return p;
        const was = p.berkasStatus[key]?.ada;
        return {
          ...p,
          berkasStatus: {
            ...p.berkasStatus,
            [key]: { ada: !was, tgl: !was ? today() : '', no: p.berkasStatus[key].no },
          },
        };
      })
    );
  };

  // Seamless Excel Import Handler (Lampiran 3 Requirement)
  const handleParseExcel = () => {
    if (!rawPastedText.trim()) return;
    const lines = rawPastedText.trim().split('\n');
    const items = [];

    lines.forEach((line, idx) => {
      // Split by tab (\t) or comma or semicolon
      const cols = line.split(/\t|;|\|/).map((c) => c.trim());
      if (cols.length >= 3) {
        // Skip header if it contains words like 'Uraian' or 'Nama'
        if (cols[0].toLowerCase().includes('uraian') || cols[0].toLowerCase().includes('no')) return;

        const uraian = cols[0] || `Item Ke-${idx + 1}`;
        const kat = cols[1] && cols[1].toLowerCase().includes('jasa') ? 'Jasa' : 'Barang';
        const qty = parseInt(cols[2]) || 1;
        const satuan = cols[3] || 'Pack';
        const h1H = parseInt(cols[4]?.replace(/[^0-9]/g, '')) || 10000;
        const deal = parseInt(cols[5]?.replace(/[^0-9]/g, '')) || h1H;

        items.push({
          no: items.length + 1,
          uraian,
          kategori: kat,
          satuan,
          qty,
          hargaRAB: Math.round(deal * 1.05),
          h1N: 'Penyedia Import Excel',
          h1H: h1H,
          h1U: '',
          h2N: 'Pembanding 2',
          h2H: Math.round(h1H * 1.02),
          h2U: '',
          h3N: 'Pembanding 3',
          h3H: Math.round(h1H * 1.05),
          h3U: '',
          ng1B: Math.round(deal * 0.95),
          ng1P: deal,
          ng2B: deal,
          ng2P: deal,
          deal: deal,
        });
      }
    });

    if (items.length > 0) {
      setParsedExcelItems(items);
    } else {
      alert('Format teks Excel tidak dikenali. Ganti pisahan kolom dengan Tab (Ctrl+C dari Excel).');
    }
  };

  const applyExcelItemsToPaket = () => {
    if (excelTargetPaketId) {
      setPakets((prev) =>
        prev.map((p) => (p.id === excelTargetPaketId ? { ...p, items: [...p.items, ...parsedExcelItems] } : p))
      );
    } else {
      setNewForm((prev) => ({ ...prev, items: [...parsedExcelItems] }));
    }
    setIsExcelModalOpen(false);
    setRawPastedText('');
    setParsedExcelItems([]);
    alert(`Berhasil memasukkan ${parsedExcelItems.length} item penawaran ke dalam sistem!`);
  };

  const addItem = () =>
    setNewForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          no: prev.items.length + 1,
          uraian: '',
          kategori: 'Barang',
          satuan: 'Pack',
          qty: 1,
          hargaRAB: 0,
          h1N: '',
          h1H: 0,
          h1U: '',
          h2N: '',
          h2H: 0,
          h2U: '',
          h3N: '',
          h3H: 0,
          h3U: '',
          deal: 0,
        },
      ],
    }));

  const removeItem = (idx) =>
    setNewForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, no: i + 1 })),
    }));

  const updItem = (idx, field, val) =>
    setNewForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, [field]: val } : it)),
    }));

  const submitNew = () => {
    if (!newForm.namaPaket.trim()) {
      alert('Nama Paket wajib diisi.');
      return;
    }
    if (!newForm.penyedia.trim()) {
      alert('Vendor/Penyedia wajib diisi.');
      return;
    }
    const id = 'PKT-2026-' + String(pakets.length + 1).padStart(3, '0');
    const emptyBS = Object.fromEntries(BERKAS.map((b) => [b.key, { ada: false, tgl: '', no: '' }]));
    emptyBS.dpa.ada = true;
    emptyBS.npwp.ada = true;
    emptyBS.ktp.ada = true;
    setPakets((prev) => [
      {
        ...newForm,
        id,
        stage: 1,
        tglPengajuan: today(),
        tglDP: '',
        noDP: '',
        tglBAPP: '',
        noBAPP: '',
        tglBASTHP: '',
        noBASTHP: '',
        tglBAP: '',
        noBAP: '',
        noKuitansi: '',
        berkasStatus: emptyBS,
      },
      ...prev,
    ]);
    setNewForm(emptyForm());
    setWizardStep(1);
    setSelectedId(id);
    setMainTab('pengadaan');
    setView('detail');
  };

  const inp = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid var(--line)',
    borderRadius: 8,
    fontSize: 13,
    background: 'var(--srf)',
    color: 'var(--t1)',
    boxSizing: 'border-box',
  };
  const inpSm = { ...inp, padding: '7px 10px', fontSize: 12, borderRadius: 6 };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--t2)', marginBottom: 5 };
  const lblSm = { ...lbl, color: 'var(--t3)', marginBottom: 3 };

  return (
    <div className="screen on" id="s-procurement" style={{ padding: '20px 24px', background: 'var(--bg)', overflowY: 'auto' }}>
      {/* =================================================================== */}
      {/* TOP SUITE NAVIGATION BAR */}
      {/* =================================================================== */}
      <div style={{ background: 'var(--srf)', padding: '16px 20px', borderRadius: 14, boxShadow: 'var(--sh)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ic xl" style={{ color: 'var(--blue)' }}>
                account_balance_wallet
              </span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                  Pengadaan BLUD &amp; Operational Suite
                </h2>
                <p style={{ fontSize: 12, color: 'var(--t3)', margin: 0 }}>
                  {masterData.puskesmas.nama} — Presisi Pencatatan Anggaran, Auto Document &amp; Realisasi Monitoring
                </p>
              </div>
            </div>
          </div>

          {/* Right: Main tabs + hidden admin gear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Main tabs */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg)', padding: 4, borderRadius: 10, flexWrap: 'wrap' }}>
              {[
                { id: 'rba', label: '1. Registrasi RBA & DPA', icon: 'account_balance', lampiran: 'Lampiran 2' },
                { id: 'pengadaan', label: '2. Eksekusi Pengadaan', icon: 'shopping_bag', lampiran: 'Lampiran 3' },
                { id: 'dashboard', label: '3. Dashboard Realisasi', icon: 'analytics', lampiran: 'Lampiran 4' },
                { id: 'master', label: 'Master Data', icon: 'badge', lampiran: 'Lampiran 1' },
              ].map((tab) => {
                const active2 = mainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setMainTab(tab.id);
                      setAdminMenuOpen(false);
                      if (tab.id === 'pengadaan' && view === 'detail') setView('list');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, transition: '.15s',
                      background: active2 ? 'var(--blue)' : 'transparent',
                      color: active2 ? '#ffffff' : 'var(--t2)',
                      boxShadow: active2 ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                    }}
                  >
                    <span className="ic s">{tab.icon}</span>
                    {tab.label}
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: active2 ? 'rgba(255,255,255,0.2)' : 'var(--line)', color: active2 ? '#fff' : 'var(--t3)' }}>
                      {tab.lampiran}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Export Siap Audit BPKAD Button */}
            <button
              onClick={() => setIsExportBpkadModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 800, transition: '.15s',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)',
              }}
            >
              <span className="ic s" style={{ fontSize: 18 }}>file_download</span>
              Export Siap Audit BPKAD
            </button>

            {/* Admin gear - subtle, tucked away */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setAdminMenuOpen(o => !o)}
                title="Pengaturan Admin & Setup Awal"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)',
                  background: (mainTab === 'master' || mainTab === 'rba') ? '#f0f9ff' : 'var(--bg)',
                  color: (mainTab === 'master' || mainTab === 'rba') ? 'var(--blue)' : 'var(--t3)',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: '.15s',
                }}
              >
                <span className="ic s" style={{ fontSize: 18 }}>settings</span>
                {(mainTab === 'master' || mainTab === 'rba') && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)' }}>Admin</span>
                )}
              </button>

              {/* Dropdown panel */}
              {adminMenuOpen && (
                <div
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 999,
                    background: 'var(--srf)', border: '1px solid var(--line)', borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 8, width: 240,
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px 2px' }}>
                    ⚙️ Setup Awal &amp; Admin
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--t3)', padding: '0 8px 6px', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
                    Biasanya dikonfigurasi di awal tahun. Jarang diubah.
                  </div>
                  {[
                    { id: 'master', label: 'Master Data Hub', desc: 'Vendor & Role Penandatangan', icon: 'badge', lampiran: 'Lampiran 1' },
                    { id: 'rba', label: 'Registrasi RBA & DPA', desc: 'Input Pagu Anggaran', icon: 'account_balance', lampiran: 'Lampiran 2' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setMainTab(item.id); setAdminMenuOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: mainTab === item.id ? '#eff6ff' : 'transparent',
                        textAlign: 'left', width: '100%',
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: mainTab === item.id ? 'var(--blue)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="ic s" style={{ fontSize: 16, color: mainTab === item.id ? '#fff' : 'var(--t2)' }}>{item.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: mainTab === item.id ? 'var(--blue)' : 'var(--t1)' }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--t3)' }}>{item.desc} · {item.lampiran}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin context breadcrumb - only visible when in admin views */}
        {(mainTab === 'master' || mainTab === 'rba') && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setMainTab('dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
            >
              <span className="ic s" style={{ fontSize: 14 }}>arrow_back</span> Kembali ke Dashboard
            </button>
            <span style={{ color: 'var(--t3)', fontSize: 11 }}>›</span>
            <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="ic s" style={{ fontSize: 14 }}>settings</span>
              {mainTab === 'master' ? 'Master Data Hub (Lampiran 1)' : 'Registrasi RBA & DPA (Lampiran 2)'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t3)', background: '#fef9c3', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
              ⚠️ Panel Admin — Data Penting
            </span>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MAIN TAB 1: DASHBOARD MONITORING & REALISASI (LAMPIRAN 4) */}
      {/* =================================================================== */}
      {mainTab === 'dashboard' && (() => {
        // ── Per-RBA drill-down: pakets that match a given kode rekening
        const paketsByRek = (kode) => pakets.filter(p => p.kodeRekening === kode);

        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── TOP KPI STRIP ─────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {/* 1. Target RBA */}
            <div className="card" style={{ padding: '18px 20px', background: 'linear-gradient(135deg, #0055D4 0%, #1e40af 100%)', color: '#fff', borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8, fontWeight: 700, marginBottom: 6 }}>
                    Target RBA {rbaActiveVersion === 'perubahan' ? '(Perubahan)' : '(Pokok)'}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{fmtRp(totalRbaPagu)}</div>
                  <div style={{ fontSize: 11, opacity: 0.75, marginTop: 6 }}>DPA Walikota Terbit</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.18)', padding: 8, borderRadius: 10 }}>
                  <span className="ic" style={{ fontSize: 24 }}>account_balance</span>
                </div>
              </div>
              <div style={{ marginTop: 14, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
                <div style={{ width: `${Math.min(pctRealisasiKeuangan, 100)}%`, height: '100%', background: '#4ade80', borderRadius: 3, transition: '1s' }} />
              </div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>{pctRealisasiKeuangan}% Terserap</div>
            </div>

            {/* 2. Realisasi Lunas */}
            <div className="card" style={{ padding: '18px 20px', background: '#fff', borderLeft: '5px solid #10b981', borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>
                    Realisasi Lunas (Kuitansi)
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{fmtRp(totalRealisasiKeuangan)}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>{pakets.filter(p => p.stage === 5).length} paket selesai</div>
                </div>
                <div style={{ background: '#dcfce7', padding: 8, borderRadius: 10 }}>
                  <span className="ic" style={{ fontSize: 24, color: '#10b981' }}>task_alt</span>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--t3)', fontWeight: 600 }}>Penyerapan Keuangan</span>
                  <span style={{ fontWeight: 800, color: '#10b981' }}>{pctRealisasiKeuangan}%</span>
                </div>
                <div style={{ height: 6, background: '#dcfce7', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(pctRealisasiKeuangan, 100)}%`, height: '100%', background: '#10b981', borderRadius: 3 }} />
                </div>
              </div>
            </div>

            {/* 3. Dalam Proses */}
            <div className="card" style={{ padding: '18px 20px', background: '#fff', borderLeft: '5px solid #f59e0b', borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>
                    Komitmen (Dalam Proses)
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#d97706', lineHeight: 1 }}>{fmtRp(totalRealisasiProses)}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>{pakets.filter(p => p.stage < 5).length} paket berjalan</div>
                </div>
                <div style={{ background: '#fef3c7', padding: 8, borderRadius: 10 }}>
                  <span className="ic" style={{ fontSize: 24, color: '#f59e0b' }}>pending_actions</span>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--t3)', fontWeight: 600 }}>Penyerapan Komitmen</span>
                  <span style={{ fontWeight: 800, color: '#f59e0b' }}>
                    {totalRbaPagu > 0 ? ((totalRealisasiProses / totalRbaPagu) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div style={{ height: 6, background: '#fef3c7', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(totalRbaPagu > 0 ? (totalRealisasiProses / totalRbaPagu) * 100 : 0, 100)}%`, height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                </div>
              </div>
            </div>

            {/* 4. Sisa Pagu */}
            <div className="card" style={{ padding: '18px 20px', background: '#fff', borderLeft: '5px solid #6366f1', borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', fontWeight: 700, marginBottom: 6 }}>
                    Sisa Pagu Anggaran
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#6366f1', lineHeight: 1 }}>
                    {fmtRp(totalRbaPagu - totalRealisasiKeuangan - totalRealisasiProses)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>Tersedia untuk belanja berikutnya</div>
                </div>
                <div style={{ background: '#eef2ff', padding: 8, borderRadius: 10 }}>
                  <span className="ic" style={{ fontSize: 24, color: '#6366f1' }}>savings</span>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--t3)', fontWeight: 600 }}>Sisa dari Total Pagu</span>
                  <span style={{ fontWeight: 800, color: '#6366f1' }}>
                    {totalRbaPagu > 0 ? (((totalRbaPagu - totalRealisasiKeuangan - totalRealisasiProses) / totalRbaPagu) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div style={{ height: 6, background: '#eef2ff', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(totalRbaPagu > 0 ? ((totalRbaPagu - totalRealisasiKeuangan - totalRealisasiProses) / totalRbaPagu) * 100 : 0, 100)}%`, height: '100%', background: '#6366f1', borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── STATUS PIPELINE FUNNEL ─────────────────────────────────────── */}
          <div className="card" style={{ padding: '18px 20px', background: '#fff', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Pipeline Status Pengadaan</h3>
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>Total {pakets.length} Paket</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {STAGES.map((s) => {
                const cnt = pakets.filter(p => p.stage === s.n).length;
                const pct = pakets.length > 0 ? Math.round((cnt / pakets.length) * 100) : 0;
                return (
                  <div key={s.n} style={{ textAlign: 'center' }}>
                    <div style={{
                      height: 52,
                      background: `linear-gradient(180deg, ${s.col}22 0%, ${s.col}11 100%)`,
                      border: `2px solid ${s.col}44`,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 6,
                      position: 'relative',
                    }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.col }}>{cnt}</div>
                        <div style={{ fontSize: 10, color: s.col, fontWeight: 700 }}>paket</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{pct}%</div>
                    <div style={{ height: 3, background: `${s.col}22`, borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: s.col, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── BARANG vs JASA BREAKDOWN ──────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Belanja Barang */}
            <div className="card" style={{ padding: '18px 20px', background: '#fff', borderRadius: 14, border: '1.5px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ background: '#dbeafe', padding: 8, borderRadius: 10 }}>
                    <span className="ic" style={{ fontSize: 20, color: '#3b82f6' }}>inventory_2</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1e40af' }}>Belanja Barang</div>
                    <div style={{ fontSize: 10, color: '#3b82f6' }}>ATK · Farmasi · Reagen · Alkes · BHP</div>
                  </div>
                </div>
                <span style={{ padding: '3px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{countBarang} item</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { lbl: 'Nilai Realisasi', val: fmtJuta(totalNilaiBarang), col: '#1e40af', sub: null },
                  { lbl: 'Dari Target RBA', val: fmtJuta(activeRbaList.filter(r => r.kategori === 'Barang').reduce((s, r) => s + (rbaActiveVersion === 'perubahan' ? r.paguPerubahan : r.paguPokok), 0)), col: 'var(--t1)', sub: null },
                  { lbl: '% Penyerapan', val: totalRbaPagu > 0 ? ((totalNilaiBarang / activeRbaList.filter(r => r.kategori === 'Barang').reduce((s, r) => s + (rbaActiveVersion === 'perubahan' ? r.paguPerubahan : r.paguPokok), 0)) * 100).toFixed(1) + '%' : '0%', col: '#10b981', sub: null },
                ].map(m => (
                  <div key={m.lbl} style={{ background: '#eff6ff', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{m.lbl}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: m.col }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>
                  <span>Progress Realisasi Barang</span>
                  <span style={{ fontWeight: 800, color: '#3b82f6' }}>
                    {(() => { const t = activeRbaList.filter(r => r.kategori === 'Barang').reduce((s, r) => s + (rbaActiveVersion === 'perubahan' ? r.paguPerubahan : r.paguPokok), 0); return t > 0 ? ((totalNilaiBarang / t) * 100).toFixed(1) : 0; })()}%
                  </span>
                </div>
                <div style={{ height: 8, background: '#dbeafe', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min((() => { const t = activeRbaList.filter(r => r.kategori === 'Barang').reduce((s, r) => s + (rbaActiveVersion === 'perubahan' ? r.paguPerubahan : r.paguPokok), 0); return t > 0 ? (totalNilaiBarang / t) * 100 : 0; })(), 100)}%`,
                    height: '100%', background: 'linear-gradient(90deg, #3b82f6, #1e40af)', borderRadius: 4, transition: '1s'
                  }} />
                </div>
              </div>
            </div>

            {/* Belanja Jasa */}
            <div className="card" style={{ padding: '18px 20px', background: '#fff', borderRadius: 14, border: '1.5px solid #e9d5ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ background: '#f3e8ff', padding: 8, borderRadius: 10 }}>
                    <span className="ic" style={{ fontSize: 20, color: '#8b5cf6' }}>build</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#6b21a8' }}>Belanja Jasa</div>
                    <div style={{ fontSize: 10, color: '#8b5cf6' }}>Pemeliharaan · Kalibrasi · Cetak · Servis</div>
                  </div>
                </div>
                <span style={{ padding: '3px 10px', background: '#f3e8ff', color: '#6b21a8', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{countJasa} servis</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { lbl: 'Nilai Realisasi', val: fmtJuta(totalNilaiJasa), col: '#6b21a8' },
                  { lbl: 'Dari Target RBA', val: fmtJuta(activeRbaList.filter(r => r.kategori === 'Jasa').reduce((s, r) => s + (rbaActiveVersion === 'perubahan' ? r.paguPerubahan : r.paguPokok), 0)), col: 'var(--t1)' },
                  { lbl: '% Penyerapan', val: (() => { const t = activeRbaList.filter(r => r.kategori === 'Jasa').reduce((s, r) => s + (rbaActiveVersion === 'perubahan' ? r.paguPerubahan : r.paguPokok), 0); return t > 0 ? ((totalNilaiJasa / t) * 100).toFixed(1) + '%' : '0%'; })(), col: '#10b981' },
                ].map(m => (
                  <div key={m.lbl} style={{ background: '#faf5ff', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{m.lbl}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: m.col }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>
                  <span>Progress Realisasi Jasa</span>
                  <span style={{ fontWeight: 800, color: '#8b5cf6' }}>
                    {(() => { const t = activeRbaList.filter(r => r.kategori === 'Jasa').reduce((s, r) => s + (rbaActiveVersion === 'perubahan' ? r.paguPerubahan : r.paguPokok), 0); return t > 0 ? ((totalNilaiJasa / t) * 100).toFixed(1) : 0; })()}%
                  </span>
                </div>
                <div style={{ height: 8, background: '#f3e8ff', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min((() => { const t = activeRbaList.filter(r => r.kategori === 'Jasa').reduce((s, r) => s + (rbaActiveVersion === 'perubahan' ? r.paguPerubahan : r.paguPokok), 0); return t > 0 ? (totalNilaiJasa / t) * 100 : 0; })(), 100)}%`,
                    height: '100%', background: 'linear-gradient(90deg, #a78bfa, #7c3aed)', borderRadius: 4, transition: '1s'
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN REALISASI MATRIX: MULTI-PENGADAAN BERTARAF RESMI (GAMBAR 2) ─── */}
          <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            
            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="ic l" style={{ color: '#16a34a', fontSize: 24 }}>table_chart</span>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                    Matriks Realisasi Anggaran Bertahap (Multi-Pengadaan)
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--t3)' }}>
                  Monitoring realisasi bertahap: Total RBA Terbaru, Pengadaan Pertama, Kedua, Ketiga, dan Sisa Anggaran siap belanja.
                </p>
              </div>

              {/* Action Buttons & Filters */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search Box */}
                <div style={{ position: 'relative', minWidth: 220 }}>
                  <span className="ic s" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: 16 }}>search</span>
                  <input
                    placeholder="Cari item barang / jasa..."
                    value={realisasiSearchQuery}
                    onChange={e => setRealisasiSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: 11.5, borderRadius: 6, border: '1px solid var(--line)', boxSizing: 'border-box' }}
                  />
                  {realisasiSearchQuery && (
                    <button onClick={() => setRealisasiSearchQuery('')} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 11, color: 'var(--t3)' }}>✕</button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', padding: 3, borderRadius: 8 }}>
                  <button
                    onClick={() => setRealisasiViewMode('multi-matrix')}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
                      background: realisasiViewMode === 'multi-matrix' ? '#16a34a' : 'transparent',
                      color: realisasiViewMode === 'multi-matrix' ? '#fff' : 'var(--t2)' }}
                  >
                    <span className="ic s">view_column</span> Matriks Bertahap (Spreadsheet)
                  </button>
                  <button
                    onClick={() => setRealisasiViewMode('high-level')}
                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
                      background: realisasiViewMode === 'high-level' ? '#0055D4' : 'transparent',
                      color: realisasiViewMode === 'high-level' ? '#fff' : 'var(--t2)' }}
                  >
                    <span className="ic s">account_balance_wallet</span> Ringkasan Rekening
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stat Summary Strip */}
            {(() => {
              const allItems = multiPengadaanData.flatMap(g => g.items);
              const grandPagu = allItems.reduce((s, it) => s + it.totPagu, 0);
              const grandB1 = allItems.reduce((s, it) => s + (it.b1Tot || 0), 0);
              const grandB2 = allItems.reduce((s, it) => s + (it.b2Tot || 0), 0);
              const grandB3 = allItems.reduce((s, it) => s + (it.b3Tot || 0), 0);
              const grandReal = grandB1 + grandB2 + grandB3;
              const grandSisa = grandPagu - grandReal;
              const grandPct = grandPagu > 0 ? ((grandReal / grandPagu) * 100).toFixed(1) : 0;

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Total Pagu RBA Aktif</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#14532d', marginTop: 2 }}>{fmtRp(grandPagu)}</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fefce8', border: '1px solid #fde047' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>Belanja Pertama (Ke-1)</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#713f12', marginTop: 2 }}>{fmtRp(grandB1)}</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Belanja Kedua (Ke-2)</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0c4a6e', marginTop: 2 }}>{fmtRp(grandB2)}</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>Belanja Ketiga (Ke-3)</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#064e3b', marginTop: 2 }}>{fmtRp(grandB3)}</div>
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #93c5fd' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>Sisa Anggaran Belanja</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#1e3a8a', marginTop: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{fmtRp(grandSisa)}</span>
                      <span style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: 10 }}>{(100 - Number(grandPct)).toFixed(1)}% Sisa</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'grp-atk', label: 'Alat Tulis Kantor (ATK)' },
                { id: 'grp-cetak', label: 'Cetak & Penggandaan' },
                { id: 'grp-kertas', label: 'Kertas & Cover' },
                { id: 'grp-perabot', label: 'Perabot & Kebersihan' },
                { id: 'grp-reagen', label: 'Reagen & BHP Lab' },
              ].map(k => (
                <button
                  key={k.id}
                  onClick={() => setRealisasiActiveKategori(k.id)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, border: '1px solid var(--line)', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: realisasiActiveKategori === k.id ? '#1e3a8a' : '#fff',
                    color: realisasiActiveKategori === k.id ? '#fff' : 'var(--t2)',
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>

            {/* =================================================================== */}
            {/* VIEW MODE 1: MATRIKS REALISASI BERTAHAP MULTI-PENGADAAN (SPREADSHEET FORMAT) */}
            {/* =================================================================== */}
            {realisasiViewMode === 'multi-matrix' && (
              <div style={{ overflowX: 'auto', border: '1.5px solid #000', borderRadius: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  <thead>
                    {/* Header Level 1: Category Pillars */}
                    <tr style={{ textAlign: 'center', fontWeight: 900, borderBottom: '1.5px solid #000' }}>
                      <th colSpan={6} style={{ background: '#dcfce7', padding: '10px 8px', borderRight: '2px solid #000', color: '#14532d', fontSize: 12 }}>
                        TOTAL KESELURUHAN (RBA TERBARU)
                      </th>
                      <th colSpan={4} style={{ background: '#fef08a', padding: '10px 8px', borderRight: '2px solid #000', color: '#713f12', fontSize: 12 }}>
                        BELANJA PERTAMA (PENGADAAN KE-1)
                      </th>
                      <th colSpan={4} style={{ background: '#bae6fd', padding: '10px 8px', borderRight: '2px solid #000', color: '#0c4a6e', fontSize: 12 }}>
                        BELANJA KEDUA (PENGADAAN KE-2)
                      </th>
                      <th colSpan={4} style={{ background: '#bbf7d0', padding: '10px 8px', borderRight: '2px solid #000', color: '#064e3b', fontSize: 12 }}>
                        BELANJA KETIGA (PENGADAAN KE-3)
                      </th>
                      <th colSpan={3} style={{ background: '#e2e8f0', padding: '10px 8px', color: '#1e293b', fontSize: 12 }}>
                        SISA &amp; AKSI PENGADAAN
                      </th>
                    </tr>

                    {/* Header Level 2: Sub Columns */}
                    <tr style={{ background: '#f8fafc', textAlign: 'center', fontWeight: 800, fontSize: 10.5, borderBottom: '2px solid #000' }}>
                      {/* Total Keseluruhan RBA */}
                      <th style={{ padding: '6px 4px', width: 30, borderRight: '1px solid #cbd5e1' }}>No</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', minWidth: 200, borderRight: '1px solid #cbd5e1' }}>Uraian Barang / Kegiatan</th>
                      <th style={{ padding: '6px 4px', width: 45, borderRight: '1px solid #cbd5e1' }}>Jumlah</th>
                      <th style={{ padding: '6px 6px', width: 45, borderRight: '1px solid #cbd5e1' }}>Satuan</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', minWidth: 80, borderRight: '1px solid #cbd5e1' }}>Harga RBA</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', minWidth: 95, borderRight: '2px solid #000', background: '#dcfce7', fontWeight: 900 }}>Total Pagu</th>

                      {/* Belanja 1 */}
                      <th style={{ padding: '6px 4px', width: 45, borderRight: '1px solid #cbd5e1', background: '#fef9c3' }}>Jumlah</th>
                      <th style={{ padding: '6px 2px', width: 15, borderRight: '1px solid #cbd5e1', background: '#fef9c3' }}>x</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', minWidth: 80, borderRight: '1px solid #cbd5e1', background: '#fef9c3' }}>Harga Deal</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', minWidth: 95, borderRight: '2px solid #000', background: '#fef08a', fontWeight: 900 }}>Total Real. 1</th>

                      {/* Belanja 2 */}
                      <th style={{ padding: '6px 4px', width: 45, borderRight: '1px solid #cbd5e1', background: '#e0f2fe' }}>Jumlah</th>
                      <th style={{ padding: '6px 2px', width: 15, borderRight: '1px solid #cbd5e1', background: '#e0f2fe' }}>x</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', minWidth: 80, borderRight: '1px solid #cbd5e1', background: '#e0f2fe' }}>Harga Deal</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', minWidth: 95, borderRight: '2px solid #000', background: '#bae6fd', fontWeight: 900 }}>Total Real. 2</th>

                      {/* Belanja 3 */}
                      <th style={{ padding: '6px 4px', width: 45, borderRight: '1px solid #cbd5e1', background: '#dcfce7' }}>Jumlah</th>
                      <th style={{ padding: '6px 2px', width: 15, borderRight: '1px solid #cbd5e1', background: '#dcfce7' }}>x</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', minWidth: 80, borderRight: '1px solid #cbd5e1', background: '#dcfce7' }}>Harga Deal</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', minWidth: 95, borderRight: '2px solid #000', background: '#bbf7d0', fontWeight: 900 }}>Total Real. 3</th>

                      {/* Sisa & Aksi */}
                      <th style={{ padding: '6px 6px', textAlign: 'center', width: 60, borderRight: '1px solid #cbd5e1' }}>Sisa Vol</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', minWidth: 95, borderRight: '1px solid #cbd5e1', fontWeight: 900 }}>Sisa Pagu</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', minWidth: 140 }}>Aksi Lanjutan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiPengadaanData
                      .filter(grp => realisasiActiveKategori === 'all' || grp.id === realisasiActiveKategori)
                      .map((grp) => {
                        const filteredItems = grp.items.filter(it =>
                          !realisasiSearchQuery || it.uraian.toLowerCase().includes(realisasiSearchQuery.toLowerCase())
                        );

                        if (filteredItems.length === 0) return null;

                        const subPagu = filteredItems.reduce((s, it) => s + it.totPagu, 0);
                        const subB1 = filteredItems.reduce((s, it) => s + (it.b1Tot || 0), 0);
                        const subB2 = filteredItems.reduce((s, it) => s + (it.b2Tot || 0), 0);
                        const subB3 = filteredItems.reduce((s, it) => s + (it.b3Tot || 0), 0);
                        const subReal = subB1 + subB2 + subB3;
                        const subSisa = subPagu - subReal;

                        return (
                          <React.Fragment key={grp.id}>
                            {/* Group Category Header Row */}
                            <tr style={{ background: '#f1f5f9', borderTop: '2px solid #000', borderBottom: '1.5px solid #000' }}>
                              <td colSpan={2} style={{ padding: '8px 10px', fontWeight: 900, color: '#1e3a8a', fontSize: 12 }}>
                                {grp.kategori}
                                <span style={{ marginLeft: 8, fontSize: 10, fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>({grp.kodeRekening})</span>
                              </td>
                              <td colSpan={3} style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 800, color: '#475569' }}>Total Anggaran:</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, background: '#dcfce7', color: '#14532d', borderRight: '2px solid #000' }}>
                                {fmtRp(grp.totalPagu)}
                              </td>

                              {/* Subtotal Belanja 1 */}
                              <td colSpan={3} style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 800, color: '#713f12', background: '#fef9c3' }}>Total B-1:</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, background: '#fef08a', color: '#713f12', borderRight: '2px solid #000' }}>
                                {fmtRp(grp.totalBelanja1)}
                              </td>

                              {/* Subtotal Belanja 2 */}
                              <td colSpan={3} style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 800, color: '#0c4a6e', background: '#e0f2fe' }}>Total B-2:</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, background: '#bae6fd', color: '#0c4a6e', borderRight: '2px solid #000' }}>
                                {fmtRp(grp.totalBelanja2)}
                              </td>

                              {/* Subtotal Belanja 3 */}
                              <td colSpan={3} style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 800, color: '#064e3b', background: '#dcfce7' }}>Total B-3:</td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, background: '#bbf7d0', color: '#064e3b', borderRight: '2px solid #000' }}>
                                {fmtRp(grp.totalBelanja3)}
                              </td>

                              {/* Subtotal Sisa */}
                              <td colSpan={2} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, color: subSisa < 0 ? '#ef4444' : '#1e40af' }}>
                                {fmtRp(grp.totalPagu - grp.totalBelanja1 - grp.totalBelanja2 - grp.totalBelanja3)}
                              </td>
                              <td style={{ textAlign: 'center', padding: '8px 6px' }}>
                                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#dbeafe', color: '#1e40af', fontWeight: 800 }}>
                                  {grp.items.length} Item
                                </span>
                              </td>
                            </tr>

                            {/* Item Rows */}
                            {filteredItems.map((it) => {
                              const totalRealVol = (it.b1Jml || 0) + (it.b2Jml || 0) + (it.b3Jml || 0);
                              const sisaVol = Math.max(it.jmlPagu - totalRealVol, 0);
                              const totalRealNom = (it.b1Tot || 0) + (it.b2Tot || 0) + (it.b3Tot || 0);
                              const sisaNom = it.totPagu - totalRealNom;
                              const isHabis = sisaVol <= 0 || sisaNom <= 0;

                              // Handler Redirect ke Eksekusi Pengadaan
                              const handleBuatPengadaanLanjutan = () => {
                                setNewForm({
                                  namaPaket: `Pengadaan Lanjutan — ${it.uraian}`,
                                  subKegiatan: 'Pelayanan dan Penunjang Pelayanan BLUD',
                                  kodeRekening: grp.kodeRekening,
                                  sumberDana: 'BLUD Puskesmas Tamalanrea Kota Makassar T.A. 2026',
                                  penyedia: '',
                                  kategori: grp.kategori.includes('ATK') ? 'ATK' : grp.kategori.includes('Cetak') ? 'Cetak' : 'Barang',
                                  catatan: `Pengadaan lanjutan dari sisa pagu RBA (Sisa vol: ${sisaVol} ${it.satuan}, Sisa dana: ${fmtRp(sisaNom)})`,
                                  items: [
                                    {
                                      no: 1,
                                      uraian: it.uraian,
                                      kategori: 'Barang',
                                      satuan: it.satuan,
                                      qty: sisaVol > 0 ? sisaVol : 1,
                                      hargaRAB: it.hrgPagu,
                                      h1N: '',
                                      h1H: it.hrgPagu,
                                      h1U: '',
                                      h2N: '',
                                      h2H: 0,
                                      h2U: '',
                                      h3N: '',
                                      h3H: 0,
                                      h3U: '',
                                      deal: it.hrgPagu,
                                    }
                                  ]
                                });
                                setMainTab('pengadaan');
                                setView('new');
                                setWizardStep(1);
                              };

                              return (
                                <tr key={it.no} style={{ borderBottom: '1px dotted #cbd5e1', background: isHabis ? '#fafafa' : '#fff' }}>
                                  {/* RBA Columns */}
                                  <td style={{ padding: '5px 4px', textAlign: 'center', borderRight: '1px solid #cbd5e1', color: 'var(--t3)' }}>{it.no}</td>
                                  <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>
                                    {it.uraian}
                                  </td>
                                  <td style={{ padding: '5px 4px', textAlign: 'center', borderRight: '1px solid #cbd5e1', fontWeight: 700 }}>{it.jmlPagu}</td>
                                  <td style={{ padding: '5px 6px', textAlign: 'center', borderRight: '1px solid #cbd5e1', color: '#64748b' }}>{it.satuan}</td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>{fmtRp(it.hrgPagu)}</td>
                                  <td style={{ padding: '5px 10px', textAlign: 'right', borderRight: '2px solid #000', background: '#f0fdf4', fontWeight: 800 }}>{fmtRp(it.totPagu)}</td>

                                  {/* Belanja 1 Columns */}
                                  <td style={{ padding: '5px 4px', textAlign: 'center', borderRight: '1px solid #cbd5e1', background: it.b1Jml > 0 ? '#fefce8' : 'transparent', fontWeight: it.b1Jml > 0 ? 700 : 400 }}>{it.b1Jml}</td>
                                  <td style={{ padding: '5px 2px', textAlign: 'center', borderRight: '1px solid #cbd5e1', color: '#94a3b8', background: it.b1Jml > 0 ? '#fefce8' : 'transparent' }}>x</td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: it.b1Jml > 0 ? '#fefce8' : 'transparent' }}>{it.b1Jml > 0 ? fmtRp(it.b1Hrg) : '—'}</td>
                                  <td style={{ padding: '5px 10px', textAlign: 'right', borderRight: '2px solid #000', background: it.b1Tot > 0 ? '#fef08a' : 'transparent', fontWeight: 700 }}>
                                    {it.b1Tot > 0 ? fmtRp(it.b1Tot) : '0'}
                                  </td>

                                  {/* Belanja 2 Columns */}
                                  <td style={{ padding: '5px 4px', textAlign: 'center', borderRight: '1px solid #cbd5e1', background: it.b2Jml > 0 ? '#f0f9ff' : 'transparent', fontWeight: it.b2Jml > 0 ? 700 : 400 }}>{it.b2Jml}</td>
                                  <td style={{ padding: '5px 2px', textAlign: 'center', borderRight: '1px solid #cbd5e1', color: '#94a3b8', background: it.b2Jml > 0 ? '#f0f9ff' : 'transparent' }}>x</td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: it.b2Jml > 0 ? '#f0f9ff' : 'transparent' }}>{it.b2Jml > 0 ? fmtRp(it.b2Hrg) : '—'}</td>
                                  <td style={{ padding: '5px 10px', textAlign: 'right', borderRight: '2px solid #000', background: it.b2Tot > 0 ? '#bae6fd' : 'transparent', fontWeight: 700 }}>
                                    {it.b2Tot > 0 ? fmtRp(it.b2Tot) : '0'}
                                  </td>

                                  {/* Belanja 3 Columns */}
                                  <td style={{ padding: '5px 4px', textAlign: 'center', borderRight: '1px solid #cbd5e1', background: it.b3Jml > 0 ? '#f0fdf4' : 'transparent', fontWeight: it.b3Jml > 0 ? 700 : 400 }}>{it.b3Jml}</td>
                                  <td style={{ padding: '5px 2px', textAlign: 'center', borderRight: '1px solid #cbd5e1', color: '#94a3b8', background: it.b3Jml > 0 ? '#f0fdf4' : 'transparent' }}>x</td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: it.b3Jml > 0 ? '#f0fdf4' : 'transparent' }}>{it.b3Jml > 0 ? fmtRp(it.b3Hrg) : '—'}</td>
                                  <td style={{ padding: '5px 10px', textAlign: 'right', borderRight: '2px solid #000', background: it.b3Tot > 0 ? '#bbf7d0' : 'transparent', fontWeight: 700 }}>
                                    {it.b3Tot > 0 ? fmtRp(it.b3Tot) : '0'}
                                  </td>

                                  {/* Sisa & Actions */}
                                  <td style={{ padding: '5px 6px', textAlign: 'center', borderRight: '1px solid #cbd5e1', fontWeight: 800, color: sisaVol === 0 ? '#94a3b8' : '#059669' }}>
                                    {sisaVol} {it.satuan}
                                  </td>
                                  <td style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #cbd5e1', fontWeight: 800, color: sisaNom === 0 ? '#94a3b8' : '#1e40af' }}>
                                    {fmtRp(sisaNom)}
                                  </td>
                                  <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                                    {!isHabis ? (
                                      <button
                                        onClick={handleBuatPengadaanLanjutan}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: 'none', background: '#0055D4', color: '#fff', fontSize: 10.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,85,212,0.2)' }}
                                        title={`Buat paket pengadaan baru untuk sisa ${sisaVol} ${it.satuan}`}
                                      >
                                        <span className="ic s" style={{ fontSize: 12 }}>add_shopping_cart</span> + Pengadaan
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: 9.5, padding: '2px 8px', borderRadius: 12, background: '#f1f5f9', color: '#64748b', fontWeight: 700 }}>
                                        ✓ Kuota Selesai
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                  </tbody>

                  {/* Grand Summary Footer */}
                  <tfoot>
                    {(() => {
                      const allItems = multiPengadaanData.flatMap(g => g.items);
                      const grandPagu = allItems.reduce((s, it) => s + it.totPagu, 0);
                      const grandB1 = allItems.reduce((s, it) => s + (it.b1Tot || 0), 0);
                      const grandB2 = allItems.reduce((s, it) => s + (it.b2Tot || 0), 0);
                      const grandB3 = allItems.reduce((s, it) => s + (it.b3Tot || 0), 0);
                      const grandReal = grandB1 + grandB2 + grandB3;
                      const grandSisa = grandPagu - grandReal;

                      return (
                        <tr style={{ background: '#1e3a8a', color: '#fff', fontWeight: 900, borderTop: '2.5px solid #000' }}>
                          <td colSpan={5} style={{ padding: '12px 10px', fontSize: 12 }}>TOTAL KESELURUHAN BELANJA REALISASI</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontSize: 12.5, background: '#172554', borderRight: '2px solid #fff' }}>{fmtRp(grandPagu)}</td>
                          <td colSpan={3} style={{ textAlign: 'right', padding: '12px 6px', background: '#854d0e', color: '#fef08a' }}>B-1:</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', background: '#713f12', color: '#fef08a', borderRight: '2px solid #fff' }}>{fmtRp(grandB1)}</td>
                          <td colSpan={3} style={{ textAlign: 'right', padding: '12px 6px', background: '#075985', color: '#bae6fd' }}>B-2:</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', background: '#0c4a6e', color: '#bae6fd', borderRight: '2px solid #fff' }}>{fmtRp(grandB2)}</td>
                          <td colSpan={3} style={{ textAlign: 'right', padding: '12px 6px', background: '#065f46', color: '#bbf7d0' }}>B-3:</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', background: '#064e3b', color: '#bbf7d0', borderRight: '2px solid #fff' }}>{fmtRp(grandB3)}</td>
                          <td colSpan={2} style={{ padding: '12px 10px', textAlign: 'right', color: '#93c5fd', fontSize: 12.5 }}>{fmtRp(grandSisa)}</td>
                          <td style={{ textAlign: 'center', padding: '12px 6px' }}>
                            <span style={{ fontSize: 11, background: '#2563eb', padding: '3px 8px', borderRadius: 10 }}>
                              {((grandReal / grandPagu) * 100).toFixed(1)}% Realisasi
                            </span>
                          </td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            )}

            {/* =================================================================== */}
            {/* VIEW MODE 2: HIGH-LEVEL RINGKASAN REKENING */}
            {/* =================================================================== */}
            {realisasiViewMode === 'high-level' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(90deg,#0055D4,#1e40af)', color: '#fff', textAlign: 'left' }}>
                      <th style={{ padding: '10px 8px', width: 28, borderRadius: '8px 0 0 0' }}></th>
                      <th style={{ padding: '10px 8px' }}>Kode Rekening Belanja (DPA)</th>
                      <th style={{ padding: '10px 8px', minWidth: 200 }}>Uraian Kegiatan Belanja</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Kategori</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Target RBA (Rp)</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right', background: 'rgba(74,222,128,0.2)' }}>Realisasi Lunas</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right', background: 'rgba(251,191,36,0.2)' }}>Dalam Proses</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Sisa Pagu</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', borderRadius: '0 8px 0 0', minWidth: 140 }}>% Penyerapan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRbaList.map((item) => {
                      const pagu = rbaActiveVersion === 'perubahan' ? item.paguPerubahan : item.paguPokok;
                      const real = item.terpakai;
                      const prosesPakets = paketsByRek(item.kodeRekening).filter(p => p.stage < 5);
                      const prosesNilai = prosesPakets.reduce((s, p) => s + calcDeal(p.items), 0);
                      const sisa = pagu - real - prosesNilai;
                      const pct = pagu > 0 ? ((real / pagu) * 100) : 0;
                      const pctProses = pagu > 0 ? ((prosesNilai / pagu) * 100) : 0;
                      const isExpanded = expandedRba === item.id;
                      const linkedPakets = paketsByRek(item.kodeRekening);
                      return (
                        <React.Fragment key={item.id}>
                          <tr
                            onClick={() => setExpandedRba(isExpanded ? null : item.id)}
                            style={{ borderBottom: isExpanded ? 'none' : '1px solid var(--line)', cursor: 'pointer', background: isExpanded ? '#f0f9ff' : 'transparent', transition: '.1s' }}
                          >
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              <span className="ic" style={{ fontSize: 14, color: isExpanded ? 'var(--blue)' : 'var(--t3)', transition: '.2s', transform: isExpanded ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>
                                chevron_right
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>
                              {item.kodeRekening}
                            </td>
                            <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--t1)' }}>{item.uraian}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              <span style={{
                                padding: '2px 9px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                                background: item.kategori === 'Barang' ? '#dbeafe' : '#f3e8ff',
                                color: item.kategori === 'Barang' ? '#1e40af' : '#6b21a8',
                              }}>
                                {item.kategori}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--t1)' }}>{fmtRp(pagu)}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: '#10b981', background: '#f0fdf422' }}>{fmtRp(real)}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#d97706', background: '#fffbeb22' }}>{prosesNilai > 0 ? fmtRp(prosesNilai) : '—'}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: sisa < 0 ? '#ef4444' : '#374151' }}>
                              {fmtRp(Math.max(sisa, 0))}
                              {sisa < 0 && <div style={{ fontSize: 9, color: '#ef4444' }}>⚠ Melebihi Pagu</div>}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                  <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, width: `${Math.min(pct + pctProses, 100)}%`, height: '100%', background: '#fbbf24', borderRadius: 4 }} />
                                    <div style={{ position: 'absolute', left: 0, top: 0, width: `${Math.min(pct, 100)}%`, height: '100%', background: '#10b981', borderRadius: 4 }} />
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: pct > 90 ? '#ef4444' : '#10b981', minWidth: 38 }}>{pct.toFixed(1)}%</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, fontSize: 9, color: 'var(--t3)' }}>
                                  <span style={{ color: '#10b981' }}>■ Lunas {pct.toFixed(0)}%</span>
                                  {pctProses > 0 && <span style={{ color: '#f59e0b' }}>■ Proses {pctProses.toFixed(0)}%</span>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#0055D4', color: '#fff', fontWeight: 800 }}>
                      <td colSpan={4} style={{ padding: '12px 8px' }}>TOTAL KESELURUHAN ANGGARAN BLUD</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>{fmtRp(totalRbaPagu)}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>{fmtRp(totalRealisasiKeuangan)}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>{fmtRp(totalRealisasiProses)}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>{fmtRp(totalRbaPagu - totalRealisasiKeuangan - totalRealisasiProses)}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 900 }}>{pctRealisasiKeuangan}%</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

          </div>
        </div>
      );
    })()}

      {/* =================================================================== */}
      {/* MAIN TAB 2: MASTER DATA SETUP (LAMPIRAN 1) */}
      {/* =================================================================== */}
      {mainTab === 'master' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── 1. DATABASE VENDOR (ditaruh di atas) ── */}
          <div className="card" style={{ padding: '14px 18px', background: 'var(--srf)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Database Rekanan &amp; Vendor Penyedia</h3>
                <p style={{ fontSize: 11, color: 'var(--t3)', margin: '2px 0 0 0' }}>Master vendor rekanan untuk SPK, BAST, dan kuitansi pembayaran.</p>
              </div>
              <button className="btn" onClick={handleOpenAddVendor} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', fontWeight: 700, borderRadius: 7, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 11 }}>
                <span className="ic s">storefront</span> + Tambah Vendor
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                    <th style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--t2)' }}>ID</th>
                    <th style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--t2)' }}>Nama Perusahaan</th>
                    <th style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--t2)' }}>NPWP</th>
                    <th style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--t2)' }}>Rekening &amp; Bank</th>
                    <th style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--t2)' }}>Direktur</th>
                    <th style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--t2)' }}>Telepon</th>
                    <th style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--t2)' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {masterData.vendors.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 700, color: 'var(--blue)', fontSize: 11 }}>{v.id}</td>
                      <td style={{ padding: '6px 10px', fontWeight: 700 }}>
                        {v.nama}
                        {v.alamat && <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400, marginTop: 1 }}>{v.alamat}</div>}
                      </td>
                      <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: 11 }}>{v.npwp || '-'}</td>
                      <td style={{ padding: '6px 10px', fontSize: 11 }}>{v.norek} <span style={{ color: 'var(--t3)' }}>({v.bank})</span></td>
                      <td style={{ padding: '6px 10px' }}>{v.direktur || '-'}</td>
                      <td style={{ padding: '6px 10px' }}>{v.telp || '-'}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                          <button onClick={() => handleOpenEditVendor(v)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: 'var(--blue)', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => triggerDeleteVendor(v)} style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 2. MASTER PENANDATANGAN ── */}
          <div className="card" style={{ padding: '14px 18px', background: 'var(--srf)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0 }}>Master Data Penandatangan &amp; Instansi</h3>
                <p style={{ fontSize: 11, color: 'var(--t3)', margin: '2px 0 0 0' }}>Role pejabat yang terlibat dalam pengesahan dokumen pengadaan.</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setIsAddRoleModalOpen(true)} style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none', fontWeight: 700, borderRadius: 7, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 11 }}>
                  <span className="ic s">person_add</span> + Tambah Role
                </button>
                <button className="btn pri" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => alert('Tersimpan otomatis!')}>
                  <span className="ic s">save</span> Simpan
                </button>
              </div>
            </div>

            {/* 4-column fixed grid for signer cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {masterData.signers.map((s) => {
                const isEditing = editingSignerId === s.id;
                const d = isEditing ? editingSignerData : s;
                const matrix = getSignerMatrix(d);

                if (isEditing) {
                  return (
                    <div
                      key={s.id}
                      style={{
                        border: '2px solid var(--blue)',
                        borderRadius: 12,
                        padding: 16,
                        background: '#f0f9ff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><span className="ic s">{d.icon || 'edit'}</span> Edit Role: {s.title}</span>
                        <button
                          onClick={() => { setEditingSignerId(null); setEditingSignerData(null); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}
                        >
                          ✕
                        </button>
                      </div>

                      <div>
                        <label style={lblSm}>Nama Lengkap &amp; Gelar</label>
                        <input
                          value={d.nama}
                          onChange={(e) => setEditingSignerData({ ...d, nama: e.target.value })}
                          style={inpSm}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <label style={lblSm}>NIP Pejabat</label>
                          <input
                            value={d.nip}
                            onChange={(e) => setEditingSignerData({ ...d, nip: e.target.value })}
                            style={inpSm}
                          />
                        </div>
                        <div>
                          <label style={lblSm}>Jabatan Resmi</label>
                          <input
                            value={d.jabatan}
                            onChange={(e) => setEditingSignerData({ ...d, jabatan: e.target.value })}
                            style={inpSm}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={lblSm}>Wewenang / Tipe Akses Role</label>
                        <select
                          value={d.aksesType}
                          onChange={(e) => setEditingSignerData({ ...d, aksesType: e.target.value })}
                          style={{ ...inpSm, width: '100%' }}
                        >
                          <option value="Penandatangan Utama & Approval Final">Penandatangan Utama & Approval Final</option>
                          <option value="Pejabat Pelaksana Teknis & Verifikator RAB">Pejabat Pelaksana Teknis & Verifikator RAB</option>
                          <option value="Verifikasi Pembayaran & Pencairan Keuangan">Verifikasi Pembayaran & Pencairan Keuangan</option>
                          <option value="Pemeriksaan Fisik Barang & BASTHP">Pemeriksaan Fisik Barang & BASTHP</option>
                          <option value="Melihat Realisasi Tok (Read-only Monitoring)">Melihat Realisasi Tok (Read-only Monitoring)</option>
                          <option value="Verifikator Dokumen SPJ & Arsip">Verifikator Dokumen SPJ & Arsip</option>
                        </select>
                      </div>

                      {/* Interactive Process Permission Matrix (User Request) */}
                      <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Matriks Akses &amp; Keterlibatan Proses:</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => {
                                const fullMatrix = {};
                                PROCESS_DEF.forEach(p => fullMatrix[p.key] = { view: true, edit: true, ttd: true, approve: true });
                                setEditingSignerData({ ...d, processMatrix: fullMatrix, tugas: ['DPA', 'SPK', 'BAPP', 'BAST', 'BAP', 'Kwitansi', 'Realisasi'] });
                              }}
                              style={{ background: '#dbeafe', border: 'none', color: '#1e40af', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}
                            >
                              Full Akses
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const roMatrix = {};
                                PROCESS_DEF.forEach(p => roMatrix[p.key] = { view: true, edit: false, ttd: false, approve: false });
                                setEditingSignerData({ ...d, processMatrix: roMatrix, tugas: [] });
                              }}
                              style={{ background: '#f3e8ff', border: 'none', color: '#7e22ce', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}
                            >
                              View Tok
                            </button>
                          </div>
                        </div>

                        <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse', textAlign: 'center' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                              <th style={{ padding: '4px', textAlign: 'left' }}>Proses / Dokumen</th>
                              <th style={{ padding: '4px' }}>View</th>
                              <th style={{ padding: '4px' }}>Edit</th>
                              <th style={{ padding: '4px' }}>TTD</th>
                              <th style={{ padding: '4px' }}>Approve</th>
                            </tr>
                          </thead>
                          <tbody>
                            {PROCESS_DEF.map((proc) => {
                              const m = matrix[proc.key] || { view: true, edit: false, ttd: false, approve: false };
                              const toggle = (act) => {
                                const nextM = { ...matrix };
                                nextM[proc.key] = { ...m, [act]: !m[act] };
                                const nextTugas = PROCESS_DEF.filter(p => nextM[p.key]?.ttd || nextM[p.key]?.approve).map(p => p.key);
                                setEditingSignerData({ ...d, processMatrix: nextM, tugas: nextTugas });
                              };
                              return (
                                <tr key={proc.key} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                                  <td style={{ padding: '4px', textAlign: 'left', fontWeight: 700 }}>{proc.label}</td>
                                  <td style={{ padding: '4px' }}><input type="checkbox" checked={m.view} onChange={() => toggle('view')} /></td>
                                  <td style={{ padding: '4px' }}><input type="checkbox" checked={m.edit} onChange={() => toggle('edit')} /></td>
                                  <td style={{ padding: '4px' }}><input type="checkbox" checked={m.ttd} onChange={() => toggle('ttd')} /></td>
                                  <td style={{ padding: '4px' }}><input type="checkbox" checked={m.approve} onChange={() => toggle('approve')} /></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                        <button
                          onClick={() => { setEditingSignerId(null); setEditingSignerData(null); }}
                          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--line)', background: '#fff', fontSize: 12, cursor: 'pointer' }}
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleSaveSignerEdit}
                          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  );
                }

                // CLOSED / READ-ONLY CARD
                return (
                  <div
                    key={s.id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      padding: 12,
                      background: 'var(--bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div>
                      {/* Card Header & Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: s.color || 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="ic s" style={{ fontSize: 16 }}>{s.icon || 'person'}</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, color: s.color || 'var(--blue)', fontSize: 11, lineHeight: 1.2 }}>{s.title}</div>
                            <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.aksesType}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 3, flexShrink: 0, marginLeft: 4 }}>
                          <button
                            title="Edit Role Penandatangan"
                            onClick={() => { setEditingSignerId(s.id); setEditingSignerData({ ...s }); }}
                            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: 'var(--blue)', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            title="Hapus Role Penandatangan"
                            onClick={() => triggerDeleteSigner(s)}
                            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      {/* Compact Identity */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.3 }}>{s.nama || '-'}</div>
                        <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 1 }}>{s.jabatan || '-'}</div>
                        <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'monospace', marginTop: 1 }}>NIP: {s.nip || '-'}</div>
                      </div>
                    </div>

                    {/* Compact Matrix Table */}
                    <div style={{ borderTop: '1px dashed var(--line)', paddingTop: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span className="ic s" style={{ fontSize: 12, color: 'var(--blue)' }}>tune</span> Hak Akses Proses
                      </div>
                      <table style={{ width: '100%', fontSize: 9.5, borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                          <tr style={{ background: 'var(--srf)' }}>
                            <th style={{ padding: '2px 4px', textAlign: 'left', fontWeight: 700, color: 'var(--t2)' }}>Proses</th>
                            <th style={{ padding: '2px 3px', fontWeight: 700, color: '#0284c7', width: 20 }}>V</th>
                            <th style={{ padding: '2px 3px', fontWeight: 700, color: '#d97706', width: 20 }}>E</th>
                            <th style={{ padding: '2px 3px', fontWeight: 700, color: '#1e40af', width: 30 }}>TTD</th>
                            <th style={{ padding: '2px 3px', fontWeight: 700, color: '#15803d', width: 30 }}>Acc</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PROCESS_DEF.map((proc) => {
                            const m = matrix[proc.key] || {};
                            const hasAction = m.ttd || m.approve || m.edit;
                            return (
                              <tr key={proc.key} style={{ borderBottom: '1px solid var(--line)', background: hasAction ? '#f0f9ff' : 'transparent' }}>
                                <td style={{ padding: '2px 4px', textAlign: 'left', fontWeight: 600, color: 'var(--t1)', fontSize: 9 }}>{proc.label}</td>
                                <td>{m.view ? <span style={{ color: '#0284c7', fontWeight: 900 }}>✓</span> : <span style={{ color: '#ddd' }}>·</span>}</td>
                                <td>{m.edit ? <span style={{ color: '#d97706', fontWeight: 900 }}>✓</span> : <span style={{ color: '#ddd' }}>·</span>}</td>
                                <td>{m.ttd ? <span style={{ background: '#dbeafe', color: '#1e40af', borderRadius: 3, padding: '0 3px', fontWeight: 800, fontSize: 9 }}>✍</span> : <span style={{ color: '#ddd' }}>·</span>}</td>
                                <td>{m.approve ? <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 3, padding: '0 3px', fontWeight: 800, fontSize: 9 }}>✅</span> : <span style={{ color: '#ddd' }}>·</span>}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}

      {/* =================================================================== */}
      {/* =================================================================== */}
      {/* =================================================================== */}
      {/* =================================================================== */}
      {/* MAIN TAB 3: REGISTRASI RBA & DPA (LAMPIRAN 2) - 3 SKEMA INTEGRASI */}
      {/* =================================================================== */}
      {mainTab === 'rba' && (() => {
        const isEditing = rbaSubTab === 'edit';
        const activeData = isEditing ? rbaEditOfficialData : rbaOfficialData;

        // Dynamic Calculation Helpers
        const calcPendapatanTotal = (data) => {
          if (!data || !data.pendapatan) return 2138164671;
          return data.pendapatan.reduce((acc, p) => {
            const subTot = (p.subItems || []).reduce((s, item) => s + (Number(item.jumlah) || 0), 0);
            return acc + subTot;
          }, 0);
        };

        const calcBelanjaTotal = (data) => {
          if (!data || !data.belanjaSections) return 2138164671;
          let grandTotal = 0;
          data.belanjaSections.forEach(sec => {
            (sec.groups || []).forEach(grp => {
              (grp.subGroups || []).forEach(sg => {
                (sg.accounts || []).forEach(acc => {
                  (acc.items || []).forEach(it => {
                    grandTotal += (Number(it.jumlah) || 0);
                  });
                });
              });
            });
          });
          return grandTotal;
        };

        const calcAccountTotal = (acc) => {
          return (acc.items || []).reduce((s, it) => s + (Number(it.jumlah) || 0), 0);
        };

        const calcSubGroupTotal = (sg) => {
          return (sg.accounts || []).reduce((s, acc) => s + calcAccountTotal(acc), 0);
        };

        const calcGroupTotal = (grp) => {
          return (grp.subGroups || []).reduce((s, sg) => s + calcSubGroupTotal(sg), 0);
        };

        const totalPendapatan = calcPendapatanTotal(activeData);
        const totalBelanja = calcBelanjaTotal(activeData);

        // Edit Mode Handlers
        const updatePendapatanItem = (pIdx, sIdx, field, val) => {
          setRbaEditOfficialData(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            copy.pendapatan[pIdx].subItems[sIdx][field] = val;
            if (field === 'harga' || field === 'qty') {
              const q = Number(copy.pendapatan[pIdx].subItems[sIdx].qty) || 1;
              const h = Number(copy.pendapatan[pIdx].subItems[sIdx].harga) || 0;
              copy.pendapatan[pIdx].subItems[sIdx].jumlah = q * h;
            }
            return copy;
          });
        };

        const updateBelanjaItem = (secIdx, grpIdx, sgIdx, accIdx, itIdx, field, val) => {
          setRbaEditOfficialData(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            const it = copy.belanjaSections[secIdx].groups[grpIdx].subGroups[sgIdx].accounts[accIdx].items[itIdx];
            it[field] = val;
            if (field === 'jumlah') {
              it.jumlah = Number(val) || 0;
            }
            return copy;
          });
        };

        const addBelanjaItem = (secIdx, grpIdx, sgIdx, accIdx) => {
          setRbaEditOfficialData(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            const items = copy.belanjaSections[secIdx].groups[grpIdx].subGroups[sgIdx].accounts[accIdx].items;
            items.push({
              id: 'item-new-' + Date.now(),
              kode: '',
              uraian: 'Item Belanja Baru',
              rincianText: '1 unit x Rp 0',
              qty: 1,
              satuan: 'unit',
              harga: 0,
              jumlah: 0,
            });
            return copy;
          });
        };

        const removeBelanjaItem = (secIdx, grpIdx, sgIdx, accIdx, itIdx) => {
          setRbaEditOfficialData(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            copy.belanjaSections[secIdx].groups[grpIdx].subGroups[sgIdx].accounts[accIdx].items.splice(itIdx, 1);
            return copy;
          });
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Top Header Bar ── */}
            <div className="card" style={{ padding: '16px 20px', background: '#1e3a8a', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="ic l" style={{ color: '#93c5fd', fontSize: 26 }}>account_balance</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.3px' }}>
                      Registrasi RBA &amp; DPA Walikota — Multi-Skema Input
                    </div>
                    <div style={{ fontSize: 11, color: '#93c5fd', marginTop: 2 }}>
                      Mendukung 3 Metode: Lampiran Dokumen Saja, Integrasi Mirroring Excel, dan Tabel Interaktif In-App
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700 }}>
                    Acuan Sistem:&nbsp;
                    <span style={{ color: rbaAcuanAktif === 'perubahan' ? '#6ee7b7' : '#fde68a', fontWeight: 800 }}>
                      {rbaAcuanAktif === 'perubahan' ? `RBA Perubahan (Revisi Aktif)` : 'RBA Pokok (Murni Awal)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Skema Selector Tabs */}
              <div style={{ display: 'flex', gap: 6, marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, flexWrap: 'wrap' }}>
                {[
                  { id: 'attachment', label: '1. Lampirkan Dokumen Saja', desc: 'Arsip PDF / Scan DPA Walikota', icon: 'attach_file' },
                  { id: 'excel-sync', label: '2. Mirroring & Import Excel', desc: 'Sync Otomatis File Spreadsheet', icon: 'sync_alt' },
                  { id: 'table', label: '3. Tabel Interaktif & Cetak', desc: 'Buat, Edit, Finalisasi & Print Dokumen', icon: 'table_view' },
                ].map(sch => (
                  <button
                    key={sch.id}
                    onClick={() => { setRbaActiveScheme(sch.id); if (sch.id === 'table') setRbaSubTab('aktif'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8,
                      border: 'none', cursor: 'pointer', textAlign: 'left', transition: '.15s',
                      background: rbaActiveScheme === sch.id ? '#fff' : 'rgba(255,255,255,0.1)',
                      color: rbaActiveScheme === sch.id ? '#1e3a8a' : 'rgba(255,255,255,0.85)',
                      boxShadow: rbaActiveScheme === sch.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    }}
                  >
                    <span className="ic s" style={{ fontSize: 18, color: rbaActiveScheme === sch.id ? '#1d4ed8' : '#93c5fd' }}>{sch.icon}</span>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 800 }}>{sch.label}</div>
                      <div style={{ fontSize: 9.5, opacity: 0.8 }}>{sch.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Automated Budget Deduction Sync Alert */}
            {(() => {
              const completedPakets = pakets.filter((p) => p.stage === 7);
              const totalCompletedSpend = completedPakets.reduce((s, p) => s + calcDeal(p.items), 0);
              if (completedPakets.length === 0) return null;
              return (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '1.5px solid #86efac',
                    borderRadius: 12,
                    padding: '12px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: '#10b981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span className="ic s" style={{ fontSize: 20 }}>bolt</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Sinkronisasi Realisasi Pagu Otomatis Aktif
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#166534', color: '#fff', fontWeight: 800 }}>
                          LIVE SYNC
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#15803d', marginTop: 2 }}>
                        Total <strong>{fmtRp(totalCompletedSpend)}</strong> dari {completedPakets.length} paket pengadaan selesai (Tahap 7 / Kwitansi Cair) telah otomatis memotong sisa pagu rekening belanja RBA.
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setMainTab('pengadaan')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #86efac',
                        background: '#fff',
                        color: '#166534',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Lihat Rincian Pengadaan →
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ================================================================ */}
            {/* SKEMA 1: LAMPIRKAN DOKUMEN SAJA (ARSIP DIGITAL) */}
            {/* ================================================================ */}
            {rbaActiveScheme === 'attachment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Info Card Skema 1 */}
                <div className="card" style={{ padding: 18, background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span className="ic l" style={{ color: '#1d4ed8', fontSize: 28 }}>description</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e40af' }}>
                        Skema 1: Lampiran Dokumen Legalitas RBA &amp; DPA
                      </h4>
                      <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#1e3a8a', lineHeight: 1.5 }}>
                        Untuk unit kerja yang hanya memerlukan pencatatan dasar hukum dan pagu global tanpa mengurai seluruh item belanja secara manual.
                        Unggah berkas PDF atau scan DPA Walikota / Lembar Pengesahan BPKAD di bawah ini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid Metadata & File Explorer */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                  
                  {/* Card 1: Metadata Legalitas */}
                  <div className="card" style={{ padding: 20, background: 'var(--srf)' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="ic s" style={{ color: '#2563eb' }}>fact_check</span>
                      Metadata Dokumen Pengesahan
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Nomor DPA (Walikota)</label>
                        <input
                          value={rbaAttachMeta.dpaNomor}
                          onChange={e => setRbaAttachMeta(p => ({ ...p, dpaNomor: e.target.value }))}
                          style={{ width: '100%', padding: '7px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--line)', fontFamily: 'monospace', fontWeight: 700, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Tanggal DPA</label>
                          <input
                            value={rbaAttachMeta.tglDpa}
                            onChange={e => setRbaAttachMeta(p => ({ ...p, tglDpa: e.target.value }))}
                            style={{ width: '100%', padding: '7px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--line)', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Pagu Global (Rp)</label>
                          <input
                            type="number"
                            value={rbaAttachMeta.paguGlobal}
                            onChange={e => setRbaAttachMeta(p => ({ ...p, paguGlobal: Number(e.target.value) || 0 }))}
                            style={{ width: '100%', padding: '7px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--line)', fontWeight: 800, boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Pejabat / Instansi Pengesah</label>
                        <input
                          value={rbaAttachMeta.pejabatPenerbit}
                          onChange={e => setRbaAttachMeta(p => ({ ...p, pejabatPenerbit: e.target.value }))}
                          style={{ width: '100%', padding: '7px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--line)', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Catatan Legalitas</label>
                        <textarea
                          rows={2}
                          value={rbaAttachMeta.catatan}
                          onChange={e => setRbaAttachMeta(p => ({ ...p, catatan: e.target.value }))}
                          style={{ width: '100%', padding: '7px 10px', fontSize: 11.5, borderRadius: 6, border: '1px solid var(--line)', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                      </div>
                      <button
                        onClick={() => alert('Metadata dokumen legalitas berhasil diperbarui ke sistem!')}
                        style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#1e3a8a', color: '#fff', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', marginTop: 4 }}
                      >
                        Simpan Perubahan Metadata
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Daftar Berkas Terlampir & Upload Area */}
                  <div className="card" style={{ padding: 20, background: 'var(--srf)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="ic s" style={{ color: '#16a34a' }}>folder</span>
                        Berkas Arsip Lampiran ({rbaAttachments.length} Dokumen)
                      </span>
                      <label style={{ padding: '5px 12px', borderRadius: 6, background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        + Unggah File Baru
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          style={{ display: 'none' }}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              setRbaAttachments(prev => [
                                ...prev,
                                {
                                  id: 'att-' + Date.now(),
                                  nama: f.name,
                                  size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
                                  tglUpload: 'Hari Ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                                  tipe: f.name.split('.').pop().toUpperCase(),
                                  status: 'Arsip Baru',
                                  nomorSurat: rbaAttachMeta.dpaNomor
                                }
                              ]);
                              alert(`File ${f.name} berhasil diunggah sebagai lampiran RBA!`);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Attachment List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      {rbaAttachments.map(att => (
                        <div key={att.id} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 6, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10, flexShrink: 0 }}>
                              {att.tipe}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.nama}</div>
                              <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>
                                {att.size} &bull; {att.tglUpload} &bull; <span style={{ color: '#059669', fontWeight: 700 }}>{att.status}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button onClick={() => alert(`Membuka pratinjau dokumen: ${att.nama}`)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--line)', background: '#fff', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}>Lihat</button>
                            <button onClick={() => setRbaAttachments(p => p.filter(x => x.id !== att.id))} style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Drag and Drop Zone */}
                    <div style={{ border: '2px dashed #93c5fd', borderRadius: 10, padding: '16px', textAlign: 'center', background: '#f8fafc', marginTop: 14 }}>
                      <span className="ic s" style={{ color: '#3b82f6', fontSize: 24, display: 'block', marginBottom: 4 }}>cloud_upload</span>
                      <div style={{ fontSize: 11.5, fontWeight: 700 }}>Tarik dan lepaskan file dokumen RBA ke sini</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>Mendukung format PDF, Word, Scan Gambar (Maks. 25 MB)</div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SKEMA 2: INTEGRASI & MIRRORING OTOMATIS DARI EXCEL */}
            {/* ================================================================ */}
            {rbaActiveScheme === 'excel-sync' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Info & Sync Status Card */}
                <div className="card" style={{ padding: 18, background: '#f0fdf4', border: '1.5px solid #86efac' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span className="ic l" style={{ color: '#16a34a', fontSize: 28 }}>sync_alt</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#14532d' }}>
                          Skema 2: Integrasi / Mirroring Otomatis dari Spreadsheet Excel
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#166534', lineHeight: 1.5 }}>
                          Sinkronkan data RBA langsung dari file Excel tanpa perlu ketik ulang. Sistem akan mem-parsing seluruh kolom No, Kode Rekening, Uraian, Rincian, dan Jumlah secara otomatis.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => alert('Mengunduh Template Standar Excel RBA Puskesmas Tamalanrea TA 2026 (.xlsx)...')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: '1px solid #86efac', background: '#fff', color: '#14532d', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                      >
                        <span className="ic s">download</span> Download Template Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Bar Mirroring */}
                <div className="card" style={{ padding: 16, background: 'var(--srf)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>File Sumber Excel</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#1e40af', marginTop: 2 }}>{excelSyncStatus.fileName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Status Mirroring</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="ic s" style={{ fontSize: 14 }}>check_circle</span> {excelSyncStatus.status}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Baris Ter-Mapping</div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2 }}>{excelSyncStatus.rowCount} Baris Belanja &amp; Pendapatan</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Sinkronisasi Terakhir</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginTop: 2 }}>{excelSyncStatus.lastSync}</div>
                  </div>
                </div>

                {/* Excel Paste & Upload Area */}
                <div className="card" style={{ padding: 20, background: 'var(--srf)' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                    Paste Data Tabel Excel atau Unggah Berkas Baru
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--t3)', margin: '0 0 14px' }}>
                    Copy baris tabel dari Microsoft Excel atau Google Sheets (kolom: Kode Rekening, Uraian, Rincian, Jumlah) lalu paste ke dalam box di bawah:
                  </p>

                  <textarea
                    rows={5}
                    placeholder="Contoh format paste (Tab-delimited):&#10;5.1.02.01.001.00024	Belanja Alat Tulis Kantor	10 pack x Rp 15.500	155000&#10;5.1.02.01.001.00025	Belanja Kertas dan Cover	260 rim x Rp 53.000	13780000"
                    value={excelPasteInput}
                    onChange={e => setExcelPasteInput(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', fontSize: 12, fontFamily: 'monospace', borderRadius: 8, border: '1px solid var(--line)', boxSizing: 'border-box', marginBottom: 12 }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 6, background: '#1e3a8a', color: '#fff', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
                        <span className="ic s">upload_file</span> Unggah File .xlsx
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          style={{ display: 'none' }}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              setExcelSyncStatus(prev => ({
                                ...prev,
                                fileName: f.name,
                                lastSync: 'Baru saja diunggah',
                                status: 'Siap Sinkronisasi'
                              }));
                              alert(`File Excel ${f.name} siap di-parsing dan dimirroring ke tabel RBA!`);
                            }
                          }}
                        />
                      </label>
                      <button
                        onClick={() => {
                          if (!excelPasteInput.trim()) {
                            alert('Silakan paste teks data tabel dari Excel terlebih dahulu!');
                            return;
                          }
                          const lines = excelPasteInput.trim().split('\n');
                          setExcelParsedPreview(lines.map((l, i) => {
                            const parts = l.split('\t');
                            return {
                              no: i + 1,
                              kode: parts[0] || '-',
                              uraian: parts[1] || '-',
                              rincian: parts[2] || '-',
                              jumlah: Number(parts[3]) || 0,
                            };
                          }));
                        }}
                        style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg)', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Pratinjau Hasil Parsing
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setExcelSyncStatus(prev => ({
                          ...prev,
                          lastSync: 'Hari Ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA',
                          status: 'Tersinkronisasi 100%'
                        }));
                        setRbaAcuanAktif('perubahan');
                        alert('Data Excel berhasil dimirroring dan diterapkan sebagai RBA Acuan Aktif Sistem!');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 20px', borderRadius: 6, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                    >
                      <span className="ic s">sync</span> Terapkan &amp; Sinkronkan ke RBA Aktif
                    </button>
                  </div>

                  {/* Parsed Preview Table */}
                  {excelParsedPreview && (
                    <div style={{ marginTop: 18, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: '#059669' }}>
                        ✓ Pratinjau Deteksi Kolom Excel ({excelParsedPreview.length} Baris Terdeteksi):
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, border: '1px solid var(--line)' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--line)' }}>
                            <th style={{ padding: '6px', width: '5%' }}>No</th>
                            <th style={{ padding: '6px', width: '25%' }}>Kode Rekening</th>
                            <th style={{ padding: '6px', width: '35%' }}>Uraian</th>
                            <th style={{ padding: '6px', width: '20%' }}>Rincian</th>
                            <th style={{ padding: '6px', width: '15%', textAlign: 'right' }}>Jumlah (Rp)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {excelParsedPreview.map(p => (
                            <tr key={p.no} style={{ borderBottom: '1px solid var(--line)' }}>
                              <td style={{ padding: '5px', textAlign: 'center' }}>{p.no}</td>
                              <td style={{ padding: '5px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--blue)' }}>{p.kode}</td>
                              <td style={{ padding: '5px', fontWeight: 600 }}>{p.uraian}</td>
                              <td style={{ padding: '5px', color: 'var(--t3)' }}>{p.rincian}</td>
                              <td style={{ padding: '5px', textAlign: 'right', fontWeight: 700 }}>{fmtRp(p.jumlah)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SKEMA 3: TABEL INTERAKTIF, REVISI IN-APP & PRINT DOKUMEN RESMI */}
            {/* ================================================================ */}
            {rbaActiveScheme === 'table' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Toolbar Filter & Action Buttons */}
                <div className="card" style={{ padding: '12px 18px', background: 'var(--srf)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>Filter Bagian:</span>
                    {[
                      { id: 'all', label: 'Semua Dokumen' },
                      { id: 'pendapatan', label: 'Pendapatan' },
                      { id: 'operasi', label: '5.1 Belanja Operasi' },
                      { id: 'modal', label: '5.2 Belanja Modal' },
                    ].map(f => (
                      <button key={f.id} onClick={() => setRbaFilterSection(f.id)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          background: rbaFilterSection === f.id ? '#1e3a8a' : 'var(--bg)',
                          color: rbaFilterSection === f.id ? '#fff' : 'var(--t2)',
                        }}>
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!isEditing ? (
                      <>
                        <div style={{ fontSize: 10.5, color: '#64748b', background: '#f1f5f9', padding: '5px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span className="ic s" style={{ fontSize: 14 }}>lock</span> Dokumen Terkunci (Read-Only)
                        </div>
                        <button
                          onClick={() => setIsRbaPrintPreviewOpen(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#1e3a8a', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}
                        >
                          <span className="ic s">print</span> Cetak Dokumen Resmi
                        </button>
                        <button
                          onClick={() => setRbaUsulModal({ open: true, alasan: '' })}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#d97706', color: '#fff', fontSize: 12, fontWeight: 800, boxShadow: '0 2px 8px rgba(217,119,6,0.25)' }}
                        >
                          <span className="ic s">edit_note</span> Revisi RBA
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setRbaEditOfficialData(JSON.parse(JSON.stringify(rbaOfficialData)));
                            setRbaSubTab('aktif');
                          }}
                          style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer', background: 'var(--bg)', color: 'var(--t2)', fontSize: 12, fontWeight: 700 }}
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => {
                            setRbaOfficialData(JSON.parse(JSON.stringify(rbaEditOfficialData)));
                            setRbaAcuanAktif('perubahan');
                            setRbaSubTab('aktif');
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 800, boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}
                        >
                          <span className="ic s">save</span> Simpan Revisi RBA
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit Mode Alert Banner */}
                {isEditing && (
                  <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: 10, padding: '10px 16px', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="ic s" style={{ color: '#d97706', fontSize: 20 }}>warning</span>
                    <div style={{ flex: 1 }}>
                      <strong>Mode Edit Revisi RBA Aktif:</strong> Anda dapat mengubah rincian perhitungan, harga, atau menambah baris belanja baru. Total belanja akan dihitung ulang secara otomatis.
                    </div>
                  </div>
                )}

                {/* ── Official Document Sheet Container ── */}
                <div className="card" style={{ padding: 24, background: '#fff', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

                  {/* Document Official Kop / Title Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#0f172a' }}>
                      {activeData.header.pemda}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#0f172a', margin: '2px 0' }}>
                      {activeData.header.unit}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#1e3a8a', marginTop: 4 }}>
                      {activeData.header.title}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase', color: '#334155' }}>
                      {activeData.header.subtitle}
                    </div>
                  </div>

                  {/* Main Official RBA Table (4 Columns) */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, color: '#0f172a', border: '1.5px solid #000' }}>
                      <thead>
                        {/* Table Header Row 1: Titles */}
                        <tr style={{ background: '#fef08a', textAlign: 'center', fontWeight: 900, borderBottom: '1.5px solid #000' }}>
                          <th style={{ width: '4%', padding: '10px 4px', borderRight: '1.5px solid #000' }}>No</th>
                          <th style={{ width: '18%', padding: '10px 8px', borderRight: '1.5px solid #000' }}>KODE REKENING</th>
                          <th style={{ width: '60%', padding: '10px 12px', borderRight: '1.5px solid #000' }}>URAIAN</th>
                          <th style={{ width: '18%', padding: '10px 8px' }}>JUMLAH</th>
                        </tr>
                        {/* Table Header Row 2: Column Numbers (1, 2, 3, 4) */}
                        <tr style={{ background: '#fef08a', textAlign: 'center', fontWeight: 800, fontSize: 11, borderBottom: '2px solid #000' }}>
                          <th style={{ padding: '4px', borderRight: '1.5px solid #000' }}>1</th>
                          <th style={{ padding: '4px', borderRight: '1.5px solid #000' }}>2</th>
                          <th style={{ padding: '4px', borderRight: '1.5px solid #000' }}>3</th>
                          <th style={{ padding: '4px' }}>4</th>
                        </tr>
                      </thead>
                      <tbody>

                        {/* ──────────────────────────────────────────────────────── */}
                        {/* 1. SECTION PENDAPATAN */}
                        {/* ──────────────────────────────────────────────────────── */}
                        {(rbaFilterSection === 'all' || rbaFilterSection === 'pendapatan') && (
                          <>
                            {/* Header Pendapatan */}
                            <tr style={{ background: '#bfdbfe', fontWeight: 900, borderBottom: '1px solid #000' }}>
                              <td style={{ borderRight: '1.5px solid #000', padding: '6px' }}></td>
                              <td style={{ borderRight: '1.5px solid #000', padding: '6px' }}></td>
                              <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px', fontSize: 12, fontWeight: 900 }}>PENDAPATAN</td>
                              <td style={{ padding: '6px' }}></td>
                            </tr>

                            {/* Pendapatan Groups */}
                            {activeData.pendapatan.map((grp, pIdx) => (
                              <React.Fragment key={grp.id}>
                                <tr style={{ borderBottom: '1px dotted #94a3b8' }}>
                                  <td style={{ borderRight: '1.5px solid #000', padding: '4px' }}></td>
                                  <td style={{ borderRight: '1.5px solid #000', padding: '4px' }}></td>
                                  <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px', fontWeight: 800, color: '#1e3a8a' }}>
                                    {grp.kategori}
                                  </td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 900 }}>
                                    {fmtRp(grp.subItems.reduce((s, it) => s + (Number(it.jumlah) || 0), 0))}
                                  </td>
                                </tr>

                                {/* Sub Items Pendapatan */}
                                {grp.subItems.map((item, sIdx) => (
                                  <tr key={item.id} style={{ borderBottom: '1px dotted #cbd5e1' }}>
                                    <td style={{ borderRight: '1.5px solid #000', padding: '4px' }}></td>
                                    <td style={{ borderRight: '1.5px solid #000', padding: '4px' }}></td>
                                    <td style={{ borderRight: '1.5px solid #000', padding: '4px 10px 4px 28px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{item.no} {item.uraian}</span>
                                        <span style={{ fontSize: 11, color: '#475569', fontStyle: 'italic', fontFamily: 'monospace' }}>
                                          {isEditing ? (
                                            <input
                                              value={item.rincian}
                                              onChange={e => updatePendapatanItem(pIdx, sIdx, 'rincian', e.target.value)}
                                              style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #93c5fd', borderRadius: 4, width: 220 }}
                                            />
                                          ) : item.rincian}
                                        </span>
                                      </div>
                                    </td>
                                    <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={item.jumlah}
                                          onChange={e => updatePendapatanItem(pIdx, sIdx, 'jumlah', Number(e.target.value) || 0)}
                                          style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #93c5fd', borderRadius: 4, width: '100%', textAlign: 'right', fontWeight: 700 }}
                                        />
                                      ) : fmtRp(item.jumlah)}
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}

                            {/* JUMLAH PENDAPATAN */}
                            <tr style={{ background: '#93c5fd', fontWeight: 900, borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                              <td style={{ borderRight: '1.5px solid #000', padding: '8px' }}></td>
                              <td style={{ borderRight: '1.5px solid #000', padding: '8px' }}></td>
                              <td style={{ borderRight: '1.5px solid #000', padding: '8px 10px', textAlign: 'center', fontSize: 12, fontWeight: 900 }}>
                                JUMLAH PENDAPATAN
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 12, fontWeight: 900 }}>
                                {fmtRp(totalPendapatan)}
                              </td>
                            </tr>
                          </>
                        )}

                        {/* ──────────────────────────────────────────────────────── */}
                        {/* 2. SECTION BELANJA */}
                        {/* ──────────────────────────────────────────────────────── */}
                        <tr style={{ background: '#fed7aa', fontWeight: 900, borderBottom: '1.5px solid #000' }}>
                          <td style={{ borderRight: '1.5px solid #000', padding: '6px' }}></td>
                          <td style={{ borderRight: '1.5px solid #000', padding: '6px' }}></td>
                          <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px', fontSize: 12, fontWeight: 900 }}>BELANJA</td>
                          <td style={{ padding: '6px' }}></td>
                        </tr>

                        {activeData.belanjaSections.map((sec, secIdx) => {
                          const showSection = rbaFilterSection === 'all' ||
                            (rbaFilterSection === 'operasi' && sec.id === 'bel-operasi') ||
                            (rbaFilterSection === 'modal' && sec.id === 'bel-modal');

                          if (!showSection) return null;

                          return (
                            <React.Fragment key={sec.id}>
                              {/* Section Header (5.1 BELANJA OPERASI / 5.2 BELANJA MODAL) */}
                              <tr style={{ background: '#ffedd5', fontWeight: 900, borderBottom: '1px solid #000' }}>
                                <td style={{ borderRight: '1.5px solid #000', padding: '6px' }}></td>
                                <td style={{ borderRight: '1.5px solid #000', padding: '6px 8px', fontFamily: 'monospace', fontWeight: 800 }}>{sec.kodeHeader}</td>
                                <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px', fontWeight: 900 }}>{sec.title}</td>
                                <td style={{ padding: '6px' }}></td>
                              </tr>

                              {/* Groups */}
                              {sec.groups.map((grp, grpIdx) => (
                                <React.Fragment key={grp.id}>
                                  {/* Group Header (e.g. 5.1.01.99.099.09999 BELANJA PEGAWAI BLUD) */}
                                  <tr style={{ borderBottom: '1px solid #000' }}>
                                    <td style={{ borderRight: '1.5px solid #000', padding: '4px' }}></td>
                                    <td style={{ borderRight: '1.5px solid #000', padding: '4px 8px', fontFamily: 'monospace', fontWeight: 800, fontSize: 11 }}>{grp.kodeRekening}</td>
                                    <td style={{ borderRight: '1.5px solid #000', padding: '4px 10px', fontWeight: 800 }}>{grp.title}</td>
                                    <td style={{ padding: '4px' }}></td>
                                  </tr>

                                  {/* Sub Groups */}
                                  {grp.subGroups.map((sg, sgIdx) => (
                                    <React.Fragment key={sg.id}>
                                      {/* Sub Group Header (e.g. Belanja Barang dan Jasa APBD / BLUD / BOK) */}
                                      <tr style={{ background: sg.bgHeader || '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                                        <td style={{ borderRight: '1.5px solid #000', padding: '4px' }}></td>
                                        <td style={{ borderRight: '1.5px solid #000', padding: '4px' }}></td>
                                        <td style={{ borderRight: '1.5px solid #000', padding: '5px 10px', fontWeight: 800, color: '#047857' }}>
                                          {sg.title}
                                        </td>
                                        <td style={{ padding: '4px' }}></td>
                                      </tr>

                                      {/* Accounts inside SubGroup */}
                                      {sg.accounts.map((acc, accIdx) => (
                                        <React.Fragment key={acc.id}>
                                          {/* Account Title Row */}
                                          <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fcfcfc' }}>
                                            <td style={{ borderRight: '1.5px solid #000', padding: '4px', textAlign: 'center' }}></td>
                                            <td style={{ borderRight: '1.5px solid #000', padding: '4px 8px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1e40af' }}>
                                              {acc.kodeRekening}
                                            </td>
                                            <td style={{ borderRight: '1.5px solid #000', padding: '4px 10px', fontWeight: 700 }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{acc.no} {acc.uraian}</span>
                                                {isEditing && (
                                                  <button
                                                    onClick={() => addBelanjaItem(secIdx, grpIdx, sgIdx, accIdx)}
                                                    style={{ padding: '2px 8px', borderRadius: 4, background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                                                  >
                                                    + Tambah Rincian
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                            <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 800 }}>
                                              {fmtRp(calcAccountTotal(acc))}
                                            </td>
                                          </tr>

                                          {/* Items inside Account */}
                                          {acc.items.map((item, itIdx) => (
                                            <tr key={item.id} style={{ borderBottom: '1px dotted #cbd5e1' }}>
                                              <td style={{ borderRight: '1.5px solid #000', padding: '3px' }}></td>
                                              <td style={{ borderRight: '1.5px solid #000', padding: '3px 8px', fontFamily: 'monospace', fontSize: 10, color: '#64748b' }}>
                                                {item.kode}
                                              </td>
                                              <td style={{ borderRight: '1.5px solid #000', padding: '3px 10px 3px 24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                                  <span style={{ flex: 1 }}>
                                                    {isEditing ? (
                                                      <input
                                                        value={item.uraian}
                                                        onChange={e => updateBelanjaItem(secIdx, grpIdx, sgIdx, accIdx, itIdx, 'uraian', e.target.value)}
                                                        style={{ width: '90%', fontSize: 11, padding: '2px 4px', border: '1px solid #fde68a', borderRadius: 4 }}
                                                      />
                                                    ) : `- ${item.uraian}`}
                                                  </span>
                                                  <span style={{ fontSize: 10.5, color: '#475569', fontStyle: 'italic', fontFamily: 'monospace', flexShrink: 0 }}>
                                                    {isEditing ? (
                                                      <input
                                                        value={item.rincianText}
                                                        onChange={e => updateBelanjaItem(secIdx, grpIdx, sgIdx, accIdx, itIdx, 'rincianText', e.target.value)}
                                                        style={{ width: 180, fontSize: 10.5, padding: '2px 4px', border: '1px solid #fde68a', borderRadius: 4 }}
                                                      />
                                                    ) : item.rincianText}
                                                  </span>
                                                  {isEditing && (
                                                    <button
                                                      onClick={() => removeBelanjaItem(secIdx, grpIdx, sgIdx, accIdx, itIdx)}
                                                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, width: 20, height: 20, cursor: 'pointer', fontSize: 11, fontWeight: 800 }}
                                                      title="Hapus baris"
                                                    >
                                                      ✕
                                                    </button>
                                                  )}
                                                </div>
                                              </td>
                                              <td style={{ padding: '3px 10px', textAlign: 'right', fontSize: 11 }}>
                                                {isEditing ? (
                                                  <input
                                                    type="number"
                                                    value={item.jumlah}
                                                    onChange={e => updateBelanjaItem(secIdx, grpIdx, sgIdx, accIdx, itIdx, 'jumlah', e.target.value)}
                                                    style={{ width: '100%', fontSize: 11, padding: '2px 4px', border: '1px solid #fde68a', borderRadius: 4, textAlign: 'right', fontWeight: 700 }}
                                                  />
                                                ) : fmtRp(item.jumlah)}
                                              </td>
                                            </tr>
                                          ))}
                                        </React.Fragment>
                                      ))}

                                      {/* SubGroup Total Row */}
                                      {sg.subtotalTitle && (
                                        <tr style={{ background: '#fef08a', fontWeight: 900, borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>
                                          <td style={{ borderRight: '1.5px solid #000', padding: '6px' }}></td>
                                          <td style={{ borderRight: '1.5px solid #000', padding: '6px' }}></td>
                                          <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px', textAlign: 'center', fontSize: 11.5, fontWeight: 900 }}>
                                            {sg.subtotalTitle}
                                          </td>
                                          <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 11.5, fontWeight: 900 }}>
                                            {fmtRp(calcSubGroupTotal(sg))}
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}

                                  {/* Total Belanja Barjas Gabungan BLUD Row */}
                                  {grp.totalBarjasTitle && (
                                    <tr style={{ background: '#fed7aa', fontWeight: 900, borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                                      <td style={{ borderRight: '1.5px solid #000', padding: '7px' }}></td>
                                      <td style={{ borderRight: '1.5px solid #000', padding: '7px' }}></td>
                                      <td style={{ borderRight: '1.5px solid #000', padding: '7px 10px', textAlign: 'center', fontSize: 12, fontWeight: 900 }}>
                                        {grp.totalBarjasTitle}
                                      </td>
                                      <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, fontWeight: 900 }}>
                                        {fmtRp(calcGroupTotal(grp))}
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </React.Fragment>
                          );
                        })}

                        {/* Grand Total JUMLAH BELANJA */}
                        <tr style={{ background: '#fed7aa', fontWeight: 900, borderTop: '2.5px solid #000', borderBottom: '2.5px solid #000' }}>
                          <td style={{ borderRight: '1.5px solid #000', padding: '10px' }}></td>
                          <td style={{ borderRight: '1.5px solid #000', padding: '10px' }}></td>
                          <td style={{ borderRight: '1.5px solid #000', padding: '10px 12px', textAlign: 'center', fontSize: 13, fontWeight: 900, letterSpacing: '0.5px' }}>
                            JUMLAH BELANJA
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 900, color: '#7c2d12' }}>
                            {fmtRp(totalBelanja)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Document Signature Area (drg. Weri L.P. Saroengoe) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, paddingRight: 40 }}>
                    <div style={{ textAlign: 'center', minWidth: 260 }}>
                      <div style={{ fontSize: 12, color: '#334155' }}>{activeData.header.kotaTanggalTtd}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{activeData.header.jabatanPimpinan}</div>
                      <div style={{ height: 64 }}></div>
                      <div style={{ fontSize: 13, fontWeight: 900, textDecoration: 'underline', color: '#0f172a' }}>
                        {activeData.header.pimpinan}
                      </div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                        NIP. {activeData.header.nipPimpinan}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* SUB-TAB: RIWAYAT REVISI */}
            {/* ================================================================ */}
            {rbaSubTab === 'riwayat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Riwayat Dokumen &amp; Revisi RBA</div>

                {/* RBA Pokok Entry */}
                <div className="card" style={{ padding: 16, background: '#f8fafc', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="ic s" style={{ color: '#fff', fontSize: 20 }}>flag</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800 }}>RBA Pokok — Murni Awal Tahun Anggaran 2026</div>
                      <div style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 2 }}>
                        DPA: {activeData.header.dpaNomor} &nbsp;|&nbsp; Terbit: {activeData.header.tanggalDpa} &nbsp;|&nbsp; Pengesahan: {activeData.header.diterbitkanOleh}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: 13, color: '#1e3a8a' }}>{fmtRp(2138164671)}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--t3)' }}>Total Pagu RBA</div>
                    </div>
                  </div>
                </div>

                {/* Revisions */}
                {rbaRiwayat.map((rev) => (
                  <div key={rev.id} className="card" style={{ padding: 16, background: 'var(--srf)', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="ic s" style={{ color: '#fff', fontSize: 20 }}>verified</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 800 }}>Revisi ke-{rev.revisiKe}</span>
                          <span style={{ fontSize: 9.5, padding: '2px 8px', borderRadius: 10, background: '#d1fae5', color: '#065f46', fontWeight: 800 }}>BERLAKU</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>{rev.deltaPagu}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--t2)', marginBottom: 6 }}>{rev.alasan}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 10.5, color: 'var(--t3)' }}>
                          <span>Berlaku: <strong>{rev.tglDpaBaru}</strong></span>
                          <span>DPA Baru: <strong>{rev.noDpaBaru}</strong></span>
                          <span>Acc BPKAD: <strong>{rev.tglAccBpkad}</strong></span>
                        </div>
                        {rev.catatanBpkad && (
                          <div style={{ marginTop: 8, fontSize: 10.5, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: 6, color: '#166534' }}>
                            💬 {rev.catatanBpkad}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        );
      })()}

      {/* ================================================================ */}
      {/* PRINT PREVIEW MODAL — DOKUMEN CETAK RESMI RBA */}
      {/* ================================================================ */}
      {isRbaPrintPreviewOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 30, width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 70px rgba(0,0,0,0.4)', color: '#000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ic s">print</span> Pratinjau Dokumen Cetak Resmi RBA BLUD TA 2026
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 6, border: 'none', background: '#1e3a8a', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  <span className="ic s">print</span> Cetak Sekarang (Print / PDF)
                </button>
                <button
                  onClick={() => setIsRbaPrintPreviewOpen(false)}
                  style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f1f5f9', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Sheet View */}
            <div style={{ padding: 20, border: '1px solid #cbd5e1', background: '#fff' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>PEMERINTAH KOTA MAKASSAR</div>
                <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase' }}>PUSKESMAS TAMALANREA</div>
                <div style={{ fontSize: 12, fontWeight: 800, marginTop: 4 }}>RENCANA BISNIS DAN ANGGARAN</div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>RINCIAN PENDAPATAN DAN BELANJA TAHUN ANGGARAN 2026</div>
              </div>

              <div style={{ fontSize: 11, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Nomor DPA: <strong>{rbaOfficialData.header.dpaNomor}</strong></span>
                <span>Tanggal Terbit: <strong>{rbaOfficialData.header.tanggalDpa}</strong></span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, border: '1.5px solid #000' }}>
                <thead>
                  <tr style={{ background: '#fef08a', textAlign: 'center', fontWeight: 900, borderBottom: '1px solid #000' }}>
                    <th style={{ width: '5%', padding: '6px', borderRight: '1px solid #000' }}>No</th>
                    <th style={{ width: '22%', padding: '6px', borderRight: '1px solid #000' }}>KODE REKENING</th>
                    <th style={{ width: '55%', padding: '6px', borderRight: '1px solid #000' }}>URAIAN</th>
                    <th style={{ width: '18%', padding: '6px' }}>JUMLAH (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#dbeafe', fontWeight: 900, borderBottom: '1px solid #000' }}>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #000' }}>PENDAPATAN</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtRp(2138164671)}</td>
                  </tr>
                  <tr style={{ background: '#fed7aa', fontWeight: 900, borderBottom: '1px solid #000' }}>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ borderRight: '1px solid #000', padding: '5px 8px', fontFamily: 'monospace' }}>5.1</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #000' }}>BELANJA OPERASI</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtRp(2013586270)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px dotted #cbd5e1' }}>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ borderRight: '1px solid #000', padding: '4px 8px', fontFamily: 'monospace', fontSize: 10 }}>5.1.01.99.099.09999</td>
                    <td style={{ padding: '4px 8px 4px 20px', borderRight: '1px solid #000' }}>- Belanja Pegawai BLUD</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtRp(5205000)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px dotted #cbd5e1' }}>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ borderRight: '1px solid #000', padding: '4px 8px', fontFamily: 'monospace', fontSize: 10 }}>5.1.02.99.099.09999</td>
                    <td style={{ padding: '4px 8px 4px 20px', borderRight: '1px solid #000' }}>- Belanja Barang dan Jasa BLUD / APBD / BOK</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtRp(2008381270)}</td>
                  </tr>
                  <tr style={{ background: '#fed7aa', fontWeight: 900, borderBottom: '1px solid #000' }}>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ borderRight: '1px solid #000', padding: '5px 8px', fontFamily: 'monospace' }}>5.2</td>
                    <td style={{ padding: '5px 8px', borderRight: '1px solid #000' }}>BELANJA MODAL</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtRp(124578401)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px dotted #cbd5e1' }}>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ borderRight: '1px solid #000', padding: '4px 8px', fontFamily: 'monospace', fontSize: 10 }}>5.2.02.10.002.00003</td>
                    <td style={{ padding: '4px 8px 4px 20px', borderRight: '1px solid #000' }}>- Belanja Modal Peralatan dan Mesin BLUD</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtRp(124578401)}</td>
                  </tr>
                  <tr style={{ background: '#fed7aa', fontWeight: 900, borderTop: '2px solid #000' }}>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ borderRight: '1px solid #000' }}></td>
                    <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #000', fontWeight: 900 }}>JUMLAH BELANJA</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 900 }}>{fmtRp(2138164671)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingRight: 30 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11 }}>Makassar, 02 Januari 2026</div>
                  <div style={{ fontSize: 11, fontWeight: 800, marginTop: 2 }}>Pemimpin Badan Layanan Umum Daerah</div>
                  <div style={{ height: 50 }}></div>
                  <div style={{ fontSize: 11.5, fontWeight: 900, textDecoration: 'underline' }}>drg. Weri L.P. Saroengoe</div>
                  <div style={{ fontSize: 10, color: '#555' }}>NIP. 19690517 200604 2 009</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* WARNING MODAL — Konfirmasi Revisi RBA */}
      {/* ================================================================ */}
      {rbaUsulModal?.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--srf)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="ic l" style={{ color: '#d97706', fontSize: 26 }}>edit_note</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Konfirmasi Revisi RBA?</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
                  Anda akan membuka tabel RBA terakhir dalam <strong>Mode Edit</strong>. Seluruh daftar belanja, volume, harga satuan, dan item dapat diubah satu per satu atau sekaligus.
                </div>
              </div>
            </div>

            <div style={{ background: '#fef3c7', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#92400e', marginBottom: 20, display: 'flex', gap: 8 }}>
              <span className="ic s" style={{ color: '#d97706', flexShrink: 0 }}>warning</span>
              Pastikan perubahan anggaran ini telah sesuai dengan regulasi penyesuaian belanja BLUD dan persetujuan pengelola keuangan.
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 5 }}>Alasan singkat revisi (opsional)</label>
              <input
                placeholder="cth. Penyesuaian belanja obat dan kenaikan volume operasional Q2..."
                value={rbaUsulModal.alasan || ''}
                onChange={e => setRbaUsulModal(p => ({ ...p, alasan: e.target.value }))}
                style={{ width: '100%', borderRadius: 8, border: '1px solid var(--line)', padding: '8px 10px', fontSize: 12, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setRbaUsulModal({ open: false, alasan: '' })}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--t2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setRbaRevisiAlasan(rbaUsulModal.alasan || '');
                  setRbaEditOfficialData(JSON.parse(JSON.stringify(rbaOfficialData)));
                  setRbaSubTab('edit');
                  setRbaUsulModal({ open: false, alasan: '' });
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8, border: 'none', background: '#d97706', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                <span className="ic s">edit</span> Ya, Mulai Revisi RBA
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MAIN TAB 4: EKSEKUSI PENGADAAN & DOCUMENT ENGINE (LAMPIRAN 3) */}
      {/* =================================================================== */}
      {mainTab === 'pengadaan' && (
        <div>
          {/* Sub Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Eksekusi Belanja &amp; Penerbitan Berkas (Lampiran 3)</h2>
              <p style={{ fontSize: 12, color: 'var(--t3)', margin: 0 }}>
                Pengadaan Sekuensial: Nego Final, DP/SPK, Pemeriksaan BAPP (Mobile), BASTHP, BA Pembayaran, hingga Kuitansi Resmi BLUD.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" style={{ background: '#10b981', color: '#fff' }} onClick={() => setIsExcelModalOpen(true)}>
                <span className="ic s">table_chart</span> Seamless Import Excel
              </button>
              {view !== 'new' && (
                <button
                  className="btn pri"
                  onClick={() => {
                    setView('new');
                    setWizardStep(1);
                  }}
                >
                  <span className="ic s">add_circle</span> Buat Pengadaan Baru
                </button>
              )}
            </div>
          </div>

          {/* VIEW: LIST PAKET PENGADAAN */}
          {view === 'list' && (
            <div>
              {/* Filters */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>Filter Tahap:</span>
                {['all', '1', '2', '3', '4', '5', '6', '7'].map((s) => {
                  const si = s !== 'all' ? stageOf(+s) : null;
                  const active2 = filterStage === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setFilterStage(s)}
                      style={{
                        padding: '4px 11px',
                        borderRadius: 20,
                        border: '1.5px solid',
                        cursor: 'pointer',
                        transition: '.15s',
                        fontSize: 11,
                        fontWeight: 600,
                        borderColor: active2 ? si?.col || 'var(--blue)' : 'var(--line)',
                        background: active2 ? si?.bg || '#eff6ff' : 'transparent',
                        color: active2 ? si?.col || 'var(--blue)' : 'var(--t2)',
                      }}
                    >
                      {s === 'all' ? 'Semua Tahap' : `Tahap ${s}`}
                    </button>
                  );
                })}
              </div>

              {/* Package List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredPakets.map((p) => {
                  const si = stageOf(p.stage);
                  const rab = calcRAB(p.items);
                  const deal = calcDeal(p.items);
                  const comp = calcComp(p.berkasStatus);
                  return (
                    <div
                      key={p.id}
                      className="card"
                      onClick={() => openDetail(p.id)}
                      style={{
                        padding: 16,
                        cursor: 'pointer',
                        borderLeft: `5px solid ${si.col}`,
                        background: 'var(--srf)',
                        transition: '.15s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: si.col, background: si.bg, padding: '2px 8px', borderRadius: 12 }}>
                              Tahap {p.stage} — {si.label}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>{p.id}</span>
                            <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>{p.kodeRekening}</span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>{p.namaPaket}</h4>
                          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>
                            Penyedia: <strong>{p.penyedia}</strong> | No. DP: <strong>{p.noDP || 'Draf'}</strong> | Tgl Pengajuan: {p.tglPengajuan}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 20 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>NILAI DEAL/KONTRAK</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>{fmtRp(deal)}</div>
                            <div style={{ fontSize: 10, color: 'var(--t3)' }}>RAB: {fmtRp(rab)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>BERKAS ADMINISTRASI</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: comp.pct === 100 ? '#10b981' : '#f59e0b' }}>{comp.pct}%</div>
                            <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                              {comp.done}/{comp.total} Berkas
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: BUAT PENGADAAN BARU (WIZARD 3 TAHAP) */}
          {view === 'new' && (
            <div className="card" style={{ padding: 24, background: 'var(--srf)', maxWidth: 880, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Pendaftaran Pengadaan Baru (BLUD)</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--t3)' }}>
                    Pilih atau buat kode rekening baru secara manual — riwayat akan tersimpan otomatis.
                  </p>
                </div>
                <button onClick={backToList} className="btn ghost">✕ Batal</button>
              </div>

              {/* Wizard Steps */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { step: 1, title: '1. Kode Rekening & Vendor' },
                  { step: 2, title: '2. Item & Nego Harga' },
                  { step: 3, title: '3. Konfirmasi & DP' },
                ].map((s) => (
                  <div
                    key={s.step}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      textAlign: 'center',
                      background: wizardStep === s.step ? 'var(--blue-s)' : 'var(--bg)',
                      border: `1.5px solid ${wizardStep === s.step ? 'var(--blue)' : 'var(--line)'}`,
                      color: wizardStep === s.step ? 'var(--blue)' : 'var(--t3)',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {s.title}
                  </div>
                ))}
              </div>

              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={lbl}>Nama Paket Pekerjaan / Pengadaan *</label>
                    <input
                      placeholder="Contoh: Belanja Alat Tulis Kantor (ATK) Bulan April 2026"
                      value={newForm.namaPaket}
                      onChange={(e) => setNewForm({ ...newForm, namaPaket: e.target.value })}
                      style={inp}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={lbl}>Kode Rekening &amp; Uraian (Pilih dari Riwayat / RBA) *</label>
                      <button
                        type="button"
                        onClick={() => setIsAddAccountModalOpen(true)}
                        style={{ fontSize: 11, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ➕ Buat Kode Rekening Manual Baru
                      </button>
                    </div>
                    <select
                      value={newForm.kodeRekening}
                      onChange={(e) => {
                        const sel = savedCustomAccounts.find((a) => a.kode === e.target.value);
                        setNewForm({
                          ...newForm,
                          kodeRekening: e.target.value,
                          subKegiatan: sel?.subKegiatan || newForm.subKegiatan,
                        });
                      }}
                      style={inp}
                    >
                      {savedCustomAccounts.map((acc) => (
                        <option key={acc.kode} value={acc.kode}>
                          {acc.kode} — {acc.uraian}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={lbl}>Penyedia / Vendor Rekanan *</label>
                      <select
                        value={newForm.penyedia}
                        onChange={(e) => setNewForm({ ...newForm, penyedia: e.target.value })}
                        style={inp}
                      >
                        {masterData.vendors.map((v) => (
                          <option key={v.id} value={v.nama}>
                            {v.nama} (Dir: {v.direktur})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Kategori Barang / Jasa</label>
                      <select
                        value={newForm.kategori}
                        onChange={(e) => setNewForm({ ...newForm, kategori: e.target.value })}
                        style={inp}
                      >
                        {KATEGORI_LIST.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={lbl}>Catatan / Keterangan Pengadaan</label>
                    <textarea
                      rows={2}
                      placeholder="Catatan tujuan belanja, lokasi instalasi, atau peruntukan unit..."
                      value={newForm.catatan}
                      onChange={(e) => setNewForm({ ...newForm, catatan: e.target.value })}
                      style={inp}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button className="btn pri" onClick={() => setWizardStep(2)}>
                      Lanjut ke Input Item &amp; Nego →
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>Rincian Item &amp; Negosiasi Harga</h4>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" style={{ fontSize: 11 }} onClick={() => setIsExcelModalOpen(true)}>
                        <span className="ic s">table_chart</span> Import Excel
                      </button>
                      <button className="btn pri" style={{ fontSize: 11 }} onClick={addItem}>
                        <span className="ic s">add</span> Tambah Baris
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                          <th style={{ padding: 6 }}>No</th>
                          <th style={{ padding: 6 }}>Uraian Item</th>
                          <th style={{ padding: 6 }}>Tipe</th>
                          <th style={{ padding: 6 }}>Qty</th>
                          <th style={{ padding: 6 }}>Satuan</th>
                          <th style={{ padding: 6, textAlign: 'right' }}>Harga RAB</th>
                          <th style={{ padding: 6, textAlign: 'right' }}>Harga Deal</th>
                          <th style={{ padding: 6, textAlign: 'center' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newForm.items.map((it, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: 6 }}>{idx + 1}</td>
                            <td style={{ padding: 6 }}>
                              <input
                                placeholder="Nama barang / jasa"
                                value={it.uraian}
                                onChange={(e) => updItem(idx, 'uraian', e.target.value)}
                                style={{ ...inpSm, width: 200 }}
                              />
                            </td>
                            <td style={{ padding: 6 }}>
                              <select
                                value={it.kategori || 'Barang'}
                                onChange={(e) => updItem(idx, 'kategori', e.target.value)}
                                style={inpSm}
                              >
                                <option value="Barang">Barang</option>
                                <option value="Jasa">Jasa</option>
                              </select>
                            </td>
                            <td style={{ padding: 6 }}>
                              <input
                                type="number"
                                min="1"
                                value={it.qty}
                                onChange={(e) => updItem(idx, 'qty', parseInt(e.target.value) || 1)}
                                style={{ ...inpSm, width: 60, textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ padding: 6 }}>
                              <select
                                value={it.satuan || 'Pack'}
                                onChange={(e) => updItem(idx, 'satuan', e.target.value)}
                                style={inpSm}
                              >
                                {SATUAN_LIST.map((sat) => (
                                  <option key={sat} value={sat}>{sat}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: 6, textAlign: 'right' }}>
                              <input
                                type="number"
                                value={it.hargaRAB}
                                onChange={(e) => updItem(idx, 'hargaRAB', parseInt(e.target.value) || 0)}
                                style={{ ...inpSm, width: 100, textAlign: 'right' }}
                              />
                            </td>
                            <td style={{ padding: 6, textAlign: 'right' }}>
                              <input
                                type="number"
                                value={it.deal}
                                onChange={(e) => updItem(idx, 'deal', parseInt(e.target.value) || 0)}
                                style={{ ...inpSm, width: 100, textAlign: 'right', fontWeight: 700, color: '#10b981' }}
                              />
                            </td>
                            <td style={{ padding: 6, textAlign: 'center' }}>
                              <button
                                onClick={() => removeItem(idx)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn ghost" onClick={() => setWizardStep(1)}>
                      ← Kembali
                    </button>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ textAlign: 'right', fontSize: 12 }}>
                        Total Deal: <strong style={{ color: '#10b981', fontSize: 14 }}>{fmtRp(calcDeal(newForm.items))}</strong>
                      </div>
                      <button className="btn pri" onClick={() => setWizardStep(3)}>
                        Lanjut ke Review →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: 14, fontWeight: 800 }}>Ringkasan Eksekusi Pengadaan</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                      <div><strong>Nama Paket:</strong> {newForm.namaPaket}</div>
                      <div><strong>Penyedia:</strong> {newForm.penyedia}</div>
                      <div><strong>Kode Rekening:</strong> {newForm.kodeRekening}</div>
                      <div><strong>Total Nilai Deal:</strong> <span style={{ color: '#10b981', fontWeight: 800 }}>{fmtRp(calcDeal(newForm.items))}</span></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <button className="btn ghost" onClick={() => setWizardStep(2)}>
                      ← Kembali ke Item
                    </button>
                    <button className="btn" style={{ background: '#10b981', color: '#fff', fontWeight: 800 }} onClick={submitNew}>
                      ✓ Terbitkan Pengadaan &amp; Masuk Alur
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: DETAIL PAKET & DOCUMENT GENERATOR */}
          {view === 'detail' && currentPaket && (
            <div>
              {/* Top Back & Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <button onClick={backToList} className="btn ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="ic s">arrow_back</span> Kembali ke Daftar
                </button>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {/* Mobile View Toggle Button */}
                  <button
                    className="btn"
                    onClick={() => {
                      setIsMobileBappMode(!isMobileBappMode);
                      setDetailTab('bappInspect');
                    }}
                    style={{
                      background: isMobileBappMode ? '#4338ca' : '#f5f3ff',
                      color: isMobileBappMode ? '#fff' : '#6366f1',
                      border: '1px solid #c7d2fe',
                      fontWeight: 700,
                    }}
                  >
                    <span className="ic s">smartphone</span> {isMobileBappMode ? 'Tutup Mode Mobile' : '📱 Mode Mobile Checklist Lapangan'}
                  </button>

                  {currentPaket.stage < 7 && (
                    <button className="btn" style={{ background: '#10b981', color: '#fff', fontWeight: 800 }} onClick={() => advanceStage(currentPaket.id)}>
                      <span className="ic s">arrow_forward</span> Lanjut ke Tahap {currentPaket.stage + 1}: {stageOf(currentPaket.stage + 1).label}
                    </button>
                  )}
                  <button className="btn pri" onClick={() => setDetailTab('cetakDoc')}>
                    <span className="ic s">print</span> Cetak Berkas Resmi BLUD
                  </button>
                </div>
              </div>

              {/* Package Meta Box */}
              <div className="card" style={{ padding: 18, background: 'var(--srf)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: stageOf(currentPaket.stage).col, background: stageOf(currentPaket.stage).bg, padding: '2px 8px', borderRadius: 10 }}>
                      TAHAP {currentPaket.stage}: {stageOf(currentPaket.stage).label}
                    </span>
                    <h3 style={{ margin: '6px 0 2px 0', fontSize: 18, fontWeight: 800 }}>{currentPaket.namaPaket}</h3>
                    <p style={{ fontSize: 12, color: 'var(--t3)', margin: 0 }}>
                      Kode Rekening: <code>{currentPaket.kodeRekening}</code> | Penyedia: <strong>{currentPaket.penyedia}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>TOTAL DEAL</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>{fmtRp(calcDeal(currentPaket.items))}</div>
                  </div>
                </div>

                {/* 7-Stages Sequential Stepper Progress Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 6, marginTop: 16 }}>
                  {STAGES.map((st) => {
                    const isDone = currentPaket.stage >= st.n;
                    const isCurrent = currentPaket.stage === st.n;
                    return (
                      <div
                        key={st.n}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 8,
                          background: isCurrent ? st.bg : isDone ? '#f0fdf4' : 'var(--bg)',
                          border: `1.5px solid ${isCurrent ? st.col : isDone ? '#86efac' : 'var(--line)'}`,
                          fontSize: 10,
                          fontWeight: 700,
                          color: isCurrent ? st.col : isDone ? '#166534' : 'var(--t3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span className="ic s" style={{ fontSize: 14 }}>
                          {isDone ? 'check_circle' : st.icon}
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail Sub Tabs */}
              <div style={{ display: 'flex', gap: 6, borderBottom: '2px solid var(--line)', marginBottom: 16, overflowX: 'auto' }}>
                {[
                  { id: 'ringkasan', label: '1. Rincian Item', icon: 'list_alt' },
                  { id: 'nego', label: '2. Nego & Penawaran Excel', icon: 'table_chart' },
                  { id: 'bappInspect', label: '3. Pemeriksaan BAPP & Mobile View', icon: 'checklist_rtl' },
                  { id: 'pajak', label: '4. Pajak (PPN/PPh) & Faktur', icon: 'receipt_long' },
                  { id: 'lampiran', label: '5. Lampiran Tambahan (KTP, NPWP, Rekening)', icon: 'attachment' },
                  { id: 'berkas', label: '6. Checklist 15 Berkas SPJ', icon: 'checklist' },
                  { id: 'cetakDoc', label: '7. Pratinjau Dokumen Cetak SPJ', icon: 'print' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id)}
                    style={{
                      padding: '10px 14px',
                      border: 'none',
                      borderBottom: detailTab === t.id ? '3px solid var(--blue)' : '3px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: detailTab === t.id ? 'var(--blue)' : 'var(--t2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span className="ic s">{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              {/* SUB TAB 1: RINGKASAN ITEMS */}
              {detailTab === 'ringkasan' && (
                <div className="card" style={{ padding: 20, background: 'var(--srf)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Daftar Item Pesanan (Auto Calculated)</h4>
                    <button
                      className="btn"
                      style={{ fontSize: 11 }}
                      onClick={() => {
                        setExcelTargetPaketId(currentPaket.id);
                        setIsExcelModalOpen(true);
                      }}
                    >
                      <span className="ic s">add</span> Import Item dari Excel
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>No</th>
                        <th style={{ padding: '8px' }}>Uraian Barang / Jasa</th>
                        <th style={{ padding: '8px' }}>Tipe</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Harga Satuan Nego</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Total Nego Deal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPaket.items.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '8px' }}>{idx + 1}</td>
                          <td style={{ padding: '8px', fontWeight: 600 }}>{it.uraian}</td>
                          <td style={{ padding: '8px' }}>
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: 10,
                                fontSize: 10,
                                fontWeight: 700,
                                background: it.kategori === 'Jasa' ? '#f5f3ff' : '#eff6ff',
                                color: it.kategori === 'Jasa' ? '#8b5cf6' : '#3b82f6',
                              }}
                            >
                              {it.kategori || 'Barang'}
                            </span>
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {it.qty} {it.satuan}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{fmtRp(it.deal)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{fmtRp(it.deal * it.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUB TAB 2: NEGO & PENAWARAN 3 VENDOR */}
              {detailTab === 'nego' && (
                <div className="card" style={{ padding: 20, background: 'var(--srf)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Tabel Perbandingan Penawaran &amp; Negosiasi Harga (Excel Reference)</h4>
                    <button className="btn pri" style={{ fontSize: 11 }} onClick={() => { setDetailTab('cetakDoc'); setDocPrintType('nego'); }}>
                      <span className="ic s">print</span> Cetak Lembar Negosiasi Harga
                    </button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>No</th>
                        <th style={{ padding: '8px' }}>Jenis Barang / Uraian</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Nego 1 (Pembeli)</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Nego 1 (Penyedia)</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Nego 2 (Pembeli)</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Nego 2 (Penyedia)</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Harga Deal Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPaket.items.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '8px' }}>{idx + 1}</td>
                          <td style={{ padding: '8px', fontWeight: 600 }}>{it.uraian}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: 'var(--t2)' }}>{fmtRp(it.ng1B || it.deal * 0.95)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#3b82f6' }}>{fmtRp(it.ng1P || it.deal)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: 'var(--t2)' }}>{fmtRp(it.ng2B || it.deal)}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: 'var(--t3)' }}>{it.ng2P ? fmtRp(it.ng2P) : '-'}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{fmtRp(it.deal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUB TAB 3: BAPP INSPECT & MOBILE VIEW CHECKLIST */}
              {detailTab === 'bappInspect' && (
                <div>
                  {isMobileBappMode ? (
                    /* 📱 MOBILE VIEW CHECKLIST SIMULATOR */
                    <div className="mobile-inspect-shell">
                      <div className="mobile-inspect-screen">
                        {/* Mobile App Bar */}
                        <div style={{ background: '#1e3a8a', color: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase' }}>Pemeriksaan Lapangan BLUD</div>
                            <div style={{ fontSize: 14, fontWeight: 900 }}>BAPP Checklist Fisik</div>
                          </div>
                          <button
                            onClick={() => setIsMobileBappMode(false)}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 20, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                          >
                            Tutup
                          </button>
                        </div>

                        {/* Inspection Summary Bar */}
                        <div style={{ background: '#eff6ff', padding: '10px 14px', borderBottom: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 700 }}>
                            {currentPaket.items.filter((i) => i.realisasiCheck === 'valid').length} / {currentPaket.items.length} Item Sesuai (√)
                          </div>
                          <button
                            onClick={() => setAllBappValid(currentPaket.id)}
                            style={{ background: '#10b981', border: 'none', color: '#fff', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
                          >
                            ✓ Centang Semua Sesuai
                          </button>
                        </div>

                        {/* Mobile Inspection Scroll Area */}
                        <div className="mobile-inspect-body">
                          {currentPaket.items.map((it, idx) => {
                            const isValid = it.realisasiCheck !== 'invalid';
                            return (
                              <div key={idx} className={`mobile-item-card ${isValid ? 'valid' : 'invalid'}`}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{idx + 1}. {it.uraian}</div>
                                    <div style={{ fontSize: 10, color: '#64748b' }}>
                                      Pesanan: <strong>{it.qty} {it.satuan}</strong> @ {fmtRp(it.deal)}
                                    </div>
                                  </div>
                                  {/* Quick Toggle Check / Reject */}
                                  <button
                                    onClick={() => updateBappItem(currentPaket.id, idx, 'realisasiCheck', isValid ? 'invalid' : 'valid')}
                                    style={{
                                      background: isValid ? '#10b981' : '#ef4444',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: 20,
                                      padding: '4px 10px',
                                      fontSize: 11,
                                      fontWeight: 900,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4,
                                    }}
                                  >
                                    <span className="ic s" style={{ fontSize: 14 }}>{isValid ? 'check' : 'close'}</span>
                                    {isValid ? '√ BAIK' : '✕ TOLAK'}
                                  </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 6, marginTop: 8 }}>
                                  <div>
                                    <label style={{ fontSize: 9.5, color: '#64748b', display: 'block', marginBottom: 2 }}>Jml Tiba:</label>
                                    <input
                                      type="number"
                                      value={it.realisasiQty !== undefined ? it.realisasiQty : it.qty}
                                      onChange={(e) => updateBappItem(currentPaket.id, idx, 'realisasiQty', parseInt(e.target.value) || 0)}
                                      style={{ ...inpSm, fontSize: 11, padding: '4px 6px', textAlign: 'center' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: 9.5, color: '#64748b', display: 'block', marginBottom: 2 }}>Catatan Pemeriksa:</label>
                                    <input
                                      placeholder="Kondisi barang / kemasan..."
                                      value={it.catatanPemeriksa || ''}
                                      onChange={(e) => updateBappItem(currentPaket.id, idx, 'catatanPemeriksa', e.target.value)}
                                      style={{ ...inpSm, fontSize: 10.5, padding: '4px 6px' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Mobile Bottom Finish Bar */}
                        <div style={{ padding: 12, background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>
                            Realisasi: {fmtRp(calcDeal(currentPaket.items))}
                          </div>
                          <button
                            onClick={() => {
                              setIsMobileBappMode(false);
                              setDetailTab('cetakDoc');
                              setDocPrintType('bapp');
                            }}
                            style={{ background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                          >
                            Simpan &amp; Lihat BAPP →
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* DESKTOP TABLE VIEW FOR BAPP */
                    <div className="card" style={{ padding: 20, background: 'var(--srf)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Pemeriksaan Fisik Barang (BAPP Checklist)</h4>
                          <p style={{ margin: 0, fontSize: 11, color: 'var(--t3)' }}>
                            No. BAPP: <strong>{currentPaket.noBAPP || '002/KEU-BAPP/PKM.TREA/I/2026'}</strong> | Tgl: <strong>{currentPaket.tglBAPP || '05 Maret 2026'}</strong>
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn" style={{ fontSize: 11, background: '#10b981', color: '#fff' }} onClick={() => setAllBappValid(currentPaket.id)}>
                            <span className="ic s">check</span> Centang Semua Sesuai (√)
                          </button>
                          <button
                            className="btn"
                            style={{ fontSize: 11, background: '#6366f1', color: '#fff' }}
                            onClick={() => setIsMobileBappMode(true)}
                          >
                            <span className="ic s">smartphone</span> Buka Mobile View
                          </button>
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                          <thead>
                            <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                              <th style={{ padding: 6 }}>No</th>
                              <th style={{ padding: 6 }}>Nama Barang</th>
                              <th style={{ padding: 6, textAlign: 'center' }}>Vol Pesanan</th>
                              <th style={{ padding: 6 }}>Satuan</th>
                              <th style={{ padding: 6, textAlign: 'right' }}>Harga Satuan</th>
                              <th style={{ padding: 6, textAlign: 'center' }}>Realisasi Vol</th>
                              <th style={{ padding: 6, textAlign: 'right' }}>Total Realisasi</th>
                              <th style={{ padding: 6, textAlign: 'center' }}>Keterangan (√/X)</th>
                              <th style={{ padding: 6 }}>Catatan Pemeriksa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPaket.items.map((it, idx) => {
                              const isValid = it.realisasiCheck !== 'invalid';
                              return (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                                  <td style={{ padding: 6 }}>{idx + 1}</td>
                                  <td style={{ padding: 6, fontWeight: 600 }}>{it.uraian}</td>
                                  <td style={{ padding: 6, textAlign: 'center' }}>{it.qty}</td>
                                  <td style={{ padding: 6 }}>{it.satuan}</td>
                                  <td style={{ padding: 6, textAlign: 'right' }}>{fmtRp(it.deal)}</td>
                                  <td style={{ padding: 6, textAlign: 'center' }}>
                                    <input
                                      type="number"
                                      value={it.realisasiQty !== undefined ? it.realisasiQty : it.qty}
                                      onChange={(e) => updateBappItem(currentPaket.id, idx, 'realisasiQty', parseInt(e.target.value) || 0)}
                                      style={{ ...inpSm, width: 50, textAlign: 'center', padding: '3px 4px' }}
                                    />
                                  </td>
                                  <td style={{ padding: 6, textAlign: 'right', fontWeight: 700 }}>
                                    {fmtRp(it.deal * (it.realisasiQty !== undefined ? it.realisasiQty : it.qty))}
                                  </td>
                                  <td style={{ padding: 6, textAlign: 'center' }}>
                                    <button
                                      onClick={() => updateBappItem(currentPaket.id, idx, 'realisasiCheck', isValid ? 'invalid' : 'valid')}
                                      style={{
                                        background: isValid ? '#dcfce7' : '#fee2e2',
                                        color: isValid ? '#166534' : '#991b1b',
                                        border: `1px solid ${isValid ? '#86efac' : '#fca5a5'}`,
                                        borderRadius: 6,
                                        padding: '2px 8px',
                                        fontSize: 11,
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {isValid ? '√ BAIK' : '✕ RUSAK'}
                                    </button>
                                  </td>
                                  <td style={{ padding: 6 }}>
                                    <input
                                      placeholder="Catatan fisik..."
                                      value={it.catatanPemeriksa || ''}
                                      onChange={(e) => updateBappItem(currentPaket.id, idx, 'catatanPemeriksa', e.target.value)}
                                      style={{ ...inpSm, width: '100%', padding: '3px 6px' }}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB TAB 4: KALKULATOR PAJAK OTOMATIS & FAKTUR PAJAK */}
              {detailTab === 'pajak' && (() => {
                const totalDeal = calcDeal(currentPaket.items);
                const tax = calcTaxDetails(
                  totalDeal,
                  currentPaket.taxScheme || 'ppn_pph22',
                  currentPaket.hasNpwp !== false,
                  currentPaket.isHargaIncludePpn !== false
                );
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Tax Settings Config Card */}
                    <div className="card" style={{ padding: 20, background: 'var(--srf)', border: '1.5px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e3a8a' }}>
                            Kalkulator &amp; Pemotongan Pajak BLUD (PPN &amp; PPh)
                          </h4>
                          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--t3)' }}>
                            Otomatis menghitung DPP, PPN 11%, PPh Pasal 22 (Barang) / PPh 23 (Jasa), dan Netto yang ditransfer ke rekanan.
                          </p>
                        </div>
                        <button
                          className="btn pri"
                          style={{ fontSize: 11 }}
                          onClick={() => { setDetailTab('cetakDoc'); setDocPrintType('faktur'); }}
                        >
                          <span className="ic s">receipt_long</span> Lihat Format Faktur Pajak &amp; e-Billing
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={lblSm}>Skema Pemotongan Pajak *</label>
                          <select
                            value={currentPaket.taxScheme || 'ppn_pph22'}
                            onChange={(e) => updatePaketTax(currentPaket.id, 'taxScheme', e.target.value)}
                            style={{ ...inpSm, width: '100%', fontWeight: 700 }}
                          >
                            <option value="ppn_pph22">PPN 11% + PPh 22 (1.5% Belanja Barang Pemerintah)</option>
                            <option value="ppn_pph23">PPN 11% + PPh 23 (2.0% Belanja Jasa/Servis)</option>
                            <option value="ppn_only">PPN 11% Saja (Tanpa PPh)</option>
                            <option value="bebas_pajak">Bebas Pajak / Non-PKP (Transaksi &lt; Rp 2.000.000)</option>
                          </select>
                        </div>

                        <div>
                          <label style={lblSm}>Status NPWP Rekanan</label>
                          <select
                            value={currentPaket.hasNpwp !== false ? 'yes' : 'no'}
                            onChange={(e) => updatePaketTax(currentPaket.id, 'hasNpwp', e.target.value === 'yes')}
                            style={{ ...inpSm, width: '100%' }}
                          >
                            <option value="yes">Memiliki NPWP Valid (Tarif Standar)</option>
                            <option value="no">Tanpa NPWP (Tarif PPh 100% Lebih Tinggi)</option>
                          </select>
                        </div>

                        <div>
                          <label style={lblSm}>Harga Kesepakatan Nego</label>
                          <select
                            value={currentPaket.isHargaIncludePpn !== false ? 'include' : 'exclude'}
                            onChange={(e) => updatePaketTax(currentPaket.id, 'isHargaIncludePpn', e.target.value === 'include')}
                            style={{ ...inpSm, width: '100%' }}
                          >
                            <option value="include">Sudah Termasuk PPN 11% (Standard Pengadaan)</option>
                            <option value="exclude">Belum Termasuk PPN (DPP = Total Deal)</option>
                          </select>
                        </div>
                      </div>

                      {/* Tax Breakdown Metric Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>NILAI BRUTO TRANSAKSI</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>{fmtRp(totalDeal)}</div>
                          <div style={{ fontSize: 9.5, color: '#64748b' }}>Nilai SP / DP 100%</div>
                        </div>

                        <div style={{ background: '#eff6ff', padding: 12, borderRadius: 8, border: '1px solid #bfdbfe' }}>
                          <div style={{ fontSize: 10, color: '#1e40af', textTransform: 'uppercase' }}>DASAR PENGENAAN PAJAK (DPP)</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: '#1d4ed8', marginTop: 2 }}>{fmtRp(tax.dpp)}</div>
                          <div style={{ fontSize: 9.5, color: '#3b82f6' }}>Nilai sebelum PPN</div>
                        </div>

                        <div style={{ background: '#fef3c7', padding: 12, borderRadius: 8, border: '1px solid #fde68a' }}>
                          <div style={{ fontSize: 10, color: '#92400e', textTransform: 'uppercase' }}>PPN 11% (DIPUNGUT)</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: '#b45309', marginTop: 2 }}>{fmtRp(tax.ppn)}</div>
                          <div style={{ fontSize: 9.5, color: '#d97706' }}>Setor e-Billing Bendahara</div>
                        </div>

                        <div style={{ background: '#fee2e2', padding: 12, borderRadius: 8, border: '1px solid #fca5a5' }}>
                          <div style={{ fontSize: 10, color: '#991b1b', textTransform: 'uppercase' }}>{tax.pphJenis} ({tax.pphTarif})</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: '#dc2626', marginTop: 2 }}>{fmtRp(tax.totalPph)}</div>
                          <div style={{ fontSize: 9.5, color: '#ef4444' }}>Dipotong dari pembayaran</div>
                        </div>

                        <div style={{ background: '#dcfce7', padding: 12, borderRadius: 8, border: '1.5px solid #86efac' }}>
                          <div style={{ fontSize: 10, color: '#166534', textTransform: 'uppercase', fontWeight: 800 }}>NETTO DITERIMA REKANAN</div>
                          <div style={{ fontSize: 17, fontWeight: 900, color: '#15803d', marginTop: 2 }}>{fmtRp(tax.netto)}</div>
                          <div style={{ fontSize: 9.5, color: '#16a34a' }}>Transfer ke Rek Bank Rekanan</div>
                        </div>
                      </div>
                    </div>

                    {/* e-Billing Reference Box */}
                    <div className="card" style={{ padding: 18, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                      <h5 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 800, color: '#1e3a8a' }}>
                        Data Billing Perpajakan (DJP Online / e-Billing BLUD)
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: 12 }}>
                        <div>
                          <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 2 }}>Nomor Faktur Pajak</label>
                          <input
                            value={currentPaket.noFakturPajak || '026.001-26.98402912'}
                            onChange={(e) => updatePaketTax(currentPaket.id, 'noFakturPajak', e.target.value)}
                            style={{ ...inpSm, width: '100%', fontFamily: 'monospace', fontWeight: 700 }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 2 }}>Kode Billing Setor Pajak</label>
                          <input
                            value={currentPaket.kodeBillingPajak || '8291 0482 1920'}
                            onChange={(e) => updatePaketTax(currentPaket.id, 'kodeBillingPajak', e.target.value)}
                            style={{ ...inpSm, width: '100%', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: 'var(--t3)', display: 'block', marginBottom: 2 }}>Tanggal Setor Pajak</label>
                          <input
                            value={currentPaket.tglFakturPajak || currentPaket.tglBAP || '09 Maret 2026'}
                            onChange={(e) => updatePaketTax(currentPaket.id, 'tglFakturPajak', e.target.value)}
                            style={{ ...inpSm, width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SUB TAB 5: LAMPIRAN TAMBAHAN (KTP VENDOR, NPWP, REKENING, DLL) */}
              {detailTab === 'lampiran' && (
                <div className="card" style={{ padding: 20, background: 'var(--srf)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Space Lampiran Tambahan &amp; Arsip Eksternal</h4>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--t3)' }}>
                        Menyimpan fotocopy KTP Direktur vendor, NPWP, Buku Rekening Bank, Foto Fisik Barang, dsb.
                      </p>
                    </div>
                    <button className="btn pri" style={{ fontSize: 11 }} onClick={() => setIsAddAttachmentModalOpen(true)}>
                      <span className="ic s">upload_file</span> ➕ Tambah Lampiran Baru
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {(currentPaket.externalAttachments || []).map((att) => (
                      <div
                        key={att.id}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--line)',
                          borderRadius: 10,
                          padding: 14,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#eff6ff', color: 'var(--blue)' }}>
                              {att.kategori}
                            </span>
                            <span style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>✓ {att.status}</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginTop: 4 }}>{att.nama}</div>
                          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>Catatan: {att.catatan}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: '1px dashed var(--line)' }}>
                          <span style={{ fontSize: 10, color: 'var(--t3)' }}>Tgl: {att.tglUpload}</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => alert(`Membuka berkas arsip: ${att.nama}`)}
                              style={{ background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}
                            >
                              Lihat File
                            </button>
                            <button
                              onClick={() => handleDeleteExternalAttachment(currentPaket.id, att.id)}
                              style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 4, padding: '3px 6px', fontSize: 10, cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB TAB 6: CHECKLIST 15 BERKAS */}
              {detailTab === 'berkas' && (
                <div className="card" style={{ padding: 20, background: 'var(--srf)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 800 }}>Audit 15 Berkas Kelengkapan Pengadaan (SPJ BLUD)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                    {BERKAS.map((b) => {
                      const st = currentPaket.berkasStatus?.[b.key] || { ada: false, tgl: '', no: '' };
                      return (
                        <div
                          key={b.key}
                          onClick={() => toggleBerkas(currentPaket.id, b.key)}
                          style={{
                            padding: 12,
                            borderRadius: 8,
                            border: '1px solid var(--line)',
                            background: st.ada ? '#f0fdf4' : 'var(--bg)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: 10,
                            alignItems: 'center',
                          }}
                        >
                          <span className="ic" style={{ color: st.ada ? '#10b981' : 'var(--t3)' }}>
                            {st.ada ? 'check_box' : 'checkbox_outline_blank'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 12, color: st.ada ? '#064e3b' : 'var(--t1)' }}>{b.label}</div>
                            {st.ada && <div style={{ fontSize: 10, color: '#10b981' }}>Terbit: {st.tgl || 'Lengkap'} {st.no ? `(${st.no})` : ''}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB TAB 7: DOCUMENT GENERATOR (PRINT PREVIEW 7 DOKUMEN & BATCH PRINT SPJ) */}
              {detailTab === 'cetakDoc' && (() => {
                const totalDeal = calcDeal(currentPaket.items);
                const tax = calcTaxDetails(
                  totalDeal,
                  currentPaket.taxScheme || 'ppn_pph22',
                  currentPaket.hasNpwp !== false,
                  currentPaket.isHargaIncludePpn !== false
                );

                // Reusable Header Component for Official Documents
                const renderOfficialKop = () => (
                  <div className="doc-kop-header">
                    <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, fontWeight: 900, fontSize: 10, textAlign: 'center', color: '#1e3a8a' }}>
                      LOGO PEMKOT
                    </div>
                    <div className="doc-kop-text">
                      <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        PEMERINTAH KOTA MAKASSAR
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        DINAS KESEHATAN
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase', color: '#0f172a' }}>
                        {masterData.puskesmas.nama}
                      </div>
                      <div style={{ fontSize: 10, color: '#334155', marginTop: 2 }}>
                        {masterData.puskesmas.alamat} &nbsp;|&nbsp; E-mail: {masterData.puskesmas.email}
                      </div>
                    </div>
                    <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, fontWeight: 900, fontSize: 10, textAlign: 'center', color: '#166534' }}>
                      LOGO PUSKESMAS
                    </div>
                  </div>
                );

                // Document Renderers
                const renderDocNego = () => (
                  <div>
                    {renderOfficialKop()}
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, textDecoration: 'underline', textTransform: 'uppercase' }}>
                        NEGOSIASI HARGA {currentPaket.kategori === 'ATK' ? 'ALAT TULIS KANTOR' : currentPaket.namaPaket.toUpperCase()}
                      </h3>
                    </div>

                    <table style={{ width: '100%', marginBottom: 20 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'center' }}>
                          <th rowSpan={2} style={{ width: 30 }}>No</th>
                          <th rowSpan={2}>JENIS BARANG</th>
                          <th colSpan={2}>HARGA NEGO 1 (Rp)</th>
                          <th colSpan={2}>HARGA NEGO 2 (Rp)</th>
                          <th rowSpan={2} style={{ width: 100 }}>HARGA DEAL (Rp)</th>
                        </tr>
                        <tr style={{ background: '#f8fafc', textAlign: 'center' }}>
                          <th style={{ width: 90 }}>PEMBELI</th>
                          <th style={{ width: 90 }}>PENYEDIA</th>
                          <th style={{ width: 90 }}>PEMBELI</th>
                          <th style={{ width: 90 }}>PENYEDIA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPaket.items.map((it, idx) => (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td>{it.uraian}</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.ng1B || it.deal * 0.95)}</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.ng1P || it.deal)}</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.ng2B || it.deal)}</td>
                            <td style={{ textAlign: 'center' }}>{it.ng2P ? fmtRp(it.ng2P) : '-'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>{fmtRp(it.deal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 30, fontSize: 11 }}>
                      <div>
                        <div>Untuk Dan Atas Nama Penyedia</div>
                        <div style={{ fontWeight: 800, marginTop: 2 }}>{currentPaket.penyedia}</div>
                        <div style={{ height: 60 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.vendors[0]?.direktur || 'Akbar'}</div>
                        <div>Direktur</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>Pemimpin BLUD</div>
                        <div style={{ fontWeight: 800, marginTop: 2 }}>Selaku Pejabat Pembuat Komitmen</div>
                        <div style={{ height: 60 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.kapus.nama}</div>
                        <div>NIP. {masterData.kapus.nip}</div>
                      </div>
                    </div>
                  </div>
                );

                const renderDocDP = () => (
                  <div>
                    {renderOfficialKop()}
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, textDecoration: 'underline', letterSpacing: 0.5 }}>
                        DAFTAR PEMESANAN
                      </h3>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>
                        Nomor : {currentPaket.noDP || '001/KEU-DP/PKM.TREA/I/2026'}
                      </div>
                    </div>

                    <table style={{ width: '100%', marginBottom: 10, border: 'none' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: 220, border: 'none', padding: '2px 4px' }}>Organisasi Perangkat Daerah</td>
                          <td style={{ width: 10, border: 'none', padding: '2px 4px' }}>:</td>
                          <td style={{ border: 'none', padding: '2px 4px', fontWeight: 700 }}>Dinas Kesehatan — {masterData.puskesmas.nama}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 4px' }}>Kode Rekening</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>:</td>
                          <td style={{ border: 'none', padding: '2px 4px', fontFamily: 'monospace', fontWeight: 700 }}>{currentPaket.kodeRekening}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 4px' }}>Nama Kegiatan</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>:</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>Peningkatan Pelayanan BLUD</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 4px' }}>Nama Sub Kegiatan</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>:</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>{currentPaket.subKegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD'}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 4px' }}>Uraian Rekening</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>:</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>{currentPaket.namaPaket}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 4px' }}>Penyedia</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>:</td>
                          <td style={{ border: 'none', padding: '2px 4px', fontWeight: 700 }}>{currentPaket.penyedia}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 4px' }}>Tanggal Barang Diterima</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>:</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>{currentPaket.tglBAPP || '05 Maret 2026'}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 4px' }}>Tahun Anggaran</td>
                          <td style={{ border: 'none', padding: '2px 4px' }}>:</td>
                          <td style={{ border: 'none', padding: '2px 4px', fontWeight: 700 }}>2026</td>
                        </tr>
                      </tbody>
                    </table>

                    <table style={{ width: '100%', marginBottom: 12 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'center' }}>
                          <th style={{ width: 30 }}>NO</th>
                          <th>URAIAN</th>
                          <th style={{ width: 60 }}>SATUAN</th>
                          <th style={{ width: 70 }}>KUANTITAS</th>
                          <th style={{ width: 110 }}>HARGA SATUAN (Rp)</th>
                          <th style={{ width: 120 }}>JUMLAH (Rp)</th>
                        </tr>
                        <tr style={{ background: '#f1f5f9', textAlign: 'center', fontSize: 10 }}>
                          <th>1</th>
                          <th>2</th>
                          <th>3</th>
                          <th>4</th>
                          <th>5</th>
                          <th>6=5x4</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ background: '#fafafa', fontWeight: 700 }}>
                          <td colSpan={6} style={{ padding: '4px 8px' }}>
                            {currentPaket.namaPaket}
                          </td>
                        </tr>
                        {currentPaket.items.map((it, idx) => (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td>{it.uraian}</td>
                            <td style={{ textAlign: 'center' }}>{it.satuan}</td>
                            <td style={{ textAlign: 'center' }}>{it.qty}</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.deal)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtRp(it.deal * it.qty)}</td>
                          </tr>
                        ))}
                        <tr style={{ background: '#f8fafc', fontWeight: 900 }}>
                          <td colSpan={5} style={{ textAlign: 'center', letterSpacing: 0.5 }}>JUMLAH</td>
                          <td style={{ textAlign: 'right', fontSize: 12 }}>{fmtRp(totalDeal)}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 800 }}>Terbilang :</td>
                          <td colSpan={5} style={{ fontStyle: 'italic', fontWeight: 800, background: '#f8fafc' }}>
                            {terbilang(totalDeal)} Rupiah
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, fontSize: 11 }}>
                      <div style={{ textAlign: 'center', minWidth: 260 }}>
                        <div>Makassar, {currentPaket.tglDP || '02 Maret 2026'}</div>
                        <div style={{ fontWeight: 800, marginTop: 2 }}>Pemimpin BLUD</div>
                        <div style={{ fontWeight: 800 }}>Selaku Kuasa Pengguna Anggaran</div>
                        <div style={{ height: 60 }}></div>
                        <div style={{ fontWeight: 900, textDecoration: 'underline' }}>{masterData.kapus.nama}</div>
                        <div>NIP. {masterData.kapus.nip}</div>
                      </div>
                    </div>
                  </div>
                );

                const renderDocBAPP = () => (
                  <div>
                    {renderOfficialKop()}
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, textDecoration: 'underline', letterSpacing: 0.5 }}>
                        BERITA ACARA PEMERIKSAAN PEKERJAAN
                      </h3>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>
                        NOMOR : {currentPaket.noBAPP || '002/KEU-BAPP/PKM.TREA/I/2026'}
                      </div>
                    </div>

                    <p style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 8 }}>
                      Pada Hari ini <strong>Kamis</strong>, Tanggal <strong>Lima Bulan Maret Tahun Dua Ribu Dua Puluh Enam (05-03-2026)</strong>, Kami yang bertanda tangan di bawah ini :
                    </p>

                    <div style={{ paddingLeft: 16, fontSize: 11, lineHeight: 1.6, marginBottom: 8 }}>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 120 }}>Nama</span>: <strong>{masterData.kapus.nama}</strong>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: 120 }}>Jabatan</span>: <strong>{masterData.kapus.jabatan}</strong>
                      </div>
                    </div>

                    <p style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 10 }}>
                      Telah melakukan pemeriksaan barang hasil pekerjaan yang telah diserahkan Oleh <strong>{currentPaket.penyedia}</strong> berdasarkan Daftar Pesanan Nomor <strong>{currentPaket.noDP || '001/KEU-DP/PKM.TREA/I/2026'}</strong> tanggal <strong>{currentPaket.tglDP || '02 Maret 2026'}</strong> dengan perincian sebagai berikut :
                    </p>

                    <table style={{ width: '100%', marginBottom: 10, fontSize: 10 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'center' }}>
                          <th rowSpan={2} style={{ width: 24 }}>No</th>
                          <th rowSpan={2}>Nama</th>
                          <th rowSpan={2} style={{ width: 30 }}>Vol</th>
                          <th rowSpan={2} style={{ width: 45 }}>Kemasan</th>
                          <th rowSpan={2} style={{ width: 65 }}>Harga Satuan (Rp)</th>
                          <th rowSpan={2} style={{ width: 50 }}>Ongkos Kirim</th>
                          <th rowSpan={2} style={{ width: 75 }}>Total Harga (Rp)</th>
                          <th colSpan={4}>REALISASI</th>
                          <th rowSpan={2} style={{ width: 55 }}>Bobot Masuk %</th>
                          <th rowSpan={2} style={{ width: 30 }}>Ket.</th>
                        </tr>
                        <tr style={{ background: '#f8fafc', textAlign: 'center' }}>
                          <th style={{ width: 35 }}>Kuantitas</th>
                          <th style={{ width: 65 }}>Harga Satuan</th>
                          <th style={{ width: 75 }}>Total Harga</th>
                          <th style={{ width: 45 }}>Bobot %</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                          <td colSpan={13}>
                            ({currentPaket.kodeRekening}) Kegiatan Peningkatan Pelayanan BLUD, Sub Kegiatan {currentPaket.subKegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD'}
                          </td>
                        </tr>
                        <tr style={{ background: '#fafafa', fontWeight: 700 }}>
                          <td colSpan={13}>{currentPaket.namaPaket}</td>
                        </tr>
                        {currentPaket.items.map((it, idx) => (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td>{it.uraian}</td>
                            <td style={{ textAlign: 'center' }}>{it.qty}</td>
                            <td style={{ textAlign: 'center' }}>{it.satuan}</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.deal)}</td>
                            <td style={{ textAlign: 'center' }}>0</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.deal * it.qty)}</td>
                            <td style={{ textAlign: 'center' }}>{it.realisasiQty !== undefined ? it.realisasiQty : it.qty}</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.deal)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtRp(it.deal * (it.realisasiQty !== undefined ? it.realisasiQty : it.qty))}</td>
                            <td style={{ textAlign: 'center' }}>100</td>
                            <td style={{ textAlign: 'center' }}>100</td>
                            <td style={{ textAlign: 'center', fontWeight: 900, color: it.realisasiCheck === 'invalid' ? '#ef4444' : '#166534' }}>
                              {it.realisasiCheck === 'invalid' ? 'X' : '√'}
                            </td>
                          </tr>
                        ))}
                        <tr style={{ background: '#f8fafc', fontWeight: 900 }}>
                          <td colSpan={6} style={{ textAlign: 'center' }}>JUMLAH</td>
                          <td style={{ textAlign: 'right' }}>{fmtRp(totalDeal)}</td>
                          <td colSpan={2}></td>
                          <td style={{ textAlign: 'right' }}>{fmtRp(totalDeal)}</td>
                          <td style={{ textAlign: 'center' }}>100</td>
                          <td style={{ textAlign: 'center' }}>100</td>
                          <td style={{ textAlign: 'center' }}>√</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 800 }}>Terbilang :</td>
                          <td colSpan={12} style={{ fontStyle: 'italic', fontWeight: 800, background: '#f8fafc' }}>
                            {terbilang(totalDeal)} Rupiah
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ fontSize: 10, color: '#334155', lineHeight: 1.5, marginBottom: 16 }}>
                      <div><em>(Harga Telah Termasuk Kewajiban Pajak PPN 11% &amp; PPh)</em></div>
                      <div style={{ marginTop: 2 }}>
                        Barang/Bahan yang terdapat baik diberi (√), yang selanjutnya diserahkan oleh rekanan kepada Bendaharawan Barang, sedangkan yang tidak baik kami beri (X) yang selanjutnya dikembalikan untuk diganti.
                      </div>
                      <div style={{ marginTop: 2 }}>
                        Demikian Berita Acara ini dibuat dengan sebenar-benarnya untuk di pergunakan sebagaimana mestinya.
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, fontSize: 11 }}>
                      <div>
                        <div>Yang Menyerahkan</div>
                        <div style={{ fontWeight: 800 }}>{currentPaket.penyedia}</div>
                        <div style={{ height: 50 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.vendors[0]?.direktur || 'Akbar'}</div>
                        <div>Direktur</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>Yang Memeriksa</div>
                        <div style={{ fontWeight: 800 }}>Pemimpin BLUD</div>
                        <div>Selaku Pejabat Pembuat Komitmen</div>
                        <div style={{ height: 50 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.kapus.nama}</div>
                        <div>NIP. {masterData.kapus.nip}</div>
                      </div>
                    </div>
                  </div>
                );

                const renderDocBAST = () => (
                  <div>
                    {renderOfficialKop()}
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, textDecoration: 'underline', letterSpacing: 0.5 }}>
                        BERITA ACARA SERAH TERIMA PEKERJAAN
                      </h3>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>
                        NOMOR : {currentPaket.noBASTHP || '003/KEU-BASTHP/PKM.TREA/I/2026'}
                      </div>
                      <div style={{ fontSize: 10, color: '#166534', fontWeight: 700, marginTop: 2 }}>
                        ✓ Tanggal Terbit BASTHP Dikunci Sama Dengan BAPP: {currentPaket.tglBASTHP || currentPaket.tglBAPP || '05 Maret 2026'}
                      </div>
                    </div>

                    <p style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 8 }}>
                      Pada Hari ini <strong>Kamis</strong>, Tanggal <strong>Lima Bulan Maret Tahun Dua Ribu Dua Puluh Enam (05-03-2026)</strong>, Kami yang bertanda tangan di bawah ini :
                    </p>

                    <div style={{ paddingLeft: 14, fontSize: 11, lineHeight: 1.7, marginBottom: 12 }}>
                      <div>
                        <strong>1. Nama :</strong> {masterData.kapus.nama} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Jabatan :</strong> {masterData.kapus.jabatan} Selaku Pejabat Pembuat Komitmen <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Berkedudukan Di :</strong> {masterData.kapus.alamat || 'Jl. Kesejahteraan Timur 1 BTP Blok B Makassar'} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<em>Untuk Selanjutnya Disebut <strong>PIHAK I (PERTAMA)</strong></em>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <strong>2. Nama :</strong> {masterData.vendors[0]?.direktur || 'Akbar'} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Jabatan :</strong> Direktur {currentPaket.penyedia} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Berkedudukan Di :</strong> {masterData.vendors[0]?.alamat || 'Jl. Politeknik No. 74, Kelurahan Tamalanrea Indah, Kec. Tamalanrea, Kota Makassar'} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<em>Untuk Selanjutnya Disebut <strong>PIHAK II (KEDUA)</strong></em>
                      </div>
                    </div>

                    <p style={{ fontSize: 11, lineHeight: 1.7, textAlign: 'justify', marginBottom: 12 }}>
                      Dengan ini menyatakan bahwa <strong>PIHAK II (KEDUA)</strong> telah melaksanakan pekerjaan <strong>{currentPaket.namaPaket}</strong>, sesuai Daftar Pesanan Nomor : <strong>{currentPaket.noDP || '001/KEU-DP/PKM.TREA/I/2026'}</strong> tanggal <strong>{currentPaket.tglDP || '02 Maret 2026'}</strong>, <strong>PIHAK I (PERTAMA)</strong> telah menerima dalam kondisi baik dan lengkap.
                    </p>

                    <p style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 24 }}>
                      Demikianlah Berita Acara Serah Terima Pekerjaan ini dibuat dalam rangkap 2 untuk dipergunakan sebagaimana mestinya.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, fontSize: 11 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>PIHAK II (KEDUA)</div>
                        <div>{currentPaket.penyedia}</div>
                        <div style={{ height: 55 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.vendors[0]?.direktur || 'Akbar'}</div>
                        <div>Direktur</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800 }}>PIHAK I (PERTAMA)</div>
                        <div>Plt. Kepala Puskesmas Tamalanrea</div>
                        <div>Selaku Pejabat Pembuat Komitmen</div>
                        <div style={{ height: 55 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.kapus.nama}</div>
                        <div>NIP. {masterData.kapus.nip}</div>
                      </div>
                    </div>
                  </div>
                );

                const renderDocBAP = () => (
                  <div>
                    {renderOfficialKop()}
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, textDecoration: 'underline', letterSpacing: 0.5 }}>
                        BERITA ACARA PEMBAYARAN
                      </h3>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>
                        Nomor: {currentPaket.noBAP || '004/KEU-BAP/PKM.TREA/I/2026'}
                      </div>
                    </div>

                    <p style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 6 }}>
                      Pada Hari ini <strong>Senin</strong>, Tanggal <strong>Sembilan Bulan Maret Tahun Dua Ribu Dua Puluh Enam (09-03-2026)</strong>, Kami yang bertanda tangan di bawah ini :
                    </p>

                    <div style={{ paddingLeft: 14, fontSize: 11, lineHeight: 1.6, marginBottom: 8 }}>
                      <div>
                        <strong>1. Nama :</strong> {masterData.kapus.nama} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Jabatan :</strong> {masterData.kapus.jabatan} Selaku Kuasa Pengguna Anggaran <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Berkedudukan Di :</strong> {masterData.kapus.alamat || 'Jl. Kesejahteraan Timur 1 BTP Blok B Makassar'} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<em>Untuk Selanjutnya Disebut <strong>PIHAK I (PERTAMA)</strong></em>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <strong>2. Nama :</strong> {masterData.vendors[0]?.direktur || 'Akbar'} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Jabatan :</strong> Direktur <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Berkedudukan Di :</strong> {masterData.vendors[0]?.alamat || 'Jl. Politeknik No. 74, Kelurahan Tamalanrea Indah, Kec. Tamalanrea, Kota Makassar'} <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<em>Untuk Selanjutnya Disebut <strong>PIHAK II (KEDUA)</strong></em>
                      </div>
                    </div>

                    <p style={{ fontSize: 11, lineHeight: 1.5, textAlign: 'justify', marginBottom: 8 }}>
                      Yang berwenang dalam hal ini bertindak untuk dan atas nama <strong>{currentPaket.penyedia}</strong>, untuk melaksanakan pekerjaan <strong>{currentPaket.namaPaket}</strong>, sub kegiatan <strong>{currentPaket.subKegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD'}</strong> Puskesmas Tamalanrea Tahun Anggaran 2026.
                    </p>

                    {/* Nilai Pekerjaan Highlight Box */}
                    <table style={{ width: '100%', marginBottom: 8, border: 'none' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: 'none', width: 220, fontSize: 11, fontWeight: 700 }}>Dengan nilai pekerjaan sebesar</td>
                          <td style={{ border: '2px solid #000', textAlign: 'center', fontSize: 13, fontWeight: 900, background: '#f8fafc', padding: '4px 12px' }}>
                            {fmtRp(totalDeal)}
                          </td>
                          <td style={{ border: 'none' }}></td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 8 }}>
                      <div><strong>Berdasarkan :</strong></div>
                      <div style={{ paddingLeft: 12 }}>
                        <div>1. Kode Rekening : {currentPaket.kodeRekening}</div>
                        <div>2. Daftar Pesanan : {currentPaket.noDP || '001/KEU-DP/PKM.TREA/I/2026'} , tanggal {currentPaket.tglDP || '02 Maret 2026'}</div>
                        <div>3. Berita Acara Pemeriksaan : {currentPaket.noBAPP || '002/KEU-BAPP/PKM.TREA/I/2026'} , tanggal {currentPaket.tglBAPP || '05 Maret 2026'}</div>
                        <div>4. Berita Acara Serah Terima Hasil Pekerjaan : {currentPaket.noBASTHP || '003/KEU-BASTHP/PKM.TREA/I/2026'} , tanggal {currentPaket.tglBASTHP || '05 Maret 2026'}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>
                      Maka pihak kedua berhak menerima pembayaran sebesar 100% (Seratus Persen) Dengan perincian sebagai berikut:
                    </p>

                    <table style={{ width: '100%', marginBottom: 10, fontSize: 10.5 }}>
                      <tbody>
                        <tr>
                          <td style={{ border: 'none' }}>a. Jumlah Pembayaran Bruto sampai dengan Angsuran ini</td>
                          <td style={{ border: 'none', width: 40, fontWeight: 700 }}>Rp</td>
                          <td style={{ border: 'none', width: 120, textAlign: 'right', fontWeight: 700 }}>{fmtRp(totalDeal).replace('Rp ', '')}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none' }}>b. Dasar Pengenaan Pajak (DPP)</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>Rp</td>
                          <td style={{ border: 'none', textAlign: 'right', fontWeight: 700 }}>{fmtRp(tax.dpp).replace('Rp ', '')}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none' }}>c. Potongan Pajak Pertambahan Nilai (PPN 11%) — Dipungut Bendahara</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>Rp</td>
                          <td style={{ border: 'none', textAlign: 'right', fontWeight: 700 }}>{fmtRp(tax.ppn).replace('Rp ', '')}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none' }}>d. Potongan {tax.pphJenis} ({tax.pphTarif})</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>Rp</td>
                          <td style={{ border: 'none', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{fmtRp(tax.totalPph).replace('Rp ', '')}</td>
                        </tr>
                        <tr style={{ fontWeight: 900, borderTop: '1px solid #000' }}>
                          <td style={{ border: 'none' }}>5. Jumlah Pembayaran Bersih / Netto Ditransfer ke Rekanan</td>
                          <td style={{ border: 'none', fontWeight: 900 }}>Rp</td>
                          <td style={{ border: 'none', textAlign: 'right', fontWeight: 900, color: '#166534' }}>{fmtRp(tax.netto).replace('Rp ', '')}</td>
                        </tr>
                        <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                          <td colSpan={3} style={{ border: 'none', paddingTop: 6 }}><em>REKAPITULASI PEMBAYARAN :</em></td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingLeft: 12 }}>a. Nilai Kontrak Awal 100% sebesar</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>Rp</td>
                          <td style={{ border: 'none', textAlign: 'right', fontWeight: 700 }}>{fmtRp(totalDeal).replace('Rp ', '')}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingLeft: 12 }}>b. Telah diterima Uang Muka</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>Rp</td>
                          <td style={{ border: 'none', textAlign: 'right', fontWeight: 700 }}>-</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingLeft: 12 }}>f. Diminta Sekarang sebesar (Netto)</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>Rp</td>
                          <td style={{ border: 'none', textAlign: 'right', fontWeight: 700 }}>{fmtRp(tax.netto).replace('Rp ', '')}</td>
                        </tr>
                        <tr style={{ fontWeight: 900 }}>
                          <td style={{ border: 'none', paddingLeft: 12 }}>g. Sisa Kontrak</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', textAlign: 'right', color: '#166534' }}>NIHIL</td>
                        </tr>
                      </tbody>
                    </table>

                    <p style={{ fontSize: 10.5, lineHeight: 1.5, marginBottom: 20 }}>
                      Demikian Berita Acara ini dibuat dengan sebenarnya dan menjadi Sah setelah ditandatangani kedua belah pihak.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, fontSize: 11 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>PIHAK II (KEDUA)</div>
                        <div>{currentPaket.penyedia}</div>
                        <div style={{ height: 50 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.vendors[0]?.direktur || 'Akbar'}</div>
                        <div>Direktur</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800 }}>PIHAK I (PERTAMA)</div>
                        <div>Pemimpin BLUD</div>
                        <div>Selaku Kuasa Pengguna Anggaran</div>
                        <div style={{ height: 50 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.kapus.nama}</div>
                        <div>NIP. {masterData.kapus.nip}</div>
                      </div>
                    </div>
                  </div>
                );

                const renderDocKuitansi = () => (
                  <div>
                    {renderOfficialKop()}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: 3, textDecoration: 'underline' }}>
                        K W I T A N S I
                      </h3>
                    </div>

                    <table style={{ width: '100%', fontSize: 11.5, lineHeight: 1.7, border: 'none', marginBottom: 20 }}>
                      <tbody>
                        <tr>
                          <td colSpan={3} style={{ border: 'none', fontWeight: 700 }}>Yang bertanda tangan di bawah ini :</td>
                        </tr>
                        <tr>
                          <td style={{ width: 140, border: 'none', fontWeight: 700 }}>Kode Rekening</td>
                          <td style={{ width: 10, border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontFamily: 'monospace', fontWeight: 800 }}>{currentPaket.kodeRekening}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', fontWeight: 700 }}>Buku Kas No</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>BKU-038/BLUD/I/2026</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', fontWeight: 700 }}>Tanggal</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>{currentPaket.tglBAP || '09 Maret 2026'}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', fontWeight: 700 }}>Terima dari</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontWeight: 800 }}>Pemimpin BLUD Selaku Kuasa Pengguna Anggaran</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', fontWeight: 700 }}>Banyak Uang (Bruto)</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontStyle: 'italic', fontWeight: 900, background: '#f8fafc', padding: '4px 6px' }}>
                            === {terbilang(totalDeal)} Rupiah ===
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', verticalAlign: 'top', fontWeight: 700, paddingTop: 6 }}>Untuk Pembayaran</td>
                          <td style={{ border: 'none', verticalAlign: 'top', paddingTop: 6 }}>:</td>
                          <td style={{ border: 'none', paddingTop: 6 }}>
                            {currentPaket.namaPaket}, Pada Sub Kegiatan {currentPaket.subKegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD'}, Kegiatan Peningkatan Pelayanan BLUD pada {masterData.puskesmas.nama}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3} style={{ border: 'none', paddingTop: 6, fontWeight: 700 }}>Sesuai,</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingLeft: 12 }}>Daftar Pesanan Nomor</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none' }}>{currentPaket.noDP || '001/KEU-DP/PKM.TREA/I/2026'} , tanggal {currentPaket.tglDP || '02 Maret 2026'}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingLeft: 12 }}>BA.Pemeriksaan Pekerjaan Nomor</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none' }}>{currentPaket.noBAPP || '002/KEU-BAPP/PKM.TREA/I/2026'} , tanggal {currentPaket.tglBAPP || '05 Maret 2026'}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingLeft: 12 }}>BA. Serah terima Pekerjaan Nomor</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none' }}>{currentPaket.noBASTHP || '003/KEU-BASTHP/PKM.TREA/I/2026'} , tanggal {currentPaket.tglBASTHP || '05 Maret 2026'}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingLeft: 12 }}>BA. Pembayaran Nomor</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none' }}>{currentPaket.noBAP || '004/KEU-BAP/PKM.TREA/I/2026'} , tanggal {currentPaket.tglBAP || '09 Maret 2026'}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingLeft: 12, color: '#dc2626' }}>Potongan {tax.pphJenis} ({tax.pphTarif})</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontWeight: 700, color: '#dc2626' }}>- {fmtRp(tax.totalPph)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingTop: 10, fontWeight: 900, fontSize: 13 }}>Terbilang Bersih (Netto)</td>
                          <td style={{ border: 'none', paddingTop: 10 }}>:</td>
                          <td style={{ border: 'none', paddingTop: 10 }}>
                            <span style={{ display: 'inline-block', border: '2px solid #000', padding: '4px 16px', fontWeight: 900, fontSize: 14, background: '#f0fdf4', color: '#166534' }}>
                              {fmtRp(tax.netto)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 800 }}>DIKETAHUI / DISETUJUI</div>
                      <div style={{ fontSize: 11, fontWeight: 800 }}>Pemimpin BLUD selaku KUASA PENGGUNA ANGGARAN</div>
                      <div style={{ height: 50 }}></div>
                      <div style={{ fontSize: 11, fontWeight: 900, textDecoration: 'underline' }}>{masterData.kapus.nama}</div>
                      <div style={{ fontSize: 10.5 }}>NIP. {masterData.kapus.nip}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, fontSize: 11, marginTop: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>BENDAHARA PENGELUARAN BLUD</div>
                        <div style={{ height: 55 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.bendahara.nama}</div>
                        <div>NIP. {masterData.bendahara.nip}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>Makassar, {currentPaket.tglBAP || '09 Maret 2026'}</div>
                        <div style={{ fontWeight: 800 }}>Yang menerima</div>
                        <div style={{ fontWeight: 800 }}>{currentPaket.penyedia}</div>
                        <div style={{ height: 40 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.vendors[0]?.direktur || 'Akbar'}</div>
                        <div>Direktur</div>
                      </div>
                    </div>
                  </div>
                );

                const renderDocFakturPajak = () => (
                  <div>
                    {renderOfficialKop()}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, textDecoration: 'underline', letterSpacing: 0.5 }}>
                        FAKTUR PAJAK &amp; BUKTI PEMOTONGAN PAJAK BLUD
                      </h3>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>
                        Kode dan Nomor Seri Faktur Pajak : {currentPaket.noFakturPajak || '026.001-26.98402912'}
                      </div>
                      <div style={{ fontSize: 10, color: '#1e40af', fontWeight: 700 }}>
                        Kode Billing DJP : {currentPaket.kodeBillingPajak || '8291 0482 1920'} | Tanggal : {currentPaket.tglFakturPajak || currentPaket.tglBAP || '09 Maret 2026'}
                      </div>
                    </div>

                    <table style={{ width: '100%', marginBottom: 12, border: '1px solid #000', fontSize: 10.5 }}>
                      <tbody>
                        <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                          <td colSpan={3} style={{ borderBottom: '1px solid #000', padding: '4px 8px' }}>
                            PENGUSAHA KENA PAJAK / REKANAN (PENJUAL)
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: 140, border: 'none', padding: '2px 8px' }}>Nama</td>
                          <td style={{ width: 10, border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>{currentPaket.penyedia}</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 8px' }}>NPWP</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontFamily: 'monospace', fontWeight: 800 }}>71.234.567.8-804.000</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 8px' }}>Alamat</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none' }}>{masterData.vendors[0]?.alamat || 'Jl. Politeknik No. 74, Kel. Tamalanrea Indah, Makassar'}</td>
                        </tr>

                        <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '1px solid #000' }}>
                          <td colSpan={3} style={{ borderBottom: '1px solid #000', padding: '4px 8px' }}>
                            INSTANSI PEMERINTAH / PEMBELI (PEMOTONG PAJAK)
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 8px' }}>Nama Instansi</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontWeight: 700 }}>{masterData.puskesmas.nama} — Dinas Kesehatan Kota Makassar</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 8px' }}>NPWP Instansi</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none', fontFamily: 'monospace', fontWeight: 800 }}>00.123.456.7-805.000</td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', padding: '2px 8px' }}>Alamat</td>
                          <td style={{ border: 'none' }}>:</td>
                          <td style={{ border: 'none' }}>{masterData.puskesmas.alamat}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table style={{ width: '100%', marginBottom: 12, fontSize: 10.5 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'center' }}>
                          <th style={{ width: 26 }}>No</th>
                          <th>Nama Barang Kena Pajak / Jasa Kena Pajak</th>
                          <th style={{ width: 50 }}>Qty</th>
                          <th style={{ width: 50 }}>Satuan</th>
                          <th style={{ width: 90 }}>Harga Satuan (Rp)</th>
                          <th style={{ width: 110 }}>Harga Jual / Total (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPaket.items.map((it, idx) => (
                          <tr key={idx}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td>{it.uraian}</td>
                            <td style={{ textAlign: 'center' }}>{it.qty}</td>
                            <td style={{ textAlign: 'center' }}>{it.satuan}</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.deal)}</td>
                            <td style={{ textAlign: 'right' }}>{fmtRp(it.deal * it.qty)}</td>
                          </tr>
                        ))}
                        <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                          <td colSpan={5}>Harga Jual / Penggantian Total Bruto</td>
                          <td style={{ textAlign: 'right' }}>{fmtRp(totalDeal)}</td>
                        </tr>
                        <tr>
                          <td colSpan={5} style={{ fontWeight: 800 }}>Dasar Pengenaan Pajak (DPP)</td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>{fmtRp(tax.dpp)}</td>
                        </tr>
                        <tr style={{ background: '#fef3c7' }}>
                          <td colSpan={5} style={{ fontWeight: 800 }}>PPN yang Dipungut Bendahara BLUD (11% x DPP)</td>
                          <td style={{ textAlign: 'right', fontWeight: 900, color: '#b45309' }}>{fmtRp(tax.ppn)}</td>
                        </tr>
                        <tr style={{ background: '#fee2e2' }}>
                          <td colSpan={5} style={{ fontWeight: 800 }}>{tax.pphJenis} ({tax.pphTarif} x DPP)</td>
                          <td style={{ textAlign: 'right', fontWeight: 900, color: '#dc2626' }}>{fmtRp(tax.totalPph)}</td>
                        </tr>
                        <tr style={{ background: '#dcfce7', fontWeight: 900 }}>
                          <td colSpan={5} style={{ fontSize: 11 }}>Jumlah Bersih Ditransfer ke Rekanan (Netto)</td>
                          <td style={{ textAlign: 'right', fontSize: 12, color: '#166534' }}>{fmtRp(tax.netto)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, fontSize: 11, marginTop: 20 }}>
                      <div>
                        <div>Yang Menyerahkan (PKP Rekanan)</div>
                        <div style={{ fontWeight: 800 }}>{currentPaket.penyedia}</div>
                        <div style={{ height: 50 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.vendors[0]?.direktur || 'Akbar'}</div>
                        <div>Direktur</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>Makassar, {currentPaket.tglFakturPajak || currentPaket.tglBAP || '09 Maret 2026'}</div>
                        <div style={{ fontWeight: 800 }}>Bendahara Pengeluaran BLUD</div>
                        <div style={{ height: 50 }}></div>
                        <div style={{ fontWeight: 800, textDecoration: 'underline' }}>{masterData.bendahara.nama}</div>
                        <div>NIP. {masterData.bendahara.nip}</div>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div className="card" style={{ padding: 24, background: '#fff', border: '1px solid #cbd5e1' }}>
                    {/* Action Bar with Batch Print SPJ Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* One-Click Batch Print SPJ Button */}
                        <button
                          onClick={() => setDocPrintType('all')}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 6,
                            border: '1.5px solid #10b981',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 900,
                            background: docPrintType === 'all' ? '#10b981' : '#ecfdf5',
                            color: docPrintType === 'all' ? '#fff' : '#065f46',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: docPrintType === 'all' ? '0 2px 6px rgba(16, 185, 129, 0.3)' : 'none',
                          }}
                        >
                          <span className="ic s">auto_stories</span> 📑 CETAK BUNDEL LENGKAP SPJ (Semua Dokumen)
                        </button>

                        <div style={{ width: 1, height: 20, background: '#cbd5e1', margin: '0 4px' }} />

                        {[
                          { id: 'nego', label: '1. Negosiasi' },
                          { id: 'dp', label: '2. DP/SP' },
                          { id: 'bapp', label: '3. BAPP' },
                          { id: 'bast', label: '4. BASTHP' },
                          { id: 'bap', label: '5. BAP' },
                          { id: 'kuitansi', label: '6. Kwitansi' },
                          { id: 'faktur', label: '7. Faktur Pajak' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            onClick={() => setDocPrintType(d.id)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--line)',
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 700,
                              background: docPrintType === d.id ? 'var(--blue)' : '#f8fafc',
                              color: docPrintType === d.id ? '#fff' : 'var(--t1)',
                            }}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => window.print()}
                        className="btn pri"
                        style={{ fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <span className="ic s">print</span> Cetak Sekarang (Print / PDF)
                      </button>
                    </div>

                    {/* DOCUMENT CANVAS SHEET */}
                    <div className="doc-official-paper" style={{ padding: 30 }}>
                      {/* BATCH PRINT SPJ: RENDER ALL 7 DOCUMENTS SEQUENTIALLY */}
                      {docPrintType === 'all' && (
                        <div>
                          <div style={{ textAlign: 'center', background: '#eff6ff', border: '1.5px dashed #3b82f6', borderRadius: 8, padding: '10px 14px', marginBottom: 24 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8' }}>
                              📑 Bundel Lengkap SPJ Siap Cetak (7 Dokumen Berurutan Sesuai Format Resmi Puskesmas Tamalanrea)
                            </span>
                          </div>

                          {renderDocNego()}
                          <div className="doc-page-break" />

                          {renderDocDP()}
                          <div className="doc-page-break" />

                          {renderDocBAPP()}
                          <div className="doc-page-break" />

                          {renderDocBAST()}
                          <div className="doc-page-break" />

                          {renderDocBAP()}
                          <div className="doc-page-break" />

                          {renderDocKuitansi()}
                          <div className="doc-page-break" />

                          {renderDocFakturPajak()}
                        </div>
                      )}

                      {/* INDIVIDUAL DOCUMENT PREVIEWS */}
                      {docPrintType === 'nego' && renderDocNego()}
                      {docPrintType === 'dp' && renderDocDP()}
                      {docPrintType === 'bapp' && renderDocBAPP()}
                      {docPrintType === 'bast' && renderDocBAST()}
                      {docPrintType === 'bap' && renderDocBAP()}
                      {docPrintType === 'kuitansi' && renderDocKuitansi()}
                      {docPrintType === 'faktur' && renderDocFakturPajak()}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SEAMLESS EXCEL IMPORT MODAL (LAMPIRAN 3 FEATURE) */}
      {/* =================================================================== */}
      {isExcelModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="card" style={{ width: '90%', maxWidth: 780, padding: 24, background: '#fff', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ic l" style={{ color: '#10b981' }}>
                  table_chart
                </span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Seamless Import Data Penawaran / Nego dari Excel</h3>
              </div>
              <button
                onClick={() => setIsExcelModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--t3)' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 12 }}>
              Copy tabel penawaran dari Microsoft Excel (pilih kolom Uraian, Kategori, Qty, Satuan, Harga Vendor, Harga Nego), lalu 
              <strong> Paste (Ctrl+V)</strong> ke kotak di bawah ini. Sistem akan mengisi database pengadaan secara otomatis!
            </p>

            <textarea
              rows={6}
              value={rawPastedText}
              onChange={(e) => setRawPastedText(e.target.value)}
              placeholder="Contoh format paste dari Excel:&#10;Sticky Notes 25lbr	Barang	7	Pack	15000	15000&#10;Jasa Cetak RM	Jasa	5	Rim	85000	80000"
              style={{ ...inp, fontFamily: 'monospace', fontSize: 11, marginBottom: 12 }}
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button className="btn pri" onClick={handleParseExcel}>
                <span className="ic s">sync</span> Process &amp; Parsing Text Excel
              </button>
              <button
                className="btn ghost"
                onClick={() =>
                  setRawPastedText(
                    `Kertas HVS A4 80gr\tBarang\t10\tRim\t55000\t52000\nJasa Servis AC Split\tJasa\t3\tUnit\t150000\t140000\nTinta Stempel Trodat\tBarang\t5\tBotol\t60000\t58000`
                  )
                }
              >
                Isi Data Simulasi Demo Excel
              </button>
            </div>

            {/* Parsed Preview Table */}
            {parsedExcelItems.length > 0 && (
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 16 }}>
                <h5 style={{ margin: '0 0 8px 0', fontSize: 12, color: '#10b981', fontWeight: 800 }}>
                  ✓ Berhasil Mengurai {parsedExcelItems.length} Item Penawaran:
                </h5>
                <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: 4 }}>Uraian</th>
                        <th style={{ padding: 4 }}>Tipe</th>
                        <th style={{ padding: 4 }}>Qty</th>
                        <th style={{ padding: 4, textAlign: 'right' }}>Harga Satuan</th>
                        <th style={{ padding: 4, textAlign: 'right' }}>Total Deal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedExcelItems.map((it, i) => (
                        <tr key={i} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                          <td style={{ padding: 4 }}>{it.uraian}</td>
                          <td style={{ padding: 4 }}>{it.kategori}</td>
                          <td style={{ padding: 4 }}>
                            {it.qty} {it.satuan}
                          </td>
                          <td style={{ padding: 4, textAlign: 'right' }}>{fmtRp(it.deal)}</td>
                          <td style={{ padding: 4, textAlign: 'right', fontWeight: 700 }}>{fmtRp(it.deal * it.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn ghost" onClick={() => setIsExcelModalOpen(false)}>
                Batal
              </button>
              <button
                className="btn"
                style={{ background: '#10b981', color: '#fff', fontWeight: 700 }}
                disabled={parsedExcelItems.length === 0}
                onClick={applyExcelItemsToPaket}
              >
                <span className="ic s">check</span> Masukkan ke Tabel Sistem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TAMBAH ROLE PENANDATANGAN BARU (REQUIREMENT 2) */}
      {/* =================================================================== */}
      {isAddRoleModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="card" style={{ width: '90%', maxWidth: 560, padding: 24, background: '#fff', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ic l" style={{ color: 'var(--blue)' }}>person_add</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Tambah Role Penandatangan Baru</h3>
              </div>
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--t3)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={lblSm}>Judul Role / Card (Misal: DATA PPK / DATA VERIFIKATOR)</label>
                <input
                  placeholder="Contoh: DATA PEJABAT PEMBUAT KOMITMEN (PPK)"
                  value={newRoleForm.title}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, title: e.target.value })}
                  style={inpSm}
                />
              </div>

              <div>
                <label style={lblSm}>Nama Lengkap &amp; Gelar Pejabat</label>
                <input
                  placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Si"
                  value={newRoleForm.nama}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, nama: e.target.value })}
                  style={inpSm}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lblSm}>NIP Pejabat</label>
                  <input
                    placeholder="19750101 200003 1 002"
                    value={newRoleForm.nip}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, nip: e.target.value })}
                    style={inpSm}
                  />
                </div>
                <div>
                  <label style={lblSm}>Jabatan Resmi</label>
                  <input
                    placeholder="Pejabat Pembuat Komitmen"
                    value={newRoleForm.jabatan}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, jabatan: e.target.value })}
                    style={inpSm}
                  />
                </div>
              </div>

              <div>
                <label style={lblSm}>Wewenang / Tipe Akses Role</label>
                <select
                  value={newRoleForm.aksesType}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, aksesType: e.target.value })}
                  style={{ ...inpSm, width: '100%' }}
                >
                  <option value="Penandatangan Utama & Approval Final">Penandatangan Utama & Approval Final</option>
                  <option value="Pejabat Pelaksana Teknis & Verifikator RAB">Pejabat Pelaksana Teknis & Verifikator RAB</option>
                  <option value="Verifikasi Pembayaran & Pencairan Keuangan">Verifikasi Pembayaran & Pencairan Keuangan</option>
                  <option value="Pemeriksaan Fisik Barang & BASTHP">Pemeriksaan Fisik Barang & BASTHP</option>
                  <option value="Melihat Realisasi Tok (Read-only Monitoring)">Melihat Realisasi Tok (Read-only Monitoring)</option>
                  <option value="Verifikator Dokumen SPJ & Arsip">Verifikator Dokumen SPJ & Arsip</option>
                </select>
              </div>

              {/* Interactive Process Permission Matrix for New Role */}
              <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Matriks Akses &amp; Keterlibatan Proses:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const fullM = {};
                        PROCESS_DEF.forEach(p => fullM[p.key] = { view: true, edit: true, ttd: true, approve: true });
                        setNewRoleForm({ ...newRoleForm, processMatrix: fullM, tugas: ['DPA', 'SPK', 'BAPP', 'BAST', 'BAP', 'Kwitansi', 'Realisasi'] });
                      }}
                      style={{ background: '#dbeafe', border: 'none', color: '#1e40af', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}
                    >
                      Full Akses
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const roM = {};
                        PROCESS_DEF.forEach(p => roM[p.key] = { view: true, edit: false, ttd: false, approve: false });
                        setNewRoleForm({ ...newRoleForm, processMatrix: roM, tugas: [] });
                      }}
                      style={{ background: '#f3e8ff', border: 'none', color: '#7e22ce', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}
                    >
                      View Tok
                    </button>
                  </div>
                </div>

                <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '4px', textAlign: 'left' }}>Proses / Dokumen</th>
                      <th style={{ padding: '4px' }}>View</th>
                      <th style={{ padding: '4px' }}>Edit</th>
                      <th style={{ padding: '4px' }}>TTD</th>
                      <th style={{ padding: '4px' }}>Approve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROCESS_DEF.map((proc) => {
                      const curMatrix = getSignerMatrix(newRoleForm);
                      const m = curMatrix[proc.key] || { view: true, edit: false, ttd: false, approve: false };
                      const toggle = (act) => {
                        const nextM = { ...curMatrix };
                        nextM[proc.key] = { ...m, [act]: !m[act] };
                        const nextTugas = PROCESS_DEF.filter(p => nextM[p.key]?.ttd || nextM[p.key]?.approve).map(p => p.key);
                        setNewRoleForm({ ...newRoleForm, processMatrix: nextM, tugas: nextTugas });
                      };
                      return (
                        <tr key={proc.key} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                          <td style={{ padding: '4px', textAlign: 'left', fontWeight: 700 }}>{proc.label}</td>
                          <td style={{ padding: '4px' }}><input type="checkbox" checked={m.view} onChange={() => toggle('view')} /></td>
                          <td style={{ padding: '4px' }}><input type="checkbox" checked={m.edit} onChange={() => toggle('edit')} /></td>
                          <td style={{ padding: '4px' }}><input type="checkbox" checked={m.ttd} onChange={() => toggle('ttd')} /></td>
                          <td style={{ padding: '4px' }}><input type="checkbox" checked={m.approve} onChange={() => toggle('approve')} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  onClick={() => setIsAddRoleModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleAddNewRole}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  + Simpan Role Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TAMBAH / EDIT VENDOR REKANAN (REQUIREMENT 1) */}
      {/* =================================================================== */}
      {isVendorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="card" style={{ width: '90%', maxWidth: 580, padding: 24, background: '#fff', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ic l" style={{ color: '#10b981' }}>storefront</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                  {editingVendorId ? 'Edit Data Vendor Rekanan' : 'Tambah Vendor Rekanan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--t3)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <div>
                  <label style={lblSm}>ID Vendor</label>
                  <input
                    value={vendorForm.id}
                    onChange={(e) => setVendorForm({ ...vendorForm, id: e.target.value })}
                    style={{ ...inpSm, fontWeight: 700, color: 'var(--blue)' }}
                  />
                </div>
                <div>
                  <label style={lblSm}>Nama Perusahaan / PT / CV *</label>
                  <input
                    placeholder="Contoh: PT. MEDIS NUSANTARA UTAMA"
                    value={vendorForm.nama}
                    onChange={(e) => setVendorForm({ ...vendorForm, nama: e.target.value })}
                    style={inpSm}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lblSm}>NPWP Perusahaan</label>
                  <input
                    placeholder="01.234.567.8-901.000"
                    value={vendorForm.npwp}
                    onChange={(e) => setVendorForm({ ...vendorForm, npwp: e.target.value })}
                    style={inpSm}
                  />
                </div>
                <div>
                  <label style={lblSm}>Direktur / Pimpinan</label>
                  <input
                    placeholder="Nama Pimpinan Vendor"
                    value={vendorForm.direktur}
                    onChange={(e) => setVendorForm({ ...vendorForm, direktur: e.target.value })}
                    style={inpSm}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                <div>
                  <label style={lblSm}>No. Rekening Bank</label>
                  <input
                    placeholder="1000-2938-4821"
                    value={vendorForm.norek}
                    onChange={(e) => setVendorForm({ ...vendorForm, norek: e.target.value })}
                    style={inpSm}
                  />
                </div>
                <div>
                  <label style={lblSm}>Nama Bank</label>
                  <input
                    placeholder="Bank Sulselbar / Mandiri / BCA"
                    value={vendorForm.bank}
                    onChange={(e) => setVendorForm({ ...vendorForm, bank: e.target.value })}
                    style={inpSm}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lblSm}>Kontak Telepon / WA</label>
                  <input
                    placeholder="0812-4112-9988"
                    value={vendorForm.telp}
                    onChange={(e) => setVendorForm({ ...vendorForm, telp: e.target.value })}
                    style={inpSm}
                  />
                </div>
                <div>
                  <label style={lblSm}>Alamat Perusahaan</label>
                  <input
                    placeholder="Jl. Urip Sumohardjo No. 45, Makassar"
                    value={vendorForm.alamat}
                    onChange={(e) => setVendorForm({ ...vendorForm, alamat: e.target.value })}
                    style={inpSm}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  onClick={() => setIsVendorModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveVendor}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingVendorId ? 'Simpan Perubahan' : '+ Simpan Vendor Baru'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CUSTOM POPUP KONFIRMASI HAPUS MASTER DATA */}
      {/* =================================================================== */}
      {deleteModalState.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.70)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: 480,
              padding: 24,
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #fee2e2',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Warning Icon Badge */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '2px solid #fca5a5',
              }}
            >
              <span className="ic l" style={{ fontSize: 32 }}>warning</span>
            </div>

            <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 800, color: '#991b1b' }}>
              Konfirmasi Hapus Data Master
            </h3>

            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus data ini dari sistem?
            </p>

            {/* Item Card Highlight */}
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: 14, textAlign: 'left', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', marginBottom: 2 }}>
                {deleteModalState.type === 'signer' ? 'Role Penandatangan' : 'Vendor Rekanan'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#881337' }}>
                {deleteModalState.title}
              </div>
              {deleteModalState.subtitle && (
                <div style={{ fontSize: 12, color: '#9f1239', marginTop: 2, fontWeight: 600 }}>
                  {deleteModalState.subtitle}
                </div>
              )}
              {deleteModalState.detail && (
                <div style={{ fontSize: 11, color: '#be123c', marginTop: 4 }}>
                  {deleteModalState.detail}
                </div>
              )}
            </div>

            <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginBottom: 20 }}>
              ⚠️ Tindakan ini tidak dapat dibatalkan. Data yang terhapus tidak dapat dikembalikan.
            </div>

            {/* Modal Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, type: null, id: null, title: '', subtitle: '', detail: '' })}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Batal (Simpan)
              </button>
              <button
                type="button"
                onClick={confirmExecuteDelete}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span className="ic s">delete_forever</span> Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =================================================================== */}
      {/* MODAL: TAMBAH KODE REKENING BARU (MANUAL GENERATION & PERSISTENCE) */}
      {/* =================================================================== */}
      {isAddAccountModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="card" style={{ width: '90%', maxWidth: 520, padding: 24, background: '#fff', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ic l" style={{ color: 'var(--blue)' }}>account_balance_wallet</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Tambah Kode Rekening Manual Baru</h3>
              </div>
              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--t3)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={lblSm}>Kode Rekening (Format: 5.1.02.xx.xx.xxxx)</label>
                <input
                  placeholder="Contoh: 5.1.02.01.01.0026"
                  value={newAccountForm.kode}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, kode: e.target.value })}
                  style={{ ...inpSm, fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={lblSm}>Uraian Nama Rekening / Belanja</label>
                <input
                  placeholder="Contoh: Belanja Alat Tulis Kantor dan Perlengkapan Medis"
                  value={newAccountForm.uraian}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, uraian: e.target.value })}
                  style={inpSm}
                />
              </div>

              <div>
                <label style={lblSm}>Nama Sub Kegiatan</label>
                <input
                  placeholder="Contoh: Pelayanan dan Penunjang Pelayanan BLUD"
                  value={newAccountForm.subKegiatan}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, subKegiatan: e.target.value })}
                  style={inpSm}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  onClick={() => setIsAddAccountModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCustomAccount}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  + Simpan ke Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TAMBAH LAMPIRAN DOKUMEN EKSTERNAL (KTP, NPWP, REKENING, DLL) */}
      {/* =================================================================== */}
      {isAddAttachmentModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="card" style={{ width: '90%', maxWidth: 540, padding: 24, background: '#fff', borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ic l" style={{ color: '#10b981' }}>attachment</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Unggah Lampiran Dokumen Eksternal</h3>
              </div>
              <button
                onClick={() => setIsAddAttachmentModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--t3)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={lblSm}>Kategori Lampiran</label>
                <select
                  value={newAttachmentForm.kategori}
                  onChange={(e) => setNewAttachmentForm({ ...newAttachmentForm, kategori: e.target.value })}
                  style={{ ...inpSm, width: '100%' }}
                >
                  <option value="Identitas Vendor">Identitas Vendor (KTP Direktur / NPWP)</option>
                  <option value="Perbankan">Buku Rekening Bank Rekanan</option>
                  <option value="Dokumen Penawaran">Dokumen Asli Penawaran / Nego</option>
                  <option value="Fisik Barang">Foto Dokumentasi Fisik Barang Tiba di Gudang</option>
                  <option value="Perpajakan">Faktur Pajak / E-Billing</option>
                  <option value="Lainnya">Dokumen Pendukung Lainnya</option>
                </select>
              </div>

              <div>
                <label style={lblSm}>Nama / Judul Dokumen Lampiran *</label>
                <input
                  placeholder="Contoh: Scan KTP Asli Direktur CV. BARA UTAMA PERSADA"
                  value={newAttachmentForm.nama}
                  onChange={(e) => setNewAttachmentForm({ ...newAttachmentForm, nama: e.target.value })}
                  style={inpSm}
                />
              </div>

              <div>
                <label style={lblSm}>Catatan / Keterangan Dokumen</label>
                <input
                  placeholder="Contoh: Terlampir tanda tangan dan stempel basah direktur"
                  value={newAttachmentForm.catatan}
                  onChange={(e) => setNewAttachmentForm({ ...newAttachmentForm, catatan: e.target.value })}
                  style={inpSm}
                />
              </div>

              <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <span className="ic m" style={{ color: 'var(--t3)' }}>cloud_upload</span>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>Pilih Berkas PDF / JPG / PNG dari Komputer</div>
                <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>Maksimum ukuran file: 10 MB</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  onClick={() => setIsAddAttachmentModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--line)', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleAddExternalAttachment}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  + Simpan Lampiran Dokumen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =================================================================== */}
      {/* EXPORT LAPORAN SIAP AUDIT BPKAD & INSPEKTORAT MODAL */}
      {/* =================================================================== */}
      {isExportBpkadModalOpen && (() => {
        // Report Generation Functions
        const getReportData = () => {
          if (exportReportType === 'rba_realisasi') {
            const rows = rbaItems.map((it, idx) => {
              const pagu = rbaActiveVersion === 'perubahan' ? it.paguPerubahan : it.paguPokok;
              const matchingPakets = pakets.filter(p => p.kodeRekening === it.kodeRekening && p.stage === 7);
              const realisasi = matchingPakets.reduce((s, p) => s + calcDeal(p.items), 0) + (it.terpakai || 0);
              const sisa = Math.max(0, pagu - realisasi);
              const pct = pagu > 0 ? ((realisasi / pagu) * 100).toFixed(2) : '0.00';
              const status = Number(pct) >= 100 ? 'Habis (100%)' : Number(pct) >= 80 ? 'Kritis (>80%)' : 'Aman';
              return {
                no: idx + 1,
                kode: it.kodeRekening,
                uraian: it.uraian,
                paguPokok: it.paguPokok,
                paguPerubahan: it.paguPerubahan,
                realisasi,
                sisa,
                pct,
                status,
              };
            });
            const totalPokok = rbaItems.reduce((s, i) => s + i.paguPokok, 0);
            const totalPerubahan = rbaItems.reduce((s, i) => s + i.paguPerubahan, 0);
            const totalRealisasi = rows.reduce((s, r) => s + r.realisasi, 0);
            const totalSisa = Math.max(0, (rbaActiveVersion === 'perubahan' ? totalPerubahan : totalPokok) - totalRealisasi);
            const totalPct = totalPokok > 0 ? ((totalRealisasi / (rbaActiveVersion === 'perubahan' ? totalPerubahan : totalPokok)) * 100).toFixed(2) : '0.00';
            return {
              title: 'LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA (RBA) BLUD T.A. 2026',
              filename: 'LAPORAN_REALISASI_RBA_BPKAD_2026.csv',
              columns: ['No', 'Kode Rekening', 'Uraian Akun Belanja', 'Pagu Pokok (Rp)', 'Pagu Perubahan (Rp)', 'Realisasi Serapan (Rp)', 'Sisa Pagu (Rp)', '% Serapan', 'Status'],
              rows,
              total: { pokok: totalPokok, perubahan: totalPerubahan, realisasi: totalRealisasi, sisa: totalSisa, pct: totalPct }
            };
          }

          if (exportReportType === 'register_spj') {
            const rows = pakets.map((p, idx) => {
              const totalDeal = calcDeal(p.items);
              const tax = calcTaxDetails(totalDeal, p.taxScheme || 'ppn_pph22', p.hasNpwp !== false, p.isHargaIncludePpn !== false);
              const st = stageOf(p.stage);
              return {
                no: idx + 1,
                id: p.id,
                nama: p.namaPaket,
                kategori: p.kategori || 'Barang',
                kode: p.kodeRekening,
                penyedia: p.penyedia,
                noDP: p.noDP || '-',
                tglDP: p.tglDP || '-',
                noBAPP: p.noBAPP || '-',
                tglBAPP: p.tglBAPP || '-',
                noBASTHP: p.noBASTHP || '-',
                noBAP: p.noBAP || '-',
                tglBAP: p.tglBAP || '-',
                noKuitansi: p.noKuitansi || '-',
                bruto: totalDeal,
                dpp: tax.dpp,
                ppn: tax.ppn,
                pph: tax.totalPph,
                netto: tax.netto,
                status: `Tahap ${p.stage}: ${st.label}`,
              };
            });
            return {
              title: 'REGISTER SURAT PERTANGGUNGJAWABAN (SPJ) PENGADAAN BARANG & JASA BLUD T.A. 2026',
              filename: 'REGISTER_SPJ_PENGADAAN_BLUD_2026.csv',
              columns: ['No', 'ID Paket', 'Nama Paket Pengadaan', 'Kategori', 'Kode Rekening', 'Penyedia / Rekanan', 'No. DP', 'Tgl DP', 'No. BAPP', 'Tgl BAPP', 'No. BASTHP', 'No. BAP', 'Tgl BAP', 'No. Kwitansi', 'Nilai Bruto (Rp)', 'DPP (Rp)', 'PPN 11% (Rp)', 'PPh (Rp)', 'Netto Cair (Rp)', 'Status SPJ'],
              rows,
            };
          }

          if (exportReportType === 'rekap_pajak') {
            const rows = pakets.map((p, idx) => {
              const totalDeal = calcDeal(p.items);
              const tax = calcTaxDetails(totalDeal, p.taxScheme || 'ppn_pph22', p.hasNpwp !== false, p.isHargaIncludePpn !== false);
              return {
                no: idx + 1,
                id: p.id,
                nama: p.namaPaket,
                penyedia: p.penyedia,
                npwp: '71.234.567.8-804.000',
                noFaktur: p.noFakturPajak || '026.001-26.98402912',
                kodeBilling: p.kodeBillingPajak || '8291 0482 1920',
                tglSetor: p.tglFakturPajak || p.tglBAP || '09 Maret 2026',
                skema: tax.skemaLabel,
                bruto: totalDeal,
                dpp: tax.dpp,
                ppn: tax.ppn,
                pph: tax.totalPph,
                totalPajak: tax.totalPajak,
                netto: tax.netto,
                status: p.stage === 7 ? 'Sudah Disetor & Valid' : 'Menunggu Cair',
              };
            });
            return {
              title: 'REKAPITULASI PEMOTONGAN DAN PENYETORAN PAJAK BELANJA BLUD (PPN & PPH) T.A. 2026',
              filename: 'REKAP_PAJAK_BLUD_EBILLING_2026.csv',
              columns: ['No', 'ID Paket', 'Nama Paket Pengadaan', 'Nama Rekanan', 'NPWP Rekanan', 'No. Faktur Pajak', 'Kode Billing DJP', 'Tgl Setor', 'Skema Pajak', 'Bruto (Rp)', 'DPP (Rp)', 'PPN 11% (Rp)', 'PPh 22/23 (Rp)', 'Total Pajak (Rp)', 'Netto (Rp)', 'Status Setor'],
              rows,
            };
          }

          // audit_fisik
          const rows = [];
          let rNo = 1;
          pakets.forEach((p) => {
            (p.items || []).forEach((it, itemIdx) => {
              const qtyReal = it.realisasiQty !== undefined ? it.realisasiQty : it.qty;
              const totalReal = (it.deal || it.hargaRAB || 0) * qtyReal;
              const hasil = it.realisasiCheck === 'invalid' ? 'RUSAK / DITOLAK' : 'BAIK (SESUAI)';
              rows.push({
                no: rNo++,
                id: p.id,
                nama: p.namaPaket,
                noBAPP: p.noBAPP || '-',
                tglBAPP: p.tglBAPP || '-',
                itemIdx: itemIdx + 1,
                uraian: it.uraian,
                kategori: it.kategori || 'Barang',
                satuan: it.satuan,
                qtyPesanan: it.qty,
                qtyReal,
                harga: it.deal || it.hargaRAB || 0,
                totalReal,
                hasil,
                catatan: it.catatanPemeriksa || '-',
              });
            });
          });
          return {
            title: 'LAPORAN AUDIT FISIK BARANG DAN REKONSILIASI GUDANG (BAPP) BLUD T.A. 2026',
            filename: 'AUDIT_FISIK_BARANG_BAPP_2026.csv',
            columns: ['No', 'ID Paket', 'Nama Paket', 'No. BAPP', 'Tgl Pemeriksaan', 'No Item', 'Uraian Barang/Jasa', 'Kategori', 'Satuan', 'Vol Pesanan', 'Vol Realisasi', 'Harga Satuan (Rp)', 'Total Realisasi (Rp)', 'Hasil Cek Fisik', 'Catatan Lapangan'],
            rows,
          };
        };

        const currentReport = getReportData();

        // Convert current report to CSV format with proper quoting & UTF-8 BOM
        const generateCSVString = () => {
          const lines = [
            `"${currentReport.title}"`,
            `"PUSKESMAS TAMALANREA - DINAS KESEHATAN KOTA MAKASSAR"`,
            `"Tanggal Cetak: ${today()}"`,
            `""`,
            currentReport.columns.map(c => `"${c}"`).join(','),
          ];

          if (exportReportType === 'rba_realisasi') {
            currentReport.rows.forEach(r => {
              lines.push([
                r.no,
                `"${r.kode}"`,
                `"${r.uraian.replace(/"/g, '""')}"`,
                r.paguPokok,
                r.paguPerubahan,
                r.realisasi,
                r.sisa,
                `"${r.pct}%"`,
                `"${r.status}"`
              ].join(','));
            });
            if (currentReport.total) {
              lines.push([
                '""',
                '"TOTAL KESELURUHAN"',
                '""',
                currentReport.total.pokok,
                currentReport.total.perubahan,
                currentReport.total.realisasi,
                currentReport.total.sisa,
                `"${currentReport.total.pct}%"`,
                '""'
              ].join(','));
            }
          } else if (exportReportType === 'register_spj') {
            currentReport.rows.forEach(r => {
              lines.push([
                r.no,
                `"${r.id}"`,
                `"${r.nama.replace(/"/g, '""')}"`,
                `"${r.kategori}"`,
                `"${r.kode}"`,
                `"${r.penyedia}"`,
                `"${r.noDP}"`,
                `"${r.tglDP}"`,
                `"${r.noBAPP}"`,
                `"${r.tglBAPP}"`,
                `"${r.noBASTHP}"`,
                `"${r.noBAP}"`,
                `"${r.tglBAP}"`,
                `"${r.noKuitansi}"`,
                r.bruto,
                r.dpp,
                r.ppn,
                r.pph,
                r.netto,
                `"${r.status}"`
              ].join(','));
            });
          } else if (exportReportType === 'rekap_pajak') {
            currentReport.rows.forEach(r => {
              lines.push([
                r.no,
                `"${r.id}"`,
                `"${r.nama.replace(/"/g, '""')}"`,
                `"${r.penyedia}"`,
                `"${r.npwp}"`,
                `"${r.noFaktur}"`,
                `"${r.kodeBilling}"`,
                `"${r.tglSetor}"`,
                `"${r.skema}"`,
                r.bruto,
                r.dpp,
                r.ppn,
                r.pph,
                r.totalPajak,
                r.netto,
                `"${r.status}"`
              ].join(','));
            });
          } else if (exportReportType === 'audit_fisik') {
            currentReport.rows.forEach(r => {
              lines.push([
                r.no,
                `"${r.id}"`,
                `"${r.nama.replace(/"/g, '""')}"`,
                `"${r.noBAPP}"`,
                `"${r.tglBAPP}"`,
                r.itemIdx,
                `"${r.uraian.replace(/"/g, '""')}"`,
                `"${r.kategori}"`,
                `"${r.satuan}"`,
                r.qtyPesanan,
                r.qtyReal,
                r.harga,
                r.totalReal,
                `"${r.hasil}"`,
                `"${r.catatan.replace(/"/g, '""')}"`
              ].join(','));
            });
          }

          return lines.join('\n');
        };

        const handleDownload = () => {
          const csvText = generateCSVString();
          const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', currentReport.filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setExportSuccessMsg(`✓ Berkas "${currentReport.filename}" berhasil diunduh! Siap dibuka di Microsoft Excel.`);
          setTimeout(() => setExportSuccessMsg(''), 6000);
        };

        const handleCopyClipboard = () => {
          const csvText = generateCSVString();
          navigator.clipboard.writeText(csvText).then(() => {
            setExportSuccessMsg(`✓ Data "${currentReport.title}" berhasil disalin ke clipboard! Langsung paste (Ctrl+V / Cmd+V) di Excel / Google Sheets.`);
            setTimeout(() => setExportSuccessMsg(''), 6000);
          });
        };

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 20,
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                width: '100%',
                maxWidth: 1100,
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                border: '1px solid #cbd5e1',
              }}
            >
              {/* Modal Top Header */}
              <div style={{ padding: '16px 24px', background: '#1e3a8a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="ic l" style={{ color: '#6ee7b7', fontSize: 24 }}>table_chart</span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: '0.3px' }}>
                      Export Laporan Realisasi &amp; SPJ Siap Audit BPKAD / Inspektorat
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#93c5fd' }}>
                      Puskesmas Tamalanrea — Format Standar Microsoft Excel (.xlsx / .csv UTF-8) T.A. 2026
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExportBpkadModalOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 20, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              {/* 4 Report Selector Tabs */}
              <div style={{ display: 'flex', gap: 6, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
                {[
                  { id: 'rba_realisasi', label: '1. Rekap Pagu RBA', desc: '8 Rekening Belanja', icon: 'account_balance' },
                  { id: 'register_spj', label: '2. Register 7 Berkas SPJ', desc: 'Nego s/d Kwitansi', icon: 'receipt' },
                  { id: 'rekap_pajak', label: '3. Rekap Pajak & Billing', desc: 'PPN, PPh 22/23 & DJP', icon: 'receipt_long' },
                  { id: 'audit_fisik', label: '4. Audit Fisik BAPP', desc: 'Realisasi Volume Gudang', icon: 'inventory_2' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setExportReportType(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: exportReportType === t.id ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: exportReportType === t.id ? '#eff6ff' : '#fff',
                      color: exportReportType === t.id ? '#1e40af' : 'var(--t1)',
                      cursor: 'pointer',
                      fontSize: 11.5,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      boxShadow: exportReportType === t.id ? '0 2px 6px rgba(37, 99, 235, 0.15)' : 'none',
                    }}
                  >
                    <span className="ic s" style={{ color: exportReportType === t.id ? '#2563eb' : 'var(--t3)' }}>{t.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div>{t.label}</div>
                      <div style={{ fontSize: 9.5, opacity: 0.75, fontWeight: 500 }}>{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Notification Banner */}
              {exportSuccessMsg && (
                <div style={{ background: '#f0fdf4', borderBottom: '1px solid #86efac', padding: '8px 20px', color: '#166534', fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="ic s" style={{ color: '#10b981' }}>check_circle</span>
                  {exportSuccessMsg}
                </div>
              )}

              {/* Interactive Live Data Preview Table */}
              <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>{currentReport.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>Pratinjau Data Riil ({currentReport.rows.length} Baris Data Terkini)</div>
                  </div>
                  <div style={{ fontSize: 11, background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, color: '#475569', fontWeight: 700 }}>
                    File Output: <code>{currentReport.filename}</code>
                  </div>
                </div>

                <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto', maxHeight: '42vh' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr style={{ background: '#1e3a8a', color: '#fff' }}>
                          {currentReport.columns.map((col, idx) => (
                            <th key={idx} style={{ padding: '8px 10px', fontWeight: 800, whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {exportReportType === 'rba_realisasi' && currentReport.rows.map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>{r.no}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 700 }}>{r.kode}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 600 }}>{r.uraian}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmtRp(r.paguPokok)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmtRp(r.paguPerubahan)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{fmtRp(r.realisasi)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#166534' }}>{fmtRp(r.sisa)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800 }}>{r.pct}%</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: r.status.includes('100%') ? '#fee2e2' : '#dcfce7', color: r.status.includes('100%') ? '#991b1b' : '#166534', fontWeight: 700 }}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {exportReportType === 'register_spj' && currentReport.rows.map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>{r.no}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 700 }}>{r.id}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 700 }}>{r.nama}</td>
                            <td style={{ padding: '6px 10px' }}>{r.kategori}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace' }}>{r.kode}</td>
                            <td style={{ padding: '6px 10px' }}>{r.penyedia}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.noDP}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.tglDP}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.noBAPP}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.tglBAPP}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.noBASTHP}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.noBAP}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.tglBAP}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.noKuitansi}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800 }}>{fmtRp(r.bruto)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmtRp(r.dpp)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', color: '#b45309' }}>{fmtRp(r.ppn)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', color: '#dc2626' }}>{fmtRp(r.pph)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 900, color: '#166534' }}>{fmtRp(r.netto)}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 700, color: '#1d4ed8' }}>{r.status}</td>
                          </tr>
                        ))}

                        {exportReportType === 'rekap_pajak' && currentReport.rows.map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>{r.no}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 700 }}>{r.id}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 700 }}>{r.nama}</td>
                            <td style={{ padding: '6px 10px' }}>{r.penyedia}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace' }}>{r.npwp}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: 10 }}>{r.noFaktur}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 700 }}>{r.kodeBilling}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.tglSetor}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.skema}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmtRp(r.bruto)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmtRp(r.dpp)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', color: '#b45309' }}>{fmtRp(r.ppn)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', color: '#dc2626' }}>{fmtRp(r.pph)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 900, color: '#dc2626' }}>{fmtRp(r.totalPajak)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 900, color: '#166534' }}>{fmtRp(r.netto)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#dcfce7', color: '#166534', fontWeight: 700 }}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {exportReportType === 'audit_fisik' && currentReport.rows.map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>{r.no}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace' }}>{r.id}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 700 }}>{r.nama}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.noBAPP}</td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.tglBAPP}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>{r.itemIdx}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 600 }}>{r.uraian}</td>
                            <td style={{ padding: '6px 10px' }}>{r.kategori}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>{r.satuan}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>{r.qtyPesanan}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>{r.qtyReal}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmtRp(r.harga)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800 }}>{fmtRp(r.totalReal)}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800, color: r.hasil.includes('RUSAK') ? '#ef4444' : '#166534' }}>
                              {r.hasil}
                            </td>
                            <td style={{ padding: '6px 10px', fontSize: 10 }}>{r.catatan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Bottom Actions Bar */}
              <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--t3)' }}>
                  <span className="ic s" style={{ color: '#10b981' }}>verified</span>
                  Format kompatibel dengan Microsoft Excel, Google Sheets, dan Portal SIPD BPKAD.
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleCopyClipboard}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: 'var(--t1)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <span className="ic s">content_copy</span> Salin Data (Clipboard)
                  </button>

                  <button
                    onClick={handleDownload}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <span className="ic s" style={{ fontSize: 18 }}>download</span>
                    📥 Unduh Berkas Excel (.csv UTF-8)
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
