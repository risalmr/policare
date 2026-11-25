import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 *  PromotionScreen.jsx — Omnichannel Health Marketing & Content Co-Creation Hub
 *  Pilar 2: Patient Relationship & Engagement (Promosi vs Edukasi Terpisah)
 *
 *  Fitur Utama:
 *  1. Pemisahan Tegas Section Edukasi & Informasi Medis vs Promosi & Layanan Komersial
 *  2. Strategic Content Intelligence (Insight SOP/Medis vs Peluang Pasar/Promo)
 *  3. Human-AI Co-Creation Studio dengan Mode Khusus (Edukasi vs Promosi)
 *  4. Content Calendar & Omnichannel Planner dengan Kategori Terpisah
 *  5. Performance Analytics: Literasi & Edukasi Pasien vs ROI Booking Promosi
 * ─────────────────────────────────────────────────────────────────────────────*/

export default function PromotionScreen({ active, accessLevel = 'ADMIN' }) {
  const isReadOnly = accessLevel === 'VIEWER';
  const [activeTab, setActiveTab] = useState('intelligence'); // 'intelligence' | 'studio' | 'calendar' | 'analytics'
  const [sectionFilter, setSectionFilter] = useState('ALL'); // 'ALL' | 'EDUCATION' | 'PROMOTION'

  // Insight Sources State (Separated into 'education' vs 'promotion')
  const [insights, setInsights] = useState([
    {
      id: 1,
      categoryType: 'promotion', // 'education' | 'promotion'
      categoryLabel: 'Promosi Layanan',
      source: 'Intelijen Pasar',
      sourceColor: '#8b5cf6',
      sourceIcon: 'trending_up',
      topic: 'Promo Paket USG 4D Fetomaternal & Skrining Kelainan Genetik',
      description: 'Pencarian kata kunci USG 4D di area Makassar Selatan naik 38% bulan ini. Rekomendasi peluncuran promo bundling konsultasi dokter spesialis gratis trimester 2.',
      targetChannel: 'Instagram Carousel & TikTok Video',
      recommendedCTA: 'Booking Paket USG 4D via WhatsApp & Dapatkan Cetak Foto 4D HD Gratis',
      urgency: 'Tinggi',
      status: 'Rekomendasi AI'
    },
    {
      id: 2,
      categoryType: 'education',
      categoryLabel: 'Edukasi Medis',
      source: 'SOP & Update Klinis',
      sourceColor: '#10b981',
      sourceIcon: 'fact_check',
      topic: 'Edukasi Metode Persalinan Tanpa Rasa Nyeri (ILA / Intrathecal Labor Analgesia)',
      description: 'Pembaruan SOP Klinis #SOP-OBGYN-04 memungkinkan persalinan nyaman minim rasa sakit. Edukasi murni tanpa klaim berlebihan untuk menghilangkan kecemasan persalinan calon ibu.',
      targetChannel: 'Website Blog & YouTube Shorts',
      recommendedCTA: 'Konsultasi Perencanaan Persalinan ILA dengan Dokter Spesialis Obgyn',
      urgency: 'Sedang',
      status: 'Rekomendasi AI'
    },
    {
      id: 3,
      categoryType: 'education',
      categoryLabel: 'Informasi & SOP Layanan',
      source: 'Radar Layanan & SKM',
      sourceColor: '#0284c7',
      sourceIcon: 'info',
      topic: 'Panduan Alur Layanan Antar Obat Hantar Ke Rumah (Farmasi Express)',
      description: 'Hasil survey SKM menunjukkan pasien membutuhkan kejelasan alur pengiriman resep ke rumah. Edukasi langkah-langkah verifikasi resep dan waktu pengantaran aman.',
      targetChannel: 'WhatsApp Info Blast & Digital Signage Lobi RS',
      recommendedCTA: 'Pelajari Panduan Lengkap Layanan Antar Obat di Aplikasi / Website',
      urgency: 'Sangat Tinggi',
      status: 'Rekomendasi AI'
    },
    {
      id: 4,
      categoryType: 'education',
      categoryLabel: 'Edukasi Medis',
      source: 'Gizi & Tumbuh Kembang Anak',
      sourceColor: '#10b981',
      sourceIcon: 'child_care',
      topic: 'Panduan Praktis Menu MPASI Seimbang untuk Mencegah Stunting Usia 6-12 Bulan',
      description: 'Literasi kesehatan publik mengenai kecukupan protein hewani pada 1000 Hari Pertama Kehidupan (HPK). Konten edukasi berbasis rekomendasi IDAI.',
      targetChannel: 'Instagram Feed & Booklet Digital',
      recommendedCTA: 'Unduh E-Book Panduan MPASI Gratis RSUD Daya',
      urgency: 'Tinggi',
      status: 'Rekomendasi AI'
    },
    {
      id: 5,
      categoryType: 'promotion',
      categoryLabel: 'Promosi Layanan',
      source: 'Loyalty & Program RS',
      sourceColor: '#ea580c',
      sourceIcon: 'redeem',
      topic: 'Program Diskon Medical Check-Up (MCU) Pra-Nikah & Paket Fertilitas Pasutri',
      description: 'Pemberian reward poin ganda + diskon 15% untuk calon pengantin yang mendaftar paket skrining TORCH dan laboratorium fertilitas di bulan ini.',
      targetChannel: 'Instagram Ads & WhatsApp Broadcast',
      recommendedCTA: 'Daftar Paket MCU Pra-Nikah Spesial & Klaim +200 Poin Loyalitas',
      urgency: 'Sedang',
      status: 'Rekomendasi AI'
    }
  ]);

  // Human-AI Co-Creation Studio State
  const [selectedInsightForBrief, setSelectedInsightForBrief] = useState(null);
  const [contentCategory, setContentCategory] = useState('education'); // 'education' | 'promotion'
  const [contentType, setContentType] = useState('instagram'); // 'instagram' | 'tiktok' | 'whatsapp' | 'blog'
  const [contentPrompt, setContentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [doctorApproval, setDoctorApproval] = useState(false);
  const [marketingApproval, setMarketingApproval] = useState(false);

  // Content Kanban / Calendar State
  const [campaigns, setCampaigns] = useState([
    {
      id: 101,
      categoryType: 'education',
      title: 'Tips Bebas Nyeri Persalinan Metode ILA',
      channel: 'Instagram Carousel',
      channelIcon: 'photo_camera',
      channelColor: '#e1306c',
      source: 'SOP Klinis #SOP-OBGYN-04',
      status: 'Live',
      scheduledDate: '28 Mei 2026',
      reach: '42.8K Pembaca',
      visits: '1.420 Baca SOP',
      conversions: 'Literasi Medis (96% Paham)',
      doctorValidator: 'dr. Ahmad Asy’ari, Sp.OG (Verified ✓)'
    },
    {
      id: 102,
      categoryType: 'education',
      title: 'Panduan Mencegah Stunting Sejak Trimester Pertama',
      channel: 'TikTok Video',
      channelIcon: 'videocam',
      channelColor: '#000000',
      source: 'Intelijen Pasar & Gizi RS',
      status: 'Scheduled',
      scheduledDate: '30 Mei 2026',
      reach: 'Est 60K Tayangan',
      visits: '-',
      conversions: 'Edukasi Publik',
      doctorValidator: 'dr. Ratna Kusuma, Sp.A (Verified ✓)'
    },
    {
      id: 103,
      categoryType: 'education',
      title: 'Alur & Panduan Layanan Obat Diantar ke Rumah',
      channel: 'WhatsApp Blast & Banner Web',
      channelIcon: 'chat',
      channelColor: '#25d366',
      source: 'SKM Radar Layanan #U3',
      status: 'Pending Validation',
      scheduledDate: '01 Juni 2026',
      reach: 'Target 12K Pasien',
      visits: '-',
      conversions: 'Informasi Layanan',
      doctorValidator: 'Apoteker Hendra, S.Farm, Apt'
    },
    {
      id: 104,
      categoryType: 'promotion',
      title: 'Promo Paket USG 4D Fetomaternal Kebahagiaan Bunda',
      channel: 'Instagram Reel & Website',
      channelIcon: 'movie',
      channelColor: '#e1306c',
      source: 'Intelijen Pasar',
      status: 'Live',
      scheduledDate: '25 Mei 2026',
      reach: '38.4K Tayangan',
      visits: '2.100 Klik',
      conversions: '142 Booking Poli',
      doctorValidator: 'dr. Ratna Kusuma, Sp.A (Verified ✓)'
    },
    {
      id: 105,
      categoryType: 'promotion',
      title: 'Promo Diskon 15% MCU Pra-Nikah & Paket Fertilitas',
      channel: 'WhatsApp Broadcast & Ads',
      channelIcon: 'chat',
      channelColor: '#25d366',
      source: 'Loyalty & Program RS',
      status: 'Draft',
      scheduledDate: 'Draft Baru',
      reach: '-',
      visits: '-',
      conversions: 'Est 80 Pasutri',
      doctorValidator: 'Menunggu Review Medis'
    }
  ]);

  if (!active) return null;

  // Filtered insights based on section filter
  const filteredInsights = insights.filter(ins => {
    if (sectionFilter === 'ALL') return true;
    if (sectionFilter === 'EDUCATION') return ins.categoryType === 'education';
    if (sectionFilter === 'PROMOTION') return ins.categoryType === 'promotion';
    return true;
  });

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(c => {
    if (sectionFilter === 'ALL') return true;
    if (sectionFilter === 'EDUCATION') return c.categoryType === 'education';
    if (sectionFilter === 'PROMOTION') return c.categoryType === 'promotion';
    return true;
  });

  // Trigger AI Content Co-Creation from Insight
  const handleStartBrief = (ins) => {
    setSelectedInsightForBrief(ins);
    setContentCategory(ins.categoryType);
    if (ins.categoryType === 'education') {
      setContentPrompt(`Buat materi EDUKASI KESEHATAN & INFORMASI MEDIS mengenai "${ins.topic}". Latar belakang: ${ins.description}. Tekankan penjelasan medis yang mudah dipahami, akurat, dan tanpa klaim komersial berlebihan. Sertakan ajakan edukatif: "${ins.recommendedCTA}".`);
    } else {
      setContentPrompt(`Buat materi PROMOSI LAYANAN & PENAWARAN RS mengenai "${ins.topic}". Latar belakang: ${ins.description}. Sertakan Call to Action konversi booking: "${ins.recommendedCTA}".`);
    }
    setActiveTab('studio');
  };

  // Run AI Generation
  const handleGenerateContent = (e) => {
    e.preventDefault();
    if (!contentPrompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      let draft;
      if (contentCategory === 'education') {
        draft = {
          categoryType: 'education',
          title: selectedInsightForBrief ? selectedInsightForBrief.topic : 'Edukasi Kesehatan & Literasi Pasien RSUD Daya',
          channel: contentType === 'instagram' ? 'Instagram Carousel & Infografis Edukasi' : contentType === 'tiktok' ? 'TikTok & Reels Edukasi Dokter' : contentType === 'whatsapp' ? 'WhatsApp Info Kesehatan Resmi' : 'Artikel Medis Website RS',
          caption: `📚 LITERASI KESEHATAN: ${selectedInsightForBrief ? selectedInsightForBrief.topic : 'Informasi Medis Terpercaya'} 📚\n\nKesehatan keluarga Anda berawal dari pemahaman yang tepat. Tim Dokter Spesialis RSUD Daya merangkum fakta penting yang perlu Anda ketahui:\n\n🔍 FAKTA & PANDUAN KLINIS:\n• Penjelasan dokter mengenai gejala dan pencegahan dini\n• Rekomendasi nutrisi & pola hidup sehat berbasis pedoman medis\n• Kapan waktu yang tepat untuk berkonsultasi ke fasilitas kesehatan\n\n💡 Selalu konsultasikan kesehatan Anda dengan dokter spesialis terpercaya.\n\n📖 Baca artikel kesehatan lengkap di portal edukasi RSUD Daya.`,
          scriptVideo: contentType === 'tiktok' ? '🩺 VIDEO EDUKASI DOKTER (45 Detik):\n[00:00-00:05] HOOK DOKTER: "Bunda, tahu tidak tanda awal kekurangan zat besi pada bayi?"\n[00:05-00:30] PENJELASAN MEDIS: Dokter Spesialis Anak memaparkan 3 panduan penting dengan infografis pendukung.\n[00:30-00:45] CLOSING: "Kesehatan si kecil adalah investasi masa depan. Simpan video ini dan bagikan ke ibu lainnya!"' : null,
          hashtag: '#EdukasiKesehatan #LiterasiMedis #RSUDDayaMakassar #DokterSpesialis #KesehatanIbuAnak #InfoKesehatan',
          visualPrompt: 'Infografis medis dengan warna biru-teal bersih, diagram anatomi sederhana yang ramah pasien, dan foto dokter ramah dengan stetoskop.',
          targetAudience: 'Masyarakat Umum, Ibu Hamil & Menyusui, Pasien Rawat Jalan'
        };
      } else {
        draft = {
          categoryType: 'promotion',
          title: selectedInsightForBrief ? selectedInsightForBrief.topic : 'Penawaran Layanan Spesial RSUD Daya',
          channel: contentType === 'instagram' ? 'Instagram Carousel & Feed Promosi' : contentType === 'tiktok' ? 'TikTok Promo & Booking Video Script' : contentType === 'whatsapp' ? 'WhatsApp Official Promo Blast' : 'Landing Page Promo Website',
          caption: `✨ PENAWARAN SPESIAL RSUD DAYA: ${selectedInsightForBrief ? selectedInsightForBrief.topic : 'Paket Layanan Unggulan'} ✨\n\nDapatkan pengalaman pelayanan kesehatan terbaik dengan fasilitas lengkap dan dokter spesialis berpengalaman.\n\n🎁 KEUNTUNGAN PAKET:\n• Pemeriksaan lengkap & konsultasi langsung dengan dokter spesialis\n• Bebas antre dengan pendaftaran cepat via Policare\n• Bonus cetak foto HD / poin loyalitas reward tambahan\n\n👉 Slot terbatas! Klik tautan di bio / balas pesan ini untuk reservasi online sekarang.`,
          scriptVideo: contentType === 'tiktok' ? '🎥 VIDEO PROMO LAYANAN (30 Detik):\n[00:00-00:04] HOOK: "Mau USG 4D kualitas HD dengan dokter spesialis tanpa ribet antre?"\n[00:04-00:20] SHOWCASE: Tampilan ruang periksa modern, senyum dokter, dan hasil USG 4D yang jernih.\n[00:20-00:30] CTA: "Booking sekarang lewat WhatsApp Policare dan dapatkan bonus voucher konsultasi!"' : null,
          hashtag: '#PromoRSUDDaya #PaketKesehatan #USG4D #BookingDokter #LayananUnggulan #MakassarSehat',
          visualPrompt: 'Desain poster promosi profesional dengan badge penawaran, nuansa modern, foto fasilitas RS yang bersih dan nyaman.',
          targetAudience: 'Calon Pasien, Pasangan Muda, Pasien Baru Wilayah Makassar'
        };
      }
      setGeneratedDraft(draft);
      setIsGenerating(false);
    }, 700);
  };

  // Validate & Publish
  const handlePublishContent = () => {
    if (!doctorApproval) {
      alert('⚠️ Konten wajib mendapatkan verifikasi dokter (Doctor Validation) sebelum dipublikasikan!');
      return;
    }
    const newCamp = {
      id: Date.now(),
      categoryType: generatedDraft.categoryType,
      title: generatedDraft.title,
      channel: generatedDraft.channel,
      channelIcon: 'send',
      channelColor: generatedDraft.categoryType === 'education' ? '#0284c7' : '#ea580c',
      source: selectedInsightForBrief ? selectedInsightForBrief.source : 'Studio AI Co-Creation',
      status: 'Live',
      scheduledDate: 'Hari Ini (Direct Sync)',
      reach: 'Published',
      visits: '0',
      conversions: generatedDraft.categoryType === 'education' ? 'Tervalidasi Medis' : '0 Booking',
      doctorValidator: 'dr. Ratna Kusuma, Sp.A (Verified ✓)'
    };

    setCampaigns(prev => [newCamp, ...prev]);
    alert(`🎉 Konten ${generatedDraft.categoryType === 'education' ? 'Informasi & Edukasi Medis' : 'Promosi Layanan'} berhasil divalidasi & dipublikasikan!`);
    setActiveTab('calendar');
  };

  return (
    <div className="screen on" id="s-promotion">
      {/* PAGE HEADER */}
      <div className="ph">
        <div className="ph-text">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(235,94,40,0.1)', color: '#eb5e28', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
            <span className="ic s" style={{ fontSize: '14px' }}>campaign</span> KOMUNIKASI, EDUKASI &amp; PROMOSI RS
          </div>
          <h2>Studio Edukasi Medis &amp; Promosi Layanan</h2>
          <p>Kelola konten informasi &amp; edukasi kesehatan terpisah dari materi promosi layanan untuk menjaga kredibilitas medis dan efektivitas pemasaran.</p>
        </div>
        {!isReadOnly && (
          <div className="ph-act" style={{ display: 'flex', gap: '8px' }}>
            <button className="btn pri" onClick={() => setActiveTab('studio')} style={{ background: '#eb5e28' }}>
              <span className="ic s">auto_awesome</span>Buat Konten dengan AI
            </button>
          </div>
        )}
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
            <strong>Mode Pantau (Read-Only) Aktif:</strong> Anda dapat melihat kalender konten, materi edukasi medis, dan analitik performa. Pembuatan konten dengan AI dan publikasi langsung dikelola oleh Bagian Promkes &amp; Pemasaran.
          </div>
        </div>
      )}

      {/* DEDICATED SECTION SWITCHER: EDUKASI vs PROMOSI */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--srf)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--line2)', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--t2)' }}>PILIH SECTION:</span>
          <div style={{ display: 'inline-flex', background: 'var(--bg2)', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setSectionFilter('ALL')}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                background: sectionFilter === 'ALL' ? 'var(--srf)' : 'transparent',
                color: sectionFilter === 'ALL' ? 'var(--t1)' : 'var(--t3)',
                boxShadow: sectionFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>
              🌐 Semua Konten ({campaigns.length})
            </button>
            <button
              onClick={() => setSectionFilter('EDUCATION')}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                background: sectionFilter === 'EDUCATION' ? '#0284c7' : 'transparent',
                color: sectionFilter === 'EDUCATION' ? '#fff' : '#0369a1',
                boxShadow: sectionFilter === 'EDUCATION' ? '0 1px 4px rgba(2,132,199,0.3)' : 'none',
                display: 'inline-flex', alignItems: 'center', gap: '5px'
              }}>
              <span className="ic s" style={{ fontSize: '14px' }}>menu_book</span>
              📚 Section Informasi &amp; Edukasi ({campaigns.filter(c => c.categoryType === 'education').length})
            </button>
            <button
              onClick={() => setSectionFilter('PROMOTION')}
              style={{
                padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                background: sectionFilter === 'PROMOTION' ? '#ea580c' : 'transparent',
                color: sectionFilter === 'PROMOTION' ? '#fff' : '#c2410c',
                boxShadow: sectionFilter === 'PROMOTION' ? '0 1px 4px rgba(234,88,12,0.3)' : 'none',
                display: 'inline-flex', alignItems: 'center', gap: '5px'
              }}>
              <span className="ic s" style={{ fontSize: '14px' }}>local_offer</span>
              📢 Section Promosi Layanan ({campaigns.filter(c => c.categoryType === 'promotion').length})
            </button>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--t3)' }}>
          {sectionFilter === 'EDUCATION' ? (
            <span style={{ color: '#0284c7', fontWeight: 600 }}>ℹ️ Menampilkan materi literasi medis, SOP klinis &amp; panduan pasien tanpa muatan jualan.</span>
          ) : sectionFilter === 'PROMOTION' ? (
            <span style={{ color: '#ea580c', fontWeight: 600 }}>🎯 Menampilkan paket penawaran, voucher loyalitas &amp; kampanye konversi booking poli.</span>
          ) : (
            <span>Menampilkan seluruh arsip komunikasi edukasi dan promosi RS.</span>
          )}
        </div>
      </div>

      {/* METRIC STRIP (DIFFERENTIATED BY FOCUS) */}
      <div className="kstrip k4" style={{ marginBottom: '16px' }}>
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic" style={{ color: '#10b981' }}>menu_book</span></div>
          <div className="kcard-lbl">Jangkauan Edukasi Medis</div>
          <div className="kcard-v">1.12<small>M</small></div>
          <div className="kcard-d up"><span className="ic s">verified</span>Literasi &amp; SOP Klinis</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#ea580c' }}>local_offer</span></div>
          <div className="kcard-lbl">Jangkauan Promosi Layanan</div>
          <div className="kcard-v">720<small>K</small></div>
          <div className="kcard-d up">Kampanye penawaran &amp; promo</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#2563eb' }}>event_available</span></div>
          <div className="kcard-lbl">Direct Booking dari Promosi</div>
          <div className="kcard-v">1.240</div>
          <div className="kcard-d up">Pendaftaran poli bulan ini</div>
        </div>
        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#8b5cf6' }}>verified_user</span></div>
          <div className="kcard-lbl">Validasi Dokter (Kepatuhan)</div>
          <div className="kcard-v">100<small>%</small></div>
          <div className="kcard-d up">Bebas hoaks &amp; klaim overpromise</div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION (RESPONSIVE SCROLLABLE) */}
      <div className="tabs subtabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1.5px solid var(--line2)', paddingBottom: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {[
          { id: 'intelligence', label: 'Riset Ide Konten', icon: 'lightbulb' },
          { id: 'studio',       label: 'Studio Co-Creation AI', icon: 'auto_awesome' },
          { id: 'calendar',     label: 'Kalender & Distribusi', icon: 'calendar_month' },
          { id: 'analytics',    label: 'Performa & ROI', icon: 'insights' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: activeTab === t.id ? '#eb5e28' : 'var(--srf)',
              color: activeTab === t.id ? '#fff' : 'var(--t2)',
              display: 'flex', alignItems: 'center', gap: '6px', transition: '.15s',
              flexShrink: 0,
              boxShadow: activeTab === t.id ? '0 2px 8px rgba(235, 94, 40, 0.25)' : 'none'
            }}>
            <span className="ic s" style={{ fontSize: '16px' }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 1: STRATEGIC CONTENT INTELLIGENCE (RISET IDE EDUKASI VS PROMOSI)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'intelligence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="ic" style={{ color: '#38bdf8', fontSize: '24px' }}>psychology</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Sinteta Content Intelligence Engine</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  AI memilah sumber ide menjadi 2 jalur: <strong>Jalur Edukasi &amp; SOP Klinis</strong> (fokus literasi &amp; keselamatan pasien) dan <strong>Jalur Promosi Layanan</strong> (fokus konversi &amp; loyalitas).
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">
                  Daftar Rekomendasi Ide ({filteredInsights.length} Insight Terfilter)
                </div>
                <div className="card-sub">
                  {sectionFilter === 'EDUCATION' ? 'Menampilkan khusus ide informasi & edukasi klinis' : sectionFilter === 'PROMOTION' ? 'Menampilkan khusus ide promosi & kampanye penawaran' : 'Menampilkan seluruh insight edukasi dan promosi terintegrasi'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredInsights.map(ins => (
                <div key={ins.id} style={{
                  border: ins.categoryType === 'education' ? '1.5px solid #bae6fd' : '1.5px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '16px',
                  background: ins.categoryType === 'education' ? '#f0f9ff' : '#fff7ed',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className="bdg" style={{
                        background: ins.categoryType === 'education' ? '#0284c7' : '#ea580c',
                        color: '#fff',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span className="ic s" style={{ fontSize: '12px' }}>{ins.categoryType === 'education' ? 'menu_book' : 'local_offer'}</span>
                        {ins.categoryLabel}
                      </span>
                      <span className="bdg" style={{ background: ins.sourceColor, color: '#fff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span className="ic s" style={{ fontSize: '12px' }}>{ins.sourceIcon}</span> Sumber: {ins.source}
                      </span>
                      <span className={`bdg ${ins.urgency === 'Sangat Tinggi' ? 'r' : ins.urgency === 'Tinggi' ? 'purple' : 'b'}`}>
                        Urgensi: {ins.urgency}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: 'var(--t1)' }}>{ins.topic}</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: 'var(--t2)', lineHeight: 1.5 }}>{ins.description}</p>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: 'var(--t3)', flexWrap: 'wrap' }}>
                      <div>📺 <strong>Kanal Terbaik:</strong> <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{ins.targetChannel}</span></div>
                      <div>🎯 <strong>Rekomendasi CTA:</strong> <span style={{ color: ins.categoryType === 'education' ? '#0284c7' : '#ea580c', fontWeight: 600 }}>{ins.recommendedCTA}</span></div>
                    </div>
                  </div>

                  <button className="btn pri" onClick={() => handleStartBrief(ins)} style={{
                    background: ins.categoryType === 'education' ? '#0284c7' : '#ea580c',
                    whiteSpace: 'nowrap'
                  }}>
                    <span className="ic s">auto_awesome</span>Buat Draf {ins.categoryType === 'education' ? 'Edukasi' : 'Promosi'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 2: HUMAN-AI CO-CREATION STUDIO (EDUKASI VS PROMOSI ENGINE)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'studio' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* LEFT COLUMN: BRIEF & GENERATOR */}
          <div className="card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="ic" style={{ color: '#eb5e28' }}>edit_note</span> Langkah 1: Briefing &amp; AI Content Engine
            </h3>

            {/* Content Category Selector in Studio */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px' }}>TIPE MATERI YANG INGIN DIBUAT:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setContentCategory('education')}
                  style={{
                    padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                    border: contentCategory === 'education' ? '2px solid #0284c7' : '1px solid var(--line2)',
                    background: contentCategory === 'education' ? '#f0f9ff' : 'var(--srf)',
                    color: contentCategory === 'education' ? '#0369a1' : 'var(--t2)'
                  }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">menu_book</span> Informasi &amp; Edukasi Medis
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>Fokus literasi, tips dokter &amp; SOP (Non-komersial)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setContentCategory('promotion')}
                  style={{
                    padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                    border: contentCategory === 'promotion' ? '2px solid #ea580c' : '1px solid var(--line2)',
                    background: contentCategory === 'promotion' ? '#fff7ed' : 'var(--srf)',
                    color: contentCategory === 'promotion' ? '#c2410c' : 'var(--t2)'
                  }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic s">local_offer</span> Promosi &amp; Penawaran Layanan
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>Fokus konversi booking, diskon &amp; paket RS</div>
                </button>
              </div>
            </div>

            {selectedInsightForBrief && (
              <div style={{
                padding: '10px 12px',
                background: selectedInsightForBrief.categoryType === 'education' ? '#f0f9ff' : '#fff7ed',
                borderRadius: '8px',
                border: selectedInsightForBrief.categoryType === 'education' ? '1px solid #bae6fd' : '1px solid #fed7aa',
                marginBottom: '12px',
                fontSize: '12px',
                color: selectedInsightForBrief.categoryType === 'education' ? '#0369a1' : '#c2410c'
              }}>
                📌 <strong>Terhubung dengan Insight:</strong> {selectedInsightForBrief.topic} ({selectedInsightForBrief.source})
              </div>
            )}

            <form onSubmit={handleGenerateContent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '4px' }}>PILIH KANAL PUBLIKASI TARGET</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'instagram', label: 'Instagram Carousel & Feed', icon: 'photo_camera' },
                    { id: 'tiktok',    label: 'TikTok & Reels Video Script', icon: 'videocam' },
                    { id: 'whatsapp',  label: 'WhatsApp Official Blast',   icon: 'chat' },
                    { id: 'blog',      label: 'Artikel Blog Website RS',    icon: 'article' },
                  ].map(c => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setContentType(c.id)}
                      style={{
                        padding: '8px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
                        border: contentType === c.id ? `2px solid ${contentCategory === 'education' ? '#0284c7' : '#ea580c'}` : '1px solid var(--line2)',
                        background: contentType === c.id ? (contentCategory === 'education' ? '#f0f9ff' : '#fff7ed') : 'var(--srf)',
                        color: contentType === c.id ? (contentCategory === 'education' ? '#0369a1' : '#c2410c') : 'var(--t2)',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                      <span className="ic s">{c.icon}</span>{c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--t2)', marginBottom: '4px' }}>
                  PROMPT / INTRUKSI KONTEN UNTUK SINTETA AI ({contentCategory === 'education' ? 'MODE EDUKASI' : 'MODE PROMOSI'})
                </label>
                <textarea
                  rows="4"
                  value={contentPrompt}
                  onChange={e => setContentPrompt(e.target.value)}
                  placeholder={contentCategory === 'education' ? 'Instruksikan AI untuk menulis materi edukasi medis yang akurat, santun, dan mudah dipahami pasien...' : 'Instruksikan AI untuk menyusun promo layanan yang menarik dengan call-to-action konversi booking...'}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line2)', background: 'var(--srf)', fontSize: '12.5px' }}
                />
              </div>

              <button type="submit" className="btn pri" disabled={isGenerating} style={{
                background: contentCategory === 'education' ? '#0284c7' : '#ea580c',
                padding: '10px'
              }}>
                {isGenerating ? 'AI Sedang Menyusun Materi Konten...' : `🚀 Buat Materi ${contentCategory === 'education' ? 'Edukasi Medis' : 'Promosi Layanan'} dengan AI`}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: DRAFT PREVIEW & HUMAN-IN-THE-LOOP VALIDATION */}
          <div className="card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="ic" style={{ color: '#10b981' }}>verified_user</span> Langkah 2: Review &amp; Validasi Dokter (HITL)
            </h3>

            {!generatedDraft ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)', fontSize: '13px' }}>
                <span className="ic" style={{ fontSize: '48px', color: 'var(--line2)', display: 'block', marginBottom: '8px' }}>find_in_page</span>
                Hasil draf konten buatan AI (Edukasi Medis / Promosi Layanan) akan tampil di sini untuk divalidasi oleh Tim Medis &amp; Humas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '12px',
                  background: generatedDraft.categoryType === 'education' ? '#f0f9ff' : '#fff7ed',
                  borderRadius: '10px',
                  border: generatedDraft.categoryType === 'education' ? '1px solid #bae6fd' : '1px solid #fed7aa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="bdg" style={{
                      background: generatedDraft.categoryType === 'education' ? '#0284c7' : '#ea580c',
                      color: '#fff',
                      fontSize: '10.5px',
                      fontWeight: 700
                    }}>
                      {generatedDraft.categoryType === 'education' ? '📚 MATERI EDUKASI MEDIS' : '📢 KAMPANYE PROMOSI LAYANAN'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: 600 }}>{generatedDraft.channel.toUpperCase()}</span>
                  </div>

                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px' }}>{generatedDraft.title}</div>
                  <div style={{ fontSize: '12px', whiteSpace: 'pre-line', color: 'var(--t2)', lineHeight: 1.5 }}>{generatedDraft.caption}</div>
                  
                  {generatedDraft.scriptVideo && (
                    <div style={{ marginTop: '10px', padding: '8px', background: '#0f172a', color: '#38bdf8', borderRadius: '6px', fontSize: '11px', whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                      {generatedDraft.scriptVideo}
                    </div>
                  )}

                  <div style={{ marginTop: '10px', fontSize: '11px', color: generatedDraft.categoryType === 'education' ? '#0284c7' : '#ea580c', fontWeight: 600 }}>{generatedDraft.hashtag}</div>
                </div>

                {/* HITL VALIDATION CHECKLIST */}
                <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '1.5px solid #86efac' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>PROSES VALIDASI HUMAN-IN-THE-LOOP (HITL):</div>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#14532d', cursor: 'pointer', marginBottom: '6px' }}>
                    <input type="checkbox" checked={doctorApproval} onChange={e => setDoctorApproval(e.target.checked)} />
                    <strong>1. Persetujuan Medis (Doctor Validation):</strong> {generatedDraft.categoryType === 'education' ? 'Informasi kesehatan terverifikasi akurat secara klinis & sesuai SOP RS.' : 'Klaim layanan & keunggulan fasilitas telah disetujui dokter penanggung jawab.'}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#14532d', cursor: 'pointer' }}>
                    <input type="checkbox" checked={marketingApproval} onChange={e => setMarketingApproval(e.target.checked)} />
                    <strong>2. Persetujuan Humas &amp; Marketing:</strong> Visual, etika komunikasi, dan tone of voice telah sesuai regulasi RS.
                  </label>
                </div>

                {!isReadOnly ? (
                  <button className="btn pri" onClick={handlePublishContent} style={{ background: '#10b981', padding: '10px', width: '100%' }}>
                    <span className="ic s">send</span> Publish Langsung ke Kanal Terhubung
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px', background: 'var(--srf2)', borderRadius: 'var(--r8)', fontSize: '12px', color: 'var(--t3)', fontWeight: 600 }}>
                    👁️ Mode Pantau Eksekutif: Publikasi dilakukan oleh Promkes
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 3: CONTENT CALENDAR & PLANNER (KANBAN TERPISAH)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Jadwal &amp; Status Distribusi Konten Omnichannel</div>
                <div className="card-sub">Memantau antrean materi edukasi dan materi promosi dari draft hingga live.</div>
              </div>
            </div>

            <table className="tbl" style={{ fontSize: '12.5px' }}>
              <thead>
                <tr>
                  <th>Tipe Section</th>
                  <th>Judul Konten / Kampanye</th>
                  <th>Kanal Publikasi</th>
                  <th>Sumber Insight</th>
                  <th>Tanggal Tayang</th>
                  <th>Validasi Dokter</th>
                  <th>Status</th>
                  <th>Output / Dampak</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span className="bdg" style={{
                        background: c.categoryType === 'education' ? '#e0f2fe' : '#ffedd5',
                        color: c.categoryType === 'education' ? '#0369a1' : '#c2410c',
                        fontWeight: 700,
                        fontSize: '11px'
                      }}>
                        {c.categoryType === 'education' ? '📚 Edukasi' : '📢 Promosi'}
                      </span>
                    </td>
                    <td>
                      <div className="td1" style={{ fontWeight: 700 }}>{c.title}</div>
                    </td>
                    <td>
                      <span className="bdg" style={{ background: 'var(--bg2)', color: 'var(--t1)', fontWeight: 600 }}>
                        {c.channel}
                      </span>
                    </td>
                    <td><span className="bdg" style={{ background: '#fef3c7', color: '#92400e' }}>{c.source}</span></td>
                    <td>{c.scheduledDate}</td>
                    <td>
                      <span style={{ fontSize: '11.5px', color: c.doctorValidator.includes('Verified') ? '#10b981' : 'var(--t2)', fontWeight: 600 }}>
                        {c.doctorValidator}
                      </span>
                    </td>
                    <td>
                      <span className={`bdg ${c.status === 'Live' ? 'g' : c.status === 'Scheduled' ? 'b' : c.status === 'Pending Validation' ? 'r' : ''}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: c.categoryType === 'education' ? '#0284c7' : '#ea580c' }}>
                      {c.conversions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 4: PERFORMANCE & ROI (LITERASI EDUKASI VS BOOKING PROMOSI)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* SECTION 1: PERFORMA EDUKASI & LITERASI */}
            <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
              <div className="card-hd">
                <div className="card-hd-l">
                  <div className="card-title" style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic">menu_book</span> Performa Edukasi &amp; Literasi Medis
                  </div>
                  <div className="card-sub">Dampak konten terhadap pemahaman pasien &amp; kepatuhan kontrol.</div>
                </div>
              </div>
              <table className="tbl" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Konten Edukasi</th>
                    <th style={{ textAlign: 'right' }}>Pembaca</th>
                    <th style={{ textAlign: 'right' }}>Tingkat Selesai Baca</th>
                    <th style={{ textAlign: 'right' }}>Tingkat Pemahaman</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="td1"><strong>Tips Bebas Nyeri Persalinan ILA</strong></td>
                    <td style={{ textAlign: 'right' }}>42.800</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>88.4%</td>
                    <td style={{ textAlign: 'right', color: '#0284c7', fontWeight: 700 }}>96% Sangat Jelas</td>
                  </tr>
                  <tr>
                    <td className="td1"><strong>Panduan MPASI Cegah Stunting</strong></td>
                    <td style={{ textAlign: 'right' }}>29.100</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>91.2%</td>
                    <td style={{ textAlign: 'right', color: '#0284c7', fontWeight: 700 }}>98% Sangat Jelas</td>
                  </tr>
                  <tr>
                    <td className="td1"><strong>Alur Layanan Hantar Obat Farmasi</strong></td>
                    <td style={{ textAlign: 'right' }}>18.500</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>82.5%</td>
                    <td style={{ textAlign: 'right', color: '#0284c7', fontWeight: 700 }}>94% Sangat Jelas</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 2: PERFORMA PROMOSI & BOOKING CONVERSION */}
            <div className="card" style={{ borderTop: '4px solid #ea580c' }}>
              <div className="card-hd">
                <div className="card-hd-l">
                  <div className="card-title" style={{ color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ic">local_offer</span> Performa Promosi &amp; Booking ROI
                  </div>
                  <div className="card-sub">Dampak penawaran komersial terhadap pendaftaran poli &amp; pendapatan RS.</div>
                </div>
              </div>
              <table className="tbl" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Konten Promosi</th>
                    <th style={{ textAlign: 'right' }}>Impression</th>
                    <th style={{ textAlign: 'right' }}>Click-Through (CTR)</th>
                    <th style={{ textAlign: 'right' }}>Booking Poli (ROI)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="td1"><strong>Paket USG 4D Fetomaternal</strong></td>
                    <td style={{ textAlign: 'right' }}>38.400</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>7.1%</td>
                    <td style={{ textAlign: 'right', color: '#ea580c', fontWeight: 700 }}>142 Pasien (Rp 71 Jt)</td>
                  </tr>
                  <tr>
                    <td className="td1"><strong>Promo MCU Pra-Nikah Fertilitas</strong></td>
                    <td style={{ textAlign: 'right' }}>22.300</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>5.9%</td>
                    <td style={{ textAlign: 'right', color: '#ea580c', fontWeight: 700 }}>68 Pasutri (Rp 54 Jt)</td>
                  </tr>
                  <tr>
                    <td className="td1"><strong>Promo Layanan Hantar Obat Gratis</strong></td>
                    <td style={{ textAlign: 'right' }}>18.500</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>8.4%</td>
                    <td style={{ textAlign: 'right', color: '#ea580c', fontWeight: 700 }}>210 Transaksi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
