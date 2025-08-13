// src/hooks/useWhisperSpeechRecognition.ts
// Хук для распознавания речи с помощью Whisper WASM

import { useState, useEffect, useRef } from 'react';
import { recognizeSpeech } from '../lib/ai';

interface WhisperSpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useWhisperSpeechRecognition = (): WhisperSpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Ссылки на объекты для записи аудио
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Очистка ресурсов при размонтировании компонента
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startListening = async () => {
    try {
      // Сброс предыдущих ошибок и транскрипта
      setError(null);
      setTranscript('');
      
      // Проверка поддержки getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API для доступа к медиаустройствам не поддерживается вашим браузером.');
      }

      // Запрашиваем доступ к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Создаем MediaRecorder для записи аудио
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      // Обработчик данных от MediaRecorder
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Обработчик остановки записи
      mediaRecorderRef.current.onstop = async () => {
        try {
          // Создаем Blob из записанных аудио данных
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          
          // Преобразуем Blob в ArrayBuffer
          const arrayBuffer = await audioBlob.arrayBuffer();
          
          // Вызываем функцию распознавания речи из lib/ai.ts
          const result = await recognizeSpeech(arrayBuffer);
          setTranscript(result);
        } catch (err) {
          console.error('Ошибка при обработке аудио:', err);
          setError(`Ошибка при обработке аудио: ${(err as Error).message}`);
        }
      };
      
      // Обработчик ошибок MediaRecorder
      mediaRecorderRef.current.onerror = (event) => {
        console.error('Ошибка MediaRecorder:', event);
        setError(`Ошибка записи аудио: ${(event as any).error?.message || 'Неизвестная ошибка'}`);
        setIsListening(false);
      };
      
      // Начинаем запись аудио
      mediaRecorderRef.current.start();
      setIsListening(true);
      
      console.log('Начало записи аудио с помощью Whisper WASM');
    } catch (err) {
      console.error('Ошибка доступа к микрофону:', err);
      setError(`Не удалось получить доступ к микрофону: ${(err as Error).message}`);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      
      // Останавливаем все треки медиапотока
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      console.log('Остановка записи аудио с помощью Whisper WASM');
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return { isListening, transcript, error, startListening, stopListening, resetTranscript };
};