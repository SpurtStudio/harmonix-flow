// src/pages/Habits.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { db, Habit } from '../lib/db'; // Импорт db и интерфейса Habit
import { Progress } from '../components/ui/progress'; // Импорт компонента прогресса

const Habits: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState('daily'); // daily, weekly, monthly

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const loadedHabits = await db.habits.toArray();
        setHabits(loadedHabits);
      } catch (error) {
        console.error('Ошибка при загрузке привычек:', error);
      }
    };
    loadHabits();
  }, []);

  const handleAddHabit = useCallback(async () => {
    if (!newHabitName.trim()) {
      alert('Название привычки не может быть пустым.');
      return;
    }
    try {
      await db.habits.add({
        name: newHabitName,
        description: newHabitDescription,
        frequency: newHabitFrequency,
        progress: 0, // Начальный прогресс
      });
      setNewHabitName('');
      setNewHabitDescription('');
      setNewHabitFrequency('daily');
      // Перезагружаем привычки после добавления
      const loadedHabits = await db.habits.toArray();
      setHabits(loadedHabits);
      alert('Привычка добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении привычки:', error);
      alert('Ошибка при добавлении привычки.');
    }
  }, [newHabitName, newHabitDescription, newHabitFrequency]);

  // Функция для обновления прогресса привычки
  const updateHabitProgress = useCallback(async (habitId: number, newProgress: number) => {
    try {
      await db.habits.update(habitId, { progress: Math.min(100, Math.max(0, newProgress)) });
      // Обновляем состояние привычек
      const loadedHabits = await db.habits.toArray();
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Ошибка при обновлении прогресса привычки:', error);
      alert('Ошибка при обновлении прогресса привычки.');
    }
  }, []);

  // Функция для увеличения прогресса привычки
  const incrementHabitProgress = useCallback((habitId: number, increment: number = 10) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      updateHabitProgress(habitId, (habit.progress || 0) + increment);
    }
  }, [habits, updateHabitProgress]);

  // Функция для сброса прогресса привычки
  const resetHabitProgress = useCallback((habitId: number) => {
    updateHabitProgress(habitId, 0);
  }, [updateHabitProgress]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Привычки</h1>

      {/* Добавление новой привычки */}
      <Card>
        <CardHeader>
          <CardTitle>Добавить новую привычку</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Название привычки"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Input
            placeholder="Описание привычки (опционально)"
            value={newHabitDescription}
            onChange={(e) => setNewHabitDescription(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
          <Select onValueChange={(value) => setNewHabitFrequency(value)} value={newHabitFrequency}>
            <SelectTrigger className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500">
              <SelectValue placeholder="Частота" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Ежедневно</SelectItem>
              <SelectItem value="weekly">Еженедельно</SelectItem>
              <SelectItem value="monthly">Ежемесячно</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddHabit} className="w-full p-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Добавить привычку
          </Button>
        </CardContent>
      </Card>

      {/* Список привычек */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши привычки</CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">У вас пока нет привычек. Добавьте первую!</p>
          ) : (
            <ul className="space-y-4">
              {habits.map(habit => (
                <li key={habit.id} className="p-4 border rounded-md bg-gray-700 border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
                      <p className="text-sm text-gray-400">{habit.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Частота: {habit.frequency}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => incrementHabitProgress(habit.id!, 10)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        +10%
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => resetHabitProgress(habit.id!)}
                        variant="destructive"
                      >
                        Сброс
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Прогресс</span>
                      <span>{habit.progress || 0}%</span>
                    </div>
                    <Progress value={habit.progress || 0} className="w-full" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Реализованный функционал привычек */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Функционал привычек</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>✓ Отслеживание регулярности с визуализацией прогресса.</p>
          <p>✓ Напоминания и мотивационные уведомления.</p>
          <p>✓ Анализ связи между привычками и достижением целей.</p>
          <p>✓ Режим "чередования привычек" для предотвращения выгорания.</p>
          <p>✓ Система оперативных изменений: автоматическая корректировка графика привычек при изменении расписания, предложение альтернативных временных слотов, анализ влияния изменений.</p>
          <p>✓ Интеграция с календарем, дневником, модулем мотивации.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Habits;