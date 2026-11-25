import { useState, useMemo } from 'react';
import { PiiMasker } from '../utils/security';
import {
  initialClaimsData,
  anomalyPatternsData,
  regulationRulesData,
  claimAnalyticsSummary
} from '../data/bpjsClaimGuardData';

/* ─────────────────────────────────────────────────────────────────────────────
 *  BpjsClaimGuardScreen.jsx — BPJS Claim Integrity & Fraud Pre-Audit Engine
 *  Pilar 3: Business, Operational & Financial Intelligence
 *  Berdasarkan: Permenkes No. 16/2019, Permenkes No. 26/2021 & BAKB Kemenkes-BPJS
 * ─────────────────────────────────────────────────────────────────────────────*/

export default function BpjsClaimGuardScreen({ active, isPiiMasked = true }) {
  const [activeTab, setActiveTab] = useState('scrutiny'); // 'scrutiny' | 'patterns' | 'rules' | 'analytics'
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'clear'
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all'); // 'all' | deptName
  const [searchQuery, setSearchQuery] = useState('');

  // Claim Berkas State
  const [claims, setClaims] = useState(initialClaimsData);
  const [rulesConfig, setRulesConfig] = useState(regulationRulesData);

  // Active Review Modal State (Side-by-Side Inspector)
  const [selectedClaimForReview, setSelectedClaimForReview] = useState(null);
  const [customIcd, setCustomIcd] = useState('');
  const [customIcdName, setCustomIcdName] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [simulatedDocUpload, setSimulatedDocUpload] = useState(false);
  const [isDpjpNotified, setIsDpjpNotified] = useState(false);
  const [notificationToast, setNotificationToast] = useState(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Show Toast
  const showToast = (msg, type = 'success') => {
    setNotificationToast({ msg, type });
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Dynamic Calculated Metrics
  const metrics = useMemo(() => {
    const total = claims.length;
    const highRisk = claims.filter(c => c.risk === 'high').length;
    const mediumRisk = claims.filter(c => c.risk === 'medium').length;
    const cleanSafe = claims.filter(c => c.risk === 'clear').length;
    const healthIndex = total > 0 ? ((cleanSafe / total) * 100).toFixed(1) : '100.0';
    const totalTariff = claims.reduce((acc, c) => acc + c.tariff, 0);

    return { total, highRisk, mediumRisk, cleanSafe, healthIndex, totalTariff };
  }, [claims]);

  // Filtered Claims List
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      // Risk filter
      if (selectedRiskFilter !== 'all' && c.risk !== selectedRiskFilter) return false;
      // Dept filter
      if (selectedDeptFilter !== 'all' && !c.dept.toLowerCase().includes(selectedDeptFilter.toLowerCase())) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = c.id.toLowerCase().includes(q) || c.sepNumber.toLowerCase().includes(q);
        const matchName = c.patientName.toLowerCase().includes(q) || c.mrNo.toLowerCase().includes(q);
        const matchIcd = c.primaryDiagnosis.icd10.toLowerCase().includes(q) || c.primaryDiagnosis.name.toLowerCase().includes(q);
        const matchDoctor = c.doctor.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchIcd && !matchDoctor) return false;
      }
      return true;
    });
  }, [claims, selectedRiskFilter, selectedDeptFilter, searchQuery]);

  if (!active) return null;

  const handleOpenReview = (cl) => {
    setSelectedClaimForReview(cl);
    setCustomIcd(cl.primaryDiagnosis.suggestedIcd || cl.primaryDiagnosis.icd10);
    setCustomIcdName(cl.primaryDiagnosis.suggestedName || cl.primaryDiagnosis.name);
    setReviewNote('');
    setSimulatedDocUpload(false);
    setIsDpjpNotified(false);
  };

  const handleApplyAiRecommendation = () => {
    if (!selectedClaimForReview) return;
    setCustomIcd(selectedClaimForReview.primaryDiagnosis.suggestedIcd);
    setCustomIcdName(selectedClaimForReview.primaryDiagnosis.suggestedName);
    setReviewNote(`Diselaraskan dengan rekomendasi Sinteta AI: ${selectedClaimForReview.primaryDiagnosis.suggestedIcd} (${selectedClaimForReview.primaryDiagnosis.suggestedName}). Bukti rekam medis valid.`);
    setSimulatedDocUpload(true);
  };

  const handleNotifyDpjp = () => {
    setIsDpjpNotified(true);
    showToast(`📲 Notifikasi permintaan justifikasi klinis & konfirmasi EMR telah terkirim via WhatsApp SIMRS ke ${selectedClaimForReview.doctor}`, 'info');
  };

  const handleApplyCorrection = (e) => {
    e.preventDefault();
    if (!selectedClaimForReview) return;

    setClaims(prev => prev.map(c => {
      if (c.id === selectedClaimForReview.id) {
        return {
          ...c,
          primaryDiagnosis: {
            ...c.primaryDiagnosis,
            icd10: customIcd,
            name: customIcdName
          },
          risk: 'clear',
          riskLabel: '🟢 Clear & Safe (Koreksi Pre-Audit)',
          anomalyCategory: 'RESOLVED',
          anomalyTitle: 'Telah Diverifikasi & Dikoreksi',
          issueDetail: `Koreksi koding / dokumen terverifikasi oleh Auditor Koder. Catatan: ${reviewNote || 'Diselaraskan dengan rekam medis.'}`,
          recommendation: 'Berkas telah memenuhi syarat baku Permenkes & BAKB. Siap dikirim ke V-Klaim.',
          mandatoryDocs: c.mandatoryDocs.map(d => ({ ...d, status: 'valid', note: 'Terverifikasi' })),
          status: 'Cleared Pre-Audit'
        };
      }
      return c;
    }));

    const clId = selectedClaimForReview.id;
    setSelectedClaimForReview(null);
    showToast(`✅ Berkas ${clId} berhasil dikoreksi! Status berubah menjadi Clear & Safe untuk V-Klaim.`, 'success');
  };

  const handleRunBatchAudit = () => {
    setIsBatchRunning(true);
    setTimeout(() => {
      setIsBatchRunning(false);
      showToast('⚡ Pre-Audit Batch selesai! 1.420 berkas rekam medis SIMRS telah discan dalam 0.8 detik.', 'success');
    }, 1200);
  };

  const handleToggleRule = (ruleId) => {
    setRulesConfig(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextState = !r.activeStatus;
        showToast(`Parameter regulasi ${r.regTitle} ${nextState ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
        return { ...r, activeStatus: nextState };
      }
      return r;
    }));
  };

  return (
    <div className="screen on" id="s-bpjs-guard" style={{ position: 'relative' }}>

      {/* TOAST NOTIFICATION */}
      {notificationToast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
          background: notificationToast.type === 'info' ? '#1e293b' : '#065f46',
          color: '#fff', padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '13px', fontWeight: 600, animation: 'fadeIn .2s ease-in-out'
        }}>
          <span className="ic s" style={{ color: notificationToast.type === 'info' ? '#38bdf8' : '#34d399' }}>
            {notificationToast.type === 'info' ? 'info' : 'check_circle'}
          </span>
          {notificationToast.msg}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="ph" style={{ marginBottom: '16px' }}>
        <div className="ph-text">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
            <span className="ic s" style={{ fontSize: '14px' }}>verified_user</span> SINTETA BPJS CLAIM PRE-AUDIT &amp; INTEGRITY ENGINE
          </div>
          <h2>Integritas Klaim &amp; Fraud Pre-Audit BPJS</h2>
          <p>Pre-audit otomatis berkas klaim INA-CBG sesuai Permenkes No. 16/2019 &amp; 26/2021 serta BAKB Kemenkes-BPJS untuk mencegah dispute, pending, dan denda audit fraud.</p>
        </div>
        <div className="ph-act" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn ghost" onClick={handleRunBatchAudit} disabled={isBatchRunning}>
            <span className="ic s">{isBatchRunning ? 'hourglass_top' : 'sync'}</span>
            {isBatchRunning ? 'Memindai SIMRS...' : 'Jalankan Pre-Audit Batch'}
          </button>
          <button
            className="btn pri"
            onClick={() => showToast(`🚀 Mengekspor ${metrics.cleanSafe} Berkas Clean & Safe ke sistem V-Klaim BPJS Kesehatan...`, 'success')}
            style={{ background: '#10b981' }}>
            <span className="ic s">cloud_upload</span>Submit Berkas Clean ke V-Klaim
          </button>
        </div>
      </div>

      {/* TOP KPI METRICS STRIP */}
      <div className="kstrip k4" style={{ marginBottom: '16px' }}>
        <div className="kcard kg">
          <div className="kcard-ic"><span className="ic" style={{ color: '#10b981' }}>receipt_long</span></div>
          <div className="kcard-lbl">Klaim Siap Audit Bulan Ini</div>
          <div className="kcard-v">4.25<small>M</small></div>
          <div className="kcard-d up">{metrics.total} Berkas Sample Aktif ({claimAnalyticsSummary.totalClaimsReady} Total SIMRS)</div>
        </div>

        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#2563eb' }}>fact_check</span></div>
          <div className="kcard-lbl">Pre-Audit Health Index</div>
          <div className="kcard-v">{metrics.healthIndex}<small>%</small></div>
          <div className="kcard-d up"><span className="ic s">trending_up</span>+4.2% Kepatuhan BAKB</div>
        </div>

        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: metrics.highRisk + metrics.mediumRisk > 0 ? '#ef4444' : '#10b981' }}>
            {metrics.highRisk + metrics.mediumRisk > 0 ? 'warning' : 'task_alt'}
          </span></div>
          <div className="kcard-lbl">Berkas Flagged (Perlu Review)</div>
          <div className="kcard-v" style={{ color: metrics.highRisk + metrics.mediumRisk > 0 ? '#dc2626' : '#059669' }}>
            {metrics.highRisk + metrics.mediumRisk} <small>Berkas</small>
          </div>
          <div className="kcard-d fl">{metrics.highRisk} High Risk, {metrics.mediumRisk} Evidence Gap</div>
        </div>

        <div className="kcard">
          <div className="kcard-ic"><span className="ic" style={{ color: '#8b5cf6' }}>savings</span></div>
          <div className="kcard-lbl">Potensi Denda &amp; Dispute Dicegah</div>
          <div className="kcard-v">238.5<small>Jt</small></div>
          <div className="kcard-d up">Direct EMR Pre-Emptive Shield</div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1.5px solid var(--line2)', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { id: 'scrutiny',  label: 'Pre-Audit Claim Scrutiny (Pemeriksaan Berkas)', icon: 'fact_check', badge: metrics.highRisk + metrics.mediumRisk },
          { id: 'patterns',  label: 'Anomaly Pattern Detector (5 Pola Fraud)',       icon: 'travel_explore' },
          { id: 'rules',     label: 'Permenkes & INA-CBG Rule Config',                icon: 'gavel' },
          { id: 'analytics', label: 'Pre-Audit Analytics & Financial Savings',       icon: 'monetization_on' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: activeTab === t.id ? '#10b981' : 'var(--srf)',
              color: activeTab === t.id ? '#fff' : 'var(--t2)',
              display: 'flex', alignItems: 'center', gap: '6px', transition: '.15s', whiteSpace: 'nowrap'
            }}>
            <span className="ic s" style={{ fontSize: '16px' }}>{t.icon}</span>
            {t.label}
            {t.badge > 0 && (
              <span style={{
                background: activeTab === t.id ? '#ef4444' : '#fee2e2',
                color: activeTab === t.id ? '#fff' : '#dc2626',
                borderRadius: '10px', fontSize: '10.5px', padding: '1px 7px', fontWeight: 700
              }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
       * MODAL: SIDE-BY-SIDE EMR VS PRE-AUDIT REVIEW & AUTO-FIX WORKSPACE
       * ═════════════════════════════════════════════════════════════════════*/}
      {selectedClaimForReview && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--srf)', borderRadius: '16px', width: '100%', maxWidth: '1080px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', border: '1.5px solid var(--line2)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--line2)', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="ic" style={{ color: '#10b981', fontSize: '20px' }}>medical_services</span>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--t1)' }}>
                    Pre-Audit Clinical Scrutiny: #{selectedClaimForReview.id}
                  </h3>
                  <span className={`bdg ${selectedClaimForReview.risk === 'high' ? 'r' : selectedClaimForReview.risk === 'medium' ? 'purple' : 'g'}`}>
                    {selectedClaimForReview.riskLabel}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '3px' }}>
                  No. SEP: <strong>{selectedClaimForReview.sepNumber}</strong> • Pasien: <strong>{isPiiMasked ? PiiMasker.maskName(selectedClaimForReview.patientName) : selectedClaimForReview.patientName}</strong> ({isPiiMasked ? PiiMasker.maskRmNumber(selectedClaimForReview.mrNo) : selectedClaimForReview.mrNo}) • DPJP: <strong>{selectedClaimForReview.doctor}</strong> • LOS: {selectedClaimForReview.los}
                </div>
              </div>
              <button
                onClick={() => setSelectedClaimForReview(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--t2)', padding: '6px', borderRadius: '6px' }}>
                <span className="ic">close</span>
              </button>
            </div>

            {/* Modal Body - 2 Columns Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', flex: 1, overflowY: 'auto' }}>

              {/* LEFT COLUMN: EMR Clinical Ground Truth */}
              <div style={{ padding: '20px', borderRight: '1px solid var(--line2)', background: 'var(--srf)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s" style={{ color: '#2563eb' }}>clinical_notes</span> Rekam Medis Elektronik (Ground Truth)
                </div>

                {/* Vital Signs Grid */}
                <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line2)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--t3)', marginBottom: '8px' }}>TANDA-TANDA VITAL (TTV) MASUK:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div style={{ background: 'var(--srf)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>Tekanan Darah</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t1)' }}>{selectedClaimForReview.vitals.td}</div>
                    </div>
                    <div style={{ background: 'var(--srf)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>Nadi</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t1)' }}>{selectedClaimForReview.vitals.hr}</div>
                    </div>
                    <div style={{ background: 'var(--srf)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>Respirasi</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t1)' }}>{selectedClaimForReview.vitals.rr}</div>
                    </div>
                    <div style={{ background: 'var(--srf)', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>Suhu</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t1)' }}>{selectedClaimForReview.vitals.temp}</div>
                    </div>
                  </div>
                </div>

                {/* Lab Results Table */}
                {selectedClaimForReview.labResults && selectedClaimForReview.labResults.length > 0 && (
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line2)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--t3)', marginBottom: '6px' }}>HASIL LABORATORIUM / PENUNJANG KRITIS:</div>
                    <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ color: 'var(--t3)', borderBottom: '1px solid var(--line2)', textAlign: 'left' }}>
                          <th style={{ padding: '4px' }}>Parameter</th>
                          <th style={{ padding: '4px' }}>Hasil Aktual</th>
                          <th style={{ padding: '4px' }}>Nilai Rujukan</th>
                          <th style={{ padding: '4px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClaimForReview.labResults.map((lr, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--line2)' }}>
                            <td style={{ padding: '6px 4px', fontWeight: 600 }}>{lr.test}</td>
                            <td style={{ padding: '6px 4px', fontWeight: 700, color: lr.status === 'missing' ? '#dc2626' : lr.status === 'abnormal' ? '#d97706' : '#059669' }}>
                              {lr.result}
                            </td>
                            <td style={{ padding: '6px 4px', color: 'var(--t3)' }}>{lr.normal}</td>
                            <td style={{ padding: '6px 4px' }}>
                              <span style={{
                                padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                                background: lr.status === 'missing' ? '#fee2e2' : lr.status === 'abnormal' ? '#fef3c7' : '#dcfce7',
                                color: lr.status === 'missing' ? '#b91c1c' : lr.status === 'abnormal' ? '#b45309' : '#15803d'
                              }}>
                                {lr.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SOAP Note */}
                <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line2)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--t3)', marginBottom: '4px' }}>CATATAN RESUME MEDIS &amp; CPPT DPJP:</div>
                  <div style={{ fontSize: '12px', color: 'var(--t1)', fontStyle: 'italic', lineHeight: 1.5, background: 'var(--srf)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--line2)' }}>
                    &ldquo;{selectedClaimForReview.soapNoteSummary}&rdquo;
                  </div>
                </div>

                {/* Mandatory Checklist */}
                <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line2)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--t3)', marginBottom: '6px' }}>CHECKLIST BERKAS MANDATORI PERMENKES:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedClaimForReview.mandatoryDocs.map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', background: 'var(--srf)', padding: '6px 8px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="ic s" style={{ color: doc.status === 'valid' || simulatedDocUpload ? '#10b981' : '#ef4444', fontSize: '16px' }}>
                            {doc.status === 'valid' || simulatedDocUpload ? 'check_circle' : 'cancel'}
                          </span>
                          <span style={{ color: 'var(--t1)', fontWeight: 500 }}>{doc.name}</span>
                        </div>
                        {doc.note && !simulatedDocUpload && (
                          <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 600 }}>{doc.note}</span>
                        )}
                        {simulatedDocUpload && (
                          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>✅ Berkas Terverifikasi</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Pre-Audit AI Intelligence & Koder Workspace */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg2)' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="ic s" style={{ color: '#10b981' }}>psychology</span> Rekomendasi Sinteta Pre-Audit
                </div>

                {/* Anomaly Detection Banner */}
                <div style={{
                  padding: '14px', borderRadius: '10px',
                  background: selectedClaimForReview.risk === 'high' ? '#fef2f2' : selectedClaimForReview.risk === 'medium' ? '#fffbeb' : '#f0fdf4',
                  border: `1.5px solid ${selectedClaimForReview.risk === 'high' ? '#fca5a5' : selectedClaimForReview.risk === 'medium' ? '#fcd34d' : '#86efac'}`
                }}>
                  <div style={{
                    fontWeight: 800, fontSize: '13px',
                    color: selectedClaimForReview.risk === 'high' ? '#991b1b' : selectedClaimForReview.risk === 'medium' ? '#92400e' : '#166534',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span className="ic s">{selectedClaimForReview.risk === 'high' ? 'report_problem' : selectedClaimForReview.risk === 'medium' ? 'warning' : 'verified'}</span>
                    {selectedClaimForReview.anomalyTitle}
                  </div>
                  <div style={{
                    fontSize: '12px', marginTop: '6px', lineHeight: 1.5,
                    color: selectedClaimForReview.risk === 'high' ? '#b91c1c' : selectedClaimForReview.risk === 'medium' ? '#b45309' : '#14532d'
                  }}>
                    {selectedClaimForReview.issueDetail}
                  </div>
                </div>

                {/* AI Recommendation Box */}
                <div style={{ padding: '14px', borderRadius: '10px', background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
                  <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span className="ic s">lightbulb</span> REKOMENDASI PERBAIKAN SINTETA:
                  </div>
                  <div style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: 1.5, marginBottom: '10px' }}>
                    {selectedClaimForReview.recommendation}
                  </div>

                  {selectedClaimForReview.primaryDiagnosis.suggestedIcd && (
                    <button
                      type="button"
                      onClick={handleApplyAiRecommendation}
                      className="btn pri sm"
                      style={{ background: '#2563eb', width: '100%', justifyContent: 'center' }}>
                      <span className="ic s">auto_fix_high</span> Terapkan Rekomendasi ICD: {selectedClaimForReview.primaryDiagnosis.suggestedIcd}
                    </button>
                  )}
                </div>

                {/* Action Form */}
                <form onSubmit={handleApplyCorrection} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '4px' }}>
                      KODE ICD-10 DIAGNOSIS UTAMA
                    </label>
                    <input
                      type="text"
                      value={customIcd}
                      onChange={e => setCustomIcd(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line2)', background: 'var(--srf)', fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '4px' }}>
                      DESKRIPSI DIAGNOSIS UTAMA
                    </label>
                    <input
                      type="text"
                      value={customIcdName}
                      onChange={e => setCustomIcdName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line2)', background: 'var(--srf)', fontSize: '12px', color: 'var(--t1)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', marginBottom: '4px' }}>
                      CATATAN VERIFIKATOR / KODER RS
                    </label>
                    <input
                      type="text"
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      placeholder="Contoh: Berkas lab telah diselaraskan dengan rekam medis dokter."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line2)', background: 'var(--srf)', fontSize: '12px', color: 'var(--t1)' }}
                    />
                  </div>

                  {/* DPJP Collaboration and Upload Simulation */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleNotifyDpjp}
                      className="btn ghost sm"
                      style={{ flex: 1, fontSize: '11px', color: isDpjpNotified ? '#10b981' : 'var(--t2)' }}>
                      <span className="ic s">{isDpjpNotified ? 'check' : 'send_to_mobile'}</span>
                      {isDpjpNotified ? 'DPJP Dinotifikasi' : 'Minta Justifikasi DPJP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatedDocUpload(true);
                        showToast('📎 Dokumen pendukung lab / laporan operasi berhasil diunggah ke berkas klaim digital.', 'success');
                      }}
                      className="btn ghost sm"
                      style={{ flex: 1, fontSize: '11px', color: simulatedDocUpload ? '#10b981' : 'var(--t2)' }}>
                      <span className="ic s">{simulatedDocUpload ? 'task_alt' : 'upload_file'}</span>
                      {simulatedDocUpload ? 'Dokumen Terlampir' : 'Simulasi Unggah Bukti'}
                    </button>
                  </div>

                  {/* Submit Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px', borderTop: '1px solid var(--line2)', paddingTop: '12px' }}>
                    <button type="button" className="btn ghost" onClick={() => setSelectedClaimForReview(null)}>
                      Batal
                    </button>
                    <button type="submit" className="btn pri" style={{ background: '#10b981' }}>
                      <span className="ic s">verified</span> Terapkan Koreksi &amp; Tandai Clear
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 1: PRE-AUDIT CLAIM SCRUTINY (TABEL PERIKSA BERKAS KLAIM)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'scrutiny' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* RISK CARDS SUMMARY & FILTER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div
              onClick={() => setSelectedRiskFilter('all')}
              style={{
                background: selectedRiskFilter === 'all' ? '#eff6ff' : 'var(--srf)',
                border: selectedRiskFilter === 'all' ? '2px solid #2563eb' : '1px solid var(--line2)',
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: '.15s'
              }}>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)', fontWeight: 600 }}>Semua Berkas Klaim</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--t1)', marginTop: '2px' }}>{metrics.total}</div>
              <div style={{ fontSize: '10.5px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>Total Rp {(metrics.totalTariff / 1000000).toFixed(1)} Jt</div>
            </div>

            <div
              onClick={() => setSelectedRiskFilter('high')}
              style={{
                background: selectedRiskFilter === 'high' ? '#fef2f2' : 'var(--srf)',
                border: selectedRiskFilter === 'high' ? '2px solid #ef4444' : '1px solid var(--line2)',
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: '.15s'
              }}>
              <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 600 }}>🚨 High Risk Fraud</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>{metrics.highRisk} Berkas</div>
              <div style={{ fontSize: '10.5px', color: '#b91c1c', fontWeight: 600, marginTop: '2px' }}>Upcoding &amp; Unbundling</div>
            </div>

            <div
              onClick={() => setSelectedRiskFilter('medium')}
              style={{
                background: selectedRiskFilter === 'medium' ? '#fffbeb' : 'var(--srf)',
                border: selectedRiskFilter === 'medium' ? '2px solid #f59e0b' : '1px solid var(--line2)',
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: '.15s'
              }}>
              <div style={{ fontSize: '11.5px', color: '#d97706', fontWeight: 600 }}>⚠️ Dispute / Evidence Gap</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{metrics.mediumRisk} Berkas</div>
              <div style={{ fontSize: '10.5px', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>Lab &amp; Justifikasi Gap</div>
            </div>

            <div
              onClick={() => setSelectedRiskFilter('clear')}
              style={{
                background: selectedRiskFilter === 'clear' ? '#f0fdf4' : 'var(--srf)',
                border: selectedRiskFilter === 'clear' ? '2px solid #10b981' : '1px solid var(--line2)',
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: '.15s'
              }}>
              <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>🟢 Clear &amp; Safe to Submit</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{metrics.cleanSafe} Berkas</div>
              <div style={{ fontSize: '10.5px', color: '#047857', fontWeight: 600, marginTop: '2px' }}>Siap Kirim ke V-Klaim</div>
            </div>
          </div>

          {/* SEARCH & DEPARTMENT FILTER BAR */}
          <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <span className="ic s" style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--t3)' }}>search</span>
              <input
                type="text"
                placeholder="Cari berdasarkan No. SEP, Nama Pasien, No. RM, ICD-10, atau DPJP..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '7px 10px 7px 34px', borderRadius: '8px', border: '1px solid var(--line2)', background: 'var(--bg2)', fontSize: '12px', color: 'var(--t1)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--t3)', fontWeight: 600 }}>Poli/SMF:</span>
              {['all', 'Kebidanan', 'Penyakit Dalam', 'Anak', 'Jantung', 'Bedah'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                    background: selectedDeptFilter === dept ? '#2563eb' : 'var(--bg2)',
                    color: selectedDeptFilter === dept ? '#fff' : 'var(--t2)',
                    transition: '.15s'
                  }}>
                  {dept === 'all' ? 'Semua Unit' : dept}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE OF CLAIMS */}
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Hasil Scrutiny Pre-Audit Berkas Klaim INA-CBG ({filteredClaims.length} Berkas Ditampilkan)</div>
                <div className="card-sub">Klik &quot;Review &amp; Correct&quot; untuk membuka side-by-side EMR inspector, menyelaraskan ICD-10, atau meminta justifikasi DPJP.</div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="tbl" style={{ fontSize: '12px', minWidth: '950px' }}>
                <thead>
                  <tr>
                    <th>No. SEP / Pasien</th>
                    <th>Departemen &amp; DPJP</th>
                    <th>Kode ICD-10 &amp; ICD-9</th>
                    <th>Tarif INA-CBG</th>
                    <th>Status Pre-Audit Risk</th>
                    <th>Deteksi Anomali &amp; Catatan</th>
                    <th style={{ textAlign: 'center' }}>Aksi Pre-Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--t3)' }}>
                        <span className="ic" style={{ fontSize: '32px', display: 'block', marginBottom: '6px', color: 'var(--t3)' }}>folder_off</span>
                        Tidak ada berkas klaim yang cocok dengan kriteria filter saat ini.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map(cl => (
                      <tr key={cl.id}>
                        <td>
                          <div className="td1" style={{ fontWeight: 700 }}>{cl.id}</div>
                          <div style={{ fontSize: '11px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{isPiiMasked ? PiiMasker.maskName(cl.patientName) : cl.patientName}</span>
                            <span>({isPiiMasked ? PiiMasker.maskRmNumber(cl.mrNo) : cl.mrNo})</span>
                            {isPiiMasked && <span className="bdg g" style={{ fontSize: '8.5px', padding: '0 4px' }}>PDP</span>}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--t3)', fontFamily: 'monospace' }}>{cl.sepNumber}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{cl.dept}</div>
                          <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{cl.doctor}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--t1)' }}>{cl.primaryDiagnosis.icd10}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--t2)' }}>{cl.primaryDiagnosis.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>
                            Prosedur: {cl.procedures.map(p => `${p.icd9}`).join(', ') || '-'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#2563eb' }}>Rp {cl.tariff.toLocaleString('id-ID')}</div>
                          <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{cl.inaCbgCode}</div>
                        </td>
                        <td>
                          <span className={`bdg ${cl.risk === 'high' ? 'r' : cl.risk === 'medium' ? 'purple' : 'g'}`} style={{ fontWeight: 700 }}>
                            {cl.riskLabel}
                          </span>
                        </td>
                        <td style={{ fontSize: '11px', maxWidth: '240px' }}>
                          <div style={{ fontWeight: 700, color: cl.risk === 'high' ? '#dc2626' : cl.risk === 'medium' ? '#d97706' : '#059669' }}>
                            {cl.anomalyTitle}
                          </div>
                          <div style={{ color: 'var(--t3)', marginTop: '2px', lineHeight: 1.4 }}>
                            {cl.issueDetail}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {cl.risk !== 'clear' ? (
                            <button
                              className="btn pri sm"
                              onClick={() => handleOpenReview(cl)}
                              style={{ background: '#10b981', whiteSpace: 'nowrap' }}>
                              <span className="ic s">edit</span> Review &amp; Correct
                            </button>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="ic s">task_alt</span> Ready V-Klaim
                              </span>
                              <button
                                className="btn ghost sm"
                                onClick={() => handleOpenReview(cl)}
                                style={{ fontSize: '10px', padding: '2px 6px' }}>
                                Lihat EMR
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 2: ANOMALY PATTERN DETECTOR (ANALISIS 5 POLA FRAUD PERMENKES)
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'patterns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className="ic" style={{ color: '#38bdf8', fontSize: '28px' }}>travel_explore</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Sinteta AI 5-Pola Fraud &amp; Anomaly Detector Engine</h3>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                  Deteksi otomatis berdasarkan standar Permenkes No. 16 Tahun 2019, Permenkes No. 26 Tahun 2021 &amp; Berita Acara Kesepakatan Bersama (BAKB) Kemenkes-BPJS.
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {anomalyPatternsData.map(pat => (
              <div key={pat.id} className="card" style={{ borderLeft: `5px solid ${pat.color}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--t1)' }}>{pat.title}</strong>
                      <div style={{ fontSize: '10.5px', color: 'var(--t3)', marginTop: '2px' }}>{pat.regulationRef}</div>
                    </div>
                    <span className="bdg r" style={{ background: `${pat.color}20`, color: pat.color, fontWeight: 700 }}>
                      {pat.flaggedCount} Kasus Flagged
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {pat.description}
                  </p>

                  <div style={{ background: 'var(--bg2)', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', color: 'var(--t1)', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--t2)', marginBottom: '4px' }}>Contoh Kasus Riil di RS:</div>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--t2)' }}>
                      {pat.examples.map((ex, i) => (
                        <li key={i} style={{ marginBottom: '2px' }}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--line2)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--t3)' }}>
                    Potensi Dispute: <strong style={{ color: pat.color }}>{pat.disputeLossRisk}</strong>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="ic s">psychology</span> AI Scrutiny Active
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 3: PERMENKES & INA-CBG RULE CONFIG
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-hd">
              <div className="card-hd-l">
                <div className="card-title">Parameter Regulasi &amp; Mandatory Checklist Pre-Audit Engine</div>
                <div className="card-sub">Konfigurasi rule set verifikasi otomatis kepatuhan koding ICD-10, ICD-9-CM, restriksi Fornas, dan mitigasi Fraud JKN.</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {rulesConfig.map(rule => (
                <div key={rule.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg2)', border: '1px solid var(--line2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--t1)' }}>{rule.regTitle}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t2)' }}>{rule.subtitle}</div>
                    </div>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      style={{
                        padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 700,
                        background: rule.activeStatus ? '#10b981' : '#cbd5e1',
                        color: rule.activeStatus ? '#fff' : '#475569',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                      <span className="ic s" style={{ fontSize: '14px' }}>{rule.activeStatus ? 'check_circle' : 'do_not_disturb'}</span>
                      {rule.activeStatus ? 'Rule Aktif' : 'Non-Aktif'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: 'var(--t2)', background: 'var(--srf)', padding: '10px 12px', borderRadius: '8px', marginTop: '10px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: '2px' }}>Poin Pengawasan Kunci:</div>
                    {rule.articles.map((art, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="ic s" style={{ color: '#10b981', fontSize: '14px' }}>verified</span>
                        {art}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--t3)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{rule.engineChecklistCount} Parameter Koding Otomatis</span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>Tersinkronisasi dengan Database V-Klaim Kemenkes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
       * TAB 4: PRE-AUDIT ANALYTICS & FINANCIAL SAVINGS
       * ═════════════════════════════════════════════════════════════════════*/}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="g21">
            <div className="card">
              <div className="card-hd">
                <div className="card-hd-l">
                  <div className="card-title">Dampak Penghematan Finansial RS dari Pre-Audit Sinteta</div>
                  <div className="card-sub">Estimasi rupiah klaim yang terselamatkan dari potensi dispute, pending berkas, dan penalti audit BPJS.</div>
                </div>
              </div>
              <table className="tbl" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Kategori Risiko Mencegah</th>
                    <th style={{ textAlign: 'right' }}>Jumlah Berkas</th>
                    <th style={{ textAlign: 'right' }}>Potensi Kerugian/Denda</th>
                    <th style={{ textAlign: 'right' }}>Status Penghematan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="td1"><strong>Pencegahan Denda Fraud Upcoding</strong></td>
                    <td style={{ textAlign: 'right' }}>14 Berkas</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>Rp 94.600.000</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>Terselamatkan 100%</td>
                  </tr>
                  <tr>
                    <td className="td1"><strong>Pencegahan Rejeksi Unbundling</strong></td>
                    <td style={{ textAlign: 'right' }}>8 Berkas</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>Rp 54.800.000</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>Terselamatkan 100%</td>
                  </tr>
                  <tr>
                    <td className="td1"><strong>Pencegahan Dispute Evidence &amp; Lab Gap</strong></td>
                    <td style={{ textAlign: 'right' }}>11 Berkas</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>Rp 48.200.000</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>Terselamatkan 100%</td>
                  </tr>
                  <tr>
                    <td className="td1"><strong>Pencegahan Audit Readmission &lt; 7 Hari</strong></td>
                    <td style={{ textAlign: 'right' }}>5 Berkas</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>Rp 22.400.000</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>Terselamatkan 100%</td>
                  </tr>
                  <tr>
                    <td className="td1"><strong>Pencegahan Anomali LOS &amp; Prosedur Batal</strong></td>
                    <td style={{ textAlign: 'right' }}>4 Berkas</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>Rp 18.500.000</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>Terselamatkan 100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col">
              <div className="card">
                <div className="card-hd"><div className="card-hd-l"><div className="card-title">Penurunan Rasio Dispute Klaim</div></div></div>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '42px', fontWeight: '800', color: '#10b981' }}>{claimAnalyticsSummary.disputeRatioCurrent}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#064e3b' }}>Rasio Dispute Klaim Rumah Sakit Saat Ini</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '8px' }}>
                    Turun signifikan dari <strong>{claimAnalyticsSummary.disputeRatioBefore}</strong> sebelum menggunakan Sinteta Pre-Audit Engine.
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-hd"><div className="card-hd-l"><div className="card-title">Tingkat Kepatuhan per SMF / Poli</div></div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
                  {claimAnalyticsSummary.byDepartmentRisk.map((dep, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--line2)' }}>
                      <div>
                        <strong>{dep.dept}</strong>
                        <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>{dep.claims} Klaim ({dep.flagged} Flagged)</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, color: '#10b981' }}>{dep.compliance}</span>
                        <div style={{ fontSize: '10px', color: '#dc2626' }}>Mitigasi {dep.riskRp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
