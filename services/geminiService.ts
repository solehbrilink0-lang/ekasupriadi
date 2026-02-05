import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AnalysisResult {
  text: string;
  sources: Array<{ title: string; uri: string }>;
}

export interface ShopData {
  shopName: string;
  productType: string;
  dailyCapacity: string; // Changed from productCount
  stockCapacity: string;
  profitMargin: string;
  marketplace: string;
  shopStatus: 'NEW' | 'ESTABLISHED'; // New field
}

export interface DailyInsightResult {
  headline: string;
  strategy: string;
  marketMood: 'FIRE' | 'SLOW' | 'NORMAL';
  trendingCategories: string[];
  actionItem: string;
}

// --- NEW FUNCTION: Daily Dashboard Insight ---
export const getDailyInsight = async (): Promise<DailyInsightResult> => {
  try {
    const today = new Date();
    const dateString = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    const prompt = `
      Hari ini adalah: ${dateString}.
      
      Peran: Anda adalah AI Business Intelligence untuk E-commerce Indonesia (Shopee, TikTok, Tokopedia).
      Tugas: Analisa tanggal hari ini dan berikan insight singkat untuk seller.
      
      Konteks Analisa:
      1. Apakah ini Tanggal Kembar (misal 9.9, 12.12)? -> Mood: FIRE
      2. Apakah ini Periode Gajian (Payday, tgl 25 - 5)? -> Mood: FIRE
      3. Apakah ini Akhir Pekan (Sabtu/Minggu)? -> Mood: SLOW (biasanya orang liburan/kurang buka HP untuk belanja barang serius, tapi bagus untuk barang hobi)
      4. Apakah ini Tanggal Tua (tgl 15-24)? -> Mood: SLOW/NORMAL
      
      Output JSON:
      - headline: Satu kalimat penyemangat singkat relevan dengan tanggal.
      - strategy: 2-3 kalimat saran strategis apa yang harus dilakukan seller HARI INI.
      - marketMood: Pilih antara 'FIRE' (Sangat Ramai), 'NORMAL', atau 'SLOW' (Sepi).
      - trendingCategories: List 3 kategori produk yang potensial laku di tanggal/hari ini.
      - actionItem: Satu tugas konkret 1 kalimat.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            strategy: { type: Type.STRING },
            marketMood: { type: Type.STRING, enum: ["FIRE", "SLOW", "NORMAL"] },
            trendingCategories: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            actionItem: { type: Type.STRING }
          },
          required: ["headline", "strategy", "marketMood", "trendingCategories", "actionItem"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Daily Insight Error:", error);
    // Fallback data if AI fails
    return {
      headline: "Tetap Semangat Berjualan!",
      strategy: "Cek stok dan pastikan chat terbalas dengan cepat. Konsistensi adalah kunci.",
      marketMood: "NORMAL",
      trendingCategories: ["Fashion", "Kebutuhan Rumah", "Makanan"],
      actionItem: "Upload 1 produk baru atau update foto produk lama."
    };
  }
};

export const analyzeCompetitorOrShop = async (
  context: string, 
  marketplace: string
): Promise<string> => {
  try {
    const prompt = `
      Anda adalah konsultan E-commerce expert untuk pasar Indonesia (khususnya ${marketplace}).
      User adalah penjual yang membutuhkan analisa mendalam.
      Konteks: "${context}"
      Berikan jawaban taktis, actionable, dan profesional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    return response.text || "Maaf, tidak dapat menghasilkan analisa saat ini.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Terjadi kesalahan saat menghubungi AI Consultant. Mohon coba lagi nanti.";
  }
};

export const analyzeShopStrategy = async (
  data: ShopData,
  imageBase64: string | null,
  mimeType: string | null
): Promise<AnalysisResult> => {
  try {
    const statusText = data.shopStatus === 'NEW' 
      ? "Toko Baru Buka (Belum ada rating/penjualan signifikan)" 
      : "Toko Sudah Berjalan (Sudah ada reputasi/rating)";

    const prompt = `
      PERAN: Anda adalah Senior Business Consultant & E-commerce Strategist untuk Marketplace Indonesia.
      
      DATA KLIEN:
      - Nama Toko: "${data.shopName}"
      - Status Toko: ${statusText}
      - Jenis Produk: "${data.productType}"
      - Kapasitas Kirim Harian: ${data.dailyCapacity} paket/hari (Operasional)
      - Total Stok Tersedia: ${data.stockCapacity} pcs
      - Target Margin Keuntungan: ${data.profitMargin}%
      - Target Marketplace: ${data.marketplace}

      TUGAS: Berikan analisa strategis mendalam berdasarkan data di atas (khususnya status toko dan kapasitas operasional) serta gambar produk (jika ada).
      
      FORMAT LAPORAN (Markdown):
      
      1. **Analisa Branding & Identitas** 🏪
         - Apakah nama "${data.shopName}" cocok untuk kategori "${data.productType}"?
         - KHUSUS ${data.shopStatus === 'NEW' ? 'TOKO BARU' : 'TOKO LAMA'}: Berikan strategi branding yang sesuai. 
           (Jika Baru: Fokus membangun Trust & First Impression. Jika Lama: Fokus pada Retensi & Dominasi).

      2. **Bedah Produk & Visual** 📦
         - (Analisa Gambar): Review kualitas foto. Apakah cukup menarik untuk scroll-stopper?
         - Market Fit: Apakah produk ini cocok untuk strategi "Volume Besar Margin Tipis" atau "Premium Margin Tebal"?

      3. **Strategi Penjualan di ${data.marketplace}** 🚀
         - Karena toko ini **${statusText}**, apa fitur ${data.marketplace} yang WAJIB dimaksimalkan minggu ini?
         - Strategi Operasional: Dengan kapasitas kirim **${data.dailyCapacity} paket/hari**, bagaimana mengatur flow order agar tidak overload atau justru kekurangan order?
         - Jika kapasitas kirim kecil tapi stok banyak: Sarankan cara mempercepat packing.
         - Jika kapasitas kirim besar: Sarankan cara scale-up traffic (Iklan/Live).

      4. **Analisa Keuntungan & Penetapan Harga** 💰
         - Margin ${data.profitMargin}% apakah realistis untuk status toko ini?
         - (Tips: Toko baru biasanya perlu penetrasi harga, Toko lama bisa main harga normal).
         - Ingatkan user untuk menggunakan fitur "Kalkulator Harga" di aplikasi ini untuk memastikan tidak rugi kena admin fee.

      5. **Action Plan Minggu Ini** ✅
         - 3 langkah konkret yang harus dilakukan penjual sekarang juga.
    `;

    const parts: any[] = [{ text: prompt }];
    
    // Add image if provided
    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: parts
      }
    });

    return {
      text: response.text || "Analisa selesai, namun tidak ada output teks.",
      sources: [] 
    };

  } catch (error: any) {
    console.error("Shop Strategy Analysis Error:", error);
    
    const errorDetail = error.message || error.toString();
    const errString = errorDetail.toLowerCase();

    if (errString.includes("429")) {
        throw new Error("Kuota AI penuh. Mohon tunggu 1 menit.");
    } else if (errString.includes("503")) {
        throw new Error("Server AI sedang sibuk.");
    }

    throw new Error(`Gagal menganalisa strategi: ${errorDetail.substring(0, 100)}...`);
  }
};

export const generateProductListing = async (
  imageBase64: string,
  mimeType: string,
  productName: string,
  marketplace: string
) => {
  try {
    const prompt = `
      Anda adalah ahli Copywriting dan SEO Marketplace Indonesia (${marketplace}).
      Tugas: Buat konten produk yang sangat menjual berdasarkan gambar dan nama produk: "${productName}".
      
      Aturan:
      1. Judul SEO: Harus mengandung kata kunci pencarian tinggi, bombastis tapi relevan, format marketplace (Merek - Nama Produk - Kata Kunci - Fitur).
      2. Deskripsi: Gunakan copywriting AIDA (Attention, Interest, Desire, Action), gunakan emoji yang menarik, poin-poin keunggulan (USP), dan spesifikasi teknis jika terlihat.
      3. Strategi Diskon: Analisa jenis barangnya, lalu sarankan strategi diskon (misal: bundling, harga coret psikologis, atau flash sale) dan berapa persen diskon yang wajar untuk menarik pembeli tanpa merusak harga pasar.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoTitle: { type: Type.STRING, description: "Judul produk optimasi SEO" },
            seoDescription: { type: Type.STRING, description: "Deskripsi produk lengkap dengan emoji dan poin-poin" },
            discountStrategy: { type: Type.STRING, description: "Penjelasan strategi diskon yang disarankan" },
            suggestedDiscountPercentage: { type: Type.INTEGER, description: "Angka saran diskon (0-100)" }
          },
          required: ["seoTitle", "seoDescription", "discountStrategy", "suggestedDiscountPercentage"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Product Gen Error:", error);
    throw new Error("Gagal membuat konten produk.");
  }
};