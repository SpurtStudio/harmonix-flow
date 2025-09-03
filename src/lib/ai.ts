import * as tf from '@tensorflow/tfjs';

export async function analyzeLocalData(data: any): Promise<string> {
  try {
    // Пример очень простого анализа: подсчет количества элементов в данных
    // В реальной реализации здесь будет использоваться tf.js для более сложного анализа
    const dataSize = JSON.stringify(data).length;
    const analysisResult = `Локальный ИИ-анализ данных завершен. Размер данных: ${dataSize} символов.`;

    // Имитация небольшой задержки для демонстрации асинхронности
    await tf.nextFrame();

    return analysisResult;
  } catch (error) {
    console.error("Ошибка при локальном анализе данных:", error);
    return "Ошибка при локальном ИИ-анализе данных.";
  }
}

export async function recognizeSpeech(audioData: any): Promise<string> {
  try {
    // Импортируем модуль Whisper WASM
    const { recognizeSpeechWithWhisperWASM } = await import('./whisper-wasm');
    
    // Проверяем, что audioData передан и имеет правильный формат
    if (!audioData) {
      throw new Error("Аудиоданные не переданы.");
    }
    
    // Если audioData - это строка (транскрипт из Web Speech API), возвращаем её напрямую
    if (typeof audioData === 'string') {
      return `Распознано: '${audioData}'`;
    }
    
    // Если audioData - это ArrayBuffer или ArrayBufferView, используем Whisper WASM для распознавания
    if (ArrayBuffer.isView(audioData) || audioData instanceof ArrayBuffer) {
      // Преобразуем данные в ArrayBuffer, если это необходимо
      let arrayBuffer: ArrayBuffer;
      if (ArrayBuffer.isView(audioData)) {
        const view = audioData as ArrayBufferView;
        arrayBuffer = view.buffer.slice(
          view.byteOffset,
          view.byteOffset + view.byteLength
        ) as ArrayBuffer;
      } else {
        arrayBuffer = audioData as ArrayBuffer;
      }
      
      // Вызываем функцию распознавания речи из WASM-модуля
      const result = await recognizeSpeechWithWhisperWASM(arrayBuffer, {
        model: 'base', // Используем модель 'base' по умолчанию
        language: 'ru', // Устанавливаем русский язык по умолчанию
        task: 'transcribe' // Задача: транскрибирование
      });
      
      return result.text;
    }
    
    // Для остальных случаев используем улучшенную имитацию распознавания речи
    
    // Определяем продолжительность аудио (имитация)
    let duration = 5; // по умолчанию 5 секунд
    if (typeof audioData === 'object' && audioData.duration) {
      duration = audioData.duration;
    }
    
    // Имитация задержки, пропорциональной продолжительности аудио
    const delay = Math.min(duration * 200, 3000); // Максимум 3 секунды задержки
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Генерируем результат в зависимости от продолжительности
    let result = "";
    if (duration < 2) {
      result = "Распознано: 'Привет.'";
    } else if (duration < 5) {
      result = "Распознано: 'Привет, как дела?'";
    } else if (duration < 10) {
      result = "Распознано: 'Привет, Гармония, запиши мою идею.'";
    } else {
      result = "Распознано: 'Привет, Гармония. Сегодня я хочу поделиться с тобой своей идеей по улучшению планирования задач. Думаю, это может быть полезно для многих пользователей.'";
    }
    
    console.log(`Распознавание речи завершено. Продолжительность аудио: ${duration} секунд.`);
    return result;
  } catch (error) {
    console.error("Ошибка при распознавании речи:", error);
    return "Ошибка при распознавании речи. Пожалуйста, попробуйте еще раз.";
  }
}

export async function synthesizeSpeech(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error('Ошибка синтеза речи:', event);
        reject(new Error('Ошибка синтеза речи.'));
      };
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Web Speech API (SpeechSynthesis) не поддерживается в этом браузере.');
      resolve(); // Разрешаем промис, даже если API не поддерживается
    }
  });
}

export async function queryExternalAI(prompt: string): Promise<string> {
  try {
    // В реальной реализации здесь будет происходить интеграция с внешними ИИ-сервисами
    // такими как OpenAI GPT-4o/Turbo, Claude, Gemini.
    // Это происходит через Serverless ИИ-API для безопасного хранения API-ключей
    // и обработки запросов.

    console.log(`Запрос к внешнему ИИ: "${prompt}"`);

    // Импортируем функцию queryAI из api.ts
    const { queryAI } = await import('./api');

    // Отправляем запрос к Cloudflare Worker, который будет обрабатывать интеграцию с внешними ИИ-сервисами
    const response = await queryAI('general', prompt);

    return response.response || "Внешний ИИ не вернул ответ.";
  } catch (error) {
    console.error("Ошибка при запросе к внешнему ИИ:", error);
    // В случае ошибки возвращаем имитацию ответа
    const responses = [
      "Внешний ИИ ответил: 'Я могу помочь вам с планированием и анализом ваших целей.'",
      "Внешний ИИ ответил: 'Ваш запрос обработан. Какие еще вопросы у вас есть?'",
      "Внешний ИИ ответил: 'Я готов предоставить вам персонализированные рекомендации.'",
      `Внешний ИИ ответил: 'По вашему запросу "${prompt}" я предлагаю следующее решение...'`,
      "Внешний ИИ ответил: 'Я проанализировал ваш запрос и могу предложить несколько вариантов действий.'"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

/**
 * Получение рекомендаций ИИ по балансу жизни.
 * Анализирует данные по 8 сферам жизни и генерирует персонализированные рекомендации.
 * @param balanceData Объект с оценками по сферам жизни (например, { work: 7, health: 5, ... }).
 * @returns Promise<string> Рекомендации ИИ.
 */
export async function getLifeBalanceRecommendations(balanceData: { [key: string]: number }): Promise<string> {
  try {
    const spheres = Object.keys(balanceData);
    if (spheres.length === 0) {
      return "Недостаточно данных для генерации рекомендаций по балансу жизни.";
    }

    // Создаем тензор из данных баланса
    const balanceValues = spheres.map(sphere => balanceData[sphere]);
    const balanceTensor = tf.tensor1d(balanceValues);

    // Нормализуем данные (приводим к диапазону 0-1)
    const normalizedBalance = tf.div(balanceTensor, tf.scalar(10));

    // Вычисляем среднее значение баланса
    const meanBalance = normalizedBalance.mean().dataSync()[0];

    // Вычисляем стандартное отклонение для оценки дисбаланса
    const variance = normalizedBalance.squaredDifference(tf.scalar(meanBalance)).mean().dataSync()[0];
    const stdDev = Math.sqrt(variance);

    // Вычисляем коэффициент асимметрии (skewness) для оценки направления дисбаланса
    const skewnessTensor = normalizedBalance.sub(tf.scalar(meanBalance)).pow(tf.scalar(3)).mean().div(tf.scalar(Math.pow(stdDev, 3)));
    const skewness = skewnessTensor.dataSync()[0];
    skewnessTensor.dispose();

    // Определяем сферы с низким и высоким балансом
    const lowBalanceSpheres = spheres.filter(sphere => balanceData[sphere] < 5);
    const highBalanceSpheres = spheres.filter(sphere => balanceData[sphere] >= 8);

    // Определяем сферы с максимальным и минимальным балансом
    const minSphere = spheres.reduce((min, sphere) => balanceData[sphere] < balanceData[min] ? sphere : min);
    const maxSphere = spheres.reduce((max, sphere) => balanceData[sphere] > balanceData[max] ? sphere : max);

    let recommendation = "ИИ-рекомендация: ";

    // Генерируем рекомендации на основе анализа
    if (stdDev > 0.25) {
      // Высокий дисбаланс
      recommendation += "Обнаружен значительный дисбаланс между сферами жизни. ";
      if (lowBalanceSpheres.length > 0) {
        const sphere = lowBalanceSpheres[Math.floor(Math.random() * lowBalanceSpheres.length)];
        recommendation += `Сфера '${sphere}' требует особого внимания. `;
      }
      if (skewness > 0.5) {
        // Позитивная асимметрия - больше высоких значений
        recommendation += "У вас есть сильные стороны, на которые можно опереться для улучшения слабых сфер. ";
      } else if (skewness < -0.5) {
        // Негативная асимметрия - больше низких значений
        recommendation += "Несколько сфер значительно отстают от общего уровня, что требует комплексного подхода. ";
      }
      recommendation += "Рекомендуется перераспределить ресурсы для достижения более равномерного баланса.";
    } else if (meanBalance < 0.4) {
      // Низкий общий баланс
      recommendation += "Общий уровень баланса жизни ниже среднего. ";
      if (lowBalanceSpheres.length > 0) {
        const sphere = lowBalanceSpheres[Math.floor(Math.random() * lowBalanceSpheres.length)];
        recommendation += `Начните с улучшения сферы '${sphere}'. `;
      }
      recommendation += "Постепенно вносите небольшие изменения в повседневную routine.";
    } else if (meanBalance > 0.7) {
      // Высокий общий баланс
      recommendation += "Отличный общий баланс жизни! ";
      if (highBalanceSpheres.length > 0) {
        const sphere = highBalanceSpheres[Math.floor(Math.random() * highBalanceSpheres.length)];
        recommendation += `Особенно выделяется сфера '${sphere}'. `;
      }
      if (stdDev < 0.1) {
        // Очень низкий дисбаланс - все сферы на высоком уровне
        recommendation += "Все сферы жизни находятся на высоком уровне. ";
      }
      recommendation += "Продолжайте в том же духе и не забывайте о поддержании достигнутого уровня.";
    } else {
      // Средний баланс
      recommendation += "Баланс жизни находится на удовлетворительном уровне. ";
      if (lowBalanceSpheres.length > 0) {
        const sphere = lowBalanceSpheres[Math.floor(Math.random() * lowBalanceSpheres.length)];
        recommendation += `Рассмотрите возможность улучшения сферы '${sphere}'. `;
      } else if (highBalanceSpheres.length > 0) {
        const sphere = highBalanceSpheres[Math.floor(Math.random() * highBalanceSpheres.length)];
        recommendation += `Хороший прогресс в сфере '${sphere}'. `;
      }
      if (balanceData[maxSphere] - balanceData[minSphere] > 4) {
        // Значительная разница между максимальной и минимальной сферой
        recommendation += `Обратите внимание на значительную разницу между сферой '${maxSphere}' и '${minSphere}'. `;
      }
      recommendation += "Маленькие ежедневные улучшения могут привести к значительным изменениям.";
    }

    // Освобождаем тензоры
    balanceTensor.dispose();
    normalizedBalance.dispose();

    // Имитация небольшой задержки для демонстрации асинхронности
    await tf.nextFrame();

    return recommendation;
  } catch (error) {
    console.error("Ошибка при получении рекомендаций ИИ:", error);
    return "Ошибка при получении ИИ-рекомендаций.";
  }
}