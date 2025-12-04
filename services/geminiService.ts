import { GoogleGenAI } from "@google/genai";
import { Student, AIAnalysisResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateStudentReport = async (student: Student): Promise<AIAnalysisResult | null> => {
  const ai = getClient();
  if (!ai) {
    console.warn("API Key not found. Returning mock AI response.");
    // Mock response for demo purposes if no key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: "Análise simulada: O aluno apresenta desenvolvimento dentro da curva esperada. Atenção às restrições alimentares cadastradas.",
          recommendations: [
            "Aumentar ingestão de fibras.",
            "Monitorar hidratação durante atividades físicas.",
            "Evitar contaminação cruzada devido às alergias."
          ],
          riskAssessment: "Risco Moderado devido a alergias múltiplas."
        });
      }, 1500);
    });
  }

  const prompt = `
    Atue como um nutricionista pediátrico sênior. Analise os dados do seguinte aluno e gere um relatório curto em JSON.
    
    Dados do Aluno:
    Nome: ${student.fullName}
    Idade: ${calculateAge(student.dateOfBirth)} anos
    Peso: ${student.weightKg}kg
    Altura: ${student.heightCm}cm
    Alergias: ${student.medical.allergies.map(a => `${a.name} (${a.severity})`).join(', ') || 'Nenhuma'}
    Intolerâncias: ${student.medical.intolerances.join(', ') || 'Nenhuma'}
    Notas Médicas: ${student.medical.medicalNotes}

    Gere um JSON com a seguinte estrutura (sem markdown):
    {
      "summary": "Um resumo de 2 parágrafos sobre o estado nutricional e cuidados.",
      "recommendations": ["Lista de 3 a 5 recomendações práticas para a escola e pais."],
      "riskAssessment": "Avaliação de risco (Baixo/Médio/Alto) e justificativa curta."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}