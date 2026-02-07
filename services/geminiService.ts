
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper untuk mendapatkan waktu Indonesia terkini
const getCurrentDateTime = () => {
  return new Date().toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta', 
    dateStyle: 'full', 
    timeStyle: 'short' 
  });
};

export interface AnalysisResult {
  text: string;
  sources: Array<{ title: string; uri: string }>;
}

export interface AdStrategyResult {
  breakEvenRoas: number;
  recommendedTargetRoas: number;
  biddingStrategy: string;
  dailyBudgetRecommendation: number;
  targetAudienceKeywords: string[];
  explanation: string;
}

export interface ShopData {
  shopName: string;
  productType: string;
  dailyCapacity: string; 
  stockCapacity: string;
  profitMargin: string;
  marketplace: string;
  shopStatus: 'NEW' | 'ESTABLISHED';
  sellingPrice?: number;
  netProfit?: number;
}

export interface TrendingProduct {
  name: string;
  category: string;
  status: string;
}

export interface MarketplaceTrend {
  platform: string;
  items: TrendingProduct[];
}

export interface DailyInsightResult {
  headline: string;
  strategy: string;
  marketMood: 'FIRE' | 'SLOW' | 'NORMAL';
  trendingCategories: string[];
  actionItem: string;
  marketplaceTrends: MarketplaceTrend[];
  sources?: Array<{ title: string; uri: string }>;
}

export const analyzeFinancialHealth = async (report: FinancialReport): Promise<string> => {
  try {
    const prompt = `
      CONTEXT: Waktu sekarang adalah ${getCurrentDateTime()}.
      PERAN: Anda adalah CFO berpengalaman untuk UKM Marketplace Indonesia.
      DATA: Omset Rp ${report.totalRevenue.toLocaleString('id-ID')}, Profit Rp ${report.finalNetProfit.toLocaleString('id-ID')}.
      Analisa kesehatan keuangan dan berikan saran strategis dalam 3 poin. 
      Pertimbangkan faktor tanggal saat ini (misal: apakah ini musim gajian atau persiapan kampanye besar).
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt
    });
    return response.text || "Gagal analisa.";
  } catch (error) {
    return "AI sedang sibuk menganalisa data Anda.";
  }
};

export const getDailyInsight = async (): Promise<DailyInsightResult> => {
  try {
    const prompt = `
      DATA TERBARU: Hari ini adalah ${getCurrentDateTime()}.
      TUGAS: Analisa tren marketplace Indonesia (Shopee, TikTok Shop, Tokopedia, Lazada) HARI INI.
      1. Tentukan Mood Pasar (FIRE/NORMAL/SLOW).
      2. Berikan Headline singkat & Strategi.
      3. List 3 produk/kategori spesifik yang sedang trending/viral di masing-masing platform (Shopee, TikTok, Tokopedia, Lazada).
      
      KEEP IT CONCISE. Output must be valid JSON matching the schema. Do not generate massive text.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            strategy: { type: Type.STRING },
            marketMood: { type: Type.STRING, enum: ["FIRE", "SLOW", "NORMAL"] },
            trendingCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItem: { type: Type.STRING },
            marketplaceTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING, description: "Shopee, TikTok, Tokopedia, or Lazada" },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "Product name" },
                        category: { type: Type.STRING },
                        status: { type: Type.STRING, description: "Viral/Naik Daun" }
                      }
                    }
                  }
                }
              }
            }
          },
          required: ["headline", "strategy", "marketMood", "marketplaceTrends", "actionItem"]
        }
      }
    });

    let jsonText = response.text || "{}";
    // Sanitize to remove potential Markdown wrappers (common in LLM output)
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    const result = JSON.parse(jsonText);
    
    // Ekstrak sumber berita jika tersedia
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Sumber Berita",
      uri: chunk.web?.uri || ""
    })).filter((s: any) => s.uri !== "") || [];

    return { ...result, sources };
  } catch (error) {
    console.error("Daily Insight Error:", error);
    // Return fallback data silently instead of throwing to prevent UI crash
    return { 
      headline: "Optimalkan Penjualan Anda!", 
      strategy: "Tetap pantau stok dan performa iklan di hari ini.", 
      marketMood: "NORMAL", 
      trendingCategories: ["Umum"], 
      actionItem: "Cek laporan harian sekarang.",
      marketplaceTrends: []
    };
  }
};

export const generateAdStrategy = async (
  productName: string,
  marketplace: string,
  sellingPrice: number,
  profitPerItem: number
): Promise<AdStrategyResult> => {
  try {
    // 1. Kalkulasi Matematika Pasti (Rule: Rekomendasi = 3x BEP)
    // BEP = Harga Jual / Profit
    const breakEvenRoas = sellingPrice / profitPerItem;
    const recommendedTargetRoas = breakEvenRoas * 3;
    const margin = (profitPerItem / sellingPrice) * 100;

    const prompt = `
      ROLE: Digital Ads Expert untuk Marketplace Indonesia (Shopee Ads, TikTok Ads, Tokopedia Ads).
      PRODUK: "${productName}" di ${marketplace}.
      DATA: Harga Jual Rp ${sellingPrice}, Profit Rp ${profitPerItem} (Margin ${margin.toFixed(1)}%).
      
      ATURAN KALKULASI:
      - Break Even ROAS (BEP): ${breakEvenRoas.toFixed(2)} (Titik impas modal)
      - Recommended Target ROAS: ${recommendedTargetRoas.toFixed(2)} (Strategi Profit Aman 3x Lipat BEP)
      
      TUGAS:
      Berikan strategi iklan lengkap berdasarkan angka target ROAS ${recommendedTargetRoas.toFixed(2)} tersebut.
      1. Tentukan strategi bidding yang cocok (misal: "Maximize GMV" atau "Maximize Profit" atau "Manual CPC").
      2. Rekomendasi budget harian awal yang masuk akal.
      3. Keyword/Audience targeting spesifik untuk produk ini.
      4. Penjelasan singkat: Mengapa kita set target ROAS di angka ${recommendedTargetRoas.toFixed(2)}? (Jelaskan bahwa ini 3x lipat dari titik impas untuk menjamin profitabilitas tinggi dan menutupi resiko biaya tak terduga).
      
      Output JSON Only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            // Kita tidak minta AI hitung angka lagi agar konsisten, tapi kita minta field lain
            biddingStrategy: { type: Type.STRING, description: "Growth atau Profit" },
            dailyBudgetRecommendation: { type: Type.NUMBER },
            targetAudienceKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING, description: "Alasan strategi dalam bahasa Indonesia" }
          },
          required: ["biddingStrategy", "dailyBudgetRecommendation", "targetAudienceKeywords", "explanation"]
        }
      }
    });

    const aiResult = JSON.parse(response.text || "{}");

    // Gabungkan hasil kalkulasi pasti dengan saran kualitatif AI
    return {
        breakEvenRoas,
        recommendedTargetRoas, // Pastikan angka ini yang dipakai (3x BEP)
        biddingStrategy: aiResult.biddingStrategy || "Standard Growth",
        dailyBudgetRecommendation: aiResult.dailyBudgetRecommendation || 25000,
        targetAudienceKeywords: aiResult.targetAudienceKeywords || [productName],
        explanation: aiResult.explanation || `Target ROAS diset ${recommendedTargetRoas.toFixed(1)}x (3 kali lipat dari titik impas) untuk memastikan setiap penjualan iklan menghasilkan profit bersih yang signifikan dan aman.`
    };

  } catch (error) {
    console.error("Ad Strategy Error:", error);
    // Fallback logic jika AI gagal
    const bep = sellingPrice / profitPerItem;
    return {
        breakEvenRoas: bep,
        recommendedTargetRoas: bep * 3,
        biddingStrategy: "Manual CPC / Standard",
        dailyBudgetRecommendation: 50000,
        targetAudienceKeywords: [productName, "Promo Murah", "Terlaris"],
        explanation: "AI sedang sibuk. Rekomendasi dihitung berdasarkan rumus 3x Profit Margin untuk keamanan budget."
    };
  }
};

export const analyzeShopStrategy = async (data: ShopData, imageBase64: string | null, mimeType: string | null): Promise<AnalysisResult> => {
  try {
    const prompt = `
      BERTINDAK SEBAGAI: Marketplace Business Expert Indonesia.
      WAKTU SEKARANG: ${getCurrentDateTime()}.
      DATA TOKO:
      - Nama Toko: "${data.shopName}"
      - Kategori: "${data.productType}"
      - Marketplace: ${data.marketplace}
      - Harga Jual: Rp ${data.sellingPrice?.toLocaleString('id-ID')}
      - Profit Bersih: Rp ${data.netProfit?.toLocaleString('id-ID')}
      
      TUGAS:
      1. Gunakan konteks tanggal sekarang untuk memberikan saran musiman (misal: jika mendekati Lebaran, sarankan produk hampers).
      2. Jika ada gambar, analisa kualitas visual produk (branding, pencahayaan, kemasan).
      3. Berikan analisa "Price-to-Value": Apakah harga Rp ${data.sellingPrice} kompetitif di pasar saat ini?
      4. Berikan 3 langkah konkret strategi marketing yang relevan dengan tren hari ini.
    `;
    
    const parts: any[] = [{ text: prompt }];
    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts }
    });
    
    return { 
      text: response.text || "Analisa selesai.", 
      sources: [] 
    };
  } catch (error) {
    console.error(error);
    throw new Error("Gagal analisa strategi.");
  }
};

const generateImageVariant = async (base64Image: string, mimeType: string, promptText: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: promptText }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const generateProductListing = async (
  imageBase64: string,
  mimeType: string,
  productName: string,
  marketplace: string,
  sellingPrice: number,
  profitPerItem: number
) => {
  try {
    const textPrompt = `
      BERTINDAK SEBAGAI: Marketplace Marketing Expert Indonesia.
      WAKTU SEKARANG: ${getCurrentDateTime()}.
      PRODUK: "${productName}" di ${marketplace}.
      DATA: Harga Jual Rp ${sellingPrice}, Profit per item Rp ${profitPerItem}.
      TUGAS: 
      1. Buat Judul SEO yang menyertakan keyword tren musiman jika ada (misal: "Promo Akhir Tahun").
      2. Buat Deskripsi SEO menarik.
      3. Hitung Target ROAS dan Rekomendasi Budget.
      OUTPUT: Harus valid JSON.
    `;
    
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: textPrompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoTitle: { type: Type.STRING },
            seoDescription: { type: Type.STRING },
            discountStrategy: { type: Type.STRING },
            suggestedDiscountPercentage: { type: Type.INTEGER },
            adsStrategy: {
               type: Type.OBJECT,
               properties: {
                  targetRoas: { type: Type.NUMBER },
                  dailyBudgetRecommendation: { type: Type.INTEGER },
                  audienceTargeting: { type: Type.STRING }
               },
               required: ["targetRoas", "dailyBudgetRecommendation", "audienceTargeting"]
            }
          },
          required: ["seoTitle", "seoDescription", "discountStrategy", "suggestedDiscountPercentage", "adsStrategy"]
        }
      }
    });

    const textResult = JSON.parse(textResponse.text || "{}");
    const generatedImages: string[] = [];
    
    // Generate 2 varian saja untuk efisiensi kecepatan
    const imagePrompts = [
      `Professional e-commerce product photography, high resolution, soft lighting`,
      `Product lifestyle shot in Indonesian home setting, warm natural lighting`
    ];

    for (const p of imagePrompts) {
        const img = await generateImageVariant(imageBase64, mimeType, p);
        if (img) generatedImages.push(img);
        await new Promise(r => setTimeout(r, 300));
    }

    if (generatedImages.length === 0) generatedImages.push(`data:${mimeType};base64,${imageBase64}`);

    return { ...textResult, generatedImages };
  } catch (error) {
    console.error(error);
    throw new Error("Gagal memproses Magic AI.");
  }
};
