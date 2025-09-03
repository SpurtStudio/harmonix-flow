import React from 'react';
import { PageWrapper } from '../components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimplifiedGoals: React.FC = () => {
  return (
    <PageWrapper title="Цели">
      <Card>
        <CardHeader>
          <CardTitle>Управление целями</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Модуль целей временно упрощен. Здесь будет система OKR с иерархией: Видение → Глобальные цели → Стратегические цели.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default SimplifiedGoals;