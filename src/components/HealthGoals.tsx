import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HealthGoals: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Цели в сфере здоровья</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Модуль временно недоступен. Функциональность будет восстановлена в следующих обновлениях.
        </p>
      </CardContent>
    </Card>
  );
};

export { HealthGoals };