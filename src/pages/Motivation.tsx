// src/pages/Motivation.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { db } from '../lib/db';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useChangePropagation } from '../hooks/use-change-propagation';

const Motivation: React.FC = () => {
  const [habitProgress, setHabitProgress] = useState<number>(0);
  const [goalProgress, setGoalProgress] = useState<number>(0);
  const [journalEntriesCount, setJournalEntriesCount] = useState<number>(0);
  const [activeHabits, setActiveHabits] = useState<number>(0);
  const [completedGoals, setCompletedGoals] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [motivationLevel, setMotivationLevel] = useState<number>(50); // Уровень мотивации 0-100
  const [achievements, setAchievements] = useState<string[]>([]);
  const { lastChange, impactAnalysis, isAnalyzing, propagateChange, applyAdjustments } = useChangePropagation();
  
  useEffect(() => {
    const loadData = async () => {
      // Загрузка данных о привычках
      const habits = await db.habits.toArray();
      const totalHabits = habits.length;
      const completedHabits = habits.filter(habit => habit.progress === 100).length;
      const activeHabitsCount = habits.filter(habit => habit.progress && habit.progress > 0).length;
      const bestHabitStreak = Math.max(...habits.map(habit => habit.bestStreak || 0), 0);
      
      setHabitProgress(totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0);
      setActiveHabits(activeHabitsCount);
      setBestStreak(bestHabitStreak);
      
      // Загрузка данных о целях
      const goals = await db.globalGoals.toArray();
      const totalGoals = goals.length;
      const completedGoalsCount = goals.filter(goal => goal.progress === 100).length;
      
      setGoalProgress(totalGoals > 0 ? (completedGoalsCount / totalGoals) * 100 : 0);
      setCompletedGoals(completedGoalsCount);
      
      // Загрузка данных о записях в дневнике
      const journalEntries = await db.journalEntries.toArray();
      setJournalEntriesCount(journalEntries.length);
      
      // Расчет уровня мотивации на основе данных
      const motivation = Math.min(100, Math.round(
        (activeHabitsCount / Math.max(totalHabits, 1)) * 30 +
        (completedGoalsCount / Math.max(totalGoals, 1)) * 40 +
        (journalEntries.length / 10) * 10 +
        (bestHabitStreak / 30) * 20
      ));
      setMotivationLevel(motivation);
      
      // Генерация достижений
      const newAchievements: string[] = [];
      if (completedGoalsCount > 0) newAchievements.push("Первая цель достигнута!");
      if (activeHabitsCount >= 3) newAchievements.push("Три активные привычки!");
      if (bestHabitStreak >= 7) newAchievements.push("Недельная серия!");
      if (journalEntries.length >= 10) newAchievements.push("10 записей в дневнике!");
      if (motivation >= 80) newAchievements.push("Высокий уровень мотивации!");
      
      setAchievements(newAchievements);
    };
    
    loadData();
  }, []);
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Социальные факторы и мотивация</h1>
      
      {/* Профиль мотивации пользователя */}
      <Card>
        <CardHeader>
          <CardTitle>Профиль мотивации</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder.svg" alt="Пользователь" />
              <AvatarFallback>П</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">Ваш профиль мотивации</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Уровень мотивации: {motivationLevel}%
              </p>
              <Progress value={motivationLevel} className="w-32 mt-1" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold">{activeHabits}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Активные привычки</p>
            </div>
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold">{completedGoals}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Достигнутые цели</p>
            </div>
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold">{journalEntriesCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Записи в дневнике</p>
            </div>
            <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold">{bestStreak}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Лучшая серия</p>
            </div>
          </div>
          
          {achievements.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Достижения:</h3>
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary">{achievement}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button variant="outline">Настроить профиль</Button>
        </CardContent>
      </Card>

      {/* Статистика прогресса */}
      <Card>
        <CardHeader>
          <CardTitle>Ваш прогресс</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Привычки</span>
              <span className="text-sm font-medium">{Math.round(habitProgress)}%</span>
            </div>
            <Progress value={habitProgress} className="w-full" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Цели</span>
              <span className="text-sm font-medium">{Math.round(goalProgress)}%</span>
            </div>
            <Progress value={goalProgress} className="w-full" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Записи в дневнике</span>
              <span className="text-sm font-medium">{journalEntriesCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Система "Доказательств" прогресса */}
      <Card>
        <CardHeader>
          <CardTitle>Доказательства прогресса</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Визуализация ваших достижений и прогресса по целям и задачам.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Привычки</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{activeHabits}</span>
                <span className="text-sm text-gray-500">из {Math.round(habitProgress / 10)}</span>
              </div>
              <Progress value={habitProgress} className="mt-2" />
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Цели</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{completedGoals}</span>
                <span className="text-sm text-gray-500">из {Math.round(goalProgress / 10)}</span>
              </div>
              <Progress value={goalProgress} className="mt-2" />
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Дневник</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{journalEntriesCount}</span>
                <span className="text-sm text-gray-500">записей</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${Math.min(100, journalEntriesCount * 5)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Недавние достижения</h3>
            <ul className="space-y-2">
              {achievements.slice(0, 3).map((achievement, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">{achievement}</span>
                </li>
              ))}
              {achievements.length === 0 && (
                <li className="text-sm text-gray-500">Пока нет достижений. Продолжайте в том же духе!</li>
              )}
            </ul>
          </div>
          
          <Button variant="outline" className="mt-4">Посмотреть все доказательства</Button>
        </CardContent>
      </Card>

      {/* Техники преодоления прокрастинации */}
      <Card>
        <CardHeader>
          <CardTitle>Преодоление прокрастинации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Инструменты и техники, которые помогут вам бороться с прокрастинацией.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-medium mb-2">Метод Помодоро</h3>
              <p className="text-sm mb-3">Работайте 25 минут, затем отдыхайте 5 минут. После 4 циклов — длинный перерыв.</p>
              <Button variant="outline" size="sm">Попробовать</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <h3 className="font-medium mb-2">Разбиение задач</h3>
              <p className="text-sm mb-3">Разделите большие задачи на маленькие шаги, чтобы они казались менее пугающими.</p>
              <Button variant="outline" size="sm">Применить</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <h3 className="font-medium mb-2">Правило 2 минут</h3>
              <p className="text-sm mb-3">Если задача занимает менее 2 минут, сделайте её немедленно.</p>
              <Button variant="outline" size="sm">Использовать</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <h3 className="font-medium mb-2">Матрица Эйзенхауэра</h3>
              <p className="text-sm mb-3">Классифицируйте задачи по срочности и важности для приоритизации.</p>
              <Button variant="outline" size="sm">Организовать</Button>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">Изучить все техники</Button>
        </CardContent>
      </Card>

      {/* Регулярные опросы */}
      <Card>
        <CardHeader>
          <CardHeader>
            <CardTitle>Регулярные опросы</CardTitle>
          </CardHeader>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Еженедельные опросы об удовлетворенности сферами жизни и общем мировосприятии.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Удовлетворенность жизнью</h3>
              <p className="text-sm mb-3">Оцените, насколько вы удовлетворены своей текущей жизнью по шкале от 1 до 10.</p>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <Button key={value} variant="outline" size="sm">{value}</Button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Баланс сфер жизни</h3>
              <p className="text-sm mb-3">Оцените баланс между различными сферами вашей жизни.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-xs mb-1">Работа</p>
                  <select className="w-full p-1 text-sm border rounded">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
                <div className="text-center">
                  <p className="text-xs mb-1">Семья</p>
                  <select className="w-full p-1 text-sm border rounded">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
                <div className="text-center">
                  <p className="text-xs mb-1">Здоровье</p>
                  <select className="w-full p-1 text-sm border rounded">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
                <div className="text-center">
                  <p className="text-xs mb-1">Развитие</p>
                  <select className="w-full p-1 text-sm border rounded">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">Отправить ответы</Button>
        </CardContent>
      </Card>

      {/* Социальные триггеры */}
      <Card>
        <CardHeader>
          <CardTitle>Социальные триггеры</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Делитесь достижениями и вдохновляйте других.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Поделиться достижением</h3>
              <p className="text-sm mb-3">Расскажите друзьям о своих успехах и достижениях.</p>
              <Button variant="outline" size="sm">Поделиться</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Групповые цели</h3>
              <p className="text-sm mb-3">Создавайте совместные цели с друзьями или коллегами.</p>
              <Button variant="outline" size="sm">Создать</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Сообщество</h3>
              <p className="text-sm mb-3">Присоединяйтесь к сообществу единомышленников.</p>
              <Button variant="outline" size="sm">Присоединиться</Button>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Недавняя активность друзей</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>Анна завершила цель по фитнесу</span>
              </li>
              <li className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Михаил начал новую привычку медитации</span>
              </li>
              <li className="flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span>Елена записала 50 записей в дневнике</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Позитивное подкрепление */}
      <Card>
        <CardHeader>
          <CardTitle>Позитивное подкрепление</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Персонализированные мотивационные сообщения и рекомендации.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold">!</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Отличная работа!</h3>
                  <p className="text-sm mt-1">Вы проделали большую работу над своими привычками. Продолжайте в том же духе!</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white font-bold">★</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Новая серия!</h3>
                  <p className="text-sm mt-1">Вы достигли 7-дневной серии выполнения привычек. Это отличный результат!</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold">❤</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Совет дня</h3>
                  <p className="text-sm mt-1">Попробуйте технику "5 минут" для начала сложных задач. Начните с 5 минут работы над задачей.</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">Получить еще советы</Button>
        </CardContent>
      </Card>

      {/* Система оперативных изменений */}
      <Card>
        <CardHeader>
          <CardTitle>Система оперативных изменений</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Автоматическая адаптация мотивационных стратегий при изменениях в планах.
          </p>
          
          {lastChange && (
            <div className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium mb-2">Последнее изменение</h3>
              <p className="text-sm">Тип: {lastChange.type}</p>
              <p className="text-sm">Сущность: {lastChange.entityId}</p>
              {isAnalyzing && <p className="text-sm text-yellow-600">Анализ влияния...</p>}
            </div>
          )}
          
          {impactAnalysis && (
            <div className="p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-medium mb-2">Рекомендации по корректировке</h3>
              <ul className="space-y-2">
                {impactAnalysis.suggestedAdjustments.map((adjustment, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2"></div>
                    <span className="text-sm">{adjustment}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-3">Применить рекомендации</Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Режим "Что-если"</h3>
              <p className="text-sm mb-3">Моделируйте изменения и их последствия перед реализацией.</p>
              <Button variant="outline" size="sm">Активировать</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">История корректировок</h3>
              <p className="text-sm mb-3">Просмотрите историю всех автоматических корректировок.</p>
              <Button variant="outline" size="sm">Просмотреть</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Интеграция с другими модулями */}
      <Card>
        <CardHeader>
          <CardTitle>Интеграция с другими модулями</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Связи между мотивацией и другими аспектами вашей жизни.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Цели</h3>
              <p className="text-sm mb-2">Связано: {completedGoals} целей</p>
              <Progress value={goalProgress} className="h-2" />
              <Button variant="outline" size="sm" className="mt-2 w-full">Перейти к целям</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Привычки</h3>
              <p className="text-sm mb-2">Активно: {activeHabits} привычек</p>
              <Progress value={habitProgress} className="h-2" />
              <Button variant="outline" size="sm" className="mt-2 w-full">Перейти к привычкам</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Дневник</h3>
              <p className="text-sm mb-2">Записей: {journalEntriesCount}</p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${Math.min(100, journalEntriesCount * 5)}%` }}
                ></div>
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full">Перейти в дневник</Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2">Задачи</h3>
              <p className="text-sm mb-2">Выполнено: 12 из 24</p>
              <Progress value={50} className="h-2" />
              <Button variant="outline" size="sm" className="mt-2 w-full">Перейти к задачам</Button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-3">Влияние на баланс жизни</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Работа</p>
                <p className="font-medium">+12%</p>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Семья</p>
                <p className="font-medium">+8%</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Здоровье</p>
                <p className="font-medium">+15%</p>
              </div>
              <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Развитие</p>
                <p className="font-medium">+10%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Motivation;