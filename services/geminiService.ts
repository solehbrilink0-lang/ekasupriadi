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
    return "Terjadi kesalahan saat menghubungi AI Consultant. Mohon coba lagi nanti.";
  }
};

export const analyzeStoreUrl = async (
  url: string,
  marketplace: string,
  userNotes: string
): Promise<AnalysisResult> => {
  try {
    // 1. Clean URL to prevent token bloat and confusion (remove huge query params)
    let cleanUrl = url;
    let shopNameHint = "";
    try {
      const urlObj = new URL(url);
      cleanUrl = `${urlObj.origin}${urlObj.pathname}`;
      
      // Try to extract shop name from path parts for better search fallback
      const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
      if (pathParts.length > 0) {
        // Usually shop name is the first part in path for shopee/tokopedia/tiktok
        // e.g. shopee.co.id/my_shop_name
        if (!pathParts[0].includes('product') && !pathParts[0].includes('search')) {
            shopNameHint = pathParts[0].replace(/[-_]/g, ' ');
        }
      }
    } catch (e) {
      // If invalid URL string, use original but warn internally
      console.warn("Invalid URL parsing", e);
    }

    const prompt = `
      ROLE: E-commerce Auditor & Strategist (${marketplace}).
      
      INPUT:
      - Target URL: ${cleanUrl}
      - Shop Name Hint: ${shopNameHint || "Unknown"}
      - User Notes: "${userNotes}"

      TASK:
      Perform a "Site Audit" using Google Search.
      1. Search for the URL directly.
      2. IF the specific URL is not accessible or returns no info, SEARCH for the Shop Name/Brand "${shopNameHint}" on ${marketplace} via Google.
      3. Analyze the available public data (reviews, pricing strategy, brand reputation).

      OUTPUT REPORT FORMAT (Markdown):
      - **Status Toko**: (Apakah toko/produk ditemukan di hasil pencarian?)
      - **Kesan Branding**: (Visual, Trustworthiness, Profesionalitas berdasarkan data search)
      - **Analisa Kompetitif**: (Harga vs Pasar, Ulasan Customer)
      - **Action Plan**: (3-5 saran konkrit untuk user agar penjualan naik)

      IMPORTANT:
      - If you cannot find specific data, give "General Best Practices" for the category inferred from the URL or Notes.
      - Do NOT simply say "I cannot browse". Use the search tool to find *metadata* about the page.
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
      text: response.text || "Analisa selesai, namun AI tidak memberikan output teks. Coba periksa URL atau catatan Anda.",
      sources: sources
    };

  } catch (error: any) {
    console.error("Store Analysis Error:", error);
    
    // Normalize error string for checking
    const errorDetail = error.message || error.toString();
    const errString = errorDetail.toLowerCase();

    // Specific Error Handling
    if (errString.includes("429") || errString.includes("quota") || errString.includes("resource_exhausted")) {
        throw new Error("Kuota AI sedang penuh/limit tercapai. Mohon tunggu 1-2 menit sebelum mencoba lagi.");
    } else if (errString.includes("400")) {
        throw new Error("URL tidak valid atau format permintaan ditolak oleh server.");
    } else if (errString.includes("503") || errString.includes("500") || errString.includes("overloaded")) {
        throw new Error("Layanan AI sedang sibuk. Silakan coba 1 menit lagi.");
    } else if (errString.includes("fetch") || errString.includes("network") || errString.includes("failed to fetch")) {
        throw new Error("Koneksi gagal. Periksa internet Anda (VPN/AdBlock mungkin memblokir).");
    }

    // Fallback: If it's a raw JSON error, simplify it
    if (errorDetail.includes("{") && errorDetail.includes("}")) {
        throw new Error("Terjadi gangguan pada sistem AI. Silakan coba lagi nanti.");
    }

    throw new Error(`Gagal: ${errorDetail.substring(0, 100)}...`);
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