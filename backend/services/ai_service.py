import os
import json
import google.generativeai as genai
from typing import List, Dict, Any

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class AIService:
    @staticmethod
    def is_configured() -> bool:
        return bool(GEMINI_API_KEY)

    @staticmethod
    def generate_captions(product_name: str, price: float, description: str, platform: str, tone: str) -> List[Dict[str, str]]:
        if not GEMINI_API_KEY:
            return [
                {
                    "platform": "Instagram",
                    "caption": f"☕ {product_name} — produk terbaik untuk Anda!\n\n💰 Harga: Rp {price:,.0f}\n📦 Order sekarang!\n\n#UMKM #ProdukLokal",
                    "tone": tone,
                },
                {
                    "platform": "Shopee",
                    "caption": f"🔥 BEST SELLER! {product_name}\n\n{description}\n\n⭐ Harga: Rp {price:,.0f}\n\nOrder sekarang!",
                    "tone": tone,
                },
            ]

        platforms = [platform] if platform != "all" else ["Instagram", "Shopee", "WhatsApp"]
        model = genai.GenerativeModel("gemini-1.5-flash")
        results = []

        for plat in platforms:
            prompt = (
                f"Buatkan caption marketing untuk platform {plat} dengan tone {tone}.\n"
                f"Nama Produk: {product_name}\n"
                f"Harga: Rp {price:,.0f}\n"
                f"Deskripsi/Keunggulan: {description}\n"
                "Gunakan emoji yang relevan dan hashtag jika sesuai (terutama untuk Instagram). "
                "Format langsung teks caption tanpa tambahan kata-kata pengantar."
            )
            response = model.generate_content(prompt)
            results.append({
                "platform": plat.capitalize(),
                "caption": response.text.strip(),
                "tone": tone
            })
        return results

    @staticmethod
    def analyze_trends(product_name: str, description: str) -> str:
        if not GEMINI_API_KEY:
            return (
                "📈 **Tren Analisis Pasar (Mock):**\n\n"
                "🎥 **TikTok:** Konten bertema ASMR pembuatan produk atau review jujur (aesthetic unboxing) sedang viral. Pengguna menyukai musik bertempo cepat dan transisi ketukan.\n\n"
                "📸 **Instagram:** Reels bertema edukasi manfaat produk dengan visual estetik minimalis dan karusel info grafis mendapatkan engagement tinggi.\n\n"
                "📺 **YouTube:** Format Shorts dengan review produk 15 detik yang fokus pada perbandingan harga vs kualitas (value-for-money) sangat diminati."
            )

        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"Analisis tren pemasaran media sosial terkini (TikTok, Instagram, YouTube) untuk produk berikut:\n"
            f"Nama Produk: {product_name}\n"
            f"Deskripsi: {description}\n\n"
            "Berikan analisis dalam bahasa Indonesia yang ringkas, padat, dan taktis. "
            "Gunakan format Markdown tebal dan poin-poin untuk memisahkan analisis TikTok, Instagram, dan YouTube. "
            "Fokus pada taktik konten visual/video yang sedang viral (misal: ASMR, POV, Edukasi, Humor) dan audiens targetnya."
        )
        response = model.generate_content(prompt)
        return response.text.strip()

    @staticmethod
    def generate_creative_hooks(product_name: str, price: float, description: str, platforms: List[str], mode: str, custom_prompt: str = None) -> List[Dict[str, str]]:
        if not GEMINI_API_KEY:
            results = []
            for plat in platforms:
                plat_lower = plat.lower()
                if "tiktok" in plat_lower:
                    results.append({
                        "platform": "TikTok",
                        "video_hook": "🎥 Visual: Transisi cepat menuangkan kopi dengan uap mengepul hangat (aesthetic ASMR). Teks di layar: 'Kopi Toraja Asli dari Rumah Anda ☕'. Musik: Latar ketukan santai.",
                        "caption": "Pagi-pagi emang paling bener ditemani Kopi Arabica Toraja! Wanginya khas, rasanya mantap. ☕ Order klik link di bio! #ASMR #KopiLokal #UMKM #TikTokShop",
                        "tone": "Engaging"
                    })
                elif "instagram" in plat_lower:
                    results.append({
                        "platform": "Instagram",
                        "video_hook": "📸 Visual: Foto estetik tumbler bambu di atas meja kayu minimalis dengan sinar matahari pagi. Teks melayang: 'Eco-friendly & Stylist Tumbler'.",
                        "caption": "Mulai hari produktifmu dengan tumbler bambu ramah lingkungan. Menjaga minuman tetap hangat sekaligus bumi tetap hijau. 🎋 Klik link di bio untuk diskon 10%! #EcoFriendly #TumblerBambu #Minimalis #LocalBrand",
                        "tone": "Friendly"
                    })
                else:
                    results.append({
                        "platform": "YouTube",
                        "video_hook": "📺 Visual: Zoom-in cepat dari dekat sambal matah homemade yang disiram minyak kelapa hangat. Teks: 'Pedasnya Bikin Nagih!'",
                        "caption": "Sambal matah homemade dengan resep asli bali dan bahan organik pilihan. Siap jadi teman makan nasi hangatmu hari ini! 🌶️ Cek deskripsi video untuk info pemesanan. #Shorts #SambalMatah #KulinerIndonesia",
                        "tone": "Urgent"
                    })
            return results

        model = genai.GenerativeModel("gemini-1.5-flash")
        results = []
        for plat in platforms:
            prompt = (
                f"Buatkan ide konten kreatif pemasaran media sosial untuk platform: {plat}.\n"
                f"Nama Produk: {product_name}\n"
                f"Harga: Rp {price:,.0f}\n"
                f"Deskripsi/Keunggulan: {description}\n"
                f"Mode Kampanye: {mode}\n"
            )
            if mode == "prompt" and custom_prompt:
                prompt += f"Permintaan Khusus Pengguna: {custom_prompt}\n"
                
            prompt += (
                "\nHasilkan output dalam format JSON valid dengan struktur persis seperti di bawah ini, tanpa tambahan teks pengantar atau penutup:\n"
                "{\n"
                '  "video_hook": "Deskripsi singkat visual video 15 detik (misal: Visual awal, teks di layar, musik latar)",\n'
                '  "caption": "Teks caption lengkap dengan emoji dan hashtag yang cocok dengan platform ini",\n'
                '  "tone": "Tone tulisan (misalnya: Santai, Edukatif, Menghibur, Promosional)"\n'
                "}\n"
                "Pastikan JSON valid dan dapat di-parse."
            )
            
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            try:
                data = json.loads(text)
                results.append({
                    "platform": plat.capitalize(),
                    "video_hook": data.get("video_hook", "Visual video promosi menarik."),
                    "caption": data.get("caption", f"Dapatkan {product_name} sekarang!"),
                    "tone": data.get("tone", "Friendly")
                })
            except Exception:
                results.append({
                    "platform": plat.capitalize(),
                    "video_hook": f"Visual video promosi produk {product_name}.",
                    "caption": text[:200] + "..." if len(text) > 200 else text,
                    "tone": "Friendly"
                })
        return results

    @staticmethod
    def generate_review_insight(review_texts: str) -> str:
        if not GEMINI_API_KEY:
            return "Sentimen positif tinggi. Pelanggan paling puas dengan kualitas produk dan kecepatan pengiriman."

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Berikut adalah beberapa ulasan terbaru pelanggan UMKM:\n{review_texts}\n\n"
                "Berikan 1-2 kalimat ringkasan wawasan bisnis (AI Insight) dalam Bahasa Indonesia yang menjelaskan poin kepuasan utama dan poin perbaikan jika ada."
            )
            resp = model.generate_content(prompt)
            if resp.text:
                return resp.text.strip()
        except Exception as e:
            print(f"Error generating AI insight with Gemini: {e}")
        return "Sentimen positif terbukti baik. Kualitas produk dan pengiriman diapresiasi oleh sebagian besar pelanggan."
