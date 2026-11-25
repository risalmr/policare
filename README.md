# Policare Dashboard — Healthcare Intelligence & Patient Relationship Management

Platform terpadu untuk monitoring suara pasien (*Voice of Patient*), manajemen krisis pelayanan, riset survei kepuasan masyarakat (SKM Permenpan-RB), follow-up jadwal kontrol pasien terintegrasi SIMRS, loyalty program, dan edukasi medis berbasis AI.

---

## 🚀 Fitur Utama

- **Pilar 1: Voice of Patient & Behavioral Insight Radar**
  - **Voice & Feedback:** Dual-Voice capture (Suara Pasien/VOC & Suara Staf Medis/VOE), analisis sentimen AI, dan matriks korelasi 360°.
  - **Crisis Management:** Deteksi dini eskalasi krisis, analisis risiko AI, protokol verifikasi Komite Mutu (KMKP) ke SIMRS, generator siaran pers, dan audit trail SHA-256.
  - **Studio Riset SKM:** Survei Kepuasan Masyarakat 9 Unsur sesuai Permenpan-RB No. 14/2017, generator QR Code Standee untuk 13 unit rumah sakit, dan auto-kalkulasi skor IKM.
  - **Intelijen Pasar:** Analisis tren layanan kesehatan dan benchmarking reputasi kompetitor.

- **Pilar 2: Integrated Patient Relationship & Engagement (PRM)**
  - **Patient Relationship & Follow-Up:** Sinkronisasi jadwal kontrol (H-3, H-2, H-1, H+0), deteksi pasien mangkir (*no-show*), dan rescheduling otomatis via WhatsApp.
  - **Loyalty Program:** Konfigurasi reward poin atas kepatuhan medis pasien dan simulator dampak retensi.
  - **Komunitas Pasien:** Model asuhan ganda (*Dual-Facilitator*) melibatkan Dokter Spesialis DPJP dan Bidan/Perawat Edukatris.
  - **Promosi & Edukasi Medis:** Studio Co-Creation konten edukasi medis tervalidasi dokter komite medik vs promosi layanan komersial.

- **Pilar 3: Sinteta AI Engine & Public Access**
  - **AI Companion:** Manajemen basis pengetahuan (Public, Internal, Hybrid), guardrails etika medis, dan token cost saver.
  - **AI Patient Information Hub:** Katalog transparansi tarif layanan publik (Lab, Radiologi, Tindakan) dan audio chime rumah sakit.

- **Enterprise Governance & Security**
  - **Role-Based Access Control (RBAC):** Manajemen hak akses 4 level (`ADMIN`, `EDITOR`, `VIEWER`, `NO_ACCESS`) untuk Super Admin, Direktur Utama, Humas, Promkes, dan Komite Mutu (KMKP).
  - **Kepatuhan UU PDP (No. 27/2022):** Dynamic Personally Identifiable Information (PII) masking (No. RM, NIK, No. Telepon, Nama) dan Row-Level Security (RLS).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 5, Tailwind / Modern Vanilla CSS, Material Symbols
- **Backend / Data Layer:** PostgreSQL 15+, Prisma ORM (`src/backend/schema.prisma` & `schema.sql`)
- **Security & Privacy:** UU PDP compliance layer, SHA-256 audit digest, PII dynamic masking

---

## 📦 Menjalankan Proyek Secara Lokal

### 1. Prasyarat
- Node.js >= 18.x
- npm atau yarn / pnpm

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Development Server
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5174/`.

### 4. Build untuk Production
```bash
npm run build
```

---

## 📁 Struktur Properti Proyek

```
policare-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── PolicareDashboard.jsx     # Master orchestrator dashboard
│   ├── policare.css              # Design tokens & core styles
│   ├── backend/
│   │   ├── schema.sql            # PostgreSQL enterprise schema & RLS policies
│   │   └── schema.prisma         # Prisma ORM models
│   ├── components/
│   │   ├── RadarScreen.jsx       # Voice of Customer & Employee
│   │   ├── CrisisScreen.jsx      # Crisis management & KMKP verification
│   │   ├── SurveyScreen.jsx      # SKM Kemenpan-RB & QR standee generator
│   │   ├── SimrsFollowUpScreen.jsx # Patient follow-up & SIMRS sync
│   │   ├── StudioScreen.jsx      # Loyalty program studio
│   │   ├── DeliveryScreen.jsx    # Outreach dispatch
│   │   ├── PromotionScreen.jsx   # Medical education & promotion co-creation
│   │   ├── AiCompanionScreen.jsx # Knowledge base & AI guardrails
│   │   ├── AiPatientInfoHub.jsx  # Public tariff kiosk & chime
│   │   ├── RoleManagementScreen.jsx # Enterprise RBAC & user management
│   │   └── OtherScreens.jsx      # Community & Market intelligence
│   ├── services/
│   │   └── policareApi.js        # API service layer client
│   └── utils/
│       └── security.js           # PII masking & input sanitization
└── Knowledge Resources/          # Referensi proposal & regulasi SKM
```
