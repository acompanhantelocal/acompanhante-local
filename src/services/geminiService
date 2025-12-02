import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSeoData = async (title: string, description: string, price: number) => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing. Returning mock data.");
    return {
      seoTitle: `${title} - Melhor Preço | MarketConnect`,
      seoDescription: `Compre ${title} por apenas R$ ${price}. Confira detalhes, fotos e entre em contato via WhatsApp.`
    };
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Create SEO metadata for a classified ad.
      Product: ${title}
      Description: ${description}
      Price: ${price}
      
      Return JSON with 'seoTitle' (max 60 chars, compelling) and 'seoDescription' (max 160 chars, includes call to action).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoTitle: { type: Type.STRING },
            seoDescription: { type: Type.STRING },
          },
          required: ["seoTitle", "seoDescription"]
        }
      }
    });

    const jsonStr = response.text;
    return jsonStr ? JSON.parse(jsonStr) : { seoTitle: title, seoDescription: description };
  } catch (error) {
    console.error("Gemini SEO Generation failed:", error);
    return {
      seoTitle: title,
      seoDescription: description.substring(0, 150)
    };
  }
};

export const optimizeAdDescription = async (currentDescription: string) => {
    if (!process.env.API_KEY) return currentDescription;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Rewrite the following classified ad description to be more professional, persuasive, and SEO friendly using HTML formatting (breaks, lists): ${currentDescription}`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Description optimization failed", error);
        return currentDescription;
    }
}
