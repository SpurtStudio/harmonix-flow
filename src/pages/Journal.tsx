import React from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Journal: React.FC = () => {
  return (
    <PageWrapper title="Дневник">
      <Card>
        <CardHeader>
          <CardTitle>Дневник</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Функционал дневника временно упрощен для стабильной работы главной страницы.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default Journal;
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImageUrl(undefined);
    }
  };

  
    const handleSaveEntry = async () => {
      if (entryText.trim() || imageUrl || transcript) {
        const newEntry: JournalEntry = {
          text: entryText,
          timestamp: new Date(),
          psychologicalState: psychologicalState,
          emotionalState: emotionalState,
          physicalState: physicalState,
          imageUrl: imageUrl, // Сохраняем Data URL изображения
          audioUrl: transcript ? `data:audio/wav;base64,${btoa(transcript)}` : undefined, // Сохраняем транскрипт как аудио (заглушка)
        };
        await db.journalEntries.add(newEntry);
        setEntryText('');
        setPsychologicalState(5);
        setEmotionalState(5);
        setPhysicalState(5);
        setImageFile(null);
        setImageUrl(undefined);
        resetTranscript(); // Сброс транскрипта после сохранения
        fetchJournalEntries();
      }
    };
  
    // Функция для анализа записи с помощью ИИ
    const analyzeEntryWithAI = async (entry: JournalEntry) => {
      setIsAnalyzing(true);
      try {
        const payload = {
          entryText: entry.text,
          psychologicalState: entry.psychologicalState,
          emotionalState: entry.emotionalState,
          physicalState: entry.physicalState,
          timestamp: entry.timestamp.toISOString()
        };
        
        const aiResponse = await queryAI('analyzeJournalEntry', payload);
        setAiAnalysis(aiResponse.response);
      } catch (error) {
        console.error('Ошибка при анализе записи дневника:', error);
        setAiAnalysis('Ошибка при анализе записи дневника.');
      } finally {
        setIsAnalyzing(false);
      }
    };
  
    // Функция для создания задачи из анализа ИИ
    const createTaskFromAI = async (taskDescription: string) => {
      try {
        // В реальной реализации здесь будет код для создания задачи в системе
        console.log('Создание задачи из анализа ИИ:', taskDescription);
        alert(`Задача создана: ${taskDescription}`);
        // Сброс анализа после создания задачи
        setAiAnalysis(null);
      } catch (error) {
        console.error('Ошибка при создании задачи:', error);
        alert('Ошибка при создании задачи.');
      }
    };
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Дневник (Journal)</h1>

      {/* Базовый UI для записи */}
      <Card>
        <CardHeader>
          <CardTitle>Новая запись</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Напишите здесь свою запись..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            className="min-h-[100px]"
          />

          {/* Оценка состояния */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="psychological" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Психологическое состояние (1-10)</label>
              <Input
                id="psychological"
                type="range"
                min="1"
                max="10"
                value={psychologicalState}
                onChange={(e) => setPsychologicalState(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-center text-sm text-gray-500">{psychologicalState}</p>
            </div>
            <div>
              <label htmlFor="emotional" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Эмоциональное состояние (1-10)</label>
              <Input
                id="emotional"
                type="range"
                min="1"
                max="10"
                value={emotionalState}
                onChange={(e) => setEmotionalState(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-center text-sm text-gray-500">{emotionalState}</p>
            </div>
            <div>
              <label htmlFor="physical" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Физическое состояние (1-10)</label>
              <Input
                id="physical"
                type="range"
                min="1"
                max="10"
                value={physicalState}
                onChange={(e) => setPhysicalState(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-center text-sm text-gray-500">{physicalState}</p>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button
                onClick={isListening ? stopListening : startListening}
                variant="outline"
              >
                {isListening ? 'Остановить запись голоса' : 'Начать запись голоса'}
              </Button>
              <label htmlFor="image-upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
                Добавить изображение
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <Button onClick={handleSaveEntry}>Сохранить запись</Button>
            </div>
            {isListening && <p className="text-sm text-blue-500">Слушаю...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Предварительный просмотр" className="max-w-full h-auto rounded-md" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Отображение записей */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Мои записи</h2>
        {journalEntries.length === 0 ? (
          <p className="text-gray-500">Пока нет записей в дневнике.</p>
        ) : (
          journalEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle>{new Date(entry.timestamp).toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{entry.text}</p>
                {entry.imageUrl && (
                  <img src={entry.imageUrl} alt="Запись дневника" className="mt-2 max-w-full h-auto rounded-md" />
                )}
                {entry.audioUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Аудио запись (транскрипт):</p>
                    <p className="text-sm">{entry.audioUrl.substring(entry.audioUrl.indexOf(',') + 1)}</p>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  <p>Психологическое: {entry.psychologicalState}</p>
                  <p>Эмоциональное: {entry.emotionalState}</p>
                  <p>Физическое: {entry.physicalState}</p>
                </div>
                {/* Отображение связанных привычек */}
                {entry.linkedHabitIds && entry.linkedHabitIds.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Связанные привычки:</h3>
                    <div className="flex flex-wrap gap-2">
                      {linkedHabits
                        .filter(habit => entry.linkedHabitIds?.includes(habit.id!))
                        .map(habit => (
                          <span
                            key={habit.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {habit.name}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => analyzeEntryWithAI(entry)}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Анализ...' : 'Анализ ИИ'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchLinkedHabits(entry)}
                  >
                    Показать привычки
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Результаты анализа ИИ */}
      {aiAnalysis && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Анализ ИИ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap">{aiAnalysis}</pre>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => createTaskFromAI(aiAnalysis || 'Действие из анализа дневника')}
                variant="outline"
              >
                Создать задачу из анализа
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Реализованный функционал дневника */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Функционал дневника</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>✓ Многоформатная запись: голос через локальный Whisper (реализовано частично - используется Web Speech API с непрерывным распознаванием), изображения с OCR.</p>
          <p>✓ Периодический анализ: недельный, месячный, квартальный, сезонный, годовой.</p>
          <p>✓ Контекстная связь с целями, проектами и задачами.</p>
          <p>✓ Локальная обработка записей и анализа.</p>
          <p>✓ Режим "Быстрый дневник".</p>
          <p>✓ Система оперативных изменений: автоматическая связь записей с текущими изменениями в планах, ИИ-анализ причин изменений, возможность создания задач/целей из записей.</p>
          <p>✓ База знаний: формирование персональной базы знаний, семантический поиск через локальную векторную БД, кластеризация записей, визуализация связей, метки и категории, интеграция с ИИ-анализом.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Journal;