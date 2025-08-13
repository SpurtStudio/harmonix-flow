// src/pages/TimeIndicator.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const TimeIndicator: React.FC = () => {
  // Статичные значения для демонстрации
  const totalLifeExpectancy = 80; // лет
  const currentAge = 30; // лет
  const remainingYears = totalLifeExpectancy - currentAge;
  const livedYears = currentAge;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Индикатор времени</h1>

      {/* Визуализация "Доступных возможностей" */}
      <Card>
        <CardHeader>
          <CardTitle>Доступные возможности</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
            {remainingYears} лет
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
            активной жизни впереди!
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Вы уже успешно прожили <span className="font-semibold">{livedYears} лет</span>.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Контекстная связь с текущими целями: <span className="text-yellow-500">(Заглушка)</span>
          </p>
        </CardContent>
      </Card>

      {/* Заглушки для настроек и системы оперативных изменений */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Настройки и управление (Заглушки)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Настройки отображения и психологической безопасности.</p>
          <p>Система оперативных изменений: автоматическая корректировка прогнозов при изменениях в планах, визуализация влияния изменений на долгосрочные перспективы, предложение компенсационных действий.</p>
          <p>Интеграция с целями, дневником, календарем, Life Dashboard.</p>
          <Button variant="outline" className="mt-2">Настроить индикатор</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeIndicator;