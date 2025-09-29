// src/components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Bot, User, Loader2, AlertCircle, Languages } from 'lucide-react';
import { AIService, GerarCasosTextoRequest, AIResponse } from '@/services/aiService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: AIResponse;
  error?: string;
}

type Language = 'pt' | 'en' | 'es';

const languageConfig = {
  pt: {
    flag: '🇧🇷',
    name: 'Português',
    placeholder: 'Descreva o que você quer testar (ex: Login de usuário, Cadastro de produto, etc.)',
    title: 'MagenTest - Gerador de Casos de Teste',
    welcome: 'Olá! Descreva o que você quer testar e eu vou gerar casos de teste para você.',
    generating: 'Gerando casos de teste...',
    success: 'Casos de teste gerados com sucesso! Encontrei',
    casesText: 'casos de teste baseados na sua descrição.',
    error: 'Ocorreu um erro ao processar sua solicitação.',
    processedIn: 'Processado em',
    case: 'Caso',
    description: 'Descrição:',
    expectedResult: 'Resultado Esperado:',
    summary: 'Resumo:',
  },
  en: {
    flag: '🇺🇸',
    name: 'English',
    placeholder: 'Describe what you want to test (e.g., User login, Product registration, etc.)',
    title: 'MagenTest - Test Case Generator',
    welcome: 'Hello! Describe what you want to test and I will generate test cases for you.',
    generating: 'Generating test cases...',
    success: 'Test cases generated successfully! Found',
    casesText: 'test cases based on your description.',
    error: 'An error occurred while processing your request.',
    processedIn: 'Processed in',
    case: 'Case',
    description: 'Description:',
    expectedResult: 'Expected Result:',
    summary: 'Summary:',
  },
  es: {
    flag: '🇪🇸',
    name: 'Español',
    placeholder: 'Describe lo que quieres probar (ej: Inicio de sesión, Registro de producto, etc.)',
    title: 'MagenTest - Generador de Casos de Prueba',
    welcome: '¡Hola! Describe lo que quieres probar y generaré casos de prueba para ti.',
    generating: 'Generando casos de prueba...',
    success: '¡Casos de prueba generados con éxito! Encontré',
    casesText: 'casos de prueba basados en tu descripción.',
    error: 'Ocurrió un error al procesar tu solicitud.',
    processedIn: 'Procesado en',
    case: 'Caso',
    description: 'Descripción:',
    expectedResult: 'Resultado Esperado:',
    summary: 'Resumen:',
  },
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = languageConfig[language];

  // Auto-scroll para o final quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const request: GerarCasosTextoRequest = {
        descricao: inputValue,
        formato: "Procedural",
        idioma: language,
        gerar_codigo: "Robotframework",
      };

      const response = await AIService.gerarCasosTeste(request);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `${t.success} ${response.casos.length} ${t.casesText}`,
        timestamp: new Date(),
        data: response,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: t.error,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderTestCases = (data: AIResponse) => (
    <div className="mt-4 space-y-3">
      <div className="text-sm text-muted-foreground">
        {t.processedIn} {data.tempo_processamento}ms
      </div>
      
      <div className="grid gap-3">
        {data.casos.map((testCase, index) => (
          <Card key={testCase.id} className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Badge variant="outline">{t.case} {index + 1}</Badge>
                {testCase.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-xs font-medium text-muted-foreground">{t.description}</span>
                <p className="text-sm">{testCase.descricao}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">{t.expectedResult}</span>
                <p className="text-sm">{testCase.resultado_esperado}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {testCase.tipo}
                </Badge>
                {testCase.prioridade && (
                  <Badge variant="outline" className="text-xs">
                    {testCase.prioridade}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.resumo && (
        <Card className="bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <h4 className="text-sm font-medium mb-2">{t.summary}</h4>
            <p className="text-sm">{data.resumo}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {t.title}
            </CardTitle>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="text-lg">{t.flag}</span>
                  <Languages className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(languageConfig) as Language[]).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className="gap-2 cursor-pointer"
                  >
                    <span className="text-lg">{languageConfig[lang].flag}</span>
                    <span>{languageConfig[lang].name}</span>
                    {language === lang && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4 pb-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t.welcome}</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.error && (
                        <div className="mt-2 p-2 bg-destructive/20 rounded text-destructive text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {message.error}
                        </div>
                      )}

                      {message.data && renderTestCases(message.data)}

                      <div className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{t.generating}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Elemento invisível para scroll automático */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator className="my-4 flex-shrink-0" />

          <div className="flex gap-2 flex-shrink-0">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              className="min-h-[60px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="self-end h-[60px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}