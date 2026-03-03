import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GeminiProxyBody {
  texto: string;
  idioma: string;
  contexto: string;
}

interface GeminiNarrationResponse {
  fala: string;
}

const SYSTEM_PROMPT =
  'Você é um assistente de acessibilidade. Transforme o texto recebido em uma narração fluida e descritiva para deficientes visuais no idioma solicitado. Se for uma bio, seja carismático. Responda apenas o JSON.';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<GeminiNarrationResponse | { error: string }>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_KEY is not configured' });
    return;
  }

  const { texto, idioma, contexto } = (req.body ?? {}) as Partial<GeminiProxyBody>;

  if (!texto?.trim() || !idioma?.trim()) {
    res.status(400).json({ error: 'Missing required fields: texto and idioma' });
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const generationConfig: GenerationConfig = {
    responseMimeType: 'application/json',
    temperature: 0.5,
  };

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Contexto: ${contexto ?? ''}\nIdioma: ${idioma}\nTexto: ${texto}`,
            },
          ],
        },
      ],
      generationConfig,
    });

    const rawText = result.response.text();
    const parsed = JSON.parse(rawText) as Partial<GeminiNarrationResponse>;
    const fala = typeof parsed.fala === 'string' ? parsed.fala : texto;

    res.status(200).json({ fala });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate narration' });
  }
}