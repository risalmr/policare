-- =============================================================================
-- POLICARE PLATFORM — COMPLETE POSTGRESQL DATABASE SCHEMA
-- Piloting Implementation: RSUD Daya Kota Makassar
-- Version: 3.0.0 (Unified Enterprise RBAC, Dual Voice 360, KMKP & Education Studio)
-- =============================================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. MASTER HOSPITAL & RBAC PERMISSIONS SCHEMA
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'RSUD-DAYA-MKS'
    name VARCHAR(255) NOT NULL DEFAULT 'RSUD Daya Kota Makassar',
    city VARCHAR(100) NOT NULL DEFAULT 'Makassar',
    address TEXT,
    phone VARCHAR(50),
    simrs_connected BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- 'POLI-OBGYN', 'POLI-ANAK', 'FARMASI', 'HUMAS', 'KMKP'
    name VARCHAR(150) NOT NULL,
    is_clinical BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles Definition (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL, -- 'SUPER_ADMIN', 'HUMAS', 'PROMKES', 'KMKP', 'DOKTER_DPJP'
    name VARCHAR(150) NOT NULL,
    badge_color VARCHAR(20) DEFAULT '#4f30db',
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Granular Module Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL, -- 'radar', 'crisis', 'survey', 'market', 'simrsFollowUp', 'studio', 'community', 'promotion', 'aiCompanion', 'roles'
    access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('ADMIN', 'EDITOR', 'VIEWER', 'NO_ACCESS')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, module_key)
);

CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    nip VARCHAR(50) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    specialization VARCHAR(100),
    avatar_initials VARCHAR(10),
    avatar_color VARCHAR(20) DEFAULT '#4f30db',
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. SIMRS PATIENT MASTER & INTEGRATION CACHE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS simrs_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    rm_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'RM-882103'
    nik VARCHAR(30) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('L', 'P')),
    birth_date DATE,
    address TEXT,
    loyalty_tier VARCHAR(30) DEFAULT 'Gold',
    accumulated_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS simrs_encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES simrs_patients(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    dpjp_staff_id UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    encounter_date TIMESTAMP WITH TIME ZONE NOT NULL,
    encounter_type VARCHAR(30) NOT NULL, -- 'RAWAT_JALAN', 'RAWAT_INAP', 'IGD'
    diagnosis_code VARCHAR(50), -- ICD-10 e.g. 'O26.8'
    diagnosis_text TEXT NOT NULL,
    followup_status VARCHAR(50) DEFAULT 'Belum Dihubungi',
    followup_message TEXT,
    followup_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. PILAR 1: DUAL-VOICE RADAR (VOC PASIEN & VOE TIM MEDIS / STAF)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    voice_domain VARCHAR(30) NOT NULL DEFAULT 'PATIENT_VOICE_VOC', -- 'PATIENT_VOICE_VOC', 'STAFF_VOICE_VOE'
    
    -- Patient VOC Fields
    patient_id UUID REFERENCES simrs_patients(id) ON DELETE SET NULL,
    reporter_name VARCHAR(150) NOT NULL,
    reporter_role VARCHAR(50) DEFAULT 'Pasien / Keluarga Pasien',
    is_anonymous BOOLEAN DEFAULT false,
    channel VARCHAR(50) NOT NULL, -- 'Telepon CS', 'Tatap Muka', 'Kotak Saran Fisik', 'WhatsApp CS', 'Aplikasi Policare', 'Google Reviews'
    rating INT CHECK (rating BETWEEN 1 AND 5),
    sentiment VARCHAR(30) NOT NULL, -- 'Kritis', 'Medium', 'Positif'
    
    -- Staff VOE Fields
    staff_recorder_id UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    staff_role VARCHAR(100), -- 'Dokter Spesialis', 'Bidan', 'Perawat', 'Apoteker', 'Admisi', 'Lab'
    staff_category VARCHAR(100), -- 'Ketersediaan Alkes/Obat', 'Beban Kerja & Shift', 'SIMRS & IT', 'Fasilitas Pasien'
    staff_shift VARCHAR(50), -- 'Pagi (07:00 - 14:00)', 'Siang (14:00 - 21:00)', 'Malam (21:00 - 07:00)'
    staff_urgency VARCHAR(30), -- 'Tinggi', 'Sedang', 'Rendah'
    upvotes_count INT DEFAULT 0,
    
    -- Dual-Lens 360° Matrix Linkage
    is_cross_correlated_360 BOOLEAN DEFAULT false,
    correlated_feedback_id UUID REFERENCES feedbacks(id) ON DELETE SET NULL,
    
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    feedback_text TEXT NOT NULL,
    ai_summary TEXT,
    ai_draft_reply TEXT,
    status VARCHAR(30) DEFAULT 'Open', -- 'Open', 'Dalam Proses', 'Selesai', 'Eskalasi'
    management_response TEXT,
    recorded_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. CRISIS MANAGEMENT & BAGIAN MUTU (KMKP) SIMRS VERIFICATION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS crisis_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    feedback_id UUID REFERENCES feedbacks(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    source_origin VARCHAR(50) NOT NULL, -- 'Radar Layanan', 'Hasil Riset SKM'
    severity VARCHAR(30) NOT NULL, -- 'Kritis', 'Tinggi', 'Sedang'
    risk_impact TEXT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    
    -- Quality Team (KMKP) Dispatch & SIMRS Verification
    suspected_rm_number VARCHAR(50),
    mutu_notification_status VARCHAR(50) DEFAULT 'BELUM_DIKIRIM', -- 'BELUM_DIKIRIM', 'PEMBERITAHUAN_TERKIRIM_KE_MUTU', 'PASIEN_TERDAFTAR_SIMRS', 'BUKAN_PASIEN_RS'
    mutu_dispatched_at TIMESTAMP WITH TIME ZONE,
    mutu_dispatch_channel VARCHAR(30), -- 'WHATSAPP', 'EMAIL', 'MEMO_INTERNAL'
    simrs_verified_at TIMESTAMP WITH TIME ZONE,
    simrs_verifier_name VARCHAR(150),
    simrs_verification_notes TEXT,

    ai_risk_analysis TEXT,
    ai_action_plan TEXT,
    ai_press_release TEXT,
    ai_compensation TEXT,
    handling_decision VARCHAR(50) DEFAULT 'Menunggu Keputusan', -- 'Saran AI Diterima', 'Dimodifikasi Humas', 'Saran AI Ditolak'
    status VARCHAR(50) DEFAULT 'Open', -- 'Open', 'Dalam Proses', 'Eskalasi Pimpinan', 'Selesai'
    escalated_to VARCHAR(150),
    escalated_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crisis_audit_trails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crisis_id UUID REFERENCES crisis_incidents(id) ON DELETE CASCADE,
    actor_name VARCHAR(150) NOT NULL,
    event_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. PATIENT COMMUNITIES (DUAL FACILITATOR: DPJP & BIDAN/PERAWAT)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS patient_communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL, -- 'ct-bumil', 'ct-alumni', 'ct-kronis'
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    access_mode VARCHAR(50) NOT NULL, -- 'Rujukan Dokter', 'Publik RS', 'Privat'
    
    doctor_dpjp_id UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    doctor_dpjp_name VARCHAR(150) NOT NULL,
    doctor_dpjp_role VARCHAR(150) NOT NULL,
    nurse_facilitator_id UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    nurse_facilitator_name VARCHAR(150) NOT NULL,
    nurse_facilitator_role VARCHAR(150) NOT NULL,
    
    target_quota INT DEFAULT 250,
    whatsapp_group_url TEXT,
    description TEXT,
    engagement_rate INT DEFAULT 100,
    status VARCHAR(30) DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES patient_communities(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES simrs_patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    rm_number VARCHAR(50) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    medical_condition TEXT,
    risk_level VARCHAR(30) DEFAULT 'Rendah',
    assigned_by_staff VARCHAR(150) NOT NULL,
    doctor_notes TEXT,
    whatsapp_invite_sent BOOLEAN DEFAULT true,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. RESEARCH & SURVEY STUDIO (SKM KEMENKES / PERMENPAN-RB)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS survey_instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    survey_type VARCHAR(50) NOT NULL, -- 'SKM_KEMENKES_9_UNSUR', 'AD_HOC_SURVEY'
    target_sample_size INT DEFAULT 150,
    current_responses INT DEFAULT 0,
    ikm_score DECIMAL(5,2),
    service_grade VARCHAR(10), -- 'A (Sangat Baik)', 'B (Baik)'
    status VARCHAR(30) DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES survey_instruments(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES simrs_patients(id) ON DELETE SET NULL,
    question_code VARCHAR(20) NOT NULL, -- 'U1' to 'U9'
    score_value INT CHECK (score_value BETWEEN 1 AND 4),
    feedback_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. PROMOTION & MEDICAL EDUCATION STUDIO (SEPARATED SECTIONS)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS promotion_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL DEFAULT 'EDUCATION_MEDICAL', -- 'EDUCATION_MEDICAL' vs 'COMMERCIAL_PROMOTION'
    title VARCHAR(255) NOT NULL,
    channel VARCHAR(100) NOT NULL,
    insight_source VARCHAR(100),
    content_draft TEXT NOT NULL,
    script_video TEXT,
    visual_prompt TEXT,
    target_audience TEXT,
    recommended_cta TEXT,
    doctor_validator_id UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    doctor_verified BOOLEAN DEFAULT false,
    marketing_verified BOOLEAN DEFAULT false,
    published_status VARCHAR(30) DEFAULT 'Draft',
    
    -- Analytics
    read_through_rate DECIMAL(5,2),
    comprehension_score DECIMAL(5,2),
    direct_bookings_count INT DEFAULT 0,
    estimated_revenue DECIMAL(12,2),
    reach_count VARCHAR(50) DEFAULT '0',
    conversions_count VARCHAR(50) DEFAULT '0',
    
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. LOYALTY RULES & AUTOPILOT OUTREACH DISPATCH
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS loyalty_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    rule_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    reward_points INT NOT NULL,
    target_participants INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Aktif',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outreach_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES simrs_patients(id) ON DELETE SET NULL,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    authorized_by_nurse VARCHAR(150) NOT NULL,
    dispatch_type VARCHAR(50) DEFAULT 'AUTOPILOT_BULK',
    status VARCHAR(50) DEFAULT 'Sukses (AI Direct)',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 9. PERFORMANCE OPTIMIZATION INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_roles_hospital ON roles(hospital_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON staff_users(role_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_hospital_voice ON feedbacks(hospital_id, voice_domain);
CREATE INDEX IF NOT EXISTS idx_feedbacks_sentiment ON feedbacks(sentiment);
CREATE INDEX IF NOT EXISTS idx_crisis_hospital_status ON crisis_incidents(hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_crisis_mutu_status ON crisis_incidents(mutu_notification_status);
CREATE INDEX IF NOT EXISTS idx_promotions_section ON promotion_campaigns(hospital_id, section_type);
CREATE INDEX IF NOT EXISTS idx_communities_hospital ON patient_communities(hospital_id);
CREATE INDEX IF NOT EXISTS idx_simrs_encounters_patient ON simrs_encounters(patient_id);

-- =============================================================================
-- 10. ENTERPRISE SECURITY HARDENING & ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable Row Level Security (RLS) on all core tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE simrs_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_audit_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_campaigns ENABLE ROW LEVEL SECURITY;

-- Hospital Tenant Isolation Policy (Prevents Cross-Tenant Data Leaks)
CREATE POLICY hospital_tenant_isolation_patients ON simrs_patients
    FOR ALL
    USING (hospital_id = NULLIF(current_setting('app.current_hospital_id', true), '')::UUID);

CREATE POLICY hospital_tenant_isolation_feedbacks ON feedbacks
    FOR ALL
    USING (hospital_id = NULLIF(current_setting('app.current_hospital_id', true), '')::UUID);

CREATE POLICY hospital_tenant_isolation_crisis ON crisis_incidents
    FOR ALL
    USING (hospital_id = NULLIF(current_setting('app.current_hospital_id', true), '')::UUID);

-- Cryptographic Tamper-Proof Audit Trail Hash Trigger
ALTER TABLE crisis_audit_trails ADD COLUMN IF NOT EXISTS integrity_hash VARCHAR(64);

CREATE OR REPLACE FUNCTION generate_crisis_audit_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.integrity_hash := encode(
        digest(
            COALESCE(NEW.crisis_id::text, '') ||
            COALESCE(NEW.actor_name, '') ||
            COALESCE(NEW.event_description, '') ||
            COALESCE(NEW.created_at::text, ''),
            'sha256'
        ),
        'hex'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crisis_audit_integrity ON crisis_audit_trails;
CREATE TRIGGER trg_crisis_audit_integrity
    BEFORE INSERT ON crisis_audit_trails
    FOR EACH ROW
    EXECUTE FUNCTION generate_crisis_audit_hash();

-- Database PII Masking Security Functions for Restricted Viewers
CREATE OR REPLACE FUNCTION mask_patient_phone(raw_phone TEXT)
RETURNS TEXT AS $$
BEGIN
    IF raw_phone IS NULL OR length(raw_phone) < 8 THEN
        RETURN '****-****';
    END IF;
    RETURN substr(raw_phone, 1, 4) || '-****-' || substr(raw_phone, length(raw_phone) - 3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION mask_rm_number(raw_rm TEXT)
RETURNS TEXT AS $$
BEGIN
    IF raw_rm IS NULL OR length(raw_rm) <= 5 THEN
        RETURN 'RM-***';
    END IF;
    RETURN substr(raw_rm, 1, 5) || '***';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

