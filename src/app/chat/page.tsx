'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { Header } from '@/components/Header';
import { initTelegramWebApp, applyTelegramTheme } from '@/lib/telegram';
import { addToHistory, updateHistoryItem, getHistory, HistoryItem } from '@/lib/history';
// Системный промпт вынесен отдельно чтобы не импортировать серверный код на клиент
const SYSTEM_PROMPT = `Ты — умный помощник, который решает ЛЮБЫЕ задачи как ChatGPT.

ТВОЯ ГЛАВНАЯ ЗАДАЧА: Решать задачи качественно и пошагово, давая ПОЛНЫЕ и ПОДРОБНЫЕ ответы.

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
- Показывай все промежуточные шаги`;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

function ChatPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Сохранение диалога в историю
  const saveToHistory = React.useCallback((messages: Message[]) => {
    if (messages.length === 0) return;
    
    if (currentChatId) {
      // Обновляем существующий диалог
      updateHistoryItem(currentChatId, messages);
    } else {
      // Создаем новый диалог
      const chatId = addToHistory(messages);
      setCurrentChatId(chatId);
    }
  }, [currentChatId]);

  // Сохраняем в историю при изменении сообщений
  useEffect(() => {
    if (messages.length > 0) {
      saveToHistory(messages);
    }
  }, [messages, saveToHistory]);

  // Обработка URL параметров для предзаполнения сообщения
  useEffect(() => {
    const initialMessage = searchParams.get('message');
    const imageBase64 = searchParams.get('image');
    const filename = searchParams.get('filename');
    const imageId = searchParams.get('imageId');
    const historyId = searchParams.get('history');
    
    if (messages.length === 0) {
      if (historyId) {
        // Загружаем диалог из истории
        loadHistoryDialog(historyId);
      } else if (imageId) {
        // Обрабатываем изображение из localStorage
        const imageData = localStorage.getItem(imageId);
        if (imageData) {
          try {
            const { base64, filename: storedFilename } = JSON.parse(imageData);
            const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'image/jpeg' });
            const imageFile = new File([blob], storedFilename || 'image.jpg', { type: 'image/jpeg' });
            handleSendImage(imageFile);
            // Удаляем временное изображение после использования
            localStorage.removeItem(imageId);
          } catch (error) {
            console.error('❌ Error loading image from localStorage:', error);
          }
        }
      } else if (imageBase64) {
        // Обрабатываем изображение из URL
        try {
          // Декодируем URL-кодированный base64
          const decodedBase64 = decodeURIComponent(imageBase64);
          
          // Очищаем base64 строку от возможных проблем
          const cleanBase64 = decodedBase64.replace(/[^A-Za-z0-9+/=]/g, '');
          
          // Проверяем, что строка не пустая и имеет правильную длину
          if (!cleanBase64 || cleanBase64.length % 4 !== 0) {
            console.error('❌ Invalid base64 string after cleaning:', cleanBase64);
            console.error('❌ Original base64:', imageBase64);
            return;
          }
          
          console.log('🖼️ Processing image from URL, base64 length:', cleanBase64.length);
          
          // Создаем File объект с base64 данными
          const blob = new Blob([Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0))], { type: 'image/jpeg' });
          const imageFile = new File([blob], filename || 'image.jpg', { type: 'image/jpeg' });
          handleSendImage(imageFile);
        } catch (error) {
          console.error('❌ Error processing image from URL:', error);
          console.error('❌ Problematic base64:', imageBase64);
        }
      } else if (initialMessage) {
        try {
          const decodedMessage = decodeURIComponent(initialMessage);
          handleSendMessage(decodedMessage);
        } catch (error) {
          console.error('❌ Error decoding URL parameter:', error);
          // Если декодирование не удалось, используем исходное сообщение
          handleSendMessage(initialMessage);
        }
      }
    }
  }, [searchParams]); // Убрали messages из зависимостей чтобы избежать дублирования

  // Загрузка диалога из истории
  const loadHistoryDialog = (historyId: string) => {
    const history = getHistory();
    const dialog = history.find(item => item.id === historyId);
    
    if (dialog) {
      setCurrentChatId(dialog.id);
      // Обновляем ID сообщений для уникальности
      const messagesWithUniqueIds = dialog.messages.map((msg, index) => ({
        ...msg,
        id: `${msg.role}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
      }));
      setMessages(messagesWithUniqueIds);
    }
  };

  const handleSendMessage = React.useCallback(async (message: string) => {
    if (!message.trim() || isLoading) {
      console.log('🚫 Request blocked:', { message: !!message.trim(), isLoading });
      return;
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const userMessageId = `user-${timestamp}-${randomId}`;
    const assistantMessageId = `assistant-${timestamp + 1}-${randomId}`;

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    // Добавляем пустое сообщение ассистента для стриминга
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    // Безопасно отменяем предыдущий запрос
    if (abortControllerRef.current) {
      const controller = abortControllerRef.current;
      abortControllerRef.current = null; // Сначала обнуляем ссылку
      
      try {
        // Пытаемся отменить, но не проверяем состояние - просто ловим ошибку
        controller.abort();
        console.log('🛑 Previous request aborted');
      } catch (abortError) {
        // Игнорируем все ошибки отмены - это нормальное поведение
        console.log('🛑 Abort completed (expected)');
      }
    }
    abortControllerRef.current = new AbortController();

    console.log('🚀 Starting SSE request:', { userMessageId, assistantMessageId });

    try {
      // Подготавливаем историю сообщений для API
      const chatHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory,
          system: SYSTEM_PROMPT
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ SSE connection established');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantContent = '';

      // Читаем SSE поток
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Парсим SSE события
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data:')) continue;
          
          const data = line.slice(5).trim();
          if (data === '[DONE]') {
            console.log('✅ SSE stream completed');
            break;
          }

          try {
            const json = JSON.parse(data);
            
            // Проверяем на ошибку
            if (json.error) {
              throw new Error(json.error);
            }

            const delta = json?.choices?.[0]?.delta;
            if (delta?.content) {
              assistantContent += delta.content;
              
              // Обновляем сообщение ассистента в реальном времени
              setMessages(prev => {
                const copy = [...prev];
                const lastMessage = copy[copy.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return copy;
              });
            }
          } catch (parseError) {
            // Пропускаем некорректные JSON (например, keepalive сообщения)
            console.log('Skipping invalid JSON:', data);
          }
        }
      }

      console.log('📄 Final assistant content length:', assistantContent.length);

    } catch (error) {
      console.error('❌ Error:', error);
      
      // Проверяем на AbortError первым делом
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
        console.log('🛑 Request was aborted - это нормально');
        return; // Не показываем ошибку для отмененных запросов
      }
      
      let errorMessage = 'Извините, произошла ошибка при обработке запроса. Попробуйте еще раз.';
      
      if (error instanceof Error) {
        if (error.message.includes('OpenAI API недоступен')) {
          errorMessage = error.message;
        } else if (error.message.includes('авторизации')) {
          errorMessage = error.message;
        }
      }

      // Обновляем сообщение ассистента с ошибкой
      setMessages(prev => {
        const copy = [...prev];
        const lastMessage = copy[copy.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = errorMessage;
        }
        return copy;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading]);

  const handleSendImage = React.useCallback(async (file: File) => {
    if (!file || isLoading) return;

    // Конвертируем файл в base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const userMessageId = `user-${timestamp}-${randomId}`;
    const assistantMessageId = `assistant-${timestamp + 1}-${randomId}`;

    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: 'Проанализируй это изображение',
      timestamp: new Date()
    };

    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    // Безопасно отменяем предыдущий запрос
    if (abortControllerRef.current) {
      const controller = abortControllerRef.current;
      abortControllerRef.current = null; // Сначала обнуляем ссылку
      
      try {
        // Пытаемся отменить, но не проверяем состояние - просто ловим ошибку
        controller.abort();
        console.log('🛑 Previous image request aborted');
      } catch (abortError) {
        // Игнорируем все ошибки отмены - это нормальное поведение
        console.log('🛑 Abort completed (expected)');
      }
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Проанализируй это изображение и реши задачу',
          image: base64,
          type: 'image',
          system: SYSTEM_PROMPT
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data:')) continue;
          
          const data = line.slice(5).trim();
          if (data === '[DONE]') break;

          try {
            const json = JSON.parse(data);
            
            if (json.error) {
              throw new Error(json.error);
            }

            const delta = json?.choices?.[0]?.delta;
            if (delta?.content) {
              assistantContent += delta.content;
              
              setMessages(prev => {
                const copy = [...prev];
                const lastMessage = copy[copy.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return copy;
              });
            }
          } catch (parseError) {
            console.log('Skipping invalid JSON:', data);
          }
        }
      }

    } catch (error) {
      console.error('❌ Error:', error);
      
      // Проверяем на AbortError первым делом
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
        console.log('🛑 Image request was aborted - это нормально');
        return; // Не показываем ошибку для отмененных запросов
      }
      
      let errorMessage = 'Извините, произошла ошибка при обработке изображения.';
      
      if (error instanceof Error) {
        if (error.message.includes('OpenAI API недоступен')) {
          errorMessage = error.message;
        }
      }

      setMessages(prev => {
        const copy = [...prev];
        const lastMessage = copy[copy.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = errorMessage;
        }
        return copy;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading]);

  const handleSendFile = React.useCallback(async (file: File) => {
    if (!file || isLoading) return;

    // Для PDF файлов используем API upload
    if (file.type === 'application/pdf') {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }

        // Отправляем извлеченный текст как обычное сообщение
        await handleSendMessage(`Проанализируй этот PDF файл (${file.name}):\n\n${result.text}`);
      } catch (error) {
        console.error('❌ PDF processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ошибка при обработке PDF файла';
        await handleSendMessage(`Ошибка при обработке PDF: ${errorMessage}`);
      }
    } else {
      // Для других файлов конвертируем в base64 и отправляем как изображение
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const base64 = result.split(',')[1];
          await handleSendImage(new File([file], file.name, { type: file.type }));
        }
      };
      reader.readAsDataURL(file);
    }
  }, [handleSendMessage, handleSendImage, isLoading]);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const init = async () => {
      try {
        await initTelegramWebApp();
        await applyTelegramTheme();
      } catch (error) {
        console.error('Telegram WebApp initialization error:', error);
      }
    };

    init();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Помогатор" subtitle="Универсальный академический помощник" />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.content}
            isUser={message.role === 'user'}
            timestamp={message.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          onSendFile={handleSendFile}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}