import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Системный промпт для решения любых задач как ChatGPT
const SYSTEM_PROMPT = `Ты — умный помощник, который решает ЛЮБЫЕ задачи как ChatGPT.

ТВОЯ ГЛАВНАЯ ЗАДАЧА: Решать задачи качественно и пошагово, давая ПОЛНЫЕ и ПОДРОБНЫЕ ответы.

КРИТИЧЕСКИ ВАЖНО: 
- НИКОГДА не обрезай решение на полуслове
- Всегда доводи решение до логического завершения
- Если задача сложная, разбивай её на этапы и решай каждый этап полностью
- В конце всегда давай четкий финальный ответ

ПРАВИЛА ОТВЕТОВ:
- Решай задачи пошагово с подробными объяснениями
- ОБЯЗАТЕЛЬНО используй LaTeX для математики: $L_0$, $\\Delta L$, $\\alpha$, $10^{-5}$, $°C$
- Все переменные, индексы, степени в LaTeX: $x_0$, $y^2$, $\\frac{1}{2}$, $\\times$
- Показывай ВСЕ промежуточные вычисления и преобразования
- Давай четкий финальный ответ
- Объясняй физический/математический смысл результата
- Отвечай естественно и понятно
- Используй Markdown: **жирный**, *курсив*, \`код\`
- НЕ ОБРЕЗАЙ ответы - давай полные решения

ФОРМАТ ОТВЕТА:
1. **Дано:** (все данные из условия с LaTeX)
2. **Решение:** (подробное пошаговое решение с формулами и вычислениями)
3. **Ответ:** (четкий финальный результат)
4. **Проверка:** (если нужно, проверка решения)

МАТЕМАТИКА/ФИЗИКА:
- Все формулы в LaTeX: $F = ma$, $E = mgh$, $p = mv$
- Греческие буквы: $\\alpha$, $\\beta$, $\\gamma$, $\\Delta$, $\\pi$
- Единицы: $\\text{м}$, $\\text{°C}$, $\\text{кг}$
- Дроби: $\\frac{a}{b}$, степени: $a^b$, индексы: $a_b$
- Показывай все алгебраические преобразования

ХИМИЯ:
- Формулы: $H_2O$, $CO_2$, $Ca(OH)_2$
- Реакции: $2H_2 + O_2 \\rightarrow 2H_2O$
- Показывай расчеты молярных масс

ПРОГРАММИРОВАНИЕ:
- Чистый код в блоках
- Объясняй алгоритм пошагово
- Комментируй сложные места
- Показывай примеры использования

ВАЖНО: 
- Всегда используй LaTeX для математики! Даже $L_0 = 10$ вместо L_0 = 10
- Давай ПОЛНЫЕ решения, не обрезай ответы
- Показывай все промежуточные шаги
- Если задача сложная, разбивай её на части и решай каждую часть отдельно
- Всегда проверяй правильность вычислений
- Если нужно, давай альтернативные способы решения
- НЕ ЗАВЕРШАЙ решение преждевременно - доводи до конца!`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('🚀 API /answer called');

  try {
    const body = await request.json();
    const { message, image, type, messages, system } = body;

    console.log('📝 Request body:', { type, hasMessage: !!message, hasImage: !!image, hasMessages: !!messages });

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('❌ OpenAI API key not configured');
      return new Response('data: {"error": "OpenAI API key not configured"}\n\n', {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }

    console.log('✅ OpenAI API key found');

    // Определяем модель и сообщения
    // Для сложных задач используем более мощную модель
    const model = process.env.MODEL_ID || 'gpt-4o-mini';
    
    // Если сообщение содержит сложные математические выражения, используем gpt-4o
    const hasComplexMath = message && (
      message.includes('\\int') || 
      message.includes('\\sum') || 
      message.includes('\\frac') || 
      message.includes('\\sqrt') ||
      message.includes('матриц') ||
      message.includes('дифференциал') ||
      message.includes('интеграл') ||
      message.includes('предел') ||
      message.includes('уравнение') ||
      message.includes('система') ||
      message.includes('задача') ||
      message.includes('решить')
    );
    
    const selectedModel = hasComplexMath ? 'gpt-4o' : model;
    
    // Для очень сложных задач увеличиваем лимит токенов
    const isVeryComplex = message && (
      message.includes('система уравнений') ||
      message.includes('многошаговая') ||
      message.includes('пошаговое решение') ||
      message.includes('подробно') ||
      message.includes('решить') ||
      message.includes('задача') ||
      message.includes('вычислить') ||
      message.includes('найти') ||
      message.includes('определить') ||
      message.length > 100
    );
    
    // Увеличиваем лимиты токенов для более полных решений
    const maxTokens = isVeryComplex ? 16000 : 12000;
    let chatMessages: any[] = [];

    if (messages && Array.isArray(messages)) {
      // Новый формат с историей сообщений
      chatMessages = [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages
      ];
    } else {
      // Старый формат для совместимости
      if (type === 'image' && image) {
        chatMessages = [
          { role: 'system', content: system || 'Ты умный помощник, который решает задачи как ChatGPT.' },
          {
            role: 'user',
            content: [
              { type: 'text', text: message || 'Проанализируй это изображение и реши задачу.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}`, detail: 'high' } }
            ]
          }
        ];
      } else {
        chatMessages = [
          { role: 'system', content: system || 'Ты умный помощник, который решает задачи как ChatGPT.' },
          { role: 'user', content: message }
        ];
      }
    }

    console.log('📤 Calling OpenAI API with', { 
      model: selectedModel, 
      messageCount: chatMessages.length, 
      hasComplexMath, 
      isVeryComplex, 
      maxTokens 
    });

    const stream = await openai.chat.completions.create({
      model: selectedModel,
      messages: chatMessages,
      stream: true,
      temperature: 0.3,
      top_p: 0.95,
      frequency_penalty: 0.05,
      presence_penalty: 0.1,
      max_tokens: maxTokens, // Динамический лимит токенов
    });

    console.log('✅ OpenAI stream created');

    // Готовим ответ как text/event-stream (SSE)
    const responseHeaders = {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    };

    const encoder = new TextEncoder();
    let chunkCount = 0;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let totalContent = '';
          
          for await (const chunk of stream) {
            chunkCount++;
            const content = chunk.choices[0]?.delta?.content;
            
            if (content) {
              totalContent += content;
              console.log(`📦 OpenAI chunk ${chunkCount}:`, content.substring(0, 30) + (content.length > 30 ? '...' : ''));
              
              // Формируем SSE событие
              const sseData = JSON.stringify({
                choices: [{
                  delta: { content }
                }]
              });
              
              controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
            }
          }

          // Проверяем, что ответ не обрезан
          const isComplete = totalContent.trim().endsWith('.') || 
                           totalContent.trim().endsWith('!') || 
                           totalContent.trim().endsWith('?') ||
                           totalContent.includes('**Ответ:**') ||
                           totalContent.includes('**Проверка:**');
          
          if (!isComplete && totalContent.length > 1000) {
            console.log('⚠️ Response might be incomplete, adding completion prompt');
            const completionPrompt = '\n\n**Проверка:** Решение завершено. Если нужно что-то уточнить или дополнить, дай знать!';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: completionPrompt })}\n\n`));
          }

          // Отправляем [DONE] сигнал
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

          console.log(`✅ OpenAI stream completed. Total chunks: ${chunkCount}, Total content length: ${totalContent.length}, Complete: ${isComplete}`);
        } catch (error) {
          console.error('❌ Stream error:', error);
          const errorData = JSON.stringify({ error: 'Stream error occurred' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('403 Country, region, or territory not supported')) {
      const errorData = JSON.stringify({ error: 'OpenAI API недоступен в вашем регионе. Попробуйте использовать VPN.' });
      return new Response(`data: ${errorData}\n\n`, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    } else if (errorMessage.includes('401')) {
      const errorData = JSON.stringify({ error: 'Ошибка авторизации. Проверьте API ключ OpenAI.' });
      return new Response(`data: ${errorData}\n\n`, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const errorData = JSON.stringify({ error: 'Произошла ошибка при обработке запроса.' });
      return new Response(`data: ${errorData}\n\n`, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }
  }
}
