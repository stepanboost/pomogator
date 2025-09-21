'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import hljs from 'highlight.js';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

// Функция для нормализации LaTeX (преобразование \(...\) и \[...\] в $...$ и $$...$$)
function normalizeLatex(s: string) {
  return s
    .replace(/\\\[(.*?)\\\]/gs, (_m, g1) => `$$${g1}$$`)
    .replace(/\\\((.*?)\\\)/gs, (_m, g1) => `$${g1}$`);
}

// Компонент для рендера сообщения с поддержкой LaTeX
function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      // важен порядок: сначала GFM, потом Math
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeKatex, { strict: false, trust: true }] // не ругается на \text, \dfrac и т.п.
      ]}
      components={{
        code({ inline, className, children, ...props }) {
          // обычные code-блоки подсвечиваем, но LaTeX туда не кладём
          const code = String(children ?? "");
          if (!inline) {
            const lang = /language-(\w+)/.exec(className || "")?.[1];
            const html = lang
              ? hljs.highlight(code, { language: lang }).value
              : hljs.highlightAuto(code).value;
            return <pre><code dangerouslySetInnerHTML={{ __html: html }} /></pre>;
          }
          return <code className={className} {...props}>{children}</code>;
        }
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-2 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Аватар */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
        }`}>
          {isUser ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Сообщение */}
        <div className={`relative px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-500 text-white rounded-br-md' 
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm'
        }`}>
          {/* Контент */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <Markdown text={normalizeLatex(message)} />
          </div>

          {/* Время */}
          {timestamp && (
            <div className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {formatTime(timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};