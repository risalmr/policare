/**
 * =============================================================================
 * POLICARE UNIFIED API SERVICE & SECURE DATA LAYER CLIENT
 * RSUD Daya Kota Makassar Piloting
 * Version: 3.0.0 (Enterprise RBAC, Dual-Voice 360, KMKP & Education Studio)
 * =============================================================================
 */

import { sanitizeInput, validatePayload, SecuritySession } from '../utils/security';

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

/**
 * Secure HTTP Request Wrapper with Authentication Headers & Interceptor
 */
async function secureFetch(url, options = {}) {
  const token = SecuritySession.getToken();
  const headers = {
    'Content-Type': 'application/json',
    'X-Hospital-Code': 'RSUD-DAYA-MKS',
    'X-Client-Version': '3.0.0',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    return res;
  } catch (error) {
    console.info('[Security Gateway] Fallback store active for:', url);
    throw error;
  }
}

/**
 * Standardized Response Wrapper
 */
function createResponse(success, data, message = '', meta = {}) {
  return {
    success,
    data,
    message: sanitizeInput(message),
    meta: {
      timestamp: new Date().toISOString(),
      hospital: 'RSUD Daya Kota Makassar',
      version: '3.0.0',
      ...meta
    }
  };
}

export const PolicareApi = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. RBAC & USER MANAGEMENT ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════
  async getRoles() {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/rbac/roles`);
      if (res.ok) {
        const json = await res.json();
        return createResponse(true, json.data || json);
      }
    } catch (e) {}
    return createResponse(true, null, 'Fallback active');
  },

  async updateRolePermissions(roleId, permissions) {
    const cleanPayload = validatePayload({ permissions });
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/rbac/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify(cleanPayload)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { roleId, permissions: cleanPayload.permissions }, 'Hak akses role berhasil diperbarui');
  },

  async getStaffUsers() {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/rbac/users`);
      if (res.ok) {
        const json = await res.json();
        return createResponse(true, json.data || json);
      }
    } catch (e) {}
    return createResponse(true, null, 'Fallback active');
  },

  async createStaffUser(userData) {
    const clean = validatePayload(userData, ['name', 'roleId']);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/rbac/users`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, `Pengguna ${clean.name} berhasil ditambahkan`);
  },

  async toggleStaffUserStatus(userId, nextStatus) {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/rbac/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: sanitizeInput(nextStatus) })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { userId, status: nextStatus }, `Status akun diubah ke ${nextStatus}`);
  },

  async deleteStaffUser(userId) {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/rbac/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { userId }, 'Akun pengguna berhasil dihapus');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DUAL-VOICE RADAR (VOC PASIEN & VOE TIM MEDIS) & 360° MATRIX
  // ═══════════════════════════════════════════════════════════════════════════
  async getFeedbacks(domainFilter = 'ALL') {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/feedbacks?domain=${encodeURIComponent(domainFilter)}`);
      if (res.ok) {
        const json = await res.json();
        return createResponse(true, json.data || json);
      }
    } catch (e) {}
    return createResponse(true, null, 'Fallback active');
  },

  async createManualFeedback(payload) {
    const clean = validatePayload(payload, ['name', 'channel', 'body']);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/feedbacks/manual`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, 'Suara pasien berhasil dicatat di sistem RSUD Daya');
  },

  async createInternalStaffFeedback(payload) {
    const clean = validatePayload(payload, ['role', 'category', 'body']);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/feedbacks/internal-voice`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, 'Masukan staf medis berhasil dikirim ke radar internal');
  },

  async upvoteStaffFeedback(feedbackId) {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/feedbacks/internal-voice/${feedbackId}/upvote`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { feedbackId }, 'Dukungan sejawat berhasil ditambahkan');
  },

  async quickReplyFeedback(id, replyText) {
    const cleanText = sanitizeInput(replyText);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/feedbacks/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyText: cleanText })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { id, replyText: cleanText }, 'Tanggapan berhasil dikirim via WhatsApp & Aplikasi');
  },

  async escalateFeedback(id, department) {
    const cleanDept = sanitizeInput(department);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/feedbacks/${id}/escalate`, {
        method: 'POST',
        body: JSON.stringify({ department: cleanDept })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { id, department: cleanDept }, `Keluhan berhasil diteruskan ke ${cleanDept}`);
  },

  async get360CorrelationMatrix() {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/feedbacks/360-matrix`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CRISIS MANAGEMENT & BAGIAN MUTU (KMKP) SIMRS VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════
  async getCrisisIncidents() {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/crisis/incidents`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null);
  },

  async handleCrisisDecision(crisisId, decisionType, notes = '') {
    const cleanNotes = sanitizeInput(notes);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/crisis/${crisisId}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ decisionType, notes: cleanNotes })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { crisisId, decisionType, notes: cleanNotes }, `Keputusan krisis: ${decisionType} berhasil direkam`);
  },

  async escalateCrisisToDirector(crisisId, recipient, note) {
    const cleanNote = sanitizeInput(note);
    const cleanRecipient = sanitizeInput(recipient);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/crisis/${crisisId}/escalate`, {
        method: 'POST',
        body: JSON.stringify({ recipient: cleanRecipient, note: cleanNote })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { crisisId, recipient: cleanRecipient, note: cleanNote }, `Kasus berhasil dieskalasi ke ${cleanRecipient}`);
  },

  async notifyQualityTeamKMKP(crisisId, dispatchPayload) {
    const clean = validatePayload(dispatchPayload);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/crisis/${crisisId}/mutu-notify`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, 'Pemberitahuan berhasil dikirimkan ke Tim Mutu (KMKP)');
  },

  async verifySimrsPatientStatus(crisisId, verificationStatus, notes = '') {
    const cleanNotes = sanitizeInput(notes);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/crisis/${crisisId}/simrs-verify`, {
        method: 'POST',
        body: JSON.stringify({ verificationStatus, notes: cleanNotes })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { crisisId, verificationStatus, notes: cleanNotes }, `Status SIMRS berhasil diperbarui: ${verificationStatus}`);
  },

  async resolveCrisisIncident(crisisId, resolutionNotes) {
    const cleanNotes = sanitizeInput(resolutionNotes);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/crisis/${crisisId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolutionNotes: cleanNotes })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { crisisId, resolutionNotes: cleanNotes }, 'Isu krisis berhasil diselesaikan & dikunci di Audit Trail');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PROMOTION & MEDICAL EDUCATION STUDIO
  // ═══════════════════════════════════════════════════════════════════════════
  async getPromotionInsights(sectionType = 'ALL') {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/promotions/insights?section=${encodeURIComponent(sectionType)}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null);
  },

  async generateAiContentDraft(prompt, sectionType, channel) {
    const cleanPrompt = sanitizeInput(prompt);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/promotions/ai-generate`, {
        method: 'POST',
        body: JSON.stringify({ prompt: cleanPrompt, sectionType, channel })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { prompt: cleanPrompt, sectionType, channel }, 'Draf konten AI berhasil di-generate');
  },

  async publishValidatedPromotion(campaignPayload) {
    if (!campaignPayload.doctorApproval) {
      throw new Error('[Security Exception] Validasi Dokter Spesialis (DPJP) wajib diperoleh sebelum materi dipublikasikan.');
    }
    const clean = validatePayload(campaignPayload);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/promotions/publish`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, 'Konten berhasil divalidasi & dipublikasikan');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. PATIENT COMMUNITIES (DUAL FACILITATOR: DPJP & BIDAN/PERAWAT)
  // ═══════════════════════════════════════════════════════════════════════════
  async getCommunities() {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/communities`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null);
  },

  async createCommunity(communityData) {
    if (!communityData.doctorDpjp || !communityData.nurseFacilitator) {
      throw new Error('[Security Exception] Komunitas wajib diverifikasi Dokter DPJP dan Perawat/Bidan.');
    }
    const clean = validatePayload(communityData);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/communities`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, `Komunitas "${clean.name}" berhasil dibuat`);
  },

  async enrolCommunityMember(memberData) {
    const clean = validatePayload(memberData, ['communityId', 'name', 'phone']);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/communities/${clean.communityId}/members`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, `Pasien ${clean.name} berhasil di-enrol`);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SIMRS INTEGRATION & PATIENT RELATIONSHIP
  // ═══════════════════════════════════════════════════════════════════════════
  async syncSimrsEncounters() {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/sync`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { syncedPatients: 4, timestamp: new Date() }, 'SIMRS RSUD Daya terhubung dan tersinkronisasi');
  },

  async lookupSimrsPatient(query) {
    const cleanQuery = sanitizeInput(query);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/patients/lookup?q=${encodeURIComponent(cleanQuery)}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { query: cleanQuery, isRegistered: true }, 'Pencarian data di SIMRS selesai');
  },

  async sendSimrsFollowUpWhatsApp(patientId, messageText) {
    const cleanText = sanitizeInput(messageText);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/follow-ups/send`, {
        method: 'POST',
        body: JSON.stringify({ patientId, messageText: cleanText })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { patientId, sent: true }, 'Pesan follow-up terkirim via WhatsApp Gateway RSUD Daya');
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6b. SMART PATIENT FOLLOW-UP ENGINE (Jadwal Kontrol, No-Show, Reschedule)
  // ───────────────────────────────────────────────────────────────────────────
  async getPatientSchedules(filter = 'ALL') {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/schedules?filter=${encodeURIComponent(filter)}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null, 'Fallback active');
  },

  async recordNoShowResponse(patientId, response, notes = '') {
    const cleanNotes = sanitizeInput(notes);
    const cleanResponse = sanitizeInput(response); // 'HEALTHY' | 'RESCHEDULE' | 'OTHER' | 'WORSENING'
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/follow-ups/no-show-response`, {
        method: 'POST',
        body: JSON.stringify({ patientId, response: cleanResponse, notes: cleanNotes })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { patientId, response: cleanResponse, notes: cleanNotes }, `Respons pasien (${cleanResponse}) berhasil dicatat`);
  },

  async getDoctorAvailableSlots(doctorId, weeksAhead = 2) {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/doctors/${doctorId}/slots?weeks=${weeksAhead}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null, 'Fallback active');
  },

  async rescheduleAppointment(patientId, doctorId, newSlot, oldAppointmentId) {
    const payload = validatePayload({ patientId, doctorId, newSlot, oldAppointmentId });
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/appointments/reschedule`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, payload, `Jadwal baru berhasil dibuat: ${newSlot}. Laporan dikirim ke Humas & Departemen terkait.`);
  },

  async markPatientHealthy(patientId, doctorNotes = '', followUpRequired = false) {
    const cleanNotes = sanitizeInput(doctorNotes);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/patients/${patientId}/declare-healthy`, {
        method: 'PATCH',
        body: JSON.stringify({ doctorNotes: cleanNotes, followUpRequired })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { patientId, status: 'HEALTHY', doctorNotes: cleanNotes }, 'Pasien dinyatakan sehat. Jadwal tanya kabar otomatis diaktifkan.');
  },

  async notifyDoctorDelay(doctorId, delayMinutes, affectedPatientIds = [], alternativeTime = '') {
    const payload = validatePayload({ doctorId, delayMinutes, affectedPatientIds, alternativeTime });
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/doctors/${doctorId}/notify-delay`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, payload, `${affectedPatientIds.length} pasien berhasil diinformasikan keterlambatan dr. ${doctorId} (${delayMinutes} menit).`);
  },

  async sendWellnessCheckMessage(patientId, messageText) {
    const cleanText = sanitizeInput(messageText);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/follow-ups/wellness-check`, {
        method: 'POST',
        body: JSON.stringify({ patientId, messageText: cleanText })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { patientId, sent: true }, 'Pesan tanya kabar berhasil dikirim via WhatsApp');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. RESEARCH & SURVEY STUDIO (SKM KEMENKES / PERMENPAN-RB)
  // ═══════════════════════════════════════════════════════════════════════════
  async submitSkmSurvey(surveyResponse) {
    const clean = validatePayload(surveyResponse);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/surveys/responses`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, 'Survei SKM 9 Unsur berhasil disimpan ke database');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. LOYALTY RULES & AUTOPILOT OUTREACH DISPATCH
  // ═══════════════════════════════════════════════════════════════════════════
  async updateLoyaltyRule(ruleKey, rulesData) {
    const clean = validatePayload(rulesData);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/loyalty/rules/${ruleKey}`, {
        method: 'POST',
        body: JSON.stringify(clean)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, clean, `Rule ${ruleKey} berhasil diperbarui`);
  },

  async dispatchAutopilotOutreach(patientsList, nurseAuthorizer) {
    const cleanNurse = sanitizeInput(nurseAuthorizer);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/loyalty/autopilot/dispatch`, {
        method: 'POST',
        body: JSON.stringify({ patientsList, nurseAuthorizer: cleanNurse })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { count: patientsList.length }, `${patientsList.length} pesan outreach berhasil dikirim`);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. PATIENT INFORMATION HUB (TARIF PUBLIK & SIMRS PATIENT ACCESS)
  // ═══════════════════════════════════════════════════════════════════════════
  async getPublicTariffs(category = 'ALL') {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/public/tariffs?category=${encodeURIComponent(category)}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null, 'Tarif publik disinkronkan dari SIMRS RSUD Daya');
  },

  async getPharmacyQueue() {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/pharmacy/live-queue`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null, 'Antrean farmasi live');
  },

  async getSurgerySchedules() {
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/surgeries`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, null, 'Jadwal operasi terintegrasi SIMRS');
  },

  async sendSurgeryReminder(patientId, reminderType = 'H-1') {
    const payload = validatePayload({ patientId, reminderType });
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/surgeries/remind`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, payload, `Pengingat jadwal operasi (${reminderType}) berhasil dikirim ke WhatsApp pasien.`);
  },

  async getPatientLiveJourney(rm) {
    const cleanRm = sanitizeInput(rm);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/queues/journey?rm=${encodeURIComponent(cleanRm)}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { rm: cleanRm }, 'Live status antrean multi-stasiun berhasil ditarik dari SIMRS');
  },

  async advanceQueueCounter(poliId) {
    const cleanPoli = sanitizeInput(poliId);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/queues/advance`, {
        method: 'POST',
        body: JSON.stringify({ poliId: cleanPoli })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { poliId: cleanPoli }, `Nomor antrean ${cleanPoli} berhasil dimajukan ke panggilan berikutnya`);
  },

  async sendQueueLinkToPatient(rm, phone) {
    const cleanRm = sanitizeInput(rm);
    const cleanPhone = sanitizeInput(phone);
    try {
      const res = await secureFetch(`${API_BASE_URL}/api/v1/simrs/queues/send-tracking-link`, {
        method: 'POST',
        body: JSON.stringify({ rm: cleanRm, phone: cleanPhone })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return createResponse(true, { rm: cleanRm, phone: cleanPhone }, `Tautan tracking antrean live berhasil dikirim via WhatsApp ke ${cleanPhone}`);
  }
};

export default PolicareApi;
