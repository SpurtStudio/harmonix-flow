import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HealthJournalSync: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Связь с дневником</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Модуль временно недоступен. Функциональность будет восстановлена в следующих обновлениях.
        </p>
      </CardContent>
    </Card>
  );
};