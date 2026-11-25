/**
 * =============================================================================
 * POLICARE ENTERPRISE SECURITY & PRIVACY UTILITIES
 * Compliance: UU PDP (Pelindungan Data Pribadi) & Standar Keamanan Rekam Medis
 * Piloting: RSUD Daya Kota Makassar
 * Version: 3.0.0
 * =============================================================================
 */

/**
 * 1. XSS & HTML INJECTION SANITIZATION
 * Membersihkan input teks dari karakter berbahaya sebelum disimpan atau dirender.
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

/**
 * 2. PII (PERSONALLY IDENTIFIABLE INFORMATION) MASKING
 * Menyamarkan data sensitif pasien & rekam medis untuk role non-otorisasi.
 */
export const PiiMasker = {
  /**
   * Menyamarkan nomor telepon: '0812-4455-6677' -> '0812-****-6677'
   */
  maskPhone(phone) {
    if (!phone || typeof phone !== 'string') return '-';
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 8) return '****' + clean.slice(-3);
    return `${clean.slice(0, 4)}-****-${clean.slice(-4)}`;
  },

  /**
   * Menyamarkan No. Rekam Medis: 'RM-882103' -> 'RM-882***'
   */
  maskRmNumber(rm) {
    if (!rm || typeof rm !== 'string') return '-';
    if (rm.length <= 5) return 'RM-***';
    return rm.slice(0, 5) + '***';
  },

  /**
   * Menyamarkan NIK: '7371051203920001' -> '737105******0001'
   */
  maskNik(nik) {
    if (!nik || typeof nik !== 'string') return '-';
    if (nik.length < 10) return '******';
    return `${nik.slice(0, 6)}******${nik.slice(-4)}`;
  },

  /**
   * Menyamarkan Nama Lengkap: 'Siti Rahmawati' -> 'Siti R********'
   */
  maskName(name) {
    if (!name || typeof name !== 'string') return '-';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].slice(0, 2) + '*'.repeat(Math.max(3, parts[0].length - 2));
    }
    return `${parts[0]} ${parts.slice(1).map(p => p[0] + '*'.repeat(Math.max(2, p.length - 1))).join(' ')}`;
  }
};

/**
 * 3. TOKEN & SESSION SECURITY MANAGER
 * Menyimpan auth token secara aman di sessionStorage (memory-safe)
 */
export const SecuritySession = {
  TOKEN_KEY: 'policare_sec_token',
  USER_KEY: 'policare_sec_user',

  getToken() {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY) || 'SEC_TOKEN_RSUD_DAYA_ACTIVE';
    } catch {
      return null;
    }
  },

  setToken(token) {
    try {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    } catch {}
  },

  clearSession() {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    } catch {}
  }
};

/**
 * 4. SECURE PAYLOAD VALIDATOR & DEFENSE-IN-DEPTH
 * Memverifikasi validitas payload sebelum dikirim ke API.
 */
export function validatePayload(payload, requiredFields = []) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[Security Exception] Payload tidak valid.');
  }

  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      throw new Error(`[Security Exception] Field wajib "${field}" tidak boleh kosong.`);
    }
  }

  // Deep sanitize string fields
  const clean = Array.isArray(payload) ? [] : {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      clean[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = validatePayload(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
