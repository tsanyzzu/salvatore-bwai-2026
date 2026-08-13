# 🚀 MikroBoost — Smart UMKM Platform


**MikroBoost** adalah platform cerdas *all-in-one* yang dirancang untuk memberdayakan Usaha Mikro, Kecil, dan Menengah (UMKM). Platform ini mengintegrasikan kasir digital (*Point of Sale*), manajemen inventori stok barang, analitik laba/rugi keuangan, analisis sentimen ulasan pelanggan, dan studio pemasaran GenAI dalam satu antarmuka yang modern, cepat, dan elegan.

---

## ✨ Fitur-Fitur Utama

### 1. 🛒 Modul Kasir Cepat (Point of Sale / POS Lightweight)
- **Katalog Produk Grid:** Pencarian cepat nama/SKU dan filter kategori produk.
- **Keranjang Belanja Interaktif:** Penambahan/pengurangan jumlah pesanan secara *real-time*.
- **Kalkulator Kembalian:** Pilihan metode pembayaran Tunai & QRIS dengan kalkulator kembalian otomatis dan tombol nominal cepat (Uang Pas, 50k, 100k).
- **Struk Digital Siap Cetak:** Modal pratinjau invoice struk transaksi yang siap dicetak untuk pelanggan.

### 2. 💰 Analitik Keuangan & Estimasi Laba/Rugi (Smart Financials)
- **Kartu KPI Keuangan:** Omzet Total, Laba Kotor, HPP (COGS), Beban Operasional, dan Laba Bersih.
- **Breakdown Margin Keuntungan Produk:** Tabel rincian margin profitabilitas per SKU (Rp & %).
- **Wawasan & Proyeksi Omzet AI:** Estimasi proyeksi omzet bulan depan dan rekomendasi kesehatan keuangan dari Gemini AI.
- **Filter Rentang Waktu:** Pilihan analisis keuangan (Bulan Ini, 3 Bulan, dan Tahun Ini).

### 3. 📦 Manajemen Inventori & Log Transaksi
- **Katalog Stok & Low Stock Badge:** Pemantauan jumlah stok dengan indikator stok kritis (*Low Stock Alert*).
- **Penyesuaian Stok Cepat:** Tombol ubah stok instan (`+` / `-`) dan formulir transaksi manual.
- **Log Riwayat Transaksi:** Riwayat otomatis transaksi stok masuk (*in*) dan keluar (*out*).

### 4. 🤖 AI Marketing Studio (GenAI Powered by Google Gemini)
- **✨ AI Copywriter:** Generator caption promosi otomatis untuk Instagram, Shopee, atau WhatsApp dengan penyesuaian tone (Engaging, Professional, Friendly, Urgent).
- **📈 Analisis Tren Pasar:** Rekomendasi taktik konten video viral terkini untuk TikTok, Instagram Reels, dan YouTube Shorts.
- **🎬 Creative Video Hooks:** Generator storyboard visual video 15 detik (Hook visual, audio, teks layar) dan fitur **Simulasi Post Sosial Media**.

### 5. 📊 Dashboard Utama & Analisis Sentimen Ulasan
- **Ringkasan KPI Bisnis:** Total Revenue, Jumlah Pesanan, Total Produk, dan Rating Rata-rata.
- **Upload & Analisis Sentimen Batch:** Pengolahan file CSV/Excel ulasan pelanggan menggunakan Gemini AI untuk mengategorikan ulasan Positif, Netral, dan Negatif.
- **Kotak AI Business Insight:** Ringkasan otomatis poin kepuasan utama pelanggan.

---

## 💻 Arsitektur & Tech Stack

### **Backend (Python FastAPI - Clean Layered Architecture)**
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **AI Engine:** `google-generativeai` (Google Gemini 1.5 Flash / Gemini Pro API)
- **Architecture Layers:**
  - `schemas/`: Pydantic Models (`inventory.py`, `marketing.py`, `analytics.py`, `pos.py`, `financials.py`)
  - `services/`: Encapsulated AI Services (`ai_service.py`)
  - `routers/`: RESTful Modular Routers (`inventory.py`, `marketing.py`, `analytics.py`, `pos.py`)
- **Database & Data Processing:** SQLAlchemy ORM, SQLite / PostgreSQL, Pandas.

### **Frontend (Next.js 16 - React 19)**
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & React 19)
- **Styling:** Vanilla CSS & [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Type Safety:** Strict TypeScript Interfaces (`types/api.ts`)
- **UI Components & Icons:** Lucide React, Toast UI System Reusable Provider (`components/ui/toast.tsx`)

---

## 📂 Struktur Proyek

```text
salvatore-bwai-2026/
├── backend/                  # Layer Backend FastAPI
│   ├── main.py               # Application Entrypoint & Middleware
│   ├── database.py           # Database Session & Engine Setup
│   ├── models.py             # SQLAlchemy Database Models (Item, Transaction, Review)
│   ├── schemas/              # Pydantic Schemas (Request/Response Models)
│   │   ├── inventory.py
│   │   ├── marketing.py
│   │   ├── analytics.py
│   │   ├── pos.py
│   │   └── financials.py
│   ├── services/             # Business Logic & Gemini AI Integration
│   │   └── ai_service.py
│   ├── routers/              # RESTful API Route Controllers
│   │   ├── inventory.py
│   │   ├── marketing.py
│   │   ├── analytics.py
│   │   └── pos.py
│   └── requirements.txt      # Python Dependencies
└── frontend/                 # Layer Frontend Next.js Web App
    ├── src/app/              # Next.js App Router Pages
    │   ├── page.tsx          # Dashboard Analytics & Sentimen Ulasan
    │   ├── pos/              # Modul Kasir Cepat (POS)
    │   ├── financials/       # Analitik Keuangan & Laba/Rugi
    │   ├── inventory/        # Manajemen Stok Inventori
    │   ├── marketing/        # AI Marketing Studio
    │   └── layout.tsx        # Root Layout & Toast Provider
    ├── src/components/       # Reusable UI & Marketing Tab Components
    │   ├── layout/           # Sidebar Navigation Component
    │   ├── ui/               # Reusable Cards, Buttons, Inputs, & Toast UI
    │   └── marketing/        # CopywriterTab, TrendAnalysisTab, CreativeHooksTab
    ├── src/types/            # Strict TypeScript Interfaces (api.ts)
    └── src/lib/              # API Fetcher Client & Zustand Store
```

---

## 🛠️ Panduan Instalasi & Cara Menjalankan

### **Prasyarat System:**
- Node.js v20+ & npm
- Python 3.9+
- API Key Google Gemini (`GEMINI_API_KEY`)

---

### **1. Menjalankan Backend (FastAPI)**

```bash
# Masuk ke direktori backend
cd backend

# Buat & aktifkan virtual environment
python -m venv venv

# Windows (PowerShell / Command Prompt):
# venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Instal dependensi Python
pip install -r requirements.txt

# Set Gemini API Key (Opsional: Sistem memiliki fallback engine jika key belum diisi)
# set GEMINI_API_KEY="your_google_gemini_api_key"

# Menjalankan FastAPI Uvicorn Server
uvicorn main:app --reload --port 8000
```
*API Backend berjalan di `http://localhost:8000`. Swagger Interactive Docs dapat diakses di `http://localhost:8000/docs`.*

---

### **2. Menjalankan Frontend (Next.js)**

```bash
# Buka terminal baru, masuk ke direktori frontend
cd frontend

# Instal dependensi NPM
npm install

# Menjalankan Dev Server Next.js
npm run dev
```
*Aplikasi Web Frontend dapat diakses di `http://localhost:3000`.*

---

## 🌐 Dokumentasi API Swagger

Setelah Backend berjalan, buka peramban dan kunjungi:
👉 `http://localhost:8000/docs`

Dokumentasi interaktif OpenAPI/Swagger akan menampilkan seluruh rute endpoint:
- **Inventory:** `GET /api/inventory/items`, `GET /api/inventory/transactions`, `POST /api/inventory/transaction`
- **Point of Sale (POS):** `POST /api/pos/checkout`
- **Analytics & Financials:** `GET /api/analytics/dashboard-stats`, `GET /api/analytics/financial-summary`, `GET /api/analytics/reviews`, `GET /api/analytics/summary`, `POST /api/analytics/upload-reviews`
- **Marketing GenAI:** `POST /api/marketing/generate`, `POST /api/marketing/analyze-trends`, `POST /api/marketing/generate-creative`, `POST /api/marketing/simulate-post`

---

## 👥 Pengembang & Lisensi

Proyek ini dikembangkan oleh tim **Salvatore** sebagai karya eksperimen dalam program **Build with AI by GDGoC Jabodetabek**.

> **💡 Eksperimen Vibe-Coding:**
> Proyek **MikroBoost** ini dikembangkan sebagai eksperimen inovasi pada program **Build with AI** yang diselenggarakan oleh **GDGoC Jabodetabek**.
> Seluruh proses pengerjaan (analisis kebutuhan, arsitektur *Clean Layered*, penulisan kode frontend/backend, hingga refactoring) murni memanfaatkan metode **"Vibe-Coding"** secara interaktif menggunakan teknologi Google modern, yaitu **Antigravity AI Agentic Assistant** dan model AI **Google Gemini (Gemini Pro 3.1)**.
