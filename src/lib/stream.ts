// Утилиты для работы со стримом

export class StreamBuffer {
  private buffer: string = '';
  private lastUpdate: number = 0;
  private readonly throttleMs: number = 300;

  constructor(throttleMs: number = 300) {
    this.throttleMs = throttleMs;
  }

  addChunk(chunk: string): boolean {
    this.buffer += chunk;
    const now = Date.now();
    
    // Проверяем, нужно ли обновить UI
    if (now - this.lastUpdate >= this.throttleMs) {
      this.lastUpdate = now;
      return true;
    }
    
    return false;
  }

  getContent(): string {
    return this.buffer;
  }

  finalize(): string {
    return this.buffer.trim();
  }

  clear(): void {
    this.buffer = '';
    this.lastUpdate = 0;
  }
}

// Обработка стрима с throttling
export async function processStreamWithThrottle(
  stream: AsyncGenerator<string>,
  onUpdate: (content: string) => void,
  throttleMs: number = 300
): Promise<string> {
  const buffer = new StreamBuffer(throttleMs);
  
  for await (const chunk of stream) {
    const shouldUpdate = buffer.addChunk(chunk);
    
    if (shouldUpdate) {
      onUpdate(buffer.getContent());
    }
  }
  
  // Финальное обновление
  const finalContent = buffer.finalize();
  onUpdate(finalContent);
  
  return finalContent;
}

// Создание читаемого потока
export function createReadableStream(
  stream: AsyncGenerator<string>
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

// Обработка ошибок стрима
export function handleStreamError(error: unknown): string {
  console.error('Stream error:', error);
  
  if (error instanceof Error) {
    return `Произошла ошибка: ${error.message}`;
  }
  
  return 'Произошла неизвестная ошибка при обработке запроса.';
}

