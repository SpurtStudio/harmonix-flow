import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { db, JournalEntry, HealthIndicator, Habit } from '../lib/db';

export const HealthJournalSync: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [psychologicalState, setPsychologicalState] = useState(5); // От 1 до 10
  const [emotionalState, setEmotionalState] = useState(5);     // От 1 до 10
  const [physicalState, setPhysicalState] = useState(5);      // От 1 до 10
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Загрузка записей дневника
      const loadedEntries = await db.journalEntries.orderBy('timestamp').reverse().toArray();
      setJournalEntries(loadedEntries);
      
      // Загрузка показателей здоровья
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
      
      // Загрузка привычек здоровья
      const allHabits = await db.habits.toArray();
      const healthHabits = allHabits.filter(habit => 
        habit.name.toLowerCase().includes('здоровье') || 
        habit.name.toLowerCase().includes('здоровья') ||
        habit.name.toLowerCase().includes('физич') ||
        habit.name.toLowerCase().includes('медитаци') ||
        habit.name.toLowerCase().includes('прогулк') ||
        habit.name.toLowerCase().includes('активност') ||
        habit.name.toLowerCase().includes('питани') ||
        habit.name.toLowerCase().includes('сон') ||
        habit.name.toLowerCase().includes('вода') ||
        habit.name.toLowerCase().includes('упражнен') ||
        habit.name.toLowerCase().includes('тренировк')
      );
      setHabits(healthHabits);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!newEntryText.trim()) {
      alert('Пожалуйста, введите текст записи.');
      return;
    }
    
    try {
      const newEntry: Omit<JournalEntry, 'id'> = {
        text: newEntryText,
        timestamp: new Date(),
        psychologicalState: psychologicalState,
        emotionalState: emotionalState,
        physicalState: physicalState
      };
      
      // Добавляем связь с привычками здоровья
      if (habits.length > 0) {
        newEntry.linkedHabitIds = habits.map(habit => habit.id!);
      }
      
      // Добавляем связь с показателями здоровья
      if (indicators.length > 0) {
        // Для примера связываем с последними 3 показателями
        newEntry.linkedHealthIndicatorIds = indicators.slice(0, 3).map(indicator => indicator.id!);
      }
      
      await db.journalEntries.add(newEntry);
      
      // Обновляем список записей
      const loadedEntries = await db.journalEntries.orderBy('timestamp').reverse().toArray();
      setJournalEntries(loadedEntries);
      
      // Сбрасываем форму
      setNewEntryText('');
      setPsychologicalState(5);
      setEmotionalState(5);
      setPhysicalState(5);
      
      alert('Запись успешно добавлена в дневник!');
    } catch (error) {
      console.error('Ошибка при добавлении записи в дневник:', error);
      alert('Ошибка при добавлении записи в дневник');
    }
  };

  // Функция для получения связанных привычек
  const getLinkedHabits = (entry: JournalEntry) => {
    if (entry.linkedHabitIds && entry.linkedHabitIds.length > 0) {
      return habits.filter(habit => entry.linkedHabitIds?.includes(habit.id!));
    }
    return [];
  };

  // Функция для получения связанных показателей здоровья
  const getLinkedIndicators = (entry: JournalEntry) => {
    if (entry.linkedHealthIndicatorIds && entry.linkedHealthIndicatorIds.length > 0) {
      return indicators.filter(indicator => entry.linkedHealthIndicatorIds?.includes(indicator.id!));
    }
    return [];
  };

  if (loading) {
    return <div className="p-4">Загрузка данных для синхронизации с дневником...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Связь с дневником</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Добавить запись о самочувствии</h3>
            <Textarea
              placeholder="Опишите ваше самочувствие, настроение, физическое состояние..."
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
              className="min-h-[100px]"
            />
            
            {/* Оценка состояния */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="psychological" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Психологическое состояние (1-10)</label>
                <input
                  id="psychological"
                  type="range"
                  min="1"
                  max="10"
                  value={psychologicalState}
                  onChange={(e) => setPsychologicalState(Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <p className="text-center text-sm text-gray-500">{psychologicalState}</p>
              </div>
              <div>
                <label htmlFor="emotional" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Эмоциональное состояние (1-10)</label>
                <input
                  id="emotional"
                  type="range"
                  min="1"
                  max="10"
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <p className="text-center text-sm text-gray-500">{emotionalState}</p>
              </div>
              <div>
                <label htmlFor="physical" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Физическое состояние (1-10)</label>
                <input
                  id="physical"
                  type="range"
                  min="1"
                  max="10"
                  value={physicalState}
                  onChange={(e) => setPhysicalState(Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <p className="text-center text-sm text-gray-500">{physicalState}</p>
              </div>
            </div>
            
            <Button onClick={handleSaveEntry}>
              Добавить запись в дневник
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Последние записи о самочувствии</h3>
            {journalEntries.length === 0 ? (
              <p className="text-gray-500">Пока нет записей в дневнике.</p>
            ) : (
              <div className="space-y-4">
                {journalEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-md bg-gray-700 border-gray-600">
                    <p className="text-white">{entry.text}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      <p>Дата: {new Date(entry.timestamp).toLocaleString('ru-RU')}</p>
                      <p>Психологическое: {entry.psychologicalState}/10</p>
                      <p>Эмоциональное: {entry.emotionalState}/10</p>
                      <p>Физическое: {entry.physicalState}/10</p>
                    </div>
                    
                    {/* Отображение связанных привычек */}
                    {getLinkedHabits(entry).length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold mb-1">Связанные привычки здоровья:</h4>
                        <div className="flex flex-wrap gap-1">
                          {getLinkedHabits(entry).map(habit => (
                            <span
                              key={habit.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {habit.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Отображение связанных показателей здоровья */}
                    {getLinkedIndicators(entry).length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold mb-1">Связанные показатели здоровья:</h4>
                        <div className="flex flex-wrap gap-1">
                          {getLinkedIndicators(entry).map(indicator => (
                            <span
                              key={indicator.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {indicator.name}: {indicator.value} {indicator.unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};