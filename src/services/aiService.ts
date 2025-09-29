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
    "Content-Type": "application/x-www-form-urlencoded", // Mudança aqui
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

      // Converte o objeto em URLSearchParams para formato form-urlencoded
      const formData = new URLSearchParams();
      formData.append("descricao", request.descricao);
      formData.append("formato", request.formato);
      formData.append("idioma", request.idioma);
      formData.append("gerar_codigo", request.gerar_codigo);

      const response = await aiApiClient.post<AIResponse>(
        "/gerar-casos-texto",
        formData // Envia como formData ao invés do objeto direto
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
