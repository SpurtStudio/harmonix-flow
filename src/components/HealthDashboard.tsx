import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { db, HealthIndicator, Habit } from '../lib/db';
import { HealthIndicatorForm } from './HealthIndicatorForm';
import { HealthIndicatorsList } from './HealthIndicatorsList';
import { HealthHabitsList } from './HealthHabitsList';

export const HealthDashboard: React.FC = () => {
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Загрузка показателей здоровья
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
      
      // Загрузка привычек здоровья
      // Для фильтрации привычек здоровья будем использовать определенные ключевые слова в названии
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
      console.error('Ошибка при загрузке данных здоровья:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndicator = async (indicator: Omit<HealthIndicator, 'id'>) => {
    try {
      await db.healthIndicators.add(indicator);
      // Перезагрузка данных
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
    } catch (error) {
      console.error('Ошибка при добавлении показателя здоровья:', error);
      alert('Ошибка при добавлении показателя здоровья');
    }
  };

  const handleDeleteIndicator = async (id: number) => {
    try {
      await db.healthIndicators.delete(id);
      // Перезагрузка данных
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
    } catch (error) {
      console.error('Ошибка при удалении показателя здоровья:', error);
      alert('Ошибка при удалении показателя здоровья');
    }
  };

  const handleEditHabit = async (habit: Omit<Habit, 'id'> | Habit) => {
    try {
      if ('id' in habit && habit.id) {
        // Редактирование существующей привычки
        await db.habits.update(habit.id, habit);
      } else {
        // Создание новой привычки
        await db.habits.add(habit);
      }
      // Перезагрузка данных
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
      console.error('Ошибка при сохранении привычки:', error);
      alert('Ошибка при сохранении привычки');
    }
  };

  const handleDeleteHabit = async (id: number | string) => {
    try {
      await db.habits.delete(id);
      // Перезагрузка данных
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
      console.error('Ошибка при удалении привычки:', error);
      alert('Ошибка при удалении привычки');
    }
  };

  const handleIncrementProgress = async (habitId: number | string, increment: number) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        // Обновляем серию выполнений
        const today = new Date().toDateString();
        const lastCompleted = habit.lastCompletedDate?.toDateString();
        let streak = habit.streak || 0;
        let bestStreak = habit.bestStreak || 0;
        
        if (lastCompleted !== today) {
          // Если привычка не выполнялась сегодня, увеличиваем серию
          streak += 1;
          if (streak > (bestStreak || 0)) {
            bestStreak = streak;
          }
        }
        
        const newProgress = Math.min(100, (habit.progress || 0) + increment);
        await db.habits.update(habitId, { 
          progress: newProgress, 
          streak, 
          bestStreak, 
          lastCompletedDate: new Date() 
        });
        
        // Перезагрузка данных
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
      }
    } catch (error) {
      console.error('Ошибка при обновлении прогресса привычки:', error);
      alert('Ошибка при обновлении прогресса привычки');
    }
  };

  const handleResetProgress = async (habitId: number | string) => {
    try {
      await db.habits.update(habitId, { progress: 0, streak: 0 });
      // Перезагрузка данных
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
      console.error('Ошибка при сбросе прогресса привычки:', error);
      alert('Ошибка при сбросе прогресса привычки');
    }
  };

  if (loading) {
    return <div className="p-4">Загрузка данных здоровья...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Панель здоровья</h2>
        <Button onClick={loadData} variant="outline">Обновить данные</Button>
      </div>
      
      {/* Форма для добавления показателей здоровья */}
      <HealthIndicatorForm onAddIndicator={handleAddIndicator} />
      
      {/* Список показателей здоровья */}
      <HealthIndicatorsList 
        indicators={indicators} 
        onDeleteIndicator={handleDeleteIndicator} 
      />
      
      {/* Список привычек здоровья */}
      <HealthHabitsList
        habits={habits}
        onEditHabit={handleEditHabit}
        onDeleteHabit={handleDeleteHabit}
        onIncrementProgress={handleIncrementProgress}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
};