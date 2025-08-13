// src/lib/api.ts

const API_BASE_URL = 'https://your-cloudflare-worker-url.workers.dev'; // Замените на реальный URL вашего Cloudflare Worker

/**
 * Аутентификация пользователя.
 * @param credentials Учетные данные пользователя (например, email и пароль).
 * @returns Promise<any> Токен аутентификации или информация о пользователе.
 */
export async function authenticateUser(credentials: any): Promise<any> {
  console.log('API: Попытка аутентификации пользователя...', credentials);
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Ошибка аутентификации: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API: Пользователь аутентифицирован.');
    return data;
  } catch (error) {
    console.error('API: Ошибка аутентификации:', error);
    throw error;
  }
}

/**
 * Получение данных с бэкенда.
 * @param endpoint Конечная точка API (например, 'goals', 'tasks').
 * @param params Параметры запроса.
 * @returns Promise<any> Полученные данные.
 */
export async function fetchData(endpoint: string, params?: Record<string, any>): Promise<any> {
  console.log(`API: Получение данных с ${endpoint}...`, params);
  
  try {
    // Формирование строки параметров запроса
    let url = `${API_BASE_URL}/${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения данных: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API: Данные для ${endpoint} получены.`);
    return data;
  } catch (error) {
    console.error(`API: Ошибка получения данных с ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Отправка данных на бэкенд.
 * @param endpoint Конечная точка API (например, 'goals', 'tasks').
 * @param data Отправляемые данные.
 * @returns Promise<any> Ответ от сервера.
 */
export async function sendData(endpoint: string, data: any): Promise<any> {
  console.log(`API: Отправка данных на ${endpoint}...`, data);
  
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Ошибка отправки данных: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log(`API: Данные на ${endpoint} отправлены.`);
    return responseData;
  } catch (error) {
    console.error(`API: Ошибка отправки данных на ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Обработка ИИ-запросов.
 * @param type Тип запроса к ИИ (например, 'optimizeSchedule', 'createTask', 'balanceSuggestion').
 * @param payload Данные для запроса к ИИ.
 * @returns Promise<any> Ответ от ИИ.
 */
export async function queryAI(type: string, payload: any): Promise<any> {
  console.log('API: Запрос к ИИ...', type, payload);
  
  try {
    const response = await fetch(`${API_BASE_URL}/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, payload }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка запроса к ИИ: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API: Ответ от ИИ получен.');
    return data;
  } catch (error) {
    console.error('API: Ошибка запроса к ИИ:', error);
    throw error;
  }
}