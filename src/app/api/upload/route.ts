import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, validatePDFFile, validateImageFile } from '@/lib/pdf';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Валидация файла
    if (file.type === 'application/pdf') {
      const validation = validatePDFFile(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Извлекаем текст из PDF
      const result = await extractTextFromPDF(file);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Ошибка при извлечении текста из PDF' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        text: result.text,
        pages: result.pages,
        type: 'pdf'
      });

    } else if (file.type.startsWith('image/')) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Для изображений конвертируем в base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return NextResponse.json({
        image: base64,
        type: 'image',
        filename: file.name
      });

    } else {
      return NextResponse.json(
        { error: 'Неподдерживаемый тип файла. Разрешены только PDF и изображения.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}

