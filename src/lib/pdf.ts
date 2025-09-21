import pdf from 'pdf-parse';

export interface PDFTextResult {
  text: string;
  pages: number;
  success: boolean;
  error?: string;
}

export async function extractTextFromPDF(file: File): Promise<PDFTextResult> {
  try {
    // Конвертируем File в Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Извлекаем текст из PDF
    const data = await pdf(buffer);
    
    return {
      text: data.text,
      pages: data.numpages,
      success: true
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      text: '',
      pages: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при парсинге PDF'
    };
  }
}

// Валидация PDF файла
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Файл не выбран' };
  }
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Файл должен быть в формате PDF' };
  }
  
  const maxSize = 8 * 1024 * 1024; // 8 МБ
  if (file.size > maxSize) {
    return { valid: false, error: 'Размер файла не должен превышать 8 МБ' };
  }
  
  return { valid: true };
}

// Валидация изображения
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Файл не выбран' };
  }
  
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Файл должен быть изображением' };
  }
  
  const maxSize = 4 * 1024 * 1024; // 4 МБ
  if (file.size > maxSize) {
    return { valid: false, error: 'Размер файла не должен превышать 4 МБ' };
  }
  
  return { valid: true };
}

// Конвертация файла в base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Убираем префикс data:image/jpeg;base64,
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
