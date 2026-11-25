import { useState } from 'react';

export default function SurveyModal({ isOpen, onClose, onSurveyCreated, API_URL }) {
  const [activeStep, setActiveStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [segment, setSegment] = useState('Pasien Rawat Jalan');
  const [target, setTarget] = useState(200);
  const [deadline, setDeadline] = useState('15 Juni');
  const [questions, setQuestions] = useState({ q1: true, q2: true, q3: true, q4: false });
  const [channel, setChannel] = useState('WA');

  // New States for Data Source & Questionnaire Link/Upload
  const [dataSource, setDataSource] = useState('SIMRS Direct API');
  const [excelFileName, setExcelFileName] = useState('');
  const [questionnaireType, setQuestionnaireType] = useState('Kustom'); // 'Kustom', 'GForm', 'Typeform', 'Upload'
  const [externalLink, setExternalLink] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Advanced Custom Questions State (Dynamic Array)
  const [customQuestions, setCustomQuestions] = useState([
    { id: 1, text: 'Bagaimana kepuasan Anda terhadap layanan medis kami?', type: 'Rating' },
    { id: 2, text: 'Apakah waktu tunggu farmasi/resep obat sudah cepat?', type: 'Rating' },
    { id: 3, text: 'Bagaimana kebersihan fasilitas ruang tunggu RS?', type: 'Rating' }
  ]);

  // Physical Placement Locations
  const [selectedLocations, setSelectedLocations] = useState(['Poli Kebidanan (Obgyn)', 'Poli Anak', 'Farmasi / Apotek', 'Kasir']);
  const [showLocationQrPreview, setShowLocationQrPreview] = useState(false);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (activeStep === 1) {
      if (!name.trim()) {
        alert('Nama survey harus diisi!');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2 || activeStep === 3) {
      setActiveStep(activeStep + 1);
    } else if (activeStep === 4) {
      // Submit survey to API
      const payload = {
        name,
        segment,
        target,
        deadline,
        dataSource,
        questionnaireType,
        questionnaireLink: (questionnaireType === 'GForm' || questionnaireType === 'Typeform') ? externalLink : (questionnaireType === 'Upload' && uploadedFile ? uploadedFile.name : ''),
        customQuestions: questionnaireType === 'Kustom' ? customQuestions : []
      };
      try {
        const res = await fetch(`${API_URL}/api/surveys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          onSurveyCreated();
          setActiveStep(5);
        } else {
          alert('Gagal membuat survey.');
        }
      } catch (err) {
        alert('Gagal menyambung ke API Server.');
      }
    } else if (activeStep === 5) {
      setActiveStep(6);
    } else if (activeStep === 6) {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (activeStep === 1) {
      handleClose();
    } else if (activeStep > 1 && activeStep <= 4) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleClose = () => {
    setActiveStep(1);
    setName('');
    setGoal('');
    setSegment('Pasien Rawat Jalan');
    setTarget(200);
    setDeadline('15 Juni');
    setChannel('WA');
    setDataSource('SIMRS Direct API');
    setExcelFileName('');
    setQuestionnaireType('Kustom');
    setExternalLink('');
    setUploadedFile(null);
    setCustomQuestions([
      { id: 1, text: 'Bagaimana kepuasan Anda terhadap layanan medis kami?', type: 'Rating' },
      { id: 2, text: 'Apakah waktu tunggu farmasi/resep obat sudah cepat?', type: 'Rating' },
      { id: 3, text: 'Bagaimana kebersihan fasilitas ruang tunggu RS?', type: 'Rating' }
    ]);
    onClose();
  };

  const addCustomQuestion = () => {
    if (customQuestions.length >= 10) {
      alert('Maksimal 10 pertanyaan untuk form kustom!');
      return;
    }
    const newId = customQuestions.length > 0 ? Math.max(...customQuestions.map(q => q.id)) + 1 : 1;
    setCustomQuestions([
      ...customQuestions,
      { id: newId, text: '', type: 'Rating' }
    ]);
  };

  const updateQuestionText = (id, newText) => {
    setCustomQuestions(customQuestions.map(q => q.id === id ? { ...q, text: newText } : q));
  };

  const updateQuestionType = (id, newType) => {
    setCustomQuestions(customQuestions.map(q => q.id === id ? { ...q, type: newType } : q));
  };

  const removeCustomQuestion = (id) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  return (
    <div id="survey-modal" className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && handleClose()}>
      <div className="modal-box" style={{ width: '680px' }}>
        <div className="modal-hd">
          <div className="modal-hd-icon" style={{ background: 'var(--blue-s)' }}>
            <span className="ic" style={{ color: 'var(--blue)' }}>biotech</span>
          </div>
          <div>
            <div className="modal-title">Studio Riset — Buat Survey Pasien Baru</div>
            <div className="modal-sub">Rancang kuesioner berbasis SKM Kemenkes & distribusikan secara multi-kanal</div>
          </div>
          <button onClick={handleClose} className="modal-close" title="Tutup">
            <span className="ic s">close</span>
          </button>
        </div>

        {/* SURVEY CREATOR WIZARD STEP INDICATOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0 14px', borderBottom: '1px solid var(--line)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { step: 1, label: 'Goal & Objective' },
            { step: 2, label: 'Segmen' },
            { step: 3, label: 'Kuesioner' },
            { step: 4, label: 'Distribusi' },
            { step: 5, label: 'Analisis' },
            { step: 6, label: 'Laporan' }
          ].map((item, idx, arr) => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div
                className={`s-step-node ${activeStep === item.step ? 'on' : ''}`}
                style={{
                  cursor: activeStep > item.step ? 'pointer' : 'default',
                  opacity: activeStep >= item.step ? 1 : 0.55
                }}
                onClick={() => activeStep > item.step && setActiveStep(item.step)}
              >
                {item.step < activeStep ? '✓ ' : `${item.step}. `}{item.label}
              </div>
              {idx < arr.length - 1 && (
                <span className="ic s" style={{ fontSize: '11px', color: 'var(--t4)' }}>chevron_right</span>
              )}
            </div>
          ))}
        </div>

        {/* STEP PANELS */}
        {activeStep === 1 && (
          <div className="survey-step-panel" id="survey-step-1" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>NAMA SURVEY</label>
              <input type="text" id="survey-inp-name" value={name} onChange={(e) => setName(e.target.value)} className="inp" placeholder="Contoh: Survey Kepuasan Layanan Farmasi Q2 2026" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--t2)', marginBottom: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>TUJUAN &amp; GOAL SURVEY (AI INSIGHTS)</label>
              <textarea id="survey-inp-goal" value={goal} onChange={(e) => setGoal(e.target.value)} style={{ width: '100%', height: '70px', padding: '8px 12px', border: '1px solid var(--line2)', borderRadius: '8px', background: 'var(--srf)', color: 'var(--t1)', fontSize: '12.5px', resize: 'none', outline: 'none', fontFamily: 'inherit' }} placeholder="Contoh: Mengidentifikasi hambatan kecepatan penyiapan resep obat pasien rawat jalan."></textarea>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="survey-step-panel" id="survey-step-2" style={{ display: 'block' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '6px' }}>SEGMEN PASIEN TARGET</label>
                <select id="survey-inp-segment" value={segment} onChange={(e) => setSegment(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line2)', borderRadius: '8px', background: 'var(--srf)', color: 'var(--t1)', fontSize: '12.5px', outline: 'none' }}>
                  <option value="Pasien Rawat Jalan">Pasien Rawat Jalan</option>
                  <option value="Ibu Hamil (ANC)">Ibu Hamil (ANC)</option>
                  <option value="Ibu Pasca Melahirkan">Ibu Pasca Melahirkan</option>
                  <option value="Orang Tua Bayi (Imunisasi)">Orang Tua Bayi (Imunisasi)</option>
                  <option value="Semua Pasien Aktif">Semua Pasien Aktif</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '6px' }}>SUMBER PENARIKAN DATA</label>
                <select id="survey-inp-datasource" value={dataSource} onChange={(e) => setDataSource(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line2)', borderRadius: '8px', background: 'var(--srf)', color: 'var(--t1)', fontSize: '12.5px', outline: 'none' }}>
                  <option value="SIMRS Direct API">SIMRS Direct API (Terintegrasi)</option>
                  <option value="Excel Upload">Upload Excel / Dokumen Eksternal</option>
                  <option value="Bebaik App Segment">Bebaik Apps Connection</option>
                </select>
              </div>
            </div>

            {dataSource === 'Excel Upload' && (
              <div style={{ marginBottom: '14px', padding: '12px', border: '1px dashed var(--line2)', borderRadius: '8px', background: 'var(--srf2)', textAlign: 'center' }}>
                <span className="ic l" style={{ color: 'var(--blue)', marginBottom: '6px' }}>cloud_upload</span>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>{excelFileName || 'Pilih atau drop file Excel / CSV data pasien'}</div>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setExcelFileName(e.target.files[0]?.name || '')} style={{ marginTop: '8px', fontSize: '11px' }} />
              </div>
            )}

            {dataSource === 'SIMRS Direct API' && (
              <div style={{ marginBottom: '14px', padding: '8px 12px', borderRadius: '8px', background: 'var(--green-s)', border: '1px solid var(--green-m)', fontSize: '11.5px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="ic s">sync</span>
                <span>Terhubung dengan SIMRS RSUD Daya secara real-time. Target otomatis disinkronkan.</span>
              </div>
            )}

            {dataSource === 'Bebaik App Segment' && (
              <div style={{ marginBottom: '14px', padding: '8px 12px', borderRadius: '8px', background: 'var(--loy-s)', border: '1px solid var(--loy-m)', fontSize: '11.5px', color: 'var(--loy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="ic s">phone_iphone</span>
                <span>Koneksi Bebaik Apps aktif. Target akan disaring dari pasien aktif di aplikasi mobile.</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '6px' }}>TARGET RESPONDEN</label>
                <input type="number" id="survey-inp-target" value={target} onChange={(e) => setTarget(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line2)', borderRadius: '8px', background: 'var(--srf)', color: 'var(--t1)', fontSize: '12.5px', outline: 'none' }} placeholder="200" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '6px' }}>DEADLINE</label>
                <input type="text" id="survey-inp-deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line2)', borderRadius: '8px', background: 'var(--srf)', color: 'var(--t1)', fontSize: '12.5px', outline: 'none' }} placeholder="Contoh: 15 Juni" />
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="survey-step-panel" id="survey-step-3" style={{ display: 'block' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '8px' }}>PILIH SUMBER KUESIONER</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              {['Kustom', 'GForm', 'Typeform', 'Upload'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setQuestionnaireType(type)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: questionnaireType === type ? '2px solid var(--blue)' : '1px solid var(--line2)',
                    background: questionnaireType === type ? 'var(--blue-s)' : 'var(--srf2)',
                    color: questionnaireType === type ? 'var(--blue)' : 'var(--t2)',
                    fontWeight: '600',
                    fontSize: '11.5px',
                    cursor: 'pointer'
                  }}
                >
                  {type === 'Kustom' && 'Form Kustom'}
                  {type === 'GForm' && 'Google Forms'}
                  {type === 'Typeform' && 'Typeform'}
                  {type === 'Upload' && 'Unggah File'}
                </button>
              ))}
            </div>

             {questionnaireType === 'Kustom' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)' }}>DAFTAR PERTANYAAN ({customQuestions.length}/10)</label>
                  <button type="button" className="btn pri sm" onClick={addCustomQuestion} style={{ padding: '4px 8px', fontSize: '11px' }}>
                    <span className="ic s">add</span> Tambah Pertanyaan
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px', marginBottom: '10px' }}>
                  {customQuestions.map((q, idx) => (
                    <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--srf2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--t3)' }}>#{idx + 1}</span>
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => updateQuestionText(q.id, e.target.value)}
                          placeholder="Ketik pertanyaan survey..."
                          style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }}
                        />
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestionType(q.id, e.target.value)}
                          style={{ padding: '6px', border: '1px solid var(--line2)', borderRadius: '6px', background: 'var(--srf)', fontSize: '12px' }}
                        >
                          <option value="Rating">Rating (1-5)</option>
                          <option value="Teks">Teks Bebas</option>
                          <option value="PilihanGanda">Pilihan Ganda (Single Select)</option>
                          <option value="MultipleChoice">Kotak Centang (Multi Select)</option>
                        </select>
                        <button type="button" className="btn danger sm" onClick={() => removeCustomQuestion(q.id)} style={{ padding: '6px' }}>
                          <span className="ic s" style={{ fontSize: '15px' }}>delete</span>
                        </button>
                      </div>

                      {/* Options Editor for PilihanGanda or MultipleChoice */}
                      {(q.type === 'PilihanGanda' || q.type === 'MultipleChoice') && (
                        <div style={{ paddingLeft: '24px', borderLeft: '2px solid var(--blue-m)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--t2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>PILIHAN JAWABAN</span>
                            <button
                              type="button"
                              className="btn pri sm"
                              onClick={() => {
                                const currentOpts = q.options || ['Pilihan 1', 'Pilihan 2'];
                                setCustomQuestions(customQuestions.map(item => item.id === q.id ? { ...item, options: [...currentOpts, `Pilihan ${currentOpts.length + 1}`] } : item));
                              }}
                              style={{ padding: '2px 6px', fontSize: '9.5px', height: '20px' }}
                            >
                              + Tambah Opsi
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(q.options || ['Pilihan 1', 'Pilihan 2']).map((opt, oIdx) => (
                              <div key={oIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span className="ic s" style={{ color: 'var(--t3)' }}>
                                  {q.type === 'PilihanGanda' ? 'radio_button_unchecked' : 'check_box_outline_blank'}
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const currentOpts = [...(q.options || ['Pilihan 1', 'Pilihan 2'])];
                                    currentOpts[oIdx] = e.target.value;
                                    setCustomQuestions(customQuestions.map(item => item.id === q.id ? { ...item, options: currentOpts } : item));
                                  }}
                                  placeholder={`Opsi ${oIdx + 1}`}
                                  style={{ flex: 1, padding: '4px 8px', border: '1px solid var(--line2)', borderRadius: '4px', background: 'var(--srf)', fontSize: '11.5px' }}
                                />
                                <button
                                  type="button"
                                  className="btn danger sm"
                                  onClick={() => {
                                    const currentOpts = (q.options || ['Pilihan 1', 'Pilihan 2']).filter((_, idx) => idx !== oIdx);
                                    setCustomQuestions(customQuestions.map(item => item.id === q.id ? { ...item, options: currentOpts } : item));
                                  }}
                                  style={{ padding: '2px 4px', height: '22px' }}
                                >
                                  <span className="ic s" style={{ fontSize: '12px' }}>close</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(questionnaireType === 'GForm' || questionnaireType === 'Typeform') && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '6px' }}>LINK KUESIONER EKSTERNAL</label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder={questionnaireType === 'GForm' ? 'https://docs.google.com/forms/d/...' : 'https://form.typeform.com/to/...'}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line2)', borderRadius: '8px', background: 'var(--srf)', color: 'var(--t1)', fontSize: '12.5px', outline: 'none' }}
                />
              </div>
            )}

            {questionnaireType === 'Upload' && (
              <div style={{ marginBottom: '14px', padding: '16px', border: '1px dashed var(--line2)', borderRadius: '8px', background: 'var(--srf2)', textAlign: 'center' }}>
                <span className="ic xl" style={{ color: 'var(--blue)', marginBottom: '8px' }}>description</span>
                <div style={{ fontSize: '12.5px', fontWeight: '600' }}>{uploadedFile ? uploadedFile.name : 'Unggah file kuesioner Anda (.pdf, .docx, .json)'}</div>
                <input type="file" onChange={(e) => setUploadedFile(e.target.files[0] || null)} style={{ marginTop: '10px' }} />
              </div>
            )}
          </div>
        )}

        {activeStep === 4 && (
          <div className="survey-step-panel" id="survey-step-4" style={{ display: 'block' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>CHANNEL DISTRIBUSI &amp; PENEMPATAN</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', padding: '10px 8px', border: channel === 'WA' ? '1.5px solid var(--blue)' : '1px solid var(--line)', background: channel === 'WA' ? 'var(--blue-s)' : 'var(--srf2)', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', color: channel === 'WA' ? 'var(--blue)' : 'var(--t2)', cursor: 'pointer', textAlign: 'center' }}>
                  <input type="radio" checked={channel === 'WA'} onChange={() => setChannel('WA')} style={{ display: 'none' }} />
                  <span>WhatsApp Broadcast</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', padding: '10px 8px', border: channel === 'App' ? '1.5px solid var(--blue)' : '1px solid var(--line)', background: channel === 'App' ? 'var(--blue-s)' : 'var(--srf2)', borderRadius: '8px', fontSize: '11.5px', color: channel === 'App' ? 'var(--blue)' : 'var(--t2)', cursor: 'pointer', textAlign: 'center' }}>
                  <input type="radio" checked={channel === 'App'} onChange={() => setChannel('App')} style={{ display: 'none' }} />
                  <span>In-App Mobile</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', padding: '10px 8px', border: channel === 'QR' ? '1.5px solid #10b981' : '1px solid var(--line)', background: channel === 'QR' ? 'rgba(16,185,129,0.1)' : 'var(--srf2)', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', color: channel === 'QR' ? '#10b981' : 'var(--t2)', cursor: 'pointer', textAlign: 'center' }}>
                  <input type="radio" checked={channel === 'QR'} onChange={() => setChannel('QR')} style={{ display: 'none' }} />
                  <span>QR Standee Fisik</span>
                </label>
              </div>
            </div>

            {/* Placement Location Selector */}
            <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line2)', marginBottom: '14px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="ic s" style={{ color: '#2563eb' }}>place</span> PILIH TITIK PENEMPATAN BARCODE STANDEE:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                {[
                  'Poli Kebidanan (Obgyn)', 'Poli Anak & Imunisasi', 'Poli Penyakit Dalam',
                  'Poli Gigi & Mulut', 'Farmasi / Apotek', 'Kasir & Pembayaran',
                  'Lobi Pendaftaran / Admisi', 'Instalasi Gawat Darurat (IGD)'
                ].map(loc => {
                  const isLocSelected = selectedLocations.includes(loc);
                  return (
                    <label key={loc} style={{
                      display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '5px 8px', borderRadius: '6px',
                      background: isLocSelected ? '#eff6ff' : 'var(--srf)',
                      border: isLocSelected ? '1px solid #bfdbfe' : '1px solid var(--line2)',
                      cursor: 'pointer', color: isLocSelected ? '#1e40af' : 'var(--t2)'
                    }}>
                      <input
                        type="checkbox"
                        checked={isLocSelected}
                        onChange={() => {
                          setSelectedLocations(prev =>
                            prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
                          );
                        }}
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span>{loc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {channel === 'WA' && (
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '6px' }}>PREVIEW OUTREACH (WHATSAPP)</label>
                <div style={{ background: '#EBF7EE', border: '1px solid #C3E6CB', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#222', lineHeight: '1.45', fontFamily: 'monospace' }}>
                  <strong>[RSUD Daya Care]</strong><br />
                  Halo Ibu/Bapak [Nama Pasien], mohon luangkan waktu 1 menit untuk mengisi <strong><span>{name || 'Survey Layanan'}</span></strong>. Pendapat Anda sangat penting bagi peningkatan layanan kami. Dapatkan +20 Poin Loyalitas setelah mengisi!<br />
                  Link: <span style={{ color: 'var(--blue)' }}>ananda.id/s/srv-xyz</span>
                </div>
              </div>
            )}

            {channel === 'QR' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic s" style={{ color: '#10b981', fontSize: '20px' }}>qr_code_2</span>
                <div>
                  <strong>Barcode Standee Otomatis:</strong> {selectedLocations.length} QR Code siap cetak akan digenerate otomatis untuk tiap titik lokasi terpilih.
                </div>
              </div>
            )}
          </div>
        )}

        {activeStep === 5 && (
          <div className="survey-step-panel" id="survey-step-5" style={{ display: 'block' }}>
            <div style={{ background: 'var(--green-s)', border: '1px solid var(--green-m)', padding: '10px', borderRadius: '8px', color: 'var(--green)', fontSize: '12px', fontWeight: '600', textAlign: 'center', marginBottom: '12px' }}>
              Survey Berhasil Dipublikasikan &amp; Mengumpulkan Respons!
            </div>
            
            {/* Standee Quick Action */}
            <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line2)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ic" style={{ color: '#10b981', fontSize: '24px' }}>qr_code_scanner</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)' }}>Barcode Standee Akrilik Meja Siap</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>Tersedia untuk {selectedLocations.join(', ')}</div>
                </div>
              </div>
              <button
                type="button"
                className="btn pri sm"
                onClick={() => alert(`🖨️ Menyiapkan cetak Standee Barcode Meja untuk ${selectedLocations.length} titik lokasi.`)}
                style={{ background: '#10b981', fontSize: '11px' }}>
                <span className="ic s">print</span> Cetak Barcode Meja
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <div className="mp" style={{ flex: 1, padding: '8px 10px' }}><div className="v" style={{ color: 'var(--green)', fontSize: '16px' }}>4.7<small style={{ fontSize: '10px', color: 'var(--t3)' }}>/5</small></div><div className="l" style={{ fontSize: '9.5px', marginTop: '2px' }}>CSAT Score</div></div>
              <div className="mp" style={{ flex: 1, padding: '8px 10px' }}><div className="v" style={{ fontSize: '16px' }}>84%</div><div className="l" style={{ fontSize: '9.5px', marginTop: '2px' }}>Response Rate</div></div>
              <div className="mp" style={{ flex: 1, padding: '8px 10px' }}><div className="v" style={{ color: 'var(--blue)', fontSize: '16px' }}>{Math.round(target * 0.84)}</div><div className="l" style={{ fontSize: '9.5px', marginTop: '2px' }}>Total Responden</div></div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--t3)', marginBottom: '4px' }}>SENTIMEN &amp; FEEDBACK PASIEN</label>
              <div style={{ fontSize: '11.5px', lineHeight: '1.4', color: 'var(--t2)', maxHeight: '80px', overflowY: 'auto', background: 'var(--srf2)', border: '1px solid var(--line)', borderRadius: '6px', padding: '6px 10px' }}>
                • "Kecepatan penyerapan obat sudah membaik." (Positif)<br />
                • "Ruang tunggu agak ramai di jam 10 pagi." (Netral)<br />
                • "Dokter sangat ramah dan sabar menjelaskan." (Positif)
              </div>
            </div>
          </div>
        )}

        {activeStep === 6 && (
          <div className="survey-step-panel" id="survey-step-6" style={{ display: 'block' }}>
            <div style={{ border: '1.5px solid var(--line2)', borderRadius: '12px', background: 'var(--srf2)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <span className="ic l" style={{ color: 'var(--blue)', fontSize: '32px' }}>analytics</span>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--t1)', marginTop: '6px' }}>{name ? `Laporan ${name}` : 'Laporan Survey Layanan'}</div>
                <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>Dihasilkan secara otomatis oleh Sinteta AI</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--t2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Segment Terpilih:</span><strong>{segment}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Jumlah Responden:</span><strong>{Math.round(target * 0.84)} / {target}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rata-rata Skor CSAT:</span><strong style={{ color: 'var(--green)' }}>4.7 / 5.0 (Sangat Puas)</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rekomendasi AI:</span><strong style={{ color: 'var(--blue)' }}>Tingkatkan staf apotek di jam sibuk</strong></div>
              </div>
            </div>
            <button className="btn loy" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} onClick={() => alert('Laporan Survey PDF berhasil diunduh!')}><span className="ic s">download</span>Unduh Laporan (PDF)</button>
          </div>
        )}

        <div className="modal-ft">
          {activeStep <= 4 && (
            <button className="btn ghost" id="survey-btn-prev" onClick={handlePrev}>
              {activeStep === 1 ? 'Batal' : 'Kembali'}
            </button>
          )}
          <button className="btn pri" id="survey-btn-next" onClick={handleNext}>
            {activeStep <= 3 && <>Selanjutnya<span className="ic s">arrow_forward</span></>}
            {activeStep === 4 && <>Publikasikan Survey<span className="ic s">send</span></>}
            {activeStep === 5 && <>Buat Report<span className="ic s">arrow_forward</span></>}
            {activeStep === 6 && <>Selesai<span className="ic s">check</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}
