
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuestion(level: number): Promise<Question> {
  // Detailed difficulty mapping for better progression
  let difficultyDescription = '';
  if (level <= 3) {
    difficultyDescription = 'Iniciante absoluto (A1). Foque em cumprimentos básicos, pronomes simples e vocabulário do dia a dia (cores, números, família).';
  } else if (level <= 6) {
    difficultyDescription = 'Básico/Intermediário (A2). Foque em tempos verbais simples (presente, passado), preposições e situações de viagem/compras.';
  } else if (level <= 9) {
    difficultyDescription = 'Intermediário (B1/B2). Use Phrasal Verbs comuns, tempos perfeitos (Present Perfect) e expressões idiomáticas frequentes.';
  } else {
    difficultyDescription = 'Avançado (C1). Use vocabulário acadêmico ou profissional, expressões idiomáticas raras, nuances gramaticais sutis e estruturas complexas.';
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere uma pergunta de múltipla escolha em Inglês desafiadora para o Nível ${level}. 
    Contexto de dificuldade: ${difficultyDescription}
    
    REGRAS:
    1. A pergunta e as opções de resposta devem estar em Inglês.
    2. A 'explanation' (explicação do porquê a resposta está correta) e o 'hint' (dica) devem estar em PORTUGUÊS BRASILEIRO.
    3. Certifique-se de que APENAS UMA resposta esteja correta.
    4. O nível de dificuldade deve ser estritamente respeitado para criar uma curva de aprendizado real.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: 4,
            maxItems: 4
          },
          correctIndex: { type: Type.INTEGER },
          hint: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctIndex", "hint", "explanation"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data as Question;
  } catch (error) {
    console.error("Failed to parse question JSON:", error);
    throw new Error("Não foi possível gerar uma pergunta válida. Tente novamente.");
  }
}
