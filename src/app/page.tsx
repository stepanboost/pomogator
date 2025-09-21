'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { initTelegramWebApp, applyTelegramTheme } from '@/lib/telegram';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Инициализация Telegram WebApp
    const webApp = initTelegramWebApp();
    if (webApp) {
      applyTelegramTheme();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      // Переходим на страницу чата с сообщением
      const encodedMessage = encodeURIComponent(userInput.trim());
      router.push(`/chat?message=${encodedMessage}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ Image upload triggered');
    console.log('📋 Event target:', e.target);
    console.log('📋 Event files:', e.target.files);
    console.log('📋 Event files length:', e.target.files?.length);
    
    const file = e.target.files?.[0];
    console.log('📁 Selected file:', file);
    
    if (!file) {
      console.log('❌ No file selected, returning early');
      return;
    }
    
    console.log('📋 File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Валидация изображения
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      alert('Пожалуйста, выберите изображение');
      e.target.value = ''; // Сбрасываем input
      console.log('🔄 Input reset after validation error (file type)');
      return;
    }
    
    const maxSize = 2 * 1024 * 1024; // Уменьшили до 2 МБ
    if (file.size > maxSize) {
      alert('Размер файла не должен превышать 2 МБ');
      e.target.value = ''; // Сбрасываем input
      console.log('🔄 Input reset after validation error (file size)');
      return;
    }

    setIsUploading(true);
    console.log('🔄 Starting image processing...');
    
    // Сжимаем изображение перед отправкой
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      console.log('🖼️ Image loaded, starting compression...');
      // Уменьшаем размер изображения
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Рисуем сжатое изображение
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Конвертируем в base64 с качеством 0.8
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      setIsUploading(false);
      
      // Проверяем размер base64
      if (compressedBase64.length > 1000000) { // ~750KB в base64
        alert('Изображение слишком большое даже после сжатия. Попробуйте другое изображение.');
        // Сбрасываем input
        const input = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
        if (input) {
          input.value = '';
          console.log('🔄 Input reset after compression error');
        }
        return;
      }
      
      // Если base64 слишком большой для URL, сохраняем в localStorage
      if (compressedBase64.length > 500000) { // ~375KB в base64
        console.log('💾 Image too large for URL, saving to localStorage');
        const imageId = `temp_image_${Date.now()}`;
        localStorage.setItem(imageId, JSON.stringify({
          base64: compressedBase64,
          filename: file.name,
          timestamp: Date.now()
        }));
        // Очищаем старые временные изображения
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('temp_image_') && Date.now() - JSON.parse(localStorage.getItem(key) || '{}').timestamp > 300000) {
            localStorage.removeItem(key);
          }
        });
        console.log('🚀 Navigating to chat with imageId:', imageId);
        router.push(`/chat?imageId=${imageId}`);
      } else {
        // Переходим в чат с изображением через URL
        console.log('🚀 Navigating to chat with image in URL');
        // URL-кодируем base64 для безопасной передачи
        const encodedBase64 = encodeURIComponent(compressedBase64);
        router.push(`/chat?image=${encodedBase64}&filename=${encodeURIComponent(file.name)}`);
      }
      
      // Сбрасываем input после успешной обработки
      const input = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
      if (input) {
        input.value = '';
        console.log('🔄 Input reset after successful processing');
      }
    };
    
    img.onerror = (error) => {
      console.error('❌ Image processing error:', error);
      setIsUploading(false);
      alert('Ошибка при обработке изображения');
      // Сбрасываем input
      e.target.value = '';
      console.log('🔄 Input reset after image processing error');
    };
    
    console.log('🔄 Creating object URL and loading image...');
    img.src = URL.createObjectURL(file);
    
    // Сбрасываем input после обработки файла
    e.target.value = '';
    console.log('🔄 Input reset after file processing');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Валидация PDF
      if (file.type !== 'application/pdf') {
        alert('Пожалуйста, выберите PDF файл');
        return;
      }
      
      const maxSize = 8 * 1024 * 1024; // 8 МБ
      if (file.size > maxSize) {
        alert('Размер файла не должен превышать 8 МБ');
        return;
      }

      setIsUploading(true);
      
      // Для PDF файлов используем API upload
      const formData = new FormData();
      formData.append('file', file);

      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(result => {
        setIsUploading(false);
        if (result.error) {
          alert(`Ошибка при обработке PDF: ${result.error}`);
        } else {
          // Переходим в чат с текстом из PDF
          const message = `Проанализируй этот PDF файл (${file.name}):\n\n${result.text}`;
          const encodedMessage = encodeURIComponent(message);
          router.push(`/chat?message=${encodedMessage}`);
        }
      })
      .catch(error => {
        setIsUploading(false);
        alert(`Ошибка при загрузке файла: ${error.message}`);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Заголовок */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">
            Помогатор
          </h1>
        </div>
      </div>

      {/* Основной контент */}
      <div className="px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Поле ввода */}
          <div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Введите задание или загрузите фото / файл"
              className="w-full h-32 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isUploading}
            />
          </div>

          {/* Кнопки загрузки */}
          <div className="flex space-x-4">
            {/* Загрузка фото */}
            <label 
              className="relative flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              htmlFor="image-upload"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Фото
              </span>
              <input
                id="image-upload"
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
                style={{ zIndex: 1 }}
              />
            </label>

            {/* Загрузка файла */}
            <label className="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Файл
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={!userInput.trim() || isUploading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            {isUploading ? 'Загрузка...' : 'Отправить'}
          </button>
        </form>

        {/* Индикатор загрузки */}
        {isUploading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Обработка файла...</span>
            </div>
          </div>
        )}
      </div>

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex flex-col items-center justify-center py-3 text-blue-500 dark:text-blue-400"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Главная</span>
          </button>
          
          <button
            onClick={() => router.push('/history')}
            className="flex-1 flex flex-col items-center justify-center py-3 text-gray-400 dark:text-gray-500"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">История</span>
          </button>
        </div>
      </div>
    </div>
  );
}