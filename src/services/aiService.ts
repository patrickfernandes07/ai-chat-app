// src/services/aiService.ts
import axios from "axios";

// Interface baseada no seu swagger
export interface GerarCasosTextoRequest {
  descricao: string;
  formato: string;
  idioma: string;
  gerar_codigo: string;
}

export interface TestCase {
  id: string;
  titulo: string;
  descricao: string;
  resultado_esperado: string;
  tipo: string;
  prioridade?: string;
}

export interface AIResponse {
  casos: TestCase[];
  resumo: string;
  tempo_processamento: number;
}

export interface ValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

// Configure a base URL da sua API aqui
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://magentest-production.up.railway.app";

const aiApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para tratar erros
aiApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error);
    if (error.response?.status === 422) {
      // Erro de validação
      const validationError: ValidationError = error.response.data;
      throw new Error(
        `Erro de validação: ${validationError.detail
          .map((err) => err.msg)
          .join(", ")}`
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Timeout: A requisição demorou muito para responder");
    }

    throw error;
  }
);

export class AIService {
  static async gerarCasosTeste(
    request: GerarCasosTextoRequest
  ): Promise<AIResponse> {
    try {
      console.log(request);
      const response = await aiApiClient.post<AIResponse>(
        "/gerar-casos-texto",
        request
      );

      return response.data;
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.message || "Erro ao gerar casos de teste");
      }
      throw error;
    }
  }
}
