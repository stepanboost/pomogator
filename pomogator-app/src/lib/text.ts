// Нормализация Unicode в NFC
export function normalizeNFC(text: string): string {
  return text.normalize('NFC');
}

// Удаление лишних пустых строк
export function collapseBlankLines(text: string): string {
  return text.trim().replace(/\n{3,}/g, '\n\n');
}

// Финальная обработка текста
export function finalizeText(text: string): string {
  return collapseBlankLines(normalizeNFC(text));
}

// Извлечение LaTeX формул из текста
export function extractLatexFormulas(text: string): string[] {
  const regex = /\$([^$]+)\$/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

// Проверка, содержит ли текст формулы
export function hasLatexFormulas(text: string): boolean {
  return /\$[^$]+\$/.test(text);
}

// Экранирование HTML
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Обрезка текста с многоточием
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Форматирование времени
export function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед назад`;
  
  return date.toLocaleDateString('ru-RU');
}

