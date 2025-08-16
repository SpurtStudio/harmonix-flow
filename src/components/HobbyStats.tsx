import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hobby } from '@/lib/db';

interface HobbyStatsProps {
  hobby: Hobby;
}

export const HobbyStats: React.FC<HobbyStatsProps> = ({ hobby }) => {
  // Рассчитываем статистику
  const totalMinutes = hobby.timeSpent || 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  // Рассчитываем среднее время в день
  let averagePerDay = 0;
  if (hobby.timeSpentHistory && hobby.timeSpentHistory.length > 0) {
    const totalDays = hobby.timeSpentHistory.length;
    averagePerDay = totalMinutes / totalDays;
  }
  
  // Рассчитываем прогресс по цели
  let goalProgress = 0;
  if (hobby.goalProgress !== undefined) {
    goalProgress = hobby.goalProgress;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика: {hobby.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <p className="text-2xl font-bold">{totalHours}ч {remainingMinutes}м</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Всего времени</p>
          </div>
          <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-2xl font-bold">{averagePerDay.toFixed(1)}м/д</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Среднее в день</p>
          </div>
        </div>
        
        {hobby.goal && (
          <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <p className="font-semibold">Цель: {hobby.goal}</p>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Прогресс</span>
                <span>{goalProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full" 
                  style={{ width: `${goalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {hobby.timeSpentHistory && hobby.timeSpentHistory.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">История за последние 7 дней:</h3>
            <div className="space-y-2">
              {[...hobby.timeSpentHistory]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 7)
                .map((entry, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    <span>{entry.minutes} минут</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};