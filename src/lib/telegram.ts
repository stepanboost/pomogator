export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface InitData {
  user: TelegramUser;
  auth_date: number;
  hash: string;
}

export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  initData: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
}

// Инициализация Telegram WebApp
export function initTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
    return webApp;
  }
  return null;
}

// Получение данных пользователя из initData
export function parseInitData(): InitData | null {
  if (typeof window === 'undefined') return null;
  
  const webApp = window.Telegram?.WebApp;
  if (!webApp || !webApp.initData) return null;

  const urlParams = new URLSearchParams(webApp.initData);
  const userParam = urlParams.get('user');
  
  if (!userParam) return null;

  try {
    const user = JSON.parse(userParam);
    const auth_date = parseInt(urlParams.get('auth_date') || '0');
    const hash = urlParams.get('hash') || '';

    return {
      user,
      auth_date,
      hash
    };
  } catch (error) {
    console.error('Error parsing initData:', error);
    return null;
  }
}

// Валидация HMAC для initData
export async function validateInitData(initData: string, botToken: string): Promise<boolean> {
  if (!initData || !botToken) return false;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  
  if (!hash) return false;

  // Удаляем hash из параметров для проверки
  urlParams.delete('hash');
  
  // Сортируем параметры
  const sortedParams = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  try {
    // Создаем секретный ключ
    const secretKey = new TextEncoder().encode(`WebAppData${botToken}`);
    
    // Вычисляем HMAC
    const data = new TextEncoder().encode(sortedParams);
    
    const key = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, data);
    
    const hashBuffer = new Uint8Array(
      Array.from(hash.match(/.{2}/g) || [])
        .map(byte => parseInt(byte, 16))
    );
    const calculatedHash = new Uint8Array(signature);
    
    return hashBuffer.length === calculatedHash.length &&
           hashBuffer.every((byte, i) => byte === calculatedHash[i]);
  } catch (error) {
    console.error('HMAC validation error:', error);
    return false;
  }
}

// Получение темы Telegram
export function getTelegramTheme() {
  if (typeof window === 'undefined') return 'light';
  
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return 'light';

  return webApp.colorScheme || 'light';
}

// Применение темы к документу
export function applyTelegramTheme() {
  if (typeof window === 'undefined') return;
  
  // Добавляем небольшую задержку чтобы избежать hydration mismatch
  setTimeout(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    const theme = webApp.colorScheme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Применяем цвета из Telegram
    if (webApp.themeParams) {
      const root = document.documentElement;
      const params = webApp.themeParams;
      
      if (params.bg_color) {
        root.style.setProperty('--tg-bg-color', params.bg_color);
      }
      if (params.text_color) {
        root.style.setProperty('--tg-text-color', params.text_color);
      }
      if (params.hint_color) {
        root.style.setProperty('--tg-hint-color', params.hint_color);
      }
      if (params.link_color) {
        root.style.setProperty('--tg-link-color', params.link_color);
      }
      if (params.button_color) {
        root.style.setProperty('--tg-button-color', params.button_color);
      }
      if (params.button_text_color) {
        root.style.setProperty('--tg-button-text-color', params.button_text_color);
      }
    }
  }, 100);
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
