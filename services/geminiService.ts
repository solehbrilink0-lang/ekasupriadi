import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AnalysisResult {
  text: string;
  sources: Array<{ title: string; uri: string }>;
}

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

    // Using gemini-3-flash-preview for general text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    return response.text || "Maaf, tidak dapat menghasilkan analisa saat ini.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Terjadi kesalahan saat menghubungi AI Consultant.";
  }
};

export const analyzeStoreUrl = async (
  url: string,
  marketplace: string,
  userNotes: string
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Tugas: Lakukan "Site Audit" dan analisa kompetitor terhadap URL Toko berikut: ${url}
      Platform: ${marketplace}
      Keluhan/Catatan Pengguna: "${userNotes}"

      Instruksi:
      1. Gunakan Google Search untuk mencari halaman tersebut, review pelanggan, diskusi di forum, atau reputasi brand ini di internet.
      2. Analisa seolah-olah Anda adalah customer yang kritis dan konsultan bisnis expert.
      3. Berikan laporan yang mencakup:
         - **Kesan Pertama & Branding**: Bagaimana tampilan toko di mata customer?
         - **Analisa Harga & Produk**: (Jika data tersedia di hasil pencarian) Apakah harga bersaing?
         - **Reputasi**: Apa kata orang tentang toko ini?
         - **Saran Perbaikan**: Poin-poin konkret untuk meningkatkan penjualan berdasarkan data yang ditemukan dan best practice ${marketplace}.
      
      Jika URL spesifik tidak dapat diakses secara detail, berikan saran strategis umum namun tajam berdasarkan nama toko (jika ada di URL) atau kategori produk yang tersirat.
    `;

    // Using gemini-3-flash-preview as recommended for Search Grounding
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    // Extract grounding chunks (sources)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    return {
      text: response.text || "Maaf, analisa tidak dapat dibuat. Pastikan URL benar atau coba lagi nanti.",
      sources: sources
    };

  } catch (error) {
    console.error("Store Analysis Error:", error);
    throw new Error("Gagal menganalisa URL toko. Pastikan koneksi aman dan URL valid.");
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