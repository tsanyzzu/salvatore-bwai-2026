# 🚀 MikroBoost - Smart UMKM Platform

MikroBoost adalah platform cerdas *all-in-one* yang dirancang untuk membantu Usaha Mikro, Kecil, dan Menengah (UMKM) dalam mengelola inventaris bisnis operasional sekaligus meningkatkan penjualan melalui alat pemasaran cerdas yang ditenagai oleh Generative AI.

Proyek ini mendigitalisasi cara UMKM bekerja dengan menghemat waktu pengelolaan stok dan memecahkan kebingungan UMKM dalam strategi pemasaran digital mereka.

## ✨ Fitur Utama

- **📦 Smart Inventory Management:** Pencatatan, pemantauan batas minimum *(restock alerts)*, dan riwayat transaksi stok barang masuk/keluar.
- **🤖 GenAI Marketing Tools (Powered by Google Gemini):**
  - **Magic Captioning:** Hasilkan takarir (caption) menarik secara otomatis untuk platform Instagram, Shopee, atau WhatsApp dengan berbagai penyesuaian nada bahasa (promosional, profesional, dll).
  - **Trend Analysis:** Analisa tren produk pintar berdasarkan deskripsi barang.
  - **Creative Content Hooks:** Pembuat hook video kreatif untuk pemasaran di media sosial (TikTok / IG Reels).
- **📊 Business Dashboard:** Tampilan metrik bisnis seperti total pendapatan, pesanan, dan peninjauan kepuasan produk UMKM secara cepat.

## 💻 Tech Stack

**Frontend:**
- [Next.js 16](https://nextjs.org/) (App Router & React 19)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) (State Management)
- UI Components berbasis [shadcn/ui](https://ui.shadcn.com/) (Lucide, Class Variance Authority)

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- Google Generative AI API (Gemini)
- SQLAlchemy & PostgreSQL (Database)
- Pydantic & Uvicorn

## 📂 Struktur Proyek Terpenting

```text
salvatore-bwai-2026/
├── backend/                  # Layer Services & API
│   ├── main.py               # Entry point FastAPI & Integrasi GenAI 
│   ├── models.py             # Schema & Model Database (SQLAlchemy)
│   ├── database.py           # Koneksi Database
│   └── requirements.txt      # Dependensi Python
└── frontend/                 # Aplikasi Web (User Interface)
    ├── src/app/              # Next.js App Router (Halaman & Rute)
    │   ├── inventory/        # Manajemen Stok Barang
    │   ├── marketing/        # Fitur AI Marketing Generator
    │   └── page.tsx          # Dashboard Utama Analytics
    ├── src/components/       # Komponen UI Reusable (shadcn/ui)
    └── src/lib/              # Utilities, API Fetcher, & Zustand Store
```

## 🛠️ Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat:
- Node.js (v20+) & npm
- Python 3.9+
- PostgreSQL (dikonfigurasi dan berjalan)
- API Key Google Gemini (Generative AI)

### 1. Menjalankan Backend (FastAPI)

```bash
# Masuk ke direktori backend
cd backend

# Buat virtual environment agar dependensi terenkapsulasi dengan baik
python -m venv venv
# Windows: venv\\Scripts\\activate
# Mac/Linux: source venv/bin/activate

# Instal dependensi
pip install -r requirements.txt

# Buat environment variables (Atas/Set API Key Gemini)
# export GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere" 
# (Atau tambahkan file .env)

# Jalankan server
uvicorn main:app --reload --port 8000
```
*API sekarang dapat diakses secara lokal di http://localhost:8000 (Gunakan `/docs` untuk melihat dokumentasi interaktif Swagger).*

### 2. Menjalankan Frontend (Next.js)

```bash
# Buka tab terminal baru, pautkan ke frotend
cd frontend

# Instal dependensi NPM
npm install

# Jalankan server website web platform
npm run dev
```
*Aplikasi frontend web sekarang dapat diakses secara lokal di http://localhost:3000.*

## 🚀 Future Roadmap & Inovasi
- Mengembangkan agen sub-sistem (Agentic Workflow) untuk otomatis menjawab *review* pengguna.
- Sinkronisasi harga dan stok *multi-channel* otomatis ke marketplace E-Commerce sungguhan.
- Pengembangan PWA mobile application agar UMKM mudah mengakses via Smartphone.

---
*Dibangun untuk memajukan UMKM oleh tim Anda.*
