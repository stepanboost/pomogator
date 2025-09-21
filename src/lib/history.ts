// Утилиты для работы с историей диалогов

export interface HistoryItem {
  id: string;
  title: string;
  subject: string;
  timestamp: Date;
  icon: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
}

const HISTORY_KEY = 'pomogator_history';

// Получить всю историю
export function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    // Конвертируем timestamp обратно в Date объекты
    return history.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
      messages: item.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

// Сохранить историю
export function saveHistory(history: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

// Добавить новый диалог в историю
export function addToHistory(messages: Array<{
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}>): string {
  const history = getHistory();
  
  // Создаем заголовок на основе первого сообщения пользователя
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  const title = firstUserMessage ? 
    (firstUserMessage.content.length > 50 ? 
      firstUserMessage.content.substring(0, 50) + '...' : 
      firstUserMessage.content
    ) : 'Новый диалог';
  
  // Определяем предмет на основе содержимого
  const subject = determineSubject(firstUserMessage?.content || '');
  
  const newItem: HistoryItem = {
    id: `chat_${Date.now()}`,
    title,
    subject,
    timestamp: new Date(),
    icon: getSubjectIcon(subject),
    messages
  };
  
  // Добавляем в начало списка
  history.unshift(newItem);
  
  // Ограничиваем количество элементов (последние 50)
  const limitedHistory = history.slice(0, 50);
  
  saveHistory(limitedHistory);
  return newItem.id;
}

// Обновить существующий диалог
export function updateHistoryItem(id: string, messages: Array<{
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}>): void {
  const history = getHistory();
  const itemIndex = history.findIndex(item => item.id === id);
  
  if (itemIndex !== -1) {
    history[itemIndex].messages = messages;
    history[itemIndex].timestamp = new Date();
    saveHistory(history);
  }
}

// Удалить диалог из истории
export function removeFromHistory(id: string): void {
  const history = getHistory();
  const filteredHistory = history.filter(item => item.id !== id);
  saveHistory(filteredHistory);
}

// Очистить всю историю
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// Определить предмет на основе содержимого
function determineSubject(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('математик') || lowerContent.includes('уравнен') || 
      lowerContent.includes('алгебр') || lowerContent.includes('геометр') ||
      lowerContent.includes('интеграл') || lowerContent.includes('производн') ||
      lowerContent.includes('функци') || lowerContent.includes('график')) {
    return 'Математика';
  }
  
  if (lowerContent.includes('физик') || lowerContent.includes('механик') ||
      lowerContent.includes('электричеств') || lowerContent.includes('магнетизм') ||
      lowerContent.includes('термодинамик') || lowerContent.includes('оптик') ||
      lowerContent.includes('энерг') || lowerContent.includes('сил')) {
    return 'Физика';
  }
  
  if (lowerContent.includes('хими') || lowerContent.includes('реакц') ||
      lowerContent.includes('молекул') || lowerContent.includes('атом') ||
      lowerContent.includes('элемент') || lowerContent.includes('соединен') ||
      lowerContent.includes('валентн') || lowerContent.includes('оксид')) {
    return 'Химия';
  }
  
  if (lowerContent.includes('программирован') || lowerContent.includes('алгоритм') ||
      lowerContent.includes('код') || lowerContent.includes('функци') ||
      lowerContent.includes('цикл') || lowerContent.includes('массив') ||
      lowerContent.includes('информатик') || lowerContent.includes('компьютер')) {
    return 'Информатика';
  }
  
  if (lowerContent.includes('биолог') || lowerContent.includes('клетк') ||
      lowerContent.includes('организм') || lowerContent.includes('ген') ||
      lowerContent.includes('эволюц') || lowerContent.includes('экосистем')) {
    return 'Биология';
  }
  
  if (lowerContent.includes('истори') || lowerContent.includes('войн') ||
      lowerContent.includes('революц') || lowerContent.includes('древн') ||
      lowerContent.includes('средневеков') || lowerContent.includes('эпох')) {
    return 'История';
  }
  
  if (lowerContent.includes('литератур') || lowerContent.includes('писател') ||
      lowerContent.includes('поэт') || lowerContent.includes('роман') ||
      lowerContent.includes('стих') || lowerContent.includes('произведен')) {
    return 'Литература';
  }
  
  return 'Общее';
}

// Получить иконку для предмета
function getSubjectIcon(subject: string): string {
  const iconMap: Record<string, string> = {
    'Математика': '📐',
    'Физика': '⚗️',
    'Химия': '🔬',
    'Информатика': '💻',
    'Биология': '🧬',
    'История': '📚',
    'Литература': '📖',
    'Общее': '📝'
  };
  
  return iconMap[subject] || '📝';
}
