import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { db, Habit, HealthIndicator, GlobalGoal } from '../lib/db';
import { Progress } from '../components/ui/progress';

export const HealthMotivation: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [goals, setGoals] = useState<GlobalGoal[]>([]);
  const [habitProgress, setHabitProgress] = useState<number>(0);
  const [goalProgress, setGoalProgress] = useState<number>(0);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
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
      
      // Расчет прогресса
      calculateProgress(healthHabits, healthGoals);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (habits: Habit[], goals: GlobalGoal[]) => {
    // Расчет прогресса по привычкам
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => habit.progress === 100).length;
    const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
    setHabitProgress(habitProgress);
    
    // Расчет прогресса по целям
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.progress === 100).length;
    const goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    setGoalProgress(goalProgress);
    
    // Расчет общего показателя здоровья
    const healthScore = Math.round((habitProgress + goalProgress) / 2);
    setHealthScore(healthScore);
  };

  // Функция для получения мотивационного сообщения
  const getMotivationalMessage = () => {
    if (healthScore >= 90) {
      return "Отличная работа! Вы на верном пути к идеальному здоровью!";
    } else if (healthScore >= 70) {
      return "Хороший прогресс! Продолжайте в том же духе!";
    } else if (healthScore >= 50) {
      return "Неплохой старт! Есть куда стремиться!";
    } else if (healthScore >= 30) {
      return "Начало положено! Не останавливайтесь!";
    } else {
      return "Важно начать! Каждый шаг имеет значение!";
    }
  };

  // Функция для получения мотивационной цитаты
  const getMotivationalQuote = () => {
    const quotes = [
      "Здоровье — это最大的 богатство (здоровье — величайшее богатство).",
      "Заботьтесь о своем теле. Это единственное место, где вы должны жить.",
      "Здоровье — это не просто отсутствие болезней, это состояние полного физического, умственного и социального благополучия.",
      "Здоровье — это процесс. Это то, что мы становимся. Радость жизни — это счастливое завершение.",
      "Здоровье — это правильное равновесие; это то, что мы становимся. Радость жизни — это счастливое завершение.",
      "Здоровье — это нечто большее, чем просто отсутствие болезней; это состояние полного физического, умственного и социального благополучия.",
      "Здоровье — это правильное равновесие; это то, что мы становимся. Радость жизни — это счастливое завершение.",
      "Здоровье — это нечто большее, чем просто отсутствие болезней; это состояние полного физического, умственного и социального благополучия."
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  if (loading) {
    return <div className="p-4">Загрузка данных о мотивации...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мотивация в сфере здоровья</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Общий показатель здоровья */}
          <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
            <h3 className="text-xl font-bold">Ваш уровень здоровья: {healthScore}%</h3>
            <p className="mt-2">{getMotivationalMessage()}</p>
          </div>
          
          {/* Прогресс по привычкам */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Прогресс по привычкам</span>
              <span className="text-sm font-medium">{Math.round(habitProgress)}%</span>
            </div>
            <Progress value={habitProgress} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">
              Выполнено {habits.filter(h => h.progress === 100).length} из {habits.length} привычек
            </p>
          </div>
          
          {/* Прогресс по целям */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Прогресс по целям</span>
              <span className="text-sm font-medium">{Math.round(goalProgress)}%</span>
            </div>
            <Progress value={goalProgress} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">
              Достигнуто {goals.filter(g => g.progress === 100).length} из {goals.length} целей
            </p>
          </div>
          
          {/* Мотивационная цитата */}
          <div className="p-4 border rounded-md bg-gray-700 border-gray-600">
            <h4 className="font-semibold text-white">Мотивационная цитата</h4>
            <p className="text-gray-300 italic mt-2">"{getMotivationalQuote()}"</p>
          </div>
          
          {/* Достижения */}
          <div>
            <h3 className="font-semibold mb-2">Ваши достижения</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-md bg-gray-700 border-gray-600 text-center">
                <div className="text-2xl font-bold text-green-500">{habits.length}</div>
                <div className="text-sm text-gray-400">Привычек здоровья</div>
              </div>
              <div className="p-3 border rounded-md bg-gray-700 border-gray-600 text-center">
                <div className="text-2xl font-bold text-blue-500">{indicators.length}</div>
                <div className="text-sm text-gray-400">Показателей здоровья</div>
              </div>
              <div className="p-3 border rounded-md bg-gray-700 border-gray-600 text-center">
                <div className="text-2xl font-bold text-purple-500">{goals.length}</div>
                <div className="text-sm text-gray-400">Целей в сфере здоровья</div>
              </div>
              <div className="p-3 border rounded-md bg-gray-700 border-gray-600 text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {habits.reduce((sum, habit) => sum + (habit.streak || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Общая серия выполнений</div>
              </div>
            </div>
          </div>
          
          {/* Кнопка для обновления данных */}
          <div className="flex justify-center">
            <Button onClick={loadData} variant="outline">
              Обновить данные
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};