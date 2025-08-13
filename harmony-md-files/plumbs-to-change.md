plumbs-to-change.md# План замены заглушек на полнофункциональные модули

## 1. Приоритизация задач по важности и зависимости

1. **Критическая безопасность и шифрование данных**
   - [x] Улучшение `src/lib/crypto.ts` (функция `rotateKey`)
   - [x] Интеграция шифрования в `src/context/UserPreferencesContext.tsx`

2. **Ядро системы (база данных и синхронизация)**
   - Улучшение `src/lib/db.ts` (реализация всех необходимых методов) [x]
   - Завершение реализации `src/lib/sync.ts` (функции `startSync`, `stopSync`) [x]

3. **ИИ-функции**
   - Завершение реализации `src/lib/ai.ts` (функции `recognizeSpeech`, `queryExternalAI`, `getLifeBalanceRecommendations`) [x]
   - Улучшение `src/hooks/use-change-propagation.ts` (функции `propagateChange`, `applyAdjustments`) [x]

4. **Основные модули приложения**
   - Реализация недостающего функционала в страницах (см. список ниже)

5. **Вспомогательные библиотеки**
   - Завершение реализации `src/lib/api.ts` [x]

## 2. Группировка задач по модулям/функциональным областям

### Модуль безопасности и шифрования
- `src/lib/crypto.ts`:
  - [x] Функция `rotateKey` (заглушка)
- `src/context/UserPreferencesContext.tsx`:
  - [x] Интеграция шифрования данных

### Модуль базы данных
- `src/lib/db.ts`:
  - Реализация всех необходимых методов для работы с данными (на основе требований из `harmony-project-description.md`) [x]

### Модуль синхронизации
- `src/lib/sync.ts`:
  - Функция `startSync` (заглушка) [x]
  - Функция `stopSync` (заглушка) [x]

### Модуль ИИ
- `src/lib/ai.ts`:
  - Функция `recognizeSpeech` (временная заглушка) [x]
  - Функция `queryExternalAI` (имитация интеграции) [x]
  - Функция `getLifeBalanceRecommendations` (улучшенная заглушка) [x]
- `src/hooks/use-change-propagation.ts`:
  - Функция `propagateChange` (имитация анализа влияния)
  - Функция `applyAdjustments` (имитация применения корректировок)

### Модуль API
- `src/lib/api.ts`:
  - Функция `authenticateUser` (заглушка) [x]
  - Функция `fetchData` (заглушка) [x]
  - Функция `sendData` (заглушка) [x]
  - Функция `queryAI` (заглушка) [x]

### Страницы приложения (список страниц с заглушками)
- `src/pages/Analytics.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Calendar.tsx`
- `src/pages/Development.tsx`
- `src/pages/Documentation.tsx`
- `src/pages/FamilyFriends.tsx`
- `src/pages/Finance.tsx`
- `src/pages/Goals.tsx`
- `src/pages/Habits.tsx`
- `src/pages/Health.tsx`
- `src/pages/History.tsx`
- `src/pages/Hobbies.tsx`
- `src/pages/Ideas.tsx`
- `src/pages/Journal.tsx`
- `src/pages/Motivation.tsx`
- `src/pages/Notifications.tsx`
- `src/pages/Projects.tsx`
- `src/pages/Rest.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Spirituality.tsx`
- `src/pages/Tasks.tsx` (улучшена)
- `src/pages/TimeIndicator.tsx`
- `src/pages/Work.tsx`

## 3. Оценка сложности каждой задачи

### Низкая сложность (1-2 дня)
- [x] Интеграция шифрования в `UserPreferencesContext`
- Завершение реализации `src/lib/sync.ts` [x]
- Завершение реализации `src/lib/api.ts` [x]
- Реализация недостающего функционала в страницах приложения (улучшены страницы Goals, Projects, Calendar, Tasks) [x]

### Средняя сложность (3-5 дней)
- [x] Улучшение `src/lib/crypto.ts` (функция `rotateKey`)
- Завершение реализации `src/lib/ai.ts` (функция `getLifeBalanceRecommendations`)
- Улучшение `src/hooks/use-change-propagation.ts` [x]

### Высокая сложность (1-2 недели)
- Завершение реализации `src/lib/ai.ts` (функции `recognizeSpeech`, `queryExternalAI`) [x]
- Реализация недостающего функционала в страницах приложения (улучшены страницы Goals, Projects, Calendar, Tasks)

## 4. Порядок реализации с учетом зависимостей

1. **Этап 1: Безопасность и ядро системы**
   - [x] Интеграция шифрования в `UserPreferencesContext`
   - [x] Улучшение `src/lib/crypto.ts` (функция `rotateKey`)
   - Завершение реализации `src/lib/db.ts` [x]
   - Завершение реализации `src/lib/sync.ts` [x]

2. **Этап 2: ИИ-функции**
   - Улучшение `src/hooks/use-change-propagation.ts`
   - Завершение реализации `src/lib/ai.ts` (функция `getLifeBalanceRecommendations`) [x]
   - Завершение реализации `src/lib/ai.ts` (функция `recognizeSpeech`) [x]
   - Завершение реализации `src/lib/ai.ts` (функция `queryExternalAI`) [x]

3. **Этап 3: Вспомогательные библиотеки**
   - Завершение реализации `src/lib/api.ts` [x]

4. **Этап 4: Реализация недостающего функционала в страницах**
   - Приоритизация страниц по важности для пользователя (например, Goals, Projects, Tasks, Calendar)
   - Постепенная реализация недостающего функционала в каждой странице (улучшены страницы Goals, Projects, Calendar, Tasks)

## 5. Рекомендации по интеграции с существующими компонентами

1. **Для всех модулей:**
   - Обеспечить обратную совместимость с существующим кодом
   - Использовать TypeScript для строгой типизации
   - Покрыть новый код тестами (если система тестирования будет реализована)

2. **Для модуля безопасности:**
   - Использовать Web Crypto API для всех криптографических операций
   - Обеспечить безопасное хранение ключей (никогда не сохранять в открытом виде)

3. **Для модуля базы данных:**
   - Использовать Dexie.js для работы с IndexedDB
   - Обеспечить шифрование данных перед сохранением

4. **Для модуля ИИ:**
   - Использовать TensorFlow.js для локального анализа данных
   - Для `recognizeSpeech` рассмотреть интеграцию с локальным Whisper
   - Для `queryExternalAI` реализовать безопасную интеграцию с внешними API

5. **Для страниц приложения:**
   - Использовать существующие UI-компоненты из shadcn/ui
   - Обеспечить согласованность дизайна с остальной частью приложения
   - Интегрировать новые функции с существующими хуками и контекстами

Этот план обеспечивает системный подход к замене всех заглушек на полнофункциональные модули, начиная с самых критичных компонентов и заканчивая реализацией недостающего функционала в страницах приложения.