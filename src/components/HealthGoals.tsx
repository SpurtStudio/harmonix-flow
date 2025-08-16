import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { db, GlobalGoal, Habit, HealthIndicator } from '../lib/db';
import { Progress } from '../components/ui/progress';

export const HealthGoals: React.FC = () => {
  const [goals, setGoals] = useState<GlobalGoal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Загрузка целей из сферы здоровья
      const allGoals = await db.globalGoals.toArray();
      const healthGoals = allGoals.filter(goal => 
        goal.lifeSphere === 'Здоровье' || 
        goal.name.toLowerCase().includes('здоровье') || 
        goal.name.toLowerCase().includes('здоровья') ||
        goal.smartFormulation.toLowerCase().includes('здоровье') ||
        goal.smartFormulation.toLowerCase().includes('здоровья')
      );
      setGoals(healthGoals);
      
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
      
      // Загрузка показателей здоровья
      const loadedIndicators = await db.healthIndicators.orderBy('timestamp').reverse().toArray();
      setIndicators(loadedIndicators);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalName.trim()) {
      alert('Пожалуйста, введите название цели.');
      return;
    }
    
    try {
      const newGoal: Omit<GlobalGoal, 'id'> = {
        name: newGoalName,
        smartFormulation: newGoalDescription || `Достичь цели "${newGoalName}" в сфере здоровья`,
        progress: 0,
        lifeSphere: 'Здоровье'
      };
      
      // Добавляем связь с привычками здоровья
      if (habits.length > 0) {
        newGoal.linkedHabitIds = habits.map(habit => habit.id!);
      }
      
      await db.globalGoals.add(newGoal);
      
      // Обновляем список целей
      const allGoals = await db.globalGoals.toArray();
      const healthGoals = allGoals.filter(goal => 
        goal.lifeSphere === 'Здоровье' || 
        goal.name.toLowerCase().includes('здоровье') || 
        goal.name.toLowerCase().includes('здоровья') ||
        goal.smartFormulation.toLowerCase().includes('здоровье') ||
        goal.smartFormulation.toLowerCase().includes('здоровья')
      );
      setGoals(healthGoals);
      
      // Сбрасываем форму
      setNewGoalName('');
      setNewGoalDescription('');
      
      alert('Цель успешно добавлена!');
    } catch (error) {
      console.error('Ошибка при добавлении цели:', error);
      alert('Ошибка при добавлении цели');
    }
  };

  const handleUpdateGoalProgress = async (goalId: number, progress: number) => {
    try {
      await db.globalGoals.update(goalId, { progress: Math.min(100, Math.max(0, progress)) });
      
      // Обновляем список целей
      const allGoals = await db.globalGoals.toArray();
      const healthGoals = allGoals.filter(goal => 
        goal.lifeSphere === 'Здоровье' || 
        goal.name.toLowerCase().includes('здоровье') || 
        goal.name.toLowerCase().includes('здоровья') ||
        goal.smartFormulation.toLowerCase().includes('здоровье') ||
        goal.smartFormulation.toLowerCase().includes('здоровья')
      );
      setGoals(healthGoals);
      
      alert('Прогресс цели успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при обновлении прогресса цели:', error);
      alert('Ошибка при обновлении прогресса цели');
    }
  };

  // Функция для получения связанных привычек
  const getLinkedHabits = (goal: GlobalGoal) => {
    if (goal.linkedHabitIds && goal.linkedHabitIds.length > 0) {
      return habits.filter(habit => goal.linkedHabitIds?.includes(habit.id!));
    }
    return [];
  };

  if (loading) {
    return <div className="p-4">Загрузка целей в сфере здоровья...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Цели в сфере здоровья</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Добавить новую цель</h3>
            <Input
              placeholder="Название цели"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
            />
            <Textarea
              placeholder="Описание цели (формулировка SMART)"
              value={newGoalDescription}
              onChange={(e) => setNewGoalDescription(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={handleAddGoal}>
              Добавить цель
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Ваши цели в сфере здоровья</h3>
            {goals.length === 0 ? (
              <p className="text-gray-500">Пока нет целей в сфере здоровья.</p>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-md bg-gray-700 border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white">{goal.name}</h4>
                        <p className="text-sm text-gray-300 mt-1">{goal.smartFormulation}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateGoalProgress(goal.id!, Math.min(100, goal.progress + 10))}
                      >
                        +10%
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-300 mb-1">
                        <span>Прогресс</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="w-full" />
                    </div>
                    
                    {/* Отображение связанных привычек */}
                    {getLinkedHabits(goal).length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold mb-1">Связанные привычки:</h4>
                        <div className="flex flex-wrap gap-1">
                          {getLinkedHabits(goal).map(habit => (
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