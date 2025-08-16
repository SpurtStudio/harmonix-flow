// src/pages/Motivation.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { db } from '../lib/db';
import { Progress } from '../components/ui/progress';

const Motivation: React.FC = () => {
  const [habitProgress, setHabitProgress] = useState<number>(0);
  const [goalProgress, setGoalProgress] = useState<number>(0);
  const [journalEntriesCount, setJournalEntriesCount] = useState<number>(0);
  
  useEffect(() => {
    const loadData = async () => {
      // Загрузка данных о привычках
      const habits = await db.habits.toArray();
      const totalHabits = habits.length;
      const completedHabits = habits.filter(habit => habit.progress === 100).length;
      setHabitProgress(totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0);
      
      // Загрузка данных о целях
      const goals = await db.globalGoals.toArray();
      const totalGoals = goals.length;
      const completedGoals = goals.filter(goal => goal.progress === 100).length;
      setGoalProgress(totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0);
      
      // Загрузка данных о записях в дневнике
      const journalEntries = await db.journalEntries.toArray();
      setJournalEntriesCount(journalEntries.length);
    };
    
    loadData();
  }, []);
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Социальные факторы и мотивация</h1>
      
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

      {/* Профиль мотивации пользователя */}
      <Card>
        <CardHeader>
          <CardTitle>Профиль мотивации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ваш профиль мотивации основан на ваших целях, привычках и записях в дневнике.
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm">• Активных привычек: {Math.round(habitProgress / 10)}</p>
            <p className="text-sm">• Достигнутых целей: {Math.round(goalProgress / 10)}</p>
            <p className="text-sm">• Записей в дневнике: {journalEntriesCount}</p>
          </div>
          <Button variant="outline" className="mt-4">Настроить профиль</Button>
        </CardContent>
      </Card>

      {/* Система "Доказательств" прогресса */}
      <Card>
        <CardHeader>
          <CardTitle>Доказательства прогресса</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Визуализация ваших достижений и прогресса по целям и задачам.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(habitProgress / 10)}</div>
              <div className="text-xs text-gray-500">Привычки</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(goalProgress / 10)}</div>
              <div className="text-xs text-gray-500">Цели</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{journalEntriesCount}</div>
              <div className="text-xs text-gray-500">Записи</div>
            </div>
          </div>
          <Button variant="outline" className="mt-4">Посмотреть доказательства</Button>
        </CardContent>
      </Card>

      {/* Техники преодоления прокрастинации */}
      <Card>
        <CardHeader>
          <CardTitle>Преодоление прокрастинации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            [Заглушка] Инструменты и техники, которые помогут вам бороться с прокрастинацией.
          </p>
          <Button variant="outline" className="mt-2">Изучить техники</Button>
        </CardContent>
      </Card>

      {/* Регулярные опросы */}
      <Card>
        <CardHeader>
          <CardTitle>Регулярные опросы</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            [Заглушка] Еженедельные опросы об удовлетворенности сферами жизни и общем мировосприятии.
          </p>
          <Button variant="outline" className="mt-2">Пройти опрос</Button>
        </CardContent>
      </Card>

      {/* Заглушки для других функций мотивации */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Дополнительный функционал мотивации (Заглушки)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Социальные триггеры: дележ достижений, нетворкинг.</p>
          <p>Позитивное подкрепление через персонализированные сообщения.</p>
          <p>Система оперативных изменений: автоматическая адаптация мотивационных стратегий при изменениях в планах, предложение специфических техник для преодоления препятствий, анализ влияния изменений на уровень мотивации.</p>
          <p>Интеграция с целями, задачами, дневником, привычками.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Motivation;